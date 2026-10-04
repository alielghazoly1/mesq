// utils/whatsapp/manager.js
// الاتصال بواتساب المالك (Linked device — زي واتساب ويب بالظبط).
//
// - الربط: المالك بيدوس "اربط" في اللوحة → السيرفر بيطلب QR من واتساب →
//   اللوحة بتعرضه → المالك بيمسحه من موبايله (الأجهزة المرتبطة) → خلاص.
// - بعد كده الاتصال بيفضل شغال لوحده، ولو السيرفر اتعمله ريستارت بيرجع
//   يتصل من الجلسة المحفوظة (متشفّرة في Mongo) من غير QR تاني.
// - نسخة واحدة بس من السيرفر بتمسك الاتصال (قفل lease في WhatsAppState)
//   — اتصالين بنفس الجلسة واتساب بيقفل واحد منهم.
// - الموبايل بيفضل يجيله الإشعارات عادي (مش بنعلّم إننا "أونلاين").
const crypto = require('crypto');
const connectDB = require('../../config/db');
const WhatsAppState = require('../../models/WhatsAppState');
const { useMongoAuthState, clearSession } = require('./authState');
const outbox = require('./outbox');

const INSTANCE = crypto.randomBytes(8).toString('hex');
const TICK_MS = 3000;
const LEASE_MS = 90 * 1000;
const RENEW_BEFORE_MS = 60 * 1000;
const OUTBOX_EVERY_MS = 10 * 1000;

// Baileys بيطبع كتير — إحنا محتاجين الأخطاء الكبيرة بس
const logger = {
  level: 'silent',
  child() { return logger; },
  trace() {}, debug() {}, info() {}, warn() {}, error() {},
  fatal(...a) { console.error('[whatsapp]', ...a); },
};

let B = null;
let sock = null;
let connecting = false;
let registered = false;
let retry = 0;
let failsWithoutQr = 0;   // محاولات ربط متتالية اتقفلت قبل ما يطلع QR
let gotQr = false;
const MAX_FAILS_WITHOUT_QR = 4;

/** تشخيص: آخر خطوة وصلها الاتصال — بيظهر في اللوحة لو الـ QR ماظهرش */
const diag = (stage, extra = {}) => WhatsAppState.updateOne(
  { key: 'default' },
  { $set: { 'diag.stage': stage, 'diag.at': new Date(), ...Object.fromEntries(Object.entries(extra).map(([k, v]) => ['diag.' + k, v])) } }
).catch(() => {});
let nextConnectAt = 0;
let leaseUntil = 0;
let lastOutboxAt = 0;
let timer = null;
let ticking = false;

async function lib() {
  if (!B) B = await import('baileys');
  return B;
}

const setState = (patch) => WhatsAppState.updateOne({ key: 'default' }, { $set: patch }, { upsert: true });

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);
}

/** القفل: true لو النسخة دي هي اللي ماسكة الاتصال */
async function holdLease(now) {
  if (leaseUntil - now > RENEW_BEFORE_MS) return true;
  const until = new Date(now + LEASE_MS);
  const r = await WhatsAppState.updateOne(
    { key: 'default', $or: [{ leaseOwner: INSTANCE }, { leaseOwner: '' }, { leaseUntil: null }, { leaseUntil: { $lt: new Date(now) } }] },
    { $set: { leaseOwner: INSTANCE, leaseUntil: until, heartbeatAt: new Date(now) } }
  );
  leaseUntil = r.matchedCount === 1 ? until.getTime() : 0;
  return leaseUntil > 0;
}

function closeSocket() {
  const s = sock;
  sock = null;
  if (s) { try { s.ev.removeAllListeners(); s.end(undefined); } catch { /* */ } }
}

