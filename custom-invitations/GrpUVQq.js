// custom-invitations/GrpUVQq.js
// دعوة مخصوصة لعميل (Yara & Shrief — قالب Champagne Lace إنجليزي) بطلب المالك:
// بدل الظرف والختم في أول الدعوة، باب خشب (صورة العميل) بيتقسم نصين
// وبيتفتح لبره، ومكتوب عليه "Open the Door".
//
// الشكل بس اللي هنا — الأسامي والميعاد والمكان والـ dress code متخزّنين في
// الدعوة نفسها (utils/oneOffFixes.js: GrpUVQq-yara-shrief)، فالعميل يقدر
// يعدّلهم من المحرر عادي. الباب مش بيظهر في المحرر.
//
// الصورة اتقسمت (scratchpad door/mask*.js): الحيطة والقوس ثابتين (frame.webp
// بفتحة شفافة مكان الباب)، والضلفتين صورتين لوحدهم (leaf-left/right.webp).
// المقاسات بوحدات الصورة الأصلية 576×1024:
//   الضلفة الشمال من x=21 لحد الفاصل x=281، واليمين من 281 لحد 542.
//   الحلقتين (المقابض) عند (226,572) و (337,572).
//
// الفتح: ضغطة على الباب ← الكلام بيختفي، الضلفتين بيلفّوا لبره (ناحية اللي
// بيتفرّج) والنور بيدخل من الباب، والكاميرا بتدخل من الباب لحد ما الدعوة
// تبان. وفي نفس الضغطة بنضغط الختم الأصلي (مستخبي) عشان المزيكا وحركة
// الكارت الأول يشتغلوا بنفس توقيتهم بالظبط.

const BASE = '/custom/GrpUVQq';
const COVER_REC = 'rec2442650973'; // غلاف الظرف في القالب (views/champagne-lace.html)

