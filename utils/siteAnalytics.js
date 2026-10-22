// utils/siteAnalytics.js
// تسجيل تحليلات الموقع من إشارة "أنا فاتح الموقع" (routes/presence.js).
// كل جهاز بيتكتب له سطر يوم (models/SiteDeviceDay.js) — كل دقيقتين على
// الأكتر، أو أول ما الساعة تتغيّر (عشان كل ساعة كان فاتح فيها تتسجّل).
const crypto = require('crypto');
const SiteDeviceDay = require('../models/SiteDeviceDay');
const SiteDevice = require('../models/SiteDevice');
const { cairoParts, cairoWallToDate } = require('./cairoTime');
const { deviceFromUA } = require('./presence');

const WRITE_EVERY_MS = 110 * 1000;     // ~كل تالت إشارة (الإشارة كل 40 ثانية)
const MAX_GAP_MS = 160 * 1000;         // أطول من كده = التاب كان في الخلفية
const SESSION_GAP_MS = 15 * 60 * 1000; // زي زيارات العملاء (Visit)
const SALT = String(process.env.ADMIN_SECRET || 'mithaq').slice(0, 24);

const pad = (n) => String(n).padStart(2, '0');

/** يوم وساعة بتوقيت مصر + بداية الساعة دي */
function cairoClock(now) {
  const p = cairoParts(now);
  return {
    day: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    hour: p.hour,
    hourStart: cairoWallToDate(p.year, p.month - 1, p.day, p.hour, 0),
  };
}

/** هوية الجهاز: الرقم العشوائي من المتصفح، أو بصمة (IP + المتصفح) لو مفيش */
function deviceKeyOf(req, vid) {
  if (/^[a-f0-9]{32}$/.test(vid || '')) return vid;
  const h = crypto.createHash('sha256').update(`${SALT}|${req.ip || ''}|${req.get('user-agent') || ''}`).digest('hex');
  return `h:${h.slice(0, 30)}`;
}
const ipHashOf = (req) => crypto.createHash('sha256').update(`${SALT}|ip|${req.ip || ''}`).digest('hex').slice(0, 20);

/** القسم من المسار — أقسام ثابتة بس (مش كل لينك) عشان الأرقام تبقى مقروءة */
function sectionOf(path) {
  const seg = String(path || '/').split('/')[1] || '';
  const known = {
    '': 'home', gallery: 'gallery', templates: 'gallery', packages: 'packages', checkout: 'checkout',
    dashboard: 'dashboard', editor: 'editor', create: 'create', account: 'account',
    privacy: 'legal', terms: 'legal', preview: 'gallery', ugc: 'dashboard',
  };
  return known[seg] || 'other';
}

