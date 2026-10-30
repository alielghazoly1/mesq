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

const API_VERSION = 'v24.0';
const SITE = 'https://mithaq-invitation.com';

let cache = { at: 0, cfg: null };
async function config() {
  if (cache.cfg && Date.now() - cache.at < 60 * 1000) return cache.cfg;
  try {
    const SiteConfig = require('../models/SiteConfig');
    const doc = await SiteConfig.findOne({ key: 'default' }).select('+metaCapiToken metaTestCode metaCapiEnabled').lean();
    cache = {
      at: Date.now(),
      cfg: {
        token: (doc && doc.metaCapiToken) || process.env.META_CAPI_TOKEN || '',
        testCode: (doc && doc.metaTestCode) || '',
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
  const c = req.cookies || {};
  const ref = String(req.get('referer') || '');
  return {
    fbp: String(c._fbp || '').slice(0, 200) || undefined,
    fbc: String(c._fbc || '').slice(0, 300) || undefined,
    ip: String(req.ip || '').replace(/^::ffff:/, '').slice(0, 60) || undefined,
    ua: String(req.get('user-agent') || '').slice(0, 400) || undefined,
    url: ref.startsWith(SITE) ? ref.slice(0, 500) : undefined,
  };
}

function userData(user, ctx) {
  const u = {};
  if (user) {
    if (user.email) u.em = [sha(norm(user.email))];
    const ph = user.phone ? toWhatsAppNumber(user.phone, user.country) : '';
    if (ph) u.ph = [sha(ph)];
    if (user.country) u.country = [sha(norm(user.country))];
    if (user._id || user.id) u.external_id = [sha(String(user._id || user.id))];
    const first = norm(String(user.name || '').split(/\s+/)[0]);
    if (first) u.fn = [sha(first)];
  }
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
 * @param {string} name   PageView | CompleteRegistration | InitiateCheckout | AddPaymentInfo | Purchase
 * @param {object} o      { eventId, user, ctx, custom: {value, currency, content_ids...}, eventTime, test }
 */
async function sendEvent(name, o = {}) {
  try {
    const cfg = await config();
    if (!cfg.token || !cfg.enabled) return { skipped: true };
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
    const body = { data: [event] };
    const testCode = o.test || cfg.testCode;
    if (testCode) body.test_event_code = testCode;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let json = null; let ok = false; let error = '';
    try {
      const r = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(cfg.token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal,
      });
      json = await r.json().catch(() => null);
      ok = r.ok && json && json.events_received >= 1;
      if (!ok) error = (json && json.error && (json.error.error_user_msg || json.error.message)) || `HTTP ${r.status}`;
    } catch (e) {
      error = e.name === 'AbortError' ? 'timeout' : String(e.message || e);
    } finally {
      clearTimeout(timer);
    }
    const matchKeys = Object.keys(event.user_data).filter((k) => !['client_user_agent'].includes(k));
    await record({
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

/** بيانات الباقة/الأوردر بالشكل اللي ميتا مستنياه */
function orderCustom(order) {
  return {
    value: Number(order.price) || 0,
    currency: order.currency || 'USD',
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

module.exports = { sendEvent, fire, contextFromReq, orderCustom, checkToken, config, clearConfigCache, API_VERSION };
