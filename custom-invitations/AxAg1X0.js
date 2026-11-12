// دعوة AxAg1X0 (قالب Mother of Pearl — إنجليزي) — بطلب المالك (2026-11-12): نسخة من cPcTTdw (عبدالله وهدى) لإيمان وأحمد.
// cPcTTdw نفسها ماتلمستش. الفرق عنها:
//  • ختم E&A (بنفس خط Monsieur La Doulaise + Bodoni) في فيديو الظرف والغلاف وختم اللؤلؤ — اترسم من الخطوط على
//    شكل الصورة اللي المالك بعتها (الصورة نفسها معاينة Adobe Stock عليها علامة مائية).
//  • القاعة لونها برجندي: لون الكلام والزراير والعدّاد برجندي بدل الأزرق الرمادي.
//  • "Our Moments" (الصور) اتشالت، ومكانها كارت الخدش على الصدف (Save the date) زي ما كان في qWn9kOE الأول.
//  • (صفحة "A Little Note of Love" اتعملت واتشالت بطلب المالك في نفس اليوم.)
//  • الكلام كله إنجليزي بكلام المالك. البيانات (الأسامي، الميعاد، القاعة، اللينك) في oneOffFix AxAg1X0-eman-ahmed.
// نفس أغنية cPcTTdw (A Thousand Years من الثانية 20).
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
  ['song.mp3', QW + 'song.mp3'],
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
.sc-oval,.sc-ring{position:absolute;left:33%;top:25%;width:34.1%;height:50.2%;border-radius:50%}
.sc-oval{overflow:hidden}
.sc-under{position:absolute;left:0;top:0;right:0;bottom:0;background:var(--ivory);visibility:hidden}
.sc-under.ready{visibility:visible}
.sc-date{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:radial-gradient(ellipse at 50% 40%,#fbf8f3,#ece4d8)}
.sc-d1{font-family:var(--script);font-size:clamp(20px,6vw,34px);line-height:1;color:var(--fg)}
.sc-d2{font-family:var(--serif);font-size:clamp(20px,6.2vw,36px);line-height:1.2;letter-spacing:.04em;margin-top:6px;color:var(--fg)}
.sc-d3{font-family:var(--sans);font-weight:300;font-size:clamp(8px,2.2vw,12px);letter-spacing:.25em;text-transform:uppercase;margin-top:6px;color:rgba(var(--fg-rgb),.7)}
.sc-canvas{position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer;touch-action:none;transition:opacity .7s}
.sc-canvas.done{opacity:0;pointer-events:none}
.sc-ring{pointer-events:none;box-shadow:0 0 0 3px hsl(40,45%,72%),0 0 0 5px hsl(40,30%,92%),0 0 0 6px hsl(40,40%,62%),0 0 0 12px hsla(40,30%,96%,.55),0 0 0 13px hsl(40,40%,66%),0 6px 18px hsla(345,40%,25%,.25),inset 0 0 10px hsla(40,40%,40%,.35)}
@media (min-width:768px){.sc{max-width:620px;margin:0 auto}}

</style>`;

const SCRATCH = `
  <!-- كارت الخدش على الصدف (مكان "Our Moments") -->
  <div class="rv sec">
    <section class="sc" id="scratchCard">
      <img class="sc-bg" src="${asset(QW + 'welcome-families.webp')}" alt="" loading="lazy" draggable="false">
      <div class="sc-oval">
        <div class="sc-under" id="scUnder">
          <div class="sc-date"><span class="sc-d1">Save the date</span><span class="sc-d2">04.12.2026</span><span class="sc-d3">At 7 PM</span></div>
        </div>
        <canvas class="sc-canvas" id="scratch" data-paper="${asset(QW + 'paper.webp')}"></canvas>
      </div>
      <div class="sc-ring" aria-hidden="true"></div>
    </section>
  </div>

`;

const SCRATCH_JS = `<script>
/* كارت الخدش (نفس كود qWn9kOE) */
(function () {
  var cv = document.getElementById('scratch'), under = document.getElementById('scUnder');
  if (!cv) return;
  var drawing = false, last = null, finished = false, drawn = false;
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
    drawing = true; last = null;
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    scratch(e);
  });
  cv.addEventListener('pointermove', scratch);
  cv.addEventListener('pointerup', function () { drawing = false; last = last || { x: 0, y: 0 }; check(); });
  cv.addEventListener('pointercancel', function () { drawing = false; });
})();
</script>`;

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
    title: 'Eman & Ahmed — Wedding Invitation 🤍',
    description: 'Friday, December 4th, 2026 · 7 PM · Jumeirah Hall',
  },

  render() {
    return { head: STYLE, bodyEnd: SCRATCH_JS };
  },

  transform(html) {
    let out = html;
    for (const [from, to] of SWAP) out = out.split(T + from).join(asset(to));
    // إيمان الأول (زي الختم E&A) في الكارت والختام
    out = out.split('data-f="groom"').join('data-f="__B__"').split('data-f="bride"').join('data-f="groom"').split('data-f="__B__"').join('data-f="bride"');
    // جملة الترحيب تحت القاعة في الكارت
    const withLine = /<p class="ht-with" data-elem-id="mp4"><\/p>\s*/;
    if (withLine.test(out)) {
      out = out.replace(withLine, '');
      out = out.replace(/(<p class="ht-city up" data-elem-id="mp7"[^>]*><\/p>\s*<\/div>)/, '$1\n      <p class="ht-with ea-after" data-elem-id="mp4"></p>');
    }
    // "Our Moments" → كارت الخدش
    const g = cut(out, '<!-- 4) الصور', '<!-- 5)');
    if (g) out = out.slice(0, g[0]) + SCRATCH + out.slice(g[1]);
    return out;
  },
};