function browserOf(ua) {
  const s = String(ua || '');
  if (/Instagram/i.test(s)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(s)) return 'Facebook';
  if (/musical_ly|TikTok|BytedanceWebview/i.test(s)) return 'TikTok';
  if (/SamsungBrowser/i.test(s)) return 'Samsung';
  if (/Edg\//i.test(s)) return 'Edge';
  if (/OPR\/|Opera/i.test(s)) return 'Opera';
  if (/Firefox|FxiOS/i.test(s)) return 'Firefox';
  if (/CriOS|Chrome\//i.test(s)) return 'Chrome';
  if (/Safari/i.test(s)) return 'Safari';
  return 'Other';
}

/**
 * جه منين: إعلان (كوكي حملة) / باراميتر في اللينك / الموقع اللي جه منه /
 * متصفح تطبيق (إنستجرام…) / مباشر.
 */
function sourceOf(req, ref, utm) {
  if (req.cookies && req.cookies.mithaq_cmp) return 'ads';
  const u = String(utm || '').toLowerCase();
  if (u === 'fbclid') return 'facebook';
  if (u === 'gclid') return 'google';
  if (u) {
    if (/insta|ig/.test(u)) return 'instagram';
    if (/face|fb|meta/.test(u)) return 'facebook';
    if (/google/.test(u)) return 'google';
    if (/whats|wa/.test(u)) return 'whatsapp';
    if (/tiktok/.test(u)) return 'tiktok';
  }
  let host = '';
  try { host = ref ? new URL(ref).hostname.toLowerCase() : ''; } catch { host = ''; }
  if (host) {
    if (/instagram/.test(host)) return 'instagram';
    if (/facebook|fb\.|messenger/.test(host)) return 'facebook';
    if (/google\./.test(host)) return 'google';
    if (/bing|yahoo|duckduckgo|yandex/.test(host)) return 'search';
    if (/whatsapp|wa\.me/.test(host)) return 'whatsapp';
    if (/tiktok/.test(host)) return 'tiktok';
    if (/^t\.co$|twitter|x\.com/.test(host)) return 'twitter';
    if (/snapchat/.test(host)) return 'snapchat';
    if (/mithaq-invitation\.com|mithaq/.test(host) || host === req.hostname) return 'invitation';
    return 'other';
  }
  const ua = String(req.get('user-agent') || '');
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook';
  if (/musical_ly|TikTok/i.test(ua)) return 'tiktok';
  return 'direct';
}

/** صاحب الموقع بيتصفّح بنفسه — مايتعدّش */
const isOwnerReq = (req) => !!(req.cookies && (req.cookies.wda_admin_session || req.cookies.mithaq_owner));

/**
 * القرار: نكتب دلوقتي ولا لأ؟ (من آخر كتابة متسجّلة على سجل الحضور)
 * لازم يطابق الشرط اللي جوه تحديث Presence (anaAtUpdate) بالظبط.
 */
function shouldWrite(prevAnaAt, now, hourStart) {
  if (!prevAnaAt) return true;
  const t = new Date(prevAnaAt).getTime();
  return t <= now.getTime() - WRITE_EVERY_MS || t < hourStart.getTime();
}

/** تعبير aggregation لتحديث anaAt جوه نفس كتابة Presence (من غير كتابة زيادة) */
function anaAtUpdate(now, hourStart) {
  const prev = { $ifNull: ['$anaAt', new Date(0)] };
  return {
    $cond: [
      { $or: [{ $lte: [prev, new Date(now.getTime() - WRITE_EVERY_MS)] }, { $lt: [prev, hourStart] }] },
      now,
      '$anaAt',
    ],
  };
}

/**
 * سطر اليوم للجهاز ده. prevAnaAt = آخر مرة كتبنا (من سجل الحضور قبل التحديث).
 * مبيرجعش أخطاء — التحليلات مش حاجة توقف الإشارة.
 */
async function recordDeviceDay(req, { vid, userId, path, ref, utm, prevAnaAt, now, clock }) {
  try {
    if (isOwnerReq(req)) return;
    const device = deviceKeyOf(req, vid);
    const ua = req.get('user-agent') || '';
    const { device: kind, os } = deviceFromUA(ua);
    const gap = prevAnaAt ? now.getTime() - new Date(prevAnaAt).getTime() : null;
    const inc = gap != null && gap <= MAX_GAP_MS ? Math.max(0, Math.round(gap / 1000)) : 40;
    const newSession = gap == null || gap > SESSION_GAP_MS ? 1 : 0;
    const section = sectionOf(path);
    const set = { lastSeen: now };
    if (userId) { set.userId = userId; set.loggedIn = true; }
    const r = await SiteDeviceDay.updateOne(
      { day: clock.day, device },
      {
        $setOnInsert: {
          firstSeen: now, entry: section, kind, os, browser: browserOf(ua),
          src: sourceOf(req, ref, utm), ipHash: ipHashOf(req), newDevice: false,
        },
        $set: set,
        $addToSet: { hours: clock.hour, pages: section },
        $inc: { activeSec: inc, sessions: newSession },
      },
      { upsert: true }
    );
    if (r.upsertedCount) {
      // أول مرة النهارده: الجهاز ده جديد خالص ولا راجع؟
      const d = await SiteDevice.updateOne(
        { device },
        { $setOnInsert: { firstSeen: now }, $set: { lastSeen: now, ...(userId ? { userId } : {}) }, $inc: { days: 1 } },
        { upsert: true }
      );
      if (d.upsertedCount) await SiteDeviceDay.updateOne({ day: clock.day, device }, { $set: { newDevice: true } });
    }
  } catch (err) {
    if (err && err.code === 11000) return; // تابين بعتوا في نفس اللحظة — الاتنين اتعدّوا مرة
    console.error('Site analytics write failed:', err.message);
  }
}

module.exports = {
  recordDeviceDay, shouldWrite, anaAtUpdate, cairoClock, sectionOf, sourceOf, browserOf, deviceKeyOf, isOwnerReq,
};
