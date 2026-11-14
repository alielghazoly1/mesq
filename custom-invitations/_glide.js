// نزول تلقائي هادي للدعوة بعد ما الضيف يفتحها (بطلب المالك — أول مرة على OPZMQ1q، 2026-11-14).
//
// الصفحة بتبدأ تنزل لوحدها بعد ما أول صفحة تخلص حركتها، بسرعة قراية مريحة: بتبدأ بالراحة وتوصل
// سرعتها، وبتهدى قبل آخر الصفحة وتقف عنده. أي لمسة من الضيف (صباع / عجلة الماوس / كيبورد) بتوقّفها،
// ولو ساب الشاشة كام ثانية بترجع تكمّل من مكانه — عشان لو حك كارت التاريخ أو قلب الصفحة بإيده الدعوة
// تفضل "شغالة". زرار الموسيقى مابيوقفهاش، ومش بتتحرك وهو بيكتب في فورم الحضور. في المحرر مفيش نزول.
//
// glideScript({ playSel, playClass, after, clickSel, afterClick, speed, idle })
//   playSel/playClass: العنصر اللي بيبان عليه إن أول صفحة اشتغلت (زي #hv-hero بياخد hv--play) → بنبدأ بعده بـ after
//   clickSel/afterClick: احتياطي لو العنصر مش موجود — بعد الضغطة على الغلاف بـ afterClick
//   speed: بكسل في الثانية، idle: كام ملي ثانية من غير لمس عشان ترجع تكمّل
function glideScript(opts = {}) {
  const cfg = {
    playSel: opts.playSel || '',
    playClass: opts.playClass || '',
    after: opts.after || 4000,
    clickSel: opts.clickSel || '.popup-enter',
    afterClick: opts.afterClick || 6500,
    speed: opts.speed || 42,
    idle: opts.idle || 3500,
    ease: 2000,
  };
  return `<script id="mq-glide">(function () {
  if (window.__mqGlide) return; window.__mqGlide = 1;
  var C = ${JSON.stringify(cfg)};
  var root = document.documentElement;
  var running = false, done = false, armed = false, pos = 0, t0 = 0, tPrev = 0, startT = 0, idleT = 0, sb = '';
  function maxY() { return Math.max(root.scrollHeight, document.body ? document.body.scrollHeight : 0) - innerHeight; }
  function curY() { return window.pageYOffset || root.scrollTop || 0; }
  function busy() { var a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); }
  function stopRun() { if (running) { running = false; root.style.scrollBehavior = sb; } }
  function frame(ts) {
    if (!running) return;
    if (!t0) { t0 = ts; tPrev = ts; pos = curY(); }
    var dt = Math.min(64, ts - tPrev); tPrev = ts;
    var y = curY();
    if (Math.abs(y - pos) > 3) pos = y;                    // الصفحة اتحركت من حاجة تانية — نكمّل من مكانها
    var m = maxY(), rem = m - pos;
    if (rem <= 0.5) { stopRun(); done = true; return; }   // آخر الدعوة: خلاص
    var k = Math.min(1, (ts - t0) / C.ease); k = k * k * (3 - 2 * k);
    var v = C.speed * k * Math.max(0.07, Math.min(1, Math.sqrt(rem / 140)));   // آخر 140 بكسل: بتهدى بالتدريج لحد ما تقف
    pos = Math.min(m, pos + v * dt / 1000);
    window.scrollTo(0, pos);
    requestAnimationFrame(frame);
  }
  function go() {
    if (running || done) return;
    if (document.hidden || busy()) { later(); return; }
    if (maxY() - curY() < 2) { done = true; return; }
    sb = root.style.scrollBehavior; root.style.scrollBehavior = 'auto';
    running = true; t0 = 0; requestAnimationFrame(frame);
  }
  function later() { clearTimeout(idleT); idleT = setTimeout(go, C.idle); }
  function arm(delay) {
    if (armed) return; armed = true;
    startT = setTimeout(go, delay);
  }
  // لمسة من الضيف بعد الفتح: نوقف، ونكمّل لما يسيب الشاشة شوية
  function poke(e) {
    if (!armed || done) return;
    var t = e && e.target;
    if (t && t.closest && t.closest('#audio-control')) return;
    clearTimeout(startT); stopRun(); later();
  }
  ['touchstart', 'touchmove', 'wheel', 'mousedown', 'keydown'].forEach(function (ev) { addEventListener(ev, poke, { passive: true, capture: true }); });
  document.addEventListener('focusout', function () { if (armed && !done && !running) later(); });
  function init() {
    var el = C.playSel && document.querySelector(C.playSel);
    if (el && C.playClass) {
      var check = function () { if (el.classList.contains(C.playClass)) { arm(C.after); return true; } return false; };
      if (!check()) {
        if ('MutationObserver' in window) { var mo = new MutationObserver(function () { if (check()) mo.disconnect(); }); mo.observe(el, { attributes: true, attributeFilter: ['class'] }); }
        else { var iv = setInterval(function () { if (check()) clearInterval(iv); }, 200); }
      }
      return;
    }
    var c = C.clickSel && document.querySelector(C.clickSel);
    if (c && c.getClientRects().length) c.addEventListener('click', function () { arm(C.afterClick); }, { once: true });
    else if (document.readyState === 'complete') arm(C.afterClick); else addEventListener('load', function () { arm(C.afterClick); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();</script>`;
}

module.exports = { glideScript };
