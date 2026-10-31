// routes/auth.js
// تسجيل/دخول/خروج المستخدمين — إنشاء الدعوات بالتصاميم المجانية يفضل
// شغال من غير أي حساب زي ما هو بالظبط؛ الحسابات دي البنية التحتية للتحكم
// في الوصول لأي محتوى مميز مستقبلي (templates/registry.js: isPremium).
const express = require('express');

const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { sanitizeText } = require('../utils/sanitize');
const { isValidEmail, isValidPassword, isValidCountryCode } = require('../utils/validators');
const { createSession, destroySession } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../utils/password');
const { sendWelcomeMessage } = require('../utils/welcomeMessage');
const { editWindowInfo } = require('../utils/editWindow');
const { verifyGoogleIdToken, signPending, readPending, getGoogleConfig } = require('../utils/googleAuth');
const metaCapi = require('../utils/metaCapi');

const router = express.Router();

// نفس رسالة الخطأ بالظبط لإيميل مش موجود أو باسورد غلط — عشان محدش يقدر
// يكتشف إيه إيميلات مسجلة فعليًا على الموقع (منع user enumeration).
const GENERIC_LOGIN_ERROR = 'بيانات الدخول غير صحيحة.';

/**
 * لينك إحالة UGC أو لينك إعلان اتفتح قبل التسجيل؟ (كوكيز mithaq_ref و
 * mithaq_cmp) — بيتربطوا بالحساب الجديد مرة واحدة وقت التسجيل بس، بنفس
 * الطريقة سواء سجّل بالإيميل أو بجوجل. بنتأكد إن الكود شغّال فعلًا الأول.
 */
async function attributionFromCookies(req) {
  let referredBy = null;
  const refCode = String((req.cookies && req.cookies.mithaq_ref) || '').slice(0, 40);
  if (refCode) {
    const refExists = await User.exists({ referralCode: refCode, isUgc: true });
    if (refExists) referredBy = refCode;
  }
  // كوكي الإعلان بيتحط في /go/<code> ويعيش 30 يوم — المالك يعرف الإعلان جاب مين ودفع مين
  let campaign = null;
  const cmpCode = String((req.cookies && req.cookies.mithaq_cmp) || '').toLowerCase().slice(0, 40);
  if (cmpCode && /^[a-z0-9-]+$/.test(cmpCode)) {
    try {
      if (await Campaign.exists({ code: cmpCode })) campaign = cmpCode;
    } catch (e) { /* الإعلان مش لازم يوقّف التسجيل */ }
  }
  return { referredBy, campaign };
}

// خلصنا الربط — نمسح الكوكيز عشان مايتربطوش بحساب تاني بعدين
function clearAttribution(res, { referredBy, campaign }) {
  if (referredBy) res.clearCookie('mithaq_ref', { path: '/' });
  if (campaign) { res.clearCookie('mithaq_cmp', { path: '/' }); res.clearCookie('mithaq_cmp_c', { path: '/' }); }
}

const publicUser = (user) => ({ id: String(user._id), email: user.email, name: user.name, country: user.country });

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
      return res.status(400).json({ error: 'الباسورد لازم يكون 6 حروف أو أرقام على الأقل.' });
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
    // التليفون اختياري — بس لو كتبه، لازم ميكونش مستخدم في حساب تاني.
    // رسالة خاصة بيه عشان متتلخبطش مع رسالة الإيميل.
    if (phone) {
      const phoneTaken = await User.findOne({ phone });
      if (phoneTaken) {
        return res.status(409).json({ error: 'رقم التليفون ده مستخدم في حساب تاني.' });
      }
    }

    const { referredBy, campaign } = await attributionFromCookies(req);

    const passwordHash = await hashPassword(password);
    let user;
    try {
      user = await User.create({
        email, passwordHash, name, country, phone, referredBy,
        campaign, campaignAt: campaign ? new Date() : null,
      });
    } catch (err) {
      // خطأ "قيمة مكررة" — نعرف الحقل بالظبط ونرجّع رسالته الصح، مش
      // نقول "الإيميل مسجل" على طول (اللي كان بيلخبط لو التعارض في التليفون).
      if (err.code === 11000) {
        const dupKey = err.keyPattern || err.keyValue || {};
        if ('phone' in dupKey) {
          return res.status(409).json({ error: 'رقم التليفون ده مستخدم في حساب تاني.' });
        }
        return res.status(409).json({ error: 'الإيميل ده مسجل بالفعل، جرب تسجل الدخول.' });
      }
      throw err;
    }

    await createSession(res, user._id);
    clearAttribution(res, { referredBy, campaign });

    // رسالة ترحيب تستناه في صندوق رسايله. مش بننتظرها (ولا بنوقف عليها
    // لو فشلت) — الحساب اتعمل خلاص والرد لازم يوصل له فورًا.
    sendWelcomeMessage(user);
    // بيكسل ميتا من السيرفر (نفس event_id اللي المتصفح بيبعته — client/src/lib/metaPixel.js)
    metaCapi.fire('CompleteRegistration', { eventId: 'reg_' + user._id, user, ctx: metaCapi.contextFromReq(req), custom: { content_name: 'email' } });

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

    // حساب اتعمل بجوجل ومالوش باسورد — بنقولّه يدخل بزرار جوجل بدل ما
    // يفضل يجرّب باسوردات (التسجيل نفسه أصلًا بيقول لو الإيميل مسجّل)
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'الحساب ده متسجّل بجوجل — ادخل بزرار "المتابعة بجوجل".', google: true });
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
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

