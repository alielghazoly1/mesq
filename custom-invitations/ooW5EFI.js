// دعوة ooW5EFI (Velvet Voice، عربي) — بطلب المالك (ابراهيم وفرح):
//
// 1) الظرف: أول ما الضيف يضغط، الظرف ماينفتحش — الختم بيطير والظرف كله بينزل
//    لتحت ويختفي (نفس حركة Sage Garden)، والدعوة تتفتح على طول.
// 2) الدعوة بقت صفحة واحدة بتنزل بالسكرول العادي (مش صفحات بتتقلب) — فيها
//    صورتين ورا بعض بس، وكل صفحات القالب التانية مش ظاهرة:
//      • صورة 1 (custom/ooW5EFI/p1.webp): الستارة والورد — النجفة اتشالت
//        (LaMa inpainting) وشريط الموبايل وخانة "Reply to yourself" والكلام القديم.
//        فوقها كلام حقيقي بيتعدّل من المحرر (Aref Ruqaa):
//          oo1 بسم الله الرحمن الرحيم · oo2 وَخَلَقْنَاكُمْ أَزْوَاجًا
//          oo10 يدعوكم بكل حب و ود · oo11 محمد إبراهيم سالم · oo16 و محمد على هديهد
//          oo12 لحضور حفل زفاف · oo13 ابراهيم · oo14 و · oo15 فرح
//      • صورة 2 (custom/ooW5EFI/p2.webp): Save the Date — نوفمبر 2026، والقلب
//        على يوم 22 بس (قلوب 14 و15 و16 اتشالت)، ولونها متظبط على الصورة الأولى.
//    الأسامي والتاريخ (22/11/2026) اتحطّوا كمان في بيانات الدعوة نفسها
//    (utils/oneOffFixes.js) عشان عنوان الدعوة وكارت المشاركة.
//
// التنفيذ: transform() بيعدّل حتت صغيرة في كود القالب للدعوة دي بس. لو القالب
// اتغيّر ومالقاش حتة منهم، بيسيب الصفحة زي ما هي (القالب العادي) — مفيش كسر.
// الصفحتين متصمّمين بمقاس لوحة القالب (705.75px عرض) وبيتصغّروا على قد الشاشة
// (--ok)، والمحرر بياخد نفس المعامل (__wdaLocalScale) عشان السحب يبقى مظبوط.

const P1 = '/custom/ooW5EFI/p1.webp';
const P2 = '/custom/ooW5EFI/p2.webp';
const FONTS = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap';
const W = 705.75, H1 = 1334.2, H2 = 1053.3;

