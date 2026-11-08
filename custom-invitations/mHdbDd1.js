// custom-invitations/mHdbDd1.js
// دعوة Champagne Lace بغلاف جديد بطلب المالك (2026-11-08): الباب الأبيض اللي
// عليه زنبق الكالا البارز والختم الدهبي في النص — الصورة اللي بعتها بالظبط.
//
// الضغط: الختم بيعمل زوم بسيط ويختفي، وبعدين الضلفتين بيتفتحوا من النص
// لبره ناحية الضيف بهدوء (نور دافي من الفتحة والكاميرا بتقرّب سنة)، والدعوة بتبان وراهم.
// وفي نفس الضغطة بندوس على ختم القالب المستخبي (الموسيقى + فتح الدعوة).
//
// الصور في client/public/custom/mHdbDd1/ (scratch mh/: up.py ESRGAN 2x، clean.py
// LaMa شال الختم من الباب ورجّع خط النص، ext.py مدّ الحرف اللي فوق واللي تحت
// عشان الموبايلات الطويلة):
//   door-l.webp / door-r.webp — كل ضلفة 564×2604 (الصورة الأصلية 1992 صف في النص
//   + 306 صف امتداد فوق وتحت). seal.webp — الختم لوحده بحرف ناعم.
// الغلاف مش بيظهر في المحرر.
const { asset } = require('./_asset');

const SHORT = 'mHdbDd1';
const DIR = `/custom/${SHORT}/`;
const COVER_REC = 'rec2442650973'; // غلاف الظرف في القالب (views/champagne-lace.html)

// المسرح بنسبة الضلفتين جنب بعض (1128×2604). الصورة الأصلية من غير الامتداد = 1992 صف.
const AR = 1128 / 2604;          // 0.4332 — أطول من كده الجنب بيتقص سنة
const FULL = 1128 / 1992;        // 0.5663 — الشاشة أعرض من كده: الباب كله بطول الشاشة
const WMIN = (AR * 100).toFixed(2);                // vh
const WMAX = (FULL * 100).toFixed(2);              // vh
// الختم بوحدات المسرح
const SEAL = { l: 446 / 11.28, t: 1204 / 26.04, w: 224 / 11.28, h: 222 / 26.04 };

