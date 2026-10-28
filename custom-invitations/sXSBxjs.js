// دعوة sXSBxjs (Sage Garden) — بطلب المالك، أول تعديل:
// غلاف جديد: ظرف ورق برسمة قلم رصاص (فيلا وسرو فوق، وبحيرة تحت) — صورة المالك
// المربعة اتكمّلت لطولية (custom/sXSBxjs/top.webp + bottom.webp، الطيّة في النص
// بالظبط)، وختم شمع زيتي بحروف MR (seal.webp) مكان ختم الصورة الأصلي.
// الضغط: الختم بيعمل زوم بسيط ← الظرف بيتفتح من النص (النص اللي فوق يطلع لفوق،
// واللي تحت ينزل لتحت) ← الدعوة تظهر. الدعوة نفسها زي ما هي.
//
// التنفيذ: transform() بيضيف الغلاف الجديد ويخلي الضغط عليه يشغّل openInvite بتاعة
// القالب (نفس المزيكا والتوقيت). لو القالب اتغيّر ومالقاش الحتت → الغلاف العادي.
const { asset } = require('./_asset');

const TOP = asset('/custom/sXSBxjs/top.webp');
const BOTTOM = asset('/custom/sXSBxjs/bottom.webp');
const SEAL = asset('/custom/sXSBxjs/seal.webp');

// ===== تاني تعديل: الكولاج (صورة المالك "Sophia & Daniel" متقطّعة قطع) =====
// كل قطعة (custom/sXSBxjs/c/*.webp) في نفس مكانها بالظبط في الصورة (عرض 736 زي
// كولاج القالب)، فلما يستقروا الشكل = الصورة؛ وكل قطعة بتدخل لوحدها بنفس حركة
// القالب. الكلام اللي كان مرسوم (الأسامي، التاريخ، المكان، المونوجرام) اتشال من
// الصورة وبقى كلام حقيقي بيتعدّل (sx10…) وبياخد من بيانات الدعوة (data-k).
// الخلفية: لوحة الشجر والبحيرة باهتة (c/bg.webp). قطع القالب الأصلية مستخبية.
const PIECES = require('./sXSBxjs-pieces.json');
const C = (n) => asset(`/custom/sXSBxjs/c/${n}.webp`);
const CH = 1404;
const SWAY = { bq1: '70% 30%', bq2: '30% 20%', branch: '90% 90%', calla: '50% 0%', gyp: '90% 80%', bq3: '50% 0%' };
// كلام فوق القطع — بإحداثيات الصورة الأصلية (بتتحوّل لمكانها جوه القطعة)
const TEXTS = {
  env: [['sx10', 'mono', 413, 318, 'MR']],
  card: [
    ['sx11', 'inv', 277, 432, 'YOU ARE INVITED TO<br>THE WEDDING OF'],
    ['sx12', 'nm1', 277, 500, '', 'groom'],
    ['sx13', 'nm2', 277, 557, '', 'bride'],
    ['sx14', 'cdt', 277, 636, '', 'dateUp'],
    ['sx15', 'cdt', 277, 652, '', 'cityUp'],
  ],
  pola: [['sx16', 'cap', 522, 561, '', 'pair']],
  std: [
    ['sx17', 'sd', 548, 782, '', 'day'],
    ['sx18', 'sm', 548, 826, '', 'monthUp'],
    ['sx19', 'sd', 548, 873, '', 'year'],
    ['sx20', 'st', 548, 918, '', 't0'],
    ['sx21', 'sv', 548, 944, '', 'hallUp'],
    ['sx22', 'sv', 548, 960, '', 'cityUp'],
  ],
};
const pieceHtml = (p) => {
  const cls = ['pc', 'sxp', `sxp-${p.n}`, p.go ? 'tap' : '', SWAY[p.n] ? 'sway' : ''].filter(Boolean).join(' ');
  const style = `--x:${p.x};--y:${p.y};--w:${p.w};--h:${p.h};--fx:${p.fx}px;--fy:${p.fy}px;--fr:${p.fr}deg;--d:${p.d}s${SWAY[p.n] ? `;--o:${SWAY[p.n]}` : ''}`;
  return `<div class="${cls}"${p.go ? ` data-go="${p.go}"` : ''} style="${style}"><img src="${C(p.n)}" alt="" draggable="false"></div>`;
};
// طبقة الكلام: نفس مقاس ومكان وحركة الكارت بتاعها، بس فوق كل القطع (عشان الورد مايغطّيش الكلام)
const textLayer = (p) => {
  const t = TEXTS[p.n];
  if (!t) return '';
  const style = `--x:${p.x};--y:${p.y};--w:${p.w};--h:${p.h};--fx:${p.fx}px;--fy:${p.fy}px;--fr:${p.fr}deg;--d:${p.d}s`;
  const spans = t.map(([id, c, x, y, txt, k]) =>
    `<span class="sxt sxt-${c}" style="--tx:${x - p.x};--ty:${y - p.y}"${k ? ` data-k="${k}"` : ''} data-elem-id="${id}">${txt}</span>`).join('');
  return `<div class="pc sxp sxp-txt sxp-txt-${p.n}${p.go ? ' tap' : ''}"${p.go ? ` data-go="${p.go}"` : ''} style="${style}">${spans}</div>`;
};
const COLLAGE = PIECES.map(pieceHtml).concat(PIECES.map(textLayer).filter(Boolean)).join('\n      ');

