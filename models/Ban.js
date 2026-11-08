// models/Ban.js
// حظر جهاز من الموقع (بطلب المالك) — utils/banGate.js بيقرا القائمة دي.
//   kind 'ip'     → value = بصمة الـIP المشفّرة (نفس ipHashOf في utils/siteAnalytics.js) —
//                    الموقع مابيخزّنش الـIP نفسه. بتنتهي (expiresAt) لأن عناوين الموبايل بتتغيّر
//                    وبتتوزّع على ناس تانية.
//   kind 'device' → value = رقم الجهاز في التحليلات (vid من المتصفح).
// userId = الحساب اللي الحظر اتعمل بسببه (رفع الحظر عنه من لوحة التحكم بيمسح حظر أجهزته كمان).
const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
  kind: { type: String, enum: ['ip', 'device'], required: true },
  value: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  note: { type: String, default: '', maxlength: 200 },
  createdAt: { type: Date, default: Date.now },
  // null = من غير نهاية. MongoDB بيمسح الحظر المنتهي لوحده (TTL).
  expiresAt: { type: Date, default: null },
});

banSchema.index({ kind: 1, value: 1 }, { unique: true });
banSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.Ban || mongoose.model('Ban', banSchema);
