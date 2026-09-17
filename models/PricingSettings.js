// models/PricingSettings.js
// خصومات الباقات — بتتحكم فيها بالكامل من لوحة التحكم من غير ما تلمس
// الكود ولا تعمل deploy.
//
// الخصم بينطبق على سعر القايمة بتاع كل باقة، بالعملتين مع بعض: العميل
// المصري بيشوف الخصم على سعر الجنيه، والعميل اللي برّه بيشوفه على سعر
// الدولار — نفس النسبة، فمحدش بياخد صفقة أحسن من التاني بالغلط.
//
// المستند ده واحد بس في القاعدة (singleton) — مفتاح ثابت يضمن إنه
// مايتكررش، زي PaymentSettings بالظبط.
const mongoose = require('mongoose');

const pricingSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true, index: true },

  // القفل الرئيسي. لو اتقفل، كل الأسعار بترجع لسعر القايمة على طول
  // في كل مكان في الموقع — من غير ما تمسح النسب اللي ظابطها.
  enabled: { type: Boolean, default: false },

  // النسبة العامة (٪) اللي بتنطبق على أي باقة مالهاش نسبة خاصة بيها.
  // 0 = مفيش خصم.
  percent: { type: Number, default: 0, min: 0, max: 90 },

  // نسب خاصة لباقات بعينها: { basic: 25, pro: 10 }.
  // القيمة 0 معناها "الباقة دي من غير خصم" — مش "ارجع للنسبة العامة"،
  // عشان تقدر تستثني باقة واحدة من غير ما تلغي الخصم كله.
  perPackage: { type: mongoose.Schema.Types.Mixed, default: {} },

  // كلام الشارة اللي بتظهر جنب السعر (اختياري — لو فاضي بيتكتب
  // "خصم ٪N" تلقائيًا بلغة العميل)
  labelAr: { type: String, default: '', maxlength: 60 },
  labelEn: { type: String, default: '', maxlength: 60 },

  // آخر ميعاد للعرض (اختياري). بعد الميعاد ده الخصم بيقف لوحده من غير
  // ما حد يفتح اللوحة — عشان عرض مؤقت مايفضلش شغال شهور بالغلط.
  endsAt: { type: Date, default: null },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PricingSettings', pricingSettingsSchema);
