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
if (location.hash === '#in') { try { window.WEDDING_CONFIG.autoOpen = true; history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
// رجوع للصفحة من ذاكرة المتصفح (bfcache) بعد ما الظرف اتفتح: نعيد تحميلها عشان تبدأ من الظرف
window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });
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
/* ===== ديكور العناصر (لوحة المالك) فوق تصميم Finca ===== */
.jd{position:absolute;pointer-events:none;user-select:none;-webkit-user-select:none;z-index:1}
.jd-host{position:relative;overflow:hidden}
#fcHero .jd-pam{bottom:-14px;width:min(38vw,230px);z-index:15;filter:drop-shadow(0 6px 12px rgba(0,0,0,.25))}
#fcHero .jd-pam.l{left:-34px;transform:scaleX(-1)}#fcHero .jd-pam.r{right:-34px}
#countdown .jd-drape{top:-6px;width:min(26vw,120px);opacity:.92}
#countdown .jd-drape.l{left:-22px}#countdown .jd-drape.r{right:-22px;transform:scaleX(-1)}
.jd-lace{position:relative;height:38px;margin-top:-19px;background-repeat:repeat-x;background-position:center;background-size:auto 100%;z-index:5;pointer-events:none}
.jd-corner{width:74px;opacity:.95;z-index:2}
.jd-corner.tl{top:6px;left:6px;transform:scaleX(-1)}.jd-corner.tr{top:6px;right:6px}
.jd-corner.bl{bottom:6px;left:6px;transform:rotate(180deg)}.jd-corner.br{bottom:6px;right:6px;transform:scaleY(-1)}
.jd-side{width:min(30vw,170px);opacity:.95}
.jd-side.l{left:-40px;transform:scaleX(-1)}.jd-side.r{right:-40px}
.jd-arch{position:relative;width:min(78%,300px);margin:0 auto 26px;aspect-ratio:391/387}
.jd-arch .ph{position:absolute;inset:7% 13% 5%;border-radius:999px 999px 10px 10px;overflow:hidden}
.jd-arch .ph img{width:100%;height:100%;object-fit:cover}
.jd-arch>.fr{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.jd-green{width:92px;top:34px;opacity:.95}
.jd-green.l{left:8%;transform:scaleX(-1) rotate(-8deg)}.jd-green.r{right:8%;transform:rotate(-8deg)}
.jd-lantern{width:96px;bottom:-18px;z-index:3}
html:not(.ar) .jd-lantern{right:-6px}html.ar .jd-lantern{left:-6px}
.jd-vases{width:150px;margin:0 auto 4px;display:block}
footer.jd-host .jd-corner{opacity:.85}
/* الفراشات: صغيرة وبتطير */
.jbf{position:absolute;width:var(--s,26px);z-index:16;pointer-events:none;animation:jbfFly var(--t,14s) ease-in-out var(--d,0s) infinite alternate;will-change:transform}
.jbf img{display:block;width:100%;height:auto;transform-origin:50% 50%;animation:jbfFlap var(--f,.26s) ease-in-out infinite alternate;filter:drop-shadow(0 2px 3px rgba(0,0,0,.18))}
@keyframes jbfFly{0%{transform:translate(0,0) rotate(-10deg)}25%{transform:translate(calc(var(--dx)*.3),calc(var(--dy)*-.6)) rotate(8deg)}50%{transform:translate(calc(var(--dx)*.55),var(--dy)) rotate(-6deg)}75%{transform:translate(calc(var(--dx)*.8),calc(var(--dy)*-.3)) rotate(10deg)}100%{transform:translate(var(--dx),calc(var(--dy)*.4)) rotate(-4deg)}}
@keyframes jbfFlap{from{transform:scaleX(1)}to{transform:scaleX(.32)}}
@media (prefers-reduced-motion:reduce){.jbf,.jbf img{animation:none}}
/* ===== حركة الديكور ===== */
.jdv{opacity:0;transition:opacity 1.2s ease,translate 1.4s cubic-bezier(.22,1,.36,1),scale 1.4s cubic-bezier(.22,1,.36,1)}
.jdv.on{opacity:1}
/* البامباس: بيطلع من تحت ويتمايل */
.jd-pam,.jd-side{transform-origin:50% 100%}
.jd-pam.jdv,.jd-side.jdv{translate:0 40px}
.jd-pam.jdv.on,.jd-side.jdv.on{translate:0 0;animation:jdSway var(--sw,7s) ease-in-out var(--sd,0s) infinite alternate}
@keyframes jdSway{from{rotate:-2.4deg}to{rotate:2.2deg}}
/* القماش: بيتهز من فوق */
.jd-drape{transform-origin:50% 0}
.jd-drape.jdv{translate:0 -30px}
.jd-drape.jdv.on{translate:0 0;animation:jdDrape 6.5s ease-in-out infinite alternate}
@keyframes jdDrape{from{rotate:-1.6deg}to{rotate:1.4deg}}
/* الأوراق الخضرا: بتكبر */
.jd-green{transform-origin:50% 90%}
.jd-green.jdv{scale:.55}
.jd-green.jdv.on{scale:1;animation:jdSway 8s ease-in-out 1.4s infinite alternate}
/* ركن الدانتيل: بيدخل من الركن */
.jd-corner.jdv{scale:.6}
.jd-corner.jdv.on{scale:1}
/* القوس: بيترسم من تحت لفوق، والصورة بتقرّب ببطء */
.jd-arch .fr{clip-path:inset(100% 0 0 0);transition:clip-path 2.2s cubic-bezier(.65,0,.35,1) .2s}
.jd-arch.on .fr{clip-path:inset(0 0 0 0)}
.jd-arch .ph{opacity:0;transform:scale(.94);transition:opacity 1.4s ease .5s,transform 1.6s cubic-bezier(.22,1,.36,1) .5s}
.jd-arch.on .ph{opacity:1;transform:none}
.jd-arch.on .ph img{animation:jdKen 16s ease-in-out 2s infinite alternate}
@keyframes jdKen{from{transform:scale(1)}to{transform:scale(1.09)}}
/* الفانوس: نور الشمع */
.jd-lw{position:absolute;bottom:-18px;width:96px;z-index:3;pointer-events:none}
html:not(.ar) .jd-lw{right:-6px}html.ar .jd-lw{left:-6px}
.jd-lw img{position:relative;width:100%;display:block}
.jd-lw:before{content:"";position:absolute;left:58%;top:52%;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;background:radial-gradient(circle,rgba(255,200,120,.6),rgba(255,180,90,0) 70%);animation:jdGlow 2.4s ease-in-out infinite alternate;filter:blur(2px)}
@keyframes jdGlow{0%{opacity:.55;transform:scale(.92)}35%{opacity:.85}60%{opacity:.6;transform:scale(1.06)}100%{opacity:.9;transform:scale(1)}}
.jd-vases.jdv{translate:0 18px}.jd-vases.jdv.on{translate:0 0}
/* الدانتيل */
.jd-lace{opacity:0;transition:opacity 1.6s ease}.jd-lace.on{opacity:1}
/* الفراشات: رفرفة حقيقية وطيران ناعم */
.jbf{perspective:200px}
.jbf img{animation:jbfFlap3 var(--f,.24s) ease-in-out infinite alternate}
@keyframes jbfFlap3{from{transform:rotateY(0deg)}to{transform:rotateY(68deg)}}
@keyframes jbfFly{0%{transform:translate(0,0) rotate(-12deg)}20%{transform:translate(calc(var(--dx)*.18),calc(var(--dy)*-.7)) rotate(6deg)}38%{transform:translate(calc(var(--dx)*.42),calc(var(--dy)*-.2)) rotate(-4deg)}55%{transform:translate(calc(var(--dx)*.5),calc(var(--dy)*.9)) rotate(10deg)}72%{transform:translate(calc(var(--dx)*.74),calc(var(--dy)*.3)) rotate(-8deg)}100%{transform:translate(var(--dx),calc(var(--dy)*-.5)) rotate(5deg)}}
@media (prefers-reduced-motion:reduce){.jdv,.jd-arch .fr,.jd-arch .ph{transition:none!important;animation:none!important;opacity:1!important;clip-path:none!important;translate:none!important;scale:none!important}.jd-lw:before,.jd-arch .ph img{animation:none}}


.jy-nm{filter:drop-shadow(0 4px 10px rgba(0,0,0,.35));margin:6px auto}
/* أول صفحة بفيديو فاتح: الكلام غامق فوق في المساحة الفاضية، من غير الطبقة السودا */
#fcHero{align-items:flex-start}
#fcHero .bg-black\\/55{background:linear-gradient(180deg,rgba(246,241,232,.55) 0%,rgba(246,241,232,.25) 38%,rgba(246,241,232,0) 55%)}
#fcHero>.relative.z-10{padding-top:max(9vh,64px)}
#fcHero .text-white,#fcHero .text-white\\/80,#fcHero .text-white\\/90{color:hsl(var(--sage-dark))}
#fcHero .text-white\\/80{opacity:.85}
#fcHero .drop-shadow-lg,#fcHero .drop-shadow-md{filter:none}
#fcHero .h-px.bg-white\\/50{background:hsl(var(--sage-dark)/.35)}
#fcHero #fcToRsvp{color:hsl(var(--sage-dark));text-shadow:0 1px 8px rgba(246,241,232,.9)}
#fcHero .jy-nm{filter:drop-shadow(0 2px 6px rgba(246,241,232,.8))}
#fcHero p.font-body{font-weight:500}
/* لون الفخار بدل الأخضر في: الختام، مواعيد الجدول ورسوماته (الكلام فاضل أخضر) */
footer.bg-sage-dark{background:linear-gradient(180deg,#e6ceb3 0%,#dcbf9f 55%,#d2b08e 100%)!important}
footer.bg-sage-dark .text-white,footer.bg-sage-dark .text-white\\/70,footer.bg-sage-dark .text-white\\/80{color:#5a3a28!important}
footer.bg-sage-dark .jy-row img{filter:none!important}footer.bg-sage-dark .jy-and{color:#b8893f}

#fcTlM [data-k="t"],#fcTlD [data-k="t"]{background:#dcbf9f!important;color:#5a3a28!important;border:1px solid rgba(120,80,50,.2)}
.jy-art img{filter:sepia(.85) saturate(1.05) hue-rotate(-8deg) brightness(1.02) contrast(.95)}
[data-section="timeline"] img[src*="couple.webp"]{filter:saturate(1.5) brightness(.72) contrast(1.15)}

#fcCover .fc-line{animation:jdTap 2.4s ease-in-out infinite;top:63%}
@keyframes jdTap{0%,100%{opacity:.95;transform:scale(1)}50%{opacity:.55;transform:scale(.97)}}
#fcCover.play .fc-line{animation:none;opacity:0;transition:opacity .4s}
#fcCover .jbf{z-index:5}
html.ar #fcCover .fc-line{font-family:'Amiri','Noto Naskh Arabic',serif!important;font-weight:700;font-size:28px;font-size:6.8cqw;line-height:1.6;letter-spacing:0;color:#6f675d;top:62.5%}
#fcCover .jbf img{position:static;width:100%;height:auto;object-fit:contain}
html:not(.ar) #fcCover .fc-line{font-size:6.4cqw}
#fcTlM [data-k="t"],#fcTlD [data-k="t"]{white-space:nowrap;flex:none}
[data-section="timeline"] img[src*="couple.webp"]{width:min(50vw,210px)!important;max-width:none;margin-bottom:1.25rem}
/* العدّاد بلون الفخار السمني (نفس فازات لوحة المالك) والعناصر جواه */
#countdown{background:linear-gradient(180deg,#e6ceb3 0%,#dcbf9f 55%,#d2b08e 100%)!important;position:relative;overflow:hidden;padding-bottom:210px!important}
#countdown:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 18%,rgba(255,248,238,.55),rgba(255,248,238,0) 60%);pointer-events:none}
#countdown .text-white{color:#5a3a28!important}
#countdown .text-white\\/70{color:rgba(90,58,40,.75)!important}
#countdown .bg-white\\/10{background:rgba(255,250,242,.5)!important;border-color:rgba(120,80,50,.22)!important;box-shadow:0 10px 24px -16px rgba(90,58,40,.45)}
#countdown>div{position:relative;z-index:3}
#countdown .jd-cvases{left:50%;bottom:-6px;width:min(54vw,250px);margin-left:calc(min(54vw,250px)/-2);z-index:2;transform-origin:50% 100%}
#countdown .jd-cvases.jdv{translate:0 30px}#countdown .jd-cvases.jdv.on{translate:0 0}
#countdown .jd-cpam{bottom:-12px;width:min(34vw,170px);z-index:1}
#countdown .jd-cpam.l{left:-34px;transform:scaleX(-1)}#countdown .jd-cpam.r{right:-34px}
#countdown .jd-cgreen{top:auto;bottom:40px;width:min(22vw,96px);z-index:1;opacity:.95}
#countdown .jd-cgreen.l{left:18%;transform:scaleX(-1) rotate(-14deg)}#countdown .jd-cgreen.r{right:18%;transform:rotate(-14deg)}
@media (min-width:768px){#countdown{padding-bottom:260px!important}}

#fcHero #fcToRsvp>span{background:rgba(246,241,232,.82);padding:5px 14px;border-radius:999px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}

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
const TL_ART = ['tl-glasses', 'tl-arch', 'tl-fountain', 'tl-plate', 'tl-arch', 'tl-dance'];

// كلام المالك — [وقت، عنوان، وصف] لكل فقرة
const PLAN = {
  ar: [
    ['١:٣٠ – ٢:٠٠', 'استقبال الضيوف والترحيب', ''],
    ['٢:٠٠ – ٢:٤٥', 'مراسم كتب الكتاب والإشهار', ''],
    ['٢:٤٥ – ٣:٠٠', 'استراحة قصيرة', ''],
    ['٣:٠٠ – ٣:٤٥', 'الغداء والضيافة', ''],
    ['٣:٤٥ – ٤:٤٥', 'التصوير الرسمي مع الضيوف', ''],
    ['٤:٤٥ – ٥:٠٠', 'توديع الضيوف وختام اليوم', ''],
  ],
  en: [
    ['1:30 – 2:00', 'Welcoming our guests', ''],
    ['2:00 – 2:45', 'Katb El-Kitab & the announcement', ''],
    ['2:45 – 3:00', 'A short break', ''],
    ['3:00 – 3:45', 'Lunch & hospitality', ''],
    ['3:45 – 4:45', 'Official photos with our guests', ''],
    ['4:45 – 5:00', 'Farewell & close of the day', ''],
  ],
};

const TEXTS = {
  ar: {
    fc1: 'اضغط لفتح الدعوة', fc2: 'تتشرّف عائلتا سليم ووافي بدعوتكم', fc19: 'من ١:٣٠ م إلى ٥:٠٠ م',
    fc22: 'جدول فرحنا', fc23: 'السبت ١٢ ديسمبر ٢٠٢٦',
    fc62: 'هدية ومباركة', fc63: 'حضوركم ودعواتكم هما أجمل هدية لنا.', fc64: '«بارك الله لكما، وبارك عليكما، وجمع بينكما في خير»',
    tT: 'شكرًا لكم', tS: 'شكرًا لكل من شاركنا فرحتنا بحضوره أو بدعوة أو بكلمة حلوة. اكتبوا لنا رسالة صغيرة نحتفظ بها العمر كله.',
    wN: 'اسمك', wM: 'رسالتك لمحمد ويارا', wB: 'أرسل رسالتك',
    pT: 'ألبوم فرحنا', pS: 'اتصوّرت معانا؟ ارفع صورك من الفرح هنا عشان نحتفظ بيها كلها.',
  },
  en: {
    fc1: 'Tap to open the invitation', fc2: 'The Selim & Wafi families invite you', fc19: 'From 1:30 PM to 5:00 PM',
    fc22: 'Our Wedding Day', fc23: 'Saturday, 12 December 2026',
    fc62: 'Gifts & Blessings', fc63: 'Your presence and your prayers are the most beautiful gift to us.', fc64: '“May Allah bless you both, shower His blessings upon you, and unite you in goodness.”',
    tT: 'Thank you', tS: 'Thank you to everyone who shares our joy — with your presence, a prayer or a kind word. Leave us a little message we’ll keep forever.',
    wN: 'Your name', wM: 'Your message to Mohamed & Yara', wB: 'Send message',
    pT: 'Our Wedding Album', pS: 'Took photos with us? Upload them here so we can keep every one of them.',
  },
};

function bodyScript() {
  const names = { mw: A('name-mohamed-w.png'), yw: A('name-yara-w.png'), md: A('name-mohamed-d.png'), yd: A('name-yara-d.png') };
  const el = {};
  ['pampas', 'vases', 'lace', 'arch', 'greenery', 'lantern', 'drapes', 'corner'].forEach((n) => { el[n] = A(`el-${n}.webp`); });
  el.bouquet = A('bouquet.webp'); el.door = A('door.webp');
  el.bf = Array.from({ length: 13 }, (_, i) => A(`bf-${i}.png`));
  const art = TL_ART.map((f) => A(`${f}.webp`));
  const cfg = JSON.stringify({ texts: TEXTS, plan: PLAN, icons: TL_ICONS, art, short: SHORT, names, el }).replace(/</g, '\\u003c');
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
 pic('fc3',N.md,84,'محمد');pic('fc5',N.yd,108,'يارا');
 var f=by('fc102');if(f)f.innerHTML='<span class="jy-row"><img src="'+N.md+'" alt="محمد" style="height:46px"><span class="jy-and">و</span><img src="'+N.yd+'" alt="يارا" style="height:60px"></span>';}

/* ===== الديكور ===== */
(function(){var E=K.el;var mk=function(tag,cls,src,host,first){var e=document.createElement(tag);e.className=cls+(/jd-(pam|side|drape|green|corner|vases)/.test(cls)?' jdv':'');if(src){e.src=src;e.alt='';e.setAttribute('aria-hidden','true');e.loading='lazy';e.decoding='async';e.draggable=false}if(host){first?host.insertBefore(e,host.firstChild):host.appendChild(e)}return e};
var host=function(el){if(el)el.classList.add('jd-host');return el};
var sec=function(k){var w=document.querySelector('[data-section="'+k+'"]');return w?w.querySelector('section'):null};
var flyN=0;var fly=function(h,n,opts){if(!h)return;for(var i=0;i<n;i++){var b=document.createElement('span');b.className='jbf';var o=opts[i%opts.length];
 b.style.cssText='left:'+o[0]+'%;top:'+o[1]+'%;--s:'+o[2]+'px;--dx:'+o[3]+'px;--dy:'+o[4]+'px;--t:'+o[5]+'s;--d:-'+(flyN*1.7%9).toFixed(1)+'s;--f:'+(0.22+flyN%4*0.03).toFixed(2)+'s';
 var im=document.createElement('img');im.src=E.bf[flyN%E.bf.length];im.alt='';im.setAttribute('aria-hidden','true');b.appendChild(im);h.appendChild(b);flyN++}};
var lace=function(after){if(!after)return;var d=document.createElement('div');d.className='jd-lace';d.style.backgroundImage='url('+E.lace+')';after.parentNode.insertBefore(d,after.nextSibling)};
/* أول صفحة: بامباس في الركنين وفراشات */
var cvb=document.querySelector('#fcCover .fc-box');if(cvb)fly(cvb,3,[[14,22,36,140,60,12],[72,30,32,-130,70,14],[30,78,34,120,-60,13]]);
/* أول صفحة: فيديو المالك (فيه البامباس والورد والفراشات) — من غير ديكور زيادة */
/* العدّاد: القماش فوق ودانتيل تحت */
var cd=host($('#countdown'));if(cd){mk('img','jd jd-drape l',E.drapes,cd);mk('img','jd jd-drape r',E.drapes,cd);mk('img','jd jd-side jd-cpam l',E.pampas,cd);mk('img','jd jd-side jd-cpam r',E.pampas,cd);mk('img','jd jd-green jd-cgreen l',E.greenery,cd);mk('img','jd jd-green jd-cgreen r',E.greenery,cd);mk('img','jd jd-vases jd-cvases',E.vases,cd);fly(cd,2,[[10,30,22,130,40,14],[78,46,20,-120,-40,16]]);lace(cd)}
/* المكان: ركن دانتيل دهبي على الكارت */
var vs=host(sec('venue'));if(vs){var card=vs.querySelector('.rounded-lg.shadow-sm');if(card){card.style.position='relative';card.style.overflow='hidden';mk('img','jd jd-corner tl',E.corner,card);mk('img','jd jd-corner tr',E.corner,card)}fly(vs,2,[[6,8,22,140,60,15],[80,46,20,-120,40,17]])}
/* البرنامج: بامباس على الجنبين وفراشات */
var tl=host(sec('timeline'));if(tl){var a=mk('img','jd jd-side l',E.pampas,tl);a.style.bottom='-10px';a.style.width='118px';var b2=mk('img','jd jd-side r',E.pampas,tl);b2.style.bottom='-10px';b2.style.width='118px';fly(tl,3,[[8,30,22,150,50,14],[78,58,24,-140,-40,16],[20,82,20,120,-60,18]])}
/* الهدية: الفازة بالورد في القوس + فراشات */
var gs=host(sec('gift'));if(gs){var head=gs.querySelector('.text-center');if(head){var ar=document.createElement('div');ar.className='jd-arch';ar.innerHTML='<div class="ph"><img src="'+E.bouquet+'" alt="" loading="lazy" decoding="async"></div><img class="fr" src="'+E.arch+'" alt="" aria-hidden="true">';head.insertBefore(ar,head.firstChild)}fly(gs,2,[[10,14,22,130,50,15],[76,30,20,-120,60,16]])}
/* تأكيد الحضور: أوراق خضرا حوالين الدبل + دانتيل فوق */
var rs=host($('#mithaq-rsvp'));if(rs){var w=rs.parentNode;var hd=$('#fcRsvpHead');if(hd){hd.style.position='relative';mk('img','jd jd-green l',E.greenery,hd);mk('img','jd jd-green r',E.greenery,hd)}}
/* الشكر: الفانوس جنب رسمة البيت + الفازات فوق العنوان */
var th=host($('#jyThanks'));if(th){var hi=th.querySelector('img');if(hi){var wrap=document.createElement('div');wrap.style.position='relative';hi.parentNode.insertBefore(wrap,hi);wrap.appendChild(hi);var lw=document.createElement('div');lw.className='jd-lw jdv';lw.innerHTML='<img src="'+E.lantern+'" alt="" aria-hidden="true" loading="lazy">';wrap.appendChild(lw)}var h2=th.querySelector('h2');if(h2)h2.parentNode.insertBefore(mk('img','jd-vases',E.vases),h2);fly(th,2,[[12,40,22,120,50,15],[74,70,20,-110,-50,17]])}
/* الصور: باب بيت يزد في القوس + بامباس */
var ph=host($('#jyPhotos'));if(ph){var dimg=ph.querySelector('img');if(dimg){var arc=document.createElement('div');arc.className='jd-arch';arc.innerHTML='<div class="ph"><img src="'+E.door+'" alt="" loading="lazy" decoding="async"></div><img class="fr" src="'+E.arch+'" alt="" aria-hidden="true">';dimg.parentNode.replaceChild(arc,dimg)}var s1=mk('img','jd jd-side l',E.pampas,ph);s1.style.bottom='-10px';fly(ph,2,[[78,10,22,-140,50,15],[16,52,20,120,-40,17]])}
/* الختام: ركن دانتيل دهبي + دانتيل فوق */
var ft=host(document.querySelector('footer'));if(ft){mk('img','jd jd-corner tl',E.corner,ft);mk('img','jd jd-corner br',E.corner,ft);var lc=document.createElement('div');lc.className='jd-lace';lc.style.backgroundImage='url('+E.lace+')';lc.style.marginTop='0';lc.style.marginBottom='-19px';ft.parentNode.insertBefore(lc,ft)}
/* الحركة بتبدأ لما الضيف يوصل للقسم (بعد فتح الظرف) */
$$('.jd-pam').forEach(function(e,i){e.style.setProperty('--sd',(-i*2.3)+'s');e.style.setProperty('--sw',(6.5+i*1.3)+'s')});
$$('.jd-side').forEach(function(e,i){e.style.setProperty('--sd',(-i*1.7)+'s');e.style.setProperty('--sw',(7.5+i)+'s')});
var targets=$$('.jdv,.jd-arch,.jd-lace');
var go=function(e){e.classList.add('on')};
if(!('IntersectionObserver' in window)){targets.forEach(go)}else{
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){var t=x.target;setTimeout(function(){go(t)},t.classList.contains('jd-pam')?1400:120);io.unobserve(t)}})},{threshold:.15});
 var start=function(){targets.forEach(function(t){io.observe(t)})};
 if(document.getElementById('fcCover')){var mo=new MutationObserver(function(){if(!document.getElementById('fcCover')){mo.disconnect();start()}});mo.observe(document.body,{childList:true,subtree:true})}else start()}
})();
/* الهدية: مباركة بس */
var gb=$('#fcGiftBtn');if(gb){var card=gb.parentNode;card.parentNode.removeChild(card)}
/* جدول اليوم: 8 فقرات بكلام المالك */
var list=$('#fcTlM .space-y-6');var items=$$('#fcTlM [data-tl]');
while(items.length>K.plan[L].length){var x=items.pop();x.parentNode.removeChild(x)}
while(items.length<K.plan[L].length){var c=items[items.length-1].cloneNode(true);$$('[data-elem-id]',c).forEach(function(e){e.removeAttribute('data-elem-id');e.removeAttribute('data-f')});list.appendChild(c);items.push(c)}
var desk=$$('#fcTlD > div');
var setArt=function(root,i){var sv=$('svg',root);var bx=sv?sv.parentNode:$('.jy-art',root);if(!bx)return;var src=K.art[i%K.art.length];if(!src){if(sv)sv.innerHTML=K.icons[i];return}bx.classList.add('jy-art');bx.innerHTML='<img src="'+src+'" alt="" loading="lazy" decoding="async" draggable="false">'};
K.plan[L].forEach(function(r,i){var it=items[i];$('[data-k="t"]',it).textContent=r[0];$('[data-k="h"]',it).textContent=r[1];var p=$('[data-k="p"]',it);p.textContent=r[2];p.style.display=r[2]?'':'none';
 setArt(it,i);if(C.autoOpen)it.classList.add('in');
 if(!desk[i]&&desk.length){var dc=desk[desk.length-1].cloneNode(true);dc.classList.add('in');desk[0].parentNode.appendChild(dc);desk.push(dc)}
 var d=desk[i];if(d){$('[data-k="t"]',d).textContent=r[0];$('[data-k="h"]',d).textContent=r[1];$('[data-k="p"]',d).textContent=r[2];setArt(d,i)}});
var g=$('#fcTlD');if(g){while(g.children.length>K.plan[L].length)g.removeChild(g.lastElementChild);g.style.gridTemplateColumns='repeat('+K.plan[L].length+',minmax(0,1fr))'}
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
      // فوق جدول فرحنا: العرسان الماشيين من قالب Lace مكان رسمة الضيوف اللي بيرقصوا
      .split('/templates/finca/party.webp').join(A('couple.webp'))
      // أول صفحة بعد الفتح: فيديو المالك (الفازات بالورد النبيتي والبامباس والفراشات) مكان فيديو الفينكا
      .split('/templates/finca/hero.mp4').join(A('hero.mp4'))
      .split('/templates/finca/hero.webp').join(A('hero.webp'))
      .replace('<div data-section="stay">', '<div data-section="stay" class="off">')
      .replace('<div data-section="faq">', '<div data-section="faq" class="off">');
    out = out.replace('<footer class="py-16 bg-sage-dark text-center">', () => SECTIONS + '<footer class="py-16 bg-sage-dark text-center">');
    out = out.replace('</head>', () => HEAD + '</head>');
    const end = out.lastIndexOf('</body>');
    return out.slice(0, end) + bodyScript() + out.slice(end);
  },
};
