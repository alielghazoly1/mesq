// دعوة Ol5uJoA (قالب Velvet Voice عربي) — فرح حسام وأمنية. بطلب المالك (2026-11-28):
//  • الموسيقى ترجع موسيقى القالب الأساسية: الـ oneOffFix (Ol5uJoA-template-music) بيشيل أغنية المكتبة اللي
//    كانت متختارة (لو العميل اختار أغنية تانية بعد كده، بتاعته هي اللي بتشتغل).
//  • تأكيد الحضور: زرارين "سأحضر بإذن الله / أعتذر عن الحضور" اتشالوا (المالك: شكلهم سيء). الفورم بيتبعت عادي
//    بالاسم والرسالة، والرد بيتسجّل "هيحضر" (السيرفر محتاج attending، والضيف اللي بيبعت الفورم بيأكد حضوره).
const SHORT = 'Ol5uJoA';

const CSS = `<style id="ol5-css">
#rsvp .seg{display:none!important}
</style>`;

module.exports = {
  shortId: SHORT,

  render() {
    return { head: CSS };
  },

  transform(html) {
    // الزرارين مستخبيين → الرد بيتبعت على إنه "هيحضر" من غير ما الضيف يختار
    return html.replace('    let attending = null;\n', '    let attending = true;\n');
  },
};
