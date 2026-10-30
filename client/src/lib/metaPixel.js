// بيكسل ميتا (فيسبوك/إنستجرام) — بيبلّغ ميتا بخطوات الزائر عشان الإعلانات
// توصل لناس شبه اللي بيدفعوا فعلًا:
//   PageView              كل صفحة في الموقع
//   CompleteRegistration  عمل حساب جديد            event_id: reg_<user>
//   InitiateCheckout      فتح صفحة الدفع            event_id: ic_<order>
//   AddPaymentInfo        رفع الإيصال / كتب رقمه     event_id: pay_<order>
//   Purchase              شاف "باقتك اتفعّلت"        event_id: purchase_<order>
// ViewContent (فتح ديمو تصميم) بيتبعت من صفحة المعاينة نفسها (utils/metaPixel.js).
//
// السيرفر بيبعت نفس الأحداث دي بنفس الـ event_id (utils/metaCapi.js) — ميتا بتعدّ
// كل حدث مرة واحدة، واللي البيكسل بتاعه اتمنع (آيفون/مانع إعلانات) بيوصل من السيرفر.
// العميل المسجّل: إيميله ورقم حسابه ودولته بيتبعتوا للبيكسل (البيكسل بيشفّرهم
// بنفسه قبل ما يبعت) عشان ميتا تعرفه وتنسب الشراء للإعلان الصح.
// مابيشتغلش أبدًا في لوحة التحكم، ولا في التطوير المحلي (npm run dev).
const PIXEL_ID = '1073401149053954';

let loaded = false;
let lastPath = '';
let matchedUser = '';
const sentOnce = new Set();

function enabled() {
  return import.meta.env.PROD && typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin');
}

function load() {
  if (loaded) return true;
  if (!enabled()) return false;
  loaded = true;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID);
  return true;
}

/** صفحة اتفتحت (components/JourneyTracker.jsx بينادي عليها مع كل تغيير مسار) */
export function pixelPageView(path) {
  if (path.startsWith('/admin') || path === lastPath) return;
  if (!load()) return;
  lastPath = path;
  window.fbq('track', 'PageView');
}

/** العميل المسجّل (Advanced Matching) — مرة واحدة لكل حساب */
export function pixelUser(user) {
  if (!user || !user.id || matchedUser === user.id) return;
  if (!load()) return;
  matchedUser = user.id;
  const data = { external_id: String(user.id) };
  if (user.email) data.em = String(user.email).trim().toLowerCase();
  if (user.country) data.country = String(user.country).trim().toLowerCase();
  window.fbq('init', PIXEL_ID, data);
}

/**
 * حدث قياسي. once: مفتاح بيمنع التكرار في نفس الزيارة. eventId: نفس اللي السيرفر
 * بيبعته (ميتا بتعدّهم مرة واحدة).
 */
export function pixelTrack(event, params, once, eventId) {
  if (once) {
    if (sentOnce.has(once)) return;
    sentOnce.add(once);
  }
  if (!load()) return;
  if (eventId) window.fbq('track', event, params || {}, { eventID: eventId });
  else window.fbq('track', event, params || {});
}

/** بيانات الباقة بالشكل اللي ميتا مستنياه */
export function pixelPackage(pkg) {
  return {
    content_ids: [pkg.id],
    content_name: pkg.name,
    content_type: 'product',
    value: Number(pkg.price) || 0,
    currency: pkg.currency || 'USD',
  };
}
