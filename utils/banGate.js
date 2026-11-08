// utils/banGate.js
// حظر جهاز من الموقع كله (بطلب المالك) — أقوى من "حظر الحساب" اللي في لوحة التحكم:
//   • الحساب نفسه بيتقفل وجلساته بتتمسح (isBlocked زي زرار الحظر).
//   • المتصفح اللي اتمسك بيتعلّم بكوكي موقّعة → حتى لو عمل حساب جديد منه مش هيدخل.
//   • بصمة الـIP (الموقع مابيخزّنش الـIP نفسه — نفس ipHashOf في التحليلات) → أي متصفح
//     تاني على نفس الجهاز/الشبكة مش هيدخل. بتنتهي لوحدها (عناوين الموبايل بتتنقل لناس تانية).
//   • رقم الجهاز (vid) اللي المتصفح بيبعته مع إشارات الحضور.
// كل مرة الجهاز المحظور يتمسك بحاجة من دول، التانيين بيتضافوا (الكوكي على IP جديد → الـIP
// الجديد يتحظر، والـIP المحظور → الكوكي تتحط).
//
// اللي مابيتقفلش أبدًا (عشان لو حد بريء على نفس IP الموبايل): صفحات الدعوات نفسها /i/
// وصفحات الضيوف (/s/ /v/ /a/)، ملفات الصور والخطوط، ولوحة التحكم /admin.
//
// أي غلط هنا = الطلب بيعدّي عادي (الحظر عمره مايوقّع الموقع).
const crypto = require('crypto');
const mongoose = require('mongoose');
const Ban = require('../models/Ban');
const { ipHashOf } = require('./siteAnalytics');

const COOKIE = 'mithaq_bn';
const KEY = crypto.createHash('sha256').update(`ban|${process.env.ADMIN_SECRET || 'mithaq'}`).digest();
const REFRESH_MS = 60 * 1000;
const IP_DAYS = 30;           // بصمات الـIP اللي اتمسكت وقت الحظر
const IP_AUTO_DAYS = 7;       // بصمات جديدة بتتضاف لوحدها بعدين
const DAY_MS = 24 * 60 * 60 * 1000;

// بصمة/جهاز → الحساب اللي الحظر اتعمل بسببه (عشان أي حظر جديد يتبعه يتربط بنفس الحساب)
let ips = new Map();
let devices = new Map();
let loadedAt = 0;
let loading = null;

function sign(v) { return crypto.createHmac('sha256', KEY).update(String(v)).digest('hex').slice(0, 32); }
function cookieValue(userId) { const v = String(userId || 'x'); return `${v}.${sign(v)}`; }
function cookieUser(raw) {
  const m = /^([a-z0-9]{1,40})\.([a-f0-9]{32})$/i.exec(String(raw || ''));
  if (!m) return null;
  const a = Buffer.from(sign(m[1])); const b = Buffer.from(m[2]);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? m[1] : null;
}

async function refresh() {
  const now = new Date();
  const list = await Ban.find({ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }).select('kind value userId').lean();
  const ni = new Map(); const nd = new Map();
  for (const b of list) (b.kind === 'ip' ? ni : nd).set(b.value, b.userId ? String(b.userId) : null);
  ips = ni; devices = nd; loadedAt = Date.now();
}
function ensureFresh() {
  if (loading || Date.now() - loadedAt < REFRESH_MS || mongoose.connection.readyState !== 1) return;
  loading = refresh().catch((e) => console.error('[ban] refresh failed:', e.message)).finally(() => { loading = null; });
}

/** صفحات/ملفات مابتتقفلش (الضيوف وملفات الدعوات ولوحة التحكم) */
function exempt(path) {
  const p = String(path || '/');
  if (/^\/(i|s|v|a)(\/|$)/.test(p)) return true;
  if (/^\/(admin|custom|templates|royal)(\/|$)/.test(p)) return true;
  if (p.startsWith('/api/public-stats')) return true;
  // أي ملف (صورة/خط/سكريبت/أيقونة) — الصفحة نفسها هي اللي بتتقفل
  if (/\.[a-z0-9]{2,5}$/i.test(p)) return true;
  return false;
}

