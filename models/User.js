// models/User.js
// حساب مستخدم مسجل — التسجيل بإيميل + باسورد. الباسورد بيتخزن كـ hash بس
// (bcrypt)، مفيش نص صريح أبدًا (routes/auth.js).
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String, required: true, unique: true, index: true,
    lowercase: true, trim: true, maxlength: 200,
  },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, maxlength: 80 },
  // كود الدولة (ISO 3166-1 alpha-2, زي "EG"، "SA") — مبعوت من الفرونت إند
  // (client/src/components/form/CountrySelect.jsx، مكتبة world-countries)
  country: { type: String, required: true, uppercase: true, minlength: 2, maxlength: 2 },

  // رقم تليفون اختياري بيدخله العميل وقت التسجيل — بيظهر في لوحة التحكم
  // عشان تقدر تتواصل معاه (واتساب). الحسابات القديمة مالهاش الحقل ده (فاضي).
  phone: { type: String, default: '', maxlength: 30 },

  // ===== نظام التسويق بالعمولة (UGC / أفلييت) =====
  // حساب UGC = مسوّق بياخد نسبة على كل عميل بيجي من لينك إحالته. الأدمن هو
  // اللي بيفعّله ويحدّد نسبته. الحسابات العادية كل الحقول دي فاضية/false.
  isUgc: { type: Boolean, default: false },
  // كود الإحالة الفريد — بيتولّد أول ما الأدمن يعمل الحساب UGC. لينكه /r/<code>
  referralCode: { type: String, index: { unique: true, sparse: true } },
  // نسبة عمولته (٪) — الأدمن بيحددها لكل UGC لوحده
  commissionRate: { type: Number, default: 0, min: 0, max: 100 },
  // رقم فودافون كاش اللي بيسحب عليه (بيدخله هو من لوحته)
  payoutPhone: { type: String, default: '', maxlength: 30 },
  // عدد مرات فتح لينك إحالته (زيارات)
  referralClicks: { type: Number, default: 0 },
  // للحسابات العادية: كود الـ UGC اللي جابهم لو سجّلوا من لينك إحالة. بيتحط
  // مرة واحدة وقت التسجيل ومبيتغيّرش. الحسابات القديمة = null (مش تابعة لحد).
  referredBy: { type: String, default: null, index: true },

  // الاشتراك — بيتفعّل يدويًا من لوحة التحكم بعد ما العميل يدفع
  // (packages/registry.js فيه تعريف الباقات ومميزاتها)
  subscription: {
    packageId: { type: String, default: null },      // basic | plus | pro
    invitationsLeft: { type: Number, default: 0 },   // رصيد الدعوات المميزة المتبقي
    activatedAt: { type: Date, default: null },
    // 'active' = شغالة، 'suspended' = موقوفة من لوحة التحكم (الرصيد بيفضل
    // زي ما هو، بس كل مميزات الباقة بتتقفل لحد ما تشغّلها تاني).
    // الافتراضي 'active' عشان كل الاشتراكات القديمة (اللي مفيهاش الحقل ده)
    // تفضل شغالة زي ما هي بالظبط.
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    suspendedAt: { type: Date, default: null },
    // سبب الإيقاف/ملاحظة إدارية — بتظهر للأدمن بس، مش للعميل
    adminNote: { type: String, default: '', maxlength: 500 },
    // آخر يوم للتعديل (المحرر) بعد تفعيل الباقة — packages/registry.js:
    // EDIT_WINDOW_DAYS. الدعوة نفسها بتفضل شغالة مدى الحياة، اللي بيتقفل
    // هو التعديل بس. null = تعديل مفتوح من غير حد: ده وضع كل الاشتراكات
    // اللي اتفعّلت قبل القاعدة دي، وأي حساب الأدمن فتحله التعديل بلا حدود.
    editUntil: { type: Date, default: null },
  },

  // حظر الحساب كله: مش بس الباقة — الجلسات بتتلغي ومبيقدرش يدخل تاني
  isBlocked: { type: Boolean, default: false },
  blockedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

// لوحة التحكم بترتّب العملاء بالأحدث وبتفلتر على حالة الاشتراك
userSchema.index({ createdAt: -1 });
userSchema.index({ 'subscription.packageId': 1 });

module.exports = mongoose.model('User', userSchema);
