// دعوة ltoG0xC (Royal Maroon، غلاف المظروف بالفيديو) — بطلب المالك (2026-11-14):
// غلاف المظروف بقى الفيديو بتاعه هو (مظروف كريمي منقوش بختم شمع ماروني، الغطا بيتفتح لفوق)
// بدل مظروف Royal الافتراضي، والختم مكتوب عليه A&Y (من صورة الختم اللي بعتها) مكان R&Z اللي كانت
// في الفيديو الأصلي. الحروف اتغيّرت فريم بفريم (144 فريم): الحروف القديمة اتمسحت من وش الختم بنفس
// لون ونقشة الشمع في كل فريم، والجديدة ماشية مع حركة الختم وبنفس الإضاءة والوهج والتغبيش بتاع الفيديو.
//
// الضيف بيشوف أول فريم (cover.webp) → يدوس → الفيديو (open.mp4، من غير صوت؛ الأغنية من الدعوة نفسها)
// → الدعوة تتفتح. كل ده نفس آلية initEnvelopeCover في utils/templateFixes.js — هنا بنبدّل اللينكات
// بس للدعوة دي، ولون الخلفية لحد ما الصورة تحمّل بقى كريمي زي المظروف، وجملة "اضغط لفتح الدعوة"
// بقت ماروني عشان تبان على الكريمي. لو الكود اتغيّر ومالقيناش اللينكات، الدعوة بتفضل بالمظروف العادي.
const { asset } = require('./_asset');

const SHORT = 'ltoG0xC';
const BG = '#e6ddd0';   // لون ورق المظروف (أطراف أول فريم)

const HEAD = `<style id="lt-env-style">
body:not(.wda-env-open){background-color:${BG}!important}
body::before{background-color:${BG}!important}
#wda-envelope,#wda-envelope .wda-env-video{background-color:${BG}!important}
#wda-envelope .wda-env-hint{color:#6d1426!important;text-shadow:0 1px 6px rgba(255,248,236,.9)!important}
</style>`;

module.exports = {
  shortId: SHORT,

  render() {
    return { head: HEAD };
  },

  transform(html) {
    return html
      .split('/royal/envelope-cover.webp').join(asset(`/custom/${SHORT}/cover.webp`))
      .split('/royal/envelope-cover.jpg').join(asset(`/custom/${SHORT}/cover.jpg`))
      .split('/royal/envelope-open.mp4').join(asset(`/custom/${SHORT}/open.mp4`));
  },
};
