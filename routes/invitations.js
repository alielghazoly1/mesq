// routes/invitations.js
const express = require('express');

const Invitation = require('../models/Invitation');
const Rsvp = require('../models/Rsvp');
const User = require('../models/User');
const { sanitizeText } = require('../utils/sanitize');
const { generateShortId } = require('../utils/idGenerator');
const { renderNewPathHtml, renderLegacyHtml } = require('../utils/renderInvitation');
const { renderStatsPage } = require('../utils/renderStats');
const { generateStatsToken } = require('../utils/statsToken');
const { buildInvitationDataFromRequest, hasActivePackage } = require('../utils/invitationData');
const { isEditWindowOpen, editWindowEndedBody } = require('../utils/editWindow');
const { freeQuotaFor, hashIp } = require('../middleware/freeQuota');
const SiteTotals = require('../models/SiteTotals');
const { getTemplate, TEMPLATES } = require('../templates/registry');
const { localizeTemplate } = require('../templates/i18n');
const { ensureDeviceId, rsvpLimiter } = require('../middleware/deviceLimiter');

const router = express.Router();

// GET /api/templates — القوالب المتاحة (الفورم بيبني نفسه منها تلقائيًا)
router.get('/api/templates', (req, res) => {
  // ?lang=ar|en — بترجّع أسماء الأقسام والحقول والوصف باللغة المطلوبة
  const publicList = TEMPLATES.map((t) => localizeTemplate(t, req.query.lang));
  res.json(publicList);
});

// GET /api/public-stats — أرقام حقيقية آمنة (مفيش أي بيانات شخصية) بتتعرض
// للزوار في الصفحة الرئيسية (عدد الدعوات، عدد المشاهدات، عدد المستخدمين).
// متكاشة لمدة قصيرة عشان آلاف الزيارات على الصفحة الرئيسية ما تضغطش على
// قاعدة البيانات في كل مرة.
let publicStatsCache = { data: null, expiresAt: 0 };
router.get('/api/public-stats', async (req, res) => {
  try {
    const now = Date.now();
    if (publicStatsCache.data && publicStatsCache.expiresAt > now) {
      return res.json(publicStatsCache.data);
    }

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
    publicStatsCache = { data, expiresAt: now + 30 * 1000 }; // كاش لمدة 30 ثانية
    return res.json(data);
  } catch (err) {
    console.error('Error fetching public stats:', err);
    // في أسوأ الأحوال بنرجع أصفار بدل ما نكسر تحميل الصفحة الرئيسية
    return res.json({ totalInvitations: 0, totalViews: 0, totalUsers: 0 });
  }
});

// POST /api/preview — معاينة حية للتصميم الحقيقي، من غير أي حفظ في قاعدة البيانات
router.post('/api/preview', async (req, res) => {
  try {
    const data = await buildInvitationDataFromRequest(req.body || {}, { skipMapNetwork: true, user: req.user });
    // المعاينة الحية توري نفس فتحة الدعوات الجديدة — Royal Maroon بغلاف
    // المظروف بالفيديو (الدعوات القديمة المشاركة مالهاش الحقل ده فتفضل زيها).
    if (data.templateId === 'royal-maroon') data.coverStyle = 'envelope';
    const html = renderNewPathHtml(data);
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    if (err.status) return res.status(err.status).send('');
    console.error('Error building preview:', err);
    return res.status(500).send('');
  }
});

// GET /api/free-quota — رصيد الدعوات المجانية اليومي للجهاز ده.
// الفورم بيعرضه للعميل قبل ما يملا، فمحدش بيتفاجئ في الآخر.
router.get('/api/free-quota', async (req, res) => {
  try {
    if (hasActivePackage(req.user)) {
      return res.json({ subscribed: true, limit: 0, used: 0, remaining: 0, resetsInHours: 0 });
    }
    const q = await freeQuotaFor(req.deviceId, req.user && req.user.id);
    return res.json({
      subscribed: false,
      limit: q.limit,
      used: Math.min(q.used, q.limit),
      remaining: q.blocked ? 0 : q.remaining,
      resetsInHours: Math.max(1, Math.ceil(q.resetsInMs / 3600000)),
    });
  } catch (err) {
    console.error('Error reading free quota:', err);
    // مش سبب نوقف الفورم — بنرجّع الحد الكامل ونسيب السيرفر يحكم عند الإنشاء
    return res.json({ subscribed: false, limit: 3, used: 0, remaining: 3, resetsInHours: 24 });
  }
});

