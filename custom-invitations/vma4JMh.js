// vma4JMh — دعوة إسلام وبسنت (Ivory Swans بشكله الإنجليزي زي ما هو) بطلب المالك (2026-11-03):
// - صور الحكاية التلاتة اتشالت (الكلام اللي تحتها فاضل).
// - برنامج الحفل (قبل المكان): الاستقبال 4:30، عقد القران 5:30، زفّة العروس 6:30،
//   العشاء 8:30، الإطلالة الثانية 9:30 — كروت بنفس شكل كروت "والد العريس".
// - الدريس كود (بعد المكان): صور العميل التلاتة بتتقلّب يمين وشمال (سحب/أسهم/نقط)،
//   ودواير الألوان الخمسة من صورة العميل بالظبط، والجملة بالعربي وتحتها الإنجليزي.
// - صورة إسلام وبسنت وهما صغيرين (بولارويد) آخر حاجة في الدعوة بعد تأكيد الحضور.
// - رسالة الشكر بعد تأكيد الحضور بالعربي (حسب "هحضر" أو "معتذر").
// الكلام كله ليه data-elem-id (vm1–vm30) فالمالك يقدر يعدّله من المحرر.
// البيانات نفسها (الأسامي، التاريخ، المكان، الآباء، نصوص فورم الحضور) في
// utils/oneOffFixes.js (vma4JMh-islam-basant).
const { asset } = require('./_asset');

const SHORT = 'vma4JMh';
const DIR = `/custom/${SHORT}/`;

