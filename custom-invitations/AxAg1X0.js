// دعوة AxAg1X0 (قالب Mother of Pearl — إنجليزي) — بطلب المالك (2026-11-12): نسخة من cPcTTdw (عبدالله وهدى) لإيمان وأحمد.
// cPcTTdw نفسها ماتلمستش. الفرق عنها:
//  • ختم E&A (بنفس خط Monsieur La Doulaise + Bodoni) في فيديو الظرف والغلاف وختم اللؤلؤ — اترسم من الخطوط على
//    شكل الصورة اللي المالك بعتها (الصورة نفسها معاينة Adobe Stock عليها علامة مائية).
//  • القاعة لونها برجندي: لون الكلام والزراير والعدّاد برجندي بدل الأزرق الرمادي.
//  • "Our Moments" (الصور) اتشالت، ومكانها كارت الخدش على الصدف زي ما كان في qWn9kOE الأول.
//    (2026-11-15 بطلب المالك) تحت الخدش بقت صورة العرسان اللي بعتها مالية الشكل البيضاوي بدل Save the date —
//    زي التصميم الأصلي و DBywdm2 (التاريخ موجود في الكارت الأولاني والعدّاد والختام).
//  • (صفحة "A Little Note of Love" اتعملت واتشالت بطلب المالك في نفس اليوم.)
//  • الكلام كله إنجليزي بكلام المالك. البيانات (الأسامي، الميعاد، القاعة، اللينك) في oneOffFix AxAg1X0-eman-ahmed.
// الأغنية (2026-11-15): الملف اللي المالك بعته (مقطع 27 ثانية) — مقصوص عند النقطة اللي اللحن بيرجع فيها لأوله
// عشان اللفّة ماتبانش، وصوته على مستوى أغاني الموقع. (قبلها كانت نفس أغنية cPcTTdw.)
const { glideScript } = require('./_glide');
const { asset } = require('./_asset');

const SHORT = 'AxAg1X0';
const T = '/templates/mother-of-pearl/';
const OWN = `/custom/${SHORT}/`;
const QW = '/custom/qWn9kOE/';
const SWAP = [
  ['poster.webp', OWN + 'poster.webp'],
  ['v1.mp4', OWN + 'v1.mp4'],
  ['seal.webp', OWN + 'seal.webp'],
  ['countdown-frame.webp', OWN + 'countdown-frame.webp'],
  ['song.mp3', OWN + 'song.mp3'],
];

// برجندي القاعة
const WINE = '#6e2433';
const WINE_RGB = '110,36,51';

