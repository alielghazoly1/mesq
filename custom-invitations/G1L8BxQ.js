// G1L8BxQ — دعوة Lily Garden (شكل القالب زي ما هو) لأرجوان ود. محمد بطلب المالك (2026-11-02):
// - الإيدين: صورة المالك (من غير خلفيتها) على نفس لون خلفية القوس.
// - الآية في ظرف الدانتيل تحت أول صفحة، والكارت الأبيض بيطلع من الظرف مع السكرول
//   (زي 5eO9JH5) — ومابيعدّيش الظرف.
// - الكارت: الدعوة بس (الموعد والمكان في الصفحة اللي بعدها، من غير إنجليزي).
// - تحت الخريطة على طول: "جنة الأطفال منازلهم" — صورة المالك زي ما هي.
// - مفيش تأكيد حضور ولا صور ضيوف (hiddenSections في utils/oneOffFixes.js).
// البيانات والنصوص نفسها في utils/oneOffFixes.js (G1L8BxQ-orjwan-mohammed).
const { asset } = require('./_asset');

const SHORT = 'G1L8BxQ';
const DIR = `/custom/${SHORT}/`;

function pageCss() {
  return `<link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style id="g1-css">
/* الأسامي إنجليزي في دعوة عربي: "Orjwan &" فوق و"Dr. Mohammed" تحت زي النسخة الإنجليزي */
#wg-invite.wg-rtl #wg-invite-1 .names{direction:ltr}
#wg-invite.wg-rtl #wg-invite-1 .names .amp>.conn{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:500;font-size:.62em;vertical-align:.18em}
#wg-invite.wg-rtl [data-elem-id="lg26"]{direction:ltr;unicode-bidi:isolate}

/* الكارت: الدعوة بس — التاريخ والساعة والمكان اتنقلوا للموعد والمكان */
#wg-invite #wg-invite-2 [data-elem-id="lg42"],#wg-invite #wg-invite-2 [data-elem-id="lg43"],#wg-invite #wg-invite-2 [data-elem-id="lg44"],
#wg-invite #wg-invite-2 [data-elem-id="lg12"],#wg-invite #wg-invite-2 .end{display:none!important}
#wg-invite.wg-rtl #wg-invite-2 .body{font-family:'Amiri',serif;font-size:5.3cqw;line-height:1.9;letter-spacing:0;font-weight:700;margin-top:8cqw}
#wg-invite.wg-rtl #wg-invite-2 .fam{font-family:'Amiri',serif;font-size:5.4cqw;letter-spacing:0;margin-top:4cqw}

/* ===== الآية في ظرف الدانتيل (زي 5eO9JH5) ===== */
#g1-verse{position:relative;width:100%;container-type:inline-size;overflow:hidden;background:#f6efdd;direction:ltr}
/* الورق المقطوع والورد اللي تحت أول صفحة — نسخة منهم أول القسم عشان أول شاشة تفضل زي ما هي */
#g1-verse .strip{display:block;width:100%;height:auto;margin-bottom:-14cqw;position:relative;z-index:2;filter:drop-shadow(0 3px 3px rgba(90,70,40,.16));pointer-events:none}
#g1-verse .in{position:relative;width:100%;max-width:520px;height:min(150cqw,780px);margin:0 auto;container-type:inline-size}
#g1-verse .hr{position:absolute;opacity:0;transform:scale(.6) rotate(-8deg);transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.9,.25,1.2)}
#g1-verse .hr.a{left:39%;top:5%;width:16%}
#g1-verse .hr.b{left:53.5%;top:9.5%;width:10%;transition-delay:.25s}
#g1-verse .env{position:absolute;left:3%;width:94%;top:44cqw;aspect-ratio:1050/1155}
#g1-verse .env img{position:absolute;inset:0;width:100%;height:100%;display:block;-webkit-user-select:none;user-select:none;pointer-events:none}
#g1-verse .env .back{z-index:1}
#g1-verse .env .front{z-index:4}
/* الكارت مربوط بالسكرول: --p من 0 (جوه الظرف) لـ 1 (طالع لفوق ورجله لسه جوه الظرف) */
#g1-verse .card{--p:0;position:absolute;z-index:3;left:14.05%;width:71.9%;top:10.8%;height:73.8%;background:#fbf8f3;box-shadow:-7px -7px 19px rgba(42,38,38,.09);transform:translateY(calc(26cqw - var(--p) * 55cqw));will-change:transform}
#g1-verse .card .tx{position:absolute;left:5%;right:5%;top:5.5%;text-align:center;direction:rtl;opacity:calc(var(--p) * 1.6 - .25)}
#g1-verse .bsm{display:block;margin:0 0 .25em;font:400 clamp(17px,5.6cqw,24px)/1.55 'Amiri','Amiri Quran',serif;color:#8a6f4c}
#g1-verse .ay{margin:0;font:400 clamp(15.5px,4.75cqw,21px)/1.95 'Amiri Quran','Amiri',serif;color:#2f2118}
#g1-verse .ay i{font-style:normal;color:#a48c69}
#g1-verse .sr{display:block;margin-top:.55em;font:400 clamp(11.5px,3.3cqw,14px)/1.5 'Amiri',serif;color:#8a7253}
#g1-verse.in-view .hr{opacity:1;transform:none}

/* ===== جنة الأطفال منازلهم — صورة المالك زي ما هي، تحت الخريطة على طول ===== */
#g1-kids{background:#f3ebd7;padding:0 0 18px;text-align:center}
/* خلفية الصورة اتظبطت على لون القسم (#f3ebd7) وحوافها بتروح فيه — مفيش مربع باين */
#g1-kids img{display:block;width:100%;max-width:520px;height:auto;margin:0 auto}
@media (prefers-reduced-motion:reduce){#g1-verse *{transition-duration:.01ms!important}}
</style>`;
}

