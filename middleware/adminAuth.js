// middleware/adminAuth.js
// جلسة لوحة التحكم — بديل آمن لتمرير ADMIN_SECRET في كل طلب عبر الـ URL
// (?key=...، اللي كان بيتسجل في server logs وتاريخ المتصفح). المستخدم بيدخل
// المفتاح مرة واحدة (POST /admin/login)، وبعدها كوكي httpOnly بيتابع الجلسة.
//
// المالك عايز اللوحة تفضل مفتوحة على جهازه (من غير ما تطلب الباسورد كل
// شوية) — بس بأمان قوي. فالجلسة طويلة، والحماية من طبقات تانية:
//   1) الكوكي httpOnly    → جافاسكريبت (وأي XSS) مش شايفة التوكن أصلًا
//   2) sameSite: 'strict' → المتصفح مبيبعتش الكوكي من أي موقع تاني خالص
//   3) هيدر X-Admin-Request → أي طلب من موقع تاني لازم يعدي على preflight،
//      والـ CORS بتاعنا بيرفضه. ده بيقفل CSRF حتى لو الـ sameSite اتحايل عليه
//   4) بصمة الجهاز (نوع الجهاز + المتصفح) → كوكي متسروق ومستخدم من جهاز
//      تاني بيترفض والجلسة بتتمسح
//   5) التوكن بيتغيّر لوحده كل يوم → لو اتسرق في يوم، بيبطل بعدها؛ ولو
//      النسخة القديمة اتستخدمت بعد ما اتغيّر = سرقة أكيدة → الجلسة بتتقفل
//   6) قايمة "الأجهزة اللي فاتحة اللوحة" في صفحة الأمان → المالك يشوف أي
//      جهاز غريب ويقفله بضغطة (أو يقفل الكل غير جهازه)
//   7) خمول 30 يوم / أقصى عمر 90 يوم — جهاز اتساب ومحدش فتحه بيتقفل لوحده
const crypto = require('crypto');
const connectDB = require('../config/db');
const AdminSession = require('../models/AdminSession');

const ADMIN_COOKIE_NAME = 'wda_admin_session';
const DAY = 24 * 60 * 60 * 1000;
// أقصى عمر للجلسة — بعده لازم تدخل تاني حتى لو بتستخدمها كل يوم
const ADMIN_SESSION_DURATION_MS = 90 * DAY;
// جهاز محدش فتح منه اللوحة المدة دي → الجلسة بتتقفل لوحدها
const ADMIN_IDLE_TIMEOUT_MS = 30 * DAY;
// التوكن بيتجدد كل المدة دي، والقديم بيفضل شغال دقيقتين بس (طلبات كانت في الطريق)
const ROTATE_EVERY_MS = DAY;
const ROTATION_GRACE_MS = 2 * 60 * 1000;
// أقصى عدد أجهزة مفتوح عليها اللوحة في نفس الوقت — الأقدم بيتقفل
const MAX_ADMIN_DEVICES = 6;
// الهيدر اللي كل طلب من اللوحة لازم يبعته (client/src/store/adminApi.js)
const ADMIN_REQUEST_HEADER = 'x-admin-request';

const cookieOptions = () => ({
  httpOnly: true,
  // 'strict' مش 'lax': اللوحة مبيتفتحش عليها لينكات من برّه، فمفيش أي
  // سبب يخلي المتصفح يبعت كوكي الأدمن مع طلب جاي من موقع تاني.
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: ADMIN_SESSION_DURATION_MS,
  path: '/',
});

const uaOf = (req) => String((req.headers && req.headers['user-agent']) || '');

/** نوع الجهاز بالعربي (للقايمة في صفحة الأمان) */
function osOf(ua) {
  if (/iPhone/i.test(ua)) return 'آيفون';
  if (/iPad/i.test(ua)) return 'آيباد';
  if (/Android/i.test(ua)) return 'أندرويد';
  if (/Windows/i.test(ua)) return 'ويندوز';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'ماك';
  if (/Linux/i.test(ua)) return 'لينكس';
  return 'جهاز تاني';
}
function browserOf(ua) {
  if (/SamsungBrowser/i.test(ua)) return 'Samsung';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\/|Opera/i.test(ua)) return 'Opera';
  if (/Firefox|FxiOS/i.test(ua)) return 'Firefox';
  if (/CriOS|Chrome\//i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua)) return 'Safari';
  return 'متصفح';
}

