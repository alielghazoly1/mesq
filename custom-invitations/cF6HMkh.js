// دعوة cF6HMkh (Ivory Swans، إنجليزي) — محمد وزهراء، 29/11/2026. بطلب المالك (2026-11-19):
//  • تأكيد الحضور بالعربي: العنوان "تأكيد الحضور" مرة واحدة (السطر الدهبي الصغير اللي فوقه اتشال)،
//    "نتمنّى منكم تأكيد الحضور"، "نتواجد إن شاء الله" / "مع الأسف لا نستطيع"، وخانة الحساسية اتشالت.
//  • صورة القاعة اللي فوق الخريطة اتشالت.
//  • الصور التلاتة → الصورة اللي في النص بس، أكبر (مناسبة للموبايل)، وهي صورة الدعوة اللي المالك بعتها
//    (محمد وزهراء — بدل صورة القالب) كاملة من غير تكبير ولا فلتر، من غير كلمة "Starts" تحتها.
//  • كارت لينك المشاركة = صورة الدعوة اللي المالك بعتها (كاملة في النص، 1200×630).
// البيانات نفسها ماتلمستش (العرض بس).
// (المالك، الجولة التانية 2026-11-19):
//  • الأسامي في أول الدعوة (Mohamed & Zahraa بالإنجليزي) → الخط العربي "محمد زهراء" مقصوص من صورتهم (Real-ESRGAN
//    ×4 + فصل الحبر عن السما) ومتشكّل: مُحَمَّد زَهْرَاء (حركات Aref Ruqaa بنفس لون الحبر) — names.webp.
//  • تحت مربع Save the date: "الساعة 6:30 مساءً" (والميعاد نفسه بقى 6:30 — oneOffFix cF6HMkh-630-texts).
//  • "نرجوا" → "نرجو"، و"بقلوب... المباركة" رجعت الجملة كاملة (نفس الـ oneOffFix).
const { asset } = require('./_asset');

const SHORT = 'cF6HMkh';
const DIR = `/custom/${SHORT}/`;
const COUPLE = asset(`${DIR}couple.webp`);
const NAMES = asset(`${DIR}names.webp`);

const CSS = `<style id="cf-style">
/* صورة القاعة فوق الخريطة */
#loc-section .loc-photo-wrap{display:none!important}
/* الصورة اللي في النص بس، أكبر */
#hf-section .hf-col.a,#hf-section .hf-col.c{display:none!important}
#hf-section .hf-frames{gap:0!important}
#hf-section .hf-col.b{flex:0 0 auto!important;max-width:none!important}
#hf-section .hf-col.b .hf-frame{width:min(74vw,300px)!important;height:auto!important;aspect-ratio:3/4;border-radius:22px!important}
#hf-section .hf-col.b .hf-frame::after{border-radius:16px!important}
#hf-section .hf-col.b .hf-frame img{filter:none!important;transform:none!important;object-fit:cover}
#hf-section .hf-col.b .hf-caption{display:none!important}
@media (min-width:768px){#hf-section .hf-col.b .hf-frame{width:340px!important}}
/* تأكيد الحضور: العنوان مرة واحدة ومن غير خانة الحساسية */
#mithaq-rsvp .mrsvp-eyebrow{display:none!important}
#mithaq-rsvp #mrsvp-note{display:none!important}
#mithaq-rsvp .mrsvp-title{font-size:27px}
#mithaq-rsvp .mrsvp-sub{font-family:'Amiri',serif;font-size:17px;color:#7a6a52}
/* الأسامي بالخط العربي مكان Mohamed & Zahraa */
.tn-elem[data-elem-id="1779566247730000001"].cf-has-nm .tn-atom{visibility:hidden}
.tn-elem[data-elem-id="1779566247730000001"].cf-has-nm{overflow:visible!important}
.tn-elem[data-elem-id="1779566247730000001"] .cf-nm{position:absolute;left:50%;top:50%;width:222px;max-width:none;height:auto;transform:translate(-50%,-61%);pointer-events:none;user-select:none}
/* الشاشات القصيرة (زي آيفون SE): أصغر وأعلى شوية عشان مايتلمسش في SCROLL DOWN اللي تحت */
@media (max-height:600px){.tn-elem[data-elem-id="1779566247730000001"] .cf-nm{width:186px;transform:translate(-50%,-74%)}}
.tn-elem[data-elem-id="1779566247730000004"].cf-hide{display:none!important}
/* الساعة تحت مربع Save the date */
.std-sub.cf-time{margin-top:6px;font-family:'Amiri',serif;font-size:19px;direction:rtl}
</style>`;

// الكلام بالعربي قبل ما سكربت القالب يقرا الإعداد (بيقراه عند DOMContentLoaded)
const RSVP_AR = `<script id="cf-rsvp">(function(){
  var C = window.WEDDING_CONFIG; if (!C) return;
  C.rsvpTitle = 'تأكيد الحضور';
  C.rsvpIntro = 'نتمنّى منكم تأكيد الحضور';
  C.yesOption = 'نتواجد إن شاء الله';
  C.noOption = 'مع الأسف لا نستطيع';
  C.yourNameLabel = 'الاسم';
  C.submitButtonText = 'إرسال';
  C.rsvpSuccessText = 'وصلنا ردّكم، شكرًا لكم 🤍';
  C.foodIntoleranceLabel = '';
  document.addEventListener('change', function(e){
    var t = e.target; if (!t || t.name !== 'mrsvp-att') return;
    var yes = t.value === 'yes';
    var h = document.getElementById('mrsvp-done-title'), m = document.getElementById('mrsvp-done-msg');
    if (h) h.textContent = yes ? 'تم تأكيد حضوركم' : 'وصلنا ردّكم';
    if (m) m.textContent = yes ? 'في انتظاركم لتكتمل فرحتنا 🤍' : 'شكرًا لكم، ونتمنى لكم كل الخير 🤍';
  });
})();</script>`;

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: صورة الدعوة اللي المالك بعتها
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف محمد وزهراء',
    description: 'الأحد 29-11-2026',
  },

  render() {
    return { head: CSS, bodyEnd: RSVP_AR };
  },

  // الصورة اللي في النص (iv3) = صورة الدعوة بتاعتهم — لو العميل حط صورة من المحرر، صورته هي اللي بتظهر
  transform(html, { editMode } = {}) {
    let out = html.replace(/(<img\b[^>]*?)src="\/templates\/ivory-swans\/couple-1\.webp"([^>]*data-elem-id="iv3")/, (m, a, b) => `${a}src="${COUPLE}"${b}`);
    // الساعة تحت مربع Save the date (بتتعدّل من المحرر)
    out = out.replace(/(<div class="std-sub" data-elem-id="iv40">[^<]*<\/div>)/, '$1\n                <div class="std-sub cf-time" data-elem-id="cf1">الساعة 6:30 مساءً</div>');
    // الأسامي بالخط العربي مكان Mohamed & Zahraa — في المحرر بتفضل كلام عشان تتعدّل
    if (!editMode) {
      out = out.replace(/(<div class="t396__elem tn-elem )([^"]*" data-elem-id="1779566247730000001"[^>]*>\s*<div class="tn-atom" field="tn_text_1779566247730000001">[\s\S]*?<\/div>)/,
        (m, a, b) => `${a}cf-has-nm ${b}<img class="cf-nm" src="${NAMES}" alt="محمد وزهراء" draggable="false">`);
      out = out.replace(/(<div class="t396__elem tn-elem )([^"]*" data-elem-id="1779566247730000004")/, '$1cf-hide $2');
    }
    return out;
  },
};
