// utils/funnelStats.js
// ملخص رحلة الشراء في آخر 30 يوم — بيتكتب في لوج هوستنجر مرة مع كل تشغيل للسيرفر (مستوى WARN).
// بطلب المالك (2026-11-24): "تتابع الإحصائيات… واقترح حاجات تسهّل على العميل إنه يشتري".
// أرقام مجمّعة بس — مفيش أسماء ولا إيميلات ولا تليفونات. قراءة بس: مابيغيّرش أي حاجة.
const SiteDeviceDay = require('../models/SiteDeviceDay');
const User = require('../models/User');
const Order = require('../models/Order');
const Invitation = require('../models/Invitation');
const { cairoParts } = require('./cairoTime');

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => { const p = cairoParts(d); return `${p.year}-${pad(p.month)}-${pad(p.day)}`; };
const pct = (a, b) => (b ? `${Math.round((a / b) * 1000) / 10}%` : '-');
const median = (arr) => {
  const a = arr.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const human = (min) => (min == null ? '-' : min < 90 ? `${Math.round(min)}د` : min < 48 * 60 ? `${Math.round(min / 6) / 10}س` : `${Math.round(min / 144) / 10}يوم`);

async function logFunnelStats(days = 30) {
  const now = new Date();
  const from = new Date(now.getTime() - days * 864e5);
  const fromKey = dayKey(from);

  // ===== الزوار: جهاز = واحد، واتجمّعت كل الأقسام اللي دخلها في الفترة =====
  const sections = ['gallery', 'packages', 'create', 'checkout', 'editor', 'dashboard'];
  const byKind = await SiteDeviceDay.aggregate([
    { $match: { day: { $gte: fromKey } } },
    { $group: { _id: '$device', kind: { $first: '$kind' }, pages: { $push: '$pages' }, login: { $max: '$loggedIn' } } },
    { $project: { kind: 1, login: 1, pages: { $reduce: { input: '$pages', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } } } },
    {
      $group: {
        _id: '$kind',
        devices: { $sum: 1 },
        loggedIn: { $sum: { $cond: ['$login', 1, 0] } },
        ...Object.fromEntries(sections.map((s) => [s, { $sum: { $cond: [{ $in: [s, '$pages'] }, 1, 0] } }])),
      },
    },
  ]);
  const tot = { devices: 0, loggedIn: 0 };
  sections.forEach((s) => { tot[s] = 0; });
  byKind.forEach((r) => { Object.keys(tot).forEach((k) => { tot[k] += r[k] || 0; }); });
  const kinds = byKind.map((r) => `${r._id || '?'} ${r.devices} (${pct(r.devices, tot.devices)})`).join(' · ');

  // ===== التسجيل =====
  const [signups, googleSignups, topCountries] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: from } }),
    User.countDocuments({ createdAt: { $gte: from }, googleId: { $exists: true, $nin: [null, ''] } }),
    User.aggregate([{ $match: { createdAt: { $gte: from } } }, { $group: { _id: '$country', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]),
  ]);

  // ===== الدعوات والطلبات =====
  const [draftOwners, publishedOwners] = await Promise.all([
    Invitation.distinct('ownerId', { createdAt: { $gte: from }, ownerId: { $ne: null } }),
    Invitation.distinct('ownerId', { createdAt: { $gte: from }, ownerId: { $ne: null }, status: { $ne: 'draft' } }),
  ]);
  const orders = await Order.find({ createdAt: { $gte: from } })
    .select('userId packageId currency status createdAt paymentProofAt paymentProofUrl paymentSenderPhone activatedAt cancelledAt').lean();
  const buyers = new Set(orders.map((o) => String(o.userId)));
  const withProof = orders.filter((o) => o.paymentProofAt || o.paymentProofUrl || o.paymentSenderPhone);
  const activated = orders.filter((o) => o.status === 'activated');
  const cancelled = orders.filter((o) => o.status === 'cancelled');
  const stuck = orders.filter((o) => o.status === 'pending' && !(o.paymentProofAt || o.paymentProofUrl || o.paymentSenderPhone) && now - o.createdAt > 864e5);
  const waiting = orders.filter((o) => o.status === 'pending' && (o.paymentProofAt || o.paymentProofUrl || o.paymentSenderPhone));
  const proofMin = median(withProof.filter((o) => o.paymentProofAt).map((o) => (o.paymentProofAt - o.createdAt) / 6e4));
  const activateMin = median(activated.filter((o) => o.paymentProofAt && o.activatedAt).map((o) => (o.activatedAt - o.paymentProofAt) / 6e4));
  const count = (arr, key) => Object.entries(arr.reduce((m, o) => { m[o[key]] = (m[o[key]] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ');

  // من التسجيل لأول طلب (للي سجّلوا في الفترة وطلبوا)
  const newUsers = await User.find({ createdAt: { $gte: from } }).select('_id createdAt').lean();
  const firstOrderAt = new Map();
  orders.forEach((o) => { const k = String(o.userId); if (!firstOrderAt.has(k) || o.createdAt < firstOrderAt.get(k)) firstOrderAt.set(k, o.createdAt); });
  const signupToOrder = median(newUsers.filter((u) => firstOrderAt.has(String(u._id))).map((u) => (firstOrderAt.get(String(u._id)) - u.createdAt) / 6e4));
  const newBuyers = newUsers.filter((u) => firstOrderAt.has(String(u._id))).length;

  // الدافعين: موبايل ولا كمبيوتر (من أجهزتهم في التحليلات)
  const payers = [...new Set(activated.map((o) => String(o.userId)))];
  const payerKinds = payers.length ? await SiteDeviceDay.aggregate([
    { $match: { userId: { $in: activated.map((o) => o.userId) } } },
    { $group: { _id: '$userId', kind: { $first: '$kind' } } },
    { $group: { _id: '$kind', n: { $sum: 1 } } },
  ]) : [];

  console.warn(`[funnel-${days}d] visitors ${tot.devices} (${kinds}) → gallery ${tot.gallery} (${pct(tot.gallery, tot.devices)}) → packages ${tot.packages} (${pct(tot.packages, tot.devices)}) → checkout ${tot.checkout} (${pct(tot.checkout, tot.devices)}) · editor ${tot.editor} · dashboard ${tot.dashboard} · logged-in ${tot.loggedIn}`);
  console.warn(`[funnel-${days}d] signups ${signups} (google ${googleSignups}, ${pct(signups, tot.devices)} of visitors) · countries ${topCountries.map((c) => `${c._id || '?'} ${c.n}`).join(' · ')} · made an invitation ${draftOwners.length} · published ${publishedOwners.length}`);
  console.warn(`[funnel-${days}d] orders ${orders.length} by ${buyers.size} customers (new signups who ordered: ${newBuyers}, median signup→order ${human(signupToOrder)}) → sent payment proof ${withProof.length} (${pct(withProof.length, orders.length)}) → activated ${activated.length} (${pct(activated.length, orders.length)}) · cancelled ${cancelled.length} · stuck without proof >24h ${stuck.length} · waiting activation now ${waiting.length}`);
  console.warn(`[funnel-${days}d] median order→proof ${human(proofMin)} · proof→activation ${human(activateMin)} · packages ${count(orders, 'packageId')} · currencies ${count(orders, 'currency')} · payers by device ${payerKinds.map((k) => `${k._id} ${k.n}`).join(' · ') || '-'}`);
}

module.exports = { logFunnelStats };
