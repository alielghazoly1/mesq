// دعوة zukBi1U (Blossom & Oud) — فرح الأخين عبدالرحمن وعبدالله نصار على الأختين جيهاد وشامية صلاح فهدي.
// بطلب المالك (2026-11-14): الدعوة كلها عربي، عرسانين في نفس الدعوة. ليلة الحنة الأربعاء 18/11/2026 الساعة
// 7:30 مساءً (لوكيشن على الخريطة من غير اسم مكان) وفيها قرآن (الشيخ محمود سرحان والشيخ عوض الشرقاوي) — فوق
// حفل الزفاف الخميس 19/11/2026 الساعة 7:30 مساءً في قاعة الملكة، مركز ملوي، المنيا. جدول مواعيد اليوم اتشال.
//
// تصميم القالب زي ما هو: الظرف بختم البسملة، الستاير والقصر (الأسامي في النص)، كارت القوس، العدّاد، الدريس
// كود، والختام — بخطوط عربي (رقعة للعناوين وأميري للكلام). الأقسام الجديدة (الحنة، الفرح، تأكيد الحضور) بنفس
// ألوان القالب وصوره (فيونكة القالب، دبوس المكان، رسمة القصر).
//
// الأسامي صور (client/public/custom/zukBi1U/n-*.webp) مش كلام مكتوب: دلوقتي معمولة مؤقتًا من حروف رقعة
// بالدهبي (scratch zk/names.js + gild.py) لحد ما المالك يبعت صور الخط اليدوي — ساعتها الصور بس بتتبدّل
// (ومقاساتها في NAME_ART).
// البيانات (لوحة العميل والتقويم): oneOffFix zukBi1U-double-wedding.
const { asset } = require('./_asset');
const { cairoWallToDate } = require('../utils/cairoTime');

const SHORT = 'zukBi1U';
const DIR = `/custom/${SHORT}/`;
const GOLD = '#866739';
const TILDA = 'https://static.tildacdn.net/';
const IMG = {
  flourish: `${TILDA}tild3830-3661-4865-a130-306631633264/Vector.png`,
  pin: `${TILDA}tild3263-3561-4339-a533-643564366236/ic_baseline-place_1.png`,
  palace: `${TILDA}tild6666-3763-4439-a131-303039386132/Group_222.png`,
  divider: `${TILDA}tild6239-3062-4232-a662-393266616664/line-divider2.png`,
};

// المناسبتين (ساعة حائط بتوقيت مصر). الحنة فوق الفرح (بطلب المالك).
const EVENTS = {
  henna: {
    at: [2026, 10, 18, 19, 30],
    title: 'ليلة الحنة',
    day: 'الأربعاء ١٨ نوفمبر ٢٠٢٦',
    // لينك المالك: دبوس على الخريطة من غير اسم مكان (27.8671455, 30.8399448 — شمال ملوي)
    map: 'https://maps.app.goo.gl/T27kcrNJKRsY7TSo8',
    embed: 'https://www.google.com/maps?q=27.8671455,30.8399448&hl=ar&z=15&output=embed',
  },
  wedding: {
    at: [2026, 10, 19, 19, 30],
    title: 'حفل الزفاف',
    day: 'الخميس ١٩ نوفمبر ٢٠٢٦',
    // قاعة الملكة — Plus Code PRRW+VFJ (طريق بني سويف/ديروط، ملوي): 27.7422125, 30.8461406
    map: 'https://maps.app.goo.gl/yq6fbmEmGyDwG9fp9',
    embed: 'https://www.google.com/maps?q=27.7422125,30.8461406&hl=ar&z=16&output=embed',
  },
};
const startOf = (ev) => cairoWallToDate(...ev.at);

