// utils/voicesPage.js
// صفحة التهاني الصوتية المشاركة (/v/:token) — صاحب الدعوة بيبعت اللينك
// للعيلة أو للعروسة نفسها، فيسمعوا كل التهاني اللي الضيوف سجّلوها، ينزّلوا
// أي واحدة أو الكل مرة واحدة. بنفس بيج البراند بتاع صفحة الألبوم والإحصائيات.
const { escapeHtml } = require('./sanitize');
const { generateShortId } = require('./idGenerator');

function coupleTitle(invitation) {
  const ar = invitation.language !== 'en';
  const a = ar ? (invitation.groomNameAr || invitation.groomName) : (invitation.groomName || invitation.groomNameAr);
  const b = ar ? (invitation.brideNameAr || invitation.brideName) : (invitation.brideName || invitation.brideNameAr);
  const names = [a, b].filter(Boolean).join(ar ? ' و' : ' & ');
  return (invitation.name && invitation.name.trim()) || names || 'التهاني';
}

function countLabel(n) {
  if (n === 0) return 'لسه مفيش تهاني';
  if (n === 1) return 'تهنئة واحدة';
  if (n === 2) return 'تهنئتين';
  if (n <= 10) return `${n} تهاني`;
  return `${n} تهنئة`;
}

const dt = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function fmt(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * @param {object} invitation
 * @param {Array<{id,guestName,url,download,duration,createdAt}>} voices مسلسلة بـ serializeVoice
 * @param {{ zipPath: string|null }} opts
 */
function buildVoicesPage(invitation, voices, opts) {
  const title = coupleTitle(invitation);
  const rows = voices.length ? voices.map((v, i) => `<li class="row">
      <button type="button" class="play" data-src="${escapeHtml(v.url)}" aria-label="تشغيل">
        <svg class="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
        <svg class="i-pause" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>
      </button>
      <div class="meta">
        <div class="name">${escapeHtml(v.guestName || `ضيف ${voices.length - i}`)}${v.attending === 'yes' ? ' <span class="att yes">هيحضر</span>' : v.attending === 'no' ? ' <span class="att no">مش هيحضر</span>' : ''}</div>
        <div class="bar"><span></span></div>
        <div class="sub"><span class="t">${fmt(v.duration)}</span> · ${escapeHtml(v.createdAt ? dt.format(new Date(v.createdAt)) : '')}</div>
      </div>
      <a class="dl" href="${escapeHtml(v.download)}" aria-label="تنزيل">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>
      </a>
    </li>`).join('')
    : '<li class="empty">لسه محدش سجّل تهنئة — أول ما ضيف يسجّل هتظهر هنا.</li>';

  const zip = opts && opts.zipPath && voices.length
    ? `<a class="btn btn--gold" href="${escapeHtml(opts.zipPath)}">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>
         نزّل كل التهاني
       </a>` : '';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="noindex, nofollow" />
<title>تهاني ${escapeHtml(title)} — ميثاق</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root{ --ivory:#faf5ec; --ivory-2:#f3ead9; --card:#fffdf8; --ink:#22150c; --ink-dim:#8a7a68;
    --brass:#b8892b; --brass-soft:#c9a24a; --line:rgba(120,90,40,0.16); --wine:#7a2a37; }
  *{box-sizing:border-box;}
  html,body{margin:0;}
  body{ min-height:100vh; background:linear-gradient(180deg,#fdf9f1 0%,var(--ivory) 40%,var(--ivory-2) 100%);
    color:var(--ink); font-family:'Cairo',sans-serif; -webkit-font-smoothing:antialiased; }
  .wrap{ max-width:640px; margin:0 auto; padding:26px 16px 56px; }
  .brand{ text-align:center; margin:4px 0 16px; }
  .brand-mark{ font-family:'Amiri',serif; font-weight:700; font-size:28px; color:var(--brass); line-height:1; }
  .brand-rule{ width:52px; height:2px; margin:12px auto 0; background:linear-gradient(90deg,transparent,var(--brass-soft),transparent); }
  .head{ text-align:center; margin-bottom:18px; }
  .eyebrow{ font-size:11px; letter-spacing:.28em; color:var(--brass); font-weight:700; margin-bottom:8px; }
  h1{ font-family:'Amiri',serif; font-weight:700; font-size:28px; margin:0; line-height:1.35; word-break:break-word; }
  .count{ font-size:13.5px; color:var(--ink-dim); margin-top:6px; }
  .actions{ display:flex; justify-content:center; gap:10px; margin-top:16px; flex-wrap:wrap; }
  .btn{ display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:999px; font:700 14px 'Cairo',sans-serif;
    text-decoration:none; border:1px solid var(--line); color:var(--ink); background:var(--card); }
  .btn svg{ width:17px; height:17px; }
  .btn--gold{ background:linear-gradient(90deg,var(--brass),var(--brass-soft)); color:#241608; border:0; box-shadow:0 10px 24px -12px rgba(150,110,30,.8); }
  ul{ list-style:none; margin:20px 0 0; padding:0; display:grid; gap:10px; }
  .row{ display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--line); border-radius:18px; padding:12px 14px;
    box-shadow:0 10px 26px -22px rgba(60,40,10,.6); }
  .play{ width:46px; height:46px; flex:none; border-radius:50%; border:0; cursor:pointer; color:#fff;
    background:radial-gradient(circle at 30% 30%,#9b3a4a,var(--wine)); display:grid; place-items:center; box-shadow:0 8px 18px -10px rgba(122,42,55,.9); }
  .play svg{ width:20px; height:20px; } .play .i-pause{ display:none; }
  .row.on .play .i-play{ display:none; } .row.on .play .i-pause{ display:block; }
  .meta{ flex:1; min-width:0; }
  .name{ font-weight:700; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .att{ display:inline-block; margin-inline-start:6px; padding:1px 8px; border-radius:99px; font-size:11px; font-weight:700; vertical-align:2px; }
  .att.yes{ background:#e3f3ea; color:#1f7a4d; }
  .att.no{ background:#f6e4e4; color:#9a3b3b; }
  .bar{ height:4px; background:rgba(122,42,55,.12); border-radius:4px; margin:8px 0 6px; overflow:hidden; }
  .bar span{ display:block; height:100%; width:0; background:var(--wine); border-radius:4px; transition:width .2s linear; }
  .sub{ font-size:12px; color:var(--ink-dim); font-variant-numeric:tabular-nums; }
  .dl{ width:38px; height:38px; flex:none; border-radius:50%; border:1px solid var(--line); display:grid; place-items:center; color:var(--ink-dim); }
  .dl svg{ width:17px; height:17px; }
  .empty{ text-align:center; color:var(--ink-dim); padding:40px 10px; border:1px dashed var(--line); border-radius:18px; }
  .foot{ text-align:center; margin-top:28px; font-size:12px; color:var(--ink-dim); }
  .foot a{ color:var(--brass); font-weight:700; text-decoration:none; }
</style>
</head>
<body>
  <main class="wrap">
    <div class="brand"><div class="brand-mark">ميثاق</div><div class="brand-rule"></div></div>
    <div class="head">
      <div class="eyebrow">تهاني الضيوف</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="count">${countLabel(voices.length)} 🤍</div>
      <div class="actions">${zip}</div>
    </div>
    <ul>${rows}</ul>
    <div class="foot">اتعملت بـ <a href="/">ميثاق</a> — دعوات زفاف وخطوبة إلكترونية</div>
  </main>
<script>
(function(){
  var cur=null, audio=new Audio();
  function reset(){ if(cur){ cur.classList.remove('on'); } }
  audio.addEventListener('timeupdate',function(){ if(!cur||!audio.duration) return;
    cur.querySelector('.bar span').style.width=(audio.currentTime/audio.duration*100)+'%'; });
  audio.addEventListener('ended',function(){ if(cur){ cur.classList.remove('on'); cur.querySelector('.bar span').style.width='0'; } cur=null; });
  document.querySelectorAll('.play').forEach(function(b){
    b.addEventListener('click',function(){
      var row=b.closest('.row');
      if(cur===row){ if(audio.paused){ audio.play(); row.classList.add('on'); } else { audio.pause(); row.classList.remove('on'); } return; }
      reset(); cur=row; audio.src=b.getAttribute('data-src'); audio.play().catch(function(){}); row.classList.add('on');
    });
  });
})();
</script>
</body>
</html>`;
}

function voicesNotFoundPage() {
  return '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<body style="font-family:sans-serif;text-align:center;margin-top:20%;color:#555;background:#faf5ec">'
    + '<h2>الصفحة دي مش موجودة</h2><p>اتأكد إن اللينك متنسوخ صح.</p></body></html>';
}

/** توكن صفحة التهاني (بيتولّد مرة واحدة لكل دعوة) */
async function ensureVoicesToken(Invitation, invitationId) {
  for (let i = 0; i < 5; i += 1) {
    const token = generateShortId(24);
    try {
      await Invitation.updateOne({ _id: invitationId, voicesToken: { $exists: false } }, { $set: { voicesToken: token } });
    } catch (err) {
      if (err && err.code === 11000) continue;
      throw err;
    }
    const fresh = await Invitation.findById(invitationId).select('voicesToken').lean();
    if (fresh && fresh.voicesToken) return fresh.voicesToken;
  }
  throw new Error('Could not create voices token');
}

module.exports = { buildVoicesPage, voicesNotFoundPage, ensureVoicesToken };
