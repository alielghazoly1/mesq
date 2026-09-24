// utils/activateOrder.js
// تفعيل طلب باقة: بيضيف رصيد الباقة للعميل، بيفتح مدة التعديل، ويعلّم
// الطلب "متفعّل". مصدر واحد بيستخدمه:
//   - الأدمن لما يفعّل تحويل يدوي (routes/adminApi.js)
//   - webhook الدفع الأوتوماتيكي من XPay (routes/payments.js)
//
// ليه مصدر واحد: منطق "أضيف الرصيد وافتح مدة التعديل" حساس (فلوس) —
// لو اتكرر في مكانين واختلفوا، هيحصل إن عميل ياخد رصيد غلط. مكان واحد =
// سلوك واحد مضمون.
//
// الأمان الأهم هنا: **التفعيل مرة واحدة بس**. الـ webhook ممكن يوصل
// مرتين (XPay بتعيد الإرسال لو مردّناش بسرعة)، والعميل ممكن يرجّع صفحة
// النجاح كذا مرة. عشان كده بنعمل تحويل ذرّي pending→activated: أول نداء
// بس هو اللي بيكسب ويضيف الرصيد، وأي نداء بعده بيلاقي الطلب متفعّل
// ومبيعملش حاجة.
const Order = require('../models/Order');
const User = require('../models/User');
const { getPackage } = require('../packages/registry');
const { editUntilAfterActivation } = require('./editWindow');

/** نسخة نظيفة من الاشتراك — الكتابة بتستبدل الاشتراك كله فلازم كل الحقول */
function normalizeSubscription(sub) {
  const s = sub || {};
  return {
    packageId: s.packageId || null,
    invitationsLeft: s.invitationsLeft || 0,
    activatedAt: s.activatedAt || null,
    status: s.status || 'active',
    suspendedAt: s.suspendedAt || null,
    adminNote: s.adminNote || '',
    editUntil: s.editUntil || null,
  };
}

/**
 * @param {string|object} orderOrId الطلب أو رقمه
 * @param {{paidAt?:Date, xpayEventId?:string, method?:string}} [opts]
 * @returns {Promise<{activated:boolean, alreadyActive:boolean, user?, pkg?, invitationsLeft?, editUntil?}>}
 */
async function activateOrder(orderOrId, opts = {}) {
  const orderId = (orderOrId && orderOrId._id) ? orderOrId._id : orderOrId;

  // ===== 1) تحويل ذرّي: أول واحد بس بيكسب pending→activated =====
  const setOnActivate = { status: 'activated', activatedAt: new Date() };
  if (opts.paidAt) setOnActivate.paidAt = opts.paidAt;
  if (opts.xpayEventId) setOnActivate.xpayEventId = opts.xpayEventId;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: 'pending' },
    { $set: setOnActivate },
    { new: true }
  );

  if (!order) {
    // مكسبناش التحويل — نفرّق ليه عشان الرسالة الصح
    const existing = await Order.findById(orderId);
    if (!existing) throw Object.assign(new Error('الطلب ده مش موجود.'), { status: 404 });
    if (existing.status === 'activated') return { activated: false, alreadyActive: true, order: existing };
    if (existing.status === 'cancelled') throw Object.assign(new Error('الطلب ده ملغي.'), { status: 409 });
    throw Object.assign(new Error('تعذّر تفعيل الطلب.'), { status: 409 });
  }

  // ===== 2) إضافة الرصيد للعميل =====
  // لو أي حاجة وقعت هنا، بنرجّع الطلب pending تاني عشان مايفضلش "متفعّل"
  // من غير ما العميل ياخد رصيده — الاتساق أهم من إننا نكمّل غصب.
  try {
    const pkg = getPackage(order.packageId);
    if (!pkg) throw Object.assign(new Error('الباقة دي مش موجودة.'), { status: 400 });

    const user = await User.findById(order.userId);
    if (!user) throw Object.assign(new Error('المستخدم ده مش موجود.'), { status: 404 });

    // الرصيد بيتجمّع مش بيتستبدل — لو اشترى باقة تانية الدعوات بتتضاف
    const current = (user.subscription && user.subscription.invitationsLeft) || 0;
    // مدة التعديل الجديدة بتتحسب من الاشتراك **قبل** الاستبدال
    const editUntil = editUntilAfterActivation(user.subscription);
    user.subscription = {
      packageId: pkg.id,
      invitationsLeft: current + pkg.invitations,
      activatedAt: new Date(),
      status: 'active',
      suspendedAt: null,
      adminNote: (user.subscription && user.subscription.adminNote) || '',
      editUntil,
    };
    await User.updateOne(
      { _id: user._id },
      { $set: { subscription: normalizeSubscription(user.subscription) } },
      { runValidators: true }
    );

    return {
      activated: true,
      alreadyActive: false,
      order,
      user,
      pkg,
      invitationsLeft: user.subscription.invitationsLeft,
      editUntil,
    };
  } catch (err) {
    // تراجع: رجّع الطلب لحالته الأصلية عشان يتعاد تفعيله بأمان بعدين
    await Order.updateOne(
      { _id: order._id },
      { $set: { status: 'pending' }, $unset: { activatedAt: '', paidAt: '', xpayEventId: '' } }
    ).catch(() => { /* التراجع فشل — الأدمن هيشوفه في اللوحة */ });
    throw err;
  }
}

module.exports = { activateOrder, normalizeSubscription };