const STYLE = `<style id="ea-style">
:root{--fg:${WINE};--fg-rgb:${WINE_RGB}}
@media (hover:hover){.btn-map:hover>span>span{background:#561a27!important}}
/* الكارت: التاريخ والساعة سطرين، والجملة تحت القاعة */
[data-elem-id="mp5"]{white-space:pre-line}
.ht-with.ea-after{margin:14px auto 0;max-width:min(52vw,330px);font-style:italic;font-size:16px;line-height:1.45;text-wrap:balance}
@media (min-width:768px){.ht-with.ea-after{max-width:380px;font-size:18px;margin-top:20px}}
.ht-city:empty{display:none}

/* ===== كارت الخدش على الصدف (مكان "Our Moments") ===== */
.sc{position:relative;width:100%;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.sc-bg{width:100%;height:auto}
/* (المالك 2026-11-16) الدايرة أكبر عشان الصورة تبان — نفس الشكل ونفس النص */
.sc-oval,.sc-ring{position:absolute;left:28.05%;top:17.7%;width:44%;height:64.8%;border-radius:50%}
.sc-oval{overflow:hidden}
.sc-under{position:absolute;left:0;top:0;right:0;bottom:0;background:var(--ivory);visibility:hidden}
.sc-under.ready{visibility:visible}
/* تحت الخدش: صورة العرسان مالية الشكل البيضاوي (زي DBywdm2) */
.sc-photo{position:absolute;left:0;top:0;width:100%;height:100%;max-width:none;object-fit:cover;-webkit-user-select:none;user-select:none}
.sc-canvas{position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer;touch-action:none;transition:opacity .7s}
.sc-canvas.done{opacity:0;pointer-events:none}
.sc-ring{pointer-events:none;box-shadow:0 0 0 3px hsl(40,45%,72%),0 0 0 5px hsl(40,30%,92%),0 0 0 6px hsl(40,40%,62%),0 0 0 12px hsla(40,30%,96%,.55),0 0 0 13px hsl(40,40%,66%),0 6px 18px hsla(345,40%,25%,.25),inset 0 0 10px hsla(40,40%,40%,.35)}
@media (min-width:768px){.sc{max-width:620px;margin:0 auto}}
/* إيد صغيرة بتمسح (أيقونة pointer من مكتبة Lucide) — بتختفي أول ما الضيف يبدأ يخربش */
.sc-hand{position:absolute;left:55%;top:64%;width:13%;max-width:66px;aspect-ratio:1;z-index:6;pointer-events:none;opacity:0;
  filter:drop-shadow(0 4px 8px rgba(${WINE_RGB},.35));transition:opacity .6s ease;animation:scrub 2.6s ease-in-out infinite}
.sc-hand.on{opacity:1}
.sc-hand svg{width:100%;height:100%;display:block}
.sc-hand svg path{fill:#fbf6ee;stroke:${WINE};stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}
.sc-hand::after{content:"";position:absolute;left:-60%;top:-8%;width:120%;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);opacity:.0;animation:swish 2.6s ease-in-out infinite}
@keyframes scrub{0%{transform:translate(0,0) rotate(-8deg)}25%{transform:translate(-70%,-18%) rotate(-14deg)}50%{transform:translate(0,-36%) rotate(-8deg)}75%{transform:translate(-70%,-54%) rotate(-14deg)}100%{transform:translate(0,0) rotate(-8deg)}}
@keyframes swish{0%,100%{opacity:0}25%,75%{opacity:.8}}
@media (prefers-reduced-motion:reduce){.sc-hand{animation:none}}

/* ===== "A Little Note of Love" مكان الدريس كود (المالك 2026-11-16) — نفس الإطار، والختم برجندي ===== */
.ea-note{padding:0 21% 9%!important}
.ea-note .dr-t{font-size:36px;line-height:1.05}
.ea-note .dr-s{font-size:31px;margin-top:6px}
.ea-note .dr-line{width:100%;margin:22px 0 18px}
.ea-note .ea-p{text-wrap:balance;font-family:var(--serif);font-style:italic;font-size:17px;line-height:1.55;color:rgba(${WINE_RGB},.92)}
.ea-note .ea-sign{margin:18px -4% 0;font-family:var(--script);font-size:24px;line-height:1.25;text-wrap:balance}
@media (max-width:360px){.ea-note .dr-t{font-size:31px}.ea-note .ea-p{font-size:15.5px}.ea-note .ea-sign{font-size:21px}}
@media (min-width:768px){.ea-note .ea-p{font-size:19px}}

</style>`;

const SCRATCH = `
  <!-- كارت الخدش على الصدف (مكان "Our Moments") -->
  <div class="rv sec">
    <section class="sc" id="scratchCard">
      <img class="sc-bg" src="${asset(QW + 'welcome-families.webp')}" alt="" loading="lazy" draggable="false">
      <div class="sc-oval">
        <div class="sc-under" id="scUnder">
          <img class="sc-photo" src="${asset(OWN + 'couple.webp')}" alt="Ahmed &amp; Eman" loading="lazy" decoding="async" draggable="false">
        </div>
        <canvas class="sc-canvas" id="scratch" data-paper="${asset(QW + 'paper.webp')}"></canvas>
      </div>
      <div class="sc-ring" aria-hidden="true"></div>
      <div class="sc-hand" id="scHand" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></div>
    </section>
  </div>

`;

