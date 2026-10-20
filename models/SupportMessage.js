// models/SupportMessage.js
// محادثة دعم بين العميل وصاحب الموقع. كل رسالة سطر مستقل، والمحادثة
// بتتجمع بـ userId — أبسط من تخزين مصفوفة رسايل في مستند واحد، وبيخلي
// ترتيب وعدّ الرسايل غير المقروءة سهل.
//
// الرسالة يا كلام (kind: 'text') يا فويس (kind: 'voice' — ملف mp3 على
// Cloudinary). readAt = إمتى الطرف التاني شافها (علامة "اتشافت" ✓✓).
const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // مين اللي كاتب الرسالة
  from: { type: String, enum: ['user', 'admin'], required: true },
  kind: { type: String, enum: ['text', 'voice'], default: 'text' },
  // الفويس من غير كلام — فالكلام مش إجباري (الراوت بيتأكد إن فيه واحد منهم)
  body: { type: String, default: '', maxlength: 2000 },
  voice: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    duration: { type: Number, default: 0 },
  },
  // اتقريت من الطرف التاني ولا لسه
  readByAdmin: { type: Boolean, default: false },
  readByUser: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

supportMessageSchema.index({ userId: 1, createdAt: 1 });
// عدّ اللي مستنيك في اللوحة (من غير ما نلف على كل الرسايل)
supportMessageSchema.index({ from: 1, readByAdmin: 1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
