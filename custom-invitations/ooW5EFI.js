// دعوة ooW5EFI (Velvet Voice، عربي) — بطلب المالك:
//
// 1) الظرف: أول ما الضيف يضغط، الظرف ماينفتحش — الختم بيطير والظرف كله بينزل
//    لتحت ويختفي (نفس حركة Sage Garden بالظبط)، والدعوة تتفتح على طول.
// 2) أول صفحة بعد الفتح: صورة الآية (بسم الله الرحمن الرحيم — وخلقناكم أزواجًا —
//    Join us for the union of two souls) على الشاشة كلها. الصورة اتنضّفت من
//    شريط الموبايل اللي فوق (الساعة/الشبكة) وخانة "Reply to yourself" اللي تحت
//    (client/public/custom/ooW5EFI/quran.webp).
//    بعدها الدعوة بتكمّل عادي: مرّر لتحت (أو تستنى ثواني) → الصورة بتطلع لفوق
//    وصفحة الأسامي تظهر، ومن صفحة الأسامي لو طلع لفوق بيرجع للآية.
//
// التنفيذ: transform() بيعدّل 4 حتت صغيرة في كود القالب للدعوة دي بس. لو القالب
// اتغيّر ومالقاش حتة منهم، بيسيب الصفحة زي ما هي (الظرف العادي) — مفيش كسر.
// المحرر (?edit=1): الصورة مش بتظهر خالص عشان صاحب الدعوة يعدّل صفحاته عادي.

const IMG = '/custom/ooW5EFI/quran.webp';

const CSS = `
/* صفحة الآية — فوق صفحات الكارت، وتحت زرار "مرّر للأسفل" (z 20) */
.ooq{position:absolute;inset:0;z-index:15;overflow:hidden;background:#f1e2cf;pointer-events:none;
  opacity:0;visibility:hidden;transform:translateY(0);
  transition:transform .95s cubic-bezier(.65,0,.25,1),opacity 0s linear .95s,visibility 0s linear .95s}
.ooq img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.06);transition:transform 2.6s cubic-bezier(.2,.7,.2,1)}
.ooq.on{opacity:1;visibility:visible;transition:transform .95s cubic-bezier(.65,0,.25,1)}
.ooq.on img{transform:none}
.ooq.up{transform:translateY(-100%)}
.ooq.instant,.ooq.instant img{transition:none!important}

/* الظرف: الختم بيطير والظرف كله بينزل لتحت (زي Sage Garden) — بدل ما يتفتح */
.intro.oo-drop{cursor:default}
.intro.oo-drop .seal{animation:ooSeal .6s cubic-bezier(.3,1.6,.5,1) forwards}
.intro.oo-drop .seal::before{animation:none;opacity:0}
@keyframes ooSeal{30%{transform:scale(1.22) rotate(-8deg)}100%{transform:scale(.2) rotate(40deg);opacity:0}}
.intro.oo-drop .grp{animation:ooDrop 1.25s .35s cubic-bezier(.6,0,.3,1) forwards}
@keyframes ooDrop{40%{transform:translateY(-365px) scale(.885)}100%{transform:translateY(1250px) scale(.8) rotate(4deg);opacity:0}}
.intro.oo-drop .tap{opacity:0;transform:translateY(16px)}
.intro.oo-drop .dust{opacity:0;transition:opacity .6s ease}
.intro.oo-gone{opacity:0;transition:opacity .55s ease;pointer-events:none}
`;