const SCRATCH_JS = `<script>
/* كارت الخدش (نفس كود qWn9kOE) */
(function () {
  var cv = document.getElementById('scratch'), under = document.getElementById('scUnder');
  if (!cv) return;
  var drawing = false, last = null, finished = false, drawn = false, hand = document.getElementById('scHand');
  function hideHand() { if (hand) { hand.classList.remove('on'); setTimeout(function () { if (hand && hand.parentNode) hand.parentNode.removeChild(hand); hand = null; }, 700); } }
  if (hand) {
    if ('IntersectionObserver' in window) {
      var ho = new IntersectionObserver(function (es) { if (es[0].isIntersecting && hand && !finished) { setTimeout(function () { if (hand && !finished) hand.classList.add('on'); }, 600); ho.disconnect(); } }, { threshold: 0.45 });
      ho.observe(cv);
    } else hand.classList.add('on');
  }
  function draw() {
    var r = cv.getBoundingClientRect();
    if (r.width < 20 || r.height < 20 || drawn) return;
    drawn = true;
    var dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    var c = cv.getContext('2d');
    c.scale(dpr, dpr);
    var g = r.width, x = r.height;
    c.fillStyle = 'rgb(235,227,215)';
    c.fillRect(0, 0, g, x);
    under.classList.add('ready');
    var img = new Image();
    img.onload = function () {
      var ready = (document.fonts && document.fonts.load) ? document.fonts.load('40px "Monsieur La Doulaise Local"') : Promise.resolve();
      ready.catch(function () {}).then(function () {
        if (last || finished) return;
        var k = Math.max(g / img.width, x / img.height), w = img.width * k, h = img.height * k;
        c.drawImage(img, (g - w) / 2, (x - h) / 2, w, h);
        c.fillStyle = 'rgba(${WINE_RGB},0.85)';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = Math.max(18, g * 0.17) + 'px "Monsieur La Doulaise Local", cursive';
        c.fillText('Scratch', g / 2, x / 2 - g * 0.09);
        c.fillText('to reveal', g / 2, x / 2 + g * 0.09);
      });
    };
    img.src = cv.getAttribute('data-paper');
  }
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(cv);
  window.addEventListener('load', draw);
  draw();
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function scratch(e) {
    if (!drawing) return;
    var c = cv.getContext('2d'), p = pos(e), w = cv.getBoundingClientRect().width * 0.09;
    c.globalCompositeOperation = 'destination-out';
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w * 2;
    c.beginPath();
    var from = last || p;
    c.moveTo(from.x, from.y); c.lineTo(p.x, p.y); c.stroke();
    last = p;
  }
  function check() {
    if (finished) return;
    var d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, u = 0, f = 0;
    for (var i = 3; i < d.length; i += 64) { f++; if (d[i] === 0) u++; }
    if (u / f > 0.55) { finished = true; cv.classList.add('done'); }
  }
  cv.addEventListener('pointerdown', function (e) {
    drawing = true; last = null; hideHand();
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    scratch(e);
  });
  cv.addEventListener('pointermove', scratch);
  cv.addEventListener('pointerup', function () { drawing = false; last = last || { x: 0, y: 0 }; check(); });
  cv.addEventListener('pointercancel', function () { drawing = false; });
})();
</script>`;

