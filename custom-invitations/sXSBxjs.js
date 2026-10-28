// دعوة sXSBxjs (Sage Garden) — بطلب المالك، أول تعديل:
// غلاف جديد: ظرف ورق برسمة قلم رصاص (فيلا وسرو فوق، وبحيرة تحت) — صورة المالك
// المربعة اتكمّلت لطولية (custom/sXSBxjs/top.webp + bottom.webp، الطيّة في النص
// بالظبط)، وختم شمع زيتي بحروف MR (seal.webp) مكان ختم الصورة الأصلي.
// الضغط: الختم بيعمل زوم بسيط ← الظرف بيتفتح من النص (النص اللي فوق يطلع لفوق،
// واللي تحت ينزل لتحت) ← الدعوة تظهر. الدعوة نفسها زي ما هي.
//
// التنفيذ: transform() بيضيف الغلاف الجديد ويخلي الضغط عليه يشغّل openInvite بتاعة
// القالب (نفس المزيكا والتوقيت). لو القالب اتغيّر ومالقاش الحتت → الغلاف العادي.
const { asset } = require('./_asset');

const TOP = asset('/custom/sXSBxjs/top.webp');
const BOTTOM = asset('/custom/sXSBxjs/bottom.webp');
const SEAL = asset('/custom/sXSBxjs/seal.webp');

// ===== تاني تعديل: الكولاج (صورة المالك "Sophia & Daniel" متقطّعة قطع) =====
// كل قطعة (custom/sXSBxjs/c/*.webp) مقصوصة على حدودها الحقيقية (SAM) والجزء اللي
// كان مستخبي تحت قطعة تانية اتكمّل (مراية للكروت المتماثلة / LaMa) — scratch sx3/build.py.
// كل قطعة في نفس مكانها بالظبط في الصورة (عرض 736 زي
// كولاج القالب)، فلما يستقروا الشكل = الصورة؛ وكل قطعة بتدخل لوحدها بنفس حركة
// القالب. الكلام اللي كان مرسوم (الأسامي، التاريخ، المكان، المونوجرام) اتشال من
// الصورة وبقى كلام حقيقي بيتعدّل (sx10…) وبياخد من بيانات الدعوة (data-k).
// الخلفية: لوحة الشجر والبحيرة باهتة (c/bg.webp). قطع القالب الأصلية مستخبية.
const PIECES = require('./sXSBxjs-pieces.json');
const C = (n) => asset(`/custom/sXSBxjs/c/${n}.webp`);
const CH = 1404;
const SWAY = { bq1: '70% 30%', bq2: '30% 20%', calla: '50% 0%', gyp: '90% 80%', bq3: '50% 0%' };
// كلام فوق القطع — بإحداثيات الصورة الأصلية (بتتحوّل لمكانها جوه القطعة)
const TEXTS = {
  env: [['sx10', 'mono', 413, 318, 'MR']],
  card: [
    ['sx11', 'inv', 277, 432, 'YOU ARE INVITED TO<br>THE WEDDING OF'],
    ['sx12', 'nm1', 277, 500, '', 'groom'],
    ['sx13', 'nm2', 277, 557, '', 'bride'],
    ['sx14', 'cdt', 277, 636, '', 'dateUp'],
    ['sx15', 'cdt', 277, 652, '', 'cityUp'],
  ],
  pola: [['sx16', 'cap', 522, 561, '', 'pair']],
  std: [
    ['sx17', 'sd', 548, 782, '', 'day'],
    ['sx18', 'sm', 548, 826, '', 'monthUp'],
    ['sx19', 'sd', 548, 873, '', 'year'],
    ['sx20', 'st', 548, 918, '', 't0'],
    ['sx21', 'sv', 548, 944, '', 'hallUp'],
    ['sx22', 'sv', 548, 960, '', 'cityUp'],
  ],
};
const pieceHtml = (p) => {
  const cls = ['pc', 'sxp', `sxp-${p.n}`, p.go ? 'tap' : '', SWAY[p.n] ? 'sway' : ''].filter(Boolean).join(' ');
  const style = `--x:${p.x};--y:${p.y};--w:${p.w};--h:${p.h};--fx:${p.fx}px;--fy:${p.fy}px;--fr:${p.fr}deg;--d:${p.d}s${SWAY[p.n] ? `;--o:${SWAY[p.n]}` : ''}`;
  return `<div class="${cls}"${p.go ? ` data-go="${p.go}"` : ''} style="${style}"><img src="${C(p.n)}" alt="" draggable="false"></div>`;
};
// طبقة الكلام: نفس مقاس ومكان وحركة الكارت بتاعها، بس فوق كل القطع (عشان الورد مايغطّيش الكلام)
const textLayer = (p) => {
  const t = TEXTS[p.n];
  if (!t) return '';
  const style = `--x:${p.x};--y:${p.y};--w:${p.w};--h:${p.h};--fx:${p.fx}px;--fy:${p.fy}px;--fr:${p.fr}deg;--d:${p.d}s`;
  const spans = t.map(([id, c, x, y, txt, k]) =>
    `<span class="sxt sxt-${c}" style="--tx:${x - p.x};--ty:${y - p.y}"${k ? ` data-k="${k}"` : ''} data-elem-id="${id}">${txt}</span>`).join('');
  return `<div class="pc sxp sxp-txt sxp-txt-${p.n}${p.go ? ' tap' : ''}"${p.go ? ` data-go="${p.go}"` : ''} style="${style}">${spans}</div>`;
};
const COLLAGE = PIECES.map(pieceHtml).concat(PIECES.map(textLayer).filter(Boolean)).join('\n      ');

