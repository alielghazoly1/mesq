// models/InvitationDay.js
// إحصائيات الدعوة يوم بيوم (بتوقيت القاهرة) — لوحة العميل بترسم منها
// الرسم البياني ومصادر الزيارات والأجهزة وأكتر ساعة الضيوف بيفتحوا فيها.
//
// مستند واحد لكل (دعوة، يوم) بيتزوّد بـ $inc مع كل فتحة — من غير ما نخزّن
// أي حاجة عن الضيف نفسه (لا IP ولا جهاز). "ضيف جديد" = متصفح مافتحش
// الدعوة قبل كده (كوكي على الدعوة دي بس).
//
// viewCount على الدعوة نفسها فاضل زي ما هو (الإجمالي من أول يوم). المستندات
// دي بتبدأ من يوم ما الميزة نزلت — الدعوات القديمة بيبان لها "من يوم كذا".
const mongoose = require('mongoose');

const SOURCES = ['direct', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'snapchat', 'google', 'qr', 'other'];

const invitationDaySchema = new mongoose.Schema({
  shortId: { type: String, required: true },
  day: { type: String, required: true }, // YYYY-MM-DD (القاهرة)
  views: { type: Number, default: 0 },
  uniques: { type: Number, default: 0 },
  src: SOURCES.reduce((acc, k) => { acc[k] = { type: Number, default: 0 }; return acc; }, {}),
  dev: {
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
  },
  // h0..h23 — فتحات كل ساعة (القاهرة)
  hours: { type: Map, of: Number, default: undefined },
}, { versionKey: false });

invitationDaySchema.index({ shortId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('InvitationDay', invitationDaySchema);
module.exports.SOURCES = SOURCES;
