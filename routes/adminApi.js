// routes/adminApi.js
// كل بيانات لوحة التحكم كـ JSON. الواجهة نفسها بقت React
// (client/src/pages/admin)، فالملف ده مالوش أي علاقة بالـ HTML.
//
// كل مسار هنا وراه requireAdminSession — اللي بيتأكد من جلسة الأدمن
// ومن هيدر X-Admin-Request (middleware/adminAuth.js).
const express = require('express');

const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Order = require('../models/Order');
const Rsvp = require('../models/Rsvp');
const Session = require('../models/Session');
const SupportMessage = require('../models/SupportMessage');
const AdminAudit = require('../models/AdminAudit');
const Track = require('../models/Track');
const SiteTotals = require('../models/SiteTotals');
const { cleanupExpiredInvitations, DEFAULT_GRACE_DAYS } = require('../utils/cleanupExpired');
const { TEMPLATES } = require('../templates/registry');
const {
  getPackage, PACKAGES, packageAllowedInCountry, EDIT_WINDOW_DAYS,
} = require('../packages/registry');
const PricingSettings = require('../models/PricingSettings');
const { getPaymentSettings, updatePaymentSettings } = require('../utils/paymentSettings');
const {
  getPricingSettings, getPricingSettingsCached, priceFor, clampPercent,
  invalidateCache: invalidatePricingCache,
} = require('../utils/pricing');
const { sanitizeText } = require('../utils/sanitize');
const { hashPassword } = require('../utils/password');
const { isValidPassword } = require('../utils/validators');
const {
  editUntilAfterActivation, extendEditUntil, editWindowInfo,
} = require('../utils/editWindow');
const { logAdminAction } = require('../utils/adminAudit');
const { requireAdminSession } = require('../middleware/adminAuth');

const router = express.Router();

// كل الأرباح بتتحسب بالعملتين على حدة — مفيش سعر صرف ثابت نعتمد عليه،
// وجمع جنيه على دولار في رقم واحد بيدي رقم كذّاب.
const CURRENCIES = ['EGP', 'USD'];

/**
 * بيحفظ حقول محددة من حساب العميل — بدل `user.save()`.
 *
 * ليه ده مهم: `user.save()` بيعمل تحقق على المستند **كله**. يعني حساب
 * قديم اتسجّل قبل ما نضيف حقل مطلوب (زي `country`) أو فيه قيمة مش
 * مطابقة للسكيما الحالية، أي إجراء إداري عليه كان بيقع بـ 500 — حتى لو
 * اللي بنغيّره حاجة تانية خالص. الأدمن كان بيشوف "حصل خطأ في السيرفر"
 * ومايعرفش السبب.
 *
 * الحل: نكتب الحقول المقصودة لوحدها. `runValidators` بيتأكد من اللي
 * بنكتبه هو بس، والباقي من المستند القديم مابيتلمسش.
 */
async function saveUserFields(user, fields) {
  await User.updateOne({ _id: user._id }, { $set: fields }, { runValidators: true });
}

/** الاشتراك بعد التعديل، جاهز للكتابة (من غير خصائص Mongoose الداخلية) */
function subscriptionOf(user) {
  const sub = (user.toObject ? user.toObject() : user).subscription || {};
  return {
    packageId: sub.packageId || null,
    invitationsLeft: sub.invitationsLeft || 0,
    activatedAt: sub.activatedAt || null,
    status: sub.status || 'active',
    suspendedAt: sub.suspendedAt || null,
    adminNote: sub.adminNote || '',
    // بيتكتب هنا لأن الكتابة بتستبدل الاشتراك كله — لو اتنسى هنا أي إجراء
    // من اللوحة كان هيمسح تاريخ انتهاء التعديل من غير ما حد يلاحظ
    editUntil: sub.editUntil || null,
  };
}

/** بيهرّب أي حرف خاص بالـ regex عشان نص البحث يتعامل كنص عادي */
function escapeRegex(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** الفترة المطلوبة بالأيام — 7/30/90/365، والافتراضي 30 */
function periodOf(req) {
  const days = parseInt(req.query.period, 10);
  const allowed = [7, 30, 90, 365];
  const period = allowed.includes(days) ? days : 30;
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (period - 1));
  return { period, from };
}

/** بيحوّل نتيجة تجميع يومية لسلسلة كاملة من غير أيام ناقصة */
function fillDailySeries(rows, from, days, valueKeys) {
  const byDay = {};
  rows.forEach((r) => { byDay[r._id] = r; });

  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = byDay[key] || {};
    const point = { date: key };
    valueKeys.forEach((k) => { point[k] = row[k] || 0; });
    out.push(point);
  }
  return out;
}

/** تجميع يومي موحّد لأي مجموعة، بالتوقيت المحلي للسيرفر */
function dailyGroup(dateField, extraFields = {}) {
  return {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } },
      count: { $sum: 1 },
      ...extraFields,
    },
  };
}