// POST /api/invitations — إنشاء دعوة فعلية (بتتحفظ في قاعدة البيانات).
//
// كل القوالب بباقة: مفيش إنشاء مجاني تاني. الفحص هنا قبل أي شغل تاني
// (التحقق من الفورم ولا جلب لينك الخريطة)، وبرسالة وكود واضحين عشان
// الواجهة توديه لصفحة الباقات. الدعوات القديمة المجانية مش متأثرة:
// عرضها وتعديلها وتنضيفها مالهمش علاقة بالمسار ده.
function requireSubscriber(req, res, next) {
  // بصمة الشبكة بتتخزن على الدعوة للمتابعة بس (اقرا middleware/freeQuota.js)
  req.ipHash = hashIp(req.ip);
  if (!req.user) {
    return res.status(401).json({
      code: 'AUTH_REQUIRED',
      error: 'سجّل دخول الأول عشان تعمل دعوة.',
    });
  }
  if (!hasActivePackage(req.user)) {
    return res.status(403).json({
      code: 'SUBSCRIPTION_REQUIRED',
      error: 'إنشاء الدعوات بقى بباقة — اختار الباقة المناسبة وابدأ.',
    });
  }
  if (!isEditWindowOpen(req.user.subscription)) {
    return res.status(403).json(editWindowEndedBody(req.user.subscription));
  }
  return next();
}

async function refundCredit(userId) {
  try {
    await User.updateOne({ _id: userId }, { $inc: { 'subscription.invitationsLeft': 1 } });
  } catch (e) {
    console.error('Credit refund failed for user', userId, e);
  }
}

