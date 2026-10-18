// custom-invitations/GrpUVQq.js
// دعوة مخصوصة لعميل (Yara & Sherif — قالب Champagne Lace إنجليزي) بطلب المالك:
// بدل الظرف والختم في أول الدعوة، بوابة بيضا مشغولة عليها فيونكة ستان وبروش
// لولي وورد (صورة العميل — النسخة التانية بعد الباب الخشب) بتتقسم من النص
// وبتتفتح، ومكتوب عليها "Open the Door".
//
// الشكل بس اللي هنا — الأسامي والميعاد والمكان والـ dress code متخزّنين في
// الدعوة نفسها (utils/oneOffFixes.js: GrpUVQq-yara-shrief)، فالعميل يقدر
// يعدّلهم من المحرر عادي. البوابة مش بتظهر في المحرر.
//
// الصورة اتقسمت (scratchpad door/g2/mask.js + assets.js): الحيطة والأعمدة
// وتاج الورد اللي فوق ثابتين (gate-frame.webp بفتحة شفافة على شكل القوس)،
// والضلفتين صورتين لوحدهم (gate-left/right.webp) — الويستيريا المتعلقة على
// البوابة بتتحرك معاها زي الديكور الحقيقي. المقاسات بوحدات الصورة 718×1280:
//   الضلفة الشمال من x=52 لحد الفاصل x=363، واليمين من 363 لحد 674.
//   البروش اللولي (نص الفيونكة) عند (363,800).
//
// الفتح: ضغطة ← الكلام بيختفي، لمعة وبريق بيطلعوا من البروش (الفيونكة بتتفك
// من النص)، الضلفتين بيتفتحوا لجوه ناحية النور، والكاميرا بتدخل من البوابة
// لحد ما الدعوة تبان. وفي نفس الضغطة بنضغط الختم الأصلي (مستخبي) عشان
// المزيكا تشتغل، والكارت الأول بيبدأ يظهر والكاميرا داخلة.

const BASE = '/custom/GrpUVQq';
const COVER_REC = 'rec2442650973'; // غلاف الظرف في القالب (views/champagne-lace.html)

// بريق بيطلع من البروش لما الفيونكة تتفك — اتجاهات ثابتة (بنسبة عرض البوابة)
const SPARKS = [[-26, -18], [24, -22], [-34, 4], [33, 6], [-18, 26], [20, 28], [-6, -30], [8, 32], [-40, -6], [41, -10], [-12, 14], [14, -12], [-28, 30], [30, -30]];

