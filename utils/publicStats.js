// utils/publicStats.js
// أرقام حقيقية آمنة (مفيش أي بيانات شخصية) بتتعرض للزوار: عدد الدعوات، عدد
// المشاهدات، عدد المستخدمين. بتستخدمها الصفحة الرئيسية (/api/public-stats)
// وصفحات جوجل (utils/landingPages.js). متكاشة عشان آلاف الزيارات ما تضغطش على
// قاعدة البيانات في كل مرة.
//
// الحساب (3 أسئلة على كل الدعوات) بيتعمل مرة واحدة في نفس الوقت مهما كان عدد الزوار،
// وأي زائر بعد أول حساب بياخد آخر أرقام عندنا على طول من غير ما يستنى — ولو الأرقام
// عدّى عليها أكتر من 10 دقايق بتتحدّث في الخلفية للي بعده. أول طلب خالص بس هو اللي بيستنى.
const Invitation = require('../models/Invitation');
const SiteTotals = require('../models/SiteTotals');

const FRESH_MS = 10 * 60 * 1000;

let cache = { data: null, at: 0 };
let inflight = null;

async function computePublicStats() {
  const [totalInvitations, viewsAgg, uniqueCreators, archived] = await Promise.all([
    // المسودات مش دعوات حقيقية لسه — مالهاش لازمة في الأرقام العامة
    Invitation.countDocuments({ status: { $ne: 'draft' } }),
    Invitation.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
    Invitation.distinct('creatorDeviceId', { creatorDeviceId: { $ne: null } }),
    // أرقام الدعوات اللي اتمسحت في التنضيف الدوري
    SiteTotals.findOne({ key: 'default' }).lean(),
  ]);

  // الأرقام اللي بتبان للزوار = الموجود فعلاً + اللي اتمسح.
  // من غير الجمع ده، العداد كان هينزل قدام الناس كل ما بننضّف —
  // وده أسوأ من إن القاعدة تكبر.
  return {
    totalInvitations: totalInvitations + ((archived && archived.archivedInvitations) || 0),
    totalViews: (viewsAgg[0] ? viewsAgg[0].total : 0) + ((archived && archived.archivedViews) || 0),
    totalUsers: uniqueCreators.length + ((archived && archived.archivedCreators) || 0),
  };
}

/** حساب واحد بس في نفس الوقت — اللي ييجي والحساب شغال بيستنى نفس الحساب */
function refresh() {
  if (!inflight) {
    inflight = computePublicStats()
      .then((data) => { cache = { data, at: Date.now() }; return data; })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

async function getPublicStats() {
  if (cache.data) {
    // آخر أرقام على طول؛ لو قديمة بتتحدّث في الخلفية (لو فشلت بنفضل على القديمة ونجرّب تاني المرة الجاية)
    if (Date.now() - cache.at >= FRESH_MS) refresh().catch(() => {});
    return cache.data;
  }
  return refresh();
}

module.exports = { getPublicStats };