function css() {
  const L = asset(`${DIR}door-l.webp`);
  return `<style id="mh-cover-css">
#${COVER_REC} .t396__artboard,#${COVER_REC} .t396__artboard *{visibility:hidden!important;pointer-events:none!important;opacity:0!important}
html.mh-lock,html.mh-lock body{overflow:hidden!important;height:100%}
#mh-cover{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:pointer;background:#e7e1d7;-webkit-tap-highlight-color:transparent;outline:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}
/* الشاشات العريضة: نفس الباب مغبّش على الجنبين */
#mh-cover .bk{position:absolute;inset:-60px;background:url(${L}) center/cover no-repeat;filter:blur(30px) brightness(.97);opacity:.85}
#mh-cover .st{position:absolute;left:50%;top:50%;width:max(100vw,${WMIN}vh);aspect-ratio:1128/2604;transform:translate(-50%,-50%);perspective:1150px;perspective-origin:50% 47%}
#mh-cover .cam{position:absolute;inset:0;transform-style:preserve-3d;transform-origin:50% 49%}
/* نور دافي ورا الضلفتين — بيبان من الفتحة */
#mh-cover .glow{position:absolute;inset:0;opacity:0;transform:translateZ(-900px) scale(1.6);background:radial-gradient(ellipse 34% 40% at 50% 49%,rgba(255,251,240,.95),rgba(255,238,206,.5) 50%,rgba(255,230,190,0) 80%)}
#mh-cover .lf{position:absolute;top:0;width:50%;height:100%;transform-style:preserve-3d;backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform}
#mh-cover .lf img{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none;backface-visibility:hidden;-webkit-backface-visibility:hidden}
#mh-cover .lf.l{left:0;transform-origin:0 50%}
#mh-cover .lf.r{left:50%;transform-origin:100% 50%}
#mh-cover .lf i{position:absolute;inset:0;opacity:0;pointer-events:none}
#mh-cover .lf.l i{background:linear-gradient(90deg,rgba(70,55,35,.34),rgba(70,55,35,.08))}
#mh-cover .lf.r i{background:linear-gradient(270deg,rgba(70,55,35,.34),rgba(70,55,35,.08))}
/* الموبايل: الباب بعرض الشاشة دايمًا (الشاشات القصيرة بيتقص من فوق وتحت سنة).
   الشاشات العريضة/اللابتوب: الباب كله بطول الشاشة في النص والجنبين مغبّشين */
@media (min-aspect-ratio:3/4){#mh-cover .st{width:${WMAX}vh}}
/* خيط نور في الفاصل لحظة ما الختم يختفي */
#mh-cover .line{position:absolute;left:50%;top:6%;bottom:6%;width:2px;margin-left:-1px;opacity:0;background:linear-gradient(180deg,transparent,rgba(255,247,226,.95) 25%,rgba(255,247,226,.95) 75%,transparent);box-shadow:0 0 10px 1px rgba(255,236,196,.8)}
#mh-cover .seal{position:absolute;z-index:3;left:${SEAL.l.toFixed(3)}%;top:${SEAL.t.toFixed(3)}%;width:${SEAL.w.toFixed(3)}%;height:${SEAL.h.toFixed(3)}%;
  background:url(${asset(`${DIR}seal.webp`)}) center/100% 100% no-repeat;filter:drop-shadow(0 3px 5px rgba(90,70,40,.22));animation:mhBreath 3.2s ease-in-out infinite}
/* لمعة خفيفة بتعدّي على الختم كل شوية — بتقول للضيف "اضغط هنا" من غير كلام */
#mh-cover .seal::after{content:"";position:absolute;inset:4%;border-radius:50%;background:linear-gradient(115deg,transparent 38%,rgba(255,248,226,.55) 50%,transparent 62%);background-size:260% 100%;mix-blend-mode:soft-light;animation:mhShine 4.2s ease-in-out 1s infinite}
@keyframes mhBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
@keyframes mhShine{0%,45%{background-position:130% 0}85%,100%{background-position:-30% 0}}
/* ===== الفتح ===== */
#mh-cover.go{cursor:default}
#mh-cover.go .seal{animation:mhSeal .95s cubic-bezier(.33,0,.2,1) forwards}
#mh-cover.go .seal::after{animation:none;opacity:0}
@keyframes mhSeal{0%{transform:scale(1);opacity:1;filter:drop-shadow(0 3px 5px rgba(90,70,40,.22))}
  45%{transform:scale(1.12);opacity:1;filter:drop-shadow(0 10px 16px rgba(90,70,40,.3)) brightness(1.06)}
  100%{transform:scale(1.2);opacity:0;filter:drop-shadow(0 12px 18px rgba(90,70,40,0)) blur(4px)}}
#mh-cover.go .line{animation:mhLine 1s ease-out .7s forwards}
@keyframes mhLine{0%{opacity:0}35%{opacity:1}100%{opacity:0}}
/* الضلفتين بيتفتحوا لبره (ناحية الضيف) — بداية هادية ونهاية ناعمة طويلة */
#mh-cover.go .lf.l{animation:mhL 2.8s cubic-bezier(.5,0,.18,1) .9s forwards}
#mh-cover.go .lf.r{animation:mhR 2.8s cubic-bezier(.5,0,.18,1) .9s forwards}
@keyframes mhL{0%{transform:rotateY(0)}100%{transform:rotateY(-96deg)}}
@keyframes mhR{0%{transform:rotateY(0)}100%{transform:rotateY(96deg)}}
#mh-cover.go .lf i{animation:mhShade 2.4s ease-in-out .9s forwards}
@keyframes mhShade{to{opacity:1}}
#mh-cover.go .glow{animation:mhGlow 2.6s ease-in-out .85s forwards}
@keyframes mhGlow{0%{opacity:0}35%{opacity:1}100%{opacity:0}}
#mh-cover.go .cam{animation:mhCam 3s cubic-bezier(.5,0,.25,1) .8s forwards}
@keyframes mhCam{to{transform:scale(1.09)}}
/* الخلفية بتختفي مع بداية الفتح عشان الدعوة تبان من الفتحة */
#mh-cover.go{background-color:transparent;transition:background-color .5s ease .9s}
#mh-cover.go .bk{opacity:0;transition:opacity .8s ease 1s}
#mh-cover.out{opacity:0;transition:opacity .55s ease}
#mh-cover.done{display:none}
@media (prefers-reduced-motion:reduce){
  #mh-cover .seal,#mh-cover .seal::after{animation:none}
  #mh-cover.go .lf,#mh-cover.go .cam,#mh-cover.go .glow,#mh-cover.go .line,#mh-cover.go .lf i{animation:none}
  #mh-cover.go{opacity:0;transition:opacity .6s ease}
}
</style>`;
}

