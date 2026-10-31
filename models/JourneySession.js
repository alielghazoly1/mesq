// models/JourneySession.js
// رحلة زائر/عميل على الموقع خطوة بخطوة — زيارة واحدة (تاب واحد) = مستند واحد.
// الخطوات بتتجمّع على الجهاز وتتبعت مع بعض كل كام ثانية (lib/journey.js)،
// وكل دفعة = كتابة واحدة ($push) — مش كتابة لكل ضغطة.
//
// اللي بيتسجّل: الصفحات (وقد إيه قعد في كل واحدة وقد إيه نزل فيها)، الضغطات على
// الزراير واللينكات (الاسم المكتوب على الزرار بس)، سايب التاب / رجع، وقفل الموقع.
// اللي مابيتسجّلش أبدًا: أي حاجة بيكتبها (خانات، باسورد، رسايل) — ولا صفحات الدعوات
// نفسها ولا لوحة التحكم.
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  t: { type: Date, required: true },     // وقت الخطوة
  k: { type: String, required: true },   // v صفحة · c ضغطة · h ساب التاب · s رجع · x قفل الموقع
  p: { type: String, default: '' },      // المسار
  l: { type: String, default: '' },      // اسم الزرار/اللينك (للضغطات)
  d: { type: Number, default: 0 },       // قعد قد إيه في الصفحة اللي قبلها (ثواني) — مع v / x
  s: { type: Number, default: 0 },       // نزل لحد كام % في الصفحة اللي قبلها
}, { _id: false });

const journeySessionSchema = new mongoose.Schema({
  sid: { type: String, required: true, unique: true },   // رقم الزيارة (من التاب)
  device: { type: String, default: '' },                  // نفس رقم الجهاز في التحليلات
  userId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  startedAt: { type: Date, default: Date.now },
  lastAt: { type: Date, default: Date.now, index: true },
  endedAt: { type: Date, default: null },                 // قفل الموقع (لو اتبعتت إشارة الخروج)
  entry: { type: String, default: '' },
  exit: { type: String, default: '' },                    // آخر صفحة
  current: { type: String, default: '' },                 // الصفحة اللي هو عليها دلوقتي
  hidden: { type: Boolean, default: false },              // سايب التاب دلوقتي
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  src: { type: String, default: 'direct' },
  cmp: { type: String, default: '', index: true },          // كود الإعلان اللي الجهاز جه منه (كوكي mithaq_cmp)
  ref: { type: String, default: '' },
  kind: { type: String, default: 'desktop' },
  os: { type: String, default: '' },
  browser: { type: String, default: '' },
  country: { type: String, default: '' },
  events: { type: [eventSchema], default: [] },
});

journeySessionSchema.index({ userId: 1, startedAt: -1 });
// شهرين كفاية للرحلات التفصيلية — بعدها بتتمسح لوحدها
journeySessionSchema.index({ startedAt: 1 }, { expireAfterSeconds: 60 * 24 * 3600 });

module.exports = mongoose.model('JourneySession', journeySessionSchema);
