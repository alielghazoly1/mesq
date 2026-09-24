// routes/payments.js
// الدفع الأوتوماتيكي بالفيزا عبر XPay.
//
// المسار الكامل:
//   1) العميل يوافق على الشروط ويدوس "ادفع بالفيزا"
//      → POST /api/pay/xpay/checkout: بنعمل/بنستخدم طلب معلّق، بنعمل جلسة
//        دفع XPay بالسعر الصح من السيرفر، وبنرجّع url صفحة الدفع.
//   2) العميل بيدفع على صفحة XPay وبيرجع على /pay/complete?order=...
//      → POST /api/pay/xpay/verify: السيرفر بيسأل XPay عن حالة الجلسة،
//        ولو مدفوعة بيفعّل الطلب. ده مسار "رجوع العميل" (سريع للواجهة).
//   3) XPay كمان بتبعت webhook مستقل → POST /api/pay/xpay/webhook: التأكيد
//      المضمون اللي بيشتغل حتى لو العميل قفل التاب. بيتحقق من التوقيع
//      ويفعّل الطلب.
//
// التفعيل في (2) و(3) بيعدّي على utils/activateOrder.js اللي بيضمن
// التفعيل مرة واحدة بس مهما اتكرر النداء — فمفيش رصيد مضاعف.
//
// الأمان: السعر بيتحسب على السيرفر دايمًا (priceForOrder)، عمرنا ما
// بناخده من العميل. والتفعيل عمره ما بيحصل من كلام العميل — لازم تأكيد
// من XPay نفسها (retrieveSession أو webhook موقّع).
const express = require('express');

const Order = require('../models/Order');
const { getPackage, currencyForCountry, packageAllowedInCountry } = require('../packages/registry');
const { priceForOrder } = require('../utils/pricing');
const { getPaymentSettings, xpayLive } = require('../utils/paymentSettings');
const { requireAuth } = require('../middleware/auth');
const { activateOrder } = require('../utils/activateOrder');
const {
  isXpayEnabled, createCheckoutSession, retrieveSession,
  verifyWebhook, parsePaidStatus, orderIdFromSession, toXpayCharge,
} = require('../utils/xpay');

const router = express.Router();

/** أصل الموقع (https://domain) من الطلب — لبناء روابط الرجوع */
function siteOrigin(req) {
  // خلف بروكسي (Nginx/Vercel) بنثق في x-forwarded-proto اللي السيرفر ظابطه
  const proto = req.protocol;
  return `${proto}://${req.get('host')}`;
}