async function addBan(kind, value, { userId = null, note = '', days = null } = {}) {
  if (!value) return;
  (kind === 'ip' ? ips : devices).set(value, userId ? String(userId) : null);
  const expiresAt = days ? new Date(Date.now() + days * DAY_MS) : null;
  try {
    await Ban.updateOne(
      { kind, value },
      { $setOnInsert: { createdAt: new Date(), userId, note }, $set: { expiresAt } },
      { upsert: true }
    );
  } catch (e) {
    if (!(e && e.code === 11000)) console.error('[ban] save failed:', e.message);
  }
}

function setCookie(res, userId) {
  res.cookie(COOKIE, cookieValue(userId), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 365 * DAY_MS, path: '/',
  });
}

/** الجهاز ده اتمسك (حساب محظور حاول يدخل، أو جهاز محظور): بصمة الـIP + الكوكي */
function markDevice(req, res, userId, note) {
  try {
    const uid = userId ? String(userId) : null;
    addBan('ip', ipHashOf(req), { userId: uid, note: note || 'auto', days: IP_AUTO_DAYS });
    const vid = req.body && typeof req.body.vid === 'string' ? req.body.vid : '';
    if (/^[a-f0-9]{32}$/.test(vid)) addBan('device', vid, { userId: uid, note: note || 'auto' });
    setCookie(res, uid);
  } catch (e) {
    console.error('[ban] mark failed:', e.message);
  }
}

