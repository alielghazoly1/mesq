// models/MetaEvent.js
// سجل كل حدث السيرفر بعته لميتا (Conversions API) ونتيجته — عشان المالك يشوف
// بعينه إن ميتا استلمت (صفحة الإعلانات). capped: بيمسح القديم لوحده.
const mongoose = require('mongoose');

const metaEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  eventId: { type: String, default: '' },
  ok: { type: Boolean, default: false },
  error: { type: String, default: '' },
  test: { type: Boolean, default: false },
  value: { type: Number },
  currency: { type: String },
  // بيانات المطابقة اللي اتبعتت (أسامي الحقول بس: em/ph/fbp/...) — مش القيم
  matchKeys: { type: [String], default: [] },
  fbtrace: { type: String, default: '' },
  at: { type: Date, default: Date.now },
}, { capped: { size: 4 * 1024 * 1024, max: 5000 } });

module.exports = mongoose.model('MetaEvent', metaEventSchema);
