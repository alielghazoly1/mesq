// دعوة l47wr2d (Champagne Lace) — أحمد حسب النبي وچيلان حسام، الجمعة 8 يناير 2027، قاعة إخناتون — دار المراسم
// (نادي ضباط الشرطة، الجزيرة). بطلب المالك (2026-11-15):
//   • الدعوة بلغتين: إنجليزي (الافتراضي) وعربي، وزرار فوق على اليمين بيظهر بعد فتح الدعوة ويقلب اللغة في نفس
//     الصفحة (من غير ما المزيكا تقف أو الصفحة ترجع لأولها). لينك المشاركة لو آخره /AR بيفتح عربي و /EN إنجليزي
//     (routes/invitations.js بيحوّلهم لـ ?lang=ar|en، والسيرفر بيرسم الصفحة وكارت المشاركة باللغة دي).
//   • كلام المالك بالنص في النسختين. العربي: الأسامي كاملة والعروسة الأول ("چيلان حسام نصر على أحمد محمد
//     حسب النبي")، وبسم الله فوق الكارت الأول. الإنجليزي: "Ahmed Hasab El Naby & Jilan Hossam" زي ما كتبها.
//   • برنامج الحفل + الزي (قسم جديد بنفس شكل القالب بعد المكان)، صورة القاعة فوق الخريطة، و3 صور العروسين في
//     الألبوم (علامة المصوّر Ahmed Bebo فاضلة زي ما هي)، وجملة الختام في سطر الختام (cl83).
//   • تحت الدريس كود رسمة البدلة والفستان (نفس ملف DBywdm2) لوحدها — المالك رفض الإطار والظل.
// الأسامي/التاريخ/المكان/الخريطة متخزّنين في بيانات الدعوة نفسها (utils/oneOffFixes.js: l47wr2d-ahmed-jilan) عشان
// الداشبورد والتقويم والحضور. في المحرر (editMode) الملف ده مابيعملش أي حاجة — القالب بيتعرض زي ما هو.
const { asset } = require('./_asset');

const SHORT = 'l47wr2d';
const IMG = (f) => asset(`/custom/${SHORT}/${f}`);

// كلام الدعوة باللغتين (المالك بعته بالنص — اتصلّح بس "علي"→"على" و"قاعه"→"قاعة" و"يشرفنا ويزيد")
const TEXT = {
  en: {
    title: 'Ahmed & Jilan — Wedding Invitation',
    open: 'Click to open',
    bsm: '',
    introTop: '',
    introAfter: 'Together with their families,<br>they gladly invite you to celebrate<br>the beginning of their forever<br>at their wedding celebration.',
    name1: 'Ahmed', amp: '&', name2: 'Jilan',
    wday: 'FRIDAY',
    dateM: 'January', dateD: '8', dateY: '2027',
    venue1: 'Akhenaton Hall', venue2: 'Dar El Marasem – Police Officers Club', venue3: 'Gezira, Cairo',
    tileD: '8', tileM: 'January', tileY: '2027',
    cdDate: 'FRIDAY, 8 JANUARY 2027',
    vnName: 'Akhenaton Hall', vnAddr: 'Dar El Marasem – Police Officers Club · Gezira, Cairo',
    hope: 'Hope to see you there!', closingNames: 'Ahmed & Jilan',
    note: 'Your presence will make our special day<br>even more meaningful.',
    details: {
      eyebrow: 'FRIDAY, 8 JANUARY 2027', title: 'The Evening’s Schedule',
      rows: [['7:30 PM', 'Zaffa'], ['8:00 PM', 'Katb Ketab Ceremony']],
      follow: 'Celebration to follow.',
      dressEyebrow: 'DRESS CODE', dress: 'Formal Evening Wear', dressNote: 'Kindly keep white for the bride.',
      attireAlt: 'Formal evening wear — a black tuxedo and an evening gown',
    },
    venuePhotoAlt: 'Dar El Marasem – Police Officers Club',
    toggle: 'عربي', toggleLabel: 'اقرأ الدعوة بالعربي',
  },
  ar: {
    title: 'دعوة زفاف چيلان و أحمد',
    open: 'اضغط للفتح',
    bsm: 'بسم الله الرحمن الرحيم',
    introTop: 'في ليلة ننتظرها بكل الحب،<br>يسعدنا دعوتكم لمشاركتنا أجمل لحظات العمر،<br>واحتفالنا بعقد قران وزفاف',
    introAfter: '',
    name1: 'چيلان حسام نصر', amp: 'على', name2: 'أحمد محمد حسب النبي',
    wday: 'الجمعة',
    dateM: 'يناير', dateD: '٨', dateY: '٢٠٢٧',
    venue1: 'دار المراسم لضباط الشرطة – الجزيرة', venue2: 'قاعة (إخناتون)', venue3: '',
    tileD: '٨', tileM: 'يناير', tileY: '٢٠٢٧',
    cdDate: 'الجمعة | ٨ يناير ٢٠٢٧',
    vnName: 'قاعة (إخناتون)', vnAddr: 'دار المراسم لضباط الشرطة – الجزيرة',
    hope: 'في انتظاركم!', closingNames: 'چيلان و أحمد',
    note: 'وجودكم يشرفنا ويزيد فرحتنا اكتمالًا',
    details: {
      eyebrow: 'الجمعة | ٨ يناير ٢٠٢٧', title: 'برنامج الحفل',
      rows: [['٧:٣٠ مساءً', 'الزفة'], ['٨:٠٠ مساءً', 'عقد القران']],
      follow: 'ويلي ذلك الاحتفال بالزفاف.',
      dressEyebrow: 'الزي الرسمي', dress: 'زي سهرة أنيق', dressSub: '(Formal Evening Wear)', dressNote: 'نرجو التكرم بترك اللون الأبيض للعروس.',
      attireAlt: 'زي سهرة أنيق — بدلة سموكنج وفستان سهرة',
    },
    venuePhotoAlt: 'دار المراسم لضباط الشرطة – الجزيرة',
    toggle: 'English', toggleLabel: 'Read the invitation in English',
  },
};

