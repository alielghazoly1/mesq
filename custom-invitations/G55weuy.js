// دعوة خطوبة خلود البغدادي وبلال صبري (السبت 12/12/2026 — منتجع أوراق 2، ديراب، الرياض) — بطلب المالك
// (2026-11-09): عميلة من السعودية. على قالب Pearl Peony العربي، بألوان الخطوبة اللي بعتها:
//   Ivory #FAF5EE خلفية · Blush/Peach/Deep peach للشريطة والزراير · Champagne · Gold #C9A26B للخطوط والختم ·
//   Cocoa #3B2E2A للنصوص · Walnut #986A4F للعناوين الصغيرة.
// - شاشة الظرف (2026-11-09): نفس شكل الصورة اللي بعتها المالك — شريطة خوخي، فاوانيا وردي، دانتيل، ختم عاجي بـ K&B.
//   الصورة اتشال منها الكلام (LaMa) واتكبّرت، واتقسمت لخلفية (فيها فتحة مكان الظرف) وظرف لوحده — عشان الظرف ينزل زي القالب.
//   مكان "خلود و بلال" على الظرف: مونوجرام "خ ب" (الصورة اللي بعتها المالك) بلون كلام التصميم، وتحته التاريخ.
// - الدبوس (مكان الحفل) خوخي بدل الأخضر، والزخارف الخضرا كلها دهبي.
// - الخطوط: عربي Aref Ruqaa (الأسامي والعناوين) + Amiri (النص) + Reem Kufi (الكلام الصغير)، إنجليزي Cormorant Garamond.
// - تاريخ هجري تحت الميلادي (٣ رجب ١٤٤٨ هـ).
// - تأكيد الحضور (القالب) + تهنئة صوتية + رفع صور الضيوف تحته (guestExtras — utils/oneOffFixes.js) — كله بيوصل للوحة العميلة.
// - البرنامج ولوحة ألوان اللبس مستخبيين (مفيش تفاصيل ليهم)، والساعة مستخبية لحد ما المالك يبعتها.
// - (2026-11-13) كلام جديد من المالك: فقرتين حوالين الأسامي بدل البسملة و"بقلوبٍ يملؤها..." و"نبدأ معًا حكاية عمر..."،
//   عنوان المكان "حيث يجمعنا الفرح / وِجهة ليلتنا المميزة"، قسم الضيوف بقى رسالة الترحيب + تنويه المسبح (kbn1/kbn2)،
//   عنوان تأكيد الحضور، وكلام التهنئة الصوتية ورفع الصور. الكلام نفسه في البيانات (oneOffFix G55weuy-texts-nov13)
//   عشان المحرر يفضل شغال؛ هنا التنويه والستايل وكلام الإضافات بس.
// البيانات في utils/oneOffFixes.js (G55weuy-kholoud-bilal).
const { asset } = require('./_asset');

const SHORT = 'G55weuy';
const DIR = `/custom/${SHORT}/`;

// زخارف القالب (SVG) بالأخضر → دهبي
const GREENS = {
  '#7f957b': '#c9a26b',
  '#8f9a88': '#d8c29a',
  '#5f7a5f': '#a9824e',
  '#6f856c': '#b8925d',
  '#677d63': '#c08a7a',
  '#5b7058': '#b97f6f',
};

// تنويه المسبح (المالك 2026-11-13) — جوه رسالة الترحيب
const POOL_T = 'تنويه بمحبة 💫';
const POOL_P = 'نظرًا لوجود مسبح في المكان،\nنرجو من الأهالي الأعزاء الحرص\nعلى أطفالهم ومتابعتهم طوال الحفل.';
const FLOWERS = ['fl-b', 'fl-c', 'fl-d', 'fl-e', 'fl-f', 'fl-g', 'fl-gm', 'fl-hm'];

