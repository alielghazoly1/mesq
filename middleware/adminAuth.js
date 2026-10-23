// middleware/adminAuth.js
// جلسة لوحة التحكم — بديل آمن لتمرير ADMIN_SECRET في كل طلب عبر الـ URL
// (?key=...، اللي كان بيتسجل في server logs وتاريخ المتصفح). المستخدم بيدخل
// المفتاح مرة واحدة (POST /admin/login)، وبعدها كوكي httpOnly بيتابع الجلسة.
//
// طبقات الحماية هنا، وكل واحدة بتغطي حاجة مختلفة:
//   1) الكوكي httpOnly    → جافاسكريبت (وأي XSS) مش شايفة التوكن أصلًا
//   2) sameSite: 'strict' → المتصفح مبيبعتش الكوكي من أي موقع تاني خالص
//   3) هيدر X-Admin-Request → أي طلب من موقع تاني لازم يعدي على preflight،
//      والـ CORS بتاعنا بيرفضه. ده بيقفل CSRF حتى لو الـ sameSite اتحايل عليه
//   4) بصمة المتصفح       → كوكي متسروق ومستخدم من جهاز تاني بيترفض
//   5) خمول 5 دقايق        → اللوحة بتقفل لوحدها لو محدش استخدمها 5 دقايق
//      (بطلب المالك). "استخدام" = لمسة/كتابة/سكرول من الأدمن نفسه (هيدر
//      X-Admin-Active من اللوحة) — التحديث التلقائي في الخلفية مش بيحسب،
//      فاللوحة المفتوحة والمسابة بتقفل برضه.
const crypto = require('crypto');
const connectDB = require('../config/db');
const AdminSession = require('../models/AdminSession');

const ADMIN_COOKIE_NAME = 'wda_admin_session';
// 24 ساعة — أقصر بكتير من جلسة المستخدم العادي لأنه مفتاح مشترك عالي الصلاحية
const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
// أقصى مدة من غير استخدام فعلي قبل ما الجلسة تلغي نفسها (بطلب المالك)
const ADMIN_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
// اللوحة بتبعته مع أي طلب لو الأدمن لمس الشاشة في آخر دقيقة
const ADMIN_ACTIVE_HEADER = 'x-admin-active';
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

/** بصمة خفيفة للمتصفح — مش سر، مجرد حاجة تتغيّر لو الكوكي اتنقل لجهاز تاني */
function fingerprintOf(req) {
  const ua = String((req.headers && req.headers['user-agent']) || '');
  return crypto.createHash('sha256').update(ua).digest('hex').slice(0, 32);
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

/** الجلسة من الكوكي — بالبصمة، أو بالتوكن نفسه للجلسات القديمة (قبل التشفير) لحد ما تخلص */
async function findSessionByToken(token) {
  // الجديدة: بالبصمة بس. القديمة: بالتوكن نفسه — بشرط إنها مش جلسة جديدة
  // (غير كده أي حد شاف البصمة في قاعدة البيانات كان يقدر يحطها كوكي)
  return (await AdminSession.findOne({ token: hashToken(token), hashed: true }))
    || AdminSession.findOne({ token, hashed: { $ne: true } });
}

async function createAdminSession(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);
  await AdminSession.create({
    token: hashToken(token),
    hashed: true,
    expiresAt,
    fingerprint: fingerprintOf(req),
    lastSeenAt: new Date(),
    lastActiveAt: new Date(),
  });
  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions());
}

async function destroyAdminSession(req, res) {
  const token = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
  if (token) {
    try { await AdminSession.deleteMany({ token: { $in: [hashToken(token), token] } }); } catch { /* تجاهل، المهم مسح الكوكي في كل الأحوال */ }
  }
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
}

/**
 * بيتحقق من الجلسة ويحدّث آخر نشاط.
 * @returns {Promise<boolean>}
 */
async function hasValidAdminSession(req) {
  try {
    const token = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (!token) return false;
    await connectDB();

    const session = await findSessionByToken(token);
    if (!session) return false;

    const now = new Date();
    if (session.expiresAt <= now) return false;

    // 5 دقايق من غير استخدام فعلي = الجلسة خلاص (الجلسات القديمة من قبل
    // الحقل ده بتتحسب من آخر طلب)
    const lastActive = session.lastActiveAt || session.lastSeenAt || session.createdAt || now;
    if (now - new Date(lastActive) > ADMIN_IDLE_TIMEOUT_MS) {
      await AdminSession.deleteOne({ _id: session._id });
      return false;
    }

    // البصمة اتغيّرت = الكوكي بيتستخدم من متصفح تاني
    // (الجلسات القديمة مالهاش بصمة محفوظة، فبنعديها)
    if (session.fingerprint && session.fingerprint !== fingerprintOf(req)) {
      await AdminSession.deleteOne({ _id: session._id });
      return false;
    }

    // تحديث آخر نشاط — مش بننتظره عشان ميبطّأش كل طلب. "استخدام فعلي" بس
    // لو اللوحة قالت إن الأدمن لمس الشاشة (مش تحديث تلقائي في الخلفية)
    const set = { lastSeenAt: now };
    if (req.headers && req.headers[ADMIN_ACTIVE_HEADER] === '1') set.lastActiveAt = now;
    AdminSession.updateOne({ _id: session._id }, { $set: set }).catch(() => {});
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
  const valid = await hasValidAdminSession(req);
  if (!valid) return res.status(401).json({ error: 'لازم تسجل دخول للوحة التحكم الأول.', locked: true });
  req.adminSessionOk = true;
  return next();
}

/** بيقفل كل جلسات اللوحة المفتوحة على أي جهاز تاني (بعد تفعيل التحقق بخطوتين) */
async function destroyOtherAdminSessions(req) {
  const token = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
  const keep = token ? [hashToken(token), token] : [];
  const r = await AdminSession.deleteMany({ token: { $nin: keep } });
  return r.deletedCount || 0;
}

module.exports = {
  isValidAdminKey, createAdminSession, destroyAdminSession, destroyOtherAdminSessions,
  hasValidAdminSession, requireAdminSession, fingerprintOf, hashToken,
  ADMIN_COOKIE_NAME, ADMIN_REQUEST_HEADER, ADMIN_IDLE_TIMEOUT_MS,
};
