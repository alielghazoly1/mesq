// 5eO9JH5 — دعوة Lily Garden بغلاف جديد بطلب المالك (2026-11-02): ظرف عاجي بورد بارز
// (أربع قلابات بيتقابلوا في النص) والختم الدهبي في النص. الضغط على الختم/الظرف:
// الختم بيتكسر ويلمع، والقلابات الأربعة بتتفتح لبره (يمين وشمال وفوق وتحت)،
// وفي نفس الضغطة بندوس على ختم القالب نفسه — فالموسيقى وفتح الدعوة والطيور
// والورد بتاعة Lily Garden بيشتغلوا زي ما هم بالظبط.
//
// باقي الدعوة هو القالب نفسه (بيتعدّل من المحرر عادي). في المحرر (?edit / autoOpen)
// الغلاف ده مش بيظهر، عشان التعديل يفضل على غلاف القالب.
// الصور في client/public/custom/5eO9JH5/: env.webp (الظرف) و seal.webp (الختم).
const { asset } = require('./_asset');

const SHORT = '5eO9JH5';
const DIR = `/custom/${SHORT}/`;

// نقطة التقاء القلابات في صورة الظرف (نسبة من العرض/الطول) — اتقاست من الصورة
const TIP_TOP = 47.7;   // سن القلابة اللي فوق
const TIP_BOT = 51.7;   // سن القلابة اللي تحت
// شريط صغير في النص (±W%) بيتقسم بين القلابة اللي فوق واللي تحت بس — عشان اللولية
// اللي في راس السلسلة تمشي مع القلابة اللي فوق كاملة والسلسلة مع اللي تحت
// (من غيره اللولية كانت بتتقسم نصين على قلابتي اليمين والشمال)
const W = 1.8;
const MID = 50.2;
const r2 = (n) => Math.round(n * 100) / 100;
const eT = (x) => r2(TIP_TOP * (x <= 50 ? x : 100 - x) / 50);            // حرف القلابة اللي فوق
const eB = (x) => r2(100 - (100 - TIP_BOT) * (x <= 50 ? x : 100 - x) / 50); // حرف القلابة اللي تحت

function css() {
  const env = asset(`${DIR}env.webp`);
  return `<style id="e5-cover-css">
#e5-cover{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#ece6da;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;touch-action:manipulation}
#e5-cover .bk{position:absolute;inset:-40px;background:url(${env}) center/cover no-repeat;filter:blur(22px) brightness(1.02);opacity:.9}
/* المسرح بنفس نسبة الصورة وبيغطي الشاشة (الموبايل) — على الشاشة العريضة بيبقى بطول الشاشة في النص */
#e5-cover .st{position:absolute;left:50%;top:50%;width:max(100vw,57.6vh);height:max(100vh,173.6vw);transform:translate(-50%,-50%)}
@media (min-aspect-ratio:3/4){#e5-cover .st{width:57.6vh;height:100vh}}
#e5-cover .fl{position:absolute;inset:0;background:url(${env}) center/100% 100% no-repeat;will-change:transform;transition:transform 1.45s cubic-bezier(.66,0,.22,1),filter 1.45s ease}
#e5-cover .fl.t{clip-path:polygon(0 0,100% 0,${50 + W}% ${eT(50 + W)}%,${50 + W}% ${MID}%,${50 - W}% ${MID}%,${50 - W}% ${eT(50 - W)}%);z-index:3;filter:drop-shadow(0 6px 10px rgba(80,60,30,.18))}
#e5-cover .fl.b{clip-path:polygon(0 100%,${50 - W}% ${eB(50 - W)}%,${50 - W}% ${MID}%,${50 + W}% ${MID}%,${50 + W}% ${eB(50 + W)}%,100% 100%);z-index:2}
#e5-cover .fl.l{clip-path:polygon(0 0,${50 - W}% ${eT(50 - W)}%,${50 - W}% ${eB(50 - W)}%,0 100%);z-index:1}
#e5-cover .fl.r{clip-path:polygon(100% 0,${50 + W}% ${eT(50 + W)}%,${50 + W}% ${eB(50 + W)}%,100% 100%);z-index:1}
#e5-cover.open .fl.t{transform:translateY(-104%);transition-delay:.42s}
#e5-cover.open .fl.b{transform:translateY(104%);transition-delay:.42s}
#e5-cover.open .fl.l{transform:translateX(-104%) rotate(-2deg);transition-delay:.3s}
#e5-cover.open .fl.r{transform:translateX(104%) rotate(2deg);transition-delay:.3s}
#e5-cover.open{background:transparent;transition:background-color .6s ease .2s}
#e5-cover.open .bk{opacity:0;transition:opacity .5s ease}
/* الختم */
#e5-cover .seal{position:absolute;left:50%;top:${(TIP_TOP + TIP_BOT) / 2}%;z-index:5;width:min(40vw,190px);aspect-ratio:944/996;transform:translate(-50%,-50%);background:url(${asset(`${DIR}seal.webp`)}) center/contain no-repeat;filter:drop-shadow(0 10px 14px rgba(70,45,10,.38)) drop-shadow(0 2px 3px rgba(70,45,10,.3));animation:e5breath 2.8s ease-in-out infinite}
@keyframes e5breath{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.035)}}
#e5-cover .seal::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(115deg,transparent 35%,rgba(255,244,210,.55) 50%,transparent 65%);background-size:250% 100%;mix-blend-mode:soft-light;animation:e5shine 3.6s ease-in-out infinite}
@keyframes e5shine{0%,40%{background-position:120% 0}80%,100%{background-position:-20% 0}}
#e5-cover.open .seal{animation:e5pop .7s cubic-bezier(.3,0,.2,1) forwards}
@keyframes e5pop{0%{transform:translate(-50%,-50%) scale(1)}25%{transform:translate(-50%,-50%) scale(.9)}100%{transform:translate(-50%,-50%) scale(1.35);opacity:0;filter:blur(3px)}}
#e5-cover .hint{position:absolute;left:0;right:0;bottom:calc(5.5% + env(safe-area-inset-bottom,0px));z-index:6;text-align:center;color:#7a6a4c;font:500 15px/1.4 'Tajawal','El Messiri',system-ui,sans-serif;letter-spacing:.02em;text-shadow:0 1px 6px rgba(255,255,255,.9);animation:e5hint 2.4s ease-in-out infinite}
#e5-cover .hint span{display:inline-block;padding:7px 18px;border-radius:999px;background:rgba(255,253,247,.72);box-shadow:0 6px 18px -10px rgba(90,70,30,.45)}
@keyframes e5hint{0%,100%{opacity:.65}50%{opacity:1}}
#e5-cover.open .hint{opacity:0!important;animation:none;transition:opacity .3s}
#e5-cover .sp{position:absolute;left:50%;top:${(TIP_TOP + TIP_BOT) / 2}%;z-index:7;width:6px;height:6px;margin:-3px;border-radius:50%;background:radial-gradient(circle,#fff3c8,#d2a54a 60%,transparent 72%);opacity:0;pointer-events:none}
#e5-cover.open .sp{animation:e5sp 1.2s ease-out forwards}
@keyframes e5sp{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(1)}}
#e5-cover.gone{display:none}
/* الدعوة عربي بس الأسامي إنجليزي (طلب أصحابها): سطر الأسامي يتقري شمال→يمين زي
   النسخة الإنجليزي ("Orjwan &" فوق و"Dr. Mohammed" تحت) مش "& Orjwan" */
#wg-invite.wg-rtl #wg-invite-1 .names{direction:ltr}
#wg-invite.wg-rtl #wg-invite-1 .names .amp>.conn{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:500;font-size:.62em;vertical-align:.18em}
#wg-invite.wg-rtl [data-elem-id="lg26"]{direction:ltr;unicode-bidi:isolate}
/* ختم القالب نفسه مستخبي (بندوس عليه من الكود بس) — عشان مايبانش ختمين */
html.e5-on .popup-enter{opacity:0!important}
@media (prefers-reduced-motion:reduce){#e5-cover .fl{transition-duration:.01ms!important}#e5-cover *{animation-duration:.01ms!important}}
</style>`;
}

