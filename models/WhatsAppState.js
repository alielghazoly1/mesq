// models/WhatsAppState.js
// مستند واحد: إعدادات رسايل الواتساب التلقائية + حالة الربط.
//
// الحالة (status/qr/phone) بيكتبها السيرفر اللي ماسك الاتصال، ولوحة التحكم
// بتقراها من هنا. وطلبات اللوحة (اربط / افصل) بتتكتب هنا برضه والسيرفر
// بينفّذها — كده الشغل صح حتى لو فيه أكتر من نسخة من السيرفر شغالة: نسخة
// واحدة بس (اللي معاها "القفل" lease) هي اللي بتتصل بواتساب وتبعت.
const mongoose = require('mongoose');

const DEFAULT_MESSAGE = [
  'أهلًا {name} 👋',
  'معاك ميثاق 🤍 شفناك بتختار {package}.',
  '',
  'لو محتاج أي مساعدة في الدفع أو عندك أي سؤال، ابعتلي هنا على طول وأنا معاك خطوة بخطوة.',
].join('\n');

const whatsAppStateSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },

  // ===== الإعدادات (من اللوحة) =====
  // الرسايل التلقائية شغالة؟ (الربط نفسه منفصل — ممكن تكون مربوط والرسايل واقفة)
  enabled: { type: Boolean, default: false },
  message: { type: String, default: DEFAULT_MESSAGE, maxlength: 1000 },
  // بنستنى كام دقيقة بعد ما يفتح صفحة الدفع — لو دفع أو رفع الإيصال فيهم مش بنبعت
  delayMinutes: { type: Number, default: 10, min: 1, max: 1440 },
  // أقصى عدد رسايل في اليوم (بتوقيت مصر) — حماية للرقم من الحظر
  dailyLimit: { type: Number, default: 40, min: 1, max: 300 },
  // ساعات البعت (بتوقيت مصر): من الساعة sendFromHour لحد sendToHour
  sendFromHour: { type: Number, default: 9, min: 0, max: 23 },
  sendToHour: { type: Number, default: 23, min: 1, max: 24 },

  // ===== الربط =====
  wantLinked: { type: Boolean, default: false },   // المالك عايز يكون مربوط
  linkRequestedAt: { type: Date, default: null },
  unlinkRequestedAt: { type: Date, default: null },

  // ===== الحالة الحالية (بيكتبها السيرفر) =====
  status: { type: String, enum: ['off', 'connecting', 'qr', 'connected'], default: 'off' },
  qr: { type: String, default: '' },
  qrAt: { type: Date, default: null },
  phone: { type: String, default: '' },
  name: { type: String, default: '' },
  connectedAt: { type: Date, default: null },
  lastError: { type: String, default: '' },
  heartbeatAt: { type: Date, default: null },
  lastSentAt: { type: Date, default: null },
  // تشخيص: آخر خطوة وصلها الاتصال وآخر كود قفل — عشان لو الـ QR مابيظهرش نعرف ليه
  diag: {
    stage: { type: String, default: '' },
    code: { type: Number, default: 0 },
    message: { type: String, default: '' },
    at: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    version: { type: String, default: '' },
  },

  // ===== القفل: مين من نسخ السيرفر ماسك الاتصال =====
  leaseOwner: { type: String, default: '' },
  leaseUntil: { type: Date, default: null },
}, { timestamps: true });

const WhatsAppState = mongoose.model('WhatsAppState', whatsAppStateSchema);
WhatsAppState.DEFAULT_MESSAGE = DEFAULT_MESSAGE;
module.exports = WhatsAppState;
