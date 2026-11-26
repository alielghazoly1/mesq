// نافذة الدخول/التسجيل (components/AuthModal.jsx) فيها مكتبة الفورم وقايمة الدول (~140KB) —
// مش محتاجينها غير لما الزائر يدوس "دخول" أو "حساب جديد". أول ضغطة قبل ما الملف يكون نزل كانت
// بتستنى ~2.5 ثانية على نت الموبايل لحد ما النافذة تفتح (مقابل نص ثانية لو كان نازل).
// فبنبدأ التحميل بدري على "نيّة" الضغط:
//   - أول لمسة/ضغطة/تركيز على زرار عليه data-auth-intent (زراير الدخول والتسجيل) — قبل الـ click بلحظات
//   - أول مرة الزائر يسكرول الصفحة بإيده (مرة واحدة)، بعد ما الصفحة تخلص تحميل
// النزول التلقائي في الرئيسية (lib/homeScroll.js) ورجوع مكان الصفحة بعد ريفرش مش بيحسبوا: لازم
// لمسة أو عجلة أو زرار كيبورد قبل السكرول — عشان التحميل مايتقلش على حركة النزول التلقائي.
export const importAuthModal = () => import('../components/AuthModal.jsx');

let pending = null;

/** بيبدأ تحميل ملف النافذة مرة واحدة (ولو فشل، المحاولة الجاية تجرّب تاني) */
export function preloadAuthModal() {
  if (!pending) pending = importAuthModal().catch(() => { pending = null; });
  return pending;
}

const INTENT_EVENTS = ['pointerdown', 'touchstart', 'focusin'];

/** زراير الدخول/التسجيل (data-auth-intent): أول لمسة أو تركيز عليها = تحميل النافذة على طول */
export function watchAuthIntent() {
  const onIntent = (e) => {
    const el = e.target;
    if (el && el.closest && el.closest('[data-auth-intent]')) preloadAuthModal();
  };
  INTENT_EVENTS.forEach((ev) => document.addEventListener(ev, onIntent, { capture: true, passive: true }));
  return () => INTENT_EVENTS.forEach((ev) => document.removeEventListener(ev, onIntent, { capture: true }));
}

const USER_INPUT = ['touchstart', 'touchmove', 'wheel', 'keydown', 'pointerdown'];

/**
 * أول سكرول بإيد الزائر (مرة واحدة) = تحميل النافذة لما المتصفح يفضى.
 * مش بيشتغل لو المتصفح على "توفير البيانات" أو نت 2G (تحميل على التخمين).
 * @returns {() => void} تنظيف
 */
export function preloadAuthModalOnFirstScroll() {
  const c = typeof navigator !== 'undefined' ? navigator.connection : null;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return () => {};
  let lastInput = -Infinity;
  let fired = false;
  let idleId = 0;
  const ric = window.requestIdleCallback;
  const onInput = () => { lastInput = performance.now(); };
  const go = () => {
    idleId = ric ? ric(() => { preloadAuthModal(); }, { timeout: 2000 }) : window.setTimeout(preloadAuthModal, 200);
  };
  const stopListening = () => {
    USER_INPUT.forEach((ev) => window.removeEventListener(ev, onInput, { capture: true }));
    window.removeEventListener('scroll', onScroll);
  };
  function onScroll() {
    // سكرول من غير لمسة قريبة = حركة من الكود (النزول التلقائي) — مش نيّة من الزائر
    if (fired || performance.now() - lastInput > 1000) return;
    fired = true;
    stopListening();
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }
  USER_INPUT.forEach((ev) => window.addEventListener(ev, onInput, { capture: true, passive: true }));
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    stopListening();
    window.removeEventListener('load', go);
    if (idleId) { if (ric) window.cancelIdleCallback(idleId); else window.clearTimeout(idleId); }
  };
}
