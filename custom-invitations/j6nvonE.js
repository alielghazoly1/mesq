// دعوة j6nvonE (قالب Ivory Swans) — حيان وفرح، الأربعاء 6/1/2027 الساعة 7:30 مساءً، فندق ماريوت عمّان. بطلب المالك (2026-11-28):
//  • الفتحة = فتحة Mother of Pearl (ظرف الصدف بختم القلب → الفيونكة → الكارت — /templates/mother-of-pearl/open.mp4) فوق
//    الدعوة؛ الضغطة بتشغّل الأغنية، وفي آخر الفيديو بندوس زرار فتح القالب نفسه (.popup-enter) فالطيور والنزول التلقائي
//    وزرار الصوت بيشتغلوا زي ما هم، والفيديو بيختفي بالراحة.
//  • عربي (الافتراضي) وإنجليزي بزرار ع | EN فوق على اليمين — بيقلب الكلام في مكانه من غير ما الصفحة تتحمّل تاني
//    (الاختيار بيتفتكر، و?lang=en بيفتحها إنجليزي).
//  • الأسامي والتاريخ والمكان واللينك من oneOffFix j6nvonE-hayyan-farah (الساعة متخزّنة 18:30 عشان العدّاد يخلص 7:30
//    بتوقيت عمّان)، والأهل: والد العريس عبدالفتاح عبدالرحمان، والد العروس سليم عرفه.
//  • العروسين (رسمة المالك — اتقصّت من الصورة اللي بعتها) جوه كارت الآية تحت على اليمين.
//  • قسم جديد بنفس شكل القالب قبل المكان: الحفل بيبدأ 7:30 مساءً في ليلة هادئة + الحفل للكبار فقط.
//  • صورة القاعة الافتراضية (مش قاعتهم) اتشالت. الصور في client/public/custom/j6nvonE/.
const { asset } = require('./_asset');

const SHORT = 'j6nvonE';
const A = (f) => asset(`/custom/${SHORT}/${f}`);
const MOP = (f) => asset(`/templates/mother-of-pearl/${f}`);
const MAP_Q = 'Amman Marriott Hotel, Amman, Jordan';

