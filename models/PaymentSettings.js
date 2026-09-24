// models/PaymentSettings.js
// بيانات الدفع اللي بتظهر للعميل بعد ما يطلب باقة — بتتحكم فيها بالكامل
// من لوحة التحكم من غير ما تلمس الكود.
//
// المصري بيتحوّل على فودافون كاش، وغير المصري على الحساب البنكي.
// اسم صاحب الحساب البنكي بيتخزن بالعربي والإنجليزي، والعنوان كمان،
// لأن التحويلات الدولية بتطلبهم كتير.
//
// المستند ده واحد بس في القاعدة (singleton) — بنستخدم مفتاح ثابت عشان
// نضمن إنه مايتكررش.
const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  // مفتاح ثابت يضمن وجود مستند واحد بس
  key: { type: String, default: 'default', unique: true, index: true },

  // للعملاء في مصر
  vodafone: {
    number: { type: String, default: '', maxlength: 40 },
    holderName: { type: String, default: '', maxlength: 120 },
    note: { type: String, default: '', maxlength: 400 },
  },

  // لأي عميل بره مصر
  bank: {
    bankName: { type: String, default: '', maxlength: 120 },
    accountNameAr: { type: String, default: '', maxlength: 120 },
    accountNameEn: { type: String, default: '', maxlength: 120 },
    accountNumber: { type: String, default: '', maxlength: 60 },
    iban: { type: String, default: '', maxlength: 60 },
    swift: { type: String, default: '', maxlength: 30 },
    address: { type: String, default: '', maxlength: 300 },
    note: { type: String, default: '', maxlength: 400 },
  },

  // رقم واتساب التواصل بعد التحويل
  whatsapp: { type: String, default: '', maxlength: 40 },

  // مفتاح الأدمن لتشغيل/إيقاف الدفع بالفيزا (XPay) من اللوحة من غير ما
  // يلمس env. المفاتيح السرية نفسها بتفضل في env دايمًا — ده بيقفل الخيار
  // بس. الدفع بالفيزا بيشتغل بس لو ده true **و** المفاتيح متظبطة في env.
  xpayEnabled: { type: Boolean, default: true },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
