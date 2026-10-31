// routes/track.js
// POST /api/track — دفعة خطوات من رحلة زائر/عميل (client/src/lib/journey.js).
// الدفعة كلها = كتابة واحدة على مستند الزيارة (models/JourneySession.js).
// المتصفح بيبعت بس لما يحصل حاجة (صفحة/ضغطة/ساب التاب/قفل) — مفيش طلبات
// والصفحة واقفة. البرامج الآلية مابتشغّلش جافاسكريبت فمابتوصلش هنا، وأجهزة
// صاحب الموقع مابتتسجّلش.
const express = require('express');
const JourneySession = require('../models/JourneySession');
const { sanitizeText } = require('../utils/sanitize');
const { deviceFromUA } = require('../utils/presence');
const { deviceKeyOf, sourceOf, browserOf, isOwnerReq } = require('../utils/siteAnalytics');

const router = express.Router();
const KINDS = new Set(['v', 'c', 'h', 's', 'x']);
const MAX_EVENTS_PER_BATCH = 60;
const MAX_EVENTS_PER_SESSION = 600;

/** المسار بس (من غير query/hash) — ومن غير لوحة التحكم وصفحات الدعوات */
function cleanPath(p) {
  const s = String(p || '').split(/[?#]/)[0].slice(0, 120);
  if (!s.startsWith('/') || s.startsWith('/admin') || s.startsWith('/i/')) return null;
  return s;
}

router.post('/api/track', async (req, res) => {
  res.status(204).end(); // الرد على طول — الحفظ بعده (المتصفح مش مستني حاجة)
  try {
    if (isOwnerReq(req)) return;
    const body = req.body || {};
    const sid = String(body.sid || '');
    if (!/^[a-z0-9]{16,40}$/.test(sid)) return;
    const raw = Array.isArray(body.ev) ? body.ev.slice(0, MAX_EVENTS_PER_BATCH) : [];
    const now = Date.now();
    const events = [];
    raw.forEach((e) => {
      if (!e || !KINDS.has(e.k)) return;
      const p = cleanPath(e.p);
      if (p === null) return;
      let t = Number(e.t);
      // ساعة الجهاز ممكن تكون غلط — نقبل آخر نص ساعة بس، وغير كده وقت السيرفر
      if (!Number.isFinite(t) || t > now + 10e3 || t < now - 30 * 60e3) t = now;
      const ev = { t: new Date(t), k: e.k, p };
      if (e.k === 'c') {
        const l = sanitizeText(e.l, 60);
        if (!l) return;
        ev.l = l;
      }
      if (e.k === 'v' || e.k === 'x') {
        ev.d = Math.max(0, Math.min(86400, Math.round(Number(e.d) || 0)));
        ev.s = Math.max(0, Math.min(100, Math.round(Number(e.s) || 0)));
      }
      events.push(ev);
    });
    if (!events.length) return;
    events.sort((a, b) => a.t - b.t);

    const views = events.filter((e) => e.k === 'v');
    const last = events[events.length - 1];
    const lastView = views.length ? views[views.length - 1].p : null;
    const lastVis = [...events].reverse().find((e) => e.k === 'h' || e.k === 's' || e.k === 'v');
    const ua = req.get('user-agent') || '';
    const { device: kind, os } = deviceFromUA(ua);

    const set = { lastAt: new Date(now), exit: last.p };
    if (lastView) set.current = lastView;
    if (lastVis) set.hidden = lastVis.k === 'h';
    // قفل الموقع = آخر خطوة "x"؛ لو رجع (التاب اتفتح تاني) نشيل علامة القفل
    set.endedAt = last.k === 'x' ? new Date(now) : null;
    if (req.user) {
      set.userId = req.user._id;
      if (req.user.country) set.country = req.user.country;
    }

    await JourneySession.updateOne(
      { sid },
      {
        $setOnInsert: {
          startedAt: events[0].t, entry: (views[0] || events[0]).p,
          device: deviceKeyOf(req, String(body.vid || '')),
          src: sourceOf(req, String(body.ref || '').slice(0, 300), String(body.utm || '').slice(0, 40)),
          ref: String(body.ref || '').slice(0, 200), kind, os, browser: browserOf(ua),
          // جه من لينك إعلان؟ عشان صفحة الإعلانات تعرض مين دخل منه بالظبط
          cmp: /^[a-z0-9-]{1,40}$/.test(String((req.cookies && req.cookies.mithaq_cmp) || '')) ? req.cookies.mithaq_cmp : '',
        },
        $set: set,
        $push: { events: { $each: events, $slice: -MAX_EVENTS_PER_SESSION } },
        $inc: { views: views.length, clicks: events.filter((e) => e.k === 'c').length },
      },
      { upsert: true }
    );
  } catch (err) {
    if (err && err.code === 11000) return; // دفعتين لنفس الزيارة في نفس اللحظة
    console.error('Journey track failed:', err.message);
  }
});

module.exports = router;