function cover() {
  return `<div id="mh-cover" role="button" tabindex="0" aria-label="Open the invitation">
<div class="bk"></div>
<div class="st"><div class="cam">
<div class="glow"></div>
<div class="lf l"><img src="${asset(`${DIR}door-l.webp`)}" alt="" fetchpriority="high" decoding="async"><i></i></div>
<div class="lf r"><img src="${asset(`${DIR}door-r.webp`)}" alt="" fetchpriority="high" decoding="async"><i></i></div>
<div class="line"></div>
<div class="seal"></div>
</div></div>
</div>
<script>document.documentElement.classList.add('mh-lock');</script>`;
}

const SCRIPT = `<script>
(function () {
  var cov = document.getElementById('mh-cover');
  if (!cov) return;
  var root = document.documentElement;
  var C = window.WEDDING_CONFIG || {};
  // المحرر/المعاينة الثابتة بتفتح القالب لوحدها — الغلاف مالوش لازمة هناك
  if (C.autoOpen) { cov.classList.add('done'); root.classList.remove('mh-lock'); return; }
  var opened = false;
  function finish() { root.classList.remove('mh-lock'); cov.classList.add('done'); try { window.scrollTo(0, 0); } catch (e) {} }
  function open() {
    if (opened) return;
    opened = true;
    // جوه ضغطة الضيف نفسها: ختم القالب (الموسيقى + فتح الدعوة) — عشان الآيفون يشغّل الصوت
    try { var s = document.querySelector('.popup-enter'); if (s) s.click(); } catch (e) {}
    cov.classList.add('go');
    // الكارت الأول يبدأ يظهر والضلفتين بيتفتحوا
    setTimeout(function () { var h = document.getElementById('hv-hero'); if (h) h.classList.add('hv--play'); }, 1500);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () { cov.classList.add('out'); }, reduce ? 0 : 3300);
    setTimeout(finish, reduce ? 650 : 3900);
  }
  cov.addEventListener('click', open);
  cov.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
})();
</script>`;

module.exports = {
  shortId: SHORT,
  render({ editMode } = {}) {
    if (editMode) return {};
    return { head: css(), bodyStart: cover(), bodyEnd: SCRIPT };
  },

  // كارت الآية فيه دعاء "بارك الله لكما..." (كلام كارت العيلة — utils/oneOffFixes.js:
  // mHdbDd1-sameh-sara) مش آية، فالأقواس القرآنية ﴿ ﴾ وسطر "سورة الروم - الآية ٢١"
  // بيتشالوا (في الدعوة والمحرر)
  transform(html) {
    return html
      .replace('<span style="color:#a48c69;">﴿</span>', '')
      .replace('<span style="color:#a48c69;">﴾</span>', '')
      .replace("<div class='tn-atom' field='tn_text_1705235414678'>سورة الروم - الآية ٢١</div>", "<div class='tn-atom' field='tn_text_1705235414678'></div>");
  },
};