const CSS = `
/* ===== الكولاج الجديد ===== */
#collage{aspect-ratio:736/${CH};background:#f6f3ee url(${C('bg')}) 0 0/100% 100% no-repeat}
#collage > :not(.sxp){display:none!important}
.sxp img{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;-webkit-user-drag:none}
.sxp-txt:not(.tap){pointer-events:none}
.sxt{position:absolute;left:calc(var(--tx)*var(--u));top:calc(var(--ty)*var(--u));translate:-50% -50%;white-space:nowrap;text-align:center;line-height:1.15;letter-spacing:0}
.sxt-inv{font:500 calc(11.5*var(--u))/1.45 'Cinzel','Cormorant Garamond',serif;letter-spacing:.12em;color:#ecdcbc}
.sxt-nm1,.sxt-nm2{font:400 calc(50*var(--u))/1.1 'Pinyon Script',cursive;color:#d8b07f;text-shadow:0 1px 0 rgba(0,0,0,.25)}
.sxt-nm1::after{content:" &"}
.sxt-cdt{font:600 calc(11*var(--u))/1.2 'Cormorant Garamond',serif;letter-spacing:.16em;color:#ecdcbc}
.sxt-cap{font:400 calc(13*var(--u))/1 'Pinyon Script',cursive;color:#4c3b33}
.sxt-sd{font:500 calc(42*var(--u))/1 'Cormorant Garamond',serif;letter-spacing:.06em;color:#2b2522}
.sxt-sm{font:500 calc(40*var(--u))/1 'Cormorant Garamond',serif;letter-spacing:.08em;color:#2b2522}
.sxt-st,.sxt-sv{font:600 calc(11*var(--u))/1 'Cormorant Garamond',serif;letter-spacing:.16em;color:#4a2a2c}
/* المونوجرام على الظرف الزيتي: MR جوه إكليل بيضاوي رفيع */
.sxt-mono{font:400 calc(36*var(--u))/1 'Pinyon Script',cursive;color:#d8c79c;padding:calc(10*var(--u)) calc(12*var(--u));
  text-shadow:0 1px 0 rgba(30,35,10,.45)}
.sxt-mono::before{content:"";position:absolute;inset:calc(-6*var(--u)) calc(-2*var(--u));border:1px solid rgba(216,199,156,.7);border-radius:50%}
#collage.play:not(.static) .sxp-renv{animation:nudge 4.5s ease-in-out 3.6s infinite}

/* الغلاف الأصلي بيستخبى — الجديد بيغطي الشاشة */
#coverScreen > :not(.sx-env){display:none!important}
#coverScreen{background:#e4ded0}
.sx-env{position:absolute;inset:0;overflow:hidden;perspective:1600px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.sx-half{position:absolute;left:0;right:0;height:50%;background-repeat:no-repeat;background-size:cover;will-change:transform}
.sx-top{top:0;background-image:url(${TOP});background-position:center bottom;z-index:2;
  box-shadow:0 2px 3px rgba(80,70,50,.18)}
.sx-bot{bottom:0;background-image:url(${BOTTOM});background-position:center top;z-index:1}
/* ضل خفيف تحت حافة النص اللي فوق (الطيّة) */
.sx-top::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:6px;background:linear-gradient(rgba(70,60,40,.22),transparent)}
.sx-seal{position:absolute;left:50%;top:50%;z-index:3;width:min(34vw,170px);aspect-ratio:520/527;transform:translate(-50%,-50%);
  filter:drop-shadow(0 7px 9px rgba(40,45,20,.38)) drop-shadow(0 2px 2px rgba(40,45,20,.3))}
.sx-seal img{display:block;width:100%;height:100%;animation:sxBreathe 2.6s ease-in-out infinite}
@keyframes sxBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
.sx-seal::before{content:"";position:absolute;inset:-12%;border-radius:50%;border:1.5px solid rgba(122,130,70,.45);animation:sxRing 2.6s ease-out infinite}
@keyframes sxRing{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.25);opacity:0}}
.sx-hint{position:absolute;left:0;right:0;bottom:calc(30px + env(safe-area-inset-bottom));z-index:3;text-align:center;
  font:italic 500 17px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.2em;color:#6d6650;transition:opacity .4s ease}
.sx-hint span{display:inline-flex;align-items:center;gap:10px}
.sx-hint i{width:26px;height:1px;background:#a69a72}

/* الفتح: (1) الختم بيعمل زوم بسيط  (2) الختم بيختفي والنصين بيتفتحوا من النص */
.sx-env.sx-open{cursor:default}
.sx-env.sx-open .sx-hint{opacity:0}
.sx-env.sx-open .sx-seal::before{animation:none;opacity:0}
.sx-env.sx-open .sx-seal img{animation:none}
.sx-env.sx-open .sx-seal{animation:sxSeal 1.15s cubic-bezier(.45,0,.2,1) forwards}
@keyframes sxSeal{
  0%{transform:translate(-50%,-50%) scale(1)}
  38%{transform:translate(-50%,-50%) scale(1.14)}
  60%{transform:translate(-50%,-50%) scale(1.12);opacity:1}
  100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
.sx-env.sx-open .sx-top{animation:sxTop 1.5s .6s cubic-bezier(.65,0,.25,1) forwards}
.sx-env.sx-open .sx-bot{animation:sxBot 1.5s .6s cubic-bezier(.65,0,.25,1) forwards}
@keyframes sxTop{0%{transform:none}100%{transform:translateY(-102%)}}
@keyframes sxBot{0%{transform:none}100%{transform:translateY(102%)}}
#coverScreen.sx-done{opacity:0;transition:opacity .35s ease;pointer-events:none}
@media (prefers-reduced-motion:reduce){.sx-seal img,.sx-seal::before{animation:none}}
`;