// ==========================================================================
// الدخول بجوجل (utils/googleAuth.js)
//   GET  /api/auth/google/config   ← الزرار يظهر ولا لأ + الـ Client ID
//   POST /api/auth/google          ← {credential} من زرار جوجل:
//        - حساب جوجل ده معروف عندنا (googleId) → دخول
//        - أو إيميله متسجّل (بالباسورد) → نربط جوجل بنفس الحساب ودخول
//        - غير كده → {needsProfile, pending} — العميل جديد ويكمّل خطوة واحدة
//   POST /api/auth/google/complete ← {pending, country, phone} → حساب جديد
// ==========================================================================
router.get('/api/auth/google/config', async (req, res) => {
  const cfg = await getGoogleConfig();
  res.set('Cache-Control', 'no-store');
  return res.json(cfg);
});

router.post('/api/auth/google', async (req, res) => {
  try {
    const cfg = await getGoogleConfig();
    if (!cfg.enabled) return res.status(404).json({ error: 'الدخول بجوجل مش متاح دلوقتي.' });
    let g;
    try {
      g = await verifyGoogleIdToken(req.body && req.body.credential, cfg.clientId);
    } catch (err) {
      console.warn('google sign-in rejected:', err.message);
      return res.status(401).json({ error: 'جوجل مأكّدش الحساب ده، جرّب تاني.' });
    }

    let user = await User.findOne({ googleId: g.sub });
    if (!user) user = await User.findOne({ email: g.email });
    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ error: 'الحساب ده متوقف. كلّمنا لو محتاج تفاصيل.' });
      }
      // أول مرة يدخل بجوجل على حساب قديم بنفس الإيميل — بنربطهم (جوجل أكّدت إن الإيميل بتاعه)
      if (!user.googleId) {
        await User.updateOne({ _id: user._id, googleId: { $exists: false } }, { $set: { googleId: g.sub } });
      }
      await createSession(res, user._id);
      return res.json({ user: publicUser(user) });
    }

    // عميل جديد: تذكرة موقّعة (20 دقيقة) يكمّل بيها الدولة/الواتساب
    return res.json({
      needsProfile: true,
      pending: signPending({ sub: g.sub, email: g.email, name: g.name }),
      profile: { name: g.name, email: g.email },
    });
  } catch (err) {
    console.error('Error in google sign-in:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر، حاول تاني بعد شوية.' });
  }
});

router.post('/api/auth/google/complete', async (req, res) => {
  try {
    const p = readPending(req.body && req.body.pending);
    if (!p) return res.status(400).json({ error: 'الخطوة دي خلص وقتها — دوس على زرار جوجل تاني.', expired: true });
    const country = String((req.body && req.body.country) || '').trim().toUpperCase();
    const phone = String((req.body && req.body.phone) || '').replace(/[^\d+\-() ]/g, '').trim().slice(0, 30);
    const name = sanitizeText((req.body && req.body.name) || p.name, 80) || p.email.split('@')[0].slice(0, 80);
    if (!isValidCountryCode(country)) return res.status(400).json({ error: 'من فضلك اختار الدولة.' });

    // ممكن يكون اتعمل حساب بنفس الإيميل/جوجل في الدقايق اللي فاتت (تابين مفتوحين)
    const existing = await User.findOne({ $or: [{ googleId: p.sub }, { email: p.email }] });
    if (existing) {
      if (existing.isBlocked) return res.status(403).json({ error: 'الحساب ده متوقف. كلّمنا لو محتاج تفاصيل.' });
      if (!existing.googleId) await User.updateOne({ _id: existing._id, googleId: { $exists: false } }, { $set: { googleId: p.sub } });
      await createSession(res, existing._id);
      return res.json({ user: publicUser(existing) });
    }
    if (phone && await User.findOne({ phone })) {
      return res.status(409).json({ error: 'رقم التليفون ده مستخدم في حساب تاني.' });
    }

    const { referredBy, campaign } = await attributionFromCookies(req);
    let user;
    try {
      user = await User.create({
        email: p.email, googleId: p.sub, name, country, phone, referredBy,
        campaign, campaignAt: campaign ? new Date() : null,
      });
    } catch (err) {
      if (err.code === 11000) {
        const dupKey = err.keyPattern || err.keyValue || {};
        if ('phone' in dupKey) return res.status(409).json({ error: 'رقم التليفون ده مستخدم في حساب تاني.' });
        return res.status(409).json({ error: 'الحساب ده اتعمل خلاص — دوس على زرار جوجل تاني عشان تدخل.' });
      }
      throw err;
    }
    await createSession(res, user._id);
    clearAttribution(res, { referredBy, campaign });
    sendWelcomeMessage(user);
    metaCapi.fire('CompleteRegistration', { eventId: 'reg_' + user._id, user, ctx: metaCapi.contextFromReq(req), custom: { content_name: 'google' } });
    return res.status(201).json({ user: publicUser(user), isNew: true });
  } catch (err) {
    console.error('Error completing google sign-up:', err);
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
