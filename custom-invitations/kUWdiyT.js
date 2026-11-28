// دعوة kUWdiyT (قالب Lace عربي) — عقد قران هشام وياسمين. بطلب المالك (2026-11-28):
// تأكيد الحضور من غير "هل سيرافقك شخص؟" (+1) ولا "الأطفال" ولا "ملاحظات عن الأكل".
// الفورم بيتبعت عادي (الاسم + الحضور + رسالة للعروسين) والرد بيوصل لداشبورد صاحب الدعوة
// (الملاحظة بتتسجّل "الكبار: 1 · الأطفال: 0" زي أي رد من غير مرافق ولا أطفال).
const SHORT = 'kUWdiyT';

const CSS = `<style id="ku-css">
#lcForm div:has(> [data-elem-id="lc80"]),#lcForm div:has(> [data-elem-id="lc83"]),#lcForm div:has(> [data-elem-id="lc84"]){display:none!important}
</style>`;

module.exports = {
  shortId: SHORT,

  render() {
    return { head: CSS };
  },
};
