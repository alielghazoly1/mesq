// routes/presence.js
// POST /api/presence — "أنا فاتح الموقع". بيتبعت من الموقع (React) كل 20
// ثانية طول ما التاب ظاهر، و{ bye: 1 } أول ما التاب يتقفل أو يروح الخلفية
// (فبيختفي من "المتصلين" في اللوحة في نفس اللحظة). منه بنعرف مين متصل دلوقتي (لوحة التحكم) وآخر
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
const {
  LAST_SEEN_WRITE_MS, VISIT_GAP_MS, ONLINE_WINDOW_MS, deviceFromUA,
} = require('../utils/presence');
const {
  recordDeviceDay, shouldWrite, anaAtUpdate, cairoClock, deviceKeyOf,
} = require('../utils/siteAnalytics');

const router = express.Router();
const MAX_TABS = 8;

/** التابات اللي لسه مفتوحة (غير tab) — من غير اللي إشارتها قديمة */
function otherTabs(tab, since) {
  return {
    $filter: {
      input: { $ifNull: ['$tabs', []] },
      as: 't',
      cond: { $and: [{ $ne: ['$$t.id', tab] }, { $gte: ['$$t.at', since] }] },
    },
  };
}

/** "خرجت": نعلّم التاب ده إنه اتقفل — ولو مفيش تاب تاني مفتوح، يبقى خرج من
 *  الموقع (lastSeen بيرجع لورا برّه فترة "متصل" فبيختفي من اللوحة في نفس
 *  اللحظة. ده مش بيأثر على حساب الزيارات — الزيارة الجديدة بعد ربع ساعة).
 *  علامة القفل بتفضل برقم ترتيبها (n): لو إشارة "أنا هنا" اتبعتت قبلها ووصلت
 *  بعدها (النت بيلخبط الترتيب)، مابترجّعوش "متصل" غلط. */
async function leave(key, tab, n, now) {
  const since = new Date(now.getTime() - ONLINE_WINDOW_MS);
  const gone = new Date(now.getTime() - ONLINE_WINDOW_MS - 1000);
  const r = await Presence.updateOne(
    { key, lastSeen: { $gte: since } },
    [
      { $set: { tabs: { $slice: [{ $concatArrays: [otherTabs(tab, since), [{ id: tab, at: now, n, gone: true }]] }, -MAX_TABS] } } },
      { $set: { lastSeen: { $cond: [{ $gt: [{ $size: { $filter: { input: '$tabs', as: 't', cond: { $ne: ['$$t.gone', true] } } } }, 0] }, '$lastSeen', gone] } } },
    ]
  );
  return r.modifiedCount === 1;
}

/** شرط على إشارة "أنا هنا": التاب ده مايكونش قال "خرجت" بعدها */
function notStale(key, tab, n) {
  return { key, tabs: { $not: { $elemMatch: { id: tab, gone: true, n: { $gt: n } } } } };
}

