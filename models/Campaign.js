// models/Campaign.js
// لينك إعلان (إنستجرام/فيسبوك/تيك توك...). المالك بيعمل لينك لكل إعلان
// (/go/<code>)، وكل اللي بيدخل منه بيتعدّ، واللي بيسجّل بعدها بيتربط بالإعلان
// (User.campaign) — فيعرف كل إعلان جاب كام زيارة وكام تسجيل وكام واحد دفع
// وكام فلوس، ويقارنها باللي صرفه عليه.
const mongoose = require('mongoose');

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'google', 'snapchat', 'whatsapp', 'other'];
// الصفحات اللي ينفع اللينك يودّي عليها (قايمة مقفولة — مفيش توجيه لأي مكان برّه الموقع)
const LANDINGS = ['/', '/gallery', '/packages'];

const campaignSchema = new mongoose.Schema({
  // الكود اللي في اللينك — مبيتغيّرش بعد ما يتعمل (اللينك بيكون اتنشر في الإعلان)
  code: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 40 },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  platform: { type: String, enum: PLATFORMS, default: 'instagram' },
  // السوق/البلد المستهدف — كلام حر للعرض (مصر، السعودية…)
  market: { type: String, default: '', trim: true, maxlength: 40 },
  // صرفت قد إيه على الإعلان ده (اختياري) — منه بنحسب المكسب/الخسارة
  spendAmount: { type: Number, default: 0, min: 0 },
  spendCurrency: { type: String, enum: ['EGP', 'USD'], default: 'EGP' },
  landing: { type: String, enum: LANDINGS, default: '/' },
  notes: { type: String, default: '', maxlength: 300 },
  // لينك سري (/ad/<token>) يتبعت للي بيعمل الإعلانات: بيشوف أرقام الإعلان ده بس
  // من غير بيانات أي عميل. null = مفيش لينك (أو اتقفل)
  shareToken: { type: String, default: undefined, index: { unique: true, sparse: true } },
  // يظهر في اللينك ده الفلوس اللي دخلت والعائد ولا لأ
  shareMoney: { type: Boolean, default: true },
  // مقفول = بيختفي من القايمة الأساسية، بس اللينك لسه شغال ولسه بيعدّ
  archived: { type: Boolean, default: false },
  // عدّاد قديم (أول نسخة) — الأرقام دلوقتي بتتحسب من CampaignHit/CampaignVisit
  clicks: { type: Number, default: 0 },
  // من إمتى الأرقام بتتحسب — يوم ما الإعلان اشتغل فعلًا. أي حاجة قبله (مراجعة
  // إنستجرام للإعلان، تجربة المالك للينك) مابتدخلش في الحساب.
  startedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Campaign = mongoose.model('Campaign', campaignSchema);
Campaign.PLATFORMS = PLATFORMS;
Campaign.LANDINGS = LANDINGS;
module.exports = Campaign;
