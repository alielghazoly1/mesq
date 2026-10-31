// دعوة عمرو ونور (Ivory Swans، عربي) — بطلب المالك "اشيل الجزئية اللي فيها
// الصور". الصور التلاتة اللي متعلّقة في قسم الحكاية اتشالت (iv2–iv4 مخفيين
// من oneOffFixes)، بس إطاراتها وخيوطها كانت سايبة مساحة فاضية كبيرة — فهنا
// بنشيل الحتة دي كلها، وكلام القسم (اللي بقى لعقد القران) يطلع على طول.
// وصورة القاعة العامة اللي في قسم المكان (مش قاعة أوسيل الحقيقية) اتشالت كمان.
// البيانات نفسها (الأسامي، التاريخ، المكان، العائلات) في utils/oneOffFixes.js.

const CSS = `
#hf-section .hf-frames{display:none!important}
#hf-section .hf-wedding-block{margin-top:0!important}
#hf-section{padding-top:56px!important;padding-bottom:80px!important}
/* صورة القاعة في القالب صورة عامة مش قاعة أوسيل — مالهاش لازمة */
#loc-section .loc-photo-wrap{display:none!important}
/* مكان عقد القران: اسم المسجد كبير، وتحته "بجوار…" أصغر — في نفس العنصر
   (iv20، سطرين) فبينزلوا مع بعض على أي شاشة */
#hf-section [data-elem-id="iv20"]{font-size:19px;line-height:1.9;color:#8c795d;white-space:pre-wrap}
#hf-section [data-elem-id="iv20"]::first-line{font-size:31px;line-height:1.7;color:#6b5738}
/* العائلات تحت "بمباركة أهلهما الكرام" — بالعربي (خط القالب هنا إنجليزي مايل) */
#fb-section [data-elem-id="iv22"]{font-family:'Amiri',serif;font-style:normal;font-size:19px;line-height:1.95;color:#4a3624;white-space:pre-wrap;margin-bottom:34px}
@media (max-width:380px){
  #hf-section [data-elem-id="iv20"]{font-size:17px}
  #hf-section [data-elem-id="iv20"]::first-line{font-size:28px}
  #fb-section [data-elem-id="iv22"]{font-size:17px}
}
`;

module.exports = {
  shortId: '1yJIK9C',

  /** نفس الشكل للضيوف وفي المحرر */
  render() {
    return { head: `<style id="ab-style">${CSS}</style>` };
  },
};
