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
//          oo10 يدعوكم بكل حب و ود · oo11 محمد سالم و oo16 محمد هديهد (سطر واحد)
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

// ببصمة المحتوى (custom-invitations/_asset.js): أي تعديل في الصورة → لينك جديد،
// فالمتصفح اللي فتح الدعوة قبل كده بيجيب الجديدة على طول من غير ما يغيّر متصفح
const { asset } = require('./_asset');
const ASSET = '/custom/ooW5EFI/';
const P1 = asset(ASSET + 'p1.webp'), P2 = asset(ASSET + 'p2.webp'), PAPER = asset(ASSET + 'paper.webp');
const FONTS = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Lora:wght@500&display=swap';
const W = 705.75, H1 = 1334.2, H2 = 1106.2;
const MAP_LINK = 'https://goo.gl/maps/cZnwZp9SU5csH7yz8';
const MAP_EMBED = 'https://www.google.com/maps?q=' + encodeURIComponent('26CG+GPX Prince Mohamed Ali Palace, 11 Al Saraya, Al Manyal Ash Sharqi, Old Cairo, Cairo') + '&z=16&output=embed';

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
.oo-w2{height:calc(${H2}px * var(--ok,.5));margin-top:calc(-24px * var(--ok,.5))}
.oo-w3{overflow:visible}
.oo-p,.oo-sx{position:absolute;left:0;top:0;width:${W}px;transform:scale(var(--ok,.5));transform-origin:0 0}
.oo-p{background-size:100% 100%;background-repeat:no-repeat}
.oo-p1{height:${H1}px;background-image:url(${P1})}
.oo-p2 .oo-nov{position:absolute;left:0;right:0;top:230px;margin:0;text-align:center;font:500 47.5px/1 'Lora',Georgia,serif;color:#6f3728;letter-spacing:.005em;direction:ltr;white-space:nowrap}
.oo-p2{height:${H2}px;background-image:url(${P2});-webkit-mask-image:linear-gradient(transparent 0,#000 30px,#000 calc(100% - 90px),transparent);mask-image:linear-gradient(transparent 0,#000 30px,#000 calc(100% - 90px),transparent)}

/* ===== صورة 1: الكلام ===== */
.oo-p1 > p{position:absolute;margin:0;text-align:center;direction:rtl;letter-spacing:0;font-family:'Aref Ruqaa','Amiri',serif;
  text-shadow:0 1px 0 rgba(255,250,240,.35)}
.oo-p1 .oo-wide{left:${W / 2 - 230}px;width:460px}
.oo-p1 .oo-narrow{left:${W / 2 - 128}px;width:256px}
.oo-p1 .oo1{top:318px;font-size:42px;line-height:1.6;color:#54462a}
.oo-p1 .oo2{top:386px;font-size:50px;font-weight:400;line-height:1.7;color:#54462a}
.oo-p1 .oo-orn{position:absolute;left:${W / 2 - 70}px;width:140px;top:486px;height:12px;display:flex;align-items:center;justify-content:center;gap:9px}
.oo-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-orn i:last-child{transform:scaleX(-1)}
.oo-orn b{width:7px;height:7px;border:1px solid #b39566;transform:rotate(45deg)}
.oo-p1 .oo10{top:506px;font-size:30px;line-height:1.6;color:#6a5434}
.oo-p1 .oo-fathers{position:absolute;left:${W / 2 - 170}px;width:340px;top:554px;display:flex;align-items:baseline;justify-content:center;gap:12px;direction:rtl;white-space:nowrap}
.oo-fathers p{flex:none;margin:0;text-align:center;font-family:'Aref Ruqaa','Amiri',serif;font-size:35px;font-weight:700;line-height:1.4;color:#46381f;letter-spacing:0;text-shadow:0 1px 0 rgba(255,250,240,.35)}
.oo-fathers i{flex:none;font:400 30px/1 'Aref Ruqaa','Amiri',serif;font-style:normal;color:#b08d57}
.oo-p1 .oo12{top:664px;font-size:30px;line-height:1.6;color:#6a5434}
.oo-p1 .oo13{top:720px;font-size:86px;font-weight:700;line-height:1.45;color:#8a3a3c}
.oo-p1 .oo14{top:845px;font-size:42px;line-height:1.3;color:#b08d57}
.oo-p1 .oo15{top:889px;font-size:86px;font-weight:700;line-height:1.45;color:#8a3a3c}

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
.oo-hen{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:50px;line-height:1.2;direction:ltr;letter-spacing:.01em}
.oo-venue .oo-sub{font-size:36px;margin-top:10px;color:#54462a}
.oo-script{margin:0;font-family:'Pinyon Script',cursive;font-size:62px;line-height:1.15;color:#54462a;direction:ltr}
.oo-orn2{display:flex;align-items:center;justify-content:center;gap:12px;margin:18px auto 22px;width:220px}
.oo-orn2 i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-orn2 i:last-child{transform:scaleX(-1)}
.oo-orn2 b{width:9px;height:9px;border:1.5px solid #b39566;transform:rotate(45deg)}

/* حركة الظهور مع السكرول */
.oo-a{opacity:0;transform:translateY(26px);filter:blur(5px);transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.7,.2,1),filter .9s ease;transition-delay:calc(var(--d,0) * 120ms)}
.oo-a.oo-vis{opacity:1;transform:none;filter:none}

/* --- مكان الحفل: خريطة مربعة في إطار ذهبي بزوايا --- */
.oo-mapframe{position:relative;margin:30px auto 0;width:540px;height:540px;padding:16px;
  background:linear-gradient(150deg,#f3e3c4,#d9b97e 40%,#b8914f 70%,#ecd6a7);box-shadow:0 22px 40px -20px rgba(70,45,20,.6)}
.oo-mapframe::before{content:"";position:absolute;inset:7px;border:1.5px solid rgba(255,248,230,.8);pointer-events:none}
.oo-mapin{position:relative;width:100%;height:100%;overflow:hidden;background:#e8dccb;box-shadow:inset 0 0 0 1.5px rgba(120,85,40,.45)}
.oo-mapin iframe{position:absolute;left:0;top:0;border:0;pointer-events:none;width:calc(508px * var(--ok,.5));height:calc(508px * var(--ok,.5));transform:scale(calc(1 / var(--ok,.5)));transform-origin:0 0}
.oo-maphit{position:absolute;inset:0;z-index:2}
.oo-corner{position:absolute;width:64px;height:64px;color:#8a6a32;z-index:3;pointer-events:none}
.oo-corner svg{width:100%;height:100%}
.oo-corner.tl{left:-14px;top:-14px}.oo-corner.tr{right:-14px;top:-14px;transform:scaleX(-1)}
.oo-corner.bl{left:-14px;bottom:-14px;transform:scaleY(-1)}.oo-corner.br{right:-14px;bottom:-14px;transform:scale(-1,-1)}
.oo-mapframe .oo-corner{opacity:0;transition:opacity .8s ease .5s}
.oo-mapframe.oo-vis .oo-corner{opacity:1}
.oo-btn{display:inline-flex;align-items:center;gap:12px;margin-top:30px;padding:14px 34px 16px;border-radius:999px;text-decoration:none;
  background:linear-gradient(180deg,#8f3d40,#6f2a2d);color:#fbf1e2;font-size:26px;line-height:1;box-shadow:0 12px 24px -12px rgba(90,30,30,.7),inset 0 1px 0 rgba(255,255,255,.18);border:1.5px solid #c9a46a}
.oo-btn svg{width:26px;height:26px;color:#f1d9a8}

/* --- برنامج اليوم: كروت برجندي بتتقلب واحد ورا التاني --- */
/* --- برنامج اليوم: تسلسلي لتحت (دهبي وزيتي، من غير أحمر) --- */
.oo-prog .oo-h{color:#54462a}
.oo-steps{position:relative;margin:30px auto 0;width:520px}
.oo-step{position:relative;display:flex;flex-direction:column;align-items:center;padding-bottom:22px}
.oo-step + .oo-step{padding-top:96px}
/* الخط اللي بيوصل بين كل ميعاد واللي بعده — بيترسم لتحت لما يظهر */
.oo-step + .oo-step::before{content:"";position:absolute;left:50%;top:4px;width:2px;height:80px;margin-left:-1px;
  background:repeating-linear-gradient(#b39566 0 6px,transparent 6px 12px);transform-origin:50% 0;transform:scaleY(0);transition:transform .9s cubic-bezier(.4,0,.2,1) var(--sd,0ms)}
.oo-step + .oo-step::after{content:"";position:absolute;left:50%;top:84px;width:8px;height:8px;margin-left:-4px;border:1.5px solid #b39566;transform:rotate(45deg) scale(0);transition:transform .5s ease calc(var(--sd,0ms) + .7s)}
.oo-step.oo-vis::before{transform:scaleY(1)}
.oo-step.oo-vis::after{transform:rotate(45deg) scale(1)}
.oo-ring{position:relative;width:96px;height:96px;border-radius:50%;display:grid;place-items:center;color:#8a6a32;
  background:radial-gradient(circle at 35% 30%,#fbf3e3,#efdfc2);box-shadow:0 0 0 1.5px #c9a46a,0 0 0 7px rgba(201,164,106,.14),0 14px 24px -14px rgba(90,60,20,.55);
  transform:scale(.5);opacity:0;transition:transform .8s cubic-bezier(.3,1.5,.5,1) calc(var(--sd,0ms) + .35s),opacity .5s ease calc(var(--sd,0ms) + .35s)}
.oo-ring svg{width:46px;height:46px}
.oo-ring::after{content:"";position:absolute;inset:-12px;border-radius:50%;border:1.5px solid rgba(201,164,106,.7);opacity:0}
.oo-step.oo-vis .oo-ring{transform:none;opacity:1}
.oo-step.oo-vis .oo-ring::after{animation:ooRing 1.4s ease-out calc(var(--sd,0ms) + .8s) 1 both}
@keyframes ooRing{0%{transform:scale(.75);opacity:1}100%{transform:scale(1.45);opacity:0}}
.oo-stime{display:block;margin-top:18px;font-size:50px;font-weight:700;line-height:1.15;color:#54462a;opacity:0;transform:translateY(18px);transition:opacity .8s ease calc(var(--sd,0ms) + .6s),transform .9s cubic-bezier(.2,.7,.2,1) calc(var(--sd,0ms) + .6s)}
.oo-slab{display:block;margin-top:4px;font-size:32px;line-height:1.4;color:#8a6a32;opacity:0;transform:translateY(18px);transition:opacity .8s ease calc(var(--sd,0ms) + .75s),transform .9s cubic-bezier(.2,.7,.2,1) calc(var(--sd,0ms) + .75s)}
.oo-step.oo-vis .oo-stime,.oo-step.oo-vis .oo-slab{opacity:1;transform:none}
#oo-scroll.oo-now .oo-step::before,#oo-scroll.oo-now .oo-step::after,#oo-scroll.oo-now .oo-step *{transition:none!important;animation:none!important}

/* --- الدريس كود: دواير ألوان --- */
.oo-grp{display:flex;align-items:center;justify-content:center;gap:14px;margin:34px 0 20px;font-size:32px;line-height:1.4;color:#6a5434}
.oo-grp::before,.oo-grp::after{content:"";width:60px;height:1px;background:linear-gradient(90deg,transparent,#b39566)}
.oo-grp::after{transform:scaleX(-1)}
.oo-sws{display:flex;justify-content:center;gap:24px;direction:ltr}
.oo-sw{width:120px;opacity:0;transform:scale(.4);transition:opacity .6s ease,transform .9s cubic-bezier(.3,1.5,.5,1);transition-delay:calc(var(--d,0) * 150ms)}
.oo-sws.oo-vis .oo-sw{opacity:1;transform:none}
.oo-dot{position:relative;width:120px;height:120px;border-radius:50%;overflow:hidden;background:var(--c);
  box-shadow:0 0 0 3px #f6ead6,0 0 0 4.5px #c9a46a,0 14px 22px -12px rgba(50,25,10,.7),inset 0 -10px 18px rgba(0,0,0,.18),inset 0 8px 14px rgba(255,255,255,.12)}
.oo-dot::after{content:"";position:absolute;top:-20%;bottom:-20%;width:45%;left:-70%;transform:skewX(-18deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)}
.oo-sws.oo-vis .oo-dot::after{animation:ooSheen 1.4s ease-in-out both;animation-delay:calc(var(--d,0) * 150ms + 700ms)}
@keyframes ooSheen{to{left:140%}}
.oo-swe{display:block;margin-top:16px;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:26px;line-height:1.2;color:#54462a;direction:ltr;letter-spacing:.04em}
.oo-end{margin-top:56px}

/* --- تأكيد الحضور + التهنئة الصوتية (مقاس عادي مش متصغّر: الكتابة على الموبايل) --- */
#oo-rsvp{position:relative;direction:rtl;padding:6px 18px calc(48px + env(safe-area-inset-bottom));font-family:'Aref Ruqaa','Amiri',serif;color:#54462a;text-align:center;letter-spacing:0}
#oo-rsvp .oo-orn2{margin:0 auto 10px}
#oo-rsvp .oo-script{font-size:38px}
#oo-rsvp .oo-h{font-size:31px;margin-top:2px}
#oo-rsvp .oo-sub{font-size:16px;margin:4px auto 0;max-width:330px;color:#6a5434}
.oo-box{position:relative;max-width:420px;margin:20px auto 0;padding:22px 18px 20px;border-radius:18px;background:rgba(255,250,240,.55);
  box-shadow:0 0 0 1.5px rgba(179,149,102,.55),0 18px 30px -22px rgba(70,45,20,.6)}
.oo-box::before{content:"";position:absolute;inset:6px;border-radius:13px;border:1px solid rgba(179,149,102,.35);pointer-events:none}
.oo-fld{display:block;width:100%;box-sizing:border-box;margin:0 0 12px;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(179,149,102,.55);background:#fffaf2;
  font:400 17px/1.4 'Amiri','Aref Ruqaa',serif;color:#3e3220;text-align:right;outline:none;-webkit-appearance:none;appearance:none}
.oo-fld:focus{border-color:#8a3a3c;box-shadow:0 0 0 3px rgba(138,58,60,.12)}
textarea.oo-fld{resize:none;min-height:84px}
.oo-seg{display:flex;gap:10px;margin:0 0 12px}
.oo-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:12px 8px;border-radius:12px;border:1.5px solid rgba(179,149,102,.55);background:#fffaf2;
  font:700 16px/1.2 'Aref Ruqaa','Amiri',serif;color:#54462a;cursor:pointer;transition:background .25s,color .25s,border-color .25s,transform .15s}
.oo-seg button svg{width:18px;height:18px}
.oo-seg button[aria-checked="true"]{background:linear-gradient(180deg,#8f3d40,#6f2a2d);color:#fbf1e2;border-color:#c9a46a}
.oo-seg button:active{transform:scale(.97)}
.oo-send{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:999px;border:1.5px solid #c9a46a;
  background:linear-gradient(180deg,#8f3d40,#6f2a2d);color:#fbf1e2;font:700 18px/1 'Aref Ruqaa','Amiri',serif;cursor:pointer;box-shadow:0 12px 22px -12px rgba(90,30,30,.7)}
.oo-send svg{width:18px;height:18px;transform:scaleX(-1)}
.oo-send[disabled]{opacity:.6;pointer-events:none}
.oo-err{min-height:20px;margin:0 0 8px;font:400 14px/1.4 'Amiri',serif;color:#a3262b}
.oo-done{display:none;padding:10px 0 4px}
.oo-done svg{width:62px;height:62px;color:#8a3a3c}
.oo-done svg circle{stroke-dasharray:160;stroke-dashoffset:160;animation:ooDraw 1s ease forwards}
.oo-done svg path{stroke-dasharray:40;stroke-dashoffset:40;animation:ooDraw .6s .7s ease forwards}
@keyframes ooDraw{to{stroke-dashoffset:0}}
.oo-done h3{margin:8px 0 4px;font-size:24px;color:#8a3a3c}
.oo-done p{margin:0 0 12px;font:400 16px/1.6 'Amiri',serif}
.oo-link{border:0;background:none;font:700 15px/1 'Aref Ruqaa','Amiri',serif;color:#8a6a32;text-decoration:underline;cursor:pointer}
#oo-rform.sent form{display:none}#oo-rform.sent .oo-done{display:block}

.oo-voice{margin-top:22px}
.oo-vt{display:block;font-size:22px;font-weight:700;color:#8a3a3c}
.oo-vs{display:block;margin:2px 0 14px;font:400 15px/1.5 'Amiri',serif;color:#6a5434}
.oo-mic{position:relative;width:86px;height:86px;margin:4px auto 10px;border-radius:50%;border:0;cursor:pointer;display:grid;place-items:center;color:#fbf1e2;
  background:radial-gradient(circle at 35% 30%,#a4474b,#6f2a2d);box-shadow:0 0 0 4px #f6ead6,0 0 0 5.5px #c9a46a,0 16px 26px -14px rgba(90,30,30,.8)}
.oo-mic svg{width:36px;height:36px;position:relative;z-index:1}
.oo-mic::before,.oo-mic::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(201,164,106,.7);opacity:0}
.oo-voice:not(.rec) .oo-mic::before{animation:ooHalo 2.4s ease-out infinite}
.oo-voice.rec .oo-mic::before,.oo-voice.rec .oo-mic::after{border-color:rgba(163,38,43,.6);animation:ooHalo 1.3s ease-out infinite}
.oo-voice.rec .oo-mic::after{animation-delay:.65s}
@keyframes ooHalo{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.45);opacity:0}}
.oo-voice .i-stop{display:none}.oo-voice.rec .i-stop{display:block}.oo-voice.rec .i-mic{display:none}
.oo-vtime{display:none;font:700 18px/1 'Cormorant Garamond',serif;color:#a3262b;direction:ltr}
.oo-voice.rec .oo-vtime{display:block}
.oo-vprev{display:none;align-items:center;gap:10px;justify-content:center;margin:6px 0 12px}
.oo-voice.ready .oo-vprev{display:flex}.oo-voice.ready .oo-mic,.oo-voice.ready .oo-vhint{display:none}
.oo-vprev audio{height:38px;max-width:230px}
.oo-vdel{border:0;background:none;color:#8a6a32;cursor:pointer;padding:6px}
.oo-vdel svg{width:22px;height:22px}
.oo-vhint{font:400 14px/1.4 'Amiri',serif;color:#8a7356}
.oo-voice .oo-fld,.oo-voice .oo-send{display:none}
.oo-voice.ready .oo-fld,.oo-voice.ready .oo-send{display:block}.oo-voice.ready .oo-send{display:flex}
.oo-vok{display:none;font:700 17px/1.6 'Aref Ruqaa','Amiri',serif;color:#2f6b3a}
.oo-voice.sent .oo-vok{display:block}.oo-voice.sent .oo-vprev,.oo-voice.sent .oo-fld,.oo-voice.sent .oo-send{display:none}
.oo-voice.sent .oo-mic,.oo-voice.sent .oo-vhint{display:none}

/* "انزل لتحت" — جوه الصورة الأولى تحت الأسامي، ثابتة */
.oo-p1 .oo-down{position:absolute;left:${W / 2 - 150}px;top:1112px;width:300px;margin:0;padding:0;border:0;background:none;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:6px;direction:rtl;-webkit-appearance:none;appearance:none}
.oo-down b{font:400 30px/1.2 'Aref Ruqaa','Amiri',serif;color:#6a5434;text-shadow:0 1px 0 rgba(255,250,240,.5)}
.oo-down small{font:italic 500 22px/1 'Cormorant Garamond',serif;color:#8a6a32;letter-spacing:.12em;direction:ltr}
.oo-down svg{width:36px;height:36px;color:#a8803f;animation:ooNudge 1.8s ease-in-out infinite}
@keyframes ooNudge{0%,100%{transform:translateY(-4px);opacity:.55}50%{transform:translateY(8px);opacity:1}}

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
@media (prefers-reduced-motion:reduce){#oo-scroll .oo-rv,.oo-a,.oo-sw,.oo-step,.oo-step *,.oo-step::before{transition:none}.oo-down svg,.oo-dot::after,.oo-ring::after,.oo-mic::before,.oo-mic::after{animation:none}}
`;

const ICON = {
  rings: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="18" cy="28" r="10"/><circle cx="30" cy="28" r="10"/><path d="M26 10l4-4 4 4-4 5z"/></svg>',
  dine: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="11"/><circle cx="24" cy="26" r="6.5" opacity=".6"/><path d="M7 8v10a3 3 0 0 0 6 0V8M10 18v24"/><path d="M41 8c-3 1-5 5-5 10h5v24"/></svg>',
  music: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 34V10l20-4v24"/><circle cx="13" cy="34" r="5"/><circle cx="33" cy="30" r="5"/><path d="M18 16l20-4"/></svg>',
  moon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M30 8a16 16 0 1 0 10 26A14 14 0 0 1 30 8z"/><path d="M36 10l1.2 2.8L40 14l-2.8 1.2L36 18l-1.2-2.8L32 14l2.8-1.2z"/></svg>',
  corner: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 58V18Q6 6 18 6h40"/><path d="M14 58V24q0-10 10-10h34" opacity=".55"/><path d="M22 22c6-8 16-6 16 2 0 5-6 6-8 2" opacity=".85"/><circle cx="10" cy="10" r="3.2" fill="currentColor" stroke="none"/></svg>',
  mic: '<svg class="i-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11.5" rx="3" fill="currentColor" stroke="none"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></svg><svg class="i-stop" viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7h15M9.5 7V5h5v2M7 7l.8 12h8.4L17 7"/></svg>',
  check: '<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="26" r="24"/><path d="M15 27l7.5 7.5L37.5 19"/></svg>',
  yes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  no: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></svg>',
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
  ['#6b1d29', 43, 'Burgundy'],
  ['#a5502b', 45, 'Rust'],
  ['#5b6234', 47, 'Olive'],
  ['#45291f', 49, 'Chocolate'],
];
const MEN = [
  ['#16161a', 53, 'Black'],
  ['#1d2b4b', 55, 'Navy'],
];
const sw = (list) => list.map(([c, n, en], i) => `<div class="oo-sw" style="--d:${i};--c:${c}"><div class="oo-dot"></div><b class="oo-swe" data-elem-id="oo${n}">${en}</b></div>`).join('');
const CORNERS = ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="oo-corner ${c}">${ICON.corner}</span>`).join('');

const SECTIONS = `<div class="oo-w oo-w3" id="oo-w3"><div class="oo-sx" id="oo-sx">
      <section class="oo-s oo-venue">
        <div class="oo-orn2 oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
        ${T('p', 'oo-eye', 20, 'مكان الحفل', 0)}
        ${T('h2', 'oo-h oo-hen', 21, 'Prince Mohamed Ali Palace', 1)}
        ${T('p', 'oo-sub', 22, 'المنيل · القاهرة', 2)}
        <div class="oo-mapframe oo-a" style="--d:3">${CORNERS}
          <div class="oo-mapin"><iframe title="Prince Mohamed Ali Palace" loading="lazy" referrerpolicy="no-referrer-when-downgrade" tabindex="-1" data-oo-src="${MAP_EMBED}"></iframe>
            <a class="oo-maphit" href="${MAP_LINK}" target="_blank" rel="noopener" aria-label="افتح الموقع في خرائط جوجل"></a></div>
        </div>
        <a class="oo-btn oo-a" style="--d:4" href="${MAP_LINK}" target="_blank" rel="noopener">${ICON.pin}<span data-elem-id="oo23">افتح الموقع على الخريطة</span></a>
      </section>
      <section class="oo-s oo-prog">
        <div class="oo-orn2 oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
        ${T('p', 'oo-script', 24, 'The Program', 0)}
        ${T('h2', 'oo-h', 25, 'برنامج اليوم', 1)}
        <div class="oo-steps" id="oo-steps">
          ${PROGRAM.map(([side, ic, t1, time, t2, label], i) => `<div class="oo-step oo-a4" style="--sd:${i * 450}ms"><span class="oo-ring">${ICON[ic]}</span><b class="oo-stime" data-elem-id="oo${t1}">${time}</b><span class="oo-slab" data-elem-id="oo${t2}">${label}</span></div>`).join('\n          ')}
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

const RSVP = `<div id="oo-rsvp">
      <div class="oo-orn2 oo-a" aria-hidden="true"><i></i><b></b><i></i></div>
      <p class="oo-script oo-a" data-elem-id="oo60">Kindly Reply</p>
      <h2 class="oo-h oo-a" style="--d:1" data-elem-id="oo61">تأكيد الحضور</h2>
      <p class="oo-sub oo-a" style="--d:2" data-elem-id="oo62">يسعدنا أن نعرف إن كنتم ستشاركوننا الفرحة</p>
      <div class="oo-box oo-a" style="--d:3" id="oo-rform">
        <form id="oo-form" novalidate autocomplete="on">
          <input class="oo-fld" name="name" type="text" placeholder="الاسم الكريم" autocomplete="name" maxlength="60">
          <div class="oo-seg" role="radiogroup" aria-label="الحضور">
            <button type="button" role="radio" aria-checked="false" data-v="yes">${ICON.yes}<span data-elem-id="oo63">سأحضر بإذن الله</span></button>
            <button type="button" role="radio" aria-checked="false" data-v="no">${ICON.no}<span data-elem-id="oo64">أعتذر عن الحضور</span></button>
          </div>
          <textarea class="oo-fld" name="message" rows="3" maxlength="200" placeholder="اكتب تهنئتك أو رسالتك للعروسين (اختياري)"></textarea>
          <p class="oo-err" aria-live="polite"></p>
          <button class="oo-send" type="submit">${ICON.send}<span data-elem-id="oo65">إرسال</span></button>
        </form>
        <div class="oo-done" aria-live="polite">${ICON.check}<h3></h3><p></p><button class="oo-link" type="button" id="oo-again">تعديل الرد</button></div>
      </div>
      <div class="oo-box oo-voice oo-a" style="--d:4" id="oo-voice">
        <b class="oo-vt" data-elem-id="oo66">سجّل تهنئة صوتية للعروسين</b>
        <span class="oo-vs" data-elem-id="oo67">صوتك هيوصلهم على طول 🤍</span>
        <button class="oo-mic" type="button" id="oo-mic" aria-label="ابدأ التسجيل">${ICON.mic}</button>
        <span class="oo-vtime" id="oo-vtime">0:00</span>
        <span class="oo-vhint" id="oo-vhint">اضغط وابدأ الكلام — واضغط تاني لما تخلص</span>
        <div class="oo-vprev"><audio id="oo-vaudio" controls preload="metadata"></audio><button class="oo-vdel" type="button" id="oo-vdel" aria-label="امسح وسجّل تاني">${ICON.trash}</button></div>
        <input class="oo-fld" id="oo-vname" type="text" placeholder="اكتب اسمك ليعرف العروسان صاحب التهنئة" autocomplete="name" maxlength="60">
        <p class="oo-err" id="oo-verr" aria-live="polite"></p>
        <button class="oo-send" type="button" id="oo-vsend">${ICON.send}<span>إرسال التهنئة</span></button>
        <span class="oo-vok">وصلت تهنئتك للعروسين 🤍 شكرًا لمحبتك</span>
      </div>
    </div>`;

const SCROLL = `<div id="oo-scroll" aria-label="الدعوة">
    <div class="oo-w oo-w1"><div class="oo-p oo-p1">
      ${P('oo-wide', 1, 0, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')}
      ${P('oo-wide', 2, 2, 'وَخَلَقْنَاكُمْ أَزْوَاجًا')}
      <div class="oo-orn oo-rv" style="--d:4" aria-hidden="true"><i></i><b></b><i></i></div>
      ${P('oo-narrow', 10, 5, 'يدعوكم بكل حب و ود')}
      <div class="oo-fathers oo-rv" style="--d:6.5"><p data-elem-id="oo11">محمد سالم</p><i aria-hidden="true">و</i><p data-elem-id="oo16">محمد هديهد</p></div>
      ${P('oo-narrow', 12, 8, 'لحضور حفل زفاف')}
      ${P('oo-narrow', 13, 9.5, 'ابراهيم')}
      ${P('oo-narrow', 14, 10.5, 'و')}
      ${P('oo-narrow', 15, 11.5, 'فرح')}
      <button class="oo-down oo-rv" style="--d:13" type="button" id="oo-down" aria-label="انزل لتحت"><b data-elem-id="oo17">انزل لتحت</b><small data-elem-id="oo18">Scroll down</small><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l6 6 6-6"/><path d="M8.5 4.5 12 8l3.5-3.5" opacity=".55"/></svg></button>
    </div></div>
    <div class="oo-w oo-w2"><div class="oo-p oo-p2" role="img" aria-label="Save the Date — 22 نوفمبر 2026"><p class="oo-nov" data-elem-id="oo19">22 NOVEMBER 2026</p></div></div>
    ${SECTIONS}
    ${RSVP}
  </div>
  `;

// بيتحط جوه سكريبت القالب (قبل "start") — فبيوصل لـ stage / intro / opened ...
const LOGIC = `
  /* ---------- ooW5EFI: صفحة واحدة بالسكرول + الظرف بينزل بدل ما يتفتح ---------- */
  const ooS = document.getElementById('oo-scroll');
  const ooW3 = document.getElementById('oo-w3'), ooSx = document.getElementById('oo-sx');
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
  document.getElementById('oo-down').addEventListener('click', e => { e.stopPropagation(); if (EDIT) return; ooS.scrollTo({ top: document.querySelector('.oo-w2').offsetTop - 10, behavior: 'smooth' }); });
  // الأجزاء اللي تحت: بتظهر لما توصلها، والخريطة بتتحمّل قبلها بشوية
  const ooAll = [...ooS.querySelectorAll('.oo-a, .oo-a4')];
  const ooMap = ooS.querySelector('.oo-mapin iframe');
  function ooMapLoad() { if (!ooMap.getAttribute('src')) ooMap.setAttribute('src', ooMap.dataset.ooSrc); }
  function ooScan() {
    const h = ooS.clientHeight, top = ooS.getBoundingClientRect().top;
    ooAll.forEach(el => { if (!el.classList.contains('oo-vis') && el.getBoundingClientRect().top - top < h * 0.86) el.classList.add('oo-vis'); });
    if (ooMap.getBoundingClientRect().top - top < h * 2.2) ooMapLoad();
  }
  let ooRaf = 0;
  ooS.addEventListener('scroll', () => { if (!ooRaf) ooRaf = requestAnimationFrame(() => { ooRaf = 0; ooScan(); }); }, { passive: true });
  function ooShow(now) {
    if (now) {
      ooS.classList.add('oo-now');
      ooAll.forEach(el => el.classList.add('oo-vis'));
      ooMapLoad();
    }
    ooS.classList.add('oo-in');
    ooFit(); setTimeout(ooScan, 50);
  }
  /* تأكيد الحضور — نفس طريقة القالب بالظبط (بيوصل للوحة صاحب الدعوة) */
  {
    const box = document.getElementById('oo-rform'), form = document.getElementById('oo-form'), err = form.querySelector('.oo-err');
    const seg = form.querySelectorAll('.oo-seg button'), nameIn = form.elements.namedItem('name'), msgIn = form.elements.namedItem('message');
    const KEY = 'mithaq_rsvp_' + (C.shortId || 'preview');
    let att = null;
    const oops = m => { err.textContent = m; };
    const thank = (name, yes) => {
      const first = String(name || '').split(/\\s+/)[0];
      box.querySelector('.oo-done h3').textContent = yes ? \`شكراً لك يا \${first}\` : \`نشكرك يا \${first}\`;
      box.querySelector('.oo-done p').textContent = yes ? 'تمّ تأكيد حضورك، وننتظر رؤيتك لتكتمل فرحتنا بك 🤍' : 'وصل اعتذارك، وستبقى في قلوبنا ودعواتنا ليلتها 🤍';
    };
    seg.forEach(b => b.addEventListener('click', () => { att = b.dataset.v === 'yes'; seg.forEach(x => x.setAttribute('aria-checked', String(x === b))); oops(''); }));
    nameIn.value = store.get(NAME_KEY) || '';
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (EDIT) return;
      const name = nameIn.value.trim().replace(/\\s+/g, ' ');
      if (name.length < 2) { oops('من فضلك اكتب اسمك'); nameIn.focus(); return; }
      if (att === null) { oops('من فضلك اختر: سأحضر أو أعتذر'); return; }
      const btn = form.querySelector('.oo-send'); btn.disabled = true; oops('');
      try {
        if (C.shortId) {
          const res = await fetch(\`/i/\${encodeURIComponent(C.shortId)}/rsvp\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
            body: JSON.stringify({ guestName: name, attending: att ? 'yes' : 'no', note: msgIn.value.trim() }) });
          if (!res.ok) { let b = {}; try { b = await res.json(); } catch (_) {} throw new Error(b.error || 'rsvp'); }
        }
        if (!STATIC) store.set(KEY, JSON.stringify({ name, attending: att, at: Date.now() }));
        store.set(NAME_KEY, name);
        const vn = document.getElementById('oo-vname'); if (vn && !vn.value) vn.value = name;
        thank(name, att); box.classList.add('sent');
      } catch (ex) { oops(ex && ex.message && ex.message !== 'rsvp' ? ex.message : 'تعذّر الإرسال، حاول مرة أخرى'); }
      btn.disabled = false;
    });
    document.getElementById('oo-again').addEventListener('click', () => box.classList.remove('sent'));
    if (!STATIC) { try { const prev = JSON.parse(store.get(KEY) || 'null'); if (prev && prev.name) { thank(prev.name, !!prev.attending); box.classList.add('sent'); } } catch (_) {} }
  }
  /* التهنئة الصوتية — بتترفع بنفس دالة القالب (بتوصل للوحة صاحب الدعوة: التهاني الصوتية) */
  {
    const wrap = document.getElementById('oo-voice'), mic = document.getElementById('oo-mic'), tEl = document.getElementById('oo-vtime');
    const au = document.getElementById('oo-vaudio'), nameIn = document.getElementById('oo-vname'), err = document.getElementById('oo-verr'), sendB = document.getElementById('oo-vsend');
    let rec = null, stream = null, chunks = [], t0 = 0, tick = 0, blob = null, secs = 0;
    nameIn.value = store.get(NAME_KEY) || '';
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    const stopAll = () => { clearInterval(tick); if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
    async function begin() {
      err.textContent = '';
      if (!navigator.mediaDevices || !window.MediaRecorder) { err.textContent = 'المتصفح ده مش بيدعم التسجيل — جرّب من متصفح تاني'; return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (_) { err.textContent = 'محتاجين إذن الميكروفون عشان نسجّل تهنئتك'; return; }
      const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
      rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      chunks = [];
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stopAll();
        secs = (Date.now() - t0) / 1000;
        if (secs < 1) { wrap.classList.remove('rec'); err.textContent = 'التسجيل قصير قوي — اضغط واتكلم شوية'; return; }
        blob = new Blob(chunks, { type: (rec.mimeType || type || 'audio/webm').split(';')[0] });
        au.src = URL.createObjectURL(blob);
        wrap.classList.remove('rec'); wrap.classList.add('ready');
      };
      try { setAudio(false); } catch (_) {}
      rec.start(); t0 = Date.now(); wrap.classList.add('rec'); tEl.textContent = '0:00';
      tick = setInterval(() => { const s = (Date.now() - t0) / 1000; tEl.textContent = fmt(s); if (s >= 60) rec.stop(); }, 250);
    }
    mic.addEventListener('click', () => { if (EDIT) return; if (rec && rec.state === 'recording') rec.stop(); else begin(); });
    document.getElementById('oo-vdel').addEventListener('click', () => { blob = null; au.removeAttribute('src'); wrap.classList.remove('ready'); err.textContent = ''; });
    sendB.addEventListener('click', async () => {
      if (EDIT || !blob) return;
      const name = nameIn.value.trim().replace(/\\s+/g, ' ');
      if (name.length < 2) { err.textContent = 'اكتب اسمك عشان العروسين يعرفوا التهنئة من مين'; nameIn.focus(); return; }
      sendB.disabled = true; err.textContent = '';
      try { await uploadVoice(blob, name, secs); store.set(NAME_KEY, name); wrap.classList.remove('ready'); wrap.classList.add('sent'); }
      catch (ex) { err.textContent = (ex && ex.userMessage) || 'تعذّر الإرسال، حاول مرة أخرى'; }
      sendB.disabled = false;
    });
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
    "  window.__wdaLocalScale = el => (el && el.closest && el.closest('#oo-scroll') && !el.closest('#oo-rsvp') ? (window.__ooK || 1) : el && el.closest && el.closest('#cv, #coverScreen') ? K : 1);"],
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