const CSS = `
.stage.oo-mode .cv,.stage.oo-mode .vv-nav,.stage.oo-mode .vv-chip{display:none!important}
/* القالب قافل اللمس على الصفحة كلها (بيقلب صفحات) — هنا السكرول العادي */
.stage.oo-mode{touch-action:pan-y}
#oo-scroll{position:absolute;inset:0;z-index:25;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;
  touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:none;background:#e1c6a9;direction:ltr;
  visibility:hidden;opacity:0;transition:opacity .6s ease}
#oo-scroll::-webkit-scrollbar{display:none}
.stage.opened #oo-scroll{visibility:visible;opacity:1}
.oo-w{position:relative;width:100%;overflow:hidden}
.oo-w1{height:calc(${H1}px * var(--ok,.5))}
.oo-w2{height:calc(${H2}px * var(--ok,.5));margin-top:calc(-60px * var(--ok,.5))}
.oo-p{position:absolute;left:0;top:0;width:${W}px;transform:scale(var(--ok,.5));transform-origin:0 0;background-size:100% 100%;background-repeat:no-repeat}
.oo-p1{height:${H1}px;background-image:url(${P1})}
.oo-p2{height:${H2}px;background-image:url(${P2})}
/* الصورتين بيدخلوا في بعض من غير خط فاصل: التانية راكبة على آخر الأولى وبتظهر بالتدريج */
.oo-p2{-webkit-mask-image:linear-gradient(transparent 0,#000 62px);mask-image:linear-gradient(transparent 0,#000 62px)}

.oo-p1 > p{position:absolute;margin:0;text-align:center;direction:rtl;letter-spacing:0;font-family:'Aref Ruqaa','Amiri',serif;
  text-shadow:0 1px 0 rgba(255,250,240,.35)}
.oo-p1 .oo-wide{left:${W / 2 - 230}px;width:460px}
.oo-p1 .oo-narrow{left:${W / 2 - 128}px;width:256px}
.oo-p1 .oo1{top:187px;font-size:44px;line-height:1.6;color:#a2717a}
.oo-p1 .oo2{top:276px;font-size:50px;font-weight:700;line-height:1.7;color:#54462a}
.oo-p1 .oo-orn{position:absolute;left:${W / 2 - 70}px;width:140px;top:384px;height:12px;display:flex;align-items:center;justify-content:center;gap:9px}
.oo-p1 .oo-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-p1 .oo-orn i:last-child{transform:scaleX(-1)}
.oo-p1 .oo-orn b{width:7px;height:7px;border:1px solid #b39566;transform:rotate(45deg)}
.oo-p1 .oo10{top:414px;font-size:30px;line-height:1.6;color:#6a5434}
.oo-p1 .oo11{top:466px;font-size:30px;font-weight:700;line-height:1.55;color:#54462a}
.oo-p1 .oo16{top:513px;font-size:30px;font-weight:700;line-height:1.55;color:#54462a}
.oo-p1 .oo12{top:578px;font-size:30px;line-height:1.6;color:#6a5434}
.oo-p1 .oo13{top:650px;font-size:70px;font-weight:700;line-height:1.45;color:#8a3a3c}
.oo-p1 .oo14{top:752px;font-size:42px;line-height:1.3;color:#b08d57}
.oo-p1 .oo15{top:800px;font-size:70px;font-weight:700;line-height:1.45;color:#8a3a3c}

/* دخول الكلام بعد ما الظرف ينزل */
#oo-scroll .oo-rv{opacity:0;transform:translateY(16px);filter:blur(6px);transition:opacity 1s ease,transform 1.1s cubic-bezier(.2,.7,.2,1),filter 1s ease;transition-delay:calc(var(--d,0) * 130ms + 250ms)}
#oo-scroll.oo-in .oo-rv{opacity:1;transform:none;filter:none}
#oo-scroll.oo-now .oo-rv{transition:none}

/* "مرّر للأسفل" — بيختفي أول ما الضيف ينزل */
.oo-cue{position:absolute;z-index:26;margin:0;padding:0;border:0;background:none;-webkit-appearance:none;appearance:none;font:inherit;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translate(-50%,10px);
  display:flex;flex-direction:column;align-items:center;gap:4px;opacity:0;pointer-events:none;direction:rtl;
  transition:opacity .6s ease,transform .6s ease}
.oo-cue span{padding:7px 18px 8px;border-radius:999px;background:linear-gradient(180deg,#fbf6f0,#efe3d8);border:1px solid rgba(180,150,110,.6);
  box-shadow:0 8px 20px rgba(60,40,20,.25);font:400 15px/1 'Aref Ruqaa','Amiri',serif;color:#5b2229}
.oo-cue svg{width:20px;height:20px;color:#7a6040;animation:ooNudge 1.8s ease-in-out infinite}
@keyframes ooNudge{0%,100%{transform:translateY(-2px);opacity:.6}50%{transform:translateY(4px);opacity:1}}
.stage.opened .oo-cue.on{opacity:1;transform:translate(-50%,0);pointer-events:auto;cursor:pointer}

/* الظرف: الختم بيطير والظرف كله بينزل لتحت (زي Sage Garden) — بدل ما يتفتح */
.intro.oo-drop{cursor:default}
.intro.oo-drop .seal{animation:ooSeal .6s cubic-bezier(.3,1.6,.5,1) forwards}
.intro.oo-drop .seal::before{animation:none;opacity:0}
@keyframes ooSeal{30%{transform:scale(1.22) rotate(-8deg)}100%{transform:scale(.2) rotate(40deg);opacity:0}}
.intro.oo-drop .grp{animation:ooDrop 1.25s .35s cubic-bezier(.6,0,.3,1) forwards}
@keyframes ooDrop{40%{transform:translateY(-365px) scale(.885)}100%{transform:translateY(1250px) scale(.8) rotate(4deg);opacity:0}}
.intro.oo-drop .tap{opacity:0;transform:translateY(16px)}
.intro.oo-drop .dust{opacity:0;transition:opacity .6s ease}
.intro.oo-gone{opacity:0;transition:opacity .55s ease;pointer-events:none}
@media (prefers-reduced-motion:reduce){#oo-scroll .oo-rv{transition:none}.oo-cue svg{animation:none}}
`;

const P = (cls, id, d, text) => `<p class="${cls} oo${id} oo-rv" style="--d:${d}" data-elem-id="oo${id}">${text}</p>`;
const SCROLL = `<div id="oo-scroll" aria-label="الدعوة">
    <div class="oo-w oo-w1"><div class="oo-p oo-p1">
      ${P('oo-wide', 1, 0, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')}
      ${P('oo-wide', 2, 2, 'وَخَلَقْنَاكُمْ أَزْوَاجًا')}
      <div class="oo-orn oo-rv" style="--d:4" aria-hidden="true"><i></i><b></b><i></i></div>
      ${P('oo-narrow', 10, 5, 'يدعوكم بكل حب و ود')}
      ${P('oo-narrow', 11, 6.5, 'محمد إبراهيم سالم')}
      ${P('oo-narrow', 16, 7.2, 'و محمد على هديهد')}
      ${P('oo-narrow', 12, 8, 'لحضور حفل زفاف')}
      ${P('oo-narrow', 13, 9.5, 'ابراهيم')}
      ${P('oo-narrow', 14, 10.5, 'و')}
      ${P('oo-narrow', 15, 11.5, 'فرح')}
    </div></div>
    <div class="oo-w oo-w2"><div class="oo-p oo-p2" role="img" aria-label="Save the Date — 22 نوفمبر 2026"></div></div>
  </div>
  <button class="oo-cue" id="oo-cue" type="button" aria-label="انزل لتحت"><span>مرّر للأسفل</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l6 6 6-6"/><path d="M8.5 4.5 12 8l3.5-3.5" opacity=".55"/></svg></button>
  `;

