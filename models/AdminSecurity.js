// models/AdminSecurity.js
// إعدادات أمان لوحة التحكم — مستند واحد بس (key: 'default').
//
// سر التحقق بخطوتين متخزّن **مشفّر** (AES-256-GCM) بمفتاح مشتق من
// ADMIN_SECRET — فنسخة من قاعدة البيانات لوحدها مش كفاية لتوليد الأكواد.
// والأكواد الاحتياطية متخزّنة بصمات (sha256) بس، زي الباسوردات.
const mongoose = require('mongoose');

const adminSecuritySchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },

  totpEnabled: { type: Boolean, default: false },
  totpSecretEnc: { type: String, default: '' },
  // بصمة مفتاح التشفير وقت التفعيل — لو ADMIN_SECRET اتغيّر، السر القديم
  // مبقاش ينفع يتفك، فالتحقق بخطوتين بيتعتبر مقفول (وده طريق الطوارئ
  // الموثّق لو الموبايل والأكواد الاحتياطية ضاعوا)
  keyCheck: { type: String, default: '' },
  enabledAt: { type: Date, default: null },
  // آخر خطوة (30 ثانية) اتقبل كودها — نفس الكود مايتقبلش مرتين
  lastStep: { type: Number, default: -1 },

  // إعداد لسه ماتأكدش (اتعمل QR ولسه ماكتبش الكود)
  pendingSecretEnc: { type: String, default: '' },
  pendingAt: { type: Date, default: null },

  backupCodes: [{
    hash: { type: String, required: true },
    usedAt: { type: Date, default: null },
  }],
});

module.exports = mongoose.models.AdminSecurity || mongoose.model('AdminSecurity', adminSecuritySchema);