/** المناسبة اللي جاية (العدّاد عليها): الحنة لحد ما تبدأ، وبعدها الفرح */
function nextEvent(now = Date.now()) {
  if (now < startOf(EVENTS.henna).getTime()) return 'henna';
  if (now < startOf(EVENTS.wedding).getTime()) return 'wedding';
  return 'done';
}
const CD_TITLE = { henna: 'باقي على ليلة الحنة', wedding: 'باقي على حفل الزفاف', done: 'بارك الله لهم وبارك عليهم' };
const CD_DONE = { henna: 'بدأت ليلة الحنة 🤍', wedding: 'بدأ حفل الزفاف 🤍', done: 'بارك الله لهم وبارك عليهم وجمع بينهم في خير 🤍' };

// صور الأسامي (نفس المقاس لكل الأسامي) — h: ارتفاع الصورة، d: المسافة من السطر لتحت الصورة (عشان كلهم على سطر واحد)
const NAME_ART = {
  abdelrahman: { alt: 'عبدالرحمن', h: 229, d: 41.2 },
  gihad: { alt: 'جيهاد', h: 183, d: 55.2 },
  abdallah: { alt: 'عبدالله', h: 169, d: 41.8 },
  shamia: { alt: 'شامية', h: 183, d: 47.4 },
};
const nameImg = (k) => `<img class="zk-nm" src="${asset(`${DIR}n-${k}.webp`)}" alt="${NAME_ART[k].alt}" style="--h:${NAME_ART[k].h};--d:${NAME_ART[k].d}" decoding="async">`;
const PAIR = (g, b) => `<span class="zk-pair">${nameImg(g)}<span class="zk-amp">&amp;</span>${nameImg(b)}</span>`;
const COUPLES = `<span class="zk-cn">${PAIR('abdelrahman', 'gihad')}${PAIR('abdallah', 'shamia')}</span>`;

// خانات القالب: [السيلكتور، الكلام]
const R = (rec, f) => `#${rec} [field="${f}"]`;
const FIELDS = [
  [R('rec2339662043', 'tn_text_1777183175514000001'), 'اضغط لفتح الدعوة'],
  // الستاير: العرسانين (كل عريس وعروسته في سطر)، وتحتهم اليومين والساعة
  [R('rec2339662063', 'tn_text_1779566247730000001'), COUPLES],
  [R('rec2339662063', 'tn_text_1779566247730000004'), ''],
  [R('rec2339662063', 'tn_text_1779566247730000003'), '١٨ و ١٩ نوفمبر ٢٠٢٦'],
  [R('rec2339662063', 'tn_text_1779626065755000001'), 'الساعة ٧:٣٠ مساءً'],
  // كارت القوس (تحت البسملة)
  [R('rec2339662083', 'tn_text_1779624381838000001'),
    'بكل الحب والسعادة<br>نتشرف بدعوتكم لحضور حفل زفاف<br>'
    + '<span class="zk-ac"><b>عبدالرحمن نصار</b><i>وَ</i><b>جيهاد صلاح فهدي</b></span>'
    + '<span class="zk-ac"><b>عبدالله نصار</b><i>وَ</i><b>شامية صلاح فهدي</b></span>'
    + '<span class="zk-ad">ليلة الحنة الأربعاء ١٨ نوفمبر<br>وحفل الزفاف الخميس ١٩ نوفمبر</span>'],
  [R('rec2339662083', 'tn_text_1779472210551000005'), ''],
  // الدريس كود
  [R('rec2355542373', 'tn_text_1771277026942000001'), 'الزي المقترح'],
  [R('rec2355542373', 'tn_text_1779544773135'), 'يسعدنا أن تشاركونا فرحتنا<br>بإطلالة أنيقة تليق بالمناسبة'],
  [R('rec2355542373', 'tn_text_1780768374065000001'), 'ألوان مقترحة'],
  [R('rec2355574603', 'tn_text_1780767478919000003'), 'السيدات'],
  [R('rec2355574603', 'tn_text_1780767449362000001'), 'فساتين سهرة أنيقة وراقية'],
  [R('rec2355574603', 'tn_text_1780767518772000004'), 'السادة'],
  [R('rec2355574603', 'tn_text_1780767518772000005'), 'بدلة كلاسيكية أنيقة<br>مع حذاء رسمي'],
  [R('rec2339662163', 'tn_text_1763405219328'), 'بحضوركم تكتمل فرحتنا'],
];
const CD_LABELS = ['أيام', 'ساعات', 'دقائق', 'ثوانٍ'];

