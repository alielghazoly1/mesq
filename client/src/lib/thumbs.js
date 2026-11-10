// صور كروت القوالب (client/public/img/template-thumbs/) — المتصفح بيحتفظ بيها أسبوع
// (وبيستعمل النسخة القديمة لحد 30 يوم وهو بيجدّد)، فلما صورة قالب تتغيّر بنفس الاسم الناس
// بيفضلوا شايفين القديمة. الحل: رقم نسخة في اللينك لكل قالب صورته اتغيّرت — زوّد الرقم
// كل مرة تبدّل الصورة.
const THUMB_VERSION = {
  // 2026-11-10: بقت الظرف من بره بختم القلب بدل الكارت اللي جوه (بطلب المالك)
  'mother-of-pearl': 2,
};

/** لينك صورة القالب (suffix: '' أو '-ar' أو '-en') */
export function templateThumb(templateId, suffix = '') {
  const v = THUMB_VERSION[templateId];
  return `/img/template-thumbs/${templateId}${suffix}.jpg${v ? `?v=${v}` : ''}`;
}