/**
 * بصمة الجهاز: نوع الجهاز + المتصفح (من غير أرقام الإصدارات). مش سر —
 * مجرد حاجة تتغيّر لو الكوكي اتنقل لجهاز تاني. من غير الإصدار عشان تحديث
 * المتصفح العادي (كروم كل شهر، سفاري مع تحديث الآيفون) مايطلّعكش من اللوحة.
 */
function fingerprintOf(req) {
  const ua = uaOf(req);
  const mobile = /Mobi|iPhone|iPad|Android/i.test(ua) ? 'm' : 'd';
  return crypto.createHash('sha256').update(`v2|${osOf(ua)}|${browserOf(ua)}|${mobile}`).digest('hex').slice(0, 32);
}
/** البصمة القديمة (الـ User-Agent كله) — لجلسات اتعملت قبل التغيير، بتتحدّث أول ما تتشاف */
function legacyFingerprintOf(req) {
  return crypto.createHash('sha256').update(uaOf(req)).digest('hex').slice(0, 32);
}

/** IP مخفي جزئيًا (للعرض بس): 41.235.x.x */
function maskedIp(req) {
  const ip = String(req.ip || '').replace(/^::ffff:/, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip.split('.').slice(0, 2).join('.') + '.x.x';
  if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':') + ':…';
  return '';
}

/**
 * مقارنة آمنة لكلمة السر (بتاخد نفس الوقت في كل الحالات) عشان تمنع أي محاولة
 * تخمين تعتمد على قياس زمن الاستجابة (timing attack).
 */
function isValidAdminKey(providedKey) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return false; // لو مفيش كلمة سر متظبطة أصلًا، اللوحة مقفولة تمامًا لأي حد
  // بنقارن hash الاتنين مش النص نفسه: كده الطولين متساويين دايمًا،
  // فحتى طول كلمة السر مبيتسربش من وقت الاستجابة.
  const a = crypto.createHash('sha256').update(String(providedKey || '')).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

// بنخزّن بصمة (sha256) التوكن مش التوكن نفسه: لو نسخة من قاعدة البيانات
// اتسرّبت في أي يوم، الجلسات اللي فيها ماتنفعش تتستخدم للدخول للوحة.
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/**
 * الجلسة من الكوكي.
 * @returns {Promise<{session: object|null, stolen?: object}>}
 */
async function findSessionByToken(token) {
  const h = hashToken(token);
  const current = await AdminSession.findOne({ token: h, hashed: true });
  if (current) return { session: current };
  // توكن قديم اتجدد: مقبول دقيقتين بس (طلبات كانت في الطريق ساعة التجديد).
  // بعد كده = حد معاه نسخة قديمة من الكوكي → سرقة.
  const rotated = await AdminSession.findOne({ prevToken: h });
  if (rotated) {
    if (rotated.prevGraceUntil && rotated.prevGraceUntil > new Date()) return { session: rotated };
    return { session: null, stolen: rotated };
  }
  // جلسات قديمة جدًا (قبل التشفير)
  const legacy = await AdminSession.findOne({ token, hashed: { $ne: true } });
  return { session: legacy };
}

async function createAdminSession(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const ua = uaOf(req);
  await AdminSession.create({
    token: hashToken(token),
    hashed: true,
    expiresAt: new Date(now.getTime() + ADMIN_SESSION_DURATION_MS),
    fingerprint: fingerprintOf(req),
    lastSeenAt: now,
    rotatedAt: now,
    device: `${osOf(ua)} · ${browserOf(ua)}`,
    ip: maskedIp(req),
  });
  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions());
  // أقصى عدد أجهزة: الأقدم استخدامًا بيتقفل
  try {
    const extra = await AdminSession.find({}).sort({ lastSeenAt: -1 }).skip(MAX_ADMIN_DEVICES).select('_id').lean();
    if (extra.length) await AdminSession.deleteMany({ _id: { $in: extra.map((x) => x._id) } });
  } catch { /* مش حرج */ }
}

async function destroyAdminSession(req, res) {
  const token = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
  if (token) {
    const h = hashToken(token);
    try { await AdminSession.deleteMany({ $or: [{ token: { $in: [h, token] } }, { prevToken: h }] }); } catch { /* تجاهل، المهم مسح الكوكي في كل الأحوال */ }
  }
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
}

/**
 * بيتحقق من الجلسة ويحدّث آخر نشاط (ويجدد التوكن لو عدّى يوم — محتاج res).
 * @returns {Promise<boolean>}
 */
