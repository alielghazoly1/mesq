// دعوة ooW5EFI (Velvet Voice، عربي) — بطلب المالك (ابراهيم وفرح، قصر الأمير محمد علي):
//
// 1) الظرف: أول ما الضيف يضغط، الظرف ماينفتحش — الختم بيطير والظرف كله بينزل
//    لتحت ويختفي (نفس حركة Sage Garden)، والدعوة تتفتح على طول.
// 2) الدعوة صفحة واحدة بتنزل بالسكرول العادي (مش صفحات بتتقلب)، وكل صفحات القالب
//    التانية مش ظاهرة. بالترتيب:
//      • صورة 1 (custom/ooW5EFI/p1.webp): الستارة والورد والقبة كاملة — النجفة
//        اتشالت (LaMa) والقبة اللي وراها اترسمت بنفس مقطع الجبس الأصلي، وشريط
//        الموبايل وخانة "Reply to yourself" والكلام القديم اتشالوا.
//        فوقها كلام حقيقي بيتعدّل من المحرر (Aref Ruqaa):
//          oo1 بسم الله الرحمن الرحيم · oo2 وَخَلَقْنَاكُمْ أَزْوَاجًا
//          oo10 يدعوكم بكل حب و ود · oo11 محمد إبراهيم سالم · oo16 و محمد على هديهد
//          oo12 لحضور حفل زفاف · oo13 ابراهيم · oo14 و · oo15 فرح
//      • صورة 2 (custom/ooW5EFI/p2.webp): Save the Date — القوس الذهبي اللي كان
//        مقصوص من فوق اتكمّل، والقلب على يوم 22 بس.
//      • مكان الحفل: قصر الأمير محمد علي + خريطة جوجل في إطار + زرار يفتحها.
//      • برنامج اليوم: خط ذهبي بيترسم مع السكرول، وكل ميعاد بيظهر لما الخط يوصله.
//      • الدريس كود: ألوان السيدات (برجندي/طوبي/أخضر زيتي/بني) والرجال (أسود/كحلي).
//    الأسامي والتاريخ والمكان والساعة اتحطّوا كمان في بيانات الدعوة نفسها
//    (utils/oneOffFixes.js) عشان عنوان الدعوة وكارت المشاركة.
//
// التنفيذ: transform() بيعدّل حتت صغيرة في كود القالب للدعوة دي بس. لو القالب
// اتغيّر ومالقاش حتة منهم، بيسيب الصفحة زي ما هي (القالب العادي) — مفيش كسر.
// كل الأجزاء متصمّمة بمقاس لوحة القالب (705.75px عرض) وبتتصغّر على قد الشاشة
// (--ok)، والمحرر بياخد نفس المعامل (__wdaLocalScale) عشان السحب يبقى مظبوط.

const ASSET = '/custom/ooW5EFI/';
const P1 = ASSET + 'p1.webp', P2 = ASSET + 'p2.webp', PAPER = ASSET + 'paper.webp';
const FONTS = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap';
const W = 705.75, H1 = 1334.2, H2 = 1363.9;
const MAP_LINK = 'https://goo.gl/maps/KCMpenYcVXjCKwgHA';
const MAP_EMBED = 'https://www.google.com/maps?q=' + encodeURIComponent('قصر الأمير محمد علي بالمنيل، 1 السرايا، المنيل الشرقي، مصر القديمة، القاهرة') + '&z=16&output=embed';

