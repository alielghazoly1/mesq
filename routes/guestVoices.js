// routes/guestVoices.js
// التهاني الصوتية: الضيف بيسجّل تهنئة بصوته من جوه الدعوة (زي فويس الواتساب)
// وهي بتوصل لصاحب الدعوة في لوحته يسمعها وينزّلها. **خاصة بصاحب الدعوة**:
// مبتتعرضش في الدعوة لأي حد ومفيش أي مسار عام بيرجّعها.
//
// الحماية:
//  • الملف بيتفحص بمحتواه الحقيقي (أول بايتات) إنه صوت، وبيتعاد ترميزه
//    على Cloudinary لـ mp3 (أي حاجة مدسوسة جواه بتضيع).
//  • حدود: مدة (75 ثانية)، حجم (6MB)، تهاني لكل جهاز على الدعوة، تهاني للدعوة
//    كلها، وتهاني في الساعة لكل جهاز.
//  • السماع والتنزيل والمسح: لصاحب الدعوة بس.
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const Invitation = require('../models/Invitation');
const GuestVoice = require('../models/GuestVoice');
const { getCloudinary, isCloudinaryReady } = require('../config/cloudinary');
const { uploadBuffer } = require('../utils/cloudinaryUpload');
const { sanitizeText } = require('../utils/sanitize');
const { requireAuth } = require('../middleware/auth');
const { ensureDeviceId, guestVoiceLimiter } = require('../middleware/deviceLimiter');
const {
  MAX_PER_GUEST, MAX_PER_INVITATION, MAX_SECONDS, MIN_SECONDS, MAX_VOICE_BYTES,
  sniffAudio, serializeVoice, voiceTag, templateHasVoice, voiceEnabled,
} = require('../utils/guestVoices');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VOICE_BYTES, files: 1, fields: 4 },
});

const PAGE_SIZE_MAX = 60;

/** مسح الملف من Cloudinary — فشله مايوقفش مسح السجل */
async function destroyRemote(publicId) {
  if (!publicId || !isCloudinaryReady()) return;
  try {
    await getCloudinary().uploader.destroy(publicId, { resource_type: 'video', invalidate: true });
  } catch (err) {
    console.error('Guest voice remote delete failed:', publicId, err && err.message);
  }
}

// ================= الضيوف (من جوه الدعوة) =================

// POST /i/:shortId/voice — ضيف بيبعت تهنئة صوتية
router.post(
  '/i/:shortId/voice',
  ensureDeviceId,
  guestVoiceLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      const invitation = await Invitation.findOne({
        shortId: String(req.params.shortId || ''), status: { $ne: 'draft' },
      }).select('_id shortId templateId hiddenSections').lean();
      if (!invitation || !voiceEnabled(invitation)) {
        return res.status(404).json({ error: 'التهاني الصوتية مش متاحة في الدعوة دي.' });
      }
      if (!isCloudinaryReady()) {
        return res.status(503).json({ error: 'الإرسال مش متاح دلوقتي، جرّب بعد شوية.' });
      }
      if (!req.file) return res.status(400).json({ error: 'سجّل تهنئتك الأول.' });

      const check = sniffAudio(req.file.buffer);
      if (!check.ok) return res.status(400).json({ error: check.error });

      const claimed = Number(req.body && req.body.duration);
      if (Number.isFinite(claimed) && claimed > MAX_SECONDS) {
        return res.status(400).json({ error: 'التهنئة أطول من دقيقة — سجّل أقصر.' });
      }

      const deviceId = req.deviceId || null;
      const [mine, all] = await Promise.all([
        deviceId ? GuestVoice.countDocuments({ shortId: invitation.shortId, deviceId }) : 0,
        GuestVoice.countDocuments({ shortId: invitation.shortId }),
      ]);
      if (mine >= MAX_PER_GUEST) {
        return res.status(400).json({ error: `وصلت لأقصى عدد تهاني (${MAX_PER_GUEST}) — شكرًا لمحبتك 🤍` });
      }
      if (all >= MAX_PER_INVITATION) {
        return res.status(400).json({ error: 'صندوق التهاني اتملى — مش ممكن نستقبل تهاني تانية.' });
      }

      const result = await uploadBuffer(req.file.buffer, {
        folder: `mithaq/guest-voices/${invitation.shortId}`,
        // الصوت عند Cloudinary من نوع "video"
        resource_type: 'video',
        tags: [voiceTag(invitation.shortId)],
        // بنخزّنه mp3: بيشتغل على أي موبايل (سفاري مابيشغّلش WebM القديم)،
        // وإعادة الترميز بتشيل أي حاجة مدسوسة في الملف
        format: 'mp3',
      }, { where: 'upload-guest-voice', path: req.originalUrl });

      const seconds = Number(result.duration) || (Number.isFinite(claimed) ? claimed : 0);
      if (seconds > MAX_SECONDS || (Number(result.duration) && seconds < MIN_SECONDS)) {
        await destroyRemote(result.public_id);
        return res.status(400).json({
          error: seconds > MAX_SECONDS ? 'التهنئة أطول من دقيقة — سجّل أقصر.' : 'التسجيل قصير جدًا — سجّل تاني.',
        });
      }

      const voice = await GuestVoice.create({
        shortId: invitation.shortId,
        url: result.secure_url,
        publicId: result.public_id,
        duration: Math.round(Math.max(0, seconds) * 10) / 10,
        bytes: result.bytes || req.file.size || 0,
        guestName: sanitizeText(req.body && req.body.guestName, 60),
        deviceId,
      });

      // من غير أي رابط — التهنئة لصاحب الدعوة بس
      return res.status(201).json({ ok: true, id: String(voice._id) });
    } catch (err) {
      console.error('Guest voice upload failed:', err);
      return res.status(500).json({ error: 'الإرسال فشل، حاول تاني.' });
    }
  }
);

