// utils/renderStats.js
// صفحة تقرير/إحصائيات الدعوة — HTML مستقل بيتقدّم على لينك سري منفصل
// (/s/:statsToken)، عشان صاحب الدعوة يشاركه مع عميله من غير ما يدّيله
// دخول على حسابه أو على المحرر.
//
// كل بيانات الضيوف (أسماء، ملاحظات) بتتهرّب بـ escapeHtml قبل ما تدخل
// الصفحة — الصفحة دي بتتشارك بره، فأي نص ضيف مايصحّش يتفسّر كـ HTML.
const { escapeHtml } = require('./sanitize');

/** تاريخ كامل بالعربي بأرقام لاتينية */
function fullDate(d) {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(d));
  } catch { return ''; }
}

/** تاريخ + وقت مختصر لكل رد */
function shortDateTime(d) {
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(d));
  } catch { return ''; }
}

/**
 * @param {object} p
 * @param {object} p.invitation مستند الدعوة
 * @param {string} p.templateName اسم التصميم للعرض
 * @param {number} p.rsvpYes عدد الحاضرين
 * @param {number} p.rsvpNo عدد المعتذرين
 * @param {Array}  p.rsvpList قايمة الردود (guestName, attending, note, createdAt)
 * @param {string} p.pageUrl رابط الصفحة الكامل (لوسوم المشاركة)
 * @returns {string} HTML كامل
 */
