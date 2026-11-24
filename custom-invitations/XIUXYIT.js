// دعوة XIUXYIT (Mother of Pearl عربي) — عائلة السيد نظمي أحمد شاهين وعائلة السيد عادل أحمد عزب، زفاف أحمد،
// السبت 16/1/2027 الساعة 8 مساءً، فندق راديسون بلو — العين (الإمارات). بطلب المالك (2026-11-24):
//  1) عربي وإنجليزي: العربي الافتراضي، وزرار شيك فوق على اليمين بيحوّلها إنجليزي (اختيار الضيف بيتفتكر، و?lang=en بيفتحها إنجليزي).
//  2) أول ما الدعوة تتفتح: "اسحب للأسفل / Scroll down" تحت خالص بحركة شيك، والصفحة بتنزل لوحدها بالراحة (_glide.js).
//  3) أول صفحة بنفس ترتيب الصورة اللي بعتها المالك: تتشرف / العائلتين يمين وشمال و"و" في النص / بدعوتكم لحضور
//     حفل زفاف نجليهما / اسم العريس كبير / على كريمة السيد / وذلك بمشيئة الله تعالى / التاريخ والمكان والساعة
//     بأيقونات — بخط زي الصورة (Changa) بس بلون الدعوة وخلفيتها زي ما هم. اسم العريس مؤقتًا بخط (Mirza) لحد ما
//     المالك يبعت مخطوطة "أحمد" (feedback: الأسامي صور خط حقيقي).
//  4) الترتيب: الكارت ← العدّاد (بتوقيت الإمارات) ← "بقلوبٍ عامرة…" لحد "الساعة 8:00 مساءً" وتحته "أضف الموعد إلى
//     التقويم" (آيفون: تقويم أبل؛ أندرويد: تقويم الموبايل أو Google — بتنبيه قبلها بيومين وقبلها بيوم) ← تأكيد الحضور
//     بعدد الأشخاص ("عدد الحضور: N" في الرد — بيتجمع في لوحة العميل وصفحة الإحصائيات) ← المكان آخر حاجة.
// الأقسام الجديدة نسخة بنفس شكل القالب (نفس الكلاسات)، والأصلية بتستخبّى (مش بتتمسح — كود القالب بيفضل شغال).
// كل التغيير في transform: لو أي حتة من القالب اتغيّرت ومالقيناهاش، الصفحة بترجع زي ما كانت بالظبط (فيديو واحد).
// المحرر (editMode) زي ما هو من غير أي تغيير. البيانات نفسها (الأسامي/التاريخ/المكان) ماتلمستش.
const { asset } = require('./_asset');
const { makeOneVideo } = require('./_oneVideo');
const { glideScript } = require('./_glide');

const SHORT = 'XIUXYIT';
const T = '/templates/mother-of-pearl/';
// نفس فيديو الفتح الواحد بتاع دعوات Mother of Pearl العادية (utils/renderInvitation.js) — الدعوة الكاستم مابتاخدهوش
// تلقائي، فبنطبّقه هنا عشان الفتح يفضل زي ما هو بالظبط.
const oneVideo = makeOneVideo({ short: 'mother-of-pearl', openSrc: asset(`${T}open.mp4`), bps: 253000, dur: 10.08 });

const UAE_UTC_OFFSET = 4; // العين: توقيت الخليج UTC+4 طول السنة (من غير توقيت صيفي)
// حرف الإطار من جوّه في hero-frame.webp (941×1672): كل 10 بكسل من y=340 لـ y=1310 — [شمال، يمين]. اتقاس من الصورة نفسها
// (أول حتة بعد الورق ناحية الحبيبات، وأضيق قيمة في ±14 بكسل عشان نبقى في الأمان) — بيستخدمه fitCard في الصفحة.
const EDGE = [[308,629],[294,640],[288,644],[286,649],[286,651],[272,662],[253,682],[240,694],[234,702],[230,706],[228,708],[228,708],[228,708],[228,709],[223,711],[220,716],[207,723],[198,736],[191,745],[184,752],[181,754],[181,755],[181,755],[181,755],[181,755],[180,755],[180,755],[180,754],[180,754],[180,754],[180,754],[180,754],[180,754],[180,755],[180,755],[180,755],[180,755],[180,755],[180,755],[181,755],[181,755],[181,755],[181,755],[180,755],[180,755],[181,755],[181,755],[181,755],[180,755],[180,755],[180,755],[180,755],[180,755],[181,755],[181,755],[181,755],[181,755],[181,755],[181,755],[180,755],[181,755],[181,755],[181,755],[180,755],[180,755],[180,755],[180,754],[180,754],[180,754],[180,754],[180,755],[180,755],[180,755],[180,755],[180,755],[181,754],[183,753],[189,749],[200,745],[212,732],[220,722],[224,716],[225,712],[227,710],[227,710],[228,709],[231,706],[238,703],[244,699],[258,685],[283,658],[285,652],[287,650],[290,648],[294,643],[307,636],[329,608],[333,608]];

// أسامي اتكتبت بـ"تطويل" زي صورة المالك (محـمـد صـالـح الهاشمي)، وترجمتها الإنجليزي. أي اسم تاني يظهر زي ما هو.
const STYLED = {
  'نظمي أحمد شاهين': 'نظـمي أحـمـد شاهين',
  'عادل أحمد عزب': 'عـادل أحـمـد عزب',
};
const EN = {
  'نظمي أحمد شاهين': 'Nazmy Ahmed Shaheen',
  'عادل أحمد عزب': 'Adel Ahmed Azab',
  'العين': 'Al Ain',
};
const VENUE_EN = { 'فندق راديسون بلو': ['Radisson Blu', 'Hotel'] };
const VENUE_EN_ONE = { 'فندق راديسون بلو': 'Radisson Blu Hotel' };
// اسم العريس الكبير (مؤقتًا بخط Mirza، ونفس الطريقة بالإنجليزي بخط القالب)
const GROOM_AR = 'أحمد';
const GROOM_EN = 'Ahmed';

const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AD = '٠١٢٣٤٥٦٧٨٩';
const arDigits = (s) => String(s).replace(/\d/g, (d) => AD[+d]);
const pad2 = (n) => (n < 10 ? '0' : '') + n;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// "عائلة السيد / نظمي أحمد شاهين" → "نظمي أحمد شاهين"
const stripFamily = (s) => String(s || '').replace(/^\s*عائلة\s+(?:السيد|السيدة)?\s*\/?\s*/, '').trim();

// ملف الموعد (routes/invitations.js → /i/XIUXYIT/calendar.ics?e=ar|en): 8 مساءً لحد 12 بالليل (وقت الموبايل نفسه)،
// وتنبيهين: قبلها بيومين وقبلها بيوم
const CAL = {
  ar: { title: 'حفل زفاف أحمد شاهين', location: 'فندق راديسون بلو، العين' },
  en: { title: "Ahmed Shaheen's Wedding", location: 'Radisson Blu Hotel, Al Ain' },
  start: '2027-01-16T20:00',
  hours: 4,
  map: 'https://maps.app.goo.gl/6tU62H94EWbMMkML9',
};

function readConfig(html) {
  const m = /window\.WEDDING_CONFIG = (\{[\s\S]*?\});<\/script>/.exec(html);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (_) { return null; }
}

function facts(cfg) {
  const cd = cfg.countdown || {};
  const y = cd.year; const mi = cd.monthIndex; const d = cd.day;
  const h = typeof cd.hour === 'number' ? cd.hour : 20; const mn = typeof cd.minute === 'number' ? cd.minute : 0;
  const wd = new Date(Date.UTC(y, mi, d)).getUTCDay();
  const hm = `${h % 12 || 12}:${pad2(mn)}`;
  const venue = String(cfg.venueName || '');
  const city = String(cfg.venueAddress || cfg.venueCity || '');
  const vm = /^(فندق|قاعة|قاعات|مجلس|نادي|منتجع|قصر|دار|مسرح)\s+(.+)$/.exec(venue);
  return {
    groom: stripFamily(cfg.groomName), bride: stripFamily(cfg.brideName),
    groomRaw: String(cfg.groomName || ''), brideRaw: String(cfg.brideName || ''),
    dayAr: AR_DAYS[wd], dayEn: EN_DAYS[wd],
    dots: `${d}.${mi + 1}.${y}`, // زي الصورة: 19.7.2025
    dots2: `${pad2(d)}.${pad2(mi + 1)}.${y}`, // زي الختام الحالي: 16.01.2027
    hm, pmAr: h < 12 ? 'صباحًا' : 'مساءً', pmEn: h < 12 ? 'AM' : 'PM',
    venueAr: vm ? [vm[1], vm[2]] : [venue, ''],
    venueEn: VENUE_EN[venue] || [venue, ''],
    venueEnOne: VENUE_EN_ONE[venue] || venue,
    cityEn: EN[city] || city,
    whenEn: `${EN_DAYS[wd]}, ${d} ${EN_MONTHS[mi]}  |  ${hm} ${h < 12 ? 'AM' : 'PM'}`,
    cd: { y, mi, d, h, mn },
  };
}

