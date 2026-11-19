// فيديو فتح واحد لقالب Mother of Pearl (الظرف + الفيونكة في ملف واحد) — نفس الكود اللي اتعمل لـ AxAg1X0
// (المالك 2026-11-18: "الفيونكة بتعلق")، منقول هنا عشان دعوات تانية تستخدمه. AxAg1X0.js نفسه ماتلمسش.
// الاستخدام: makeOneVideo({ short, openSrc: asset('/custom/<id>/open.mp4'), bps, dur })(html)
//   → الصفحة بفيديو واحد، أو null لو أي حتة من كود القالب اتغيّرت (الدعوة بتفضل على الفيديوهين — ولا حاجة بتبوظ).
const T = '/templates/mother-of-pearl/';

function makeOneVideo({ short, openSrc, bps, dur }) {
const SHORT = short;
const OWN = `/custom/${SHORT}/`;
const OPEN_SRC = openSrc;
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
  var ONE_BPS = ${bps};   // متوسط الفيديو نفسه (بايت في الثانية)
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
      // طول الفيديو معروف (${dur} ث) — لو المتصفح لسه مش عارفه (بيتحمّل من النت) ماتستناش لآخر فريم
      var left = (isFinite(v1.duration) ? v1.duration : ${dur}) - v1.currentTime;
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
return oneVideo;
}

module.exports = { makeOneVideo };
