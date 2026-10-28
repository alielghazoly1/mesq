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

const CSS = `
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
  ['<div class="cover" id="coverScreen">\n', `<div class="cover" id="coverScreen">\n  ${COVER}`],
  ['  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود', `${LOGIC}\n  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود`],
];

module.exports = {
  shortId: 'sXSBxjs',

  render() {
    return {
      head: `<link rel="preload" as="image" href="${TOP}"><link rel="preload" as="image" href="${BOTTOM}"><link rel="preload" as="image" href="${SEAL}"><style id="sx-style">${CSS}</style>`,
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
