// models/GuestWish.js
// تهنئة مكتوبة في "سجل التهاني" جوه الدعوة (الاسم + التهنئة). على عكس ردود الحضور،
// التهاني دي بتتعرض للضيوف كلهم على صفحة الدعوة — بس في الدعوات الكاستم اللي
// طالبة كده (custom-invitations/<id>.js: publicWishes: true).
const mongoose = require('mongoose');

const guestWishSchema = new mongoose.Schema({
  shortId: { type: String, required: true },
  guestName: { type: String, required: true, maxlength: 60 },
  message: { type: String, required: true, maxlength: 400 },
  deviceId: { type: String, default: null },
  // صاحب الدعوة (أو إحنا) ممكن نخفي تهنئة من غير ما نمسحها
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

guestWishSchema.index({ shortId: 1, createdAt: -1 });

module.exports = mongoose.model('GuestWish', guestWishSchema);
