// routes/account.js
// حساب العميل من لوحته: بياناته (الاسم والموبايل)، تغيير الباسورد (أو
// إضافة باسورد لحساب جوجل)، والخروج من كل الأجهزة التانية.
const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../utils/sanitize');
const { hashPassword, verifyPassword } = require('../utils/password');
const { isValidPassword } = require('../utils/validators');

const router = express.Router();

/** كل جلسات المستخدم ماعدا الجلسة الحالية */
function otherSessionsFilter(req) {
  const f = { userId: req.user._id };
  if (req.sessionFamilyId) f.familyId = { $ne: req.sessionFamilyId };
  else if (req.sessionDocId) f._id = { $ne: req.sessionDocId };
  return f;
}

// GET /api/account
router.get('/api/account', requireAuth, async (req, res) => {
  try {
    const [user, sessions] = await Promise.all([
      User.findById(req.user.id).select('name email phone country googleId passwordHash createdAt').lean(),
      Session.countDocuments({ userId: req.user._id, expiresAt: { $gt: new Date() } }),
    ]);
    if (!user) return res.status(404).json({ error: 'الحساب مش موجود.' });
    return res.json({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      google: !!user.googleId,
      hasPassword: !!user.passwordHash,
      createdAt: user.createdAt,
      sessions,
    });
  } catch (err) {
    console.error('Account load failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// PATCH /api/account — الاسم والموبايل
router.patch('/api/account', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const set = {};
    if (b.name !== undefined) {
      const name = sanitizeText(b.name, 80);
      if (name.length < 2) return res.status(400).json({ error: 'اكتب اسمك (حرفين على الأقل).', field: 'name' });
      set.name = name;
    }
    if (b.phone !== undefined) {
      const phone = String(b.phone || '').replace(/[^\d+\-() ]/g, '').trim().slice(0, 30);
      if (phone && phone.replace(/\D/g, '').length < 8) return res.status(400).json({ error: 'رقم الموبايل ناقص.', field: 'phone' });
      if (phone && await User.exists({ phone, _id: { $ne: req.user._id } })) {
        return res.status(409).json({ error: 'رقم التليفون ده مستخدم في حساب تاني.', field: 'phone' });
      }
      set.phone = phone;
    }
    if (!Object.keys(set).length) return res.status(400).json({ error: 'مفيش حاجة اتغيّرت.' });
    try {
      await User.updateOne({ _id: req.user._id }, { $set: set });
    } catch (err) {
      if (err && err.code === 11000) return res.status(409).json({ error: 'رقم التليفون ده مستخدم في حساب تاني.', field: 'phone' });
      throw err;
    }
    return res.json({ ok: true, ...set });
  } catch (err) {
    console.error('Account update failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/account/password — {current, next}. حساب جوجل من غير باسورد
// يقدر يضيف واحد من غير "الحالي". بعد التغيير كل الأجهزة التانية بتخرج.
router.post('/api/account/password', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const next = String(b.next || '');
    const user = await User.findById(req.user.id).select('passwordHash');
    if (!user) return res.status(404).json({ error: 'الحساب مش موجود.' });
    if (user.passwordHash) {
      const ok = await verifyPassword(String(b.current || ''), user.passwordHash);
      if (!ok) return res.status(400).json({ error: 'الباسورد الحالي مش صح.', field: 'current' });
    }
    if (!isValidPassword(next)) return res.status(400).json({ error: 'الباسورد الجديد لازم يكون 6 حروف أو أرقام على الأقل.', field: 'next' });
    if (user.passwordHash && await verifyPassword(next, user.passwordHash)) {
      return res.status(400).json({ error: 'ده نفس الباسورد القديم — اختار واحد جديد.', field: 'next' });
    }
    user.passwordHash = await hashPassword(next);
    await user.save();
    const out = await Session.deleteMany(otherSessionsFilter(req));
    return res.json({ ok: true, loggedOutOthers: out.deletedCount || 0 });
  } catch (err) {
    console.error('Password change failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// POST /api/account/logout-others — اخرج من كل الأجهزة التانية
router.post('/api/account/logout-others', requireAuth, async (req, res) => {
  try {
    const out = await Session.deleteMany(otherSessionsFilter(req));
    return res.json({ ok: true, loggedOut: out.deletedCount || 0 });
  } catch (err) {
    console.error('Logout others failed:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

module.exports = router;