const VERSE = `<section id="g1-verse" aria-label="آية قرآنية">
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
    var s = document.getElementById('g1-verse');
    if (!s) return;
    var C = window.WEDDING_CONFIG || {};
    var card = s.querySelector('.card'), env = s.querySelector('.env');
    // المحرر: الكارت طالع على طول عشان الكلام يبان
    if (C.autoOpen) { s.classList.add('in-view'); card.style.setProperty('--p', '1'); return; }
    var cur = 0, want = 0, raf = 0;
    function target() {
      var r = env.getBoundingClientRect(), vh = window.innerHeight || 800;
      // بيبدأ يطلع لما الظرف يدخل الشاشة، وبيكمل لما يوصل لنصها تقريبًا
      return Math.max(0, Math.min(1, (vh * 0.95 - r.top) / (vh * 0.55)));
    }
    function frame() {
      raf = 0;
      cur += (want - cur) * 0.22;            // نعومة: الكارت بيلحق السكرول بهدوء
      if (Math.abs(want - cur) < 0.002) cur = want; else raf = requestAnimationFrame(frame);
      card.style.setProperty('--p', cur.toFixed(4));
      if (cur > 0.05) s.classList.add('in-view');
    }
    function onScroll() { want = target(); if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();
  </script>
</section>`;

const KIDS = `<section id="g1-kids" aria-label="جنة الأطفال منازلهم">
  <img src="${asset(`${DIR}kids.webp`)}" alt="جنة الأطفال منازلهم — عذرًا إدارة الصالة تمنع اصطحاب الأطفال منعًا باتًا" width="1584" height="1536" loading="lazy" decoding="async">
</section>`;

module.exports = {
  shortId: SHORT,

  share: {
    title: 'Orjwan & Dr. Mohammed — دعوة زفاف',
    description: 'الخميس 12/11/2026 · الساعة 7:30 مساءً · قاعة قلوريا',
  },

  // مفيش غلاف خاص — ظرف القالب زي ما هو؛ التعديلات كلها في transform
  render() { return {}; },

  transform(html) {
    let out = html;
    out = out.replace('data-elem-id="lg5" src="/templates/lily-garden/hands.webp"', `data-elem-id="lg5" src="${asset(`${DIR}hands.webp`)}"`);
    out = out.replace('<!-- ===== الصفحة 2 ===== -->', () => `${VERSE}\n                <!-- ===== الصفحة 2 ===== -->`);
    out = out.replace('<!-- ===== تأكيد الحضور ===== -->', () => `${KIDS}\n                <!-- ===== تأكيد الحضور ===== -->`);
    out = out.replace(/<\/head>/i, () => `${pageCss()}</head>`);
    return out;
  },
};
