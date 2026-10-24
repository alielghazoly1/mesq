// حركة الرئيسية لما تتفتح:
//
// 1) راجع من معاينة تصميم (زرار "رجوع" أو زرار الموبايل) ← بينزل على طول
//    على نفس كارت التصميم اللي كان بيتفرج عليه.
// 2) لينك فيه # (/#gallery من الإعلانات، /#tpl-xxx من زرار "كل التصاميم")
//    ← بينزل على المكان ده أول ما يظهر (الصفحة React والكروت بتتحمّل بعدين،
//    فالمتصفح لوحده مكانش بيلاقيه).
// 3) أول فتحة للموقع على الموبايل بس (بطلب المالك): بعد ما يشوف الواجهة
//    ثانية، الصفحة بتنزل لوحدها بالراحة لحد "اختار تصميم دعوتك". مرة واحدة
//    في الزيارة، ولو لمس الشاشة أو بدأ ينزل بنفسه بنسيبه فورًا.

export const PREVIEW_FROM_KEY = 'mithaq:preview-from';
const INTRO_KEY = 'mithaq:intro-scrolled';
const RETURN_FRESH_MS = 30 * 60 * 1000;

const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* تصفح خاص */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* تصفح خاص */ } },
};

export function rememberPreviewFrom(id) {
  ss.set(PREVIEW_FROM_KEY, JSON.stringify({ id, path: window.location.pathname, at: Date.now() }));
}

/** بيستنى العنصر لحد ما يظهر في الصفحة (الكروت بتيجي من السيرفر) */
function whenPresent(selector, cb, timeout = 6000) {
  const t0 = Date.now();
  let raf = 0;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    const el = document.querySelector(selector);
    if (el) { cb(el); return; }
    if (Date.now() - t0 < timeout) raf = requestAnimationFrame(tick);
  };
  tick();
  return () => { stopped = true; cancelAnimationFrame(raf); };
}

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2);

/** نزول ناعم بإيدينا (scrollTo smooth سريع ومش متحكم فيه على الموبايل) */
// الصفحة عليها scroll-behavior: smooth (index.css) — لازم يتقفل وإحنا بنحرّك
// بإيدينا، وإلا كل خطوة بتتنعّم لوحدها والحركة تطلع متقطعة
function withAutoBehavior(fn) {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  try { fn(); } finally { html.style.scrollBehavior = prev; }
}

// getTarget بيتحسب كل فريم: لو صورة فوق خلصت تحميل والمكان اتزق، الحركة
// بتكمّل للمكان الجديد بدل ما تقف في مكان غلط
function glideTo(getTarget, duration, onDone) {
  const startY = window.scrollY;
  const t0 = performance.now();
  let raf = 0;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach((e) => window.removeEventListener(e, stop, true));
    if (onDone) onDone();
  };
  ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach((e) => window.addEventListener(e, stop, { capture: true, passive: true }));
  // الوقت بيتحسب فريم بفريم بحد أقصى 34ms للفريم: لو الموبايل اتشغل لحظة
  // (صور بتتحمّل)، الحركة بتبطّأ شوية بدل ما تنط مرة واحدة لآخرها
  let elapsed = 0;
  let last = t0;
  const step = (now) => {
    if (stopped) return;
    elapsed += Math.min(34, Math.max(0, now - last));
    last = now;
    // وموبايل بطيء جدًا مايفضلش يزحف: أقصى مدة ≈ 1.7× المدة الأصلية
    const p = Math.min(1, Math.max(elapsed, (now - t0) / 1.7) / duration);
    withAutoBehavior(() => window.scrollTo(0, startY + (getTarget() - startY) * ease(p)));
    if (p < 1) raf = requestAnimationFrame(step);
    else stop();
  };
  raf = requestAnimationFrame(step);
  return stop;
}

// أي لمسة/سكرول من أول ما الموقع اتحمّل (حتى قبل ما الرئيسية تترسم) = الزائر
// بيتصرف بنفسه، فالنزول التلقائي مابيشتغلش
let interacted = false;
if (typeof window !== 'undefined') {
  const mark = () => { interacted = true; };
  ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach((e) => window.addEventListener(e, mark, { capture: true, passive: true }));
}