const TEXTS = {
  ar: {
    title: 'حيان وفرح | دعوة زفاف',
    tap: 'اضغط لفتح الدعوة',
    names: ['حيان', 'فرح'], amp: '&',
    heroDate: '٠٦ . ٠١ . ٢٠٢٧',
    cdTitle: 'بدأ العدّ لليلتنا',
    cdLabels: ['يوم', 'ساعة', 'دقيقة', 'ثانية'],
    iv12: 'احفظ الموعد',
    month: 'يناير ٢٠٢٧',
    stdSub: 'الأربعاء ٦ يناير ٢٠٢٧ — ٧:٣٠ مساءً',
    iv14: 'هنا', iv15: 'تبدأ', iv16: 'الحكاية',
    iv17: 'حفل زفافنا',
    iv18: 'بداية أجمل<br>حكاية',
    iv19: 'وهذه ليلتنا التي تملؤها السعادة والدفء، نتمنى أن تزيّنها وجوهكم وتكتمل فرحتنا بحضوركم،',
    iv20: 'لنلتقي على الفرح، ونشهد بداية عمرٍ جديد، تحيطه المحبة وتباركه الدعوات. 🤍',
    iv21: 'بمباركة أهلهما الكرام',
    iv22: 'عائلة عبدالرحمان وعائلة عرفه',
    iv23: 'والد العريس', iv24: 'السيد عبدالفتاح عبدالرحمان',
    iv25: 'والد العروس', iv26: 'السيد سليم عرفه',
    iv27: 'بقلوبٍ مفعمة بالفرح والامتنان، يتشرّف الأهل بدعوتكم لمشاركتهم هذه الليلة المباركة',
    nEyebrow: 'موعد الحفل',
    nTime: 'يبدأ الحفل الساعة ٧:٣٠ مساءً',
    nSub: 'في ليلةٍ هادئة',
    nNote: 'يُرجى العلم بأن الحفل مخصّص للكبار فقط، متمنّين لأطفالكم الأحبّة نوماً هنيئاً وليلةً سعيدة',
    iv28: 'مكان الحفل',
    venue: 'فندق ماريوت عمّان', venueSub: 'عمّان، الأردن',
    iv41: 'الموقع على الخريطة',
    rEyebrow: 'تأكيد الحضور', rTitle: 'يسعدنا تأكيد حضوركم', rIntro: 'نرجو كتابة الاسم وتأكيد الحضور',
    rName: 'الاسم الكامل', rYes: 'سأحضر بكل سرور', rNo: 'أعتذر عن الحضور', rNote: 'رسالة للعروسين (اختياري)',
    rSubmit: 'تأكيد الحضور', rDoneTitle: 'تم تأكيد حضوركم', rDoneMsg: 'وصلنا ردّكم، شكراً لمشاركتنا فرحتنا 🤍',
  },
  en: {
    title: 'Hayyan & Farah | Wedding Invitation',
    tap: 'Tap to open the invitation',
    names: ['Hayyan', 'Farah'], amp: '&',
    heroDate: '06.01.2027',
    cdTitle: 'The celebration begins.',
    cdLabels: ['Days', 'Hours', 'Minutes', 'Seconds'],
    iv12: 'SAVE THE DATE',
    month: 'JANUARY 2027',
    stdSub: 'Wednesday, 6 January 2027 — 7:30\u00a0PM',
    iv14: 'Here', iv15: 'Starts', iv16: 'Forever',
    iv17: 'OUR WEDDING',
    iv18: 'The beginning of<br>our story',
    iv19: 'This is our night, full of joy and warmth — we hope your faces will grace it and complete our happiness,',
    iv20: 'as we gather in joy and witness the start of a new life, surrounded by love and blessed by your prayers. 🤍',
    iv21: 'With the blessing of their families',
    iv22: 'The Abdulrahman & Arafeh families',
    iv23: 'Father of the groom', iv24: 'Mr. Abdelfattah Abdulrahman',
    iv25: 'Father of the bride', iv26: 'Mr. Salim Arafeh',
    iv27: 'With hearts full of joy and gratitude, the families are honoured to invite you to share this blessed night',
    nEyebrow: 'THE EVENING',
    nTime: 'The celebration begins at 7:30\u00a0PM',
    nSub: 'for a calm, intimate evening',
    nNote: 'Kindly note that this celebration is for adults only — wishing your little ones sweet dreams and a lovely night',
    iv28: 'THE VENUE',
    venue: 'Amman Marriott Hotel', venueSub: 'Amman, Jordan',
    iv41: 'View on map',
    rEyebrow: 'RSVP', rTitle: 'Kindly confirm your attendance', rIntro: 'Please write your name and let us know if you can join us',
    rName: 'Full name', rYes: 'Joyfully accept', rNo: 'Regretfully decline', rNote: 'A message for the couple (optional)',
    rSubmit: 'Confirm attendance', rDoneTitle: 'Your attendance is confirmed', rDoneMsg: 'Thank you — we received your reply and can’t wait to celebrate with you 🤍',
  },
};

