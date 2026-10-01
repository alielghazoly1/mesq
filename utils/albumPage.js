// utils/albumPage.js
// صفحة ألبوم صور الضيوف المشاركة (/a/:token). صاحب الدعوة بيبعت اللينك
// لأي حد (العيلة، المصوّر، العروسين) فيشوف كل الصور اللي الضيوف رفعوها،
// يفتح أي صورة كبيرة، وينزّلها بجودتها الأصلية — أو ينزّل الكل مرة واحدة.
// بنفس روح بيج البراند بتاعة صفحة الإحصائيات.
const { escapeHtml } = require('./sanitize');

function coupleTitle(invitation) {
  const ar = invitation.language === 'ar';
  const a = ar ? (invitation.groomNameAr || invitation.groomName) : (invitation.groomName || invitation.groomNameAr);
  const b = ar ? (invitation.brideNameAr || invitation.brideName) : (invitation.brideName || invitation.brideNameAr);
  const names = [a, b].filter(Boolean).join(ar ? ' و' : ' & ');
  return (invitation.name && invitation.name.trim()) || names || 'ألبوم الفرح';
}

function albumCountLabel(n) {
  if (n === 0) return 'لسه مفيش صور';
  if (n === 1) return 'صورة واحدة';
  if (n === 2) return 'صورتين';
  if (n <= 10) return `${n} صور`;
  return `${n} صورة`;
}

/**
 * @param {object} invitation
 * @param {Array} photos مسلسلة بـ serializePhoto
 * @param {{ zipPath: string|null }} opts
 */