router.post('/api/presence', async (req, res) => {
  try {
    const vid = String((req.body && req.body.vid) || '');
    const validVid = /^[a-f0-9]{32}$/.test(vid);
    // المسار بس (من غير query/hash) — كفاية تعرف العميل في أنهي صفحة
    const path = String((req.body && req.body.path) || '').split(/[?#]/)[0].slice(0, 120);
    const now = new Date();
    // رقم التاب (عشوائي، بيتعمل مع فتح الصفحة) — النسخ القديمة من الموقع مابتبعتهوش
    const rawTab = String((req.body && req.body.tab) || '');
    const tab = /^[a-z0-9]{8,24}$/.test(rawTab) ? rawTab : '';
    // رقم ترتيب الإشارة جوه التاب (بيزيد مع كل إشارة)
    const rawN = Number(req.body && req.body.n);
    const n = Number.isInteger(rawN) && rawN > 0 && rawN < 1e9 ? rawN : 0;
    const tabsUpdate = {
      $slice: [{
        $concatArrays: [otherTabs(tab, new Date(now.getTime() - ONLINE_WINDOW_MS)), [{ id: tab, at: now, n }]],
      }, -MAX_TABS],
    };

    if (req.body && req.body.bye) {
      if (!tab) return res.status(204).end();
      if (req.user) {
        const left = await leave(`u:${req.user.id}`, tab, n, now);
        // "آخر ظهور" بالظبط لحظة ما قفل (بدل آخر كتابة من دقيقتين) + مدة الزيارة
        if (left) {
          User.updateOne({ _id: req.user._id }, { $set: { lastSeenAt: now } }).catch(() => {});
          Presence.findOne({ key: `u:${req.user.id}` }).select('visitId').lean()
            .then((p) => (p && p.visitId ? Visit.updateOne({ _id: p.visitId }, { $set: { lastSeenAt: now } }) : null))
            .catch(() => {});
        }
      } else {
        const vkey = validVid ? `v:${vid}` : `f:${deviceKeyOf(req, '').slice(2)}`;
        await leave(vkey, tab, n, now);
      }
      return res.status(204).end();
    }
    // تحليلات الموقع (أجهزة/ساعات/مدة): جه منين — بيتبعت مع أول إشارة في الزيارة
    const ref = String((req.body && req.body.ref) || '').slice(0, 300);
    const utm = String((req.body && req.body.utm) || '').slice(0, 40);
    const clock = cairoClock(now);
    const analytics = (prev, userId) => {
      if (shouldWrite(prev && prev.anaAt, now, clock.hourStart)) {
        recordDeviceDay(req, { vid: validVid ? vid : '', userId, path, ref, utm, prevAnaAt: prev && prev.anaAt, now, clock });
      }
    };

    if (req.user) {
      const key = `u:${req.user.id}`;
      // نفس الكتابة اللي كانت بتحصل، بس بنرجّع السجل القديم عشان نعرف
      // ده كمّل زيارة ولا بدأ واحدة جديدة
      const prev = await Presence.findOneAndUpdate(
        notStale(key, tab, n),
        // anaAt بيتحدّث في نفس الكتابة (لو جه وقت سطر تحليلات جديد)
        [{ $set: { userId: req.user._id, path: { $literal: path }, lastSeen: now, anaAt: anaAtUpdate(now, clock.hourStart), tabs: tabsUpdate } }],
        { upsert: true, new: false, projection: { lastSeen: 1, visitId: 1, anaAt: 1 } }
      ).lean();
      analytics(prev, req.user._id);
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
    } else {
      // زائر: برقمه العشوائي — ولو المتصفح مانع التخزين (تصفح خاص) ببصمة
      // (IP + المتصفح)، عشان يتعدّ كزائر متصل وكجهاز في التحليلات برضو
      const vkey = validVid ? `v:${vid}` : `f:${deviceKeyOf(req, '').slice(2)}`;
      const prev = await Presence.findOneAndUpdate(
        notStale(vkey, tab, n),
        [{ $set: { userId: null, path: { $literal: path }, lastSeen: now, anaAt: anaAtUpdate(now, clock.hourStart), tabs: tabsUpdate } }],
        { upsert: true, new: false, projection: { anaAt: 1 } }
      ).lean();
      analytics(prev, null);
    }
    return res.status(204).end();
  } catch (err) {
    // E11000 = إشارة متأخرة من تاب قال "خرجت" بعدها (الشرط فشل فالـ upsert
    // حاول يعمل سجل جديد بنفس المفتاح) — أو إشارتين أول مرة في نفس اللحظة.
    // الاتنين طبيعي ومفيش حاجة تتعمل.
    if (err && err.code === 11000) return res.status(204).end();
    // تسجيل الحضور مش حاجة تستاهل نزعج بيها العميل — بنسجّل الخطأ وبس
    console.error('Presence ping failed:', err.message);
    return res.status(204).end();
  }
});

module.exports = router;
