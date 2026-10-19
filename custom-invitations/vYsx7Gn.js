// دعوة مخصوصة لعميل (الغزالى ومها — Champagne Lace، عربي) — بطلب المالك:
//
// 1) الكارت الأول بنفس ترتيب الصورة اللي بعتها، بتنسيق أشيك:
//      يتشرف · آل عبدالرحمن و آل باني · بدعوتكم لحضور حفل زفاف
//      نجلهم الدكتور · الغزالى · محمد المختار عبدالرحمن
//      و · كريمتهم المهندسة · مها · عمر الفاروق أحمد باني
//      التاريخ · يبدأ الحفل الساعة 9:00 مساءً · المكان
//    التاريخ والمكان بيتقروا من بيانات الدعوة (لو اتغيّروا من المحرر يتغيّروا هنا).
// 2) من غير خربشة: كروت التاريخ مكشوفة على طول (اليوم/الشهر/السنة ظاهرين).
//
// الخريطة: اتصلّحت للقالب كله (views/champagne-lace.html) + oneOffFix للدعوة دي.

const CSS = `
/* الكارت الأول — بيبدأ أعلى شوية عشان السطور أكتر من الأصل */
#hv-hero .hv-card.vy-on{top:214px}
#hv-hero .hv-card.vy-on>:not(.vy){display:none!important}
#hv-hero .vy{direction:rtl;color:#2b1c13;text-align:center;font-family:'Amiri',serif}
#hv-hero .vy *{letter-spacing:0!important}
#hv-hero .vy-pre{font:400 15px/1.4 'Amiri',serif;color:#6f5d4c}
#hv-hero .vy-fam{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:0;font:700 22px/1.32 'Amiri',serif;color:#2b1c13}
#hv-hero .vy-fam i{font:italic 400 19px/1 'Amiri',serif;color:#a48c69}
#hv-hero .vy-invite{margin-top:2px;font:400 16px/1.5 'Amiri',serif;color:#3d2c1f}
#hv-hero .vy-orn{display:flex;align-items:center;justify-content:center;gap:9px;margin:8px auto 3px}
#hv-hero .vy-orn i{width:46px;height:1px;background:linear-gradient(90deg,transparent,#b79f78)}
#hv-hero .vy-orn i:last-child{transform:scaleX(-1)}
#hv-hero .vy-orn b{width:6px;height:6px;border:1px solid #b79f78;transform:rotate(45deg)}
#hv-hero .vy-person{margin-top:2px}
#hv-hero .vy-role{font:400 13px/1.3 'Amiri',serif;color:#8a7458}
#hv-hero .vy-name{font:700 38px/1.15 'Aref Ruqaa','Amiri',serif;color:#2b1c13}
#hv-hero .vy-person+.vy-and+.vy-person .vy-name{padding-bottom:8px}
#hv-hero .vy-full{font:700 16px/1.35 'Amiri',serif;color:#4a3626}
#hv-hero .vy-and{margin:4px 0 2px;font:400 24px/1 'Aref Ruqaa','Amiri',serif;color:#a48c69}
#hv-hero .vy-date{display:grid;grid-template-columns:1fr 62px 1fr;align-items:center;height:32px;margin:10px auto 0;width:280px;
  font-family:'Cormorant Garamond','Amiri',serif;font-variant-numeric:lining-nums}
#hv-hero .vy-date span{line-height:1}
#hv-hero .vy-date .m{justify-self:end;padding-left:14px;font:400 17px/1 'Amiri',serif}
#hv-hero .vy-date .y{justify-self:start;padding-right:14px;font-size:19px;font-weight:500}
#hv-hero .vy-date .d{position:relative;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:500}
#hv-hero .vy-date .d::before,#hv-hero .vy-date .d::after{content:"";position:absolute;top:0;bottom:0;width:1px;background:#2b1c13}
#hv-hero .vy-date .d::before{left:0}#hv-hero .vy-date .d::after{right:0}
#hv-hero .vy-time{margin-top:7px;font:400 15.5px/1.5 'Amiri',serif;color:#3d2c1f}
#hv-hero .vy-time b{font-family:'Cormorant Garamond','Amiri',serif;font-weight:600;font-size:17px;font-variant-numeric:lining-nums}
#hv-hero .vy-venue{margin-top:4px;font:700 17px/1.45 'Amiri',serif;color:#2b1c13}
#hv-hero .vy-venue small{display:block;font:400 14px/1.4 'Amiri',serif;color:#6f5d4c}
/* ظهور السطور واحد ورا التاني لما الظرف يتفتح */
#hv-hero.hv--armed:not(.hv--play) .vy>*{opacity:0}
#hv-hero.hv--play .vy>*{animation:hv-rise 1.1s cubic-bezier(.2,.7,.2,1) both}
${Array.from({ length: 16 }, (_, i) => `#hv-hero.hv--play .vy>:nth-child(${i + 1}){animation-delay:${(0.5 + i * 0.12).toFixed(2)}s}`).join('\n')}