const ORN = '<div class="zk-orn" aria-hidden="true"><i></i><b></b><i></i></div>';
const PIN = `<img class="zk-pin" src="${IMG.pin}" alt="" aria-hidden="true">`;
// ربع الحزب (۞) — علامة المصحف — دهبي
const HIZB = `<svg class="zk-hizb" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="${GOLD}" stroke-width="1.6"><rect x="10" y="10" width="28" height="28"/><rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)"/><circle cx="24" cy="24" r="7.5"/></g><circle cx="24" cy="24" r="2.4" fill="${GOLD}"/></svg>`;

const eventSection = (key, extra) => {
  const ev = EVENTS[key];
  return `<section class="zk-sec zk-ev" id="zk-${key}" dir="rtl" lang="ar">
  <h2 class="zk-title">${ev.title}</h2>
  <img class="zk-flo" src="${IMG.flourish}" alt="" aria-hidden="true">
  <p class="zk-day">${ev.day}</p>
  <p class="zk-time">الساعة ٧:٣٠ مساءً</p>
  ${extra}
  <div class="zk-map"><iframe title="${ev.title} على الخريطة" data-src="${ev.embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
  <a class="zk-btn" href="${ev.map}" target="_blank" rel="noopener">${PIN}<span>${key === 'henna' ? 'موقع الحنة على الخريطة' : 'موقع القاعة على الخريطة'}</span></a>
  <a class="zk-cal" data-e="${key}" href="/i/${SHORT}/calendar.ics?e=${key}">أضف ${ev.title} إلى التقويم</a>
</section>`;
};

const HENNA = eventSection('henna', `<div class="zk-quran">
    ${HIZB}
    <p class="zk-q1">يُحيي الليلة بتلاوة من القرآن الكريم</p>
    <p class="zk-q2">فضيلة الشيخ <b>محمود سرحان</b></p>
    <p class="zk-q2">فضيلة الشيخ <b>عوض الشرقاوي</b></p>
  </div>`);

const WEDDING = eventSection('wedding', `<div class="zk-venue">
    <p class="zk-vn">قاعة الملكة</p>
    <p class="zk-vc">مركز ملوي — المنيا</p>
  </div>
  <div class="zk-palw"><img class="zk-palace" src="${IMG.palace}" alt="" aria-hidden="true" loading="lazy"></div>`);

const opts = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => `<option value="${from + i}">${from + i}</option>`).join('');
const RSVP = `<section class="zk-sec" id="zkRsvp" dir="rtl" lang="ar">
  <h2 class="zk-title">تأكيد الحضور</h2>
  ${ORN}
  <p class="zk-dl">يسعدنا تأكيد حضوركم</p>
  <form class="zk-form" id="zkForm" novalidate>
    <label class="zk-lab" for="zkName">الاسم</label>
    <input id="zkName" maxlength="80" autocomplete="name">
    <span class="zk-lab">هل ستشرفوننا بالحضور؟</span>
    <div class="zk-choice"><button type="button" data-a="yes">نعم، بكل سرور</button><button type="button" data-a="no">أعتذر، لن أتمكّن</button></div>
    <div class="zk-more" id="zkMore" hidden>
      <span class="zk-lab">سنحضر</span>
      <div class="zk-evs"><button type="button" data-e="henna" class="on">ليلة الحنة</button><button type="button" data-e="wedding" class="on">حفل الزفاف</button></div>
      <label class="zk-lab" for="zkCnt">عدد الحضور</label>
      <div class="zk-sel"><select id="zkCnt">${opts(1, 10)}</select></div>
    </div>
    <label class="zk-lab" for="zkNote">كلمة للعرسان (اختياري)</label>
    <textarea id="zkNote" rows="2" maxlength="160"></textarea>
    <button type="submit" class="zk-send" id="zkSend">إرسال</button>
    <p class="zk-msg" id="zkMsg" aria-live="polite"></p>
  </form>
</section>`;

