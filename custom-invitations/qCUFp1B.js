// دعوة qCUFp1B (قالب Lace عربي) — زفاف عمران وفاطمة، الخميس 24/12/2026 الساعة 8 مساءً — فندق جولدن جويل، قاعة لازوردي، الإسماعيلية.
// بطلب المالك (2026-11-24): الدعوة زي القالب بالظبط، والفرق بس:
//  • برنامج اليوم والمواصلات وأماكن الإقامة مستخبيين (hiddenSections — oneOffFix qCUFp1B-omran-fatma).
//  • تأكيد الحضور زي ما هو، من غير خانة "ملاحظات عن الأكل" (هنا بالـ CSS، فالرد بيتبعت من غيرها).
// الأسامي والميعاد والمكان واللوكيشن اتحطوا بنفس الـ oneOffFix.
//  • (المالك 2026-11-24، الجولة 3) الهدية: "حضوركم هو أجمل هدية لنا" بس — جملة التحويل والـ IBAN (lc72/lc73) مستخبيين.
//    وأول صفحة: الساعة تحت التاريخ (qc-time بنفس شكل التاريخ)، و"الإسماعيلية" (lc8) أكبر شوية.
//  • (المالك 2026-11-24) كارت اللينك (واتساب وغيره): ختم Lace جنب "عمران و فاطمة" والتاريخ والساعة والمكان (1200×630).
const { asset } = require('./_asset');

const SHORT = 'qCUFp1B';
const TIME = 'الساعة ٨ مساءً';

const CSS = `<style id="qc-css">
#lcForm div:has(> [data-elem-id="lc84"]){display:none!important}
[data-elem-id="lc72"],[data-elem-id="lc73"]{display:none!important}
#heroTxt [data-elem-id="lc8"]{font-size:17px!important;line-height:1.5;margin-top:6px}
#heroTxt .qc-time{margin-top:6px!important}
@media (min-width:768px){#heroTxt [data-elem-id="lc8"]{font-size:20px!important}}
</style>`;

module.exports = {
  shortId: SHORT,
  share: {
    image: asset(`/custom/${SHORT}/share.jpg`), width: 1200, height: 630, overrideImage: true,
    title: 'دعوة زفاف عمران وفاطمة 🤍',
    description: 'الخميس ٢٤ ديسمبر ٢٠٢٦ · الساعة ٨ مساءً · فندق جولدن جويل، الإسماعيلية',
  },

  render() {
    return { head: CSS };
  },

  // أول صفحة: الساعة تحت التاريخ (lc6) بنفس الخط والحجم
  transform(html) {
    return html.replace(/(<p class="([^"]*)" data-f="dateDots" data-elem-id="lc6">[\s\S]*?<\/p>)/, (x, p, cls) =>
      `${p}<p class="${cls.replace(/(^|\s)(md:)?mt-\S+/g, '').trim()} qc-time">${TIME}</p>`);
  },
};
