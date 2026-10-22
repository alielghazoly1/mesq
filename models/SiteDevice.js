// models/SiteDevice.js
// سجل بكل جهاز شاف الموقع ولو مرة (أول وآخر ظهور، وكام يوم رجع) — منه بنعرف
// الجهاز "جديد" ولا "راجع". مفيش أي بيانات شخصية: رقم عشوائي من المتصفح بس.
const mongoose = require('mongoose');

const siteDeviceSchema = new mongoose.Schema({
  device: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, default: null },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  days: { type: Number, default: 0 },
});

module.exports = mongoose.model('SiteDevice', siteDeviceSchema);