// خانات القالب اللي بالرقعة (عناوين) واللي بالأميري (كلام)
const RUQAA = [
  R('rec2339662093', 'tn_text_1771277026942000001'),
  R('rec2355542373', 'tn_text_1771277026942000001'), R('rec2355542373', 'tn_text_1780768374065000001'),
  R('rec2355574603', 'tn_text_1780767478919000003'), R('rec2355574603', 'tn_text_1780767518772000004'),
  R('rec2339662163', 'tn_text_1763405219328'),
];
const AMIRI = [
  '#rec2339662043 [field]', R('rec2339662063', 'tn_text_1779566247730000003'), R('rec2339662063', 'tn_text_1779626065755000001'),
  R('rec2339662083', 'tn_text_1779624381838000001'),
  R('rec2355542373', 'tn_text_1779544773135'), R('rec2355574603', 'tn_text_1780767449362000001'), R('rec2355574603', 'tn_text_1780767518772000005'),
];
const sel = (list, extra = '') => list.map((s) => `html.zk ${s}${extra}`).join(',');

const CSS = `
html,body{overflow-anchor:none}
html.zk .tn-atom{letter-spacing:0!important}
${sel(RUQAA)},${sel(RUQAA, ' .tn-atom')}{font-family:'Aref Ruqaa',serif!important;font-weight:700!important;direction:rtl}
${sel(AMIRI)},${sel(AMIRI, ' .tn-atom')}{font-family:'Amiri',serif!important;direction:rtl}
/* الستاير: العرسانين — كل عريس وعروسته على سطر (صور الأسامي على نفس السطر)، والتاريخ والساعة تحتهم على طول */
#rec2339662063 [field="tn_text_1779566247730000001"]{line-height:1!important;overflow:visible!important;transform:translateY(var(--zk-ny,-40px))}
#rec2339662063 [data-elem-id="1779566247730000004"]{display:none!important}
.zk-cn{display:flex;flex-direction:column;align-items:center;gap:12px;--k:.235}
.zk-pair{display:flex;align-items:baseline;justify-content:center;gap:9px;direction:rtl;white-space:nowrap}
.zk-nm{display:inline-block;width:auto;max-width:none;height:calc(var(--h) * var(--k) * 1px);vertical-align:calc(var(--d) * var(--k) * -1px);
  filter:drop-shadow(0 0 6px rgba(253,246,236,.95)) drop-shadow(0 0 2px rgba(253,246,236,.9))}
.zk-amp{font:400 36px/1 'Great Vibes',cursive;color:${GOLD};text-shadow:0 0 8px #fbf2e4,0 0 3px #fbf2e4;margin:0 1px}
#rec2339662063 [field="tn_text_1779566247730000003"],#rec2339662063 [field="tn_text_1779626065755000001"]{transform:translateY(var(--zk-dy,40px));
  font-size:19px!important;line-height:1.4!important;font-weight:700!important;text-shadow:0 0 8px #fbf2e4,0 0 16px #fbf2e4,0 0 3px #fbf2e4}
/* كارت القوس */
html.zk #rec2339662083 [field="tn_text_1779624381838000001"]{font-size:18px!important;line-height:1.55!important;font-weight:400!important}
#rec2339662083 [data-elem-id="1779472210551000005"]{display:none!important}
.zk-ac{display:block;margin:12px 0 0;line-height:1.45}
.zk-ac b{display:block;font:700 20px/1.45 'Amiri',serif;color:${GOLD}}
.zk-ac i{display:block;font:400 15px/1.2 'Amiri',serif;font-style:normal;color:${GOLD}}
.zk-ad{display:block;margin:12px 0 0;font:400 16.5px/1.6 'Amiri',serif}
/* الدريس كود */
html.zk #rec2355542373 [field="tn_text_1779544773135"],html.zk #rec2355574603 [field="tn_text_1780767449362000001"],html.zk #rec2355574603 [field="tn_text_1780767518772000005"]{font-size:19px!important;line-height:1.55!important}
#rec2339662163 [field="tn_text_1763405219328"]{white-space:normal!important}
/* ===== الأقسام الجديدة: نفس خلفية القالب وألوانه ===== */
.zk-sec{position:relative;z-index:5;background:#f9e6d4;padding:34px 26px 38px;text-align:center;color:#2a2a2a;font-family:'Amiri',serif;font-variant-numeric:lining-nums}
.zk-title{margin:0;font:700 38px/1.5 'Aref Ruqaa',serif;color:${GOLD}}
.zk-flo{display:block;width:92px;height:auto;margin:2px auto 12px}
.zk-orn{display:flex;align-items:center;justify-content:center;gap:10px;width:160px;margin:8px auto 14px}
.zk-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,${GOLD})}.zk-orn i:last-child{transform:scaleX(-1)}
.zk-orn b{width:6px;height:6px;border:1px solid ${GOLD};transform:rotate(45deg)}
.zk-day{margin:0;font:700 22px/1.5 'Amiri',serif;color:#2a2a2a}
.zk-time{margin:2px 0 0;font:400 19px/1.5 'Amiri',serif;color:${GOLD}}
.zk-quran{max-width:330px;margin:24px auto 4px;padding:18px 16px 16px;border:1px solid rgba(134,103,57,.35);border-radius:14px;background:rgba(255,250,242,.55)}
.zk-hizb{display:block;width:40px;height:40px;margin:0 auto 8px}
.zk-q1{margin:0 0 8px;font:400 18px/1.6 'Amiri',serif;color:#2a2a2a}
.zk-q2{margin:2px 0 0;font:400 16px/1.7 'Amiri',serif;color:${GOLD}}
.zk-q2 b{font:700 21px/1.5 'Aref Ruqaa',serif;color:${GOLD};margin-right:4px}
.zk-venue{margin:20px 0 0}
.zk-vn{margin:0;font:700 30px/1.4 'Aref Ruqaa',serif;color:${GOLD}}
.zk-vc{margin:2px 0 0;font:400 18px/1.5 'Amiri',serif;color:#2a2a2a}
.zk-palw{margin:14px -26px 0}
.zk-palace{display:block;width:100%;max-width:480px;height:auto;margin:0 auto}
.zk-map{position:relative;max-width:360px;height:200px;margin:22px auto 0;border-radius:12px;overflow:hidden;border:1px solid rgba(134,103,57,.35);background:#efe4d4}
.zk-map iframe{display:block;width:100%;height:100%;border:0}
.zk-sec a.zk-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;margin:16px auto 0;padding:12px 26px;border-radius:999px;background:#747b54;color:#fff!important;text-decoration:none;font:600 16px/1 'El Messiri','Amiri',sans-serif}
.zk-pin{width:18px;height:18px;filter:brightness(0) invert(1)}
.zk-sec a.zk-cal{display:block;width:max-content;margin:14px auto 0;color:${GOLD}!important;font:600 14.5px/1.4 'El Messiri','Amiri',sans-serif;text-decoration:underline;text-underline-offset:4px}
#zk-henna{padding-bottom:30px}
#zk-wedding{padding-top:22px}
#zk-wedding::before{content:"";display:block;width:220px;max-width:70%;height:30px;margin:0 auto 18px;background:url(${IMG.divider}) center/contain no-repeat;opacity:.9}
/* تأكيد الحضور */
.zk-dl{margin:0 auto 18px;max-width:320px;font:400 18px/1.7 'Amiri',serif;color:${GOLD}}
.zk-form{max-width:340px;margin:0 auto;text-align:right}
.zk-lab{display:block;margin:0 0 8px;font:400 17px/1.4 'Amiri',serif;color:#2a2a2a}
.zk-form input,.zk-form textarea{display:block;width:100%;box-sizing:border-box;margin:0 0 16px;padding:10px 12px;border:1px solid rgba(42,42,42,.18);border-radius:4px;background:#fff;font:400 17px/1.4 'Amiri',serif;color:#2a2a2a}
.zk-form input:focus,.zk-form textarea:focus,.zk-sel select:focus{outline:none;border-color:${GOLD}}
.zk-choice,.zk-evs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 16px}
.zk-choice button,.zk-evs button{padding:10px 4px;border:1px solid rgba(42,42,42,.18);border-radius:4px;background:#fff;color:#2a2a2a;font:400 16px/1.25 'Amiri',serif;cursor:pointer}
.zk-choice button.on,.zk-evs button.on{background:#747b54;border-color:#747b54;color:#fff}
.zk-more[hidden]{display:none!important}
.zk-sel{max-width:140px;margin:0 0 16px}
.zk-sel select{-webkit-appearance:none;appearance:none;width:100%;padding:10px 14px 10px 38px;border:1px solid rgba(42,42,42,.18);border-radius:4px;
  background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 7'%3E%3Cpath d='M0 0h12L6 7z' fill='%23866739'/%3E%3C/svg%3E") left 14px center/11px 7px no-repeat;
  font:400 17px/1.2 'Amiri',serif;color:#2a2a2a;cursor:pointer}
.zk-send{display:block;margin:4px auto 0;padding:12px 40px;border:0;border-radius:4px;background:#747b54;color:#fff;font:600 16px/1 'El Messiri',sans-serif;cursor:pointer}
.zk-send:disabled{opacity:.6}
.zk-msg{min-height:1.4em;margin:12px 0 0;text-align:center;font:400 17px/1.5 'Amiri',serif;color:${GOLD}}
.zk-msg.err{color:#9b3b2e}
.zk-done{margin:6px 0 0;font:700 28px/1.5 'Aref Ruqaa',serif;color:${GOLD};direction:rtl}
`;

