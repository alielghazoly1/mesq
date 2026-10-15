// models/CampaignHit.js
// سجل كل مرة لينك إعلان اتفتح — حتى اللي مااتحسبش، ومعاه السبب. ده اللي
// بيخلي المالك يشوف بعينه الأرقام جت منين: ناس حقيقية، ولا معاينة إنستجرام
// للإعلان، ولا برامج آلية، ولا هو نفسه وهو بيجرّب اللينك.
//
// status:
//   counted  — شخص حقيقي فتح الصفحة وفضل عليها (الموقع نفسه أكّد) ✓
//   pending  — فتح اللينك بس الصفحة ماتأكدتش (قفل على طول / مااتفتحتش فعلًا)
//   prefetch — تحميل مسبق من إنستجرام/فيسبوك أو المتصفح (قبل ما حد يضغط)
//   bot      — برنامج آلي أو معاينة لينك (واتساب، فيسبوك، جوجل...)
//   owner    — جهاز صاحب الموقع (لوحة التحكم مفتوحة عليه)
const mongoose = require('mongoose');

const campaignHitSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  visitor: { type: String, default: '', maxlength: 64 },
  at: { type: Date, default: Date.now },
  status: { type: String, enum: ['counted', 'pending', 'prefetch', 'bot', 'owner'], default: 'pending' },
  // جاي من جوه إنستجرام/فيسبوك/تيك توك ولا متصفح عادي
  src: { type: String, default: 'browser', maxlength: 20 },
  device: { type: String, default: 'mobile', maxlength: 10 },
  verifiedAt: { type: Date, default: null },
});

campaignHitSchema.index({ campaignId: 1, at: -1 });
// السجل التفصيلي بيتمسح لوحده بعد سنة (الأرقام المهمة متحسوبة في CampaignVisit/User)
campaignHitSchema.index({ at: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('CampaignHit', campaignHitSchema);