async function hasValidAdminSession(req, res) {
  try {
    const token = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (!token) return false;
    await connectDB();

    const { session, stolen } = await findSessionByToken(token);
    if (stolen) {
      console.warn('[admin] old session token reused after rotation — closing that session');
      await AdminSession.deleteOne({ _id: stolen._id });
      return false;
    }
    if (!session) return false;

    const now = new Date();
    if (session.expiresAt <= now) return false;

    // جهاز اتساب المدة دي من غير ما حد يفتح منه اللوحة
    const lastSeen = session.lastSeenAt || session.createdAt || now;
    if (now - new Date(lastSeen) > ADMIN_IDLE_TIMEOUT_MS) {
      await AdminSession.deleteOne({ _id: session._id });
      return false;
    }

    // البصمة اتغيّرت = الكوكي بيتستخدم من جهاز تاني → الجلسة بتتمسح.
    // الجلسات اللي اتعملت بالبصمة القديمة (الـ User-Agent كله) بتتنقل للجديدة.
    const set = { lastSeenAt: now };
    if (session.fingerprint && session.fingerprint !== fingerprintOf(req)) {
      if (session.fingerprint !== legacyFingerprintOf(req)) {
        console.warn('[admin] session used from a different device — closing it');
        await AdminSession.deleteOne({ _id: session._id });
        return false;
      }
      set.fingerprint = fingerprintOf(req);
    }
    const ip = maskedIp(req);
    if (ip && ip !== session.ip) set.ip = ip;
    if (!session.device) { const ua = uaOf(req); set.device = `${osOf(ua)} · ${browserOf(ua)}`; }

    // تجديد التوكن كل يوم (بس للجلسات المشفّرة، ولو معانا res نحط الكوكي الجديد)
    const rotatedAt = session.rotatedAt || session.createdAt || now;
    if (res && session.hashed && now - new Date(rotatedAt) > ROTATE_EVERY_MS && session.token === hashToken(token)) {
      const fresh = crypto.randomBytes(32).toString('hex');
      const r = await AdminSession.updateOne(
        { _id: session._id, token: session.token },
        { $set: { ...set, token: hashToken(fresh), prevToken: session.token, prevGraceUntil: new Date(now.getTime() + ROTATION_GRACE_MS), rotatedAt: now } },
      );
      // لو طلب تاني جدد في نفس اللحظة، نسيبه هو (الكوكي القديم لسه في فترة السماح)
      if (r.modifiedCount) res.cookie(ADMIN_COOKIE_NAME, fresh, cookieOptions());
      req.adminSessionId = String(session._id);
      return true;
    }

    // تحديث آخر نشاط — مش بننتظره عشان ميبطّأش كل طلب
    AdminSession.updateOne({ _id: session._id }, { $set: set }).catch(() => {});
    req.adminSessionId = String(session._id);
    return true;
  } catch (err) {
    console.error('Admin session check failed:', err.message);
    return false;
  }
}

/**
 * بيتأكد إن فيه جلسة أدمن صالحة قبل أي مسار API محمي؛ 401 لو لأ.
 * وكمان بيرفض أي طلب مش جاي من اللوحة نفسها (حماية CSRF).
 */
async function requireAdminSession(req, res, next) {
  // الطلبات اللي بتغيّر حاجة لازم تحمل الهيدر. القراءة كمان بنطلبه منها
  // عشان مايتسربش أي بيانات عملاء لصفحة تانية بـ <script src> أو ما شابه.
  if (req.headers[ADMIN_REQUEST_HEADER] !== '1') {
    return res.status(403).json({ error: 'الطلب ده مرفوض.' });
  }
  // الحارس العام على /admin/api (server.js) اتأكد خلاص في نفس الطلب
  if (req.adminSessionOk) return next();
  const valid = await hasValidAdminSession(req, res);
  if (!valid) return res.status(401).json({ error: 'لازم تسجل دخول للوحة التحكم الأول.', locked: true });
  req.adminSessionOk = true;
  return next();
}

/** بيقفل كل جلسات اللوحة المفتوحة على أي جهاز تاني */
async function destroyOtherAdminSessions(req) {
  const keep = req.adminSessionId;
  if (!keep) {
    const token = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    const ids = token ? [hashToken(token), token] : [];
    const r = await AdminSession.deleteMany({ token: { $nin: ids }, prevToken: { $nin: ids } });
    return r.deletedCount || 0;
  }
  const r = await AdminSession.deleteMany({ _id: { $ne: keep } });
  return r.deletedCount || 0;
}

module.exports = {
  isValidAdminKey, createAdminSession, destroyAdminSession, destroyOtherAdminSessions,
  hasValidAdminSession, requireAdminSession, fingerprintOf, hashToken,
  ADMIN_COOKIE_NAME, ADMIN_REQUEST_HEADER, ADMIN_IDLE_TIMEOUT_MS,
};