async function connect() {
  connecting = true;
  gotQr = false;
  let stage = 'lib';
  try {
    await diag('lib', { message: '', code: 0 });
    const W = await lib();
    stage = 'session';
    const { state, saveCreds } = await useMongoAuthState(W);
    registered = !!state.creds.registered;
    // من غير نسخة واتساب حديثة السيرفر بيقفل الاتصال (428)
    stage = 'version';
    let version;
    try { ({ version } = await withTimeout(W.fetchLatestBaileysVersion(), 8000)); } catch { /* الافتراضي */ }
    stage = 'socket';
    await diag('socket', { version: (version || []).join('.') || 'default' });

    const s = W.default({
      auth: { creds: state.creds, keys: W.makeCacheableSignalKeyStore(state.keys, logger) },
      ...(version ? { version } : {}),
      logger,
      browser: W.Browsers.windows('Mithaq'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      generateHighQualityLinkPreview: false,
      getMessage: async () => undefined,
    });
    sock = s;
    await setState({ status: 'connecting', qr: '', lastError: '' });

    s.ev.on('creds.update', () => { saveCreds().catch(() => {}); });
    s.ev.on('connection.update', (u) => {
      if (sock !== s) return;
      if (u.qr) {
        gotQr = true;
        failsWithoutQr = 0;
        diag('qr', { code: 0, message: '' });
        setState({ status: 'qr', qr: u.qr, qrAt: new Date(), lastError: '' }).catch(() => {});
      }
      if (u.connection === 'open') {
        retry = 0;
        failsWithoutQr = 0;
        diag('open', { code: 0, message: '' });
        registered = true;
        const id = (s.user && s.user.id) || '';
        setState({
          status: 'connected', qr: '', lastError: '',
          phone: id.split(':')[0].split('@')[0],
          name: (s.user && (s.user.name || s.user.verifiedName)) || '',
          connectedAt: new Date(),
        }).catch(() => {});
      }
      if (u.connection === 'close') {
        const code = u.lastDisconnect && u.lastDisconnect.error && u.lastDisconnect.error.output
          ? u.lastDisconnect.error.output.statusCode : 0;
        sock = null;
        const why = String((u.lastDisconnect && u.lastDisconnect.error && u.lastDisconnect.error.message) || '').slice(0, 160);
        console.error('[whatsapp] closed', code, why);
        WhatsAppState.updateOne({ key: 'default' }, {
          $set: { 'diag.stage': 'closed', 'diag.code': code, 'diag.message': why, 'diag.at': new Date() },
          $inc: { 'diag.attempts': 1 },
        }).catch(() => {});
        onClosed(code).catch((err) => console.error('[whatsapp] close handling failed:', err && err.message));
      }
    });
  } catch (err) {
    sock = null;
    nextConnectAt = Date.now() + 30000;
    const why = String((err && err.message) || err).slice(0, 160);
    await diag(stage + '_failed', { message: why });
    await setState({ status: 'off', lastError: `مش قادر يتصل بواتساب دلوقتي (${stage}: ${why}) — هيحاول تاني لوحده.` }).catch(() => {});
    console.error('[whatsapp] connect failed at', stage, why);
  } finally {
    connecting = false;
  }
}

async function onClosed(code) {
  if (code === 401) {
    // اتشال من "الأجهزة المرتبطة" على الموبايل
    registered = false;
    await clearSession();
    await setState({ status: 'off', wantLinked: false, qr: '', phone: '', name: '', lastError: 'الربط اتلغى من الموبايل — اربط تاني لو عايز.' });
    return;
  }
  if (!registered && gotQr && code === 408) {
    // الـ QR خلص وقته ومحدش مسحه
    await setState({ status: 'off', wantLinked: false, qr: '', lastError: 'الـ QR خلص وقته — دوس "اربط" تاني وامسحه على طول.' });
    return;
  }
  if (code === 440) {
    // نفس الجلسة اتفتحت من مكان تاني — نستنى شوية قبل ما نرجع
    nextConnectAt = Date.now() + 60000;
    await setState({ status: 'connecting', lastError: '' });
    return;
  }
  // ربط جديد وواتساب بيقفل الاتصال قبل ما يدّي QR أكتر من مرة ورا بعض —
  // نوقف ونقول السبب بدل ما اللوحة تفضل تلف من غير نهاية
  if (!registered && !gotQr && code !== 515) {
    failsWithoutQr += 1;
    if (failsWithoutQr >= MAX_FAILS_WITHOUT_QR) {
      failsWithoutQr = 0;
      await setState({
        status: 'off', wantLinked: false, qr: '',
        lastError: `واتساب قفل الاتصال قبل ما يدّي QR (كود ${code || 'غير معروف'}) — جرّب تاني بعد دقيقة، ولو اتكررت ابعتلي الكود ده.`,
      });
      return;
    }
  }
  // 515 بعد مسح الـ QR (لازم نعيد الاتصال) أو النت قطع — نرجع على طول بالتدريج
  nextConnectAt = Date.now() + (code === 515 ? 500 : Math.min(60000, 2000 * 2 ** retry));
  retry += 1;
  await setState({ status: 'connecting' });
}

async function unlink() {
  const s = sock;
  sock = null;
  if (s) {
    try { if (registered) await withTimeout(s.logout(), 8000); } catch { /* */ }
    try { s.ev.removeAllListeners(); s.end(undefined); } catch { /* */ }
  }
  registered = false;
  await clearSession();
  await setState({ status: 'off', qr: '', phone: '', name: '', connectedAt: null, unlinkRequestedAt: null, lastError: '' });
}

/** بيبعت نص لرقم دولي (أرقام بس). بيتأكد الأول إن الرقم عليه واتساب. */
async function sendText(phone, text) {
  const s = sock;
  if (!s || !registered) throw new Error('واتساب مش متصل');
  const [found] = await withTimeout(s.onWhatsApp(phone), 15000);
  if (!found || !found.exists) return { ok: false, reason: 'no_whatsapp' };
  await withTimeout(s.sendMessage(found.jid, { text }), 20000);
  return { ok: true };
}

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const now = Date.now();
    const doc = await outbox.getState();
    const mine = await holdLease(now);
    if (!mine) { closeSocket(); return; }

    if (doc.unlinkRequestedAt || (!doc.wantLinked && (sock || doc.status !== 'off'))) {
      if (doc.unlinkRequestedAt) await unlink();
      else { closeSocket(); await setState({ status: 'off', qr: '' }); }
      return;
    }
    if (doc.wantLinked && !sock && !connecting && now >= nextConnectAt) {
      await connect();
      return;
    }
    if (sock && registered && doc.status === 'connected' && now - lastOutboxAt >= OUTBOX_EVERY_MS) {
      lastOutboxAt = now;
      const r = await outbox.processNext({ send: sendText });
      if (r) console.log('[whatsapp] outbox:', r);
    }
  } catch (err) {
    console.error('[whatsapp] tick failed:', err && err.message);
  } finally {
    ticking = false;
  }
}

/** بيتنادي مرة واحدة لما السيرفر يقوم */
function startWhatsApp() {
  if (timer || String(process.env.WHATSAPP || '').toLowerCase() === 'off') return;
  connectDB()
    .then(() => outbox.recoverStuck())
    .catch(() => {})
    .finally(() => {
      timer = setInterval(tick, TICK_MS);
      if (timer.unref) timer.unref();
      tick();
    });
}

function stopWhatsApp() {
  if (timer) clearInterval(timer);
  timer = null;
  closeSocket();
}

module.exports = { startWhatsApp, stopWhatsApp, sendText, INSTANCE };
