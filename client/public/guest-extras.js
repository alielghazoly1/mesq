/* guest-extras.js — إضافات للضيوف على دعوة معيّنة (Invitation.guestExtras):
 *   1) تهنئة صوتية زي فويس الواتساب: امسك واتكلم، اسحب للإلغاء، اسحب لفوق
 *      عشان تكمّل من غير ما تمسك، اسمع تسجيلك، وابعته باسمك.
 *   2) رفع صور الفرح: اختار كذا صورة مرة واحدة، بتتصغّر على الموبايل وتترفع
 *      واحدة ورا التانية بشريط تقدّم.
 * بيتحط تحت فورم تأكيد الحضور (أو جوه أي مكان تاني الدعوة تحدده في
 * window.MITHAQ_EXTRAS_OPTS — زي سجل التهاني، ومعاها سؤال "هتحضر؟"). كل اللي بيتبعت بيوصل لصاحب الدعوة في لوحته
 * بس (routes/guestVoices.js و routes/guestPhotos.js) — مفيش حاجة بتتعرض
 * للضيوف التانيين.
 */
(function () {
  'use strict';
  var X = window.MITHAQ_EXTRAS || {};
  if (!X.voice && !X.photos) return;
  if (document.getElementById('mithaq-extras')) return;
  var C = window.WEDDING_CONFIG || {};
  // إعدادات دعوة بعينها (custom-invitations): anchor = جوه أنهي عنصر تتحط،
  // inline = من غير كارت منفصل (جزء من القسم اللي هي فيه)، attend = تسأل "هتحضر؟"،
  // lang = لغة الكلام لو محتوى الدعوة غير لغتها المتسجّلة
  var O = window.MITHAQ_EXTRAS_OPTS || {};
  var AR = (O.lang || X.lang) === 'ar';
  var EDIT = !!X.editMode;
  var shortId = X.shortId || C.shortId || null;

  var T = AR ? {
    vEyebrow: 'رسالة بصوتك', vTitle: 'سجّل تهنئتك', vSub: 'امسك المايك واتكلم — أو دوس دوسة واحدة وسجّل من غير ما تمسك',
    idle: 'اضغط على المايك وسجّل', slide: 'اسحب للإلغاء', namePh: 'اكتب اسمك',
    sending: 'بنبعت تهنئتك…', sent: 'وصلت تهنئتك للعروسين 🤍', cancelled: 'اتلغى التسجيل', short: 'التسجيل قصير أوي — سجّل تاني',
    max: 'أقصى مدة دقيقة', noMic: 'المتصفح ده مابيسجّلش صوت', allowMic: 'اسمح للمتصفح يستخدم المايك عشان تسجّل',
    needName: 'اكتب اسمك الأول', fail: 'معرفناش نبعت، جرّب تاني', preview: 'دي معاينة — التهنئة مش هتتبعت', edit: 'التسجيل للضيوف — جرّبه من لينك الدعوة',
    pEyebrow: 'ألبوم الفرح', pTitle: 'شاركونا اللحظات', pSub: 'اتصوّرت في الفرح؟ ارفع صورك هنا عشان العروسين يحتفظوا بكل لحظة حلوة',
    pName: 'اسمك', pNamePh: 'اسمك الكريم', pAdd: 'ارفع صورك', pNote: 'صورك بتوصل للعروسين بس — محدش غيرهم يشوفها',
    pSent: 'شكرًا ليك! صورك وصلت', pCount: function (n) { return n === 1 ? 'اتبعتت صورة واحدة' : n === 2 ? 'اتبعتت صورتين' : 'اتبعتت ' + n + (n <= 10 ? ' صور' : ' صورة'); },
    pUp: function (i, n) { return 'بنرفع ' + i + ' من ' + n + '…'; }, pNeedName: 'اكتب اسمك الأول', pType: 'اختار صور بس',
    pFail: 'في صور مارفعتش — جرّب تاني', pNet: 'النت فصل — جرّب تاني', pPreview: 'دي معاينة — الصور مش هتترفع',
    del: 'امسح', play: 'شغّل', stop: 'وقّف', send: 'ابعت', mic: 'اضغط مطوّل وسجّل تهنئة',
    iOr: 'أو', iTitle: 'تهنئة بصوتك', iSub: 'سجّل كلمتين للعروسين بصوتك — هتوصلهم هما بس',
    aQ: 'هتشرّفنا في الفرح؟', aYes: 'هحضر إن شاء الله', aNo: 'مش هقدر أحضر', needAttend: 'اختار هتحضر ولا لأ الأول',
  } : {
    vEyebrow: 'A VOICE NOTE', vTitle: 'Leave us a voice note', vSub: 'Hold the mic and speak — or tap once to record hands-free',
    idle: 'Tap the mic to record', slide: 'Slide to cancel', namePh: 'Your name',
    sending: 'Sending your greeting…', sent: 'Your greeting reached the couple 🤍', cancelled: 'Recording cancelled', short: 'That was too short — try again',
    max: 'One minute maximum', noMic: 'This browser can’t record audio', allowMic: 'Allow the microphone to record your greeting',
    needName: 'Please write your name', fail: 'Couldn’t send — please try again', preview: 'This is a preview — nothing is sent', edit: 'Recording is for guests — try it from the invitation link',
    pEyebrow: 'OUR ALBUM', pTitle: 'Share the moments', pSub: 'Took photos at our celebration? Add them here so we can keep every beautiful moment.',
    pName: 'Your name', pNamePh: 'Full name', pAdd: 'ADD YOUR PHOTOS', pNote: 'Your photos go privately to the couple — only they can see them.',
    pSent: 'Thank you!', pCount: function (n) { return n === 1 ? '1 photo sent to the couple' : n + ' photos sent to the couple'; },
    pUp: function (i, n) { return 'Uploading ' + i + ' of ' + n + '…'; }, pNeedName: 'Please write your name first', pType: 'Please choose photos only',
    pFail: 'Some photos couldn’t be uploaded — please try again', pNet: 'Connection lost — please try again', pPreview: 'This is a preview — photos aren’t uploaded',
    del: 'Delete', play: 'Play', stop: 'Stop', send: 'Send', mic: 'Hold to record a voice greeting',
    iOr: 'or', iTitle: 'A voice greeting', iSub: 'Record a few words for the couple — only they will hear it',
    aQ: 'Will you attend?', aYes: 'Yes, I’ll be there', aNo: 'Sorry, I can’t make it', needAttend: 'Please tell us if you’ll attend first',
  };

  var NAME_KEY = 'mithaq_guest_name';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* */ } },
  };
  function knownName() {
    var n = (store.get(NAME_KEY) || '').trim();
    if (n.length >= 2) return n;
    // اسم الضيف من رده على تأكيد الحضور (قالب Champagne بيحفظ الرد بالشكل ده)
    try {
      var r = JSON.parse(store.get('mithaq_rsvp_' + shortId) || 'null');
      if (r && (r.name || r.guestName)) return String(r.name || r.guestName).trim();
    } catch (e) { /* */ }
    var rs = document.querySelector('#rs-name, #rsvp input[name="name"]');
    return rs && rs.value.trim().length >= 2 ? rs.value.trim() : '';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var SVG = {
    mic: '<svg class="gx-i-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11.5" rx="3" fill="currentColor" stroke="none"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/><path d="M9 21h6"/></svg>',
    send: '<svg class="gx-i-send" viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7h15M9.5 7V5h5v2M7 7l.8 12h8.4L17 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5.5" y="10.5" width="13" height="10" rx="2.5" fill="currentColor" stroke="none"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
    up: '<svg class="gx-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
    wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10v4"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z"/><circle cx="12" cy="13" r="3.6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };

  // ===== البناء =====
  var root = document.createElement('section');
  root.id = 'mithaq-extras';
  root.className = 'gx' + (O.inline ? ' gx-inline' : '');
  root.setAttribute('dir', AR ? 'rtl' : 'ltr');
  var html = O.inline ? '' : '<div class="gx-orn" aria-hidden="true"><i></i></div>';
  if (X.voice) {
    html += '<div class="gx-card gx-voice">'
      + (O.inline
        ? '<div class="gx-or" aria-hidden="true"><span>' + esc(T.iOr) + '</span></div>'
          + '<h3 class="gx-title">' + esc(T.iTitle) + '</h3>'
          + '<p class="gx-sub">' + esc(T.iSub) + '</p>'
        : '<p class="gx-eyebrow">' + esc(T.vEyebrow) + '</p>'
          + '<h2 class="gx-title">' + esc(T.vTitle) + '</h2>'
          + '<p class="gx-sub">' + esc(T.vSub) + '</p>')
      + (O.attend
        ? '<div class="gx-att" role="radiogroup" aria-label="' + esc(T.aQ) + '"><p class="gx-att-q">' + esc(T.aQ) + '</p><div class="gx-att-row">'
          + '<button type="button" class="gx-att-b" data-v="yes" role="radio" aria-checked="false">' + SVG.check + '<span>' + esc(T.aYes) + '</span></button>'
          + '<button type="button" class="gx-att-b" data-v="no" role="radio" aria-checked="false"><span>' + esc(T.aNo) + '</span></button>'
          + '</div></div>'
        : '')
      + '<div class="gx-rec" data-state="idle">'
      + '<div class="gx-bar">'
      + '<span class="gx-idle">' + SVG.wave + '<span>' + esc(T.idle) + '</span></span>'
      + '<button type="button" class="gx-ic gx-del" hidden aria-label="' + esc(T.del) + '">' + SVG.trash + '</button>'
      + '<button type="button" class="gx-ic gx-play" hidden aria-label="' + esc(T.play) + '">' + SVG.play + '</button>'
      + '<span class="gx-dot" hidden></span>'
      + '<span class="gx-time" hidden>0:00</span>'
      + '<span class="gx-slide" hidden><b>‹</b><span>' + esc(T.slide) + '</span></span>'
      + '<canvas class="gx-wave" hidden></canvas>'
      + '<input class="gx-name" type="text" maxlength="60" autocomplete="name" enterkeyhint="send" hidden placeholder="' + esc(T.namePh) + '">'
      + '<span class="gx-sending" hidden><span class="gx-spin"></span><span>' + esc(T.sending) + '</span></span>'
      + '<button type="button" class="gx-ic gx-stop" hidden aria-label="' + esc(T.stop) + '">' + SVG.stop + '</button>'
      + '</div>'
      + '<div class="gx-lock" aria-hidden="true">' + SVG.lock + SVG.up + '</div>'
      + '<button type="button" class="gx-mic" aria-label="' + esc(T.mic) + '">'
      + '<span class="gx-ring lv b"></span><span class="gx-ring lv"></span><span class="gx-ring idle"></span><span class="gx-ring idle"></span>'
      + SVG.mic + SVG.send + '</button>'
      + '</div>'
      + '<p class="gx-toast" aria-live="polite"></p>'
      + '</div>';
  }
  if (X.photos) {
    html += '<div class="gx-card gx-photos">'
      + '<p class="gx-eyebrow">' + esc(T.pEyebrow) + '</p>'
      + '<h2 class="gx-title">' + esc(T.pTitle) + '</h2>'
      + '<p class="gx-sub">' + esc(T.pSub) + '</p>'
      + '<div class="gx-field"><label class="gx-label" for="gx-pname">' + esc(T.pName) + '</label>'
      + '<input class="gx-input" id="gx-pname" type="text" maxlength="60" autocomplete="name" placeholder="' + esc(T.pNamePh) + '"></div>'
      + '<div role="button" tabindex="0" class="gx-btn gx-add">' + SVG.camera + '<span>' + esc(T.pAdd) + '</span></div>'
      + '<input class="gx-file" type="file" accept="image/*" multiple hidden>'
      + '<div class="gx-prog" hidden><div class="gx-track"><div class="gx-fill"></div></div><p class="gx-status"></p></div>'
      + '<div class="gx-sent" hidden><p class="gx-sent-t">' + esc(T.pSent) + '</p><p class="gx-sent-n"></p></div>'
      + '<p class="gx-err" aria-live="polite"></p>'
      + '<p class="gx-note">' + esc(T.pNote) + '</p>'
      + '</div>';
  }
  root.innerHTML = html;

  // المكان: تحت قسم تأكيد الحضور على طول
  function place() {
    if (root.isConnected) return true;
    var inside = O.anchor && document.querySelector(O.anchor);
    if (inside) { inside.appendChild(root); return true; }
    var anchor = document.getElementById('rsvp-wrap')
      || (document.getElementById('mithaq-rsvp') && (document.getElementById('mithaq-rsvp').closest('.t-rec, section, .rs-rec') || document.getElementById('mithaq-rsvp')));
    if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(root, anchor.nextSibling); return true; }
    var all = document.getElementById('allrecords');
    if (all) { all.appendChild(root); return true; }
    return false;
  }
  if (!place()) document.addEventListener('DOMContentLoaded', function () { if (!place()) document.body.appendChild(root); });

  // دخول هادي وإنت نازل
  if ('IntersectionObserver' in window && !EDIT && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    root.classList.add('gx-armed');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { root.classList.add('gx-inview'); io.disconnect(); } });
    }, { threshold: 0.12 });
    io.observe(root);
  }

  function music() { return document.getElementById('invitation-audio'); }

  // ===================== التهنئة الصوتية =====================
  if (X.voice) (function () {
    var box = root.querySelector('.gx-rec');
    var $ = function (s) { return box.querySelector(s); };
    var mic = $('.gx-mic'), del = $('.gx-del'), play = $('.gx-play'), dot = $('.gx-dot'), tEl = $('.gx-time'), slide = $('.gx-slide');
    var cvs = $('.gx-wave'), ctx = cvs.getContext('2d'), nameIn = $('.gx-name'), sendingEl = $('.gx-sending'), stopBtn = $('.gx-stop'), idleEl = $('.gx-idle'), lockEl = $('.gx-lock');
    var toastEl = root.querySelector('.gx-voice .gx-toast');
    var MAX = 60, CANCEL = 110, LOCK = 70;
    var stream = null, rec = null, chunks = [], actx = null, an = null, raf = 0, t0 = 0, dur = 0;
    var held = false, locked = false, cancelled = false, sendAfterStop = false, wantLock = false, starting = false, startTimer = 0, px = 0, py = 0;
    var levels = [], blob = null, player = null, playerUrl = '', musicWasOn = false, toastT = 0;
    var dirSign = AR ? 1 : -1;
    // هتحضر ولا لأ — الاختيار بيتحفظ على الجهاز ويتبعت مع التهنئة
    var ATT_KEY = 'mithaq_gx_att_' + (shortId || 'preview');
    var attWrap = root.querySelector('.gx-att');
    var attending = attWrap ? (store.get(ATT_KEY) === 'yes' || store.get(ATT_KEY) === 'no' ? store.get(ATT_KEY) : '') : '';
    function paintAtt() {
      if (!attWrap) return;
      Array.prototype.forEach.call(attWrap.querySelectorAll('.gx-att-b'), function (b) {
        var on = b.getAttribute('data-v') === attending;
        b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    }
    if (attWrap) {
      paintAtt();
      attWrap.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.gx-att-b');
        if (!b) return;
        attending = b.getAttribute('data-v'); store.set(ATT_KEY, attending);
        attWrap.classList.remove('gx-need'); paintAtt(); buzz(8);
        if (toastEl.textContent === T.needAttend) toastEl.textContent = '';
      });
    }
    function needAttend() {
      if (!attWrap || attending) return false;
      attWrap.classList.remove('gx-need'); void attWrap.offsetWidth; attWrap.classList.add('gx-need');
      toast(T.needAttend, 'err', 3000);
      return true;
    }   // الإلغاء بيتسحب ناحية بداية السطر (شمال في الإنجليزي، يمين في العربي)

    var SHOW = {
      idle: [idleEl], rec: [dot, tEl, slide], locked: [dot, tEl, cvs, del, stopBtn],
      review: [del, play, cvs, tEl], naming: [del, nameIn], sending: [sendingEl],
    };
    var ALL = [idleEl, del, play, dot, tEl, slide, cvs, nameIn, sendingEl, stopBtn];
    function setState(st) {
      box.setAttribute('data-state', st);
      var on = SHOW[st] || [];
      ALL.forEach(function (el) { el.hidden = on.indexOf(el) === -1; });
      if (st === 'locked' || st === 'review') requestAnimationFrame(function () { sizeCanvas(); drawBars(levels, st === 'review' ? null : null, st === 'locked'); });
    }
    function state() { return box.getAttribute('data-state'); }
    function toast(msg, kind, ms) {
      toastEl.className = 'gx-toast' + (kind ? ' ' + kind : '');
      toastEl.innerHTML = kind === 'ok' ? '<span class="gx-sent-v">' + SVG.check + '<span>' + esc(msg) + '</span></span>' : esc(msg);
      clearTimeout(toastT);
      if (ms) toastT = setTimeout(function () { toastEl.textContent = ''; }, ms);
      if (kind === 'err') { box.classList.remove('gx-shake'); void box.offsetWidth; box.classList.add('gx-shake'); }
    }
    var fmt = function (s) { s = Math.max(0, s); return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2); };
    var buzz = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* */ } };

    function sizeCanvas() { var r = cvs.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); cvs.width = Math.max(1, r.width * d); cvs.height = Math.max(1, r.height * d); }
    function resample(a, n) { var o = []; for (var i = 0; i < n; i++) { var s = Math.floor(i * a.length / n), e = Math.max(s + 1, Math.floor((i + 1) * a.length / n)), m = 0; for (var j = s; j < e; j++) m = Math.max(m, a[j] || 0); o.push(m); } return o; }
    function drawBars(arr, progress, live) {
      var W = cvs.width, H = cvs.height; if (W < 2) return;
      var d = Math.min(2, window.devicePixelRatio || 1), step = 4.6 * d, n = Math.floor(W / step), bw = 2.4 * d;
      ctx.clearRect(0, 0, W, H);
      var src = live ? arr.slice(-n) : resample(arr, n), off = live ? n - src.length : 0;
      for (var i = 0; i < src.length; i++) {
        var h = Math.max(3 * d, src[i] * H), x = (i + off) * step, y = (H - h) / 2;
        ctx.fillStyle = progress == null ? '#5b3f2c' : (i / src.length <= progress ? '#2b1c13' : 'rgba(43,28,19,.25)');
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, bw, h, bw / 2); else ctx.rect(x, y, bw, h); ctx.fill();
      }
    }

    function lockNow() { locked = true; held = false; resetDrag(); setState('locked'); buzz(12); }
    function start() { if (rec || starting) return; starting = true; begin().then(function () { starting = false; }, function () { starting = false; }); }
    function begin() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { toast(T.noMic, 'err', 3000); return Promise.resolve(); }
      return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then(function (s) {
        stream = s;
        if (!held && !wantLock) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; return; }
        var m = music(); musicWasOn = !!(m && !m.paused); if (musicWasOn) m.pause();
        try {
          actx = actx || new (window.AudioContext || window.webkitAudioContext)();
          if (actx.resume) actx.resume();
          an = actx.createAnalyser(); an.fftSize = 1024;
          actx.createMediaStreamSource(stream).connect(an);
        } catch (e) { an = null; }
        var types = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
        var type = '';
        for (var i = 0; i < types.length; i++) { if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(types[i])) { type = types[i]; break; } }
        try { rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined); } catch (e) { rec = new MediaRecorder(stream); }
        chunks = []; levels = []; locked = cancelled = sendAfterStop = false;
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = finish;
        rec.start(250);
        t0 = performance.now(); tEl.textContent = '0:00';
        toastEl.textContent = '';
        setState('rec'); buzz(15);
        if (wantLock) lockNow();
        var buf = an ? new Float32Array(an.fftSize) : null, sm = 0, lastPush = 0;
        (function loop(now) {
          var lv = 0.15;
          if (an) { an.getFloatTimeDomainData(buf); var sum = 0; for (var k = 0; k < buf.length; k++) sum += buf[k] * buf[k]; lv = Math.min(1, Math.pow(Math.sqrt(sum / buf.length) * 6, 0.7)); }
          sm += (lv - sm) * (lv > sm ? 0.5 : 0.12);
          mic.style.setProperty('--gx-l1', (1.1 + sm * 0.6).toFixed(3));
          mic.style.setProperty('--gx-l2', (1.22 + sm * 1.2).toFixed(3));
          if (now - lastPush > 60) { levels.push(Math.max(0.1, sm)); lastPush = now; }
          if (locked) drawBars(levels, null, true);
          var el = (now - t0) / 1000; tEl.textContent = fmt(el);
          if (el >= MAX) { stop(false); toast(T.max, '', 2400); return; }
          raf = requestAnimationFrame(loop);
        })(performance.now());
      }, function () { toast(T.allowMic, 'err', 3500); });
    }
    function stop(cancel) {
      cancelAnimationFrame(raf);
      cancelled = cancel;
      dur = (performance.now() - t0) / 1000;
      mic.style.setProperty('--gx-l1', 1); mic.style.setProperty('--gx-l2', 1);
      if (rec && rec.state !== 'inactive') rec.stop(); else if (rec) finish();
    }
    function restoreMusic() {
      if (!musicWasOn) return; musicWasOn = false;
      var m = music(); if (m) { var p = m.play(); if (p && p.catch) p.catch(function () { /* */ }); }
    }
    function dropPlayer() {
      if (player) { try { player.pause(); } catch (e) { /* */ } }
      player = null; play.innerHTML = SVG.play;
      if (playerUrl) { try { URL.revokeObjectURL(playerUrl); } catch (e) { /* */ } playerUrl = ''; }
    }
    function finish() {
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null; rec = null;
      if (cancelled) { setState('idle'); toast(T.cancelled, '', 1800); buzz([10, 40, 10]); restoreMusic(); return; }
      if (dur < 0.8 || !chunks.length) { setState('idle'); toast(T.short, 'err', 2400); restoreMusic(); return; }
      blob = new Blob(chunks, { type: (chunks[0] && chunks[0].type) || 'audio/webm' });
      if (sendAfterStop) { trySend(); return; }
      toReview();
    }
    function toReview() {
      dropPlayer();
      playerUrl = URL.createObjectURL(blob);
      player = new Audio(playerUrl);
      player.onended = function () { play.innerHTML = SVG.play; drawBars(levels, null); tEl.textContent = fmt(dur); };
      tEl.textContent = fmt(dur);
      setState('review');
    }
    play.addEventListener('click', function () {
      if (!player) return;
      if (player.paused) {
        var m = music(); if (m && !m.paused) { musicWasOn = true; m.pause(); }
        var pr = player.play(); if (pr && pr.catch) pr.catch(function () { /* */ });
        play.innerHTML = SVG.pause;
        (function prog() {
          if (!player || player.paused) return;
          var d = player.duration && isFinite(player.duration) ? player.duration : dur;
          drawBars(levels, player.currentTime / d); tEl.textContent = fmt(player.currentTime);
          requestAnimationFrame(prog);
        })();
      } else { player.pause(); play.innerHTML = SVG.play; }
    });
    stopBtn.addEventListener('click', function () { stop(false); });
    del.addEventListener('click', function () {
      if (rec) { stop(true); return; }
      dropPlayer(); blob = null; nameIn.blur();
      setState('idle'); restoreMusic();
    });
    function trySend() {
      if (!blob) return;
      if (needAttend()) { if (state() !== 'review') toReview(); return; }
      var nm = knownName();
      if (nm.length >= 2) { upload(nm); return; }
      if (player) { try { player.pause(); } catch (e) { /* */ } play.innerHTML = SVG.play; }
      setState('naming'); nameIn.value = '';
      setTimeout(function () { try { nameIn.focus(); } catch (e) { /* */ } }, 60);
    }
    function sendNamed() {
      var nm = nameIn.value.trim().replace(/\s+/g, ' ');
      if (nm.length < 2) { toast(T.needName, 'err', 2200); nameIn.focus(); return; }
      store.set(NAME_KEY, nm); nameIn.blur(); upload(nm);
      // نفس الاسم يتكتب لوحده في خانة الصور
      try { root.dispatchEvent(new CustomEvent('gx-name')); } catch (e) { /* */ }
    }
    nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendNamed(); } });
    function upload(name) {
      if (!blob) return;
      if (player) { try { player.pause(); } catch (e) { /* */ } }
      setState('sending');
      var done = function (msg) {
        dropPlayer(); blob = null; buzz(20); setState('idle'); toast(msg, 'ok', 5000); restoreMusic();
      };
      if (!shortId) { setTimeout(function () { done(T.preview); }, 700); return; }
      var type = String(blob.type || '').split(';')[0];
      var ext = /mp4|aac|m4a/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm';
      var fd = new FormData();
      fd.append('guestName', name || '');
      if (attending) fd.append('attending', attending);
      fd.append('duration', String(Math.round(dur * 10) / 10));
      fd.append('file', blob, 'voice.' + ext);
      fetch('/i/' + encodeURIComponent(shortId) + '/voice', { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, b: b }; }); })
        .then(function (res) {
          if (res.ok) { done(T.sent); return; }
          toReview(); toast(res.b && res.b.error ? res.b.error : T.fail, 'err', 5000);
        }, function () { toReview(); toast(T.fail, 'err', 5000); });
    }

    function resetDrag() {
      box.classList.remove('gx-drag');
      mic.style.setProperty('--gx-dx', '0px'); mic.style.setProperty('--gx-dy', '0px');
      slide.style.setProperty('--gx-sx', '0px'); slide.style.setProperty('--gx-so', 1);
      lockEl.style.setProperty('--gx-ly', '0px');
    }
    mic.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (EDIT) { toast(T.edit, '', 3000); return; }
      var st = state();
      if (st === 'locked') { sendAfterStop = true; stop(false); return; }
      if (st === 'review') { trySend(); return; }
      if (st === 'naming') { sendNamed(); return; }
      if (st === 'sending') return;
      held = true; wantLock = false; px = e.clientX; py = e.clientY;
      try { mic.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      startTimer = setTimeout(start, 140);
    });
    mic.addEventListener('pointermove', function (e) {
      if (!held || !rec || locked) return;
      var dx = e.clientX - px, dy = e.clientY - py;
      box.classList.add('gx-drag');
      var hx = Math.abs(dx) > Math.abs(dy) * 0.8;
      // بس ناحية الإلغاء (ومش أبعد من الحد بشوية)
      var toward = dx * dirSign;
      var mx = hx && toward > 0 ? Math.min(CANCEL + 10, toward) * dirSign : 0;
      var my = hx ? 0 : Math.max(-LOCK - 10, Math.min(0, dy));
      mic.style.setProperty('--gx-dx', mx + 'px'); mic.style.setProperty('--gx-dy', my + 'px');
      slide.style.setProperty('--gx-sx', (mx * 0.5) + 'px');
      slide.style.setProperty('--gx-so', Math.max(0, 1 - Math.abs(mx) / CANCEL).toFixed(2));
      lockEl.style.setProperty('--gx-ly', (Math.min(0, my) * 0.7) + 'px');
      if (Math.abs(mx) >= CANCEL) { held = false; resetDrag(); stop(true); }
      else if (-my >= LOCK) lockNow();
    });
    function release() {
      if (!held) return;
      held = false; resetDrag();
      if (rec && performance.now() - t0 > 450) { stop(false); return; }
      // دوسة واحدة (أو قصيرة جدًا): تسجيل من غير ما يمسك
      wantLock = true;
      if (rec) lockNow(); else { clearTimeout(startTimer); start(); }
    }
    mic.addEventListener('pointerup', release);
    mic.addEventListener('pointercancel', release);
    mic.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    setState('idle');
  })();

  // ===================== صور الضيوف =====================
  if (X.photos) (function () {
    var card = root.querySelector('.gx-photos');
    var addBtn = card.querySelector('.gx-add'), fileIn = card.querySelector('.gx-file'), nameIn = card.querySelector('#gx-pname');
    var errEl = card.querySelector('.gx-err'), prog = card.querySelector('.gx-prog'), fill = card.querySelector('.gx-fill');
    var statusEl = card.querySelector('.gx-status'), sent = card.querySelector('.gx-sent'), sentN = card.querySelector('.gx-sent-n');
    var KEY = 'mithaq_gp_key_' + (shortId || 'preview');
    var MAX_SIDE = 2560, totalSent = 0, busy = false;
    // الاسم بييجي من رد تأكيد الحضور أو من التهنئة الصوتية — لو الخانة لسه فاضية
    function fillName() { if (!nameIn.value.trim()) nameIn.value = knownName(); }
    fillName();
    root.addEventListener('gx-name', fillName);
    card.addEventListener('focusin', fillName);
    card.addEventListener('pointerdown', fillName, true);

    function guestKey() {
      var k = store.get(KEY);
      if (!k || !/^[a-f0-9]{32}$/.test(k)) {
        var a = new Uint8Array(16);
        (window.crypto || window.msCrypto).getRandomValues(a);
        k = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
        store.set(KEY, k);
      }
      return k;
    }
    // تصغير على الجهاز قبل الرفع (أقصى ضلع 2560 — جودة عالية وأخف على نت القاعة)
    function shrink(file) {
      return new Promise(function (resolve) {
        if (!window.createImageBitmap) { resolve(file); return; }
        createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bmp) {
          var w = bmp.width, h = bmp.height, scale = Math.min(1, MAX_SIDE / Math.max(w, h));
          if (scale === 1 && file.size < 3.2 * 1024 * 1024 && /^image\/(jpeg|webp|png)$/i.test(file.type)) { if (bmp.close) bmp.close(); resolve(file); return; }
          var cv = document.createElement('canvas');
          cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
          cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
          if (bmp.close) bmp.close();
          var q = 0.9;
          (function tryBlob() {
            cv.toBlob(function (b) {
              if (!b) { resolve(file); return; }
              if (b.size > 3.6 * 1024 * 1024 && q > 0.6) { q -= 0.1; tryBlob(); return; }
              resolve(new File([b], (file.name || 'photo').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg', q);
          })();
        }).catch(function () { resolve(file); });
      });
    }
    function upload(file, onPart) {
      return new Promise(function (resolve) {
        var fd = new FormData();
        fd.append('file', file);
        fd.append('guestName', nameIn.value.trim());
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/i/' + encodeURIComponent(shortId) + '/photos');
        xhr.setRequestHeader('X-Guest-Key', guestKey());
        xhr.upload.onprogress = function (e) { if (e.lengthComputable) onPart(e.loaded / e.total); };
        xhr.onload = function () {
          var j = null; try { j = JSON.parse(xhr.responseText); } catch (e) { /* */ }
          if (xhr.status === 201) { resolve(true); return; }
          if (j && j.error) errEl.textContent = j.error;
          resolve(false);
        };
        xhr.onerror = function () { errEl.textContent = T.pNet; resolve(false); };
        xhr.send(fd);
      });
    }
    function pick() {
      if (busy) return;
      errEl.textContent = '';
      if (EDIT) { errEl.textContent = T.edit; return; }
      if (!shortId) { errEl.textContent = T.pPreview; return; }
      fillName();
      var nm = nameIn.value.trim();
      if (nm.length < 2) { errEl.textContent = T.pNeedName; nameIn.focus(); return; }
      store.set(NAME_KEY, nm);
      fileIn.click();
    }
    addBtn.addEventListener('click', pick);
    addBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    fileIn.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileIn.files || [], 0, 20).filter(function (f) {
        if (f.type && !/^image\//i.test(f.type)) { errEl.textContent = T.pType; return false; }
        return true;
      });
      fileIn.value = '';
      if (!files.length) return;
      var n = files.length, done = 0, ok = 0;
      busy = true; addBtn.setAttribute('aria-disabled', 'true');
      prog.hidden = false; fill.style.width = '0%';
      function show(part) {
        fill.style.width = Math.round(((done + part) / n) * 100) + '%';
        statusEl.textContent = T.pUp(Math.min(done + 1, n), n);
      }
      show(0);
      files.reduce(function (p, f) {
        return p.then(function () {
          return shrink(f).then(function (ff) { return upload(ff, show); }).then(function (good) { if (good) ok++; done++; show(0); });
        });
      }, Promise.resolve()).then(function () {
        busy = false; addBtn.removeAttribute('aria-disabled');
        prog.hidden = true;
        if (ok) {
          totalSent += ok;
          sentN.textContent = T.pCount(totalSent);
          sent.hidden = false; sent.style.animation = 'none'; void sent.offsetWidth; sent.style.animation = '';
        }
        if (ok < n && !errEl.textContent) errEl.textContent = T.pFail;
      });
    });
  })();
})();
