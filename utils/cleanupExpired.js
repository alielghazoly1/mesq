// utils/cleanupExpired.js
// تنضيف الدعوات المجانية اللي عدى على معادها فترة محددة.
//
// القواعد (متعمدة وضيقة):
//   1) المجانية بس — أي دعوة مميزة (اتعملت بباقة مدفوعة) عمرها ما تتمسح.
//   2) أي دعوة صاحبها دفع في أي يوم (عنده باقة، أو ليه طلب مش ملغي) بتتستنى
//      كلها — حتى لو مجانية قديمة من قبل ما يدفع. العميل اللي دفع دعواته
//      بتفضل طول العمر.
//   3) لازم يكون عدى على معاد الفرح المدة المحددة (5 أيام افتراضيًا) —
//      يعني الدعوة خلصت فعلًا ومحدش هيفتحها تاني.
//
// وقبل أي مسح، أرقامها بتتضاف في SiteTotals عشان العدادات (اللي بيبان
// للزوار ولوحة التحكم) ماتقلّش (models/SiteTotals.js).

const Invitation = require('../models/Invitation');
const Rsvp = require('../models/Rsvp');
const SiteTotals = require('../models/SiteTotals');
const User = require('../models/User');
const Order = require('../models/Order');
const GuestPhoto = require('../models/GuestPhoto');
const { cairoParts } = require('./cairoTime');

const DEFAULT_GRACE_DAYS = 5;

/** مفتاح اليوم بتوقيت مصر (YYYY-MM-DD) — نفس مفاتيح رسوم لوحة التحكم */
function cairoDay(date) {
  const p = cairoParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** كل العملاء اللي دفعوا في أي وقت — دعواتهم محمية كلها */
async function paidOwnerIds() {
  const [subs, orders] = await Promise.all([
    User.distinct('_id', { 'subscription.packageId': { $ne: null } }),
    // أي طلب مش ملغي (اتفعّل، أو لسه مستني مراجعة الإيصال)
    Order.distinct('userId', { status: { $ne: 'cancelled' } }),
  ]);
  const seen = new Set();
  return subs.concat(orders).filter((id) => {
    const k = String(id);
    if (!id || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** شرط الدعوات المرشحة للمسح */
function buildFilter(graceDays, protectedOwners = []) {
  const cutoff = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000);
  return {
    isPremium: { $ne: true },               // المدفوعة عمرها ما تتمسح
    ownerId: { $nin: protectedOwners },     // ولا أي دعوة صاحبها دفع (null بيعدّي عادي)
    weddingDateTime: { $ne: null, $lt: cutoff },
  };
}

/**
 * @param {{graceDays?: number, dryRun?: boolean, limit?: number}} options
 *   dryRun: بيحسب من غير ما يمسح — ده الوضع الافتراضي عن قصد.
 *   limit: أقصى عدد يتمسح في المرة الواحدة (عشان مانقفلش القاعدة).
 */
async function cleanupExpiredInvitations(options = {}) {
  const graceDays = Number.isFinite(options.graceDays) ? options.graceDays : DEFAULT_GRACE_DAYS;
  const dryRun = options.dryRun !== false;   // لازم تقول صراحةً إنك عايز تمسح
  const limit = Math.max(1, Math.min(5000, options.limit || 1000));

  const filter = buildFilter(graceDays, await paidOwnerIds());

  const doomed = await Invitation.find(filter)
    .sort({ weddingDateTime: 1 })   // الأقدم الأول
    .limit(limit)
    .select('shortId viewCount creatorDeviceId weddingDateTime status templateId createdAt')
    .lean();

  const totalMatching = await Invitation.countDocuments(filter);

  if (!doomed.length) {
    return {
      dryRun, graceDays, totalMatching: 0, selected: 0,
      views: 0, rsvps: 0, creatorsGone: 0, deleted: 0,
    };
  }

  const ids = doomed.map((d) => d._id);
  const shortIds = doomed.map((d) => d.shortId);
  const views = doomed.reduce((sum, d) => sum + (d.viewCount || 0), 0);

  const rsvps = await Rsvp.countDocuments({ shortId: { $in: shortIds } });

  // أجهزة هتختفي خالص: عملت دعوات كلها في قايمة المسح دي.
  // بنعدّها عشان رقم "المستخدمين" في الإحصائيات مايقلّش.
  const devices = [...new Set(doomed.map((d) => d.creatorDeviceId).filter(Boolean))];
  let creatorsGone = 0;
  if (devices.length) {
    const stillThere = await Invitation.distinct('creatorDeviceId', {
      creatorDeviceId: { $in: devices },
      _id: { $nin: ids },
    });
    creatorsGone = devices.length - stillThere.length;
  }

  // المسودات عمرها ما اتحسبت في العداد أصلًا، فمش بتتضاف للمحفوظ
  const counted = doomed.filter((d) => d.status !== 'draft');
  const inc = {};
  const add = (key, n = 1) => { inc[key] = (inc[key] || 0) + n; };
  counted.forEach((d) => {
    add(`archivedByTemplate.${String(d.templateId || 'unknown').replace(/[.$]/g, '_')}`);
    // يوم إنشاء الدعوة — عشان رسم "الدعوات الجديدة" في اللوحة مايتغيّرش
    if (d.createdAt) add(`archivedDaily.${cairoDay(d.createdAt)}`);
  });
  // ردود الحضور حسب يومها — عشان رسم الردود يفضل زي ما هو
  const rsvpDays = rsvps ? await Rsvp.aggregate([
    { $match: { shortId: { $in: shortIds } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Africa/Cairo' } },
        count: { $sum: 1 },
        yes: { $sum: { $cond: ['$attending', 1, 0] } },
      },
    },
  ]) : [];
  rsvpDays.forEach((r) => {
    if (!r._id) return;
    add(`archivedRsvpDaily.${r._id}`, r.count);
    if (r.yes) add(`archivedRsvpYesDaily.${r._id}`, r.yes);
  });

  const summary = {
    dryRun, graceDays, totalMatching, selected: doomed.length,
    views, rsvps, creatorsGone, deleted: 0,
    oldest: doomed[0] ? doomed[0].weddingDateTime : null,
    newest: doomed[doomed.length - 1] ? doomed[doomed.length - 1].weddingDateTime : null,
  };

  if (dryRun) return summary;

  // الترتيب مهم: بنحفظ الأرقام **قبل** المسح. لو المسح وقع في النص،
  // الأسوأ إن العداد يبقى أكبر من الحقيقة — وده أأمن بكتير من إن
  // الدعوات تروح والعداد ينزل قدام الزوار.
  await SiteTotals.updateOne(
    { key: 'default' },
    {
      $inc: {
        archivedInvitations: counted.length,
        archivedViews: views,
        archivedCreators: creatorsGone,
        archivedRsvps: rsvps,
        ...inc,
      },
      $set: { lastCleanupAt: new Date(), lastCleanupDeleted: doomed.length },
    },
    { upsert: true }
  );

  await Rsvp.deleteMany({ shortId: { $in: shortIds } });
  await GuestPhoto.deleteMany({ shortId: { $in: shortIds } });
  const res = await Invitation.deleteMany({ _id: { $in: ids } });
  summary.deleted = res.deletedCount || 0;

  return summary;
}

module.exports = { cleanupExpiredInvitations, buildFilter, paidOwnerIds, DEFAULT_GRACE_DAYS };
