// models/Presence.js
// مين فاتح الموقع دلوقتي. كل تاب مفتوح بيبعت "أنا هنا" كل شوية
// (POST /api/presence)، وده بيحدّث lastSeen. اللي آخر ظهور ليه في آخر
// دقيقة ونص = متصل. السجلات القديمة بتتمسح لوحدها (TTL) — الجدول بيفضل
// صغير طول الوقت مهما كان عدد الزوار.
const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  // 'u:<userId>' للعميل المسجّل، 'v:<visitorId>' للزائر — سجل واحد لكل واحد
  key: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // الصفحة اللي هو عليها (المسار بس — من غير أي query) عشان تعرف هو فين
  path: { type: String, default: '', maxlength: 120 },
  lastSeen: { type: Date, default: Date.now },
  // الزيارة الحالية للعميل المسجّل (models/Visit.js)
  visitId: { type: mongoose.Schema.Types.ObjectId, default: null },
});

// السجل بيتمسح تلقائيًا بعد 15 دقيقة من آخر ظهور
presenceSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 15 * 60 });
presenceSchema.index({ userId: 1, lastSeen: -1 });

module.exports = mongoose.model('Presence', presenceSchema);
