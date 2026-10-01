// routes/guestPhotos.js
// ألبوم صور الضيوف: الضيوف بيرفعوا صور الفرح من جوه الدعوة نفسها (من غير
// حساب)، وكل ضيف يقدر يمسح صوره هو بس. صاحب الدعوة بيشوف الألبوم كله في
// لوحته، يمسح أي صورة، ويبعت لينك سري لصفحة الألبوم (/a/:token) يقدر أي
// حد معاه يشوف الصور وينزّلها بجودتها الأصلية.
//
// الحماية:
//  • الملف بيتفحص بمحتواه الحقيقي (utils/uploadSecurity.js) وبيتعاد ترميزه
//    على Cloudinary — زي باقي الرفع في الموقع بالظبط.
//  • حدود: صور لكل ضيف، صور للألبوم كله، وصور في الساعة لكل جهاز.
//  • المسح: الضيف بمفتاحه (السيرفر شايل بصمته بس)، أو صاحب الدعوة.
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const Invitation = require('../models/Invitation');
const GuestPhoto = require('../models/GuestPhoto');
const { getCloudinary, isCloudinaryReady } = require('../config/cloudinary');
const { validateImage, MAX_IMAGE_BYTES } = require('../utils/uploadSecurity');
const { sanitizeText } = require('../utils/sanitize');
const { requireAuth } = require('../middleware/auth');
const { ensureDeviceId, guestPhotoLimiter } = require('../middleware/deviceLimiter');
const {
  MAX_PER_GUEST, MAX_PER_ALBUM, MAX_STORED_SIDE,
  isValidGuestKey, hashGuestKey, serializePhoto, albumTag, albumEnabled, templateHasAlbum,
  ensureAlbumToken,
} = require('../utils/guestPhotos');
const { buildAlbumPage, albumNotFoundPage } = require('../utils/albumPage');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 4 },
});

const PAGE_SIZE_MAX = 60;

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

/** مسح الملف من Cloudinary — فشله مايوقفش مسح السجل (الصورة اتشالت من الألبوم خلاص) */
async function destroyRemote(publicId) {
  if (!publicId || !isCloudinaryReady()) return;
  try {
    await getCloudinary().uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.error('Guest photo remote delete failed:', publicId, err && err.message);
  }
}

function readGuestKeyHash(req) {
  const key = String(req.get('X-Guest-Key') || '');
  return isValidGuestKey(key) ? hashGuestKey(key) : null;
}

/** صفحة من صور الألبوم بالأحدث الأول. before = id آخر صورة في الصفحة اللي فاتت */
async function loadPage(shortId, { limit, before }) {
  const n = Math.max(1, Math.min(PAGE_SIZE_MAX, parseInt(limit, 10) || 30));
  const query = { shortId };
  if (before && mongoose.isValidObjectId(before)) query._id = { $lt: new mongoose.Types.ObjectId(before) };
  const [rows, total] = await Promise.all([
    GuestPhoto.find(query).sort({ _id: -1 }).limit(n + 1).lean(),
    GuestPhoto.countDocuments({ shortId }),
  ]);
  const hasMore = rows.length > n;
  const page = hasMore ? rows.slice(0, n) : rows;
  return { page, total, nextCursor: hasMore ? String(page[page.length - 1]._id) : null };
}

/** الدعوة المنشورة اللي ألبومها شغّال (أو null) */
async function findAlbumInvitation(shortId) {
  const invitation = await Invitation.findOne({ shortId: String(shortId || ''), status: { $ne: 'draft' } })
    .select('_id shortId templateId hiddenSections ownerId')
    .lean();
  return invitation && albumEnabled(invitation) ? invitation : null;
}

// ================= الضيوف (من جوه الدعوة) =================

