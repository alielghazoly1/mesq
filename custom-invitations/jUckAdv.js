// دعوة مخصوصة لعميل (لچين وعمر — Champagne Lace) — بطلب المالك:
//
// 1) الختم اللي الضيف بيدوس عليه على الظرف: الفرع اللي كان جوّه اتشال، ومكانه
//    مونوجرام "ع ل" بنفس ستايل الصورة اللي بعتها (مقصوص منها) — seal-v2.webp.
// 2) أول كارت بعد الفتح: الأسامي اتشالت ومكانها "عمر & لجين" (عمر فوق) بالخط الذهبي
//    المحفور من صورته (names-v2.webp)، وبتظهر بالحبر من اليمين للشمال.
// 3) التاريخ أرقام بس — من غير اسم الشهر (أول كارت + كروت الخربشة + العدّاد)،
//    والساعة تحته رقم (7:30 PM) مش كلام.
//    بيتقري من بيانات الدعوة، فلو التاريخ اتغيّر من المحرر يتغيّر هنا.
// 4) كارت المشاركة (واتساب): الأسامي بالخط الذهبي على ورق — share-v2.jpg.
// 5) (24 أكتوبر) "YOU ARE INVITED TO THE WEDDING OF" نازل ≈24px على الشاشة
//    (كان لازق في الورود المحفورة فوق)، والخط اللي بين عمر ولجين بقى في النص
//    بالظبط: لجين طلعت 34px لفوق جوه الصورة (names-v3.webp) — المسافة بين
//    الخط وكل اسم 83px في الصورة.
// 6) (24 أكتوبر) أول كارت: التاريخ والساعة اتشالوا ومكانهم "Forever Together" بخط
//    Pinyon Script دهبي. الساعة بقت تحت "You’re invited!" اللي بتظهر بعد ما الضيف
//    يخربش التلات كروت — بتطلع بعدها بنص ثانية بين خطين دهب رفاع.
//    الساعة بتتقري من بيانات الدعوة (WEDDING_CONFIG) — لو اتغيّرت من المحرر تتغيّر.
//
// البيانات (التاريخ/الوقت/المكان/الخريطة): oneOffFix jUckAdv-tolip-2027.
const BASE = '/custom/jUckAdv';

const CSS = `
/* الأسامي بالخط الذهبي مكان الأسامي المكتوبة */
#hv-hero .hv-names.ju-on>span{display:none!important}
#hv-hero .hv-names.ju-on{margin-top:6px;-webkit-text-stroke:0;white-space:normal;line-height:0}
#hv-hero .ju-names{display:block;width:auto;height:300px;margin:0 auto;pointer-events:none;
  filter:drop-shadow(0 1px 0 rgba(255,255,255,.35))}
/* الكلام اللي فوق الأسامي نازل شوية عن أول الكارت — بـ top (مش margin): الكارت
   بيتوسّط ويصغّر نفسه حسب طول المحتوى، فالـ margin كان بيضيع نصّه. 63px لأن
   الكارت بقى أقصر (من غير التاريخ والساعة) فاتوسّط أعلى بـ 20px */
#hv-hero .hv-card>.hv-eyebrow,#hv-hero .hv-card>.hv-names,#hv-hero .hv-card>.ju-forever{position:relative;top:63px}
/* التاريخ والساعة مش في أول كارت خلاص — مكانهم "Forever Together" */
#hv-hero .hv-card>.hv-date,#hv-hero .hv-card>.hv-time{display:none!important}
#hv-hero .hv-card>.ju-forever{margin:14px 0 0;font:400 34px/1.15 'Pinyon Script','Times New Roman',cursive;
  color:#9a7848;-webkit-text-stroke:.25px currentColor;letter-spacing:.01em;white-space:nowrap}
/* الساعة تحت "You’re invited!" — بتظهر بعد الخربشة */
#hv-hero .ju-time{display:flex;align-items:center;justify-content:center;gap:14px;margin:10px auto 0;
  opacity:0!important;transform:translateY(8px);transition:opacity 1.2s cubic-bezier(.16,1,.3,1) .55s,transform 1.2s cubic-bezier(.16,1,.3,1) .55s}
/* القالب بيعمل دخول لكل حاجة في القسم ده أول ما يظهر — الساعة لأ: بتستنى الخربشة */
#hv-hero .hv-reveal>.ju-time{animation:none!important}
#hv-hero .hv-reveal__msg.is-shown+.ju-time{opacity:1!important;transform:none}
#hv-hero .ju-time__line{width:46px;height:1px;background:linear-gradient(90deg,transparent,#b8955e)}
#hv-hero .ju-time__line:last-child{background:linear-gradient(90deg,#b8955e,transparent)}
#hv-hero .ju-time__val{font:500 25px/1 'Cormorant Garamond','Times New Roman',serif;letter-spacing:.16em;padding-left:.16em;
  color:var(--hv-ink,#3b3026);font-variant-numeric:lining-nums;font-feature-settings:"lnum" 1;white-space:nowrap}
/* الحبر بيمشي من اليمين للشمال (عربي) */
@keyframes ju-ink{from{clip-path:inset(-8% -8% -8% 100%);opacity:.2}12%{opacity:1}to{clip-path:inset(-8% -8% -8% -8%);opacity:1}}
#hv-hero.hv--play .hv-card>.hv-names.ju-on{animation:ju-ink 2.4s cubic-bezier(.45,.05,.35,1) .9s both}
/* التاريخ أرقام وكلها نفس المقاس (اليوم والشهر والسنة) */
#hv-hero .hv-date.ju-num .hv-date__m,#hv-hero .hv-date.ju-num .hv-date__y{font-size:29.588px;font-weight:500;letter-spacing:.1777em;text-transform:none}
#hv-hero .hv-tile__val.ju-num{font-size:42px;letter-spacing:.02em}
/* الساعة رقم مش كلام: 7:30 PM في سطر واحد */
#hv-hero .hv-time.ju-num [data-elem-id="cl10"]{display:none!important}
#hv-hero .hv-time.ju-num [data-elem-id="cl9"]{font-size:16px;letter-spacing:.14em;font-variant-numeric:lining-nums;font-feature-settings:"lnum" 1}
`;

