/* رسايل الحبايب — آخر الدعوة خالص.
   اللي الضيوف بعتوه من الدعوة: رسايلهم (الاسم والرسالة بس — هيحضر ولا لأ مش جاي من السيرفر أصلًا)،
   وتهانيهم الصوتية، وصورهم. الإعداد: window.MITHAQ_WALL = { shortId, lang } ، والبيانات من
   GET /i/<id>/wall. أي كلام من الضيوف بيتحط كنص (textContent) — مفيش HTML منهم أبدًا. */
(function () {
  'use strict';
  var C = window.MITHAQ_WALL || {};
  var SID = C.shortId;
  if (!SID || !window.fetch || !document.querySelector) return;
  var AR = C.lang !== 'en';
  var T = AR ? {
    eyebrow: 'من قلوب حبايبنا', title: 'رسايل الحبايب', sub: 'كل كلمة وصلتنا منكم فرّحتنا',
    msgs: 'رسايلكم', voices: 'تهانيكم بصوتكم', photos: 'ألبوم الذكريات',
    allMsgs: function (n) { return 'عرض كل الرسايل (' + n + ')'; },
    allVoices: function (n) { return 'اسمع كل التهاني (' + n + ')'; },
    morePhotos: function (n) { return 'شوف صور أكتر (' + n + ')'; },
    less: 'عرض أقل', guest: 'ضيف عزيز', play: 'شغّل تهنئة', from: 'من', photo: 'صورة',
    close: 'إغلاق', prev: 'الصورة اللي قبلها', next: 'الصورة اللي بعدها',
    rsvpNote: 'رسالتك واسمك هيظهروا في رسايل الحبايب آخر الدعوة — من غير ما يبان هتحضر ولا لأ.'
  } : {
    eyebrow: 'From the hearts of our loved ones', title: 'Wishes & memories', sub: 'Every word you sent made us smile',
    msgs: 'Your messages', voices: 'Voice wishes', photos: 'Memories album',
    allMsgs: function (n) { return 'Show all messages (' + n + ')'; },
    allVoices: function (n) { return 'Hear all wishes (' + n + ')'; },
    morePhotos: function (n) { return 'More photos (' + n + ')'; },
    less: 'Show less', guest: 'A dear guest', play: 'Play wish', from: 'From', photo: 'Photo',
    close: 'Close', prev: 'Previous photo', next: 'Next photo',
    rsvpNote: 'Your name and message will appear in the wishes at the end of the invitation — your reply stays private.'
  };
  var FIRST = { m: 6, v: 4, p: 9 };
  var PHOTO_STEP = 30;
  var RTL = function () { return (document.documentElement.dir || getComputedStyle(document.body).direction) === 'rtl'; };

  var ST = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  var IC = {
    leaf: '<svg viewBox="0 0 24 24" ' + ST + '><path d="M12 21c0-6 3-11 8-14-1 6-4 10-8 11"/><path d="M12 21c0-6-3-11-8-14 1 6 4 10 8 11"/></svg>',
    msg: '<svg viewBox="0 0 24 24" ' + ST + '><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/></svg>',
    mic: '<svg viewBox="0 0 24 24" ' + ST + '><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    cam: '<svg viewBox="0 0 24 24" ' + ST + '><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>',
    quote: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 7H6.5A2.5 2.5 0 0 0 4 9.5V13h4v4H4M20 7h-3.5A2.5 2.5 0 0 0 14 9.5V13h4v4h-4" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/></svg>',
    play: '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
    down: '<svg viewBox="0 0 24 24" ' + ST + '><path d="M6 9l6 6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" ' + ST + ' stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>',
    left: '<svg viewBox="0 0 24 24" ' + ST + ' stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" ' + ST + ' stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function el(tag, cls, icon) { var e = document.createElement(tag); if (cls) e.className = cls; if (icon) e.innerHTML = icon; return e; }
  function txt(tag, cls, text) { var e = el(tag, cls); e.textContent = text; return e; }
  function fmt(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  /* ---------- ظهور العناصر وهي داخلة الشاشة (نفس حركة القالب) ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  function observe(scope) {
    var els = scope.querySelectorAll('.reveal:not(.in)');
    for (var i = 0; i < els.length; i++) { if (io) io.observe(els[i]); else els[i].classList.add('in'); }
  }

  /* ---------- الهيكل ---------- */
  var root = null, B = {};
  var data = { messages: [], voices: [], photos: [] };
  var shown = { m: FIRST.m, v: FIRST.v, p: FIRST.p };

  function block(id, icon, title, listTag, listCls) {
    var b = el('div', 'gw-block'); b.id = id; b.hidden = true;
    var h = el('div', 'gw-bh reveal');
    h.appendChild(el('span', 'gw-ic', icon));
    h.appendChild(txt('h4', '', title));
    var cnt = txt('span', 'gw-count', '');
    h.appendChild(cnt);
    var body = el(listTag, listCls);
    var more = el('button', 'gw-more'); more.type = 'button'; more.hidden = true;
    b.appendChild(h); b.appendChild(body); b.appendChild(more);
    root.appendChild(b);
    return { b: b, cnt: cnt, body: body, more: more, sig: '' };
  }

  function mount() {
    if (root) return;
    root = el('section', 'gw'); root.id = 'guestWall'; root.hidden = true;
    root.appendChild(el('div', 'gw-orn reveal', '<i></i>' + IC.leaf + '<i></i>'));
    root.appendChild(txt('div', 'eyebrow reveal', T.eyebrow));
    root.appendChild(txt('div', 'h-script gw-title reveal d1', T.title));
    root.appendChild(txt('p', 'gw-sub reveal d2', T.sub));
    B.m = block('gwMsgs', IC.msg, T.msgs, 'ul', 'gw-msgs');
    B.v = block('gwVoices', IC.mic, T.voices, 'ul', 'gw-voices');
    B.p = block('gwPhotos', IC.cam, T.photos, 'div', 'gw-grid');
    // آخر الدعوة خالص
    var main = document.querySelector('main') || document.body;
    main.appendChild(root);
  }

  function setMore(btn, label, less) {
    btn.hidden = !label;
    if (!label) return;
    btn.textContent = label;
    btn.insertAdjacentHTML('beforeend', IC.down);
    btn.classList.toggle('less', !!less);
  }

  /* ---------- الرسايل: تحت بعض ---------- */
  function renderMsgs() {
    var list = data.messages, X = B.m;
    X.b.hidden = !list.length;
    X.cnt.textContent = list.length;
    var n = Math.min(list.length, shown.m);
    var sig = n + '|' + list.slice(0, n).map(function (m) { return m.name + '\u0001' + m.message; }).join('\u0002');
    if (sig !== X.sig) {
      X.sig = sig;
      X.body.textContent = '';
      for (var i = 0; i < n; i++) {
        var li = el('li', 'gw-msg reveal');
        li.appendChild(el('span', 'gw-q', IC.quote));
        li.appendChild(txt('p', 'gw-text', list[i].message));
        li.appendChild(txt('div', 'gw-name', list[i].name || T.guest));
        X.body.appendChild(li);
      }
    }
    if (list.length > FIRST.m) setMore(X.more, n < list.length ? T.allMsgs(list.length) : T.less, n >= list.length);
    else setMore(X.more, '');
  }

  /* ---------- التهاني الصوتية ---------- */
  var player = new Audio();
  player.preload = 'none';
  var cur = null;                 // { id, li }
  var musicPaused = false;        // الأغنية وقفت عشان تهنئة
  function music() {
    var a = document.getElementById('invitation-audio');
    if (a) return a;
    var all = document.querySelectorAll('audio');
    for (var i = 0; i < all.length; i++) if (all[i] !== player && all[i].loop) return all[i];
    return null;
  }
  function bars(id) {
    var h = 0, s = '';
    for (var k = 0; k < id.length; k++) h = (h * 31 + id.charCodeAt(k)) >>> 0;
    for (var j = 0; j < 30; j++) {
      h = (h * 1103515245 + 12345) >>> 0;
      var v = 28 + (h % 72);
      if (j < 3 || j > 26) v = Math.min(v, 45);
      s += '<b style="height:' + v + '%"></b>';
    }
    return s;
  }
  function liOf(id) { return X_voices().querySelector('[data-id="' + id + '"]'); }
  function X_voices() { return B.v.body; }
  function setProgress(li, f) { if (li) li.querySelector('.gw-vbar').style.setProperty('--p', (Math.max(0, Math.min(1, f)) * 100).toFixed(2) + '%'); }
  function setTime(li, s) { if (li) li.querySelector('.gw-vtime').textContent = fmt(s); }
  function voiceById(id) { for (var i = 0; i < data.voices.length; i++) if (data.voices[i].id === id) return data.voices[i]; return null; }
  function startVoice(v, at) {
    if (cur && cur.id !== v.id) stopCurrent(false);
    var li = liOf(v.id);
    cur = { id: v.id, li: li };
    if (player.getAttribute('data-id') !== v.id) { player.src = v.url; player.setAttribute('data-id', v.id); }
    var m = music();
    if (m && !m.paused) { musicPaused = true; m.pause(); }
    var go = function () { try { if (at != null && isFinite(player.duration)) player.currentTime = at * player.duration; } catch (e) {} };
    if (at != null) { if (player.readyState >= 1) go(); else player.addEventListener('loadedmetadata', go, { once: true }); }
    var p = player.play();
    if (p && p.catch) p.catch(function () { if (cur && cur.li) cur.li.classList.remove('playing'); });
  }
  function stopCurrent(resume) {
    if (!cur) return;
    player.pause();
    var v = voiceById(cur.id);
    if (cur.li) { cur.li.classList.remove('playing'); setProgress(cur.li, 0); setTime(cur.li, v ? v.duration : 0); }
    try { player.currentTime = 0; } catch (e) {}
    cur = null;
    if (resume) resumeMusic();
  }
  function resumeMusic() {
    if (!musicPaused) return;
    musicPaused = false;
    var m = music();
    if (m && m.paused) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
  }
  player.addEventListener('play', function () { if (cur && cur.li) cur.li.classList.add('playing'); });
  player.addEventListener('pause', function () { if (cur && cur.li) cur.li.classList.remove('playing'); });
  player.addEventListener('timeupdate', function () {
    if (!cur || !cur.li) return;
    var d = isFinite(player.duration) && player.duration > 0 ? player.duration : ((voiceById(cur.id) || {}).duration || 0);
    if (d) setProgress(cur.li, player.currentTime / d);
    setTime(cur.li, player.currentTime);
  });
  player.addEventListener('ended', function () { stopCurrent(true); });
  // لو الضيف شغّل الأغنية من زرارها والتهنئة شغالة: التهنئة تقف
  document.addEventListener('play', function (e) {
    var m = music();
    if (e.target === m && cur && !player.paused) { musicPaused = false; player.pause(); }
  }, true);

  function seekFraction(bar, clientX) {
    var r = bar.getBoundingClientRect();
    var f = (clientX - r.left) / (r.width || 1);
    return RTL() ? 1 - f : f;
  }

  function renderVoices() {
    var list = data.voices, X = B.v;
    X.b.hidden = !list.length;
    X.cnt.textContent = list.length;
    var n = Math.min(list.length, shown.v);
    var sig = n + '|' + list.slice(0, n).map(function (v) { return v.id; }).join(',');
    if (sig !== X.sig) {
      X.sig = sig;
      X.body.textContent = '';
      list.slice(0, n).forEach(function (v) {
        var li = el('li', 'gw-voice reveal');
        li.setAttribute('data-id', v.id);
        var btn = el('button', 'gw-play', IC.play + IC.pause);
        btn.type = 'button';
        btn.setAttribute('aria-label', T.play + ' — ' + (v.name || T.guest));
        var vb = el('div', 'gw-vb');
        vb.appendChild(txt('div', 'gw-vname', v.name || T.guest));
        var bar = el('div', 'gw-vbar', '<div class="bars">' + bars(v.id) + '</div><div class="fill">' + bars(v.id) + '</div>');
        vb.appendChild(bar);
        li.appendChild(btn); li.appendChild(vb); li.appendChild(txt('span', 'gw-vtime', fmt(v.duration)));
        btn.addEventListener('click', function () {
          if (cur && cur.id === v.id) {
            if (player.paused) { var p = player.play(); if (p && p.catch) p.catch(function () {}); } else player.pause();
          } else startVoice(v, null);
        });
        bar.addEventListener('click', function (e) {
          var f = seekFraction(bar, e.clientX);
          if (cur && cur.id === v.id && isFinite(player.duration)) { player.currentTime = f * player.duration; if (player.paused) player.play(); }
          else startVoice(v, f);
        });
        X.body.appendChild(li);
      });
      // التهنئة اللي شغالة تفضل متعلّمة بعد أي تحديث
      if (cur) { cur.li = liOf(cur.id); if (cur.li && !player.paused) cur.li.classList.add('playing'); }
    }
    if (list.length > FIRST.v) setMore(X.more, n < list.length ? T.allVoices(list.length) : T.less, n >= list.length);
    else setMore(X.more, '');
  }

  /* ---------- ألبوم الذكريات ---------- */
  function renderPhotos() {
    var list = data.photos, X = B.p;
    X.b.hidden = !list.length;
    X.cnt.textContent = list.length;
    var n = Math.min(list.length, shown.p);
    var ids = list.map(function (p) { return p.id; }).join(',');
    if (X.ids !== ids) { X.ids = ids; X.body.textContent = ''; }     // اتغيّرت الصور: من الأول
    for (var i = X.body.children.length; i < n; i++) {
      var p = list[i];
      var t = el('button', 'gw-tile reveal');
      t.type = 'button';
      t.setAttribute('aria-label', T.photo + ' ' + (i + 1) + (p.name ? ' — ' + T.from + ' ' + p.name : ''));
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onload = function () { this.classList.add('ok'); };
      img.src = p.thumb;
      t.appendChild(img);
      (function (k) { t.addEventListener('click', function () { openLb(k); }); })(i);
      X.body.appendChild(t);
    }
    while (X.body.children.length > n) X.body.removeChild(X.body.lastChild);
    if (n < list.length) setMore(X.more, T.morePhotos(list.length - n), false);
    else if (list.length > FIRST.p) setMore(X.more, T.less, true);
    else setMore(X.more, '');
  }

  /* ---------- عرض الصورة كبيرة ---------- */
  var lb = null, lbImg, lbCount, lbCap, lbIdx = 0, pushed = false, prevOverflow = '';
  function buildLb() {
    lb = el('div', 'gw-lb');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    var top = el('div', 'gw-lb-top');
    lbCount = el('span', 'gw-lb-count');
    var x = el('button', 'gw-lb-x', IC.x); x.type = 'button'; x.setAttribute('aria-label', T.close);
    top.appendChild(lbCount); top.appendChild(x);
    var stage = el('div', 'gw-lb-stage');
    lbImg = el('img', 'gw-lb-img'); lbImg.alt = '';
    stage.appendChild(lbImg);
    var pv = el('button', 'gw-lb-nav prev', IC.right); pv.type = 'button'; pv.setAttribute('aria-label', T.prev);
    var nx = el('button', 'gw-lb-nav next', IC.left); nx.type = 'button'; nx.setAttribute('aria-label', T.next);
    lbCap = el('div', 'gw-lb-cap');
    lb.appendChild(top); lb.appendChild(stage); lb.appendChild(pv); lb.appendChild(nx); lb.appendChild(lbCap);
    document.body.appendChild(lb);
    x.addEventListener('click', function () { closeLb(false); });
    pv.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    nx.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    stage.addEventListener('click', function (e) { if (e.target === stage) closeLb(false); });
    lbImg.addEventListener('load', function () { lbImg.classList.remove('loading'); });
    var sx = 0, sy = 0, tracking = false;
    stage.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) { tracking = false; return; } tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      // عربي: السحب لليمين = اللي بعدها (الصور ماشية من اليمين للشمال)
      var forward = RTL() ? dx > 0 : dx < 0;
      step(forward ? 1 : -1);
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb(false);
      else if (e.key === 'ArrowLeft') step(RTL() ? 1 : -1);
      else if (e.key === 'ArrowRight') step(RTL() ? -1 : 1);
    });
    window.addEventListener('popstate', function () { if (lb.classList.contains('open')) { pushed = false; closeLb(true); } });
  }
  function showLb() {
    var list = data.photos, p = list[lbIdx];
    if (!p) return;
    lbImg.classList.add('loading');
    lbImg.src = p.large;
    lbCount.textContent = (lbIdx + 1) + ' / ' + list.length;
    lbCap.textContent = p.name ? T.from + ' ' + p.name : '';
    [lbIdx + 1, lbIdx - 1].forEach(function (k) { var q = list[(k + list.length) % list.length]; if (q) { var im = new Image(); im.src = q.large; } });
  }
  function step(d) { var n = data.photos.length; if (!n) return; lbIdx = (lbIdx + d + n) % n; showLb(); }
  function openLb(i) {
    if (!lb) buildLb();
    lbIdx = i;
    showLb();
    lb.classList.add('open');
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    // زرار الرجوع في الموبايل يقفل الصورة بدل ما يخرج من الدعوة
    if (!pushed && window.history && history.pushState) { try { history.pushState({ gwlb: 1 }, ''); pushed = true; } catch (e) {} }
  }
  function closeLb(fromPop) {
    if (!lb) return;
    lb.classList.remove('open');
    document.documentElement.style.overflow = prevOverflow;
    if (pushed && !fromPop) { pushed = false; try { history.back(); } catch (e) {} }
  }

  /* ---------- "شوف أكتر" ---------- */
  function wireMore() {
    B.m.more.addEventListener('click', function () {
      var all = shown.m < data.messages.length;
      shown.m = all ? data.messages.length : FIRST.m;
      renderMsgs(); observe(root);
      if (!all) B.m.b.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    B.v.more.addEventListener('click', function () {
      var all = shown.v < data.voices.length;
      shown.v = all ? data.voices.length : FIRST.v;
      renderVoices(); observe(root);
      if (!all) B.v.b.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    B.p.more.addEventListener('click', function () {
      if (shown.p < data.photos.length) shown.p = Math.min(data.photos.length, shown.p + PHOTO_STEP);
      else { shown.p = FIRST.p; B.p.b.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      renderPhotos(); observe(root);
    });
  }

  /* ---------- البيانات ---------- */
  var lastJson = '', loading = false;
  function render() {
    mount();
    if (!B.wired) { wireMore(); B.wired = true; }
    renderMsgs(); renderVoices(); renderPhotos();
    var any = data.messages.length + data.voices.length + data.photos.length > 0;
    root.hidden = !any;
    document.documentElement.classList.toggle('gw-on', any);
    observe(root);
  }
  function load() {
    if (loading) return;
    loading = true;
    fetch('/i/' + encodeURIComponent(SID) + '/wall', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        loading = false;
        if (!j) return;
        var s = JSON.stringify(j);
        if (s === lastJson) return;
        lastJson = s;
        data = { messages: j.messages || [], voices: j.voices || [], photos: j.photos || [] };
        if (lb && lb.classList.contains('open') && lbIdx >= data.photos.length) lbIdx = 0;
        render();
      })
      .catch(function () { loading = false; });
  }
  var soonT = 0;
  function soon(ms) { clearTimeout(soonT); soonT = setTimeout(load, ms || 700); }

  // بعد ما الضيف يبعت رده/تهنئته/صوره: تظهر تحت على طول
  var hit = function (url) { url = String(url || ''); return /\/i\/[^/]+\/(rsvp|voice|photos)(\?|$)/.test(url) && url.indexOf('/i/' + SID + '/') !== -1; };
  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    var p = origFetch.apply(this, arguments);
    if (method === 'POST' && hit(url)) p.then(function (r) { if (r && r.ok) soon(); }, function () {});
    return p;
  };
  if (window.XMLHttpRequest) {
    var XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this._gw = String(m).toUpperCase() === 'POST' && hit(u); return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
      if (this._gw) this.addEventListener('load', function () { if (this.status >= 200 && this.status < 300) soon(1500); });
      return XS.apply(this, arguments);
    };
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) soon(300); });
  setInterval(function () { if (!document.hidden) load(); }, 120000);

  // سطر صغير تحت خانة الرسالة في فورم الحضور: هتظهر فين، ومن غير ما يبان هيحضر ولا لأ
  function rsvpNote() {
    var note = document.getElementById('rNote');
    if (!note || document.querySelector('.gw-rnote')) return;
    var n = txt('div', 'gw-rnote', T.rsvpNote);
    note.parentNode.appendChild(n);
  }

  function start() { rsvpNote(); load(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