const CSS = `
/* صور الحكاية التلاتة اتشالت — الحتة كلها بتتشال فمايفضلش مكانها فاضي (زي 1yJIK9C) */
#hf-section .hf-frames{display:none!important}
#hf-section .hf-wedding-block{margin-top:0!important}
#hf-section{padding-top:56px!important;padding-bottom:80px!important}

/* ===== أقسام الدعوة دي — نفس ألوان وخطوط القالب ===== */
.vm-sec{position:relative;background:#f9e6d4;padding:64px 20px 72px;text-align:center;direction:rtl;overflow:hidden}
.vm-sec .vm-eyebrow{display:flex;align-items:center;justify-content:center;gap:18px}
.vm-sec .vm-eyebrow .line{display:inline-block;width:55px;height:1px;background:#c9ad7a;transform:scaleX(0);transition:transform 1.1s ease .2s}
.vm-sec.in .vm-eyebrow .line{transform:scaleX(1)}
.vm-sec .vm-eyebrow .word{font-family:'EB Garamond',serif;letter-spacing:3px;font-size:15px;color:#af9b6a}
.vm-sec .vm-headline{font-family:'Aref Ruqaa',serif;font-weight:700;font-size:44px;line-height:1.45;color:#4a3624;margin:16px 0 4px;opacity:0;transform:translateY(16px);transition:opacity 1s ease .3s,transform 1s ease .3s}
.vm-sec.in .vm-headline{opacity:1;transform:none}
.vm-sec .vm-flourish{display:block;color:#c9ad7a;font-size:20px;line-height:1;margin:6px 0 0}
@media (max-width:479px){.vm-sec .vm-headline{font-size:36px}}

/* ===== برنامج الحفل ===== */
/* قبله سجلات فاضية من القالب (~90px) — فالمسافة من العائلات بتبقى زي باقي الدعوة (~190px) */
#vm-program{padding-top:40px}
#vm-program .vm-tl{position:relative;max-width:300px;margin:28px auto 0;padding:0;list-style:none}
/* خط ذهبي ورا الكروت بيتمد من فوق لتحت أول ما القسم يبان */
#vm-program .vm-tl::before{content:"";position:absolute;left:50%;top:18px;bottom:18px;width:1px;margin-left:-.5px;
  background:linear-gradient(180deg,rgba(201,173,122,0),#c9ad7a 10%,#c9ad7a 90%,rgba(201,173,122,0));
  transform:scaleY(0);transform-origin:top;transition:transform 1.8s cubic-bezier(.22,1,.36,1) .25s}
#vm-program.in .vm-tl::before{transform:scaleY(1)}
#vm-program .vm-ev{position:relative;z-index:1;background:#fffaf2;border:1px solid #e6d3ae;border-radius:999px / 60px;
  padding:15px 16px 14px;box-shadow:0 12px 26px rgba(74,59,40,.10);opacity:0;transform:translateY(22px);transition:opacity .8s ease,transform .8s ease}
#vm-program .vm-ev+.vm-ev{margin-top:22px}
#vm-program.in .vm-ev{opacity:1;transform:none}
#vm-program.in .vm-ev:nth-child(2){transition-delay:.18s}
#vm-program.in .vm-ev:nth-child(3){transition-delay:.36s}
#vm-program.in .vm-ev:nth-child(4){transition-delay:.54s}
#vm-program.in .vm-ev:nth-child(5){transition-delay:.72s}
#vm-program .vm-ev .t{display:block;font-family:'EB Garamond',serif;font-size:15px;letter-spacing:2px;color:#a3844f;direction:ltr;unicode-bidi:isolate}
#vm-program .vm-ev .n{display:block;font-family:'Amiri',serif;font-weight:700;font-size:22px;line-height:1.5;color:#3f3122;margin-top:3px}
#vm-program .vm-ev .e{display:block;font-family:'EB Garamond',serif;font-style:italic;font-size:15px;color:#af9b6a;direction:ltr;unicode-bidi:isolate}

/* ===== الدريس كود ===== */
#vm-dress .vm-intro{font-family:'Amiri',serif;font-size:18px;line-height:1.9;color:#6b5738;max-width:420px;margin:2px auto 0;opacity:0;transition:opacity 1s ease .5s}
#vm-dress.in .vm-intro{opacity:1}
/* الصور بعرض الشاشة كله والجنب باين شوية (عشان يبان إن فيه صور تانية) */
#vm-dress .vm-car{position:relative;margin:22px -20px 0}
#vm-dress .vm-track{position:relative;display:flex;gap:12px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;-ms-overflow-style:none;
  padding:12px 13% 26px;direction:ltr;outline:none}
#vm-dress .vm-track::-webkit-scrollbar{display:none}
/* عرض الصورة = عرض الشريط من غير الحواف (13% كل ناحية) → 74% من الشاشة وفي النص بالظبط */
#vm-dress .vm-slide{flex:0 0 100%;margin:0;scroll-snap-align:center;scroll-snap-stop:always;border-radius:14px;overflow:hidden;
  border:6px solid #fffaf2;background:#efe2cf;box-shadow:0 18px 34px -16px rgba(74,59,40,.45);
  transform:scale(.94);opacity:.55;transition:transform .55s cubic-bezier(.22,1,.36,1),opacity .55s ease}
#vm-dress .vm-slide.on{transform:none;opacity:1}
#vm-dress .vm-slide img{display:block;width:100%;height:auto;aspect-ratio:7 / 5;object-fit:cover;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
/* تلميح أول مرة: الصور بتتزق شوية لليسار وترجع (إن فيه سحب) */
#vm-dress .vm-track.hint .vm-slide{animation:vmNudge 1.2s cubic-bezier(.45,0,.25,1)}
@keyframes vmNudge{0%,100%{translate:0 0}45%{translate:-34px 0}}
#vm-dress .vm-arr{position:absolute;top:calc(50% - 26px);z-index:2;width:38px;height:38px;padding:0;border-radius:50%;border:1px solid #c9ad7a;
  background:rgba(255,250,242,.93);color:#6b5231;display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 6px 14px -6px rgba(74,59,40,.5);transition:opacity .3s ease;-webkit-tap-highlight-color:transparent}
#vm-dress .vm-arr svg{width:16px;height:16px;display:block}
#vm-dress .vm-arr.prev{left:10px}
#vm-dress .vm-arr.next{right:10px}
#vm-dress .vm-arr:disabled{opacity:0;pointer-events:none}
#vm-dress .vm-dots{display:flex;justify-content:center;align-items:center;gap:6px;margin-top:-8px;direction:ltr}
#vm-dress .vm-dots button{width:22px;height:22px;padding:0;border:0;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent}
#vm-dress .vm-dots button::before{content:"";display:block;width:8px;height:8px;border-radius:99px;background:#dcc7a0;transition:width .35s ease,background .35s ease}
#vm-dress .vm-dots button.on::before{width:22px;background:#a3844f}
#vm-dress .vm-colors-label{font-family:'Amiri',serif;font-size:16px;color:#8c795d;margin:26px 0 12px}
#vm-dress .vm-colors{display:flex;justify-content:center;direction:ltr}
#vm-dress .vm-colors i{display:block;width:48px;height:48px;border-radius:50%;background:var(--c);border:3px solid #fffaf2;
  box-shadow:0 6px 14px -6px rgba(74,59,40,.55);transform:scale(0);transition:transform .7s cubic-bezier(.34,1.56,.64,1)}
#vm-dress .vm-colors i+i{margin-left:-10px}
#vm-dress.in .vm-colors i{transform:scale(1)}
#vm-dress.in .vm-colors i:nth-child(2){transition-delay:.1s}
#vm-dress.in .vm-colors i:nth-child(3){transition-delay:.2s}
#vm-dress.in .vm-colors i:nth-child(4){transition-delay:.3s}
#vm-dress.in .vm-colors i:nth-child(5){transition-delay:.4s}
#vm-dress .vm-dress-ar{font-family:'Amiri',serif;font-weight:700;font-size:21px;line-height:1.7;color:#3f3122;margin:20px auto 2px;max-width:420px}
#vm-dress .vm-dress-en{font-family:'EB Garamond',serif;font-style:italic;font-size:16px;color:#af9b6a;margin:0;direction:ltr;unicode-bidi:isolate}
@media (min-width:640px){
  #vm-dress .vm-car{max-width:620px;margin:26px auto 0}
  /* على الكمبيوتر الشريط مش بعرض الشاشة — الصور اللي على الجناب بتختفي بنعومة مش بحرف مقطوع */
  #vm-dress .vm-track{padding-left:15%;padding-right:15%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}
}

/* ===== إسلام وبسنت وهما صغيرين — آخر الدعوة ===== */
#vm-kids{background:#f6efe2;padding:6px 20px 84px;text-align:center;overflow:hidden}
#vm-kids .vm-pola{position:relative;width:min(74vw,330px);margin:0 auto;opacity:0;transform:rotate(-7deg) translateY(40px);
  transition:transform 1.4s cubic-bezier(.22,1,.36,1),opacity 1s ease;filter:drop-shadow(0 18px 24px rgba(74,59,40,.26))}
#vm-kids.in .vm-pola{opacity:1;transform:rotate(-2.5deg)}
#vm-kids .vm-pola img{display:block;width:100%;height:auto;-webkit-user-select:none;user-select:none}
#vm-kids .vm-tape{position:absolute;z-index:1;top:-13px;left:50%;width:96px;height:28px;margin-left:-48px;background:rgba(229,214,182,.82);
  transform:rotate(3deg);box-shadow:0 1px 3px rgba(74,59,40,.12)}
#vm-kids figcaption{position:absolute;left:0;right:0;bottom:5%;font-family:'Alex Brush',cursive;font-size:clamp(25px,8vw,34px);line-height:1;color:#5a4632;direction:ltr;unicode-bidi:isolate}
@media (prefers-reduced-motion:reduce){.vm-sec *,#vm-kids *{transition-duration:.01ms!important;animation:none!important}}
`;

