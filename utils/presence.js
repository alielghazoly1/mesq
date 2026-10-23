// utils/presence.js
// "مين على الموقع دلوقتي" + حدود اليوم والشهر بتوقيت مصر للإحصائيات.
const Presence = require('../models/Presence');
const { cairoParts, cairoWallToDate } = require('./cairoTime');

// كل تاب ظاهر بيبعت كل 20 ثانية (client/src/components/PresencePing.jsx)،
// ولما يتقفل أو يروح الخلفية بيبعت "خرجت" على طول (bye) فبيختفي من اللوحة
// في نفس اللحظة. الـ 50 ثانية دي احتياطي بس لو "خرجت" ماوصلتش (النت قطع
// فجأة / الموبايل قفل الصفحة غصب).
const PING_EVERY_MS = 20 * 1000;
const ONLINE_WINDOW_MS = 50 * 1000;
// آخر ظهور على حساب العميل بيتكتب كل دقيقتين على الأكتر (مش مع كل إشارة)
const LAST_SEEN_WRITE_MS = 2 * 60 * 1000;
// زيارة جديدة لو العميل رجع بعد الفترة دي من غير أي نشاط (نفس عمر سجل
// الحضور — models/Presence.js بيتمسح بعد 15 دقيقة)
const VISIT_GAP_MS = 15 * 60 * 1000;

/** نوع الجهاز ونظامه من الـ User-Agent (تقريبي — للعرض في اللوحة بس) */
function deviceFromUA(ua = '') {
  const s = String(ua);
  let os = '';
  if (/iPad/i.test(s)) os = 'iPad';
  else if (/iPhone|iPod/i.test(s)) os = 'iPhone';
  else if (/Android/i.test(s)) os = 'Android';
  else if (/Windows/i.test(s)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(s)) os = 'Mac';
  else if (/Linux/i.test(s)) os = 'Linux';
  let device = 'desktop';
  if (os === 'iPad' || (/Android/i.test(s) && !/Mobile/i.test(s))) device = 'tablet';
  else if (/Mobi|iPhone|iPod|Android/i.test(s)) device = 'mobile';
  return { device, os };
}

function onlineSince(now = Date.now()) {
  return new Date(now - ONLINE_WINDOW_MS);
}

/** متصل دلوقتي؟ (من آخر ظهور) */
function isOnline(lastSeen, now = Date.now()) {
  if (!lastSeen) return false;
  const t = new Date(lastSeen).getTime();
  return Number.isFinite(t) && t >= now - ONLINE_WINDOW_MS;
}

/** مين من العملاء دول متصل دلوقتي — من سجل الحضور نفسه (مش من
 *  User.lastSeenAt اللي بيتكتب كل دقيقتين بس، فكان بيطلّع المتصل مش متصل) */
async function onlineUserIds(ids) {
  const list = [...new Set((ids || []).filter(Boolean).map(String))];
  if (!list.length) return new Set();
  const rows = await Presence.find({ userId: { $in: list }, lastSeen: { $gte: onlineSince() } }).select('userId').lean();
  return new Set(rows.map((r) => String(r.userId)));
}

/** كل العملاء المتصلين دلوقتي (لفلتر "متصل دلوقتي" في صفحة العملاء) */
async function allOnlineUserIds() {
  const rows = await Presence.find({ lastSeen: { $gte: onlineSince() }, userId: { $ne: null } }).select('userId').limit(5000).lean();
  return rows.map((r) => r.userId);
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
  VISIT_GAP_MS,
  deviceFromUA,
  onlineSince,
  isOnline,
  onlineUserIds,
  allOnlineUserIds,
  cairoTodayStart,
  cairoMonthStart,
  liveCounts,
};
