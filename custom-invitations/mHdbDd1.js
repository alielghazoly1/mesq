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

// ===== أول كارت =====
// - سطر العيلتين (cl1/cl2) أصغر (بطلب المالك) عشان الكلام يكفي الورق من غير ما fitHeroCard
//   يرفع الكارت لفوق ويدخل على الورد.
// - الأسامي بالإنجليزي زي الدعوة الإنجليزي (Dr. Eng. Sameh & Dr. Sara — النصوص في
//   utils/oneOffFixes.js): خط Pinyon Script وعلامة & بخط Cormorant. القالب العربي بيحط
//   .hv-names--ar دايمًا، فهنا بنرجّع مقاسات الإنجليزي (أصغر شوية من 48).
// مقاس من المحرر على السطر نفسه بيكسب، لأن ده على الفقرة/العنوان مش على السطر.
const HERO_CSS = `<style id="mh-hero-css">
body.cl-ar #hv-hero .hv-card .hv-eyebrow{font-size:12.5px!important;line-height:1.75;max-width:262px;margin-left:auto;margin-right:auto;text-wrap:balance}
#hv-hero .hv-card .hv-names.hv-names--ar{font-size:42px;line-height:1.08;-webkit-text-stroke:.35px currentColor;direction:ltr;unicode-bidi:isolate}
#hv-hero .hv-card .hv-names.hv-names--ar .hv-amp{margin:-2px 0 3px}
</style>`;

// ===== من غير "التاريخ — امسح لتكتشف" (بطلب المالك) =====
// قسم الخربشة جزء من أول بلوك (Tilda، طوله ثابت 1162 والخربشة من 782 لتحت). مش بنخبيه
// بس (كان هيسيب فراغ) — البلوك نفسه بيقصر لـ HERO_H، والتدرّج اللي بيدوّب الكتان في لون
// الصفحة بيطلع لفوق عشان يخلص عند الحرف الجديد. الورد اللي تحت (لحد ~804) مابيتقصّش.
// لو القالب اتغيّر ومالقيناش أي حاجة من دول بالظبط، الصفحة بتفضل زي ما هي (والخربشة كمان).
const HERO_H = 810;
const HERO_REC = '<div id="rec2442650993"';
const HERO_AB = 'data-artboard-recid="2442650993" data-artboard-screens="320,480,640,960,1200" data-artboard-height="1162"';
const HERO_FH = 'data-field-height-value="1162"';
const HV_BOX = 'position: relative; width: 440px; height: 1162px; overflow: hidden;';
const NO_SCRATCH_CSS = `<style id="mh-noscratch-css">
#hv-hero .hv-reveal{display:none!important}
#hv-hero .hv-wash{top:${HERO_H - 125}px!important}
</style>`;
function shrinkHero(html) {
  const a = html.indexOf(HERO_REC);
  const b = a === -1 ? -1 : html.indexOf(HERO_AB, a);
  const c = b === -1 ? -1 : html.indexOf(HERO_FH, b);
  const d = html.indexOf(HV_BOX);
  if (a === -1 || b === -1 || c === -1 || d === -1 || d < c || html.indexOf(HV_BOX, d + 1) !== -1) return null;
  const block = html.slice(a, b);
  if ((block.match(/height: 1162px;/g) || []).length !== 4) return null;
  return html.slice(0, a)
    + block.replace(/height: 1162px;/g, `height: ${HERO_H}px;`)
    + HERO_AB.replace('"1162"', `"${HERO_H}"`)
    + html.slice(b + HERO_AB.length, c)
    + `data-field-height-value="${HERO_H}"`
    + html.slice(c + HERO_FH.length, d)
    + HV_BOX.replace('1162px', `${HERO_H}px`)
    + html.slice(d + HV_BOX.length);
}