const HEAD = `<link rel="preload" as="image" href="${MOP('poster.webp')}">
<link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap" rel="stylesheet">
<script>
(function(){var C=window.WEDDING_CONFIG||{};var q=/[?&]lang=(ar|en)/.exec(location.search);var L=q?q[1]:'';
try{if(!L)L=localStorage.getItem('j6-lang')||''}catch(e){}
if(L!=='en')L='ar';window.J6_LANG=L;document.documentElement.classList.add('j6-'+L);
// تغيير اللغة من غير الغلاف: الدعوة اتفتحت قبل كده في نفس الزيارة
window.J6_SKIP=location.hash==='#in';if(window.J6_SKIP){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
if(!C.autoOpen&&!window.J6_SKIP)document.documentElement.classList.add('j6-cover-on');})();
</script>
<style id="j6-css">
/* ===== فتحة Mother of Pearl ===== */
#j6Cover{position:fixed;inset:0;z-index:2147483000;background:#f4ede3;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .9s ease}
#j6Cover.out{opacity:0;pointer-events:none}
#j6Cover video,#j6Cover .j6-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
#j6Cover video{opacity:0;transition:opacity .35s ease}
#j6Cover.play video{opacity:1}
#j6Cover .j6-tap{position:absolute;left:50%;top:70%;transform:translateX(-50%);margin:0;white-space:nowrap;padding:8px 22px;border-radius:999px;background:rgba(255,250,243,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border:1px solid rgba(176,141,90,.35);text-align:center;font-family:'Amiri','Times New Roman',serif;font-weight:700;font-size:21px;line-height:1.5;color:#6f5641;box-shadow:0 6px 18px -10px rgba(74,54,36,.45);animation:j6Pulse 2.4s ease-in-out infinite;pointer-events:none}
html.j6-en #j6Cover .j6-tap{font-family:'EB Garamond','Ovo',serif;font-style:italic;font-weight:400;font-size:21px;letter-spacing:.06em}
#j6Cover.play .j6-tap{animation:none;opacity:0;transition:opacity .3s}
@keyframes j6Pulse{0%,100%{opacity:1}50%{opacity:.62}}
html.j6-en #fb-section,html.j6-en #loc-section{direction:ltr}
html.j6-cover-on body{overflow:hidden}
/* ===== زرار اللغة ===== */
#j6Lang{position:fixed;top:14px;right:14px;z-index:2147483100;display:flex;gap:3px;padding:3px;border-radius:999px;background:rgba(255,250,243,.88);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border:1px solid rgba(180,150,110,.35);box-shadow:0 6px 18px -8px rgba(74,54,36,.35);direction:ltr}
#j6Lang button{border:0;background:transparent;cursor:pointer;padding:5px 12px;border-radius:999px;font:600 12.5px/1.2 'EB Garamond','Ovo',serif;letter-spacing:.06em;color:#8a6e4e}
#j6Lang button.ar{font-family:'Amiri',serif;font-size:14px}
#j6Lang button.on{background:#7c6248;color:#fff8ef;box-shadow:0 1px 3px rgba(0,0,0,.15)}
/* ===== الأسامي بالعربي ===== */
html.j6-ar [data-elem-id="1779566247730000001"] .tn-atom{font-family:'Aref Ruqaa','Amiri',serif!important;line-height:1.15!important}
/* ===== العروسين جوه كارت الآية ===== */
.wg-frame-verse{position:relative}
.j6-couple{position:absolute;right:-6%;bottom:3%;width:34%;max-width:170px;height:auto;z-index:5;pointer-events:none;filter:drop-shadow(0 8px 14px rgba(74,54,36,.22));opacity:0;transform:translateY(14px);transition:opacity 1.1s ease,transform 1.1s ease}
.j6-couple.in{opacity:1;transform:none}
/* ===== موعد الحفل + للكبار فقط ===== */
#j6Night{background:#f9e6d4;padding:56px 26px 60px;text-align:center;direction:rtl}
html.j6-en #j6Night{direction:ltr}
#j6Night .j6-eyebrow{display:flex;align-items:center;justify-content:center;gap:12px;color:#b08d5a;font:italic 15px/1 'EB Garamond',serif;letter-spacing:.22em;text-transform:uppercase;margin-bottom:18px}
html.j6-ar #j6Night .j6-eyebrow{font:700 17px/1.4 'Amiri',serif;letter-spacing:0;font-style:normal}
#j6Night .j6-eyebrow .line{width:46px;height:1px;background:#c9ad7a}
#j6Night .j6-time{font-family:'Amiri',serif;font-weight:700;font-size:27px;line-height:1.5;color:#4a3624;margin:0}
html.j6-en #j6Night .j6-time{font-family:'Ovo','EB Garamond',serif;font-weight:400;font-size:25px}
#j6Night .j6-sub{font-family:'EB Garamond',serif;font-style:italic;font-size:19px;color:#8a6e4e;margin:4px 0 0}
html.j6-ar #j6Night .j6-sub{font-family:'Amiri',serif;font-style:normal;font-size:20px}
#j6Night .j6-orn{color:#c9ad7a;font-size:20px;margin:20px 0 18px}
#j6Night .j6-note{max-width:430px;margin:0 auto;padding:18px 20px;border:1px solid rgba(201,173,122,.55);border-radius:14px;background:rgba(255,250,243,.6);font-family:'Amiri',serif;font-size:17.5px;line-height:1.85;color:#5c4632}
html.j6-en #j6Night .j6-note{font-family:'EB Garamond',serif;font-size:17.5px;line-height:1.6}
#j6Night .j6-note .ic{display:block;font-size:20px;margin-bottom:6px;color:#b08d5a}
#j6Night .j6-r{opacity:0;transform:translateY(14px);transition:opacity .9s ease,transform .9s ease}
#j6Night.in .j6-r{opacity:1;transform:none}
#j6Night.in .j6-r:nth-child(2){transition-delay:.12s}#j6Night.in .j6-r:nth-child(3){transition-delay:.24s}#j6Night.in .j6-r:nth-child(4){transition-delay:.36s}#j6Night.in .j6-r:nth-child(5){transition-delay:.48s}
/* صورة القاعة الافتراضية مش قاعتهم */
[data-elem-id="iv5"]{display:none!important}
</style>`;

