// routes/campaigns.js
// لينكات الإعلانات.
//
//   GET /go/:code                       — اللينك اللي بيتحط في الإعلان: بيعدّ الزيارة،
//                                         بيعلّم الجهاز 30 يوم، ويودّي على الموقع
//   /admin/api/campaigns ...            — لوحة التحكم: عمل/تعديل/أرشفة اللينكات
//                                         وأرقام كل إعلان (زيارات → تسجيل → دفع → فلوس)
//
// الأرقام بتتحسب لحظيًا من الداتا نفسها (المستخدمين وطلباتهم المفعّلة) — مفيش
// عدّاد ممكن ينحرف عن الحقيقة غير عدّاد الضغطات.
const express = require('express');
const crypto = require('crypto');
const Campaign = require('../models/Campaign');
const CampaignVisit = require('../models/CampaignVisit');
const User = require('../models/User');
const Order = require('../models/Order');
const Invitation = require('../models/Invitation');
const { requireAdminSession } = require('../middleware/adminAuth');
const { ensureDeviceId } = require('../middleware/deviceLimiter');
const { logAdminAction } = require('../utils/adminAudit');
const { sanitizeText } = require('../utils/sanitize');
const { cairoParts, cairoWallToDate } = require('../utils/cairoTime');

const router = express.Router();

const COOKIE = 'mithaq_cmp';
const COOKIE_DAYS = 30;
const CODE_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
// أكواد محجوزة عشان اللينك مايتلخبطش مع صفحات الموقع
const RESERVED = new Set(['admin', 'api', 'go', 'i', 'r', 's', 'a', 'editor', 'login', 'dashboard']);
const PREFIX = { instagram: 'ig', facebook: 'fb', tiktok: 'tt', google: 'gg', snapchat: 'sc', whatsapp: 'wa', other: 'ad' };

// البرامج الآلية (معاينة اللينك في واتساب/فيسبوك، محركات البحث، أدوات الفحص)
// مش ناس — مابنعدّهاش، عشان رقم الزيارات يبقى حقيقي.
// (متصفح إنستجرام نفسه جواه كلمة Instagram مش bot — فبيتعدّ عادي)
const BOT_RE = /bot\b|bot\/|crawler|spider|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|telegram|slack|discord|twitterbot|linkedin|embedly|preview|curl|wget|python|axios|node-fetch|headless|lighthouse|pingdom|uptime/i;
const isBot = (req) => BOT_RE.test(String(req.get('user-agent') || '')) || !req.get('user-agent');

const r2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