const CSS = `
/* ===== الكولاج الجديد ===== */
#collage{aspect-ratio:736/${CH};background:#f6f3ee url(${C('bg')}) 0 0/100% 100% no-repeat}
#collage > :not(.sxp){display:none!important}
.sxp img{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none}
.sxp-txt:not(.tap){pointer-events:none}
.sxt{position:absolute;left:calc(var(--tx)*var(--u));top:calc(var(--ty)*var(--u));translate:-50% -50%;white-space:nowrap;text-align:center;line-height:1.15;letter-spacing:0}
.sxt-inv{font:500 calc(11.5*var(--u))/1.45 'Cinzel','Cormorant Garamond',serif;letter-spacing:.12em;color:#ecdcbc}
.sxt-nm1,.sxt-nm2{font:400 calc(50*var(--u))/1.1 'Pinyon Script',cursive;color:#d8b07f;text-shadow:0 1px 0 rgba(0,0,0,.25)}
.sxt-nm1::after{content:" &"}
.sxt-cdt{font:600 calc(11*var(--u))/1.2 'Cormorant Garamond',serif;letter-spacing:.16em;color:#ecdcbc}
.sxt-cap{font:400 calc(13*var(--u))/1 'Pinyon Script',cursive;color:#4c3b33}
.sxt-sd{font:500 calc(42*var(--u))/1 'Cormorant Garamond',serif;letter-spacing:.06em;color:#2b2522}
.sxt-sm{font:500 calc(40*var(--u))/1 'Cormorant Garamond',serif;letter-spacing:.08em;color:#2b2522}
.sxt-st,.sxt-sv{font:600 calc(11*var(--u))/1 'Cormorant Garamond',serif;letter-spacing:.16em;color:#4a2a2c}
/* المونوجرام على الظرف الزيتي: MR جوه إكليل بيضاوي رفيع */
.sxt-mono{font:400 calc(36*var(--u))/1 'Pinyon Script',cursive;color:#d8c79c;padding:calc(10*var(--u)) calc(12*var(--u));
  text-shadow:0 1px 0 rgba(30,35,10,.45)}
.sxt-mono::before{content:"";position:absolute;inset:calc(-6*var(--u)) calc(-2*var(--u));border:1px solid rgba(216,199,156,.7);border-radius:50%}
#collage.play:not(.static) .sxp-renv{animation:nudge 4.5s ease-in-out 3.6s infinite}

/* الغلاف الأصلي بيستخبى — الجديد بيغطي الشاشة */
#coverScreen > :not(.sx-env){display:none!important}
#coverScreen{background:#e4ded0}
.sx-env{position:absolute;inset:0;overflow:hidden;perspective:1600px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.sx-half{position:absolute;left:0;right:0;height:50%;background-repeat:no-repeat;background-size:cover;will-change:transform}
.sx-top{top:0;background-image:url(${TOP});background-position:center bottom;z-index:2;
  box-shadow:0 2px 3px rgba(80,70,50,.18)}
.sx-bot{bottom:0;background-image:url(${BOTTOM});background-position:center top;z-index:1}
/* ضل خفيف تحت حافة النص اللي فوق (الطيّة) */
.sx-top::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:6px;background:linear-gradient(rgba(70,60,40,.22),transparent)}
.sx-seal{position:absolute;left:50%;top:50%;z-index:3;width:min(34vw,170px);aspect-ratio:520/527;transform:translate(-50%,-50%);
  filter:drop-shadow(0 7px 9px rgba(40,45,20,.38)) drop-shadow(0 2px 2px rgba(40,45,20,.3))}
.sx-seal img{display:block;width:100%;height:100%;animation:sxBreathe 2.6s ease-in-out infinite}
@keyframes sxBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
.sx-seal::before{content:"";position:absolute;inset:-12%;border-radius:50%;border:1.5px solid rgba(122,130,70,.45);animation:sxRing 2.6s ease-out infinite}
@keyframes sxRing{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.25);opacity:0}}
.sx-hint{position:absolute;left:0;right:0;bottom:calc(30px + env(safe-area-inset-bottom));z-index:3;text-align:center;
  font:italic 500 17px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.2em;color:#6d6650;transition:opacity .4s ease}
.sx-hint span{display:inline-flex;align-items:center;gap:10px}
.sx-hint i{width:26px;height:1px;background:#a69a72}

/* الفتح: (1) الختم بيعمل زوم بسيط  (2) الختم بيختفي والنصين بيتفتحوا من النص */
.sx-env.sx-open{cursor:default}
.sx-env.sx-open .sx-hint{opacity:0}
.sx-env.sx-open .sx-seal::before{animation:none;opacity:0}
.sx-env.sx-open .sx-seal img{animation:none}
.sx-env.sx-open .sx-seal{animation:sxSeal 1.15s cubic-bezier(.45,0,.2,1) forwards}
@keyframes sxSeal{
  0%{transform:translate(-50%,-50%) scale(1)}
  38%{transform:translate(-50%,-50%) scale(1.14)}
  60%{transform:translate(-50%,-50%) scale(1.12);opacity:1}
  100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
.sx-env.sx-open .sx-top{animation:sxTop 1.5s .6s cubic-bezier(.65,0,.25,1) forwards}
.sx-env.sx-open .sx-bot{animation:sxBot 1.5s .6s cubic-bezier(.65,0,.25,1) forwards}
@keyframes sxTop{0%{transform:none}100%{transform:translateY(-102%)}}
@keyframes sxBot{0%{transform:none}100%{transform:translateY(102%)}}
#coverScreen.sx-done{opacity:0;transition:opacity .35s ease;pointer-events:none}
@media (prefers-reduced-motion:reduce){.sx-seal img,.sx-seal::before{animation:none}}
`;

