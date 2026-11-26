// دعوة qCUFp1B (قالب Lace عربي) — زفاف عمران وفاطمة، الخميس 24/12/2026 الساعة 8 مساءً — فندق جولدن جويل، قاعة لازوردي، الإسماعيلية.
// بطلب المالك (2026-11-24): الدعوة زي القالب، والفرق:
//  • برنامج اليوم والمواصلات والهدية مستخبيين (hiddenSections — oneOffFix qCUFp1B-omran-fatma و qCUFp1B-round4).
//  • تأكيد الحضور زي ما هو، من غير خانة "ملاحظات عن الأكل" (هنا بالـ CSS، فالرد بيتبعت من غيرها).
//  • أول صفحة (الجولة 4): "بارك الله لكما وبارك عليكما / وجمع بينكما في خير" فوق، والمكان بالإنجليزي
//    "Golden Jewel Hotel" و "Ismailia" (lc7/lc8 — كلام العميل في customizations.texts). الساعة اتشالت من أول صفحة.
//  • أماكن الإقامة (الجولة 4): فندق واحد بس = فندق الحفل نفسه (جولدن جويل)، وزرار "احجز إقامتك" بيفتح نفس لوكيشن
//    القاعة. الفندق التاني وسطري "سعر خاص/كود" و"الانتظار/جراج" مستخبيين (معلومات عينة مش حقيقية).
//  • كارت اللينك (واتساب وغيره): ختم Lace جنب "عمران و فاطمة" والتاريخ والساعة والمكان (1200×630).
//  • الجولة 5 (2026-11-26، oneOffFix qCUFp1B-round5 — كلام في customizations.texts): أول صفحة "حين يقال للحب /
//    بارك الله لكما وبارك عليكما / وجمع بينكما في الخير"؛ الإقامة: غرف محجوزة لضيوف برّه الإسماعيلية من ٢٤ ديسمبر
//    والحجز على أصحاب الفرح، والزرار "موقع الفندق"؛ سطر تأكيد الحضور (قبل ٥ ديسمبر ٢٠٢٦) زي ما هو.
const { asset } = require('./_asset');

const SHORT = 'qCUFp1B';
const MAP = 'https://maps.app.goo.gl/GEpALf2qQ3V3AhsB6';

const CSS = `<style id="qc-css">
#lcForm div:has(> [data-elem-id="lc84"]){display:none!important}
#heroTxt [data-elem-id="lc8"]{font-size:17px!important;line-height:1.5;margin-top:6px}
@media (min-width:768px){#heroTxt [data-elem-id="lc8"]{font-size:20px!important}}
[data-section="stay"] .rv:has(> div > [data-elem-id="lc117"]),
[data-section="stay"] li:has(> [data-elem-id="lc54"]),[data-section="stay"] li:has(> [data-elem-id="lc56"]),
[data-elem-id="lc50"]{display:none!important}
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

  // "احجز إقامتك" → لوكيشن الفندق نفسه (من غير data-hotel، عشان سكريبت القالب مايغيّرهوش لبحث بالاسم)
  transform(html) {
    return html.replace(/<a href="#"([^>]*?) data-hotel="1">/, `<a href="${MAP}"$1 data-qc-hotel="1">`);
  },
};
