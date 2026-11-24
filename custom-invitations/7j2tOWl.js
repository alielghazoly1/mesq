// دعوة 7j2tOWl (Mother of Pearl عربي) — خطوبة مريم ومعاذ، الثلاثاء 8/12/2026 الساعة 8 مساءً — قاعة الإليزيه، الإسكندرية.
// بطلب المالك (2026-11-24):
//  • صورة القاعة الحقيقية (اللي بعتها) مكان رسمة المكان (mp27) — في برواز لؤلؤي ناعم، زي ما هي من غير قص ولا تكبير.
//  • تهاني صوتية من الضيوف (فويس نوت) مكان تأكيد الحضور (الجولة 2: الفورم اتشال — الاسم + هتحضر؟ جوه كارت التهنئة) → لوحة صاحبة الدعوة (guestExtras.voice — oneOffFix 7j2tOWl-mariam-moaz).
//  • الأسامي والميعاد والمكان والخطوبة من نفس الـ oneOffFix.
// الدعوة الكاستم مابتاخدش فيديو الفتح الواحد تلقائي (utils/renderInvitation.js)، فبنطبّقه هنا زي XIUXYIT.
const { asset } = require('./_asset');
const { makeOneVideo } = require('./_oneVideo');

const SHORT = '7j2tOWl';
const T = '/templates/mother-of-pearl/';
const HALL = asset(`/custom/${SHORT}/hall.webp`);
// (المالك 2026-11-24، الجولة 3) صور العروسين الأربعة مكان صور المعرض (mp16–19) — مقصوصة 2:3 من الصور اللي بعتها
const GALLERY = [1, 2, 3, 4].map((n) => asset(`/custom/${SHORT}/g${n}.webp`));
const oneVideo = makeOneVideo({ short: 'mother-of-pearl', openSrc: asset(`${T}open.mp4`), bps: 253000, dur: 10.08 });