// بيتحط جوه سكريبت القالب (قبل "start") — فبيوصل لـ show / auto / busy / cur ...
const LOGIC = `
  /* ---------- ooW5EFI: صفحة الآية قبل الكارت + الظرف بينزل بدل ما يتفتح ---------- */
  const Q = EDIT ? null : document.getElementById('ooq');
  let qOn = false, qRaf = 0, qLeft = 0, qLast = 0, qTouch = -1e9;
  const Q_MS = 6500;
  addEventListener('pointerdown', () => { qTouch = performance.now(); }, { passive: true });
  function qTimer() {
    cancelAnimationFrame(qRaf);
    const bar = $('#hintProg');
    qLeft = Q_MS; qLast = performance.now();
    (function f(now) {
      if (!qOn) return;
      const dt = now - qLast; qLast = now;
      const paused = document.hidden || now - qTouch < 4000 || intro.isConnected;
      bar.parentNode.classList.toggle('paused', paused);
      if (!paused) qLeft -= dt;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, 1 - qLeft / Q_MS)).toFixed(4) + ')';
      if (qLeft <= 0) { qHide(); return; }
      qRaf = requestAnimationFrame(f);
    })(qLast);
  }
  function qShow(instant) {
    if (!Q) return;
    qOn = true;
    Q.classList.remove('up');
    if (instant) { Q.classList.add('instant'); requestAnimationFrame(() => requestAnimationFrame(() => Q.classList.remove('instant'))); }
    Q.classList.add('on');
    auto.arm(LAST);              // صفحة الكارت اللي تحت الصورة ماتقلبش لوحدها
    stage.classList.add('show-hint');
    if (!instant) { busy = true; setTimeout(() => { busy = false; }, 1000); }
    qTimer();
  }
  function qHide() {
    if (!qOn) return;
    qOn = false;
    cancelAnimationFrame(qRaf);
    Q.classList.add('up');
    busy = true;
    setTimeout(() => { Q.classList.remove('on'); }, 30);
    show(0, 1);                  // صفحة الأسامي بتدخل بحركتها وهي الصورة طالعة
    setTimeout(() => { busy = false; }, 1100);
  }
  function qGo(dir, to) {
    if (!Q) return false;
    if (qOn) {
      if (busy || intro.isConnected) return true;
      if (dir > 0 || (to != null && to > 0)) qHide();
      return true;
    }
    if (cur === 0 && dir < 0 && to == null && !busy) { qShow(false); return true; }
    return false;
  }
  function dropOpen() {
    if (opened) return;
    opened = true;
    setAudio(true);
    show(0, 1, true);
    stage.classList.add('opened');
    qShow(true);
    intro.classList.add('oo-drop');
    setTimeout(() => petals.start(6500), 450);
    setTimeout(() => intro.classList.add('oo-gone'), 1300);
    setTimeout(() => intro.remove(), 1950);
  }
`;

// كل حتة: [اللي بندوّر عليه, اللي بيتحط مكانه]
const PATCHES = [
  // صفحة الآية جوه اللوحة (نفس مقاس الكارت/الظرف، فبتملا الشاشة زيه بالظبط)
  ['    <button class="scroll-hint" id="hint" type="button"',
    `    <div class="ooq" id="ooq" aria-label="بسم الله الرحمن الرحيم — وخلقناكم أزواجا"><img src="${IMG}" alt="بسم الله الرحمن الرحيم — وخلقناكم أزواجا" decoding="async"></div>\n    <button class="scroll-hint" id="hint" type="button"`],
  // الضغط على الظرف → ينزل لتحت بدل ما يتفتح
  ['  function openEnvelope() {\n    if (opened || EDIT) return;',
    '  function openEnvelope() {\n    if (Q && !EDIT) { dropOpen(); return; }\n    if (opened || EDIT) return;'],
  // التنقل: من الآية لتحت → الأسامي، ومن الأسامي لفوق → الآية
  ['  function go(dir, to) {\n    const next = to != null ? to : cur + dir;',
    '  function go(dir, to) {\n    if (qGo(dir, to)) return true;\n    const next = to != null ? to : cur + dir;'],
  // صاحب الدعوة وهو بيشوفها (من غير المحرر): برضو بتبدأ بالآية
  ['    show(startAt, 1, true);\n  } else {',
    '    show(startAt, 1, true);\n    if (!EDIT && startAt === 0) qShow(true);\n  } else {'],
  ['  /* ---------- start ---------- */', `${LOGIC}\n  /* ---------- start ---------- */`],
];

module.exports = {
  shortId: 'ooW5EFI',

  render() {
    return { head: `<link rel="preload" as="image" href="${IMG}"><style id="oo-style">${CSS}</style>` };
  },

  transform(html) {
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    let out = html;
    for (const [find, repl] of PATCHES) {
      const f = find.replace(/\n/g, nl);
      if (out.split(f).length !== 2) {
        console.error('[custom ooW5EFI] template changed — showing the normal envelope');
        return html;
      }
      out = out.replace(f, () => repl.replace(/\n/g, nl));
    }
    return out;
  },
};
