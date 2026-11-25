// دعوة ErcJsBi (Mother of Pearl) — خطوبة Azad & Najbir، السبت 26/12/2026 من 15:00 حتى 00:00. بطلب المالك (2026-11-25):
//  • لونين الكارت من جوه وردي هادي (زي الصور اللي بعتها — ورق بيج وردي وزخارف وردي، الكلام موف غامق):
//    hero-frame + countdown-frame متلوّنين (scratch erc/) و --bg/--fg.
//  • نسختين عربي وكردي (كرمانجي) وزرار فوق على اليمين بيبدّل بينهم (الاختيار بيتحفظ؛ ?lang=ku يفتح كردي).
//  • الكلام = جمل المالك بس (ورقته): البسملة، الحمد لله، الدعوة، "سنكون في غاية الفرح…"، "لكم الفرحة ولنا العمر سوياً".
//    باقي جمل القالب اتشالت؛ الصور والدريس كود وتأكيد الحضور مستخبيين. المكان: Am Eisenwerk 18, Hannover
//    (oneOffFix ErcJsBi-azad-najbir)، والعدّاد بتوقيت ألمانيا.
const { asset } = require('./_asset');
const { makeOneVideo } = require('./_oneVideo');

const SHORT = 'ErcJsBi';
const T = '/templates/mother-of-pearl/';
const DIR = `/custom/${SHORT}/`;
const oneVideo = makeOneVideo({ short: 'mother-of-pearl', openSrc: asset(`${T}open.mp4`), bps: 253000, dur: 10.08 });
const HERO = asset(`${DIR}hero-frame.webp`);
// (المالك 2026-11-25) أسامي العرسان بالعربي = خط رقم 10 (الفرشاة) من صورة المالك نفسها، مقصوصة ومتلوّنة موف (scratch erc/brush)
const NMI = { g: asset(`${DIR}g_azad.webp`), b: asset(`${DIR}g_najbir.webp`) };
const CDF = asset(`${DIR}countdown-frame.webp`);

// [عربي, كردي]
const TX = {
  bism: ['بسم الله الرحمن الرحيم', 'Bi navê Xwedayê dilovan û dilovîn'],
  hamd: ['الحمد لله الذي بنعمته تتم الصالحات', 'Spasî ji bo wî Xwedayê ku bi nîmata wî qancîkarî (xêrxwazî) temam dibin.'],
  inv: ['بكل سرور وفخر ندعوكم لحضور حفل خطوبة', 'Em bi dilxweşî û şanazî we vedixwînin ahenga nîşankirina'],
  when: ['يوم السبت 26.12.2026<br>من الساعة 15:00 حتى 00:00<br>في Am Eisenwerk 18، هانوفر', 'ku dê roja Şemiyê, Dem 26.12.2026,<br>Demjimêr 15:00 – 00:00<br>li Am Eisenwerk 18, Hannover bê lidarxistin.'],
  venueT: ['مكان الحفل', 'Cihê ahengê'],
  venueW: ['السبت 26.12.2026 | 15:00 – 00:00', 'Şemî 26.12.2026 | 15:00 – 00:00'],
  map: ['افتح اللوكيشن', 'Cih li ser nexşeyê'],
  // (المالك 2026-11-25) أسامي الوالدين فوق أسامي العرسان — بالعربي "الوالد …"، وبالكردي زي ما بعتها
  // (المالك 2026-11-25) أسامي العرسان: في العربي بالعربي بخط الرقعة، وفي الكردي بالإنجليزي (Cormorant)
  g: ['آزاد', 'Azad'],
  b: ['نجبير', 'Najbir'],
  amp: ['و', '&amp;'],
  // (المالك 2026-11-25) "السيد الوالد" قبل اسم كل أب — بالكردي Bavê birêz
  dad1: ['السيد الوالد نزار عيسى', '<em>Bavê birêz</em>Nizar Issa'],
  dad2: ['السيد الوالد رضوان حسين', '<em>Bavê birêz</em>Radwan Hussain'],
  // (المالك 2026-11-25) جملة أول صفحة الجديدة (عربي + كردي من المالك)
  joy: ['الحمد لله الذي جمع بين القلوب بالمودة والرحمة، ونسأله أن يتمم فرحتنا على خير', 'Spas ji Xwedê re ku dil bi hezkirin û dilovaniyê gihandin hev, û em jê dixwazin ku şahiya me bi xêrê temam bike.'],
  day: ['يوم السبت', 'Roja Şemiyê'],
  close1: ['سنكون في غاية الفرح والسعادة بمشاركتكم', 'Em ê bi beşdarbûna we şad û bextewar bibin.'],
  // (المالك 2026-11-25) العدّاد بالإنجليزي في العربي؛ في الكردي العنوان كردي و"Em bi kelecan…" (جملة المالك)
  cdTitle: ['Countdown', 'Heta roja me'],
  soon: ['See you soon', 'Em bi kelecan li benda dîtina we ne'],
  tap: ['اضغط لفتح الدعوة', 'Ji bo vekirinê bitikîne'],
  cdl: [['Days', 'Hours', 'Minutes', 'Seconds'], ['Days', 'Hours', 'Minutes', 'Seconds']],
};
const nm = (k) => `<img class="ek-ar ek-ni ek-ni-${k}" src="${NMI[k]}" alt="${TX[k][0]}" draggable="false"><span class="ek-ku">${TX[k][1]}</span>`;
const bi = (k) => `<span class="ek-ar">${TX[k][0]}</span><span class="ek-ku">${TX[k][1]}</span>`;