// ======================================================================
// اللينك نفسه
// ======================================================================
router.get('/go/:code', ensureDeviceId, async (req, res) => {
  const code = String(req.params.code || '').toLowerCase().slice(0, 40);
  try {
    const campaign = /^[a-z0-9-]+$/.test(code) ? await Campaign.findOne({ code }).select('_id code landing').lean() : null;
    if (!campaign) return res.redirect(302, '/');
    if (!isBot(req)) {
      const now = new Date();
      const visitor = String(req.deviceId || '').slice(0, 64)
        || crypto.createHash('sha256').update(String(req.ip || '')).digest('hex').slice(0, 32);
      await Promise.all([
        Campaign.updateOne({ _id: campaign._id }, { $inc: { clicks: 1 } }),
        CampaignVisit.updateOne(
          { campaignId: campaign._id, visitor },
          { $inc: { hits: 1 }, $set: { lastAt: now }, $setOnInsert: { firstAt: now } },
          { upsert: true }
        ).catch(() => {}),
      ]);
      // آخر إعلان دخل منه (في خلال 30 يوم) هو اللي ياخد التسجيل
      res.cookie(COOKIE, campaign.code, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_DAYS * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    return res.redirect(302, Campaign.LANDINGS.includes(campaign.landing) ? campaign.landing : '/');
  } catch (err) {
    console.error('Campaign link error:', err.message);
    return res.redirect(302, '/');
  }
});

// ======================================================================
// الأرقام
// ======================================================================

/**
 * أرقام مجموعة إعلانات مرة واحدة: زوار، تسجيلات، دفعوا، طلبات، فلوس.
 * @returns {Promise<Record<string, object>>} بالكود
 */
async function statsFor(campaigns) {
  const ids = campaigns.map((c) => c._id);
  const codes = campaigns.map((c) => c.code);
  const out = {};
  campaigns.forEach((c) => {
    out[c.code] = {
      clicks: c.clicks || 0, visitors: 0, signups: 0, payers: 0, pendingReceipts: 0,
      orders: 0, revenue: { EGP: 0, USD: 0 },
    };
  });
  if (!ids.length) return out;

  const [visitors, users] = await Promise.all([
    CampaignVisit.aggregate([{ $match: { campaignId: { $in: ids } } }, { $group: { _id: '$campaignId', n: { $sum: 1 } } }]),
    User.find({ campaign: { $in: codes } }).select('_id campaign').lean(),
  ]);
  const codeById = {};
  campaigns.forEach((c) => { codeById[String(c._id)] = c.code; });
  visitors.forEach((v) => { const code = codeById[String(v._id)]; if (code) out[code].visitors = v.n; });

  const userCode = {};
  users.forEach((u) => { userCode[String(u._id)] = u.campaign; out[u.campaign].signups += 1; });
  const userIds = users.map((u) => u._id);
  if (userIds.length) {
    const [paid, pending] = await Promise.all([
      Order.aggregate([
        { $match: { userId: { $in: userIds }, status: 'activated' } },
        { $group: { _id: { u: '$userId', c: '$currency' }, total: { $sum: '$price' }, n: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { userId: { $in: userIds }, status: 'pending', paymentProofUrl: { $ne: null } } },
        { $group: { _id: '$userId' } },
      ]),
    ]);
    const payers = {};
    paid.forEach((r) => {
      const code = userCode[String(r._id.u)];
      if (!code) return;
      const cur = r._id.c === 'USD' ? 'USD' : 'EGP';
      out[code].revenue[cur] = r2(out[code].revenue[cur] + r.total);
      out[code].orders += r.n;
      payers[code] = payers[code] || new Set();
      payers[code].add(String(r._id.u));
    });
    Object.entries(payers).forEach(([code, set]) => { out[code].payers = set.size; });
    pending.forEach((r) => {
      const code = userCode[String(r._id)];
      if (code && !(payers[code] && payers[code].has(String(r._id)))) out[code].pendingReceipts += 1;
    });
  }
  return out;
}

function serialize(c, s) {
  return {
    id: String(c._id),
    code: c.code,
    name: c.name,
    platform: c.platform,
    market: c.market || '',
    spend: { amount: c.spendAmount || 0, currency: c.spendCurrency || 'EGP' },
    landing: c.landing || '/',
    notes: c.notes || '',
    archived: !!c.archived,
    createdAt: c.createdAt,
    stats: s,
  };
}

/** مفتاح اليوم بتوقيت مصر */
function dayKey(date) {
  const p = cairoParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

// ======================================================================
// لوحة التحكم
// ======================================================================
router.get('/admin/api/campaigns', requireAdminSession, async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
    const stats = await statsFor(campaigns);
    return res.json({ campaigns: campaigns.map((c) => serialize(c, stats[c.code])) });
  } catch (err) {
    console.error('Error listing campaigns:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

/** بيقرا ويفلتر بيانات الإعلان من الطلب (للعمل والتعديل) */
function readBody(body, { creating }) {
  const b = body || {};
  const out = {};
  if (creating || b.name !== undefined) {
    const name = sanitizeText(b.name, 80).trim();
    if (!name) return { error: 'اكتب اسم للإعلان.' };
    out.name = name;
  }
  if (b.platform !== undefined || creating) {
    out.platform = Campaign.PLATFORMS.includes(b.platform) ? b.platform : 'instagram';
  }
  if (b.market !== undefined) out.market = sanitizeText(b.market, 40).trim();
  if (b.notes !== undefined) out.notes = sanitizeText(b.notes, 300).trim();
  if (b.landing !== undefined) out.landing = Campaign.LANDINGS.includes(b.landing) ? b.landing : '/';
  if (b.spendAmount !== undefined) {
    const n = Number(b.spendAmount);
    if (!Number.isFinite(n) || n < 0 || n > 100000000) return { error: 'المبلغ اللي صرفته مش مظبوط.' };
    out.spendAmount = r2(n);
  }
  if (b.spendCurrency !== undefined) out.spendCurrency = b.spendCurrency === 'USD' ? 'USD' : 'EGP';
  if (b.archived !== undefined) out.archived = !!b.archived;
  return { data: out };
}

router.post('/admin/api/campaigns', requireAdminSession, async (req, res) => {
  try {
    const { data, error } = readBody(req.body, { creating: true });
    if (error) return res.status(400).json({ error });

    let code = String((req.body && req.body.code) || '').toLowerCase().trim();
    if (code) {
      if (!CODE_RE.test(code) || RESERVED.has(code)) {
        return res.status(400).json({ error: 'كود اللينك: حروف إنجليزي صغيرة وأرقام و"-" بس (3 لـ 40 حرف).' });
      }
      if (await Campaign.exists({ code })) return res.status(409).json({ error: 'الكود ده مستخدم في إعلان تاني — اختار غيره.' });
    } else {
      // كود تلقائي: بادئة المنصة + 4 حروف (ig-k3x9)
      for (let i = 0; i < 8 && !code; i++) {
        const c = `${PREFIX[data.platform] || 'ad'}-${crypto.randomBytes(4).toString('hex').slice(0, 4)}`;
        if (!(await Campaign.exists({ code: c }))) code = c;
      }
      if (!code) return res.status(500).json({ error: 'جرّب تاني.' });
    }
    const campaign = await Campaign.create({ ...data, code });
    logAdminAction(req, 'campaign.create', { type: 'campaign', id: campaign._id, label: `${campaign.name} (${code})` });
    const stats = await statsFor([campaign.toObject()]);
    return res.status(201).json({ campaign: serialize(campaign.toObject(), stats[code]) });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: 'الكود ده مستخدم في إعلان تاني — اختار غيره.' });
    console.error('Error creating campaign:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.patch('/admin/api/campaigns/:id', requireAdminSession, async (req, res) => {
  try {
    if (!/^[a-f0-9]{24}$/i.test(String(req.params.id))) return res.status(404).json({ error: 'الإعلان مش موجود.' });
    const { data, error } = readBody(req.body, { creating: false });
    if (error) return res.status(400).json({ error });
    // الكود مبيتغيّرش أبدًا — اللينك بيكون اتنشر في الإعلان خلاص
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: { ...data, updatedAt: new Date() } }, { new: true }).lean();
    if (!campaign) return res.status(404).json({ error: 'الإعلان مش موجود.' });
    logAdminAction(req, 'campaign.update', { type: 'campaign', id: campaign._id, label: campaign.name }, data);
    const stats = await statsFor([campaign]);
    return res.json({ campaign: serialize(campaign, stats[campaign.code]) });
  } catch (err) {
    console.error('Error updating campaign:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// تفاصيل إعلان: الأرقام + يوم بيوم + كل اللي سجّلوا منه (دفع ولا لأ)
router.get('/admin/api/campaigns/:id', requireAdminSession, async (req, res) => {
  try {
    if (!/^[a-f0-9]{24}$/i.test(String(req.params.id))) return res.status(404).json({ error: 'الإعلان مش موجود.' });
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) return res.status(404).json({ error: 'الإعلان مش موجود.' });
    const [stats, users] = await Promise.all([
      statsFor([campaign]),
      User.find({ campaign: campaign.code })
        .select('name email phone country createdAt campaignAt subscription lastSeenAt')
        .sort({ campaignAt: -1 }).limit(1000).lean(),
    ]);
    const ids = users.map((u) => u._id);
    const [orders, invCounts] = await Promise.all([
      ids.length ? Order.find({ userId: { $in: ids }, status: { $in: ['activated', 'pending'] } })
        .select('userId packageId currency price status paymentProofUrl activatedAt createdAt').lean() : [],
      ids.length ? Invitation.aggregate([{ $match: { ownerId: { $in: ids } } }, { $group: { _id: '$ownerId', n: { $sum: 1 } } }]) : [],
    ]);
    const invBy = {}; invCounts.forEach((r) => { invBy[String(r._id)] = r.n; });
    const ordBy = {};
    orders.forEach((o) => { (ordBy[String(o.userId)] = ordBy[String(o.userId)] || []).push(o); });

    const people = users.map((u) => {
      const os = ordBy[String(u._id)] || [];
      const paid = os.filter((o) => o.status === 'activated');
      const waiting = os.some((o) => o.status === 'pending' && o.paymentProofUrl);
      const ordered = os.some((o) => o.status === 'pending');
      const amount = { EGP: 0, USD: 0 };
      paid.forEach((o) => { amount[o.currency === 'USD' ? 'USD' : 'EGP'] = r2(amount[o.currency === 'USD' ? 'USD' : 'EGP'] + o.price); });
      const last = paid.sort((a, b) => new Date(b.activatedAt || 0) - new Date(a.activatedAt || 0))[0];
      return {
        id: String(u._id),
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        country: u.country || '',
        signedUpAt: u.campaignAt || u.createdAt,
        // paid = دفع واتفعّل، receipt = رفع إيصال ومستني، ordered = طلب باقة ومادفعش، signed = سجّل بس
        status: paid.length ? 'paid' : waiting ? 'receipt' : ordered ? 'ordered' : 'signed',
        amount,
        packageId: last ? last.packageId : (u.subscription && u.subscription.packageId) || null,
        paidAt: last ? last.activatedAt : null,
        invitations: invBy[String(u._id)] || 0,
      };
    });

    // يوم بيوم — آخر 30 يوم بتوقيت مصر (أو من يوم الإعلان لو أحدث)
    const days = 30;
    const p = cairoParts(new Date());
    const from = cairoWallToDate(p.year, p.month - 1, p.day - (days - 1), 0, 0);
    const [visitDays] = await Promise.all([
      CampaignVisit.aggregate([
        { $match: { campaignId: campaign._id, firstAt: { $gte: from } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$firstAt', timezone: 'Africa/Cairo' } }, n: { $sum: 1 } } },
      ]),
    ]);
    const byDay = {};
    for (let i = 0; i < days; i++) {
      const key = dayKey(new Date(from.getTime() + i * 86400000 + 12 * 3600000));
      byDay[key] = { date: key, visitors: 0, signups: 0, payers: 0 };
    }
    visitDays.forEach((v) => { if (byDay[v._id]) byDay[v._id].visitors = v.n; });
    people.forEach((u) => {
      const k = dayKey(new Date(u.signedUpAt));
      if (byDay[k]) byDay[k].signups += 1;
      if (u.paidAt) { const k2 = dayKey(new Date(u.paidAt)); if (byDay[k2]) byDay[k2].payers += 1; }
    });

    return res.json({
      campaign: serialize(campaign, stats[campaign.code]),
      people,
      daily: Object.values(byDay),
    });
  } catch (err) {
    console.error('Error loading campaign:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
module.exports.statsFor = statsFor;
