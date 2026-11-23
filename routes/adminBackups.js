// routes/adminBackups.js
// النسخ الاحتياطي اليومي في اللوحة (صفحة الأمان): آخر نسخة، تنزيل أي نسخة، و"اعمل نسخة دلوقتي".
// الملفات فيها بيانات كل العملاء — فالتنزيل بجلسة أدمن بس (والحارس العام على /admin/api)،
// والاسم لازم يطابق شكل اسم النسخة بالظبط (مفيش ../ ولا أي ملف تاني)، وكل تنزيل بيتسجّل.
const express = require('express');
const { requireAdminSession } = require('../middleware/adminAuth');
const { logAdminAction } = require('../utils/adminAudit');
const { listBackups, backupPath, getStatus, backupAndRecord, KEEP } = require('../utils/backup');

const router = express.Router();

router.get('/admin/api/backups', requireAdminSession, async (req, res) => {
  try {
    const [files, status] = await Promise.all([listBackups(), getStatus()]);
    return res.json({ files, status, keep: KEEP });
  } catch (err) {
    console.error('Error listing backups:', err.message);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

router.post('/admin/api/backups/run', requireAdminSession, async (req, res) => {
  try {
    const r = await backupAndRecord('manual');
    logAdminAction(req, 'backup.run', { type: 'backup', id: r.file, label: 'نسخة احتياطية يدوي' });
    return res.json({ ok: true, file: r.file, bytes: r.bytes, docs: r.docs, ms: r.ms });
  } catch (err) {
    return res.status(500).json({ error: 'النسخة فشلت: ' + String(err.message).slice(0, 160) });
  }
});

router.get('/admin/api/backups/file/:name', requireAdminSession, (req, res) => {
  const file = backupPath(req.params.name);
  if (!file) return res.status(400).json({ error: 'اسم ملف غلط' });
  logAdminAction(req, 'backup.download', { type: 'backup', id: req.params.name, label: 'تنزيل نسخة احتياطية' });
  res.setHeader('Cache-Control', 'no-store');
  return res.download(file, req.params.name, { dotfiles: 'deny' }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'النسخة دي مش موجودة' });
  });
});

module.exports = router;
