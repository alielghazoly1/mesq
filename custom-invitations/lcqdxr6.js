// دعوة lcqdxr6 (Sage Garden) — Imène & Hassan (إيمان وحسن)، السبت 10 أبريل 2027، Dar El Bahri —
// Tonnara، كاب زبيب، تونس. بطلب المالك (2026-11-06): النسخة الفرنساوي الكاملة (العربي هتبقى
// على لينك تاني). اتبنت على نسخة sXSBxjs (ماجد ورنا — اتنسخت هنا 2026-11-05) واتغيّر فيها:
//   - الختم اللي برّه برجندي بلون الدعوة جوه وعليه I&H (seal.webp — من ختم MR نفسه: الحروف
//     اتمسحت، أرضية جديدة، حروف Cinzel محفورة بنفس الإضاءة، وبعدين اتلوّن برجندي)
//   - كل الكلام فرنساوي — حتى المرسوم جوه صور الكولاج (SAVE THE DATE / The Details / CLICK TO
//     RSVP / Rsvp CLICK HERE / Our Story): اتمسح من الصور (LaMa) واتكتب فوقها نص حقيقي بيتعدّل
//   - صور ماجد ورنا اتشالت: البولارويد فيه صورة القوس بتاعة القالب (p-venue)، الكتاب من غير
//     صورهم، والختام رجع طبق الدبل بتاع القالب. الكنيسة والفندق وملاحظة الأطفال اتشالوا
//   - كارت الدعوة بكلام العيلتين بعد الكولاج، البرنامج 5 مواعيد، المكان بالخريطة (القسم
//     الأصلي بتاع القالب)، و"ممنوع التصوير" مكان الدريس كود
//   - العدّاد و"أضف للتقويم" بتوقيت تونس (UTC+1) مش مصر
// البيانات (الأسامي والتاريخ والمكان والخريطة، ورفع صور الضيوف مقفول): oneOffFix
// lcqdxr6-imene-hassan. لو القالب اتغيّر ومالقيناش الحتت → الصفحة العادية.
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'lcqdxr6';
const DIR = `/custom/${SHORT}/`;
const TOP = asset(`${DIR}top.webp`);
const BOTTOM = asset(`${DIR}bottom.webp`);
const SEAL = asset(`${DIR}seal.webp`);
const BUR = '#6b1d29';

