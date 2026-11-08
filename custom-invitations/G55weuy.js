// دعوة خطوبة خلود البغدادي وبلال صبري (السبت 12/12/2026 — منتجع أوراق 2، ديراب، الرياض) — بطلب المالك
// (2026-11-09): عميلة من السعودية. على قالب Pearl Peony العربي، بألوان الخطوبة اللي بعتها:
//   Ivory #FAF5EE خلفية · Blush/Peach/Deep peach للشريطة والزراير · Champagne · Gold #C9A26B للخطوط والختم ·
//   Cocoa #3B2E2A للنصوص · Walnut #986A4F للعناوين الصغيرة.
// - الظرف: الشريطة بقت خوخي بدل الأخضر، والختم دهبي محفور عليه "خ و ب" بخط الرقعة (client/public/custom/G55weuy/).
// - الدبوس (مكان الحفل) خوخي بدل الأخضر، والزخارف الخضرا كلها دهبي.
// - الخطوط: عربي Aref Ruqaa (الأسامي والعناوين) + Amiri (النص) + Reem Kufi (الكلام الصغير)، إنجليزي Cormorant Garamond.
// - تاريخ هجري تحت الميلادي (٣ رجب ١٤٤٨ هـ).
// - تأكيد الحضور (القالب) + تهنئة صوتية + رفع صور الضيوف تحته (guestExtras — utils/oneOffFixes.js) — كله بيوصل للوحة العميلة.
// - البرنامج ولوحة ألوان اللبس مستخبيين (مفيش تفاصيل ليهم)، والساعة مستخبية لحد ما المالك يبعتها.
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

const HIJRI = 'السبت ٣ رجب ١٤٤٨ هـ';

// التهنئة الصوتية ورفع الصور جوه قسم تأكيد الحضور — بالفصحى (العميلة من السعودية) وبكلام الخطوبة
const EXTRAS_OPTS = `<script>window.MITHAQ_EXTRAS_OPTS = { anchor: '#mithaq-rsvp', lang: 'ar', attend: false, t: {
  vEyebrow: 'رسالة بصوتك', vTitle: 'سجّل تهنئتك', vSub: 'اضغط مطوّلًا على المايك وتحدّث — أو اضغط مرة واحدة للتسجيل دون إمساك',
  idle: 'اضغط للتسجيل', slide: 'اسحب للإلغاء', namePh: 'اكتب اسمك',
  sending: 'جارٍ إرسال تهنئتك…', sent: 'وصلت تهنئتك للخطيبين 🤍', cancelled: 'تم إلغاء التسجيل', short: 'التسجيل قصير جدًا — سجّل مرة أخرى',
  max: 'أقصى مدة دقيقة واحدة', noMic: 'هذا المتصفح لا يدعم تسجيل الصوت', allowMic: 'اسمح للمتصفح باستخدام المايك لتسجيل تهنئتك',
  needName: 'اكتب اسمك أولًا', fail: 'تعذّر الإرسال، حاول مرة أخرى', preview: 'هذه معاينة — لن تُرسل التهنئة', edit: 'التسجيل للضيوف — جرّبه من رابط الدعوة',
  pEyebrow: 'ألبوم الخطوبة', pTitle: 'شاركونا اللحظات', pSub: 'التقطتم صورًا في الحفل؟ ارفعوها هنا ليحتفظ الخطيبان بكل لحظة جميلة',
  pName: 'اسمك', pNamePh: 'اسمك الكريم', pAdd: 'ارفع صورك', pNote: 'صوركم تصل للخطيبين فقط — ولا يراها غيرهما',
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
#coverScreen{background:#f6ede6}
.env-names{color:#5b3b33}
.env-date{color:#6a5048}
/* الحروف محفورة في الختم الدهبي نفسه */
.env-mono{display:none!important}
.h{font-family:'Aref Ruqaa',var(--ar);color:#8c5a4b;font-weight:700}
.p,.bism,.bye{color:#3b2e2a}
.names{color:#7a4a3e}
.names-lat{font-family:'Amiri',serif;letter-spacing:0;font-size:5.4cqw;color:#986a4f;font-weight:400;direction:rtl}
.date-line{color:#5b3b33}
.kb-hijri{font-family:'Reem Kufi',var(--ar);font-size:4.4cqw;font-weight:500;color:#986a4f;margin-top:1.6cqw;letter-spacing:0}
.big-day{color:#7a4a3e}
.month,.year{color:#5b3b33}
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
/* مفيش ساعة لسه — السطر مستخبّي */
[data-elem-id="pp15"]{display:none!important}
/* التهنئة الصوتية ورفع الصور: بنفس ألوان الدعوة وخطوطها */
#mithaq-extras.gx{--gx-ink:#3b2e2a;--gx-soft:#7a675f;--gx-gold:#c9a26b;--gx-gold2:#e3ab9d;--gx-line:rgba(59,46,42,.22);--gx-paper:#fffaf5;--gx-card:#fdf6f1;
  --gx-disp:'Aref Ruqaa','Amiri',serif;--gx-body:'Amiri','Times New Roman',serif;--gx-caps:'Reem Kufi','Amiri',serif;margin:10cqw 6cqw 0}
#mithaq-extras .gx-card{border-radius:4cqw}
#mithaq-extras .gx-title{color:#8c5a4b}
#mithaq-extras .gx-btn,#mithaq-extras .gx-mic{background:linear-gradient(#e7b3a5,#cf9483);border-color:#c48676;color:#fff}
</style>`;

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الظرف الخوخي والختم الدهبي والأسامي (1200×630)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة خطوبة خلود وبلال',
    description: 'السبت ١٢ ديسمبر ٢٠٢٦ · منتجع أوراق ٢ — الرياض',
  },

  render() {
    return {};
  },

  transform(html) {
    let out = html;
    out = out.split('/templates/pearl-peony/envelope.webp').join(asset(`${DIR}envelope.webp`));
    out = out.split('/templates/pearl-peony/pin.webp').join(asset(`${DIR}pin.webp`));
    for (const [g, c] of Object.entries(GREENS)) out = out.split(g).join(c);
    // التاريخ الهجري تحت سطر التاريخ الميلادي
    out = out.replace(/(<p class="date-line[^"]*"[^>]*data-elem-id="pp10"[^>]*><\/p>)/, (m) => `${m}\n    <p class="kb-hijri r d2">${HIJRI}</p>`);
    // التهنئة الصوتية ورفع الصور: جوه قسم تأكيد الحضور، تحت الفورم على طول
    out = out.replace(/<\/head>/i, () => `${CSS}\n${EXTRAS_OPTS}\n</head>`);
    return out;
  },
};
