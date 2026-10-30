// utils/campaignSharePage.js
// صفحة أرقام إعلان واحد (/ad/<token>) — المالك بيبعت اللينك للي بيعمله
// الإعلانات. فيها أرقام الإعلان ده بس: دخلوا ← سجّلوا ← دفعوا، الصرف وتكلفة
// كل عميل، والعائد (لو المالك سايبه ظاهر)، ويوم بيوم، والمصادر والأجهزة.
// مفيش فيها اسم أو إيميل أو تليفون أي عميل، ولا أي حاجة عن باقي الموقع.
// HTML عادي من غير أي سكريبت.
const { getPackage } = require('../packages/registry');

const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const num = (n) => Number(n || 0).toLocaleString('en-US');
const r2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
const pct = (a, b) => (b ? `${r2((a / b) * 100)}%` : '—');
const CUR = { EGP: 'ج.م', USD: '$', SAR: 'ر.س', EUR: '€' };
const money = (n, cur) => (cur === 'USD' || cur === 'EUR' ? `${CUR[cur]}${num(r2(n))}` : `${num(r2(n))} ${CUR[cur] || cur}`);

const PLATFORM = { instagram: 'إنستجرام', facebook: 'فيسبوك', tiktok: 'تيك توك', google: 'جوجل', snapchat: 'سناب شات', whatsapp: 'واتساب', other: 'إعلان' };
const SRC = { instagram: 'من جوه إنستجرام', facebook: 'من جوه فيسبوك', tiktok: 'من جوه تيك توك', snapchat: 'من جوه سناب', browser: 'متصفح عادي' };
const DEVICE = { mobile: 'موبايل', desktop: 'كمبيوتر', tablet: 'تابلت' };
const STATUS = {
  paid: ['دفع ✓', 'ok'], receipt: ['بعت الدفع — مستني التأكيد', 'warn'],
  ordered: ['فتح صفحة الدفع', 'muted'], signed: ['سجّل بس', 'muted'],
};
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

let regionNames = null;
try { regionNames = new Intl.DisplayNames(['ar'], { type: 'region' }); } catch { regionNames = null; }
const country = (c) => {
  if (!c) return 'غير معروف';
  try { return (regionNames && regionNames.of(String(c).toUpperCase())) || c; } catch { return c; }
};
/** تاريخ بتوقيت مصر: "28 أكتوبر" */
function day(d, withTime) {
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return '';
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(t);
  const g = (k) => (f.find((x) => x.type === k) || {}).value;
  const base = `${Number(g('day'))} ${MONTHS[Number(g('month')) - 1]}`;
  return withTime ? `${base} · ${g('hour')}:${g('minute')} ${g('dayPeriod') === 'AM' ? 'ص' : 'م'}` : base;
}
const dayKeyLabel = (k) => { const [, m, d] = k.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]}`; };

/** رسم يوم بيوم (SVG): عمود لكل يوم للي دخلوا، ونقط للتسجيل والدفع */
function chart(daily) {
  const W = 720, H = 190, top = 14, bottom = 26, left = 6, right = 6;
  const n = daily.length || 1;
  const slot = (W - left - right) / n;
  const max = Math.max(1, ...daily.map((d) => d.visitors), ...daily.map((d) => d.signups));
  const y = (v) => top + (H - top - bottom) * (1 - v / max);
  const parts = [];
  [0.5, 1].forEach((f) => parts.push(`<line x1="0" x2="${W}" y1="${y(max * f)}" y2="${y(max * f)}" class="grid"/>`));
  daily.forEach((d, i) => {
    const x = left + i * slot;
    const bw = Math.max(2, slot * 0.62);
    if (d.visitors) parts.push(`<rect x="${(x + (slot - bw) / 2).toFixed(1)}" y="${y(d.visitors).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - bottom - y(d.visitors)).toFixed(1)}" rx="2" class="bar"><title>${esc(dayKeyLabel(d.date))}: ${d.visitors} دخلوا · ${d.signups} سجّلوا · ${d.payers} دفعوا</title></rect>`);
    if (d.signups) parts.push(`<circle cx="${(x + slot / 2).toFixed(1)}" cy="${y(d.signups).toFixed(1)}" r="4" class="dot-s"/>`);
    if (d.payers) parts.push(`<circle cx="${(x + slot / 2).toFixed(1)}" cy="${(H - bottom - 7).toFixed(1)}" r="4.5" class="dot-p"/>`);
    if (i % 5 === 0 || i === n - 1) parts.push(`<text x="${(x + slot / 2).toFixed(1)}" y="${H - 8}" class="lbl">${esc(dayKeyLabel(d.date))}</text>`);
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="يوم بيوم">${parts.join('')}</svg>`;
}

