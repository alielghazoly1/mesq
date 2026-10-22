// routes/adminOrdersDay.js
// "طلبات يوم" في لوحة التحكم: كل الطلبات اللي اتفعّلت (أو اتطلبت) في يوم
// معيّن بتوقيت مصر — ومع كل طلب: مين (العميل)، إيه (الباقة والفلوس)، إزاي
// (الإيصال، وقت التفعيل، جه منين)، وفين (الدولة والجهاز).
const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Campaign = require('../models/Campaign');
const SiteDeviceDay = require('../models/SiteDeviceDay');
const { requireAdminSession } = require('../middleware/adminAuth');
const { cairoParts, cairoWallToDate } = require('../utils/cairoTime');
const { getPackage } = require('../packages/registry');
const { getRates, round2 } = require('../utils/finance');

const router = express.Router();
const pad = (n) => String(n).padStart(2, '0');
const todayKey = () => { const p = cairoParts(new Date()); return `${p.year}-${pad(p.month)}-${pad(p.day)}`; };
const keyOf = (d) => { const p = cairoParts(new Date(d)); return `${p.year}-${pad(p.month)}-${pad(p.day)}`; };

// GET /admin/api/orders-day?day=YYYY-MM-DD&kind=activated|created
router.get('/admin/api/orders-day', requireAdminSession, async (req, res) => {
  try {
    const kind = req.query.kind === 'created' ? 'created' : 'activated';
    let day = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.day || '')) ? String(req.query.day) : todayKey();
    if (day > todayKey()) day = todayKey();
    const [y, m, d] = day.split('-').map(Number);
    const from = cairoWallToDate(y, m - 1, d, 0, 0);
    const to = cairoWallToDate(y, m - 1, d + 1, 0, 0);
    const prevDay = keyOf(cairoWallToDate(y, m - 1, d - 1, 12, 0));
    const nextDay = day < todayKey() ? keyOf(cairoWallToDate(y, m - 1, d + 1, 12, 0)) : null;

    const filter = kind === 'activated'
      ? { status: 'activated', activatedAt: { $gte: from, $lt: to } }
      : { createdAt: { $gte: from, $lt: to } };
    const orders = await Order.find(filter).sort(kind === 'activated' ? { activatedAt: -1 } : { createdAt: -1 }).limit(500).lean();

    const userIds = [...new Set(orders.map((o) => String(o.userId)))];
    const [users, rates, paidAgg, invAgg] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select('name email phone country createdAt googleId passwordHash campaign referredBy subscription lastSeenAt visitCount').lean(),
      getRates(),
      // كل اللي العميل دفعه قبل كده + أول دفعة (جديد ولا مجدّد)
      Order.aggregate([
        { $match: { userId: { $in: orders.map((o) => o.userId) }, status: 'activated' } },
        { $sort: { activatedAt: 1 } },
        { $group: { _id: '$userId', firstId: { $first: '$_id' }, paidOrders: { $sum: 1 }, egp: { $sum: { $cond: [{ $eq: ['$currency', 'EGP'] }, '$price', 0] } } } },
      ]),
      Invitation.aggregate([
        { $match: { ownerId: { $in: orders.map((o) => o.userId) } } },
        { $group: { _id: '$ownerId', published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } }, drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } } } },
      ]),
    ]);
    const uById = new Map(users.map((u) => [String(u._id), u]));
    const paidBy = new Map(paidAgg.map((r) => [String(r._id), r]));
    const invBy = new Map(invAgg.map((r) => [String(r._id), r]));
    const codes = [...new Set(users.map((u) => u.campaign).filter(Boolean))];
    const cmpNames = new Map((codes.length ? await Campaign.find({ code: { $in: codes } }).select('code name').lean() : []).map((c) => [c.code, c.name]));
    // الجهاز اللي العميل كان شغّال منه (من تحليلات الموقع) — أقرب يوم للطلب
    const devRows = userIds.length
      ? await SiteDeviceDay.find({ userId: { $in: users.map((u) => u._id) } }).sort({ lastSeen: -1 }).select('userId day kind os browser src').limit(2000).lean()
      : [];
    const devBy = new Map();
    devRows.forEach((r) => { const k = String(r.userId); if (!devBy.has(k)) devBy.set(k, r); });

    const eq = (amount, cur) => round2((Number(amount) || 0) * (rates[cur] || 0));
    const list = orders.map((o) => {
      const u = uById.get(String(o.userId)) || {};
      const pkg = getPackage(o.packageId);
      const paid = paidBy.get(String(o.userId));
      const inv = invBy.get(String(o.userId)) || { published: 0, drafts: 0 };
      const dev = devBy.get(String(o.userId)) || null;
      const t0 = o.paymentProofAt || o.createdAt;
      return {
        id: String(o._id),
        status: o.status,
        packageId: o.packageId,
        packageName: pkg ? (pkg.name.ar || pkg.name.en) : o.packageId,
        invitations: pkg ? pkg.invitations : 0,
        editDays: pkg && Number.isFinite(pkg.editDays) ? pkg.editDays : null,
        price: o.price, currency: o.currency, eq: eq(o.price, o.currency),
        createdAt: o.createdAt, paymentProofAt: o.paymentProofAt || null, paymentProofUrl: o.paymentProofUrl || null,
        activatedAt: o.activatedAt || null, cancelledAt: o.cancelledAt || null,
        // من رفع الإيصال (أو الطلب) لحد التفعيل — بالدقايق
        activationMinutes: o.activatedAt ? Math.max(0, Math.round((new Date(o.activatedAt) - new Date(t0)) / 60000)) : null,
        isFirst: !!(paid && o.status === 'activated' && String(paid.firstId) === String(o._id)),
        user: {
          id: String(o.userId), name: u.name || 'عميل محذوف', email: u.email || '', phone: u.phone || '', country: u.country || '',
          createdAt: u.createdAt || null, lastSeenAt: u.lastSeenAt || null, visitCount: u.visitCount || 0,
          signup: u.googleId ? (u.passwordHash ? 'both' : 'google') : 'email',
          source: u.campaign ? { type: 'ad', code: u.campaign, name: cmpNames.get(u.campaign) || u.campaign }
            : u.referredBy ? { type: 'ugc', code: u.referredBy } : { type: 'direct' },
          paidOrders: paid ? paid.paidOrders : 0, paidEgp: paid ? paid.egp : 0,
          invitationsLeft: (u.subscription && u.subscription.invitationsLeft) || 0,
          published: inv.published, drafts: inv.drafts,
          device: dev ? { kind: dev.kind, os: dev.os, browser: dev.browser, src: dev.src } : null,
        },
      };
    });

    const byCurrency = {};
    list.filter((o) => kind === 'created' || o.status === 'activated').forEach((o) => {
      const c = byCurrency[o.currency] || { total: 0, orders: 0 };
      c.total = round2(c.total + o.price); c.orders += 1; byCurrency[o.currency] = c;
    });
    const act = list.filter((o) => o.activationMinutes != null);
    const pkgCount = {};
    list.forEach((o) => { pkgCount[o.packageName] = (pkgCount[o.packageName] || 0) + 1; });

    return res.json({
      day, kind, prevDay, nextDay, isToday: day === todayKey(),
      summary: {
        orders: list.length,
        byCurrency,
        eq: round2(list.reduce((a, o) => a + (kind === 'created' && o.status === 'cancelled' ? 0 : o.eq), 0)),
        newPayers: list.filter((o) => o.isFirst).length,
        renewals: list.filter((o) => o.status === 'activated' && !o.isFirst).length,
        avgActivationMinutes: act.length ? Math.round(act.reduce((a, o) => a + o.activationMinutes, 0) / act.length) : null,
        byPackage: Object.entries(pkgCount).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n),
        statuses: kind === 'created' ? {
          pending: list.filter((o) => o.status === 'pending').length,
          activated: list.filter((o) => o.status === 'activated').length,
          cancelled: list.filter((o) => o.status === 'cancelled').length,
          withReceipt: list.filter((o) => o.paymentProofUrl).length,
        } : null,
      },
      orders: list,
    });
  } catch (err) {
    console.error('Error loading day orders:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
