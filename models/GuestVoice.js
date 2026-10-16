// models/GuestVoice.js
// تهنئة صوتية سجّلها ضيف من جوه الدعوة (القوالب اللي بتدعمها —
// templates/registry.js: guestVoice). الملف نفسه على Cloudinary (mp3)؛ هنا
// بس بياناته ومين سجّله. خاصة بصاحب الدعوة — مفيش أي مسار عام بيعرضها.
const mongoose = require('mongoose');

const guestVoiceSchema = new mongoose.Schema({
  // نفس معرّف الدعوة اللي في اللينك — زي Rsvp وGuestPhoto بالظبط
  shortId: { type: String, required: true },

  url: { type: String, required: true, maxlength: 600 },
  publicId: { type: String, required: true, maxlength: 300 },
  // بالثواني (من Cloudinary، أو من المتصفح لو Cloudinary مارجّعهاش)
  duration: { type: Number, default: 0 },
  bytes: { type: Number, default: 0 },

  guestName: { type: String, default: '', maxlength: 60 },
  deviceId: { type: String, default: null },

  // صاحب الدعوة سمعها؟ (عشان علامة "جديد" وعدّاد اللي ماتسمعش على كارت الدعوة)
  heardAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

// القايمة بتتعرض بالأحدث الأول وبتتحمّل صفحة صفحة (المؤشر = _id آخر تهنئة)
guestVoiceSchema.index({ shortId: 1, _id: -1 });
// عدد تهاني الجهاز الواحد على الدعوة (الحد الأقصى لكل ضيف)
guestVoiceSchema.index({ shortId: 1, deviceId: 1 });

module.exports = mongoose.model('GuestVoice', guestVoiceSchema);