const CSS = `
.stage.oo-mode .cv,.stage.oo-mode .vv-nav,.stage.oo-mode .vv-chip{display:none!important}
/* القالب قافل اللمس على الصفحة كلها (بيقلب صفحات) — هنا السكرول العادي */
.stage.oo-mode{touch-action:pan-y}
#oo-scroll{position:absolute;inset:0;z-index:25;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;
  touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:none;background:#ddc3a9 url(${PAPER}) 0 0/calc(340px * var(--ok,.5)) auto;direction:ltr;
  visibility:hidden;opacity:0;transition:opacity .6s ease}
#oo-scroll::-webkit-scrollbar{display:none}
.stage.opened #oo-scroll{visibility:visible;opacity:1}
.oo-w{position:relative;width:100%;overflow:hidden}
.oo-w1{height:calc(${H1}px * var(--ok,.5))}
.oo-w2{height:calc(${H2}px * var(--ok,.5));margin-top:calc(-34px * var(--ok,.5))}
.oo-w3{overflow:visible}
.oo-p,.oo-sx{position:absolute;left:0;top:0;width:${W}px;transform:scale(var(--ok,.5));transform-origin:0 0}
.oo-p{background-size:100% 100%;background-repeat:no-repeat}
.oo-p1{height:${H1}px;background-image:url(${P1})}
.oo-p2{height:${H2}px;background-image:url(${P2});-webkit-mask-image:linear-gradient(transparent 0,#000 34px);mask-image:linear-gradient(transparent 0,#000 34px)}

/* ===== صورة 1: الكلام ===== */
.oo-p1 > p{position:absolute;margin:0;text-align:center;direction:rtl;letter-spacing:0;font-family:'Aref Ruqaa','Amiri',serif;
  text-shadow:0 1px 0 rgba(255,250,240,.35)}
.oo-p1 .oo-wide{left:${W / 2 - 230}px;width:460px}
.oo-p1 .oo-narrow{left:${W / 2 - 128}px;width:256px}
.oo-p1 .oo1{top:187px;font-size:44px;line-height:1.6;color:#a2717a}
.oo-p1 .oo2{top:276px;font-size:50px;font-weight:700;line-height:1.7;color:#54462a}
.oo-p1 .oo-orn{position:absolute;left:${W / 2 - 70}px;width:140px;top:384px;height:12px;display:flex;align-items:center;justify-content:center;gap:9px}
.oo-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-orn i:last-child{transform:scaleX(-1)}
.oo-orn b{width:7px;height:7px;border:1px solid #b39566;transform:rotate(45deg)}
.oo-p1 .oo10{top:414px;font-size:30px;line-height:1.6;color:#6a5434}
.oo-p1 .oo11{top:466px;font-size:30px;font-weight:700;line-height:1.55;color:#54462a}
.oo-p1 .oo16{top:513px;font-size:30px;font-weight:700;line-height:1.55;color:#54462a}
.oo-p1 .oo12{top:578px;font-size:30px;line-height:1.6;color:#6a5434}
.oo-p1 .oo13{top:650px;font-size:70px;font-weight:700;line-height:1.45;color:#8a3a3c}
.oo-p1 .oo14{top:752px;font-size:42px;line-height:1.3;color:#b08d57}
.oo-p1 .oo15{top:800px;font-size:70px;font-weight:700;line-height:1.45;color:#8a3a3c}

/* دخول كلام الصورة الأولى بعد ما الظرف ينزل */
#oo-scroll .oo-rv{opacity:0;transform:translateY(16px);filter:blur(6px);transition:opacity 1s ease,transform 1.1s cubic-bezier(.2,.7,.2,1),filter 1s ease;transition-delay:calc(var(--d,0) * 130ms + 250ms)}
#oo-scroll.oo-in .oo-rv{opacity:1;transform:none;filter:none}
#oo-scroll.oo-now .oo-rv,#oo-scroll.oo-now .oo-a,#oo-scroll.oo-now .oo-a *{transition:none!important;animation:none!important}

/* ===== الأجزاء اللي تحت التاريخ (ورق بنفس ملمس الصورة) ===== */
.oo-sx{direction:rtl;padding:40px 0 70px;color:#54462a;font-family:'Aref Ruqaa','Amiri',serif;text-align:center;letter-spacing:0}
.oo-s{position:relative;margin:0 auto 88px;width:600px}
.oo-s:last-child{margin-bottom:0}
.oo-eye{margin:0;font-size:26px;line-height:1.5;color:#a07a4a}
.oo-h{margin:4px 0 0;font-size:54px;font-weight:700;line-height:1.35;color:#8a3a3c}
.oo-sub{margin:6px 0 0;font-size:26px;line-height:1.5;color:#6a5434}
.oo-script{margin:0;font-family:'Pinyon Script',cursive;font-size:62px;line-height:1.15;color:#54462a;direction:ltr}
.oo-orn2{display:flex;align-items:center;justify-content:center;gap:12px;margin:18px auto 22px;width:220px}
.oo-orn2 i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-orn2 i:last-child{transform:scaleX(-1)}
.oo-orn2 b{width:9px;height:9px;border:1.5px solid #b39566;transform:rotate(45deg)}

/* حركة الظهور مع السكرول */
.oo-a{opacity:0;transform:translateY(26px);filter:blur(5px);transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.7,.2,1),filter .9s ease;transition-delay:calc(var(--d,0) * 120ms)}
.oo-a.oo-vis{opacity:1;transform:none;filter:none}

/* --- مكان الحفل: إطار بقوس فوق زي قوس التاريخ --- */
.oo-mapframe{position:relative;margin:26px auto 0;width:560px;height:420px;padding:12px;border-radius:280px 280px 22px 22px;
  background:linear-gradient(160deg,#f3e3c4,#d9b97e 45%,#b8914f 75%,#e6cf9e);box-shadow:0 18px 36px -18px rgba(70,45,20,.55)}
.oo-mapframe::after{content:"";position:absolute;inset:6px;border-radius:274px 274px 17px 17px;border:1.5px solid rgba(255,248,230,.75);pointer-events:none}
.oo-mapin{position:relative;width:100%;height:100%;overflow:hidden;border-radius:268px 268px 12px 12px;background:#e8dccb}
.oo-mapin iframe{position:absolute;left:0;top:0;border:0;pointer-events:none;width:calc(536px * var(--ok,.5));height:calc(396px * var(--ok,.5));transform:scale(calc(1 / var(--ok,.5)));transform-origin:0 0}
.oo-maphit{position:absolute;inset:0;z-index:2}
.oo-btn{display:inline-flex;align-items:center;gap:12px;margin-top:28px;padding:14px 34px 16px;border-radius:999px;text-decoration:none;
  background:linear-gradient(180deg,#8f3d40,#6f2a2d);color:#fbf1e2;font-size:26px;line-height:1;box-shadow:0 12px 24px -12px rgba(90,30,30,.7),inset 0 1px 0 rgba(255,255,255,.18);border:1.5px solid #c9a46a}
.oo-btn svg{width:26px;height:26px;color:#f1d9a8}

/* --- برنامج اليوم: خط ذهبي بيترسم مع السكرول --- */
.oo-tl{position:relative;margin:34px auto 0;width:600px;padding:10px 0}
.oo-tl-line{position:absolute;left:50%;top:20px;bottom:20px;width:2px;margin-left:-1px;background:rgba(179,149,102,.25);border-radius:2px}
.oo-tl-line b{position:absolute;inset:0;background:linear-gradient(#d6b77c,#a8803f);transform-origin:50% 0;transform:scaleY(var(--tp,0));border-radius:2px}
.oo-ti{position:relative;display:flex;align-items:center;height:150px}
.oo-med{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;display:grid;place-items:center;
  background:#f6ead6;border:2px solid rgba(179,149,102,.45);color:#b39566;transform:scale(.55);opacity:.35;
  transition:transform .7s cubic-bezier(.3,1.6,.5,1),opacity .5s ease,background .6s ease,color .6s ease,border-color .6s ease,box-shadow .6s ease}
.oo-med svg{width:38px;height:38px}
.oo-ti.on .oo-med{transform:none;opacity:1;background:radial-gradient(circle at 35% 30%,#a14a4d,#7a2c2f);color:#f3dcae;border-color:#d6b77c;box-shadow:0 0 0 7px rgba(214,183,124,.18),0 10px 22px -10px rgba(90,30,30,.7)}
.oo-ti.on .oo-med::before{content:"";position:absolute;inset:-9px;border-radius:50%;border:1.5px solid rgba(214,183,124,.7);animation:ooRing 1.4s ease-out 1 both}
@keyframes ooRing{0%{transform:scale(.7);opacity:1}100%{transform:scale(1.5);opacity:0}}
.oo-tc{position:absolute;top:50%;width:230px;transform:translateY(-50%);opacity:0;transition:opacity .7s ease .15s,transform .9s cubic-bezier(.2,.7,.2,1) .15s}
.oo-ti.r .oo-tc{right:0;text-align:right;transform:translate(-30px,-50%)}
.oo-ti.l .oo-tc{left:0;text-align:left;transform:translate(30px,-50%)}
.oo-ti.on .oo-tc{opacity:1;transform:translate(0,-50%)}
.oo-time{display:block;font-size:44px;font-weight:700;line-height:1.2;color:#8a3a3c}
.oo-lab{display:block;margin-top:4px;font-size:30px;line-height:1.4;color:#54462a}

/* --- الدريس كود --- */
.oo-grp{display:flex;align-items:center;justify-content:center;gap:14px;margin:34px 0 18px;font-size:32px;line-height:1.4;color:#6a5434}
.oo-grp::before,.oo-grp::after{content:"";width:60px;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-grp::after{transform:scaleX(-1)}
.oo-sws{display:flex;justify-content:center;gap:22px;direction:rtl}
.oo-sw{width:122px;opacity:0;transform:translateY(40px) rotate(var(--rot,0deg));transition:opacity .8s ease,transform 1s cubic-bezier(.2,.8,.2,1.1);transition-delay:calc(var(--d,0) * 140ms)}
.oo-sws.oo-vis .oo-sw{opacity:1;transform:none}
.oo-chip{position:relative;height:178px;border-radius:61px 61px 14px 14px;overflow:hidden;
  background:linear-gradient(140deg,rgba(255,255,255,.22),rgba(255,255,255,0) 38%,rgba(0,0,0,0) 62%,rgba(0,0,0,.28)),
             repeating-linear-gradient(115deg,rgba(255,255,255,.035) 0 3px,rgba(0,0,0,.035) 3px 6px),var(--c);
  box-shadow:0 0 0 2px #f4e6cc,0 0 0 3.5px #c9a46a,0 16px 26px -14px rgba(50,25,10,.65)}
.oo-chip::before{content:"";position:absolute;inset:8px;border-radius:53px 53px 9px 9px;border:1px solid rgba(255,240,210,.35)}
.oo-chip::after{content:"";position:absolute;top:-20%;bottom:-20%;width:45%;left:-60%;transform:skewX(-18deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent)}
.oo-sws.oo-vis .oo-chip::after{animation:ooSheen 1.6s ease-in-out both;animation-delay:calc(var(--d,0) * 140ms + 700ms)}
@keyframes ooSheen{to{left:130%}}
.oo-swn{display:block;margin-top:16px;font-size:28px;line-height:1.3;color:#54462a}
.oo-swe{display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;line-height:1.3;color:#8a7356;direction:ltr}
.oo-end{margin-top:56px}

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
@media (prefers-reduced-motion:reduce){#oo-scroll .oo-rv,.oo-a,.oo-sw,.oo-tc,.oo-med{transition:none}.oo-cue svg,.oo-chip::after{animation:none}}
`;