// ==========================================================================
// نظرة عامة — الأرقام الكبيرة + الرسوم البيانية
// ==========================================================================
router.get('/admin/api/overview', requireAdminSession, async (req, res) => {
  try {
    const { period, from } = periodOf(req);

    const [
      totalUsers, premiumUsers, blockedUsers, suspendedSubs,
      totalInvitations, draftInvitations, premiumInvitations,
      viewsAgg, totalRsvps, pendingOrders,
      revenueAll, revenuePeriod,
      usersSeries, invitationsSeries, ordersSeries, rsvpSeries,
      byTemplate, byPackage, byCountry,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ 'subscription.packageId': { $ne: null } }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ 'subscription.status': 'suspended' }),

      Invitation.countDocuments({ status: { $ne: 'draft' } }),
      Invitation.countDocuments({ status: 'draft' }),
      Invitation.countDocuments({ isPremium: true, status: { $ne: 'draft' } }),

      Invitation.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Rsvp.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),

      // الأرباح = الطلبات المفعّلة بس (اللي استلمت فلوسها فعلًا)
      Order.aggregate([
        { $match: { status: 'activated' } },
        { $group: { _id: '$currency', total: { $sum: '$price' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: 'activated', activatedAt: { $gte: from } } },
        { $group: { _id: '$currency', total: { $sum: '$price' }, count: { $sum: 1 } } },
      ]),

      User.aggregate([{ $match: { createdAt: { $gte: from } } }, dailyGroup('createdAt')]),
      Invitation.aggregate([
        { $match: { createdAt: { $gte: from }, status: { $ne: 'draft' } } },
        dailyGroup('createdAt', { premium: { $sum: { $cond: ['$isPremium', 1, 0] } } }),
      ]),
      Order.aggregate([
        { $match: { status: 'activated', activatedAt: { $gte: from } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$activatedAt' } },
            count: { $sum: 1 },
            egp: { $sum: { $cond: [{ $eq: ['$currency', 'EGP'] }, '$price', 0] } },
            usd: { $sum: { $cond: [{ $eq: ['$currency', 'USD'] }, '$price', 0] } },
          },
        },
      ]),
      Rsvp.aggregate([
        { $match: { createdAt: { $gte: from } } },
        dailyGroup('createdAt', { yes: { $sum: { $cond: ['$attending', 1, 0] } } }),
      ]),

      Invitation.aggregate([
        { $match: { templateId: { $ne: null }, status: { $ne: 'draft' } } },
        { $group: { _id: '$templateId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: { status: 'activated' } },
        { $group: { _id: '$packageId', count: { $sum: 1 }, egp: { $sum: { $cond: [{ $eq: ['$currency', 'EGP'] }, '$price', 0] } }, usd: { $sum: { $cond: [{ $eq: ['$currency', 'USD'] }, '$price', 0] } } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const revenueBy = (rows) => CURRENCIES.reduce((acc, c) => {
      const found = rows.find((r) => r._id === c);
      acc[c] = { total: found ? found.total : 0, orders: found ? found.count : 0 };
      return acc;
    }, {});

    return res.json({
      period,
      from,
      kpis: {
        users: totalUsers,
        premiumUsers,
        blockedUsers,
        suspendedSubs,
        invitations: totalInvitations,
        draftInvitations,
        premiumInvitations,
        views: viewsAgg[0] ? viewsAgg[0].total : 0,
        rsvps: totalRsvps,
        pendingOrders,
      },
      revenue: { all: revenueBy(revenueAll), period: revenueBy(revenuePeriod) },
      series: {
        users: fillDailySeries(usersSeries, from, period, ['count']),
        invitations: fillDailySeries(invitationsSeries, from, period, ['count', 'premium']),
        revenue: fillDailySeries(ordersSeries, from, period, ['count', 'egp', 'usd']),
        rsvps: fillDailySeries(rsvpSeries, from, period, ['count', 'yes']),
      },
      breakdown: {
        templates: byTemplate.map((r) => {
          const tpl = TEMPLATES.find((x) => x.id === r._id);
          return { id: r._id, label: (tpl && (tpl.name.ar || tpl.name.en)) || r._id, count: r.count };
        }),
        packages: byPackage.map((r) => {
          const pkg = getPackage(r._id);
          return {
            id: r._id,
            label: pkg ? (pkg.name.ar || pkg.name.en) : r._id,
            count: r.count, egp: r.egp, usd: r.usd,
          };
        }),
        countries: byCountry.map((r) => ({ id: r._id || '—', count: r.count })),
      },
    });
  } catch (err) {
    console.error('Error building admin overview:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// العملاء
// ==========================================================================
router.get('/admin/api/users', requireAdminSession, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 100);
    const status = String(req.query.status || 'all');
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 25;

    const filter = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: re }, { email: re }];
    }
    if (status === 'premium') filter['subscription.packageId'] = { $ne: null };
    if (status === 'free') filter['subscription.packageId'] = null;
    if (status === 'suspended') filter['subscription.status'] = 'suspended';
    if (status === 'blocked') filter.isBlocked = true;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .select('name email country phone subscription isBlocked createdAt')
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = users.map((u) => u._id);
    const invCounts = await Invitation.aggregate([
      { $match: { ownerId: { $in: ids } } },
      {
        $group: {
          _id: '$ownerId',
          total: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 0, 1] } },
          premium: { $sum: { $cond: ['$isPremium', 1, 0] } },
          drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        },
      },
    ]);
    const byUser = invCounts.reduce((acc, r) => { acc[String(r._id)] = r; return acc; }, {});

    return res.json({
      page,
      perPage,
      total,
      pages: Math.max(1, Math.ceil(total / perPage)),
      users: users.map((u) => {
        const sub = u.subscription || {};
        const pkg = sub.packageId ? getPackage(sub.packageId) : null;
        const counts = byUser[String(u._id)] || { total: 0, premium: 0, drafts: 0 };
        return {
          id: String(u._id),
          name: u.name,
          email: u.email,
          country: u.country,
          phone: u.phone || '',
          isPremium: !!sub.packageId,
          isSuspended: sub.status === 'suspended',
          isBlocked: !!u.isBlocked,
          packageId: sub.packageId || null,
          packageName: pkg ? (pkg.name.ar || pkg.name.en) : null,
          invitationsLeft: sub.invitationsLeft || 0,
          activatedAt: sub.activatedAt || null,
          ...(sub.packageId ? editWindowInfo(sub) : {}),
          invitations: counts.total,
          premiumInvitations: counts.premium,
          drafts: counts.drafts,
          createdAt: u.createdAt,
        };
      }),
    });
  } catch (err) {
    console.error('Error listing users:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ملف العميل الكامل — كل حاجة عنه في طلب واحد
router.get('/admin/api/users/:id', requireAdminSession, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'العميل ده مش موجود.' });

    const [invitations, orders, supportCount, sessions] = await Promise.all([
      Invitation.find({ ownerId: user._id })
        .sort({ updatedAt: -1, createdAt: -1 }).limit(50)
        .select('shortId templateId brideNameAr groomNameAr weddingDateTime viewCount isPremium status createdAt updatedAt')
        .lean(),
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
      SupportMessage.countDocuments({ userId: user._id }),
      Session.countDocuments({ userId: user._id, expiresAt: { $gt: new Date() } }),
    ]);

    const shortIds = invitations.map((i) => i.shortId);
    const rsvps = shortIds.length
      ? await Rsvp.aggregate([
        { $match: { shortId: { $in: shortIds } } },
        { $group: { _id: null, total: { $sum: 1 }, yes: { $sum: { $cond: ['$attending', 1, 0] } } } },
      ])
      : [];

    const sub = user.subscription || {};
    const pkg = sub.packageId ? getPackage(sub.packageId) : null;

    // إجمالي اللي دفعه فعلًا
    const paid = {};
    CURRENCIES.forEach((c) => {
      paid[c] = orders
        .filter((o) => o.status === 'activated' && o.currency === c)
        .reduce((sum, o) => sum + (o.price || 0), 0);
    });

    return res.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        country: user.country,
        phone: user.phone || '',
        createdAt: user.createdAt,
        isBlocked: !!user.isBlocked,
        blockedAt: user.blockedAt || null,
        activeSessions: sessions,
        subscription: {
          packageId: sub.packageId || null,
          packageName: pkg ? (pkg.name.ar || pkg.name.en) : null,
          invitationsLeft: sub.invitationsLeft || 0,
          activatedAt: sub.activatedAt || null,
          status: sub.packageId ? (sub.status || 'active') : 'none',
          suspendedAt: sub.suspendedAt || null,
          adminNote: sub.adminNote || '',
          ...editWindowInfo(sub),
        },
      },
      totals: {
        invitations: invitations.filter((i) => i.status !== 'draft').length,
        drafts: invitations.filter((i) => i.status === 'draft').length,
        views: invitations.reduce((s, i) => s + (i.viewCount || 0), 0),
        rsvps: rsvps[0] ? rsvps[0].total : 0,
        rsvpYes: rsvps[0] ? rsvps[0].yes : 0,
        supportMessages: supportCount,
        paid,
      },
      invitations: invitations.map((i) => ({
        shortId: i.shortId,
        templateId: i.templateId,
        names: `${i.brideNameAr || ''} & ${i.groomNameAr || ''}`.trim(),
        weddingDate: i.weddingDateTime,
        views: i.viewCount || 0,
        isPremium: !!i.isPremium,
        isDraft: i.status === 'draft',
        createdAt: i.createdAt,
        // آخر مرة العميل عدّل فيها الدعوة (للوحة التحكم)
        updatedAt: i.updatedAt || i.createdAt,
      })),
      orders: orders.map((o) => {
        const p = getPackage(o.packageId);
        return {
          id: String(o._id),
          packageId: o.packageId,
          packageName: p ? (p.name.ar || p.name.en) : o.packageId,
          price: o.price,
          currency: o.currency,
          status: o.status,
          paymentProofUrl: o.paymentProofUrl || null,
          createdAt: o.createdAt,
          activatedAt: o.activatedAt || null,
        };
      }),
    });
  } catch (err) {
    console.error('Error loading user profile:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// التحكم في اشتراك العميل: إيقاف / تشغيل / إلغاء / تعديل الرصيد / منح باقة
router.patch('/admin/api/users/:id/subscription', requireAdminSession, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'العميل ده مش موجود.' });

    const action = String((req.body || {}).action || '');
    const sub = user.subscription || {};
    const before = {
      packageId: sub.packageId || null,
      invitationsLeft: sub.invitationsLeft || 0,
      status: sub.status || 'active',
      editUntil: sub.editUntil || null,
    };

    if (action === 'suspend') {
      if (!sub.packageId) return res.status(400).json({ error: 'العميل ده مش مشترك أصلًا.' });
      user.subscription.status = 'suspended';
      user.subscription.suspendedAt = new Date();
    } else if (action === 'resume') {
      user.subscription.status = 'active';
      user.subscription.suspendedAt = null;
    } else if (action === 'cancel') {
      // إلغاء كامل — الرصيد بيروح والباقة بتتشال
      user.subscription = {
        packageId: null, invitationsLeft: 0, activatedAt: null,
        status: 'active', suspendedAt: null, adminNote: sub.adminNote || '',
        editUntil: null,
      };
    } else if (action === 'grant') {
      const pkg = getPackage(String((req.body || {}).packageId || ''));
      if (!pkg) return res.status(400).json({ error: 'الباقة دي مش موجودة.' });
      // مدة التعديل بتتحسب من حالة الاشتراك **قبل** المنح (before) مش بعدها
      const editUntil = editUntilAfterActivation({
        packageId: before.packageId, editUntil: before.editUntil,
      });
      user.subscription.packageId = pkg.id;
      user.subscription.invitationsLeft = (sub.invitationsLeft || 0) + pkg.invitations;
      user.subscription.activatedAt = new Date();
      user.subscription.status = 'active';
      user.subscription.suspendedAt = null;
      user.subscription.editUntil = editUntil;
    } else if (action === 'extendEdit') {
      // مدّ فترة التعديل (مثلًا لعميل محتاج تعديل بعد ما مدته خلصت)
      if (!sub.packageId) return res.status(400).json({ error: 'العميل ده مش مشترك أصلًا.' });
      const days = parseInt((req.body || {}).days, 10);
      if (Number.isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({ error: 'عدد الأيام لازم يكون بين 1 و 365.' });
      }
      user.subscription.editUntil = extendEditUntil({ editUntil: before.editUntil }, days);
    } else if (action === 'unlimitedEdit') {
      // تعديل مفتوح من غير حد (باقات البيزنس والقاعات مثلًا)
      if (!sub.packageId) return res.status(400).json({ error: 'العميل ده مش مشترك أصلًا.' });
      user.subscription.editUntil = null;
    } else if (action === 'setCredits') {
      const credits = parseInt((req.body || {}).invitationsLeft, 10);
      if (Number.isNaN(credits) || credits < 0 || credits > 10000) {
        return res.status(400).json({ error: 'الرصيد لازم يكون رقم بين 0 و 10000.' });
      }
      user.subscription.invitationsLeft = credits;
    } else if (action === 'note') {
      user.subscription.adminNote = sanitizeText((req.body || {}).adminNote, 500);
    } else {
      return res.status(400).json({ error: 'الإجراء ده مش معروف.' });
    }

    await saveUserFields(user, { subscription: subscriptionOf(user) });

    logAdminAction(req, `subscription.${action}`, {
      type: 'user', id: user._id, label: user.email,
    }, {
      before,
      after: {
        packageId: user.subscription.packageId,
        invitationsLeft: user.subscription.invitationsLeft,
        status: user.subscription.status,
        editUntil: user.subscription.editUntil || null,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error updating subscription:', err);
    // رسالة أوضح للأدمن بدل "خطأ في السيرفر" الصمّاء — ده مسار محمي
    // بجلسة أدمن، فمفيش مشكلة إننا نقول السبب الحقيقي.
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: 'بيانات الاشتراك مرفوضة: ' + err.message });
    }
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// حظر / رفع الحظر عن الحساب كله
router.patch('/admin/api/users/:id/block', requireAdminSession, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'العميل ده مش موجود.' });

    const blocked = !!(req.body || {}).blocked;
    user.isBlocked = blocked;
    user.blockedAt = blocked ? new Date() : null;
    await saveUserFields(user, { isBlocked: user.isBlocked, blockedAt: user.blockedAt });

    // الحظر لازم يشتغل فورًا: بنلغي كل جلساته المفتوحة، مش بس نمنع الدخول
    // الجديد — غير كده هيفضل داخل من التاب المفتوح لحد ما الكوكي تنتهي.
    let killedSessions = 0;
    if (blocked) {
      const result = await Session.deleteMany({ userId: user._id });
      killedSessions = result.deletedCount || 0;
    }

    logAdminAction(req, blocked ? 'user.block' : 'user.unblock', {
      type: 'user', id: user._id, label: user.email,
    }, { killedSessions });

    return res.json({ ok: true, killedSessions });
  } catch (err) {
    console.error('Error blocking user:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// تغيير باسورد العميل — بيتعمل لما العميل ينسى باسورده ويطلب منك تغييره.
//
// ⚠ الباسورد الجديد بيعدّي من هنا مرة واحدة بس وبيتشفّر على طول: مفيش
// أي مكان في السيرفر بيخزّنه أو يسجّله كنص صريح — لا في سجل الإجراءات
// ولا في رسالة الدعم ولا في الـ logs. اللي بيوصل للعميل بيوصل منك إنت
// بره الموقع (واتساب/مكالمة).
//
// وبيقفل كل جلساته المفتوحة افتراضيًا: ده الصح لما السبب يكون حساب
// اتسرب أو باسورد وصل لحد غلط — من غير كده اللي داخل من تاب مفتوح
// بيفضل داخل بالباسورد القديم. تقدر تسيبها مفتوحة (keepSessions) لما
// يكون العميل معاك بيشتغل على دعوته دلوقتي ومش عايز تقطع عليه.
router.patch('/admin/api/users/:id/password', requireAdminSession, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'العميل ده مش موجود.' });

    const password = String((req.body || {}).password || '');
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'الباسورد لازم يكون من 8 لـ 200 حرف.' });
    }

    const passwordHash = await hashPassword(password);
    await saveUserFields(user, { passwordHash });

    // بنقفل الجلسات **بعد** ما الباسورد يتغيّر فعلًا — لو قفلناها الأول
    // وفشل الحفظ، كنا هنطلّع العميل بره على الفاضي.
    let killedSessions = 0;
    const keepSessions = !!(req.body || {}).keepSessions;
    if (!keepSessions) {
      const result = await Session.deleteMany({ userId: user._id });
      killedSessions = result.deletedCount || 0;
    }

    // رسالة في صندوق رسايله تقوله إن الباسورد اتغيّر — من غير الباسورد
    // نفسه. الرسايل دي متخزّنة كنص عادي في الداتابيز وبتفضل في حسابه
    // للأبد، فحط سر جواها غلط مهما كان مريح.
    const notify = (req.body || {}).notify !== false;
    if (notify) {
      SupportMessage.create({
        userId: user._id,
        from: 'admin',
        body: [
          'غيّرنا باسورد حسابك بناءً على طلبك.',
          '',
          keepSessions
            ? 'حسابك لسه مفتوح على أجهزتك زي ما هو، والباسورد الجديد هتستخدمه في أي تسجيل دخول جديد.'
            : 'قفلنا كل الجلسات المفتوحة للأمان، فهتحتاج تسجّل دخول من تاني بالباسورد الجديد.',
          '',
          'الباسورد الجديد بيوصلك مننا مباشرة، مش في الرسالة دي — دي مش مكان آمن لسر زي ده.',
          'ولو مش إنت اللي طلبت التغيير، ردّ عليّ هنا فورًا.',
        ].join('\n'),
        // متقرّية من ناحيتك: دي رسالة إخطار، مش عميل مستنيك ترد عليه
        readByAdmin: true,
        readByUser: false,
      }).catch((err) => {
        // الباسورد اتغيّر خلاص — رسالة إخطار فشلت مايصحّش تفشّل الإجراء
        console.error('Password-change notice failed:', err.message);
      });
    }

    // السجل بيقول **إن** الباسورد اتغيّر وإمتى وكام جلسة اتقفلت — عمره
    // ما بيقول الباسورد نفسه
    logAdminAction(req, 'user.password', {
      type: 'user', id: user._id, label: user.email,
    }, { killedSessions, keptSessions: keepSessions, notified: notify });

    return res.json({ ok: true, killedSessions });
  } catch (err) {
    console.error('Error changing user password:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// الطلبات
// ==========================================================================
router.get('/admin/api/orders', requireAdminSession, async (req, res) => {
  try {
    const status = String(req.query.status || 'pending');
    const filter = ['pending', 'activated', 'cancelled'].includes(status) ? { status } : {};

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const userIds = [...new Set(orders.map((o) => String(o.userId)))];
    const users = await User.find({ _id: { $in: userIds } }).select('name email country').lean();
    const byId = users.reduce((acc, u) => { acc[String(u._id)] = u; return acc; }, {});

    return res.json({
      orders: orders.map((o) => {
        const u = byId[String(o.userId)] || {};
        const pkg = getPackage(o.packageId);
        return {
          id: String(o._id),
          userId: String(o.userId),
          packageId: o.packageId,
          packageName: pkg ? (pkg.name.ar || pkg.name.en) : o.packageId,
          invitations: pkg ? pkg.invitations : 0,
          price: o.price,
          currency: o.currency,
          status: o.status,
          createdAt: o.createdAt,
          activatedAt: o.activatedAt || null,
          paymentProofUrl: o.paymentProofUrl || null,
          paymentProofAt: o.paymentProofAt || null,
          user: { name: u.name || '—', email: u.email || '—', country: u.country || '—' },
        };
      }),
    });
  } catch (err) {
    console.error('Error listing orders:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.post('/admin/api/orders/:id/activate', requireAdminSession, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب ده مش موجود.' });
    if (order.status !== 'pending') {
      return res.status(409).json({ error: 'الطلب ده متفعّل أو ملغي بالفعل.' });
    }

    const pkg = getPackage(order.packageId);
    if (!pkg) return res.status(400).json({ error: 'الباقة دي مش موجودة.' });

    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ error: 'المستخدم ده مش موجود.' });

    // الرصيد بيتجمع مش بيتستبدل — لو اشترى باقة تانية، الدعوات بتتضاف
    const current = (user.subscription && user.subscription.invitationsLeft) || 0;
    // مدة التعديل الجديدة — بتتحسب من الاشتراك **قبل** ما نستبدله (utils/editWindow.js):
    // عميل جديد ← 30 يوم من دلوقتي، عميل جدّد ← بتتضاف فوق اللي فاضل،
    // عميل قديم (تعديله مفتوح) ← بيفضل مفتوح.
    const editUntil = editUntilAfterActivation(user.subscription);
    user.subscription = {
      packageId: pkg.id,
      invitationsLeft: current + pkg.invitations,
      activatedAt: new Date(),
      status: 'active',
      suspendedAt: null,
      adminNote: (user.subscription && user.subscription.adminNote) || '',
      editUntil,
    };
    await saveUserFields(user, { subscription: subscriptionOf(user) });

    order.status = 'activated';
    order.activatedAt = new Date();
    await order.save();

    logAdminAction(req, 'order.activate', {
      type: 'order', id: order._id, label: user.email,
    }, { packageId: pkg.id, price: order.price, currency: order.currency, creditsAfter: user.subscription.invitationsLeft });

    return res.json({
      ok: true,
      invitationsLeft: user.subscription.invitationsLeft,
      editUntil: editUntil ? editUntil.toISOString() : null,
    });
  } catch (err) {
    console.error('Error activating order:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// إلغاء طلب — سواء كان لسه معلّق أو **متفعّل ومدفوع**.
// لو كان متفعّل، بنسحب الرصيد اللي اتضاف منه كمان، وإلا يبقى الإلغاء
// على الورق بس والعميل ماشي بالباقة.
router.post('/admin/api/orders/:id/cancel', requireAdminSession, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب ده مش موجود.' });
    if (order.status === 'cancelled') {
      return res.status(409).json({ error: 'الطلب ده ملغي بالفعل.' });
    }

    const wasActivated = order.status === 'activated';
    let creditsRemoved = 0;

    if (wasActivated) {
      const pkg = getPackage(order.packageId);
      const user = await User.findById(order.userId);
      if (user && pkg) {
        const current = (user.subscription && user.subscription.invitationsLeft) || 0;
        // بنسحب بقدر الباقة، وبحد أدنى صفر — لو كان استهلك منها فعلاً،
        // اللي اتستهلك مش هيرجع (الدعوات اتعملت خلاص)
        creditsRemoved = Math.min(current, pkg.invitations);
        user.subscription.invitationsLeft = current - creditsRemoved;

        // مالهوش طلبات مفعّلة تانية؟ يبقى مفيش باقة أصلاً
        const otherActive = await Order.countDocuments({
          userId: user._id, status: 'activated', _id: { $ne: order._id },
        });
        if (otherActive === 0) {
          user.subscription.packageId = null;
          user.subscription.activatedAt = null;
          user.subscription.editUntil = null;
        }
        await saveUserFields(user, { subscription: subscriptionOf(user) });
      }
    }

    order.status = 'cancelled';
    await order.save();

    logAdminAction(req, wasActivated ? 'order.revoke' : 'order.cancel', {
      type: 'order', id: order._id,
    }, {
      packageId: order.packageId, price: order.price, currency: order.currency,
      wasActivated, creditsRemoved,
    });

    return res.json({ ok: true, wasActivated, creditsRemoved });
  } catch (err) {
    console.error('Error cancelling order:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// الدعوات
// ==========================================================================
router.get('/admin/api/invitations', requireAdminSession, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 100);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 25;

    const filter = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { shortId: re }, { brideName: re }, { groomName: re },
        { brideNameAr: re }, { groomNameAr: re }, { venueName: re },
      ];
    }

    const [invitations, total] = await Promise.all([
      Invitation.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .select('shortId templateId brideNameAr groomNameAr brideName groomName venueName weddingDateTime viewCount isPremium status ownerId createdAt')
        .lean(),
      Invitation.countDocuments(filter),
    ]);

    const ownerIds = [...new Set(invitations.map((i) => i.ownerId).filter(Boolean).map(String))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('name email').lean();
    const byOwner = owners.reduce((acc, u) => { acc[String(u._id)] = u; return acc; }, {});

    return res.json({
      page, perPage, total, pages: Math.max(1, Math.ceil(total / perPage)),
      invitations: invitations.map((i) => {
        const tpl = TEMPLATES.find((x) => x.id === i.templateId);
        const owner = i.ownerId ? byOwner[String(i.ownerId)] : null;
        return {
          shortId: i.shortId,
          templateName: tpl ? (tpl.name.ar || tpl.name.en) : (i.templateId || 'تصميم قديم'),
          namesAr: `${i.brideNameAr || ''} & ${i.groomNameAr || ''}`.trim(),
          namesEn: `${i.brideName || ''} & ${i.groomName || ''}`.trim(),
          venueName: i.venueName,
          weddingDate: i.weddingDateTime,
          views: i.viewCount || 0,
          isPremium: !!i.isPremium,
          isDraft: i.status === 'draft',
          owner: owner ? { id: String(i.ownerId), name: owner.name, email: owner.email } : null,
          createdAt: i.createdAt,
        };
      }),
    });
  } catch (err) {
    console.error('Error listing invitations:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// الدعم
// ==========================================================================
router.get('/admin/api/support', requireAdminSession, async (req, res) => {
  try {
    const threads = await SupportMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          lastMessage: { $first: '$body' },
          lastFrom: { $first: '$from' },
          lastAt: { $first: '$createdAt' },
          unread: { $sum: { $cond: [{ $and: [{ $eq: ['$from', 'user'] }, { $eq: ['$readByAdmin', false] }] }, 1, 0] } },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 100 },
    ]);

    const users = await User.find({ _id: { $in: threads.map((t) => t._id) } })
      .select('name email subscription isBlocked')
      .lean();
    const byId = users.reduce((acc, u) => { acc[String(u._id)] = u; return acc; }, {});

    return res.json({
      threads: threads.map((t) => {
        const u = byId[String(t._id)] || {};
        return {
          userId: String(t._id),
          name: u.name || '—',
          email: u.email || '—',
          isPremium: !!(u.subscription && u.subscription.packageId),
          isBlocked: !!u.isBlocked,
          lastMessage: t.lastMessage,
          lastFrom: t.lastFrom,
          lastAt: t.lastAt,
          unread: t.unread,
        };
      }),
    });
  } catch (err) {
    console.error('Error listing support threads:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.get('/admin/api/support/:userId', requireAdminSession, async (req, res) => {
  try {
    const messages = await SupportMessage.find({ userId: req.params.userId })
      .sort({ createdAt: 1 }).limit(200).lean();

    await SupportMessage.updateMany(
      { userId: req.params.userId, from: 'user', readByAdmin: false },
      { $set: { readByAdmin: true } }
    );

    return res.json({
      messages: messages.map((m) => ({
        id: String(m._id), from: m.from, body: m.body, createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error loading support thread:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.post('/admin/api/support/:userId', requireAdminSession, async (req, res) => {
  try {
    const body = sanitizeText(req.body && req.body.body, 2000);
    if (!body) return res.status(400).json({ error: 'اكتب الرد الأول.' });

    const msg = await SupportMessage.create({
      userId: req.params.userId, from: 'admin', body, readByAdmin: true,
    });

    return res.status(201).json({
      message: { id: String(msg._id), from: 'admin', body: msg.body, createdAt: msg.createdAt },
    });
  } catch (err) {
    console.error('Error replying to support thread:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// بيانات الدفع
// ==========================================================================
router.get('/admin/api/payment-settings', requireAdminSession, async (req, res) => {
  try {
    const doc = await getPaymentSettings();
    return res.json({
      vodafone: doc.vodafone || {},
      bank: doc.bank || {},
      whatsapp: doc.whatsapp || '',
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error('Error loading payment settings:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.put('/admin/api/payment-settings', requireAdminSession, async (req, res) => {
  try {
    const doc = await updatePaymentSettings(req.body);
    logAdminAction(req, 'settings.payment', { type: 'settings', id: 'default' });
    return res.json({ ok: true, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error('Error saving payment settings:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// الباقات المتاحة (للوحة عشان تعرف تمنح باقة يدويًا)
// ==========================================================================
router.get('/admin/api/packages', requireAdminSession, async (req, res) => {
  try {
    const settings = await getPricingSettingsCached();
    res.json({
      // مدة التعديل بعد التفعيل (0 = القاعدة متقفلة) — اللوحة بتكتبها في شرح التفعيل
      editWindowDays: EDIT_WINDOW_DAYS,
      packages: PACKAGES.map((p) => {
        const egp = priceFor(p, 'EGP', settings);
        const usd = priceFor(p, 'USD', settings);
        return {
          id: p.id,
          name: p.name.ar || p.name.en,
          invitations: p.invitations,
          // سعر القايمة (قبل الخصم)
          priceEGP: p.price.EGP,
          priceUSD: p.price.USD,
          // السعر اللي العميل بيدفعه فعلاً دلوقتي
          finalEGP: egp.price,
          finalUSD: usd.price,
          discountPercent: egp.discountPercent,
          // الباقة دي مستثناة من الخصومات نهائيًا؟
          noDiscount: !!p.noDiscount,
          // متاحة في دول معيّنة بس؟ (فاضية = متاحة للكل)
          countries: p.countries || [],
        };
      }),
    });
  } catch (err) {
    console.error('Error listing packages:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// الخصومات
// ==========================================================================
// الخصم بيتظبط من هنا وبس — مفيش أي رقم متكتوب في الكود. بيتطبّق على
// سعر الجنيه وسعر الدولار مع بعض بنفس النسبة.
router.get('/admin/api/pricing-settings', requireAdminSession, async (req, res) => {
  try {
    const doc = await getPricingSettings();
    const settings = {
      enabled: !!doc.enabled,
      percent: Number(doc.percent) || 0,
      perPackage: doc.perPackage || {},
      labelAr: doc.labelAr || '',
      labelEn: doc.labelEn || '',
      endsAt: doc.endsAt || null,
    };
    return res.json({
      ...settings,
      updatedAt: doc.updatedAt,
      // معاينة مباشرة: كل باقة بسعرها قبل وبعد الخصم بالعملتين، عشان
      // تشوف أثر اللي بتظبطه قبل ما تحفظه
      preview: PACKAGES.map((p) => ({
        id: p.id,
        name: p.name.ar || p.name.en,
        invitations: p.invitations,
        noDiscount: !!p.noDiscount,
        countries: p.countries || [],
        egp: priceFor(p, 'EGP', settings),
        usd: priceFor(p, 'USD', settings),
      })),
    });
  } catch (err) {
    console.error('Error loading pricing settings:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.put('/admin/api/pricing-settings', requireAdminSession, async (req, res) => {
  try {
    const b = req.body || {};

    // النِسب الخاصة: مفاتيح الباقات الموجودة فعلاً بس، وكل نسبة في
    // حدودها. أي مفتاح غريب بيتترمي — مش بيتخزن ويتنسي.
    const perPackage = {};
    const incoming = (b.perPackage && typeof b.perPackage === 'object') ? b.perPackage : {};
    PACKAGES.forEach((p) => {
      if (!Object.prototype.hasOwnProperty.call(incoming, p.id)) return;
      const raw = incoming[p.id];
      // فاضي/null = امسح النسبة الخاصة وارجع للنسبة العامة
      if (raw === '' || raw === null || raw === undefined) return;
      perPackage[p.id] = clampPercent(raw);
    });

    // ميعاد انتهاء غير صالح = مفيش ميعاد (العرض شغال لحد ما توقفه بإيدك)
    let endsAt = null;
    if (b.endsAt) {
      const d = new Date(b.endsAt);
      if (!Number.isNaN(d.getTime())) endsAt = d;
    }

    const update = {
      enabled: !!b.enabled,
      percent: clampPercent(b.percent),
      perPackage,
      labelAr: sanitizeText(b.labelAr, 60),
      labelEn: sanitizeText(b.labelEn, 60),
      endsAt,
      updatedAt: new Date(),
    };

    const doc = await PricingSettings.findOneAndUpdate(
      { key: 'default' }, update, { new: true, upsert: true }
    );
    // الكاش لازم يتفضّى على طول، وإلا العميل يفضل شايف السعر القديم
    invalidatePricingCache();

    logAdminAction(req, 'settings.pricing', { type: 'settings', id: 'default' }, {
      enabled: update.enabled, percent: update.percent, perPackage: update.perPackage,
    });
    return res.json({ ok: true, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error('Error saving pricing settings:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// مكتبة الموسيقى — إنت بترفع الأغاني، والعملاء بيدوّروا فيها
// ==========================================================================
router.get('/admin/api/tracks', requireAdminSession, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 80);
    const filter = q
      ? { $or: ['title', 'artist', 'mood'].map((f) => ({ [f]: new RegExp(escapeRegex(q), 'i') })) }
      : {};
    const tracks = await Track.find(filter).sort({ createdAt: -1 }).limit(300).lean();
    return res.json({
      tracks: tracks.map((t) => ({
        id: String(t._id),
        title: t.title,
        artist: t.artist,
        mood: t.mood,
        url: t.url,
        duration: t.duration || 0,
        active: t.active !== false,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error listing tracks:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// الملف نفسه بيترفع بـ POST /admin/api/tracks/upload (routes/uploads.js
// بيتحقق منه بنفس فحص الصوت العادي)، وده بيسجّل بياناته
router.post('/admin/api/tracks', requireAdminSession, async (req, res) => {
  try {
    const body = req.body || {};
    const title = sanitizeText(body.title, 120);
    const url = String(body.url || '');
    if (!title) return res.status(400).json({ error: 'اكتب اسم الأغنية.' });
    if (!/^https:\/\/res\.cloudinary\.com\//.test(url)) {
      return res.status(400).json({ error: 'رابط الملف مش مقبول.' });
    }

    const track = await Track.create({
      title,
      artist: sanitizeText(body.artist, 120),
      mood: sanitizeText(body.mood, 60),
      url,
      publicId: String(body.publicId || '').slice(0, 300),
      duration: Math.max(0, Math.min(36000, Number(body.duration) || 0)),
    });

    logAdminAction(req, 'track.add', { type: 'track', id: track._id, label: title });
    return res.status(201).json({ ok: true, id: String(track._id) });
  } catch (err) {
    console.error('Error adding track:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.patch('/admin/api/tracks/:id', requireAdminSession, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'الأغنية دي مش موجودة.' });
    const body = req.body || {};
    if (body.title !== undefined) track.title = sanitizeText(body.title, 120) || track.title;
    if (body.artist !== undefined) track.artist = sanitizeText(body.artist, 120);
    if (body.mood !== undefined) track.mood = sanitizeText(body.mood, 60);
    if (body.active !== undefined) track.active = !!body.active;
    await track.save();
    logAdminAction(req, 'track.update', { type: 'track', id: track._id, label: track.title });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error updating track:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// المسح بيشيلها من المكتبة بس. الدعوات اللي اختارتها بتفضل شغالة —
// الرابط متخزّن جوه الدعوة نفسها، مش مربوط بالسجل ده.
router.delete('/admin/api/tracks/:id', requireAdminSession, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'الأغنية دي مش موجودة.' });
    await Track.deleteOne({ _id: track._id });
    logAdminAction(req, 'track.delete', { type: 'track', id: track._id, label: track.title });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting track:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// تنضيف الدعوات المنتهية
// ==========================================================================

// GET — معاينة بس: بيقولك هيتمسح إيه من غير ما يمسح أي حاجة
router.get('/admin/api/cleanup/preview', requireAdminSession, async (req, res) => {
  try {
    const graceDays = Math.max(0, Math.min(365, parseInt(req.query.graceDays, 10) || DEFAULT_GRACE_DAYS));
    const summary = await cleanupExpiredInvitations({ graceDays, dryRun: true, limit: 5000 });
    const totals = await SiteTotals.findOne({ key: 'default' }).lean();
    return res.json({
      ...summary,
      archived: totals ? {
        invitations: totals.archivedInvitations || 0,
        views: totals.archivedViews || 0,
        lastCleanupAt: totals.lastCleanupAt || null,
        lastCleanupDeleted: totals.lastCleanupDeleted || 0,
      } : null,
    });
  } catch (err) {
    console.error('Cleanup preview failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// POST — التنفيذ الفعلي. بيطلب تأكيد نصي صريح في الجسم عشان طلب
// بالغلط (أو ضغطة زرار غلط) ماينفّذش مسح.
router.post('/admin/api/cleanup/run', requireAdminSession, async (req, res) => {
  try {
    const body = req.body || {};
    if (body.confirm !== 'DELETE') {
      return res.status(400).json({ error: 'محتاج تأكيد صريح.' });
    }
    const graceDays = Math.max(0, Math.min(365, parseInt(body.graceDays, 10) || DEFAULT_GRACE_DAYS));
    const limit = Math.max(1, Math.min(5000, parseInt(body.limit, 10) || 1000));

    const summary = await cleanupExpiredInvitations({ graceDays, dryRun: false, limit });

    logAdminAction(req, 'cleanup.run', { type: 'invitation', id: 'batch' }, {
      graceDays, deleted: summary.deleted, views: summary.views, rsvps: summary.rsvps,
    });

    return res.json(summary);
  } catch (err) {
    console.error('Cleanup run failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// ==========================================================================
// سجل الإجراءات
// ==========================================================================
router.get('/admin/api/audit', requireAdminSession, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 50;
    const [entries, total] = await Promise.all([
      AdminAudit.find({}).sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
      AdminAudit.countDocuments({}),
    ]);

    return res.json({
      page, perPage, total, pages: Math.max(1, Math.ceil(total / perPage)),
      entries: entries.map((e) => ({
        id: String(e._id),
        action: e.action,
        targetType: e.targetType,
        targetId: e.targetId,
        targetLabel: e.targetLabel,
        meta: e.meta || {},
        ip: e.ip,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error loading audit log:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
