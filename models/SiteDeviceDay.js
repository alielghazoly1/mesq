// models/SiteDeviceDay.js
// تحليلات الموقع: مستند واحد لكل (جهاز، يوم بتوقيت مصر).
//
// "الجهاز" = رقم عشوائي محفوظ على المتصفح (PresencePing: mithaq:vid) — مش IP:
// الـ IP بيتشارك بين أجهزة كتير (نفس الواي فاي / شبكة الموبايل) وبيتغيّر على
// نفس الموبايل، فعدّ الأجهزة بيه بيطلع غلط. لو المتصفح مانع التخزين (تصفح
// خاص) بنستخدم بصمة من IP + المتصفح. الـ IP نفسه مبيتخزنش — hash بس، بنعدّ منه
// "كام شبكة مختلفة" كرقم جانبي.
//
// بيتكتب من POST /api/presence (كل دقيقتين على الأكتر لكل جهاز، أو أول ما
// الساعة تتغيّر) — مفيش أي طلب زيادة من المتصفح. البرامج الآلية مابتتعدّش
// (الإشارة محتاجة متصفح حقيقي شغّال جافاسكريبت والتاب ظاهر)، وأجهزة صاحب
// الموقع (جلسة الأدمن / mithaq_owner) مابتتعدّش.
const mongoose = require('mongoose');

const siteDeviceDaySchema = new mongoose.Schema({
  day: { type: String, required: true },          // YYYY-MM-DD (القاهرة)
  device: { type: String, required: true },       // vid أو h:<بصمة>
  userId: { type: mongoose.Schema.Types.ObjectId, default: null },
  loggedIn: { type: Boolean, default: false },
  ipHash: { type: String, default: '' },
  hours: { type: [Number], default: [] },         // الساعات (0–23 القاهرة) اللي كان فاتح فيها
  activeSec: { type: Number, default: 0 },        // وقت فعلي والتاب ظاهر
  sessions: { type: Number, default: 0 },         // زيارات (فاصل 15 دقيقة = زيارة جديدة)
  pages: { type: [String], default: [] },         // أقسام الموقع اللي دخلها
  entry: { type: String, default: '' },           // أول قسم دخله النهارده
  kind: { type: String, default: 'desktop' },     // mobile | tablet | desktop
  os: { type: String, default: '' },
  browser: { type: String, default: '' },
  src: { type: String, default: 'direct' },       // جه منين أول مرة النهارده
  newDevice: { type: Boolean, default: false },   // أول يوم نشوف فيه الجهاز ده
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
});

siteDeviceDaySchema.index({ day: 1, device: 1 }, { unique: true });
// سنة وشوية بيانات تفصيلية كفاية — بعدها بتتمسح لوحدها
siteDeviceDaySchema.index({ firstSeen: 1 }, { expireAfterSeconds: 400 * 24 * 3600 });

module.exports = mongoose.model('SiteDeviceDay', siteDeviceDaySchema);