// بيتحط جوه سكريبت القالب (قبل "start") — فبيوصل لـ stage / intro / opened ...
const LOGIC = `
  /* ---------- ooW5EFI: صفحة واحدة بالسكرول (صورتين) + الظرف بينزل بدل ما يتفتح ---------- */
  const ooS = document.getElementById('oo-scroll'), ooCue = document.getElementById('oo-cue');
  stage.classList.add('oo-mode');
  function ooFit() {
    const w = stage.getBoundingClientRect().width || innerWidth;
    window.__ooK = w / ${W};
    ooS.style.setProperty('--ok', window.__ooK);
  }
  ooFit(); addEventListener('resize', ooFit); addEventListener('orientationchange', () => setTimeout(ooFit, 200));
  let ooCueOff = false;
  function ooCueHide() { if (ooCueOff) return; ooCueOff = true; ooCue.classList.remove('on'); }
  ooS.addEventListener('scroll', () => { if (ooS.scrollTop > 40) ooCueHide(); }, { passive: true });
  ooCue.addEventListener('click', e => { e.stopPropagation(); ooS.scrollBy({ top: ooS.clientHeight * 0.85, behavior: 'smooth' }); ooCueHide(); });
  function ooShow(now) {
    if (now) ooS.classList.add('oo-now');
    ooS.classList.add('oo-in');
    if (!EDIT) setTimeout(() => { if (!ooCueOff && ooS.scrollTop < 40) ooCue.classList.add('on'); }, now ? 600 : 2600);
  }
  function dropOpen() {
    if (opened) return;
    opened = true;
    setAudio(true);
    intro.classList.add('oo-drop');
    setTimeout(() => petals.start(6500), 450);
    setTimeout(() => {
      stage.classList.add('opened');
      ooShow(false);
      intro.classList.add('oo-gone');
    }, 1250);
    setTimeout(() => intro.remove(), 1900);
  }
`;

// كل حتة: [اللي بندوّر عليه, اللي بيتحط مكانه]
const PATCHES = [
  // الصفحة اللي بتنزل بالسكرول — جوه الـ stage، تحت الظرف
  ['  <div class="intro" id="coverScreen"', `  ${SCROLL}<div class="intro" id="coverScreen"`],
  // المحرر: السحب جوه الصفحتين بنفس معامل التصغير
  ["  window.__wdaLocalScale = el => (el && el.closest && el.closest('#cv, #coverScreen') ? K : 1);",
    "  window.__wdaLocalScale = el => (el && el.closest && el.closest('#oo-scroll') ? (window.__ooK || 1) : el && el.closest && el.closest('#cv, #coverScreen') ? K : 1);"],
  // السكرول العادي: العجلة واللمس والأسهم ماتقلبش صفحات القالب
  ["    if (e.target.closest?.('textarea')) return;", "    if (e.target.closest?.('textarea, #oo-scroll')) return;"],
  ["  stage.addEventListener('touchmove', e => { if (!e.target.closest('textarea')) e.preventDefault(); }",
    "  stage.addEventListener('touchmove', e => { if (!e.target.closest('textarea, #oo-scroll')) e.preventDefault(); }"],
  ['    if (isField(e.target) || writing()) return;',
    "    if (isField(e.target) || writing() || (stage.classList.contains('opened') && document.getElementById('oo-scroll'))) return;"],
  // الضغط على الظرف → ينزل لتحت بدل ما يتفتح
  ['  function openEnvelope() {\n    if (opened || EDIT) return;',
    '  function openEnvelope() {\n    if (!EDIT) { dropOpen(); return; }\n    if (opened || EDIT) return;'],
  // صاحب الدعوة/المحرر (من غير ظرف): الكلام ظاهر على طول
  ['    show(startAt, 1, true);\n  } else {', '    show(startAt, 1, true);\n    ooShow(true);\n  } else {'],
  ['    if (jump !== null) { opened = true;', '    if (jump !== null) { ooShow(true); opened = true;'],
  ['  /* ---------- start ---------- */', `${LOGIC}\n  /* ---------- start ---------- */`],
];

module.exports = {
  shortId: 'ooW5EFI',

  render() {
    return {
      head: `<link rel="preload" as="image" href="${P1}"><link rel="preload" as="image" href="${P2}"><link rel="stylesheet" href="${FONTS}"><style id="oo-style">${CSS}</style>`,
    };
  },

  transform(html) {
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    let out = html;
    for (const [find, repl] of PATCHES) {
      const f = find.replace(/\n/g, nl);
      if (out.split(f).length !== 2) {
        console.error('[custom ooW5EFI] template changed — showing the normal template');
        return html;
      }
      out = out.replace(f, () => repl.replace(/\n/g, nl));
    }
    return out;
  },
};