// "A Little Note of Love" مكان الدريس كود (المالك 2026-11-16) — نفس إطار القالب، والختم برجندي
// (2026-11-18 بطلب المالك) علامة "انزل لتحت" في آخر الكارت الأساسي: بتظهر بهدوء بعد ما الكلام يبان (بعد فتح الظرف)،
// خط رفيع بيجري فيه نور لتحت + سهم بيتنفّس، باللون البرجندي. الضغط عليها بينزل للعدّاد، وبتختفي أول ما الضيف ينزل.
const SCROLL_HINT = `<a class="ea-scroll" id="eaScroll" href="#countdown" aria-label="Scroll down"><span class="ea-scroll-t">Scroll</span><span class="ea-scroll-line"><i></i></span><svg class="ea-scroll-chev" viewBox="0 0 24 14" aria-hidden="true"><path d="M2 2l10 10L22 2"/></svg></a>`;
const SCROLL_STYLE = `<style id="ea-scroll-style">
.ea-scroll{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:22;display:flex;flex-direction:column;align-items:center;gap:7px;
  padding:6px 16px;border-radius:40px;background:radial-gradient(closest-side,rgba(247,243,238,.75),rgba(247,243,238,0));color:${WINE};text-decoration:none;opacity:0;transform:translate(-50%,12px);transition:opacity 1.4s ease,transform 1.4s cubic-bezier(.2,.7,.2,1);pointer-events:none;-webkit-tap-highlight-color:transparent}
.ea-scroll.tight .ea-scroll-t{display:none}
.ea-scroll.tight .ea-scroll-line{height:24px}
.ea-scroll.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.ea-scroll.gone{opacity:0;transform:translate(-50%,8px);pointer-events:none;transition-duration:.6s}
.ea-scroll-t{font-family:'Jost',sans-serif;font-weight:300;font-size:9.5px;letter-spacing:.42em;text-transform:uppercase;line-height:1;margin-right:-.42em;opacity:.85}
.ea-scroll-line{position:relative;display:block;width:1px;height:34px;overflow:hidden;background:rgba(${WINE_RGB},.18)}
.ea-scroll-line i{position:absolute;left:0;top:-40%;width:1px;height:40%;background:linear-gradient(to bottom,rgba(${WINE_RGB},0),${WINE});animation:eaDrop 2.2s cubic-bezier(.6,0,.3,1) infinite}
.ea-scroll-chev{width:15px;height:9px;overflow:visible;animation:eaBob 2.2s ease-in-out infinite}
.ea-scroll-chev path{fill:none;stroke:${WINE};stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
@keyframes eaDrop{0%{top:-40%}70%,100%{top:100%}}
@keyframes eaBob{0%,45%{transform:translateY(-2px);opacity:.35}70%{transform:translateY(3px);opacity:1}100%{transform:translateY(-2px);opacity:.35}}
@media (min-width:768px){.ea-scroll{bottom:30px}.ea-scroll-line{height:48px}}
@media (prefers-reduced-motion:reduce){.ea-scroll-line i,.ea-scroll-chev{animation:none}.ea-scroll-line i{top:60%}}
</style>`;
const SCROLL_JS = `<script>
(function () {
  var a = document.getElementById('eaScroll'), ht = document.getElementById('heroText');
  if (!a || !ht) return;
  var shown = false, gone = false;
  function show() { if (shown || gone) return; shown = true; setTimeout(function () { if (gone || scrollY >= 40) return; fit(); a.classList.add('on'); }, 1500); }
  // الشاشات القصيرة: لو العلامة هتلمس الكلام، الكلمة بتتشال ويفضل الخط والسهم
  function fit() {
    a.classList.remove('tight');
    var low = 0; [].forEach.call(ht.querySelectorAll('p,h1'), function (el) { if (el.offsetHeight) low = Math.max(low, el.getBoundingClientRect().bottom); });
    if (a.getBoundingClientRect().top < low + 6) a.classList.add('tight');
  }
  addEventListener('resize', function () { if (shown && !gone) fit(); });
  if (ht.classList.contains('on')) show();
  else try { new MutationObserver(function (m, o) { if (ht.classList.contains('on')) { o.disconnect(); show(); } }).observe(ht, { attributes: true, attributeFilter: ['class'] }); } catch (e) { setTimeout(show, 9000); }
  addEventListener('scroll', function () { if (!gone && scrollY > 60) { gone = true; a.classList.remove('on'); a.classList.add('gone'); } }, { passive: true });
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var t = document.getElementById('countdown') || a.parentNode.nextElementSibling;
    var y = t ? t.getBoundingClientRect().top + scrollY - 10 : innerHeight;
    try { scrollTo({ top: y, behavior: 'smooth' }); } catch (x) { scrollTo(0, y); }
  });
})();
</script>`;

const NOTE = `
  <!-- 7) A Little Note of Love (مكان الدريس كود) -->
  <div class="rv sec" data-section="loveNote">
    <section class="dr">
      <div class="rv dr-wrap">
        <div class="dr-box">
          <div class="dr-frame"><img loading="lazy" decoding="async" src="${asset(T + 'dress-frame.webp')}" alt="" draggable="false"></div>
          <img class="dr-seal" src="${asset(OWN + 'seal-wine.webp')}" alt="" aria-hidden="true" draggable="false">
          <div class="dr-in ea-note">
            <p class="dr-t">A Little Note</p>
            <p class="dr-s">of Love</p>
            <div class="dr-line" aria-hidden="true"><i></i><b></b><i></i></div>
            <p class="ea-p">A sweet night’s sleep for the Kids while the <span style="white-space:nowrap">grown-ups</span> celebrate</p>
            <p class="ea-sign">With love and appreciation. 🤍</p>
          </div>
        </div>
      </div>
    </section>
  </div>

`;

