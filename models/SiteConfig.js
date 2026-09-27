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
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
