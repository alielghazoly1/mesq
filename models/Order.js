// models/Order.js
// طلب شراء باقة. دلوقتي الدفع بيتم برّه الموقع (فودافون كاش/تحويل/واتساب)
// والتفعيل يدوي من لوحة التحكم — فالطلب ده بيسجّل نية الشراء عشان تظهر
// لصاحب الموقع ويفعّلها. لما نضيف بوابة دفع أوتوماتيك بعدين، هي اللي
// هتغيّر status لـ paid من غير ما نغيّر باقي النظام.
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  packageId: { type: String, required: true },      // basic | plus | pro
  currency: { type: String, required: true },       // EGP | USD | SAR | EUR
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'activated', 'cancelled'],
    default: 'pending',
    index: true,
  },
  // صورة إيصال التحويل اللي العميل بيرفعها (routes/uploads.js) — بتظهرلك
  // في لوحة التحكم جنب الطلب عشان تراجعها قبل التفعيل
  paymentProofUrl: { type: String, default: null },
  paymentProofAt: { type: Date, default: null },
  // بديل الإيصال للدفع المصري (فودافون كاش / إنستاباي): رقم الموبايل اللي حوّل منه.
  // paymentProofAt بيتسجّل معاه كوقت الإرسال — utils/orderProof.js
  paymentSenderPhone: { type: String, default: null },

  activatedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },

  // رسالة مرة واحدة للعميل بنتيجة مراجعة الإيصال: 'activated' (الباقة
  // اتفعّلت) أو 'rejected' (الإيصال اترفض). بتتحط من لوحة التحكم وقت التفعيل
  // أو الرفض، وبتختفي أول ما العميل يشوفها (noticeSeenAt) — على أي جهاز.
  // الطلبات القديمة ملهاش notice فمحدش هيوصله رسالة عن حاجة قديمة.
  notice: { type: String, enum: ['', 'activated', 'rejected'], default: '' },
  noticeSeenAt: { type: Date, default: null },

  // بيكسل ميتا: بيانات متصفح العميل (كوكيز _fbp/_fbc والـ IP والمتصفح) من آخر
  // خطوة عملها — عشان حدث الشراء اللي بيتبعت لما الأدمن يفعّل يتنسب للإعلان الصح.
  // metaSent: كل حدث اتبعت امتى (مايتكررش).
  metaCtx: {
    fbp: String, fbc: String, ip: String, ua: String, url: String,
  },
  metaSent: {
    ic: Date, pay: Date, purchase: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
