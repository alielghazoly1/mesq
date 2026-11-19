// دعوة 5vKDyVK (Mother of Pearl، إنجليزي) — Muhammad & Runah، 19/12/2026. بطلب المالك (2026-11-19):
//  • حروفهم (صورة المونوجرام اللي بعتها) على الختم بدل القلب: في فيديو الفتح (v1.mp4 — الختم
//    متتبَّع فريم فريم، القلب اتمسح واتنقشت الحروف بنفس إضاءة القلب) + صورة الغلاف (poster) +
//    ختم اللؤلؤ اللي جوه الدعوة (seal.webp).
//  • أول صفحة: "بسم الله الرحمن الرحيم" سطر لوحده فوق "The Wedding of" (الأسامي من oneOffFix
//    5vKDyVK-muhammad-runah).
//  • تحت "بارك الله لكما…": علامة & (اللي فوق التاريخ 19.12.2026) اتشالت.
const { asset } = require('./_asset');

const SHORT = '5vKDyVK';
const DIR = `/custom/${SHORT}/`;
const TPL = '/templates/mother-of-pearl/';
const A = {
  poster: asset(`${DIR}poster.webp`),
  v1: asset(`${DIR}v1.mp4`),
  seal: asset(`${DIR}seal.webp`),
};

const CSS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap">
<style id="mr-style">
.hero-text .mr-bsm{font-family:'Amiri',serif;font-size:21px;line-height:1.6;color:rgb(var(--fg-rgb));margin:0 0 14px;letter-spacing:0;text-transform:none;direction:rtl}
@media (min-width:768px){.hero-text .mr-bsm{font-size:24px}}
/* علامة & اللي تحت "بارك الله لكما" (فوق التاريخ) */
.ft-n .ft-amp{display:none!important}
</style>`;

const BSM = '<p class="mr-bsm" data-elem-id="mr1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>';

module.exports = {
  shortId: SHORT,

  render() {
    return { head: CSS };
  },

  transform(html) {
    let out = html;
    // الختم بحروفهم: الغلاف + فيديو الفتح + ختم اللؤلؤ جوه الدعوة
    out = out.split(`${TPL}poster.webp`).join(A.poster);
    out = out.split(`data-src="${TPL}v1.mp4"`).join(`data-src="${A.v1}"`);
    out = out.split(`${TPL}seal.webp`).join(A.seal);
    // البسملة فوق "The Wedding of"
    out = out.replace(/(<p class="ht-of up" data-elem-id="mp1")/, `${BSM}\n      $1`);
    return out;
  },
};
