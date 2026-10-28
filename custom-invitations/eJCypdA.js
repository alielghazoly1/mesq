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

const script = (label, moveAdded) => `(function(){
var MOVE=${JSON.stringify(moveAdded || '')};
var SEAL=${JSON.stringify(SEAL)}, OLD=${JSON.stringify(OLD)}, LABEL=${JSON.stringify(label)};
function swap(img){
  var cur=(img.getAttribute('src')||'')+' '+(img.getAttribute('srcset')||'');
  if(cur.indexOf(SEAL)<0 && OLD.some(function(o){return cur.indexOf(o)>=0;})){ img.removeAttribute('srcset'); img.setAttribute('data-original',SEAL); img.src=SEAL; }
}
function put(){
  var el=document.querySelector('[data-elem-id="1773847037346"]'); if(!el) return false;
  var img=el.querySelector('img');
  if(img){
    swap(img);
    if(!img.dataset.ej && window.MutationObserver){ img.dataset.ej='1'; new MutationObserver(function(){ swap(img); }).observe(img,{attributes:true,attributeFilter:['src','srcset','data-original']}); }
  }
  if(!el.querySelector('.ej-tap')){
    var t=document.createElement('div'); t.className='ej-tap'; t.innerHTML='<i></i><span></span><i></i>'; t.querySelector('span').textContent=LABEL;
    // أول ما الضيف يضغط الكلمة بتختفي (الختم بيفضل في الصفحة بعد الفتح)
    el.addEventListener('click',function(){ t.classList.add('ej-off'); },true);
    var atom=el.querySelector('.tn-atom')||el; atom.style.position=atom.style.position||'relative'; atom.appendChild(t);
  }
  // سطر مضاف (زي "At Pipe&Vibe Lounge"): بيتحط جوه بلوك المكان نفسه بين العنوان والساعة —
  // مايركبش على السطور اللي حواليه مهما كان مقاس الموبايل
  if(MOVE && !document.body.classList.contains('vv-edit') && !/[?&]edit=1/.test(location.search)){
    var a=document.querySelector('[data-elem-id="'+MOVE+'"]'), addr=document.querySelector('#wg-invite-3 [data-elem-id="lg17"]');
    if(a && addr && a.previousElementSibling!==addr){ addr.insertAdjacentElement('afterend',a); }
    if(a) a.classList.add('ej-inflow');
  }
  return true;
}
var k=0,t=setInterval(function(){ put(); if(++k>80) clearInterval(t); },250);
if(window.MutationObserver){ var q=false; new MutationObserver(function(){ if(q) return; q=true; requestAnimationFrame(function(){ q=false; put(); }); }).observe(document.documentElement,{childList:true,subtree:true}); }
document.addEventListener('DOMContentLoaded',put); window.addEventListener('load',put);
})();`;

const make = (shortId, label, moveAdded) => ({
  shortId,
  render() {
    return {
      head: `<link rel="preload" as="image" href="${SEAL}"><style id="ej-style">${CSS}</style>`,
      bodyEnd: `<script id="ej-script">${script(label, moveAdded)}</script>`,
    };
  },
});

module.exports = make('eJCypdA', 'Tap to open', 'add_nmvsntcajz4m8');
module.exports.make = make;