const CSS = `
#${COVER_REC} .t396__artboard,#${COVER_REC} .t396__artboard *{visibility:hidden!important;pointer-events:none!important;opacity:0!important}
html.gd-lock,html.gd-lock body{overflow:hidden!important;height:100%}
#gd-door{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;outline:none;background:#efe6d6;transition:background-color .5s ease}
#gd-door .gd-bg{position:absolute;inset:-40px;background:url(${BASE}/gate-bg.jpg) center/cover;filter:blur(26px) brightness(.82) saturate(1.05)}
/* على الشاشات العريضة الخلفية على الجنبين بس — مكان البوابة نفسها فاضي عشان الدعوة تبان من الفتحة */
@media (min-aspect-ratio:5/8){#gd-door .gd-bg{inset:0;filter:none;background:none}#gd-door .gd-bg::before,#gd-door .gd-bg::after{content:"";position:absolute;top:-40px;bottom:-40px;width:calc(50% - 28.05vh + 40px);background:url(${BASE}/gate-bg.jpg) center/cover;filter:blur(26px) brightness(.82) saturate(1.05)}#gd-door .gd-bg::before{left:-40px}#gd-door .gd-bg::after{right:-40px}}
#gd-door .gd-stage{position:absolute;left:50%;top:0;width:max(100vw,56.09vh);aspect-ratio:718/1280;transform:translateX(-50%);perspective:760px;container-type:inline-size}
@supports (height:100dvh){#gd-door .gd-stage{width:max(100vw,56.09dvh)}}
@media (min-aspect-ratio:5/8){#gd-door .gd-stage{width:56.09vh}@supports (height:100dvh){#gd-door .gd-stage{width:56.09dvh}}}
#gd-door .gd-cam{position:absolute;inset:0;transform-origin:50% 60%;transform-style:preserve-3d}
#gd-door img{position:absolute;display:block;user-select:none;-webkit-user-drag:none;pointer-events:none}
#gd-door .gd-light{position:absolute;left:7.2%;width:86.7%;top:16%;height:84%;opacity:0;
  background:radial-gradient(ellipse 58% 48% at 50% 55%,rgba(255,250,236,.98),rgba(255,232,188,.6) 45%,rgba(255,220,170,0) 78%)}
#gd-door .gd-leaf{position:absolute;top:0;height:100%;z-index:2;transform-style:preserve-3d;backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform}
#gd-door .gd-leaf img{inset:0;width:100%;height:100%}
#gd-door .gd-l{left:7.2423%;width:43.3148%;transform-origin:0 50%}
#gd-door .gd-r{left:50.5571%;width:43.3148%;transform-origin:100% 50%}
#gd-door .gd-frame{left:0;top:0;width:100%;height:100%;z-index:3}
#gd-door .gd-shade{position:absolute;inset:0;opacity:0;pointer-events:none}
#gd-door .gd-l .gd-shade{background:linear-gradient(90deg,rgba(60,40,20,.05),rgba(60,40,20,.5))}
#gd-door .gd-r .gd-shade{background:linear-gradient(270deg,rgba(60,40,20,.05),rgba(60,40,20,.5))}
#gd-door .gd-l::after,#gd-door .gd-r::after{content:"";position:absolute;top:22%;bottom:2%;width:2px;opacity:0;background:linear-gradient(180deg,transparent,rgba(255,244,214,1) 30%,rgba(255,244,214,1) 70%,transparent);box-shadow:0 0 12px rgba(255,236,190,.9)}
#gd-door .gd-l::after{right:0}#gd-door .gd-r::after{left:0}
/* نبض دهبي حوالين البروش — بيقول للضيف يدوس */
#gd-door .gd-ring{position:absolute;z-index:4;left:50.56%;top:62.5%;width:9%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);
  border:1px solid rgba(214,176,108,.7);animation:gdRing 2.6s ease-out infinite}
#gd-door .gd-ring.b{animation-delay:1.3s}
@keyframes gdRing{0%{transform:translate(-50%,-50%) scale(.8);opacity:0;box-shadow:0 0 8px rgba(255,222,150,.6)}20%{opacity:1}100%{transform:translate(-50%,-50%) scale(2.4);opacity:0;box-shadow:0 0 16px rgba(255,222,150,0)}}
#gd-door .gd-flash{position:absolute;z-index:5;left:50.56%;top:62.5%;width:60%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) scale(.1);opacity:0;pointer-events:none;
  background:radial-gradient(circle,rgba(255,255,250,1),rgba(255,240,205,.75) 22%,rgba(255,228,170,0) 62%)}
#gd-door .gd-spark{position:absolute;z-index:5;left:50.56%;top:62.5%;width:1.6%;aspect-ratio:1;border-radius:50%;opacity:0;pointer-events:none;
  background:radial-gradient(circle,#fff,rgba(255,236,190,.9) 40%,rgba(255,220,150,0) 70%);transform:translate(-50%,-50%)}
#gd-door .gd-text{position:absolute;inset:0;z-index:6;pointer-events:none;color:#3a2716;text-align:center;opacity:0;transition:opacity .45s ease,filter .45s ease,transform .6s ease}
#gd-door.gd-ready .gd-text{opacity:1}
#gd-door .gd-top{position:absolute;left:19%;right:19%;top:41%;padding:3.4cqw 2cqw 3.2cqw;
  background:linear-gradient(180deg,rgba(255,252,246,.93),rgba(249,242,228,.9));-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);
  border:1px solid rgba(170,132,72,.75);border-radius:2px;
  box-shadow:0 2cqw 5cqw -1.6cqw rgba(70,45,15,.55)}
#gd-door .gd-top::before{content:"";position:absolute;inset:.9cqw;border:1px solid rgba(170,132,72,.45);pointer-events:none}
/* الحبلين الدهب اللي اليافطة متعلقة بيهم في البوابة */
#gd-door .gd-top::after{content:"";position:absolute;left:14%;right:14%;bottom:calc(100% + 1px);height:7cqw;pointer-events:none;border-left:1px solid rgba(176,138,74,.9);border-right:1px solid rgba(176,138,74,.9)}
#gd-door .gd-names{font:400 10.4cqw/1.05 'Pinyon Script','Cormorant Garamond',cursive;letter-spacing:0;white-space:nowrap;
  background:linear-gradient(180deg,#a47a3a,#5b3c1a 60%,#3a2511);-webkit-background-clip:text;background-clip:text;color:transparent}
/* زخرفة صغيرة تحت الأسامي مكان التاريخ (التاريخ مفاجأة في الخربشة) */
#gd-door .gd-orn{display:flex;align-items:center;justify-content:center;gap:1.8cqw;margin-top:1.6cqw}
#gd-door .gd-orn i{width:9cqw;height:1px;background:linear-gradient(90deg,transparent,#a77f3f)}
#gd-door .gd-orn i:last-child{transform:scaleX(-1)}
#gd-door .gd-orn b{width:1.4cqw;height:1.4cqw;border:1px solid #a77f3f;transform:rotate(45deg)}
#gd-door .gd-bottom{position:absolute;left:50%;transform:translateX(-50%);top:min(86%,calc(100vh - 18cqw - env(safe-area-inset-bottom,0px)));padding:2.3cqw 5cqw 2.1cqw;white-space:nowrap;
  background:linear-gradient(180deg,rgba(255,252,246,.9),rgba(249,242,228,.86));-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);
  border-top:1px solid rgba(170,132,72,.7);border-bottom:1px solid rgba(170,132,72,.7);box-shadow:0 1.6cqw 4cqw -1.6cqw rgba(70,45,15,.5)}
@supports (height:100dvh){#gd-door .gd-bottom{top:min(86%,calc(100dvh - 18cqw - env(safe-area-inset-bottom,0px)))}}
#gd-door .gd-open{display:inline-flex;align-items:center;gap:2.4cqw;white-space:nowrap;font:500 4cqw/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.32em;text-indent:.32em;color:#3f2a14;
  animation:gdBreath 2.4s ease-in-out infinite}
#gd-door .gd-open::before,#gd-door .gd-open::after{content:"";width:4cqw;height:1px;background:linear-gradient(90deg,transparent,#a77f3f)}
#gd-door .gd-open::after{transform:scaleX(-1)}
#gd-door .gd-hint{margin-top:1.5cqw;font:italic 500 3.4cqw/1 'Cormorant Garamond',serif;letter-spacing:.06em;color:#6a4c28}
@keyframes gdBreath{0%,100%{opacity:.78}50%{opacity:1}}
/* ===== الفتح ===== */
#gd-door.go{cursor:default;background-color:transparent}
#gd-door.go .gd-text,#gd-door.go.gd-ready .gd-text{opacity:0;filter:blur(6px);transform:scale(1.04)}
#gd-door.go .gd-ring{animation:none;opacity:0;transition:opacity .3s}
#gd-door.go .gd-flash{animation:gdFlash 1.1s ease-out .05s forwards}
#gd-door.go .gd-spark{animation:gdSpark 1.3s cubic-bezier(.2,.7,.3,1) var(--d,.1s) forwards}
#gd-door.go .gd-l{animation:gdOpenL 2.3s cubic-bezier(.45,.05,.25,1) .5s forwards}
#gd-door.go .gd-r{animation:gdOpenR 2.3s cubic-bezier(.45,.05,.25,1) .5s forwards}
#gd-door.go .gd-shade{animation:gdShade 2.3s ease-in .5s forwards}
#gd-door.go .gd-l::after,#gd-door.go .gd-r::after{animation:gdEdge 1.2s ease-out .55s forwards}
#gd-door.go .gd-light{animation:gdLight 2.2s ease-in-out .55s forwards}
#gd-door.go .gd-cam{animation:gdCam 2.1s cubic-bezier(.5,0,.3,1) 1.15s forwards}
#gd-door.go .gd-frame{animation:gdFade 1s ease-in 2s forwards}
#gd-door.go .gd-bg{opacity:0;transition:opacity .35s ease}
@media (min-aspect-ratio:5/8){#gd-door.go .gd-bg{opacity:1;animation:gdFade 1s ease-in 2s forwards}}
#gd-door.go.gd-out{opacity:0;transition:opacity .5s ease}
#gd-door.gd-done{display:none}
@keyframes gdFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.1)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.4)}}
@keyframes gdSpark{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--x) * 1cqw),calc(-50% + var(--y) * 1cqw)) scale(1.3)}}
@keyframes gdOpenL{0%{transform:rotateY(0)}100%{transform:rotateY(86deg)}}
@keyframes gdOpenR{0%{transform:rotateY(0)}100%{transform:rotateY(-86deg)}}
@keyframes gdShade{0%{opacity:0}100%{opacity:1}}
@keyframes gdEdge{0%{opacity:0}35%{opacity:1}100%{opacity:0}}
@keyframes gdLight{0%{opacity:0}40%{opacity:1}100%{opacity:0}}
@keyframes gdCam{0%{transform:scale(1)}100%{transform:scale(1.7)}}
@keyframes gdFade{to{opacity:0}}
@media (prefers-reduced-motion:reduce){
  #gd-door .gd-ring,#gd-door .gd-open{animation:none}
  #gd-door.go .gd-l,#gd-door.go .gd-r,#gd-door.go .gd-cam,#gd-door.go .gd-light,#gd-door.go .gd-shade,#gd-door.go .gd-frame,#gd-door.go .gd-flash,#gd-door.go .gd-spark{animation:none}
  #gd-door.go{opacity:0;transition:opacity .6s ease}
}
`;