const isPhone = () => {
  try { return window.innerWidth < 768 && window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
};

// فيه نافذة مفتوحة (تسجيل/ترحيب)؟ ساعتها مش هنحرّك الصفحة من وراها
const modalOpen = () => !!document.querySelector('[role="dialog"], [aria-modal="true"]')
  || document.body.style.overflow === 'hidden';

/**
 * @returns {() => void} تنظيف
 */
export function startHomeScroll() {
  const cleanups = [];
  // بعد ما ننزل على المكان، الصور اللي فوقه ممكن تخلص تحميل وتزقّه لتحت —
  // فبنفضل ماسكينه في مكانه ثانيتين (إلا لو المستخدم لمس الشاشة)
  const hold = (el, ms) => {
    const spot = () => el.getBoundingClientRect().top;
    const want = spot();
    let held = true;
    const release = () => { held = false; };
    const EVS = ['touchstart', 'pointerdown', 'wheel', 'keydown'];
    EVS.forEach((e) => window.addEventListener(e, release, { capture: true, passive: true, once: true }));
    const iv = setInterval(() => {
      if (held && el.isConnected && Math.abs(spot() - want) > 4) withAutoBehavior(() => window.scrollBy(0, spot() - want));
    }, 100);
    const done = () => { clearInterval(iv); EVS.forEach((e) => window.removeEventListener(e, release, true)); };
    const tm = setTimeout(done, ms);
    cleanups.push(() => { clearTimeout(tm); done(); });
  };
  const instant = (el, block = 'start') => {
    withAutoBehavior(() => el.scrollIntoView({ block }));
    hold(el, 2200);
  };

  // 1) راجع من معاينة
  let back = null;
  try { back = JSON.parse(ss.get(PREVIEW_FROM_KEY) || 'null'); } catch { back = null; }
  ss.del(PREVIEW_FROM_KEY);
  if (back && back.id && Date.now() - back.at < RETURN_FRESH_MS && /^[a-z0-9-]+$/.test(back.id)) {
    ss.set(INTRO_KEY, '1');
    cleanups.push(whenPresent(`#tpl-${back.id}`, (el) => instant(el, 'center')));
    return () => cleanups.forEach((c) => c());
  }

  // 2) لينك فيه #
  const hash = window.location.hash.slice(1);
  if (hash && /^[a-z0-9-]+$/i.test(hash)) {
    ss.set(INTRO_KEY, '1');
    cleanups.push(whenPresent(`#${hash}`, (el) => instant(el, hash.startsWith('tpl-') ? 'center' : 'start')));
    return () => cleanups.forEach((c) => c());
  }

  // 3) أول فتحة على الموبايل
  if (!isPhone() || ss.get(INTRO_KEY)) return () => {};
  // لمس الشاشة قبل ما الحركة تبدأ = هو بيتصرف بنفسه، مش هنحرّك حاجة
  let touched = false;
  const onTouch = () => { touched = true; };
  const EV = ['touchstart', 'pointerdown', 'wheel', 'keydown'];
  EV.forEach((e) => window.addEventListener(e, onTouch, { capture: true, passive: true }));
  const unlisten = () => EV.forEach((e) => window.removeEventListener(e, onTouch, true));
  cleanups.push(unlisten);
  const timer = setTimeout(() => {
    unlisten();
    if (touched || interacted) { ss.set(INTRO_KEY, '1'); return; }
    if (window.scrollY > 40 || modalOpen() || document.visibilityState !== 'visible') return;
    const title = document.querySelector('#gallery h2');
    if (!title) return;
    ss.set(INTRO_KEY, '1');
    const target = () => Math.max(0, title.getBoundingClientRect().top + window.scrollY - 14);
    if (target() - window.scrollY < 60) return;
    let finished = false;
    cleanups.push(glideTo(target, 1700, () => {
      // وصل (مش اتوقف بلمسة): يفضل العنوان في مكانه لو حاجة فوقه اتحمّلت
      if (!finished && Math.abs(target() - window.scrollY) < 6) { finished = true; hold(title, 1500); }
    }));
  }, 1300);
  cleanups.push(() => clearTimeout(timer));
  return () => cleanups.forEach((c) => c());
}