// التهنئة الصوتية ورفع الصور جوه قسم تأكيد الحضور — بالفصحى (العميلة من السعودية) وبكلام الخطوبة
const EXTRAS_OPTS = `<script>window.MITHAQ_EXTRAS_OPTS = { anchor: '#mithaq-rsvp', lang: 'ar', attend: false, t: {
  vEyebrow: 'رسالة بصوتك', vTitle: 'سيبوا لنا صوت يفضل معانا 🎙️',
  vSub: 'نفسنا نسمع منكم كلمة حلوة، دعوة من القلب،\\nتهنئة بسيطة نفتكرها ونبتسم كل ما نسمعها.\\nسجّلوا لنا صوتكم،\\nوخلوه ذكرى حلوة من يومنا المميز.',
  vNote: 'اضغطوا مطوّلًا على الميكروفون للتسجيل،\\nأو اضغطوا مرة واحدة لبدء التسجيل',
  idle: 'اضغط للتسجيل', slide: 'اسحب للإلغاء', namePh: 'اكتب اسمك',
  sending: 'جارٍ إرسال تهنئتك…', sent: 'وصلت تهنئتك للخطيبين 🤍', cancelled: 'تم إلغاء التسجيل', short: 'التسجيل قصير جدًا — سجّل مرة أخرى',
  max: 'أقصى مدة دقيقة واحدة', noMic: 'هذا المتصفح لا يدعم تسجيل الصوت', allowMic: 'اسمح للمتصفح باستخدام المايك لتسجيل تهنئتك',
  needName: 'اكتب اسمك أولًا', fail: 'تعذّر الإرسال، حاول مرة أخرى', preview: 'هذه معاينة — لن تُرسل التهنئة', edit: 'التسجيل للضيوف — جرّبه من رابط الدعوة',
  pEyebrow: 'ألبوم الخطوبة', pTitle: 'صوّروا اللحظة وخلوها ذكرى 📸',
  pSub: 'أكيد كل واحد فيكم هيشوف اليوم\\nبعين مختلفة، وده اللي نفسنا نحتفظ بيه.\\nارفعوا صوركم من الحفلة\\nوشاركونا اللحظات الحلوة\\nاللي يمكن تفوتنا وسط الفرحة.',
  pName: 'اسمك إيه؟', pNamePh: 'اسمك الكريم', pAdd: 'شاركونا صوركم هنا 📸', pNote: 'صوركم تصل للخطيبين فقط — ولا يراها غيرهما',
  pSent: 'شكرًا لك! وصلت صورك', pNeedName: 'اكتب اسمك أولًا', pType: 'اختر صورًا فقط',
  pFail: 'لم تُرفع بعض الصور — حاول مرة أخرى', pNet: 'انقطع الاتصال — حاول مرة أخرى', pPreview: 'هذه معاينة — لن تُرفع الصور',
  del: 'حذف', play: 'تشغيل', stop: 'إيقاف', send: 'إرسال', mic: 'اضغط مطوّلًا لتسجيل تهنئة صوتية',
  pCount: function (n) { return n === 1 ? 'تم إرسال صورة واحدة' : n === 2 ? 'تم إرسال صورتين' : 'تم إرسال ' + n + (n <= 10 ? ' صور' : ' صورة'); },
  pUp: function (i, n) { return 'جارٍ رفع ' + i + ' من ' + n + '…'; }
} };</script>`;