const FONTS = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=El+Messiri:wght@500;600&family=Great+Vibes&display=swap';

// قبل ما الصفحة ترسم: الدعوة عربي
const HEAD_SCRIPT = `<script>document.documentElement.classList.add('zk');document.documentElement.lang='ar';</script>`;

function script(now) {
  const nxt = nextEvent(now);
  const cfg = {
    fields: FIELDS.concat([[R('rec2339662093', 'tn_text_1771277026942000001'), CD_TITLE[nxt]]]),
    cd: CD_LABELS,
    title: 'دعوة زفاف عبدالرحمن وجيهاد · عبدالله وشامية',
    rsvp: `/i/${SHORT}/rsvp`,
    hide: ['rec2355511493', 'rec2339662113', 'rec2339662123', 'rec2339662133', 'rec2339662153'],
    sections: [['rec2339662093', 'zk-henna', HENNA], ['zk-henna', 'zk-wedding', WEDDING]],
    rsvpBefore: 'rec2339662123',
    rsvpHtml: RSVP,
  };
  const json = JSON.stringify(cfg).replace(/</g, '\\u003c');
  return `<script id="zk-script">(function () {
  var C = ${json};
  function $(s) { return document.querySelector(s); }
  function place() {
    C.hide.forEach(function (id) { var r = document.getElementById(id); if (r) r.style.display = 'none'; });
    C.sections.forEach(function (s) { var a = document.getElementById(s[0]); if (a && !document.getElementById(s[1])) a.insertAdjacentHTML('afterend', s[2]); });
    var r = document.getElementById(C.rsvpBefore);
    if (r && !document.getElementById('zkRsvp')) r.insertAdjacentHTML('beforebegin', C.rsvpHtml);
  }
  function texts() {
    // بنكتب كلامنا مرة، وبنرجّعه بس لو القالب كتب فوقه (مقارنة بالشكل اللي المتصفح حفظه — من غير ما الصور تتحمّل تاني)
    C.fields.forEach(function (f) { var el = $(f[0]); if (el && (el.__zk === undefined || el.innerHTML !== el.__zk)) { el.innerHTML = f[1]; el.__zk = el.innerHTML; } });
    ['days', 'hours', 'minutes', 'seconds'].forEach(function (k, i) { var n = document.getElementById(k); if (n && n.nextElementSibling) n.nextElementSibling.textContent = C.cd[i]; });
    document.title = C.title;
  }
  // التاريخ والساعة تحت آخر سطر أسامي على طول (بعد ما الصور تحمّل)
  function fitDate() {
    var rec = document.getElementById('rec2339662063'); if (!rec) return;
    var cn = rec.querySelector('.zk-cn'), d = rec.querySelector('[field="tn_text_1779566247730000003"]');
    if (!cn || !d) return;
    var bottom = cn.getBoundingClientRect().bottom; if (!bottom) return;
    var cur = parseFloat(getComputedStyle(rec).getPropertyValue('--zk-dy')); if (isNaN(cur)) cur = 40;
    var top = d.getBoundingClientRect().top - cur;
    rec.style.setProperty('--zk-dy', Math.round(bottom + 12 - top) + 'px');
  }
  // الخرايط بتتحمّل لما الضيف يقرب منها
  function maps() {
    var fs = [].slice.call(document.querySelectorAll('.zk-map iframe'));
    var load = function (f) { if (!f.src && f.getAttribute('data-src')) f.src = f.getAttribute('data-src'); };
    if (!('IntersectionObserver' in window)) { fs.forEach(load); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } }); }, { rootMargin: '900px 0px' });
    fs.forEach(function (f) { io.observe(f); });
  }
  // "أضف إلى التقويم": سفاري الآيفون بيفتح تقويم أبل، والبرامج اللي جوه (إنستجرام/فيسبوك...) بتسلّمه لسفاري
  function cal() {
    var ua = navigator.userAgent || '';
    var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    [].forEach.call(document.querySelectorAll('.zk-cal'), function (a) {
      var url = location.origin + a.getAttribute('href');
      a.setAttribute('href', url);
      if (!ios) { a.setAttribute('download', a.getAttribute('data-e') + '.ics'); return; }
      var notSafari = !/Safari\\//.test(ua) || /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|Snapchat|Line\\/|LinkedInApp|Twitter|GSA\\/|CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
      a.addEventListener('click', function (e) { e.preventDefault(); location.href = notSafari ? 'x-safari-' + url : url; });
    });
  }
  function rsvp() {
    var form = document.getElementById('zkForm'); if (!form) return;
    var att = null, msg = document.getElementById('zkMsg'), more = document.getElementById('zkMore');
    var say = function (t, bad) { msg.textContent = t; msg.className = 'zk-msg' + (bad ? ' err' : ''); };
    [].forEach.call(form.querySelectorAll('.zk-choice button'), function (b) {
      b.addEventListener('click', function () {
        att = b.getAttribute('data-a') === 'yes';
        [].forEach.call(form.querySelectorAll('.zk-choice button'), function (x) { x.classList.toggle('on', x === b); });
        more.hidden = !att; msg.textContent = '';
      });
    });
    [].forEach.call(form.querySelectorAll('.zk-evs button'), function (b) {
      b.addEventListener('click', function () { b.classList.toggle('on'); msg.textContent = ''; });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('zkName').value.trim().split(/\\s+/).join(' ');
      var note = document.getElementById('zkNote').value.trim();
      if (name.length < 2) { say('من فضلك اكتب اسمك', 1); return; }
      if (att === null) { say('من فضلك اختر: نعم أو لا', 1); return; }
      var evs = [].map.call(form.querySelectorAll('.zk-evs button.on'), function (b) { return b.getAttribute('data-e'); });
      if (att && !evs.length) { say('من فضلك اختر ليلة الحنة أو حفل الزفاف', 1); return; }
      var which = evs.length === 2 ? 'الحنة والفرح' : (evs[0] === 'henna' ? 'ليلة الحنة' : 'حفل الزفاف');
      var body = att ? 'عدد الحضور: ' + document.getElementById('zkCnt').value + ' — ' + which + (note ? ' — ' + note : '') : note;
      var send = document.getElementById('zkSend'); send.disabled = true;
      var first = name.split(' ')[0];
      fetch(C.rsvp, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ guestName: name, attending: att ? 'yes' : 'no', note: body.slice(0, 200) }) })
        .then(function (r) { if (!r.ok) throw 0; say(att ? 'شكرًا ' + first + ' — في انتظاركم 🤍' : 'شكرًا ' + first + ' — ستكونون في قلوبنا 🤍'); })
        .catch(function () { say('تعذّر الإرسال — حاول مرة أخرى', 1); })
        .then(function () { send.disabled = false; });
    });
  }
  function init() {
    place(); texts(); maps(); cal(); rsvp(); fitDate();
    // القالب بيكتب كلامه الإنجليزي في نفس الخانات وقت التحميل — بنرجّع بتاعنا كام مرة لحد ما يهدى
    var n = 0, t = setInterval(function () { texts(); fitDate(); if (++n > 16) clearInterval(t); }, 250);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitDate);
    [].forEach.call(document.querySelectorAll('.zk-nm'), function (im) { if (!im.complete) im.addEventListener('load', fitDate); });
    window.addEventListener('load', fitDate); window.addEventListener('resize', fitDate);
    var enter = document.querySelector('.popup-enter'); if (enter) enter.addEventListener('click', function () { setTimeout(fitDate, 600); setTimeout(fitDate, 2500); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();</script>`;
}

