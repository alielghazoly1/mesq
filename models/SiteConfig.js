// models/SiteConfig.js
// إعدادات الموقع العامة اللي المالك بيتحكم فيها من لوحة التحكم (غير بيانات
// الدفع اللي ليها موديلها). مستند واحد بس (singleton) بمفتاح ثابت.
//
// hiddenTemplates: معرّفات القوالب اللي المالك عايز يخفيها من قايمة
// القوالب اللي بتظهر للعملاء وقت إنشاء دعوة. الإخفاء بيأثر على القايمة
// بس — الدعوات الموجودة اللي بتستخدم القالب بتفضل شغالة عادي.
const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true, index: true },
  hiddenTemplates: { type: [String], default: [] },
  // ترتيب القوالب في المعرض (معرّفات بالترتيب) — اللي مش في القايمة بييجي
  // بعدهم بترتيب السجل. فاضية = الترتيب الافتراضي.
  templateOrder: { type: [String], default: [] },
  // القوالب اللي عليها شارة "جديد"
  newTemplates: { type: [String], default: [] },
  // false = المالك لسه مرتّبش بنفسه → بنستخدم الافتراضي من السجل (isNew
  // بييجي الأول وعليه "جديد"). أول ما يحفظ من اللوحة بتبقى true واختياره هو اللي بيمشي.
  templatesConfigured: { type: Boolean, default: false },
  // "الدخول بجوجل": الـ Client ID من Google Cloud (مش سر — بيتبعت للمتصفح).
  // فاضي = الزرار مش بيظهر خالص. googleLoginEnabled = المالك يقدر يقفله مؤقتًا.
  googleClientId: { type: String, default: '', maxlength: 200 },
  googleLoginEnabled: { type: Boolean, default: true },
  // أسعار الصرف لصفحة الأرباح (كام جنيه في الوحدة) — بيها بنجمع كل العملات
  // في رقم واحد بالجنيه للمكسب الصافي. المالك بيعدّلها من الصفحة نفسها.
  // بيكسل ميتا — Conversions API (utils/metaCapi.js). الـ Token سر: مابيرجعش للوحة
  // أبدًا (select:false) — اللوحة بتعرف بس إنه موجود وآخر 4 حروف منه.
  // metaTestCode: كود Test Events من Events Manager (للتجربة بس — فاضي = أحداث حقيقية).
  metaCapiToken: { type: String, default: '', select: false, maxlength: 600 },
  metaTestCode: { type: String, default: '', maxlength: 40 },
  metaCapiEnabled: { type: Boolean, default: true },
  fxRates: {
    USD: { type: Number, default: 50 },
    SAR: { type: Number, default: 13.3 },
    EUR: { type: Number, default: 58 },
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
