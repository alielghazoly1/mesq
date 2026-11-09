// دعوة r1X0Neh (Blossom & Oud) — فرح يوم الاتنين 23 نوفمبر 2026 الساعة 7 مساءً، Pyramids Palace Venue
// (كفر الجبل، الهرم، الجيزة). بطلب المالك (2026-11-09): عربي وإنجليزي في نفس الدعوة — العربي هو
// الأساس، وزرار فوق على اليمين بيحوّلها إنجليزي ولو اتداس تاني ترجع عربي (زي xVSjgue).
// الأسامي على الستاير بخط رقعة (Aref Ruqaa) متشكّلة ومن غير ما حاجة تتقص. الدريس كود: البنات أحمر
// أو أسود أو برجاندي، والرجالة بدلة سودا أو طقم أسود كامل (ممنوع البدلة البيضا) — رسمة اللبس اتلوّنت
// كده (client/public/custom/r1X0Neh/dress.webp، scratch r1/dress.py) ودواير الألوان أحمر/أسود/برجاندي.
// جدول المواعيد مستخبي لحد ما المالك يبعته. البيانات (التاريخ والساعة والقاعة والخريطة): oneOffFix
// r1X0Neh-pyramids-palace.
const { asset } = require('./_asset');

const SHORT = 'r1X0Neh';
const GOLD = '#866739';

// الأسامي — [العريس، العروسة] (المالك 2026-11-09: محمد وميادة). العربي متشكّل.
const NAMES = {
  ar: ['مُحَمَّد', 'مَيَّادَة'],
  en: ['Mohamed', 'Mayada'],
};