const CSS = `
#${COVER_REC} .t396__artboard,#${COVER_REC} .t396__artboard *{visibility:hidden!important;pointer-events:none!important;opacity:0!important}
html.gd-lock,html.gd-lock body{overflow:hidden!important;height:100%}
#gd-door{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;outline:none;background:#140b08;transition:background-color .5s ease}
#gd-door .gd-bg{position:absolute;inset:-40px;background:url(${BASE}/bg.jpg) center/cover;filter:blur(26px) brightness(.55) saturate(1.1)}
/* على الشاشات العريضة الخلفية على الجنبين بس — مكان الباب نفسه فاضي عشان الدعوة تبان من الفتحة */
@media (min-aspect-ratio:5/8){#gd-door .gd-bg{inset:0;filter:none;background:none}#gd-door .gd-bg::before,#gd-door .gd-bg::after{content:"";position:absolute;top:-40px;bottom:-40px;width:calc(50% - 28.125vh + 40px);background:url(${BASE}/bg.jpg) center/cover;filter:blur(26px) brightness(.55) saturate(1.1)}#gd-door .gd-bg::before{left:-40px}#gd-door .gd-bg::after{right:-40px}}
#gd-door .gd-stage{position:absolute;left:50%;top:0;width:max(100vw,56.25vh);aspect-ratio:576/1024;transform:translateX(-50%);perspective:115cqw;perspective:760px;container-type:inline-size}
@supports (height:100dvh){#gd-door .gd-stage{width:max(100vw,56.25dvh)}}
@media (min-aspect-ratio:5/8){#gd-door .gd-stage{width:56.25vh}@supports (height:100dvh){#gd-door .gd-stage{width:56.25dvh}}}
#gd-door .gd-cam{position:absolute;inset:0;transform-origin:50% 56%;transform-style:preserve-3d}
#gd-door img{position:absolute;display:block;user-select:none;-webkit-user-drag:none;pointer-events:none}
#gd-door .gd-light{position:absolute;left:3.6%;width:90.6%;top:0;height:100%;opacity:0;
  background:radial-gradient(ellipse 55% 45% at 50% 58%,rgba(255,246,228,.95),rgba(255,226,182,.55) 45%,rgba(255,214,160,0) 75%)}
#gd-door .gd-frame{left:0;top:0;width:100%;height:100%;z-index:2}
#gd-door .gd-leaf{position:absolute;top:0;height:100%;z-index:3;transform-style:preserve-3d;backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform}
#gd-door .gd-leaf img{inset:0;width:100%;height:100%}
#gd-door .gd-l{left:3.6458%;width:45.1389%;transform-origin:0 50%}
#gd-door .gd-r{left:48.7847%;width:45.3125%;transform-origin:100% 50%}
#gd-door .gd-shade{position:absolute;inset:0;opacity:0;pointer-events:none}
#gd-door .gd-l .gd-shade{background:linear-gradient(90deg,rgba(0,0,0,.05),rgba(0,0,0,.55))}
#gd-door .gd-r .gd-shade{background:linear-gradient(270deg,rgba(0,0,0,.05),rgba(0,0,0,.55))}
#gd-door .gd-l::after,#gd-door .gd-r::after{content:"";position:absolute;top:0;bottom:0;width:2px;opacity:0;background:linear-gradient(180deg,transparent,rgba(255,232,190,.9) 30%,rgba(255,232,190,.9) 70%,transparent)}
#gd-door .gd-l::after{right:0}#gd-door .gd-r::after{left:0}
#gd-door .gd-ring{position:absolute;z-index:4;width:6.4%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);top:55.9%;
  border:1px solid rgba(240,206,140,.55);animation:gdRing 2.6s ease-out infinite}
#gd-door .gd-ring.l{left:39.2%}#gd-door .gd-ring.r{left:58.5%;animation-delay:.25s}
@keyframes gdRing{0%{transform:translate(-50%,-50%) scale(.9);opacity:0;box-shadow:0 0 6px rgba(255,214,140,.5)}20%{opacity:1}100%{transform:translate(-50%,-50%) scale(2.1);opacity:0;box-shadow:0 0 14px rgba(255,214,140,0)}}
#gd-door .gd-text{position:absolute;inset:0;z-index:5;pointer-events:none;color:#f3dfb4;text-align:center;opacity:0;transition:opacity .45s ease,filter .45s ease,transform .6s ease}
#gd-door.gd-ready .gd-text{opacity:1}
#gd-door .gd-top{position:absolute;left:8%;right:8%;top:19%;padding:3.2cqw 0 3.6cqw;
  background:radial-gradient(ellipse 60% 62% at 50% 50%,rgba(20,8,4,.62),rgba(20,8,4,0) 75%)}
#gd-door .gd-names{font:400 12.2cqw/1.08 'Pinyon Script','Cormorant Garamond',cursive;letter-spacing:0;
  background:linear-gradient(180deg,#fff1cf,#e3bd76 55%,#b8893f);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 .5cqw 1.2cqw rgba(0,0,0,.6))}
#gd-door .gd-date{margin-top:2.2cqw;font:500 3.3cqw/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.55em;text-indent:.55em;color:#ead1a0;text-shadow:0 1px 6px rgba(0,0,0,.8)}
#gd-door .gd-bottom{position:absolute;left:10%;right:10%;top:66.5%;padding:3.6cqw 0;
  background:radial-gradient(ellipse 62% 70% at 50% 50%,rgba(20,8,4,.66),rgba(20,8,4,0) 76%)}
#gd-door .gd-open{display:inline-flex;align-items:center;gap:2.6cqw;white-space:nowrap;font:500 4.4cqw/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.34em;text-indent:.34em;color:#f6e3b8;text-shadow:0 1px 8px rgba(0,0,0,.85);
  animation:gdBreath 2.4s ease-in-out infinite}
#gd-door .gd-open::before,#gd-door .gd-open::after{content:"";width:6cqw;height:1px;background:linear-gradient(90deg,transparent,#e3bd76)}
#gd-door .gd-open::after{transform:scaleX(-1)}
#gd-door .gd-hint{margin-top:2.6cqw;font:italic 400 3.6cqw/1 'Cormorant Garamond',serif;letter-spacing:.06em;color:rgba(240,220,180,.82);text-shadow:0 1px 6px rgba(0,0,0,.8)}
@keyframes gdBreath{0%,100%{opacity:.82;transform:translateY(0)}50%{opacity:1;transform:translateY(-.5cqw)}}
/* ===== الفتح ===== */
#gd-door.go{cursor:default;background-color:transparent}
#gd-door.go .gd-text,#gd-door.go.gd-ready .gd-text{opacity:0;filter:blur(6px);transform:scale(1.04)}
#gd-door.go .gd-ring{animation:none;opacity:0;transition:opacity .3s}
#gd-door.go .gd-l{animation:gdOpenL 2.3s cubic-bezier(.42,.04,.26,1) .25s forwards}
#gd-door.go .gd-r{animation:gdOpenR 2.3s cubic-bezier(.42,.04,.26,1) .25s forwards}
#gd-door.go .gd-shade{animation:gdShade 2.3s ease-in .25s forwards}
#gd-door.go .gd-l::after,#gd-door.go .gd-r::after{animation:gdEdge 1.1s ease-out .3s forwards}
#gd-door.go .gd-light{animation:gdLight 2.1s ease-in-out .35s forwards}
#gd-door.go .gd-cam{animation:gdCam 2.1s cubic-bezier(.5,0,.3,1) 1s forwards}
#gd-door.go .gd-frame{animation:gdFade 1s ease-in 1.9s forwards}
#gd-door.go .gd-bg{animation:gdFade 1s ease-in 1.9s forwards}
#gd-door.go.gd-out{opacity:0;transition:opacity .5s ease}
#gd-door.gd-done{display:none}
@keyframes gdOpenL{0%{transform:rotateY(0)}14%{transform:rotateY(-7deg)}100%{transform:rotateY(-98deg)}}
@keyframes gdOpenR{0%{transform:rotateY(0)}14%{transform:rotateY(7deg)}100%{transform:rotateY(98deg)}}
@keyframes gdShade{0%{opacity:0}100%{opacity:1}}
@keyframes gdEdge{0%{opacity:0}35%{opacity:1}100%{opacity:0}}
@keyframes gdLight{0%{opacity:0}35%{opacity:1}100%{opacity:0}}
@keyframes gdCam{0%{transform:scale(1)}100%{transform:scale(1.75)}}
@keyframes gdFade{to{opacity:0}}
@media (prefers-reduced-motion:reduce){
  #gd-door .gd-ring,#gd-door .gd-open{animation:none}
  #gd-door.go .gd-l,#gd-door.go .gd-r,#gd-door.go .gd-cam,#gd-door.go .gd-light,#gd-door.go .gd-shade,#gd-door.go .gd-frame{animation:none}
  #gd-door.go{opacity:0;transition:opacity .6s ease}
}
`;

