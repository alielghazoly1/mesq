// utils/statsPage.js
// صفحة إحصائيات الدعوة المشاركة (/s/:token) — بلون البيج بتاع البراند
// وعليها اسم "ميثاق". بتعرض عدد المشاهدات، ملخص ردود الحضور، وقائمة
// الردود بأسماء الضيوف ورسائلهم. صفحة عرض بس (read-only)، متبعتة بلينك سري.

const { escapeHtml } = require('./sanitize');
const { generateShortId } = require('./idGenerator');

const dtFull = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
});
const dtShort = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

/**
 * @param {object} invitation مستند الدعوة
 * @param {{ rsvpYes:number, rsvpNo:number, rsvpList:Array }} stats
 * @returns {string} HTML كامل
 */
function buildStatsPage(invitation, stats) {
  const rsvpYes = stats.rsvpYes || 0;
  const rsvpNo = stats.rsvpNo || 0;
  const rsvpList = stats.rsvpList || [];
  const rsvpTotal = rsvpYes + rsvpNo;

  const coupleNames = `${invitation.brideNameAr || invitation.brideName || ''} & ${invitation.groomNameAr || invitation.groomName || ''}`.trim();
  const title = (invitation.name && invitation.name.trim()) || coupleNames || 'دعوة';
  // لو فيه اسم مخصّص، بنعرض أسماء العروسين تحته كسطر تعريفي
  const subtitle = (invitation.name && invitation.name.trim() && coupleNames && coupleNames !== '&')
    ? coupleNames : '';

  const createdAt = invitation.createdAt ? dtFull.format(new Date(invitation.createdAt)) : '';

  const rows = rsvpList.length
    ? rsvpList.map((r) => {
        const when = r.createdAt ? dtShort.format(new Date(r.createdAt)) : '';
        const badge = r.attending
          ? '<span class="badge badge--yes">هيحضر</span>'
          : '<span class="badge badge--no">معتذر</span>';
        const note = r.note ? `<div class="row-note">${escapeHtml(r.note)}</div>` : '';
        return `<li class="row">
          <div class="row-top">
            <span class="row-name">${escapeHtml(r.guestName || '')}</span>
            ${badge}
          </div>
          ${note}
          <div class="row-when">${escapeHtml(when)}</div>
        </li>`;
      }).join('')
    : '<li class="empty">لسه محدش أكّد حضوره — أول ما يوصلك رد هيظهر هنا.</li>';

  const openLink = invitation.shortId
    ? `<a class="open-link" href="/i/${encodeURIComponent(invitation.shortId)}">افتح الدعوة نفسها ←</a>`
    : '';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>إحصائيات ${escapeHtml(title)} — ميثاق</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --ivory:#faf5ec; --ivory-2:#f3ead9; --card:#fffdf8; --ink:#22150c;
    --ink-soft:#4a3b2e; --ink-dim:#8a7a68; --brass:#b8892b; --brass-soft:#c9a24a;
    --line:rgba(120,90,40,0.16); --good:#3f7d54; --good-bg:rgba(63,125,84,0.10);
    --bad:#b4694a; --bad-bg:rgba(180,105,74,0.10); --brass-bg:rgba(184,137,43,0.09);
  }
  *{box-sizing:border-box;}
  html,body{margin:0;}
  body{
    min-height:100vh; background:linear-gradient(180deg,#fdf9f1 0%,var(--ivory) 40%,var(--ivory-2) 100%);
    color:var(--ink); font-family:'Cairo',sans-serif;
    display:flex; align-items:flex-start; justify-content:center; padding:24px 16px 48px;
    -webkit-font-smoothing:antialiased;
  }
  .wrap{ width:100%; max-width:480px; }
  .brand{ text-align:center; margin:8px 0 18px; }
  .brand-mark{
    font-family:'Amiri',serif; font-weight:700; font-size:30px; color:var(--brass);
    letter-spacing:1px; line-height:1;
  }
  .brand-rule{
    width:52px; height:2px; margin:12px auto 0;
    background:linear-gradient(90deg,transparent,var(--brass-soft),transparent);
  }
  .card{
    background:var(--card); border:1px solid var(--line); border-radius:22px;
    padding:34px 26px; box-shadow:0 20px 50px -30px rgba(90,60,20,0.45);
    text-align:center;
  }
  .eyebrow{
    font-size:11px; letter-spacing:0.28em; color:var(--brass);
    text-transform:uppercase; margin-bottom:10px; font-weight:600;
  }
  h1{
    font-family:'Amiri',serif; font-weight:700; font-size:27px; margin:0;
    color:var(--ink); line-height:1.35; word-break:break-word;
  }
  .subtitle{ font-size:13.5px; color:var(--ink-dim); margin-top:6px; }

  .views{ margin-top:26px; }
  .views-count{
    font-family:'Amiri',serif; font-weight:700; font-size:64px; color:var(--brass);
    line-height:1;
  }
  .views-label{ font-size:13px; color:var(--ink-dim); margin-top:6px; }

  .tiles{ display:flex; gap:10px; margin-top:24px; }
  .tile{ flex:1; border:1px solid var(--line); border-radius:14px; padding:14px 6px; background:var(--brass-bg); }
  .tile b{ display:block; font-family:'Amiri',serif; font-weight:700; font-size:26px; line-height:1; }
  .tile span{ display:block; font-size:11.5px; color:var(--ink-dim); margin-top:7px; }
  .tile--total b{ color:var(--brass); }
  .tile--yes{ background:var(--good-bg); border-color:rgba(63,125,84,0.22); }
  .tile--yes b{ color:var(--good); }
  .tile--no{ background:var(--bad-bg); border-color:rgba(180,105,74,0.22); }
  .tile--no b{ color:var(--bad); }

  .list-title{
    text-align:right; font-size:13px; font-weight:700; color:var(--ink-soft);
    margin:26px 0 6px; padding-bottom:8px; border-bottom:1px solid var(--line);
  }
  .list{ list-style:none; margin:0; padding:0; text-align:right; max-height:440px; overflow-y:auto; }
  .row{ padding:13px 2px; border-bottom:1px solid var(--line); }
  .row:last-child{ border-bottom:none; }
  .row-top{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .row-name{ font-weight:600; font-size:14.5px; color:var(--ink); }
  .badge{ font-size:11px; padding:3px 11px; border-radius:20px; white-space:nowrap; font-weight:600; }
  .badge--yes{ background:var(--good-bg); color:var(--good); }
  .badge--no{ background:var(--bad-bg); color:var(--bad); }
  .row-note{ font-size:12.5px; color:var(--ink-soft); margin-top:5px; line-height:1.7; }
  .row-when{ font-size:11px; color:var(--ink-dim); margin-top:5px; }
  .empty{ padding:26px 6px; color:var(--ink-dim); font-size:13.5px; text-align:center; }

  .foot{ margin-top:24px; padding-top:18px; border-top:1px solid var(--line); font-size:12px; color:var(--ink-dim); }
  .open-link{ display:inline-block; margin-top:14px; color:var(--brass); font-size:13.5px; font-weight:600; text-decoration:none; }
  .open-link:hover{ text-decoration:underline; }
  .powered{ text-align:center; margin-top:20px; font-size:11.5px; color:var(--ink-dim); }
  .powered b{ font-family:'Amiri',serif; color:var(--brass); font-weight:700; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <div class="brand-mark">ميثاق</div>
      <div class="brand-rule"></div>
    </div>
    <div class="card">
      <div class="eyebrow">إحصائيات الدعوة</div>
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ''}

      <div class="views">
        <div class="views-count">${Number(invitation.viewCount || 0)}</div>
        <div class="views-label">عدد مرات فتح الدعوة</div>
      </div>

      <div class="tiles">
        <div class="tile tile--total"><b>${rsvpTotal}</b><span>إجمالي الردود</span></div>
        <div class="tile tile--yes"><b>${rsvpYes}</b><span>هيحضروا</span></div>
        <div class="tile tile--no"><b>${rsvpNo}</b><span>معتذرين</span></div>
      </div>

      <div class="list-title">ردود تأكيد الحضور</div>
      <ul class="list">${rows}</ul>

      ${createdAt ? `<div class="foot">اتعملت الدعوة في: ${escapeHtml(createdAt)}</div>` : ''}
      ${openLink}
    </div>
    <div class="powered">صفحة إحصائيات من <b>ميثاق</b></div>
  </div>
</body>
</html>`;
}

/**
 * بيجيب ملخص الردود + آخر 300 رد لدعوة (نفس منطق الصفحة القديمة).
 * @param {object} Rsvp موديل الردود
 * @param {string} shortId
 */
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
  for (let i = 0; i < 5; i += 1) {
    invitation.statsToken = generateShortId(24);
    try {
      await invitation.save();
      return invitation.statsToken;
    } catch (err) {
      // توكن اتكرر (نادر جدًا) — نجرّب واحد جديد
      if (err && err.code === 11000) { invitation.statsToken = undefined; continue; }
      throw err;
    }
  }
  throw new Error('could not generate a unique statsToken');
}

module.exports = { buildStatsPage, loadStatsData, ensureStatsToken };
