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

  render() {
    return { head: STYLE, bodyEnd: SCRATCH_JS };
  },

  transform(html) {
    let out = html;
    for (const [from, to] of SWAP) out = out.split(T + from).join(asset(to));
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
    // الختم اللي في الختام (جوه الدعوة) برجندي — اللي بره على المظروف زي ما هو
    out = out.replace(/(<img class="ft-seal" src=")[^"]*(")/, (m, a, b) => `${a}${asset(OWN + 'seal-wine.webp')}${b}`);
    return out;
  },
};
