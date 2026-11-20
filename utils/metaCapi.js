// Conversions API بتاعة ميتا — السيرفر بيبلّغ ميتا بنفسه بالأحداث المهمة
// (تسجيل / فتح الدفع / إرسال الدفع / الشراء). ده بيكمّل البيكسل اللي في المتصفح:
// الآيفون ومانع الإعلانات بيوقّفوا البيكسل ساعات، لكن السيرفر بيوصل دايمًا.
//
// • نفس الـ event_id بيتبعت من المتصفح والسيرفر ← ميتا بتعدّ الحدث مرة واحدة.
//   الأرقام ثابتة من الحاجة نفسها (reg_<user> / ic_<order> / pay_<order> / purchase_<order>)
//   فالمتصفح بيحسبها لوحده من غير ما نبعتهاله.
// • بيانات العميل (إيميل/تليفون/دولة/رقم الحساب) بتتبعت متشفّرة SHA-256 — ميتا
//   بتعرف الشخص من غير ما تشوف بياناته. الـ IP والمتصفح والكوكيز _fbp/_fbc من غير تشفير
//   (ميتا طالبة كده).
// • الـ Token من لوحة التحكم (SiteConfig.metaCapiToken) — مش في الكود ولا في .env.
// • مابيوقّفش أي حاجة أبدًا: أي خطأ بيتسجّل ويتساب.
// • كل إرسال بيتسجّل (MetaEvent) ونتيجته من ميتا — بيظهر للمالك في صفحة الإعلانات.
const crypto = require('crypto');
const { PIXEL_ID } = require('./metaPixel');
const { toWhatsAppNumber } = require('./whatsapp/phone');
const { captureMetaParams, validFbx } = require('./metaParams');

const API_VERSION = 'v24.0';
const SITE = 'https://mithaq-invitation.com';
// كود التجربة بيشتغل على الأحداث الحقيقية المدة دي بس بعد حفظه
const TEST_CODE_TTL_MS = 2 * 3600 * 1000;

/** الـ Token المحفوظ لو بتاع البكسل الحالي بس (اتغيّر البكسل = Token جديد) */
function tokenFor(doc) {
  if (!doc || !doc.metaCapiToken) return '';
  return doc.metaCapiPixel === PIXEL_ID ? doc.metaCapiToken : '';
}

let cache = { at: 0, cfg: null };
async function config() {
  if (cache.cfg && Date.now() - cache.at < 60 * 1000) return cache.cfg;
  try {
    const SiteConfig = require('../models/SiteConfig');
    const doc = await SiteConfig.findOne({ key: 'default' }).select('+metaCapiToken metaCapiPixel metaTestCode metaTestCodeAt metaCapiEnabled').lean();
    cache = {
      at: Date.now(),
      cfg: {
        token: tokenFor(doc) || process.env.META_CAPI_TOKEN || '',
        testCode: (doc && doc.metaTestCode) || '',
        // شغال على الأحداث الحقيقية؟ (زرار "ابعت حدث تجربة" بيستخدم الكود دايمًا)
        testLive: !!(doc && doc.metaTestCode && doc.metaTestCodeAt
          && Date.now() - new Date(doc.metaTestCodeAt).getTime() < TEST_CODE_TTL_MS),
        enabled: !(doc && doc.metaCapiEnabled === false),
      },
    };
  } catch {
    cache = { at: Date.now(), cfg: { token: '', testCode: '', enabled: false } };
  }
  return cache.cfg;
}
function clearConfigCache() { cache = { at: 0, cfg: null }; }

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
const norm = (v) => String(v || '').trim().toLowerCase();

