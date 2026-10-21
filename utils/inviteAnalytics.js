// utils/inviteAnalytics.js
// تسجيل فتحة دعوة في إحصائيات اليوم (models/InvitationDay.js) + قراءتها
// للوحة العميل.
//
// اللي بيتعدّ: ضيف حقيقي فتح الدعوة. اللي مابيتعدّش: البوتات ومعاينات
// اللينكات (واتساب/فيسبوك بيفتحوا اللينك عشان يعملوا كارت المعاينة)،
// وصاحب الدعوة نفسه.
const InvitationDay = require('../models/InvitationDay');
const { SOURCES } = require('../models/InvitationDay');
const { cairoParts } = require('./cairoTime');

const BOT_RE = /bot\b|bot\/|crawler|spider|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|telegram|slack|discord|twitterbot|linkedin|embedly|preview|curl|wget|python|axios|node-fetch|headless|lighthouse|pingdom|uptime/i;

// ?from= في لينكات المشاركة من لوحة العميل (wa / ig / fb / qr …)
const FROM_PARAM = {
  wa: 'whatsapp', whatsapp: 'whatsapp', ig: 'instagram', instagram: 'instagram',
  fb: 'facebook', facebook: 'facebook', tt: 'tiktok', tiktok: 'tiktok',
  sc: 'snapchat', qr: 'qr',
};

/** الضيف جاي منين؟ من ?from= لو موجود، وإلا من المتصفح جوه التطبيق، وإلا من الـ Referer */
function detectSource(req) {
  const from = String((req.query && req.query.from) || '').toLowerCase();
  if (FROM_PARAM[from]) return FROM_PARAM[from];
  const ua = String(req.get('user-agent') || '');
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS|\[FB/i.test(ua)) return 'facebook';
  if (/musical_ly|TikTok|Bytedance|BytedanceWebview/i.test(ua)) return 'tiktok';
  if (/Snapchat/i.test(ua)) return 'snapchat';
  const ref = String(req.get('referer') || '');
  if (/google\./i.test(ref)) return 'google';
  if (/instagram\.com/i.test(ref)) return 'instagram';
  if (/facebook\.com|fb\.com/i.test(ref)) return 'facebook';
  if (/whatsapp/i.test(ref)) return 'whatsapp';
  if (ref && !/mithaq-invitation\.com/i.test(ref)) return 'other';
  // واتساب بيفتح اللينك في المتصفح العادي من غير أي علامة — فـ"مباشر" معظمه واتساب
  return 'direct';
}

function detectDevice(req) {
  const ua = String(req.get('user-agent') || '');
  if (/iPad|Tablet|Nexus 7|Nexus 10|SM-T|Kindle|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function isBotRequest(req) {
  const ua = req.get('user-agent');
  if (!ua) return true;
  if (BOT_RE.test(ua)) return true;
  // تحميل مسبق من المتصفح (prefetch) مش فتحة حقيقية
  const purpose = String(req.get('purpose') || req.get('sec-purpose') || '');
  return /prefetch|prerender/i.test(purpose);
}

/** "2026-10-21" بتوقيت القاهرة */
function cairoDay(date = new Date()) {
  const p = cairoParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

const seenCookie = (shortId) => `mv_${String(shortId).replace(/[^a-zA-Z0-9_-]/g, '')}`;

/**
 * بيسجّل فتحة الدعوة. ماترميش خطأ أبدًا — الإحصائيات مش أهم من إن الدعوة تفتح.
 * @returns {boolean} اتعدّت ولا لأ
 */
function recordInvitationView(req, res, shortId) {
  try {
    if (isBotRequest(req)) return false;
    const name = seenCookie(shortId);
    const isNew = !(req.cookies && req.cookies[name]);
    if (isNew) {
      res.cookie(name, '1', {
        maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production', path: `/i/${shortId}`,
      });
    }
    const now = new Date();
    const hour = cairoParts(now).hour;
    const inc = {
      views: 1,
      [`src.${detectSource(req)}`]: 1,
      [`dev.${detectDevice(req)}`]: 1,
      [`hours.h${hour}`]: 1,
    };
    if (isNew) inc.uniques = 1;
    InvitationDay.updateOne(
      { shortId, day: cairoDay(now) },
      { $inc: inc },
      { upsert: true },
    ).catch((err) => console.error('Invitation day stat failed:', err.message));
    return true;
  } catch (err) {
    console.error('recordInvitationView failed:', err.message);
    return false;
  }
}

/** آخر N يوم (بتوقيت القاهرة) من الأقدم للأحدث */
function lastDays(n, now = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) out.push(cairoDay(new Date(now.getTime() - i * 86400000)));
  return out;
}

/**
 * إحصائيات دعوة لفترة (عدد أيام) + الفترة اللي قبلها للمقارنة.
 * range: 7 | 30 | 90 | 0 (= من أول يوم اتسجّل)
 */
async function invitationInsights(shortId, range) {
  const all = await InvitationDay.find({ shortId }).sort({ day: 1 }).lean();
  const since = all.length ? all[0].day : null;
  const days = range > 0 ? lastDays(range) : (since ? daysBetween(since, cairoDay()) : lastDays(7));
  const byDay = new Map(all.map((d) => [d.day, d]));
  const inRange = new Set(days);

  const prevDays = range > 0 ? lastDays(range * 2).slice(0, range) : [];
  const prevSet = new Set(prevDays);

  const sources = Object.fromEntries(SOURCES.map((k) => [k, 0]));
  const devices = { mobile: 0, tablet: 0, desktop: 0 };
  const hours = Array(24).fill(0);
  let views = 0; let uniques = 0; let prevViews = 0; let prevUniques = 0;

  all.forEach((d) => {
    if (inRange.has(d.day)) {
      views += d.views || 0;
      uniques += d.uniques || 0;
      SOURCES.forEach((k) => { sources[k] += (d.src && d.src[k]) || 0; });
      Object.keys(devices).forEach((k) => { devices[k] += (d.dev && d.dev[k]) || 0; });
      const h = d.hours || {};
      for (let i = 0; i < 24; i += 1) hours[i] += Number(h[`h${i}`] || 0);
    } else if (prevSet.has(d.day)) {
      prevViews += d.views || 0;
      prevUniques += d.uniques || 0;
    }
  });

  return {
    since,
    days: days.length,
    views, uniques, prevViews, prevUniques,
    series: days.map((day) => {
      const d = byDay.get(day);
      return { day, views: d ? d.views || 0 : 0, uniques: d ? d.uniques || 0 : 0 };
    }),
    sources, devices, hours,
  };
}

function daysBetween(from, to) {
  const out = [];
  let t = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const end = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  while (t <= end && out.length < 800) {
    const d = new Date(t);
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`);
    t += 86400000;
  }
  return out.length ? out : [to];
}

module.exports = {
  recordInvitationView, invitationInsights, detectSource, detectDevice, isBotRequest, cairoDay, lastDays,
};
