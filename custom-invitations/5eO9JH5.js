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
  // بعد الفتح ختم القالب الأخضر بيفضل مستخبي: حركة اختفاءه (Tilda) مابتشتغلش
  // مع الضغطة اللي من الكود، فلو رجّعناه كان بيقعد فوق الإيدين في أول صفحة
  function drop() { cov.classList.add('gone'); }
  // المحرر/المعاينة الثابتة بتفتح القالب لوحدها — الغلاف ده مالوش لازمة هناك
  if (C.autoOpen) { drop(); document.documentElement.classList.remove('e5-on'); return; }
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

// ===== أول صفحة زي الصورة اللي المالك بعتها: ورق بملمس، زنبق دهبي، أسامي وتاريخ
// بدهب لامع، والإيدين لوحدهم من غير القوس — الكلام نفسه زي ما هو =====
const GOLD = 'linear-gradient(178deg,#ead08f 0%,#c99d4f 38%,#9c7232 56%,#d4ad62 78%,#b38643 100%)';
function pageCss() {
  return `<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style id="e5-page-css">
#wg-invite-1{background:#f6efdd url(${asset(`${DIR}paper.webp`)}) center top/320px auto repeat}
#wg-invite-1 .names .nm,#wg-invite-1 .names .conn,#wg-invite-1 .names .second,#wg-invite-1 .date,#wg-invite-1 .wday{
  background-image:${GOLD};background-size:100% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;
  padding:.18em .12em;margin:0 -.12em;filter:drop-shadow(0 1px 0 rgba(255,255,255,.55)) drop-shadow(0 1.5px 1.2px rgba(105,72,20,.28))}
#wg-invite #wg-invite-1 .names .amp>.conn{padding-inline-start:.4em}
#wg-invite-1 .date,#wg-invite-1 .wday{background-image:linear-gradient(178deg,#c9a35e,#8f6a2e 60%,#b48b48)}
/* الإيدين على الورق نفسه — من غير القوس الفاتح، أكبر شوية وفي نص المسافة */
/* (بادئة #wg-invite عشان تغلب ستايل القالب اللي بييجي بعدنا في الصفحة) */
#wg-invite #wg-invite-1 .arch{left:12%;width:76%;top:52%;height:auto;border-radius:0;overflow:visible;background:none}
#wg-invite #wg-invite-1 .arch img{width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(90,65,30,.12))}

/* ===== الآية في ظرف الدانتيل (من Champagne Lace) ===== */
#e5-verse{position:relative;width:100%;container-type:inline-size;overflow:hidden;background:#f6efdd url(${asset(`${DIR}paper.webp`)}) center top/320px auto repeat;direction:ltr}
/* الورق المقطوع والورد اللي كانوا تحت أول صفحة (أول الكارت اللي بعدها) — بقوا أول القسم ده
   عشان أول شاشة تفضل زي الصورة بالظبط، والورق بيقع على ورق الآية بضل خفيف */
#e5-verse .strip{display:block;width:100%;height:auto;margin-bottom:-14cqw;position:relative;z-index:2;filter:drop-shadow(0 3px 3px rgba(90,70,40,.16));pointer-events:none}
#e5-verse .in{position:relative;width:100%;max-width:520px;height:min(150cqw,780px);margin:0 auto;container-type:inline-size}
#e5-verse .hr{position:absolute;opacity:0;transform:scale(.6) rotate(-8deg);transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.9,.25,1.2)}
#e5-verse .hr.a{left:39%;top:5%;width:16%}
#e5-verse .hr.b{left:53.5%;top:9.5%;width:10%;transition-delay:.25s}
#e5-verse .env{position:absolute;left:3%;width:94%;top:44cqw;aspect-ratio:1050/1155}
#e5-verse .env img{position:absolute;inset:0;width:100%;height:100%;display:block;-webkit-user-select:none;user-select:none;pointer-events:none}
#e5-verse .env .back{z-index:1}
#e5-verse .env .front{z-index:4}
#e5-verse .card{position:absolute;z-index:3;left:14.05%;width:71.9%;top:10.8%;height:73.8%;background:#fbf8f3;box-shadow:-7px -7px 19px rgba(42,38,38,.09);transform:translateY(0);transition:transform 1.7s cubic-bezier(.3,0,.15,1) .35s}
#e5-verse .card .tx{position:absolute;left:5%;right:5%;top:5.5%;text-align:center;direction:rtl;opacity:0;transition:opacity 1s ease 1.3s}
#e5-verse .bsm{display:block;margin:0 0 .25em;font:400 clamp(17px,5.6cqw,24px)/1.55 'Amiri','Amiri Quran',serif;color:#8a6f4c}
#e5-verse .ay{margin:0;font:400 clamp(15.5px,4.75cqw,21px)/1.95 'Amiri Quran','Amiri',serif;color:#2f2118}
#e5-verse .ay i{font-style:normal;color:#a48c69}
#e5-verse .sr{display:block;margin-top:.55em;font:400 clamp(11.5px,3.3cqw,14px)/1.5 'Amiri',serif;color:#8a7253}
/* لما القسم يبان: القلوب بتظهر والكارت بيطلع من الظرف */
#e5-verse.in-view .hr{opacity:1;transform:none}
#e5-verse.in-view .card{transform:translateY(-29cqw)}
#e5-verse.in-view .card .tx{opacity:1}
@media (prefers-reduced-motion:reduce){#e5-verse *{transition-duration:.01ms!important}}
</style>`;
}

