// دعوة J3dUWhh — محمد مصطفى عبدالحفيظ سليم ويارا هشام فاروق وافي، السبت 12/12/2026 من 11:30 الصبح لـ 5:30 المسا،
// بيت يزد (الجيزة). بطلب المالك (2026-11-28).
// المالك (نفس اليوم، التاني): "الشكل الأساسي عاجبهم جامد — ضيف فيتشر لكن ما تغيرش كل حاجة" → الدعوة هي قالب Finca زي ما هو
// بالظبط (الألوان والخطوط والأقسام والحركة)، وفوقه بس:
//  • الختم M&Y بدل M&J (فيديو الفتح وصورة الغلاف — الحروف القديمة اتمسحت واتكتبت من جديد فريم فريم).
//  • العائلتين (سليم ووافي) فوق الأسامي، ساعات الحفل، جدول اليوم بكلام المالك (8 فقرات)، والهدية = مباركة (من غير IBAN).
//  • صور بيت يزد مكان صورة الفينكا في المكان، وفي قسمين جداد بنفس ستايل القالب: كلمة شكر ودفتر رسايل (بيظهر للضيوف —
//    publicWishes)، وألبوم صور الضيوف (guestExtras.photos).
//  • من غير الفنادق والأسئلة الشائعة.
//  • عربي (الافتراضي) وإنجليزي، بزرار ع | EN فوق على اليمين (نفس زرار ES/FR في الأصل). لو الضيف كان فتح الظرف،
//    اللغة التانية بتفتح على طول من غير الغلاف (#in).
// الصور في client/public/custom/J3dUWhh/. البيانات: oneOffFix J3dUWhh-mohamed-yara.
const { asset } = require('./_asset');

const SHORT = 'J3dUWhh';
const DIR = `/custom/${SHORT}/`;
const A = (f) => asset(DIR + f);

const INPUT = 'flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-2 bg-ivory border-sage/30 text-sage-dark placeholder:text-sage-dark/50 focus:border-sage-dark';
const DIV = '<div class="flex items-center justify-center py-2 bg-ivory rvf"><span class="h-px bg-sage-dark/40 w-16 md:w-24"></span><span class="mx-4 text-sage-dark/50 text-sm">✦</span><span class="h-px bg-sage-dark/40 w-16 md:w-24"></span></div>';

// الأقسام الجديدة (قبل الختام) بنفس كلاسات Finca
const SECTIONS = `
<div data-section="thanks">${DIV}<section class="section-padding bg-ivory" id="jyThanks"><div class="max-w-xl mx-auto">
<div class="text-center mb-10 rv"><img src="${A('house-wide.webp')}" alt="" class="w-full max-w-lg mx-auto mb-8 rounded-lg" loading="lazy" decoding="async"><h2 class="font-script text-4xl md:text-5xl text-sage-dark mb-2" data-jy="tT">شكرًا لكم</h2><p class="text-sage-dark/70 font-body tracking-wide" data-jy="tS">شكرًا لكل من شاركنا فرحتنا بحضوره أو بدعوة أو بكلمة حلوة. اكتبوا لنا رسالة صغيرة نحتفظ بها العمر كله.</p></div>
<form id="jyWf" novalidate class="bg-white/80 backdrop-blur-sm border border-sage/30 rounded-lg p-8 space-y-6 shadow-sm rv" style="--d:.2s">
<div><label class="text-sm leading-none text-sage-dark font-medium" for="jyWn" data-jy="wN">اسمك</label><input class="${INPUT}" id="jyWn" maxlength="60" placeholder="اسمك"></div>
<div><label class="text-sm leading-none text-sage-dark font-medium" for="jyWm" data-jy="wM">رسالتك للعروسين</label><textarea class="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm mt-2 bg-ivory border-sage/30 text-sage-dark placeholder:text-sage-dark/50 focus:border-sage-dark" id="jyWm" maxlength="400" rows="3" placeholder="اكتبوا لنا كلمة..."></textarea></div>
<p id="jyWmsg" style="margin:0;font-size:.875rem;text-align:center"></p>
<button type="submit" id="jyWs" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors disabled:opacity-50 h-10 px-4 py-2 w-full gap-2 bg-sage-dark hover:bg-sage-dark/90 text-white font-medium"><span data-jy="wB">أرسل رسالتك</span></button>
</form>
<div id="jyWl" class="space-y-4 mt-8" aria-live="polite"></div>
</div></section></div>
<div data-section="photos">${DIV}<section class="section-padding bg-ivory" id="jyPhotos"><div class="max-w-xl mx-auto">
<div class="text-center mb-6 rv"><img src="${A('door.webp')}" alt="" class="w-48 mx-auto mb-6 rounded-lg" style="aspect-ratio:3/4;object-fit:cover" loading="lazy" decoding="async"><h2 class="font-script text-4xl md:text-5xl text-sage-dark mb-2" data-jy="pT">ألبوم فرحنا</h2><p class="text-sage-dark/70 font-body tracking-wide" data-jy="pS">اتصوّرت معانا؟ ارفع صورك من الفرح هنا عشان نحتفظ بيها كلها.</p></div>
<div id="jyPhotosBox" class="rv" style="--d:.2s"></div>
</div></section></div>
`;