const HTML = `<div id="gd-door" role="button" tabindex="0" aria-label="Open the door">
<div class="gd-bg"></div>
<div class="gd-stage"><div class="gd-cam">
<div class="gd-light"></div>
<div class="gd-leaf gd-l"><img src="${BASE}/gate-left.webp" alt="" fetchpriority="high"><i class="gd-shade"></i></div>
<div class="gd-leaf gd-r"><img src="${BASE}/gate-right.webp" alt="" fetchpriority="high"><i class="gd-shade"></i></div>
<img class="gd-frame" src="${BASE}/gate-frame.webp" alt="" fetchpriority="high">
<span class="gd-ring"></span><span class="gd-ring b"></span>
<span class="gd-flash"></span>
${SPARKS.map(([x, y], i) => `<i class="gd-spark" style="--x:${x};--y:${y};--d:${(0.08 + (i % 5) * 0.05).toFixed(2)}s"></i>`).join('')}
<div class="gd-text">
<div class="gd-top"><div class="gd-names" id="gd-names">Yara &amp; Sherif</div><div class="gd-orn"><i></i><b></b><i></i></div></div>
<div class="gd-bottom"><div class="gd-open">OPEN THE DOOR</div><div class="gd-hint">tap to step inside</div></div>
</div>
</div></div>
</div>`;

