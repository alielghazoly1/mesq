// utils/xpay.js
// المحوّل الوحيد اللي بيتكلم مع بوابة الدفع XPay (api.xpay.app).
//
// ليه كل حاجة خاصة بـ XPay متجمّعة هنا: لو أي اسم حقل في الـ API اتغيّر،
// التعديل بيبقى في الملف ده بس — باقي الموقع (الراوتس، الواجهة) مبيعرفش
// حاجة عن شكل طلبات XPay ولا رده. ولو XPay اتوقفت أو مظبوطتش صح، الموقع
// بيفضل شغّال بالتحويل اليدوي القديم (فودافون/بنك).
//
// الأمان: كل المفاتيح بتتقرا من متغيّرات البيئة (env) — عمرها ما بتتكتب
// في الكود ولا بترجع للواجهة. المفتاح السري (sk_) والـ webhook secret
// (whsec_) للسيرفر بس.
//
// ⚠️ ملاحظة مهمة: البيئة اللي التطوير بيتم فيها بتحجب api.xpay.app، فماقدرناش
//   نختبر الـ API حيًّا. أسماء الحقول تحت مبنية على توثيق XPay الرسمي
//   (نمطها زي Stripe: unitAmount/afterCompletion/metadata). لو ظهر أي فرق
//   بسيط بعد أول تجربة حقيقية على السيرفر، التعديل كله في الدالتين
//   buildSessionBody و parsePaidStatus تحت — محدش تاني محتاج يتلمس.
const crypto = require('crypto');

/** إعدادات XPay من البيئة — بتتقرا كل مرة عشان الاختبارات تقدر تغيّرها */
function xpayConfig() {
  return {
    apiBase: (process.env.XPAY_API_BASE || 'https://api.xpay.app').replace(/\/+$/, ''),
    secretKey: process.env.XPAY_SECRET_KEY || '',
    publishableKey: process.env.XPAY_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.XPAY_WEBHOOK_SECRET || '',
    // القفل الرئيسي: لازم يكون 'true' **و** فيه مفتاح سري. أي حاجة تانية
    // = XPay متعطّلة والموقع بيرجع للتحويل اليدوي.
    enabledFlag: String(process.env.XPAY_ENABLED || '').toLowerCase() === 'true',
    // سماحية فرق التوقيت في الـ webhook (ثواني) — بتمنع إعادة إرسال قديمة
    webhookToleranceSec: Number(process.env.XPAY_WEBHOOK_TOLERANCE_SEC || 300),
  };
}

/** XPay جاهزة للاستخدام؟ (مفعّلة + فيها مفتاح سري) */
function isXpayEnabled() {
  const c = xpayConfig();
  return c.enabledFlag && !!c.secretKey;
}

/** المفتاح العلني (pk_) — ده الوحيد اللي مسموح يروح للواجهة لو احتجناه */
function xpayPublishableKey() {
  return xpayConfig().publishableKey;
}

/**
 * بيحوّل مبلغ الباقة (زي 150 جنيه، 30 دولار) للوحدة الصغرى اللي XPay
 * بتطلبها (قرش/سنت) — أي ضرب في 100 وتقريب لأقرب صحيح.
 */
function toMinorUnits(amount) {
  return Math.round(Number(amount) * 100);
}

/**
 * بيبني جسم طلب إنشاء جلسة الدفع.
 * ⚠️ لو أسماء حقول XPay اختلفت، ده المكان الوحيد اللي بيتظبط فيه.
 */
function buildSessionBody({ amount, currency, orderId, userId, customerEmail, successUrl, cancelUrl, description }) {
  // XPay API متوافق مع Stripe: كل الأسماء snake_case زي Checkout Session
  // بتاعت Stripe بالحرف (اتأكدنا من ده من رسالة الخطأ parameter_unknown).
  return {
    mode: 'payment',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: String(currency || '').toLowerCase(),
        // المبلغ بالوحدة الصغرى (قرش/سنت)
        unit_amount: toMinorUnits(amount),
        product_data: { name: description || 'Mithaq invitation package' },
      },
    }],
    // لفين يرجع العميل بعد نجاح/إلغاء الدفع
    success_url: successUrl,
    cancel_url: cancelUrl,
    // بيرجع رقم الطلب في الـ webhook — بنربط بيه الدفعة بالطلب والعميل.
    // حجر الأساس في التفعيل الأوتوماتيكي الآمن.
    client_reference_id: String(orderId),
    customer_email: customerEmail || undefined,
    metadata: { orderId: String(orderId), userId: String(userId) },
  };
}

/**
 * بيقرأ من رد XPay (جلسة أو webhook) إذا كانت الدفعة اتمّت فعلاً.
 * ⚠️ لو أسماء حالات XPay اختلفت، ده المكان الوحيد اللي بيتظبط فيه.
 */
function parsePaidStatus(session) {
  if (!session || typeof session !== 'object') return false;
  const status = String(session.paymentStatus || session.payment_status || session.status || '').toLowerCase();
  return status === 'paid' || status === 'complete' || status === 'completed' || status === 'succeeded';
}

