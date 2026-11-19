// دعوة cF6HMkh (Ivory Swans، إنجليزي) — محمد وزهراء، 29/11/2026. بطلب المالك (2026-11-19):
//  • تأكيد الحضور بالعربي: العنوان "تأكيد الحضور" مرة واحدة (السطر الدهبي الصغير اللي فوقه اتشال)،
//    "نتمنّى منكم تأكيد الحضور"، "نتواجد إن شاء الله" / "مع الأسف لا نستطيع"، وخانة الحساسية اتشالت.
//  • صورة القاعة اللي فوق الخريطة اتشالت.
//  • الصور التلاتة → الصورة اللي في النص بس، أكبر (مناسبة للموبايل)، وهي صورة الدعوة اللي المالك بعتها
//    (محمد وزهراء — بدل صورة القالب) كاملة من غير تكبير ولا فلتر، من غير كلمة "Starts" تحتها.
//  • كارت لينك المشاركة = صورة الدعوة اللي المالك بعتها (كاملة في النص، 1200×630).
// البيانات نفسها ماتلمستش (العرض بس).
const { asset } = require('./_asset');

const SHORT = 'cF6HMkh';
const DIR = `/custom/${SHORT}/`;
const COUPLE = asset(`${DIR}couple.webp`);

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
  transform(html) {
    return html.replace(/(<img\b[^>]*?)src="\/templates\/ivory-swans\/couple-1\.webp"([^>]*data-elem-id="iv3")/, (m, a, b) => `${a}src="${COUPLE}"${b}`);
  },
};