const CSS = `
/* ===== l47wr2d: زرار اللغة (فوق يمين، بعد الفتح بس) ===== */
#l4-lang{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);right:12px;z-index:2147483000;display:none;
  align-items:center;gap:6px;height:32px;padding:0 13px;border-radius:16px;border:1px solid rgba(164,140,105,.75);
  background:rgba(251,248,242,.88);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#2b1c13;
  font:600 12.5px/1 'Cormorant Garamond','Times New Roman',serif;letter-spacing:.06em;cursor:pointer;
  box-shadow:0 2px 10px -3px rgba(60,44,28,.35);-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .5s ease}
#l4-lang.on{display:inline-flex}
#l4-lang.show{opacity:1}
#l4-lang svg{width:13px;height:13px;flex:none}
#l4-lang .ar{font-family:'Amiri',serif;font-size:14px;letter-spacing:0;font-weight:700}

/* ===== الكارت الأول ===== */
#hv-hero .l4-bsm{margin:0 0 6px;font:400 17px/1.5 'Amiri','Traditional Arabic',serif;color:#8a7152;direction:rtl}
#hv-hero .l4-intro{margin:6px 0 4px;font:500 11.6px/1.7 'Cormorant Garamond','Times New Roman',serif;letter-spacing:.02em;color:#4a3a2c}
#hv-hero .l4-intro--top{font:400 14px/1.75 'Amiri','Traditional Arabic',serif;letter-spacing:0;direction:rtl;margin:0 0 2px}
#hv-hero .l4-intro--after{font-style:italic;font-size:13px;margin-top:10px}
#hv-hero .l4-wday{margin:12px 0 -4px;font:500 10.4px/1 'Cinzel','Times New Roman',serif;letter-spacing:.28em;padding-left:.28em;color:#6f5d4c}
body.cl-ar #hv-hero .l4-wday{font:700 15px/1 'Amiri',serif;letter-spacing:0;padding:0}
body.cl-ar #hv-hero .hv-names--ar{font-size:34px;line-height:1.5}
body.cl-ar #hv-hero .hv-names--ar .hv-amp{font-family:'Aref Ruqaa','Amiri',serif!important;font-style:normal;font-size:21px;line-height:1.3;color:#a48c69;margin:-2px 0 -4px}
#hv-hero .hv-venue .l4-v3{display:block}

/* ===== المكان: صورة القاعة فوق الخريطة ===== */
#vn-venue .vn-stage{height:770px}
#vn-venue .l4-vphoto{position:absolute;left:50px;top:180px;width:340px;height:154px;padding:6px;margin:0;background:#fbf8f2;border-radius:2px;
  box-shadow:0 1px 1px rgba(60,44,28,.16),0 4px 10px rgba(60,44,28,.08),4px 18px 30px -16px rgba(60,44,28,.55)}
#vn-venue .l4-vphoto::after{content:"";position:absolute;inset:3px;border:1px solid rgba(164,140,105,.5);pointer-events:none}
#vn-venue .l4-vphoto img{display:block;width:100%;height:100%;object-fit:cover}
#vn-venue .vn-frame{top:356px}
#vn-venue .vn-fl{top:330px}
#vn-venue .vn-dir{top:722px}
.vn--in .l4-vphoto{animation-delay:.38s!important}

/* ===== برنامج الحفل + الزي ===== */
.l4d{position:relative;overflow:hidden;background:#fffdfb;color:#2b1c13;text-align:center;padding:26px 0 46px;-webkit-font-smoothing:antialiased}
.l4d *{box-sizing:border-box;margin:0;padding:0}
.l4d-stage{position:relative;width:440px;margin-left:calc(50% - 220px)}
body.cl-ar .l4d-stage{direction:rtl}  /* القسم نفسه LTR — فالتوسيط بالـ margin-left زي الإنجليزي */
.l4d-eyebrow{font:500 10px/1 'Cinzel','Times New Roman',serif;letter-spacing:.3em;padding-left:.3em;color:#6f5d4c}
.l4d-title{margin-top:10px;font:400 42px/1.15 'Pinyon Script','Aref Ruqaa',cursive;-webkit-text-stroke:.3px currentColor}
.l4d-card{position:relative;width:350px;margin:22px auto 0;padding:24px 20px 22px;background:#fbf8f2;border-radius:2px;
  box-shadow:0 1px 1px rgba(60,44,28,.14),0 3px 8px rgba(60,44,28,.08),6px 18px 34px -14px rgba(60,44,28,.45)}
.l4d-card::after{content:"";position:absolute;inset:4px;border:1px solid rgba(164,140,105,.55);pointer-events:none}
.l4d-row{display:flex;align-items:center;justify-content:center;gap:12px;padding:9px 0}
.l4d-row + .l4d-row{border-top:1px solid rgba(164,140,105,.28)}
.l4d-time{min-width:84px;text-align:right;font:500 12px/1 'Cinzel','Times New Roman',serif;letter-spacing:.08em;color:#8a7152;white-space:nowrap}
.l4d-dot{width:5px;height:5px;border-radius:50%;background:#a48c69;flex:none}
.l4d-what{min-width:170px;text-align:left;font:500 19.5px/1.2 'Cormorant Garamond','Times New Roman',serif}
.l4d-follow{margin-top:12px;font:italic 500 16px/1.4 'Cormorant Garamond','Times New Roman',serif;color:#6f5d4c}
.l4d-rule{width:90px;height:1px;margin:34px auto 26px;background:linear-gradient(90deg,transparent,#a48c69,transparent)}
.l4d-dress{margin-top:12px;font:400 34px/1.2 'Pinyon Script','Aref Ruqaa',cursive;-webkit-text-stroke:.25px currentColor}
.l4d-sub{margin-top:4px;font:500 12px/1.4 'Cormorant Garamond',serif;letter-spacing:.04em;color:#6f5d4c}
.l4d-note{margin-top:10px;font:italic 500 16px/1.45 'Cormorant Garamond','Times New Roman',serif;color:#4a3a2c}
body.cl-ar .l4d-eyebrow{font:700 15px/1.3 'Amiri',serif;letter-spacing:0;padding:0}
body.cl-ar .l4d-title,body.cl-ar .l4d-dress{font-family:'Aref Ruqaa','Amiri',serif;-webkit-text-stroke:0;line-height:1.5}
body.cl-ar .l4d-title{font-size:34px}
body.cl-ar .l4d-dress{font-size:26px}
body.cl-ar .l4d-time{text-align:left;font:700 16px/1.2 'Amiri',serif;letter-spacing:0;direction:rtl}
body.cl-ar .l4d-what{text-align:right;font:400 21px/1.3 'Amiri',serif}
body.cl-ar :is(.l4d-follow,.l4d-note){font:400 18px/1.6 'Amiri',serif}
body.cl-ar .l4d-sub{direction:ltr}
.l4d--armed:not(.l4d--in) .l4d-stage > *{opacity:0}
.l4d--in .l4d-stage > *{animation:vn-rise 1.1s cubic-bezier(.2,.7,.2,1) both}
.l4d--in .l4d-title{animation-delay:.12s}
.l4d--in .l4d-card{animation-delay:.26s}
.l4d--in .l4d-stage > :nth-child(n+4){animation-delay:.4s}

/* صورة الزي (بدلة + فستان) تحت الدريس كود — نفس رسمة DBywdm2 وبنفس طريقة عرضها هناك: لوحدها، من غير إطار ولا ظل */
.l4d-attire{position:relative;width:200px;height:250px;margin:30px auto 0}
.l4d-attire img{position:absolute;left:-13.75%;top:-10.2%;width:127.5%;height:128%;max-width:none}

/* ===== الختام ===== */
body.cl-ar .cl-note{font-size:20px}
`;