const ICON = {
  rings: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="18" cy="28" r="10"/><circle cx="30" cy="28" r="10"/><path d="M26 10l4-4 4 4-4 5z"/></svg>',
  dine: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="11"/><circle cx="24" cy="26" r="6.5" opacity=".6"/><path d="M7 8v10a3 3 0 0 0 6 0V8M10 18v24"/><path d="M41 8c-3 1-5 5-5 10h5v24"/></svg>',
  music: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 34V10l20-4v24"/><circle cx="13" cy="34" r="5"/><circle cx="33" cy="30" r="5"/><path d="M18 16l20-4"/></svg>',
  moon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M30 8a16 16 0 1 0 10 26A14 14 0 0 1 30 8z"/><path d="M36 10l1.2 2.8L40 14l-2.8 1.2L36 18l-1.2-2.8L32 14l2.8-1.2z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a7 7 0 0 0-7 7c0 5.1 6 11.3 6.3 11.6a1 1 0 0 0 1.4 0C13 20.8 19 14.6 19 9.5a7 7 0 0 0-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/></svg>',
};

const P = (cls, id, d, text) => `<p class="${cls} oo${id} oo-rv" style="--d:${d}" data-elem-id="oo${id}">${text}</p>`;
const T = (tag, cls, id, text, d) => `<${tag} class="${cls} oo-a" style="--d:${d || 0}" data-elem-id="oo${id}">${text}</${tag}>`;