// خانات القالب: [السيلكتور، عربي، إنجليزي]
const R = (rec, f) => `#${rec} [field="${f}"]`;
// أسامي الخط اليدوي (صور المالك 2026-11-09): متقصوصة من غير خلفية، متكبّرة 4x ودهبي زي كلام الدعوة (scratch r1/cal/cut.py)
const IMG_MO = `<img class="r1-ni r1-ni-mo" src="${asset(`/custom/${SHORT}/mohamed.webp`)}" alt="محمد" decoding="async">`;
const IMG_MA = `<img class="r1-ni r1-ni-ma" src="${asset(`/custom/${SHORT}/mayada.webp`)}" alt="ميادة" decoding="async">`;
const FIELDS = [
  [R('rec2339662043', 'tn_text_1777183175514000001'), 'اضغط لفتح الدعوة', 'Tap to open'],
  // أول صفحة (الستاير): الاسمين وبينهم "و" / "&"، وتحتهم التاريخ والساعة
  [R('rec2339662063', 'tn_text_1779566247730000001'), `<span class="r1-n">${IMG_MO}</span><span class="r1-and">وَ</span><span class="r1-n">${IMG_MA}</span>`, `<span class="r1-n">${NAMES.en[0]}</span><span class="r1-and">&amp;</span><span class="r1-n">${NAMES.en[1]}</span>`],
  [R('rec2339662063', 'tn_text_1779566247730000004'), '', ''],
  [R('rec2339662063', 'tn_text_1779566247730000003'), 'الاثنين ٢٣ نوفمبر ٢٠٢٦', '23 November 2026'],
  [R('rec2339662063', 'tn_text_1779626065755000001'), 'الساعة السابعة مساءً', 'Monday · 7:00 PM'],
  // كارت القوس (تحت ختم البسملة)
  [R('rec2339662083', 'tn_text_1779624381838000001'),
    `<span class="r1-arch-n">${IMG_MO.replace('r1-ni ', 'r1-ai ')}<b>وَ</b>${IMG_MA.replace('r1-ni ', 'r1-ai ')}</span><br><br>يتشرفان بدعوتكم<br>لحضور حفل زفافهما<br><br>يوم الاثنين<br>٢٣ نوفمبر ٢٠٢٦<br>الساعة السابعة مساءً<br>في`,
    `${NAMES.en[0]} &amp; ${NAMES.en[1]}<br><br>request the pleasure<br>of your company<br>at their wedding<br><br>on Monday<br>23 November 2026<br>at 7:00 PM<br>at`],
  [R('rec2339662083', 'tn_text_1779472210551000005'), 'Pyramids Palace', 'Pyramids Palace'],
  [R('rec2339662093', 'tn_text_1771277026942000001'), 'اقترب موعد الفرح', 'The Celebration Begins'],
  [R('rec2339662113', 'tn_text_1771277026942000001'), 'مكان الحفل', 'The Venue'],
  [R('rec2339662113', 'tn_text_1779544773135'), 'Pyramids Palace Venue', 'Pyramids Palace Venue'],
  [R('rec2339662113', 'tn_text_1779545032699000001'), 'كفر الجبل، الهرم، الجيزة', 'Kafr El Gabal, Haram, Giza'],
  // الدريس كود
  [R('rec2355542373', 'tn_text_1771277026942000001'), 'الزي المقترح', 'Dress Code'],
  [R('rec2355542373', 'tn_text_1779544773135'), 'يسعدنا أن تشاركونا فرحتنا<br>بإطلالة تناسب ألوان الحفل', 'We would love to see you<br>in the colours of our evening'],
  [R('rec2355542373', 'tn_text_1780768374065000001'), 'ألوان الفساتين', 'Colours for the ladies'],
  [R('rec2355574603', 'tn_text_1780767478919000003'), 'السيدات', 'Ladies'],
  [R('rec2355574603', 'tn_text_1780767449362000001'), 'فستان باللون الأحمر<br>أو الأسود أو البرجندي', 'A red, black<br>or burgundy dress'],
  [R('rec2355574603', 'tn_text_1780767518772000004'), 'السادة', 'Gentlemen'],
  [R('rec2355574603', 'tn_text_1780767518772000005'), 'يُفضَّل بدلة سوداء<br>أو طقم أسود كامل<br><b class="r1-no">مع الاعتذار عن البدلة البيضاء</b>', 'A black suit or<br>an all-black outfit<br><b class="r1-no">Kindly, no white suits</b>'],
  [R('rec2339662133', 'tn_text_1771277026942000001'), 'الطريق إلى القاعة', 'Getting There'],
  [R('rec2339662163', 'tn_text_1763405219328'), 'بوجودكم تكتمل فرحتنا', 'We would be delighted<br>to welcome you'],
  ['#venueOpenMapLink', 'افتح الموقع على خرائط جوجل', 'Open in Google Maps'],
];
const CD = { ar: ['أيام', 'ساعات', 'دقائق', 'ثوانٍ'], en: ['Days', 'Hours', 'Minutes', 'Seconds'] };

// نص بلغتين في نفس المكان — الـ CSS بيظهر واحد بس
const T = (ar, en, tag = 'span', cls = '') => `<${tag} class="r1-ar ${cls}" dir="rtl" lang="ar">${ar}</${tag}><${tag} class="r1-en ${cls}" lang="en">${en}</${tag}>`;

// ===== تأكيد الحضور (مكان فورم القالب — بيوصل للوحة العميل) =====
const RSVP = `<section class="r1-sec" id="r1Rsvp">
  ${T('تأكيد الحضور', 'Confirm Your Presence', 'h2', 'r1-title')}
  <div class="r1-orn" aria-hidden="true"><i></i><b></b><i></i></div>
  ${T('يسعدنا تأكيد حضوركم في أقرب وقت', 'Kindly let us know at your earliest convenience', 'p', 'r1-dl')}
  <form class="r1-form" id="r1Form" novalidate>
    <label class="r1-lab" for="r1Name">${T('الاسم', 'Your name')}</label>
    <input id="r1Name" maxlength="80" autocomplete="name">
    <span class="r1-lab">${T('هل ستشرفوننا بالحضور؟', 'Will you attend?')}</span>
    <div class="r1-choice"><button type="button" data-a="yes">${T('نعم، بكل سرور', 'Yes, with pleasure')}</button><button type="button" data-a="no">${T('أعتذر، لن أتمكّن', 'Sorry, I can’t make it')}</button></div>
    <label class="r1-lab" for="r1Note">${T('كلمة للعروسين (اختياري)', 'A note for the couple (optional)')}</label>
    <textarea id="r1Note" rows="2" maxlength="160"></textarea>
    <button type="submit" class="r1-send" id="r1Send">${T('إرسال', 'Send')}</button>
    <p class="r1-msg" id="r1Msg" aria-live="polite"></p>
  </form>
</section>`;