const SCRIPT = `(function(){
var BASE=${JSON.stringify(BASE)};
function pad(n){return (n<10?'0':'')+n}
function txt(el,v){if(el&&el.textContent!==v)el.textContent=v;}
function seal(){
  var img=document.querySelector('.popup-enter img');
  // بس لو لسه ختم القالب (لو اتغيّر من المحرر نسيبه)
  if(img&&/\\/templates\\/champagne-lace\\/seal\\.webp$/.test(img.getAttribute('src')||'')){img.removeAttribute('srcset');img.src=BASE+'/seal-v2.webp';}
}
function names(){
  var h=document.querySelector('#hv-hero .hv-names');
  if(!h||h.querySelector('.ju-names'))return;
  var i=new Image();i.className='ju-names';i.alt='عمر & لجين';i.src=BASE+'/names-v3.webp';i.decoding='async';
  i.width=579;i.height=832;
  h.appendChild(i);h.classList.add('ju-on');
}
function dates(){
  var cd=(window.WEDDING_CONFIG||{}).countdown||{};
  if(cd.year==null||cd.monthIndex==null)return;
  var d=pad(cd.day),m=pad(cd.monthIndex+1),y=String(cd.year);
  var hd=document.querySelector('#hv-hero .hv-date');if(hd)hd.classList.add('ju-num');
  txt(document.querySelector('[data-elem-id="cl6"]'),m);
  txt(document.querySelector('[data-elem-id="cl7"]'),d);
  txt(document.querySelector('[data-elem-id="cl8"]'),y);
  ['cl22','cl23','cl24'].forEach(function(id,i){var e=document.querySelector('[data-elem-id="'+id+'"]');if(e){e.classList.add('ju-num');txt(e,[d,m,y][i]);}});
  txt(document.querySelector('[data-elem-id="cl32"]'),d+' . '+m+' . '+y);
  if(cd.hour!=null){var tm=document.querySelector('#hv-hero .hv-time');if(tm)tm.classList.add('ju-num');
    txt(document.querySelector('[data-elem-id="cl9"]'),(cd.hour%12||12)+':'+pad(cd.minute||0)+(cd.hour<12?' AM':' PM'));}
}
function forever(){
  var card=document.querySelector('#hv-hero .hv-card');
  if(!card||card.querySelector('.ju-forever'))return;
  var f=document.createElement('p');f.className='ju-forever';f.textContent='Forever Together';
  var n=card.querySelector('.hv-names');
  if(n&&n.nextSibling)card.insertBefore(f,n.nextSibling);else card.appendChild(f);
}
function timeLine(){
  var cd=(window.WEDDING_CONFIG||{}).countdown||{};
  var msg=document.querySelector('#hv-hero .hv-reveal__msg');
  if(!msg||cd.hour==null)return;
  var v=(cd.hour%12||12)+':'+pad(cd.minute||0)+(cd.hour<12?' AM':' PM');
  var el=msg.nextElementSibling&&msg.nextElementSibling.classList.contains('ju-time')?msg.nextElementSibling:null;
  if(!el){
    el=document.createElement('div');el.className='ju-time';el.setAttribute('aria-label',v);
    el.innerHTML='<span class="ju-time__line"></span><span class="ju-time__val"></span><span class="ju-time__line"></span>';
    msg.parentNode.insertBefore(el,msg.nextSibling);
  }
  txt(el.querySelector('.ju-time__val'),v);
}
function all(){try{seal();names();dates();forever();timeLine();}catch(e){}}
all();document.addEventListener('DOMContentLoaded',all);window.addEventListener('load',all);
var k=0,t=setInterval(function(){all();if(++k>20)clearInterval(t)},300);
})();`;

module.exports = {
  shortId: 'jUckAdv',

  // كارت المشاركة: "لجين & عمر" بالخط الذهبي على ورق (1200×630). لو اتغيّر:
  // اسم ملف جديد (v2) عشان واتساب مايفضلش عارض القديم من الكاش.
  share: {
    title: 'لچين & عمر — Wedding Invitation',
    description: 'You are invited to the wedding of لچين & عمر · 01 . 01 . 2027 · Tolip Hotel Olympic',
    image: `${BASE}/share-v2.jpg`,
    width: 1200,
    height: 630,
    overrideImage: true,
  },

  /** نفس الشكل للضيوف وفي المحرر */
  render() {
    return {
      head: `<link rel="preload" as="image" href="${BASE}/seal-v2.webp"><style id="ju-style">${CSS}</style>`,
      bodyEnd: `<script id="ju-script">${SCRIPT}</script>`,
    };
  },
};