/** بيانات المتصفح وقت الطلب — بتتحفظ على الأوردر عشان حدث الشراء (بيحصل من جهاز الأدمن) */
function contextFromReq(req) {
  if (!req) return {};
  const ref = String(req.get('referer') || '');
  // _fbp/_fbc من مكتبة ميتا الرسمية (utils/metaParams.js): زي ما هما بالحرف — ميتا بتعتبر أي تعديل
  // (قص أو تصغير حروف) "fbclid متعدّل". ولو الصفحة اللي العميل فيها جاية من ضغطة إعلان أحدث من
  // الكوكي، الضغطة الأحدث هي اللي بتتبعت (وبتتكتب في الكوكي). قيمة بشكل غلط مابتتبعتش خالص.
  const mp = captureMetaParams(req, req.res);
  return {
    fbp: mp.fbp,
    fbc: mp.fbc,
    ip: String(req.ip || '').replace(/^::ffff:/, '').slice(0, 60) || undefined,
    ua: String(req.get('user-agent') || '').slice(0, 400) || undefined,
    url: ref.startsWith(SITE) ? ref.slice(0, 500) : undefined,
  };
}

/**
 * بيانات المتصفح المحفوظة على الأوردر (Order.metaCtx) لحدث الشراء — بيحصل بعدين من جهاز الأدمن.
 * ميتا (Diagnostics 2026-11-20 "fbclid متعدّل"): الأوردرات اللي بياناتها اتحفظت قبل 2026-11-16 فيها
 * fbc مقصوص على 300 حرف بالظبط (كان فيه قص وقتها) — ده "fbclid متعدّل" عند ميتا، فمابيتبعتش. وأي قيمة
 * بشكل غلط كمان. الباقي (الإيميل والتليفون والـ IP و fbp) بيربطوا الشراء بالعميل.
 */
function storedContext(mc) {
  const m = mc || {};
  const fbc = m.fbc && String(m.fbc).length !== 300 ? validFbx(m.fbc) : undefined;
  return { fbp: validFbx(m.fbp), fbc, ip: m.ip, ua: m.ua, url: m.url };
}

/**
 * بيانات العميل متشفّرة SHA-256 (إيميل/تليفون/دولة/رقم الحساب/الاسم الأول والأخير).
 * نفس القيم بتروح للبيكسل في المتصفح كمان (/api/auth/me ← user.pixel) — فميتا بتلاقي
 * نفس الشخص في أحداث المتصفح والسيرفر.
 */
function hashedUser(user) {
  const h = {};
  if (!user) return h;
  if (user.email) h.em = sha(norm(user.email));
  const ph = user.phone ? toWhatsAppNumber(user.phone, user.country) : '';
  if (ph) h.ph = sha(ph);
  if (user.country) h.country = sha(norm(user.country));
  if (user._id || user.id) h.external_id = sha(String(user._id || user.id));
  const parts = norm(user.name).split(/\s+/).filter(Boolean);
  if (parts[0]) h.fn = sha(parts[0]);
  // اسم العيلة (آخر كلمة) — ميتا بتطلبه في اقتراحات تحسين المطابقة
  if (parts.length > 1) h.ln = sha(parts[parts.length - 1]);
  return h;
}

function userData(user, ctx) {
  const u = {};
  Object.entries(hashedUser(user)).forEach(([k, v]) => { u[k] = [v]; });
  if (ctx) {
    if (ctx.ip) u.client_ip_address = ctx.ip;
    if (ctx.ua) u.client_user_agent = ctx.ua;
    if (ctx.fbp) u.fbp = ctx.fbp;
    if (ctx.fbc) u.fbc = ctx.fbc;
  }
  return u;
}

async function record(doc) {
  try { await require('../models/MetaEvent').create(doc); } catch { /* السجل مش أهم من الحدث */ }
}

/**
 * يبعت حدث لميتا. مابيرميش أخطاء أبدًا.
 * @param {string} name   PageView | ViewContent | CompleteRegistration | InitiateCheckout | AddPaymentInfo | Purchase
 * @param {object} o      { eventId, user, ctx, custom: {value, currency, content_ids...}, eventTime, test }
 */