const PAGE = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>ميثاق</title>
<style>html,body{margin:0;height:100%;background:#faf7f2;color:#4a3d33;font-family:Tahoma,Arial,sans-serif}main{min-height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box}p{margin:0;font-size:17px;line-height:1.8}</style></head>
<body><main><p>الوصول للموقع متوقف من الجهاز ده.</p></main></body></html>`;

function blocked(req, res) {
  res.set('Cache-Control', 'no-store');
  if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'الوصول للموقع متوقف من الجهاز ده.', code: 'DEVICE_BLOCKED' });
  return res.status(403).type('html').send(PAGE);
}

/** حساب محظور حاول يدخل: لو الحساب ده عليه حظر جهاز (مش حظر حساب عادي من اللوحة)، الجهاز يتمسك */
async function markIfBanned(req, res, userId) {
  try {
    if (userId && await Ban.exists({ userId })) markDevice(req, res, userId, 'blocked login');
  } catch (e) { /* الرد الأصلي (الحساب متوقف) بيتبعت برضه */ }
}

/** الميدلوير: قبل كل المسارات (بعد قراءة الكوكيز والـJSON) */
function banGate(req, res, next) {
  try {
    ensureFresh();
    const raw = req.cookies && req.cookies[COOKIE];
    if (!raw && !ips.size && !devices.size) return next();
    if (exempt(req.path)) return next();
    const cUser = raw ? cookieUser(raw) : null;
    const h = ips.size || cUser ? ipHashOf(req) : '';
    const ipHit = !!h && ips.has(h);
    const vid = req.body && typeof req.body.vid === 'string' ? req.body.vid : '';
    const devHit = !!vid && devices.has(vid);
    if (!cUser && !ipHit && !devHit) return next();
    const uid = (cUser && cUser !== 'x' ? cUser : null) || (ipHit ? ips.get(h) : null) || (devHit ? devices.get(vid) : null) || null;
    // اللي اتمسك بحاجة واحدة يتمسك بالباقي
    if (!ipHit) addBan('ip', h || ipHashOf(req), { userId: uid, note: 'auto', days: IP_AUTO_DAYS });
    if (vid && !devHit && /^[a-f0-9]{32}$/.test(vid)) addBan('device', vid, { userId: uid, note: 'auto' });
    if (!cUser) setCookie(res, uid);
    return blocked(req, res);
  } catch (e) {
    return next();
  }
}

/**
 * حظر حسابات بعينها بطلب المالك — بيتعمل مرة واحدة (علامة 'seed:<name>' في نفس القائمة،
 * مالهاش userId فرفع الحظر من اللوحة مابيرجّعهاش).
 * الإيميل مش مكتوب هنا (بيانات عميل): emailSha256 = sha256 للإيميل بحروف صغيرة.
 */
const SEEDS = [
  { name: 'owner-ban-2026-11-08', emailSha256: '76f708d8b059371b525246bcf7d1f91947a0876c4dc5735ac0794ca49c80d7b0', note: 'بطلب المالك 2026-11-08: حظر الجهاز من الموقع' },
];

async function runBanSeeds() {
  const User = require('../models/User');
  const Session = require('../models/Session');
  const SiteDeviceDay = require('../models/SiteDeviceDay');
  const SiteDevice = require('../models/SiteDevice');
  const JourneySession = require('../models/JourneySession');
  for (const s of SEEDS) {
    try {
      if (await Ban.exists({ kind: 'device', value: `seed:${s.name}` })) continue;
      // بندوّر بالبصمة (مرة واحدة: بعد ما الحظر يتعمل العلامة بتمنع التكرار)
      let user = null;
      const cur = User.find({}).select('_id email isBlocked').lean().cursor();
      for (let u = await cur.next(); u; u = await cur.next()) {
        const e = String(u.email || '').trim().toLowerCase();
        if (e && crypto.createHash('sha256').update(e).digest('hex') === s.emailSha256) { user = u; break; }
      }
      await cur.close();
      if (!user) { console.log(`[ban] ${s.name}: account not found`); continue; }
      const uid = user._id;
      await User.updateOne({ _id: uid }, { $set: { isBlocked: true, blockedAt: new Date() } });
      const killed = (await Session.deleteMany({ userId: uid })).deletedCount || 0;
      const since = new Date(Date.now() - 30 * DAY_MS);
      const days = await SiteDeviceDay.find({ userId: uid, lastSeen: { $gte: since } }).select('device ipHash').lean();
      const devs = new Set();
      const hashes = new Set();
      for (const d of days) {
        if (d.ipHash) hashes.add(d.ipHash);
        if (/^[a-f0-9]{32}$/.test(d.device || '')) devs.add(d.device);
      }
      (await SiteDevice.find({ userId: uid }).select('device').lean()).forEach((d) => { if (/^[a-f0-9]{32}$/.test(d.device || '')) devs.add(d.device); });
      (await JourneySession.find({ userId: uid }).select('device').lean()).forEach((d) => { if (/^[a-f0-9]{32}$/.test(d.device || '')) devs.add(d.device); });
      for (const v of devs) await addBan('device', v, { userId: uid, note: s.note });
      for (const v of hashes) await addBan('ip', v, { userId: uid, note: s.note, days: IP_DAYS });
      await addBan('device', `seed:${s.name}`, { note: s.note });
      console.log(`[ban] ${s.name}: account blocked (was ${!!user.isBlocked}), sessions killed ${killed}, devices ${devs.size}, ip prints ${hashes.size}`);
    } catch (e) {
      console.error(`[ban] ${s.name} failed:`, e.message);
    }
  }
  try { await refresh(); } catch (e) { /* بيتحمّل في الطلب الجاي */ }
}

/** رفع الحظر عن حساب من لوحة التحكم: أجهزته وبصماته كمان */
async function clearBansFor(userId) {
  await Ban.deleteMany({ userId: String(userId) });
  try { await refresh(); } catch (e) { loadedAt = 0; }
}

module.exports = { banGate, markDevice, markIfBanned, runBanSeeds, clearBansFor, refreshBans: refresh, BAN_COOKIE: COOKIE, _exempt: exempt };