// أيقونات بسيطة بلون الكلام (نفس اللي في صورة المالك: نتيجة / دبوس المكان / ساعة على 8)
const ICON = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.2" y="1.8" width="2.2" height="4.6" rx="1.1" fill="currentColor"/><rect x="15.6" y="1.8" width="2.2" height="4.6" rx="1.1" fill="currentColor"/>'
    + '<rect x="3.4" y="4.4" width="17.2" height="17" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.4 6.8a2.4 2.4 0 0 1 2.4-2.4h12.4a2.4 2.4 0 0 1 2.4 2.4V9.6H3.4z" fill="currentColor"/>'
    + '<g fill="currentColor"><rect x="5.9" y="11.4" width="2.4" height="2.2" rx=".4"/><rect x="9.6" y="11.4" width="2.4" height="2.2" rx=".4"/><rect x="13.3" y="11.4" width="2.4" height="2.2" rx=".4"/><rect x="17" y="11.4" width="1.4" height="2.2" rx=".4"/>'
    + '<rect x="5.9" y="15" width="2.4" height="2.2" rx=".4"/><rect x="9.6" y="15" width="2.4" height="2.2" rx=".4"/><rect x="13.3" y="15" width="2.4" height="2.2" rx=".4"/><rect x="17" y="15" width="1.4" height="2.2" rx=".4"/>'
    + '<rect x="5.9" y="18.4" width="2.4" height="1.6" rx=".4"/><rect x="9.6" y="18.4" width="2.4" height="1.6" rx=".4"/><rect x="13.3" y="18.4" width="2.4" height="1.6" rx=".4"/></g></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M12 1.6c-3.4 0-6.1 2.7-6.1 6.1 0 4.5 6.1 10.9 6.1 10.9s6.1-6.4 6.1-10.9c0-3.4-2.7-6.1-6.1-6.1zm0 8.8a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z"/>'
    + '<path fill="currentColor" d="M3.2 22.4l2.9-7.1h3.4l2.5 4.4 2.5-4.4h3.4l2.9 7.1z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" stroke-width="1.8"/>'
    + '<g fill="currentColor"><circle cx="12" cy="4.6" r=".75"/><circle cx="19.4" cy="12" r=".75"/><circle cx="12" cy="19.4" r=".75"/><circle cx="4.6" cy="12" r=".75"/>'
    + '<circle cx="15.7" cy="5.6" r=".5"/><circle cx="18.4" cy="8.3" r=".5"/><circle cx="18.4" cy="15.7" r=".5"/><circle cx="15.7" cy="18.4" r=".5"/><circle cx="8.3" cy="18.4" r=".5"/><circle cx="5.6" cy="15.7" r=".5"/><circle cx="5.6" cy="8.3" r=".5"/><circle cx="8.3" cy="5.6" r=".5"/></g>'
    + '<path d="M12 12V6.4M12 12l-3.6 2.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/></svg>',
  calBtn: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.6h17M8 3v4M16 3v4M12 12.6v4.6M9.7 14.9h4.6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9M12 3c-2.6 2.5-3.9 5.5-3.9 9s1.3 6.5 3.9 9"/></svg>',
};

// ===== 1) الكارت الأول (جوه #heroText — نفس الخلفية والإطار) =====
function heroHtml(f) {
  const gAr = esc(STYLED[f.groom] || f.groom);
  const bAr = esc(STYLED[f.bride] || f.bride);
  const gEn = esc(EN[f.groom] || f.groom);
  const bEn = esc(EN[f.bride] || f.bride);
  // الاسم الإنجليزي سطرين: "Mr. Nazmy Ahmed" / "Shaheen" (آخر كلمة لوحدها)
  const two = (n) => { const w = String(n).split(' '); return w.length > 1 ? `<span>Mr. ${w.slice(0, -1).join(' ')}</span><span>${w[w.length - 1]}</span>` : `<span>Mr. ${n}</span>`; };
  return `
      <div class="xi-h xi-l-ar" lang="ar" dir="rtl">
        <p class="xi-h1">تتشـرف</p>
        <div class="xi-fam">
          <p class="xi-f"><span>عائلة السيـد/</span><span>${gAr}</span></p>
          <span class="xi-and" aria-hidden="true">و</span>
          <p class="xi-f"><span>عائلة السيـد/</span><span>${bAr}</span></p>
        </div>
        <p class="xi-inv">بدعوتكم لحضور حفل زفاف نجليهما</p>
        <p class="xi-name">${GROOM_AR}</p>
        <p class="xi-to"><span>على كريمة السيـد/</span><span>${bAr}</span></p>
        <p class="xi-gw">وذلك بمشيئة الله تعالى</p>
        <div class="xi-info">
          <div>${ICON.cal}<span>${esc(f.dayAr)}</span><span dir="ltr">${esc(f.dots)}</span></div>
          <div>${ICON.pin}<span>${esc(f.venueAr[0])}</span><span>${esc(f.venueAr[1])}</span></div>
          <div>${ICON.clock}<span dir="ltr">${esc(f.hm)}</span><span>${esc(f.pmAr)}</span></div>
        </div>
      </div>
      <div class="xi-h xi-l-en" lang="en" dir="ltr">
        <p class="xi-h1">The families of</p>
        <div class="xi-fam">
          <p class="xi-f">${two(gEn)}</p>
          <span class="xi-and" aria-hidden="true">&amp;</span>
          <p class="xi-f">${two(bEn)}</p>
        </div>
        <p class="xi-inv">request the honour of your presence<br>at the wedding of their son</p>
        <p class="xi-name">${GROOM_EN}</p>
        <p class="xi-to"><span>to the daughter of</span><span>Mr. ${bEn}</span></p>
        <p class="xi-gw">God willing</p>
        <div class="xi-info">
          <div>${ICON.cal}<span>${esc(f.dayEn)}</span><span>${esc(f.dots)}</span></div>
          <div>${ICON.pin}<span>${esc(f.venueEn[0])}</span><span>${esc(f.venueEn[1])}</span></div>
          <div>${ICON.clock}<span>${esc(f.hm)}</span><span>${esc(f.pmEn)}</span></div>
        </div>
      </div>`;
}

const L = (ar, en) => `<span class="xi-l-ar">${ar}</span><span class="xi-l-en">${en}</span>`;