/** الحدث بالشكل اللي ميتا مستنياه (بيتبني وقت ما الحاجة حصلت — عشان الوقت يبقى مظبوط حتى لو اتبعت في دفعة) */
function buildEvent(name, o = {}) {
  const ctx = o.ctx || {};
  const event = {
    event_name: name,
    event_time: Math.floor((o.eventTime ? new Date(o.eventTime).getTime() : Date.now()) / 1000),
    action_source: 'website',
    event_source_url: ctx.url || SITE + '/',
    user_data: userData(o.user, ctx),
  };
  if (o.eventId) event.event_id = o.eventId;
  if (o.custom) event.custom_data = o.custom;
  return event;
}

/** طلب واحد لميتا بحدث أو أكتر (لحد 1000 في الطلب) */
async function postEvents(cfg, events, testCode) {
  const body = { data: events };
  if (testCode) body.test_event_code = testCode;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let json = null; let ok = false; let error = '';
  try {
    const r = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(cfg.token)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal,
    });
    json = await r.json().catch(() => null);
    ok = r.ok && json && json.events_received >= events.length;
    if (!ok) error = (json && json.error && (json.error.error_user_msg || json.error.message)) || `HTTP ${r.status}`;
  } catch (e) {
    error = e.name === 'AbortError' ? 'timeout' : String(e.message || e);
  } finally {
    clearTimeout(timer);
  }
  return { ok, error, json };
}

async function sendEvent(name, o = {}) {
  try {
    const cfg = await config();
    if (!cfg.token || !cfg.enabled) return { skipped: true };
    const event = buildEvent(name, o);
    const testCode = o.test || (cfg.testLive ? cfg.testCode : '');
    const { ok, error, json } = await postEvents(cfg, [event], testCode);
    const matchKeys = Object.keys(event.user_data).filter((k) => !['client_user_agent'].includes(k));
    // فتح ديمو تصميم بيحصل كتير — نسجّل لو فشل بس، عشان سجل اللوحة يفضل
    // للأحداث المهمة (التسجيل والدفع والشراء)
    if (!(name === 'ViewContent' && ok)) await record({
      name, eventId: o.eventId || '', ok, error: String(error).slice(0, 300), test: !!testCode,
      value: o.custom && o.custom.value, currency: o.custom && o.custom.currency,
      matchKeys, fbtrace: (json && json.fbtrace_id) || '',
    });
    if (!ok) console.error(`[meta-capi] ${name} failed:`, error);
    return { ok, error, received: json && json.events_received };
  } catch (e) {
    console.error('[meta-capi] unexpected:', e.message);
    return { ok: false, error: e.message };
  }
}

/** للأحداث اللي مش لازم نستناها (الرد للعميل مايتأخرش) */
function fire(name, o) { sendEvent(name, o).catch(() => {}); }

// ===== PageView من السيرفر (2026-11-20) =====
// "جودة المطابقة" (Event Match Quality) في ميتا بتتحسب من أحداث السيرفر بس. الـ PageView مكانش
// بيتبعت من سيرفرنا خالص — النسخة اللي على السيرفر كانت من ميتا نفسها (Conversions API "Web-only")
// والتقييم بتاعها نزل لـ 0 من 10. دلوقتي كل صفحة بتتبعت من سيرفرنا كمان بنفس event_id اللي البيكسل
// بيبعته (ميتا بتعدّها مرة واحدة) ومعاها IP والمتصفح و fbp/fbc، وبيانات العميل المسجّل متشفّرة.
// عشان دول كتير (كل صفحة)، بيتجمعوا ويتبعتوا دفعة واحدة كل 4 ثواني (أو كل 50 حدث) في طلب واحد.
const BATCH_MS = 4000;
const BATCH_MAX = 50;
const batch = { events: [], timer: null, sending: false };