const COVER = `<div class="sx-env" id="sx-env" role="button" tabindex="0" aria-label="Tap the seal to open">
    <div class="sx-half sx-top"></div>
    <div class="sx-half sx-bot"></div>
    <div class="sx-seal"><img src="${SEAL}" alt="" fetchpriority="high"></div>
    <div class="sx-hint"><span><i></i><b data-elem-id="sx1">Tap to open</b><i></i></span></div>
  </div>
`;

// بيتحط في سكريبت القالب قبل "STATIC" — openInvite متعرّفة قبله
const LOGIC = `
  /* ---------- sXSBxjs: كلام الكولاج الجديد من بيانات الدعوة ---------- */
  {
    const up = (s) => String(s || '').toUpperCase();
    const extra = {
      dateUp: \`\${fields.day} \${up(fields.monthUp)} \${fields.year}\`,
      cityUp: up(fields.city), hallUp: up(fields.hall),
      pair: [fields.groom, fields.bride].filter(Boolean).join(' & '),
    };
    $$('#collage .sxt[data-k]').forEach((el) => { const v = extra[el.dataset.k]; if (v != null) el.textContent = v; });
    // اسم طويل: بيصغر على قد الكارت
    const fit = () => $$('#collage .sxt-nm1, #collage .sxt-nm2, #collage .sxt-cdt, #collage .sxt-sv, #collage .sxt-sm, #collage .sxt-sd').forEach((el) => {
      el.style.scale = '';
      const max = el.closest('.sxp').offsetWidth * (el.matches('.sxt-sv, .sxt-sm, .sxt-sd') ? 0.62 : 0.82);
      if (el.offsetWidth > max) el.style.scale = (max / el.offsetWidth).toFixed(3);
    });
    fit(); addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }
  /* ---------- sXSBxjs: الظرف بيتفتح من النص ---------- */
  {
    const env = document.getElementById('sx-env');
    let sxGo = false;
    const sxOpen = () => {
      if (sxGo) return; sxGo = true;
      env.classList.add('sx-open');
      // ورا النصين بتظهر الدعوة نفسها (مش لون الغلاف)
      setTimeout(() => { cover.style.background = 'transparent'; }, 600);
      // الدعوة بتبدأ تظهر والنصين بيتفتحوا (نفس openInvite بتاعة القالب: المزيكا والكولاج)
      setTimeout(() => { try { openInvite(); } catch (_) {} }, 250);
      setTimeout(() => cover.classList.add('sx-done'), 2000);
    };
    env.addEventListener('click', sxOpen);
    env.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sxOpen(); } });
  }
`;

const PATCHES = [
  ['    <div class="collage" id="collage">\n', `    <div class="collage" id="collage">\n      ${COLLAGE}\n`],
  ['<div class="cover" id="coverScreen">\n', `<div class="cover" id="coverScreen">\n  ${COVER}`],
  ['  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود', `${LOGIC}\n  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود`],
];

module.exports = {
  shortId: 'sXSBxjs',

  render() {
    return {
      head: `<link rel="preload" as="image" href="${TOP}"><link rel="preload" as="image" href="${BOTTOM}"><link rel="preload" as="image" href="${SEAL}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cinzel:wght@500&family=Cormorant+Garamond:wght@500;600&display=swap"><style id="sx-style">${CSS}</style>`,
    };
  },

  transform(html) {
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    let out = html;
    for (const [find, repl] of PATCHES) {
      const f = find.replace(/\n/g, nl);
      if (out.split(f).length !== 2) {
        console.error('[custom sXSBxjs] template changed — showing the normal cover');
        return html;
      }
      out = out.replace(f, () => repl.replace(/\n/g, nl));
    }
    return out;
  },
};