/* التاريخ من غير خربشة: الكروت مكشوفة على طول */
#hv-hero .hv-tile__coat{display:none!important}
#hv-hero .hv-reveal__hint{display:none!important}
#hv-hero .hv-tile{cursor:default}
#hv-hero .hv-reveal__msg{opacity:1!important;transform:none!important}
`;

const HTML = `<div class="vy" data-vy>
  <p class="vy-pre">يتشرف</p>
  <p class="vy-fam"><span>آل عبدالرحمن</span><i>و</i><span>آل باني</span></p>
  <p class="vy-fam vy-fam2"><span>آل مصطفى الصديق</span></p>
  <p class="vy-invite">بدعوتكم لحضور حفل زفاف</p>
  <div class="vy-orn" aria-hidden="true"><i></i><b></b><i></i></div>
  <div class="vy-person"><p class="vy-role">نجلهم الدكتور</p><p class="vy-name">الغزالى</p><p class="vy-full">محمد المختار عبدالرحمن</p></div>
  <p class="vy-and">و</p>
  <div class="vy-person"><p class="vy-role">كريمتهم المهندسة</p><p class="vy-name">مها</p><p class="vy-full">عمر الفاروق أحمد باني</p></div>
  <div class="vy-date"><span class="m" data-vy="m">نوفمبر</span><span class="d" data-vy="d">6</span><span class="y" data-vy="y">2026</span></div>
  <p class="vy-time" data-vy="time">يبدأ الحفل الساعة <b>9:00</b> مساءً</p>
  <p class="vy-venue"><span data-vy="venue">قصر ليالي نمار</span><small data-vy="city">القاعه</small></p>
</div>`;

const SCRIPT = `(function(){
var AR_M=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
var HTML=${JSON.stringify(HTML)};
function put(){
  var card=document.querySelector('#hv-hero .hv-card');
  if(!card)return;
  if(!card.querySelector('[data-vy]')){card.insertAdjacentHTML('afterbegin',HTML);card.classList.add('vy-on');}
  var C=window.WEDDING_CONFIG||{},cd=C.countdown||{};
  function s(k,v){var e=card.querySelector('[data-vy="'+k+'"]');if(e&&v!=null&&v!=='')e.textContent=v;}
  if(cd.year!=null&&cd.monthIndex!=null){s('m',AR_M[cd.monthIndex]);s('d',String(cd.day));s('y',String(cd.year));}
  if(cd.hour!=null){
    var h=cd.hour%12||12,mm=(cd.minute<10?'0':'')+(cd.minute||0),t=card.querySelector('[data-vy="time"]');
    var part=cd.hour<12?'صباحًا':(cd.hour<17?'عصرًا':'مساءً');
    if(t)t.innerHTML='يبدأ الحفل الساعة <b>'+h+':'+mm+'</b> '+part;
  }
  s('venue',C.venueName);
  var city=card.querySelector('[data-vy="city"]');if(city){var c=C.venueAddress||C.venueCity||'';city.textContent=c;city.style.display=c?'':'none';}
}
function tick(){try{put()}catch(e){}}
tick();document.addEventListener('DOMContentLoaded',tick);window.addEventListener('load',tick);
var k=0,t=setInterval(function(){tick();if(++k>12)clearInterval(t)},300);
})();`;

// "انزل لأسفل" تحت أول شاشة: بيظهر بعد ما الكارت يكتمل، ويختفي أول ما الضيف ينزل
const HINT_CSS = `
#vy-down{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));z-index:60;transform:translate(-50%,12px);
  display:flex;align-items:center;gap:6px;padding:6px 14px 6px 12px;border-radius:999px;
  background:rgba(255,253,248,.82);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
  border:1px solid rgba(183,159,120,.55);box-shadow:0 10px 26px -12px rgba(60,44,28,.45);
  color:#5a4734;font:700 13px/1.2 'Amiri',serif;direction:rtl;letter-spacing:0;
  opacity:0;pointer-events:none;transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
#vy-down.on{opacity:1;transform:translate(-50%,0);pointer-events:auto;cursor:pointer}
#vy-down svg{width:15px;height:15px;color:#a48c69;animation:vyBob 1.6s ease-in-out infinite}
#vy-down svg path:last-child{opacity:.45}
@keyframes vyBob{0%,100%{transform:translateY(-2px)}50%{transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){#vy-down svg{animation:none}}
`;
const HINT_SCRIPT = `(function(){
if((window.WEDDING_CONFIG||{}).autoOpen)return;
var el=document.createElement('button');el.type='button';el.id='vy-down';el.setAttribute('aria-label','انزل لأسفل');
el.innerHTML='<span>انزل لأسفل</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l6 6 6-6"/><path d="M6 13l6 6 6-6"/></svg>';
var done=false;
function hide(){if(done)return;done=true;el.classList.remove('on');setTimeout(function(){el.remove()},800);}
function show(){if(!done&&(window.scrollY||0)<40)el.classList.add('on');}
function start(){
  document.body.appendChild(el);
  el.addEventListener('click',function(){var t=document.querySelector('#hv-hero .hv-reveal')||document.getElementById('hv-hero');window.scrollTo({top:Math.max(0,(t.getBoundingClientRect().top+window.scrollY)-60),behavior:'smooth'});hide();});
  window.addEventListener('scroll',function(){if((window.scrollY||0)>60)hide();},{passive:true});
  // بعد ما الظرف يتفتح والكارت يكتمل
  var k=0,t=setInterval(function(){var h=document.getElementById('hv-hero');if(h&&(h.classList.contains('hv--play')||!h.classList.contains('hv--armed'))){clearInterval(t);setTimeout(show,3400);}else if(++k>600)clearInterval(t);},200);
}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();`;

module.exports = {
  shortId: 'vYsx7Gn',

  /** نفس الشكل للضيوف وفي المحرر (عشان صاحب الدعوة يشوف اللي الضيوف هيشوفوه) */
  render({ editMode } = {}) {
    // "انزل لأسفل" للضيوف بس — مش في المحرر
    return {
      head: `<style id="vy-style">${CSS}${editMode ? '' : HINT_CSS}</style>`,
      bodyEnd: `<script id="vy-script">${SCRIPT}</script>${editMode ? '' : `<script id="vy-down-script">${HINT_SCRIPT}</script>`}`,
    };
  },
};