function clientScript() {
  const cfg = {
    T: TEXT,
    venuePhoto: IMG('venue.webp'),
    attire: IMG('attire.webp'),
  };
  const json = JSON.stringify(cfg).replace(/</g, '\\u003c');
  return `<script id="l4-script">(function(){
var C=window.WEDDING_CONFIG||{};
if(C.autoOpen)return;
var X=${json},T=X.T;
var lang=C.language==='ar'?'ar':'en';
try{var qs=new URLSearchParams(location.search).get('lang');if(!qs){var s=sessionStorage.getItem('l4_lang');if(s==='ar'||s==='en')lang=s;}}catch(e){}
function q(k){return document.querySelectorAll('[data-cl="'+k+'"]');}
function setT(k,v){q(k).forEach(function(e){e.textContent=v;});}
function setLine(k,v){q(k).forEach(function(e){if(v){e.textContent=v;e.style.display='';}else{e.textContent='';e.style.display='none';}});}
function tn(id){return document.querySelector('[data-elem-id="'+id+'"] .tn-atom');}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
var card=document.querySelector('#hv-hero .hv-card');
var names=card&&card.querySelector('.hv-names');
var dateRow=card&&card.querySelector('.hv-date');
var built=false,bsm,introTop,introAfter,wday,v3,vphoto,det;
function build(){
  if(built)return;built=true;
  if(card&&names){
    bsm=el('p','l4-bsm');introTop=el('p','l4-intro l4-intro--top');introAfter=el('p','l4-intro l4-intro--after');
    card.insertBefore(bsm,card.firstChild);card.insertBefore(introTop,names);names.parentNode.insertBefore(introAfter,names.nextSibling);
    if(dateRow){wday=el('p','l4-wday');card.insertBefore(wday,dateRow);}
    var vp=card.querySelector('.hv-venue');if(vp){v3=el('span','cl-line l4-v3');vp.appendChild(v3);}
  }
  var st=document.querySelector('#vn-venue .vn-stage'),ad=st&&st.querySelector('.vn-addr');
  if(st&&ad){vphoto=el('figure','l4-vphoto');var im=new Image();im.src=X.venuePhoto;im.alt='';im.decoding='async';im.loading='lazy';vphoto.appendChild(im);ad.parentNode.insertBefore(vphoto,ad.nextSibling);}
  var vr=document.getElementById('venue');
  if(vr){det=el('section','l4d');det.id='l4-details';det.innerHTML='<div class="l4d-stage"></div>';vr.parentNode.insertBefore(det,vr.nextSibling);
    if('IntersectionObserver' in window&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){det.classList.add('l4d--armed');
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){det.classList.add('l4d--in');io.disconnect();}});},{threshold:.2});io.observe(det);}}
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function details(D){
  var r=D.rows.map(function(x){return '<div class="l4d-row"><span class="l4d-time">'+esc(x[0])+'</span><i class="l4d-dot"></i><span class="l4d-what">'+esc(x[1])+'</span></div>';}).join('');
  return '<p class="l4d-eyebrow">'+esc(D.eyebrow)+'</p><h2 class="l4d-title">'+esc(D.title)+'</h2>'
    +'<div class="l4d-card">'+r+'<p class="l4d-follow">'+esc(D.follow)+'</p></div>'
    +'<div class="l4d-rule"></div><p class="l4d-eyebrow">'+esc(D.dressEyebrow)+'</p><p class="l4d-dress">'+esc(D.dress)+'</p>'
    +(D.dressSub?'<p class="l4d-sub">'+esc(D.dressSub)+'</p>':'')+'<p class="l4d-note">'+esc(D.dressNote)+'</p>'
    +'<figure class="l4d-attire"><img src="'+X.attire+'" alt="'+esc(D.attireAlt)+'" width="459" height="576" decoding="async" loading="lazy" draggable="false"></figure>';
}
function apply(g){
  build();
  var L=T[g],B=(window.__clT||{})[g]||{};
  lang=g;
  if(window.__clSetLang)window.__clSetLang(g);
  document.body.classList.toggle('cl-ar',g==='ar');
  document.documentElement.setAttribute('lang',g);
  Object.keys(B).forEach(function(k){if(typeof B[k]==='string')setT(k,B[k]);});
  setLine('eyebrow1','');setLine('eyebrow2','');setLine('time1','');setLine('time2','');setLine('dress1','');setLine('dress2','');
  setT('name1',L.name1);setT('amp',L.amp);setT('name2',L.name2);
  if(names)names.classList.toggle('hv-names--ar',g==='ar');
  ['dateM','dateD','dateY','tileD','tileM','tileY','cdDate','vnName','vnAddr'].forEach(function(k){setT(k,L[k]);});
  setLine('venue1',L.venue1);setLine('venue2',L.venue2);
  if(v3){v3.textContent=L.venue3;v3.style.display=L.venue3?'':'none';}
  if(bsm){bsm.textContent=L.bsm;bsm.style.display=L.bsm?'':'none';}
  if(introTop){introTop.innerHTML=L.introTop;introTop.style.display=L.introTop?'':'none';}
  if(introAfter){introAfter.innerHTML=L.introAfter;introAfter.style.display=L.introAfter?'':'none';}
  if(wday)wday.textContent=L.wday;
  /* بسم الله في الكارت الأول بالعربي — من غير ما تتكرر فوق الآية */
  var vb=document.querySelector('[data-elem-id="cl90"]');if(vb)vb.style.display=g==='ar'?'none':'';
  if(vphoto){var vi=vphoto.querySelector('img');if(vi)vi.alt=L.venuePhotoAlt;}
  if(det)det.querySelector('.l4d-stage').innerHTML=details(L.details);
  var note=document.querySelector('.cl-note');if(note){note.innerHTML=L.note;var w=note.closest('.cl-note-wrap');if(w)w.style.display='';note.style.display='';}
  var o=tn('1777183175514000001'),h=tn('1710522265387'),n=tn('1710522265391');
  if(o){o.textContent=L.open;o.style.fontFamily=g==='ar'?"'Amiri', serif":'';}
  if(h){h.textContent=L.hope;h.style.fontFamily=g==='ar'?"'Aref Ruqaa', 'Amiri', serif":'';h.style.direction=g==='ar'?'rtl':'';}
  if(n){n.textContent=L.closingNames;n.style.fontFamily=g==='ar'?"'Aref Ruqaa', 'Amiri', serif":'';n.style.direction=g==='ar'?'rtl':'';}
  var fn=document.getElementById('rs-name'),fm=document.getElementById('rs-msg');
  if(fn&&B.namePh)fn.placeholder=B.namePh;if(fm&&B.msgPh)fm.placeholder=B.msgPh;
  document.title=L.title;
  if(btn){btn.innerHTML=g==='ar'?'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="8" cy="8" r="6.3"/><path d="M1.8 8h12.4M8 1.7c1.9 2 2.8 4.1 2.8 6.3S9.9 12.3 8 14.3M8 1.7C6.1 3.7 5.2 5.8 5.2 8s.9 4.3 2.8 6.3"/></svg><span>English</span>':'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="8" cy="8" r="6.3"/><path d="M1.8 8h12.4M8 1.7c1.9 2 2.8 4.1 2.8 6.3S9.9 12.3 8 14.3M8 1.7C6.1 3.7 5.2 5.8 5.2 8s.9 4.3 2.8 6.3"/></svg><span class="ar">عربي</span>';
    btn.setAttribute('aria-label',L.toggleLabel);btn.setAttribute('lang',g==='ar'?'en':'ar');}
}
var btn=el('button','');btn.id='l4-lang';btn.type='button';
btn.addEventListener('click',function(e){e.stopPropagation();var g=lang==='ar'?'en':'ar';apply(g);try{sessionStorage.setItem('l4_lang',g);}catch(x){}});
function showBtn(){if(btn.classList.contains('on'))return;btn.classList.add('on');requestAnimationFrame(function(){requestAnimationFrame(function(){btn.classList.add('show');});});}
function start(){
  document.body.appendChild(btn);
  apply(lang);
  var hero=document.getElementById('hv-hero');
  if(hero&&window.MutationObserver){if(hero.classList.contains('hv--play'))showBtn();
    new MutationObserver(function(){if(hero.classList.contains('hv--play'))showBtn();}).observe(hero,{attributes:true,attributeFilter:['class']});}
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('.popup-enter'))setTimeout(showBtn,2600);},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();</script>`;
}

