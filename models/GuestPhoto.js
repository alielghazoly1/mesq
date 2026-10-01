// models/GuestPhoto.js
// صورة رفعها ضيف على ألبوم دعوة (قسم "شاركونا اللحظات" في القوالب اللي
// بتدعمه — templates/registry.js: guestPhotos). الملف نفسه على Cloudinary؛
// هنا بس بياناته ومين رفعه.
const mongoose = require('mongoose');

const guestPhotoSchema = new mongoose.Schema({
  // نفس معرّف الدعوة اللي في اللينك — زي Rsvp بالظبط
  shortId: { type: String, required: true },

  url: { type: String, required: true, maxlength: 600 },
  publicId: { type: String, required: true, maxlength: 300 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  bytes: { type: Number, default: 0 },

  guestName: { type: String, default: '', maxlength: 60 },
  // بصمة "مفتاح الضيف" (sha256) — المفتاح نفسه على جهاز الضيف بس. اللي
  // معاه نفس المفتاح بس هو اللي يقدر يمسح الصورة (غير صاحب الدعوة).
  guestKeyHash: { type: String, required: true, maxlength: 64 },
  deviceId: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

// الألبوم بيتعرض بالأحدث الأول وبيتحمّل صفحة صفحة (المؤشر = _id آخر صورة)
guestPhotoSchema.index({ shortId: 1, _id: -1 });
// عدد صور الضيف الواحد (الحد الأقصى لكل ضيف)
guestPhotoSchema.index({ shortId: 1, guestKeyHash: 1 });

module.exports = mongoose.model('GuestPhoto', guestPhotoSchema);