const HEAD = `<script>
// اللغة التانية بعد فتح الظرف: من غير الغلاف (نفس وضع الفتح التلقائي)
if (location.hash === '#in') { try { window.WEDDING_CONFIG.autoOpen = true; } catch (e) {} }
window.MITHAQ_EXTRAS_OPTS = { anchor: '#jyPhotosBox', inline: true, lang: (window.WEDDING_CONFIG || {}).language === 'en' ? 'en' : 'ar' };
</script>
<style>
#jyLang{position:fixed;top:1rem;right:1rem;z-index:60;display:flex;gap:.25rem;padding:.25rem;border-radius:999px;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border:1px solid hsl(var(--sage)/.3);box-shadow:0 4px 6px -1px rgba(0,0,0,.1);direction:ltr}
#jyLang a{display:block;padding:.25rem .65rem;border-radius:999px;font:500 .75rem/1.4 'Lora',serif;letter-spacing:.05em;text-decoration:none;color:hsl(var(--sage-dark)/.7)}
#jyLang a.on{background:hsl(var(--sage-dark));color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.1)}
#jyLang a.ar{font-family:'Noto Naskh Arabic','Amiri',serif;font-size:.8rem}
#jyWl .w{background:rgba(255,255,255,.8);border:1px solid hsl(var(--sage)/.3);border-radius:.5rem;padding:.9rem 1.1rem}
#jyWl .w b{display:block;font-family:var(--font-display);color:hsl(var(--sage-dark));font-size:1.05rem}
#jyWl .w p{margin:.2rem 0 0;color:hsl(var(--sage-dark)/.75);font-size:.9rem;white-space:pre-line;word-break:break-word}
#jyWl .more{display:block;margin:0 auto;background:none;border:0;color:hsl(var(--sage-dark)/.7);text-decoration:underline;text-underline-offset:4px;cursor:pointer;font:inherit;font-size:.85rem}
#jyPhotosBox .gx{--gx-ink:hsl(100 15% 24%);--gx-soft:hsl(100 15% 24% / .7);--gx-gold:hsl(77 15% 50%);--gx-gold2:hsl(42 85% 55%);--gx-line:hsl(77 15% 50% / .35);--gx-paper:transparent;--gx-card:rgba(255,255,255,.8);--gx-disp:var(--font-script);--gx-body:var(--font-body);--gx-caps:var(--font-body);background:transparent;padding:0}
#jyPhotosBox .gx-eyebrow,#jyPhotosBox .gx-title,#jyPhotosBox .gx-sub{display:none}
#jyPhotosBox .gx-card{background:rgba(255,255,255,.8)!important;border:1px solid hsl(var(--sage)/.3);border-radius:.5rem;padding:1.5rem!important;box-shadow:0 1px 2px rgba(0,0,0,.05)!important}
#jyPhotosBox .gx-btn{border-radius:.375rem}
html.ar #jyThanks h2,html.ar #jyPhotos h2{font-size:2rem}
.jy-nm{filter:drop-shadow(0 4px 10px rgba(0,0,0,.35));margin:6px auto}
.jy-row{display:inline-flex;align-items:center;gap:14px;direction:rtl}.jy-row img{width:auto;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
.jy-and{font-family:'Aref Ruqaa',serif;color:hsl(var(--gold));font-size:1.6rem}
/* جدول اليوم: رسومات الدانتيل من قالب Lace زي ما هي هناك (من غير دواير ولا خط)، بلون أخضر Finca */
#fcTlM > .absolute,.absolute:has(+ #fcTlD){display:none!important}
#fcTlM [data-tl]{align-items:center!important}
#fcTlM .jy-art{width:78px!important;height:78px!important}
#fcTlD .jy-art{width:104px!important;height:104px!important}
.jy-art{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;overflow:visible}
.jy-art img{width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none}
</style>`;