const COVER = `<div class="sx-env" id="sx-env" role="button" tabindex="0" aria-label="Tap the seal to open">
    <div class="sx-half sx-top"></div>
    <div class="sx-half sx-bot"></div>
    <div class="sx-seal"><img src="${SEAL}" alt="" fetchpriority="high"></div>
    <div class="sx-hint"><span><i></i><b data-elem-id="sx1">Tap to open</b><i></i></span></div>
  </div>
`;

// بيتحط في سكريبت القالب قبل "STATIC" — openInvite متعرّفة قبله
const LOGIC = `
  /* ---------- sXSBxjs: برنامج اليوم (مواعيد العروسين) + الزي وتأكيد الحضور اتشالوا ---------- */
  {
    const SCH = [['sg40', '5:00 PM', 'sg41', 'Church Ceremony'], ['sg42', '7:00 PM', 'sg43', 'Cocktails'], ['sg44', '8:00 PM', 'sg45', 'First dance & party'], ['sg46', '10:00 PM', 'sg47', 'Dinner & after-party']];
    SCH.forEach(([t, tv, n, nv]) => { const a = byId(t), b = byId(n); if (a) a.textContent = tv; if (b) b.textContent = nv; });
    // الرقصة قبل العشا: أيقونة المزيكا للتالت والشوكة والسكينة للرابع
    const ics = $$('#schedule .tl .ic');
    if (ics.length === 4) { const x = ics[2].innerHTML; ics[2].innerHTML = ics[3].innerHTML; ics[3].innerHTML = x; }
    ['dress', 'rsvp'].forEach((id) => { const e = document.getElementById(id); if (e) e.classList.add('off'); });
    GO.rsvp = '#extras';
  }
  /* ---------- sXSBxjs: تقويم Save the Date (الشهر بتاع الفرح، والقلب على يومه) ---------- */
  {
    const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const mEl = document.querySelector('[data-elem-id="sx31"]'), yEl = document.querySelector('[data-elem-id="sx32"]');
    if (mEl && !mEl.textContent.trim()) mEl.textContent = MN[M];
    if (yEl && !yEl.textContent.trim()) yEl.textContent = String(Y);
    const g = document.getElementById('sxcGrid');
    if (g) {
      const first = new Date(Y, M, 1).getDay(), days = new Date(Y, M + 1, 0).getDate();
      let h = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => '<b>' + d + '</b>').join('');
      for (let k = 0; k < first; k++) h += '<span></span>';
      for (let d = 1; d <= days; d++) h += '<span' + (d === D ? ' class="wd"' : '') + '>' + d + '</span>';
      g.innerHTML = h;
    }
    // Save the Date في الكولاج بيودّي على التقويم
    GO.calendar = '#sxCal';
  }
  /* ---------- sXSBxjs: كلام الكولاج الجديد من بيانات الدعوة ---------- */
  {
    const up = (s) => String(s || '').toUpperCase();
    const extra = {
      dateUp: \`\${fields.day} \${up(fields.monthUp)} \${fields.year}\`,
      cityUp: up(fields.city), hallUp: up(fields.hall),
      pair: [fields.groom, fields.bride].filter(Boolean).join(' & '),
    };
    $$('#collage .sxt[data-k]').forEach((el) => { const v = extra[el.dataset.k]; if (v != null) el.textContent = v; });
    // اسم طويل: بيصغر على قد الكارت
    const fit = () => $$('#collage .sxt-nm1, #collage .sxt-nm2, #collage .sxt-cdt, #collage .sxt-sv, #collage .sxt-sm, #collage .sxt-sd').forEach((el) => {
      el.style.scale = '';
      const max = el.closest('.sxp').offsetWidth * (el.matches('.sxt-sv, .sxt-sm, .sxt-sd') ? 0.62 : 0.82);
      if (el.offsetWidth > max) el.style.scale = (max / el.offsetWidth).toFixed(3);
    });
    fit(); addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }
  /* ---------- sXSBxjs: الظرف بيتفتح من النص ---------- */
  {
    const env = document.getElementById('sx-env');
    let sxGo = false;
    const sxOpen = () => {
      if (sxGo) return; sxGo = true;
      env.classList.add('sx-open');
      // ورا النصين بتظهر الدعوة نفسها (مش لون الغلاف)
      setTimeout(() => { cover.style.background = 'transparent'; }, 600);
      // الدعوة بتبدأ تظهر والنصين بيتفتحوا (نفس openInvite بتاعة القالب: المزيكا والكولاج)
      setTimeout(() => { try { openInvite(); } catch (_) {} }, 250);
      setTimeout(() => cover.classList.add('sx-done'), 2000);
    };
    env.addEventListener('click', sxOpen);
    env.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sxOpen(); } });
  }
`;

