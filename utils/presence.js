// utils/presence.js
// "مين على الموقع دلوقتي" + حدود اليوم والشهر بتوقيت مصر للإحصائيات.
const Presence = require('../models/Presence');
const { cairoParts, cairoWallToDate } = require('./cairoTime');

// كل تاب بيبعت كل 40 ثانية (client/src/components/PresencePing.jsx).
// لو مفيش إشارة من 100 ثانية = قفل الموقع (سماحية لتأخير النت أو تاب في الخلفية).
const PING_EVERY_MS = 40 * 1000;
const ONLINE_WINDOW_MS = 100 * 1000;
// آخر ظهور على حساب العميل بيتكتب كل دقيقتين على الأكتر (مش مع كل إشارة)
const LAST_SEEN_WRITE_MS = 2 * 60 * 1000;

function onlineSince(now = Date.now()) {
  return new Date(now - ONLINE_WINDOW_MS);
}

/** متصل دلوقتي؟ (من آخر ظهور) */
function isOnline(lastSeen, now = Date.now()) {
  if (!lastSeen) return false;
  const t = new Date(lastSeen).getTime();
  return Number.isFinite(t) && t >= now - ONLINE_WINDOW_MS;
}

/** بداية النهارده بتوقيت مصر (لحظة UTC) */
function cairoTodayStart(now = new Date()) {
  const p = cairoParts(now);
  return cairoWallToDate(p.year, p.month - 1, p.day, 0, 0);
}

/** بداية الشهر ده بتوقيت مصر — monthsBack: كام شهر لورا */
function cairoMonthStart(now = new Date(), monthsBack = 0) {
  const p = cairoParts(now);
  const idx = (p.year * 12 + (p.month - 1)) - monthsBack;
  return cairoWallToDate(Math.floor(idx / 12), idx % 12, 1, 0, 0);
}

/** أعداد المتصلين دلوقتي: الكل، المسجّلين، الزوار */
async function liveCounts() {
  const since = onlineSince();
  const rows = await Presence.aggregate([
    { $match: { lastSeen: { $gte: since } } },
    { $group: { _id: { $cond: [{ $ifNull: ['$userId', false] }, 'users', 'visitors'] }, count: { $sum: 1 } } },
  ]);
  const out = { total: 0, users: 0, visitors: 0 };
  rows.forEach((r) => { out[r._id] = r.count; out.total += r.count; });
  return out;
}

module.exports = {
  PING_EVERY_MS,
  ONLINE_WINDOW_MS,
  LAST_SEEN_WRITE_MS,
  onlineSince,
  isOnline,
  cairoTodayStart,
  cairoMonthStart,
  liveCounts,
};
