// دعوة NgGrwc8 (قالب Ivory Swans) — فتحة جديدة بطلب المالك (2026-11-28): الظرف بتاعه (أرابيسك عاجي بختم دهبي
// "بسم الله الرحمن الرحيم") مكان ظرف القالب، بنفس التفاصيل بالظبط:
//  • الظرف متقسّم من صورة المالك النضيفة لـ 4 قطع (القلاب اللي فوق بحوافه المموجة، الجنبين، والقلاب اللي تحت) + الختم.
//  • فراشات بترفرف وتتحرك حوالين مكانها، وورق شجر بينزل ويلف ببطء طول ما الظرف مقفول.
//  • لما الضيف يدوس: الختم بيكبر ويختفي، القلابات بتتفتح (فوق لفوق، الجنبين للجنب، تحت لتحت)، الفراشات بتطير،
//    والورق بيكمّل نزول فوق الدعوة. وفي نفس اللحظة بيدوس على زرار فتح القالب نفسه (.popup-enter) فالموسيقى
//    وحركة الدعوة والنزول التلقائي بيشتغلوا زي ما هم.
// مش بيظهر في المحرر ولا في وضع الفتح التلقائي. الصور في client/public/custom/NgGrwc8/ (scratch ng/).
const { asset } = require('./_asset');
const C = require('./NgGrwc8-cover.json');

const SHORT = 'NgGrwc8';
const DIR = `/custom/${SHORT}/`;
const A = (f) => asset(DIR + f);
const pct = (v, t) => `${((v / t) * 100).toFixed(4)}%`;
const box = (b) => `left:${pct(b.x, C.W)};top:${pct(b.y, C.H)};width:${pct(b.w, C.W)};`;

// الفراشات: [sprite, x, y (مركز، px على اللوحة 1.5x), حجم نسبي, قلب أفقي, فلتر لون]
const FLY = [
  ['b-orange', 1033, 108, 1, 0, ''],
  ['b-pink', 414, 230, 1, 0, ''],
  ['b-pink', 507, 338, 0.92, 1, 'hue-rotate(95deg) saturate(.8)'],
  ['b-orange', 328, 452, 0.86, 1, 'hue-rotate(-12deg) saturate(.75) brightness(1.04)'],
  ['b-pink', 942, 464, 0.84, 0, 'hue-rotate(115deg) saturate(.7)'],
];
// ورق الشجر: [sprite, x, y, حجم, سرعة نزول px/s على اللوحة, دوران]
const LEAVES = [
  ['l-2', 1196, 1020, 1, 46, 20], ['l-3', 297, 1172, 1, 40, -15], ['l-4', 1009, 1654, 1, 52, 12],
  ['l-5', 488, 1903, 1, 44, -18], ['l-6', 852, 2380, 0.95, 50, 16], ['l-2', 1360, 780, 0.7, 36, -10],
];

const HEAD = `<link rel="preload" as="image" href="${A('env-top.webp')}"><link rel="preload" as="image" href="${A('env-bottom.webp')}">
<style id="ng-css">
#ngCover{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#efe8dc;-webkit-tap-highlight-color:transparent;cursor:pointer;transition:background-color .6s ease}
#ngCover.go{background-color:transparent;pointer-events:none}
#ngCover.done{opacity:0;transition:opacity .7s ease}
.ng-stage{position:absolute;left:50%;top:50%;width:max(100vw,calc(100vh * ${(C.W / C.H).toFixed(5)}));aspect-ratio:${C.W}/${C.H};transform:translate(-50%,-50%);perspective:1600px}
@supports (height:100dvh){.ng-stage{width:max(100vw,calc(100dvh * ${(C.W / C.H).toFixed(5)}))}}
.ng-stage img{position:absolute;display:block;height:auto;max-width:none;user-select:none;-webkit-user-select:none;pointer-events:none;-webkit-user-drag:none}
.ng-p{will-change:transform;transition:transform 1.25s cubic-bezier(.65,0,.25,1),opacity 1.25s ease}
.ng-top{z-index:4;transform-origin:50% 0;filter:drop-shadow(0 6px 8px rgba(110,90,60,.18))}
.ng-bottom{z-index:3}.ng-left,.ng-right{z-index:2}
.ng-seal{z-index:6;filter:drop-shadow(0 5px 7px rgba(90,64,20,.38)) drop-shadow(0 1px 1px rgba(90,64,20,.3));animation:ngPulse 2.6s ease-in-out infinite;transition:transform .55s cubic-bezier(.3,1.4,.5,1),opacity .45s ease .12s}
@keyframes ngPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
.ng-leaf{z-index:7;filter:drop-shadow(10px 22px 9px rgba(80,60,40,.28));will-change:transform}
.ng-fly{z-index:8;filter:drop-shadow(8px 26px 10px rgba(80,60,40,.22));will-change:transform}
#ngCover.go .ng-seal{animation:none;transform:scale(1.22);opacity:0}
#ngCover.go .ng-top{transform:translateY(-112%) rotateX(38deg);transition-delay:.25s}
#ngCover.go .ng-left{transform:translateX(-108%);transition-delay:.42s}
#ngCover.go .ng-right{transform:translateX(108%);transition-delay:.42s}
#ngCover.go .ng-bottom{transform:translateY(106%);transition-delay:.5s}
@media (prefers-reduced-motion:reduce){.ng-seal{animation:none}}
#rec2443433693 .t396__elem{opacity:0!important}
.birds-fly-layer,.wg-bird{display:none!important}
</style>`;