// ===== الكولاج (قطع صورة التصميم في نفس أماكنها — lcqdxr6-pieces.json) =====
const PIECES = require('./lcqdxr6-pieces.json');
const C = (n) => asset(`${DIR}c/${n}.webp`);
const CH = 1404;
const SWAY = { bq1: '70% 30%', bq2: '30% 20%', calla: '50% 0%', gyp: '90% 80%', bq3: '50% 0%' };
// كلام فوق القطع — بإحداثيات الصورة الأصلية (بتتحوّل لمكانها جوه القطعة). ih1–ih7 مكان
// الكلام الإنجليزي اللي كان مرسوم في الصور (نفس المكان والميل اللي اتقاسوا من الصور).
const TEXTS = {
  env: [['sx10', 'mono', 413, 318, 'IH']],
  card: [
    ['sx11', 'inv', 277, 432, 'VOUS ÊTES INVITÉS<br>AU MARIAGE DE'],
    ['sx12', 'nm1', 277, 500, '', 'groom'],
    ['sx13', 'nm2', 277, 557, '', 'bride'],
    ['sx14', 'cdt', 277, 636, '', 'dateUp'],
    ['sx15', 'cdt', 277, 652, '', 'cityUp'],
  ],
  pola: [['sx16', 'cap', 522, 561, '', 'pair']],
  std: [
    ['ih1', 'se', 545, 713, 'RÉSERVEZ LA DATE'],
    ['sx17', 'sd', 548, 782, '', 'day'],
    ['sx18', 'sm', 548, 826, '', 'monthUp'],
    ['sx19', 'sd', 548, 873, '', 'year'],
    ['sx20', 'st', 548, 918, '', 't0'],
    ['sx21', 'sv', 548, 944, '', 'hallUp'],
    ['sx22', 'sv', 548, 960, '', 'cityUp'],
  ],
  plate: [['ih2', 'pl', 288, 868, 'Le<br>programme'], ['ih3', 'plc', 299, 920, 'CLIQUEZ ICI']],
  story: [['ih6', 'bk', 247, 1126, 'Notre<br>histoire'], ['ih7', 'bkc', 251, 1205, 'DÉCOUVRIR']],
  renv: [['ih5', 'rv', 519, 1178, 'RÉPONDEZ ICI']],
  rcard: [['ih4', 'rc', 443, 1275, 'CLIQUEZ ICI']],
};
const pieceHtml = (p) => {
  const cls = ['pc', 'sxp', `sxp-${p.n}`, p.go ? 'tap' : '', SWAY[p.n] ? 'sway' : ''].filter(Boolean).join(' ');
  const style = `--x:${p.x};--y:${p.y};--w:${p.w};--h:${p.h};--fx:${p.fx}px;--fy:${p.fy}px;--fr:${p.fr}deg;--d:${p.d}s${SWAY[p.n] ? `;--o:${SWAY[p.n]}` : ''}`;
  return `<div class="${cls}"${p.go ? ` data-go="${p.go}"` : ''} style="${style}"><img src="${C(p.n)}" alt="" draggable="false"></div>`;
};
// طبقة الكلام: نفس مقاس ومكان وحركة القطعة بتاعتها، بس فوق كل القطع (عشان الورد مايغطّيش الكلام)
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
/* ===== الكولاج ===== */
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
/* الكلام اللي كان مرسوم في الصور — نفس اللون والمقاس والميل */
.sxt-se{font:500 calc(13.5*var(--u))/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.1em;color:#2b2522}
.sxt-pl{font:400 calc(23*var(--u))/1.05 'Pinyon Script',cursive;color:#7d2a37;rotate:1.3deg}
.sxt-plc{font:500 calc(9.5*var(--u))/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.14em;color:#7d2a37;rotate:1.3deg}
.sxt-bk{font:400 calc(31*var(--u))/1.08 'Pinyon Script',cursive;color:#ead7c1;text-shadow:0 1px 2px rgba(30,0,8,.45)}
.sxt-bkc{font:500 calc(8.5*var(--u))/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.14em;color:#e2ccb3}
.sxt-rv{font:500 calc(12.5*var(--u))/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.12em;color:#efd9cf;rotate:5.9deg;text-shadow:0 1px 1px rgba(40,0,10,.35)}
.sxt-rc{font:500 calc(8*var(--u))/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.12em;color:#8d846f}
/* المونوجرام على الظرف الزيتي: IH جوه إكليل بيضاوي رفيع */
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
  filter:drop-shadow(0 7px 9px rgba(60,10,20,.38)) drop-shadow(0 2px 2px rgba(60,10,20,.3))}
.sx-seal img{display:block;width:100%;height:100%;animation:sxBreathe 2.6s ease-in-out infinite}
@keyframes sxBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
.sx-seal::before{content:"";position:absolute;inset:-12%;border-radius:50%;border:1.5px solid rgba(107,29,41,.4);animation:sxRing 2.6s ease-out infinite}
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

const COVER = `<div class="sx-env" id="sx-env" role="button" tabindex="0" aria-label="Touchez le sceau pour ouvrir">
    <div class="sx-half sx-top"></div>
    <div class="sx-half sx-bot"></div>
    <div class="sx-seal"><img src="${SEAL}" alt="" fetchpriority="high"></div>
    <div class="sx-hint"><span><i></i><b data-elem-id="sx1">Touchez pour ouvrir</b><i></i></span></div>
  </div>
`;

// ===== الزخارف المشتركة (غصن الأركان + الفاصل) =====
const _leaves = (pts) => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="2.4" transform="rotate(${r} ${x} ${y})"/>`).join('');
// غصن ركنة (للركن الشمال فوق) — فرعين ماشيين مع الحافتين، ورق دهبي وتوت برجندي؛ بيتقلب للأركان التانية
const SPRIG = `<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#b98c55" stroke-width="1.2" stroke-linecap="round">
  <path d="M6 6 C40 10 76 16 116 34"/><path d="M6 6 C10 40 16 76 34 116"/><path d="M40 12 C50 22 54 30 54 40"/><path d="M12 40 C22 50 30 54 40 54"/></g>
  <g fill="#c9a26b">${_leaves([[20,10,-25],[22,4,20],[34,13,-20],[36,7,25],[50,16,-15],[52,10,28],[66,20,-12],[68,14,30],[82,26,-8],[84,20,32],[98,31,0],[100,25,36],
    [10,20,-65],[4,22,-110],[13,34,-70],[7,36,-115],[16,50,-75],[10,52,-118],[20,66,-78],[14,68,-120],[26,82,-82],[20,84,-122],[31,98,-90],[25,100,-126],[48,26,60],[52,34,80],[26,48,30],[34,52,10]])}</g>
  <g fill="${BUR}">${[[112,34,3],[106,38,2.3],[116,28,2.2],[34,112,3],[38,106,2.3],[28,116,2.2],[56,42,2.6],[42,56,2.6],[60,46,2],[46,60,2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g></svg>`;
const ORN = `<div class="sxc-orn" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.6L21 7l-4.8 5L21 17l-6.8-1.6L12 22l-2.2-6.6L3 17l4.8-5L3 7l6.8 1.6z" fill="#b98c55"/></svg><i></i></div>`;
const CORNERS = `<span class="sxc-sp k1">${SPRIG}</span><span class="sxc-sp k2">${SPRIG}</span><span class="sxc-sp k3">${SPRIG}</span><span class="sxc-sp k4">${SPRIG}</span>`;

// ===== كارت الدعوة: كلام العيلتين زي ما العرسان كاتبينه (بعد الكولاج) =====
const LETTER = `<section class="ihl-sec" id="ihLetter" aria-label="Invitation">
    <div class="ihl-card reveal">
      ${CORNERS}
      <p class="ihl-bas" data-elem-id="ih9" lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p class="ihl-q" data-elem-id="ih10">Notre bonheur ne serait pas complet sans votre présence.</p>
      ${ORN}
      <p class="ihl-p" data-elem-id="ih11">Les familles Ben Ghorbel et Ettaieb ont l’honneur et la joie de vous inviter au mariage de leurs enfants</p>
      <p class="ihl-nm"><span data-k="groom" data-elem-id="ih12"></span><span class="amp">&amp;</span><span data-k="bride" data-elem-id="ih13"></span></p>
      <p class="ihl-p" data-elem-id="ih14">afin de partager avec vous ce jour exceptionnel et de célébrer ensemble un moment inoubliable.</p>
      ${ORN}
      <p class="ihl-d" data-k="dateLong" data-elem-id="ih15"></p>
      ${ORN}
      <p class="ihl-p" data-elem-id="ih16">Entourés de leurs familles et de leurs proches, ils seront heureux de partager avec vous cette journée remplie d’amour et de bonheur.</p>
      <p class="ihl-s" data-elem-id="ih17">Votre présence sera leur plus beau cadeau.</p>
    </div>
  </section>`;

// ===== العد التنازلي بستايل الدعوة + كارت "Réservez la date" (تقويم الشهر) تحته =====
const CAL = `<section class="sxc-sec" id="sxCal" aria-label="Réservez la date">
  <div class="sxc-card reveal">
    <svg class="sxc-frame" viewBox="0 0 340 660" preserveAspectRatio="none" aria-hidden="true">
      <path d="M24 46 Q24 26 46 26 H140 Q160 26 170 8 Q180 26 200 26 H294 Q316 26 316 46 V614 Q316 634 294 634 H200 Q180 634 170 652 Q160 634 140 634 H46 Q24 634 24 614 Z" fill="#f7efe6" stroke="${BUR}" stroke-width="3" vector-effect="non-scaling-stroke"/>
      <path d="M33 52 Q33 35 52 35 H143 Q161 35 170 20 Q179 35 197 35 H288 Q307 35 307 52 V608 Q307 625 288 625 H197 Q179 625 170 640 Q161 625 143 625 H52 Q33 625 33 608 Z" fill="none" stroke="#b98c55" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
    </svg>
    ${CORNERS}
    <div class="sxc-in">
      <p class="sxc-eye" data-elem-id="sx30">RÉSERVEZ LA DATE</p>
      ${ORN}
      <p class="sxc-my"><span class="sxc-m" data-elem-id="sx31"></span> <span class="sxc-y" data-elem-id="sx32"></span></p>
      ${ORN}
      <div class="sxc-grid" id="sxcGrid" dir="ltr"></div>
      ${ORN}
      <p class="sxc-foot" data-elem-id="sx33">NOUS AVONS HÂTE DE<br>CÉLÉBRER AVEC VOUS</p>
      <div class="sxc-orn sxc-heart" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="#b98c55" stroke-width="1.6"/></svg><i></i></div>
    </div>
  </div>
</section>`;
const COUNT_HEAD = `<p class="sxd-head" data-elem-id="sx29">Le grand jour approche</p>
    <div class="sxd-orn" aria-hidden="true"><i></i><svg viewBox="0 0 40 20"><path d="M20 3c3 4 3 10 0 14-3-4-3-10 0-14zM20 10c4-4 10-4 14 0-4 4-10 4-14 0zM20 10c-4-4-10-4-14 0 4 4 10 4 14 0z" fill="none" stroke="#b98c55" stroke-width="1.2"/></svg><i></i></div>
    `;

// ===== برنامج اليوم: الصف الخامس (نهاية الحفل) بنفس شكل صفوف القالب =====
const ICON = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ARCH = ICON('<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M9 21v-7.5a3 3 0 0 1 6 0V21"/><path d="M3 21h18"/>');
const MOON = ICON('<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/><path d="M17 3.5v3M15.5 5h3"/>');
const ROW5 = `      <div class="tl reveal d3"><span class="t" data-elem-id="ih20"></span><span class="ic">${MOON}</span><span class="n" data-elem-id="ih21"></span></div>\n`;

// ===== "Mariage déconnecté" مكان الدريس كود (كلام العرسان — 2026-11-06) =====
const NOPHOTO = `<section class="ihn-sec" id="ihNoPhoto" aria-label="Mariage déconnecté">
    <div class="ihn-card reveal">
      <span class="ihn-ic">${ICON('<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10.5 18.5h3"/><path d="M3 3l18 18"/>')}</span>
      <div class="ihn-k" data-elem-id="ih33">🤍 MARIAGE DÉCONNECTÉ 🤍</div>
      <div class="ihn-t" data-elem-id="ih30">Un mariage, de l’amour et de beaux moments à partager…</div>
      <p class="ihn-p" data-elem-id="ih31">Si le cœur vous en dit, laissez vos téléphones de côté et profitez pleinement de l’instant présent avec nous !</p>
      <div class="ihn-s" data-elem-id="ih32">Notre photographe se chargera d’immortaliser ces précieux souvenirs. ❤️</div>
    </div>
  </section>`;

// ===== تأكيد الحضور: عدد الأشخاص (بيظهر لما الضيف يختار Oui، وبيوصل للوحة في أول الرسالة) =====
const COUNT_FIELD = `<div class="field ih-cnt" id="ihCount" hidden><span class="lab" data-elem-id="ih60">Nombre de personnes</span><div class="ih-step"><button type="button" data-d="-1" aria-label="Moins">−</button><span id="ihCountV">1</span><button type="button" data-d="1" aria-label="Plus">+</button></div></div>
        `;

// ===== ألبوم "Notre histoire" آخر الدعوة (صور العرسان — 2026-11-06) =====
// 52 صورة (custom/lcqdxr6/album/NN.webp + مصغّرة tNN.webp، المقاسات في lcqdxr6-album.json).
// أول 12 ظاهرين و"Voir toutes les photos" بيظهر الباقي (بيتحمّلوا ساعتها بس)، والضغط على
// صورة بيفتحها كبيرة (أسهم/سحب/Esc). كتاب "Notre histoire" في الكولاج بيودّي هنا.
const ALBUM_ITEMS = require('./lcqdxr6-album.json');
const ALBUM_SHOW = 12;
const ALBUM_FULL = ALBUM_ITEMS.map((p) => asset(`${DIR}album/${p.n}.webp`));
const ALBUM = `<section class="iha-sec" id="ihAlbum" aria-label="Notre histoire">
    <div class="eyebrow reveal" data-elem-id="ih50">Nos souvenirs</div>
    <div class="h-script reveal d1" data-elem-id="ih51">Notre histoire</div>
    <div class="iha-grid" id="ihaGrid">
      ${ALBUM_ITEMS.map((p, i) => {
    const t = asset(`${DIR}album/t${p.n}.webp`);
    return `<button type="button" class="iha-it${i >= ALBUM_SHOW ? ' iha-rest' : ''}" data-i="${i}" aria-label="Photo ${i + 1}"><img ${i < ALBUM_SHOW ? `src="${t}" loading="lazy"` : `data-src="${t}"`} decoding="async" alt=""></button>`;
  }).join('\n      ')}
    </div>
    <div class="iha-btn" role="button" tabindex="0" id="ihaMore"><span data-elem-id="ih52">Voir toutes les photos</span><b>${ALBUM_ITEMS.length}</b></div>
  </section>`;
const ALBUM_CSS = `
/* ألبوم الصور */
.closing{padding-bottom:36px!important}
.iha-sec{background:linear-gradient(180deg,#f1e1de,#f7f1ea);padding:24px 14px 110px;text-align:center}
.iha-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:420px;margin:26px auto 0}
.iha-it{position:relative;display:block;width:100%;aspect-ratio:3/4;padding:5px;border:0;border-radius:3px;background:#fff;cursor:zoom-in;
  box-shadow:0 10px 22px -14px rgba(70,25,30,.55);-webkit-tap-highlight-color:transparent}
.iha-it img{display:block;width:100%;height:100%;object-fit:cover;background:#efe4e0}
.iha-it:nth-child(4n+1){rotate:-1.2deg}.iha-it:nth-child(4n+2){rotate:.9deg}.iha-it:nth-child(4n+3){rotate:.8deg}.iha-it:nth-child(4n){rotate:-.9deg}
.iha-rest{display:none}
.iha-grid.all .iha-rest{display:block}
.iha-btn{display:inline-flex;align-items:center;gap:10px;margin-top:26px;padding:13px 22px;border:1px solid rgba(107,29,41,.45);background:#fffdf9;color:${BUR};
  font:500 12px/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
.iha-btn b{min-width:26px;padding:5px 7px;border-radius:999px;background:${BUR};color:#fbf3ec;font:600 12px/1 'Cormorant Garamond',serif;letter-spacing:0}
.iha-lb{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(22,6,10,.94);opacity:0;transition:opacity .25s ease}
.iha-lb.on{opacity:1}
.iha-lb[hidden]{display:none!important}
.iha-lb img{max-width:100vw;max-height:86vh;object-fit:contain;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.iha-x{position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font:300 30px/44px Arial,sans-serif;cursor:pointer}
.iha-nav{position:absolute;top:50%;translate:0 -50%;width:44px;height:64px;border:0;background:rgba(255,255,255,.12);color:#fff;font:300 40px/1 Arial,sans-serif;cursor:pointer}
.iha-prev{left:6px;border-radius:0 8px 8px 0}.iha-next{right:6px;border-radius:8px 0 0 8px}
.iha-n{position:absolute;bottom:calc(16px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;color:#f3e2d6;font:500 13px/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.2em}
`;

// ===== زرار اللغة + الخطوط العربي (html.ih-ar) =====
const AR_CSS = `
#stage{transition:opacity .22s ease}
html.ih-swap #stage{opacity:0}
.ih-lang{position:fixed;top:calc(12px + env(safe-area-inset-top));right:max(12px,calc(50vw - 218px));z-index:2147482000;display:inline-flex;align-items:center;gap:7px;
  padding:9px 15px 9px 12px;border-radius:999px;border:1px solid rgba(185,140,85,.75);background:rgba(251,246,239,.93);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:${BUR};box-shadow:0 10px 24px -12px rgba(70,25,30,.6);
  font:600 16px/1 'El Messiri','Amiri',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;
  opacity:0;transform:translateY(-10px);pointer-events:none;transition:opacity .5s ease,transform .5s ease}
.ih-lang.on{opacity:1;transform:none;pointer-events:auto}
.ih-lang.wait{opacity:.6}
.ih-lang svg{width:17px;height:17px;flex:none}
.ih-lang[data-to="fr"]{font:500 13px/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.06em}
.ihl-bas{display:none;margin:0 auto 14px;font:700 clamp(21px,6.2vw,25px)/1.6 'Amiri',serif;color:${BUR}}
.ih-step{direction:ltr}

/* ===== النسخة العربي ===== */
html.ih-ar{--serif:'Amiri',serif;--script:'Aref Ruqaa',serif;--sans:'El Messiri',sans-serif}
html.ih-ar body :not(#ih_):not(#ih__){letter-spacing:0!important}
html.ih-ar .ihl-bas{display:block}
/* الكولاج */
html.ih-ar .sxt-inv{font:600 calc(13*var(--u))/1.65 'El Messiri',sans-serif}
html.ih-ar .sxt-nm1,html.ih-ar .sxt-nm2{font:700 calc(44*var(--u))/1.45 'Aref Ruqaa',serif}
html.ih-ar .sxt-nm1::after{content:" و"}
html.ih-ar .sxt-cdt{font:600 calc(12.5*var(--u))/1.5 'El Messiri',sans-serif}
html.ih-ar .sxt-cap{font:700 calc(15*var(--u))/1.3 'Aref Ruqaa',serif}
html.ih-ar .sxt-sm{font:700 calc(38*var(--u))/1.35 'Aref Ruqaa',serif}
html.ih-ar .sxt-sv{font:700 calc(12.5*var(--u))/1.4 'Amiri',serif}
html.ih-ar .sxt-se{font:600 calc(16*var(--u))/1.4 'El Messiri',sans-serif}
html.ih-ar .sxt-pl{font:700 calc(24*var(--u))/1.4 'Aref Ruqaa',serif}
html.ih-ar .sxt-plc,html.ih-ar .sxt-rc,html.ih-ar .sxt-bkc{font-family:'El Messiri',sans-serif;font-weight:600;font-size:calc(10.5*var(--u));line-height:1.4}
html.ih-ar .sxt-rv{font:600 calc(14*var(--u))/1.4 'El Messiri',sans-serif}
html.ih-ar .sxt-bk{font:700 calc(36*var(--u))/1.35 'Aref Ruqaa',serif}
html.ih-ar .sx-hint{font:600 17px/1.5 'El Messiri',sans-serif}
/* كارت الدعوة */
html.ih-ar .ihl-q{font:400 22px/1.75 'Amiri',serif}
html.ih-ar .ihl-p{font:400 19px/1.95 'Amiri',serif}
html.ih-ar .ihl-nm{font:700 clamp(34px,10vw,44px)/1.55 'Aref Ruqaa',serif}
html.ih-ar .ihl-nm .amp{font:700 .72em/1 'Aref Ruqaa',serif;margin:0 .2em;vertical-align:0}
html.ih-ar .ihl-d{font:600 17px/1.6 'El Messiri',sans-serif}
html.ih-ar .ihl-s{font:700 27px/1.6 'Aref Ruqaa',serif}
/* العدّاد والتقويم */
html.ih-ar .sxd-head{font:700 40px/1.45 'Aref Ruqaa',serif}
html.ih-ar .count-sec .countdown{direction:rtl!important}
html.ih-ar .count-sec .cd + .cd::before{left:auto;right:-5px}
html.ih-ar .count-sec .cd .cl{font:400 19px/1.2 'Amiri',serif!important}
html.ih-ar .count-sec .btn-ghost{font-family:'El Messiri',sans-serif!important}
html.ih-ar .sxc-eye{font:600 clamp(17px,5vw,21px)/1.4 'El Messiri',sans-serif}
html.ih-ar .sxc-m{font:700 clamp(36px,11vw,52px)/1.35 'Aref Ruqaa',serif}
html.ih-ar .sxc-y{margin-left:0;margin-right:4px}
html.ih-ar .sxc-grid b{font:600 clamp(10px,2.9vw,12.5px)/2 'El Messiri',sans-serif}
html.ih-ar .sxc-foot{font:600 clamp(13px,3.9vw,16px)/1.7 'El Messiri',sans-serif}
/* عناوين القالب والبرنامج والمكان */
html.ih-ar .eyebrow{font-family:'El Messiri',sans-serif;font-size:14px;font-weight:600}
html.ih-ar .h-script{font-family:'Aref Ruqaa',serif;font-weight:700;line-height:1.5}
html.ih-ar .tl .n{font:600 15px/1.5 'El Messiri',sans-serif}
html.ih-ar .venue-name{font:700 30px/1.5 'Amiri',serif}
html.ih-ar .venue-addr{font:500 15px/1.5 'El Messiri',sans-serif}
/* زفاف بلا هواتف */
html.ih-ar .ihn-k{font:600 17px/1.6 'El Messiri',sans-serif}
html.ih-ar .ihn-t{font:400 21px/1.8 'Amiri',serif}
html.ih-ar .ihn-p{font:400 19px/1.9 'Amiri',serif}
html.ih-ar .ihn-s{font:400 19px/1.85 'Amiri',serif}
/* تأكيد الحضور والتهاني */
html.ih-ar .rsvp-card .by{font:400 18px/1.75 'Amiri',serif!important}
html.ih-ar .rsvp-card .field .lab{font:600 13px/1.5 'El Messiri',sans-serif!important}
html.ih-ar .rsvp-card .field input,html.ih-ar .rsvp-card .field textarea{font-family:'Amiri',serif!important}
html.ih-ar .rsvp-card .choice [role=radio]{font-family:'Amiri',serif!important;font-size:clamp(15px,4.3vw,18px)!important}
html.ih-ar .rsvp-card .btn,html.ih-ar .ex-card .btn{font-family:'El Messiri',sans-serif!important;font-size:15px!important}
html.ih-ar .rsvp-done p{font-family:'Amiri',serif!important;font-size:18px!important}
html.ih-ar .ex-card h4{font-family:'Amiri',serif;font-weight:700}
html.ih-ar .ex-card p,html.ih-ar .rec-time{font-family:'Amiri',serif}
/* الختام والألبوم */
html.ih-ar .ihc-p{font:400 20px/1.85 'Amiri',serif}
html.ih-ar .closing .c-names{font-family:'Aref Ruqaa',serif;font-weight:700}
html.ih-ar .closing .foot{font:600 14px/1.5 'El Messiri',sans-serif}
html.ih-ar .iha-btn{font:600 15px/1 'El Messiri',sans-serif}
`;

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

/* كارت Réservez la date (تقويم الشهر) */
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
#dress{display:none!important}
.venue-sec{background:#fbf6ef}
.venue-name{color:${BUR}}
.closing{background:linear-gradient(180deg,#f7f1ea,#f1e1de)!important}
.ihc-p{max-width:300px;margin:0 auto;font:italic 500 20px/1.5 'Cormorant Garamond',serif;color:${BUR}}

/* كارت الدعوة (كلام العيلتين) */
.ihl-sec{background:#f7f1ea;padding:54px 16px 26px}
.ihl-card{position:relative;max-width:400px;margin:0 auto;padding:70px 26px 60px;background:#fbf6ef;text-align:center;
  border:1.5px solid ${BUR};box-shadow:0 18px 34px -22px rgba(70,25,30,.45)}
.ihl-card::before{content:"";position:absolute;inset:7px;border:1px solid #b98c55;pointer-events:none}
.ihl-card .sxc-sp{width:21%}
.ihl-card .sxc-sp.k1{left:12px;top:12px}.ihl-card .sxc-sp.k2{right:12px;top:12px}
.ihl-card .sxc-sp.k3{left:12px;bottom:12px}.ihl-card .sxc-sp.k4{right:12px;bottom:12px}
.ihl-card .sxc-orn{width:62%;margin:18px auto}
.ihl-q{max-width:270px;margin:0 auto;font:italic 500 21px/1.45 'Cormorant Garamond',serif;color:${BUR}}
.ihl-p{max-width:320px;margin:0 auto;font:500 18px/1.6 'Cormorant Garamond',serif;color:#3b1a1e}
.ihl-nm{margin:12px 0 8px;font:400 clamp(36px,11vw,48px)/1.15 'Pinyon Script',cursive;color:${BUR};white-space:nowrap}
.ihl-nm .amp{font:italic 500 .6em/1 'Cormorant Garamond',serif;color:#b98c55;margin:0 .22em;vertical-align:.12em}
.ihl-d{margin:0;font:500 15px/1.4 'Cinzel','Cormorant Garamond',serif;letter-spacing:.12em;color:${BUR};text-transform:uppercase}
.ihl-s{margin:16px auto 0;max-width:280px;font:400 29px/1.25 'Pinyon Script',cursive;color:#9a6b3e}

/* ممنوع التصوير */
.ihn-sec{background:#f7f1ea;padding:24px 16px 50px}
.ihn-card{max-width:380px;margin:0 auto;padding:32px 24px 30px;border-radius:18px;text-align:center;
  background:linear-gradient(160deg,#7a2430,#5a1822);box-shadow:0 22px 40px -22px rgba(70,20,25,.75)}
.ihn-ic{width:54px;height:54px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;color:#e9cf9f;border:1px solid rgba(233,207,159,.55)}
.ihn-ic svg{width:26px;height:26px}
.ihn-k{font:500 15px/1.4 'Cinzel','Cormorant Garamond',serif;letter-spacing:.14em;color:#f6e7dc}
.ihn-t{max-width:300px;margin:12px auto 0;font:italic 500 21px/1.45 'Cormorant Garamond',serif;color:#f6e7dc}
.ihn-p{max-width:300px;margin:12px auto 0;font:500 18px/1.6 'Cormorant Garamond',serif;color:#f3e2d6}
.ihn-s{max-width:300px;margin:14px auto 0;font:italic 500 18px/1.55 'Cormorant Garamond',serif;color:#e9cf9f}
`;

// ===== تأكيد الحضور: نفس مربع sXSBxjs (إطار برجندي رفيع، الفورم ظاهر على طول) =====
const RSVP_CSS = `
.rsvp{background:#f7f1ea!important;color:${BUR}!important;padding-bottom:56px!important}
.rsvp .sprig{display:none!important}
.rsvp .eyebrow{color:#a07a4a!important}
.rsvp .h-script{color:${BUR}!important}
.rsvp-card{-webkit-mask:none!important;mask:none!important;background:#fffdf9!important;border:1px solid rgba(107,29,41,.55);border-radius:0!important;
  padding:30px 24px 26px!important;box-shadow:none!important}
.rsvp-card.reveal{opacity:1!important;transform:none!important}
.rsvp-card h3{display:none!important}
/* "Merci de confirmer votre présence avant le…" فوق الفورم */
.rsvp-card .by{display:block!important;margin:0 auto 22px!important;max-width:290px;font:italic 500 17px/1.5 'Cormorant Garamond',serif!important;
  color:${BUR}!important;text-align:center!important;letter-spacing:0!important;text-transform:none!important}
/* عدد الأشخاص */
.ih-cnt[hidden]{display:none!important}
.ih-step{display:inline-flex;align-items:center;border:1px solid rgba(107,29,41,.25);background:#fff}
.ih-step button{width:46px;height:44px;border:0;background:none;color:${BUR};font:500 24px/1 'Cormorant Garamond',serif;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ih-step span{min-width:48px;text-align:center;font:500 22px/44px 'Cormorant Garamond',serif;font-variant-numeric:lining-nums;color:#3b1a1e;
  border-left:1px solid rgba(107,29,41,.15);border-right:1px solid rgba(107,29,41,.15)}
.rsvp-card .field{margin-bottom:20px!important}
.rsvp-card .field .lab{color:#8a5a5e!important;font-size:10.5px!important;letter-spacing:.22em!important}
.rsvp-card .field input,.rsvp-card .field textarea{border:1px solid rgba(107,29,41,.25)!important;border-radius:0!important;padding:11px 12px!important;
  background:#fff!important;color:#3b1a1e!important;font-size:18px!important}
.rsvp-card .field input:focus,.rsvp-card .field textarea:focus{border-color:${BUR}!important}
.rsvp-card .field textarea{min-height:84px!important}
.rsvp-card .choice{gap:10px!important}
.rsvp-card .choice [role=radio]{border:1px solid rgba(107,29,41,.25)!important;border-radius:0!important;background:#fff;color:#5a1822!important;box-shadow:none!important;
  padding:12px 4px!important;font-size:clamp(14px,4.1vw,17px)!important;white-space:nowrap}
.rsvp-card .choice [aria-checked=true]{background:${BUR}!important;border-color:${BUR}!important;color:#fbf3ec!important}
.rsvp-card .btn{border-radius:0!important;box-shadow:none!important;letter-spacing:.24em!important;margin-top:4px!important}
.rsvp-card .r-err{color:${BUR}!important}
/* بعد الإرسال الفورم بيفضل ظاهر، وسطر الشكر تحته */
#mithaq-rsvp.sent form{display:block!important}
#mithaq-rsvp.sent .rsvp-done{display:block!important;padding:14px 0 0!important}
.rsvp-done img,.rsvp-done .again{display:none!important}
.rsvp-done p{color:#5a1822!important;font-size:17px!important}
`;

// ===== الكلام الفرنساوي =====
// الكلام الثابت بتاع القالب (بيتحط بعد نسخة القالب الإنجليزي، ونصوص فورم الحضور من البانل بتكسب)
const NB = ' '; // مسافة قبل ? و : و ! (قواعد الفرنساوي)
const FR = {
  sg1: 'Vous êtes invités', sg5: 'Touchez le sceau pour ouvrir',
  sg13: 'Salle', sg16: 'Touchez pour voir', sg17: 'Mariage', sg18: 'détails', sg20: 'Le lieu', sg21: 'Rsvp', sg22: 'Touchez pour ouvrir', sg27: 'Notre', sg28: 'histoire',
  sg33: 'Jours', sg34: 'Heures', sg35: 'Minutes', sg36: 'Secondes', sg37: 'Ajouter au calendrier',
  sg39: 'Déroulement du mariage',
  sg48: 'Plan d’accès', sg49: 'Le lieu', sg53: 'Ouvrir dans Google Maps',
  sg57: 'Réponse souhaitée', sg58: `Serez-vous des nôtres${NB}?`, sg59: 'Confirmation', sg60: 'Merci de confirmer votre présence avant le 15 janvier 2027.',
  sg61: 'Votre nom', sg62: `Serez-vous présent(e)${NB}?`, sg63: 'Oui, avec joie', sg64: 'Non, à regret', sg65: 'Un mot pour les mariés', sg66: 'Envoyer ma réponse',
  sg67: 'Merci — votre réponse a bien été reçue.', sg68: 'Modifier ma réponse',
  sg69: 'Laissez-nous un mot doux', sg70: 'Livre d’or',
  sg71: 'Enregistrez vos vœux', sg72: 'Jusqu’à une minute — les mariés le garderont précieusement', sg73: 'Touchez pour commencer l’enregistrement', sg74: 'Recommencer', sg75: 'Envoyer',
  sg76: 'Partagez vos photos', sg77: 'Envoyez les moments capturés pendant la journée', sg78: 'Choisir des photos', sg79: 'JPG · PNG — autant que vous le souhaitez',
  sg80: 'Vos photos sont envoyées uniquement aux mariés.',
  sg82: 'Merci',
};
// رسايل الصفحة (الأماكن الفاضية، الأخطاء، الشكر) — L() بتاعة القالب بتعدّي عليها
const FR_MSG = {
  'Your full name': 'Votre nom complet', 'Optional': 'Facultatif', 'Your name': 'Votre nom',
  'Please write your name': 'Merci d’indiquer votre nom',
  'Please choose: accept or decline': `Merci de choisir${NB}: oui ou non`,
  'Couldn’t send — please try again': 'Envoi impossible — merci de réessayer',
  'Your name, so the couple knows who sent it': 'Votre nom, pour que les mariés sachent de qui il vient',
  'Voice recording isn’t supported on this browser': 'L’enregistrement vocal n’est pas pris en charge par ce navigateur',
  'Microphone is blocked — allow it to record': 'Le micro est bloqué — autorisez-le pour enregistrer',
  'That was too short — try again': 'C’était trop court — réessayez',
  'Recording': 'Enregistrement',
  'Please write your name first': 'Merci d’écrire d’abord votre nom',
  'Voice wishes work once the invitation is published': 'Les vœux vocaux fonctionnent une fois l’invitation publiée',
  'Your voice wish was sent to the couple 🤍': 'Votre message vocal a bien été envoyé aux mariés 🤍',
  'Network problem — check your connection': 'Problème de connexion — vérifiez votre réseau',
  'Photo upload works once the invitation is published': 'L’envoi de photos fonctionne une fois l’invitation publiée',
  'Upload failed — try again': 'Échec de l’envoi — réessayez',
};
// ===== النسخة العربي (زرار "عربي" فوق على اليمين بعد فتح الظرف — بطلب المالك 2026-11-06) =====
// كلام الكارت والبرنامج والختام هو النص العربي اللي العرسان بعتوه (بشهور تونس: أفريل، جانفي)؛
// الباقي ترجمة. الخطوط: Aref Ruqaa (الأسامي والعناوين)، Amiri (الكلام والبسملة)، El Messiri
// (العناوين الصغيرة والزراير) — بتتحمّل بس لما الضيف يدوس على الزرار أو لو جهازه عربي.
const AR_IDS = {
  // الغلاف والكولاج
  sx1: 'اضغط لفتح الدعوة',
  sx11: 'أنتم مدعوّون<br>لحضور حفل زفاف',
  ih1: 'احفظوا التاريخ', ih2: 'برنامج<br>الحفل', ih3: 'اضغط هنا', ih4: 'اضغط هنا', ih5: 'أكّدوا حضوركم', ih6: 'حكايتنا', ih7: 'اكتشفوا',
  // كارت الدعوة
  ih10: 'لن تكتمل فرحتنا إلا بحضوركم ومشاركتكم سعادتنا.',
  ih11: 'تتشرف عائلتا بن غربال والتايب بكل فخر وسرور بدعوتكم لحضور حفل زفاف ابنيهما',
  ih14: 'ومشاركتهما فرحة هذا اليوم المميز، لتبقى هذه المناسبة ذكرى جميلة لا تُنسى.',
  ih16: 'وبين الأهل والأحباب، تكتمل فرحتهما بحضوركم ومشاركتكم أجمل لحظات العمر.',
  ih17: 'حضوركم أجمل هدية وأغلى فرحة لنا',
  // العدّاد والتقويم
  sx29: 'اقترب اليوم الموعود',
  sg33: 'أيام', sg34: 'ساعات', sg35: 'دقائق', sg36: 'ثوانٍ', sg37: 'أضف إلى التقويم',
  sx30: 'احفظوا التاريخ', sx33: 'بانتظاركم<br>لنحتفل معًا',
  // البرنامج
  sg39: 'برنامج حفل الزفاف',
  sg40: '16:30', sg41: 'دخول العروسين', sg42: '17:30', sg43: 'حفل الزفاف', sg44: '19:00', sg45: 'العشاء', sg46: '20:30', sg47: 'سهرة احتفالية', ih20: '23:00', ih21: 'نهاية الحفل',
  // المكان
  sg48: 'خريطة الوصول', sg49: 'مكان الحفل', sg53: 'افتح الموقع على الخريطة',
  // زفاف بلا هواتف
  ih33: '🤍 زفاف بلا هواتف 🤍',
  ih30: 'زفاف، وحبّ، ولحظات جميلة نتقاسمها معكم…',
  ih31: 'إن رغبتم، ضعوا هواتفكم جانبًا واستمتعوا معنا بكل لحظة من هذا اليوم!',
  ih32: 'سيتكفّل مصوّرنا بتخليد هذه الذكريات الثمينة ❤️',
  // تأكيد الحضور
  sg57: 'نرجو الرد', sg58: 'هل ستشاركوننا فرحتنا؟', sg59: 'تأكيد الحضور', sg60: 'يُرجى تأكيد حضوركم قبل 15 جانفي 2027.',
  sg61: 'الاسم', sg62: 'هل ستحضرون؟', sg63: 'نعم، بكل سرور', sg64: 'للأسف، لن أتمكّن', ih60: 'عدد الأشخاص', sg65: 'كلمة للعروسين', sg66: 'إرسال الرد',
  sg67: 'شكرًا — وصلنا ردّكم.', sg68: 'تعديل الرد',
  // التهاني الصوتية (وصور الضيوف — مقفولة للدعوة دي)
  sg69: 'اتركوا لنا كلمة جميلة', sg70: 'دفتر التهاني',
  sg71: 'سجّلوا تهنئتكم بصوتكم', sg72: 'حتى دقيقة واحدة — سيحتفظ بها العروسان', sg73: 'اضغط لبدء التسجيل', sg74: 'سجّل من جديد', sg75: 'إرسال',
  sg76: 'شاركونا صوركم', sg77: 'ارفعوا اللحظات التي التقطتموها', sg78: 'اختر الصور', sg79: 'JPG · PNG — بلا حدود', sg80: 'صوركم تصل إلى العروسين فقط.',
  // الختام والألبوم
  sg82: 'شكرًا', ih40: 'لمشاركتنا هذه المناسبة الجميلة التي لا تُنسى',
  ih50: 'ذكرياتنا', ih51: 'حكايتنا', ih52: 'عرض كل الصور',
};
// الأسامي والمكان بالعربي (زي بيانات الدعوة: groomNameAr / brideNameAr)
const AR_DATA = { groom: 'إيمان', bride: 'حسن', hall: 'دار البحري — التونارة', city: 'كاب زبيب، تونس' };
const AR_MSG = {
  'Your full name': 'الاسم الكامل', 'Optional': 'اختياري', 'Your name': 'الاسم',
  'Please write your name': 'من فضلك اكتب اسمك',
  'Please choose: accept or decline': 'من فضلك اختر: نعم أو لا',
  'Couldn’t send — please try again': 'تعذّر الإرسال — حاول مرة أخرى',
  'Your name, so the couple knows who sent it': 'اسمك، ليعرف العروسان صاحب التهنئة',
  'Voice recording isn’t supported on this browser': 'المتصفح لا يدعم التسجيل الصوتي',
  'Microphone is blocked — allow it to record': 'الميكروفون مقفول — اسمح به لتتمكّن من التسجيل',
  'That was too short — try again': 'التسجيل قصير جدًا — حاول مرة أخرى',
  'Recording': 'جارٍ التسجيل',
  'Please write your name first': 'من فضلك اكتب اسمك أولًا',
  'Voice wishes work once the invitation is published': 'التهاني الصوتية تعمل بعد نشر الدعوة',
  'Your voice wish was sent to the couple 🤍': 'وصلت تهنئتك الصوتية إلى العروسين 🤍',
  'Network problem — check your connection': 'مشكلة في الاتصال — تأكد من الإنترنت',
  'Photo upload works once the invitation is published': 'رفع الصور يعمل بعد نشر الدعوة',
  'Upload failed — try again': 'فشل الرفع — حاول مرة أخرى',
};
const AR_FONTS = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=El+Messiri:wght@400..700&display=swap';

const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
// بيتحط مكان L بتاعة القالب: نفس الرسايل بالفرنساوي أو بالعربي حسب زرار اللغة
// (والرسايل اللي فيها اسم/رقم بالـ regex)
const FR_FN = `  /* ---------- lcqdxr6: رسايل الصفحة بالفرنساوي / العربي ---------- */
  const __FR = ${json(FR_MSG)};
  const __AR = ${json(AR_MSG)};
  const __fr = (s) => {
    const ar = window.__ihLang === 'ar', T = ar ? __AR : __FR;
    if (Object.prototype.hasOwnProperty.call(T, s)) return T[s];
    let m = /^Thank you, (.*) — we can’t wait to celebrate with you 🤍$/.exec(s);
    if (m) return ar ? 'شكرًا ' + m[1] + ' — بانتظاركم لنحتفل معًا 🤍' : 'Merci ' + m[1] + ' — nous avons hâte de célébrer avec vous 🤍';
    m = /^Thank you, (.*) — you’ll be in our hearts that day 🤍$/.exec(s);
    if (m) return ar ? 'شكرًا ' + m[1] + ' — ستكونون في قلوبنا ذلك اليوم 🤍' : 'Merci ' + m[1] + ' — vous serez dans nos cœurs ce jour-là 🤍';
    m = /^Uploading (\\d+) of (\\d+)…$/.exec(s);
    if (m) return ar ? 'جارٍ رفع ' + m[1] + ' من ' + m[2] + '…' : 'Envoi ' + m[1] + ' sur ' + m[2] + '…';
    m = /^Thank you! (\\d+) photos? sent to the couple 🤍$/.exec(s);
    if (m) return ar ? 'شكرًا! وصلت ' + m[1] + ' صورة إلى العروسين 🤍' : 'Merci\\u00a0! ' + m[1] + (Number(m[1]) > 1 ? ' photos envoyées' : ' photo envoyée') + ' aux mariés 🤍';
    return s;
  };
`;

// بيتحط في سكريبت القالب قبل "STATIC" — كل حاجة القالب عرّفها (fields, START, RO…) متاحة هنا
const LOGIC = `
  /* ---------- lcqdxr6: حاجات مشتركة بين اللغتين (التقويم ولينك "أضف للتقويم") ---------- */
  const ihCal = (ar) => {
    const g = document.getElementById('sxcGrid'); if (!g) return;
    const first = (new Date(Y, M, 1).getDay() + 6) % 7, days = new Date(Y, M + 1, 0).getDate();
    let h = (ar ? ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'] : ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']).map((d) => '<b>' + d + '</b>').join('');
    for (let k = 0; k < first; k++) h += '<span></span>';
    for (let d = 1; d <= days; d++) h += '<span' + (d === D ? ' class="wd"' : '') + '>' + d + '</span>';
    g.innerHTML = h; g.dir = ar ? 'rtl' : 'ltr';
  };
  // لحد آخر الحفل (11 بالليل) — الميعاد بتوقيت تونس (transform)
  const ihCalLink = (ar) => {
    const z = (d) => d.toISOString().replace(/[-:]|\\.\\d{3}/g, '');
    const title = ar ? 'زفاف ${AR_DATA.groom} و ${AR_DATA.bride}' : 'Mariage ' + groom + ' & ' + bride;
    const where = ar ? '${AR_DATA.hall}، ${AR_DATA.city}' : [C.venueName, C.venueAddress || C.venueCity].filter(Boolean).join(', ');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title)
      + '&dates=' + z(START) + '/' + z(new Date(START.getTime() + 6.5 * 3600e3)) + '&location=' + encodeURIComponent(where);
  };
  /* ---------- lcqdxr6: الكلام الثابت بالفرنساوي (نصوص فورم الحضور من البانل بتكسب) ---------- */
  {
    const FR = ${json(FR)};
    Object.keys(FR).forEach((id) => { const el = byId(id); if (el) el.textContent = FR[id]; });
    Object.keys(RO_MAP).forEach((k) => { if (RO[k]) byId(RO_MAP[k]).textContent = RO[k]; });
  }
  /* ---------- lcqdxr6: التاريخ والوقت بالفرنساوي ---------- */
  {
    const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const wd = JOURS[new Date(Y, M, D).getDay()];
    fields.monthUp = MOIS[M].toUpperCase();
    fields.dateShort = D + ' ' + MOIS[M] + ' ' + Y;
    fields.dateLong = wd.charAt(0).toUpperCase() + wd.slice(1) + ' ' + D + ' ' + MOIS[M] + ' ' + Y;
    fields.t0 = H + ' h ' + String(MI).padStart(2, '0');
    ['monthUp', 'dateShort', 'dateLong', 't0'].forEach((k) => $$('[data-k="' + k + '"]').forEach((el) => { el.textContent = fields[k]; }));
    const s38 = byId('sg38'); if (s38) s38.textContent = fields.dateLong;
    document.title = groom + ' & ' + bride + ' | Invitation de mariage';
    const cal = document.getElementById('addCal');
    if (cal) cal.href = ihCalLink(false);
  }
  /* ---------- lcqdxr6: برنامج اليوم — 5 مواعيد (Déroulement du mariage) ---------- */
  {
    const SCH = [['sg40', '16 h 30', 'sg41', 'Entrée des mariés'], ['sg42', '17 h 30', 'sg43', 'Cérémonie de mariage'], ['sg44', '19 h 00', 'sg45', 'Dîner'], ['sg46', '20 h 30', 'sg47', 'Soirée festive'], ['ih20', '23 h 00', 'ih21', 'Fin du mariage']];
    SCH.forEach(([t, tv, n, nv]) => { const a = byId(t), b = byId(n); if (a) a.textContent = tv; if (b) b.textContent = nv; });
    // دخول العرسان: أيقونة القوس، والدبل للفرح نفسه (العشا والسهرة زي القالب)
    const ics = $$('#schedule .tl .ic');
    if (ics.length >= 2) { ics[1].innerHTML = ics[0].innerHTML; ics[0].innerHTML = ${json(ARCH)}; }
    ['dress'].forEach((id) => { const e = document.getElementById(id); if (e) e.classList.add('off'); });
    // تأكيد الحضور ظاهر دايمًا
    { const r = document.getElementById('rsvp'); if (r) r.classList.remove('off'); }
  }
  /* ---------- lcqdxr6: تقويم "Réservez la date" (الأسبوع بيبدأ الاتنين، والقلب على يوم الفرح) ---------- */
  {
    const MN = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const mEl = document.querySelector('[data-elem-id="sx31"]'), yEl = document.querySelector('[data-elem-id="sx32"]');
    if (mEl && !mEl.textContent.trim()) mEl.textContent = MN[M];
    if (yEl && !yEl.textContent.trim()) yEl.textContent = String(Y);
    ihCal(false);
    // "Réservez la date" في الكولاج بيودّي على التقويم
    GO.calendar = '#sxCal';
  }
  /* ---------- lcqdxr6: كلام الكولاج من بيانات الدعوة ---------- */
  {
    const up = (s) => String(s || '').toUpperCase();
    const extra = {
      dateUp: fields.day + ' ' + fields.monthUp + ' ' + fields.year,
      cityUp: up(fields.city), hallUp: up(fields.hall),
      pair: [fields.groom, fields.bride].filter(Boolean).join(' & '),
    };
    $$('#collage .sxt[data-k]').forEach((el) => { const v = extra[el.dataset.k]; if (v != null) el.textContent = v; });
    // كلام طويل: بيصغر على قد الكارت
    const fit = () => $$('#collage .sxt-nm1, #collage .sxt-nm2, #collage .sxt-cdt, #collage .sxt-sv, #collage .sxt-sm, #collage .sxt-sd, #collage .sxt-se, #collage .sxt-pl, #collage .sxt-bk').forEach((el) => {
      el.style.scale = '';
      const max = el.closest('.sxp').offsetWidth * (el.matches('.sxt-sv, .sxt-sm, .sxt-sd') ? 0.62 : el.matches('.sxt-pl') ? 0.3 : el.matches('.sxt-bk') ? 0.42 : 0.8);
      if (el.offsetWidth > max) el.style.scale = (max / el.offsetWidth).toFixed(3);
    });
    fit(); addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }
  /* ---------- lcqdxr6: الظرف بيتفتح من النص ---------- */
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
  /* ---------- lcqdxr6: عدد الأشخاص في تأكيد الحضور (بيظهر لما الضيف يختار Oui) ---------- */
  {
    window.__ihCount = 1;
    const box = document.getElementById('ihCount'), val = document.getElementById('ihCountV');
    const yes = document.querySelector('#rsvpForm [data-a="yes"]');
    if (box && val && yes) {
      const sync = () => { box.hidden = !EDIT && yes.getAttribute('aria-checked') !== 'true'; };
      new MutationObserver(sync).observe(yes, { attributes: true, attributeFilter: ['aria-checked'] });
      $$('button', box).forEach((b) => b.addEventListener('click', () => {
        if (EDIT) return;
        window.__ihCount = Math.max(1, Math.min(10, window.__ihCount + Number(b.dataset.d)));
        val.textContent = window.__ihCount;
      }));
      sync();
    }
  }
  /* ---------- lcqdxr6: ألبوم الصور (Notre histoire) — كتاب الكولاج بيودّي عليه ---------- */
  {
    GO.album = '#ihAlbum';
    const FULL = ${json(ALBUM_FULL)};
    const grid = document.getElementById('ihaGrid'), more = document.getElementById('ihaMore');
    if (grid) {
      const showAll = () => {
        $$('img[data-src]', grid).forEach((im) => { im.loading = 'lazy'; im.src = im.dataset.src; im.removeAttribute('data-src'); });
        grid.classList.add('all'); if (more) more.remove();
      };
      if (more) onPress(more, showAll);
      // الصورة كبيرة: أسهم وسحب يمين/شمال، Esc أو الضغط برّه بيقفل
      const lb = document.createElement('div'); lb.className = 'iha-lb'; lb.hidden = true;
      lb.innerHTML = '<img alt=""><button type="button" class="iha-x" aria-label="Fermer">×</button><button type="button" class="iha-nav iha-prev" aria-label="Photo précédente">‹</button><button type="button" class="iha-nav iha-next" aria-label="Photo suivante">›</button><div class="iha-n"></div>';
      document.body.appendChild(lb);
      const img = lb.querySelector('img'), cnt = lb.querySelector('.iha-n');
      let cur = 0;
      const show = (i) => {
        cur = (i + FULL.length) % FULL.length; img.src = FULL[cur]; cnt.textContent = (cur + 1) + ' / ' + FULL.length;
        [cur - 1, cur + 1].forEach((k) => { const p = new Image(); p.src = FULL[(k + FULL.length) % FULL.length]; });
      };
      const open = (i) => { show(i); lb.hidden = false; void lb.offsetWidth; lb.classList.add('on'); document.documentElement.style.overflow = 'hidden'; };
      const close = () => { lb.classList.remove('on'); document.documentElement.style.overflow = ''; setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 250); };
      grid.addEventListener('click', (e) => { const b = e.target.closest('.iha-it'); if (!b || EDIT) return; open(Number(b.dataset.i)); });
      lb.querySelector('.iha-x').addEventListener('click', close);
      lb.querySelector('.iha-prev').addEventListener('click', (e) => { e.stopPropagation(); show(cur - 1); });
      lb.querySelector('.iha-next').addEventListener('click', (e) => { e.stopPropagation(); show(cur + 1); });
      lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
      addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1); });
      let x0 = null;
      lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
    }
  }
  /* ---------- lcqdxr6: زرار عربي / Français (فوق على اليمين، بيظهر بعد فتح الظرف) ---------- */
  {
    const AR_IDS = ${json(AR_IDS)};
    const A = ${json(AR_DATA)};
    const AM = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const AD = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const p2 = (n) => String(n).padStart(2, '0');
    const wdA = AD[new Date(Y, M, D).getDay()] + ' ' + D + ' ' + AM[M] + ' ' + Y;
    const ARK = {
      groom: A.groom, bride: A.bride, conn: 'و', pair: A.groom + ' و ' + A.bride,
      day: p2(D), monthUp: AM[M], year: String(Y), t0: H + ':' + p2(MI),
      hall: A.hall, hallUp: A.hall, city: A.city, cityUp: A.city, address: A.city,
      dateShort: D + ' ' + AM[M] + ' ' + Y, dateUp: p2(D) + ' ' + AM[M] + ' ' + Y, dateLong: 'يوم ' + wdA,
    };
    const PH = {
      fr: { rName: 'Votre nom complet', rNote: 'Facultatif', vName: 'Votre nom, pour que les mariés sachent de qui il vient', pName: 'Votre nom' },
      ar: { rName: 'الاسم الكامل', rNote: 'اختياري', vName: 'اسمك، ليعرف العروسان صاحب التهنئة', pName: 'الاسم' },
    };
    // الكلام الفرنساوي (حتى تعديلات المحرر) بيتحفظ قبل ما يتبدّل، وبيرجع زي ما هو
    const SNAP = new Map();
    const put = (el, html) => { if (!el) return; if (!SNAP.has(el)) SNAP.set(el, el.innerHTML); el.innerHTML = html; };
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // الخطوط العربي بتتحمّل مرة واحدة — والتحويل بيستنى لحد ما تجهز (بحد أقصى ثانيتين)
    let fontsP = null;
    const fonts = () => fontsP || (fontsP = new Promise((res) => {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ${json(AR_FONTS)};
      l.onload = l.onerror = () => res(); document.head.appendChild(l);
    }).then(() => (document.fonts && document.fonts.load
      ? Promise.race([Promise.all(['700 24px "Aref Ruqaa"', '400 20px Amiri', '600 16px "El Messiri"'].map((f) => document.fonts.load(f, 'عربي'))), new Promise((r) => setTimeout(r, 2000))])
      : null)).catch(() => {}));
    const btn = document.createElement('div');
    btn.className = 'ih-lang'; btn.setAttribute('role', 'button'); btn.tabIndex = 0;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.9 2.7 15.1 0 18M12 3c-2.7 2.9-2.7 15.1 0 18"/></svg><span></span>';
    const btnT = btn.querySelector('span');
    const label = (ar) => { btn.dataset.to = ar ? 'fr' : 'ar'; btnT.textContent = ar ? 'Français' : 'عربي'; btn.setAttribute('aria-label', ar ? 'Version française' : 'النسخة العربية'); };
    const setLang = (lang) => {
      const ar = lang === 'ar';
      if (ar === (window.__ihLang === 'ar')) return;
      window.__ihLang = lang;
      if (ar) {
        $$('[data-k]').forEach((el) => { const v = ARK[el.dataset.k]; if (v != null) put(el, esc(v)); });
        Object.keys(AR_IDS).forEach((id) => put(byId(id), AR_IDS[id]));
        $$('.ihl-nm .amp').forEach((el) => put(el, 'و'));
        put(byId('sg38'), esc(wdA));
        put(byId('sx31'), esc(AM[M]));
      } else {
        SNAP.forEach((h, el) => { el.innerHTML = h; }); SNAP.clear();
      }
      const html = document.documentElement;
      html.lang = ar ? 'ar' : 'fr'; html.dir = ar ? 'rtl' : 'ltr'; html.classList.toggle('ih-ar', ar);
      Object.keys(PH[lang]).forEach((id) => { const e = document.getElementById(id); if (e) e.placeholder = PH[lang][id]; });
      ihCal(ar);
      const cal = document.getElementById('addCal'); if (cal) cal.href = ihCalLink(ar);
      // الخريطة بنفس اللغة
      const mf = document.getElementById('sgMap');
      if (mf) ['src', 'data-wda-map-src'].forEach((a) => { const v = mf.getAttribute(a); if (v && /[?&]hl=(fr|ar)(&|$)/.test(v)) mf.setAttribute(a, v.replace(/([?&]hl=)(fr|ar)(?=&|$)/, '$1' + lang)); });
      document.title = ar ? A.groom + ' و ' + A.bride + ' | دعوة زفاف' : groom + ' & ' + bride + ' | Invitation de mariage';
      label(ar);
      try { localStorage.setItem('ih_lang_' + (C.shortId || ''), lang); } catch (_) {}
      dispatchEvent(new Event('resize'));
    };
    // التحويل: الصفحة بتختفي لحظة، الكلام بيتبدّل، والجزء اللي قدام الضيف بيفضل قدامه
    let busy = false;
    const swap = async (lang) => {
      if (busy) return; busy = true; btn.classList.add('wait');
      if (lang === 'ar') await fonts();
      const anchor = $$('#stage > section').find((s) => s.getBoundingClientRect().bottom > 90);
      const off = anchor ? anchor.getBoundingClientRect().top : 0;
      document.documentElement.classList.add('ih-swap');
      setTimeout(() => {
        setLang(lang);
        if (anchor) window.scrollTo(0, window.scrollY + anchor.getBoundingClientRect().top - off);
        setTimeout(() => document.documentElement.classList.remove('ih-swap'), 30);
        btn.classList.remove('wait'); busy = false;
      }, 230);
    };
    label(false);
    if (!EDIT) {
      document.body.appendChild(btn);
      onPress(btn, () => swap(btn.dataset.to));
      const showBtn = () => btn.classList.add('on');
      const envEl = document.getElementById('sx-env');
      // الجهاز العربي غالبًا هيدوس على الزرار — الخطوط بتتحمّل من بدري
      const arDevice = (navigator.languages || [navigator.language || '']).some((l) => /^ar/i.test(l || ''));
      if (envEl && !STATIC) {
        const opened = () => { setTimeout(showBtn, 2300); if (arDevice) setTimeout(fonts, 1500); };
        envEl.addEventListener('click', opened);
        envEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') opened(); });
      } else showBtn();
      // اللغة من الأول: ?lang=ar في اللينك، أو آخر اختيار للضيف ده
      let start = '';
      try { start = new URLSearchParams(location.search).get('lang') || localStorage.getItem('ih_lang_' + (C.shortId || '')) || ''; } catch (_) {}
      if (start === 'ar') { fonts(); setLang('ar'); }
    }
  }
`;

// لازم يتلاقوا في القالب مرة واحدة بالظبط — غير كده الصفحة العادية
const PATCHES = [
  ['    <div class="countdown">\n', `    ${COUNT_HEAD}<div class="countdown">\n`],
  ['  <!-- ============ العد التنازلي ============ -->\n', `  ${LETTER}\n\n  <!-- ============ العد التنازلي ============ -->\n`],
  ['  <!-- ============ برنامج اليوم ============ -->\n', `  ${CAL}\n\n  <!-- ============ برنامج اليوم ============ -->\n`],
  ['data-elem-id="sg47">First dance &amp; party</span></div>\n', `data-elem-id="sg47">First dance &amp; party</span></div>\n${ROW5}`],
  ['  <!-- ============ تأكيد الحضور ============ -->\n', `  ${NOPHOTO}\n\n  <!-- ============ تأكيد الحضور ============ -->\n`],
  // الختام: "Merci" + باقي جملة العرسان تحتها (طبق الدبل والأسامي والتاريخ زي القالب)
  ['data-elem-id="sg82">We can’t wait to celebrate with you</div>\n', 'data-elem-id="sg82">Merci</div>\n    <p class="ihc-p reveal d1" data-elem-id="ih40">de partager avec nous cette journée inoubliable.</p>\n'],
  // الألبوم آخر حاجة في الدعوة (بعد الختام)
  ['</main>\n', `  ${ALBUM}\n</main>\n`],
  // تأكيد الحضور: خانة عدد الأشخاص قبل الرسالة، والعدد بيتبعت في أول الرسالة (زي j4jpczb) عشان يظهر في لوحة العميل
  ['        <div class="field" id="noteField">', `        ${COUNT_FIELD}<div class="field" id="noteField">`],
  ["            body: JSON.stringify({ guestName: name, attending: attending ? 'yes' : 'no', note: noteIn.value.trim() }),\n",
    "            body: JSON.stringify({ guestName: name, attending: attending ? 'yes' : 'no', note: (attending ? 'Personnes : ' + (window.__ihCount || 1) + (noteIn.value.trim() ? ' — ' + noteIn.value.trim() : '') : noteIn.value.trim()).slice(0, 200) }),\n"],
  ['    <div class="collage" id="collage">\n', `    <div class="collage" id="collage">\n      ${COLLAGE}\n`],
  ['<div class="cover" id="coverScreen">\n', `<div class="cover" id="coverScreen">\n  ${COVER}`],
  ['  const L = (en, ar) => (AR ? ar : en);\n', `${FR_FN}  const L = (en, ar) => (AR ? ar : __fr(en));\n`],
  ['  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود', `${LOGIC}\n  if (STATIC) {\n    // المحرر: الغلاف بيفضل موجود`],
];

/** قيمة نصية من JSON الإعدادات اللي جوه صفحة القالب ("key":"...") */
function configValue(html, key) {
  const m = html.match(new RegExp(`"${key}":("(?:[^"\\\\]|\\\\.)*")`));
  if (!m) return '';
  try { return JSON.parse(m[1]) || ''; } catch (e) { return ''; }
}

/** لحظة الفرح بتوقيت تونس (UTC+1 طول السنة) بدل مصر — العدّاد و"أضف للتقويم" بيمشوا عليها */
function tunisTime(html) {
  const m = html.match(/"countdown":\{"year":(\d+),"monthIndex":(\d+),"day":(\d+),"hour":(\d+),"minute":(\d+)\}/);
  if (!m) return html;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const iso = new Date(Date.UTC(y, mo, d, h - 1, mi)).toISOString();
  return html.replace(/"weddingDateTimeISO":"[^"]*"/, () => `"weddingDateTimeISO":"${iso}"`);
}

module.exports = {
  shortId: SHORT,

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Imène & Hassan — Invitation de mariage',
    description: 'Samedi 10 avril 2027 · Dar El Bahri — Tonnara, Cap Zebib',
  },

  render() {
    return {
      head: `<link rel="preload" as="image" href="${TOP}"><link rel="preload" as="image" href="${BOTTOM}"><link rel="preload" as="image" href="${SEAL}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cinzel:wght@500&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap"><style id="sx-style">${CSS}${CAL_CSS}${MORE_CSS}${RSVP_CSS}${ALBUM_CSS}${AR_CSS}</style>`,
    };
  },

  transform(html) {
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    let out = html;
    for (const [find, repl] of PATCHES) {
      const f = find.replace(/\n/g, nl);
      if (out.split(f).length !== 2) {
        console.error('[custom lcqdxr6] template changed — showing the normal page');
        return html;
      }
      out = out.replace(f, () => repl.replace(/\n/g, nl));
    }
    // الخريطة: لينك القاعة نفسه من الأول بدل "مصر" (المتصفحات اللي بتتجاهل lazy)، ومن غير ما تتحمّل مرتين
    const embed = configValue(out, 'venueMapEmbedSrc');
    if (/^https:\/\//.test(embed)) {
      out = out.replace('src="https://www.google.com/maps?q=Egypt&amp;output=embed"', () => `src="${escapeHtml(embed)}"`);
      out = out.replace(`  else mapFrame.setAttribute('src', mapEmbed);${nl}`, () => `  else if (mapFrame.getAttribute('src') !== mapEmbed) mapFrame.setAttribute('src', mapEmbed);${nl}`);
    }
    out = tunisTime(out);
    return out.replace(/<html([^>]*?)\blang="en"/i, (m, a) => `<html${a}lang="fr"`);
  },
};
