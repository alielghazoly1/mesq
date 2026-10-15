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
const CampaignHit = require('../models/CampaignHit');
const User = require('../models/User');
const Order = require('../models/Order');
const Invitation = require('../models/Invitation');
const { requireAdminSession, ADMIN_COOKIE_NAME } = require('../middleware/adminAuth');
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
//
// الزيارة مابتتحسبش لمجرد إن اللينك اتفتح. إنستجرام وفيسبوك بيفتحوا لينك
// الإعلان بنفسهم وهما بيراجعوه، وبيحمّلوا الصفحة مسبقًا قبل ما حد يضغط، وده
// كله بيبان كأنه "متصفح عادي" — وده اللي كان بيخلّي الأرقام تزيد قبل ما الإعلان
// يشتغل أصلًا. فالحساب على خطوتين:
//   1) /go بيسجّل الفتحة (pending) ويحط علامة قصيرة العمر على الجهاز
//   2) الموقع نفسه (lib/campaignBeacon.js) بيأكّد بعد ما الصفحة تتفتح فعلًا
//      قدام شخص وتفضل ظاهرة شوية مع حركة منه → counted
// والبرامج الآلية، والتحميل المسبق، وجهاز صاحب الموقع بيتسجّلوا بسببهم وماتحسبوش.

const OWNER_COOKIE = 'mithaq_owner';
const VERIFY_COOKIE = 'mithaq_cmp_v';
const VERIFY_WINDOW_MS = 30 * 60 * 1000;

const isPrefetch = (req) => {
  const h = (n) => String(req.get(n) || '').toLowerCase();
  return /prefetch|prerender/.test(h('sec-purpose') + ' ' + h('purpose') + ' ' + h('x-moz'))
    || h('x-purpose') === 'preview' || h('x-fb-purpose') !== '' || h('x-fb-preload') !== '';
};
const isOwner = (req) => !!(req.cookies && (req.cookies[ADMIN_COOKIE_NAME] || req.cookies[OWNER_COOKIE]));