function coverHtml() {
  const P = C.pieces;
  const pieces = ['left', 'right', 'bottom', 'top'].map((k) => `<img class="ng-p ng-${k}" src="${A(`env-${k}.webp`)}" alt="" draggable="false" style="${box(P[k])}" decoding="async">`).join('');
  const seal = `<img class="ng-seal" src="${A('seal.webp')}" alt="" draggable="false" style="${box(C.seal)}">`;
  const sp = C.sprites;
  const leaves = LEAVES.map(([n, x, y, s], i) => {
    const b = sp[n]; const w = b.w * s;
    return `<img class="ng-leaf" data-i="${i}" src="${A(n + '.webp')}" alt="" draggable="false" style="left:${pct(x - w / 2, C.W)};top:${pct(y - (b.h * s) / 2, C.H)};width:${pct(w, C.W)}">`;
  }).join('');
  const flies = FLY.map(([n, x, y, s, flip, f], i) => {
    const b = sp[n]; const w = b.w * s;
    return `<img class="ng-fly" data-i="${i}" data-flip="${flip}" src="${A(n + '.webp')}" alt="" draggable="false" style="left:${pct(x - w / 2, C.W)};top:${pct(y - (b.h * s) / 2, C.H)};width:${pct(w, C.W)}${f ? `;--f:${f}` : ''}">`;
  }).join('');
  return `<div id="ngCover" role="button" tabindex="0" aria-label="افتح الدعوة"><div class="ng-stage">${pieces}${seal}${leaves}${flies}</div></div>`;
}

function script() {
  const cfg = JSON.stringify({ W: C.W, H: C.H, leaves: LEAVES.map((l) => ({ y: l[2], v: l[4], r: l[5] })) });
  return `<script>(function(){
var K=${cfg};var C=window.WEDDING_CONFIG||{};var cv=document.getElementById('ngCover');if(!cv)return;
if(C.autoOpen||/[?&]edit=1/.test(location.search)){cv.parentNode.removeChild(cv);return}
var st=cv.querySelector('.ng-stage');var leaves=[].slice.call(cv.querySelectorAll('.ng-leaf'));var flies=[].slice.call(cv.querySelectorAll('.ng-fly'));
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var t0=performance.now(),opened=0,openAt=0,raf=0;
var ph=flies.map(function(_,i){return {a:Math.random()*6.28,b:Math.random()*6.28,w:7+Math.random()*3,dx:(i%2?1:-1)*(0.6+Math.random()*.5),dy:-(1.1+Math.random()*.6)}});
var lp=leaves.map(function(_,i){return {s:Math.random()*6.28,o:0}});
function frame(now){var t=(now-t0)/1000;var sc=st.getBoundingClientRect().height/K.H;
 leaves.forEach(function(el,i){var L=K.leaves[i];var fall=(L.v*t)%(K.H+520);var y=fall;var top0=L.y;if(top0+y>K.H+260)y-=K.H+520;
  var sway=Math.sin(t*0.9+lp[i].s)*38;var rot=L.r*Math.sin(t*0.7+lp[i].s)+t*L.r*0.6;var flipY=0.75+0.25*Math.cos(t*1.3+lp[i].s);
  el.style.transform='translate('+(sway*sc).toFixed(1)+'px,'+(y*sc).toFixed(1)+'px) rotate('+rot.toFixed(1)+'deg) scaleY('+flipY.toFixed(3)+')'});
 flies.forEach(function(el,i){var p=ph[i];var flip=el.getAttribute('data-flip')==='1'?-1:1;var x=Math.sin(t*0.55+p.a)*26,y=Math.sin(t*0.8+p.b)*18;
  if(opened){var e=(now-openAt)/1000;x+=p.dx*e*e*260;y+=p.dy*e*e*300}
  var wing=0.62+0.38*Math.abs(Math.cos(t*p.w));
  el.style.transform='translate('+(x*sc).toFixed(1)+'px,'+(y*sc).toFixed(1)+'px) scaleX('+(flip*wing).toFixed(3)+') rotate('+(Math.sin(t*0.8+p.a)*6).toFixed(1)+'deg)';
  var f=el.style.getPropertyValue('--f');if(f&&!el.__f){el.style.filter=f+' drop-shadow(8px 26px 10px rgba(80,60,40,.22))';el.__f=1}});
 raf=requestAnimationFrame(frame)}
if(!reduce)raf=requestAnimationFrame(frame);
function open(){if(opened)return;opened=1;openAt=performance.now();
 var go=function(){var b=document.querySelector('.popup-enter');try{if(b)b.click()}catch(e){}};
 /* زرار القالب بيتربط بعد ما الصفحة تجهز بشوية — لو الضيف داس بدري جدًا نستنى لحظة */
 if(document.readyState==='loading'||performance.now()<400)setTimeout(go,450);else go();
 cv.classList.add('go');
 setTimeout(function(){cv.classList.add('done')},2300);
 setTimeout(function(){cancelAnimationFrame(raf);if(cv.parentNode)cv.parentNode.removeChild(cv)},3100)}
cv.addEventListener('click',open);cv.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
})();</script>`;
}

module.exports = {
  shortId: SHORT,

  render({ editMode } = {}) {
    if (editMode) return {};
    return { head: HEAD, bodyEnd: coverHtml() + script() };
  },
};