// خانات القالب اللي عربي بالرقعة (عناوين وأسامي) واللي بالأميري (الكلام)
const RUQAA = [
  '#rec2339662063 [field="tn_text_1779566247730000001"]', '#rec2339662063 [field="tn_text_1779566247730000004"]',
  '#rec2339662093 [field="tn_text_1771277026942000001"]', '#rec2339662113 [field="tn_text_1771277026942000001"]',
  '#rec2355542373 [field="tn_text_1771277026942000001"]', '#rec2355542373 [field="tn_text_1780768374065000001"]',
  '#rec2355574603 [field="tn_text_1780767478919000003"]', '#rec2355574603 [field="tn_text_1780767518772000004"]',
  '#rec2339662133 [field="tn_text_1771277026942000001"]', '#rec2339662163 [field="tn_text_1763405219328"]',
];
const AMIRI = [
  '#rec2339662043 [field]', '#rec2339662063 [field="tn_text_1779566247730000003"]', '#rec2339662063 [field="tn_text_1779626065755000001"]',
  '#rec2339662083 [field="tn_text_1779624381838000001"]',
  '#rec2339662113 [field="tn_text_1779545032699000001"]',
  '#rec2355542373 [field="tn_text_1779544773135"]', '#rec2355574603 [field="tn_text_1780767449362000001"]', '#rec2355574603 [field="tn_text_1780767518772000005"]',
];
const ar = (list, extra = '') => list.map((s) => `html.r1-arabic ${s}${extra}`).join(',');

