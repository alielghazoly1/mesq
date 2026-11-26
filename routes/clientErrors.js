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

// GET /admin/api/client-errors/export — ملف JSON بكل الأعطال المتسجّلة (آخر 60 يوم) عشان يتبعت للمطوّر:
// ملخص متجمّع (نفس الخطأ في كذا مكان = سطر واحد بعدده وأول وآخر مرة والصفحات والأجهزة) + كل سجل بتفاصيله.
// من غير أسامي أو إيميلات العملاء (رقم الحساب بس) — الملف بيتبعت برّه اللوحة.
const SHORT_ID_RE = /\/[A-Za-z0-9]{7}(?=\/|$)/g;
const deviceOf = (ua) => (/iPhone|iPad/.test(ua || '') ? 'iOS' : /Android/.test(ua || '') ? 'Android' : /Windows|Macintosh|Linux|CrOS/.test(ua || '') ? 'desktop' : 'other');
router.get('/admin/api/client-errors/export', requireAdminSession, async (req, res) => {
  try {
    const rows = await ClientError.find({}).sort({ createdAt: -1 }).limit(5000).lean();
    const groups = new Map();
    for (const r of rows) {
      const key = `${String(r.message || '').slice(0, 200)}\u0000${r.where || ''}`;
      let g = groups.get(key);
      if (!g) {
        g = { message: r.message || '', where: r.where || '', count: 0, firstAt: r.createdAt, lastAt: r.createdAt, paths: {}, devices: {}, users: new Set(), sampleStack: r.stack || '', sampleComponentStack: r.componentStack || '', sampleContext: r.context || '' };
        groups.set(key, g);
      }
      g.count += 1;
      if (r.createdAt < g.firstAt) g.firstAt = r.createdAt;
      if (r.createdAt > g.lastAt) g.lastAt = r.createdAt;
      const p = String(r.path || '').replace(SHORT_ID_RE, '/:id');
      g.paths[p] = (g.paths[p] || 0) + 1;
      const d = deviceOf(r.userAgent);
      g.devices[d] = (g.devices[d] || 0) + 1;
      if (r.userId) g.users.add(String(r.userId));
    }
    const summary = [...groups.values()]
      .sort((a, b) => b.count - a.count)
      .map((g) => ({ ...g, users: g.users.size }));
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="mithaq-client-errors-${day}.json"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(JSON.stringify({
      site: 'mithaq-invitation.com',
      generatedAt: new Date().toISOString(),
      total: rows.length,
      distinct: summary.length,
      summary,
      errors: rows.map((r) => ({
        at: r.createdAt,
        message: r.message,
        where: r.where,
        path: r.path,
        context: r.context,
        device: deviceOf(r.userAgent),
        userAgent: r.userAgent,
        userId: r.userId ? String(r.userId) : null,
        stack: r.stack,
        componentStack: r.componentStack,
      })),
    }, null, 2));
  } catch (err) {
    console.error('Error exporting client errors:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