// GET /i/:shortId/photos — صور الألبوم (عامة لأي حد معاه لينك الدعوة)
router.get('/i/:shortId/photos', async (req, res) => {
  try {
    const invitation = await findAlbumInvitation(req.params.shortId);
    if (!invitation) return res.status(404).json({ error: 'الألبوم ده مش موجود.' });
    const viewer = readGuestKeyHash(req);
    const { page, total, nextCursor } = await loadPage(invitation.shortId, req.query);
    res.set('Cache-Control', 'no-store');
    return res.json({ photos: page.map((p) => serializePhoto(p, viewer)), total, nextCursor });
  } catch (err) {
    console.error('Error listing guest photos:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /i/:shortId/photos — ضيف بيرفع صورة
router.post(
  '/i/:shortId/photos',
  ensureDeviceId,
  guestPhotoLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      const keyHash = readGuestKeyHash(req);
      if (!keyHash) return res.status(400).json({ error: 'افتح الدعوة من تاني وجرّب.' });

      const invitation = await findAlbumInvitation(req.params.shortId);
      if (!invitation) return res.status(404).json({ error: 'الألبوم ده مش موجود.' });

      if (!isCloudinaryReady()) {
        return res.status(503).json({ error: 'رفع الصور مش متاح دلوقتي، جرّب بعد شوية.' });
      }
      if (!req.file) return res.status(400).json({ error: 'اختار صورة الأول.' });

      const [mine, all] = await Promise.all([
        GuestPhoto.countDocuments({ shortId: invitation.shortId, guestKeyHash: keyHash }),
        GuestPhoto.countDocuments({ shortId: invitation.shortId }),
      ]);
      if (mine >= MAX_PER_GUEST) {
        return res.status(400).json({ error: `وصلت لأقصى عدد صور لكل ضيف (${MAX_PER_GUEST} صورة).` });
      }
      if (all >= MAX_PER_ALBUM) {
        return res.status(400).json({ error: 'الألبوم اتملى — مش ممكن نضيف صور تانية.' });
      }

      const check = await validateImage(req.file.buffer);
      if (!check.ok) return res.status(400).json({ error: check.error });

      const result = await uploadBuffer(req.file.buffer, {
        folder: `mithaq/guest-photos/${invitation.shortId}`,
        resource_type: 'image',
        tags: [albumTag(invitation.shortId)],
        // إعادة ترميز (بتشيل أي حاجة مدسوسة) بأعلى جودة — دي صور فرح
        // الناس هتطبعها وتحتفظ بيها، مش مصغّرات
        transformation: [{
          width: MAX_STORED_SIDE, height: MAX_STORED_SIDE, crop: 'limit', quality: 'auto:best',
        }],
        format: check.mime === 'image/png' ? 'png' : 'jpg',
      });

      const photo = await GuestPhoto.create({
        shortId: invitation.shortId,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width || 0,
        height: result.height || 0,
        bytes: result.bytes || 0,
        guestName: sanitizeText(req.body && req.body.guestName, 60),
        guestKeyHash: keyHash,
        deviceId: req.deviceId || null,
      });

      return res.status(201).json({ photo: serializePhoto(photo.toObject(), keyHash) });
    } catch (err) {
      console.error('Guest photo upload failed:', err);
      return res.status(500).json({ error: 'الرفع فشل، حاول تاني.' });
    }
  }
);

// DELETE /i/:shortId/photos/:id — الضيف بيمسح صورته هو (بنفس المفتاح)
router.delete('/i/:shortId/photos/:id', async (req, res) => {
  try {
    const keyHash = readGuestKeyHash(req);
    if (!keyHash || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'الصورة دي مش موجودة.' });
    }
    const photo = await GuestPhoto.findOne({
      _id: req.params.id, shortId: String(req.params.shortId || ''), guestKeyHash: keyHash,
    }).lean();
    // صورة حد تاني = "مش موجودة" — من غير ما نأكد إنها موجودة أصلًا
    if (!photo) return res.status(404).json({ error: 'الصورة دي مش موجودة.' });
    await GuestPhoto.deleteOne({ _id: photo._id });
    await destroyRemote(photo.publicId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Guest photo delete failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// ================= صاحب الدعوة (لوحته) =================

async function ownedInvitation(req) {
  return Invitation.findOne({ shortId: String(req.params.shortId || ''), ownerId: req.user.id })
    .select('_id shortId templateId hiddenSections albumToken')
    .lean();
}

// GET /api/dashboard/invitations/:shortId/photos — الألبوم كله لصاحبه
router.get('/api/dashboard/invitations/:shortId/photos', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });
    const { page, total, nextCursor } = await loadPage(invitation.shortId, {
      limit: req.query.limit || PAGE_SIZE_MAX, before: req.query.before,
    });
    return res.json({
      photos: page.map((p) => serializePhoto(p, null)),
      total,
      nextCursor,
      enabled: albumEnabled(invitation),
      supported: templateHasAlbum(invitation.templateId),
      albumPath: invitation.albumToken ? `/a/${invitation.albumToken}` : null,
    });
  } catch (err) {
    console.error('Error loading owner photos:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// DELETE /api/dashboard/invitations/:shortId/photos/:id — صاحب الدعوة بيمسح أي صورة
router.delete('/api/dashboard/invitations/:shortId/photos/:id', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'الصورة دي مش موجودة.' });
    }
    const photo = await GuestPhoto.findOne({ _id: req.params.id, shortId: invitation.shortId }).lean();
    if (!photo) return res.status(404).json({ error: 'الصورة دي مش موجودة.' });
    await GuestPhoto.deleteOne({ _id: photo._id });
    await destroyRemote(photo.publicId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Owner photo delete failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/dashboard/invitations/:shortId/album-link — رابط صفحة الألبوم السري
router.post('/api/dashboard/invitations/:shortId/album-link', requireAuth, async (req, res) => {
  try {
    const invitation = await ownedInvitation(req);
    if (!invitation) return res.status(404).json({ error: 'الدعوة دي مش موجودة.' });
    const token = invitation.albumToken || await ensureAlbumToken(invitation._id);
    return res.json({ albumPath: `/a/${token}` });
  } catch (err) {
    console.error('Album link failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// ================= صفحة الألبوم المشاركة =================

async function albumByToken(token) {
  const t = String(token || '');
  if (!/^[a-zA-Z0-9]{10,40}$/.test(t)) return null;
  return Invitation.findOne({ albumToken: t })
    .select('shortId name brideName groomName brideNameAr groomNameAr language weddingDateTime')
    .lean();
}

// GET /a/:token — صفحة الألبوم (عامة لأي حد معاه اللينك السري)
router.get('/a/:token', async (req, res) => {
  try {
    const invitation = await albumByToken(req.params.token);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'no-store');
    if (!invitation) return res.status(404).send(albumNotFoundPage());
    const photos = await GuestPhoto.find({ shortId: invitation.shortId })
      .sort({ _id: -1 }).limit(MAX_PER_ALBUM).lean();
    return res.send(buildAlbumPage(invitation, photos.map((p) => serializePhoto(p, null)), {
      zipPath: photos.length && isCloudinaryReady() ? `/a/${encodeURIComponent(req.params.token)}/zip` : null,
    }));
  } catch (err) {
    console.error('Album page failed:', err);
    return res.status(500).send('حصل خطأ في السيرفر');
  }
});

// GET /a/:token/zip — "نزّل الكل": Cloudinary بيجمع الصور الأصلية في ملف
// zip واحد. الرابط موقّع ومؤقت، فبنولّده جديد مع كل ضغطة بدل ما نحطه في الصفحة.
router.get('/a/:token/zip', async (req, res) => {
  try {
    const invitation = await albumByToken(req.params.token);
    if (!invitation || !isCloudinaryReady()) return res.status(404).send('Not found');
    const url = getCloudinary().utils.download_zip_url({
      tags: [albumTag(invitation.shortId)],
      resource_type: 'image',
      flatten_folders: true,
      target_public_id: `mithaq-album-${invitation.shortId}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    return res.redirect(302, url);
  } catch (err) {
    console.error('Album zip failed:', err);
    return res.status(500).send('حصل خطأ في السيرفر');
  }
});

// multer بيرمي أخطاء خاصة (حجم/عدد) — رسالة مفهومة بدل خطأ غامض
router.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'حجم الصورة كبير جدًا.' });
  }
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: 'الملف مرفوض.' });
  }
  return next(err);
});

module.exports = router;