// ===== فيديو فتح واحد (المالك 2026-11-18) =====
// "الفيديو التاني اللي فيه الفيونكة بيعلق في آخره — خلّي الأولاني ملضوم في التاني، يبقى فيديو واحد".
// open.mp4 = فيديو الظرف (v1.mp4 بتاعنا) + فيديو الفيونكة (v2.mp4 بتاع القالب) في ملف واحد (10 ثواني)، وفيه نفس
// اللي الصفحة كانت بتعمله بينهم بالظبط: آخر الظرف بينوّر (brightness 1.1 / saturate .97 في 1.1 ثانية) والفيونكة
// بتظهر فوقه في 0.8 ثانية (scratch ea2/merge.py). كده مفيش فيديو تاني يستنى يتحمّل ولا يتفك من الأول.
// الصفحة: فيديو واحد بيتحمّل مرة واحدة كامل في الذاكرة من أول ما الدعوة تفتح. لو الضيف داس قبل ما يخلص: بنستنى
// بس لو هيخلص خلال ثانيتين بالكتير (السرعة بتتقاس من آخر ~0.6 ثانية تحميل) — وإلا (أو لو النت سريع) الفيديو بيشتغل
// من النت على طول وتحميل الذاكرة بيقف عشان النت كله يروح له. لو المتصفح ماعرفش يشغّل نسخة الذاكرة → نفس الملف من النت.
// آخر الفيديو = نفس نهاية الفيونكة (الكارت بيظهر قبل الآخر بـ 1.8 ثانية والغلاف بيختفي قبله بثانية).
// لو أي حتة من كود القالب اتغيّرت ومش لاقيينها، أو open.mp4 مش موجود، بنسيب الدعوة على الفيديوهين القدام (ولا حاجة بتبوظ).
// (2026-11-18، 3 مراجعات مستقلة: iOS / منطق الصفحة / الفيديو نفسه — اتصلّح كل اللي طلع فيها.)
const ONE_VIDEO = [
  // 1) الضغطة: فيديو واحد — ولو نسخة الذاكرة لسه جاية، نستنى عليها شوية
  [`    // نفس الضغطة بتجهّز الفيديو التاني عشان يشتغل لوحده بعد الأول (آيفون في توفير الطاقة)
    try {
      var pv = v2.play();
      if (pv && pv.then) pv.then(function () { if (!v2Started) { v2.pause(); try { v2.currentTime = 0; } catch (e) {} } }).catch(function () {});
    } catch (e) {}
    var p;
    try { p = v1.play(); } catch (e) { p = null; }
    if (p && p.catch) p.catch(fadeCover);
    watchStall(v1);
    firstWatch = setTimeout(function () { if (v1.currentTime <= 0.05) fadeCover(); }, 6000);
    watchdog = setTimeout(fadeCover, 20000);
  }`,
  `    watchdog = setTimeout(fadeCover, 20000);
    if (oneLoading && !oneReady && worthWaiting(0)) {
      // الضغطة نفسها بتفتح الفيديو (آيفون في توفير الطاقة مابيشغّلش فيديو من غير ضغطة) — وبعدين نستنى نسخة الذاكرة
      try {
        var pu = v1.play();
        if (pu && pu.then) pu.then(function () { if (!oneStarted) { v1.pause(); try { v1.currentTime = 0; } catch (e) {} } }).catch(function () {});
      } catch (e) {}
      var w0 = Date.now();
      oneWait = setInterval(function () {
        if (state !== 'envelope') { clearInterval(oneWait); return; }
        if (oneReady || !oneLoading) { clearInterval(oneWait); beginOne(); return; }
        if (!worthWaiting(Date.now() - w0)) { clearInterval(oneWait); giveUpMemory(); beginOne(); }
      }, 100);
      return;
    }
    if (oneLoading && !oneReady) giveUpMemory();
    beginOne();
  }
  var oneLoading = false, oneReady = false, oneStarted = false, oneWait = 0, oneNet = false;
  var oneGot = 0, oneTotal = 0, oneAbort = null, oneHist = [];
  var ONE_BPS = 248000;   // متوسط الفيديو نفسه: 2.5 ميجا في 10.08 ثانية (بايت في الثانية)
  // نسخة الذاكرة (الملف كله) — بنسجّل الوصول أول بأول عشان نعرف السرعة الحقيقية
  function loadOne() {
    if (!window.fetch || !window.URL || !URL.createObjectURL || !window.Blob) { try { v1.preload = 'auto'; } catch (e) {} return; }
    oneLoading = true;
    var ac = null;
    try { ac = new AbortController(); } catch (e) {}
    oneAbort = ac;
    fetch(vurl(v1), ac ? { signal: ac.signal } : {}).then(function (r) {
      if (!r.ok) throw 0;
      oneTotal = +(r.headers.get('content-length') || 0);
      if (!r.body || !r.body.getReader) return r.blob();
      var rd = r.body.getReader(), parts = [];
      function pump() {
        return rd.read().then(function (x) {
          if (x.done) return new Blob(parts, { type: 'video/mp4' });
          parts.push(x.value); oneGot += x.value.byteLength;
          oneHist.push([Date.now(), oneGot]);
          if (oneHist.length > 120) oneHist.splice(0, 60);
          return pump();
        });
      }
      return pump();
    }).then(function (b) {
      oneLoading = false;
      if (b && b.size > 1000 && !oneStarted) { v1.src = URL.createObjectURL(b); try { v1.load(); } catch (e) {} oneReady = true; }
    }).catch(function () {
      oneLoading = false;
      try { if (!oneStarted) v1.preload = 'auto'; } catch (e) {}
    });
  }
  // السرعة دلوقتي (بايت/مللي ثانية) من آخر ~0.6 ثانية تحميل — من أول بايت وصل، مش من وقت ما الطلب اتبعت
  function oneRate() {
    var n = oneHist.length;
    if (n < 2) return 0;
    var last = oneHist[n - 1], i = n - 1;
    while (i > 0 && last[0] - oneHist[i - 1][0] <= 600) i--;
    var dt = last[0] - oneHist[i][0];
    return dt >= 250 ? (last[1] - oneHist[i][1]) / dt : 0;
  }
  // الضيف داس قبل ما النسخة تخلص: نستنى بس لو هتخلص قريب (ثانيتين بالكتير من الضغطة)
  function worthWaiting(waited) {
    if (waited >= 2000) return false;
    var r = oneRate();
    // السرعة لسه مش معروفة: لو السيرفر لسه مارَدّش خالص نستنى الطلب اللي ماشي (طلب جديد من النت هيستنى الرد من الأول)
    if (!r) return waited < (oneGot ? 1200 : 2000);
    if (!oneTotal) return waited < 1200;
    var left = (oneTotal - oneGot) / r;                 // مللي ثانية لحد ما النسخة تكمل
    if (left <= 700) return true;                       // على وشك تخلص — من الذاكرة
    if (r * 1000 > 1.6 * ONE_BPS) return false;         // النت أسرع من الفيديو بكتير: من النت على طول ومش هيقف
    return left <= 2000 - waited;
  }
  // من النت: تحميل الذاكرة بيقف عشان النت كله يروح للفيديو (مايقفش في نصّه)
  function giveUpMemory() {
    try { if (oneAbort) oneAbort.abort(); } catch (e) {}
    oneLoading = false;
    try { v1.preload = 'auto'; } catch (e) {}
  }
  // نسخة الذاكرة مااشتغلتش في المتصفح ده → نفس الفيديو من النت (مرة واحدة) بدل ما الفتح يتشال
  function netRetry() {
    if (oneNet || !/^blob:/.test(v1.currentSrc || v1.src || '')) return false;
    oneNet = true;
    try { v1.src = vurl(v1); v1.load(); } catch (e) { return false; }
    if (oneStarted) {
      var p2;
      try { p2 = v1.play(); } catch (e) { p2 = null; }
      if (p2 && p2.catch) p2.catch(fadeCover);
      // من الأول: مراقبة الوقوف وأول فريم بتبدأ من جديد
      watchStall(v1);
      clearTimeout(firstWatch);
      firstWatch = setTimeout(function () { if (v1.currentTime <= 0.05) fadeCover(); }, 6000);
    }
    return true;
  }
  function beginOne() {
    if (oneStarted || state !== 'envelope') return;
    oneStarted = true;
    try { if (v1.currentTime > 0) v1.currentTime = 0; } catch (e) {}
    var p;
    try { p = v1.play(); } catch (e) { p = null; }
    // لو المحاولة من النت شغالة خلاص (netRetry) هي اللي بتكمّل — مانقفلش الفتح
    if (p && p.catch) p.catch(function () { if (oneNet) return; if (!netRetry()) fadeCover(); });
    watchStall(v1);
    firstWatch = setTimeout(function () { if (v1.currentTime <= 0.05) fadeCover(); }, 6000);
  }`],
  // 2) آخر الفيديو الواحد = آخر الفيونكة: الكارت يظهر والغلاف يختفي (زي ما كان على الفيديو التاني)
  [`      var left = v1.duration - v1.currentTime;
      if (left < 1.2) v1.classList.add('warm');
      if (left < 0.1) startV2();
    });
    v1.addEventListener('ended', startV2);`,
  `      if (!oneStarted) return;
      // طول الفيديو معروف (10.08 ث) — لو المتصفح لسه مش عارفه (بيتحمّل من النت) ماتستناش لآخر فريم
      var left = (isFinite(v1.duration) ? v1.duration : 10.08) - v1.currentTime;
      if (left < 1.8) showHero();
      if (left < 1) fadeCover();
    });
    v1.addEventListener('ended', function () { if (oneStarted) fadeCover(); });
    v1.addEventListener('error', function () { if (state === 'envelope' && !netRetry()) fadeCover(); });`],
  // ... والـ error القديم بتاع الفيديو الأول (اللي كان بيقفل الفتح على طول) مكانه السطر اللي فوق
  [`    v1.addEventListener('error', function () { if (state === 'envelope') fadeCover(); });
`, ''],
  // 3) التحميل: ملف واحد بس في الذاكرة (من غير الفيديو التاني خالص)
  [`    v1.src = vurl(v1);
    v2.preload = 'metadata';
    v2.src = vurl(v2);
    v2Loading = true;
    preload(v1, function () { return state === 'idle'; }, function () {
      preload(v2, function () { return !v2Started; }, function (ok) { v2Ready = ok; v2Loading = false; });
    });`,
  `    // الفيديو نفسه بياخد بياناته الأولانية بس — الملف كله بيتحمّل مرة واحدة في الذاكرة (مش مرتين في نفس الوقت)
    v1.preload = 'metadata';
    v1.src = vurl(v1);
    loadOne();`],
  // 4) عنصر الفيديو التاني فاضي (من غير ملف) — الكود القديم بيلمسه بس مابيحمّلش حاجة
  [` preload="auto" data-src="${T}v2.mp4"></video>`, ' preload="none"></video>'],
  // 5) الضيف خرج من الموبايل ورجع وإحنا لسه مستنيين نسخة الذاكرة: الانتظار نفسه هو اللي بيشغّل (مايبدأش ويرجع من الأول)
  [`      var cur = v2Started ? v2 : v1;`, `      if (!oneStarted) return;
      var cur = v1;`],
];

