// routes/adminJourneys.js
// "مباشر" في لوحة التحكم: مين على الموقع دلوقتي وبيعمل إيه خطوة بخطوة، ومين
// لسه خارج — ورحلات أي عميل (ملفه). البيانات من models/JourneySession.js.
// "متصل" بيتحدد من إشارة الحضور (كل 20 ثانية + "خرجت" فورًا) — فاللي قاعد بيقرا صفحة من غير
// ما يضغط على حاجة بيفضل باين إنه موجود، من غير أي طلبات زيادة من المتصفح.
const express = require('express');
const mongoose = require('mongoose');
const JourneySession = require('../models/JourneySession');
const Presence = require('../models/Presence');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { requireAdminSession } = require('../middleware/adminAuth');
const { onlineSince } = require('../utils/presence');

const router = express.Router();

async function peopleFor(sessions) {
  const ids = [...new Set(sessions.map((s) => s.userId).filter(Boolean).map(String))];
  const users = ids.length ? await User.find({ _id: { $in: ids } }).select('name email phone country googleId passwordHash campaign referredBy subscription').lean() : [];
  const codes = [...new Set(users.map((u) => u.campaign).filter(Boolean))];
  const names = new Map((codes.length ? await Campaign.find({ code: { $in: codes } }).select('code name').lean() : []).map((c) => [c.code, c.name]));
  const map = new Map(users.map((u) => [String(u._id), {
    id: String(u._id), name: u.name, email: u.email, phone: u.phone || '', country: u.country || '',
    signup: u.googleId ? (u.passwordHash ? 'both' : 'google') : 'email',
    isPremium: !!(u.subscription && u.subscription.packageId),
    source: u.campaign ? { type: 'ad', code: u.campaign, name: names.get(u.campaign) || u.campaign } : u.referredBy ? { type: 'ugc', code: u.referredBy } : { type: 'direct' },
  }]));
  return (s) => (s.userId ? map.get(String(s.userId)) || null : null);
}

/** ملخص زيارة للقوايم: آخر الصفحات اللي فتحها (مع المدة) */
function summarize(s, person, online) {
  const views = (s.events || []).filter((e) => e.k === 'v' || e.k === 'x');
  const trail = [];
  (s.events || []).forEach((e, i) => {
    if (e.k !== 'v') return;
    const next = (s.events || []).slice(i + 1).find((x) => x.k === 'v' || x.k === 'x');
    trail.push({ p: e.p, t: e.t, d: next ? next.d : null });
  });
  const lastEv = (s.events || [])[(s.events || []).length - 1] || null;
  return {
    id: String(s._id), sid: s.sid, person, online,
    device: s.device, kind: s.kind, os: s.os, browser: s.browser, src: s.src, ref: s.ref, country: (person && person.country) || s.country || '',
    startedAt: s.startedAt, lastAt: s.lastAt, endedAt: s.endedAt, hidden: !!s.hidden,
    entry: s.entry, current: s.current, exit: s.exit, views: s.views, clicks: s.clicks,
    trail: trail.slice(-8), lastEvent: lastEv, eventsCount: (s.events || []).length, viewsCount: views.length,
  };
}

/** متصل دلوقتي؟ من سجل الحضور (عميل بحسابه، زائر برقم جهازه) */
async function onlineSet(sessions) {
  const keys = [];
  sessions.forEach((s) => {
    if (s.userId) keys.push(`u:${s.userId}`);
    if (/^[a-f0-9]{32}$/.test(s.device || '')) keys.push(`v:${s.device}`);
    else if (/^h:/.test(s.device || '')) keys.push(`f:${s.device.slice(2)}`);
  });
  const rows = keys.length ? await Presence.find({ key: { $in: keys }, lastSeen: { $gte: onlineSince() } }).select('key path').lean() : [];
  return new Map(rows.map((r) => [r.key, r.path]));
}
function presenceOf(s, on) {
  if (s.userId && on.has(`u:${s.userId}`)) return on.get(`u:${s.userId}`);
  if (on.has(`v:${s.device}`)) return on.get(`v:${s.device}`);
  if (/^h:/.test(s.device || '') && on.has(`f:${s.device.slice(2)}`)) return on.get(`f:${s.device.slice(2)}`);
  return null;
}

// GET /admin/api/journeys/live — اللي على الموقع دلوقتي + اللي خرجوا في آخر ربع ساعة
router.get('/admin/api/journeys/live', requireAdminSession, async (req, res) => {
  try {
    const since = new Date(Date.now() - 45 * 60e3);
    const recent = await JourneySession.find({ lastAt: { $gte: since } })
      // آخر 40 خطوة بس لكل زيارة — القايمة خفيفة (الزيارة كاملة لما تفتحها)
      .sort({ lastAt: -1 }).limit(200).select({ events: { $slice: -40 } }).lean();
    const on = await onlineSet(recent);
    const personOf = await peopleFor(recent);
    // جهاز واحد ممكن يكون ليه كذا زيارة (تابات) — بنعرض الأحدث للجهاز
    const seen = new Set();
    const live = []; const left = [];
    recent.forEach((s) => {
      const key = s.userId ? `u:${s.userId}` : s.device;
      const online = !s.endedAt && presenceOf(s, on) != null;
      if (online) {
        if (seen.has(key)) return;
        seen.add(key);
        live.push(summarize(s, personOf(s), true));
      } else if (Date.now() - new Date(s.lastAt).getTime() < 15 * 60e3 && left.length < 25 && !seen.has(key)) {
        seen.add(key);
        left.push(summarize(s, personOf(s), false));
      }
    });
    return res.json({ at: new Date(), live, left, counts: { live: live.length, users: live.filter((x) => x.person).length } });
  } catch (err) {
    console.error('Error loading live journeys:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// GET /admin/api/journeys/:id — زيارة واحدة بكل خطواتها
router.get('/admin/api/journeys/:id', requireAdminSession, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'الزيارة مش موجودة' });
    const s = await JourneySession.findById(req.params.id).lean();
    if (!s) return res.status(404).json({ error: 'الزيارة مش موجودة' });
    const on = await onlineSet([s]);
    const personOf = await peopleFor([s]);
    // كام زيارة تانية من نفس الجهاز/العميل (رجع كام مرة)
    const visits = await JourneySession.countDocuments(s.userId ? { userId: s.userId } : { device: s.device });
    return res.json({
      ...summarize(s, personOf(s), !s.endedAt && presenceOf(s, on) != null),
      presencePath: presenceOf(s, on),
      events: s.events || [],
      visits,
    });
  } catch (err) {
    console.error('Error loading journey:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// GET /admin/api/users/:id/journeys?page= — رحلات عميل (الأحدث الأول)
router.get('/admin/api/users/:id/journeys', requireAdminSession, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'العميل مش موجود' });
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const per = 10;
    const filter = { userId: new mongoose.Types.ObjectId(req.params.id) };
    const [rows, total] = await Promise.all([
      JourneySession.find(filter).sort({ startedAt: -1 }).skip((page - 1) * per).limit(per).select({ events: { $slice: -40 } }).lean(),
      JourneySession.countDocuments(filter),
    ]);
    const on = await onlineSet(rows);
    const personOf = await peopleFor(rows);
    return res.json({
      page, total, hasMore: page * per < total,
      sessions: rows.map((s) => summarize(s, personOf(s), !s.endedAt && presenceOf(s, on) != null)),
    });
  } catch (err) {
    console.error('Error loading user journeys:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
