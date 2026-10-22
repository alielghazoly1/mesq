// routes/adminAnalytics.js
// صفحة "التحليلات" في لوحة التحكم — أجهزة شافت الموقع، أكتر ساعات، المدة،
// جه منين، الأجهزة، والتحويل لتسجيل ودفع. البيانات من models/SiteDeviceDay.js
// (سطر لكل جهاز في اليوم بتوقيت مصر) — اتحسبت كلها هنا بـ aggregation واحد.
const express = require('express');
const SiteDeviceDay = require('../models/SiteDeviceDay');
const SiteDevice = require('../models/SiteDevice');
const InvitationDay = require('../models/InvitationDay');
const User = require('../models/User');
const Order = require('../models/Order');
const { requireAdminSession } = require('../middleware/adminAuth');
const { cairoParts, cairoWallToDate } = require('../utils/cairoTime');
const { liveCounts } = require('../utils/presence');

const router = express.Router();
const pad = (n) => String(n).padStart(2, '0');
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

/** مفاتيح الأيام (القاهرة): آخر n يوم لحد يوم معيّن — offset=1 يبدأ من امبارح */
function dayKeys(n, offset = 0) {
  const p = cairoParts(new Date());
  const out = [];
  for (let i = n - 1 + offset; i >= offset; i -= 1) {
    const d = cairoWallToDate(p.year, p.month - 1, p.day - i, 12, 0);
    const q = cairoParts(d);
    out.push(`${q.year}-${pad(q.month)}-${pad(q.day)}`);
  }
  return out;
}
const dayStart = (key) => { const [y, m, d] = key.split('-').map(Number); return cairoWallToDate(y, m - 1, d, 0, 0); };

const RANGES = {
  today: { n: 1, offset: 0 }, yesterday: { n: 1, offset: 1 },
  7: { n: 7, offset: 0 }, 30: { n: 30, offset: 0 }, 90: { n: 90, offset: 0 },
};

const countBy = (field) => [{ $group: { _id: `$${field}`, n: { $sum: 1 } } }, { $sort: { n: -1 } }];

/** كل أرقام مجموعة أيام في aggregation واحد */
async function crunch(match) {
  const [r] = await SiteDeviceDay.aggregate([
    { $match: match },
    {
      $facet: {
        devices: [{ $group: { _id: '$device' } }, { $count: 'n' }],
        newDevices: [{ $match: { newDevice: true } }, { $group: { _id: '$device' } }, { $count: 'n' }],
        loggedIn: [{ $match: { loggedIn: true } }, { $group: { _id: '$device' } }, { $count: 'n' }],
        ips: [{ $group: { _id: '$ipHash' } }, { $count: 'n' }],
        totals: [{
          $group: {
            _id: null, deviceDays: { $sum: 1 }, sec: { $sum: '$activeSec' }, sessions: { $sum: '$sessions' },
            pages: { $sum: { $size: { $ifNull: ['$pages', []] } } },
            bounces: { $sum: { $cond: [{ $and: [{ $lte: ['$activeSec', 40] }, { $lte: [{ $size: { $ifNull: ['$pages', []] } }, 1] }] }, 1, 0] } },
          },
        }],
        daily: [{
          $group: {
            _id: '$day', devices: { $sum: 1 }, newDevices: { $sum: { $cond: ['$newDevice', 1, 0] } },
            sec: { $sum: '$activeSec' }, sessions: { $sum: '$sessions' },
          },
        }],
        hours: [{ $unwind: '$hours' }, { $group: { _id: '$hours', n: { $sum: 1 } } }],
        heat: [{ $unwind: '$hours' }, { $group: { _id: { d: '$day', h: '$hours' }, n: { $sum: 1 } } }],
        kinds: countBy('kind'),
        oss: countBy('os'),
        browsers: countBy('browser'),
        sources: countBy('src'),
        entries: countBy('entry'),
        pages: [{ $unwind: '$pages' }, ...countBy('pages')],
        durations: [{
          $bucket: {
            groupBy: '$activeSec', boundaries: [0, 41, 121, 301, 901, 1801], default: 'long',
            output: { n: { $sum: 1 } },
          },
        }],
      },
    },
  ]);
  return r;
}
const one = (arr) => (arr && arr[0] ? arr[0].n : 0);
const pct = (a, b) => (b > 0 ? round1(((a - b) / b) * 100) : null);