function buildAlbumPage(invitation, photos, opts) {
  const title = coupleTitle(invitation);
  // البيانات بتتحط كـ JSON جوه الصفحة للعرض الكبير — بنهرّب "<" عشان
  // مفيش نص (اسم ضيف) يقدر يقفل وسم السكريبت
  const data = JSON.stringify(photos.map((p) => ({
    l: p.large, d: p.download, n: p.guestName || '',
  }))).replace(/</g, '\\u003c');

  const tiles = photos.map((p, i) => `<button type="button" class="tile" data-i="${i}" aria-label="صورة ${i + 1}">
      <img src="${escapeHtml(p.thumb)}" alt="" loading="lazy" decoding="async">
    </button>`).join('');

  const zip = opts && opts.zipPath
    ? `<a class="btn btn--gold" href="${escapeHtml(opts.zipPath)}">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>
         نزّل كل الصور
       </a>` : '';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="noindex, nofollow" />
<title>ألبوم ${escapeHtml(title)} — ميثاق</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root{ --ivory:#faf5ec; --ivory-2:#f3ead9; --card:#fffdf8; --ink:#22150c; --ink-dim:#8a7a68;
    --brass:#b8892b; --brass-soft:#c9a24a; --line:rgba(120,90,40,0.16); }
  *{box-sizing:border-box;}
  html,body{margin:0;}
  body{ min-height:100vh; background:linear-gradient(180deg,#fdf9f1 0%,var(--ivory) 40%,var(--ivory-2) 100%);
    color:var(--ink); font-family:'Cairo',sans-serif; -webkit-font-smoothing:antialiased; }
  .wrap{ max-width:980px; margin:0 auto; padding:26px 14px 56px; }
  .brand{ text-align:center; margin:4px 0 16px; }
  .brand-mark{ font-family:'Amiri',serif; font-weight:700; font-size:28px; color:var(--brass); line-height:1; }
  .brand-rule{ width:52px; height:2px; margin:12px auto 0; background:linear-gradient(90deg,transparent,var(--brass-soft),transparent); }
  .head{ text-align:center; margin-bottom:18px; }
  .eyebrow{ font-size:11px; letter-spacing:.28em; color:var(--brass); font-weight:700; margin-bottom:8px; }
  h1{ font-family:'Amiri',serif; font-weight:700; font-size:28px; margin:0; line-height:1.35; word-break:break-word; }
  .count{ font-size:13.5px; color:var(--ink-dim); margin-top:6px; }
  .actions{ display:flex; justify-content:center; gap:10px; margin-top:16px; flex-wrap:wrap; }
  .btn{ display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:999px; font:700 14px 'Cairo',sans-serif;
    text-decoration:none; border:1px solid var(--line); color:var(--ink); background:var(--card); cursor:pointer; }
  .btn svg{ width:17px; height:17px; }
  .btn--gold{ background:linear-gradient(90deg,var(--brass),var(--brass-soft)); color:#241608; border:0; box-shadow:0 10px 24px -12px rgba(150,110,30,.8); }
  .grid{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; margin-top:20px; }
  @media (min-width:640px){ .grid{ grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; } }
  @media (min-width:900px){ .grid{ grid-template-columns:repeat(5,minmax(0,1fr)); } }
  .tile{ position:relative; aspect-ratio:1; border:0; padding:0; margin:0; border-radius:10px; overflow:hidden; background:#ece2cc; cursor:zoom-in; }
  .tile img{ width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s ease; }
  .tile:hover img{ transform:scale(1.05); }
  .empty{ text-align:center; padding:60px 20px; color:var(--ink-dim); font-size:15px; background:var(--card); border:1px dashed var(--line); border-radius:20px; margin-top:20px; }
  .powered{ text-align:center; margin-top:28px; font-size:11.5px; color:var(--ink-dim); }
  .powered b{ font-family:'Amiri',serif; color:var(--brass); }
  /* العرض الكبير */
  .lb{ position:fixed; inset:0; z-index:50; display:none; flex-direction:column; background:rgba(16,12,6,.96); }
  .lb.open{ display:flex; }
  .lb-top,.lb-bar{ display:flex; align-items:center; justify-content:space-between; gap:10px; color:#f3ead9; font-size:13.5px; }
  .lb-top{ padding:calc(12px + env(safe-area-inset-top)) 14px 6px; }
  .lb-bar{ padding:12px 14px calc(14px + env(safe-area-inset-bottom)); }
  .lb-stage{ position:relative; flex:1; min-height:0; display:flex; align-items:center; justify-content:center; }
  .lb-img{ max-width:100%; max-height:100%; object-fit:contain; }
  .lb button,.lb a{ display:inline-flex; align-items:center; justify-content:center; gap:8px; min-width:44px; height:44px; padding:0 14px;
    border-radius:999px; border:1px solid rgba(243,234,217,.25); background:rgba(243,234,217,.08); color:#f3ead9; font:600 14px 'Cairo',sans-serif; text-decoration:none; cursor:pointer; }
  .lb svg{ width:18px; height:18px; }
  .lb-nav{ position:absolute; top:50%; transform:translateY(-50%); padding:0 !important; width:44px; }
  .lb-prev{ right:10px; } .lb-next{ left:10px; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand"><div class="brand-mark">ميثاق</div><div class="brand-rule"></div></div>
    <div class="head">
      <div class="eyebrow">ألبوم صور الضيوف</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="count">${escapeHtml(albumCountLabel(photos.length))}</div>
      <div class="actions">${zip}</div>
    </div>
    ${photos.length ? `<div class="grid">${tiles}</div>`
      : '<div class="empty">لسه محدش رفع صور — أول ما الضيوف يرفعوا صورهم من الدعوة هتظهر هنا.</div>'}
    <div class="powered">ألبوم من <b>ميثاق</b></div>
  </div>

  <div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="عرض الصورة">
    <div class="lb-top"><span id="lb-count" dir="ltr"></span>
      <button type="button" id="lb-close" aria-label="إغلاق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <div class="lb-stage">
      <img class="lb-img" id="lb-img" alt="">
      <button type="button" class="lb-nav lb-prev" id="lb-prev" aria-label="السابقة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
      <button type="button" class="lb-nav lb-next" id="lb-next" aria-label="التالية"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
    </div>
    <div class="lb-bar"><span id="lb-by"></span>
      <a id="lb-dl" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>تحميل بالجودة الأصلية</a></div>
  </div>

<script>
(function () {
  var P = ${data};
  var lb = document.getElementById('lb'), img = document.getElementById('lb-img'), i = 0;
  function show() {
    var p = P[i]; if (!p) return;
    img.src = p.l;
    document.getElementById('lb-count').textContent = (i + 1) + ' / ' + P.length;
    document.getElementById('lb-by').textContent = p.n ? ('من ' + p.n) : '';
    document.getElementById('lb-dl').href = p.d;
  }
  function open(n) { i = n; show(); lb.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
  function close() { lb.classList.remove('open'); document.documentElement.style.overflow = ''; img.removeAttribute('src'); }
  function step(d) { i = (i + d + P.length) % P.length; show(); }
  document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('click', function () { open(+t.getAttribute('data-i')); });
  });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(-1);
    if (e.key === 'ArrowLeft') step(1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) step(dx > 0 ? 1 : -1);
  });
})();
</script>
</body>
</html>`;
}

function albumNotFoundPage() {
  return '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">'
    + '<meta name="robots" content="noindex, nofollow">'
    + '<body style="font-family:sans-serif;text-align:center;margin-top:15%;color:#444">'
    + '<h1>الألبوم ده مش موجود</h1><p>تأكد إن اللينك متنسوخ صح.</p></body></html>';
}

module.exports = { buildAlbumPage, albumNotFoundPage };
