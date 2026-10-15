// models/CampaignVisit.js
// زائر فريد للينك إعلان: جهاز واحد = سطر واحد مهما فتح اللينك كام مرة.
// منه بنعرف "كام شخص" مش بس "كام ضغطة"، ورسم الزيارات يوم بيوم.
const mongoose = require('mongoose');

const campaignVisitSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  // بصمة الجهاز (كوكي الجهاز الموقّع) — مش بيانات شخصية
  visitor: { type: String, required: true, maxlength: 64 },
  hits: { type: Number, default: 1 },
  firstAt: { type: Date, default: Date.now },
  lastAt: { type: Date, default: Date.now },
  // أول مرة الموقع أكّد إن ده شخص حقيقي فتح الصفحة وفضل عليها — من غيرها
  // الزائر مابيتحسبش (معاينة إنستجرام للإعلان، برامج، تحميل مسبق...)
  verifiedAt: { type: Date, default: null },
});

campaignVisitSchema.index({ campaignId: 1, visitor: 1 }, { unique: true });
campaignVisitSchema.index({ campaignId: 1, firstAt: 1 });

module.exports = mongoose.model('CampaignVisit', campaignVisitSchema);
