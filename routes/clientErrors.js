// routes/clientErrors.js
// POST /api/client-error — الواجهة بتبلّغ عن أي انهيار حصل عند العميل
// (ErrorBoundary). بيتسجّل في ClientError وبيبان في لوحة التحكم ← "أعطال
// الواجهة"، فأي مشكلة عميل شافها نعرف سببها بالظبط بدل التخمين.
const express = require('express');

const ClientError = require('../models/ClientError');
const { requireAdminSession } = require('../middleware/adminAuth');

const router = express.Router();

const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

router.post('/api/client-error', async (req, res) => {
  try {
    const b = req.body || {};
    const message = clip(b.message, 500).trim();
    if (!message) return res.status(204).end();
    await ClientError.create({
      message,
      stack: clip(b.stack, 4000),
      componentStack: clip(b.componentStack, 4000),
      path: clip(b.path, 200).split(/[?#]/)[0],
      where: clip(b.where, 80),
      context: clip(b.context, 500),
      userAgent: clip(req.get('user-agent'), 300),
      userId: req.user ? req.user._id : null,
    });
    // في لوجات السيرفر كمان (Vercel) — عشان يبان حتى من غير اللوحة
    console.error('[client-error]', message, '|', clip(b.path, 120), '|', clip(b.where, 60));
    return res.status(204).end();
  } catch (err) {
    console.error('Client error report failed:', err.message);
    return res.status(204).end();
  }
});

// GET /admin/api/client-errors — آخر الأعطال (للوحة التحكم)
router.get('/admin/api/client-errors', requireAdminSession, async (req, res) => {
  try {
    const rows = await ClientError.find({}).sort({ createdAt: -1 }).limit(100)
      .populate('userId', 'name email').lean();
    return res.json({
      errors: rows.map((r) => ({
        id: String(r._id),
        message: r.message,
        stack: r.stack,
        componentStack: r.componentStack,
        path: r.path,
        where: r.where,
        context: r.context,
        userAgent: r.userAgent,
        user: r.userId ? { id: String(r.userId._id), name: r.userId.name, email: r.userId.email } : null,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error listing client errors:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
