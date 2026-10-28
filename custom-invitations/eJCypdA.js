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
@keyframes ejTap{0%,100%{opacity:.65}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.ej-tap{animation:none}}
`;

const SCRIPT = `(function(){
var SEAL=${JSON.stringify(SEAL)}, OLD=${JSON.stringify(OLD)};
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
    var t=document.createElement('div'); t.className='ej-tap'; t.innerHTML='<i></i><span>Tap to open</span><i></i>';
    var atom=el.querySelector('.tn-atom')||el; atom.style.position=atom.style.position||'relative'; atom.appendChild(t);
  }
  return true;
}
var k=0,t=setInterval(function(){ if(put()&&++k>8) clearInterval(t); },250);
document.addEventListener('DOMContentLoaded',put); window.addEventListener('load',put);
})();`;

module.exports = {
  shortId: 'eJCypdA',
  render() {
    return {
      head: `<link rel="preload" as="image" href="${SEAL}"><style id="ej-style">${CSS}</style>`,
      bodyEnd: `<script id="ej-script">${SCRIPT}</script>`,
    };
  },
};