// الأسامي والتاريخ على الباب بيتقروا من الدعوة نفسها (لو العميل عدّلهم من
// المحرر، الباب يتغيّر معاهم). الفتح بيضغط الختم الأصلي المستخبي.
const SCRIPT = `(function(){
var door=document.getElementById('gd-door');if(!door)return;
var root=document.documentElement;root.classList.add('gd-lock');
try{
  var C=window.WEDDING_CONFIG||{};
  var b=(C.brideName||'').trim(),g=(C.groomName||'').trim();
  if(b&&g&&b!=='Bride'&&g!=='Groom')document.getElementById('gd-names').textContent=b+' & '+g;
}catch(e){}
// الكلام بيبان بعد ما خط الأسامي يحمّل (من غير ما يظهر بخط تاني الأول) — بحد أقصى ثانية ونص
var shown=false;function ready(){if(!shown){shown=true;door.classList.add('gd-ready');}}
try{if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('400 40px "Pinyon Script"'),document.fonts.load('500 16px Cinzel')]).then(ready,ready);}else ready();}catch(e){ready();}
setTimeout(ready,1500);
var opened=false;
function finish(){root.classList.remove('gd-lock');door.classList.add('gd-done');try{window.scrollTo(0,0)}catch(e){}}
function open(){
  if(opened)return;opened=true;
  try{var seal=document.querySelector('.popup-enter');if(seal)seal.click();}catch(e){}
  door.classList.add('go');
  // الكارت الأول يبدأ يظهر والكاميرا داخلة من الباب (بدل ما يستنى 2.3 ثانية بتاعة الظرف)
  setTimeout(function(){var h=document.getElementById('hv-hero');if(h)h.classList.add('hv--play');},1600);
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(function(){door.classList.add('gd-out')},reduce?0:2900);
  setTimeout(finish,reduce?650:3400);
}
door.addEventListener('click',open);
door.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
try{door.focus({preventScroll:true})}catch(e){}
})();`;


// ===== فيديو "Our Memories" مكان الصور الأربعة (بطلب المالك) + أغنية العميل =====
// الفيديو (6 ثواني، بالطول، من غير صوت) بيتعرض في إطار ورق زي كروت الألبوم:
// لما القسم يبان، الإطار بيطلع لفوق ويتعدل، وستارة ورق بتتسحب لفوق وتكشف
// الفيديو، ولمعة دهب بتعدّي مرة على الإطار، وبعدها بيفضل "يتنفّس" بهدوء.
// الفيديو بيشتغل بس وهو ظاهر على الشاشة (بيوفّر بطارية/نت) ومتكرر.
// الأغنية: song.mp3 مكان أغنية القالب — إلا لو العميل حط أغنية بنفسه من المحرر.
const FILM_CSS = `
#al-album .al-track,#al-album .al-nav,#al-album .al-dots{display:none!important}
#al-album .al-stage{height:690px}
#al-album .gd-film{position:absolute;left:50%;top:184px;width:236px;margin-left:-118px;perspective:900px}
#al-album .gd-film-card{position:relative;padding:8px;background:#fbf8f2;border-radius:2px;
  box-shadow:0 1px 1px rgba(60,44,28,.16),0 6px 14px rgba(60,44,28,.1),6px 30px 46px -18px rgba(60,44,28,.62);
  transform-origin:50% 100%;opacity:0;transform:translateY(46px) rotate(-3deg) scale(.92);filter:blur(6px)}
#al-album .gd-film-card::after{content:"";position:absolute;inset:4px;border:1px solid rgba(164,140,105,.55);pointer-events:none}
#al-album .gd-film-win{position:relative;overflow:hidden;aspect-ratio:576/1056;background:#e9dfcf}
#al-album .gd-film-win video,#al-album .gd-film-win img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
#al-album .gd-film-win video{opacity:0;transition:opacity .6s ease}
#al-album .gd-film.live .gd-film-win video{opacity:1}
#al-album .gd-film-curtain{position:absolute;inset:0;background:linear-gradient(180deg,#f4ede1,#e8dcc7);transform-origin:50% 0}
#al-album .gd-film-curtain::after{content:"";position:absolute;left:0;right:0;bottom:0;height:22px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(60,44,28,.18))}
#al-album .gd-film-sheen{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#al-album .gd-film-sheen::before{content:"";position:absolute;top:-20%;bottom:-20%;left:-60%;width:45%;transform:skewX(-18deg);
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,246,222,.55),rgba(255,255,255,0))}
#al-album .gd-film-corner{position:absolute;width:18px;height:18px;border:1px solid #a48c69;opacity:0}
#al-album .gd-film-corner.tl{left:-10px;top:-10px;border-right:0;border-bottom:0}#al-album .gd-film-corner.tr{right:-10px;top:-10px;border-left:0;border-bottom:0}
#al-album .gd-film-corner.bl{left:-10px;bottom:-10px;border-right:0;border-top:0}#al-album .gd-film-corner.br{right:-10px;bottom:-10px;border-left:0;border-top:0}
#al-album .gd-film.in .gd-film-card{animation:gdFilmIn 1.5s cubic-bezier(.2,.75,.2,1) .25s forwards,gdFilmFloat 7s ease-in-out 2.2s infinite}
#al-album .gd-film.in .gd-film-curtain{animation:gdCurtain 1.25s cubic-bezier(.7,0,.25,1) 1s forwards}
#al-album .gd-film.in .gd-film-sheen::before{animation:gdSheen 1.6s ease-in-out 2.1s 1 forwards}
#al-album .gd-film.in .gd-film-corner{animation:gdCorner .9s ease 1.7s forwards}
@keyframes gdFilmIn{to{opacity:1;transform:none;filter:none}}
@keyframes gdFilmFloat{0%,100%{opacity:1;filter:none;transform:translateY(0)}50%{opacity:1;filter:none;transform:translateY(-5px)}}
@keyframes gdCurtain{to{transform:scaleY(0)}}
@keyframes gdSheen{to{left:130%}}
@keyframes gdCorner{to{opacity:.9}}
@media (prefers-reduced-motion:reduce){#al-album .gd-film-card{opacity:1;transform:none;filter:none}#al-album .gd-film-curtain{display:none}#al-album .gd-film.in .gd-film-card{animation:none}#al-album .gd-film-corner{opacity:.9}}
`;