// ===== 2) العدّاد + 3) "بقلوبٍ عامرة…" بزرار التقويم + 4) تأكيد الحضور بعدد الأشخاص =====
function sectionsHtml(f) {
  const timeAr = `الساعة ${arDigits(f.hm)} ${f.pmAr}`;
  return `
  <!-- XIUXYIT: العدّاد (بتوقيت الإمارات) -->
  <div class="rv sec" data-xi="cd">
    <section class="cd" id="xi-countdown">
      <div class="cd-box">
        <img loading="lazy" decoding="async" src="${T}countdown-frame.webp" alt="" draggable="false">
        <h2 class="cd-title">${L('العدّ التنازلي', 'Countdown')}</h2>
        <div class="cd-grid">
          <div><span class="cd-n" data-xcd="0">00</span><span class="cd-l up">${L('يوم', 'Days')}</span></div>
          <div><span class="cd-n" data-xcd="1">00</span><span class="cd-l up">${L('ساعة', 'Hours')}</span></div>
          <div><span class="cd-n" data-xcd="2">00</span><span class="cd-l up">${L('دقيقة', 'Minutes')}</span></div>
          <div><span class="cd-n" data-xcd="3">00</span><span class="cd-l up">${L('ثانية', 'Seconds')}</span></div>
        </div>
        <p class="cd-soon">${L('نراكم قريبًا', 'See you soon!')}</p>
      </div>
    </section>
  </div>

  <!-- XIUXYIT: "بقلوبٍ عامرة…" لحد الساعة، وتحتها أضف الموعد للتقويم -->
  <div class="rv sec" data-xi="ft">
    <footer class="ft xi-ft">
      <div class="rv" style="--y:0px;--d:.8s">
        <img class="ft-seal" src="${T}seal.webp" alt="" draggable="false">
        <p class="ft-en-h xi-s46">${L('بقلوبٍ عامرة بالحمد والفرح،', 'With hearts full of gratitude and joy,')}</p>
        <p class="ft-en xi-s47">${L('ندعوكم لتشهدوا حفلة عقد قران السيد/ أحمــــــد شاهـــــين على كريمة السيد/ عادل عزب.', 'we invite you to witness the marriage contract of Mr. Ahmed Shaheen to the daughter of Mr. Adel Azab.')}</p>
        <p class="ft-en ft-en-2 xi-s48">${L('سائلين الله أن يبارك لنا ويجمع بيننا في الخير.', 'Praying that God blesses us and brings us together in goodness.')}</p>
        <p class="ft-l">${L('يسعدنا مشاركة كل الأحبة عقد قراننا،', 'We are delighted to share our marriage contract with all our loved ones,')}</p>
        <p class="ft-n xi-l-ar"><span class="ft-nm xi-s50">${esc(f.groomRaw)}</span> <span class="ft-amp">و</span> <span class="ft-nm xi-s51">${esc(f.brideRaw)}</span></p>
        <p class="ft-n xi-l-en"><span class="ft-nm">Shaheen Family</span> <span class="ft-amp">&amp;</span> <span class="ft-nm">Azab Family</span></p>
        <p class="ft-d xi-s52" dir="ltr">${esc(f.dots2)}</p>
        <p class="ft-d ft-t xi-s53">${L(esc(timeAr), `At ${esc(f.hm)} ${esc(f.pmEn)}`)}</p>
        <div class="xi-calw">
          <a class="btn xi-cal" id="xiCal" href="/i/${SHORT}/calendar.ics?e=ar"><span><span><b>${ICON.calBtn}${L('أضف الموعد إلى التقويم', 'Add to Calendar')}</b></span></span></a>
          <p class="xi-cal-note">${L('مع تذكيرٍ قبل الحفل بيومين وقبله بيوم', 'With reminders 2 days and 1 day before')}</p>
        </div>
      </div>
    </footer>
  </div>

  <!-- XIUXYIT: تأكيد الحضور بعدد الأشخاص -->
  <div class="rv sec" data-xi="rs">
    <section class="rs" id="xi-rsvp">
      <div class="rv rs-in">
        <h2 class="rs-t">${L('تأكيد الحضور', 'RSVP')}</h2>
        <p class="rs-k up">${L('نرجو الرد', 'Kindly respond')}</p>
        <p class="rs-s">${L('نتمنى أن نراكم', 'We hope to see you there')}</p>
        <form class="rs-f" id="xiForm" novalidate>
          <div class="rs-row">
            <label class="rs-l" for="xiName">${L('الاسم', 'Your Name')}</label>
            <input id="xiName" name="name" maxlength="80" autocomplete="name">
          </div>
          <div class="rs-row">
            <span class="rs-l" id="xiQ">${L('هل ستشاركوننا فرحتنا؟', 'Will you be attending?')}</span>
            <div class="rs-ch" role="radiogroup" aria-labelledby="xiQ">
              <button type="button" role="radio" aria-checked="false" data-a="yes"><span>${L('بكل سرور', 'Yes, with joy')}</span></button>
              <button type="button" role="radio" aria-checked="false" data-a="no"><span>${L('للأسف، لن أتمكّن', 'Sadly, no')}</span></button>
            </div>
          </div>
          <div class="rs-row xi-cnt" id="xiCntRow">
            <span class="rs-l" id="xiCntL">${L('عدد الحضور', 'Number of guests')}</span>
            <div class="xi-cbox"><div class="xi-cin" role="group" aria-labelledby="xiCntL">
              <button type="button" class="xi-cb" data-d="-1" aria-label="-"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>
              <div class="xi-cnum">
                <input id="xiCount" type="text" inputmode="numeric" maxlength="2" value="1" autocomplete="off" aria-labelledby="xiCntL">
                <span class="xi-cunit" id="xiCntUnit"></span>
              </div>
              <button type="button" class="xi-cb" data-d="1" aria-label="+"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg></button>
            </div></div>
            <p class="xi-chint">${L('بمن فيهم أنت · يمكنك كتابة الرقم مباشرة', 'Including you · you can also type the number')}</p>
          </div>
          <div class="rs-row">
            <label class="rs-l" for="xiNote">${L('اكتبوا لنا تهنئتكم', 'Write your congratulations')}</label>
            <textarea id="xiNote" name="note" maxlength="170" rows="4"></textarea>
            <span class="rs-cnt" id="xiNoteCnt" dir="ltr">0 / 170</span>
          </div>
          <div class="rs-go"><button type="submit" class="btn" id="xiSend"><span><span><b>${L('إرسال', 'Send')}</b></span></span></button></div>
          <p class="rs-msg" id="xiMsg" aria-live="polite"></p>
        </form>
        <div class="rs-done" aria-live="polite"><p>${L('شكرًا لكم', 'Thank you!')}</p><p>${L('وصلنا ردّكم — لكم منّا كل المحبة.', 'Your reply has been received — all our love.')}</p></div>
      </div>
    </section>
  </div>

`;
}

const SCROLL_HINT = `<a class="xi-scroll" id="xiScroll" href="#xi-countdown" aria-label="Scroll down"><span class="xi-scroll-t">${L('اسحب للأسفل', 'Scroll down')}</span><span class="xi-scroll-line"><i></i></span><svg class="xi-scroll-chev" viewBox="0 0 24 14" aria-hidden="true"><path d="M2 2l10 10L22 2"/></svg></a>`;
const LANG_BTN = `<button type="button" class="xi-lang" id="xiLang" aria-label="Switch to English"><span>${ICON.globe}${L('English', 'عربي')}</span></button>`;

const FONTS = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&display=swap">';