const HEAD = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap">
<script>(function () {
  var q = /[?&]lang=(ku|ar)/.exec(location.search), s = null;
  try { s = localStorage.getItem('ek_lang_${SHORT}'); } catch (e) {}
  var l = q ? q[1] : (s || 'ar');
  if (l === 'ku') { document.documentElement.classList.add('ek-ku'); document.documentElement.dir = 'ltr'; document.documentElement.lang = 'ku'; }
})();</script>
<style id="ek-css">
:root{--bg:#dacac0;--bg-rgb:218,202,192;--fg:#6e4c50;--fg-rgb:110,76,80;--rose:#c59a94;--rose-rgb:197,154,148}
/* (المالك 2026-11-25، الجولة 2) ألوان صورته: ورق بيج رمادي دافي، زخارف وردي باهت، لؤلؤ أبيض، كلام موف غامق */
.cd-title,.cd-soon{color:var(--fg)!important}
/* زرار اللوكيشن: لؤلؤي بحرف وردي بدل البلوك الغامق */
.btn-map>span{border-color:rgba(var(--rose-rgb),.9)!important;border-radius:40px}
.btn-map>span>span{background:linear-gradient(180deg,#fbf6f3,#efe3de)!important;color:var(--fg)!important;border-color:rgba(var(--rose-rgb),.55)!important;border-radius:36px;box-shadow:0 8px 20px -12px rgba(110,76,80,.5)}
.btn-map:hover>span>span{background:var(--fg)!important;color:#fbf6f3!important}
.btn-map .b-pin{filter:saturate(.35) hue-rotate(-10deg)}
html:not(.ek-ku) .ek-ku,html.ek-ku .ek-ar{display:none!important}
.ek-ar{font-family:'Amiri','Amiri Ar Local',serif;letter-spacing:0}
.ek-ku{font-family:'Cormorant Garamond',serif;letter-spacing:.01em}
/* أسامي الكارت الأول: نفس الخط المزخرف في اللغتين */
.ht-names h1,.ft-nm{font-family:'Cormorant Garamond',serif!important;font-weight:500!important;letter-spacing:.04em!important}
/* (المالك 2026-11-25) أسامي العرسان بالإنجليزي بخط واضح يتقري (Cormorant) بدل الخط المزخرف */
.ht-names h1{font-size:calc(46px*var(--fit,1))!important;line-height:1.15!important}
.ht-of{display:none!important}
.ht-with{font-style:normal!important}
.ht-with{max-width:250px;margin-left:auto!important;margin-right:auto!important}
.ht-with .ek-ar{display:block;font-size:15.5px;line-height:1.85}
.ht-with .ek-ku{display:block;font-style:italic;font-size:15px;line-height:1.5}
/* كارت كلام الدعوة (جمل المالك) */
.ekw{padding:70px 26px 40px;text-align:center;color:var(--fg)}
.ekw-in{position:relative;max-width:420px;margin:0 auto;padding:38px 24px;border:1px solid rgba(var(--rose-rgb),.75);outline:1px solid rgba(var(--rose-rgb),.4);outline-offset:6px;background:rgba(251,246,243,.5);box-shadow:0 10px 30px -18px rgba(110,76,80,.35)}
.ekw-in::before,.ekw-in::after{content:"";position:absolute;left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0,#f6eeea 35%,#d9c9c3 75%,#bfaaa4 100%);box-shadow:0 1px 2px rgba(110,76,80,.35)}
.ekw-in::before{top:-13px}.ekw-in::after{bottom:-13px}
.ekw p{margin:0}
.ekw .b{font-size:24px;line-height:1.7}
.ekw .b .ek-ku{font-size:21px;font-style:italic}
.ekw .h{margin-top:14px;font-size:19px;line-height:1.8}
.ekw .h .ek-ku{font-size:19px;line-height:1.5}
.ekw .i{margin-top:20px;font-size:19px;line-height:1.8}
.ekw .i .ek-ku{font-size:19px;line-height:1.5}
.ekw .n{margin-top:18px;display:flex;align-items:flex-end;justify-content:center;gap:14px;direction:ltr}
.ekw .n>div{display:flex;flex-direction:column;align-items:center;min-width:0}
.ekw .n b{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:36px;letter-spacing:.04em;line-height:1.1}
.ekw .n>i{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:30px;line-height:1.2;color:#b08680}
/* أسامي الوالدين: سطر صغير هادي فوق كل اسم، وبينه وبين الاسم خط وردي رفيع ومسافة */
.ek-dad{display:block;white-space:nowrap;color:rgba(var(--fg-rgb),.88)}
.ek-dad .ek-ar{font-family:'Amiri',serif;font-size:16px;line-height:1.5}
.ek-dad .ek-ku{font-family:'Cormorant Garamond',serif;font-size:12.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;line-height:1.5}
.ek-dad::after{content:"";display:block;width:34px;height:1px;margin:7px auto 9px;background:linear-gradient(to right,transparent,rgba(var(--rose-rgb),1),transparent)}
.ht-names .ek-dad .ek-ar{font-size:17px}
.ht-names .ek-dad .ek-ku{font-size:13px}
.ht-names .ek-dad.d2{margin-top:8px}
.ekw .w{margin-top:10px;font-size:18px;line-height:1.8}
.ekw .w .ek-ku{font-size:18px;line-height:1.5}
.ekw .sep{display:block;width:140px;height:10px;margin:16px auto 0;position:relative;background:linear-gradient(to right,transparent,rgba(var(--rose-rgb),.9)) left 5px/58px 1px no-repeat,linear-gradient(to left,transparent,rgba(var(--rose-rgb),.9)) right 5px/58px 1px no-repeat}
.ekw .sep::after{content:"";position:absolute;left:50%;top:0;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0,#f6eeea 35%,#d9c9c3 75%,#bfaaa4 100%);box-shadow:0 1px 2px rgba(110,76,80,.35)}
/* الختام */
.ft-en-h .ek-ar{font-size:1.05em}
.ft-en-2,.ft-l{display:none!important}
.ft-en-h{white-space:normal!important;max-width:330px!important;font-size:26px!important;line-height:1.6!important}
.ft-en-h .ek-ku{font-size:24px}
/* التاريخ والساعة بيتقروا من الشمال لليمين في العربي كمان */
[data-elem-id="mp5"],[data-elem-id="mp7"],[data-elem-id="mp52"],[data-elem-id="mp53"],.ek-ltr{direction:ltr;unicode-bidi:isolate}
.ht-amp,.ft-amp{font-family:'Cormorant Garamond',serif!important;font-style:italic!important;font-weight:400!important;color:#b08680!important;font-size:28px!important;line-height:1.1!important;margin:4px 0!important}
/* زرار اللغة (فوق على اليمين) */
.ek-lang{position:fixed;z-index:60;top:calc(14px + env(safe-area-inset-top,0px));right:14px;display:flex;padding:3px;border-radius:30px;direction:ltr;
  background:rgba(255,248,245,.82);box-shadow:0 0 0 1px rgba(var(--fg-rgb),.25),0 6px 18px -8px rgba(80,50,50,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.ek-lang button{border:0;background:transparent;padding:7px 14px;border-radius:24px;font:600 14px/1 'Cormorant Garamond',serif;color:var(--fg);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .3s,color .3s}
.ek-lang button.ar{font:700 14px/1 'Amiri',serif}
html:not(.ek-ku) .ek-lang button.ar,html.ek-ku .ek-lang button.ku{background:linear-gradient(150deg,#8c6468,#6e4c50);color:#fff7f3}
/* الأسامي بالعربي بخط الرقعة */
.ht-names h1 .ek-ar,.ft-nm .ek-ar,.ekw .n b .ek-ar{font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif!important;font-weight:700;letter-spacing:0!important;font-size:1.08em;line-height:1.35}
.ht-amp .ek-ar,.ft-amp .ek-ar,.ekw .n>i .ek-ar{font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif!important;font-style:normal;letter-spacing:0}
html:not(.ek-ku) .ekw .n{direction:rtl}
.ht-names h1 .ek-ku,.ft-nm .ek-ku,.ekw .n b .ek-ku{font-family:'Cormorant Garamond',serif!important;font-style:normal}
/* (المالك 2026-11-25) أول صفحة: من غير أسامي الوالدين ومن غير "يوم السبت" والساعة تحت التاريخ */
.ht-venue{display:none!important}
/* العدّاد بالإنجليزي: نفس الخط والترتيب في اللغتين */
.cd .ek-ar{font-family:inherit!important}
.cd-grid{direction:ltr}
.cd-title{font-family:'Cormorant Garamond',serif!important;font-weight:500;letter-spacing:.06em}
.cd-soon{font-family:'Cormorant Garamond',serif!important;font-style:italic;font-weight:400}
.cd-soon .ek-ku{display:inline-block;font-size:.74em;line-height:1.15;max-width:86vw}
.cd-n{font-family:'Cormorant Garamond',serif!important;font-weight:500;font-variant-numeric:lining-nums tabular-nums}
/* (المالك 2026-11-25) من غير "و" / "&" بين الاسمين في اللغتين؛ الأسامي بالعربي صور خط الفرشاة */
.ht-amp,.ft-amp{display:none!important}
.ek-ni{display:inline-block;width:auto;max-width:none;vertical-align:middle;-webkit-user-drag:none;user-select:none}
.ht-names h1{line-height:1!important}
.ht-names .ek-ni-g{height:66px}.ht-names .ek-ni-b{height:63px}
html:not(.ek-ku) .ht-names [data-f="bride"]{margin-top:22px}
html.ek-ku .ht-names [data-f="bride"]{margin-top:10px}
.ekw .n .ek-ni-g{height:53px}.ekw .n .ek-ni-b{height:50px}
.ekw .n{gap:34px}
html:not(.ek-ku) .ekw .n{align-items:flex-start}
.ft-nm .ek-ni-g{height:48px}.ft-nm .ek-ni-b{height:46px}
.ft-n{display:flex;justify-content:center;align-items:center;gap:26px}
.ek-dad .ek-ku em{display:block;font-style:italic;font-weight:500;font-size:14px;letter-spacing:.02em;text-transform:none;line-height:1.3;margin-bottom:1px}
</style>`;

const WORDS = `
  <!-- (المالك 2026-11-25) كلام الدعوة — عربي/كردي -->
  <div class="rv sec ek-words">
    <section class="ekw"><div class="rv ekw-in">
      <p class="b">${bi('bism')}</p>
      <i class="sep"></i>
      <p class="h">${bi('hamd')}</p>
      <i class="sep"></i>
      <p class="i">${bi('inv')}</p>
      <div class="n"><div><span class="ek-dad">${bi('dad1')}</span><b>${nm('g')}</b></div><div><span class="ek-dad">${bi('dad2')}</span><b>${nm('b')}</b></div></div>
      <p class="w">${bi('when')}</p>
    </div></section>
  </div>
`;

const TAIL = `<div class="ek-lang" role="group" aria-label="Language"><button type="button" class="ku" data-l="ku">Kurdî</button><button type="button" class="ar" data-l="ar">العربية</button></div>
<script>(function () {
  var TX = ${JSON.stringify(TX)};
  function bi(k) { return '<span class="ek-ar">' + TX[k][0] + '</span><span class="ek-ku">' + TX[k][1] + '</span>'; }
  var NMI = ${JSON.stringify(NMI)};
  function nm(k) { return '<img class="ek-ar ek-ni ek-ni-' + k + '" src="' + NMI[k] + '" alt="' + TX[k][0] + '" draggable="false"><span class="ek-ku">' + TX[k][1] + '</span>'; }
  function set(id, k) { var el = document.querySelector('[data-elem-id="' + id + '"]'); if (el) el.innerHTML = bi(k); }
  function fill() {
    set('mp4', 'joy'); set('mp6', 'day'); set('mp8', 'cdTitle'); set('mp13', 'soon'); set('mp46', 'close1'); set('mp47', 'close1'); set('mp21', 'venueT'); set('mp25', 'venueW'); set('mp28', 'map');
    ['mp22', 'mp26'].forEach(function (id) { var el = document.querySelector('[data-elem-id="' + id + '"]'); if (el) el.style.display = 'none'; });
    var c7 = document.querySelector('[data-elem-id="mp7"]'); if (c7) c7.textContent = '15:00 – 00:00';
    var d5 = document.querySelector('[data-elem-id="mp5"]'); if (d5) d5.textContent = '26 . 12 . 2026';
    var d52 = document.querySelector('[data-elem-id="mp52"]'); if (d52) d52.textContent = '26 . 12 . 2026';
    var t53 = document.querySelector('[data-elem-id="mp53"]'); if (t53) t53.textContent = '15:00 – 00:00';
    var m47 = document.querySelector('[data-elem-id="mp47"]'); if (m47) m47.style.display = 'none';
    document.querySelectorAll('[data-f="groom"]').forEach(function (el) { el.innerHTML = nm('g'); });
    document.querySelectorAll('[data-f="bride"]').forEach(function (el) { el.innerHTML = nm('b'); });
    var h = document.getElementById('cvHint'); if (h) h.innerHTML = bi('tap');
    document.querySelectorAll('[data-cdl]').forEach(function (el) { var i = +el.getAttribute('data-cdl'); el.innerHTML = '<span class="ek-ar">' + TX.cdl[0][i] + '</span><span class="ek-ku">' + TX.cdl[1][i] + '</span>'; });
  }
  fill();
  // العدّاد بأرقام إنجليزي في اللغتين (القالب العربي بيكتبها ٠١٢…) — بتتغيّر لحظة ما القالب يكتبها
  var AD = '٠١٢٣٤٥٦٧٨٩';
  function latin(el) { if (el && /[٠-٩]/.test(el.textContent)) el.textContent = el.textContent.replace(/[٠-٩]/g, function (c) { return AD.indexOf(c); }); }
  ['cdD', 'cdH', 'cdM', 'cdS'].forEach(function (id) {
    var el = document.getElementById(id); if (!el) return; latin(el);
    if (window.MutationObserver) new MutationObserver(function () { latin(el); }).observe(el, { childList: true, characterData: true, subtree: true });
  });
  document.querySelectorAll('.ek-lang button').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var l = b.getAttribute('data-l'), r = document.documentElement;
      r.classList.toggle('ek-ku', l === 'ku'); r.dir = l === 'ku' ? 'ltr' : 'rtl'; r.lang = l;
      try { localStorage.setItem('ek_lang_${SHORT}', l); } catch (x) {}
    });
  });
})();</script>`;

module.exports = {
  shortId: SHORT,
  // (المالك 2026-11-25) كارت لينك شيك: الكارت الوردي بالأسامي جنب الأسامي والتاريخ على نفس الورق (scratch erc/share/make.js)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Azad & Najbir 🤍 دعوة خطوبة',
    description: 'بكل سرور وفخر ندعوكم لحضور حفل خطوبتنا 🤍 السبت 26.12.2026 · من الساعة 15:00 حتى 00:00 · هانوفر',
  },

  render({ editMode } = {}) {
    return { head: HEAD, bodyEnd: editMode ? '' : TAIL };
  },

  transform(html, { editMode } = {}) {
    let out = oneVideo(html) || html;
    out = out.split(`${T}hero-frame.webp`).join(HERO).split(`${T}countdown-frame.webp`).join(CDF);
    // الحفلة في هانوفر (ألمانيا، UTC+1 في ديسمبر): العدّاد لحد 15:00 بتوقيتهم
    out = out.replace(/"weddingDateTimeISO":"[^"]*"/, '"weddingDateTimeISO":"2026-12-26T14:00:00.000Z"');
    const anchor = '<!-- 3) العدّاد -->';
    if (out.split(anchor).length === 2) out = out.replace(anchor, () => WORDS + anchor);
    return out;
  },
};