const CSS = `<style id="mj-css">
/* الصورة مايصحش تتلوّن بالـ multiply بتاع كلام القسم */
[data-section="venue"] .loc-in{mix-blend-mode:normal}
.loc-img.mj-hall{width:92%;max-width:420px;margin-top:30px;padding:7px;border-radius:20px;
  background:linear-gradient(145deg,#fdfbf7 0%,#f1e9df 48%,#fbf7f1 100%);
  box-shadow:0 22px 44px -26px rgba(var(--fg-rgb),.55),0 0 0 1px rgba(var(--fg-rgb),.13),inset 0 1px 0 rgba(255,255,255,.9)}
.loc-img.mj-hall::after{content:"";position:absolute;inset:7px;border-radius:14px;pointer-events:none;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.55),inset 0 0 24px rgba(40,20,30,.18)}
.loc-img.mj-hall img{display:block;width:100%;height:auto;aspect-ratio:960/615;object-fit:cover;border-radius:14px}
/* (المالك 2026-11-24، الجولة 2) تأكيد الحضور (الاسم / هتشاركونا / اكتبوا تهنئة) اتشال — التهنئة الصوتية بس.
   الكارت جوه #mithaq-rsvp (anchor)، فبنخبّي الفورم بس (.rs-in) مش القسم. */
/* (الجولة 3) الدريس كود: لون واحد — بني غامق (مع دايرة باللون جنب الاسم) */
.dr-in [data-elem-id="mp45"]::before{content:"";display:inline-block;width:.9em;height:.9em;border-radius:50%;margin-inline-end:.45em;vertical-align:-.1em;
  background:radial-gradient(circle at 35% 30%,#6b4a37,#3b2418 75%);box-shadow:0 0 0 1.5px #fdfcfa,0 0 0 2.5px rgba(76,95,118,.35)}
#mithaq-rsvp > .rs-in{display:none!important}
#mithaq-rsvp{padding-top:8px}
/* التهنئة الصوتية بألوان Mother of Pearl (كحلي هادي + لؤلؤي) */
#mithaq-extras.gx{--gx-ink:#3d4d62;--gx-soft:rgba(76,95,118,.82);--gx-gold:#9fb1c6;--gx-gold2:#c9d4e0;--gx-line:rgba(76,95,118,.24);--gx-red:#a24a5a;
  --gx-paper:transparent;--gx-card:linear-gradient(165deg,#fefdfb 0%,#f4f1ed 52%,#fbfaf8 100%);padding:0 18px 90px}
#mithaq-extras .gx-orn{display:none}
#mithaq-extras .gx-card{max-width:380px;padding:44px 24px 30px;background:var(--gx-card);border-radius:26px;
  box-shadow:0 1px 1px rgba(40,55,75,.08),0 6px 14px rgba(40,55,75,.05),0 26px 48px -26px rgba(40,55,75,.5)}
#mithaq-extras .gx-card::before{inset:8px;border-radius:19px;border:1px solid rgba(159,177,198,.65)}
#mithaq-extras .gx-card::after{content:"";position:absolute;inset:12px;border-radius:15px;border:1px solid rgba(159,177,198,.25);pointer-events:none}
/* شارة المايك فوق العنوان (بدل الإيموجي اللي كان راكب على الحروف) */
#mithaq-extras .gx-voice .gx-eyebrow{display:flex;flex-direction:column;align-items:center;gap:12px;font:400 15px/1.3 'Amiri','Amiri Ar Local',serif;color:rgba(76,95,118,.78)}
#mithaq-extras .gx-voice .gx-eyebrow::before{content:"";width:46px;height:46px;border-radius:50%;
  background:radial-gradient(circle at 36% 28%,#fff,#eef1f5 70%) padding-box,linear-gradient(140deg,#c9d4e0,#8ea2ba) border-box;border:1px solid transparent;
  box-shadow:0 6px 14px -8px rgba(40,55,75,.45);
  -webkit-mask:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234c5f76' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='3' width='6' height='11' rx='3'/%3E%3Cpath d='M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6'/%3E%3C/svg%3E"),radial-gradient(circle at 36% 28%,#fff,#eef1f5 70%);
  background-repeat:no-repeat;background-position:center;background-size:22px 22px,cover}
#mithaq-extras .gx-title{margin-top:10px;color:#4c5f76;font:700 31px/1.75 'Aref Ruqaa','Aref Ruqaa Ar Local','Amiri',serif;-webkit-text-stroke:0;text-wrap:balance}
#mithaq-extras .gx-sub{position:relative;margin-top:6px;padding-top:16px;font:400 16.5px/1.85 'Amiri','Amiri Ar Local',serif;color:rgba(76,95,118,.9);white-space:pre-line}
#mithaq-extras .gx-sub::before{content:"";position:absolute;top:0;left:50%;width:120px;height:9px;transform:translateX(-50%);
  background:linear-gradient(to right,transparent,rgba(159,177,198,.9)) left 4px/50px 1px no-repeat,linear-gradient(to left,transparent,rgba(159,177,198,.9)) right 4px/50px 1px no-repeat}
#mithaq-extras .gx-sub::after{content:"";position:absolute;top:1px;left:50%;width:6px;height:6px;margin-left:-3px;border:1px solid rgba(159,177,198,.95);transform:rotate(45deg)}
#mithaq-extras .gx-vnote{margin-top:10px;font:400 14.5px/1.8 'Amiri','Amiri Ar Local',serif;color:rgba(76,95,118,.72);white-space:pre-line}
/* هتحضر ولا لأ */
#mithaq-extras .gx-att{margin-top:22px}
#mithaq-extras .gx-att-q{font:700 17px/1.5 'Amiri','Amiri Ar Local',serif;color:#4c5f76}
#mithaq-extras .gx-att-row{gap:10px;margin-top:12px}
#mithaq-extras .gx-att-b{min-height:46px;padding:8px 6px;white-space:nowrap;gap:5px;font:400 15px/1.2 'Amiri','Amiri Ar Local',serif;color:#4c5f76;background:#fdfcfa;
  box-shadow:inset 0 0 0 1px rgba(159,177,198,.85),0 4px 12px -8px rgba(40,55,75,.4);transition:background .25s ease,color .25s ease,box-shadow .25s ease}
#mithaq-extras .gx-att-b svg{width:13px;height:13px;flex:none}
#mithaq-extras .gx-att-b.on{background:linear-gradient(150deg,#5d7290,#3d4d62);color:#fdfcfa;box-shadow:0 8px 18px -10px rgba(40,55,75,.7)}
/* المسجّل */
#mithaq-extras .gx-rec{margin-top:24px}
#mithaq-extras .gx-idle,#mithaq-extras .gx-slide,#mithaq-extras .gx-sending{font-family:'Amiri','Amiri Ar Local',serif;font-size:15.5px;font-style:normal}
#mithaq-extras .gx-name{font-family:'Amiri','Amiri Ar Local',serif;font-size:17px}
#mithaq-extras .gx-mic{background:radial-gradient(circle at 36% 28%,#6d82a0,#3d4d62 74%);color:#fdfcfa;
  box-shadow:0 0 0 1.5px rgba(201,212,224,.95),0 0 0 5px rgba(159,177,198,.2),0 10px 22px -8px rgba(40,55,75,.6)}
#mithaq-extras .gx-mic .gx-ring.idle{border-color:rgba(159,177,198,.85)}
#mithaq-extras .gx-mic .gx-ring.lv.b{background:rgba(159,177,198,.25)}
#mithaq-extras .gx-rec[data-state="locked"] .gx-mic,#mithaq-extras .gx-rec[data-state="review"] .gx-mic,
#mithaq-extras .gx-rec[data-state="naming"] .gx-mic,#mithaq-extras .gx-rec[data-state="sending"] .gx-mic{background:radial-gradient(circle at 36% 28%,#a9bad0,#5f7592 82%)}
#mithaq-extras .gx-bar{background:#fdfcfa;box-shadow:0 0 0 1px rgba(159,177,198,.6),0 6px 16px -10px rgba(40,55,75,.4)}
#mithaq-extras .gx-toast{font-family:'Amiri','Amiri Ar Local',serif;font-size:15px}
#mithaq-extras .gx-sent-t{color:#4c5f76}
</style>`;
// كلام التهنئة الصوتية (خطوبة مريم ومعاذ) — الاسم بيتطلب قبل الإرسال، و"هتحضر؟" لازم تتختار (attend)
const EXTRAS_OPTS = `<script>window.MITHAQ_EXTRAS_OPTS = { anchor: '#mithaq-rsvp', lang: 'ar', attend: true, t: {
  vEyebrow: 'رسالة بصوتك', vTitle: 'سيبوا لنا تهنئة بصوتكم',
  vSub: 'كلمة حلوة أو دعوة من القلب لمريم ومعاذ،\\nهتوصلهم ويسمعوها ويفتكروا بيها يومهم.',
  vNote: 'اختار هتحضر ولا لأ، وبعدين سجّل تهنئتك واكتب اسمك وابعتها',
  aQ: 'هتشرّفونا في الخطوبة؟', aYes: 'هحضر إن شاء الله', aNo: 'مش هقدر أحضر', needAttend: 'اختار هتحضر ولا لأ الأول',
  idle: 'دوس على المايك وسجّل', namePh: 'اكتب اسمك', needName: 'اكتب اسمك الأول',
  sent: 'وصلت تهنئتك لمريم ومعاذ 🤍',
} };</script>`;