// ===== التاريخ بخط كبير مكان العدّاد (بطلب المالك) =====
// نفس كارت العدّاد بورده وورقه — الأرقام اللي بتعد والتاريخ الصغير بيستخبوا، ومكانهم
// اليوم والتاريخ كبير (ديسمبر | 25 | 2026 زي أول كارت) وتحتهم الساعة (cl41)، وزرار
// "احفظ الموعد" زي ما هو. التاريخ بيتقري من بيانات الدعوة، فلو اتغيّر من المحرر بيتغيّر هنا.
// الكلاس mh-datecard بيتحط بس لما التاريخ يتبني — غير كده العدّاد بيفضل زي ما هو.
const DATE_CSS = `<style id="mh-datecard-css">
#cd-countdown.mh-datecard .cd-units,#cd-countdown.mh-datecard .cd-date,#cd-countdown.mh-datecard .cd-done{display:none!important}
#cd-countdown.mh-datecard .cd-note{display:block!important;top:286px;font-style:normal!important;font-size:17px!important;line-height:1.5!important}
#cd-countdown .mh-bd{position:absolute;left:0;right:0;top:166px;text-align:center;color:var(--cd-ink)}
#cd-countdown .mh-bd__wd{font:700 21px/1.5 'Amiri',serif;color:var(--cd-soft)}
#cd-countdown .mh-bd__row{display:grid;grid-template-columns:1fr 96px 1fr;align-items:center;margin-top:4px}
#cd-countdown .mh-bd__d{font:500 64px/1.05 'Cormorant Garamond','Times New Roman',serif;font-variant-numeric:lining-nums;border-left:1px solid var(--cd-rule);border-right:1px solid var(--cd-rule);direction:ltr}
#cd-countdown .mh-bd__m,#cd-countdown .mh-bd__y{font:400 21px/1 'Cormorant Garamond','Times New Roman',serif;letter-spacing:.12em;font-variant-numeric:lining-nums}
#cd-countdown .mh-bd__m{justify-self:end;padding-inline-end:16px}
#cd-countdown .mh-bd__y{justify-self:start;padding-inline-start:16px}
body.cl-ar #cd-countdown .mh-bd__m{font:700 22px/1.2 'Amiri',serif;letter-spacing:0}
</style>`;
const DATE_SCRIPT = `<script id="mh-datecard-js">
(function () {
  var root = document.getElementById('cd-countdown');
  var card = root && root.querySelector('.cd-card');
  if (!card || card.querySelector('.mh-bd')) return;
  var C = window.WEDDING_CONFIG || {}, cd = C.countdown || {};
  if (cd.year == null || cd.monthIndex == null || !cd.day) return;
  var ar = (C.language || 'ar') === 'ar';
  var M = ar ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  var D = ar ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var wd = new Date(Date.UTC(cd.year, cd.monthIndex, cd.day)).getUTCDay();
  var el = document.createElement('div');
  el.className = 'mh-bd';
  el.innerHTML = '<p class="mh-bd__wd"></p><div class="mh-bd__row"><span class="mh-bd__m"></span><span class="mh-bd__d"></span><span class="mh-bd__y"></span></div>';
  el.querySelector('.mh-bd__wd').textContent = D[wd];
  el.querySelector('.mh-bd__m').textContent = M[cd.monthIndex];
  el.querySelector('.mh-bd__d').textContent = String(cd.day);
  el.querySelector('.mh-bd__y').textContent = String(cd.year);
  el.setAttribute('aria-label', D[wd] + ' ' + cd.day + ' ' + M[cd.monthIndex] + ' ' + cd.year);
  var orn = card.querySelector('.cd-orn');
  card.insertBefore(el, orn ? orn.nextSibling : null);
  root.classList.add('mh-datecard');
  root.setAttribute('aria-label', el.getAttribute('aria-label'));
})();
</script>`;

// ===== من غير الورد (بطلب المالك) =====
// الورد اللي حوالين أول كارت (cl16 فوق شمال، cl17 فوق يمين، cl18/cl19 تحت) وحوالين كارت
// التاريخ (cl44/cl45) بيستخبى. ظل الورد اللي فوق على الشمال كان مرسوم جوه صورة الخلفية
// نفسها، فلو شلنا الورد بس كان هيفضل ظل رمادي من غير ورد — فالخلفية هنا نسخة من غير الظل
// (scratch mh/deshadow.py: نسيج الكتان من الجزء النضيف من نفس الحيطة، وورق الظرف من جزء
// نضيف منه، والإضاءة متملية ناعمة من الحروف؛ الكارت ماتلمسش).
// loading=lazy على صور الورد المستخبية عشان الموبايل مايحمّلهاش على الفاضي.
const BG_TAG = '<img class="hv-bg" data-elem-id="cl15" src="/templates/champagne-lace/hero-background-extended.webp"';
const FLOWER_TAGS = ['<img class="hv-rose" data-elem-id="cl16"', '<img data-elem-id="cl17"', '<img data-elem-id="cl18"', '<img data-elem-id="cl19"'];
const NO_FLOWERS_CSS = `<style id="mh-noflowers-css">
#hv-hero .hv-rose,#hv-hero .hv-fl,#cd-countdown .cd-fl{display:none!important}
</style>`;
function noFlowers(html) {
  let out = html.replace(BG_TAG, () => `<img class="hv-bg" data-elem-id="cl15" src="${asset(`${DIR}hero-bg.webp`)}"`);
  for (const t of FLOWER_TAGS) out = out.replace(t, () => t.replace('<img ', '<img loading="lazy" '));
  return out;
}