const CSS = `
html,body{overflow-anchor:none}
.r1-sec{position:relative;z-index:5;background:#f9e6d4;padding:30px 30px 34px;text-align:center;color:#2a2a2a;font-variant-numeric:lining-nums}
html:not(.r1-arabic) .r1-ar{display:none!important}
html.r1-arabic .r1-en{display:none!important}
.r1-title{margin:0;font:500 41px/64px 'newtemplate','Pinyon Script',cursive;color:${GOLD}}
.r1-orn{display:flex;align-items:center;justify-content:center;gap:10px;width:160px;margin:10px auto 14px}
.r1-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,${GOLD})}.r1-orn i:last-child{transform:scaleX(-1)}
.r1-orn b{width:6px;height:6px;border:1px solid ${GOLD};transform:rotate(45deg)}
.r1-dl{margin:0 auto 18px;max-width:320px;font:400 19px/1.35 'Cormorant Garamond',serif;color:${GOLD}}
.r1-form{max-width:340px;margin:0 auto;text-align:start}
.r1-lab{display:block;margin:0 0 8px;font:400 17px/1.35 'Cormorant Garamond',serif;color:#2a2a2a}
.r1-form input,.r1-form textarea{display:block;width:100%;box-sizing:border-box;margin:0 0 16px;padding:10px 12px;border:1px solid rgba(42,42,42,.18);border-radius:4px;background:#fff;font:400 17px/1.3 'Cormorant Garamond',serif;color:#2a2a2a}
.r1-form input:focus,.r1-form textarea:focus{outline:none;border-color:${GOLD}}
.r1-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 16px}
.r1-choice button{padding:10px 4px;border:1px solid rgba(42,42,42,.18);border-radius:4px;background:#fff;color:#2a2a2a;font:400 15px/1.25 'Cormorant Garamond',serif;cursor:pointer}
.r1-choice button.on{background:#747b54;border-color:#747b54;color:#fff}
.r1-send{display:block;margin:4px auto 0;padding:11px 38px;border:0;border-radius:4px;background:#747b54;color:#fff;font:400 15px/1 'Cormorant Garamond',serif;cursor:pointer}
.r1-send:disabled{opacity:.6}
.r1-msg{min-height:1.4em;margin:12px 0 0;text-align:center;font:400 17px/1.4 'Cormorant Garamond',serif;color:${GOLD}}
.r1-msg.err{color:#9b3b2e}
.r1-no{display:inline-block;margin-top:6px;font-weight:600;color:${GOLD}}
/* كلام الرجالة 3 سطور (آخرها: من غير بدلة بيضا) — القسم أطول شوية عشان مايتقصّش */
#rec2355574603 .t396__artboard,#rec2355574603 .t396__carrier,#rec2355574603 .t396__filter{height:300px!important}
/* دواير الألوان وعنوانها اتشالوا (بطلب المالك) — والقسم أقصر عشان مايفضلش مكانهم فاضي */
#rec2355542373 [data-elem-id^="17807675984"],#rec2355542373 [data-elem-id="1780768374065000001"]{display:none!important}
#rec2355542373 .t396__artboard,#rec2355542373 .t396__carrier,#rec2355542373 .t396__filter{height:440px!important}
/* آخر جملة بالإنجليزي (سطرين): مساحة فوق وتحت — الخط أصغر سنة، والزخرفة اللي تحتها نازلة */
html:not(.r1-arabic) #rec2339662163 [field="tn_text_1763405219328"]{font-size:38px!important;line-height:1.3!important;transform:translateY(-10px)}
html:not(.r1-arabic) #rec2339662163 [data-elem-id="1779625933115000001"],html:not(.r1-arabic) #rec2339662163 [data-elem-id="1779625933115000002"]{transform:translateY(34px)}
html:not(.r1-arabic) #rec2339662163 .t396__artboard,html:not(.r1-arabic) #rec2339662163 .t396__carrier,html:not(.r1-arabic) #rec2339662163 .t396__filter{height:410px!important}
/* زرار اللغة — فوق على اليمين */
.r1-lang{position:fixed;top:calc(12px + env(safe-area-inset-top));right:max(12px,calc(50vw - 218px));z-index:2147482000;display:inline-flex;align-items:center;gap:7px;
  padding:9px 15px 9px 12px;border-radius:999px;border:1px solid rgba(134,103,57,.7);background:rgba(253,246,238,.94);color:${GOLD};
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 10px 24px -12px rgba(90,60,20,.6);font:600 16px/1 'El Messiri','Amiri',sans-serif;cursor:pointer;
  opacity:0;transform:translateY(-10px);pointer-events:none;transition:opacity .5s ease,transform .5s ease;-webkit-tap-highlight-color:transparent;user-select:none}
.r1-lang.on{opacity:1;transform:none;pointer-events:auto}
.r1-lang svg{width:17px;height:17px}
.r1-lang[data-to="en"]{font:600 13px/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.08em}
/* ===== العربي ===== */
html.r1-arabic .tn-atom{letter-spacing:0!important}
${ar(RUQAA)},${ar(RUQAA, ' .tn-atom')}{font-family:'Aref Ruqaa',serif!important;font-weight:700!important;direction:rtl}
${ar(AMIRI)},${ar(AMIRI, ' .tn-atom')}{font-family:'Amiri',serif!important;direction:rtl}
/* الأسامي على الستاير: رقعة متشكّلة — كل اسم في سطر بارتفاع كفاية للتشكيل فوق وتحت، ومفيش قص */
/* الاسمين و"وَ" بينهم في بلوك واحد (خانة "&" بتاعة القالب فاضية)، والتاريخ والساعة نازلين تحته */
#rec2339662063 [field="tn_text_1779566247730000001"]{line-height:1!important;overflow:visible!important;transform:translateY(-34px)}
html.r1-arabic #rec2339662063 [field="tn_text_1779566247730000001"]{transform:translateY(-52px)}
.r1-n{display:block;font:500 59px/1.15 'newtemplate','Pinyon Script',cursive;white-space:nowrap;padding:0 6px}
.r1-and{display:block;font:500 28px/1.1 'newtemplate','Pinyon Script',cursive;margin:0}
#rec2339662063 [data-elem-id="1779566247730000004"]{display:none!important}
#rec2339662063 [field="tn_text_1779566247730000003"],#rec2339662063 [field="tn_text_1779626065755000001"]{transform:translateY(var(--r1-dy,62px));text-shadow:0 0 8px #fbf2e4,0 0 16px #fbf2e4,0 0 3px #fbf2e4}
#rec2339662163 [field="tn_text_1763405219328"]{white-space:normal!important}
html.r1-arabic .r1-n{display:block;font:700 70px/1.32 'Aref Ruqaa',serif;white-space:nowrap;padding:0 6px}
html.r1-arabic .r1-and{display:block;font:700 34px/1.1 'Aref Ruqaa',serif;margin:-6px 0 -4px}
html.r1-arabic #rec2339662063 [field="tn_text_1779566247730000003"],html.r1-arabic #rec2339662063 [field="tn_text_1779626065755000001"]{font-size:20px!important;line-height:1.4!important;font-weight:700!important;transform:translateY(var(--r1-dy,62px))}
html.r1-arabic #rec2339662083 [field="tn_text_1779624381838000001"]{font-size:20px!important;line-height:1.6!important;font-weight:400!important}
html.r1-arabic .r1-arch-n{display:inline-flex;align-items:center;justify-content:center;gap:10px;direction:rtl;font:700 26px/1 'Aref Ruqaa',serif;color:${GOLD};margin:4px 0}
.r1-ai{display:block;width:auto}.r1-ai.r1-ni-mo{height:44px}.r1-ai.r1-ni-ma{height:56px}
/* صور الأسامي على الستاير */
html.r1-arabic .r1-n{line-height:0!important}
.r1-ni{display:block;margin:0 auto;width:auto;max-width:78vw;filter:drop-shadow(0 1px 0 rgba(255,250,240,.55))}
.r1-ni-mo{height:72px}.r1-ni-ma{height:100px}
html.r1-arabic #rec2355542373 [field="tn_text_1779544773135"],html.r1-arabic #rec2355574603 [field="tn_text_1780767449362000001"],html.r1-arabic #rec2355574603 [field="tn_text_1780767518772000005"]{font-size:19px!important;line-height:1.55!important}
html.r1-arabic #venueOpenMapLink{font-family:'El Messiri','Amiri',sans-serif!important;letter-spacing:0!important}
html.r1-arabic .r1-sec [lang="ar"],html.r1-arabic .r1-form{direction:rtl}
html.r1-arabic .r1-title{font:700 36px/1.7 'Aref Ruqaa',serif}
html.r1-arabic .r1-dl{font:400 18px/1.7 'Amiri',serif}
html.r1-arabic .r1-lab,html.r1-arabic .r1-choice button,html.r1-arabic .r1-form input,html.r1-arabic .r1-form textarea,html.r1-arabic .r1-msg{font-family:'Amiri',serif}
html.r1-arabic .r1-send{font:600 16px/1 'El Messiri',sans-serif}
/* الإنجليزي: خانات القالب اللي كانت بالخط السكريبت (التاريخ والكلام) بخط مقروء */
html:not(.r1-arabic) #rec2339662063 [field="tn_text_1779566247730000003"],html:not(.r1-arabic) #rec2339662063 [field="tn_text_1779626065755000001"],
html:not(.r1-arabic) #rec2355542373 [field="tn_text_1779544773135"],html:not(.r1-arabic) #rec2355574603 [field="tn_text_1780767449362000001"],html:not(.r1-arabic) #rec2355574603 [field="tn_text_1780767518772000005"]{font-family:'Cormorant Garamond',serif!important;font-weight:500!important;font-variant-numeric:lining-nums!important}
html:not(.r1-arabic) #rec2339662063 [field="tn_text_1779566247730000003"],html:not(.r1-arabic) #rec2339662063 [field="tn_text_1779626065755000001"]{font-size:20px!important;line-height:1.3!important}
`;