const STYLE = `<style id="xi-style">
/* اللغة: العربي الافتراضي (html.xi-en = إنجليزي) */
html:not(.xi-en) .xi-l-en,html.xi-en .xi-l-ar{display:none!important}
/* الأقسام الأصلية اللي اتعمل منها نسخة (مستخبّية مش ممسوحة) */
.xi-main>[data-section="countdown"]:not([data-xi]),.xi-main>[data-section="rsvp"]:not([data-xi]),.xi-main footer.ft:not(.xi-ft){display:none!important}
.xi-main #heroText>:not(.xi-h){display:none!important}

/* ===== 1) الكارت الأول — ترتيب صورة المالك ===== */
/* الكارت متوسّط في نص الإطار (الإطار نفسه أعلى من نص الشاشة) — top مش transform عشان fitHero بيكتب transform */
.xi-h{position:relative;top:var(--xi-up,-20px);transform:scale(var(--xi-k,1));display:flex;flex-direction:column;align-items:center;width:292px;max-width:100%;text-align:center;color:var(--fg)}
.xi-h p{margin:0}
.xi-h.xi-l-ar{font-family:'Amiri','Amiri Ar Local',serif;font-weight:400;letter-spacing:0}
/* (المالك 2026-11-24) نفس خط الدعوة الأصلي: الكلام Amiri والأسامي Aref Ruqaa زي الكارت القديم */
.xi-l-ar .xi-f span:last-child,.xi-l-ar .xi-to span:last-child{font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif;font-size:1.12em}
.xi-h.xi-l-ar .xi-name{font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif;line-height:1.35;margin-top:14px}
.xi-h .xi-h1{font-size:16px;line-height:1.4}
.xi-h .xi-fam{display:flex;align-items:center;justify-content:center;gap:calc(4px * var(--xi-fk,1));width:100%;margin-top:18px}
.xi-h .xi-f{flex:0 0 auto;width:var(--xi-cw,auto);display:flex;flex-direction:column;align-items:center;font-size:calc(13.5px * var(--xi-fk,1));line-height:1.65}
.xi-h .xi-f span{white-space:nowrap}
.xi-h .xi-and{flex:none;width:calc(26px * var(--xi-fk,1));font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif;font-size:calc(27px * var(--xi-fk,1));line-height:1;text-align:center;transform:translateY(-4px)}
.xi-h .xi-inv{font-size:14.5px;line-height:1.6;margin-top:16px}
.xi-h .xi-name{font-family:'Mirza','Amiri',serif;font-weight:400;font-size:60px;line-height:1.15;margin-top:6px}
.xi-h .xi-to{display:flex;flex-direction:column;align-items:center;font-size:14px;line-height:1.65;margin-top:4px}
.xi-h .xi-gw{font-size:14.5px;line-height:1.6;margin-top:14px}
.xi-h .xi-info{display:flex;justify-content:space-between;align-items:flex-start;width:calc(82% * var(--xi-ik,1));margin-top:16px}
.xi-h .xi-info>div{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;font-size:calc(13px * var(--xi-ik,1));line-height:1.5}
.xi-h .xi-info svg{display:block;width:calc(27px * var(--xi-ik,1));height:calc(27px * var(--xi-ik,1));margin:0 auto 6px;color:var(--fg)}
.xi-h .xi-info span{white-space:nowrap}
.xi-h .xi-info span:empty{display:none}
/* الإنجليزي: خطوط القالب الإنجليزي */
.xi-h.xi-l-en{font-family:'Cormorant Garamond',serif;font-weight:500}
.xi-l-en .xi-h1,.xi-l-en .xi-gw{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:13px;letter-spacing:.16em;text-transform:uppercase;line-height:1.6}
.xi-l-en .xi-f{font-size:calc(14.5px * var(--xi-fk,1));line-height:1.3;padding:0 4px}
.xi-l-en .xi-and{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:calc(24px * var(--xi-fk,1));transform:none}
.xi-l-en .xi-inv{font-size:16px;line-height:1.4;font-style:italic;margin-top:18px}
.xi-l-en .xi-name{font-family:'Monsieur La Doulaise Local',cursive;font-size:56px;line-height:1.1;margin-top:16px;margin-bottom:2px}
.xi-l-en .xi-to{font-size:16.5px;line-height:1.4;margin-top:4px}
.xi-l-en .xi-to span:first-child{font-style:italic}
.xi-l-en .xi-gw{margin-top:16px}
.xi-l-en .xi-info>div{font-size:calc(15.5px * var(--xi-ik,1));line-height:1.35}
@media (max-height:700px){.xi-h .xi-fam{margin-top:14px}.xi-h .xi-inv{margin-top:14px}.xi-h .xi-gw{margin-top:12px}.xi-h .xi-info{margin-top:16px}.xi-h .xi-name{font-size:54px}.xi-l-en .xi-name{font-size:48px;margin-top:10px}.xi-l-en .xi-inv{font-size:15px;margin-top:12px}.xi-l-en .xi-to{font-size:15px}.xi-l-en .xi-info svg{width:24px;height:24px;margin-bottom:5px}}
@media (min-width:768px){.xi-h{width:340px}.xi-h .xi-h1{font-size:17px}.xi-h .xi-f{font-size:calc(15px * var(--xi-fk,1))}.xi-h .xi-to{font-size:15px}.xi-h .xi-inv,.xi-h .xi-gw{font-size:15.5px}.xi-h .xi-name{font-size:68px}.xi-l-en .xi-f{font-size:calc(17px * var(--xi-fk,1))}.xi-l-en .xi-name{font-size:64px}}

/* "اسحب للأسفل" تحت خالص في الكارت */
.xi-scroll{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:22;display:flex;flex-direction:column;align-items:center;gap:7px;
  padding:6px 18px;border-radius:40px;background:radial-gradient(closest-side,rgba(var(--bg-rgb),.8),rgba(var(--bg-rgb),0));color:var(--fg);text-decoration:none;opacity:0;transform:translate(-50%,12px);transition:opacity 1.4s ease,transform 1.4s cubic-bezier(.2,.7,.2,1);pointer-events:none;-webkit-tap-highlight-color:transparent}
.xi-scroll.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.xi-scroll.gone{opacity:0;transform:translate(-50%,8px);pointer-events:none;transition-duration:.6s}
.xi-scroll.tight .xi-scroll-t{display:none}
.xi-scroll.tight .xi-scroll-line{height:24px}
.xi-scroll-t{white-space:nowrap}
.xi-scroll-t .xi-l-ar{font-family:'Amiri','Amiri Ar Local',serif;font-size:14px;line-height:1;opacity:.9}
.xi-scroll-t .xi-l-en{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:12px;letter-spacing:.3em;text-transform:uppercase;line-height:1;margin-right:-.3em;opacity:.9}
.xi-scroll-line{position:relative;display:block;width:1px;height:34px;overflow:hidden;background:rgba(var(--fg-rgb),.18)}
.xi-scroll-line i{position:absolute;left:0;top:-40%;width:1px;height:40%;background:linear-gradient(to bottom,rgba(var(--fg-rgb),0),var(--fg));animation:xiDrop 2.2s cubic-bezier(.6,0,.3,1) infinite}
.xi-scroll-chev{width:15px;height:9px;overflow:visible;animation:xiBob 2.2s ease-in-out infinite}
.xi-scroll-chev path{fill:none;stroke:var(--fg);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
@keyframes xiDrop{0%{top:-40%}70%,100%{top:100%}}
@keyframes xiBob{0%,45%{transform:translateY(-2px);opacity:.35}70%{transform:translateY(3px);opacity:1}100%{transform:translateY(-2px);opacity:.35}}
@media (min-width:768px){.xi-scroll{bottom:30px}.xi-scroll-line{height:48px}}
@media (prefers-reduced-motion:reduce){.xi-scroll-line i,.xi-scroll-chev{animation:none}.xi-scroll-line i{top:60%}}

/* زرار اللغة فوق على اليمين (بنفس شكل زرار الموسيقى) */
.xi-lang{position:fixed;top:calc(14px + env(safe-area-inset-top,0px));right:14px;z-index:46;display:block;border-radius:999px;border:1px solid rgba(var(--fg-rgb),.3);padding:3px;
  background:rgba(var(--bg-rgb),.74);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:var(--fg);opacity:0;transform:translateY(-6px);transition:opacity .9s ease,transform .9s ease,border-color .4s;pointer-events:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.xi-lang.on{opacity:1;transform:none;pointer-events:auto}
/* بيستخبّى وانت نازل (عشان مايغطيش الكلام) ويرجع أول ما تطلع لفوق أو توصل آخر الدعوة */
.xi-lang.on.tuck{opacity:0;transform:translateY(-14px);pointer-events:none}
.xi-lang>span{display:flex;align-items:center;gap:7px;height:34px;padding:0 15px 0 12px;border-radius:999px;border:1px solid rgba(var(--fg-rgb),.15);direction:ltr}
.xi-lang svg{width:15px;height:15px;flex:none;opacity:.85}
.xi-lang .xi-l-ar{font-family:'Jost',sans-serif;font-weight:300;font-size:11px;letter-spacing:.24em;text-transform:uppercase;line-height:1;margin-right:-.24em}
.xi-lang .xi-l-en{font-family:'Amiri','Amiri Ar Local',serif;font-size:15.5px;line-height:1}
@media (hover:hover){.xi-lang:hover{border-color:rgba(var(--fg-rgb),.6)}}
.xi-lang:active>span{background:rgba(var(--fg-rgb),.08)}

/* ===== 3) "بقلوبٍ عامرة…" — نفس مقاسات العميل في العربي (sizes mp46…mp53) ===== */
.xi-main .xi-ft{padding-top:56px}
html:not(.xi-en) .xi-ft .xi-s46{font-size:32px}
html:not(.xi-en) .xi-ft .xi-s47{font-size:19px}
html:not(.xi-en) .xi-ft .xi-s48{font-size:17px}
html:not(.xi-en) .xi-ft .ft-n .xi-s50{font-size:13px}
html:not(.xi-en) .xi-ft .ft-n .xi-s51{font-size:15px}
html:not(.xi-en) .xi-ft .xi-s52{font-size:18px}
html:not(.xi-en) .xi-ft .xi-s53{font-size:20px}
/* الإنجليزي أطول من جملة القالب الأصلية — بتنزل سطرين بدل ما تخرج بره الشاشة */
html.xi-en .xi-ft .ft-en-h{white-space:normal;font-size:min(40px,calc((100vw - 40px) * .115));line-height:1.2;max-width:330px}
html.xi-en .xi-ft .ft-l{max-width:320px;margin-left:auto;margin-right:auto;line-height:1.6}
/* (المالك 2026-11-24) الإنجليزي أوضح: الجمل الطويلة اللي كانت بخط اليد الرفيع بقت Cormorant مايل واضح */
html.xi-en .xi-ft .ft-en-h,html.xi-en #xi-rsvp .rs-s,html.xi-en #xi-rsvp .rs-done p:first-child,html.xi-en #xi-countdown .cd-soon,html.xi-en .xi-ft .ft-n,html.xi-en .xi-main [data-section="venue"] .loc-s{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;letter-spacing:.01em}
html.xi-en .xi-ft .ft-en-h{font-size:30px;line-height:1.25}
html.xi-en #xi-rsvp .rs-s{font-size:26px}
html.xi-en #xi-countdown .cd-soon{font-size:7vw}
html.xi-en .xi-ft .ft-n{font-size:30px;line-height:1.3;white-space:normal}
html.xi-en .xi-ft .ft-n .ft-nm{font-size:1em}
html.xi-en .xi-main [data-section="venue"] .loc-s{font-size:34px;white-space:normal}
html.xi-en .xi-ft .ft-en,html.xi-en .xi-main .loc-en,html.xi-en .xi-main .loc-when,html.xi-en .xi-main .loc-addr,html.xi-en #xi-rsvp .rs-ch button span{font-weight:500}
html.xi-en .xi-ft .ft-l,html.xi-en .xi-cal-note,html.xi-en .xi-chint{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:16px;letter-spacing:.01em;color:rgba(var(--fg-rgb),.8)}
html.xi-en .xi-cunit{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:19px}
.xi-calw{margin-top:28px;display:flex;flex-direction:column;align-items:center}
.xi-cal>span{border-color:rgba(var(--fg-rgb),.5)}
.xi-cal>span>span{display:flex;align-items:center;justify-content:center;background:var(--fg);color:var(--bg);border-color:var(--fg);padding:12px 26px}
.xi-cal b{display:flex;align-items:center;gap:10px}
.xi-cal b svg{width:18px;height:18px;flex:none}
html[dir=rtl] .xi-cal b{font-family:'Amiri','Amiri Ar Local',serif;font-size:16.5px;font-weight:400;letter-spacing:0;text-transform:none;line-height:20px}
@media (hover:hover){.xi-cal:hover>span>span{background:#3e4f63}}
.xi-cal-note{margin-top:12px;font-family:var(--sans);font-weight:300;font-size:11px;letter-spacing:.06em;color:rgba(var(--fg-rgb),.6)}
html[dir=rtl] .xi-cal-note{font-family:'Amiri','Amiri Ar Local',serif;font-size:15px;letter-spacing:0}

/* ===== 4) تأكيد الحضور ===== */
.xi-main #xi-rsvp{padding-top:40px}
.rs-ch button span span{display:inline;border:0;padding:0;background:none;color:inherit;font:inherit}
/* عدد الحضور: ظاهر من الأول (بيستخبّى بس لو الضيف اختار إنه مش هيحضر) — بنفس الإطار المزدوج بتاع زراير الفورم */
.xi-cnt{overflow:hidden;max-height:260px;transition:max-height .45s ease,opacity .35s ease,margin .45s ease}
.xi-cnt.xi-off{max-height:0;opacity:0;margin-bottom:0;pointer-events:none}
.xi-cnt .rs-l{text-align:center}
.xi-cbox{width:100%;max-width:300px;margin:4px auto 0;border:1px solid rgba(var(--fg-rgb),.35);padding:3px;direction:ltr}
.xi-cin{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(var(--fg-rgb),.15);padding:12px 14px;background:rgba(255,255,255,.35)}
.xi-cb{flex:none;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;border:1px solid rgba(var(--fg-rgb),.4);background:transparent;color:var(--fg);cursor:pointer;transition:background-color .3s,color .3s,border-color .3s,transform .15s;-webkit-tap-highlight-color:transparent}
.xi-cb svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.xi-cb:active{background:var(--fg);color:var(--bg);border-color:var(--fg);transform:scale(.94)}
.xi-cb[disabled]{opacity:.3;pointer-events:none}
@media (hover:hover){.xi-cb:hover{background:var(--fg);color:var(--bg);border-color:var(--fg)}}
.xi-cnum{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center}
.rs-f .xi-cnum input{width:84px;padding:0;border:0;border-bottom:1px solid rgba(var(--fg-rgb),.25);background:transparent;text-align:center;font-family:'Cormorant Garamond',serif;font-size:36px;line-height:1.15;color:var(--fg);border-radius:0}
html[dir=rtl] .rs-f .xi-cnum input{font-family:'Amiri','Amiri Ar Local',serif;font-size:32px;line-height:1.35}
.rs-f .xi-cnum input:focus{border-bottom-color:var(--fg)}
.xi-cunit{margin-top:4px;font-family:var(--script);font-size:22px;line-height:1.1;color:rgba(var(--fg-rgb),.85)}
html[dir=rtl] .xi-cunit{font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif;font-size:17px;line-height:1.5}
.xi-chint{margin:8px 0 0;text-align:center;font-family:var(--sans);font-weight:300;font-size:10.5px;letter-spacing:.06em;color:rgba(var(--fg-rgb),.55)}
html[dir=rtl] .xi-chint{font-family:'Amiri','Amiri Ar Local',serif;font-size:13.5px;letter-spacing:0}

/* ===== 5) المكان آخر حاجة — نفس المسافة اللي بين باقي الأقسام ===== */
.xi-main>[data-section="venue"] .loc{padding-top:64px;padding-bottom:104px}
@media (min-width:768px){.xi-main>[data-section="venue"] .loc{padding-top:88px}}

/* لوحة "أضف الموعد" على أندرويد والكمبيوتر */
.xi-sheet{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:flex-end;justify-content:center;background:rgba(40,50,64,0);transition:background .3s ease}
.xi-sheet.on{background:rgba(40,50,64,.45)}
.xi-sheet-c{width:100%;max-width:460px;box-sizing:border-box;padding:22px 20px calc(18px + env(safe-area-inset-bottom,0px));border-radius:26px 26px 0 0;background:var(--bg);box-shadow:0 -12px 40px rgba(40,50,64,.25);
  transform:translateY(105%);transition:transform .38s cubic-bezier(.2,.8,.2,1);text-align:center;color:var(--fg)}
.xi-sheet.on .xi-sheet-c{transform:none}
.xi-sheet-bar{width:40px;height:4px;border-radius:4px;background:rgba(var(--fg-rgb),.25);margin:-8px auto 14px}
.xi-sheet-t{margin:0;font-family:'Aref Ruqaa','Aref Ruqaa Ar Local',serif;font-size:24px;line-height:1.3}
html.xi-en .xi-sheet-t{font-family:'Monsieur La Doulaise Local',cursive;font-size:34px}
.xi-sheet-s{margin:4px 0 16px;font-family:'Amiri','Amiri Ar Local',serif;font-size:15px;line-height:1.6;color:rgba(var(--fg-rgb),.8)}
html.xi-en .xi-sheet-s{font-family:'Cormorant Garamond',serif;font-size:17px}
.xi-sheet-o{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;margin:0 0 10px;padding:13px 16px;border:1px solid rgba(var(--fg-rgb),.22);border-radius:18px;background:#fff;
  font:inherit;color:inherit;text-align:start;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.xi-sheet-o:active{transform:scale(.985)}
.xi-sheet-o i{flex:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:13px;background:var(--fg);color:var(--bg)}
.xi-sheet-o i svg{width:24px;height:24px}
.xi-sheet-o b{display:block;font-family:'Amiri','Amiri Ar Local',serif;font-weight:700;font-size:17px;line-height:1.35}
.xi-sheet-o small{display:block;font-family:'Amiri','Amiri Ar Local',serif;font-size:13.5px;line-height:1.45;color:rgba(var(--fg-rgb),.7)}
html.xi-en .xi-sheet-o b,html.xi-en .xi-sheet-o small{font-family:'Cormorant Garamond',serif}
html.xi-en .xi-sheet-o b{font-size:18px}
.xi-sheet-x{margin-top:4px;padding:10px 24px;border:0;background:none;font-family:'Amiri','Amiri Ar Local',serif;font-size:16px;color:rgba(var(--fg-rgb),.7);cursor:pointer}
html.xi-en .xi-sheet-x{font-family:'Cormorant Garamond',serif;font-size:18px}
.xi-hint{position:fixed;left:50%;bottom:24px;z-index:2147483000;transform:translateX(-50%);width:max-content;max-width:calc(100% - 40px);padding:12px 20px;border-radius:14px;
  background:rgba(52,64,80,.95);color:#f7f5f3;font:400 15px/1.7 'Amiri','Amiri Ar Local',serif;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:opacity .3s ease}
</style>`;

