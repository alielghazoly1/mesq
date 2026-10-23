// utils/statsPage.js
// صفحة إحصائيات الدعوة المشاركة (/s/:token) — صاحب الدعوة بيبعتها للعيلة أو
// لمنظم الفرح. فيها كل حاجة عن الدعوة في مكان واحد:
//   الأرقام (مشاهدات، ضيوف مختلفين، هيحضروا، معتذرين، تهاني، صور)
//   المشاهدات آخر 30 يوم + الضيوف جايين منين
//   كشف الضيوف (بحث + فلتر)، التهاني الصوتية تتسمع، صور الضيوف، ولينكات
//   صفحة التهاني والألبوم كاملين.
// صفحة عرض بس (read-only)، متبعتة بلينك سري. من غير أي شرح — أرقام وصور وبس.

const { escapeHtml } = require('./sanitize');
const { generateShortId } = require('./idGenerator');

const nf = new Intl.NumberFormat('ar-EG-u-nu-latn');
const dtShort = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const dtDay = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const dtAxis = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });

const SRC = {
  direct: ['واتساب / مباشر', '#25D366'], whatsapp: ['واتساب', '#1da851'], instagram: ['إنستجرام', '#d62976'],
  facebook: ['فيسبوك', '#1877f2'], tiktok: ['تيك توك', '#111'], snapchat: ['سناب شات', '#e8c400'],
  google: ['جوجل', '#4285f4'], qr: ['QR مطبوع', '#b08d57'], other: ['مواقع تانية', '#8a7a68'],
};

const ICON = {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  arrow: '<path d="M15 6 9 12l6 6"/>',
};
const svg = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

function coupleTitle(invitation) {
  const coupleNames = `${invitation.brideNameAr || invitation.brideName || ''} & ${invitation.groomNameAr || invitation.groomName || ''}`.trim();
  const named = invitation.name && invitation.name.trim();
  return {
    title: named || (coupleNames !== '&' ? coupleNames : '') || 'دعوة',
    subtitle: named && coupleNames && coupleNames !== '&' ? coupleNames : '',
  };
}

function daysUntil(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((b - a) / 86400000);
}

function countdownText(date) {
  const n = daysUntil(date);
  if (n == null) return '';
  if (n > 1) return `فاضل ${nf.format(n)} يوم على الفرح`;
  if (n === 1) return 'الفرح بكرة';
  if (n === 0) return 'النهارده الفرح 🎉';
  return 'الفرح عدّى 🤍';
}

