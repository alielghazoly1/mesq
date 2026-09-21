// مدة التعديل بعد تفعيل الباقة — أدوات العرض المشتركة.
//
// القرار نفسه (مفتوح ولا مقفول) بيتاخد في السيرفر (utils/editWindow.js) وبيوصل
// جاهز في /api/auth/me وفي /api/packages وفي /api/dashboard. الواجهة هنا
// مبتحسبش حاجة من ساعة جهاز العميل — بتعرض بس.

/** تاريخ مقروء باللغة الحالية، بأرقام لاتينية زي باقي الموقع */
export function formatDay(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * هل العميل يقدر يعدّل دلوقتي؟
 * أي بيانات ناقصة = مفتوح (نفس قاعدة السيرفر): الأأمن إن اللي دفع مايتقفلش
 * عليه بسبب رد ناقص.
 * @param {{edit?: {editOpen?: boolean}}|null|undefined} user من /api/auth/me
 */
export function isEditOpen(user) {
  return user?.edit?.editOpen !== false;
}
