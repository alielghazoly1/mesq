// دعوة qCUFp1B (قالب Lace عربي) — زفاف عمران وفاطمة، الخميس 24/12/2026 الساعة 8 مساءً — فندق جولدن جويل، قاعة لازوردي، الإسماعيلية.
// بطلب المالك (2026-11-24): الدعوة زي القالب بالظبط، والفرق بس:
//  • برنامج اليوم والمواصلات وأماكن الإقامة مستخبيين (hiddenSections — oneOffFix qCUFp1B-omran-fatma).
//  • تأكيد الحضور زي ما هو، من غير خانة "ملاحظات عن الأكل" (هنا بالـ CSS، فالرد بيتبعت من غيرها).
// الأسامي والميعاد والمكان واللوكيشن اتحطوا بنفس الـ oneOffFix.
const SHORT = 'qCUFp1B';

const CSS = `<style id="qc-css">
#lcForm div:has(> [data-elem-id="lc84"]){display:none!important}
</style>`;

module.exports = {
  shortId: SHORT,

  render() {
    return { head: CSS };
  },
};
