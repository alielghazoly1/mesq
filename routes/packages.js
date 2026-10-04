// routes/packages.js
// عرض الباقات بسعر عملة المستخدم، وتسجيل طلب شراء.
// الدفع نفسه بيتم برّه الموقع دلوقتي، والتفعيل يدوي من لوحة التحكم
// (routes/admin.js) — الطلب هنا بيسجّل نية الشراء بس.
const express = require('express');

const Order = require('../models/Order');
const {
  getPackage, currencyForCountry, packageAllowedInCountry, EDIT_WINDOW_DAYS,
} = require('../packages/registry');
const { editWindowInfo } = require('../utils/editWindow');
const { requireAuth } = require('../middleware/auth');
const { getPaymentSettings, publicPaymentInfo } = require('../utils/paymentSettings');
const { pricedPackagesFor, priceForOrder } = require('../utils/pricing');
const { enqueueCheckoutHelp } = require('../utils/whatsapp/outbox');

const router = express.Router();

// GET /api/packages — الباقات بالعملة المناسبة.
//
// الأسعار مبتظهرش لزائر مش مسجّل خالص. السبب عملي مش تسويقي: السعر
// نفسه بيختلف حسب دولة العميل (جنيه للمصريين، دولار لغيرهم)، ودولته
// بتتعرف من حسابه. فلو وريناه أسعار قبل ما يسجّل، هنبقى بنوريه سعر
// ممكن يتغيّر قدامه بعد التسجيل — وده أسوأ من إننا نستناه يسجّل.
router.get('/api/packages', async (req, res) => {
  if (!req.user) {
    return res.json({
      requiresAuth: true, packages: [], currency: null, subscription: null,
      editWindowDays: EDIT_WINDOW_DAYS,
    });
  }
  try {
    const country = req.user.country;
    return res.json({
      requiresAuth: false,
      packages: await pricedPackagesFor(country, req.query.lang),
      currency: currencyForCountry(country),
      subscription: req.user.subscription || null,
      // مدة التعديل بعد التفعيل (بالأيام) — الواجهة بتكتبها للعميل من هنا،
      // مش رقم متكتوب في الترجمة، عشان أي تغيير في الإعداد يبان لوحده
      editWindowDays: EDIT_WINDOW_DAYS,
      edit: editWindowInfo(req.user.subscription),
    });
  } catch (err) {
    console.error('Error loading packages:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// GET /api/packages/payment-info — بيانات التحويل حسب بلد العميل:
// المصري بيشوف فودافون كاش، وغيره بيشوف الحساب البنكي. البيانات نفسها
// بتتحكم فيها من لوحة التحكم (utils/paymentSettings.js).
router.get('/api/packages/payment-info', requireAuth, async (req, res) => {
  try {
    const doc = await getPaymentSettings();
    return res.json(publicPaymentInfo(doc, req.user.country));
  } catch (err) {
    console.error('Error loading payment info:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/packages/order — تسجيل طلب شراء (محتاج تسجيل دخول)
router.post('/api/packages/order', requireAuth, async (req, res) => {
  try {
    const pkg = getPackage(req.body && req.body.packageId);
    if (!pkg) {
      return res.status(400).json({ error: 'الباقة دي مش موجودة.' });
    }
    // باقة الدعوة الواحدة متاحة في مصر بس — الفحص هنا مش في الواجهة
    // بس، عشان حد يبعت الطلب مباشرة مايعرفش يشتريها من بره
    if (!packageAllowedInCountry(pkg, req.user.country)) {
      return res.status(403).json({ error: 'الباقة دي مش متاحة في بلدك.' });
    }

    const currency = currencyForCountry(req.user.country);
    // السعر بياخد الخصم الشغال دلوقتي — نفس الرقم اللي العميل شافه على
    // الشاشة بالظبط، لأن الاتنين بيعدوا من utils/pricing.js
    const priced = await priceForOrder(pkg.id, req.user.country);
    // الباقة اتقفلت من لوحة التحكم (أو مالهاش سعر بعملته)
    if (!priced) {
      return res.status(403).json({ error: 'الباقة دي مش متاحة دلوقتي — اختار باقة تانية.' });
    }

    // لو عنده طلب معلّق لنفس الباقة، مانعملش طلب جديد فوقه.
    // بس بنحدّث سعره لو الخصم اتغير من ساعة ما طلب — غير كده هيحوّل
    // رقم واللوحة شايفة رقم تاني.
    const existing = await Order.findOne({
      userId: req.user.id,
      packageId: pkg.id,
      status: 'pending',
    });
    if (existing) {
      // دقة الفلوس: لو العميل رفع إيصال خلاص، يبقى حوّل المبلغ اللي كان مكتوب
      // ساعتها — السعر ده متقفل ومبيتغيّرش حتى لو السعر اتغيّر من اللوحة بعدها
      // (غير كده اللوحة هتوري مبلغ غير اللي اتحوّل فعلًا)
      if (!existing.paymentProofUrl
        && (existing.price !== priced.price || existing.currency !== currency)) {
        existing.price = priced.price;
        existing.currency = currency;
        await existing.save();
      }
      // رسالة واتساب "محتاج مساعدة في الدفع؟" — لو مارفعش إيصال لسه
      // (مرة واحدة لكل عميل، وبتتبعت بعد دقايق لو لسه مادفعش — utils/whatsapp/outbox.js)
      if (!existing.paymentProofUrl) enqueueCheckoutHelp(req.user._id, pkg.id);
      return res.status(200).json({
        ok: true,
        orderId: String(existing._id),
        alreadyPending: true,
        // رفع إيصال خلاص؟ الصفحة بتوريله "جاري المراجعة" بدل ما تطلب إيصال تاني
        hasReceipt: !!existing.paymentProofUrl,
        paymentProofAt: existing.paymentProofAt || null,
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      packageId: pkg.id,
      currency,
      price: priced.price,
    });
    enqueueCheckoutHelp(req.user._id, pkg.id);

    return res.status(201).json({ ok: true, orderId: String(order._id), hasReceipt: false });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

// GET /api/packages/status — حالة طلب العميل:
//   reviewing: طلب مستني ومرفوع له إيصال (بنراجعه)
//   notice: رسالة مرة واحدة بنتيجة المراجعة (اتفعّلت / اترفض) لسه ماشافهاش
router.get('/api/packages/status', requireAuth, async (req, res) => {
  try {
    const [reviewing, notice] = await Promise.all([
      Order.findOne({ userId: req.user.id, status: 'pending', paymentProofUrl: { $ne: null } })
        .sort({ paymentProofAt: -1 }).lean(),
      Order.findOne({ userId: req.user.id, notice: { $in: ['activated', 'rejected'] }, noticeSeenAt: null })
        .sort({ activatedAt: -1, cancelledAt: -1, _id: -1 }).lean(),
    ]);
    const pkgOf = (o) => {
      const pkg = getPackage(o.packageId);
      return { packageId: o.packageId, packageName: pkg ? pkg.name : null, invitations: pkg ? pkg.invitations : 0 };
    };
    return res.json({
      reviewing: reviewing ? {
        orderId: String(reviewing._id), paymentProofAt: reviewing.paymentProofAt, ...pkgOf(reviewing),
      } : null,
      notice: notice ? { orderId: String(notice._id), type: notice.notice, ...pkgOf(notice) } : null,
    });
  } catch (err) {
    console.error('Error reading order status:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// POST /api/packages/notice/:orderId/seen — العميل شاف الرسالة، متظهرش تاني
router.post('/api/packages/notice/:orderId/seen', requireAuth, async (req, res) => {
  try {
    if (!/^[a-f0-9]{24}$/.test(String(req.params.orderId))) return res.status(404).json({ error: 'مش موجود.' });
    // صاحب الطلب بس — الشرط جوه الاستعلام نفسه
    await Order.updateOne(
      { _id: req.params.orderId, userId: req.user.id, noticeSeenAt: null },
      { $set: { noticeSeenAt: new Date() } }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error marking notice seen:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
