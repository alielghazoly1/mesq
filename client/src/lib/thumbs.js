// صور كروت القوالب (client/public/img/template-thumbs/) — المتصفح بيحتفظ بيها أسبوع
// (وبيستعمل النسخة القديمة لحد 30 يوم وهو بيجدّد)، فلما صورة قالب تتغيّر بنفس الاسم الناس
// بيفضلوا شايفين القديمة. الحل: رقم نسخة في اللينك لكل قالب صورته اتغيّرت — زوّد الرقم
// كل مرة تبدّل الصورة.
const THUMB_VERSION = {
  // 2026-11-10: بقت الظرف من بره بختم القلب بدل الكارت اللي جوه (بطلب المالك)
  'mother-of-pearl': 2,
  // 2026-11-12: الختم اتقفل (كان فيه خرم مكان الحرف)
  'birthday-gift': 2,
  // 2026-11-17: الظرف من بره بالختم (بدل الكارت اللي جوه) — بطلب المالك
  lace: 2,
  // 2026-11-28: Finca في المعرض — الختم بقلب من أغصان الزيتون بدل حروف M&J
  finca: 2,
};

/** لينك صورة القالب (suffix: '' أو '-ar' أو '-en') */
export function templateThumb(templateId, suffix = '') {
  const v = THUMB_VERSION[templateId];
  return `/img/template-thumbs/${templateId}${suffix}.jpg${v ? `?v=${v}` : ''}`;
}

/**
 * نسخ WebP من صورة القالب (2026-11-17 — الرئيسية بتحمّل أسرع): 640 عرض (name.webp) و420 (name-s.webp).
 * الموبايل بياخد الصغيرة (الكارت عرضه ~110 بكسل)، والكمبيوتر الكبيرة. الـ jpg بيفضل للمتصفحات القديمة.
 * لما تضيف/تبدّل صورة قالب: اعمل النسختين دول جنب الـ jpg (نفس الاسم).
 */
export function templateThumbSet(templateId, suffix = '') {
  const v = THUMB_VERSION[templateId];
  const q = v ? `?v=${v}` : '';
  const base = `/img/template-thumbs/${templateId}${suffix}`;
  return `${base}-s.webp${q} 420w, ${base}.webp${q} 640w`;
}