// ===== وردة "مكان الحفل" تحت على الشمال (بطلب المالك) =====
// في القالب الوردة (cl55) نازلة من ركن الخريطة اللي فوق على اليمين. هنا بتتنقل للركن اللي
// تحت على الشمال — مقلوبة 180° (نفس التصميم معكوس بالقطر): التقل بتاعها تحت في الركن
// والفرع طالع لفوق جنب الخريطة. المالك رفعها (top 474→395): بتغطي حتة من شمال الخريطة،
// وتقلها قاعد على ركن الخريطة وطالع عنه سنة لبره وتحت (لحد ~573 من 600).
// الوردة بره القسم جوه #venue (القسم بيقص — overflow:hidden والمسرح 440 أعرض من الموبايل):
// كده بنثبّت حرفها الشمال جوه الشاشة على الموبايلات الضيقة (max 4px)، ولو نزلت تاني تحت
// القسم مش هتتقص. الصفحة LTR ومفيش حاجة بتطلع يمين فمفيش سكرول بالعرض، و#venue فوق القسم
// اللي بعده عشان الورق بتاعه مايغطيش عليها.
// نفس العنصر (cl55) فالمحرر شغال عليه زي ما هو. لو القالب اتغيّر ومالقيناش الوردة أو القسم
// بالظبط، الوردة بتفضل مكانها الأصلي.
const VN_FL_RE = /\n[ \t]*<div class="vn-fl" aria-hidden="true"><div class="vn-fl__sway"><img data-elem-id="cl55"[^>]*><\/div><\/div>/;
const VN_SEC = '<section class="vn" id="vn-venue"';
const VN_FL_CSS = `<style id="mh-vnfl-css">
#venue{position:relative;z-index:2}
#venue>.vn-fl{position:absolute;left:max(4px,calc(50% - 194px));top:395px;width:112px;z-index:3;pointer-events:none}
#venue>.vn-fl .vn-fl__sway{transform-origin:22% 92%;filter:drop-shadow(0 5px 7px rgba(62,48,32,.2))}
#venue>.vn-fl img{filter:none;transform:rotate(180deg)}
#vn-venue[style*="none"]~.vn-fl{display:none!important}
#vn-venue.vn--armed:not(.vn--in)~.vn-fl{opacity:0}
#vn-venue.vn--in~.vn-fl{animation:vn-rise 1.1s cubic-bezier(.2,.7,.2,1) .9s both}
@media (prefers-reduced-motion:reduce){#venue>.vn-fl,#venue>.vn-fl *{animation:none!important;opacity:1!important}}
</style>`;
function moveVenueFlower(html) {
  const m = html.match(VN_FL_RE);
  const s = html.indexOf(VN_SEC);
  if (!m || s === -1 || m.index < s || html.indexOf(VN_SEC, s + 1) !== -1) return null;
  const e = html.indexOf('</section>', s);
  if (e === -1 || m.index > e) return null;
  const cut = html.slice(0, m.index) + html.slice(m.index + m[0].length);
  const e2 = e - m[0].length + '</section>'.length;
  return cut.slice(0, e2) + m[0] + cut.slice(e2);
}

// ===== الأغنية (بطلب المالك 2026-11-08) =====
// الملف اللي المالك بعته (Video_Project_9.m4a من Clipchamp، 1:37) اتحوّل لـ MP3 128k
// (song.mp3، 1.5MB) مكان أغنية القالب. الأغنية اللي كانت مرفوعة من المحرر اتشالت من البيانات
// (utils/oneOffFixes.js: mHdbDd1-song-owner-file) — ولو العميل اختار أغنية تانية من المحرر بعد كده،
// سكريبت التخصيصات بيحط audioUrl بتاعها فوق ده فهي اللي بتشتغل.
const SONG_TAG = '<source src="/templates/champagne-lace/song.mp3" type="audio/mpeg">';

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة (واتساب/إنستجرام/فيسبوك) 1200×630: الباب الكالا موارب على الجنبين
  // وفي النص الختم و"سامح و سارة" والتاريخ والقاعة — كله جوه المربع اللي في النص
  // (x 285–915) عشان واتساب بيقص مربع من النص. اتعمل في scratch mh/share.js.
  // لو اتغيّر: asset() بيغيّر البصمة (?v=) فواتساب يجيب الجديد.
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'سامح و سارة — دعوة زفاف',
    description: 'الجمعة ٢٥ ديسمبر ٢٠٢٦ · الساعة ٨ مساءً · قاعة التوليب — دار الدفاع الجوي، مصر الجديدة',
  },
  render({ editMode } = {}) {
    if (editMode) return {};
    return { head: css(), bodyStart: cover(), bodyEnd: SCRIPT };
  },

  // أول كارت + الخربشة + كارت التاريخ + الورد (في الدعوة والمحرر) — شوف الشرح فوق
  transform(html) {
    const short = shrinkHero(html);
    let out = noFlowers(short || html);
    const moved = moveVenueFlower(out);
    out = moved || out;
    out = out.replace(SONG_TAG, () => `<source src="${asset(`${DIR}song.mp3`)}" type="audio/mpeg">`);
    out = out.replace(/<\/head>/i, () => `${HERO_CSS}${short ? NO_SCRATCH_CSS : ''}${DATE_CSS}${NO_FLOWERS_CSS}${moved ? VN_FL_CSS : ''}</head>`);
    const end = out.lastIndexOf('</body>');
    return end === -1 ? out : out.slice(0, end) + DATE_SCRIPT + out.slice(end);
  },
};
