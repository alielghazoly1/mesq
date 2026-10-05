// utils/customInvitations.js
// دعوات "كاستم" معمولة بإيدينا لعميل معيّن (custom-invitations/<shortId>.js).
//
// المحتوى بيتطبّق وقت العرض فوق الدعوة المحفوظة — نفس آلية تخصيصات المحرر
// (نصوص/إخفاء/فورم الحضور/كارت المشاركة) + طبقة صغيرة للحاجات اللي المحرر
// مالوش فيها (صور من الموقع نفسه، أقسام جديدة بنفس شكل القالب، لغة النتيجة).
// أي دعوة مش في القايمة دي بتتعرض زي ما هي بالظبط.
const QICmvQj = require('../custom-invitations/QICmvQj');

const CUSTOM = { [QICmvQj.shortId]: QICmvQj };

function getCustomInvitation(shortId) {
  return Object.prototype.hasOwnProperty.call(CUSTOM, shortId) ? CUSTOM[shortId] : null;
}

/** نسخة من بيانات الدعوة بالمحتوى المخصوص فوقها (مابتعدّلش المستند الأصلي) */
function applyCustomData(invitation, custom) {
  const base = typeof invitation.toObject === 'function' ? invitation.toObject() : { ...invitation };
  const c = base.customizations || {};
  return {
    ...base,
    ...custom.fields,
    customizations: {
      ...c,
      texts: { ...(c.texts || {}), ...custom.texts, ...custom.dateTexts(custom.fields.weddingDateTime || base.weddingDateTime) },
      hidden: [...new Set([...(c.hidden || []), ...(custom.hidden || [])])],
      rsvp: { ...(c.rsvp || {}), ...(custom.rsvp || {}) },
      share: { ...(c.share || {}), title: custom.share.title, description: custom.share.description },
    },
  };
}

const MOIS = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

const STYLE = `
/* الدعوة كلها فرنساوي: اتجاه شمال→يمين (غير كده النقط والنقطتين بيترصّوا أول السطر)
   — ما عدا الآية العربي */
body,body *:not([data-elem-id="iv8"]):not([data-elem-id="iv9"]):not([data-elem-id="iv31"]):not([data-elem-id="iv32"]){direction:ltr!important;}
#mrsvp input,#mrsvp textarea,input,textarea{text-align:left!important;}
[data-elem-id="iv10"],[data-elem-id="iv27"]{white-space:pre-line;}
[data-elem-id="iv10"]{font-size:13.5px!important;line-height:1.5!important;}
.fb-card .name{font-family:'EB Garamond',serif!important;font-weight:600!important;font-size:18px!important;line-height:1.3;}
.qic-section{position:relative;background:#f9e6d4;padding:56px 22px 60px;text-align:center;direction:ltr;}
.qic-eyebrow{display:flex;align-items:center;justify-content:center;gap:18px;}
.qic-eyebrow .line{display:inline-block;width:55px;height:1px;background:#c9ad7a;}
.qic-eyebrow .word{font-family:'EB Garamond',serif;letter-spacing:3px;font-size:15px;color:#af9b6a;}
.qic-flourish{color:#c9ad7a;font-size:20px;margin:14px 0 22px;}
.qic-cards{display:flex;gap:14px;justify-content:center;max-width:520px;margin:0 auto;}
.qic-card{flex:1;background:#fffaf2;border:1px solid rgba(201,173,122,.45);border-radius:14px;padding:22px 10px;box-shadow:0 14px 30px -18px rgba(74,59,40,.35);}
.qic-label{font-family:'EB Garamond',serif;letter-spacing:2.5px;font-size:13px;color:#af9b6a;margin-bottom:8px;}
.qic-time{font-family:'EB Garamond',serif;font-size:21px;color:#4a3624;}
.qic-important{max-width:520px;margin:0 auto 34px;background:#fffaf2;border:1px solid rgba(201,173,122,.55);border-radius:14px;padding:20px 18px;}
.qic-important p{margin:0;font-family:'EB Garamond',serif;font-size:17px;line-height:1.6;color:#4a3624;}
.qic-closing p{margin:0;font-family:'EB Garamond',serif;font-size:18px;line-height:1.65;color:#5a4632;}
.qic-closing .qic-script{font-style:italic;font-size:21px;color:#4a3624;}
.qic-rule{width:70px;height:1px;background:linear-gradient(90deg,transparent,#c9ad7a,transparent);margin:0 auto 18px;}
`;

/** CSS + سكريبت الدعوة دي — بيتحطوا آخر الصفحة بعد تخصيصات المحرر */
function customInvitationTags(custom) {
  const cfg = {
    images: custom.images || {},
    rsvpEyebrow: custom.rsvpEyebrow || '',
    programHtml: custom.programHtml || '',
    noticeHtml: custom.noticeHtml || '',
    mois: MOIS,
    jours: JOURS,
  };
  const json = JSON.stringify(cfg).replace(/</g, '\\u003c');
  const script = `(function(){
var C=${json};
function imgs(){Object.keys(C.images).forEach(function(id){
  var host=document.querySelector('[data-elem-id="'+id+'"]');
  var el=host&&(host.tagName==='IMG'?host:host.querySelector('img'));
  if(!el||el.getAttribute('src')===C.images[id])return;
  el.removeAttribute('srcset');el.removeAttribute('data-original');el.src=C.images[id];
});}
function cal(){
  var cd=(window.WEDDING_CONFIG||{}).countdown||{};
  var m=document.getElementById('stdcal-month');
  if(m&&cd.monthIndex!=null){var t=C.mois[cd.monthIndex]+' '+cd.year;if(m.textContent!==t)m.textContent=t;}
  var wd=document.querySelectorAll('#stdcal-grid .stdcal-wd');
  if(wd.length===7)for(var i=0;i<7;i++)if(wd[i].textContent!==C.jours[i])wd[i].textContent=C.jours[i];
}
function cdLabels(){var L=['Jours','Heures','Minutes','Secondes'];var els=document.querySelectorAll('#countdownContainer .label');if(els.length===4)for(var i=0;i<4;i++)if(els[i].textContent!==L[i])els[i].textContent=L[i];}
function scrollWord(){var w=document.querySelector('.wg-scroll-word');if(w&&w.textContent!=='Faites défiler')w.textContent='Faites défiler';}
function rsvp(){var e=document.getElementById('mrsvp-eyebrow');if(e&&C.rsvpEyebrow&&e.textContent!==C.rsvpEyebrow)e.textContent=C.rsvpEyebrow;}
function sections(){
  var loc=document.getElementById('loc-section');
  if(!loc||document.getElementById('qic-program'))return;
  var a=document.createElement('div');a.id='qic-program';a.className='qic-section';a.innerHTML=C.programHtml;
  loc.parentNode.insertBefore(a,loc);
  var b=document.createElement('div');b.id='qic-notice';b.className='qic-section';b.innerHTML=C.noticeHtml;
  loc.parentNode.insertBefore(b,loc.nextSibling);
}
function all(){try{imgs();cal();cdLabels();scrollWord();rsvp();sections();}catch(e){}}
all();
document.addEventListener('DOMContentLoaded',all);
window.addEventListener('load',all);
var n=0,t=setInterval(function(){all();if(++n>40)clearInterval(t);},250);
if(window.MutationObserver){var q=false;new MutationObserver(function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;all();});}).observe(document.documentElement,{childList:true,subtree:true});}
})();`;
  return `<style id="qic-style">${STYLE}</style><script id="qic-script">${script}</script>`;
}

module.exports = { getCustomInvitation, applyCustomData, customInvitationTags };
