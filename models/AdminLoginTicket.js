// models/AdminLoginTicket.js
// تذكرة الخطوة التانية من الدخول: كلمة السر اتقبلت، ومستنيين كود الموبايل.
// صالحة 5 دقايق، لنفس المتصفح بس، و5 محاولات كود بالكتير — وبعدها لازم
// يبدأ من كلمة السر تاني.
const mongoose = require('mongoose');

const adminLoginTicketSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  fingerprint: { type: String, default: '' },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

adminLoginTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.AdminLoginTicket || mongoose.model('AdminLoginTicket', adminLoginTicketSchema);