const CSS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600&display=swap">
<style id="kb-theme">
:root{--paper:#faf5ee;--ink:#3b2e2a;--green:#8c5a4b;--sage:#c9a26b;--sage-d:#b08a57;--line:#dcc6a3;--soft:#7a675f;--pearl:#fffaf5}
html{background:#f3e9e1}
body{background-color:#faf5ee}
#coverScreen{background:#f3e6dc}
/* الأسامي على الظرف → المونوجرام "خ ب" */
.env-names{display:none!important}
/* (.env img بيمدّ أي صورة على الظرف كله — هنا مقاس ومكان المونوجرام بالظبط) */
/* (2026-11-18) مونوجرام المالك الجديد (طولي، وردي زي صورته بالظبط) — المقاس بالطول عشان مايخبطش في التاريخ */
.env .kb-mono-art{position:absolute;inset:auto;left:50%;top:27.4%;width:auto;height:20cqw;transform:translateX(-50%);pointer-events:none}
.env-date{color:#85544a}
.cv-top{color:#7e4a3f}
.cv-hint{color:#61372a}
.h{font-family:'Aref Ruqaa',var(--ar);color:#8c5a4b;font-weight:700}
.p,.bism,.bye{color:#3b2e2a}
.names{color:#7a4a3e}
.names-lat{font-family:'Amiri',serif;letter-spacing:0;font-size:5.4cqw;color:#986a4f;font-weight:400;direction:rtl}
.date-line{color:#5b3b33}
.kb-hijri{font-family:'Reem Kufi',var(--ar);font-size:4.4cqw;font-weight:500;color:#986a4f;margin-top:1.6cqw;letter-spacing:0}
.big-day{color:#7a4a3e}
.month,.year{color:#5b3b33}
/* (المالك 2026-11-18) "موعد فرحتنا": التاريخ أرقام جنب بعض 12/12/2026 بدل اليوم الكبير والشهر والسنة تحت بعض */
.s-date [data-elem-id="pp12"],.s-date [data-elem-id="pp13"],.s-date [data-elem-id="pp14"]{display:none!important}
.kb-date-row{direction:ltr;unicode-bidi:isolate;display:flex;justify-content:center;align-items:baseline;gap:2.6cqw;margin:5cqw auto 3cqw;
  font-family:'Cormorant Garamond',serif;font-weight:500;font-size:15cqw;line-height:1;color:#7a4a3e;font-variant-numeric:lining-nums;font-feature-settings:"lnum"}
.kb-date-row i{font-style:normal;font-weight:300;font-size:.62em;color:#c9a26b;transform:translateY(-.08em)}
/* تحت "شكرًا لردّكم، ولكم منّا كل المحبة" في الختام */
.kb-end-date{direction:ltr;unicode-bidi:isolate;margin-top:3.2cqw;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:5.6cqw;
  letter-spacing:.14em;color:#986a4f;font-variant-numeric:lining-nums;font-feature-settings:"lnum"}
/* الجملة اللي فوق على الظرف من بره: أعلى شوية — مسافة بينها وبين الظرف */
.cv-top{top:16.6%}
.cd>div{border-color:#dcc6a3;background:rgba(255,250,245,.6)}
.cd b{color:#7a4a3e}
.cd span{font-family:'Reem Kufi',var(--ar);color:#986a4f}
.pill{border-color:#d9bfa3;color:#5b3b33}
.pill.green{background:linear-gradient(#e7b3a5,#cf9483);border-color:#c48676;color:#fff;box-shadow:0 1cqw 2.6cqw rgba(160,95,80,.28),inset 0 1px 0 rgba(255,255,255,.3)}
.arch{border-color:rgba(201,162,107,.55);box-shadow:inset 0 0 0 1.6cqw rgba(255,255,255,.35),inset 0 0 0 1.75cqw rgba(201,162,107,.35),0 1cqw 4cqw rgba(120,80,60,.06)}
.ripple{border-color:rgba(201,162,107,.7)}
.venue{color:#3b2e2a}
.city{color:#6a5048}
.form label.lb{color:#5b3b33}
.field:focus{border-color:#c9a26b;box-shadow:0 0 0 .8cqw rgba(201,162,107,.18)}
.radio input::after{background:#cf9483}
.sent b{color:#8c5a4b}
/* (2026-11-13) عنوان المكان سطرين أطول من "نلتقي هنا" — أصغر شوية عشان كل سطر يفضل سطر */
[data-elem-id="pp31"]{font-size:8cqw;line-height:1.55}
.s-notes .thanks{font-family:'Aref Ruqaa',var(--ar);font-size:6.4cqw;color:#8c5a4b}
/* تنويه المسبح — كارت هادي بنفس خطوط ودهبي الدعوة */
.kb-note{margin:0 auto;max-width:80cqw;padding:5cqw 6cqw 5.4cqw;border:1px solid #dcc6a3;border-radius:3cqw;background:rgba(255,250,245,.62);box-shadow:0 1.2cqw 3.6cqw rgba(120,80,60,.07)}
.kb-note-t{font:700 6cqw/1.5 'Aref Ruqaa',var(--ar);color:#8c5a4b}
.kb-note-p{margin-top:1.4cqw;font:400 4.5cqw/1.9 'Amiri',serif;color:#3b2e2a;white-space:pre-line}
/* مفيش ساعة لسه — السطر مستخبّي */
[data-elem-id="pp15"]{display:none!important}
/* زرار الموسيقى بألوان الدعوة */
#music{color:#a8685a;border-color:#dcc6a3}
/* بعد "بانتظاركم بكل محبة" مفيش فراغ كبير (قسم ألوان اللبس مستخبّي) */
[data-elem-id="pp45"]{margin-top:8cqw!important}
/* التهنئة الصوتية ورفع الصور: جزء من الدعوة نفسها (نفس الورق والخطوط والمقاسات) — مش بلوك أبيض منفصل */
#mithaq-extras.gx{--gx-ink:#3b2e2a;--gx-soft:#7a675f;--gx-gold:#c9a26b;--gx-gold2:#e3ab9d;--gx-line:rgba(59,46,42,.22);--gx-paper:transparent;--gx-card:rgba(255,250,245,.62);
  --gx-disp:'Aref Ruqaa','Amiri',serif;--gx-body:'Amiri','Times New Roman',serif;--gx-caps:'Reem Kufi','Amiri',serif;
  background:transparent;padding:4cqw 0 2cqw;margin:0}
#mithaq-extras .gx-orn{margin-bottom:7cqw}
#mithaq-extras .gx-card{max-width:none;padding:8cqw 5.5cqw 7cqw;border-radius:3cqw;border:1px solid #dcc6a3;box-shadow:0 1.4cqw 4cqw rgba(120,80,60,.08)}
#mithaq-extras .gx-card::before{inset:1.6cqw;border-radius:2cqw;border-color:rgba(201,162,107,.45)}
#mithaq-extras .gx-card + .gx-card{margin-top:7cqw}
#mithaq-extras .gx-eyebrow{font:500 3.7cqw/1.4 'Reem Kufi',var(--ar);color:#986a4f;letter-spacing:0}
#mithaq-extras .gx-title{margin-top:1.6cqw;font:700 7.6cqw/1.45 'Aref Ruqaa',var(--ar);color:#8c5a4b;-webkit-text-stroke:0;white-space:normal;text-wrap:balance}
#mithaq-extras .gx-sub{margin-top:1.4cqw;font:400 4.4cqw/1.85 'Amiri',serif;color:#6a5048;white-space:pre-line;text-wrap:balance}
#mithaq-extras .gx-vnote{margin-top:3cqw;font:400 3.9cqw/1.75 'Amiri',serif;color:#7a675f;white-space:pre-line}
#mithaq-extras .gx-add svg{display:none}
#mithaq-extras .gx-rec{margin-top:6cqw}
#mithaq-extras .gx-idle,#mithaq-extras .gx-slide{font-size:4.3cqw}
#mithaq-extras .gx-label{font:500 3.8cqw/1.4 'Reem Kufi',var(--ar);color:#5b3b33;letter-spacing:0}
#mithaq-extras .gx-input{font:400 4.6cqw/1.4 'Amiri',serif;color:#3b2e2a}
#mithaq-extras .gx-btn,#mithaq-extras .gx-mic{background:linear-gradient(#e7b3a5,#cf9483);border-color:#c48676;color:#fff}
#mithaq-extras .gx-btn{border-radius:99px;font:700 4.6cqw/1 'Amiri',serif;letter-spacing:0;height:12cqw;min-height:44px;box-shadow:0 1cqw 2.6cqw rgba(160,95,80,.28)}
#mithaq-extras .gx-note{font:400 3.7cqw/1.7 'Amiri',serif;color:#7a675f}
#mithaq-extras .gx-sent-t{font:700 6.4cqw/1.4 'Aref Ruqaa',var(--ar);color:#8c5a4b}
#mithaq-extras .gx-sent-n,#mithaq-extras .gx-status,#mithaq-extras .gx-toast,#mithaq-extras .gx-err{font-family:'Amiri',serif;font-size:4cqw}
</style>`;

// (2026-11-18 بطلب المالك) زرار "أضف الموعد للتقويم" (#cal تحت العدّاد) بقى مناسب لكل موبايل، وبيفكّر الضيف قبلها بـ 3 أيام:
//  • آيفون: تقويم أبل على طول (ملف /i/G55weuy/calendar.ics فيه تنبيه قبلها بـ 3 أيام). جوه إنستجرام/واتساب/كروم
//    بيتسلّم لسفاري (x-safari، iOS 17+)، ولو مانفعش جملة صغيرة تقوله يفتح في Safari.
//  • أندرويد والكمبيوتر: لوحة صغيرة بلون الدعوة فيها اختيارين: تقويم الموبايل (سامسونج وغيره — نفس الملف بالتنبيه)
//    أو تقويم Google (بيفتح الأبلكيشن والحدث جاهز). جوه متصفح التطبيقات على أندرويد الملف بيتفتح في كروم.
//  القالب كان بيفتح تقويم جوجل بس وباسم "بلال صبري" — دلوقتي العنوان "خطوبة خلود وبلال" والساعة 8 مساءً زي الدعوة.
const CAL_TITLE = 'خطوبة خلود وبلال';
const CAL_CSS = `<style id="kb-cal-style">
.kb-cal-note{margin:3.2cqw auto 0;font-family:'Amiri',serif;font-size:4cqw;line-height:1.5;color:#986a4f}
.kb-cal{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:flex-end;justify-content:center;background:rgba(60,36,28,0);transition:background .3s ease;direction:rtl}
.kb-cal.on{background:rgba(60,36,28,.42)}
.kb-cal-card{width:100%;max-width:460px;box-sizing:border-box;padding:22px 20px calc(18px + env(safe-area-inset-bottom,0px));border-radius:26px 26px 0 0;
  background:linear-gradient(#fdf8f3,#f8eee6);box-shadow:0 -12px 40px rgba(90,50,40,.25);transform:translateY(105%);transition:transform .38s cubic-bezier(.2,.8,.2,1);text-align:center;font-family:'Amiri',serif;color:#5b3b33}
.kb-cal.on .kb-cal-card{transform:none}
.kb-cal-bar{width:40px;height:4px;border-radius:4px;background:#e2cbbb;margin:-8px auto 14px}
.kb-cal-t{font-family:'Aref Ruqaa','Amiri',serif;font-size:23px;line-height:1.3;color:#8c5a4b;margin:0}
.kb-cal-s{font-size:15px;line-height:1.6;color:#986a4f;margin:4px 0 16px}
.kb-cal-o{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;margin:0 0 10px;padding:13px 16px;border:1px solid #e6cfc0;border-radius:18px;background:#fff;
  font:inherit;color:inherit;text-align:right;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(160,95,80,.08)}
.kb-cal-o:active{transform:scale(.985);background:#fbf3ee}
.kb-cal-o i{flex:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:13px;background:linear-gradient(#f3d9cf,#e7b3a5);color:#fff}
.kb-cal-o i svg{width:24px;height:24px}
.kb-cal-o b{display:block;font-weight:700;font-size:18px;line-height:1.35;color:#5b3b33}
.kb-cal-o small{display:block;font-size:13.5px;line-height:1.45;color:#a07a66}
.kb-cal-x{margin-top:4px;padding:10px 24px;border:0;background:none;font:inherit;font-size:16px;color:#a07a66;cursor:pointer}
.kb-cal-hint{position:fixed;left:50%;bottom:24px;z-index:2147483000;transform:translateX(-50%);width:max-content;max-width:calc(100% - 40px);padding:12px 20px;border-radius:14px;
  background:rgba(70,40,32,.94);color:#fbf4ee;font:400 15px/1.7 'Amiri',serif;text-align:center;direction:rtl;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:opacity .3s ease}
</style>`;
const CAL_JS = `<script id="kb-cal">(function () {
  var a = document.getElementById('cal');
  if (!a) return;
  var C = window.WEDDING_CONFIG || {};
  var ics = location.origin + '/i/${SHORT}/calendar.ics';
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var appBrowser = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|Snapchat|Line\\/|LinkedInApp|Twitter|; wv\\)/i.test(ua);
  var notSafari = !/Safari\\//.test(ua) || appBrowser || /GSA\\/|CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
  a.removeAttribute('target');
  a.setAttribute('href', ics);
  var note = document.createElement('p');
  note.className = 'kb-cal-note';
  note.textContent = 'ويفكّركم قبل الخطوبة بـ ٣ أيام 🤍';
  a.parentNode.insertBefore(note, a.nextSibling);

  // تقويم Google: نفس الساعة اللي في الدعوة (8 مساءً) لحد 1 بالليل
  function gLink() {
    var t = (C.countdown || {}), p = function (n) { return (n < 10 ? '0' : '') + n; };
    var s = new Date(Date.UTC(t.year, t.monthIndex, t.day, t.hour, t.minute)), e = new Date(s.getTime() + 5 * 3600e3);
    var f = function (d) { return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + '00'; };
    var where = [C.venueName, C.venueCity].filter(Boolean).join('، ');
    var det = (C.venueMapDirectLink ? 'الموقع على الخريطة: ' + C.venueMapDirectLink + '\\n' : '') + 'الدعوة: ' + location.origin + '/i/${SHORT}';
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('${CAL_TITLE}') + '&dates=' + f(s) + '/' + f(e)
      + '&location=' + encodeURIComponent(where) + '&details=' + encodeURIComponent(det);
  }
  function fileAndroid() {
    // متصفح جوه التطبيقات (إنستجرام/فيسبوك) مابينزّلش ملفات — بنفتحه في كروم
    if (android && appBrowser) {
      location.href = 'intent://' + location.host + '/i/${SHORT}/calendar.ics#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(ics) + ';end';
      return;
    }
    var d = document.createElement('a');
    d.href = ics; d.download = 'khetba-kholoud-bilal.ics'; d.style.display = 'none';
    document.body.appendChild(d); d.click();
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1000);
  }
  var CAL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M12 12.6v2.6l1.7 1"/></svg>';
  var G_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M15 14.2a3 3 0 1 1-.9-2.2M15 14.2h-2.6"/></svg>';
  function sheet() {
    if (document.querySelector('.kb-cal')) return;
    var w = document.createElement('div');
    w.className = 'kb-cal';
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', 'أضف الموعد للتقويم');
    var fileName = android ? 'تقويم الموبايل' : 'ملف التقويم';
    var fileSub = android ? 'سامسونج وأي تقويم على الموبايل — بتنبيه قبلها بـ ٣ أيام' : 'Outlook وتقويم أبل — بتنبيه قبلها بـ ٣ أيام';
    w.innerHTML = '<div class="kb-cal-card"><div class="kb-cal-bar"></div><p class="kb-cal-t">احفظوا الموعد</p><p class="kb-cal-s">السبت <span dir="ltr">12/12/2026</span> — الساعة الثامنة مساءً</p>'
      + '<button type="button" class="kb-cal-o" data-k="file"><i>' + CAL_ICON + '</i><span><b>' + fileName + '</b><small>' + fileSub + '</small></span></button>'
      + '<a class="kb-cal-o" data-k="g" target="_blank" rel="noopener"><i>' + G_ICON + '</i><span><b>تقويم Google</b><small>بيفتح التقويم والموعد جاهز للحفظ</small></span></a>'
      + '<button type="button" class="kb-cal-x">إلغاء</button></div>';
    document.body.appendChild(w);
    w.querySelector('[data-k="g"]').href = gLink();
    function close() { w.classList.remove('on'); setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 400); }
    w.addEventListener('click', function (e) {
      if (e.target === w || e.target.closest('.kb-cal-x')) return close();
      var o = e.target.closest('.kb-cal-o');
      if (!o) return;
      if (o.getAttribute('data-k') === 'file') { e.preventDefault(); fileAndroid(); }
      setTimeout(close, 250);
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('on'); }); });
  }
  function hint() {
    var d = document.createElement('div');
    d.className = 'kb-cal-hint';
    d.setAttribute('role', 'status');
    d.innerHTML = 'عشان تضيف الموعد لتقويم الآيفون<br>افتح الدعوة في Safari من زرار <b dir="ltr">•••</b>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = '1'; });
    var close = function () { d.style.opacity = '0'; setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 350); };
    d.addEventListener('click', close);
    setTimeout(close, 7000);
  }
  a.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!ios) return sheet();
    if (!notSafari) { location.href = ics; return; }
    var left = false;
    var mark = function () { if (document.visibilityState === 'hidden') left = true; };
    document.addEventListener('visibilitychange', mark);
    window.addEventListener('pagehide', function () { left = true; });
    location.href = 'x-safari-' + ics;
    setTimeout(function () { document.removeEventListener('visibilitychange', mark); if (!left) hint(); }, 1800);
  }, true);
})();</script>`;

module.exports = {
  shortId: SHORT,

  // ملف الموعد (routes/invitations.js → /i/G55weuy/calendar.ics): 8 مساءً لحد 1 بالليل، تنبيه قبلها بـ 3 أيام
  calendar: { title: CAL_TITLE, hours: 5, alarms: ['-P3D'] },

  // كارت لينك المشاركة: الظرف والأسامي والتاريخين والمكان (1200×630)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة خطوبة خلود وبلال',
    description: 'السبت ١٢ ديسمبر ٢٠٢٦ · منتجع أوراق ٢ — الرياض',
  },

  // في المحرر الزرار مابيتداسش (الضغط = تعديل) — فمفيش داعي للسكريبت
  render({ editMode } = {}) {
    return editMode ? {} : { head: CAL_CSS, bodyEnd: CAL_JS };
  },

  transform(html) {
    let out = html;
    // (2026-11-18 بطلب المالك) الأغنية: "من غير كلام" — الملف اللي بعته (فيد صغير في الأول والآخر عشان اللفّة)
    out = out.split('/templates/pearl-peony/song.mp3').join(asset(`${DIR}song.mp3`));
    out = out.split('/templates/pearl-peony/pin.webp').join(asset(`${DIR}pin.webp`));
    out = out.split('/templates/pearl-peony/cover-bg.webp').join(asset(`${DIR}cover-bg.webp`));
    out = out.split('/templates/pearl-peony/envelope.webp').join(asset(`${DIR}envelope.webp`));
    // ورد الدعوة من جوه وردي زي فاوانيا الظرف (نفس الصور، اللون بس — scratch kb2/pinkfl.py)
    for (const f of FLOWERS) out = out.split(`/templates/pearl-peony/${f}.webp`).join(asset(`${DIR}${f}.webp`));
    // المونوجرام مكان الأسامي على الظرف (جوه .env عشان ينزل معاه)
    out = out.replace(/(<div class="env-t env-names[^"]*">[\s\S]*?<\/div>)/, (m) => `${m}
      <img class="kb-mono-art" src="${asset(`${DIR}mono.webp`)}" alt="خ ب">`);
    for (const [g, c] of Object.entries(GREENS)) out = out.split(g).join(c);
    // (المالك 2026-11-18) سطر التاريخ في آخر الكارت الأولاني (السبت 12 ديسمبر 2026 + الهجري تحته) اتشال —
    // الموعد مكتوب في "موعد فرحنا" تحته على طول: "مش عايز يبقى الميعاد مكرر مرتين"
    out = out.replace(/<p class="date-line[^"]*"[^>]*data-elem-id="pp10"[^>]*><\/p>\s*/, '');
    // (المالك 2026-11-18) "موعد فرحتنا": 12/12/2026 أرقام جنب بعض (اليوم/الشهر/السنة القدام مستخبيين بالـ CSS)
    out = out.replace(/(<div class="big-day[^"]*"[^>]*data-elem-id="pp12"[^>]*><\/div>)/, (m) => `<p class="kb-date-row r d1" dir="ltr"><span>12</span><i>/</i><span>12</span><i>/</i><span>2026</span></p>\n    ${m}`);
    // ... وتحت "شكرًا لردّكم، ولكم منّا كل المحبة" في الختام
    out = out.replace(/(<p class="p r d1" data-elem-id="pp60"><\/p>)/, (m) => `${m}\n    <p class="kb-end-date r d2" dir="ltr">12/12/2026</p>`);
    // تنويه المسبح (المالك 2026-11-13) — جوه رسالة الترحيب بعد آخر جملة وقبل "مستنيينكم بكل الحب"
    out = out.replace(/(<p class="p r" data-elem-id="pp49"><\/p>)/, (m) => `${m}
    <svg class="orn sm r" viewBox="0 0 240 22" aria-hidden="true"><use href="#orn-dot"/></svg>
    <div class="kb-note r">
      <p class="kb-note-t" data-elem-id="kbn1">${POOL_T}</p>
      <p class="kb-note-p" data-elem-id="kbn2">${POOL_P}</p>
    </div>`);
    // التهنئة الصوتية ورفع الصور: جوه قسم تأكيد الحضور، تحت الفورم على طول
    out = out.replace(/<\/head>/i, () => `${CSS}\n${EXTRAS_OPTS}\n</head>`);
    return out;
  },
};