async function flushBatch() {
  if (batch.timer) { clearTimeout(batch.timer); batch.timer = null; }
  if (batch.sending || !batch.events.length) return;
  batch.sending = true;
  const events = batch.events.splice(0, 1000);
  try {
    const cfg = await config();
    if (!cfg.token || !cfg.enabled) return;
    const testCode = cfg.testLive ? cfg.testCode : '';
    const { ok, error, json } = await postEvents(cfg, events, testCode);
    if (!ok) {
      // سجل واحد للدفعة كلها (مش لكل صفحة) عشان سجل اللوحة يفضل للأحداث المهمة
      await record({
        name: events[0].event_name, eventId: `batch:${events.length}`, ok: false, error: String(error).slice(0, 300),
        test: !!testCode, matchKeys: [], fbtrace: (json && json.fbtrace_id) || '',
      });
      console.error(`[meta-capi] ${events[0].event_name} batch (${events.length}) failed:`, error);
    }
  } catch (e) {
    console.error('[meta-capi] batch unexpected:', e.message);
  } finally {
    batch.sending = false;
    if (batch.events.length) batch.timer = setTimeout(flushBatch, BATCH_MS);
  }
}

/** حدث كتير ومش مستعجل (PageView): بيتبني دلوقتي ويتبعت مع الدفعة الجاية */
function queue(name, o) {
  try {
    if (batch.events.length >= 5000) return; // ميتا مش بترد بقالها كتير — مانملاش الذاكرة
    batch.events.push(buildEvent(name, o));
    if (batch.events.length >= BATCH_MAX) flushBatch();
    else if (!batch.timer) batch.timer = setTimeout(flushBatch, BATCH_MS);
  } catch { /* */ }
}

/** بيانات الباقة/الأوردر بالشكل اللي ميتا مستنياه */
// ميتا بترفض value = 0 ("يجب أن يكون رقمًا أكبر من 0") وبتطلّع تحذير في Events
// Manager — فالمبلغ بيتبعت بس لو أكبر من صفر (أوردر مجاني/خصم 100% مالوش مبلغ)
function orderCustom(order) {
  const value = Math.round((Number(order.price) || 0) * 100) / 100;
  return {
    ...(value > 0 ? { value, currency: order.currency || 'USD' } : {}),
    content_ids: [String(order.packageId)],
    content_type: 'product',
    num_items: 1,
    order_id: String(order._id),
  };
}

/** بيتأكد إن الـ Token شغال على البيكسل ده من غير ما يبعت أي حدث */
async function checkToken(token) {
  try {
    const r = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}?fields=name,last_fired_time&access_token=${encodeURIComponent(token)}`);
    const j = await r.json().catch(() => null);
    if (r.ok && j && j.id) return { ok: true, name: j.name || '', lastFired: j.last_fired_time || null };
    return { ok: false, error: (j && j.error && (j.error.error_user_msg || j.error.message)) || `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

/**
 * الـ Token بيخلص إمتى. البكسل الأساسي جوه حساب إعلانات شخصي (مش بيزنس)، فالـ Token
 * بتاعه شخصي من أداة المطورين (Graph API Explorer ← Extend Access Token) وبيعيش 60 يوم
 * — لازم المالك يتنبّه قبلها. expiresAt: null = مابيخلصش (Token من بيزنس).
 */
async function tokenExpiry(token) {
  try {
    const t = encodeURIComponent(token);
    const r = await fetch(`https://graph.facebook.com/${API_VERSION}/debug_token?input_token=${t}&access_token=${t}`, { signal: AbortSignal.timeout(6000) });
    const j = await r.json().catch(() => null);
    const d = j && j.data;
    if (!r.ok || !d) return { ok: false };
    const exp = Number(d.expires_at) || 0;
    return { ok: true, expiresAt: exp > 0 ? new Date(exp * 1000) : null };
  } catch {
    return { ok: false };
  }
}

module.exports = { tokenFor, PIXEL_ID, sendEvent, fire, queue, flushBatch, contextFromReq, storedContext, orderCustom, checkToken, tokenExpiry, hashedUser, config, clearConfigCache, API_VERSION };