const NIGHT = `<section id="j6Night" aria-label="">
<div class="j6-eyebrow j6-r"><span class="line"></span><span data-j6="nEyebrow"></span><span class="line"></span></div>
<p class="j6-time j6-r" data-j6="nTime"></p>
<p class="j6-sub j6-r" data-j6="nSub"></p>
<div class="j6-orn j6-r">❦</div>
<p class="j6-note j6-r"><span class="ic">✦</span><span data-j6="nNote"></span></p>
</section>`;

function bodyEnd() {
  const cfg = JSON.stringify({ T: TEXTS, couple: A('couple.webp'), open: MOP('open.mp4'), poster: MOP('poster.webp'), night: NIGHT })
    .replace(/</g, '\\u003c');
  return `<script>(function(){
var K=${cfg};var C=window.WEDDING_CONFIG||{};var L=window.J6_LANG||'ar';var EDIT=!!C.autoOpen&&!window.J6_SKIP;
var $=function(s,r){return (r||document).querySelector(s)};var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var by=function(id){return document.querySelector('[data-elem-id="'+id+'"]')};
var atom=function(id){var e=by(id);return e?(e.querySelector('.tn-atom')||e):null};
var put=function(el,v,html){if(!el||v==null)return;if(html){if(el.innerHTML!==v)el.innerHTML=v}else if(el.textContent!==v)el.textContent=v};

/* ===== القسم الجديد قبل المكان ===== */
(function(){var loc=document.getElementById('loc-section');if(!loc||document.getElementById('j6Night'))return;
 var w=document.createElement('div');w.innerHTML=K.night;loc.parentNode.insertBefore(w.firstChild,loc);
 var n=document.getElementById('j6Night');if(EDIT||!('IntersectionObserver' in window)){n.classList.add('in');return}
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){n.classList.add('in');io.disconnect()}})},{threshold:.2});io.observe(n);})();

/* ===== العروسين جوه كارت الآية ===== */
(function(){var fr=$('.wg-frame-verse');if(!fr||$('.j6-couple',fr))return;var im=document.createElement('img');im.className='j6-couple';im.src=K.couple;im.alt='';im.setAttribute('aria-hidden','true');im.decoding='async';fr.appendChild(im);
 if(EDIT||!('IntersectionObserver' in window)){im.classList.add('in');return}
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){im.classList.add('in');io.disconnect()}})},{threshold:.35});io.observe(fr);})();

/* ===== الكلام باللغة ===== */
function apply(){var T=K.T[L];
 document.title=T.title;
 var nm=atom('1779566247730000001');put(nm,T.names[0]+'<br><br><br>'+T.names[1],true);
 put(atom('1779566247730000004'),T.amp);put(atom('1779566247730000003'),T.heroDate);
 put(atom('1771277026942000001'),T.cdTitle);
 $$('#countdownContainer .label').forEach(function(e,i){put(e,T.cdLabels[i])});
 ['iv12','iv14','iv15','iv16','iv17','iv19','iv20','iv21','iv22','iv23','iv24','iv25','iv26','iv27','iv28','iv41'].forEach(function(k){put(by(k),T[k])});
 put(by('iv18'),T.iv18,true);
 put(document.getElementById('stdcal-month'),T.month);put(by('iv40'),T.stdSub);
 $$('.loc-hall-name,.loc-map-labels .name').forEach(function(e){put(e,T.venue)});put(by('iv30'),T.venueSub);
 $$('[data-j6]').forEach(function(e){put(e,T[e.getAttribute('data-j6')])});
 put(document.getElementById('mrsvp-eyebrow'),T.rEyebrow);put(document.getElementById('mrsvp-title'),T.rTitle);put(document.getElementById('mrsvp-intro'),T.rIntro);
 var n=document.getElementById('mrsvp-name');if(n)n.placeholder=T.rName;var no=document.getElementById('mrsvp-note');if(no)no.placeholder=T.rNote;
 var y=document.getElementById('mrsvp-yes-lbl'),x=document.getElementById('mrsvp-no-lbl');if(y&&y.lastChild)y.lastChild.textContent=' '+T.rYes;if(x&&x.lastChild)x.lastChild.textContent=' '+T.rNo;
 put(document.getElementById('mrsvp-submit'),T.rSubmit);put(document.getElementById('mrsvp-done-title'),T.rDoneTitle);put(document.getElementById('mrsvp-done-msg'),T.rDoneMsg);
 var cv=document.getElementById('j6Cover');if(cv)put($('.j6-tap',cv),T.tap);
 document.documentElement.classList.toggle('j6-ar',L==='ar');document.documentElement.classList.toggle('j6-en',L==='en');
 $$('#j6Lang button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-l')===L)});}
apply();document.addEventListener('DOMContentLoaded',apply);window.addEventListener('load',function(){apply();setTimeout(apply,600);setTimeout(apply,2500)});
// القالب بيكتب الشهر في النتيجة وسطر التاريخ والقاعة بنفسه (بتوقيت مصر) — بنرجّع كلامنا لو اتغيّر
['stdcal-month'].forEach(function(id){var e=document.getElementById(id);if(e)new MutationObserver(function(){var T=K.T[L];if(e.textContent!==T.month)e.textContent=T.month}).observe(e,{childList:true,characterData:true,subtree:true})});
(function(){var e=by('iv40');if(e)new MutationObserver(function(){var T=K.T[L];if(e.textContent!==T.stdSub)e.textContent=T.stdSub}).observe(e,{childList:true,characterData:true,subtree:true})})();

/* ===== زرار اللغة (ع | EN) ===== */
if(!EDIT){var bar=document.createElement('div');bar.id='j6Lang';bar.setAttribute('role','group');bar.setAttribute('aria-label','Language');
 [['ar','ع'],['en','EN']].forEach(function(o){var b=document.createElement('button');b.type='button';b.className=o[0]+(o[0]===L?' on':'');b.setAttribute('data-l',o[0]);b.textContent=o[1];
  b.addEventListener('click',function(e){e.stopPropagation();if(L===o[0])return;L=o[0];try{localStorage.setItem('j6-lang',L)}catch(err){}apply()});bar.appendChild(b)});
 document.body.appendChild(bar);
 var place=function(){var vv=window.visualViewport;if(!vv)return;bar.style.right='auto';bar.style.left=Math.round(vv.offsetLeft+vv.width-bar.offsetWidth-14)+'px';bar.style.top=Math.round(vv.offsetTop+14)+'px'};
 place();window.addEventListener('load',place);if(window.visualViewport){visualViewport.addEventListener('resize',place);visualViewport.addEventListener('scroll',place)}}

/* ===== فتحة Mother of Pearl ===== */
var enter=function(){var b=document.querySelector('.popup-enter');if(!b)return;var rec=b.closest('.t-rec');try{b.click()}catch(e){}
 // ظرف القالب نفسه مايبانش بعد فيديو الصدف — الطيور والأغنية والنزول التلقائي بيكمّلوا زي ما هم
 if(rec)setTimeout(function(){rec.style.transition='opacity .5s ease';rec.style.opacity='0';setTimeout(function(){rec.style.display='none'},520)},60)};
if(EDIT)return;
if(window.J6_SKIP){var w0=function(){if(document.querySelector('.popup-enter'))enter();else setTimeout(w0,120)};w0();return}
var cv=document.createElement('div');cv.id='j6Cover';cv.setAttribute('role','button');cv.setAttribute('tabindex','0');
cv.innerHTML='<img class="j6-poster" src="'+K.poster+'" alt="" draggable="false"><video playsinline webkit-playsinline muted preload="auto" poster="'+K.poster+'"></video><p class="j6-tap"></p>';
document.body.appendChild(cv);apply();
var fit=function(){var vv=window.visualViewport;if(!vv)return;cv.style.left=vv.offsetLeft+'px';cv.style.top=vv.offsetTop+'px';cv.style.width=vv.width+'px';cv.style.height=vv.height+'px';cv.style.right='auto';cv.style.bottom='auto'};
fit();if(window.visualViewport){visualViewport.addEventListener('resize',fit);visualViewport.addEventListener('scroll',fit)}
var v=$('video',cv);v.src=K.open;var opened=false,done=false,started=false;
function finish(){if(done)return;done=true;enter();cv.classList.add('out');document.documentElement.classList.remove('j6-cover-on');setTimeout(function(){if(cv.parentNode)cv.parentNode.removeChild(cv)},950)}
function open(){if(opened)return;opened=true;
 var au=document.getElementById('invitation-audio');if(au){try{au.muted=false;var pa=au.play();if(pa&&pa.catch)pa.catch(function(){})}catch(e){}}
 cv.classList.add('play');var p;try{p=v.play()}catch(e){finish();return}if(p&&p.catch)p.catch(finish);
 setTimeout(function(){if(!started)finish()},5000);setTimeout(finish,13000);
 v.addEventListener('timeupdate',function(){if(v.currentTime>.05)started=true;if(v.duration&&v.duration-v.currentTime<=.9)finish()});
 v.addEventListener('ended',finish);v.addEventListener('error',finish);}
cv.addEventListener('click',open);cv.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
cv.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
})();</script>`;
}

module.exports = {
  shortId: SHORT,
  // الخريطة على الفندق نفسه (اللينك القصير بتاع المالك مابيتحطش في خريطة مدمجة)
  fields: {
    venueMapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(MAP_Q)}&output=embed`,
  },
  share: {
    title: 'حيان & فرح — دعوة زفاف 🤍',
    description: 'الأربعاء ٦ يناير ٢٠٢٧ · ٧:٣٠ مساءً · فندق ماريوت عمّان',
  },
  render() {
    return { head: HEAD, bodyEnd: bodyEnd() };
  },
};