module.exports = {
  shortId: SHORT,
  EVENTS,
  nextEvent,

  // كارت لينك المشاركة 1200×630: ستاير القصر على الجنبين وختم البسملة والعرسانين بالدهبي (scratch zk/share.js)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف عبدالرحمن وجيهاد · عبدالله وشامية 🤍',
    description: 'ليلة الحنة الأربعاء ١٨ نوفمبر · حفل الزفاف الخميس ١٩ نوفمبر · الساعة ٧:٣٠ مساءً · قاعة الملكة، ملوي',
  },

  // "أضف إلى التقويم" لكل مناسبة: /i/zukBi1U/calendar.ics?e=henna أو ?e=wedding
  calendar: {
    title: 'زفاف عبدالرحمن وجيهاد · عبدالله وشامية',
    hours: 4,
    events: {
      henna: { title: 'ليلة حنة عبدالرحمن وجيهاد · عبدالله وشامية', start: '2026-11-18T19:30', hours: 4, location: 'مكان الحنة — الموقع على الخريطة', map: EVENTS.henna.map },
      wedding: { title: 'زفاف عبدالرحمن وجيهاد · عبدالله وشامية', start: '2026-11-19T19:30', hours: 5, location: 'قاعة الملكة، مركز ملوي، المنيا', map: EVENTS.wedding.map },
    },
  },

  render({ now } = {}) {
    return {
      head: `${HEAD_SCRIPT}<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS}"><style id="zk-style">${CSS}</style>`,
      bodyEnd: script(now),
    };
  },

  // العدّاد على المناسبة اللي جاية (الحنة لحد ما تبدأ، وبعدها الفرح)، و"EXPIRED" بتاعة القالب بالعربي.
  // خريطة القالب (قسمها مستخبي — كل مناسبة ليها خريطتها) بتتشال عشان ماتحمّلش على الفاضي.
  transform(html, { now } = {}) {
    const nxt = nextEvent(now);
    const at = startOf(EVENTS[nxt === 'done' ? 'wedding' : nxt]).toISOString();
    return html
      .replace(/"weddingDateTimeISO":"[^"]*"/, () => `"weddingDateTimeISO":"${at}"`)
      .replace('innerHTML = "EXPIRED"', () => `innerHTML = ${JSON.stringify(`<p class="zk-done">${CD_DONE[nxt]}</p>`)}`)
      .replace(/<iframe id="venueMapFrame"[^>]*><\/iframe>/, '');
  },
};
