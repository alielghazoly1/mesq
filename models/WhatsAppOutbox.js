// models/WhatsAppOutbox.js
// صندوق الرسايل اللي هتتبعت (أو اتبعتت) من واتساب المالك.
//
// - reason "checkout": رسالة "محتاج مساعدة في الدفع؟" — **مرة واحدة بس لكل
//   عميل طول العمر** (فهرس فريد على userId + reason).
// - reason "test": رسالة تجربة من اللوحة لرقم تكتبه إنت.
const mongoose = require('mongoose');

const whatsAppOutboxSchema = new mongoose.Schema({
  reason: { type: String, enum: ['checkout', 'test'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: '' },
  // الرقم زي ما العميل كتبه، والرقم الدولي بعد التظبيط (أرقام بس)
  phoneRaw: { type: String, default: '' },
  phone: { type: String, required: true },
  packageId: { type: String, default: '' },
  text: { type: String, default: '' },  // للتجربة بس — رسالة العميل بتتبني وقت البعت من الإعدادات

  status: {
    type: String,
    enum: ['pending', 'sending', 'sent', 'skipped', 'failed'],
    default: 'pending',
    index: true,
  },
  // سبب التخطّي/الفشل: paid | no_whatsapp | blocked | expired | error
  note: { type: String, default: '' },
  sendAfter: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
});

// مرة واحدة لكل عميل
whatsAppOutboxSchema.index(
  { userId: 1, reason: 1 },
  { unique: true, partialFilterExpression: { reason: 'checkout' } }
);

module.exports = mongoose.model('WhatsAppOutbox', whatsAppOutboxSchema);
