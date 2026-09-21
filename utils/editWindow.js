// utils/editWindow.js
// مدة التعديل بعد تفعيل الباقة.
//
// القاعدة (اللي مكتوبة للعميل في صفحة الباقات):
//   • الدعوة بتفضل شغالة مدى الحياة ومفيش حد لعدد الضيوف.
//   • التعديل (المحرر) متاح 30 يوم من يوم تفعيل الباقة، وبعدها بيتقفل.
//   • كل باقة جديدة بتفتح مدة تعديل جديدة.
//
// القرار بيتاخد من حقل واحد: subscription.editUntil.
//   - مفيش قيمة (null) = التعديل مفتوح من غير حد. ده وضع كل اللي اشترى
//     قبل القاعدة دي، فمفيش عميل حالي اتقفل عليه حاجة اشتراها.
//   - فيه قيمة = التعديل مفتوح لحد التاريخ ده.
//
// الملف ده الوحيد اللي بيحسب المدة — كل المسارات (المحرر، الإنشاء، التفعيل
// من اللوحة، لوحة العميل) بتنادي دوالّه، عشان العميل مايشوفش تاريخ في مكان
// ويتقفل عليه في مكان تاني.

const { EDIT_WINDOW_DAYS } = require('../packages/registry');

const DAY_MS = 24 * 60 * 60 * 1000;

/** @param {Date|string|number|null|undefined} v @returns {Date|null} */
function asDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * التعديل مفتوح للاشتراك ده دلوقتي؟
 * أي بيانات ناقصة أو مش مفهومة = مفتوح: لو حصل غلط في التخزين، الأأمن
 * إن العميل اللي دفع يفضل قادر يشتغل، مش العكس.
 * @param {object|null|undefined} sub subscription
 * @param {Date} [now]
 */
function isEditWindowOpen(sub, now = new Date()) {
  const until = asDate(sub && sub.editUntil);
  if (!until) return true;
  return until.getTime() > now.getTime();
}

/**
 * تاريخ انتهاء التعديل بعد تفعيل باقة جديدة.
 *
 * @param {object|null|undefined} sub الاشتراك الحالي قبل التفعيل
 * @param {Date} [now]
 * @param {number} [days] بيتبعت في الاختبارات بس
 * @returns {Date|null} null = من غير حد
 */
function editUntilAfterActivation(sub, now = new Date(), days = EDIT_WINDOW_DAYS) {
  // القاعدة متقفلة من الإعدادات؟ مفيش تاريخ. ولو العميل كان عنده تاريخ
  // قديم، بنسيبه زي ما هو (مش هنقصّر اللي اتوعد بيه).
  if (!days || days < 0) return asDate(sub && sub.editUntil);

  const current = asDate(sub && sub.editUntil);
  const hasPackage = !!(sub && sub.packageId);

  // عميل قديم: عنده باقة من غير تاريخ = تعديل مفتوح من غير حد. شراؤه
  // لباقة تانية مايقلّلش اللي كان معاه.
  if (hasPackage && !current) return null;

  // باقة جديدة بتضيف مدتها فوق اللي فاضل، مش بتبدأ من الصفر — العميل اللي
  // جدّد قبل ما تخلص مايخسرش أيامه.
  const base = current && current.getTime() > now.getTime() ? current.getTime() : now.getTime();
  return new Date(base + days * DAY_MS);
}

/**
 * بيمدّ التعديل بعدد أيام (من لوحة التحكم). بيبدأ من آخر تاريخ لو لسه
 * مفتوح، ومن النهارده لو خلص.
 */
function extendEditUntil(sub, extraDays, now = new Date()) {
  const current = asDate(sub && sub.editUntil);
  const base = current && current.getTime() > now.getTime() ? current.getTime() : now.getTime();
  return new Date(base + extraDays * DAY_MS);
}

/**
 * حالة التعديل بالشكل اللي بيتبعت للواجهة.
 * @returns {{editOpen:boolean, editUntil:string|null, editDaysLeft:number|null}}
 */
function editWindowInfo(sub, now = new Date()) {
  const until = asDate(sub && sub.editUntil);
  const open = isEditWindowOpen(sub, now);
  return {
    editOpen: open,
    editUntil: until ? until.toISOString() : null,
    // أيام متبقية بالتقريب لفوق: آخر يوم بيبان "يوم واحد" مش صفر
    editDaysLeft: until && open ? Math.max(1, Math.ceil((until.getTime() - now.getTime()) / DAY_MS)) : null,
  };
}

/** الرد اللي بيتبعت لما حد يحاول يعدّل بعد ما المدة تخلص */
function editWindowEndedBody(sub) {
  const until = asDate(sub && sub.editUntil);
  return {
    code: 'EDIT_WINDOW_ENDED',
    error: 'انتهت مدة التعديل على باقتك — دعواتك لسه شغالة زي ما هي. '
      + 'لو محتاج تعدّل كلّمنا على واتساب أو خد باقة جديدة.',
    editUntil: until ? until.toISOString() : null,
    // الواجهة بتقول "باقة جديدة بتفتح {{days}} يوم" — الرقم من هنا مش متكرر
    editWindowDays: EDIT_WINDOW_DAYS,
  };
}

module.exports = {
  DAY_MS,
  isEditWindowOpen,
  editUntilAfterActivation,
  extendEditUntil,
  editWindowInfo,
  editWindowEndedBody,
};
