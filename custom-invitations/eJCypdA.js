// دعوة eJCypdA (Lily Garden — Omar & Dalia) — بطلب المالك:
// الختم اللي بيفتح الدعوة: الحرفين بالعربي (ع و د متشابكين، مقصوصين من صورة
// البروش اللي بعتها المالك) منقوشين بارزين بنفس أخضر الإكليل مكان "OR"
// (custom/eJCypdA/seal.webp)، وتحت الختم "Tap to open".
// الختم بيتبدّل بس لو صاحب الدعوة لسه على ختم OR (أو ختم القالب) — لو غيّره
// من المحرر بعد كده، اختياره هو اللي بيظهر.
const { asset } = require('./_asset');

const SEAL = asset('/custom/eJCypdA/seal.webp');
const OLD = ['v5rlrcu2du1h4e4zld8h', '/templates/lily-garden/seal.webp'];

const CSS = `
.ej-tap{position:absolute;left:50%;top:calc(100% + 10px);transform:translateX(-50%);white-space:nowrap;pointer-events:none;
  display:flex;align-items:center;gap:10px;font:italic 500 17px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.22em;color:#5b6b3f;
  text-shadow:0 1px 0 rgba(255,255,255,.6);animation:ejTap 2.4s ease-in-out infinite}
.ej-tap i{width:22px;height:1px;background:#8a9a6a}
html[dir="rtl"] .ej-tap,.ej-tap.ar{font:700 17px/1 'Amiri',serif;letter-spacing:0;font-style:normal}
.ej-tap.ej-off{opacity:0!important;animation:none;transition:opacity .3s ease}
/* السطر المضاف جوه بلوك المكان: نفس خط العنوان، في مكانه الطبيعي */
.ej-inflow{position:static!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;transform:none!important;translate:none!important;
  width:auto!important;max-width:100%!important;margin:2.6cqw 0 0!important;text-align:center!important;white-space:normal!important;
  font-family:'Cormorant Garamond','Amiri',Georgia,serif!important;font-weight:600!important;font-size:4.9cqw!important;line-height:1.2!important}
.ej-inflow *{font:inherit!important;position:static!important;transform:none!important}
@keyframes ejTap{0%,100%{opacity:.65}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.ej-tap{animation:none}}
`;

const script = (label, moveAdded, quote) => `(function(){
var MOVE=${JSON.stringify(moveAdded || '')}, QUOTE=${JSON.stringify(quote || '')};
var SEAL=${JSON.stringify(SEAL)}, OLD=${JSON.stringify(OLD)}, LABEL=${JSON.stringify(label)};
// أول ما الضيف يضغط الختم الكلمة بتختفي (الختم بيفضل في الصفحة بعد الفتح) — حتى لو ضغط قبل ما الكلمة تتحط
var OPENED=false;
document.addEventListener('click',function(e){ if(e.target.closest && e.target.closest('[data-elem-id="1773847037346"]')){ OPENED=true; var t=document.querySelector('.ej-tap'); if(t) t.classList.add('ej-off'); } },true);
function swap(img){
  var cur=(img.getAttribute('src')||'')+' '+(img.getAttribute('srcset')||'');
  if(cur.indexOf(SEAL)<0 && OLD.some(function(o){return cur.indexOf(o)>=0;})){ img.removeAttribute('srcset'); img.setAttribute('data-original',SEAL); img.src=SEAL; }
}
function put(){
  var bl=document.getElementById('birds-fly-layer'); if(bl && bl.classList.contains('birds-open')){ OPENED=true; var tt=document.querySelector('.ej-tap'); if(tt) tt.classList.add('ej-off'); }
  var el=document.querySelector('[data-elem-id="1773847037346"]'); if(!el) return false;
  var img=el.querySelector('img');
  if(img){
    swap(img);
    if(!img.dataset.ej && window.MutationObserver){ img.dataset.ej='1'; new MutationObserver(function(){ swap(img); }).observe(img,{attributes:true,attributeFilter:['src','srcset','data-original']}); }
  }
  if(!el.querySelector('.ej-tap')){
    var t=document.createElement('div'); t.className='ej-tap'; t.innerHTML='<i></i><span></span><i></i>'; t.querySelector('span').textContent=LABEL;
    if(OPENED) t.classList.add('ej-off');
    var atom=el.querySelector('.tn-atom')||el; atom.style.position=atom.style.position||'relative'; atom.appendChild(t);
  }
  // سطر مضاف (زي "At Pipe&Vibe Lounge"): بيتحط جوه بلوك المكان نفسه بين العنوان والساعة —
  // مايركبش على السطور اللي حواليه مهما كان مقاس الموبايل
  if(MOVE && !document.body.classList.contains('vv-edit') && !/[?&]edit=1/.test(location.search)){
    var a=document.querySelector('[data-elem-id="'+MOVE+'"]'), addr=document.querySelector('#wg-invite-3 [data-elem-id="lg17"]');
    if(a && addr && a.previousElementSibling!==addr){ addr.insertAdjacentElement('afterend',a); }
    if(a) a.classList.add('ej-inflow');
  }
  // جملة "قَدَّرَ اللهُ" (العربي): تحت صورة الغلاف على طول، فوق "مرّر لتحت" — مش راكبة عليها
  if(QUOTE && !/[?&]edit=1/.test(location.search)){
    var qe=document.querySelector('[data-elem-id="'+QUOTE+'"]'), arch=document.querySelector('[data-elem-id="lg5"]');
    if(qe && arch){
      var ar=arch.getBoundingClientRect(), qr=qe.getBoundingClientRect();
      var dy=ar.bottom+4-qr.top;
      if(Math.abs(dy)>2){ var cur=parseFloat(qe.dataset.ejDy||'0'); cur+=dy; qe.dataset.ejDy=cur; qe.style.translate='0 '+cur+'px'; }
    }
  }
  return true;
}
var k=0,t=setInterval(function(){ put(); if(++k>240) clearInterval(t); },250);
if(window.MutationObserver){ var q=false; new MutationObserver(function(){ if(q) return; q=true; requestAnimationFrame(function(){ q=false; put(); }); }).observe(document.documentElement,{childList:true,subtree:true}); }
document.addEventListener('DOMContentLoaded',put); window.addEventListener('load',put);
})();`;

