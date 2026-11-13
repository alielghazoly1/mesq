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

const HIJRI = 'السبت ٣ رجب ١٤٤٨ هـ';
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
.env .kb-mono-art{position:absolute;inset:auto;left:50%;top:27.4%;width:31cqw;height:auto;transform:translateX(-50%);pointer-events:none}
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

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الظرف والأسامي والتاريخين والمكان (1200×630)
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
    out = out.split('/templates/pearl-peony/pin.webp').join(asset(`${DIR}pin.webp`));
    out = out.split('/templates/pearl-peony/cover-bg.webp').join(asset(`${DIR}cover-bg.webp`));
    out = out.split('/templates/pearl-peony/envelope.webp').join(asset(`${DIR}envelope.webp`));
    // ورد الدعوة من جوه وردي زي فاوانيا الظرف (نفس الصور، اللون بس — scratch kb2/pinkfl.py)
    for (const f of FLOWERS) out = out.split(`/templates/pearl-peony/${f}.webp`).join(asset(`${DIR}${f}.webp`));
    // المونوجرام مكان الأسامي على الظرف (جوه .env عشان ينزل معاه)
    out = out.replace(/(<div class="env-t env-names[^"]*">[\s\S]*?<\/div>)/, (m) => `${m}
      <img class="kb-mono-art" src="${asset(`${DIR}mono.webp`)}" alt="خ ب">`);
    for (const [g, c] of Object.entries(GREENS)) out = out.split(g).join(c);
    // التاريخ الهجري تحت سطر التاريخ الميلادي
    out = out.replace(/(<p class="date-line[^"]*"[^>]*data-elem-id="pp10"[^>]*><\/p>)/, (m) => `${m}\n    <p class="kb-hijri r d2">${HIJRI}</p>`);
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