/** رسم المشاهدات (SVG من السيرفر — من غير أي مكتبة) */
function areaChart(series) {
  const W = 640; const H = 150; const P = 8;
  const vals = series.map((p) => p.views);
  const max = Math.max(1, ...vals);
  const step = (W - P * 2) / Math.max(1, series.length - 1);
  const pts = series.map((p, i) => [P + i * step, H - 22 - (p.views / max) * (H - 40)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - 22} L${P},${H - 22} Z`;
  // التواريخ تحت الرسم بـ HTML (جوه الـ SVG المطّاط كانت بتتمط وتتقص على الأطراف)
  const labels = [0, Math.floor(series.length / 2), series.length - 1].map((i) => {
    const [y, m, d] = series[i].day.split('-').map(Number);
    return `<span>${escapeHtml(dtAxis.format(new Date(Date.UTC(y, m - 1, d))))}</span>`;
  }).join('');
  const peakI = vals.indexOf(max);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="المشاهدات">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a24a" stop-opacity=".42"/><stop offset="1" stop-color="#c9a24a" stop-opacity="0"/></linearGradient></defs>
    ${[0.25, 0.5, 0.75].map((f) => `<line x1="${P}" x2="${W - P}" y1="${(H - 22 - f * (H - 40)).toFixed(1)}" y2="${(H - 22 - f * (H - 40)).toFixed(1)}" class="grid"/>`).join('')}
    <path d="${area}" fill="url(#ga)"/>
    <path d="${line}" fill="none" stroke="#b08d57" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${max > 0 && vals[peakI] > 0 ? `<circle cx="${pts[peakI][0].toFixed(1)}" cy="${pts[peakI][1].toFixed(1)}" r="4.5" fill="#22150c" stroke="#fff" stroke-width="2" vector-effect="non-scaling-stroke"/>` : ''}
  </svg><div class="axis">${labels}</div>`;
}

/**
 * @param {object} invitation مستند الدعوة
 * @param {object} stats { rsvpYes, rsvpNo, rsvpList, views?, uniques?, series?, sources?,
 *                         voices?: {count, list, link}, photos?: {count, list, link} }
 * @returns {string} HTML كامل
 */
function buildStatsPage(invitation, stats) {
  const rsvpYes = stats.rsvpYes || 0;
  const rsvpNo = stats.rsvpNo || 0;
  const rsvpList = stats.rsvpList || [];
  const total = rsvpYes + rsvpNo;
  const attendPct = total ? Math.round((rsvpYes / total) * 100) : 0;
  const { title, subtitle } = coupleTitle(invitation);
  const views = stats.totalViews != null ? stats.totalViews : (invitation.viewCount || 0);
  const series = stats.series || [];
  const hasSeries = series.some((p) => p.views > 0);
  const sources = Object.entries(stats.sources || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const srcTotal = sources.reduce((a, [, v]) => a + v, 0) || 1;
  const voices = stats.voices || null;
  const photos = stats.photos || null;
  const countdown = countdownText(invitation.weddingDateTime);
  const dateLine = invitation.weddingDateTime ? dtDay.format(new Date(invitation.weddingDateTime)) : '';

  const kpi = (icon, label, value, cls = '') => `<div class="kpi ${cls}"><span class="kpi-ic">${svg(icon, 16)}</span><div class="kpi-v">${nf.format(value || 0)}</div><div class="kpi-l">${label}</div></div>`;
  const kpis = [
    kpi('eye', 'المشاهدات', views),
    stats.uniques != null ? kpi('user', 'ضيوف مختلفين', stats.uniques) : '',
    kpi('check', 'هيحضروا', rsvpYes, 'ok'),
    kpi('x', 'معتذرين', rsvpNo, 'no'),
    voices ? kpi('mic', 'تهاني صوتية', voices.count, 'wine') : '',
    photos ? kpi('img', 'صور الضيوف', photos.count, 'rose') : '',
  ].filter(Boolean).join('');

  const guestRows = rsvpList.map((r) => `<li class="g" data-a="${r.attending ? 'y' : 'n'}" data-s="${escapeHtml(`${r.guestName || ''} ${r.note || ''}`.toLowerCase())}">
      <span class="av" style="background:${['#b08d57', '#3f8f6b', '#7a5ea8', '#c0605a', '#3d7fb8', '#a8783d'][[...String(r.guestName || '?')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 6]}">${escapeHtml(String(r.guestName || '?').trim().slice(0, 1))}</span>
      <div class="g-b">
        <div class="g-t"><b>${escapeHtml(r.guestName || '')}</b><span class="pill ${r.attending ? 'ok' : 'no'}">${r.attending ? 'هيحضر' : 'معتذر'}</span></div>
        ${r.note ? `<p class="g-n">${escapeHtml(r.note)}</p>` : ''}
        <div class="g-w">${r.createdAt ? escapeHtml(dtShort.format(new Date(r.createdAt))) : ''}</div>
      </div>
    </li>`).join('');

  const voiceRows = voices && voices.list.length ? voices.list.map((v, i) => `<li class="v">
      <button type="button" class="play" data-src="${escapeHtml(v.url)}" aria-label="تشغيل"><span class="i-play">${svg('play', 18)}</span><span class="i-pause">${svg('pause', 18)}</span></button>
      <div class="v-b"><b>${escapeHtml(v.guestName || `ضيف ${voices.count - i}`)}</b><div class="bar"><span></span></div></div>
      <span class="v-d">${Math.floor((v.duration || 0) / 60)}:${String(Math.round(v.duration || 0) % 60).padStart(2, '0')}</span>
    </li>`).join('') : '';

  const photoTiles = photos && photos.list.length ? photos.list.map((p) => `<a class="ph" href="${escapeHtml(p.large || p.thumb)}" target="_blank" rel="noopener"><img src="${escapeHtml(p.thumb)}" alt="" loading="lazy" decoding="async"></a>`).join('') : '';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="noindex, nofollow" />
<meta name="theme-color" content="#0f1d18" />
<title>إحصائيات ${escapeHtml(title)} — ميثاق</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{ --ivory:#faf5ec; --card:#fffdf8; --night:#0f1d18; --ink:#22150c; --dim:#8a7a68; --gold:#b08d57; --gold2:#c9a24a;
    --line:rgba(120,90,40,.14); --ok:#1f7a4d; --no:#a2465e; --wine:#7a2a37; }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--ivory);color:var(--ink);font-family:'Cairo',sans-serif;-webkit-font-smoothing:antialiased;line-height:1.6}
  a{color:inherit;text-decoration:none}
  .top{position:sticky;top:0;z-index:5;background:rgba(250,245,236,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .top-in{max-width:980px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
  .brand{font-family:'Amiri',serif;font-weight:700;font-size:24px;color:var(--gold);line-height:1}
  .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:999px;font-weight:800;font-size:13px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
  .btn-dark{background:var(--night);color:#faf5ec;border:0}
  .btn-gold{background:linear-gradient(90deg,var(--gold),var(--gold2));color:#241608;border:0;box-shadow:0 12px 26px -14px rgba(176,141,87,.9)}
  .wrap{max-width:980px;margin:0 auto;padding:18px 16px 60px}
  .hero{position:relative;overflow:hidden;border-radius:26px;background:var(--night);color:#faf5ec;padding:26px 22px}
  .hero:before{content:"";position:absolute;inset:-40% -20% auto auto;width:340px;height:340px;border-radius:50%;background:rgba(201,162,74,.22);filter:blur(60px)}
  .hero:after{content:"";position:absolute;inset:auto auto -45% -10%;width:300px;height:300px;border-radius:50%;background:rgba(34,90,66,.35);filter:blur(60px)}
  .hero>*{position:relative}
  .eyebrow{font-size:12px;font-weight:800;color:var(--gold2);letter-spacing:.06em}
  .hero h1{font-family:'Amiri',serif;font-size:32px;line-height:1.3;margin:6px 0 2px;word-break:break-word}
  .hero .sub{color:rgba(250,245,236,.7);font-size:14px}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:700;background:rgba(250,245,236,.09);color:rgba(250,245,236,.88)}
  .chip.gold{background:rgba(201,162,74,.18);color:#e6c684}
  .kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
  @media(min-width:720px){.kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px 16px;box-shadow:0 14px 34px -30px rgba(15,29,24,.6)}
  .kpi-ic{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:10px;background:rgba(176,141,87,.12);color:var(--gold)}
  .kpi-v{font-family:'Amiri',serif;font-weight:700;font-size:32px;line-height:1.1;margin-top:8px}
  .kpi-l{font-size:12.5px;color:var(--dim);font-weight:700}
  .kpi.ok .kpi-v,.kpi.ok .kpi-ic{color:var(--ok)} .kpi.ok .kpi-ic{background:rgba(31,122,77,.1)}
  .kpi.no .kpi-v,.kpi.no .kpi-ic{color:var(--no)} .kpi.no .kpi-ic{background:rgba(162,70,94,.1)}
  .kpi.wine .kpi-v,.kpi.wine .kpi-ic{color:var(--wine)} .kpi.wine .kpi-ic{background:rgba(122,42,55,.1)}
  .kpi.rose .kpi-v,.kpi.rose .kpi-ic{color:#a2465e} .kpi.rose .kpi-ic{background:rgba(162,70,94,.1)}
  .grid2{display:grid;gap:12px;margin-top:12px}
  @media(min-width:820px){.grid2{grid-template-columns:1.5fr 1fr}}
  .card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:16px;margin-top:12px}
  .grid2 .card{margin-top:0}
  .card h2{font-size:15px;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px}
  .card h2 .cnt{margin-inline-start:auto;font-size:12px;color:var(--dim);font-weight:700}
  .chart{width:100%;height:150px;display:block}
  .chart .grid{stroke:rgba(15,29,24,.07);stroke-dasharray:3 4}
  .axis{display:flex;justify-content:space-between;direction:ltr;font-size:11.5px;color:var(--dim);margin-top:4px}
  .ring{display:flex;align-items:center;gap:16px}
  .ring svg{flex:none}
  .ring-rows{flex:1;display:grid;gap:8px}
  .row{display:flex;justify-content:space-between;align-items:center;border-radius:12px;padding:8px 12px;font-weight:800;font-size:13px}
  .row.ok{background:rgba(31,122,77,.08);color:var(--ok)} .row.no{background:rgba(162,70,94,.08);color:var(--no)}
  .bars{display:grid;gap:10px}
  .b-h{display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:4px}
  .b-h span:last-child{color:var(--dim)}
  .b-t{height:8px;border-radius:8px;background:rgba(15,29,24,.06);overflow:hidden}
  .b-t i{display:block;height:100%;border-radius:8px}
  .tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .seg{display:flex;gap:4px;padding:4px;border-radius:999px;background:rgba(15,29,24,.05)}
  .seg button{border:0;background:transparent;border-radius:999px;padding:7px 12px;font:700 12.5px 'Cairo',sans-serif;color:var(--dim);cursor:pointer}
  .seg button.on{background:var(--night);color:#faf5ec}
  .search{flex:1;min-width:180px;position:relative}
  .search input{width:100%;border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 40px 10px 14px;font:16px 'Cairo',sans-serif;color:var(--ink);outline:none}
  .search input:focus{border-color:var(--gold)}
  .search svg{position:absolute;inset-inline-start:14px;top:50%;transform:translateY(-50%);color:var(--dim)}
  ul{list-style:none;margin:0;padding:0}
  .glist{display:grid;gap:8px;max-height:560px;overflow:auto}
  .g{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:16px;padding:10px 12px;background:#fff}
  .av{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800}
  .g-b{flex:1;min-width:0}
  .g-t{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .g-t b{font-size:14.5px}
  .pill{font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px}
  .pill.ok{background:rgba(31,122,77,.1);color:var(--ok)} .pill.no{background:rgba(162,70,94,.1);color:var(--no)}
  .g-n{margin:6px 0 0;font-size:13px;color:#5d4e3e;background:var(--ivory);border-radius:10px;padding:6px 10px}
  .g-w{font-size:11.5px;color:var(--dim);margin-top:4px}
  .empty{text-align:center;color:var(--dim);padding:26px 10px;font-size:13.5px}
  .vlist{display:grid;gap:8px}
  .v{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:16px;padding:10px 12px;background:#fff}
  .play{flex:none;width:42px;height:42px;border-radius:50%;border:0;color:#fff;cursor:pointer;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#9b3a4a,var(--wine))}
  .play .i-pause{display:none} .v.on .play .i-play{display:none} .v.on .play .i-pause{display:block}
  .v-b{flex:1;min-width:0} .v-b b{font-size:14px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bar{height:4px;border-radius:4px;background:rgba(122,42,55,.12);margin-top:7px;overflow:hidden}
  .bar span{display:block;height:100%;width:0;background:var(--wine);transition:width .2s linear}
  .v-d{font-size:12px;color:var(--dim);font-variant-numeric:tabular-nums}
  .phs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  @media(min-width:720px){.phs{grid-template-columns:repeat(6,minmax(0,1fr))}}
  .ph{aspect-ratio:1;border-radius:12px;overflow:hidden;background:#ece2cc}
  .ph img{width:100%;height:100%;object-fit:cover;display:block}
  .more{margin-top:12px;display:flex;justify-content:center}
  .foot{text-align:center;margin-top:30px;font-size:12px;color:var(--dim)}
  .foot a{color:var(--gold);font-weight:800}
  .rise{animation:rise .6s cubic-bezier(.2,.7,.2,1) both}
  @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.rise{animation:none}}
</style>
</head>
<body>
  <header class="top"><div class="top-in">
    <a class="brand" href="/">ميثاق</a>
    ${invitation.shortId ? `<a class="btn btn-dark" href="/i/${encodeURIComponent(invitation.shortId)}" data-open-invite>${svg('link', 15)} افتح الدعوة</a>` : ''}
  </div></header>

  <main class="wrap">
    <section class="hero rise" data-hero>
      <div class="eyebrow">إحصائيات الدعوة</div>
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<div class="sub">${escapeHtml(subtitle)}</div>` : ''}
      <div class="chips">
        ${dateLine ? `<span class="chip">${svg('cal', 14)} ${escapeHtml(dateLine)}</span>` : ''}
        ${countdown ? `<span class="chip gold" data-countdown>${escapeHtml(countdown)}</span>` : ''}
      </div>
    </section>

    <section class="kpis rise" data-kpis>${kpis}</section>

    <div class="grid2">
      ${hasSeries ? `<section class="card rise" data-chart><h2>${svg('eye', 16)} المشاهدات آخر 30 يوم</h2>${areaChart(series)}</section>` : ''}
      <section class="card rise" data-attend>
        <h2>${svg('check', 16)} الحضور <span class="cnt">${nf.format(total)} رد</span></h2>
        ${total ? `<div class="ring">
          <svg width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(15,29,24,.08)" stroke-width="9"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1f7a4d" stroke-width="9" stroke-linecap="round" transform="rotate(-90 50 50)"
              stroke-dasharray="${(2 * Math.PI * 42).toFixed(2)}" stroke-dashoffset="${(2 * Math.PI * 42 * (1 - attendPct / 100)).toFixed(2)}"/>
            <text x="50" y="52" text-anchor="middle" font-family="Amiri,serif" font-weight="700" font-size="22" fill="#1f7a4d">${attendPct}%</text>
            <text x="50" y="68" text-anchor="middle" font-family="Cairo,sans-serif" font-size="9" fill="#8a7a68">هيحضروا</text></svg>
          <div class="ring-rows"><div class="row ok"><span>هيحضروا</span><span>${nf.format(rsvpYes)}</span></div><div class="row no"><span>معتذرين</span><span>${nf.format(rsvpNo)}</span></div></div>
        </div>` : '<div class="empty">لسه مفيش ردود</div>'}
      </section>
    </div>

    ${sources.length ? `<section class="card rise" data-sources><h2>${svg('user', 16)} الضيوف جايين منين</h2><div class="bars">${sources.map(([k, v]) => {
      const [label, color] = SRC[k] || SRC.other;
      return `<div><div class="b-h"><span>${label}</span><span>${nf.format(v)} · ${Math.round((v / srcTotal) * 100)}%</span></div><div class="b-t"><i style="width:${Math.max(3, (v / sources[0][1]) * 100)}%;background:${color}"></i></div></div>`;
    }).join('')}</div></section>` : ''}

    <section class="card rise" data-guests>
      <h2>${svg('user', 16)} الضيوف <span class="cnt">${nf.format(total)}</span></h2>
      ${total ? `<div class="tools">
        <div class="seg" role="tablist"><button type="button" class="on" data-f="all">الكل ${nf.format(total)}</button><button type="button" data-f="y">هيحضروا ${nf.format(rsvpYes)}</button><button type="button" data-f="n">معتذرين ${nf.format(rsvpNo)}</button></div>
        <label class="search">${svg('search', 15)}<input type="search" placeholder="دوّر باسم ضيف" data-q></label>
      </div>
      <ul class="glist">${guestRows}</ul>
      <div class="empty" data-none hidden>مفيش حد بالاسم ده</div>` : '<div class="empty">لسه محدش أكّد حضوره</div>'}
    </section>

    ${voices ? `<section class="card rise" data-voices>
      <h2>${svg('mic', 16)} التهاني الصوتية <span class="cnt">${nf.format(voices.count)}</span></h2>
      ${voiceRows ? `<ul class="vlist">${voiceRows}</ul>` : '<div class="empty">لسه مفيش تهاني</div>'}
      ${voices.link && voices.count ? `<div class="more"><a class="btn btn-gold" href="${escapeHtml(voices.link)}" data-voices-link>${svg('mic', 15)} كل التهاني${voices.count > voices.list.length ? ` (${nf.format(voices.count)})` : ''}</a></div>` : ''}
    </section>` : ''}

    ${photos ? `<section class="card rise" data-photos>
      <h2>${svg('img', 16)} صور الضيوف <span class="cnt">${nf.format(photos.count)}</span></h2>
      ${photoTiles ? `<div class="phs">${photoTiles}</div>` : '<div class="empty">لسه مفيش صور</div>'}
      ${photos.link && photos.count ? `<div class="more"><a class="btn btn-gold" href="${escapeHtml(photos.link)}" data-album-link>${svg('img', 15)} الألبوم كامل</a></div>` : ''}
    </section>` : ''}

    <div class="foot">اتعملت بـ <a href="/">ميثاق</a> — دعوات زفاف وخطوبة إلكترونية</div>
  </main>
<script>
(function(){
  var f='all', q='';
  var items=[].slice.call(document.querySelectorAll('.g'));
  var none=document.querySelector('[data-none]');
  function apply(){ var n=0; items.forEach(function(li){ var ok=(f==='all'||li.getAttribute('data-a')===f)&&(!q||li.getAttribute('data-s').indexOf(q)!==-1); li.style.display=ok?'':'none'; if(ok)n++; }); if(none) none.hidden=n>0; }
  [].forEach.call(document.querySelectorAll('.seg button'),function(b){ b.addEventListener('click',function(){ [].forEach.call(document.querySelectorAll('.seg button'),function(x){x.classList.remove('on')}); b.classList.add('on'); f=b.getAttribute('data-f'); apply(); }); });
  var inp=document.querySelector('[data-q]'); if(inp) inp.addEventListener('input',function(){ q=inp.value.trim().toLowerCase(); apply(); });
  var cur=null, audio=new Audio();
  audio.addEventListener('timeupdate',function(){ if(cur&&audio.duration) cur.querySelector('.bar span').style.width=(audio.currentTime/audio.duration*100)+'%'; });
  audio.addEventListener('ended',function(){ if(cur){ cur.classList.remove('on'); cur.querySelector('.bar span').style.width='0'; } cur=null; });
  [].forEach.call(document.querySelectorAll('.play'),function(b){ b.addEventListener('click',function(){ var row=b.closest('.v');
    if(cur===row){ if(audio.paused){ audio.play(); row.classList.add('on'); } else { audio.pause(); row.classList.remove('on'); } return; }
    if(cur) cur.classList.remove('on'); cur=row; audio.src=b.getAttribute('data-src'); audio.play().catch(function(){}); row.classList.add('on'); }); });
})();
</script>
</body>
</html>`;
}

async function loadStatsData(Rsvp, shortId) {
  const [agg, rsvpList] = await Promise.all([
    Rsvp.aggregate([
      { $match: { shortId } },
      { $group: { _id: '$attending', count: { $sum: 1 } } },
    ]),
    Rsvp.find({ shortId }).sort({ createdAt: -1 }).limit(300).lean(),
  ]);
  let rsvpYes = 0;
  let rsvpNo = 0;
  for (const row of agg) {
    if (row._id === true) rsvpYes = row.count;
    else if (row._id === false) rsvpNo = row.count;
  }
  return { rsvpYes, rsvpNo, rsvpList };
}

/**
 * بيتأكد إن الدعوة ليها توكن سري لصفحة الإحصائيات — بيولّده ويحفظه لو مش
 * موجود (الدعوات القديمة). بياخد مستند Mongoose كامل (مش lean) عشان يقدر
 * يحفظ. بيرجّع التوكن.
 * @param {import('mongoose').Document} invitation
 * @returns {Promise<string>}
 */
async function ensureStatsToken(invitation) {
  if (invitation.statsToken) return invitation.statsToken;
  // تحديث مباشر للحقل ده بس (مش save) — الدعوات القديمة ممكن يكون ناقصها
  // حقول بقت مطلوبة بعدين (زي venueCity)، وsave كان بيفشل عليها بخطأ تحقق.
  // والشرط statsToken مش موجود بيمنع إن طلبين مع بعض يولّدوا توكنين مختلفين.
  const Model = invitation.constructor;
  for (let i = 0; i < 5; i += 1) {
    const token = generateShortId(24);
    try {
      const r = await Model.updateOne(
        { _id: invitation._id, $or: [{ statsToken: { $exists: false } }, { statsToken: null }, { statsToken: '' }] },
        { $set: { statsToken: token } },
      );
      if (r.modifiedCount === 1) { invitation.statsToken = token; return token; }
      // حد تاني لحق ولّد توكن — نستخدم بتاعه
      const cur = await Model.findById(invitation._id).select('statsToken').lean();
      if (cur && cur.statsToken) { invitation.statsToken = cur.statsToken; return cur.statsToken; }
      throw new Error('invitation not found');
    } catch (err) {
      // توكن اتكرر (نادر جدًا) — نجرّب واحد جديد
      if (err && err.code === 11000) continue;
      throw err;
    }
  }
  throw new Error('could not generate a unique statsToken');
}

module.exports = { buildStatsPage, loadStatsData, ensureStatsToken, countdownText };
