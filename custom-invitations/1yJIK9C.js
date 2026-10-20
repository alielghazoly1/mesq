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
`;

module.exports = {
  shortId: '1yJIK9C',

  /** نفس الشكل للضيوف وفي المحرر */
  render() {
    return { head: `<style id="ab-style">${CSS}</style>` };
  },
};