// الملفات بتتحسب بصمتها مرة واحدة (السيرفر بيعيد التشغيل مع كل رفع) — مش مع كل فتحة للدعوة
const OPEN_SRC = asset(OWN + 'open.mp4');
const SWAP_URLS = SWAP.map(([from, to]) => [T + from, asset(to)]);
const SEAL_WINE = asset(OWN + 'seal-wine.webp');

/** الدعوة بفيديو واحد — أو null لو أي حتة من كود القالب مش موجودة مرة واحدة بالظبط (نسيبها على الفيديوهين) */
function oneVideo(html) {
  // الملف لازم يكون موجود (asset بيرجّع اللينك من غير ?v= لو مش لاقيه) — وإلا الفيديوهين القدام
  if (OPEN_SRC.indexOf('?v=') === -1) {
    console.warn(`[${SHORT}] one-video patch skipped: ${OWN}open.mp4 missing`);
    return null;
  }
  let out = html;
  // نفس الملف بنهايات سطور ويندوز (\r\n) عندنا ولينكس (\n) على السيرفر
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  for (const [a, b] of ONE_VIDEO) {
    const from = a.split('\n').join(eol);
    const to = b.split('\n').join(eol);
    const n = out.split(from).length - 1;
    if (n !== 1) {
      console.warn(`[${SHORT}] one-video patch skipped (template piece found ${n}×): ${from.trim().slice(0, 60)}`);
      return null;
    }
    out = out.replace(from, () => to);
  }
  return out.split(T + 'v1.mp4').join(OPEN_SRC);
}