// GET /admin/api/analytics?range=today|yesterday|7|30|90
router.get('/admin/api/analytics', requireAdminSession, async (req, res) => {
  try {
    const rangeId = Object.prototype.hasOwnProperty.call(RANGES, req.query.range) ? String(req.query.range) : 'today';
    const { n, offset } = RANGES[rangeId];
    const days = dayKeys(n, offset);
    const now = new Date();
    const from = dayStart(days[0]);
    const to = rangeId === 'yesterday' ? dayStart(dayKeys(1, 0)[0]) : now;

    // الفترة اللي قبلها بنفس الطول — والنهارده بيتقارن بامبارح لحد نفس الساعة
    const prevDays = rangeId === 'today' ? dayKeys(1, 1) : dayKeys(n, offset + n);
    const prevMatch = rangeId === 'today'
      ? { day: prevDays[0], firstSeen: { $lte: new Date(now.getTime() - 864e5) } }
      : { day: { $in: prevDays } };

    const [cur, prev, live, signups, paid, firstRow, everDevices, guests] = await Promise.all([
      crunch({ day: { $in: days } }),
      crunch(prevMatch),
      liveCounts(),
      User.countDocuments({ createdAt: { $gte: from, $lt: to } }),
      Order.countDocuments({ status: 'activated', activatedAt: { $gte: from, $lt: to } }),
      SiteDeviceDay.findOne({}).sort({ day: 1 }).select('day').lean(),
      SiteDevice.estimatedDocumentCount(),
      InvitationDay.aggregate([
        { $match: { day: { $in: days } } },
        { $group: { _id: '$day', views: { $sum: '$views' }, uniques: { $sum: '$uniques' } } },
      ]),
    ]);

    const t = (cur.totals && cur.totals[0]) || { deviceDays: 0, sec: 0, sessions: 0, pages: 0, bounces: 0 };
    const pt = (prev.totals && prev.totals[0]) || { deviceDays: 0, sec: 0, sessions: 0 };
    const devices = one(cur.devices);
    const newDevices = one(cur.newDevices);
    const prevDevices = one(prev.devices);

    // ===== الساعات (0–23) =====
    const hourMap = new Map((cur.hours || []).map((r) => [r._id, r.n]));
    const hours = Array.from({ length: 24 }, (_, h) => ({ h, devices: hourMap.get(h) || 0, avg: round1((hourMap.get(h) || 0) / days.length) }));
    const ranked = [...hours].sort((a, b) => b.devices - a.devices);
    const peak = ranked[0] && ranked[0].devices ? ranked[0] : null;
    const curHour = cairoParts(now).hour;
    const quietPool = hours.filter((x) => (rangeId === 'today' ? x.h <= curHour : true));
    const quiet = quietPool.length ? [...quietPool].sort((a, b) => a.devices - b.devices)[0] : null;
    // أحسن 3 ساعات متتالية (للإعلانات والنشر)
    let bestWindow = null;
    for (let h = 0; h < 24; h += 1) {
      const sum = hours[h].devices + hours[(h + 1) % 24].devices + hours[(h + 2) % 24].devices;
      if (!bestWindow || sum > bestWindow.devices) bestWindow = { from: h, to: (h + 3) % 24, devices: sum };
    }
    if (bestWindow && !bestWindow.devices) bestWindow = null;

    // ===== خريطة أيام الأسبوع × الساعات =====
    const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
    const wdCount = Array(7).fill(0);
    days.forEach((k) => { const [y, m, d] = k.split('-').map(Number); wdCount[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] += 1; });
    (cur.heat || []).forEach((r) => {
      const [y, m, d] = r._id.d.split('-').map(Number);
      const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      heat[wd][r._id.h] += r.n;
    });
    const wdTotals = heat.map((row, wd) => ({ wd, devices: row.reduce((a, b) => a + b, 0), days: wdCount[wd] }));

    // ===== يوم بيوم =====
    const dmap = new Map((cur.daily || []).map((r) => [r._id, r]));
    const gmap = new Map((guests || []).map((r) => [r._id, r]));
    const daily = days.map((k) => {
      const r = dmap.get(k) || {}; const g = gmap.get(k) || {};
      return {
        day: k, devices: r.devices || 0, newDevices: r.newDevices || 0, sessions: r.sessions || 0,
        avgSec: r.devices ? Math.round(r.sec / r.devices) : 0, guestViews: g.views || 0, guestUniques: g.uniques || 0,
      };
    });

    const DUR = { 0: 'أقل من 40 ثانية', 41: '40 ثانية – 2 دقيقة', 121: '2 – 5 دقايق', 301: '5 – 15 دقيقة', 901: '15 – 30 دقيقة', 1501: '', 1801: 'أكتر من 30 دقيقة', long: 'أكتر من 30 دقيقة' };
    const durations = [0, 41, 121, 301, 901, 'long'].map((k) => {
      const row = (cur.durations || []).find((r) => String(r._id) === String(k)) || (k === 'long' ? (cur.durations || []).find((r) => r._id === 1801) : null);
      return { id: String(k), label: DUR[k], n: row ? row.n : 0 };
    });
    const list = (arr) => (arr || []).filter((r) => r._id != null && r._id !== '').map((r) => ({ id: r._id, n: r.n }));
    const guestViews = (guests || []).reduce((a, r) => a + r.views, 0);
    const guestUniques = (guests || []).reduce((a, r) => a + r.uniques, 0);

    return res.json({
      range: rangeId, days, since: firstRow ? firstRow.day : null, generatedAt: now,
      live,
      summary: {
        devices, newDevices, returningDevices: Math.max(0, devices - newDevices), loggedIn: one(cur.loggedIn),
        ips: one(cur.ips), sessions: t.sessions, deviceDays: t.deviceDays,
        avgSec: t.deviceDays ? Math.round(t.sec / t.deviceDays) : 0,
        avgSessionSec: t.sessions ? Math.round(t.sec / t.sessions) : 0,
        pagesPerDevice: t.deviceDays ? round1(t.pages / t.deviceDays) : 0,
        bounceRate: t.deviceDays ? round1((t.bounces / t.deviceDays) * 100) : 0,
        totalHours: round1(t.sec / 3600),
        perDay: round1(t.deviceDays / days.length),
        everDevices,
      },
      prev: {
        devices: prevDevices, sessions: pt.sessions, avgSec: pt.deviceDays ? Math.round(pt.sec / pt.deviceDays) : 0,
        devicesChange: pct(devices, prevDevices), sessionsChange: pct(t.sessions, pt.sessions),
        avgSecChange: pct(t.deviceDays ? t.sec / t.deviceDays : 0, pt.deviceDays ? pt.sec / pt.deviceDays : 0),
        label: rangeId === 'today' ? 'عن امبارح لحد نفس الساعة' : rangeId === 'yesterday' ? 'عن اليوم اللي قبله' : `عن الـ${n} يوم اللي قبلهم`,
      },
      hours, peak, quiet, bestWindow, currentHour: rangeId === 'today' ? curHour : null,
      heat, wdTotals, daily,
      kinds: list(cur.kinds), oss: list(cur.oss), browsers: list(cur.browsers), sources: list(cur.sources),
      entries: list(cur.entries), pages: list(cur.pages), durations,
      funnel: { devices, signups, paid, signupRate: devices ? round1((signups / devices) * 100) : 0, paidRate: devices ? round1((paid / devices) * 100) : 0 },
      guests: { views: guestViews, uniques: guestUniques },
    });
  } catch (err) {
    console.error('Error building analytics:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
module.exports.dayKeys = dayKeys;