module.exports = {
  shortId: SHORT,
  // عنوان لينك المشاركة: خطوبة (مش فرح) ومريم الأول — الصورة والوصف زي ما هم من المحرر
  share: { title: 'دعوة خطوبة مريم ومعاذ 🤍', description: 'الثلاثاء ٨ ديسمبر ٢٠٢٦ · الساعة ٨ مساءً · قاعة الإليزيه، الإسكندرية' },

  render() {
    return { head: CSS + EXTRAS_OPTS };
  },

  transform(html) {
    let out = oneVideo(html) || html;
    // صورة القاعة مكان رسمة المكان (mp27 — لو العميل غيّرها من المحرر، صورته هي اللي بتكسب)
    out = out.replace(/<div class="loc-img"><img data-elem-id="mp27"([^>]*?)src="\/templates\/mother-of-pearl\/venue\.webp"/,
      `<div class="loc-img mj-hall"><img data-elem-id="mp27"$1src="${HALL}" width="960" height="615"`);
    // صور المعرض (لو العميل غيّر صورة من المحرر، صورته هي اللي بتكسب)
    GALLERY.forEach((u, i) => { out = out.split(`src="/templates/mother-of-pearl/g${i + 1}.webp"`).join(`src="${u}"`); });
    // الدريس كود: بني غامق بس (الكلام الافتراضي — لو العميل كتب حاجة من المحرر، كلامه هو اللي بيظهر)
    out = out.replace("mp43: 'ألوان نرجو تجنّبها', mp44: 'يُرجى عدم ارتداء الألوان التالية', mp45: 'البيج • الفضي • الذهبي'",
      "mp43: 'لون الحفل', mp44: 'يسعدنا أن تشاركونا لون الخطوبة', mp45: 'البني الغامق'");
    return out;
  },
};
