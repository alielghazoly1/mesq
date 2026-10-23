// models/AdminPin.js
// العملاء والدعوات اللي المالك ثبّتهم في اللوحة ("المثبّتين") — بيفضلوا فوق
// على طول في صفحة العملاء/الدعوات ولهم صفحة لوحدهم. متخزّنين على السيرفر
// (مش في المتصفح) عشان يبانوا من أي جهاز يفتح منه اللوحة.
//   kind 'user'       → ref = _id بتاع العميل
//   kind 'invitation' → ref = shortId بتاع الدعوة
const mongoose = require('mongoose');

const adminPinSchema = new mongoose.Schema({
  kind: { type: String, enum: ['user', 'invitation'], required: true },
  ref: { type: String, required: true },
  // ملاحظة قصيرة: ليه متثبّت ("عميل VIP"، "فرح الخميس"...)
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

adminPinSchema.index({ kind: 1, ref: 1 }, { unique: true });

module.exports = mongoose.model('AdminPin', adminPinSchema);
