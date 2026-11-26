// دعوة GpiDYHc (قالب Golden Calla عربي) — فرح ناصر. بطلب المالك (2026-11-26): اسم "شهد" يتشال من الدعوة.
// اسمها ووسط عائلتها كانوا مستخبيين من المحرر (gc5/gc20–gc23/gc56–gc57)، بس كان فاضل:
//  • أول صفحة: القلب جنب "ناصر" (كان بيوقف لوحده وناصر مزقوق على جنب) → القلب اتشال وناصر في النص.
//  • بمباركة عائلتينا: حرف "و" في النص + خط الزينة بتاع العمود الشمال الفاضي → اتشالوا، ووالد العريس والعريس في النص.
//  • الختام: حرف "و" اللي تحت آخر ختم → اتشال.
//  • عنوان الصفحة وكارت اللينك: "دعوة فرح ناصر" بدل "دعوة فرح ناصر و شهد".
// CSS بس للصفحة دي (render)، والبيانات زي ما هي (العميل يقدر يرجّعها من المحرر).
const SHORT = 'GpiDYHc';

const CSS = `<style id="gpi-css">
#cNames svg{display:none!important}
#cNames [data-elem-id="gc5"]{display:none!important}
[data-section="families"] .fam{grid-template-columns:1fr!important;justify-items:center}
[data-section="families"] .fam > .amp,
[data-section="families"] .fam > div:has(> [data-elem-id="gc23"]){display:none!important}
#endNames .amp2,#endNames [data-elem-id="gc57"]{display:none!important}
</style>`;

module.exports = {
  shortId: SHORT,
  share: { title: 'دعوة فرح ناصر', description: '٩ يناير ٢٠٢٧ · قاعة خيال، جدة' },

  render() {
    return { head: CSS };
  },
};