// القسم بيبان (in) أول ما يدخل الشاشة؛ في المحرر بيبان على طول
const REVEAL = `(function(){
  var C = window.WEDDING_CONFIG || {};
  var els = document.querySelectorAll('#vm-program, #vm-dress, #vm-kids');
  function show(el){ el.classList.add('in'); if (el.id === 'vm-dress' && window.vmDressHint) window.vmDressHint(); }
  if (C.autoOpen || !('IntersectionObserver' in window)) { for (var i = 0; i < els.length; i++) els[i].classList.add('in'); return; }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.18 });
  for (var j = 0; j < els.length; j++) io.observe(els[j]);
})();`;

const PROGRAM_ITEMS = [
  ['4:30 – 5:30 PM', 'استقبال الضيوف', 'Welcome Reception'],
  ['5:30 – 6:00 PM', 'عقد القران', 'Katb El-Kitab'],
  ['6:30 PM', 'زفّة العروس', 'The Bride’s Entrance'],
  ['8:30 PM', 'مأدبة العشاء', 'Dinner Buffet'],
  ['9:30 PM', 'الإطلالة الثانية', 'The Second Entrance'],
];

function buildProgram() {
  const items = PROGRAM_ITEMS.map(([t, n, e], i) => {
    const id = 3 + i * 3;
    return `<li class="vm-ev"><span class="t" data-elem-id="vm${id}">${t}</span><span class="n" data-elem-id="vm${id + 1}">${n}</span><span class="e" data-elem-id="vm${id + 2}">${e}</span></li>`;
  }).join('\n    ');
  return `<!-- ===== برنامج الحفل (vma4JMh) ===== -->
<div id="vm-program" class="vm-sec" data-wda-decor>
  <div class="vm-eyebrow"><span class="line"></span><span class="word" data-elem-id="vm1">THE PROGRAM</span><span class="line"></span></div>
  <div class="vm-headline" data-elem-id="vm2">برنامج الحفل</div>
  <span class="vm-flourish" aria-hidden="true">❦</span>
  <ol class="vm-tl">
    ${items}
  </ol>
</div>
`;
}

