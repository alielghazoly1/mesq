// routes/presence.js
// POST /api/presence — "أنا فاتح الموقع". بيتبعت من الموقع (React) كل 40
// ثانية طول ما التاب ظاهر. منه بنعرف مين متصل دلوقتي (لوحة التحكم) وآخر
// ظهور لكل عميل. مفيش أي بيانات شخصية بتتخزن للزائر — رقم عشوائي من
// جهازه بس.
//
// ومنه كمان بنعدّ زيارات كل عميل مسجّل (models/Visit.js): كام مرة فتح
// الموقع وإمتى — من غير أي طلب زيادة من المتصفح.
const express = require('express');
const mongoose = require('mongoose');

const Presence = require('../models/Presence');
const User = require('../models/User');
const Visit = require('../models/Visit');
const { LAST_SEEN_WRITE_MS, VISIT_GAP_MS, deviceFromUA } = require('../utils/presence');

const router = express.Router();

router.post('/api/presence', async (req, res) => {
  try {
    const vid = String((req.body && req.body.vid) || '');
    const validVid = /^[a-f0-9]{32}$/.test(vid);
    // المسار بس (من غير query/hash) — كفاية تعرف العميل في أنهي صفحة
    const path = String((req.body && req.body.path) || '').split(/[?#]/)[0].slice(0, 120);
    const now = new Date();

    if (req.user) {
      const key = `u:${req.user.id}`;
      // نفس الكتابة اللي كانت بتحصل، بس بنرجّع السجل القديم عشان نعرف
      // ده كمّل زيارة ولا بدأ واحدة جديدة
      const prev = await Presence.findOneAndUpdate(
        { key },
        { $set: { userId: req.user._id, path, lastSeen: now } },
        { upsert: true, new: false, projection: { lastSeen: 1, visitId: 1 } }
      ).lean();
      // نفس الجهاز كان متسجّل كزائر قبل ما يدخل — منعدّوش مرتين
      if (validVid) Presence.deleteOne({ key: `v:${vid}` }).catch(() => {});

      const prevVisit = prev && prev.visitId ? prev.visitId : null;
      const stale = !prev || !prev.lastSeen || prev.lastSeen.getTime() < now.getTime() - VISIT_GAP_MS;
      if (!prevVisit || stale) {
        // زيارة جديدة. "بنحجزها" بشرط إن الزيارة اللي على السجل لسه هي اللي
        // شفناها — لو العميل فاتح كذا تاب وبعتوا مع بعض، واحد بس بيكسب
        // وماتتحسبش الزيارة مرتين.
        const visitId = new mongoose.Types.ObjectId();
        const claim = await Presence.updateOne({ key, visitId: prevVisit }, { $set: { visitId } });
        if (claim.modifiedCount === 1) {
          const { device, os } = deviceFromUA(req.get('user-agent'));
          await Visit.create({ _id: visitId, userId: req.user._id, startedAt: now, lastSeenAt: now, path, device, os });
          User.updateOne(
            { _id: req.user._id },
            [{ $set: {
              visitCount: { $add: [{ $ifNull: ['$visitCount', 0] }, 1] },
              firstVisitAt: { $ifNull: ['$firstVisitAt', now] },
              lastSeenAt: now,
            } }]
          ).catch(() => {});
          return res.status(204).end();
        }
      }

      // آخر ظهور على الحساب نفسه — كل دقيقتين على الأكتر. updateOne بشرط
      // (مش save) عشان مانعيدش التحقق من مستند عميل قديم. ولما يتكتب،
      // بنمدّ الزيارة الحالية معاه (فمدة الزيارة مابتكلفش كتابة زيادة كل إشارة).
      User.updateOne(
        {
          _id: req.user._id,
          $or: [{ lastSeenAt: null }, { lastSeenAt: { $lt: new Date(now.getTime() - LAST_SEEN_WRITE_MS) } }],
        },
        { $set: { lastSeenAt: now } }
      ).then((r) => {
        if (r.modifiedCount && prevVisit) return Visit.updateOne({ _id: prevVisit }, { $set: { lastSeenAt: now } });
        return null;
      }).catch(() => {});
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
