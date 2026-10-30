// routes/uploads.js
// رفع الصور والصوت. الملف بيعدي على السيرفر الأول عشان نفحصه فعليًا
// (utils/uploadSecurity.js) قبل ما يوصل Cloudinary — لو سمحنا للمتصفح
// يرفع مباشرة، مكناش هنقدر نمنع ملف خبيث قبل ما يتخزن.
const express = require('express');
const multer = require('multer');

const { isCloudinaryReady } = require('../config/cloudinary');
// الرفع نفسه بيعيد لوحده لو الاتصال بـ Cloudinary وقع لحظيًا
const { uploadBuffer } = require('../utils/cloudinaryUpload');
const { validateImage, validateAudio, MAX_AUDIO_BYTES } = require('../utils/uploadSecurity');
const { requireAuth } = require('../middleware/auth');
const { requireAdminSession } = require('../middleware/adminAuth');
const Order = require('../models/Order');
const { hasProof, NO_PROOF } = require('../utils/orderProof');
const metaCapi = require('../utils/metaCapi');

// بيكسل ميتا (السيرفر): "بعت الدفع" مرة واحدة لكل أوردر + آخر بيانات متصفح العميل
// (حدث الشراء لما الأدمن يفعّل بيستخدمها). نفس event_id اللي المتصفح بيبعته: pay_<order>
function metaPaid(order, req) {
  const ctx = metaCapi.contextFromReq(req);
  const first = !(order.metaSent && order.metaSent.pay);
  Order.updateOne({ _id: order._id }, { $set: { metaCtx: ctx, ...(first ? { 'metaSent.pay': new Date() } : {}) } }).catch(() => {});
  if (first) metaCapi.fire('AddPaymentInfo', { eventId: 'pay_' + order._id, user: req.user, ctx, custom: metaCapi.orderCustom(order) });
}

const router = express.Router();

// الملف بيتخزن في الذاكرة مؤقتًا (مش على القرص) عشان نفحصه ونرفعه
// ونرميه. الحد هنا خط دفاع أول — multer بيقطع الطلب قبل ما يتقرا كله.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
});

/** رسالة موحدة لو المفاتيح مش متظبطة */
function ensureReady(res) {
  if (isCloudinaryReady()) return true;
  res.status(503).json({ error: 'خدمة رفع الملفات مش متظبطة على السيرفر دلوقتي.' });
  return false;
}

// POST /api/uploads/image — صورة عامة (صور الدعوة)
router.post('/api/uploads/image', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!ensureReady(res)) return undefined;
    if (!req.file) return res.status(400).json({ error: 'مفيش ملف مرفوع.' });

    const check = await validateImage(req.file.buffer);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const result = await uploadBuffer(req.file.buffer, {
      folder: `mithaq/users/${req.user.id}/images`,
      resource_type: 'image',
      // إعادة الترميز: Cloudinary بيعيد بناء الصورة من الأول، فأي بيانات
      // مدسوسة جواها (سكريبت، ميتاداتا خبيثة) بتتشال في الطريق.
      transformation: [{ width: 2000, height: 2000, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
      // مانسمحش لـ Cloudinary يخمّن النوع من الاسم
      format: check.mime === 'image/png' ? 'png' : 'jpg',
    }, { where: 'upload-image', path: req.originalUrl, userId: req.user.id });

    return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('Image upload failed:', err);
    return res.status(500).json({ error: 'الرفع فشل، حاول تاني.' });
  }
});

// POST /api/uploads/audio — موسيقى الدعوة
router.post('/api/uploads/audio', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!ensureReady(res)) return undefined;
    if (!req.file) return res.status(400).json({ error: 'مفيش ملف مرفوع.' });

    const check = await validateAudio(req.file.buffer);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const result = await uploadBuffer(req.file.buffer, {
      folder: `mithaq/users/${req.user.id}/audio`,
      resource_type: 'video', // Cloudinary بيعامل الصوت تحت video
    }, { where: 'upload-audio', path: req.originalUrl, userId: req.user.id });

    return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('Audio upload failed:', err);
    return res.status(500).json({ error: 'الرفع فشل، حاول تاني.' });
  }
});

// POST /admin/api/tracks/upload — رفع أغنية لمكتبة الموسيقى.
// نفس فحص الصوت العادي بالظبط (نوع حقيقي + حجم)، بس صلاحيته للأدمن.
router.post('/admin/api/tracks/upload', requireAdminSession, upload.single('file'), async (req, res) => {
  try {
    if (!ensureReady(res)) return undefined;
    if (!req.file) return res.status(400).json({ error: 'مفيش ملف مرفوع.' });

    const check = await validateAudio(req.file.buffer);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'mithaq/library/music',
      resource_type: 'video', // Cloudinary بيعامل الصوت تحت video
    }, { where: 'upload-track', path: req.originalUrl });

    return res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      // Cloudinary بيرجّع المدة بالثواني — بنستخدمها كحدود للقص
      duration: Math.round(result.duration || 0),
    });
  } catch (err) {
    console.error('Track upload failed:', err);
    return res.status(500).json({ error: 'الرفع فشل، حاول تاني.' });
  }
});

