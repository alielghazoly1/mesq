// routes/presence.js
// POST /api/presence — "أنا فاتح الموقع". بيتبعت من الموقع (React) كل 40
// ثانية طول ما التاب ظاهر. منه بنعرف مين متصل دلوقتي (لوحة التحكم) وآخر
// ظهور لكل عميل. مفيش أي بيانات شخصية بتتخزن للزائر — رقم عشوائي من
// جهازه بس.
const express = require('express');

const Presence = require('../models/Presence');
const User = require('../models/User');
const { LAST_SEEN_WRITE_MS } = require('../utils/presence');

const router = express.Router();

router.post('/api/presence', async (req, res) => {
  try {
    const vid = String((req.body && req.body.vid) || '');
    const validVid = /^[a-f0-9]{32}$/.test(vid);
    // المسار بس (من غير query/hash) — كفاية تعرف العميل في أنهي صفحة
    const path = String((req.body && req.body.path) || '').split(/[?#]/)[0].slice(0, 120);
    const now = new Date();

    if (req.user) {
      await Presence.updateOne(
        { key: `u:${req.user.id}` },
        { $set: { userId: req.user._id, path, lastSeen: now } },
        { upsert: true }
      );
      // نفس الجهاز كان متسجّل كزائر قبل ما يدخل — منعدّوش مرتين
      if (validVid) Presence.deleteOne({ key: `v:${vid}` }).catch(() => {});
      // آخر ظهور على الحساب نفسه — كل دقيقتين على الأكتر. updateOne بشرط
      // (مش save) عشان مانعيدش التحقق من مستند عميل قديم.
      User.updateOne(
        {
          _id: req.user._id,
          $or: [{ lastSeenAt: null }, { lastSeenAt: { $lt: new Date(now.getTime() - LAST_SEEN_WRITE_MS) } }],
        },
        { $set: { lastSeenAt: now } }
      ).catch(() => {});
    } else if (validVid) {
      await Presence.updateOne(
        { key: `v:${vid}` },
        { $set: { userId: null, path, lastSeen: now } },
        { upsert: true }
      );
    }
    return res.status(204).end();
  } catch (err) {
    // تسجيل الحضور مش حاجة تستاهل نزعج بيها العميل — بنسجّل الخطأ وبس
    console.error('Presence ping failed:', err.message);
    return res.status(204).end();
  }
});

module.exports = router;
