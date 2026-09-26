// models/Withdrawal.js
// طلب سحب أرباح من حساب UGC (مسوّق بالعمولة). الـ UGC بيطلب مبلغ من رصيده
// المتاح (بعملة معينة)، والأدمن بيحوّله فودافون كاش ويأكّد. الرصيد بيتحسب
// ديناميكيًا من الطلبات المفعّلة لعملائه (utils/ugc.js) ناقص السحوبات
// (المدفوعة + المعلّقة).
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  ugcUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // العملة اللي بيسحب بيها (نفس تقسيم الأرباح: جنيه لوحده / دولار لوحده)
  currency: { type: String, enum: ['EGP', 'USD'], required: true },
  amount: { type: Number, required: true, min: 0 },
  // رقم فودافون كاش وقت الطلب (بيتسجّل مع الطلب حتى لو غيّره بعدين)
  phone: { type: String, default: '', maxlength: 30 },
  // pending = مستني تحويل، paid = اتحوّل واتأكد، rejected = مرفوض
  status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending', index: true },
  adminNote: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

withdrawalSchema.index({ ugcUserId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