// POST /api/pay/xpay/checkout — بتبدأ دفعة فيزا وبترجّع رابط صفحة الدفع
router.post('/api/pay/xpay/checkout', requireAuth, async (req, res) => {
  try {
    // الدفع بالفيزا شغّال؟ (مفاتيح env + توجل الأدمن)
    const settings = await getPaymentSettings().catch(() => null);
    if (!xpayLive(settings)) {
      return res.status(503).json({ error: 'الدفع بالفيزا مش متاح حاليًا.' });
    }

    const body = req.body || {};
    const pkg = getPackage(body.packageId);
    if (!pkg) return res.status(400).json({ error: 'الباقة دي مش موجودة.' });
    if (!packageAllowedInCountry(pkg, req.user.country)) {
      return res.status(403).json({ error: 'الباقة دي مش متاحة في بلدك.' });
    }
    // لازم يوافق على الشروط قبل الدفع (سجل قانوني)
    if (body.termsAccepted !== true) {
      return res.status(400).json({ error: 'لازم توافق على شروط الاستخدام قبل الدفع.' });
    }

    const currency = currencyForCountry(req.user.country);
    // السعر من السيرفر بس — نفس الرقم اللي العميل شافه (utils/pricing.js)
    const priced = await priceForOrder(pkg.id, req.user.country);
    if (!priced || !priced.price || priced.price <= 0) {
      return res.status(400).json({ error: 'الباقة دي مش متاحة للدفع بالفيزا.' });
    }

    // نستخدم طلب معلّق موجود لنفس الباقة أو نعمل واحد جديد — عشان زيارة
    // صفحة الدفع مبتكرّرش طلبات
    let order = await Order.findOne({ userId: req.user.id, packageId: pkg.id, status: 'pending' });
    if (order) {
      order.currency = currency;
      order.price = priced.price;
      order.paymentMethod = 'xpay';
      order.termsAcceptedAt = new Date();
      await order.save();
    } else {
      order = await Order.create({
        userId: req.user.id,
        packageId: pkg.id,
        currency,
        price: priced.price,
        paymentMethod: 'xpay',
        termsAcceptedAt: new Date(),
      });
    }

    // XPay بتقبل الجنيه بس — العميل بالدولار بيتشحن المقابل بالجنيه
    const charge = toXpayCharge(priced.price, currency);

    const origin = siteOrigin(req);
    let session;
    try {
      session = await createCheckoutSession({
        amount: charge.amount,
        currency: charge.currency,
        orderId: String(order._id),
        userId: String(req.user.id),
        customerEmail: req.user.email,
        description: `${pkg.name.en} — Mithaq`,
        // XPay بتستبدل {CHECKOUT_SESSION_ID} برقم الجلسة الحقيقي عند الرجوع
        successUrl: `${origin}/pay/complete?order=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout/${pkg.id}?canceled=1`,
      });
    } catch (err) {
      console.error('XPay createCheckoutSession failed:', err.message, err.body || '');
      return res.status(502).json({ error: 'تعذّر بدء الدفع بالفيزا. جرّب تاني أو استخدم طريقة تانية.' });
    }

    order.xpaySessionId = session.id;
    await order.save();

    return res.json({ ok: true, url: session.url, orderId: String(order._id) });
  } catch (err) {
    console.error('Error starting XPay checkout:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

// POST /api/pay/xpay/verify — العميل رجع من صفحة الدفع؛ بنأكّد الحالة
// مع XPay ونفعّل لو مدفوعة. آمن: التفعيل مبنيّ على رد XPay مش على العميل.
router.post('/api/pay/xpay/verify', requireAuth, async (req, res) => {
  try {
    const orderId = (req.body || {}).orderId;
    const order = await Order.findOne({ _id: orderId, userId: req.user.id }).catch(() => null);
    if (!order) return res.status(404).json({ error: 'الطلب ده مش موجود.' });

    if (order.status === 'activated') {
      return res.json({ status: 'activated' });
    }
    if (!order.xpaySessionId || !isXpayEnabled()) {
      return res.json({ status: order.status });
    }

    let session;
    try {
      session = await retrieveSession(order.xpaySessionId);
    } catch (err) {
      console.error('XPay retrieveSession failed:', err.message);
      // مقدرناش نتأكد دلوقتي — الـ webhook هيفعّلها لوحده. نقول للعميل نستنى.
      return res.json({ status: 'pending' });
    }

    if (!parsePaidStatus(session)) {
      return res.json({ status: 'pending' });
    }

    const result = await activateOrder(order, { paidAt: new Date() });
    return res.json({
      status: 'activated',
      invitationsLeft: result.invitationsLeft || undefined,
    });
  } catch (err) {
    console.error('Error verifying XPay payment:', err);
    return res.status(500).json({ error: 'حصل خطأ في التأكيد.' });
  }
});

// POST /api/pay/xpay/webhook — إشعار الدفع من XPay (التأكيد المضمون).
// مفيش تسجيل دخول: XPay هي اللي بتنادي. الأمان من توقيع الـ webhook.
// لازم الجسم الخام (req.rawBody) عشان نتحقق من التوقيع — بيتجمّع في
// server.js (express.json verify).
router.post('/api/pay/xpay/webhook', async (req, res) => {
  try {
    const raw = req.rawBody || (req.body ? Buffer.from(JSON.stringify(req.body)) : Buffer.from(''));
    const { valid, event, reason } = verifyWebhook(raw, req.headers);
    if (!valid) {
      console.warn('XPay webhook rejected:', reason);
      // 400 عشان XPay تعرف إن فيه مشكلة (مش 200 على حاجة مرفوضة)
      return res.status(400).json({ error: 'invalid signature' });
    }

    // بنرد 200 بسرعة بعد ما نعالج — XPay بتعيد الإرسال لو اتأخرنا
    const type = String(event.type || event.event || '');
    // بنهتم بأحداث اكتمال الدفع بس
    const isPayment = /completed|paid|succeeded|success/i.test(type) || !type;

    const session = (event.data && (event.data.object || event.data)) || event.object || event;
    if (isPayment && parsePaidStatus(session)) {
      const orderId = orderIdFromSession(session);
      if (orderId) {
        try {
          await activateOrder(orderId, {
            paidAt: new Date(),
            xpayEventId: event.id || event.eventId || null,
          });
        } catch (err) {
          // لو التفعيل وقع (مثلاً القاعدة مش بتردّ)، بنرجّع 500 عشان XPay
          // تعيد المحاولة بعدين — مبنبلعش الخطأ
          console.error('XPay webhook activation failed:', err.message);
          return res.status(500).json({ error: 'activation failed' });
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Error handling XPay webhook:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
