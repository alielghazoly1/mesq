// تأكيد زيارة لينك الإعلان — الخطوة التانية من عدّ زوار الإعلانات.
//
// /go/<code> بيحط علامة قصيرة العمر (mithaq_cmp_v) على الجهاز. هنا بنأكّد إن
// الصفحة اتفتحت فعلًا قدام شخص: ظاهرة على الشاشة 3 ثواني على الأقل، وحصلت
// منه حركة (سكرول/لمس/ضغطة/كيبورد) أو فضلت ظاهرة 10 ثواني. غير كده الزيارة
// ماتتحسبش — وده اللي بيشيل من الأرقام مراجعة إنستجرام وفيسبوك للإعلان،
// والتحميل المسبق للصفحة، والبرامج اللي بتفتح اللينك ومحدش بيشوفه.
const FLAG = 'mithaq_cmp_v';
const MIN_VISIBLE_MS = 3000;
const NO_INTERACTION_MS = 10000;
const GIVE_UP_MS = 120000;

export function startCampaignBeacon() {
  try {
    if (typeof document === 'undefined') return;
    if (!new RegExp('(?:^|; )' + FLAG + '=').test(document.cookie)) return;
    // متصفح متحكّم فيه ببرنامج (أدوات فحص/روبوتات) — مش شخص
    if (navigator.webdriver) return;

    let visibleMs = 0;
    let last = Date.now();
    let interacted = false;
    let done = false;
    const started = Date.now();
    const events = ['scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel'];
    const onAct = () => { interacted = true; };
    events.forEach((e) => window.addEventListener(e, onAct, { passive: true, capture: true }));

    const stop = () => {
      done = true;
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, onAct, { capture: true }));
    };
    const timer = setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === 'visible') visibleMs += now - last;
      last = now;
      if (done) return;
      if (visibleMs >= MIN_VISIBLE_MS && (interacted || visibleMs >= NO_INTERACTION_MS)) {
        stop();
        // العلامة بتتمسح بعد ما الطلب يوصل (السيرفر بيمسحها هو كمان) — لو اتمسحت
        // قبل ما الطلب يطلع، المتصفح بيبعته من غيرها والزيارة ماتتأكدش
        const clear = () => { document.cookie = FLAG + '=; Max-Age=0; path=/'; };
        fetch('/api/campaign-seen', { method: 'POST', credentials: 'include', keepalive: true }).then(clear, clear);
      } else if (now - started > GIVE_UP_MS) {
        stop();
      }
    }, 400);
  } catch {
    /* العدّ مايوقّعش الموقع أبدًا */
  }
}