function cut(html, startMark, endMark) {
  const a = html.indexOf(startMark);
  const b = a === -1 ? -1 : html.indexOf(endMark, a);
  return a === -1 || b === -1 ? null : [a, b];
}

module.exports = {
  shortId: SHORT,

  share: {
    image: asset(`/custom/${SHORT}/share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Ahmed & Eman — Wedding Invitation 🤍',
    description: 'Friday, December 4th, 2026 · 7 PM · Jumeirah Hall',
  },

  render({ editMode } = {}) {
    if (editMode) return { head: STYLE, bodyEnd: SCRATCH_JS };
    // (المالك 2026-11-20) بعد ما الدعوة تتفتح بتنزل لوحدها بالراحة لحد آخرها؛ لمسة الضيف بتوقّفها
    // وبترجع تكمّل لو ساب الشاشة شوية (نفس OPZMQ1q — custom-invitations/_glide.js)
    return { head: STYLE + SCROLL_STYLE, bodyEnd: SCRATCH_JS + SCROLL_JS + glideScript({ playSel: '#heroText', playClass: 'on', after: 3000, speed: 75 }) };
  },

  transform(html, { editMode } = {}) {
    // فيديو فتح واحد (open.mp4) — ولو كود القالب اتغيّر، الفيديوهين القدام (v1.mp4 بتاعنا + فيونكة القالب)
    let out = oneVideo(html) || html;
    for (const [from, to] of SWAP_URLS) out = out.split(from).join(to);
    // (2026-11-16 المالك: أحمد الأول — "Ahmed & Eman") ترتيب القالب نفسه: العريس الأول في الكارت والختام
    // جملة الترحيب تحت القاعة في الكارت
    const withLine = /<p class="ht-with" data-elem-id="mp4"><\/p>\s*/;
    if (withLine.test(out)) {
      out = out.replace(withLine, '');
      out = out.replace(/(<p class="ht-city up" data-elem-id="mp7"[^>]*><\/p>\s*<\/div>)/, '$1\n      <p class="ht-with ea-after" data-elem-id="mp4"></p>');
    }
    // "Our Moments" → كارت الخدش
    const g = cut(out, '<!-- 4) الصور', '<!-- 5)');
    if (g) out = out.slice(0, g[0]) + SCRATCH + out.slice(g[1]);
    // الدريس كود اتشال خالص → "A Little Note of Love" مكانه
    const dc = cut(out, '<!-- 7) الدريس كود', '<!-- 8)');
    if (dc) out = out.slice(0, dc[0]) + NOTE + out.slice(dc[1]);
    // علامة "انزل لتحت" في آخر الكارت الأساسي (مش في المحرر)
    if (!editMode) out = out.replace('<div class="hero-text" id="heroText">', (m) => SCROLL_HINT + m);
    // الختم اللي في الختام (جوه الدعوة) برجندي — اللي بره على المظروف زي ما هو
    out = out.replace(/(<img class="ft-seal" src=")[^"]*(")/, (m, a, b) => `${a}${SEAL_WINE}${b}`);
    return out;
  },
};
