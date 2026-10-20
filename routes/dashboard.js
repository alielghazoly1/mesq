// routes/dashboard.js
// لوحة العميل: دعواته، إحصائياتها، ردود الحضور اللي وصلته، حالة اشتراكه،
// ومحادثة الدعم. كل حاجة هنا محصورة على بيانات صاحب الحساب نفسه بس.
const express = require('express');

const Invitation = require('../models/Invitation');
const Rsvp = require('../models/Rsvp');
const SupportMessage = require('../models/SupportMessage');
const {
  voiceUpload, serializeMessage, previewOf, storeVoice, userVoiceFlood, adminOnline,
} = require('../utils/support');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const GuestPhoto = require('../models/GuestPhoto');
const GuestVoice = require('../models/GuestVoice');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../utils/sanitize');
const { ensureStatsToken } = require('../utils/statsPage');
const { computeUgcStats, CURRENCIES } = require('../utils/ugc');
const { getPackage, EDIT_WINDOW_DAYS } = require('../packages/registry');
const { editWindowInfo } = require('../utils/editWindow');
const { invitationHasAlbum } = require('../utils/guestPhotos');
const { invitationHasVoice } = require('../utils/guestVoices');

const router = express.Router();

// GET /api/dashboard — ملخص كامل للعميل
router.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ ownerId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('shortId templateId name statsToken brideNameAr groomNameAr brideName groomName weddingDateTime viewCount isPremium status createdAt guestExtras')
      .lean();

    const shortIds = invitations.map((i) => i.shortId);

    // عدد ردود الحضور لكل دعوة (استعلام واحد بدل استعلام لكل دعوة)
    const rsvpCounts = await Rsvp.aggregate([
      { $match: { shortId: { $in: shortIds } } },
      { $group: { _id: { shortId: '$shortId', attending: '$attending' }, count: { $sum: 1 } } },
    ]);

    // عدد صور الضيوف لكل دعوة (للقوالب اللي فيها ألبوم بس)
    const albumIds = invitations.filter(invitationHasAlbum).map((i) => i.shortId);
    const photoCounts = albumIds.length
      ? await GuestPhoto.aggregate([
        { $match: { shortId: { $in: albumIds } } },
        { $group: { _id: '$shortId', count: { $sum: 1 } } },
      ])
      : [];
    const photosByShortId = {};
    photoCounts.forEach((row) => { photosByShortId[row._id] = row.count; });

    // عدد التهاني الصوتية لكل دعوة (واللي صاحبها لسه ماسمعهاش) — للقوالب اللي بتدعمها بس
    const voiceIds = invitations.filter(invitationHasVoice).map((i) => i.shortId);
    const voiceCounts = voiceIds.length
      ? await GuestVoice.aggregate([
        { $match: { shortId: { $in: voiceIds } } },
        { $group: { _id: '$shortId', count: { $sum: 1 }, unheard: { $sum: { $cond: [{ $eq: [{ $ifNull: ['$heardAt', null] }, null] }, 1, 0] } } } },
      ])
      : [];
    const voicesByShortId = {};
    voiceCounts.forEach((row) => { voicesByShortId[row._id] = { count: row.count, unheard: row.unheard }; });

    const countsByShortId = {};
    rsvpCounts.forEach((row) => {
      const id = row._id.shortId;
      if (!countsByShortId[id]) countsByShortId[id] = { yes: 0, no: 0 };
      if (row._id.attending) countsByShortId[id].yes = row.count;
      else countsByShortId[id].no = row.count;
    });

    const sub = req.user.subscription || {};
    const pkg = sub.packageId ? getPackage(sub.packageId) : null;

    const totals = invitations.reduce(
      (acc, inv) => {
        acc.views += inv.viewCount || 0;
        const c = countsByShortId[inv.shortId] || { yes: 0, no: 0 };
        acc.rsvpYes += c.yes;
        acc.rsvpNo += c.no;
        return acc;
      },
      { views: 0, rsvpYes: 0, rsvpNo: 0 }
    );

    const unreadSupport = await SupportMessage.countDocuments({
      userId: req.user.id,
      from: 'admin',
      readByUser: false,
    });

    return res.json({
      // لو الحساب مسوّق (UGC)، الواجهة بتحوّل للوحة المسوّق بالكامل
      isUgc: !!req.user.isUgc,
      user: { name: req.user.name, email: req.user.email, country: req.user.country },
      subscription: {
        packageId: sub.packageId || null,
        packageName: pkg ? pkg.name : null,
        features: pkg ? pkg.features : [],
        invitationsLeft: sub.invitationsLeft || 0,
        activatedAt: sub.activatedAt || null,
        // مدة التعديل: مفتوحة لحد إمتى، ولسه مفتوحة ولا خلصت
        ...editWindowInfo(sub),
        editWindowDays: EDIT_WINDOW_DAYS,
      },
      totals: { invitations: invitations.length, ...totals },
      unreadSupport,
      invitations: invitations.map((inv) => ({
        shortId: inv.shortId,
        templateId: inv.templateId,
        // اسم الدعوة اللي حطه صاحبها (فاضي في الدعوات القديمة)
        name: inv.name || '',
        // رابط صفحة الإحصائيات السري لو اتولّد قبل كده (null لو لسه)
        statsPath: inv.statsToken ? `/s/${inv.statsToken}` : null,
        names: {
          ar: `${inv.brideNameAr || ''} & ${inv.groomNameAr || ''}`.trim(),
          en: `${inv.brideName || ''} & ${inv.groomName || ''}`.trim(),
        },
        weddingDate: inv.weddingDateTime,
        views: inv.viewCount || 0,
        rsvp: countsByShortId[inv.shortId] || { yes: 0, no: 0 },
        // ألبوم صور الضيوف: القالب بيدعمه؟ وكام صورة اترفعت
        album: invitationHasAlbum(inv)
          ? { photos: photosByShortId[inv.shortId] || 0 }
          : null,
        // التهاني الصوتية من الضيوف: كام واحدة، وكام واحدة لسه ماتسمعتش
        voices: invitationHasVoice(inv)
          ? voicesByShortId[inv.shortId] || { count: 0, unheard: 0 }
          : null,
        isPremium: !!inv.isPremium,
        // 'draft' = لسه متنشرتش (الدعوات القديمة مفيهاش الحقل ده أصلًا،
        // فبتتحسب منشورة زي ما هي بالظبط)
        isDraft: inv.status === 'draft',
        createdAt: inv.createdAt,
        url: `/i/${inv.shortId}`,
      })),
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// GET /api/dashboard/rsvps/:shortId — ردود الحضور بالتفصيل لدعوة واحدة
router.get('/api/dashboard/rsvps/:shortId', requireAuth, async (req, res) => {
  try {
    // بنتأكد إن الدعوة دي بتاعته فعلاً قبل ما نرجّع أي بيانات ضيوف
    const owns = await Invitation.exists({ shortId: req.params.shortId, ownerId: req.user.id });
    if (!owns) return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });

    const rsvps = await Rsvp.find({ shortId: req.params.shortId })
      .sort({ createdAt: -1 })
      .limit(500)
      .select('guestName attending note createdAt')
      .lean();

    return res.json({ rsvps });
  } catch (err) {
    console.error('Error loading rsvps:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// PATCH /api/dashboard/invitations/:shortId/name — تغيير اسم الدعوة (بيميّزها
// في اللوحة بس). بيشتغل على أي دعوة يملكها العميل، قديمة أو جديدة.
router.patch('/api/dashboard/invitations/:shortId/name', requireAuth, async (req, res) => {
  try {
    const name = sanitizeText((req.body || {}).name, 80);
    const result = await Invitation.updateOne(
      { shortId: req.params.shortId, ownerId: req.user.id },
      { $set: { name } }
    );
    if (!result.matchedCount) return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });
    return res.json({ name });
  } catch (err) {
    console.error('Error renaming invitation:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/invitations/:shortId/stats-link — بيرجّع رابط صفحة
// الإحصائيات السري للدعوة، وبيولّد التوكن أول مرة لو الدعوة قديمة ومالهاش
// واحد. بيتأكد إن الدعوة بتاعت العميل قبل ما يديله أي رابط.
router.post('/api/dashboard/invitations/:shortId/stats-link', requireAuth, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ shortId: req.params.shortId, ownerId: req.user.id });
    if (!invitation) return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });
    const token = await ensureStatsToken(invitation);
    return res.json({ statsPath: `/s/${token}` });
  } catch (err) {
    console.error('Error creating stats link:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// ===== لوحة المسوّق (UGC) =====
// كل ده لصاحب حساب UGC نفسه بس.
function requireUgc(req, res) {
  if (!req.user.isUgc || !req.user.referralCode) {
    res.status(403).json({ error: 'الحساب ده مش حساب تسويق.' });
    return false;
  }
  return true;
}

// GET /api/dashboard/ugc — كل بيانات لوحة المسوّق (إحصائيات + سحوباته)
router.get('/api/dashboard/ugc', requireAuth, async (req, res) => {
  try {
    if (!requireUgc(req, res)) return undefined;
    const stats = await computeUgcStats(req.user);
    const withdrawals = await Withdrawal.find({ ugcUserId: req.user.id })
      .sort({ createdAt: -1 }).limit(50).lean();
    return res.json({
      referralCode: req.user.referralCode,
      commissionRate: req.user.commissionRate || 0,
      payoutPhone: req.user.payoutPhone || '',
      stats,
      withdrawals: withdrawals.map((w) => ({
        id: String(w._id), amount: w.amount, currency: w.currency,
        status: w.status, createdAt: w.createdAt, resolvedAt: w.resolvedAt || null,
      })),
    });
  } catch (err) {
    console.error('Error loading ugc dashboard:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/ugc/payout-phone — حفظ رقم فودافون كاش بتاعه
router.post('/api/dashboard/ugc/payout-phone', requireAuth, async (req, res) => {
  try {
    if (!requireUgc(req, res)) return undefined;
    const phone = String((req.body || {}).phone || '')
      .replace(/[^\d+\-() ]/g, '').trim().slice(0, 30);
    await User.updateOne({ _id: req.user.id }, { $set: { payoutPhone: phone } });
    return res.json({ ok: true, payoutPhone: phone });
  } catch (err) {
    console.error('Error saving payout phone:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/ugc/withdraw — طلب سحب مبلغ من الرصيد المتاح
router.post('/api/dashboard/ugc/withdraw', requireAuth, async (req, res) => {
  try {
    if (!requireUgc(req, res)) return undefined;
    const currency = String((req.body || {}).currency || '');
    const amount = Number((req.body || {}).amount);
    if (!CURRENCIES.includes(currency)) return res.status(400).json({ error: 'العملة مش صحيحة.' });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'اكتب مبلغ صحيح.' });
    if (!req.user.payoutPhone) return res.status(400).json({ error: 'ضيف رقم فودافون كاش الأول.' });
    // بنعيد حساب المتاح لحظيًا (المعلّق داخل الحساب) عشان مايطلبش أكتر من رصيده
    const stats = await computeUgcStats(req.user);
    if (amount > stats.available[currency]) {
      return res.status(400).json({ error: `المبلغ أكبر من رصيدك المتاح (${stats.available[currency]}).` });
    }
    const w = await Withdrawal.create({
      ugcUserId: req.user.id, currency, amount, phone: req.user.payoutPhone, status: 'pending',
    });
    return res.status(201).json({ ok: true, id: String(w._id) });
  } catch (err) {
    console.error('Error requesting withdrawal:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// ===== الدعم =====
// الرسايل كلام أو فويس. "اتشافت" (✓✓) بتتعلّم لما الطرف التاني يفتح المحادثة.

// GET /api/dashboard/support/status — خفيف، الويدجت بيسأله كل شوية:
// كام رسالة من الدعم لسه ماشافهاش + الدعم متصل دلوقتي ولا لأ
router.get('/api/dashboard/support/status', requireAuth, async (req, res) => {
  try {
    const [unread, last] = await Promise.all([
      SupportMessage.countDocuments({ userId: req.user.id, from: 'admin', readByUser: false }),
      SupportMessage.findOne({ userId: req.user.id, from: 'admin', readByUser: false })
        .sort({ createdAt: -1 }).select('kind body createdAt').lean(),
    ]);
    return res.json({
      unread,
      adminOnline: adminOnline(),
      // معاينة آخر رسالة مش مقروءة (للفقاعة اللي بتطلع جنب الزرار)
      latest: last ? { id: String(last._id), preview: previewOf(last).slice(0, 140), createdAt: last.createdAt } : null,
    });
  } catch (err) {
    console.error('Error loading support status:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// GET /api/dashboard/support — المحادثة. بتتعلّم مقروءة إلا لو ?peek=1
router.get('/api/dashboard/support', requireAuth, async (req, res) => {
  try {
    const messages = await SupportMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    messages.reverse();

    if (req.query.peek !== '1') {
      await SupportMessage.updateMany(
        { userId: req.user.id, from: 'admin', readByUser: false },
        { $set: { readByUser: true, readAt: new Date() } }
      );
    }

    return res.json({ messages: messages.map(serializeMessage), adminOnline: adminOnline() });
  } catch (err) {
    console.error('Error loading support thread:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/support — العميل يبعت رسالة
router.post('/api/dashboard/support', requireAuth, async (req, res) => {
  try {
    const body = sanitizeText(req.body && req.body.body, 2000);
    if (!body) return res.status(400).json({ error: 'اكتب رسالتك الأول.' });
    const recent = await SupportMessage.countDocuments({
      userId: req.user.id, from: 'user', createdAt: { $gte: new Date(Date.now() - 3600 * 1000) },
    });
    if (recent >= 80) return res.status(429).json({ error: 'بعت رسايل كتير — استنى شوية وهنرد عليك.' });

    const msg = await SupportMessage.create({
      userId: req.user.id, from: 'user', kind: 'text', body, readByUser: true,
    });
    return res.status(201).json({ message: serializeMessage(msg) });
  } catch (err) {
    console.error('Error sending support message:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/support/voice — العميل يبعت فويس
router.post('/api/dashboard/support/voice', requireAuth, (req, res, next) => {
  voiceUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'الفويس كبير — سجّل أقصر.' : 'الفويس ماوصلش، جرّب تاني.' });
    return next();
  });
}, async (req, res) => {
  try {
    if (await userVoiceFlood(req.user.id)) {
      return res.status(429).json({ error: 'بعت فويسات كتير — استنى شوية وهنرد عليك.' });
    }
    const v = await storeVoice(req.file, {
      folder: `mithaq/support-voices/${req.user.id}`,
      claimed: req.body && req.body.duration,
      where: 'upload-support-voice', path: req.originalUrl,
    });
    if (v.error) return res.status(v.status).json({ error: v.error });
    const msg = await SupportMessage.create({
      userId: req.user.id, from: 'user', kind: 'voice', body: '',
      voice: { url: v.url, publicId: v.publicId, duration: v.duration }, readByUser: true,
    });
    return res.status(201).json({ message: serializeMessage(msg) });
  } catch (err) {
    console.error('Error sending support voice:', err);
    return res.status(500).json({ error: 'الفويس مابعتش، جرّب تاني.' });
  }
});

module.exports = router;
