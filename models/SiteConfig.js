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
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