const TL_ICONS = [
  '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>',
  '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
];

// رسومات جدول اليوم (من قالب Lace بطلب المالك 2026-11-28) — زي ما هي في Lace (من غير دواير) بس لونها أخضر Finca
// (الدانتيل الأبيض مابيبانش على الخلفية الفاتحة)، وبتتكرر لما الفقرات أكتر من الرسومات
const TL_ART = ['tl-fountain', 'tl-glasses', 'tl-arch', 'tl-fountain', 'tl-glasses', 'tl-plate', 'tl-arch', 'tl-dance'];

// كلام المالك — [وقت، عنوان، وصف] لكل فقرة
const PLAN = {
  ar: [
    ['١١:٣٠ – ١:٠٠', 'جلسة تصوير العروسين', ''],
    ['١:٣٠ – ٢:٠٠', 'استقبال الضيوف', 'الترحيب والمشروبات والموسيقى الهادئة، وتجهيز العروسين والضيوف لكتب الكتاب'],
    ['٢:٠٠ – ٢:٣٠', 'كتب الكتاب', 'الإشهار وخطبة المأذون والدعاء، على أن تنتهي الخطبة مع أذان العصر تقريبًا'],
    ['٢:٣٠ – ٣:٠٠', 'أذان العصر', 'استراحة الصلاة'],
    ['٣:٠٠ – ٣:٢٠', 'جولة العروسين', 'على الطاولات للسلام على الضيوف وشكرهم على الحضور'],
    ['٣:٢٠ – ٤:٠٥', 'الغداء والضيافة', ''],
    ['٤:٠٥ – ٤:٤٥', 'التصوير الرسمي', 'مع العائلتين والأهل والأصدقاء والعروسين'],
    ['٤:٤٥ – ٥:٠٠', 'ختام الفرح', 'صور أخيرة وتوديع الضيوف'],
  ],
  en: [
    ['11:30 – 1:00', "The couple's photo session", ''],
    ['1:30 – 2:00', 'Welcoming our guests', 'Welcome drinks and soft music while everyone gets ready for the Katb El-Kitab'],
    ['2:00 – 2:30', 'Katb El-Kitab', 'The marriage contract, the announcement, the Maazoun’s sermon and prayers — ending around the Asr call to prayer'],
    ['2:30 – 3:00', 'Asr prayer', 'Prayer break'],
    ['3:00 – 3:20', 'The couple’s table visits', 'Greeting every guest and thanking you for coming'],
    ['3:20 – 4:05', 'Lunch & hospitality', ''],
    ['4:05 – 4:45', 'Official photos', 'With both families, relatives, friends and the couple'],
    ['4:45 – 5:00', 'Farewell', 'Last photos and goodbyes'],
  ],
};

const TEXTS = {
  ar: {
    fc2: 'تتشرّف عائلتا سليم ووافي بدعوتكم', fc19: 'من ١١:٣٠ ص إلى ٥:٣٠ م',
    fc22: 'جدول فرحنا', fc23: 'السبت ١٢ ديسمبر ٢٠٢٦',
    fc62: 'هدية ومباركة', fc63: 'حضوركم ودعواتكم هما أجمل هدية لنا.', fc64: '«بارك الله لكما، وبارك عليكما، وجمع بينكما في خير»',
    tT: 'شكرًا لكم', tS: 'شكرًا لكل من شاركنا فرحتنا بحضوره أو بدعوة أو بكلمة حلوة. اكتبوا لنا رسالة صغيرة نحتفظ بها العمر كله.',
    wN: 'اسمك', wM: 'رسالتك لمحمد ويارا', wB: 'أرسل رسالتك',
    pT: 'ألبوم فرحنا', pS: 'اتصوّرت معانا؟ ارفع صورك من الفرح هنا عشان نحتفظ بيها كلها.',
  },
  en: {
    fc2: 'The Selim & Wafi families invite you', fc19: 'From 11:30 AM to 5:30 PM',
    fc22: 'Our Wedding Day', fc23: 'Saturday, 12 December 2026',
    fc62: 'Gifts & Blessings', fc63: 'Your presence and your prayers are the most beautiful gift to us.', fc64: '“May Allah bless you both, shower His blessings upon you, and unite you in goodness.”',
    tT: 'Thank you', tS: 'Thank you to everyone who shares our joy — with your presence, a prayer or a kind word. Leave us a little message we’ll keep forever.',
    wN: 'Your name', wM: 'Your message to Mohamed & Yara', wB: 'Send message',
    pT: 'Our Wedding Album', pS: 'Took photos with us? Upload them here so we can keep every one of them.',
  },
};