const FILM_SCRIPT = `(function(){
var SONG='${BASE}/song.mp3',DEF='/templates/champagne-lace/song.mp3';
function song(){var a=document.getElementById('invitation-audio');if(!a)return;var s=a.querySelector('source');
  var cur=a.getAttribute('src')||(s&&s.getAttribute('src'))||'';
  if(cur.indexOf(DEF)===-1)return;
  if(s)s.setAttribute('src',SONG);a.setAttribute('src',SONG);try{a.load()}catch(e){}}
function film(){
  var st=document.querySelector('#al-album .al-stage');if(!st||document.getElementById('gd-film'))return;
  var w=document.createElement('div');w.id='gd-film';w.className='gd-film';
  w.innerHTML='<span class="gd-film-corner tl"></span><span class="gd-film-corner tr"></span><span class="gd-film-corner bl"></span><span class="gd-film-corner br"></span>'
   +'<div class="gd-film-card"><div class="gd-film-win"><img src="${BASE}/memories-poster.webp" alt="" decoding="async">'
   +'<video muted loop playsinline preload="none" aria-label="Yara and Sherif"><source src="${BASE}/memories-v2.mp4" type="video/mp4"></video>'
   +'<div class="gd-film-curtain"></div><div class="gd-film-sheen"></div></div></div>';
  st.appendChild(w);
  var v=w.querySelector('video');v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
  // التحميل بدري في الخلفية (مش لما الضيف يوصل): لما يقرب منه بشاشتين، أو بعد
  // ما يفتح البوابة ويهدى النت شوية — فلما يوصل يلاقيه جاهز ويشتغل على طول.
  // صورة أول لقطة فاضلة تحته لحد ما الفيديو يشتغل فعلًا، وبعدين بيظهر بنعومة.
  var warmed=false;function warm(){if(warmed)return;warmed=true;v.preload='auto';try{v.load()}catch(x){}}
  v.addEventListener('playing',function(){w.classList.add('live')});
  var visible=false;
  function play(){warm();var p=v.play();if(p&&p.catch)p.catch(function(){});}
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)warm();});},{rootMargin:'0px 0px 1600px 0px'}).observe(w);
    new IntersectionObserver(function(es){es.forEach(function(e){
      visible=e.isIntersecting;
      if(visible){w.classList.add('in');play();}else{try{v.pause()}catch(x){}}
    });},{threshold:.25}).observe(w);
  }else{w.classList.add('in');play();}
  // بعد فتح البوابة بـ 4 ثواني (أو بعد تحميل الصفحة لو مفيش بوابة) بنسخّنه برضه
  function idle(f){(window.requestIdleCallback||function(c){setTimeout(c,200)})(f)}
  var door=document.getElementById('gd-door');
  if(door){door.addEventListener('click',function(){setTimeout(function(){idle(warm)},4000)},{once:true});}
  else window.addEventListener('load',function(){setTimeout(function(){idle(warm)},2500)});
}
function all(){try{song();film();}catch(e){}}
all();document.addEventListener('DOMContentLoaded',all);window.addEventListener('load',all);
var n=0,t=setInterval(function(){all();if(++n>20)clearInterval(t)},300);
})();`;


