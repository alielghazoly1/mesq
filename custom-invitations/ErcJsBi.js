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
const CDF = asset(`${DIR}countdown-frame.webp`);

// [عربي, كردي]
const TX = {
  bism: ['بسم الله الرحمن الرحيم', 'Bi navê Xwedayê dilovan û dilovîn'],
  hamd: ['الحمد لله الذي بنعمته تتم الصالحات', 'Spasî ji bo wî Xwedayê ku bi nîmata wî qancîkarî (xêrxwazî) temam dibin.'],
  inv: ['بكل سرور وفخر ندعوكم لحضور حفل خطوبة', 'Em bi dilxweşî û şanazî we vedixwînin ahenga nîşankirina (Azad) û (Najbîr)'],
  when: ['يوم السبت 26.12.2026<br>من الساعة 15:00 حتى 00:00<br>في Am Eisenwerk 18، هانوفر', 'ku dê roja Şemiyê, Dem 26.12.2026,<br>Demjimêr 15:00 – 00:00<br>li Am Eisenwerk 18, Hannover bê lidarxistin.'],
  venueT: ['مكان الحفل', 'Cihê ahengê'],
  venueW: ['السبت 26.12.2026 | 15:00 – 00:00', 'Şemî 26.12.2026 | 15:00 – 00:00'],
  map: ['افتح اللوكيشن', 'Cih li ser nexşeyê'],
  joy: ['لكم الفرحة ولنا العمر سوياً', 'Şahî ji bo we, û temenê me bi hev re'],
  day: ['يوم السبت', 'Roja Şemiyê'],
  close1: ['سنكون في غاية الفرح والسعادة بمشاركتكم', 'Em ê bi beşdarbûna we şad û bextewar bibin.'],
  cdTitle: ['العدّ التنازلي', 'Heta roja me'],
  soon: ['نراكم قريبًا', 'Em ê we zû bibînin'],
  tap: ['اضغط لفتح الدعوة', 'Ji bo vekirinê bitikîne'],
  cdl: [['يوم', 'ساعة', 'دقيقة', 'ثانية'], ['Roj', 'Saet', 'Deqîqe', 'Çirke']],
};
const bi = (k) => `<span class="ek-ar">${TX[k][0]}</span><span class="ek-ku">${TX[k][1]}</span>`;