module.exports = {
  shortId: SHORT,
  // لغات الدعوة: ?lang=ar|en (أو /ar و /en) بيرسم الصفحة وكارت المشاركة باللغة دي — الافتراضي إنجليزي (لغة البيانات)
  langs: ['en', 'ar'],
  shareByLang: {
    en: { title: 'Ahmed & Jilan — Wedding Invitation', description: 'Friday, 8 January 2027 · Akhenaton Hall, Dar El Marasem – Police Officers Club, Gezira' },
    ar: { title: 'دعوة زفاف چيلان و أحمد', description: 'الجمعة ٨ يناير ٢٠٢٧ · دار المراسم لضباط الشرطة – الجزيرة، قاعة إخناتون' },
  },

  render({ editMode } = {}) {
    if (editMode) return {};
    return { head: `<style id="l4-style">${CSS}</style>`, bodyEnd: clientScript() };
  },

  transform(html, { editMode } = {}) {
    if (editMode) return html;
    let out = html;
    // الأغنية: Perfect (Ed Sheeran) instrumental اللي بعتها المالك — مكان أغنية القالب (العميل ماختارش أغنية)
    out = out.replace('<source src="/templates/champagne-lace/song.mp3"', () => `<source src="${IMG('song.mp3')}"`);
    // الفورم بيكلّم الضيف بلغة الصفحة وقت الإرسال (رسايل الشكر/الأخطاء) — بنخلي القاموس بتاعه يتبدّل مع الزرار
    out = out.replace('var L = T[LANG];', () => 'var L = T[LANG]; window.__clT = T; window.__clSetLang = function (g) { if (T[g]) { LANG = g; L = T[g]; } };');
    // الألبوم: صور العروسين التلاتة (علامة المصوّر على الشمال تحت، فالقص من اليمين بس)
    out = out
      .replace(/(<img data-elem-id="cl62" src=")[^"]*(" alt="[^"]*" style=")[^"]*(")/, (m, a, b, c) => `${a}${IMG('p1.webp')}${b}object-position:0% 50%${c}`)
      .replace(/(<img data-elem-id="cl63" src=")[^"]*(" alt="[^"]*" style=")[^"]*(")/, (m, a, b, c) => `${a}${IMG('p2.webp')}${b}object-position:50% 50%${c}`)
      .replace(/(<img data-elem-id="cl64" src=")[^"]*(" alt="[^"]*" style=")[^"]*(")/, (m, a, b, c) => `${a}${IMG('p3.webp')}${b}object-position:0% 50%${c}`)
      .replace(/\s*<figure class="al-card" data-i="3">[\s\S]*?<\/figure>/, '')
      .replace('<i data-i="3"></i>', '')
      .replace('<span>/ 04</span>', '<span>/ 03</span>');
    return out;
  },
};
