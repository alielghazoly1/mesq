// دعوة 7j2tOWl (Mother of Pearl عربي) — خطوبة مريم ومعاذ، الثلاثاء 8/12/2026 الساعة 8 مساءً — قاعة الإليزيه، الإسكندرية.
// بطلب المالك (2026-11-24):
//  • صورة القاعة الحقيقية (اللي بعتها) مكان رسمة المكان (mp27) — في برواز لؤلؤي ناعم، زي ما هي من غير قص ولا تكبير.
//  • تهاني صوتية من الضيوف (فويس نوت) تحت تأكيد الحضور → لوحة صاحبة الدعوة (guestExtras.voice — oneOffFix 7j2tOWl-mariam-moaz).
//  • الأسامي والميعاد والمكان والخطوبة من نفس الـ oneOffFix.
// الدعوة الكاستم مابتاخدش فيديو الفتح الواحد تلقائي (utils/renderInvitation.js)، فبنطبّقه هنا زي XIUXYIT.
const { asset } = require('./_asset');
const { makeOneVideo } = require('./_oneVideo');

const SHORT = '7j2tOWl';
const T = '/templates/mother-of-pearl/';
const HALL = asset(`/custom/${SHORT}/hall.webp`);
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
/* التهنئة الصوتية بألوان Mother of Pearl (كحلي هادي + لؤلؤي) بدل البني والدهبي الافتراضي */
#mithaq-extras.gx{--gx-ink:#3d4d62;--gx-soft:rgba(76,95,118,.82);--gx-gold:#9fb1c6;--gx-gold2:#c9d4e0;--gx-line:rgba(76,95,118,.24);
  --gx-paper:transparent;--gx-card:linear-gradient(160deg,#fdfcfa 0%,#f3f0ec 55%,#fbfaf8 100%);padding-bottom:84px}
#mithaq-extras .gx-orn{color:#9fb1c6}
#mithaq-extras .gx-card{background:var(--gx-card);border-radius:22px;
  box-shadow:0 1px 1px rgba(40,55,75,.1),0 4px 10px rgba(40,55,75,.06),0 22px 40px -22px rgba(40,55,75,.5)}
#mithaq-extras .gx-card::before{inset:7px;border-radius:16px;border-color:rgba(159,177,198,.7)}
#mithaq-extras .gx-eyebrow{color:rgba(76,95,118,.75)}
#mithaq-extras .gx-title{color:#4c5f76;font-family:'Aref Ruqaa','Aref Ruqaa Ar Local','Amiri',serif}
#mithaq-extras .gx-sub,#mithaq-extras .gx-vnote{color:rgba(76,95,118,.88);white-space:pre-line;font-family:'Amiri','Amiri Ar Local',serif}
#mithaq-extras .gx-mic{background:radial-gradient(circle at 36% 28%,#6d82a0,#3d4d62 74%);color:#fdfcfa;
  box-shadow:0 0 0 1.5px rgba(201,212,224,.95),0 0 0 5px rgba(159,177,198,.2),0 10px 22px -8px rgba(40,55,75,.6)}
#mithaq-extras .gx-mic .gx-ring.idle{border-color:rgba(159,177,198,.85)}
#mithaq-extras .gx-mic .gx-ring.lv.b{background:rgba(159,177,198,.25)}
#mithaq-extras .gx-rec[data-state="locked"] .gx-mic,#mithaq-extras .gx-rec[data-state="review"] .gx-mic,
#mithaq-extras .gx-rec[data-state="naming"] .gx-mic,#mithaq-extras .gx-rec[data-state="sending"] .gx-mic{background:radial-gradient(circle at 36% 28%,#a9bad0,#5f7592 82%)}
#mithaq-extras .gx-bar{background:#fdfcfa;box-shadow:0 0 0 1px rgba(159,177,198,.6),0 6px 16px -10px rgba(40,55,75,.4)}
#mithaq-extras .gx-sent-t{color:#4c5f76}
</style>`;
// كلام التهنئة الصوتية (خطوبة مريم ومعاذ) — الباقي زي الافتراضي
const EXTRAS_OPTS = `<script>window.MITHAQ_EXTRAS_OPTS = { anchor: '#mithaq-rsvp', lang: 'ar', t: {
  vEyebrow: 'رسالة بصوتك', vTitle: 'سيبوا لنا تهنئة بصوتكم 🎙️',
  vSub: 'كلمة حلوة أو دعوة من القلب لمريم ومعاذ،\\nهتوصلهم ويسمعوها ويفتكروا بيها يومهم.',
  vNote: 'امسك المايك واتكلم،\\nأو دوس عليه دوسة واحدة وسجّل براحتك',
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
    return out;
  },
};