router.post('/api/invitations', requireSubscriber, async (req, res) => {
  let consumedCredit = false;
  try {
    const data = await buildInvitationDataFromRequest(req.body || {}, { user: req.user });

    // بنستهلك دعوة واحدة من رصيد الباقة، والدعوة بتبقى "مميزة" (يقدر يفتح
    // المحرر عليها بعدين). الشرط (الرصيد > 0) جوه الاستعلام نفسه: لو بعت
    // طلبين في نفس اللحظة مايستهلكش أكتر من رصيده. ولو الخصم فشل، بنرفض —
    // مافيش دعوة بتتعمل من غير رصيد أبدًا (قبل كده كانت بتتعمل "مجانية").
    const consumed = await User.findOneAndUpdate(
      { _id: req.user.id, 'subscription.status': { $ne: 'suspended' }, 'subscription.invitationsLeft': { $gt: 0 } },
      { $inc: { 'subscription.invitationsLeft': -1 } },
      { new: true }
    );
    if (!consumed) {
      return res.status(403).json({
        code: 'SUBSCRIPTION_REQUIRED',
        error: 'مافيش رصيد دعوات في باقتك — اختار باقة عشان تكمّل.',
      });
    }
    consumedCredit = true;
    const ownerId = req.user.id;
    const isPremium = true;

    let invitation = null;
    let attempts = 0;
    while (!invitation && attempts < 5) {
      attempts += 1;
      const shortId = generateShortId(7);
      try {
        invitation = await Invitation.create({
          shortId,
          creatorDeviceId: req.deviceId || null,
          // بصمة الشبكة — بتتحسب في فحص الرصيد، وبتتخزن هنا عشان
          // الفحص اللي بعده يعرف يعدّ. مفيش عنوان حقيقي بيتخزن.
          creatorIpHash: req.ipHash || null,
          ownerId,
          isPremium,
          ...data,
        });
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }

    if (!invitation) {
      await refundCredit(req.user.id);
      return res.status(500).json({ error: 'حصل خطأ في توليد اللينك، حاول تاني.' });
    }

    return res.status(201).json({
      id: invitation.shortId,
      path: `/i/${invitation.shortId}`,
      isPremium: invitation.isPremium,
    });
  } catch (err) {
    // الرصيد اتخصم والدعوة ماتحفظتش؟ نرجّعه — العميل دفع فلوس، مايضيعش منه
    if (consumedCredit) await refundCredit(req.user.id);
    if (err.status) return res.status(err.status).json({ error: err.message, ...(err.code ? { code: err.code } : {}) });
    console.error('Error creating invitation:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

// GET /i/:shortId — عرض دعوة (دعوات قديمة بدون templateId بتتعرض بالتصميم
// الأصلي حرفيًا، من غير أي تغيير)
router.get('/i/:shortId', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ shortId: req.params.shortId });

    const isOwner = !!invitation && !!req.user && !!invitation.ownerId
      && String(invitation.ownerId) === req.user.id;

    // المسودة (دعوة اتفتحت في المحرر ولسه متنشرتش) بتبان لصاحبها بس —
    // لأي حد تاني هي "مش موجودة" بالظبط زي أي لينك غلط، من غير ما نلمّح
    // إنها موجودة فعلاً.
    if (!invitation || (invitation.status === 'draft' && !isOwner)) {
      return res
        .status(404)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send(
          '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">' +
          '<body style="font-family:sans-serif;text-align:center;margin-top:15%;color:#444">' +
          '<h1>الدعوة دي مش موجودة</h1><p>تأكد إن اللينك متنسوخ صح.</p></body></html>'
        );
    }

    // ?edit=1 بيشغّل المحرر — بس لصاحب الدعوة، ولو الدعوة مميزة، ولو مدة
    // التعديل لسه مفتوحة. أي حد تاني (أو صاحبها بعد المدة) بيشوف الدعوة
    // عادي من غير أي أدوات تحرير — والدعوة نفسها بتفضل شغالة.
    const editMode = req.query.edit === '1' && isOwner && invitation.isPremium
      && isEditWindowOpen(req.user.subscription);
    // ?stage= بيتحكم في وضع العرض داخل الـiframe:
    //   cover  → الغلاف يفضل ظاهر (autoOpen=false) — التليفون الشمال
    //   inside → الغلاف بيتخطّى تلقائيًا (autoOpen=true) — التليفون اليمين
    //   بدون   → السلوك العادي (autoOpen يتحدد من editMode/data)
    // بيشتغل مع editMode بس — الضيف مش عنده stage.
    const stage = editMode && ['cover', 'inside'].includes(String(req.query.stage || ''))
      ? String(req.query.stage) : '';

    // عدّاد المشاهدات للضيوف بس — صاحب الدعوة وهو بيعدّل مايزوّدش أرقامه
    // بنفسه (بيفتح ويقفل عشرات المرات وهو شغال).
    if (!editMode) {
      Invitation.updateOne({ _id: invitation._id }, { $inc: { viewCount: 1 } }).catch(() => {});
    }

    // اللينك الكامل — بيتحط في كارت المشاركة عشان واتساب يعرف يرجّع
    // للصفحة نفسها لما حد يضغط على الكارت
    const pageUrl = `${req.protocol}://${req.get('host')}/i/${invitation.shortId}`;

    const html = invitation.templateId
      ? renderNewPathHtml(invitation, { editMode, pageUrl, stage })
      : renderLegacyHtml(invitation);

    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    console.error('Error rendering invitation:', err);
    return res.status(500).send('حصل خطأ في السيرفر');
  }
});

// POST /i/:shortId/rsvp — ضيف بيبعت تأكيد حضوره على دعوة معينة. عام بدون
// أي تسجيل دخول (زي أي RSVP حقيقي)، بس محدود بمعدّل لكل جهاز عشان يصعب
// إغراق دعوة معينة بردود وهمية.
router.post('/i/:shortId/rsvp', ensureDeviceId, rsvpLimiter, async (req, res) => {
  try {
    // $ne بدل status:'published' عن قصد: الدعوات القديمة مفيهاش الحقل ده
    // أصلًا في قاعدة البيانات، فأي مقارنة بالتساوي هتستبعدها بالغلط.
    const invitationExists = await Invitation.exists({
      shortId: req.params.shortId,
      status: { $ne: 'draft' },
    });
    if (!invitationExists) {
      return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });
    }

    const guestName = sanitizeText(req.body && req.body.guestName, 80);
    if (!guestName) {
      return res.status(400).json({ error: 'من فضلك اكتب اسمك.' });
    }

    const rawAttending = req.body && req.body.attending;
    let attending;
    if (rawAttending === true || rawAttending === 'yes' || rawAttending === 'true') attending = true;
    else if (rawAttending === false || rawAttending === 'no' || rawAttending === 'false') attending = false;
    else return res.status(400).json({ error: 'من فضلك حدد هتحضر ولا لأ.' });

    const note = sanitizeText(req.body && req.body.note, 200);

    await Rsvp.create({
      shortId: req.params.shortId,
      guestName,
      attending,
      note,
      deviceId: req.deviceId || null,
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Error saving RSVP:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});


// لأنها مش زيارة فعلية للدعوة نفسها)
// بيجمّع إحصائيات الدعوة ويطبع صفحة التقرير الشيك (utils/renderStats.js).
// مشترك بين اللينك السري (/s/:token) واللينك القديم (/i/:shortId/stats).
async function sendStatsPage(req, res, invitation) {
  const [rsvpCountsAgg, rsvpList] = await Promise.all([
    Rsvp.aggregate([
      { $match: { shortId: invitation.shortId } },
      { $group: { _id: '$attending', count: { $sum: 1 } } },
    ]),
    Rsvp.find({ shortId: invitation.shortId }).sort({ createdAt: -1 }).limit(300).lean(),
  ]);
  let rsvpYes = 0;
  let rsvpNo = 0;
  for (const row of rsvpCountsAgg) {
    if (row._id === true) rsvpYes = row.count;
    else if (row._id === false) rsvpNo = row.count;
  }
  const template = getTemplate(invitation.templateId);
  const html = renderStatsPage({
    invitation,
    templateName: template ? template.name : '',
    rsvpYes,
    rsvpNo,
    rsvpList,
    pageUrl: invitation.statsToken
      ? `${req.protocol}://${req.get('host')}/s/${encodeURIComponent(invitation.statsToken)}`
      : '',
  });
  res.set('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}

function statsNotFound(res) {
  return res
    .status(404)
    .set('Content-Type', 'text/html; charset=utf-8')
    .send(
      '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">'
      + '<body style="font-family:sans-serif;text-align:center;margin-top:15%;color:#444">'
      + '<h1>التقرير ده مش موجود</h1></body></html>'
    );
}

// GET /s/:statsToken — صفحة تقرير الدعوة العامة (لينك سري يتشارك).
// عامة بدون تسجيل دخول: صاحب الدعوة بيشاركها مع عميله. اللي بيحمي
// البيانات هو إن التوكن نفسه سري وغير قابل للتخمين، مش تسجيل الدخول.
router.get('/s/:statsToken', async (req, res) => {
  try {
    const token = String(req.params.statsToken || '');
    // فحص شكل بسيط قبل ما نضرب الداتابيز (حروف/أرقام بس)
    if (!/^[A-Za-z0-9]{10,64}$/.test(token)) return statsNotFound(res);
    const invitation = await Invitation.findOne({ statsToken: token });
    if (!invitation) return statsNotFound(res);
    return await sendStatsPage(req, res, invitation);
  } catch (err) {
    console.error('Error rendering stats page:', err);
    return res.status(500).send('حصل خطأ في السيرفر');
  }
});

// GET /i/:shortId/stats — اللينك القديم. بيحوّل للينك السري الجديد عشان
// اللي حفظه قبل كده يفضل شغال، واللينك اللي بيتشارك يبقى واحد بس.
router.get('/i/:shortId/stats', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ shortId: req.params.shortId });
    if (!invitation) return statsNotFound(res);
    if (!invitation.statsToken) {
      invitation.statsToken = await generateStatsToken(Invitation);
      await invitation.save();
    }
    return res.redirect(302, `/s/${encodeURIComponent(invitation.statsToken)}`);
  } catch (err) {
    console.error('Error redirecting to stats page:', err);
    return res.status(500).send('حصل خطأ في السيرفر');
  }
});