// ===== تالت تعديل: العد التنازلي بستايل "The celebration begins." + كارت Save the Date (تقويم) تحته =====
const BUR = '#6b1d29';
// غصن صغير (ورق دهبي + توت برجندي) — بيتكرر في الأربع أركان
// غصن ركنة (للركن الشمال فوق) — فرعين ماشيين مع الحافتين، ورق دهبي وتوت برجندي؛ بيتقلب للأركان التانية
const _leaves = (pts) => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="2.4" transform="rotate(${r} ${x} ${y})"/>`).join('');
const SPRIG = `<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#b98c55" stroke-width="1.2" stroke-linecap="round">
  <path d="M6 6 C40 10 76 16 116 34"/><path d="M6 6 C10 40 16 76 34 116"/><path d="M40 12 C50 22 54 30 54 40"/><path d="M12 40 C22 50 30 54 40 54"/></g>
  <g fill="#c9a26b">${_leaves([[20,10,-25],[22,4,20],[34,13,-20],[36,7,25],[50,16,-15],[52,10,28],[66,20,-12],[68,14,30],[82,26,-8],[84,20,32],[98,31,0],[100,25,36],
    [10,20,-65],[4,22,-110],[13,34,-70],[7,36,-115],[16,50,-75],[10,52,-118],[20,66,-78],[14,68,-120],[26,82,-82],[20,84,-122],[31,98,-90],[25,100,-126],[48,26,60],[52,34,80],[26,48,30],[34,52,10]])}</g>
  <g fill="${BUR}">${[[112,34,3],[106,38,2.3],[116,28,2.2],[34,112,3],[38,106,2.3],[28,116,2.2],[56,42,2.6],[42,56,2.6],[60,46,2],[46,60,2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g></svg>`;
const ORN = `<div class="sxc-orn" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.6L21 7l-4.8 5L21 17l-6.8-1.6L12 22l-2.2-6.6L3 17l4.8-5L3 7l6.8 1.6z" fill="#b98c55"/></svg><i></i></div>`;
const CAL = `<section class="sxc-sec" id="sxCal" aria-label="Save the date">
  <div class="sxc-card reveal">
    <svg class="sxc-frame" viewBox="0 0 340 660" preserveAspectRatio="none" aria-hidden="true">
      <path d="M24 46 Q24 26 46 26 H140 Q160 26 170 8 Q180 26 200 26 H294 Q316 26 316 46 V614 Q316 634 294 634 H200 Q180 634 170 652 Q160 634 140 634 H46 Q24 634 24 614 Z" fill="#f7efe6" stroke="${BUR}" stroke-width="3" vector-effect="non-scaling-stroke"/>
      <path d="M33 52 Q33 35 52 35 H143 Q161 35 170 20 Q179 35 197 35 H288 Q307 35 307 52 V608 Q307 625 288 625 H197 Q179 625 170 640 Q161 625 143 625 H52 Q33 625 33 608 Z" fill="none" stroke="#b98c55" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
    </svg>
    <span class="sxc-sp k1">${SPRIG}</span><span class="sxc-sp k2">${SPRIG}</span><span class="sxc-sp k3">${SPRIG}</span><span class="sxc-sp k4">${SPRIG}</span>
    <div class="sxc-in">
      <p class="sxc-eye" data-elem-id="sx30">SAVE THE DATE</p>
      ${ORN}
      <p class="sxc-my"><span class="sxc-m" data-elem-id="sx31"></span> <span class="sxc-y" data-elem-id="sx32"></span></p>
      ${ORN}
      <div class="sxc-grid" id="sxcGrid" dir="ltr"></div>
      ${ORN}
      <p class="sxc-foot" data-elem-id="sx33">WE CAN’T WAIT TO<br>CELEBRATE WITH YOU</p>
      <div class="sxc-orn sxc-heart" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="#b98c55" stroke-width="1.6"/></svg><i></i></div>
    </div>
  </div>
</section>`;
const CAL_CSS = `
/* العد التنازلي — أرضية فاتحة وكتابة برجندي */
.count-sec{background:#f7f1ea!important;padding:46px 14px 40px!important;text-align:center}
.sxd-head{margin:0 0 6px;font:400 44px/1.15 'Pinyon Script',cursive;color:${BUR}}
.sxd-orn{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 auto 18px;width:220px}
.sxd-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b98c55)}.sxd-orn i:last-child{transform:scaleX(-1)}
.sxd-orn svg{width:30px;height:16px}
.count-sec .countdown{display:flex!important;justify-content:center;gap:0;max-width:380px;direction:ltr}
.count-sec .cd{position:relative;flex:1;background:none!important;border:0!important;box-shadow:none!important;padding:0!important}
.count-sec .cd + .cd::before{content:":";position:absolute;left:-5px;top:2px;font:500 40px/1 'Cormorant Garamond',serif;color:${BUR}}
.count-sec .cd .cn{font-variant-numeric:lining-nums tabular-nums!important;font:500 54px/1 'Cormorant Garamond',serif!important;color:${BUR}!important}
.count-sec .cd .cl{margin-top:12px!important;font:500 18px/1 'Cormorant Garamond',serif!important;letter-spacing:.02em!important;text-transform:none!important;color:#7c4a4f!important}
.count-sec .btn-ghost{color:${BUR}!important;border-color:rgba(107,29,41,.45)!important}

/* كارت Save the Date (تقويم الشهر) */
.sxc-sec{background:#f7f1ea;padding:6px 16px 48px}
.sxc-card{position:relative;max-width:380px;margin:0 auto;aspect-ratio:340/660;filter:drop-shadow(0 16px 26px rgba(70,25,30,.16))}
.sxc-frame{position:absolute;inset:0;width:100%;height:100%}
.sxc-sp{position:absolute;width:30%;aspect-ratio:1;pointer-events:none}
.sxc-sp svg{width:100%;height:100%}
.sxc-sp.k1{left:9.5%;top:6.4%}
.sxc-sp.k2{right:9.5%;top:6.4%;transform:scaleX(-1)}
.sxc-sp.k3{left:9.5%;bottom:6.4%;transform:scaleY(-1)}
.sxc-sp.k4{right:9.5%;bottom:6.4%;transform:scale(-1,-1)}
.sxc-in{position:absolute;left:12%;right:12%;top:19%;bottom:9%;justify-content:center;display:flex;flex-direction:column;align-items:center;text-align:center;color:${BUR}}
.sxc-eye{margin:0;font:500 clamp(15px,4.6vw,19px)/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.08em}
.sxc-orn{display:flex;align-items:center;justify-content:center;gap:8px;width:78%;margin:10px auto}
.sxc-orn i{flex:1;height:1px;background:#b98c55;position:relative}
.sxc-orn i::before{content:"";position:absolute;top:-2px;width:5px;height:5px;border-radius:50%;border:1px solid #b98c55;left:0}
.sxc-orn i:last-child::before{left:auto;right:0}
.sxc-orn svg{width:16px;height:16px;flex:none}
.sxc-my{margin:2px 0 0;white-space:nowrap;line-height:1}
.sxc-m{font:400 clamp(38px,11.5vw,56px)/1 'Pinyon Script',cursive;color:${BUR}}
.sxc-y{font-variant-numeric:lining-nums;font:500 clamp(27px,8.4vw,40px)/1 'Cormorant Garamond',serif;color:${BUR};margin-left:4px}
.sxc-grid{display:grid;grid-template-columns:repeat(7,1fr);width:100%;row-gap:clamp(2px,1vw,6px);margin-top:2px;font:500 clamp(15px,4.4vw,19px)/1.75 'Cormorant Garamond',serif;font-variant-numeric:lining-nums;color:#3b1a1e}
.sxc-grid b{font:500 clamp(10px,2.9vw,12.5px)/2 'Cinzel','Cormorant Garamond',serif;letter-spacing:.04em;color:${BUR}}
.sxc-grid span{position:relative;display:flex;align-items:center;justify-content:center}
.sxc-grid span.wd::before{content:"";position:absolute;width:2.3em;height:2.1em;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 22'%3E%3Cpath d='M12 20.4S2.6 14.6 1.5 8.6C.8 4.8 3.3 1.6 6.9 1.6c2.2 0 3.9 1.2 5.1 3 1.2-1.8 2.9-3 5.1-3 3.6 0 6.1 3.2 5.4 7-1.1 6-10.5 11.8-10.5 11.8z' fill='none' stroke='%23b98c55' stroke-width='1.4'/%3E%3C/svg%3E") center/contain no-repeat}
.sxc-foot{margin:0;font:500 clamp(12px,3.6vw,15px)/1.45 'Cinzel','Cormorant Garamond',serif;letter-spacing:.06em;color:${BUR}}
.sxc-heart{width:52%;margin-top:8px}.sxc-heart i::before{display:none}
`;
const COUNT_HEAD = `<p class="sxd-head" data-elem-id="sx29">The celebration begins.</p>
    <div class="sxd-orn" aria-hidden="true"><i></i><svg viewBox="0 0 40 20"><path d="M20 3c3 4 3 10 0 14-3-4-3-10 0-14zM20 10c4-4 10-4 14 0-4 4-10 4-14 0zM20 10c-4-4-10-4-14 0 4 4 10 4 14 0z" fill="none" stroke="#b98c55" stroke-width="1.2"/></svg><i></i></div>
    `;

// ===== رابع تعديل: برجندي بدل الأخضر + المواعيد + مكانين بصورهم + Our love story =====
const CHURCH = asset('/custom/sXSBxjs/church.webp');
const HOTEL = asset('/custom/sXSBxjs/hotel.webp');
const COUPLE = asset('/custom/sXSBxjs/couple.webp');
const CHURCH_MAP = 'https://maps.app.goo.gl/yzFxLJwYCa1Du8kK7?g_st=ic';
const HOTEL_MAP = 'https://maps.app.goo.gl/sNG2VyrC5vFGNMnt8?g_st=ic';
const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const place = (kind, idK, idN, name, img, href, idB) => `<div class="sxv-place reveal">
      <div class="sxv-kind" data-elem-id="${idK}">${kind}</div>
      <div class="sxv-name" data-elem-id="${idN}">${name}</div>
      <a class="sxv-photo" href="${href}" target="_blank" rel="noopener" aria-label="${name} — Google Maps"><img src="${img}" alt="${name}" loading="lazy"><span class="sxv-tag">${PIN}</span></a>
      <a class="btn btn-sage sxv-btn" href="${href}" target="_blank" rel="noopener">${PIN}<span data-elem-id="${idB}">Open in Google Maps</span></a>
    </div>`;
const VENUE = `<section class="venue-sec" id="venue" data-section="venue">
    <div class="eyebrow reveal" data-elem-id="sx50">Join us at</div>
    <div class="h-script reveal d1" data-elem-id="sx51">Locations</div>
    ${place('Church', 'sx52', 'sx53', 'St. Mary Church — East Abbasia', CHURCH, CHURCH_MAP, 'sx54')}
    <div class="sxv-sep" aria-hidden="true"><i></i><b></b><i></i></div>
    ${place('Venue', 'sx55', 'sx56', 'The Guard Hotel — La Luna', HOTEL, HOTEL_MAP, 'sx57')}
    <iframe id="sgMap" hidden title="map"></iframe><a id="mapBtn" hidden></a>
  </section>`;
const LOVE = `<figure class="sxl-photo reveal"><img src="${COUPLE}" alt="" loading="lazy"></figure>
    <div class="h-script reveal d1" data-elem-id="sx60">Our love story</div>
    <p class="sxl-text reveal d2" data-elem-id="sx61">What began as childhood memories blossomed into a love so true.<br>From being little neighbors to saying “I do”.</p>`;
const MORE_CSS = `
/* الأخضر → برجندي في الدعوة كلها */
:root{--sage:#8a3a46;--sage-d:#6b1d29;--sage-dd:#5a1822;--sage-l:#e3c3c6;--sage-ll:#f4e7e6}
.btn-sage{box-shadow:0 14px 28px -14px rgba(107,29,41,.75)!important}
.rec-btn{background:radial-gradient(circle at 30% 30%,#a4474b,#6b1d29)!important;box-shadow:0 16px 30px -14px rgba(107,29,41,.85)!important}
.rec.on .rec-btn{background:radial-gradient(circle at 30% 30%,#c46a5c,#8f2f34)!important}
/* ورق الورد اللي بيقع: ورد وبرجندي فاتح بدل الأخضر */
.petal{filter:hue-rotate(250deg) saturate(1.5)}
.tl .ic{color:${BUR}!important;border-color:rgba(107,29,41,.45)!important}
.timeline::before{background:linear-gradient(rgba(107,29,41,.25),rgba(107,29,41,.55))!important}
.tl .t{color:${BUR}!important}
/* الزي وتأكيد الحضور اتشالوا */
#dress,#rsvp{display:none!important}
/* المكانين */
.sxv-place{max-width:380px;margin:22px auto 0;text-align:center}
.sxv-kind{font-family:'Cinzel','Cormorant Garamond',serif;font-size:13px;letter-spacing:.32em;text-transform:uppercase;color:#a07a4a}
.sxv-name{margin:6px 0 14px;font:600 26px/1.25 'Cormorant Garamond',serif;color:${BUR}}
.sxv-photo{position:relative;display:block;border-radius:14px;overflow:hidden;padding:6px;background:#fff;
  box-shadow:0 0 0 1px rgba(107,29,41,.25),0 18px 34px -18px rgba(70,25,30,.6)}
.sxv-photo img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:9px;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.sxv-photo:hover img{transform:scale(1.03)}
.sxv-tag{position:absolute;right:16px;bottom:16px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:${BUR};color:#fbf3ec;box-shadow:0 8px 16px -8px rgba(0,0,0,.6)}
.sxv-tag svg{width:20px;height:20px}
.sxv-btn{margin-top:16px;display:inline-flex;align-items:center;gap:8px}
.sxv-btn svg{width:18px;height:18px}
.sxv-sep{display:flex;align-items:center;justify-content:center;gap:10px;width:200px;margin:34px auto 6px}
.sxv-sep i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b98c55)}.sxv-sep i:last-child{transform:scaleX(-1)}
.sxv-sep b{width:7px;height:7px;border:1px solid #b98c55;transform:rotate(45deg)}
/* Our love story — آخر صفحة */
.closing{background:linear-gradient(180deg,#f7f1ea,#f1e1de)!important}
.sxl-photo{margin:0 auto;max-width:300px;padding:8px;background:#fff;border-radius:160px 160px 14px 14px;
  box-shadow:0 0 0 1px rgba(107,29,41,.28),0 24px 40px -22px rgba(70,25,30,.7)}
.sxl-photo img{display:block;width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:152px 152px 9px 9px}
.sxl-text{max-width:330px;margin:10px auto 0;font:italic 500 21px/1.55 'Cormorant Garamond',serif;color:${BUR};text-align:center}
`;

const PATCHES = [
  ['    <div class="countdown">\n', `    ${COUNT_HEAD}<div class="countdown">\n`],
  ['  <!-- ============ برنامج اليوم ============ -->\n', `  ${CAL}\n\n  <!-- ============ برنامج اليوم ============ -->\n`],
  ['    <div class="collage" id="collage">\n', `    <div class="collage" id="collage">\n      ${COLLAGE}\n`],
  ['<div class="cover" id="coverScreen">\n', `<div class="cover" id="coverScreen">\n  ${COVER}`],
  ['  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود', `${LOGIC}\n  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود`],
];

module.exports = {
  shortId: 'sXSBxjs',

  render() {
    return {
      head: `<link rel="preload" as="image" href="${TOP}"><link rel="preload" as="image" href="${BOTTOM}"><link rel="preload" as="image" href="${SEAL}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cinzel:wght@500&family=Cormorant+Garamond:wght@500;600&display=swap"><style id="sx-style">${CSS}${CAL_CSS}${MORE_CSS}</style>`,
    };
  },

  transform(html) {
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    let out = html;
    // قسم المكان كله بيتبدّل (مكانين بصورهم) — ولو مالقيناهوش الصفحة زي ما هي
    const vs = out.indexOf('<section class="venue-sec" id="venue"');
    const ve = vs < 0 ? -1 : out.indexOf('</section>', vs);
    if (vs < 0 || ve < 0) { console.error('[custom sXSBxjs] venue section not found'); return html; }
    out = out.slice(0, vs) + VENUE + out.slice(ve + '</section>'.length);
    // الختام: صورة العروسين مكان طبق الدبل، و"Our love story" مكان الجملة
    const PLATE = '<img class="plate reveal" src="/templates/sage-garden/c-rings-plate.webp" alt="">';
    const ps = out.indexOf(PLATE);
    const pe = ps < 0 ? -1 : out.indexOf('</div>', out.indexOf('data-elem-id="sg82"', ps));
    if (ps < 0 || pe < 0) { console.error('[custom sXSBxjs] closing not found'); return html; }
    out = out.slice(0, ps) + LOVE + out.slice(pe + '</div>'.length);
    for (const [find, repl] of PATCHES) {
      const f = find.replace(/\n/g, nl);
      if (out.split(f).length !== 2) {
        console.error('[custom sXSBxjs] template changed — showing the normal cover');
        return html;
      }
      out = out.replace(f, () => repl.replace(/\n/g, nl));
    }
    return out;
  },
};