function renderStatsPage({ invitation, templateName, rsvpYes = 0, rsvpNo = 0, rsvpList = [], pageUrl = '' }) {
  const nameAr = `${invitation.brideNameAr || ''} & ${invitation.groomNameAr || ''}`.trim().replace(/^&\s*|\s*&$/g, '');
  const heading = invitation.title && invitation.title.trim() ? invitation.title.trim() : nameAr;
  // لو الاسم المخصص مختلف عن أسماء العروسين، بنعرض العروسين كسطر ثانوي
  const showCouple = heading !== nameAr && nameAr;

  const views = invitation.viewCount || 0;
  const rsvpTotal = rsvpYes + rsvpNo;
  // نسبة الحضور في الشريط البصري — لو مفيش ردود، الشريط بيفضل فاضي
  const yesPct = rsvpTotal ? Math.round((rsvpYes / rsvpTotal) * 100) : 0;

  const rows = rsvpList.length
    ? rsvpList.map((r) => {
      const badge = r.attending
        ? '<span class="badge badge--yes">هيحضر</span>'
        : '<span class="badge badge--no">معتذر</span>';
      const note = r.note ? `<p class="row__note">${escapeHtml(r.note)}</p>` : '';
      return `<li class="row">
        <div class="row__head">
          <span class="row__name">${escapeHtml(r.guestName || '')}</span>
          ${badge}
        </div>
        ${note}
        <time class="row__when">${escapeHtml(shortDateTime(r.createdAt))}</time>
      </li>`;
    }).join('')
    : '<li class="empty">لسه محدش أكّد حضوره — أول ما يبدأ الضيوف يردّوا هتلاقي ردودهم هنا.</li>';

  // وصف المشاركة (واتساب/فيسبوك): سطر مختصر بالأرقام
  const ogTitle = `تقرير دعوة ${heading}`;
  const ogDesc = `${views} مشاهدة · ${rsvpYes} هيحضروا · ${rsvpNo} معتذرين`;

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(ogTitle)}</title>
<meta property="og:title" content="${escapeHtml(ogTitle)}" />
<meta property="og:description" content="${escapeHtml(ogDesc)}" />
<meta property="og:type" content="website" />
${pageUrl ? `<meta property="og:url" content="${escapeHtml(pageUrl)}" />` : ''}
<meta name="twitter:card" content="summary" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#12100e; --panel:#1b1712; --panel-2:#221d17; --line:rgba(201,162,39,.22);
    --parchment:#efe7d8; --parchment-dim:#b6a98f; --brass:#d0a83a; --brass-soft:#e6c766;
    --good:#86b46a; --bad:#cf8360;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;}
  body{
    min-height:100vh; background:
      radial-gradient(1200px 600px at 50% -10%, rgba(208,168,58,.10), transparent 60%),
      var(--ink);
    color:var(--parchment); font-family:'Cairo',sans-serif;
    -webkit-font-smoothing:antialiased; padding:20px;
  }
  .wrap{ max-width:720px; margin:0 auto; }

  .brand{ display:flex; align-items:center; justify-content:center; gap:8px; padding:8px 0 22px; }
  .brand__mark{ font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; color:var(--brass-soft); letter-spacing:.02em; }
  .brand__tag{ font-size:11px; letter-spacing:.28em; text-transform:uppercase; color:var(--parchment-dim); }

  .hero{
    background:linear-gradient(180deg, var(--panel-2), var(--panel));
    border:1px solid var(--line); border-radius:22px; padding:34px 28px; text-align:center;
  }
  .hero__eyebrow{ font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:var(--brass); margin-bottom:12px; }
  .hero__title{ font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:600; font-size:32px; line-height:1.15; margin:0; color:#fff; }
  .hero__couple{ margin-top:8px; font-size:14px; color:var(--parchment-dim); }
  .hero__meta{ margin-top:16px; display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .chip{ font-size:12px; color:var(--parchment); background:rgba(201,162,39,.10); border:1px solid var(--line); border-radius:999px; padding:6px 13px; }

  .kpis{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:16px; }
  @media (max-width:560px){ .kpis{ grid-template-columns:repeat(2,1fr); } }
  .kpi{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:18px 12px; text-align:center; }
  .kpi__num{ font-family:'Cormorant Garamond',serif; font-weight:600; font-size:38px; line-height:1; color:var(--brass-soft); }
  .kpi__label{ font-size:12px; color:var(--parchment-dim); margin-top:8px; }

  .bar-card{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:20px; margin-top:12px; }
  .bar-card__head{ display:flex; justify-content:space-between; font-size:12.5px; color:var(--parchment-dim); margin-bottom:10px; }
  .bar{ height:12px; border-radius:999px; background:rgba(207,131,96,.22); overflow:hidden; }
  .bar__fill{ height:100%; border-radius:999px; background:linear-gradient(90deg,var(--good),#a7cf8a); }
  .bar__legend{ display:flex; gap:16px; margin-top:10px; font-size:12px; color:var(--parchment-dim); }
  .dot{ display:inline-block; width:9px; height:9px; border-radius:50%; margin-inline-end:5px; vertical-align:middle; }
  .dot--yes{ background:var(--good); } .dot--no{ background:var(--bad); }

  .section-title{ font-size:13px; letter-spacing:.06em; color:var(--parchment-dim); margin:26px 4px 10px; }
  .list{ list-style:none; margin:0; padding:0; background:var(--panel); border:1px solid var(--line); border-radius:16px; overflow:hidden; }
  .row{ padding:15px 18px; border-bottom:1px solid rgba(201,162,39,.12); }
  .row:last-child{ border-bottom:0; }
  .row__head{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .row__name{ font-weight:600; font-size:15px; color:var(--parchment); }
  .badge{ font-size:11px; font-weight:700; padding:4px 11px; border-radius:999px; white-space:nowrap; }
  .badge--yes{ background:rgba(134,180,106,.16); color:var(--good); }
  .badge--no{ background:rgba(207,131,96,.16); color:var(--bad); }
  .row__note{ margin:8px 0 0; font-size:13px; line-height:1.7; color:var(--parchment-dim); }
  .row__when{ display:block; margin-top:7px; font-size:11px; color:var(--parchment-dim); opacity:.7; }
  .empty{ padding:34px 20px; text-align:center; color:var(--parchment-dim); font-size:13.5px; line-height:1.8; }

  .foot{ text-align:center; margin:24px 0 8px; font-size:11.5px; color:var(--parchment-dim); }
  .foot b{ color:var(--brass-soft); font-family:'Cormorant Garamond',serif; font-weight:600; font-size:14px; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <span class="brand__mark">ميثاق</span>
      <span class="brand__tag">تقرير الدعوة</span>
    </div>

    <section class="hero">
      <div class="hero__eyebrow">إحصائيات الدعوة</div>
      <h1 class="hero__title">${escapeHtml(heading)}</h1>
      ${showCouple ? `<div class="hero__couple">${escapeHtml(nameAr)}</div>` : ''}
      <div class="hero__meta">
        ${templateName ? `<span class="chip">${escapeHtml(templateName)}</span>` : ''}
        ${invitation.weddingDateTime ? `<span class="chip">يوم الفرح: ${escapeHtml(fullDate(invitation.weddingDateTime))}</span>` : ''}
      </div>
    </section>

    <div class="kpis">
      <div class="kpi"><div class="kpi__num">${views}</div><div class="kpi__label">مشاهدة</div></div>
      <div class="kpi"><div class="kpi__num">${rsvpTotal}</div><div class="kpi__label">إجمالي الردود</div></div>
      <div class="kpi"><div class="kpi__num">${rsvpYes}</div><div class="kpi__label">هيحضروا</div></div>
      <div class="kpi"><div class="kpi__num">${rsvpNo}</div><div class="kpi__label">معتذرين</div></div>
    </div>

    ${rsvpTotal ? `<div class="bar-card">
      <div class="bar-card__head"><span>نسبة الحضور</span><span>${yesPct}%</span></div>
      <div class="bar"><div class="bar__fill" style="width:${yesPct}%"></div></div>
      <div class="bar__legend">
        <span><span class="dot dot--yes"></span>هيحضروا (${rsvpYes})</span>
        <span><span class="dot dot--no"></span>معتذرين (${rsvpNo})</span>
      </div>
    </div>` : ''}

    <div class="section-title">ردود الضيوف${rsvpList.length ? ` (${rsvpList.length})` : ''}</div>
    <ul class="list">${rows}</ul>

    <p class="foot">
      اتعملت في ${escapeHtml(fullDate(invitation.createdAt))} · بواسطة <b>ميثاق</b>
    </p>
  </div>
</body>
</html>`;
}

module.exports = { renderStatsPage };
