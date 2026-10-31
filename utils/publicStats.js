// utils/publicStats.js
// أرقام حقيقية آمنة (مفيش أي بيانات شخصية) بتتعرض للزوار: عدد الدعوات، عدد
// المشاهدات، عدد المستخدمين. بتستخدمها الصفحة الرئيسية (/api/public-stats)
// وصفحات جوجل (utils/landingPages.js). متكاشة لمدة قصيرة عشان آلاف الزيارات
// ما تضغطش على قاعدة البيانات في كل مرة.
const Invitation = require('../models/Invitation');
const SiteTotals = require('../models/SiteTotals');

let cache = { data: null, expiresAt: 0 };

async function getPublicStats() {
  const now = Date.now();
  if (cache.data && cache.expiresAt > now) return cache.data;

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
  const data = {
    totalInvitations: totalInvitations + ((archived && archived.archivedInvitations) || 0),
    totalViews: (viewsAgg[0] ? viewsAgg[0].total : 0) + ((archived && archived.archivedViews) || 0),
    totalUsers: uniqueCreators.length + ((archived && archived.archivedCreators) || 0),
  };
  cache = { data, expiresAt: now + 30 * 1000 }; // كاش لمدة 30 ثانية
  return data;
}

module.exports = { getPublicStats };