// قبل أول رسمة: لو الضيف اختار إنجليزي قبل كده (أو اللينك فيه ?lang=en) نبدأ إنجليزي من غير ومضة
function earlyLang(key) {
  try {
    var m = /[?&]lang=(en|ar)(?:&|$)/i.exec(location.search);
    var l = m ? m[1].toLowerCase() : null;
    if (!l) { try { l = localStorage.getItem(key); } catch (e) { l = null; } }
    if (l === 'en') { var r = document.documentElement; r.classList.add('xi-en'); r.lang = 'en'; r.dir = 'ltr'; }
  } catch (e) { /* العربي زي ما هو */ }
}

// كل اللي بيحصل في الصفحة للضيف (بيتحط كما هو كسكريبت — من غير backslash escaping)
function xiClient(X) {
  var root = document.documentElement;
  var main = document.querySelector('main.xi-main');
  if (!main) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* */ } },
  };
  var AD = '٠١٢٣٤٥٦٧٨٩';
  var isEn = function () { return root.classList.contains('xi-en'); };
  var dg = function (s) { s = String(s); return isEn() ? s : s.replace(/\d/g, function (c) { return AD[+c]; }); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var tx = function (k) { return X.t[k][isEn() ? 1 : 0]; };

  /* ---------- كلام القالب اللي فاضل (المكان آخر الصفحة + جملة الغلاف) ---------- */
  var orig = {};
  function applyTexts() {
    var en = isEn();
    X.swap.forEach(function (p) {
      var el = $(p[0]);
      if (!el) return;
      if (!(p[0] in orig)) orig[p[0]] = el.textContent;
      var want = en ? p[1] : orig[p[0]];
      if (want != null && el.textContent !== want) el.textContent = want;
    });
    var nm = $('#xiName'), nt = $('#xiNote');
    if (nm) nm.placeholder = tx('phName');
    if (nt) nt.placeholder = tx('phNote');
    if (!('title' in orig)) orig.title = document.title;
    document.title = en ? X.titleEn : orig.title;
  }

  /* ---------- 2) العدّاد بتوقيت الإمارات ---------- */
  var cd = X.cd;
  var target = Date.UTC(cd.y, cd.mi, cd.d, cd.h - X.tz, cd.mn);
  var nums = $$('[data-xcd]');
  function tick() {
    var ms = Math.max(0, target - Date.now());
    var v = [Math.floor(ms / 864e5), Math.floor(ms / 36e5 % 24), Math.floor(ms / 6e4 % 60), Math.floor(ms / 1e3 % 60)];
    nums.forEach(function (el, i) { var t = dg(pad2(v[i])); if (el.textContent !== t) el.textContent = t; });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 4) تأكيد الحضور بعدد الأشخاص ---------- */
  var form = $('#xiForm'), sec = $('#xi-rsvp');
  var msg = $('#xiMsg'), send = $('#xiSend'), name = $('#xiName'), note = $('#xiNote'), ncnt = $('#xiNoteCnt');
  var cntRow = $('#xiCntRow'), out = $('#xiCount'), unit = $('#xiCntUnit');
  var SENT_KEY = 'mithaq_rsvp_' + X.short;
  var att = null, count = 1;
  // "شخص واحد" / "شخصان" / "٣ أشخاص" / "١٢ شخصًا" — والإنجليزي person / people
  function unitText(n) {
    if (isEn()) return n === 1 ? 'person' : 'people';
    return n === 1 ? 'شخص واحد' : n === 2 ? 'شخصان' : n <= 10 ? 'أشخاص' : 'شخصًا';
  }
  function stepRender() {
    if (!out) return;
    if (document.activeElement !== out) out.value = dg(count);
    if (unit) unit.textContent = unitText(count);
    $$('.xi-cb', cntRow).forEach(function (b) { var d = +b.getAttribute('data-d'); b.disabled = d < 0 ? count <= 1 : count >= X.maxGuests; });
  }
  // الضيف يقدر يكتب العدد بنفسه (أرقام عربي أو إنجليزي)
  function readTyped() {
    var v = String(out.value || '').replace(/[٠-٩]/g, function (c) { return AD.indexOf(c); }).replace(/\D/g, '');
    return v ? parseInt(v, 10) : NaN;
  }
  if (form) {
    $$('.xi-cb', form).forEach(function (b) {
      b.addEventListener('click', function () { count = Math.max(1, Math.min(X.maxGuests, count + (+b.getAttribute('data-d')))); out.blur(); stepRender(); });
    });
    out.addEventListener('input', function () {
      var n = readTyped();
      if (!isNaN(n)) { count = Math.max(1, Math.min(X.maxGuests, n)); if (unit) unit.textContent = unitText(count); }
    });
    out.addEventListener('focus', function () { try { out.select(); } catch (e) { /* */ } });
    out.addEventListener('blur', stepRender);
    out.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); out.blur(); } });
    var btns = $$('.rs-ch button', form);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        att = b.getAttribute('data-a') === 'yes';
        btns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
        // العدد ظاهر من الأول — بيستخبّى بس لو الضيف مش هيحضر
        cntRow.classList.toggle('xi-off', !att);
        msg.textContent = '';
      });
    });
    note.addEventListener('input', function () { ncnt.textContent = note.value.length + ' / 170'; });
    if (store.get(SENT_KEY)) sec.classList.add('sent');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = name.value.trim().replace(/\s+/g, ' ');
      if (n.length < 2) { msg.textContent = tx('errName'); name.focus(); return; }
      if (att === null) { msg.textContent = tx('errAtt'); return; }
      var typed = readTyped();
      if (!isNaN(typed)) count = Math.max(1, Math.min(X.maxGuests, typed));
      stepRender();
      var words = note.value.trim().slice(0, 170);
      // العدد بيتكتب في الرد نفسه بنفس الشكل اللي لوحة العميل وصفحة الإحصائيات بتقراه (utils/statsPage.js noteCounts)
      var body = att ? ('عدد الحضور: ' + count + (words ? ' — ' + words : '')) : words;
      send.disabled = true; msg.textContent = '';
      fetch('/i/' + encodeURIComponent(X.short) + '/rsvp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ guestName: n, attending: att ? 'yes' : 'no', note: body }),
      }).then(function (r) {
        if (!r.ok) throw r;
        store.set(SENT_KEY, '1');
        store.set('mithaq_guest_name', n);
        sec.classList.add('sent');
      }).catch(function (r) {
        msg.textContent = r && r.status === 429 ? tx('errMany') : tx('errNet');
        send.disabled = false;
      });
    });
  }

  /* ---------- 3) أضف الموعد للتقويم ---------- */
  var cal = $('#xiCal');
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var appBrowser = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|Snapchat|Line\/|LinkedInApp|Twitter|; wv\)/i.test(ua);
  var notSafari = !/Safari\//.test(ua) || appBrowser || /GSA\/|CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
  function icsPath() { return '/i/' + X.short + '/calendar.ics?e=' + (isEn() ? 'en' : 'ar'); }
  function icsUrl() { return location.origin + icsPath(); }
  function gLink() {
    var c = X.cal, f = function (d) { return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + '00'; };
    var s = new Date(Date.UTC(cd.y, cd.mi, cd.d, cd.h, cd.mn)), e = new Date(s.getTime() + c.hours * 3600e3);
    var lang = isEn() ? c.en : c.ar;
    var det = (isEn() ? 'Map: ' : 'الموقع على الخريطة: ') + c.map + '\n' + (isEn() ? 'Invitation: ' : 'الدعوة: ') + location.origin + '/i/' + X.short;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(lang.title) + '&dates=' + f(s) + '/' + f(e)
      + '&location=' + encodeURIComponent(lang.location) + '&details=' + encodeURIComponent(det);
  }
  function fileAndroid() {
    // متصفح جوه التطبيقات (إنستجرام/فيسبوك) مابينزّلش ملفات — بنفتحه في كروم
    if (android && appBrowser) {
      location.href = 'intent://' + location.host + icsPath() + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(icsUrl()) + ';end';
      return;
    }
    var d = document.createElement('a');
    d.href = icsUrl(); d.download = 'ahmed-shaheen-wedding.ics'; d.style.display = 'none';
    document.body.appendChild(d); d.click();
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1000);
  }
  function sheet() {
    if ($('.xi-sheet')) return;
    var w = document.createElement('div');
    w.className = 'xi-sheet';
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', tx('calTitle'));
    w.dir = isEn() ? 'ltr' : 'rtl';
    w.innerHTML = '<div class="xi-sheet-c"><div class="xi-sheet-bar"></div><p class="xi-sheet-t"></p><p class="xi-sheet-s"></p>'
      + '<button type="button" class="xi-sheet-o" data-k="file"><i>' + X.icon + '</i><span><b></b><small></small></span></button>'
      + '<a class="xi-sheet-o" data-k="g" target="_blank" rel="noopener"><i>' + X.icon + '</i><span><b></b><small></small></span></a>'
      + '<button type="button" class="xi-sheet-x"></button></div>';
    $('.xi-sheet-t', w).textContent = tx('calTitle');
    $('.xi-sheet-s', w).textContent = tx('calWhen');
    $('[data-k="file"] b', w).textContent = tx(android ? 'calFile' : 'calFileDesk');
    $('[data-k="file"] small', w).textContent = tx(android ? 'calFileSub' : 'calFileDeskSub');
    $('[data-k="g"] b', w).textContent = tx('calG');
    $('[data-k="g"] small', w).textContent = tx('calGSub');
    $('.xi-sheet-x', w).textContent = tx('cancel');
    $('[data-k="g"]', w).href = gLink();
    document.body.appendChild(w);
    function close() { w.classList.remove('on'); setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 400); }
    w.addEventListener('click', function (e) {
      if (e.target === w || e.target.closest('.xi-sheet-x')) { close(); return; }
      var o = e.target.closest('.xi-sheet-o');
      if (!o) return;
      if (o.getAttribute('data-k') === 'file') { e.preventDefault(); fileAndroid(); }
      setTimeout(close, 250);
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('on'); }); });
  }
  function hint() {
    var d = document.createElement('div');
    d.className = 'xi-hint';
    d.setAttribute('role', 'status');
    d.dir = isEn() ? 'ltr' : 'rtl';
    d.textContent = tx('safari');
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = '1'; });
    var close = function () { d.style.opacity = '0'; setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 350); };
    d.addEventListener('click', close);
    setTimeout(close, 7000);
  }
  if (cal) {
    cal.addEventListener('click', function (e) {
      e.preventDefault();
      if (!ios) { sheet(); return; }
      var ics = icsUrl();
      if (!notSafari) { location.href = ics; return; }
      var left = false;
      var mark = function () { if (document.visibilityState === 'hidden') left = true; };
      document.addEventListener('visibilitychange', mark);
      window.addEventListener('pagehide', function () { left = true; });
      location.href = 'x-safari-' + ics;
      setTimeout(function () { document.removeEventListener('visibilitychange', mark); if (!left) hint(); }, 1800);
    });
  }

  /* ---------- زرار اللغة ---------- */
  var btn = $('#xiLang');
  function anchor() {
    var best = null;
    $$('main > section, main > div').forEach(function (el) { var r = el.getBoundingClientRect(); if (!best && r.bottom > 40 && r.height) best = el; });
    return best;
  }
  function setLang(l, save) {
    var a = anchor(), before = a ? a.getBoundingClientRect().top : 0;
    var en = l === 'en';
    root.classList.toggle('xi-en', en);
    root.lang = en ? 'en' : 'ar';
    root.dir = en ? 'ltr' : 'rtl';
    applyTexts(); tick(); stepRender(); fitCard();
    if (cal) cal.setAttribute('href', icsPath());
    if (btn) btn.setAttribute('aria-label', en ? 'التبديل إلى العربية' : 'Switch to English');
    if (save) store.set(X.langKey, l);
    // سطر أسامي العائلتين بيصغر لحد ما يبقى سطر واحد (fitAll في القالب بيشتغل مع resize) — الإنجليزي كان مستخبّي فمكانش اتقاس
    try { window.dispatchEvent(new Event('resize')); } catch (e) { /* */ }
    // الضيف يفضل في نفس الحتة اللي كان بيقراها (طول الكلام بيتغيّر بين اللغتين)
    if (a && scrollY > 0) {
      var sb = root.style.scrollBehavior; root.style.scrollBehavior = 'auto';
      scrollBy(0, a.getBoundingClientRect().top - before);
      root.style.scrollBehavior = sb;
    }
  }
  if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); setLang(isEn() ? 'ar' : 'en', true); });
  applyTexts();
  stepRender();
  if (cal) cal.setAttribute('href', icsPath());

  /* ---------- الكارت جوه الإطار على أي موبايل ----------
     (المالك 2026-11-24: "Mr. Nazmy… داخل في أطراف الإطار") — خريطة حرف الإطار من hero-frame.webp (X.edge: كل 10 بكسل
     في الصورة من y=340، [شمال، يمين] جوّه الحبيبات). الإطار بيتعرض object-fit:cover، والقالب بيصغّر الكلام كله
     بـ scale(min(1, sc/0.43)) (fitHero).
       1) الكارت بيتوسّط على نص الإطار (X.midY في الصورة) مش نص الشاشة.
       2) كل سطر لازم يبعد عن حرف الإطار عند ارتفاعه بـ X.gap (في الصورة) على الأقل: سطر العائلتين وسطر الأيقونات
          بيصغروا لوحدهم لو احتاجوا (--xi-fk / --xi-ik)، ولو لسه في حاجة قريبة الكارت كله بيصغر سنة (--xi-k). */
  function geom() {
    var img = $('.hero-img'), box = $('.hero');
    if (!img || !box || !box.clientWidth || !box.clientHeight) return null;
    var iw = img.naturalWidth || 941, ih = img.naturalHeight || 1672;
    var bw = box.clientWidth, bh = box.clientHeight, r = box.getBoundingClientRect();
    var sc = Math.max(bw / iw, bh / ih);
    return { sc: sc, s: Math.min(1, sc / 0.43), ox: r.left + (bw - iw * sc) / 2, oy: r.top + (bh - ih * sc) / 2, gap: X.gap * sc };
  }
  // حرف الإطار على الشاشة (أضيق حتة بين y1 و y2) — بره الخريطة = مقفول
  function edges(g, y1, y2) {
    var a = (y1 - g.oy) / g.sc, b = (y2 - g.oy) / g.sc, l = -Infinity, r = Infinity;
    for (var y = Math.floor(a / 10) * 10; y <= b + 9; y += 10) {
      var i = Math.round((y - X.edgeY0) / 10);
      var e = i >= 0 && i < X.edge.length ? X.edge[i] : [470, 471];
      if (e[0] > l) l = e[0];
      if (e[1] < r) r = e[1];
    }
    return { l: g.ox + l * g.sc, r: g.ox + r * g.sc };
  }
  // مستطيلات الكلام الحقيقي (مش عرض العنصر) + الأيقونات
  function inkRects(root) {
    var out = [];
    $$('p, span, svg', root).forEach(function (el) {
      if (el.tagName.toLowerCase() === 'svg') { var rb = el.getBoundingClientRect(); if (rb.width) out.push(rb); return; }
      if (el.children.length) return;
      var rg = document.createRange();
      rg.selectNodeContents(el);
      Array.prototype.forEach.call(rg.getClientRects(), function (r) { if (r.width > 1 && r.height > 1) out.push(r); });
    });
    return out;
  }
  // أقل مسافة بين الكلام وحرف الإطار (بكسل الشاشة) + معامل التصغير اللي يخلّي الكل بعيد بـ gap
  function measure(g, root) {
    var worst = Infinity, k = 1, cx = g.ox + 470 * g.sc;
    inkRects(root).forEach(function (r) {
      var e = edges(g, r.top, r.bottom);
      worst = Math.min(worst, r.left - e.l, e.r - r.right);
      var half = Math.max(cx - r.left, r.right - cx), room = Math.min(cx - e.l, e.r - cx) - g.gap;
      if (half > 0 && room < half) k = Math.min(k, Math.max(0, room) / half);
    });
    return { worst: worst, k: k };
  }
  function center(g, b) {
    var r = b.getBoundingClientRect();
    if (!r.height) return;
    var want = g.oy + X.midY * g.sc, top = parseFloat(b.style.getPropertyValue('--xi-up')) || 0;
    var next = top + (want - (r.top + r.bottom) / 2) / g.s;
    b.style.setProperty('--xi-up', next.toFixed(1) + 'px');
  }
  function shrink(g, b, sel, v) {
    var row = $(sel, b);
    if (!row) return;
    for (var n = 0; n < 4; n += 1) {
      var m = measure(g, row);
      if (m.k >= 0.995) return;
      var cur = parseFloat(b.style.getPropertyValue(v)) || 1;
      b.style.setProperty(v, Math.max(0.62, cur * m.k * 0.985).toFixed(3));
    }
  }
  function fitCard() {
    var g = geom();
    if (!g) return;
    var W = innerWidth >= 768 ? 340 : 292;
    // الكارت كله بيصغر بنفس نسبة الإطار تحت مقاس الأساس (آيفون 13 من غير شريط المتصفح: sc = X.refSc) — نفس التصميم بس أصغر
    var base = Math.min(1, g.sc / X.refSc) / g.s;
    $$('.xi-h').forEach(function (b) {
      if (b.style.width !== W + 'px') b.style.width = W + 'px';
      if (!b.offsetHeight) return;
      ['--xi-fk', '--xi-ik', '--xi-cw'].forEach(function (v) { b.style.removeProperty(v); });
      b.style.setProperty('--xi-k', Math.min(1, base).toFixed(3));
      // عمودين العائلتين بنفس العرض (عشان "و" تفضل في النص بالظبط) — بالـ em عشان يصغروا مع الخط
      var cols = $$('.xi-fam .xi-f', b), cw = 0;
      cols.forEach(function (c) { cw = Math.max(cw, c.offsetWidth / (parseFloat(getComputedStyle(c).fontSize) || 14)); });
      if (cw) b.style.setProperty('--xi-cw', cw.toFixed(3) + 'em');
      center(g, b);
      shrink(g, b, '.xi-fam', '--xi-fk');
      shrink(g, b, '.xi-info', '--xi-ik');
      center(g, b);
      for (var n = 0; n < 6; n += 1) {
        var m = measure(g, b);
        if (m.worst >= g.gap - 0.5) break;
        var k = parseFloat(b.style.getPropertyValue('--xi-k')) || 1;
        if (k <= 0.6) break;
        b.style.setProperty('--xi-k', Math.max(0.6, k * 0.96).toFixed(3));
        center(g, b);
      }
    });
  }
  // للاختبار: أقل مسافة بين كلام الكارت وحرف الإطار دلوقتي
  window.__xiRoom = function () { var g = geom(), b = $$('.xi-h').filter(function (x) { return x.offsetHeight; })[0]; return g && b ? Math.round(measure(g, b).worst * 10) / 10 : null; };
  fitCard();
  addEventListener('resize', fitCard);
  addEventListener('load', fitCard);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCard);

  /* ---------- بعد فتح الدعوة: زرار اللغة + "اسحب للأسفل" ---------- */
  var ht = $('#heroText'), hintA = $('#xiScroll');
  var shown = false, gone = false;
  function fitHint() {
    if (!hintA) return;
    hintA.classList.remove('tight');
    var low = 0;
    $$('.xi-h p, .xi-h .xi-info', ht).forEach(function (el) { if (el.offsetHeight) low = Math.max(low, el.getBoundingClientRect().bottom); });
    if (hintA.getBoundingClientRect().top < low + 6) hintA.classList.add('tight');
  }
  function opened() {
    if (shown) return;
    shown = true;
    fitCard();
    setTimeout(function () { if (btn) btn.classList.add('on'); }, 600);
    setTimeout(function () { if (gone || !hintA || scrollY >= 40) return; fitHint(); hintA.classList.add('on'); }, 1500);
  }
  if (!ht || ht.classList.contains('on')) opened();
  else {
    try {
      new MutationObserver(function (m, o) { if (ht.classList.contains('on')) { o.disconnect(); opened(); } }).observe(ht, { attributes: true, attributeFilter: ['class'] });
    } catch (e) { setTimeout(opened, 12000); }
  }
  addEventListener('resize', function () { if (shown && !gone) fitHint(); });
  // زرار اللغة: بيستخبّى وانت نازل ويرجع لما تطلع لفوق (أو في أول الصفحة / آخرها)
  var lastY = scrollY, tuckRaf = 0;
  addEventListener('scroll', function () {
    if (!btn || tuckRaf) return;
    tuckRaf = requestAnimationFrame(function () {
      tuckRaf = 0;
      var y = scrollY, end = y + innerHeight >= document.documentElement.scrollHeight - 4;
      if (y < 120 || end) btn.classList.remove('tuck');
      else if (y > lastY + 6) btn.classList.add('tuck');
      else if (y < lastY - 10) btn.classList.remove('tuck');
      if (Math.abs(y - lastY) > 6 || y < 120 || end) lastY = y;
    });
  }, { passive: true });
  addEventListener('scroll', function () {
    if (!gone && hintA && scrollY > 60) { gone = true; hintA.classList.remove('on'); hintA.classList.add('gone'); }
  }, { passive: true });
  if (hintA) {
    hintA.addEventListener('click', function (e) {
      e.preventDefault();
      var t = $('#xi-countdown');
      var y = t ? t.getBoundingClientRect().top + scrollY - 10 : innerHeight;
      try { scrollTo({ top: y, behavior: 'smooth' }); } catch (x) { scrollTo(0, y); }
    });
  }
}