function srcOf(ua) {
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'facebook';
  if (/musical_ly|TikTok|BytedanceWebview|trill/i.test(ua)) return 'tiktok';
  if (/Snapchat/i.test(ua)) return 'snapchat';
  return 'browser';
}
function deviceOf(ua) {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

router.get('/go/:code', ensureDeviceId, async (req, res) => {
  const code = String(req.params.code || '').toLowerCase().slice(0, 40);
  try {
    const campaign = /^[a-z0-9-]+$/.test(code) ? await Campaign.findOne({ code }).select('_id code landing').lean() : null;
    if (!campaign) return res.redirect(302, '/');
    const landing = Campaign.LANDINGS.includes(campaign.landing) ? campaign.landing : '/';
    const ua = String(req.get('user-agent') || '');
    const visitor = String(req.deviceId || '').slice(0, 64)
      || crypto.createHash('sha256').update(String(req.ip || '')).digest('hex').slice(0, 32);
    const status = isBot(req) ? 'bot' : isOwner(req) ? 'owner' : isPrefetch(req) ? 'prefetch' : 'pending';
    const hit = await CampaignHit.create({
      campaignId: campaign._id, visitor, status, src: srcOf(ua), device: deviceOf(ua),
    }).catch(() => null);

    // البرامج الآلية وصاحب الموقع: مفيش علامة على الجهاز (فالتسجيل منهم مايتحسبش)
    if (status === 'bot' || status === 'owner') return res.redirect(302, landing);

    const secure = process.env.NODE_ENV === 'production';
    res.cookie(COOKIE, campaign.code, {
      httpOnly: true, sameSite: 'lax', secure, maxAge: COOKIE_DAYS * 24 * 60 * 60 * 1000, path: '/',
    });
    // علامة قصيرة العمر يقراها الموقع عشان يأكّد إن الصفحة اتفتحت فعلًا
    if (hit) {
      res.cookie(VERIFY_COOKIE, String(hit._id), {
        httpOnly: false, sameSite: 'lax', secure, maxAge: VERIFY_WINDOW_MS, path: '/',
      });
    }
    return res.redirect(302, landing);
  } catch (err) {
    console.error('Campaign link error:', err.message);
    return res.redirect(302, '/');
  }
});

// POST /api/campaign-seen — الموقع بيبعته بعد ما الصفحة اتفتحت قدام شخص فعلًا
// (ظاهرة 3 ثواني على الأقل + حركة منه أو 10 ثواني، ومش متصفح آلي)
router.post('/api/campaign-seen', ensureDeviceId, async (req, res) => {
  try {
    const hitId = String((req.cookies && req.cookies[VERIFY_COOKIE]) || '');
    res.clearCookie(VERIFY_COOKIE, { path: '/' });
    if (!/^[a-f0-9]{24}$/i.test(hitId) || isOwner(req) || isBot(req)) return res.status(204).end();
    const hit = await CampaignHit.findById(hitId);
    if (!hit || !['pending', 'prefetch'].includes(hit.status)) return res.status(204).end();
    if (Date.now() - new Date(hit.at).getTime() > VERIFY_WINDOW_MS) return res.status(204).end();
    if (hit.visitor && req.deviceId && hit.visitor !== req.deviceId) return res.status(204).end();
    const now = new Date();
    hit.status = 'counted';
    hit.verifiedAt = now;
    await hit.save();
    await CampaignVisit.updateOne(
      { campaignId: hit.campaignId, visitor: hit.visitor },
      { $inc: { hits: 1 }, $set: { lastAt: now }, $setOnInsert: { firstAt: hit.at } },
      { upsert: true }
    );
    // أول مرة الشخص ده يتأكد = زائر حقيقي جديد
    await CampaignVisit.updateOne(
      { campaignId: hit.campaignId, visitor: hit.visitor, verifiedAt: null },
      { $set: { verifiedAt: now } }
    );
    return res.status(204).end();
  } catch (err) {
    console.error('Campaign seen error:', err.message);
    return res.status(204).end();
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
  const out = {};
  const startOf = {};
  campaigns.forEach((c) => {
    startOf[c.code] = new Date(c.startedAt || c.createdAt || 0);
    out[c.code] = {
      clicks: 0, visitors: 0, signups: 0, payers: 0, pendingReceipts: 0,
      orders: 0, revenue: { EGP: 0, USD: 0 },
      // اللي اتسجّل ومااتحسبش وليه — عشان الأرقام تبقى مفهومة
      filtered: { pending: 0, prefetch: 0, bot: 0, owner: 0 },
    };
  });
  if (!ids.length) return out;
  const codeById = {};
  campaigns.forEach((c) => { codeById[String(c._id)] = c.code; });
  // أقدم بداية — نفلتر بيها في قاعدة البيانات، والباقي لكل إعلان هنا
  const minStart = new Date(Math.min(...Object.values(startOf).map((d) => d.getTime())));

  const [visitors, hits, users] = await Promise.all([
    CampaignVisit.find({ campaignId: { $in: ids }, verifiedAt: { $ne: null, $gte: minStart } }).select('campaignId verifiedAt').lean(),
    CampaignHit.aggregate([
      { $match: { campaignId: { $in: ids }, at: { $gte: minStart } } },
      { $project: { campaignId: 1, status: 1, at: 1 } },
    ]),
    User.find({ campaign: { $in: Object.keys(out) }, campaignAt: { $gte: minStart } }).select('_id campaign campaignAt').lean(),
  ]);
  visitors.forEach((v) => {
    const code = codeById[String(v.campaignId)];
    if (code && v.verifiedAt >= startOf[code]) out[code].visitors += 1;
  });
  hits.forEach((h) => {
    const code = codeById[String(h.campaignId)];
    if (!code || h.at < startOf[code]) return;
    if (h.status === 'counted' || h.status === 'pending') out[code].clicks += 1;
    if (h.status !== 'counted') out[code].filtered[h.status] += 1;
  });

  const userCode = {};
  const kept = users.filter((u) => u.campaignAt >= startOf[u.campaign]);
  kept.forEach((u) => { userCode[String(u._id)] = u.campaign; out[u.campaign].signups += 1; });
  const userIds = kept.map((u) => u._id);
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
    startedAt: c.startedAt || c.createdAt,
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
    // الجهاز اللي فاتح لوحة التحكم ده جهاز صاحب الموقع — زياراته للينكات
    // (وهو بيجرّبها) مابتتحسبش حتى بعد ما يخرج من اللوحة
    res.cookie(OWNER_COOKIE, '1', {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 365 * 24 * 60 * 60 * 1000, path: '/',
    });
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
  // يوم ما الإعلان اشتغل (YYYY-MM-DD بتوقيت مصر) — الأرقام بتتحسب منه
  if (b.startedAt !== undefined) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(b.startedAt || ''));
    if (!m) return { error: 'تاريخ بداية الإعلان مش مظبوط.' };
    const d = cairoWallToDate(+m[1], +m[2] - 1, +m[3], 0, 0);
    if (Number.isNaN(d.getTime()) || +m[1] < 2024) return { error: 'تاريخ بداية الإعلان مش مظبوط.' };
    out.startedAt = d;
  }
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
      User.find({ campaign: campaign.code, campaignAt: { $gte: new Date(campaign.startedAt || campaign.createdAt || 0) } })
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
    const start = new Date(campaign.startedAt || campaign.createdAt || 0);
    const [visitDays, hitLog] = await Promise.all([
      // الزوار الحقيقيين بس (اللي الموقع أكّدهم) من يوم بداية الإعلان
      CampaignVisit.aggregate([
        { $match: { campaignId: campaign._id, verifiedAt: { $gte: from > start ? from : start } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$verifiedAt', timezone: 'Africa/Cairo' } }, n: { $sum: 1 } } },
      ]),
      // سجل آخر الفتحات — المتحسوب وغير المتحسوب وسببه
      CampaignHit.find({ campaignId: campaign._id }).sort({ at: -1 }).limit(300).select('at status src device').lean(),
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
      hits: hitLog.map((h) => ({ at: h.at, status: h.status, src: h.src, device: h.device, beforeStart: h.at < start })),
    });
  } catch (err) {
    console.error('Error loading campaign:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
module.exports.statsFor = statsFor;