// ================= صاحب الدعوة (لوحته) =================

async function ownedInvitation(req) {
  return Invitation.findOne({ shortId: String(req.params.shortId || ''), ownerId: req.user.id })
    .select('_id shortId templateId hiddenSections')
    .lean();
}

// GET /api/dashboard/invitations/:shortId/voices — التهاني بالأحدث الأول
router.get('/api/dashboard/invitations/:shortId/voices', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });
    const n = Math.max(1, Math.min(PAGE_SIZE_MAX, parseInt(req.query.limit, 10) || 30));
    const query = { shortId: invitation.shortId };
    if (req.query.before && mongoose.isValidObjectId(req.query.before)) {
      query._id = { $lt: new mongoose.Types.ObjectId(String(req.query.before)) };
    }
    const [rows, total, unheard] = await Promise.all([
      GuestVoice.find(query).sort({ _id: -1 }).limit(n + 1).lean(),
      GuestVoice.countDocuments({ shortId: invitation.shortId }),
      GuestVoice.countDocuments({ shortId: invitation.shortId, heardAt: null }),
    ]);
    const hasMore = rows.length > n;
    const page = hasMore ? rows.slice(0, n) : rows;
    return res.json({
      voices: page.map(serializeVoice),
      total,
      unheard,
      nextCursor: hasMore ? String(page[page.length - 1]._id) : null,
      enabled: voiceEnabled(invitation),
      supported: templateHasVoice(invitation.templateId),
    });
  } catch (err) {
    console.error('Error loading owner voices:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/invitations/:shortId/voices/:id/heard — صاحب الدعوة سمعها
router.post('/api/dashboard/invitations/:shortId/voices/:id/heard', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'التهنئة دي مش موجودة.' });
    }
    await GuestVoice.updateOne(
      { _id: req.params.id, shortId: invitation.shortId, heardAt: null },
      { $set: { heardAt: new Date() } }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('Mark voice heard failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// DELETE /api/dashboard/invitations/:shortId/voices/:id — صاحب الدعوة بيمسح تهنئة
router.delete('/api/dashboard/invitations/:shortId/voices/:id', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'التهنئة دي مش موجودة.' });
    }
    const voice = await GuestVoice.findOne({ _id: req.params.id, shortId: invitation.shortId }).lean();
    if (!voice) return res.status(404).json({ error: 'التهنئة دي مش موجودة.' });
    await GuestVoice.deleteOne({ _id: voice._id });
    await destroyRemote(voice.publicId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Owner voice delete failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// GET /api/dashboard/invitations/:shortId/voices/zip — "نزّل الكل": Cloudinary
// بيجمع التهاني في ملف zip واحد. الرابط موقّع ومؤقت فبيتولّد مع كل ضغطة.
router.get('/api/dashboard/invitations/:shortId/voices/zip', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation || !isCloudinaryReady()) return res.status(404).send('Not found');
    const url = getCloudinary().utils.download_zip_url({
      tags: [voiceTag(invitation.shortId)],
      resource_type: 'video',
      flatten_folders: true,
      target_public_id: `mithaq-voices-${invitation.shortId}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    return res.redirect(302, url);
  } catch (err) {
    console.error('Voices zip failed:', err);
    return res.status(500).send('حصل خطأ في السيرفر');
  }
});

// multer بيرمي أخطاء خاصة (حجم/عدد) — رسالة مفهومة للضيف بدل خطأ غامض
router.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'التسجيل كبير جدًا — سجّل تهنئة أقصر.' });
  }
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: 'الملف مرفوض.' });
  }
  return next(err);
});

module.exports = router;