/** بيطلع رقم الطلب المخبّى في الجلسة (من metadata أو clientReferenceId) */
function orderIdFromSession(session) {
  if (!session || typeof session !== 'object') return null;
  const meta = session.metadata || {};
  return meta.orderId || session.clientReferenceId || session.client_reference_id || null;
}

/** نداء موحّد لـ API مع الترويسة الصح ورسائل خطأ واضحة */
async function xpayRequest(method, path, body) {
  const c = xpayConfig();
  if (!c.secretKey) throw new Error('XPay secret key is not configured');

  const res = await fetch(`${c.apiBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${c.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    // رسالة الخطأ ممكن تكون data.message، أو data.error (نص)، أو
    // data.error.message (كائن زي Stripe: { error: { message, code, ... } })
    let msg = `XPay API ${res.status}`;
    if (data) {
      if (typeof data.message === 'string') msg = data.message;
      else if (data.error && typeof data.error === 'object' && data.error.message) msg = data.error.message;
      else if (typeof data.error === 'string') msg = data.error;
    }
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * بينشئ جلسة دفع ويرجّع { id, url } — url هو صفحة الدفع اللي بنوجّه
 * العميل عليها.
 */
async function createCheckoutSession(opts) {
  const session = await xpayRequest('POST', '/checkout/sessions', buildSessionBody(opts));
  const url = session && (session.url || session.checkoutUrl || session.paymentUrl);
  const id = session && (session.id || session.sessionId);
  if (!url || !id) {
    const err = new Error('XPay session response missing url/id');
    err.body = session;
    throw err;
  }
  return { id, url, raw: session };
}

/** بيجيب جلسة موجودة — بنستخدمها للتأكّد من الدفع عند رجوع العميل */
async function retrieveSession(sessionId) {
  return xpayRequest('GET', `/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

/**
 * بيتحقق من توقيع الـ webhook.
 *
 * الآلية (زي Stripe): توقيع HMAC-SHA256 على النص "{timestamp}.{rawBody}"
 * بالسر whsec_. الهيدر x-xpay-signature ممكن ييجي بشكلين:
 *   - "t=<ts>,v1=<hexsig>"  (التوقيت جوّه الهيدر)
 *   - "<hexsig>" بس، والتوقيت في هيدر منفصل x-xpay-timestamp
 * بندعم الاتنين، وبنرفض أي حاجة متطابقش (constant-time compare).
 *
 * @returns {{ valid:boolean, event:object|null, reason?:string }}
 */
function verifyWebhook(rawBody, headers) {
  const c = xpayConfig();
  if (!c.webhookSecret) return { valid: false, event: null, reason: 'no_secret' };

  const raw = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
  const h = headers || {};
  const sigHeader = String(h['x-xpay-signature'] || h['X-Xpay-Signature'] || '');
  if (!sigHeader) return { valid: false, event: null, reason: 'no_signature' };

  // نطلّع التوقيت والتوقيع من الهيدر (بأي من الشكلين)
  let timestamp = String(h['x-xpay-timestamp'] || h['X-Xpay-Timestamp'] || '');
  let signature = sigHeader.trim();
  if (sigHeader.indexOf('=') !== -1) {
    for (const part of sigHeader.split(',')) {
      const [k, val] = part.split('=').map((s) => (s || '').trim());
      if (k === 't') timestamp = val;
      else if (k === 'v1' || k === 's' || k === 'sha256') signature = val;
    }
  }

  // النصوص المرشّحة للتوقيع: مع التوقيت (المفضّل) وبدونه (احتياطي)
  const candidates = [];
  if (timestamp) candidates.push(`${timestamp}.${raw}`);
  candidates.push(raw);

  const matched = candidates.some((payload) => {
    const expected = crypto.createHmac('sha256', c.webhookSecret).update(payload, 'utf8').digest('hex');
    return safeEqualHex(expected, signature);
  });
  if (!matched) return { valid: false, event: null, reason: 'bad_signature' };

  // فرق توقيت كبير = إعادة إرسال قديمة محتمَلة — نرفضها
  if (timestamp) {
    const skew = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (Number.isFinite(skew) && skew > c.webhookToleranceSec) {
      return { valid: false, event: null, reason: 'timestamp_out_of_tolerance' };
    }
  }

  let event = null;
  try { event = JSON.parse(raw); } catch { return { valid: false, event: null, reason: 'bad_json' }; }
  return { valid: true, event };
}

/** مقارنة hex بوقت ثابت — بتتحمّل اختلاف الطول من غير ما ترمي استثناء */
function safeEqualHex(a, b) {
  const ba = Buffer.from(String(a || ''), 'hex');
  const bb = Buffer.from(String(b || ''), 'hex');
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = {
  xpayConfig,
  isXpayEnabled,
  xpayPublishableKey,
  toMinorUnits,
  buildSessionBody,
  parsePaidStatus,
  orderIdFromSession,
  createCheckoutSession,
  retrieveSession,
  verifyWebhook,
};
