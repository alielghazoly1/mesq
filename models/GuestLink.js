// models/GuestLink.js
// لينك دعوة شخصي لضيف معيّن: صاحب الدعوة بيعمله من صفحة الإحصائيات (/s/:token)
// باسم الضيف وعدد الأشخاص المسموح لهم، والضيف لما يفتحه بيلاقي اسمه والعدد في
// الدعوة نفسها (/i/:shortId?g=code). الكود عشوائي وصعب تخمينه — مفيش بيانات
// حساسة فيه، والدعوة نفسها بتسأل السيرفر عن الاسم والعدد.
const mongoose = require('mongoose');

const guestLinkSchema = new mongoose.Schema({
  shortId: { type: String, required: true, index: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  seats: { type: Number, required: true, min: 1, max: 20 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GuestLink', guestLinkSchema);