const TEXTS = {
  phName: ['الاسم بالكامل', 'Full name'],
  phNote: ['رسالتكم للعروسين…', 'Your message to the couple…'],
  errName: ['من فضلك اكتب اسمك', 'Please write your name.'],
  errAtt: ['من فضلك أخبرنا هل ستحضر', 'Please let us know if you will be attending.'],
  errNet: ['لم يصل الرد — حاول مرة أخرى بعد لحظة', 'Something went wrong — please try again.'],
  errMany: ['محاولات كثيرة — حاول مرة أخرى بعد قليل', 'Too many tries — please try again in a little while.'],
  calTitle: ['احفظوا الموعد', 'Save the Date'],
  calWhen: ['السبت ١٦ يناير ٢٠٢٧ — الساعة ٨:٠٠ مساءً', 'Saturday, 16 January 2027 — 8:00 PM'],
  calFile: ['تقويم الموبايل', 'Phone calendar'],
  calFileSub: ['سامسونج وأي تقويم على الموبايل — بتذكير قبلها بيومين وبيوم', 'Samsung or any phone calendar — reminders 2 days & 1 day before'],
  calFileDesk: ['ملف التقويم', 'Calendar file'],
  calFileDeskSub: ['Outlook وتقويم أبل — بتذكير قبلها بيومين وبيوم', 'Outlook & Apple Calendar — reminders 2 days & 1 day before'],
  calG: ['تقويم Google', 'Google Calendar'],
  calGSub: ['يفتح التقويم والموعد جاهز للحفظ', 'Opens with the event ready to save'],
  cancel: ['إلغاء', 'Cancel'],
  safari: ['لإضافة الموعد إلى تقويم الآيفون افتح الدعوة في Safari من زر •••', 'To add the date to your iPhone calendar, open the invitation in Safari from the ••• button'],
};