const HEAD = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap">
<script>(function () {
  var q = /[?&]lang=(ku|ar)/.exec(location.search), s = null;
  try { s = localStorage.getItem('ek_lang_${SHORT}'); } catch (e) {}
  var l = q ? q[1] : (s || 'ar');
  if (l === 'ku') { document.documentElement.classList.add('ek-ku'); document.documentElement.dir = 'ltr'; document.documentElement.lang = 'ku'; }
})();</script>
<style id="ek-css">
:root{--bg:#e3cbc0;--bg-rgb:227,203,192;--fg:#704f50;--fg-rgb:112,79,80}
html:not(.ek-ku) .ek-ku,html.ek-ku .ek-ar{display:none!important}
.ek-ar{font-family:'Amiri','Amiri Ar Local',serif;letter-spacing:0}
.ek-ku{font-family:'Cormorant Garamond',serif;letter-spacing:.01em}
/* أسامي الكارت الأول: نفس الخط المزخرف في اللغتين */
.ht-names h1,.ft-nm{font-family:'Monsieur La Doulaise Local',cursive!important;letter-spacing:0!important}
.ht-of{display:none!important}
.ht-with{font-style:normal!important}
.ht-with .ek-ar{font-size:1.18em}
.ht-with .ek-ku{font-style:italic;font-size:1.1em}
/* كارت كلام الدعوة (جمل المالك) */
.ekw{padding:70px 26px 40px;text-align:center;color:var(--fg)}
.ekw-in{max-width:420px;margin:0 auto;padding:34px 22px;border:1px solid rgba(var(--fg-rgb),.28);outline:1px solid rgba(var(--fg-rgb),.12);outline-offset:6px;background:rgba(255,248,245,.35)}
.ekw p{margin:0}
.ekw .b{font-size:24px;line-height:1.7}
.ekw .b .ek-ku{font-size:21px;font-style:italic}
.ekw .h{margin-top:14px;font-size:19px;line-height:1.8}
.ekw .h .ek-ku{font-size:19px;line-height:1.5}
.ekw .i{margin-top:20px;font-size:19px;line-height:1.8}
.ekw .i .ek-ku{font-size:19px;line-height:1.5}
.ekw .n{margin-top:12px;font-family:'Monsieur La Doulaise Local',cursive;font-size:46px;line-height:1.2;direction:ltr}
.ekw .w{margin-top:10px;font-size:18px;line-height:1.8}
.ekw .w .ek-ku{font-size:18px;line-height:1.5}
.ekw .sep{display:block;width:120px;height:9px;margin:16px auto 0;background:linear-gradient(to right,transparent,rgba(var(--fg-rgb),.5)) left 4px/52px 1px no-repeat,linear-gradient(to left,transparent,rgba(var(--fg-rgb),.5)) right 4px/52px 1px no-repeat;position:relative}
.ekw .sep::after{content:"";position:absolute;left:50%;top:1px;width:6px;height:6px;margin-left:-3px;border:1px solid rgba(var(--fg-rgb),.6);transform:rotate(45deg)}
/* الختام */
.ft-en-h .ek-ar{font-size:1.05em}
.ft-en-2,.ft-l{display:none!important}
.ft-en-h{white-space:normal!important;max-width:330px!important;font-size:26px!important;line-height:1.6!important}
.ft-en-h .ek-ku{font-size:24px}
/* التاريخ والساعة بيتقروا من الشمال لليمين في العربي كمان */
[data-elem-id="mp5"],[data-elem-id="mp7"],[data-elem-id="mp52"],[data-elem-id="mp53"],.ek-ltr{direction:ltr;unicode-bidi:isolate}
.ht-amp,.ft-amp{font-family:'Monsieur La Doulaise Local',cursive!important;font-size:30px!important;line-height:1.2!important}
/* زرار اللغة (فوق على اليمين) */
.ek-lang{position:fixed;z-index:60;top:calc(14px + env(safe-area-inset-top,0px));right:14px;display:flex;padding:3px;border-radius:30px;direction:ltr;
  background:rgba(255,248,245,.82);box-shadow:0 0 0 1px rgba(var(--fg-rgb),.25),0 6px 18px -8px rgba(80,50,50,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.ek-lang button{border:0;background:transparent;padding:7px 14px;border-radius:24px;font:600 14px/1 'Cormorant Garamond',serif;color:var(--fg);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .3s,color .3s}
.ek-lang button.ar{font:700 14px/1 'Amiri',serif}
html:not(.ek-ku) .ek-lang button.ar,html.ek-ku .ek-lang button.ku{background:linear-gradient(150deg,#8a6264,#6c4c4e);color:#fff7f3}
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
      <p class="n">Azad &amp; Najbir</p>
      <p class="w">${bi('when')}</p>
    </div></section>
  </div>
`;

const TAIL = `<div class="ek-lang" role="group" aria-label="Language"><button type="button" class="ku" data-l="ku">Kurdî</button><button type="button" class="ar" data-l="ar">العربية</button></div>
<script>(function () {
  var TX = ${JSON.stringify(TX)};
  function bi(k) { return '<span class="ek-ar">' + TX[k][0] + '</span><span class="ek-ku">' + TX[k][1] + '</span>'; }
  function set(id, k) { var el = document.querySelector('[data-elem-id="' + id + '"]'); if (el) el.innerHTML = bi(k); }
  function fill() {
    set('mp4', 'joy'); set('mp6', 'day'); set('mp8', 'cdTitle'); set('mp13', 'soon'); set('mp46', 'close1'); set('mp47', 'close1'); set('mp21', 'venueT'); set('mp25', 'venueW'); set('mp28', 'map');
    ['mp22', 'mp26'].forEach(function (id) { var el = document.querySelector('[data-elem-id="' + id + '"]'); if (el) el.style.display = 'none'; });
    var c7 = document.querySelector('[data-elem-id="mp7"]'); if (c7) c7.textContent = '15:00 – 00:00';
    var d5 = document.querySelector('[data-elem-id="mp5"]'); if (d5) d5.textContent = '26 . 12 . 2026';
    var d52 = document.querySelector('[data-elem-id="mp52"]'); if (d52) d52.textContent = '26 . 12 . 2026';
    var t53 = document.querySelector('[data-elem-id="mp53"]'); if (t53) t53.textContent = '15:00 – 00:00';
    var m47 = document.querySelector('[data-elem-id="mp47"]'); if (m47) m47.style.display = 'none';
    document.querySelectorAll('[data-f="amp"]').forEach(function (el) { el.textContent = '&'; });
    var h = document.getElementById('cvHint'); if (h) h.innerHTML = bi('tap');
    document.querySelectorAll('[data-cdl]').forEach(function (el) { var i = +el.getAttribute('data-cdl'); el.innerHTML = '<span class="ek-ar">' + TX.cdl[0][i] + '</span><span class="ek-ku">' + TX.cdl[1][i] + '</span>'; });
  }
  fill();
  // العدّاد في الكردي بأرقام لاتيني (القالب العربي بيكتبها ٠١٢…)
  var AD = '٠١٢٣٤٥٦٧٨٩';
  setInterval(function () {
    if (!document.documentElement.classList.contains('ek-ku')) return;
    ['cdD', 'cdH', 'cdM', 'cdS'].forEach(function (id) { var el = document.getElementById(id); if (el && /[٠-٩]/.test(el.textContent)) el.textContent = el.textContent.replace(/[٠-٩]/g, function (c) { return AD.indexOf(c); }); });
  }, 250);
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
  share: { title: 'Azad & Najbir — دعوة خطوبة 🤍', description: 'السبت 26.12.2026 · من الساعة 15:00 حتى 00:00' },

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
