// دعوة احمد & شهد (Royal Maroon) — بطلب المالك: ألبوم الصور بشكل
// "ألبوم صغير من ذكرياتنا": الصورة في النص بإطار، واللي قبلها وبعدها ظاهرين
// على الجناب، على شريط ورق، وتحتهم أسهم وعدّاد (01 / 08) ونقط. سحب يمين وشمال.
// الكلام بلون الدعوة (البرجاندي). الصور نفسها زي ما هي من الدعوة (والمحرر لسه
// يقدر يغيّر أو يشيل أي صورة — الألبوم بيعيد الحساب لوحده).

const CSS = `
.mm-album{padding-top:40px;position:relative}
.mm-album > .section-title{display:none}
.mm-head{text-align:center;margin:0 0 6px;color:var(--maroon);line-height:1}
.mm-head .mm-small{display:block;font-family:var(--serif-ar);font-size:17px;font-weight:400;opacity:.85;margin-bottom:2px}
.mm-head .mm-big{display:block;font-family:'Aref Ruqaa',var(--serif-ar);font-weight:700;font-size:54px;line-height:1.25}
.mm-album .carousel{overflow:hidden;padding:26px 0 30px;perspective:1100px}
.mm-album .carousel::before{content:"";position:absolute;inset:12% -4% 12%;z-index:0;
  background:
    radial-gradient(120% 90% at 50% 50%,rgba(255,255,255,.75),rgba(255,255,255,0) 70%),
    repeating-linear-gradient(115deg,rgba(78,20,27,.018) 0 2px,transparent 2px 6px),
    linear-gradient(180deg,#efe6d8,#f6efe4 50%,#ece2d2);
  box-shadow:0 10px 22px -14px rgba(42,10,14,.45),0 -6px 16px -14px rgba(42,10,14,.35);
  clip-path:polygon(0 3%,8% 0,17% 2%,29% .5%,41% 2.5%,55% .5%,68% 2%,81% 0,92% 2.5%,100% 1%,100% 97%,90% 100%,78% 98%,64% 99.5%,50% 97.5%,37% 99.5%,24% 98%,11% 100%,0 98%)}
.mm-album .carousel-track{position:relative;z-index:1;display:block;transform:none!important;transition:none}
.mm-album .carousel-track .slide{position:absolute;top:0;left:20%;width:60%;padding:0;margin:0;
  transition:transform .65s cubic-bezier(.22,.8,.25,1),opacity .5s ease,filter .5s ease;
  transform-origin:50% 50%;will-change:transform;cursor:pointer;-webkit-tap-highlight-color:transparent}
.mm-album .carousel-track .slide img{display:block;width:100%;aspect-ratio:3/4.15;object-fit:cover;border-radius:3px;
  border:7px solid #fbf7f0;outline:1px solid rgba(201,152,87,.55);outline-offset:-12px;
  box-shadow:0 22px 34px -16px rgba(42,10,14,.55),0 2px 6px rgba(42,10,14,.18);background:#eadfce}
.mm-album .slide[data-mm-pos="0"]{transform:translateX(0) scale(1);z-index:3;opacity:1;filter:none}
.mm-album .slide[data-mm-pos="1"]{transform:translateX(-74%) scale(.8) rotateY(14deg);z-index:2;opacity:1;filter:brightness(.72) saturate(.9)}
.mm-album .slide[data-mm-pos="-1"]{transform:translateX(74%) scale(.8) rotateY(-14deg);z-index:2;opacity:1;filter:brightness(.72) saturate(.9)}
.mm-album .slide[data-mm-pos="2"]{transform:translateX(-120%) scale(.62);z-index:1;opacity:0;pointer-events:none}
.mm-album .slide[data-mm-pos="-2"]{transform:translateX(120%) scale(.62);z-index:1;opacity:0;pointer-events:none}
.mm-album .slide[data-mm-pos="x"]{transform:scale(.5);z-index:0;opacity:0;pointer-events:none}
.mm-album .carousel-dots{display:none!important}
.mm-ctrl{display:flex;align-items:center;justify-content:center;gap:22px;margin-top:4px;color:var(--maroon)}
.mm-ctrl button{width:38px;height:38px;border-radius:50%;border:1px solid rgba(78,20,27,.35);color:var(--maroon);
  display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.35);transition:background .2s,transform .2s}
.mm-ctrl button:active{transform:scale(.92)}
.mm-ctrl button svg{width:16px;height:16px}
.mm-count{font-family:var(--serif-en);font-size:17px;letter-spacing:.12em;direction:ltr;min-width:74px;text-align:center}
.mm-count b{font-weight:600}
.mm-count i{font-style:normal;opacity:.55}
.mm-dots{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;direction:rtl}
.mm-dots span{width:5px;height:5px;border-radius:50%;background:rgba(78,20,27,.25);transition:all .3s}
.mm-dots span.on{width:7px;height:7px;border-radius:1px;transform:rotate(45deg);background:var(--maroon)}
`;