function cover() {
  let sp = '';
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.3;
    const r = 80 + (i * 37) % 120;
    sp += `<i class="sp" style="--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;animation-delay:${((i * 7) % 20) / 100}s"></i>`;
  }
  return `<div id="e5-cover" role="button" tabindex="0" aria-label="Open">
<div class="bk"></div>
<div class="st"><div class="fl l"></div><div class="fl r"></div><div class="fl b"></div><div class="fl t"></div><div class="seal"></div>${sp}</div>
<div class="hint"><span id="e5-hint">اضغط على الختم لفتح الدعوة</span></div>
</div>
<script>document.documentElement.classList.add('e5-on');</script>`;
}

const SCRIPT = `<script>
(function () {
  var cov = document.getElementById('e5-cover');
  if (!cov) return;
  var C = window.WEDDING_CONFIG || {};
  function drop() { cov.classList.add('gone'); document.documentElement.classList.remove('e5-on'); }
  // المحرر/المعاينة الثابتة بتفتح القالب لوحدها — الغلاف ده مالوش لازمة هناك
  if (C.autoOpen) { drop(); return; }
  if ((C.language || '') !== 'ar') {
    var h = document.getElementById('e5-hint');
    if (h) h.textContent = 'Tap the seal to open';
    cov.setAttribute('aria-label', 'Tap the seal to open');
  }
  var done = false;
  function pressTemplateSeal(tries) {
    var s = document.querySelector('.popup-enter');
    if (s) { s.click(); return; }
    if (tries < 60) setTimeout(function () { pressTemplateSeal(tries + 1); }, 100);
  }
  function open() {
    if (done) return;
    done = true;
    // نفس الضغطة: ختم القالب (الموسيقى + فتح الدعوة) — لازم جوه ضغطة الضيف عشان الآيفون يشغّل الصوت
    pressTemplateSeal(0);
    cov.classList.add('open');
    setTimeout(drop, 2100);
  }
  cov.addEventListener('click', open);
  cov.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
})();
</script>`;

module.exports = {
  shortId: SHORT,

  render({ editMode } = {}) {
    // في المحرر: غلاف القالب العادي (هو اللي بيتعدّل)
    if (editMode) return {};
    return { head: css(), bodyStart: cover(), bodyEnd: SCRIPT };
  },
};
