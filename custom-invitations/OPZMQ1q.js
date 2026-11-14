// دعوة OPZMQ1q (Champagne Lace) — حبيبة وحسني، السبت 12/12/2026، دار المدفعية — قاعة حورس (شيراتون المطار).
// بطلب المالك (2026-11-14): لما الدعوة تتفتح تنزل لوحدها بالراحة لآخرها (custom-invitations/_glide.js) —
// بتبدأ بعد ما أول صفحة (الأسامي) تخلص حركتها بـ 4 ثواني. غير كده الدعوة زي ما صاحبها عاملها في المحرر
// بالظبط (البيانات وكارت المشاركة والتعديل من المحرر مالهمش علاقة بالملف ده).
const { glideScript } = require('./_glide');

module.exports = {
  shortId: 'OPZMQ1q',

  render({ editMode } = {}) {
    if (editMode) return {};
    // أول صفحة في Champagne Lace: #hv-hero بياخد hv--play بعد ضغطة الختم بـ 2.3 ثانية (حركتها ~3.6 ثانية)
    // السرعة: 90 بكسل في الثانية (المالك 2026-11-14: "سرّعه شوية حلوين، ينزل بسرعة" — كانت 42)
    return { bodyEnd: glideScript({ playSel: '#hv-hero', playClass: 'hv--play', after: 4100, clickSel: '.popup-enter', afterClick: 6400, speed: 90 }) };
  },
};