function bars(rows) {
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;
  return rows.map((r) => `
    <div class="brow"><span class="bname">${esc(r.label)}</span><span class="btrack"><span class="bfill" style="width:${Math.max(3, (r.n / total) * 100).toFixed(1)}%"></span></span><span class="bnum">${num(r.n)} <small>${pct(r.n, total)}</small></span></div>`).join('');
}
const countBy = (list, key, labels) => {
  const m = {};
  list.forEach((x) => { const k = typeof key === 'function' ? key(x) : x[key]; m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ label: labels ? labels(k) : k, n }));
};

/**
 * @param {object} p
 * @param {object} p.campaign  الإعلان (lean)
 * @param {object} p.stats     من statsFor
 * @param {Array}  p.people    من campaignDetail (بنستخدم منها البلد والحالة والباقة والتاريخ بس)
 * @param {Array}  p.daily
 * @param {Array}  p.hitLog
 * @param {object} p.rates     جنيه لكل وحدة
 */
function renderCampaignSharePage({ campaign: c, stats: s, people, daily, hitLog, rates }) {
  const showMoney = c.shareMoney !== false;
  const start = new Date(c.startedAt || c.createdAt || 0);
  const egp = (amount, cur) => (Number(amount) || 0) * (rates[cur] || (cur === 'EGP' ? 1 : 0));
  const spendCur = c.spendCurrency === 'USD' ? 'USD' : 'EGP';
  const spend = Number(c.spendAmount) || 0;
  const spendEgp = egp(spend, spendCur);
  const revenueEgp = ['EGP', 'USD', 'SAR', 'EUR'].reduce((a, k) => a + egp(s.revenue[k], k), 0);
  const revParts = ['EGP', 'USD', 'SAR', 'EUR'].filter((k) => s.revenue[k]).map((k) => money(s.revenue[k], k));
  const per = (n) => (spend && n ? money(spend / n, spendCur) : '—');

  const tiles = [
    ['دخلوا الموقع فعلًا', num(s.visitors), `فتحوا اللينك ${num(s.clicks)} مرة`],
    ['سجّلوا حساب', num(s.signups), `${pct(s.signups, s.visitors)} من اللي دخلوا`],
    ['دفعوا', num(s.payers), `${pct(s.payers, s.signups)} من اللي سجّلوا`],
  ];
  if (s.pendingReceipts) tiles.push(['بعتوا الدفع ومستنيين التأكيد', num(s.pendingReceipts), 'هيتحسبوا "دفعوا" أول ما يتأكدوا']);

  const cost = [
    ['اتصرف على الإعلان', spend ? money(spend, spendCur) : 'لسه ماتكتبش'],
    ['تكلفة الزائر', per(s.visitors)],
    ['تكلفة التسجيل', per(s.signups)],
    ['تكلفة العميل اللي دفع', per(s.payers)],
  ];
  if (showMoney) {
    cost.push(['الفلوس اللي دخلت', revParts.length ? revParts.join(' + ') : '0']);
    if (spendEgp) cost.push(['العائد (ROAS)', revenueEgp ? `${r2(revenueEgp / spendEgp)}x — كل 1 جنيه رجّع ${r2(revenueEgp / spendEgp)} جنيه` : '0x']);
  }

  const counted = hitLog.filter((h) => h.status === 'counted' && new Date(h.at) >= start);
  const f = s.filtered || {};
  const notCounted = (f.bot || 0) + (f.prefetch || 0) + (f.owner || 0) + (f.pending || 0);
  const paidPkgs = countBy(people.filter((p) => p.status === 'paid' && p.packageId), 'packageId', (k) => { const pk = getPackage(k); return pk ? pk.name.ar : k; });
  // الرسم يبدأ من يوم ما الإعلان اشتغل (مش 30 يوم فاضيين قبله) — 7 أيام على الأقل
  const startKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(start);
  const from = daily.findIndex((d) => d.date >= startKey);
  const chartDays = daily.slice(Math.max(0, Math.min(from < 0 ? 0 : from, daily.length - 7)));
  const activeDays = daily.filter((d) => d.visitors || d.signups || d.payers).reverse();

  const recent = people.slice(0, 50).map((p, i) => {
    const [label, tone] = STATUS[p.status] || STATUS.signed;
    const pk = p.status === 'paid' && p.packageId ? getPackage(p.packageId) : null;
    return `<tr><td class="muted">#${people.length - i}</td><td>${esc(country(p.country))}</td><td>${esc(day(p.signedUpAt, true))}</td><td><span class="tag ${tone}">${esc(label)}</span>${pk ? ` <span class="muted">${esc(pk.name.ar)}</span>` : ''}</td></tr>`;
  }).join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>${esc(c.name)} — أرقام الإعلان | ميثاق</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#f7f3ec;--card:#fffdf9;--ink:#1f1a14;--muted:#7a6f62;--line:#e8dfd1;--brass:#a8792d;--brass-soft:#f1e3c6;--ok:#1f8a5b;--ok-soft:#dcf2e7;--warn:#a8650e;--warn-soft:#fbead1;--rose:#c2416b;--bar:#d9b56f}
@media (prefers-color-scheme:dark){:root{--bg:#14110d;--card:#1d1914;--ink:#f3ede3;--muted:#a49884;--line:#2f2920;--brass:#e0b765;--brass-soft:#3a2f1c;--ok:#4fd393;--ok-soft:#173326;--warn:#f0b860;--warn-soft:#3a2b14;--rose:#f07ba0;--bar:#9c7a3c}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Cairo,system-ui,sans-serif;line-height:1.6;-webkit-text-size-adjust:100%}
.wrap{max-width:860px;margin:0 auto;padding:22px 16px 48px}
.brand{color:var(--brass);font-weight:800;font-size:15px;letter-spacing:0}
h1{margin:4px 0 2px;font-size:24px;font-weight:800}
.sub{color:var(--muted);font-size:13.5px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{background:var(--brass-soft);color:var(--brass);border-radius:99px;padding:3px 11px;font-size:12.5px;font-weight:700}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:16px}
.card h2{margin:0 0 12px;font-size:15.5px;font-weight:800}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.tile{background:var(--bg);border-radius:14px;padding:12px 14px}
.tile .k{font-size:12.5px;color:var(--muted)}
.tile .v{font-size:30px;font-weight:800;line-height:1.25}
.tile .s{font-size:12px;color:var(--muted)}
.kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
.kv div{display:flex;justify-content:space-between;gap:10px;background:var(--bg);border-radius:12px;padding:10px 12px;font-size:13.5px}
.kv b{font-weight:800;text-align:left}
.chart{width:100%;height:auto;display:block}
.chart .grid{stroke:var(--line);stroke-dasharray:3 4}
.chart .bar{fill:var(--bar)}
.chart .dot-s{fill:var(--ok)}
.chart .dot-p{fill:var(--rose)}
.chart .lbl{fill:var(--muted);font-size:11px;text-anchor:middle;font-family:Cairo,sans-serif}
.legend{display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;color:var(--muted);margin-top:6px}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-inline-end:5px;vertical-align:-1px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
.brow{display:grid;grid-template-columns:110px 1fr auto;align-items:center;gap:8px;font-size:13px;margin:7px 0}
.btrack{height:8px;background:var(--bg);border-radius:99px;overflow:hidden}
.bfill{display:block;height:100%;background:linear-gradient(90deg,var(--brass),var(--bar));border-radius:99px}
.bnum{font-weight:700;white-space:nowrap}.bnum small{color:var(--muted);font-weight:400}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{color:var(--muted);font-weight:600;text-align:start;padding:6px 8px;border-bottom:1px solid var(--line)}
.tbl td{padding:8px;border-bottom:1px solid var(--line)}
.tbl tr:last-child td{border-bottom:0}
.scroll{overflow-x:auto}
.tag{display:inline-block;border-radius:99px;padding:1px 9px;font-size:12px;font-weight:700;background:var(--bg);color:var(--muted)}
.tag.ok{background:var(--ok-soft);color:var(--ok)}.tag.warn{background:var(--warn-soft);color:var(--warn)}
.muted{color:var(--muted)}
.note{font-size:12.5px;color:var(--muted);margin:10px 0 0}
.empty{color:var(--muted);font-size:13.5px;margin:0}
footer{margin-top:22px;text-align:center;color:var(--muted);font-size:12px}
@media (max-width:480px){h1{font-size:21px}.tiles{grid-template-columns:1fr 1fr}.tile .v{font-size:26px}.chart .lbl{font-size:18px}.brow{grid-template-columns:88px 1fr auto}}
</style>
</head>
<body>
<main class="wrap" data-campaign-share="${esc(c.code)}">
  <div class="brand">ميثاق · أرقام الإعلان</div>
  <h1>${esc(c.name)}</h1>
  <div class="sub">الأرقام من يوم ${esc(day(start))} لحد دلوقتي · آخر تحديث ${esc(day(new Date(), true))} (حدّث الصفحة تشوف الجديد)</div>
  <div class="chips"><span class="chip">${esc(PLATFORM[c.platform] || 'إعلان')}</span>${c.market ? `<span class="chip">${esc(c.market)}</span>` : ''}${c.archived ? '<span class="chip">الإعلان مقفول</span>' : ''}</div>

  <section class="card">
    <h2>من الإعلان للبيع</h2>
    <div class="tiles">${tiles.map(([k, v, sub]) => `<div class="tile"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div><div class="s">${esc(sub)}</div></div>`).join('')}</div>
    <p class="note">"دخلوا فعلًا" = أشخاص حقيقيين الصفحة اتفتحت قدامهم. مش داخل فيها: ${num(notCounted)} فتحة من برامج آلية أو مراجعة المنصة أو تحميل مسبق أو ناس قفلوا على طول.</p>
  </section>

  <section class="card">
    <h2>الصرف والتكلفة${showMoney ? ' والعائد' : ''}</h2>
    <div class="kv">${cost.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>يوم بيوم${chartDays.length < daily.length ? '' : ' — آخر 30 يوم'}</h2>
    ${chart(chartDays)}
    <div class="legend"><span><i style="background:var(--bar)"></i>دخلوا</span><span><i style="background:var(--ok);border-radius:99px"></i>سجّلوا</span><span><i style="background:var(--rose);border-radius:99px"></i>دفعوا</span></div>
    ${activeDays.length ? `<div class="scroll"><table class="tbl" style="margin-top:12px"><thead><tr><th>اليوم</th><th>دخلوا</th><th>سجّلوا</th><th>دفعوا</th></tr></thead><tbody>${activeDays.map((d) => `<tr><td>${esc(dayKeyLabel(d.date))}</td><td>${num(d.visitors)}</td><td>${num(d.signups)}</td><td>${num(d.payers)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">لسه مفيش حركة في آخر 30 يوم.</p>'}
  </section>

  <section class="card">
    <div class="cols">
      <div><h2>الزوار جم منين</h2>${counted.length ? bars(countBy(counted, 'src', (k) => SRC[k] || k)) : '<p class="empty">لسه مفيش.</p>'}</div>
      <div><h2>بأي جهاز</h2>${counted.length ? bars(countBy(counted, 'device', (k) => DEVICE[k] || k)) : '<p class="empty">لسه مفيش.</p>'}</div>
      <div><h2>اللي سجّلوا من أنهي بلد</h2>${people.length ? bars(countBy(people, (p) => country(p.country))) : '<p class="empty">لسه مفيش.</p>'}</div>
      ${paidPkgs.length ? `<div><h2>اشتروا أنهي باقة</h2>${bars(paidPkgs)}</div>` : ''}
    </div>
    ${counted.length ? `<p class="note">المصادر والأجهزة من آخر ${num(counted.length)} زيارة متحسوبة.</p>` : ''}
  </section>

  <section class="card">
    <h2>آخر اللي سجّلوا من الإعلان (${num(people.length)})</h2>
    ${people.length ? `<div class="scroll"><table class="tbl"><thead><tr><th></th><th>البلد</th><th>سجّل</th><th>وصل لفين</th></tr></thead><tbody>${recent}</tbody></table></div>
    <p class="note">من غير أسامي أو أرقام — خصوصية العملاء.${people.length > 50 ? ' ظاهر آخر 50 بس.' : ''}</p>` : '<p class="empty">لسه محدش سجّل من الإعلان ده.</p>'}
  </section>

  <footer>ميثاق — mithaq-invitation.com · اللينك ده خاص، ماتنشروش</footer>
</main>
</body>
</html>`;
}

module.exports = { renderCampaignSharePage };
