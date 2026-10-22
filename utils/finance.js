// utils/finance.js
// حسابات صفحة الأرباح (لوحة التحكم): الإيرادات − المصاريف = صافي الربح، شهر
// بشهر بتوقيت مصر.
//
//   الإيرادات  = الطلبات المفعّلة بس (الفلوس وصلت فعلًا) — بتاريخ التفعيل.
//   المصاريف   = 3 أنواع:
//     • الإعلانات   — تلقائي من صفحة "الإعلانات" (ميزانية كل حملة في شهر بدايتها)
//     • العمولات    — تلقائي: سحوبات المسوّقين اللي اتدفعت (في شهر الدفع)
//     • يدوي        — اللي المالك بيسجّله بنفسه (models/Expense.js)، والشهري
//                     منها بيتحسب في كل شهر لحد ما يتوقف
//   كل عملة بتتحوّل لجنيه بأسعار صرف المالك (SiteConfig.fxRates) عشان
//   صافي الربح يبقى رقم واحد — والمبالغ الأصلية بعملتها بتفضل ظاهرة.
const Order = require('../models/Order');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Withdrawal = require('../models/Withdrawal');
const Expense = require('../models/Expense');
const SiteConfig = require('../models/SiteConfig');
const { cairoParts, cairoWallToDate } = require('./cairoTime');
const { getPackage } = require('../packages/registry');

const CURRENCIES = ['EGP', 'USD', 'SAR', 'EUR'];
const DEFAULT_RATES = { USD: 50, SAR: 13.3, EUR: 58 };
const CATEGORY_LABELS = {
  ads: 'إعلانات (برّه صفحة الإعلانات)',
  hosting: 'استضافة وسيرفر',
  tools: 'أدوات واشتراكات',
  design: 'تصميم ومحتوى',
  team: 'فريق وفريلانس',
  fees: 'رسوم تحويل وبنوك',
  other: 'حاجات تانية',
};
const SOURCE_LABELS = { ads: 'من إعلان', ugc: 'من مسوّق', direct: 'مباشر' };

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const pad = (n) => String(n).padStart(2, '0');

/** مفتاح الشهر YYYY-MM بتوقيت مصر */
function monthKey(date) {
  const p = cairoParts(new Date(date));
  return `${p.year}-${pad(p.month)}`;
}
function dayKey(date) {
  const p = cairoParts(new Date(date));
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}
function shiftMonth(key, n) {
  const [y, m] = key.split('-').map(Number);
  const idx = y * 12 + (m - 1) + n;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}
function monthRange(key) {
  const [y, m] = key.split('-').map(Number);
  return { from: cairoWallToDate(y, m - 1, 1, 0, 0), to: cairoWallToDate(y, m, 1, 0, 0) };
}
/** الشهور من a لحد b (الاتنين داخلين) */
function monthsFromTo(a, b) {
  const out = [];
  for (let k = a; k <= b && out.length < 600; k = shiftMonth(k, 1)) out.push(k);
  return out;
}
const isMonthKey = (s) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(s || ''));

async function getRates() {
  const cfg = await SiteConfig.findOne({ key: 'default' }).select('fxRates').lean();
  const r = (cfg && cfg.fxRates) || {};
  const ok = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
  return { EGP: 1, USD: ok(r.USD, DEFAULT_RATES.USD), SAR: ok(r.SAR, DEFAULT_RATES.SAR), EUR: ok(r.EUR, DEFAULT_RATES.EUR) };
}

/** أسعار جديدة (جنيه لكل وحدة) — أي قيمة مش منطقية بتترفض */
async function setRates(body) {
  const set = {};
  for (const c of ['USD', 'SAR', 'EUR']) {
    if (body[c] === undefined) continue;
    const v = Number(body[c]);
    if (!Number.isFinite(v) || v < 0.01 || v > 10000) {
      const e = new Error(`سعر ${c} مش منطقي.`); e.status = 400; throw e;
    }
    set[`fxRates.${c}`] = round2(v);
  }
  if (Object.keys(set).length) {
    await SiteConfig.updateOne({ key: 'default' }, { $set: { ...set, updatedAt: new Date() } }, { upsert: true });
  }
  return getRates();
}

