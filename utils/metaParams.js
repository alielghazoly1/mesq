// رقم الضغطة على الإعلان (fbc) ورقم المتصفح (fbp) من أول لحظة — بمكتبة ميتا الرسمية
// (Conversions API Parameter Builder: capi-param-builder-nodejs) بدل ما نستنى كود البيكسل
// يتحمّل في المتصفح.
//
// ليه (ميتا Diagnostics، 2026-11-20): "Server sending modified fbclid value in fbc parameter"
// • ميتا بتقول: _fbc و _fbp يتحفظوا أول ما صفحة الهبوط تفتح، ككوكي من السيرفر لمدة 90 يوم،
//   ولو اللينك فيه fbclid غير اللي في الكوكي (ضغطة إعلان جديدة) الجديد يكسب على طول.
// • من 2026-11-17 كود البيكسل بيتحمّل بعد ما الصفحة تخلص (الرئيسية أسرع)، فالزائر اللي بيدوس
//   على تصميم بسرعة كان بيسيب صفحة الهبوط قبل ما البيكسل يقرا الـ fbclid: الكوكي يفضل على ضغطة
//   قديمة (أو مايتعملش خالص)، والسيرفر يبعت مع التسجيل والدفع والشراء fbc مش بتاع الضغطة دي —
//   وده بالظبط اللي ميتا بتسمّيه "fbclid متعدّل".
// • كوكي السيرفر كمان بيعيش 90 يوم على الآيفون (Safari بيقص كوكي الجافاسكريبت لـ 7 أيام).
//
// القيم بتتبعت لميتا زي ما هي بالحرف. المكتبة بتزوّد في آخرها "ملحق" من 8 حروف (نسخة المكتبة
// ولغتها، وإذا كانت القيمة جديدة ولا اتغيّرت) — ده شكل ميتا الرسمي نفسه، مش تعديل.
// مابيشتغلش للبرامج الآلية، ولا في صفحات دعوات العملاء (/i/) ولوحة التحكم — بيتنادى بس من
// صفحات الموقع (server.js) ومعاينة التصاميم ولينكات الإعلانات وطلبات الحساب والدفع.
const { ParamBuilder } = require('capi-param-builder-nodejs');

const SITE_DOMAIN = 'mithaq-invitation.com';
const SITE_ORIGIN = `https://${SITE_DOMAIN}`;
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|preview|headless|lighthouse|curl\/|python|wget|axios|node-fetch|go-http/i;
// رقم الضغطة من ميتا: حروف وأرقام و _ و - (ونقط نادرًا — البيكسل بيكتبها __DOT__ جوه الكوكي)
const FBCLID_RE = /^[A-Za-z0-9_\-.]{4,1000}$/;
const APPENDIX_V1 = new Set(['AQ', 'Ag', 'Aw', 'BA', 'BQ', 'Bg']);
// رقم الزائر (External ID لميتا) — ميتا (Events Manager، 2026-11-20) كانت بتقول "Increase coverage" لـ
// External ID في ViewContent: 42% بس، لأنه كان رقم الحساب بس (للمسجّلين). دلوقتي كل زائر ليه رقم عشوائي
// ثابت (64 حرف hex — مش بيانات شخصية، ومش بيتشفّر تاني) في كوكي سنة، بيتبعت من المتصفح والسيرفر بنفس
// القيمة. المسجّل بيتبعت معاه رقم حسابه كمان (utils/metaCapi.js)، فميتا بتربط زياراته قبل وبعد التسجيل.
const XID_COOKIE = '_mq_xid';
const XID_RE = /^[a-f0-9]{64}$/;
const validXid = (v) => (typeof v === 'string' && XID_RE.test(v.trim()) ? v.trim() : undefined);

/**
 * قيمة fbc/fbp بالشكل اللي ميتا بتقبله (نفس فحص البيكسل نفسه SignalsFBEventsPixelCookie.unpack):
 * fb.<رقم الدومين>.<الوقت بالملي>.<القيمة>[.<ملحق 2 أو 8 حروف>]. أي حاجة تانية مابتتبعتش خالص
 * (أحسن من قيمة بايظة). مابنغيّرش ولا حرف.
 */
function validFbx(v) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s || s.length > 1200) return undefined;
  const p = s.split('.');
  if (p.length !== 4 && p.length !== 5) return undefined;
  if (p[0] !== 'fb' || !/^\d{1,2}$/.test(p[1]) || !/^\d{9,14}$/.test(p[2])) return undefined;
  if (!/^[A-Za-z0-9_-]+$/.test(p[3])) return undefined;
  if (p.length === 5) {
    const a = p[4];
    if (!(a.length === 2 ? APPENDIX_V1.has(a) : a.length === 8 && /^[A-Za-z0-9_-]{8}$/.test(a))) return undefined;
  }
  return s;
}

