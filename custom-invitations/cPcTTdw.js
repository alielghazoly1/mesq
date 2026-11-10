// دعوة cPcTTdw (قالب Mother of Pearl — عربي) — بطلب المالك (2026-11-10): النسخة العربي من دعوة عبدالله وهدى
// (qWn9kOE هي الأصل). البيانات (الأسامي، الميعاد، المكان، اللينك، سطور الوقت) في oneOffFix cPcTTdw-abdallah-hoda-ar.
// هنا بنبدّل ملفات القالب بملفاتهم من qWn9kOE: ختم الشمع بلوجو ع + ه (فيديو الظرف + الغلاف + ختم اللؤلؤ)، و4 صورهم،
// وأغنية "A Thousand Years" من الثانية 20. الدعوة فاضلة قالب عادي: أي صورة/أغنية/كلمة العميل يغيّرها من المحرر بتغلب
// (طبقة التخصيصات بتحط اختياره فوق اللي هنا).
const { asset } = require('./_asset');

const SHORT = 'cPcTTdw';
const T = '/templates/mother-of-pearl/';
const SRC = '/custom/qWn9kOE/';
const SWAP = [
  ['poster.webp', 'poster.webp'],
  ['v1.mp4', 'v1.mp4'],
  ['seal.webp', 'seal.webp'],
  ['g1.webp', 'm1.webp'],
  ['g2.webp', 'm2.webp'],
  ['g3.webp', 'm3.webp'],
  ['g4.webp', 'm4.webp'],
  ['song.mp3', 'song.mp3'],
];

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: نفس كارت عبدالله وهدى بالعربي (الإطار + ختم ع ه + الأسامي بالرقعة + الميعاد والمكان)
  share: {
    image: asset(`/custom/${SHORT}/share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف عبدالله وهدى 🤍',
    description: 'الأربعاء ٢٥ نوفمبر ٢٠٢٦ — من ٧ مساءً حتى ١٢ منتصف الليل · The Palace، مدينة ٦ أكتوبر',
  },

  render() {
    // الصورة التالتة (السلم) كانت متظبطة في الأصل على النص اللي تحت
    return { head: '<style id="cp-style">[data-elem-id="mp18"]{object-position:50% 70%}</style>' };
  },

  transform(html) {
    let out = html;
    for (const [from, to] of SWAP) out = out.split(T + from).join(asset(SRC + to));
    return out;
  },
};