const COLORS = ['#8c9457', '#8c4a56', '#d9c7a3', '#6e7b3f', '#7b2d3e'];
const SLIDES = [
  ['dress-1.webp', 'بدلة بيج وفستان نبيتي'],
  ['dress-2.webp', 'بدلة بيج وفستان نبيتي'],
  ['dress-3.webp', 'فستان نبيتي وبدلة بيج وفستان زيتي'],
];
const CHEVRON = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

// سكريبت الصور: الصورة اللي في النص هي اللي "on"، والنقط والأسهم ماشيين معاها
const CAROUSEL = `(function(){
  var sec = document.getElementById('vm-dress'); if (!sec) return;
  var track = sec.querySelector('.vm-track');
  var slides = Array.prototype.slice.call(sec.querySelectorAll('.vm-slide'));
  var dots = Array.prototype.slice.call(sec.querySelectorAll('.vm-dots button'));
  var prev = sec.querySelector('.vm-arr.prev'), next = sec.querySelector('.vm-arr.next');
  if (!track || !slides.length) return;
  var cur = -1, raf = 0, touched = false;
  function mid(i){ var s = slides[i]; return s.offsetLeft + s.offsetWidth / 2; }
  function setActive(i){
    if (i === cur) return; cur = i;
    for (var k = 0; k < slides.length; k++) {
      slides[k].classList.toggle('on', k === i);
      if (dots[k]) { dots[k].classList.toggle('on', k === i); dots[k].setAttribute('aria-current', k === i ? 'true' : 'false'); }
    }
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === slides.length - 1;
  }
  function nearest(){
    var c = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
    for (var i = 0; i < slides.length; i++) { var d = Math.abs(mid(i) - c); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function go(i){
    touched = true;
    i = Math.max(0, Math.min(slides.length - 1, i));
    var left = mid(i) - track.clientWidth / 2;
    try { track.scrollTo({ left: left, behavior: 'smooth' }); } catch (e) { track.scrollLeft = left; }
    setActive(i);
  }
  track.addEventListener('scroll', function(){
    if (raf) return;
    raf = requestAnimationFrame(function(){ raf = 0; setActive(nearest()); });
  }, { passive: true });
  ['touchstart', 'pointerdown', 'wheel'].forEach(function(t){ track.addEventListener(t, function(){ touched = true; }, { passive: true }); });
  if (prev) prev.addEventListener('click', function(){ go(cur - 1); });
  if (next) next.addEventListener('click', function(){ go(cur + 1); });
  dots.forEach(function(d, k){ d.addEventListener('click', function(){ go(k); }); });
  track.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
  });
  window.addEventListener('resize', function(){ var i = cur < 0 ? 0 : cur; track.scrollLeft = mid(i) - track.clientWidth / 2; });
  setActive(0);
  // تلميح السحب مرة واحدة لما القسم يبان (لو الضيف لسه ماحرّكش الصور)
  window.vmDressHint = function(){
    if (touched || (window.WEDDING_CONFIG || {}).autoOpen) return;
    setTimeout(function(){
      if (touched) return;
      track.classList.add('hint');
      setTimeout(function(){ track.classList.remove('hint'); }, 1300);
    }, 1100);
  };
})();`;