const isBotReq = (req) => BOT_RE.test(String((req && req.get && req.get('user-agent')) || ''));

/**
 * تحميل مسبق (المتصفح أو تطبيق فيسبوك/إنستجرام بيجيب الصفحة قبل ما حد يضغط/يشوفها) — نفس فحص
 * routes/campaigns.js. الصفحة دي لسه محدش شافها، فمانبعتش لميتا أحداث عنها من السيرفر.
 */
function isPrefetchReq(req) {
  const h = (n) => String((req && req.get && req.get(n)) || '').toLowerCase();
  return /prefetch|prerender/.test(h('sec-purpose') + ' ' + h('purpose') + ' ' + h('x-moz'))
    || h('x-purpose') === 'preview' || h('x-fb-purpose') !== '' || h('x-fb-preload') !== '';
}

/** fbclid من اللينك (أو من الصفحة اللي الطلب جاي منها جوه الموقع) — بنفس ترميز البيكسل للنقط */
function fbclidOf(req) {
  const q = req.query && req.query.fbclid;
  if (typeof q === 'string' && FBCLID_RE.test(q)) return q.replace(/\./g, '__DOT__');
  const ref = String((req.get && req.get('referer')) || '');
  const host = String(req.get && req.get('host') || '');
  if (ref.startsWith(SITE_ORIGIN + '/') || (host && ref.startsWith(`${req.protocol}://${host}/`))) {
    try {
      const f = new URL(ref).searchParams.get('fbclid');
      if (f && FBCLID_RE.test(f)) return f.replace(/\./g, '__DOT__');
    } catch { /* */ }
  }
  return '';
}

/**
 * بيجهّز fbc/fbp للطلب ده، ولو محتاج بيكتب الكوكيز في الرد (_fbp لو مش موجود، و _fbc لو فيه
 * ضغطة إعلان جديدة). النتيجة بتتحفظ على req.metaParams عشان أي حدث للسيرفر في نفس الطلب.
 * مابيرميش أخطاء أبدًا.
 */
function captureMetaParams(req, res) {
  if (!req) return {};
  if (req.metaParams) return req.metaParams;
  const c = req.cookies || {};
  const readOnly = () => ({ fbc: validFbx(c._fbc), fbp: validFbx(c._fbp), xid: validXid(c[XID_COOKIE]) });
  try {
    if (isBotReq(req)) return (req.metaParams = readOnly());
    const host = String(req.hostname || '');
    const onSite = host === SITE_DOMAIN || host.endsWith('.' + SITE_DOMAIN);
    const b = new ParamBuilder([SITE_DOMAIN]);
    const fbclid = fbclidOf(req);
    const cookies = {};
    if (typeof c._fbc === 'string' && validFbx(c._fbc)) cookies._fbc = c._fbc.trim();
    if (typeof c._fbp === 'string' && validFbx(c._fbp)) cookies._fbp = c._fbp.trim();
    // _fbp موجود بشكل مش معروف لينا (لو ميتا غيّرت شكله): مانكتبش فوقه — البيكسل بتاعه هو الأصل
    const keepFbp = typeof c._fbp === 'string' && c._fbp.trim() !== '' && !cookies._fbp;
    b.processRequest(onSite ? SITE_DOMAIN : (host || 'localhost'), fbclid ? { fbclid } : {}, cookies, null, null, null);
    if (res && !res.headersSent) {
      b.getCookiesToSet().forEach((ck) => {
        if (!validFbx(ck.value) || (keepFbp && ck.name === '_fbp')) return;
        res.cookie(ck.name, ck.value, {
          maxAge: Number(ck.maxAge) * 1000,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: false, // البيكسل في المتصفح لازم يقراهم
          encode: String, // القيمة زي ما هي بالحرف
          ...(onSite ? { domain: SITE_DOMAIN } : {}),
        });
      });
    }
    let xid = validXid(c[XID_COOKIE]);
    if (!xid) {
      xid = require('crypto').randomBytes(32).toString('hex');
      if (res && !res.headersSent) {
        res.cookie(XID_COOKIE, xid, {
          maxAge: 365 * 24 * 3600 * 1000, path: '/', sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production', httpOnly: false, // البيكسل في المتصفح بيقراه
          ...(onSite ? { domain: SITE_DOMAIN } : {}),
        });
      } else xid = undefined; // مااتحفظش عند الزائر = مالوش لازمة
    }
    return (req.metaParams = { fbc: validFbx(b.getFbc()), fbp: keepFbp ? undefined : validFbx(b.getFbp()), xid });
  } catch (e) {
    return (req.metaParams = readOnly());
  }
}

module.exports = { captureMetaParams, validFbx, validXid, XID_COOKIE, isBotReq, isPrefetchReq, fbclidOf, SITE_DOMAIN };