// POST /api/uploads/payment-proof — صورة إيصال التحويل
// بتتربط بالطلب المعلّق بتاع العميل عشان تظهر لك في لوحة التحكم.
router.post('/api/uploads/payment-proof', requireAuth, upload.single('file'), async (req, res) => {
  try {
    // الطلب الأول: لو مفيش طلب، أو الطلب ليه إيصال خلاص، مالوش لازمة نرفع
    // أي حاجة. رفع إيصال مرة واحدة للطلب: بعدها "جاري المراجعة". لو الإيصال
    // اترفض من اللوحة الطلب بيتلغي، وصفحة الدفع بتعمل طلب جديد فيقدر يرفع تاني.
    const order = await Order.findOne({ userId: req.user.id, status: 'pending' }).sort({ createdAt: -1 });
    if (!order) {
      return res.status(400).json({ error: 'مفيش طلب باقة مستني — اطلب الباقة الأول.' });
    }
    if (hasProof(order)) {
      return res.status(409).json({ code: 'RECEIPT_UNDER_REVIEW', error: 'إيصالك وصلنا وجاري مراجعته — هتوصلك رسالة أول ما الباقة تتفعّل.' });
    }

    if (!ensureReady(res)) return undefined;
    if (!req.file) return res.status(400).json({ error: 'مفيش ملف مرفوع.' });

    const check = await validateImage(req.file.buffer);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const result = await uploadBuffer(req.file.buffer, {
      folder: `mithaq/payment-proofs/${req.user.id}`,
      resource_type: 'image',
      transformation: [{ width: 2000, height: 2000, crop: 'limit', fetch_format: 'auto', quality: 'auto' }],
      format: check.mime === 'image/png' ? 'png' : 'jpg',
    }, { where: 'upload-receipt', path: req.originalUrl, userId: req.user.id });

    order.paymentProofUrl = result.secure_url;
    order.paymentProofAt = new Date();
    await order.save();

    // دقة الفلوس: العميل ممكن يكون قدّم على أكتر من باقة قبل ما يدفع (مثلاً
    // 340 وبعدين 150). اللي رفع له إيصال دلوقتي هو اللي عايز يدفع فيه فعلًا،
    // فبنلغي باقي طلباته المستنية **اللي مرفعش لها إيصال** (المهجورة) عشان
    // مايظهرش للأدمن غير الطلب الصح — وماتحصلش لخبطة في المبلغ اللي هيتفعّل.
    // آمن تمامًا: بننقل طلبات مستنية لـ"ملغية" بس، من غير أي مساس بالرصيد أو الفلوس.
    await Order.updateMany(
      { userId: req.user.id, status: 'pending', _id: { $ne: order._id }, ...NO_PROOF },
      { $set: { status: 'cancelled' } }
    );

    metaPaid(order, req);
    return res.status(201).json({ ok: true, url: result.secure_url, orderId: String(order._id) });
  } catch (err) {
    console.error('Payment proof upload failed:', err);
    return res.status(500).json({ error: 'الرفع فشل، حاول تاني.' });
  }
});

// POST /api/uploads/payment-phone — بديل الإيصال للدفع المصري (فودافون كاش /
// إنستاباي): العميل بيكتب رقم الموبايل اللي حوّل منه، والأدمن بيطابقه مع
// التحويل اللي وصله. بيتعامل زي رفع الإيصال بالظبط (جاري المراجعة + الطلبات
// المهجورة بتتلغي) — utils/orderProof.js.
router.post('/api/uploads/payment-phone', requireAuth, express.json({ limit: '2kb' }), async (req, res) => {
  try {
    const digits = String((req.body && req.body.phone) || '')
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/\D/g, '')
      .replace(/^(?:0020|20)(?=1)/, '0');
    if (!/^01[0125]\d{8}$/.test(digits)) {
      return res.status(400).json({ code: 'BAD_PHONE', error: 'اكتب رقم موبايل مصري صحيح (11 رقم يبدأ بـ 01).' });
    }
    const order = await Order.findOne({ userId: req.user.id, status: 'pending' }).sort({ createdAt: -1 });
    if (!order) return res.status(400).json({ error: 'مفيش طلب باقة مستني — اطلب الباقة الأول.' });
    if (order.currency !== 'EGP') return res.status(400).json({ error: 'الرقم بدل الإيصال متاح للتحويل من مصر بس — ارفع صورة الإيصال.' });
    if (hasProof(order)) {
      return res.status(409).json({ code: 'RECEIPT_UNDER_REVIEW', error: 'بياناتك وصلتنا وجاري مراجعتها — هتوصلك رسالة أول ما الباقة تتفعّل.' });
    }
    order.paymentSenderPhone = digits;
    order.paymentProofAt = new Date();
    await order.save();
    await Order.updateMany(
      { userId: req.user.id, status: 'pending', _id: { $ne: order._id }, ...NO_PROOF },
      { $set: { status: 'cancelled' } }
    );
    metaPaid(order, req);
    return res.status(201).json({ ok: true, orderId: String(order._id) });
  } catch (err) {
    console.error('Payment phone failed:', err);
    return res.status(500).json({ error: 'حصل خطأ، حاول تاني.' });
  }
});

// لو الملف أكبر من الحد، multer بيرمي خطأ خاص — بنرد برسالة مفهومة
// بدل ما الطلب يقع بشكل غامض.
router.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'حجم الملف كبير جدًا.' });
  }
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: 'الملف مرفوض.' });
  }
  return next(err);
});

module.exports = router;
