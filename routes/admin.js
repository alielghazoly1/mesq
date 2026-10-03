// routes/admin.js
// دخول وخروج لوحة التحكم بس. اللوحة نفسها بقت تطبيق React
// (client/src/pages/admin) وبياناتها كلها في routes/adminApi.js.
//
// المفتاح (ADMIN_SECRET) بيتبعت مرة واحدة هنا، وبعدها جلسة بكوكي httpOnly
// بتتابع الدخول (middleware/adminAuth.js) — بدل ما يفضل المفتاح متسجل في
// الـ URL (server logs، تاريخ المتصفح) في كل طلب.
const express = require('express');

const crypto = require('crypto');
const {
  isValidAdminKey, createAdminSession, destroyAdminSession, hasValidAdminSession,
  fingerprintOf, hashToken,
} = require('../middleware/adminAuth');
const AdminLoginTicket = require('../models/AdminLoginTicket');
const twoFactor = require('../utils/adminTwoFactor');
const connectDB = require('../config/db');
const RateLimit = require('../models/RateLimit');
const { hashIp } = require('../middleware/freeQuota');
const { logAdminAction } = require('../utils/adminAudit');

const router = express.Router();

// ===== قفل تخمين كلمة السر — في قاعدة البيانات =====
// الحد اللي في server.js (express-rate-limit) متخزّن في ذاكرة كل نسخة سيرفر،
// وعلى Vercel النسخ بتتعمل وتتقفل طول الوقت — فعمليًا كان ممكن حد يجرّب
// كلمات سر من غير حد حقيقي. هنا العدّ في مونجو (مشترك بين كل النسخ):
//   - 5 محاولات غلط من نفس الجهاز/الشبكة في 15 دقيقة → مقفول 15 دقيقة
//   - 60 محاولة غلط من كل الدنيا في 15 دقيقة (هجوم موزّع) → الدخول مقفول
//     ربع ساعة للكل
// المحاولة الصح بتمسح عدّاد جهازها. وكل محاولة غلط بتتسجّل في سجل الإجراءات.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_GLOBAL = 60;

function windowStartNow() { return new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS); }
async function failedCount(key) {
  const row = await RateLimit.findOne({ deviceId: key, windowStart: windowStartNow() }).lean();
  return row ? row.count : 0;
}
async function addFailure(key) {
  const ws = windowStartNow();
  await RateLimit.updateOne(
    { deviceId: key, windowStart: ws },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(ws.getTime() + 2 * WINDOW_MS) } },
    { upsert: true }
  ).catch(() => {});
}

