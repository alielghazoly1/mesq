// models/WhatsAppAuth.js
// جلسة واتساب المالك (الرقم اللي اتربط بالـ QR من لوحة التحكم).
//
// كل مفتاح من مفاتيح الجلسة مستند لوحده (_id = اسم المفتاح، زي "creds" أو
// "session-2010...")، والقيمة **متشفّرة** (AES-256-GCM بمفتاح من ADMIN_SECRET)
// — لأن اللي معاه الجلسة دي يقدر يبعت من رقمك. لو ADMIN_SECRET اتغيّر،
// القيم القديمة مابتتفكّش والربط بيتلغي لوحده (تربط من الأول بـ QR جديد).
const mongoose = require('mongoose');

const whatsAppAuthSchema = new mongoose.Schema({
  _id: { type: String },
  v: { type: String, required: true },
}, { versionKey: false });

module.exports = mongoose.model('WhatsAppAuth', whatsAppAuthSchema);