const PROGRAM = [
  ['r', 'rings', 30, '٣:٣٠ م', 31, 'بدء الحفل'],
  ['l', 'dine', 32, '٦:٠٠ م', 33, 'الغداء'],
  ['r', 'music', 34, '٧:٠٠ م', 35, 'متابعة الحفل'],
  ['l', 'moon', 36, '٨:٠٠ م', 37, 'نهاية الحفل'],
];
const LADIES = [
  ['#6b1d29', 43, 'برجندي', 44, 'Burgundy'],
  ['#a5502b', 45, 'طوبي', 46, 'Rust'],
  ['#7f8a57', 47, 'أخضر زيتي', 48, 'Sage'],
  ['#45291f', 49, 'بني شوكولا', 50, 'Chocolate'],
];
const MEN = [
  ['#16161a', 53, 'أسود', 54, 'Black'],
  ['#1d2b4b', 55, 'كحلي', 56, 'Navy'],
];
const sw = (list) => list.map(([c, n1, ar, n2, en], i) => `<div class="oo-sw" style="--d:${i};--c:${c}"><div class="oo-chip"></div><b class="oo-swn" data-elem-id="oo${n1}">${ar}</b><small class="oo-swe" data-elem-id="oo${n2}">${en}</small></div>`).join('');

const SECTIONS = `<div class="oo-w oo-w3" id="oo-w3"><div class="oo-sx" id="oo-sx">
      <section class="oo-s oo-venue">
        <div class="oo-orn2 oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
        ${T('p', 'oo-eye', 20, 'مكان الحفل', 0)}
        ${T('h2', 'oo-h', 21, 'قصر الأمير محمد علي', 1)}
        ${T('p', 'oo-sub', 22, 'المنيل · القاهرة', 2)}
        <div class="oo-mapframe oo-a" style="--d:3">
          <div class="oo-mapin"><iframe title="خريطة قصر الأمير محمد علي" loading="lazy" referrerpolicy="no-referrer-when-downgrade" tabindex="-1" data-oo-src="${MAP_EMBED}"></iframe>
            <a class="oo-maphit" href="${MAP_LINK}" target="_blank" rel="noopener" aria-label="افتح الموقع في خرائط جوجل"></a></div>
        </div>
        <a class="oo-btn oo-a" style="--d:4" href="${MAP_LINK}" target="_blank" rel="noopener">${ICON.pin}<span data-elem-id="oo23">افتح الموقع على الخريطة</span></a>
      </section>
      <section class="oo-s oo-prog">
        <div class="oo-orn2 oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
        ${T('p', 'oo-script', 24, 'The Program', 0)}
        ${T('h2', 'oo-h', 25, 'برنامج اليوم', 1)}
        <div class="oo-tl" id="oo-tl"><i class="oo-tl-line"><b></b></i>
          ${PROGRAM.map(([side, ic, t1, time, t2, label]) => `<div class="oo-ti ${side}"><span class="oo-med">${ICON[ic]}</span><div class="oo-tc"><b class="oo-time" data-elem-id="oo${t1}">${time}</b><span class="oo-lab" data-elem-id="oo${t2}">${label}</span></div></div>`).join('\n          ')}
        </div>
      </section>
      <section class="oo-s oo-dress">
        <div class="oo-orn2 oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
        ${T('p', 'oo-script', 40, 'Dress Code', 0)}
        ${T('h2', 'oo-h', 41, 'ألوان الحفل', 1)}
        ${T('p', 'oo-grp', 42, 'للسيدات', 2)}
        <div class="oo-sws oo-a4">${sw(LADIES)}</div>
        ${T('p', 'oo-grp', 52, 'للرجال', 0)}
        <div class="oo-sws oo-a4">${sw(MEN)}</div>
        <div class="oo-orn2 oo-end oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
      </section>
    </div></div>`;

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
    ${SECTIONS}
  </div>
  <button class="oo-cue" id="oo-cue" type="button" aria-label="انزل لتحت"><span>مرّر للأسفل</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l6 6 6-6"/><path d="M8.5 4.5 12 8l3.5-3.5" opacity=".55"/></svg></button>
  `;

// بيتحط جوه سكريبت القالب (قبل "start") — فبيوصل لـ stage / intro / opened ...
const LOGIC = `
  /* ---------- ooW5EFI: صفحة واحدة بالسكرول + الظرف بينزل بدل ما يتفتح ---------- */
  const ooS = document.getElementById('oo-scroll'), ooCue = document.getElementById('oo-cue');
  const ooW3 = document.getElementById('oo-w3'), ooSx = document.getElementById('oo-sx'), ooTl = document.getElementById('oo-tl');
  stage.classList.add('oo-mode');
  function ooFit() {
    const w = stage.getBoundingClientRect().width || innerWidth;
    window.__ooK = w / ${W};
    ooS.style.setProperty('--ok', window.__ooK);
    ooW3.style.height = (ooSx.offsetHeight * window.__ooK) + 'px';
  }
  ooFit(); addEventListener('resize', ooFit); addEventListener('orientationchange', () => setTimeout(ooFit, 200));
  if (window.ResizeObserver) new ResizeObserver(ooFit).observe(ooSx);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ooFit);
  let ooCueOff = false;
  function ooCueHide() { if (ooCueOff) return; ooCueOff = true; ooCue.classList.remove('on'); }
  ooCue.addEventListener('click', e => { e.stopPropagation(); ooS.scrollBy({ top: ooS.clientHeight * 0.85, behavior: 'smooth' }); ooCueHide(); });
  // الأجزاء اللي تحت: بتظهر لما توصلها، والخريطة بتتحمّل قبلها بشوية
  const ooAll = [...ooS.querySelectorAll('.oo-a, .oo-a4')];
  const ooMap = ooS.querySelector('.oo-mapin iframe');
  function ooMapLoad() { if (!ooMap.getAttribute('src')) ooMap.setAttribute('src', ooMap.dataset.ooSrc); }
  function ooScan() {
    const h = ooS.clientHeight, top = ooS.getBoundingClientRect().top;
    if (ooS.scrollTop > 40) ooCueHide();
    ooAll.forEach(el => { if (!el.classList.contains('oo-vis') && el.getBoundingClientRect().top - top < h * 0.86) el.classList.add('oo-vis'); });
    if (ooMap.getBoundingClientRect().top - top < h * 2.2) ooMapLoad();
    // خط البرنامج بيترسم مع السكرول، وكل ميعاد بيولّع لما الخط يوصله
    const r = ooTl.getBoundingClientRect(), mid = top + h * 0.62;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    ooTl.style.setProperty('--tp', p.toFixed(4));
    ooTl.querySelectorAll('.oo-ti').forEach(ti => { const m = ti.querySelector('.oo-med').getBoundingClientRect(); ti.classList.toggle('on', m.top + m.height / 2 < mid); });
  }
  let ooRaf = 0;
  ooS.addEventListener('scroll', () => { if (!ooRaf) ooRaf = requestAnimationFrame(() => { ooRaf = 0; ooScan(); }); }, { passive: true });
  function ooShow(now) {
    if (now) {
      ooS.classList.add('oo-now');
      ooAll.forEach(el => el.classList.add('oo-vis'));
      ooTl.style.setProperty('--tp', 1); ooTl.querySelectorAll('.oo-ti').forEach(ti => ti.classList.add('on'));
      ooMapLoad();
    }
    ooS.classList.add('oo-in');
    ooFit(); setTimeout(ooScan, 50);
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
  // المحرر: السحب جوه الصفحة بنفس معامل التصغير
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
  // صاحب الدعوة/المحرر (من غير ظرف): كله ظاهر على طول
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
