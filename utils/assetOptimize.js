// utils/assetOptimize.js
// ملفات تقيلة في قوالب Tilda → نسخ خفيفة عندنا (client/public/templates/<قالب>/opt/).
//
// ليه: Blossom & Oud كانت بتحمّل للضيف حوالي 7 ميجا قبل ما يعمل أي حاجة — 5 صور PNG
// بمقاسها الأصلي من سيرفرات Tilda (1.3 + 1.3 + 0.96 + 0.4 + 0.2 ميجا) وفيديو خلفية
// 1080×1920 بـ 60 فريم (2 ميجا، ظاهر بشفافية 40% بس). النسخ الخفيفة:
//   - الصور: WebP بنفس الأبعاد والشفافية، جودة 92 (اتقارنت بالعين مكبّرة 3 مرات: مفيش فرق ظاهر)
//   - الفيديو: 720×1280، 30 فريم، H.264 High@4.1 ref=4 (آمن للآيفون)، 366 ك.ب
//   الإجمالي 6.25 ← 1.46 ميجا.
//
// بيتعمل على الـ HTML النهائي — بعد تعديلات الدعوات الكاستم (اللي بعضها بيبدّل نفس
// الروابط دي بصورها الخاصة، زي r1X0Neh) — وللضيوف بس: المحرر بيفضل بالروابط الأصلية.
// ملفات القالب نفسها (views/*.html) مااتغيّرتش.
//
// مفتاح طوارئ: ASSET_OPT=off في متغيرات البيئة بيرجّع الروابط الأصلية من غير أي رفع جديد.
const MAP = {
  'https://static.tildacdn.net/tild6666-3763-4439-a131-303039386132/Group_222.png': '/templates/blossom-oud/opt/Group_222.webp',
  'https://static.tildacdn.net/tild3736-6638-4539-b133-393334313761/People_in_elegant_at.png': '/templates/blossom-oud/opt/People_in_elegant_at.webp',
  'https://static.tildacdn.net/tild3661-6433-4036-a330-323937363764/Create_PNG_image_cha.png': '/templates/blossom-oud/opt/Create_PNG_image_cha.webp',
  'https://static.tildacdn.net/tild6363-6164-4231-a362-383563623535/flower-decor.png': '/templates/blossom-oud/opt/flower-decor.webp',
  'https://static.tildacdn.net/tild6233-6433-4662-a437-316665346637/Gemini_Generated_Ima.png': '/templates/blossom-oud/opt/Gemini_Generated_Ima.webp',
  'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Untitled%20Project.mp4': '/templates/blossom-oud/opt/bg.mp4',
};

/**
 * @param {string} html الصفحة النهائية
 * @returns {string}
 */
function optimizeTemplateAssets(html) {
  if (!html || process.env.ASSET_OPT === 'off') return html;
  let out = html;
  for (const [from, to] of Object.entries(MAP)) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

module.exports = { optimizeTemplateAssets, ASSET_MAP: MAP };