function clientScript(f) {
  const X = {
    short: SHORT,
    tz: UAE_UTC_OFFSET,
    // الإطار في hero-frame.webp (941×1672): الجزء المستقيم من x=181 لـ x=755، والخريطة كاملة في EDGE
    frame: 574,
    midY: 820,
    refSc: 0.5048,
    gap: 36,
    edgeY0: 340,
    edge: EDGE,
    cd: f.cd,
    maxGuests: 20,
    langKey: `xi_lang_${SHORT}`,
    titleEn: 'Wedding Invitation — Shaheen & Azab Families',
    icon: ICON.calBtn,
    cal: { hours: CAL.hours, map: CAL.map, ar: CAL.ar, en: CAL.en },
    t: TEXTS,
    // كلام القالب اللي بيفضل (قسم المكان + جملة الغلاف): [selector, الإنجليزي] — العربي بيتحفظ من الصفحة نفسها
    swap: [
      ['#cvHint', 'Tap to open'],
      ['[data-elem-id="mp21"]', 'The Venue'],
      ['[data-elem-id="mp22"]', 'Where we celebrate'],
      ['[data-elem-id="mp23"]', f.venueEnOne],
      ['[data-elem-id="mp24"]', f.cityEn],
      ['[data-elem-id="mp25"]', f.whenEn],
      ['[data-elem-id="mp26"]', 'We would love to have you with us.'],
      ['[data-elem-id="mp28"]', 'View Location'],
    ],
  };
  return `<script id="xi-js">(${xiClient.toString()})(${JSON.stringify(X).replace(/</g, '\\u003c')});</script>`;
}