const make = (shortId, label, moveAdded, quote) => ({
  shortId,
  render() {
    return {
      head: `<link rel="preload" as="image" href="${SEAL}"><style id="ej-style">${CSS}</style>`,
      bodyEnd: `<script id="ej-script">${script(label, moveAdded, quote)}</script>`,
    };
  },
});

// صورة الغلاف (الطفلين): بطلب المالك اتشالت خلفية الاستوديو (BiRefNet) وبقت
// مقصوصة PNG شفافة (custom/eJCypdA/kids.webp) واقفة على قاعدة القوس كاملة من غير
// ما القوس يقص رجل الولد أو جنب البنت، بظل خفيف تحت الرجلين.
// مقاسها 86% من القوس (= 48% من عرض الصفحة): بين الوردتين من غير ما تلمس أي واحدة
// حتى عند رجل الولد تحت (الورد بيوصل لحد ~22% و78% من العرض تحت). تكبير المحرر
// (scale inline !important) بيتلغي بالسكريبت تحت عشان الصورة ماترجعش تركب على الورد. بتتبدّل بس لو صاحب
// الدعوة لسه على نفس الصورة — لو غيّرها من المحرر، صورته هي اللي بتظهر عادي.
const KIDS = asset('/custom/eJCypdA/kids.webp');
const KIDS_CSS = `
#wg-invite-1 .arch:has(img[src*="/custom/eJCypdA/kids"]){overflow:visible;border-radius:0;clip-path:none!important}
#wg-invite-1 .arch:has(img[src*="/custom/eJCypdA/kids"])::before{content:"";position:absolute;left:50%;bottom:-3%;width:82%;height:8%;transform:translateX(-50%);
  background:radial-gradient(ellipse at center,rgba(96,52,44,.26) 0%,rgba(96,52,44,.1) 45%,transparent 72%);pointer-events:none}
#wg-invite-1 .arch img[src*="/custom/eJCypdA/kids"]{position:absolute;left:50%;bottom:0;width:86%;height:auto;max-width:none;transform:translateX(-50%);transform-origin:50% 100%;scale:1!important;object-fit:contain;
  filter:drop-shadow(0 4px 8px rgba(80,40,30,.16))}
`;
const KIDS_SCRIPT = `(function(){
function fix(){ var i=document.querySelector('#wg-invite-1 .arch img[src*="/custom/eJCypdA/kids"]'); if(i && i.style.getPropertyValue('scale')!=='1') i.style.setProperty('scale','1','important'); }
fix(); var k=0,t=setInterval(function(){ fix(); if(++k>120) clearInterval(t); },250);
if(window.MutationObserver) new MutationObserver(fix).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','src']});
})();`;
// بيلبّس أي دعوة Lily Garden صورة الطفلين بدل صورة غلاف معيّنة (oldId = اسم
// الصورة على Cloudinary) + كارت المشاركة بيهم. بتستخدمه eJCypdA وMeqC70l (نفس العرسان).
const withKids = (custom, oldId) => {
  const old = new RegExp(String.raw`https://res\.cloudinary\.com/[^"'\s]*?` + oldId + String.raw`\.jpg`, 'g');
  return {
    ...custom,
    render(opts) {
      const r = custom.render(opts);
      return {
        ...r,
        head: `<link rel="preload" as="image" href="${KIDS}">${r.head}<style id="ej-kids">${KIDS_CSS}</style>`,
        bodyEnd: `${r.bodyEnd}<script id="ej-kids-script">${KIDS_SCRIPT}</script>`,
      };
    },
    transform(html, o) {
      const out = custom.transform ? custom.transform(html, o) : html;
      return out.replace(old, KIDS);
    },
    // كارت المشاركة (واتساب/فيسبوك): صورة الطفلين على لون الدعوة بين الوردتين (1200×630).
    // العنوان والوصف بيفضلوا زي ما صاحب الدعوة كاتبهم. لو اتغيّرت: اسم ملف جديد.
    share: { image: '/custom/eJCypdA/share-kids.jpg', width: 1200, height: 630, overrideImage: true },
  };
};

module.exports = withKids(make('eJCypdA', 'Tap to open', 'add_nmvsntcajz4m8'), 'pcdswn19b13esa4fwxma');
module.exports.make = make;
module.exports.withKids = withKids;