function bodyScript() {
  const names = { mw: A('name-mohamed-w.png'), yw: A('name-yara-w.png') };
  const art = TL_ART.map((f) => A(`${f}.webp`));
  const cfg = JSON.stringify({ texts: TEXTS, plan: PLAN, icons: TL_ICONS, art, short: SHORT, names }).replace(/</g, '\\u003c');
  return `<script>(function(){
var K=${cfg};var C=window.WEDDING_CONFIG||{};var EN=C.language==='en';var L=EN?'en':'ar';var T=K.texts[L];
var $=function(s,r){return (r||document).querySelector(s)};var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var by=function(id){return document.querySelector('[data-elem-id="'+id+'"]')};
Object.keys(T).forEach(function(k){var el=by(k)||document.querySelector('[data-jy="'+k+'"]');if(el)el.innerHTML=T[k]});
$$('[data-jy]').forEach(function(el){var k=el.getAttribute('data-jy');if(T[k]!=null)el.innerHTML=T[k]});
if(EN){$('#jyWn').placeholder='Your name';$('#jyWm').placeholder='Write us a few words...'}
/* تأكيد الحضور من غير الحساسية وقيود الطعام */
var al=$('#fcAllergy');if(al){var blk=al.closest('.fc-yes');if(blk)blk.parentNode.removeChild(blk)}
/* الأسامي بالعربي بخط المالك (صور) */
if(!EN){var N=K.names;var pic=function(id,src,h,alt){var el=by(id);if(!el)return;el.innerHTML='<img src="'+src+'" alt="'+alt+'" class="jy-nm" style="height:'+h+'px;width:auto;display:inline-block">'};
 pic('fc3',N.mw,88,'محمد');pic('fc5',N.yw,112,'يارا');
 var f=by('fc102');if(f)f.innerHTML='<span class="jy-row"><img src="'+N.mw+'" alt="محمد" style="height:46px"><span class="jy-and">و</span><img src="'+N.yw+'" alt="يارا" style="height:60px"></span>';}
/* الهدية: مباركة بس */
var gb=$('#fcGiftBtn');if(gb){var card=gb.parentNode;card.parentNode.removeChild(card)}
/* جدول اليوم: 8 فقرات بكلام المالك */
var list=$('#fcTlM .space-y-6');var items=$$('#fcTlM [data-tl]');
while(items.length<K.plan[L].length){var c=items[items.length-1].cloneNode(true);$$('[data-elem-id]',c).forEach(function(e){e.removeAttribute('data-elem-id');e.removeAttribute('data-f')});list.appendChild(c);items.push(c)}
var desk=$$('#fcTlD > div');
var setArt=function(root,i){var sv=$('svg',root);var bx=sv?sv.parentNode:$('.jy-art',root);if(!bx)return;var src=K.art[i%K.art.length];if(!src){if(sv)sv.innerHTML=K.icons[i];return}bx.classList.add('jy-art');bx.innerHTML='<img src="'+src+'" alt="" loading="lazy" decoding="async" draggable="false">'};
K.plan[L].forEach(function(r,i){var it=items[i];$('[data-k="t"]',it).textContent=r[0];$('[data-k="h"]',it).textContent=r[1];var p=$('[data-k="p"]',it);p.textContent=r[2];p.style.display=r[2]?'':'none';
 setArt(it,i);if(C.autoOpen)it.classList.add('in');
 if(!desk[i]&&desk.length){var dc=desk[desk.length-1].cloneNode(true);dc.classList.add('in');desk[0].parentNode.appendChild(dc);desk.push(dc)}
 var d=desk[i];if(d){$('[data-k="t"]',d).textContent=r[0];$('[data-k="h"]',d).textContent=r[1];$('[data-k="p"]',d).textContent=r[2];setArt(d,i)}});
var g=$('#fcTlD');if(g)g.style.gridTemplateColumns='repeat(8,minmax(0,1fr))';
/* زرار اللغة */
var sid=C.shortId||K.short;var inside=function(){return !document.getElementById('fcCover')};
var bar=document.createElement('div');bar.id='jyLang';bar.setAttribute('role','group');bar.setAttribute('aria-label',EN?'Language':'اللغة');
[['ar','ع'],['en','EN']].forEach(function(x){var a=document.createElement('a');a.href='/i/'+sid+'/'+x[0];a.textContent=x[1];a.className=x[0]+(L===x[0]?' on':'');a.setAttribute('lang',x[0]);
 a.addEventListener('click',function(e){e.preventDefault();if(L===x[0])return;location.href='/i/'+encodeURIComponent(sid)+'/'+x[0]+(inside()?'#in':'')});bar.appendChild(a)});
document.body.appendChild(bar);
/* دفتر الرسايل (بيظهر لكل الضيوف) */
var STATIC=!!C.autoOpen&&location.hash!=='#in';var list2=$('#jyWl'),msg=$('#jyWmsg'),ws=[],shown=6;
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function render(){list2.innerHTML=ws.slice(0,shown).map(function(w){return '<div class="w"><b>'+esc(w.name||'')+'</b><p>'+esc(w.message||'')+'</p></div>'}).join('')+(ws.length>shown?'<button type="button" class="more">'+(EN?'Show more messages':'رسائل أكثر')+'</button>':'');var m=$('.more',list2);if(m)m.addEventListener('click',function(){shown+=10;render()})}
if(sid&&!STATIC)fetch('/i/'+encodeURIComponent(sid)+'/wishes',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{}}).then(function(j){ws=(j&&j.wishes)||[];render()}).catch(function(){});
try{var nm=localStorage.getItem('mithaq_guest_name');if(nm)$('#jyWn').value=nm}catch(e){}
$('#jyWf').addEventListener('submit',function(e){e.preventDefault();msg.textContent='';msg.style.color='hsl(var(--destructive))';
 var n=$('#jyWn').value.trim().replace(/\\s+/g,' '),t=$('#jyWm').value.trim();
 if(n.length<2){msg.textContent=EN?'Please write your name.':'من فضلك اكتب اسمك.';return}
 if(!t){msg.textContent=EN?'Please write your message.':'اكتب رسالتك الأول.';return}
 var ok=function(w){ws.unshift(w);render();$('#jyWm').value='';msg.style.color='hsl(var(--sage-dark))';msg.textContent=EN?'Thank you! Your message reached us 🤍':'شكرًا! رسالتك وصلتنا 🤍';try{localStorage.setItem('mithaq_guest_name',n)}catch(e){}};
 if(STATIC)return ok({name:n,message:t});
 var b=$('#jyWs');b.disabled=true;
 fetch('/i/'+encodeURIComponent(sid)+'/wishes',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({guestName:n,message:t})})
 .then(function(r){if(!r.ok)throw r;return r.json()}).then(function(j){b.disabled=false;ok((j&&j.wish)||{name:n,message:t})})
 .catch(function(r){b.disabled=false;msg.textContent=r&&r.status===429?(EN?'Too many tries — please try again later.':'محاولات كثيرة — حاول بعد قليل.'):(EN?'Something went wrong — please try again.':'حدث خطأ — حاول مرة أخرى.')})});
})();</script>`;
}

