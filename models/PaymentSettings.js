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

  // إنستاباي — طريقة تانية للعملاء في مصر جنب فودافون كاش.
  // link = لينك الدفع بتاع المالك (ipn.eg/S/...) — بيفتح التطبيق على
  // عنوانه على طول، والـ QR بيتولّد منه وقت العرض. address = عنوان الدفع
  // (xxx@instapay) للي عايز يكتبه بإيده. الافتراضي = بيانات المالك.
  instapay: {
    enabled: { type: Boolean, default: true },
    link: { type: String, default: 'https://ipn.eg/S/alimohamedelghazoly/instapay/3xjXTl', maxlength: 300 },
    address: { type: String, default: 'alimohamedelghazoly@instapay', maxlength: 120 },
    // رقم الموبايل المربوط بإنستاباي — للي عايز يحوّل بالرقم بدل العنوان
    phone: { type: String, default: '', maxlength: 40 },
    name: { type: String, default: '', maxlength: 120 },
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

  // KAST — وسيلة دفع عالمية اختيارية (بتتفعّل/تتقفل من لوحة التحكم).
  // بتظهر جنب الحساب البنكي للعملاء بره مصر. link = لينك الـ KastTag،
  // والـ QR بيتولّد منه تلقائيًا وقت العرض.
  kast: {
    enabled: { type: Boolean, default: false },
    link: { type: String, default: '', maxlength: 300 },
    holderName: { type: String, default: '', maxlength: 120 },
    note: { type: String, default: '', maxlength: 400 },
  },

  // Taptap Send — للعملاء في البلاد اللي التطبيق بيبعت منها لمصر بس
  // (utils/paymentSettings.js: TAPTAP_COUNTRIES). العميل بيحوّل من التطبيق
  // على فودافون كاش: رقم الموبايل + اسم المستلم + المكان. بتتملي من اللوحة،
  // ومبتظهرش للعميل غير لما الرقم والاسم يبقوا مكتوبين.
  taptap: {
    enabled: { type: Boolean, default: false },
    phone: { type: String, default: '', maxlength: 40 },
    recipientName: { type: String, default: '', maxlength: 120 },
    location: { type: String, default: '', maxlength: 160 },
    note: { type: String, default: '', maxlength: 400 },
  },

  // USDT على شبكة Solana — وسيلة تالتة للعملاء بره مصر بس (جنب البنك و KAST).
  // العنوان الافتراضي = محفظة المالك (KAST)، فبتشتغل من أول يوم من غير ما
  // حد يدخل اللوحة؛ ويقدر يغيّره أو يقفلها من "بيانات الدفع".
  usdt: {
    enabled: { type: Boolean, default: true },
    address: { type: String, default: 'DQZ5mrPgLFWUgaQBq1ymB5zwBFhny7UmGGjAFPiAp1Ec', maxlength: 64 },
    note: { type: String, default: '', maxlength: 400 },
  },

  // ===== السعودية (العملاء اللي مسجّلين من السعودية — بيدفعوا بالريال) =====
  // تلات طرق، كل واحدة بتتفعّل لوحدها من "بيانات الدفع" وبتظهر للعميل
  // السعودي بس لما بياناتها تكون مكتوبة:
  //   • bank   — تحويل لحساب بنكي سعودي (IBAN SA…)
  //   • barq   — تحويل من تطبيق برق (رقم الجوال/المحفظة اللي هيستقبل)
  //   • wallet — تحويل على محفظة فودافون كاش (من أي تطبيق تحويل دولي)
  saudi: {
    bank: {
      enabled: { type: Boolean, default: false },
      bankName: { type: String, default: '', maxlength: 120 },
      accountName: { type: String, default: '', maxlength: 120 },
      iban: { type: String, default: '', maxlength: 60 },
      accountNumber: { type: String, default: '', maxlength: 60 },
      note: { type: String, default: '', maxlength: 400 },
    },
    barq: {
      enabled: { type: Boolean, default: false },
      phone: { type: String, default: '', maxlength: 40 },
      name: { type: String, default: '', maxlength: 120 },
      note: { type: String, default: '', maxlength: 400 },
    },
    wallet: {
      enabled: { type: Boolean, default: false },
      number: { type: String, default: '', maxlength: 40 },
      name: { type: String, default: '', maxlength: 120 },
      note: { type: String, default: '', maxlength: 400 },
    },
  },

  // رقم واتساب التواصل بعد التحويل
  whatsapp: { type: String, default: '', maxlength: 40 },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