const SCRIPT = `(function(){
  var sec = document.querySelector('.album-section');
  var car = document.getElementById('carousel');
  var track = document.getElementById('carouselTrack');
  if (!sec || !car || !track) return;
  var EDIT = /(?:^|[?&])edit=1(?:&|$)/.test(location.search);
  sec.classList.add('mm-album');

  var head = document.createElement('div');
  head.className = 'mm-head';
  head.innerHTML = '<span class="mm-small">ألبوم صغير من</span><span class="mm-big">ذكرياتنا</span>';
  sec.insertBefore(head, car);

  var arrow = function(d){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>'; };
  var ctrl = document.createElement('div');
  ctrl.className = 'mm-ctrl';
  // الصفحة عربي: "اللي بعدها" على الشمال
  ctrl.innerHTML = '<button type="button" class="mm-next" aria-label="الصورة اللي بعدها">' + arrow('M15 5l-7 7 7 7') + '</button>'
    + '<span class="mm-count"><b>01</b> / <i>01</i></span>'
    + '<button type="button" class="mm-prev" aria-label="الصورة اللي قبلها">' + arrow('M9 5l7 7-7 7') + '</button>';
  var dots = document.createElement('div');
  dots.className = 'mm-dots';
  var after = document.getElementById('carouselDots');
  sec.insertBefore(ctrl, after);
  sec.insertBefore(dots, after);
  var countB = ctrl.querySelector('b'), countI = ctrl.querySelector('i');

  var cur = 0, sig = '';
  function visible(){
    return Array.prototype.filter.call(track.children, function(s){ return getComputedStyle(s).display !== 'none'; });
  }
  var pad = function(n){ return (n < 10 ? '0' : '') + n; };
  function layout(){
    var vs = visible(), n = vs.length;
    Array.prototype.forEach.call(track.children, function(s){ if (vs.indexOf(s) < 0) s.setAttribute('data-mm-pos', 'x'); });
    if (!n) { ctrl.style.display = 'none'; return; }
    ctrl.style.display = n > 1 ? '' : 'none';
    cur = ((cur % n) + n) % n;
    vs.forEach(function(s, i){
      var d = i - cur;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      // صورتين بس: التانية على جنب واحد
      s.setAttribute('data-mm-pos', Math.abs(d) <= 2 ? String(d) : 'x');
    });
    var img = vs[cur].querySelector('img');
    var h = vs[cur].offsetHeight || (img && img.offsetHeight) || 0;
    if (h) track.style.height = h + 'px';
    countB.textContent = pad(cur + 1);
    countI.textContent = pad(n);
    while (dots.children.length > n) dots.removeChild(dots.lastChild);
    while (dots.children.length < n) dots.appendChild(document.createElement('span'));
    Array.prototype.forEach.call(dots.children, function(d, i){ d.className = i === cur ? 'on' : ''; });
  }
  function go(i){ cur = i; layout(); }

  var timer = null, resumeAt = 0;
  function auto(){
    if (EDIT) return;
    clearInterval(timer);
    timer = setInterval(function(){ if (Date.now() >= resumeAt && !document.hidden) go(cur + 1); }, 4200);
  }
  function touched(){ resumeAt = Date.now() + 9000; }

  ctrl.querySelector('.mm-next').addEventListener('click', function(){ touched(); go(cur + 1); });
  ctrl.querySelector('.mm-prev').addEventListener('click', function(){ touched(); go(cur - 1); });
  // الضغط على صورة جنب بيجيبها في النص (في المحرر الضغط بيفتح تغيير الصورة)
  track.addEventListener('click', function(e){
    if (EDIT) return;
    var s = e.target.closest && e.target.closest('.slide');
    if (!s) return;
    var vs = visible(), i = vs.indexOf(s);
    if (i >= 0 && i !== cur) { touched(); go(i); }
  });
  var sx = 0, sy = 0, down = false;
  car.addEventListener('touchstart', function(e){ down = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; touched(); }, { passive: true });
  car.addEventListener('touchend', function(e){
    if (!down) return; down = false;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    // صفحة عربي: السحب لليمين = اللي بعدها
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx > 0 ? 1 : -1));
  }, { passive: true });
  // ماوس (كمبيوتر): سحب بالماوس كمان
  var mx = null;
  car.addEventListener('mousedown', function(e){ mx = e.clientX; });
  window.addEventListener('mouseup', function(e){
    if (mx === null) return;
    var dx = e.clientX - mx; mx = null;
    if (Math.abs(dx) > 50) { touched(); go(cur + (dx > 0 ? 1 : -1)); }
  });

  // المحرر بيخفي/يرجّع صور (display) — نعيد الحساب لو اللي ظاهر اتغيّر بس
  function signature(){ return visible().map(function(s){ return s.getAttribute('data-elem-id'); }).join(','); }
  if (window.MutationObserver) {
    new MutationObserver(function(){ var s = signature(); if (s !== sig) { sig = s; layout(); } })
      .observe(track, { attributes: true, subtree: true, childList: true, attributeFilter: ['style', 'class'] });
  }
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  track.addEventListener('load', function(){ layout(); }, true);
  sig = signature();
  layout();
  [300, 1000, 2500].forEach(function(ms){ setTimeout(layout, ms); });
  auto();
})();`;

module.exports = {
  shortId: 'osj3Yje',

  render() {
    return {
      head: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&display=swap"><style id="mm-album-style">${CSS}</style>`,
      bodyEnd: `<script id="mm-album-script">${SCRIPT}</script>`,
    };
  },
};
