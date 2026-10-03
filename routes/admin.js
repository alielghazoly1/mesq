// routes/admin.js
// دخول وخروج لوحة التحكم بس. اللوحة نفسها بقت تطبيق React
// (client/src/pages/admin) وبياناتها كلها في routes/adminApi.js.
//
// المفتاح (ADMIN_SECRET) بيتبعت مرة واحدة هنا، وبعدها جلسة بكوكي httpOnly
// بتتابع الدخول (middleware/adminAuth.js) — بدل ما يفضل المفتاح متسجل في
// الـ URL (server logs، تاريخ المتصفح) في كل طلب.
const express = require('express');

const {
  isValidAdminKey, createAdminSession, destroyAdminSession, hasValidAdminSession,
} = require('../middleware/adminAuth');
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
  RateLimit.deleteMany({ deviceId: ipKey }).catch(() => {});
  try {
    await createAdminSession(req, res);
    logAdminAction(req, 'login.ok', { type: 'admin', label: 'دخول للوحة' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error creating admin session:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
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