module.exports = {
  shortId: SHORT,
  langs: ['ar', 'en'],

  share: {
    image: A('share.jpg'),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف محمد ويارا 🤍',
    description: 'السبت 12 ديسمبر 2026 · بيت يزد، الجيزة',
  },
  shareByLang: {
    en: { title: 'Mohamed & Yara — Wedding Invitation 🤍', description: 'Saturday, 12 December 2026 · Bait Yazd, Giza', overrideImage: true },
  },

  // دفتر الرسايل في كلمة الشكر: بيظهر لكل الضيوف (GET/POST /i/J3dUWhh/wishes)
  publicWishes: true,
  // من غير الفنادق والأسئلة الشائعة
  hidden: [],

  render() {
    return {};
  },

  transform(html) {
    let out = html
      // الختم M&Y
      .split('/templates/finca/cover.webp').join(A('cover.webp'))
      .split('/templates/finca/open.mp4').join(A('open.mp4'))
      // بيت يزد مكان صورة الفينكا
      .split('/templates/finca/venue.webp').join(A('house.webp'))
      .replace('<div data-section="stay">', '<div data-section="stay" class="off">')
      .replace('<div data-section="faq">', '<div data-section="faq" class="off">');
    out = out.replace('<footer class="py-16 bg-sage-dark text-center">', () => SECTIONS + '<footer class="py-16 bg-sage-dark text-center">');
    out = out.replace('</head>', () => HEAD + '</head>');
    const end = out.lastIndexOf('</body>');
    return out.slice(0, end) + bodyScript() + out.slice(end);
  },
};