// ===== كارت الـ Dress Code / "No casual" في آخر الدعوة (بطلب المالك) =====
// قبل فورم تأكيد الحضور مباشرة. أيقونات خط رفيع دهبي: فيونكة فوق، بدلة
// للرجالة وفستان للستات، وتيشيرت عليه علامة منع بتترسم لما الكارت يبان.
const NOTE_ICONS = {
  bow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"><path d="M3 7.5 10.4 11v2L3 16.5z"/><path d="M21 7.5 13.6 11v2l7.4 3.5z"/><rect x="10.4" y="10.3" width="3.2" height="3.4" rx=".8"/></svg>',
  suit: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><path d="M15 6 6 10.5 4 43h18.5L24 15l1.5 28H44l-2-32.5L33 6"/><path d="M15 6l5.5 15L24 15l3.5 6L33 6"/><path d="M15 6c3 3 6 5 9 9 3-4 6-6 9-9"/><path d="M20.5 11.5 24 13.2l-3.5 1.7zM27.5 11.5 24 13.2l3.5 1.7z"/><circle cx="24" cy="28" r=".9"/><circle cx="24" cy="34" r=".9"/><path d="M10 28h5"/></svg>',
  gown: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><path d="M19 4l1.5 4M29 4l-1.5 4"/><path d="M20.5 8c2.2 1.6 4.8 1.6 7 0l-.8 9.2c-1.9.9-3.5.9-5.4 0z"/><path d="M21.3 17.2C17 26 11 35 7 44h34c-4-9-10-18-14.3-26.8"/><path d="M14 33c3 1.5 6 1 8.5-.5M26 36c3 1 6 .5 8.5-1"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/><path d="M16.5 3.5v2M15.5 4.5h2M20 7.5v1.6M19.2 8.3h1.6"/></svg>',
  kid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(4.8 4.8) scale(.6)"><path d="M9 12h.01M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></g><circle class="gd-no-ring" cx="12" cy="12" r="10.4"/><path class="gd-no-slash" d="M4.7 4.7 19.3 19.3"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" transform="translate(4.8 4.8) scale(.6)"/><circle class="gd-no-ring" cx="12" cy="12" r="10.4"/><path class="gd-no-slash" d="M4.7 4.7 19.3 19.3"/></svg>',
};

const NOTE_HTML = `<div class="gd-note-card">
<span class="gd-note-bow">${NOTE_ICONS.bow}</span>
<p class="gd-note-eb">DRESS CODE</p>
<h3 class="gd-note-title">Formal Attire</h3>
<div class="gd-note-rule"><i></i><b></b><i></i></div>
<div class="gd-note-cols">
<div class="gd-note-col"><span class="gd-note-ic">${NOTE_ICONS.suit}</span><p class="gd-note-who">GENTLEMEN</p><p class="gd-note-what">Formal suits only</p></div>
<span class="gd-note-sep"></span>
<div class="gd-note-col"><span class="gd-note-ic">${NOTE_ICONS.gown}</span><p class="gd-note-who">LADIES</p><p class="gd-note-what">Soirée dresses only</p></div>
</div>
<div class="gd-note-nos"><div class="gd-note-no"><span class="gd-note-noic">${NOTE_ICONS.shirt}</span><span class="gd-note-notxt">NO CASUAL</span></div><div class="gd-note-no"><span class="gd-note-noic">${NOTE_ICONS.kid}</span><span class="gd-note-notxt">ADULTS ONLY</span></div></div>
<div class="gd-note-kids" dir="rtl" lang="ar"><span class="gd-note-moon">${NOTE_ICONS.moon}</span><p>أطفالنا الصغار…<br>حان وقت النوم</p><p class="gd-note-kids2">فقد حان وقت السهر والاحتفال<br><b>للكبار فقط</b></p></div>
</div>`;

