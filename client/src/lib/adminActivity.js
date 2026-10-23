// قفل لوحة التحكم بعد 5 دقايق من غير استخدام (بطلب المالك).
//
// "استخدام" = لمسة / ضغطة / كتابة / سكرول / تحريك الماوس من الأدمن نفسه.
// التحديث التلقائي اللي اللوحة بتعمله في الخلفية مش بيحسب — فلو سبت
// اللوحة مفتوحة ومشيت، بتتقفل.
//
// السيرفر هو اللي بيقرر فعلًا (middleware/adminAuth.js): أي طلب بيتبعت
// وفيه X-Admin-Active لو الأدمن لمس الشاشة في آخر دقيقة، والجلسة بتموت
// لو عدّى 5 دقايق من غير ده. هنا بس بنقفل الشاشة على طول من غير ما
// نستنى طلب يرجع 401، وبنبعت نبضة لو الأدمن شغال في صفحة مش بتطلب حاجة.
export const IDLE_MS = 5 * 60 * 1000;
const ACTIVE_WINDOW_MS = 60 * 1000;
const PING_EVERY_MS = 30 * 1000;
export const LOCK_EVENT = 'mithaq:admin-locked';

// 0 لحد أول لمسة: لو الصفحة اتفتحت من جديد بعد خمول، مانمدّش الجلسة لوحدنا
let lastActivity = 0;

export function markActive() { lastActivity = Date.now(); }
export function lastActiveAt() { return lastActivity; }
export const recentlyActive = () => Date.now() - lastActivity < ACTIVE_WINDOW_MS;

/** اللوحة اتقفلت (السيرفر رد 401 أو الخمول خلص) */
export function signalLocked(reason = 'idle') {
  window.dispatchEvent(new CustomEvent(LOCK_EVENT, { detail: { reason } }));
}

const EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll', 'mousemove'];

/**
 * بيبدأ متابعة الاستخدام. بيرجّع دالة توقفه.
 * @param {() => void} onIdle — بتتنادى مرة لما الـ 5 دقايق يخلصوا
 */
export function startActivityWatch(onIdle) {
  markActive(); // لحظة الدخول نفسها استخدام
  let last = 0;
  const mark = () => {
    const now = Date.now();
    if (now - last < 1000) return; // مايتعملش أكتر من مرة في الثانية
    last = now;
    lastActivity = now;
  };
  EVENTS.forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }));

  let fired = false;
  const check = () => {
    if (fired) return;
    if (Date.now() - lastActivity > IDLE_MS) { fired = true; onIdle(); }
  };
  // نبضة: الأدمن شغال بس الصفحة مش بتطلب حاجة من السيرفر
  const ping = () => {
    if (fired || !recentlyActive()) return;
    fetch('/admin/api/ping', {
      method: 'POST', credentials: 'include', headers: { 'X-Admin-Request': '1', 'X-Admin-Active': '1' },
    }).then((r) => { if (r.status === 401) { fired = true; signalLocked('server'); } }).catch(() => {});
  };
  const t1 = setInterval(check, 5000);
  const t2 = setInterval(ping, PING_EVERY_MS);
  // رجع للتاب بعد ما كان في الخلفية — نشيك على طول (التايمرز بتتبطّأ في الخلفية)
  const onVis = () => { if (document.visibilityState === 'visible') check(); };
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('focus', onVis);
  return () => {
    EVENTS.forEach((e) => window.removeEventListener(e, mark, { capture: true }));
    clearInterval(t1); clearInterval(t2);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('focus', onVis);
  };
}