router.post('/admin/login', async (req, res) => {
  const key = req.body && req.body.key;
  const ipKey = 'adminlogin:' + (hashIp(req.ip) || 'unknown');
  const allKey = 'adminlogin:all';
  try {
    await connectDB();
    const [mine, all] = await Promise.all([failedCount(ipKey), failedCount(allKey)]);
    if (mine >= MAX_PER_IP || all >= MAX_GLOBAL) {
      return res.status(429).json({ error: 'محاولات كتير غلط — الدخول مقفول ربع ساعة. جرّب بعدين.' });
    }
  } catch (err) {
    // لو قاعدة البيانات مش متاحة مبنفتحش باب للتخمين: نرفض الدخول مؤقتًا
    console.error('Admin login lockout check failed:', err.message);
    return res.status(503).json({ error: 'حصل خطأ في السيرفر، جرّب تاني بعد شوية.' });
  }
  if (!isValidAdminKey(key)) {
    await Promise.all([addFailure(ipKey), addFailure(allKey)]);
    logAdminAction(req, 'login.failed', { type: 'admin', label: 'محاولة دخول بكلمة سر غلط' });
    // رسالة واحدة لكل حالات الفشل — من غير تفرقة بين "مفيش مفتاح متظبط
    // على السيرفر" و"المفتاح غلط"، عشان مانديش أي معلومة لحد بيجرّب.
    return res.status(401).json({ error: 'كلمة السر غلط.' });
  }
  try {
    // التحقق بخطوتين مفعّل: كلمة السر لوحدها مش كفاية — بنديله تذكرة
    // (كوكي httpOnly لمدة 5 دقايق) ونستنى كود الموبايل. عدّاد المحاولات
    // الغلط مبيتمسحش غير بعد الكود الصح.
    if (await twoFactor.isEnabled()) {
      const token = crypto.randomBytes(32).toString('hex');
      await AdminLoginTicket.create({
        tokenHash: hashToken(token),
        fingerprint: fingerprintOf(req),
        expiresAt: new Date(Date.now() + TICKET_MS),
      });
      res.cookie(TICKET_COOKIE, token, ticketCookieOptions());
      return res.json({ needCode: true });
    }
    RateLimit.deleteMany({ deviceId: ipKey }).catch(() => {});
    await createAdminSession(req, res);
    logAdminAction(req, 'login.ok', { type: 'admin', label: 'دخول للوحة' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error creating admin session:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// ===== الخطوة التانية: كود الموبايل (أو كود احتياطي) =====
const TICKET_COOKIE = 'wda_admin_otp';
const TICKET_MS = 5 * 60 * 1000;
const MAX_CODE_TRIES = 5;
const ticketCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: TICKET_MS,
  path: '/admin',
});

router.post('/admin/login/verify', async (req, res) => {
  const ipKey = 'adminlogin:' + (hashIp(req.ip) || 'unknown');
  const allKey = 'adminlogin:all';
  const token = req.cookies && req.cookies[TICKET_COOKIE];
  const restart = (msg) => {
    res.clearCookie(TICKET_COOKIE, { path: '/admin' });
    return res.status(401).json({ error: msg, restart: true });
  };
  try {
    await connectDB();
    const [mine, all] = await Promise.all([failedCount(ipKey), failedCount(allKey)]);
    if (mine >= MAX_PER_IP || all >= MAX_GLOBAL) {
      res.clearCookie(TICKET_COOKIE, { path: '/admin' });
      return res.status(429).json({ error: 'محاولات كتير غلط — الدخول مقفول ربع ساعة. جرّب بعدين.', restart: true });
    }
    if (!token) return restart('الوقت خلص — ادخل كلمة السر تاني.');
    const ticket = await AdminLoginTicket.findOne({ tokenHash: hashToken(token) });
    if (!ticket || ticket.expiresAt <= new Date() || ticket.fingerprint !== fingerprintOf(req)) {
      if (ticket) await AdminLoginTicket.deleteOne({ _id: ticket._id });
      return restart('الوقت خلص — ادخل كلمة السر تاني.');
    }
    const kind = await twoFactor.checkCode(req.body && req.body.code);
    if (!kind) {
      await Promise.all([addFailure(ipKey), addFailure(allKey)]);
      logAdminAction(req, 'login.2fa_failed', { type: 'admin', label: 'كود تحقق غلط بعد كلمة سر صح' });
      const t = await AdminLoginTicket.findOneAndUpdate({ _id: ticket._id }, { $inc: { attempts: 1 } }, { new: true });
      if (!t || t.attempts >= MAX_CODE_TRIES) {
        await AdminLoginTicket.deleteOne({ _id: ticket._id });
        return restart('الكود غلط كذا مرة — ادخل كلمة السر من الأول.');
      }
      return res.status(401).json({ error: 'الكود غلط — اكتب الكود اللي ظاهر دلوقتي في التطبيق.' });
    }
    await AdminLoginTicket.deleteOne({ _id: ticket._id });
    res.clearCookie(TICKET_COOKIE, { path: '/admin' });
    RateLimit.deleteMany({ deviceId: ipKey }).catch(() => {});
    await createAdminSession(req, res);
    logAdminAction(req, 'login.ok', { type: 'admin', label: kind === 'backup' ? 'دخول بكود احتياطي' : 'دخول للوحة (بخطوتين)' });
    return res.json({ ok: true, usedBackup: kind === 'backup' });
  } catch (err) {
    console.error('Admin 2FA verify failed:', err);
    return res.status(503).json({ error: 'حصل خطأ في السيرفر، جرّب تاني بعد شوية.' });
  }
});

router.post('/admin/logout', async (req, res) => {
  try {
    await destroyAdminSession(req, res);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error destroying admin session:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// بترجع 200 دايمًا — واجهة اللوحة بتسأل الأول عشان تعرف تعرض شاشة الدخول
// ولا اللوحة، من غير ما تتعامل مع حالة خطأ.
router.get('/admin/session', async (req, res) => {
  const valid = await hasValidAdminSession(req);
  return res.json({ authenticated: valid });
});

module.exports = router;