function buildDress() {
  const slides = SLIDES.map(([f, alt], i) => `<figure class="vm-slide${i === 0 ? ' on' : ''}"><img src="${asset(DIR + f)}" alt="${alt}" width="1120" height="800" loading="lazy" decoding="async" draggable="false"></figure>`).join('\n      ');
  const dots = SLIDES.map((_, i) => `<button type="button" aria-label="صورة ${i + 1}"${i === 0 ? ' class="on" aria-current="true"' : ''}></button>`).join('');
  const colors = COLORS.map((c) => `<i style="--c:${c}"></i>`).join('');
  return `
<!-- ===== الدريس كود (vma4JMh) ===== -->
<div id="vm-dress" class="vm-sec" data-wda-decor>
  <div class="vm-eyebrow"><span class="line"></span><span class="word" data-elem-id="vm20">DRESS CODE</span><span class="line"></span></div>
  <div class="vm-headline" data-elem-id="vm21">الزي المقترح</div>
  <p class="vm-intro" data-elem-id="vm22">يسعدنا أن تتناغم إطلالتكم مع ألوان ليلتنا</p>
  <div class="vm-car" data-wda-ui>
    <div class="vm-track" tabindex="0" role="region" aria-label="صور الزي المقترح — اسحب يمين وشمال">
      ${slides}
    </div>
    <button type="button" class="vm-arr prev" aria-label="الصورة السابقة" disabled>${CHEVRON('M15 5l-7 7 7 7')}</button>
    <button type="button" class="vm-arr next" aria-label="الصورة التالية">${CHEVRON('M9 5l7 7-7 7')}</button>
    <div class="vm-dots">${dots}</div>
  </div>
  <div class="vm-colors-label" data-elem-id="vm25">ألوان الحفل</div>
  <div class="vm-colors" role="img" aria-label="نبيتي وزيتي وبيج">${colors}</div>
  <p class="vm-dress-ar" data-elem-id="vm23">درجات النبيتي والزيتي، أو بدلة بيج</p>
  <p class="vm-dress-en" data-elem-id="vm24">Burgundy and olive tones, or a beige suit.</p>
  <script>${CAROUSEL}</script>
</div>
`;
}

function buildKids() {
  return `
<!-- ===== إسلام وبسنت وهما صغيرين — آخر الدعوة (vma4JMh) ===== -->
<section id="vm-kids" data-wda-decor aria-label="إسلام وبسنت">
  <figure class="vm-pola">
    <span class="vm-tape" aria-hidden="true"></span>
    <img src="${asset(DIR + 'kids.webp')}" alt="إسلام وبسنت وهما صغيرين" width="900" height="1085" loading="lazy" decoding="async" draggable="false">
    <figcaption data-elem-id="vm30">Islam &amp; Basant</figcaption>
  </figure>
</section>
<script>${REVEAL}</script>
`;
}

// الأقسام بتتبني مرة واحدة لما السيرفر يشتغل (بصمة الصور ?v= بتتحسب مرة) — زي G1L8BxQ
const PROGRAM_HTML = buildProgram();
const DRESS_HTML = buildDress();
const KIDS_HTML = buildKids();

// رسالة الشكر بعد الإرسال بالعربي — "هحضر" ولا "معتذر" (القالب بيعرض رسالة واحدة ثابتة)
const RSVP_DONE = `<script id="vm-rsvp-done">(function(){
  var C = window.WEDDING_CONFIG; if (C) C.rsvpSuccessText = 'وصلنا ردّك، وفي انتظارك لتكتمل فرحتنا 🤍';
  document.addEventListener('change', function(e){
    var t = e.target; if (!t || t.name !== 'mrsvp-att') return;
    var yes = t.value === 'yes';
    var h = document.getElementById('mrsvp-done-title'), m = document.getElementById('mrsvp-done-msg');
    if (h) h.textContent = yes ? 'تم تأكيد حضورك' : 'وصلنا ردّك';
    if (m) m.textContent = yes ? 'وصلنا ردّك، وفي انتظارك لتكتمل فرحتنا 🤍' : 'شكرًا لك، ونتمنى لك كل الخير 🤍';
  });
})();</script>`;

module.exports = {
  shortId: SHORT,

  // مفيش حاجة قبل رسم الصفحة — كل التعديلات في transform
  render() { return {}; },

  transform(html) {
    const anchors = [
      '<!-- ===== Venue Photo + Location (custom, final section) ===== -->',
      '<!-- ===== /Venue Photo + Location ===== -->',
      '<!-- ===== /Mithaq RSVP ===== -->',
    ];
    // القالب اتغيّر ومالقيناش أماكن الأقسام؟ الصفحة ترجع زي ما هي بالظبط
    if (anchors.some((a) => html.split(a).length !== 2)) return html;
    return html
      .replace(anchors[0], () => `${PROGRAM_HTML}${anchors[0]}`)
      .replace(anchors[1], () => `${anchors[1]}${DRESS_HTML}`)
      .replace(anchors[2], () => `${anchors[2]}${KIDS_HTML}`)
      .replace(/<\/head>/i, () => `<style id="vm-style">${CSS}</style>${RSVP_DONE}</head>`);
  },
};
