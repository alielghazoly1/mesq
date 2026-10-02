// models/Visit.js
// كل زيارة (جلسة تصفح) لعميل مسجّل على الموقع: بدأت إمتى، آخر نشاط فيها،
// دخل من أنهي صفحة، ومن أنهي جهاز. بتتعمل من إشارة الحضور اللي الموقع
// أصلًا بيبعتها (routes/presence.js) — من غير أي طلب زيادة من المتصفح.
// زيارة جديدة = العميل رجع بعد 15 دقيقة من غير نشاط (أو أول مرة).
//
// العدد الكلي على العميل نفسه (User.visitCount) وده مبيتمسحش؛ التفاصيل
// هنا بتتمسح لوحدها بعد سنة عشان الجدول مايكبرش على الفاضي.
const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  // آخر نشاط — بيتحدّث كل دقيقتين على الأكتر (مع آخر ظهور على الحساب)
  lastSeenAt: { type: Date, default: Date.now },
  // أول صفحة فتحها في الزيارة (المسار بس)
  path: { type: String, default: '', maxlength: 120 },
  device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  os: { type: String, default: '', maxlength: 20 },
});

visitSchema.index({ userId: 1, startedAt: -1 });
visitSchema.index({ startedAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('Visit', visitSchema);