/** الشهور اللي المصروف بيتحسب فيها (لحد الشهر الحالي بس) */
function expenseMonths(exp, nowKey) {
  const start = monthKey(exp.date);
  if (!exp.recurring) return start <= nowKey ? [start] : [];
  const end = exp.endedAt ? monthKey(exp.endedAt) : nowKey;
  return monthsFromTo(start, end < nowKey ? end : nowKey);
}

/**
 * كل أرقام صفحة الأرباح لشهر (YYYY-MM) أو لكل الوقت ('all').
 * الداتا صغيرة (طلبات مفعّلة + حملات + سحوبات + مصاريف) فبنجيبها مرة
 * واحدة ونحسب في الذاكرة — أسرع وأبسط من عشرات الاستعلامات.
 */
async function buildFinance(monthParam) {
  const now = new Date();
  const nowKey = monthKey(now);
  let mode = monthParam === 'all' ? 'all' : (isMonthKey(monthParam) ? monthParam : nowKey);
  if (mode !== 'all' && mode > nowKey) mode = nowKey;
  const inPeriod = (mk) => mode === 'all' || mk === mode;

  const rates = await getRates();
  const eq = (amount, cur) => round2((Number(amount) || 0) * (rates[cur] || 0));

  const [orders, campaigns, withdrawals, expenses] = await Promise.all([
    Order.find({ status: 'activated', activatedAt: { $ne: null } })
      .select('userId packageId currency price activatedAt').lean(),
    Campaign.find({ spendAmount: { $gt: 0 } })
      .select('code name platform spendAmount spendCurrency startedAt createdAt archived').lean(),
    Withdrawal.find({ status: 'paid' }).select('ugcUserId currency amount resolvedAt createdAt').lean(),
    Expense.find({}).sort({ date: -1, createdAt: -1 }).lean(),
  ]);

  // ===== العملاء اللي دفعوا (مصدرهم ودولتهم) =====
  const payerIds = [...new Set(orders.map((o) => String(o.userId)))];
  const ugcIds = [...new Set(withdrawals.map((w) => String(w.ugcUserId)))];
  const people = await User.find({ _id: { $in: [...payerIds, ...ugcIds] } })
    .select('name country campaign referredBy').lean();
  const userById = new Map(people.map((u) => [String(u._id), u]));
  const cmpByCode = new Map(campaigns.map((c) => [c.code, c]));
  const allCmpNames = new Map((await Campaign.find({}).select('code name').lean()).map((c) => [c.code, c.name]));

  const firstPaid = new Map();
  orders.forEach((o) => {
    const k = String(o.userId); const t = new Date(o.activatedAt).getTime();
    if (!firstPaid.has(k) || t < firstPaid.get(k)) firstPaid.set(k, t);
  });
  const sourceOf = (u) => (u && u.campaign ? 'ads' : u && u.referredBy ? 'ugc' : 'direct');

  const ord = orders.map((o) => ({
    ...o, mk: monthKey(o.activatedAt), dk: dayKey(o.activatedAt), eq: eq(o.price, o.currency),
    uid: String(o.userId), first: firstPaid.get(String(o.userId)) === new Date(o.activatedAt).getTime(),
  }));

  // ===== المصاريف كلها بشهرها =====
  const adRows = campaigns.map((c) => {
    const at = c.startedAt || c.createdAt;
    return {
      kind: 'ads', id: String(c._id), title: c.name, code: c.code, platform: c.platform,
      amount: c.spendAmount, currency: c.spendCurrency || 'EGP', eq: eq(c.spendAmount, c.spendCurrency || 'EGP'),
      date: at, mk: monthKey(at), archived: !!c.archived,
    };
  });
  const commRows = withdrawals.map((w) => {
    const at = w.resolvedAt || w.createdAt; const u = userById.get(String(w.ugcUserId));
    return {
      kind: 'commissions', id: String(w._id), title: u ? u.name : 'مسوّق', amount: w.amount, currency: w.currency,
      eq: eq(w.amount, w.currency), date: at, mk: monthKey(at),
    };
  });
  const manualOcc = [];
  expenses.forEach((e) => {
    expenseMonths(e, nowKey).forEach((mk) => {
      manualOcc.push({
        kind: 'manual', id: String(e._id), title: e.title, category: e.category, amount: e.amount, currency: e.currency,
        eq: eq(e.amount, e.currency), mk, recurring: !!e.recurring, note: e.note || '', date: e.date,
      });
    });
  });

  // ===== ملخص شهر =====
  function monthSummary(mk) {
    const os = ord.filter((o) => o.mk === mk);
    const revenue = round2(os.reduce((a, o) => a + o.eq, 0));
    const ads = round2(adRows.filter((r) => r.mk === mk).reduce((a, r) => a + r.eq, 0));
    const commissions = round2(commRows.filter((r) => r.mk === mk).reduce((a, r) => a + r.eq, 0));
    const manual = round2(manualOcc.filter((r) => r.mk === mk).reduce((a, r) => a + r.eq, 0));
    const expensesEq = round2(ads + commissions + manual);
    return { month: mk, revenue, ads, commissions, manual, expenses: expensesEq, net: round2(revenue - expensesEq), orders: os.length };
  }

  // ===== الفترة المختارة =====
  const pOrders = ord.filter((o) => inPeriod(o.mk));
  const byCurrency = {};
  CURRENCIES.forEach((c) => {
    const os = pOrders.filter((o) => o.currency === c);
    byCurrency[c] = { total: round2(os.reduce((a, o) => a + o.price, 0)), orders: os.length, eq: round2(os.reduce((a, o) => a + o.eq, 0)) };
  });
  const revenueEq = round2(pOrders.reduce((a, o) => a + o.eq, 0));
  const payers = new Set(pOrders.map((o) => o.uid));
  const newPayers = new Set(pOrders.filter((o) => o.first).map((o) => o.uid));

  const group = (keyFn, labelFn) => {
    const m = new Map();
    pOrders.forEach((o) => {
      const k = keyFn(o); if (k == null) return;
      const row = m.get(k) || { id: k, label: labelFn(k), orders: 0, eq: 0, payers: new Set() };
      row.orders += 1; row.eq = round2(row.eq + o.eq); row.payers.add(o.uid); m.set(k, row);
    });
    return [...m.values()].map((r) => ({ ...r, payers: r.payers.size })).sort((a, b) => b.eq - a.eq || b.orders - a.orders);
  };
  const byPackage = group((o) => o.packageId, (k) => { const p = getPackage(k); return p ? (p.name.ar || p.name.en) : k; });
  const bySource = group((o) => sourceOf(userById.get(o.uid)), (k) => SOURCE_LABELS[k]);
  ['ads', 'ugc', 'direct'].forEach((k) => { if (!bySource.some((r) => r.id === k)) bySource.push({ id: k, label: SOURCE_LABELS[k], orders: 0, eq: 0, payers: 0 }); });
  const byCountry = group((o) => { const u = userById.get(o.uid); return (u && u.country) || ''; }, (k) => k);

  const pAds = adRows.filter((r) => inPeriod(r.mk)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const pComm = commRows.filter((r) => inPeriod(r.mk)).sort((a, b) => new Date(b.date) - new Date(a.date));
  // يدوي: في "كل الوقت" المصروف الشهري بيتجمّع في سطر واحد × عدد الشهور
  const manualMap = new Map();
  manualOcc.filter((r) => inPeriod(r.mk)).forEach((r) => {
    const row = manualMap.get(r.id) || { ...r, months: 0, eq: 0, total: 0 };
    row.months += 1; row.eq = round2(row.eq + r.eq); row.total = round2(row.total + r.amount); manualMap.set(r.id, row);
  });
  const pManual = [...manualMap.values()].sort((a, b) => b.eq - a.eq);

  // الإعلانات: كل حملة صرفت في الفترة + الفلوس اللي جت من الناس اللي جابتهم في نفس الفترة
  const cmpRevenue = group((o) => { const u = userById.get(o.uid); return u && u.campaign ? u.campaign : null; }, (k) => allCmpNames.get(k) || k);
  const adCodes = new Set([...pAds.map((r) => r.code), ...cmpRevenue.map((r) => r.id)]);
  const byCampaign = [...adCodes].map((code) => {
    const spend = round2(pAds.filter((r) => r.code === code).reduce((a, r) => a + r.eq, 0));
    const rev = cmpRevenue.find((r) => r.id === code) || { orders: 0, eq: 0, payers: 0 };
    return {
      code, name: allCmpNames.get(code) || (cmpByCode.get(code) || {}).name || code,
      spend, revenue: rev.eq, orders: rev.orders, payers: rev.payers,
      profit: round2(rev.eq - spend), roas: spend > 0 ? round2(rev.eq / spend) : null,
      costPerPayer: rev.payers > 0 && spend > 0 ? round2(spend / rev.payers) : null,
    };
  }).sort((a, b) => b.spend - a.spend || b.revenue - a.revenue);

  const tAds = round2(pAds.reduce((a, r) => a + r.eq, 0));
  const tComm = round2(pComm.reduce((a, r) => a + r.eq, 0));
  const tManual = round2(pManual.reduce((a, r) => a + r.eq, 0));
  const expensesEq = round2(tAds + tComm + tManual);
  const net = round2(revenueEq - expensesEq);

  const byCategory = Object.keys(CATEGORY_LABELS).map((k) => ({
    id: k, label: CATEGORY_LABELS[k], eq: round2(pManual.filter((r) => r.category === k).reduce((a, r) => a + r.eq, 0)),
  })).filter((r) => r.eq > 0);

  // ===== الاتجاه: آخر 12 شهر لحد الشهر المختار =====
  const endKey = mode === 'all' ? nowKey : mode;
  const trend = monthsFromTo(shiftMonth(endKey, -11), endKey).map(monthSummary);
  const prev = mode === 'all' ? null : monthSummary(shiftMonth(mode, -1));

  // ===== يوم بيوم في الشهر =====
  let daily = [];
  if (mode !== 'all') {
    const { from, to } = monthRange(mode);
    const days = Math.round((to - from) / 864e5);
    const limit = mode === nowKey ? cairoParts(now).day : days;
    for (let d = 1; d <= limit; d += 1) {
      const dk = `${mode}-${pad(d)}`;
      const os = pOrders.filter((o) => o.dk === dk);
      daily.push({ date: dk, revenue: round2(os.reduce((a, o) => a + o.eq, 0)), orders: os.length });
    }
  }

  // ===== الشهور المتاحة في الاختيار =====
  const firsts = [...ord.map((o) => o.mk), ...adRows.map((r) => r.mk), ...commRows.map((r) => r.mk), ...manualOcc.map((r) => r.mk)].filter((k) => k <= nowKey);
  const startKey = firsts.length ? firsts.sort()[0] : nowKey;
  const months = monthsFromTo(startKey < shiftMonth(nowKey, -35) ? shiftMonth(nowKey, -35) : startKey, nowKey).reverse();

  const pct = (a, b) => (b > 0 ? round2(((a - b) / b) * 100) : null);

  // ===== الالتزامات الشهرية الثابتة: اللي هتدفعه كل شهر (المصاريف الشهرية الشغالة) =====
  const activeRecurring = expenses.filter((e) => e.recurring && !e.endedAt && monthKey(e.date) <= nowKey);
  const commitByCurrency = {};
  activeRecurring.forEach((e) => { commitByCurrency[e.currency] = round2((commitByCurrency[e.currency] || 0) + e.amount); });
  const commitEq = round2(activeRecurring.reduce((a, e) => a + eq(e.amount, e.currency), 0));
  const commitments = {
    eq: commitEq, yearly: round2(commitEq * 12), count: activeRecurring.length, byCurrency: commitByCurrency,
    byCategory: Object.keys(CATEGORY_LABELS).map((k) => ({
      id: k, label: CATEGORY_LABELS[k],
      eq: round2(activeRecurring.filter((e) => e.category === k).reduce((a, e) => a + eq(e.amount, e.currency), 0)),
    })).filter((r) => r.eq > 0).sort((x, y) => y.eq - x.eq),
    // الإيرادات اللازمة كل شهر عشان تغطي الثابت + متوسط الطلب ده = كام طلب
    ordersToCover: pOrders.length && revenueEq ? Math.ceil(commitEq / (revenueEq / pOrders.length)) : null,
  };

  return {
    month: mode, nowMonth: nowKey, months, rates,
    revenue: {
      eq: revenueEq, byCurrency, orders: pOrders.length, payers: payers.size,
      newPayers: newPayers.size, returningPayers: payers.size - newPayers.size,
      avgOrder: pOrders.length ? round2(revenueEq / pOrders.length) : 0,
    },
    expenses: {
      eq: expensesEq,
      totals: { ads: tAds, commissions: tComm, manual: tManual },
      ads: pAds, commissions: pComm, manual: pManual, byCategory,
    },
    net, margin: revenueEq > 0 ? round2((net / revenueEq) * 100) : null,
    prev: prev ? {
      ...prev,
      revenueChange: pct(revenueEq, prev.revenue), netChange: prev.net !== 0 ? round2(((net - prev.net) / Math.abs(prev.net)) * 100) : null,
      expensesChange: pct(expensesEq, prev.expenses), ordersChange: pct(pOrders.length, prev.orders),
    } : null,
    // متوسط اليوم + توقّع آخر الشهر (الشهر الحالي بس)
    forecast: mode === nowKey && daily.length ? (() => {
      const { from, to } = monthRange(mode);
      const days = Math.round((to - from) / 864e5);
      const perDay = revenueEq / daily.length;
      return { perDay: round2(perDay), revenue: round2(perDay * days), daysLeft: days - daily.length };
    })() : null,
    daily, trend,
    byPackage, bySource: bySource.sort((a, b) => ['ads', 'ugc', 'direct'].indexOf(a.id) - ['ads', 'ugc', 'direct'].indexOf(b.id)),
    byCountry: byCountry.slice(0, 12), byCampaign,
    expenseItems: expenses.map((e) => ({
      id: String(e._id), title: e.title, amount: e.amount, currency: e.currency, category: e.category,
      categoryLabel: CATEGORY_LABELS[e.category] || e.category, date: e.date, recurring: !!e.recurring,
      endedAt: e.endedAt || null, active: !!e.recurring && !e.endedAt, note: e.note || '',
      eq: eq(e.amount, e.currency),
    })),
    categories: Object.keys(CATEGORY_LABELS).map((k) => ({ id: k, label: CATEGORY_LABELS[k] })),
    commitments,
  };
}

/** فلتر الطلبات المفعّلة في شهر (لقايمة "مين دفع") — null = كل الوقت */
function activatedRangeFilter(monthParam) {
  if (!isMonthKey(monthParam)) return null;
  const { from, to } = monthRange(monthParam);
  return { $gte: from, $lt: to };
}

module.exports = {
  buildFinance, getRates, setRates, monthKey, monthRange, shiftMonth, isMonthKey, activatedRangeFilter,
  CATEGORY_LABELS, round2,
};
