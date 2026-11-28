// دعوة NgGrwc8 (قالب Ivory Swans) — فتحة بفيديو المالك (2026-11-28): ظرف أرابيسك عاجي بختم دهبي
// "بسم الله الرحمن الرحيم"، فراشات بترفرف وورق شجر بينزل، ولما الضيف يدوس القلاب اللي فوق بيطلع بالختم والجنبين
// بيتطووا ويبان جوه الظرف — نفس الفيديو اللي بعته بالظبط (WhatsApp 3 ثواني 360x640 10fps → 30fps).
// (أول محاولة كانت ظرف متقسّم قطع متحركة بالكود — المالك رفضها: "شكلها سيء جدا".)
//  • idle.mp4: الجزء المقفول من الفيديو (1.1 ث) بلفّة ناعمة (آخره بيدخل في أوله) — بيلف لحد ما الضيف يدوس.
//  • open.mp4: الفتحة نفسها. الضيف يدوس → بتبدأ فوق المقفول بانتقال 0.2 ث، وفي نفس اللحظة بيدوس زرار فتح القالب
//    (.popup-enter) فالموسيقى وحركة الدعوة والنزول التلقائي شغالين زي ما هم؛ آخر الفتحة الغطا بيختفي بهدوء.
// مش بيظهر في المحرر ولا في وضع الفتح التلقائي. الملفات في client/public/custom/NgGrwc8/ (scratch ngv/).
const { asset } = require('./_asset');

const SHORT = 'NgGrwc8';
const DIR = `/custom/${SHORT}/`;
const A = (f) => asset(DIR + f);
const AR = 0.5625; // 9:16

const HEAD = `<link rel="preload" as="image" href="${A('poster.webp')}">
<style id="ng-css">
#ngCover{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#ece6dc;-webkit-tap-highlight-color:transparent;cursor:pointer}
#ngCover.done{opacity:0;transition:opacity .8s ease;pointer-events:none}
#ngCover .ng-stage{position:absolute;left:50%;top:50%;width:max(100vw,calc(100vh * ${AR}));aspect-ratio:9/16;transform:translate(-50%,-50%);background:#ece6dc url("${A('poster.webp')}") center/cover no-repeat}
@supports (height:100dvh){#ngCover .ng-stage{width:max(100vw,calc(100dvh * ${AR}))}}
#ngCover video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
#ngCover .ng-open{opacity:0;transition:opacity .2s linear}
#ngCover.go .ng-open{opacity:1}
#rec2443433693 .t396__elem{opacity:0!important}
.birds-fly-layer,.wg-bird{display:none!important}
</style>`;

const COVER = `<div id="ngCover" role="button" tabindex="0" aria-label="افتح الدعوة"><div class="ng-stage">
<video class="ng-idle" src="${A('idle.mp4')}" poster="${A('poster.webp')}" muted playsinline webkit-playsinline loop autoplay preload="auto"></video>
<video class="ng-open" src="${A('open.mp4')}" muted playsinline webkit-playsinline preload="auto"></video>
</div></div>`;

const SCRIPT = `<script>(function(){
var C=window.WEDDING_CONFIG||{};var cv=document.getElementById('ngCover');if(!cv)return;
if(C.autoOpen||/[?&]edit=1/.test(location.search)){cv.parentNode.removeChild(cv);return}
var idle=cv.querySelector('.ng-idle'),op=cv.querySelector('.ng-open'),opened=0,t0=performance.now();
var tryPlay=function(v){try{var p=v.play();if(p&&p.catch)p.catch(function(){})}catch(e){}};
tryPlay(idle);
function finish(){if(cv.classList.contains('done'))return;cv.classList.add('done');setTimeout(function(){if(cv.parentNode)cv.parentNode.removeChild(cv)},900)}
function open(){if(opened)return;opened=1;
 var go=function(){var b=document.querySelector('.popup-enter');try{if(b)b.click()}catch(e){}};
 if(document.readyState==='loading'||performance.now()-t0<400)setTimeout(go,450);else go();
 try{op.currentTime=0}catch(e){}
 tryPlay(op);cv.classList.add('go');
 op.addEventListener('ended',finish);
 setTimeout(function(){try{idle.pause()}catch(e){}},260);
 /* لو الفيديو ماشتغلش لأي سبب، الدعوة تفتح برضه */
 setTimeout(finish,(op.duration&&isFinite(op.duration)?op.duration*1000:1500)+900)}
cv.addEventListener('click',open);cv.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
})();</script>`;

module.exports = {
  shortId: SHORT,

  render({ editMode } = {}) {
    if (editMode) return {};
    return { head: HEAD, bodyEnd: COVER + SCRIPT };
  },
};
