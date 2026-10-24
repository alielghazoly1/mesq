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
   بيتوسّط ويصغّر نفسه لو المحتوى طوّل، فالـ margin كان بيضيع نصّه */
#hv-hero .hv-card>.hv-eyebrow,#hv-hero .hv-card>.hv-names{position:relative;top:34px}
#hv-hero .hv-card>.hv-date,#hv-hero .hv-card>.hv-time{position:relative;top:30px}
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
function all(){try{seal();names();dates();}catch(e){}}
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