const VERSE = `<section id="e5-verse" aria-label="آية قرآنية">
  <img class="strip" src="${asset(`${DIR}peony-strip.webp`)}" alt="" decoding="async">
  <div class="in">
    <img class="hr a" src="/templates/champagne-lace/heart-large.webp" alt="">
    <img class="hr b" src="/templates/champagne-lace/heart-small.webp" alt="">
    <div class="env">
      <img class="back" src="/templates/champagne-lace/lace-envelope-back.webp" alt="" loading="lazy" decoding="async">
      <div class="card"><div class="tx">
        <span class="bsm" role="img" aria-label="بسم الله الرحمن الرحيم">&#xFDFD;</span>
        <p class="ay"><i>﴿</i>وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم<br>مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا<br>وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً<i>﴾</i></p>
        <span class="sr">سورة الروم - الآية ٢١</span>
      </div></div>
      <img class="front" src="/templates/champagne-lace/lace-envelope-front.webp" alt="" loading="lazy" decoding="async">
    </div>
  </div>
  <script>
  (function () {
    var s = document.getElementById('e5-verse');
    if (!s) return;
    var C = window.WEDDING_CONFIG || {};
    if (C.autoOpen || !('IntersectionObserver' in window)) { s.classList.add('in-view'); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { s.classList.add('in-view'); io.disconnect(); } });
    }, { threshold: 0.28 });
    io.observe(s);
  })();
  </script>
</section>`;

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الظرف والختم والأسامي (بالإنجليزي بالترتيب بتاعهم) والتاريخ
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Orjwan & Dr. Mohammed — دعوة زفاف',
    description: 'الخميس 12.11.2026 · الساعة 7:00 مساءً · قاعة قلوريا',
  },

  render({ editMode } = {}) {
    // في المحرر: غلاف القالب العادي (هو اللي بيتعدّل)
    if (editMode) return {};
    return { head: css(), bodyStart: cover(), bodyEnd: SCRIPT };
  },

  // شكل أول صفحة + قسم الآية (في الدعوة وفي المحرر كمان)
  transform(html) {
    let out = html;
    // الزنبق دهبي والإيدين من غير خلفية القوس (نسخ أوضح)
    out = out.replace('src="/templates/lily-garden/lily-l.webp"', `src="${asset(`${DIR}lily-l-gold.webp`)}"`)
      .replace('src="/templates/lily-garden/lily-r.webp"', `src="${asset(`${DIR}lily-r-gold.webp`)}"`)
      .replace('data-elem-id="lg5" src="/templates/lily-garden/hands.webp"', `data-elem-id="lg5" src="${asset(`${DIR}hands.webp`)}"`);
    // قسم الآية تحت أول صفحة على طول (قبل الكارت)
    out = out.replace('<!-- ===== الصفحة 2 ===== -->', () => `${VERSE}\n                <!-- ===== الصفحة 2 ===== -->`);
    out = out.replace(/<\/head>/i, () => `${pageCss()}</head>`);
    return out;
  },
};