const FONTS = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=El+Messiri:wght@500;600&family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap';

// قبل ما الصفحة ترسم: العربي هو الأساس (إلا لو الضيف اختار إنجليزي قبل كده أو ?lang=en)
const HEAD_SCRIPT = `<script>(function(){var l='ar';try{l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('r1_lang_${SHORT}')||'ar';}catch(e){}if(l!=='en'){document.documentElement.classList.add('r1-arabic');document.documentElement.lang='ar';}})();</script>`;

const SCRIPT = `<script id="r1-script">(function () {
  var FIELDS = ${JSON.stringify(FIELDS).replace(/</g, '\\u003c')};
  var CD = ${JSON.stringify(CD)};
  var NAMES = ${JSON.stringify(NAMES)};
  var KEY = 'r1_lang_${SHORT}';
  var lang = 'ar';
  function $(s) { return document.querySelector(s); }
  function place() {
    // جدول المواعيد مستخبي لحد ما المالك يبعته؛ فورم القالب مكانه فورم بلغتين
    ['rec2355511493', 'rec2339662123'].forEach(function (id) { var r = document.getElementById(id); if (r) r.style.display = 'none'; });
    var r = document.getElementById('rec2339662123');
    if (r && !document.getElementById('r1Rsvp')) r.insertAdjacentHTML('beforebegin', ${JSON.stringify(RSVP)});
  }
  function texts() {
    var isAr = lang === 'ar';
    FIELDS.forEach(function (f) { var el = $(f[0]); if (el) el.innerHTML = isAr ? f[1] : f[2]; });
    ['days', 'hours', 'minutes', 'seconds'].forEach(function (k, i) { var n = document.getElementById(k); if (n && n.nextElementSibling) n.nextElementSibling.textContent = CD[lang][i]; });
    document.title = isAr ? 'دعوة زفاف ' + NAMES.ar[0] + ' و' + NAMES.ar[1] : NAMES.en[0] + ' & ' + NAMES.en[1] + ' — Wedding Invitation';
    document.documentElement.classList.toggle('r1-arabic', isAr);
    document.documentElement.lang = isAr ? 'ar' : 'en';
    var msg = document.getElementById('r1Msg'); if (msg) { msg.textContent = ''; msg.className = 'r1-msg'; }
    fitDate();
  }
  // التاريخ والساعة تحت الاسمين على طول (بيتقاس بعد ما خط الرقعة يحمّل — أي طول أسامي مايركبش على التاريخ)
  function fitDate() {
    var rec = document.getElementById('rec2339662063'); if (!rec) return;
    var ns = rec.querySelectorAll('.r1-n'), d = rec.querySelector('[field="tn_text_1779566247730000003"]');
    if (!ns.length || !d) return;
    var g = document.createRange(); g.selectNodeContents(ns[ns.length - 1]);
    var bottom = g.getBoundingClientRect().bottom;
    if (!bottom) return;
    var cur = parseFloat(getComputedStyle(rec).getPropertyValue('--r1-dy')); if (isNaN(cur)) cur = 62;
    var top = d.getBoundingClientRect().top - cur;
    rec.style.setProperty('--r1-dy', Math.max(0, Math.round(bottom + 10 - top)) + 'px');
  }
  function setLang(l) {
    lang = l; texts();
    var b = document.getElementById('r1Lang');
    if (b) { b.dataset.to = l === 'ar' ? 'en' : 'ar'; b.querySelector('span').textContent = l === 'ar' ? 'English' : 'عربي'; b.setAttribute('aria-label', l === 'ar' ? 'View in English' : 'عرض الدعوة بالعربي'); }
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }
  function rsvp() {
    var form = document.getElementById('r1Form'); if (!form) return;
    var att = null, msg = document.getElementById('r1Msg');
    var say = function (a, e, bad) { msg.textContent = lang === 'ar' ? a : e; msg.className = 'r1-msg' + (bad ? ' err' : ''); };
    [].forEach.call(form.querySelectorAll('.r1-choice button'), function (b) {
      b.addEventListener('click', function () {
        att = b.getAttribute('data-a') === 'yes';
        [].forEach.call(form.querySelectorAll('.r1-choice button'), function (x) { x.classList.toggle('on', x === b); });
        msg.textContent = '';
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('r1Name').value.trim().replace(/\\s+/g, ' ');
      var note = document.getElementById('r1Note').value.trim();
      if (name.length < 2) { say('من فضلك اكتب اسمك', 'Please write your name', 1); return; }
      if (att === null) { say('من فضلك اختر: نعم أو لا', 'Please choose yes or no', 1); return; }
      var send = document.getElementById('r1Send'); send.disabled = true;
      var first = name.split(' ')[0];
      fetch('/i/${SHORT}/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ guestName: name, attending: att ? 'yes' : 'no', note: note.slice(0, 200) }) })
        .then(function (r) { if (!r.ok) throw 0; say(att ? 'شكرًا ' + first + ' — في انتظاركم 🤍' : 'شكرًا ' + first + ' — ستكونون في قلوبنا 🤍', att ? 'Thank you, ' + first + ' — we can’t wait to see you 🤍' : 'Thank you, ' + first + ' — you’ll be in our hearts 🤍'); })
        .catch(function () { say('تعذّر الإرسال — حاول مرة أخرى', 'Couldn’t send — please try again', 1); })
        .then(function () { send.disabled = false; });
    });
  }
  function button() {
    if (/[?&]edit=1/.test(location.search)) return;
    var b = document.createElement('div');
    b.id = 'r1Lang'; b.className = 'r1-lang'; b.setAttribute('role', 'button'); b.tabIndex = 0;
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.9 2.7 15.1 0 18M12 3c-2.7 2.9-2.7 15.1 0 18"/></svg><span>English</span>';
    b.dataset.to = 'en';
    document.body.appendChild(b);
    var go = function () { setLang(b.dataset.to); };
    b.addEventListener('click', go);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    var show = function () { setTimeout(function () { b.classList.add('on'); }, 2000); };
    var enter = document.querySelector('.popup-enter');
    if (enter && !(window.WEDDING_CONFIG || {}).autoOpen) enter.addEventListener('click', show); else show();
  }
  function init() {
    place(); rsvp(); button();
    var start = 'ar';
    try { start = new URLSearchParams(location.search).get('lang') || localStorage.getItem(KEY) || 'ar'; } catch (e) {}
    setLang(start === 'en' ? 'en' : 'ar');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitDate);
    window.addEventListener('load', fitDate); window.addEventListener('resize', fitDate);
    var enter = document.querySelector('.popup-enter'); if (enter) enter.addEventListener('click', function () { setTimeout(fitDate, 600); setTimeout(fitDate, 2500); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();</script>`;

const DRESS_SRC = 'https://static.tildacdn.net/tild3736-6638-4539-b133-393334313761/People_in_elegant_at.png';

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة 1200×630 (بطلب المالك): ستاير القصر على الجنبين، ختم البسملة، "مُحَمَّد وَمَيَّادَة"
  // بالرقعة الدهبي و"Mohamed & Mayada" والتاريخ والقاعة بالعربي — كله في النص عشان واتساب بيقص مربع.
  // اتعمل في scratch r1/share.js.
  share: {
    image: asset(`/custom/${SHORT}/share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف محمد وميادة 🤍',
    description: 'الاثنين ٢٣ نوفمبر ٢٠٢٦ — الساعة السابعة مساءً · قاعة بيراميدز بالاس، الهرم',
  },

  render() {
    return {
      head: `${HEAD_SCRIPT}<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS}"><style id="r1-style">${CSS}</style>`,
      bodyEnd: SCRIPT,
    };
  },

  // رسمة الدريس كود: نسخة متلوّنة (فساتين أحمر/أسود/برجندي وبدل سودا) بدل رسمة القالب
  transform(html) {
    return html.split(DRESS_SRC).join(asset(`/custom/${SHORT}/dress.webp`));
  },
};