const HTML = `<div id="gd-door" role="button" tabindex="0" aria-label="Open the door">
<div class="gd-bg"></div>
<div class="gd-stage"><div class="gd-cam">
<div class="gd-light"></div>
<img class="gd-frame" src="${BASE}/frame.webp" alt="" fetchpriority="high">
<div class="gd-leaf gd-l"><img src="${BASE}/leaf-left.webp" alt="" fetchpriority="high"><i class="gd-shade"></i></div>
<div class="gd-leaf gd-r"><img src="${BASE}/leaf-right.webp" alt="" fetchpriority="high"><i class="gd-shade"></i></div>
<span class="gd-ring l"></span><span class="gd-ring r"></span>
<div class="gd-text">
<div class="gd-top"><div class="gd-names" id="gd-names">Yara &amp; Shrief</div><div class="gd-date" id="gd-date">09 · 11 · 2026</div></div>
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
  var cd=C.countdown;if(cd&&cd.year){var p=function(n){return(n<10?'0':'')+n};document.getElementById('gd-date').textContent=p(cd.day)+' · '+p(cd.monthIndex+1)+' · '+cd.year;}
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
  setTimeout(function(){var h=document.getElementById('hv-hero');if(h)h.classList.add('hv--play');},1350);
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(function(){door.classList.add('gd-out')},reduce?0:2650);
  setTimeout(finish,reduce?650:3150);
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
   +'<div class="gd-film-card"><div class="gd-film-win"><img src="${BASE}/memories-poster.webp" alt="" loading="lazy">'
   +'<video muted loop playsinline preload="metadata" poster="${BASE}/memories-poster.webp" aria-label="Yara and Shrief"><source src="${BASE}/memories.mp4" type="video/mp4"></video>'
   +'<div class="gd-film-curtain"></div><div class="gd-film-sheen"></div></div></div>';
  st.appendChild(w);
  var v=w.querySelector('video');v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
  function play(){var p=v.play();if(p&&p.catch)p.catch(function(){});}
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){w.classList.add('in');play();}else{try{v.pause()}catch(x){}}
    });},{threshold:.25}).observe(w);
  }else{w.classList.add('in');play();}
}
function all(){try{song();film();}catch(e){}}
all();document.addEventListener('DOMContentLoaded',all);window.addEventListener('load',all);
var n=0,t=setInterval(function(){all();if(++n>20)clearInterval(t)},300);
})();`;

module.exports = {
  shortId: 'GrpUVQq',

  /** الباب بيظهر للضيوف بس — في المحرر الدعوة بتتعرض من غيره، بس الفيديو والأغنية موجودين في الاتنين */
  render({ editMode }) {
    const film = { css: `<style id="gd-film-style">${FILM_CSS}</style>`, js: `<script id="gd-film-script">${FILM_SCRIPT}</script>` };
    if (editMode) return { head: film.css, bodyEnd: film.js };
    return {
      head: `<link rel="preload" as="image" href="${BASE}/leaf-left.webp"><link rel="preload" as="image" href="${BASE}/leaf-right.webp"><link rel="preload" as="image" href="${BASE}/frame.webp"><style id="gd-style">${CSS}</style>${film.css}`,
      bodyStart: HTML,
      bodyEnd: `<script id="gd-script">${SCRIPT}</script>${film.js}`,
    };
  },
};