const NOTE_CSS = `
/* التاريخ مفاجأة: بيظهر في الخربشة بس — مش في الكارت الأول */
#hv-hero .hv-date{display:none!important}
/* الـ Dress code مش في الكارت الأول — موجود في كارته تحت (بطلب المالك) */
#hv-hero .hv-dress{display:none!important}
/* الخربشة: الجملة أوضح + إيد بتخربش على الكروت لحد ما الضيف يبدأ */
#hv-hero .hv-reveal__hint{font-weight:600!important;color:#5a3f20!important;letter-spacing:.06em}
#hv-hero .hv-tiles{position:relative}
#hv-hero .gd-scratch-hand{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:4px 0 0 -10px;z-index:6;pointer-events:none;color:#3a2716;
  filter:drop-shadow(0 3px 6px rgba(0,0,0,.25));animation:gdHand 2.2s ease-in-out infinite;transition:opacity .4s ease}
#hv-hero .gd-scratch-hand svg{width:100%;height:100%;display:block}
#hv-hero .gd-scratch-hand.off{opacity:0;animation:none}
#hv-hero .gd-scratch-tag{box-sizing:border-box;position:absolute;left:50%;top:14%;transform:translateX(-50%);z-index:6;pointer-events:none;white-space:nowrap;
  padding:6px 14px;border-radius:999px;background:#3a2716;color:#fbf3e3;font:600 11px/1 'Cinzel','Times New Roman',serif;letter-spacing:.22em;
  box-shadow:0 6px 16px -6px rgba(58,39,22,.6);animation:gdTag 1.6s ease-in-out infinite;transition:opacity .4s ease}
#hv-hero .gd-scratch-tag.off{opacity:0;animation:none}
@keyframes gdHand{0%{transform:translate(-60px,6px) rotate(-12deg)}25%{transform:translate(-10px,-4px) rotate(4deg)}50%{transform:translate(45px,8px) rotate(-6deg)}75%{transform:translate(-5px,-2px) rotate(6deg)}100%{transform:translate(-60px,6px) rotate(-12deg)}}
@keyframes gdTag{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-4px)}}
@media (prefers-reduced-motion:reduce){#hv-hero .gd-scratch-hand,#hv-hero .gd-scratch-tag{animation:none}}
#gd-notice{position:relative;background:#fffdfb;padding:34px 22px 46px;text-align:center;color:#2b1c13;-webkit-font-smoothing:antialiased}
#gd-notice *{box-sizing:border-box;margin:0;padding:0}
#gd-notice .gd-note-card{position:relative;max-width:340px;margin:0 auto;padding:30px 22px 28px;background:#fbf8f2;border-radius:2px;
  box-shadow:0 1px 1px rgba(60,44,28,.14),0 6px 14px rgba(60,44,28,.07),4px 26px 40px -20px rgba(60,44,28,.5)}
#gd-notice .gd-note-card::before{content:"";position:absolute;inset:6px;border:1px solid rgba(164,140,105,.5);pointer-events:none}
#gd-notice svg{display:block;width:100%;height:100%}
#gd-notice .gd-note-bow{display:block;width:30px;height:30px;margin:0 auto 10px;color:#a48c69}
#gd-notice .gd-note-eb{font:500 10px/1 'Cinzel','Times New Roman',serif;letter-spacing:.32em;padding-left:.32em;color:#6f5d4c}
#gd-notice .gd-note-title{margin-top:8px;font:400 40px/1.15 'Pinyon Script','Cormorant Garamond',cursive;-webkit-text-stroke:.3px currentColor;font-weight:400}
#gd-notice .gd-note-rule{display:flex;align-items:center;justify-content:center;gap:10px;margin:14px 0 20px}
#gd-notice .gd-note-rule i{width:56px;height:1px;background:linear-gradient(90deg,transparent,#a48c69)}
#gd-notice .gd-note-rule i:last-child{transform:scaleX(-1)}
#gd-notice .gd-note-rule b{width:6px;height:6px;border:1px solid #a48c69;transform:rotate(45deg)}
#gd-notice .gd-note-cols{display:flex;align-items:stretch;justify-content:center;gap:14px}
#gd-notice .gd-note-col{flex:1;min-width:0}
#gd-notice .gd-note-sep{width:1px;background:linear-gradient(180deg,transparent,rgba(164,140,105,.6),transparent)}
#gd-notice .gd-note-ic{display:block;width:46px;height:46px;margin:0 auto 10px;color:#8a6f4a}
#gd-notice .gd-note-who{font:500 10.5px/1 'Cinzel','Times New Roman',serif;letter-spacing:.24em;padding-left:.24em;color:#6f5d4c}
#gd-notice .gd-note-what{margin-top:7px;font:italic 400 18px/1.25 'Cormorant Garamond','Times New Roman',serif;color:#2b1c13}
#gd-notice .gd-note-nos{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:24px}
#gd-notice .gd-note-no{display:inline-flex;align-items:center;gap:8px;padding:7px 14px 7px 8px;border:1px solid rgba(43,28,19,.55);border-radius:999px;background:#fffdfa}
#gd-notice .gd-note-noic{display:block;width:28px;height:28px;color:#7a2e22}
#gd-notice .gd-note-noic .gd-no-ring,#gd-notice .gd-note-noic .gd-no-slash{stroke:#9b3a2b;stroke-width:1.4}
#gd-notice .gd-note-notxt{font:600 11px/1 'Cinzel','Times New Roman',serif;letter-spacing:.2em;padding-left:.2em;color:#2b1c13;white-space:nowrap}
#gd-notice .gd-note-kids{margin-top:20px;padding-top:16px;border-top:1px solid rgba(164,140,105,.35);text-align:center;color:#3a2716}
#gd-notice .gd-note-moon{display:block;width:26px;height:26px;margin:0 auto 6px;color:#a48c69}
#gd-notice .gd-note-kids p{font:400 19px/1.6 'Amiri','Traditional Arabic',serif;letter-spacing:0;direction:rtl}
#gd-notice .gd-note-kids .gd-note-kids2{margin-top:4px;font-size:17px;color:#5d4a37}
#gd-notice .gd-note-kids b{font:700 21px/1.6 'Aref Ruqaa','Amiri',serif;color:#8a6430}
/* الدخول لما الكارت يبان */
#gd-notice.armed .gd-note-card{opacity:0;transform:translateY(26px)}
#gd-notice.armed .gd-note-card>*{opacity:0;transform:translateY(10px)}
#gd-notice.armed .gd-no-ring{stroke-dasharray:66;stroke-dashoffset:66}
#gd-notice.armed .gd-no-slash{stroke-dasharray:21;stroke-dashoffset:21}
#gd-notice.in .gd-note-card{animation:gdNoteUp 1.1s cubic-bezier(.2,.75,.2,1) forwards}
#gd-notice.in .gd-note-card>*{animation:gdNoteUp .9s cubic-bezier(.2,.75,.2,1) forwards}
#gd-notice.in .gd-note-card>:nth-child(2){animation-delay:.15s}#gd-notice.in .gd-note-card>:nth-child(3){animation-delay:.25s}
#gd-notice.in .gd-note-card>:nth-child(4){animation-delay:.35s}#gd-notice.in .gd-note-card>:nth-child(5){animation-delay:.5s}
#gd-notice.in .gd-note-card>:nth-child(6){animation-delay:.75s}#gd-notice.in .gd-note-card>:nth-child(7){animation-delay:.9s}
#gd-notice.in .gd-no-ring{animation:gdDraw .7s ease-out 1.15s forwards}
#gd-notice.in .gd-no-slash{animation:gdDraw .45s ease-out 1.7s forwards}
@keyframes gdNoteUp{to{opacity:1;transform:none}}
@keyframes gdDraw{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){#gd-notice.armed .gd-note-card,#gd-notice.armed .gd-note-card>*{opacity:1;transform:none;animation:none}#gd-notice.armed .gd-no-ring,#gd-notice.armed .gd-no-slash{stroke-dashoffset:0;animation:none}}
`;

