// بيكسل ميتا (فيسبوك/إنستجرام) — بيبلّغ ميتا بخطوات الزائر عشان الإعلانات
// توصل لناس شبه اللي بيدفعوا فعلًا:
//   PageView          كل صفحة في الموقع
//   CompleteRegistration  عمل حساب جديد
//   InitiateCheckout  فتح صفحة الدفع (ومعاها الباقة والسعر)
//   AddPaymentInfo    رفع الإيصال / كتب الرقم اللي حوّل منه
// ViewContent (فتح ديمو تصميم) بيتبعت من صفحة المعاينة نفسها (utils/metaPixel.js).
// مابيشتغلش أبدًا في لوحة التحكم، ولا في التطوير المحلي (npm run dev).
const PIXEL_ID = '1073401149053954';

let loaded = false;
let lastPath = '';
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

/**
 * حدث قياسي. once: مفتاح بيمنع التكرار في نفس الزيارة (زي فتح صفحة الدفع
 * مرتين لنفس الباقة).
 */
export function pixelTrack(event, params, once) {
  if (once) {
    if (sentOnce.has(once)) return;
    sentOnce.add(once);
  }
  if (!load()) return;
  window.fbq('track', event, params || {});
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