// GET /preview-sample/:templateId — معاينة القالب ببيانات وهمية جاهزة (زرار
// "شوف شكل الدعوة" في معرض القوالب)، بدون أي حفظ ومن غير ما يحتاج المستخدم
// يفتح الفورم أصلًا.
router.get('/preview-sample/:templateId', (req, res) => {
  const template = getTemplate(req.params.templateId);
  if (!template) return res.status(404).send('القالب ده مش موجود');
  // المعاينة مفتوحة للكل حتى في التصاميم المدفوعة — الناس لازم تشوف
  // اللي هتدفع فيه قبل ما تدفع. المقفول هو **الإنشاء**
  // (utils/invitationData.js: assertPremiumTemplateAccess).

  const now = new Date();
  const sampleDate = new Date(now.getFullYear(), now.getMonth() + 2, 15, 18, 0, 0);
  const timeline = template.timelineStages.map((key, i) => ({ key, hour: 17 + i }));

  const data = {
    templateId: template.id,
    language: 'ar',
    occasionType: 'wedding',
    hiddenSections: [],
    timeline,
    brideName: 'Amira', groomName: 'Yusuf',
    brideNameAr: 'أميرة', groomNameAr: 'يوسف',
    venueName: 'قاعة النموذج', venueCity: 'القاهرة، مصر',
    venueMapQuery: '', venueMapEmbedSrc: 'https://www.google.com/maps?q=Cairo&output=embed',
    venueMapDirectLink: 'https://www.google.com/maps/search/?api=1&query=Cairo',
    contactName: '', contactPhone: '', venueAddress: '',
    weddingDateTime: sampleDate,
    // اتقرر إن المعاينة تفضل بشاشة الغلاف الطبيعية من غير فتح تلقائي
    autoOpen: false,
    // معاينة القالب لازم توري نفس فتحة الدعوات الجديدة — Royal Maroon
    // بغلاف المظروف بالفيديو (الدعوات القديمة المشاركة مالهاش الحقل ده).
    coverStyle: template.id === 'royal-maroon' ? 'envelope' : '',
  };

  const html = renderNewPathHtml(data);
  res.set('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

module.exports = router;