// بيتحط قبل قسم تأكيد الحضور (ولو مقفول: قبل الختام)
const NOTE_SCRIPT = `(function(){
var HTML=${JSON.stringify(NOTE_HTML).replace(/</g, '\\u003c')};
function put(){
  if(document.getElementById('gd-notice'))return true;
  // قبل قسم تأكيد الحضور (بطلب المالك) — ولو الفورم مقفول من المحرر: قبل الختام
  var wrap=document.getElementById('rsvp-wrap');
  var closing=document.getElementById('rec2442651163');
  var anchor=wrap&&getComputedStyle(wrap).display!=='none'?wrap:(closing&&getComputedStyle(closing).display!=='none'?closing:null);
  if(!anchor)return false;
  var n=document.createElement('section');n.id='gd-notice';n.setAttribute('aria-label','Dress code');n.innerHTML=HTML;
  anchor.parentNode.insertBefore(n,anchor);
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce&&'IntersectionObserver' in window&&!(window.WEDDING_CONFIG||{}).autoOpen){
    n.classList.add('armed');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){n.classList.add('in');io.disconnect();}});},{threshold:.2});
    io.observe(n);
  }
  return true;
}
// إيد بتخربش + "SCRATCH HERE" فوق كروت التاريخ — بيختفوا أول ما الضيف يلمس الكروت
function hand(){
  var tiles=document.querySelector('#hv-hero .hv-tiles');
  if(!tiles||tiles.querySelector('.gd-scratch-hand')||(window.WEDDING_CONFIG||{}).autoOpen)return;
  var h=document.createElement('span');h.className='gd-scratch-hand';h.setAttribute('aria-hidden','true');
  h.innerHTML='<svg viewBox="0 0 24 24" fill="#fffaf0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v1"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>';
  var t=document.createElement('span');t.className='gd-scratch-tag';t.textContent='SCRATCH HERE';
  tiles.appendChild(h);tiles.appendChild(t);
  function off(){h.classList.add('off');t.classList.add('off');}
  ['pointerdown','touchstart','mousedown'].forEach(function(ev){tiles.addEventListener(ev,off,{once:true,passive:true});});
}
function tick(){try{put()}catch(e){}try{hand()}catch(e){}}
tick();document.addEventListener('DOMContentLoaded',tick);window.addEventListener('load',tick);
var k=0,t=setInterval(function(){tick();if(++k>20)clearInterval(t)},300);
})();`;

module.exports = {
  shortId: 'GrpUVQq',

  // كارت المشاركة (واتساب/إنستجرام/فيسبوك): لقطة من فيديو الدعوة (الطرحة
  // مفرودة) في إطار ورق + الأسامي والمكان (من غير تاريخ — مفاجأة) — share-v3.jpg (1200×630،
  // اتعمل في scratch door/share/card.js). بيكسب على أي صورة مشاركة في المحرر
  // (overrideImage) لأن المالك هو اللي طالبه. لو اتغيّر: اسم ملف جديد (v2)
  // عشان واتساب مايفضلش عارض القديم من الكاش.
  share: {
    title: 'Yara & Sherif — Wedding Invitation',
    description: 'Together with their families, Yara & Sherif invite you to celebrate their wedding · Casa Maria Venue, Obour — open the door to discover the date ✨',
    image: `${BASE}/share-v3.jpg`,
    width: 1200,
    height: 630,
    overrideImage: true,
  },

  /** الباب بيظهر للضيوف بس — في المحرر الدعوة بتتعرض من غيره، بس الفيديو والأغنية موجودين في الاتنين */
  render({ editMode }) {
    const film = { css: `<style id="gd-film-style">${FILM_CSS}${NOTE_CSS}</style>`, js: `<script id="gd-film-script">${FILM_SCRIPT}</script><script id="gd-note-script">${NOTE_SCRIPT}</script>` };
    if (editMode) return { head: film.css, bodyEnd: film.js };
    return {
      head: `<link rel="preload" as="image" href="${BASE}/gate-left.webp"><link rel="preload" as="image" href="${BASE}/gate-right.webp"><link rel="preload" as="image" href="${BASE}/gate-frame.webp"><style id="gd-style">${CSS}</style>${film.css}`,
      bodyStart: HTML,
      bodyEnd: `<script id="gd-script">${SCRIPT}</script>${film.js}`,
    };
  },
};