// النسخة الأصلية من القالب اللي بنعدّل عليها: لازم كل حتة تتلاقى مرة واحدة بالظبط
const A = {
  hero: '<div class="hero-text" id="heroText">',
  cd: '<!-- 3) العدّاد -->',
  venueFrom: '<!-- 5) المكان',
  venueTo: '<!-- 6) تأكيد الحضور',
  main: '<main>',
  mainEnd: '</main>',
};
const once = (s, a) => s.indexOf(a) !== -1 && s.indexOf(a) === s.lastIndexOf(a);

module.exports = {
  shortId: SHORT,

  // كارت اللينك (واتساب/فيسبوك) — بإطار الدعوة وخطوطها ولونها (المالك 2026-11-24: "صورة اللينك والكلام اللي تحتها شيك")
  share: {
    image: asset(`/custom/${SHORT}/share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة حفل زفاف · عائلة السيد نظمي أحمد شاهين وعائلة السيد عادل أحمد عزب',
    description: 'السبت ١٦ يناير ٢٠٢٧ · الساعة ٨:٠٠ مساءً · فندق راديسون بلو — العين',
  },

  // ملف الموعد: /i/XIUXYIT/calendar.ics?e=ar|en (الزرار بيختار حسب لغة الضيف)، وتنبيهين: قبلها بيومين وقبلها بيوم
  calendar: {
    title: CAL.ar.title,
    hours: CAL.hours,
    alarms: ['-P2D', '-P1D'],
    events: {
      ar: { title: CAL.ar.title, start: CAL.start, hours: CAL.hours, location: CAL.ar.location, map: CAL.map, lang: 'ar' },
      en: { title: CAL.en.title, start: CAL.start, hours: CAL.hours, location: CAL.en.location, map: CAL.map, lang: 'en' },
    },
  },

  render() {
    return {};
  },

  transform(html, { editMode } = {}) {
    if (editMode) return html;
    // فيديو فتح واحد — زي أي دعوة Mother of Pearl عادية
    const base = oneVideo(html) || html;
    const cfg = readConfig(base);
    if (!cfg || !cfg.countdown) return base;
    for (const k of ['hero', 'cd', 'venueFrom', 'venueTo', 'main', 'mainEnd']) {
      if (!once(base, A[k])) { console.warn(`[XIUXYIT] template piece not found: ${k} — page left as the template`); return base; }
    }
    const vFrom = base.indexOf(A.venueFrom);
    const vTo = base.indexOf(A.venueTo);
    const venue = base.slice(vFrom, vTo);
    if (vTo <= vFrom || !venue.includes('data-section="venue"')) return base;

    const f = facts(cfg);
    let out = base.slice(0, vFrom) + base.slice(vTo);                       // المكان بيتشال من مكانه…
    out = out.replace(A.mainEnd, () => `  ${venue.trimEnd()}\n</main>`);     // …ويتحط آخر حاجة
    out = out.replace(A.cd, () => `${sectionsHtml(f)}  ${A.cd}`);          // العدّاد + الختام + الحضور بعد الكارت
    out = out.replace(A.hero, () => `${SCROLL_HINT}\n    ${A.hero}${heroHtml(f)}`);
    out = out.replace(A.main, () => '<main class="xi-main">');
    out = out.replace(/<\/head>/i, () => `${FONTS}${STYLE}<script id="xi-lang-early">(${earlyLang.toString()})(${JSON.stringify(`xi_lang_${SHORT}`)});</script></head>`);
    const end = out.lastIndexOf('</body>');
    const tail = `${LANG_BTN}${clientScript(f)}${glideScript({ playSel: '#heroText', playClass: 'on', after: 3000, speed: 80 })}`;
    out = end === -1 ? out + tail : out.slice(0, end) + tail + out.slice(end);
    return out;
  },
};
