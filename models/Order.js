// models/Order.js
// طلب شراء باقة. دلوقتي الدفع بيتم برّه الموقع (إنستاباي/فودافون كاش/واتساب)
// والتفعيل يدوي من لوحة التحكم — فالطلب ده بيسجّل نية الشراء عشان تظهر
// لصاحب الموقع ويفعّلها. لما نضيف بوابة دفع أوتوماتيك بعدين، هي اللي
// هتغيّر status لـ paid من غير ما نغيّر باقي النظام.
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  packageId: { type: String, required: true },      // basic | plus | pro
  currency: { type: String, required: true },       // EGP | USD
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'activated', 'cancelled'],
    default: 'pending',
    index: true,
  },

  // طريقة الدفع:
  //   manual = تحويل يدوي (فودافون/بنك) بيراجعه الأدمن ويفعّله بإيده
  //   xpay   = دفع بالفيزا عبر XPay — بيتفعّل أوتوماتيك بعد تأكيد الدفع
  paymentMethod: { type: String, enum: ['manual', 'xpay'], default: 'manual', index: true },

  // ===== خاص بـ XPay =====
  // رقم جلسة الدفع — بنتأكّد بيه من حالة الدفع عند رجوع العميل
  xpaySessionId: { type: String, default: null, index: true },
  // معرّف آخر حدث webhook اتعالج لنفس الطلب — للـ idempotency (منع
  // تفعيل مكرر لو XPay بعتت نفس الإشعار مرتين)
  xpayEventId: { type: String, default: null },
  paidAt: { type: Date, default: null },

  // صورة إيصال التحويل اللي العميل بيرفعها (routes/uploads.js) — بتظهرلك
  // في لوحة التحكم جنب الطلب عشان تراجعها قبل التفعيل (للتحويل اليدوي بس)
  paymentProofUrl: { type: String, default: null },
  paymentProofAt: { type: Date, default: null },

  // وقت موافقة العميل على شروط الاستخدام قبل الدفع (سجل قانوني)
  termsAcceptedAt: { type: Date, default: null },

  activatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
