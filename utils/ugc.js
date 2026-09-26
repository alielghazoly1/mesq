// utils/ugc.js
// حساب إحصائيات وأرباح حساب الـ UGC (المسوّق بالعمولة) ديناميكيًا — عشان
// مفيش أي فرصة لخطأ/انحراف في الأرقام. كل حاجة بتتحسب لحظيًا من:
//   - المستخدمين اللي referredBy = كوده (اللي سجّلوا من لينكه)
//   - طلباتهم المفعّلة (اللي الأدمن أكّد دفعها) × نسبة عمولته
//   - ناقص السحوبات (المدفوعة + المعلّقة)
// الأرباح مفصولة بعملتها (جنيه لوحده / دولار لوحده) زي ما اتفقنا.
const User = require('../models/User');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');
const { generateShortId } = require('./idGenerator');

const CURRENCIES = ['EGP', 'USD'];

function round2(n) {
  return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}

/** كود إحالة جديد — حروف/أرقام قصيرة تكفي للينك /r/<code> */
function generateReferralCode() {
  return generateShortId(8);
}

/**
 * إحصائيات كاملة لحساب UGC.
 * @param {object} ugcUser مستند المستخدم (lean أو Document)
 */
async function computeUgcStats(ugcUser) {
  const rate = ugcUser.commissionRate || 0;
  const zero = () => ({ EGP: 0, USD: 0 });
  const stats = {
    commissionRate: rate,
    referralCode: ugcUser.referralCode || null,
    clicks: ugcUser.referralClicks || 0,
    registrations: 0,
    paidCustomers: 0,
    gross: zero(),
    earned: zero(),
    withdrawn: zero(),
    pending: zero(),
    available: zero(),
  };
  if (!ugcUser.referralCode) return stats;

  const referred = await User.find({ referredBy: ugcUser.referralCode }).select('_id').lean();
  const ids = referred.map((u) => u._id);
  stats.registrations = ids.length;

  if (ids.length) {
    const agg = await Order.aggregate([
      { $match: { userId: { $in: ids }, status: 'activated' } },
      { $group: { _id: { user: '$userId', cur: '$currency' }, total: { $sum: '$price' } } },
    ]);
    const payers = new Set();
    for (const r of agg) {
      const cur = r._id.cur;
      if (!CURRENCIES.includes(cur)) continue;
      stats.gross[cur] = round2(stats.gross[cur] + r.total);
      payers.add(String(r._id.user));
    }
    stats.paidCustomers = payers.size;
  }

  CURRENCIES.forEach((c) => { stats.earned[c] = round2(stats.gross[c] * rate / 100); });

  const wAgg = await Withdrawal.aggregate([
    { $match: { ugcUserId: ugcUser._id, status: { $in: ['paid', 'pending'] } } },
    { $group: { _id: { cur: '$currency', st: '$status' }, total: { $sum: '$amount' } } },
  ]);
  for (const r of wAgg) {
    if (!CURRENCIES.includes(r._id.cur)) continue;
    if (r._id.st === 'paid') stats.withdrawn[r._id.cur] = round2(r.total);
    else stats.pending[r._id.cur] = round2(r.total);
  }
  CURRENCIES.forEach((c) => {
    stats.available[c] = round2(stats.earned[c] - stats.withdrawn[c] - stats.pending[c]);
  });

  return stats;
}

module.exports = { computeUgcStats, generateReferralCode, round2, CURRENCIES };
