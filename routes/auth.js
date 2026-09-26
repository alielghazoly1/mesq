// routes/auth.js
// تسجيل/دخول/خروج المستخدمين — إنشاء الدعوات بالتصاميم المجانية يفضل
// شغال من غير أي حساب زي ما هو بالظبط؛ الحسابات دي البنية التحتية للتحكم
// في الوصول لأي محتوى مميز مستقبلي (templates/registry.js: isPremium).
const express = require('express');

const User = require('../models/User');
const { sanitizeText } = require('../utils/sanitize');
const { isValidEmail, isValidPassword, isValidCountryCode } = require('../utils/validators');
const { createSession, destroySession } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../utils/password');
const { sendWelcomeMessage } = require('../utils/welcomeMessage');
const { editWindowInfo } = require('../utils/editWindow');

const router = express.Router();

// نفس رسالة الخطأ بالظبط لإيميل مش موجود أو باسورد غلط — عشان محدش يقدر
// يكتشف إيه إيميلات مسجلة فعليًا على الموقع (منع user enumeration).
const GENERIC_LOGIN_ERROR = 'بيانات الدخول غير صحيحة.';

router.post('/api/auth/register', async (req, res) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');
    const name = sanitizeText(req.body && req.body.name, 80);
    const country = String((req.body && req.body.country) || '').trim().toUpperCase();
    // رقم التليفون اختياري — بنسيب بس الأرقام و + و - و () والمسافات
    const phone = String((req.body && req.body.phone) || '')
      .replace(/[^\d+\-() ]/g, '').trim().slice(0, 30);

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'من فضلك اكتب إيميل صحيح.' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'الباسورد لازم يكون 8 حروف على الأقل.' });
    }
    if (!name) {
      return res.status(400).json({ error: 'من فضلك اكتب اسمك.' });
    }
    if (!isValidCountryCode(country)) {
      return res.status(400).json({ error: 'من فضلك اختار الدولة.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'الإيميل ده مسجل بالفعل، جرب تسجل الدخول.' });
    }

    // لو سجّل من لينك إحالة UGC، بنربطه بالمسوّق (مرة واحدة وقت التسجيل بس).
    // بنتأكد إن الكود بتاع UGC شغّال فعلًا قبل ما نربط.
    let referredBy = null;
    const refCode = String((req.cookies && req.cookies.mithaq_ref) || '').slice(0, 40);
    if (refCode) {
      const refExists = await User.exists({ referralCode: refCode, isUgc: true });
      if (refExists) referredBy = refCode;
    }

    const passwordHash = await hashPassword(password);
    let user;
    try {
      user = await User.create({ email, passwordHash, name, country, phone, referredBy });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'الإيميل ده مسجل بالفعل، جرب تسجل الدخول.' });
      }
      throw err;
    }

    await createSession(res, user._id);
    // خلصنا الربط — نمسح كوكي الإحالة عشان مايتربطش بحساب تاني بعدين
    if (referredBy) res.clearCookie('mithaq_ref', { path: '/' });

    // رسالة ترحيب تستناه في صندوق رسايله. مش بننتظرها (ولا بنوقف عليها
    // لو فشلت) — الحساب اتعمل خلاص والرد لازم يوصل له فورًا.
    sendWelcomeMessage(user);

    return res.status(201).json({
      user: { id: String(user._id), email: user.email, name: user.name, country: user.country },
      // الواجهة بتستخدمها عشان تعرض شاشة الترحيب مرة واحدة بس
      isNew: true,
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');

    if (!email || !password) {
      return res.status(400).json({ error: GENERIC_LOGIN_ERROR });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    const match = await verifyPassword(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    // الحساب المحظور بيترفض هنا صراحةً. من غير الفحص ده كان بياخد "نجح"
    // ويتعملّه جلسة، وبعدين attachUser يلغيها — فيشوف نفسه مطلوع من غير
    // ما يفهم ليه، وكل محاولة دخول بتكتب صف جلسة على الفاضي.
    // بنقولّه السبب بوضوح (مش نفس رسالة الباسورد الغلط): هو أثبت إنه
    // صاحب الحساب فعلًا، فالغموض هنا مش بيحمي حاجة.
    if (user.isBlocked) {
      return res.status(403).json({ error: 'الحساب ده متوقف. كلّمنا لو محتاج تفاصيل.' });
    }

    await createSession(res, user._id);
    return res.json({ user: { id: String(user._id), email: user.email, name: user.name, country: user.country } });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

router.post('/api/auth/logout', async (req, res) => {
  try {
    await destroySession(req, res);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error logging out:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر.' });
  }
});

// بترجع 200 دايمًا (مش 401) عشان الفرونت إند يتأكد من حالة الدخول بسهولة
// عند كل تحميل صفحة من غير ما يحتاج يتعامل مع حالة خطأ للزائر المجهول
// (اللي هو الغالبية العظمى من الزوار).
router.get('/api/auth/me', (req, res) => {
  // حالة مدة التعديل بتتحسب هنا في السيرفر وتتبعت جاهزة — الواجهة مبتحسبهاش
  // من ساعة جهاز العميل (ممكن تكون غلط)
  return res.json({
    user: req.user ? { ...req.user, edit: editWindowInfo(req.user.subscription) } : null,
  });
});

module.exports = router;
