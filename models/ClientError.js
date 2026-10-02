// models/ClientError.js
// انهيار حصل في واجهة الموقع عند عميل (React ErrorBoundary). من غيره كان
// العميل بيشوف "حصلت مشكلة غير متوقعة" والسبب بيضيع في كونسول متصفحه —
// ومنقدرش نعرف حصل إيه. دلوقتي السبب بيتسجّل هنا ويبان في لوحة التحكم.
// السجلات بتتمسح لوحدها بعد 60 يوم.
const mongoose = require('mongoose');

const clientErrorSchema = new mongoose.Schema({
  message: { type: String, default: '', maxlength: 500 },
  stack: { type: String, default: '', maxlength: 4000 },
  componentStack: { type: String, default: '', maxlength: 4000 },
  // المكان اللي كان فيه (من غير query) + وصف قصير لكان بيعمل إيه
  path: { type: String, default: '', maxlength: 200 },
  where: { type: String, default: '', maxlength: 80 },
  context: { type: String, default: '', maxlength: 500 },
  userAgent: { type: String, default: '', maxlength: 300 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
});

clientErrorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('ClientError', clientErrorSchema);
