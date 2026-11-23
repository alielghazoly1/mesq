// دعوة Ye053hU (قالب Lace) — زفاف فارس وصفاء، الخميس 17/12/2026 — قاعات أضواء للاحتفالات، المدينة المنورة.
// بطلب المالك (2026-11-20): الدعوة رجعت لشكل القالب الطبيعي بألوانه وصوره (اتشالت كل الإضافات القديمة: البرجندي،
// صور الكارت، الأيقونات، أجواء الحفل…)، وفوقه بس:
//  • حروفهم (ف ص — الصورة اللي بعتها) محفورة في الشمع على الختم بره: صورة الغلاف + فيديو الفتح فريم فريم
//    (المالك 2026-11-20، آخر نسخة: الختم الأصلي بالورق زي ما هو، والحروف بقت F & S بالإنجليزي بنفس ستايل B & A
//    الأصلية — خط Petit Formal Script)، وصورة القاعة مكان رسمة المكان، وأغنيته.
//  • نسخة إنجليزي على /en (والعربي الافتراضي، و /ar كمان) — كل الكلام والأسامي والمكان وكارت المشاركة باللغة دي.
//  • برنامج الحفل سطرين: الحضور 9 ومراسم الزفاف 10 (باقي الفقرات مستخبية).
//  • من غير خريطة iframe — زرار الاتجاهات بس بأيقونة جوجل ماب.
//  • تأكيد الحضور: الاسم والحضور بس (من غير +1 والأطفال والأكل والرسالة).
//  • في آخر الدعوة: تنويه التصوير + "جنة الأطفال منازلهم".
//  • العدّاد بتوقيت السعودية (المدينة +3).
// الأقسام المستخبية (الإقامة/الهدية/المواصلات/الخريطة) والكلام القديم اتشالوا بـ oneOffFix Ye053hU-natural-nov20.
// الجولة 4 (2026-11-20): أول صفحة = حرفين ف ص + "كُتب لديسمبر أن يكون استثنائياً" بس، رسمة القاعة نزلت مكان صورة القاعة (اتشالت)،
// برنامج اليوم من غير العنوان + صف العشاء ١:٠٠، و"الزي المقترح" بقى كلام ليلة ديسمبر والعروسين (رسمة القالب).
// (2026-11-23) كارت اللينك: "دعوة زفاف فارس وصفاء" بس من غير الوصف اللي تحته، و Fares & Safaa اللي فوق التاريخ أغمق،
// والتاريخ أكبر وأغمق. وساعة العشاء "١:٠٠ ص" (زي "م" في الصفين اللي فوقها).
const { asset } = require('./_asset');

const SHORT = 'Ye053hU';
const DIR = `/custom/${SHORT}/`;
const KSA_OFFSET_H = 3;
const COVER = asset(`${DIR}cover.webp`);
const OPEN = asset(`${DIR}open.mp4`);
const SONG = asset(`${DIR}song.mp3`);   // (المالك 2026-11-20) أغنية LACE اللي بعتها
// (المالك 2026-11-20، الجولة الرابعة) أول صفحة: حرفين ف ص (الصورة اللي بعتها قبل كده) وتحتهم "كُتب لديسمبر أن يكون
// استثنائياً" بس. رسمة القاعة اللي كانت في أول صفحة نزلت مكان صورة القاعة (اللي اتشالت).
const MONO = asset(`${DIR}mono.webp`);
const VILLA = '/templates/lace/villa-illustration-thick.svg';
// العروسين اللي ماشيين (رسمة القالب الأصلية زي ما هي — المالك رفض نسخة الرقص 2026-11-20)
const COUPLE = '/templates/lace/dresscode-couple-new-transparent.webp';

// الكلام لكل لغة (بيتحط بس لو العميل ماكتبش حاجة مكانه من المحرر)
const TEXTS = {
  ar: {
    lc25: '٩:٠٠ م', lc26: 'حضور الضيوف', lc27: 'نستقبلكم بكل الحب والفرح',
    lc28: '١٠:٠٠ م', lc29: 'مراسم الزفاف', lc30: 'تبدأ مراسم الزفاف وبداية العمر',
    // (المالك 2026-11-23) جنب الساعة ١ "ص" — زي "م" اللي في الصفين اللي فوقها (مش "صباحاً")
    lc34: '١:٠٠ ص', lc35: 'العشاء', lc36: 'نجتمع على مائدة العشاء بكل الحب',
  },
  en: {
    lc25: '9:00 PM', lc26: 'Guests Arrival', lc27: 'Welcoming you with love and joy.',
    lc28: '10:00 PM', lc29: 'Wedding Ceremony', lc30: 'The wedding ceremony begins, and so does a lifetime.',
    lc34: '1:00 AM', lc35: 'Dinner', lc36: 'Gathering around the dinner table with love.',
  },
};
// الكلام الافتراضي اللي اتغيّر (لو لقيناه متخزّن زي ما هو بيتبدّل بالجديد): ساعة العشاء كانت "١:٠٠" من غير "ص"
const OLD_DEFAULTS = { lc34: '١:٠٠' };
// أول صفحة + مكان "الزي المقترح" (نفس كلام الصورة اللي بعتها وشكلها)
const HERO = {
  ar: 'كُتب لديسمبر أن يكون استثنائياً',
  en: 'December was written to be extraordinary',
};
const STORY = {
  ar: ['في إحدى ليالي ديسمبر، نال الحبيب محبوبته', 'رفاق العمر، أحباب الروح', 'بكل حب ندعوكم لحضور حفل زفاف'],
  en: ['On one of December’s nights, the beloved won his beloved', 'Lifelong friends, dearest souls', 'With love, we invite you to the wedding of'],
};
const heroHtml = (l) => `<div class="ye-hero"><img class="ye-mono" src="${MONO}" alt="ف ص" draggable="false"><p class="ye-hero-t font-display" data-elem-id="yh1">${HERO[l]}</p></div>`;
const storyHtml = (l) => `<div class="ye-story">
  <p class="ye-s1 font-display" data-elem-id="ys1">${STORY[l][0]}</p>
  <p class="ye-s2 font-display" data-elem-id="ys2">${STORY[l][1]}</p>
  <p class="ye-s2 font-display" data-elem-id="ys3">${STORY[l][2]}</p>
  <img class="ye-couple" src="${COUPLE}" alt="" aria-hidden="true" draggable="false">
  <p class="ye-names" data-elem-id="ys4">Fares &amp; Safaa</p>
  <p class="ye-date font-display" data-elem-id="ys5">17-12-2026</p></div>`;
// الأسامي والمكان بالإنجليزي في نسخة /en (البيانات نفسها عربي)
const EN_FIELDS = {
  groomName: 'Fares', brideName: 'Safaa',
  venueName: 'Adwaa Hall (2)', venueCity: 'Al Madinah Al Munawwarah', venueAddress: 'Adwaa Celebration Halls',
};
const NOTICE = {
  ar: { t: 'تنويه مهم', p: 'نرجو من ضيوفنا الكرام الاستمتاع بتصوير فقرات الحفل واللقطات التذكارية الخاصة، مع الالتزام بعدم تصوير العروسين وأهل العروسين، حفاظًا على خصوصيتهم وتقديرًا لهم.', k: 'جنة الأطفال منازلهم' },
  en: { t: 'Kind Notice', p: 'We warmly invite our guests to enjoy capturing the celebration and their own special moments, while kindly refraining from photographing the bride, the groom and their families, out of respect for their privacy.', k: 'Children are best enjoyed at home' },
};

const CSS = `<style id="ye-style">
/* برنامج الحفل: سطرين بس (الحضور ومراسم الزفاف) */
[data-section="timeline"] .grid:has([data-elem-id="lc31"]),[data-section="timeline"] .grid:has([data-elem-id="lc37"]){display:none!important}
/* تأكيد الحضور: الاسم والحضور بس */
#lcForm div:has(> [data-elem-id="lc80"]),#lcForm div:has(> [data-elem-id="lc83"]),#lcForm div:has(> [data-elem-id="lc84"]),#lcForm div:has(> [data-elem-id="lc85"]){display:none!important}
/* زرار الاتجاهات بأيقونة جوجل ماب (من غير الخريطة) */
#mapBtn{display:inline-flex!important;align-items:center;gap:10px;color:hsl(var(--foreground))!important;border-color:hsl(var(--foreground)/.45)!important;padding-left:30px!important;padding-right:30px!important}
#mapBtn .ye-gm{width:20px;height:20px;flex:none}
/* التنويه في آخر الدعوة */
/* مسافة تحتها عشان دانتيل الختام (اللي بيطلع لفوق) مايغطيش عليها */
.ye-nt{position:relative;margin:24px auto 0;max-width:520px;padding:0 26px calc(30vw + 40px);text-align:center}
@media (min-width:768px){.ye-nt{padding-bottom:230px}}
/* برنامج اليوم: من غير كلمة "برنامج اليوم" — "يوم للفرح…" هي العنوان. والصف الرابع (العشاء) ظاهر */
[data-elem-id="lc23"]{display:none!important}
[data-section="timeline"] [data-elem-id="lc24"]{font-size:17px!important;line-height:1.8!important;margin-top:0!important;color:hsl(var(--foreground))!important}
@media (min-width:768px){[data-section="timeline"] [data-elem-id="lc24"]{font-size:20px!important}}
html.ar [data-section="timeline"] [data-elem-id="lc24"]{font-family:'Amiri',serif}
/* "١:٠٠ ص" أعرض شوية من "٩:٠٠ م": على الشاشات الضيقة (٣٦٠) رسمة العشاء كانت بتلمس طرف الشاشة — أصغر سنة هناك بس */
@media (max-width:370px){html.ar div:has(> img[data-elem-id="lc107"]){width:68px!important;height:68px!important}}
/* أول صفحة: الحرفين وتحتهم الجملة بس */
#heroTxt>:not(.ye-hero){display:none!important}
.ye-hero{display:flex;flex-direction:column;align-items:center}
.ye-mono{display:block;width:auto;height:min(34vh,250px);pointer-events:none;-webkit-user-select:none;user-select:none;opacity:0;transform:translateY(10px) scale(.96);transition:opacity 1.8s ease,transform 2.2s cubic-bezier(.2,.7,.2,1)}
.ye-hero-t{margin-top:30px;padding:0 8px;font-size:23px;line-height:1.5;color:hsl(var(--foreground));opacity:0;transition:opacity 1.6s ease .9s}
@media (min-width:768px){.ye-mono{height:300px}.ye-hero-t{font-size:32px}}
#heroTxt.opacity-100 .ye-mono,#heroTxt:not(.opacity-0) .ye-mono{opacity:1;transform:none}
#heroTxt.opacity-100 .ye-hero-t,#heroTxt:not(.opacity-0) .ye-hero-t{opacity:1}
/* رسمة القاعة (اللي كانت في أول صفحة) مكان صورة القاعة — زي ما هي من غير إطار */
img.ye-villa{display:block;width:100%;height:auto;margin:0 auto;pointer-events:none;-webkit-user-select:none;user-select:none}
/* مكان "الزي المقترح": كلام ليلة ديسمبر جوه نفس إطار الدانتيل */
.ye-story{display:flex;flex-direction:column;align-items:center;text-align:center;color:hsl(var(--foreground));pointer-events:none;-webkit-user-select:none;user-select:none}
.ye-s1{font-size:21px;line-height:1.5}
.ye-s2{font-size:14.5px;line-height:1.75;color:hsl(var(--foreground)/.78);margin-top:8px}
.ye-s2+.ye-s2{margin-top:0}
/* (المالك 2026-11-23) الأسامي اللي فوق التاريخ أغمق (لون أعمق + خط أتقل شوية)، والتاريخ أكبر وأغمق */
.ye-names{font-family:'Ballet',cursive!important;font-size:25px;line-height:1.6;white-space:nowrap;direction:ltr;margin-top:2px;color:hsl(345 50% 15%);-webkit-text-stroke:.6px currentColor!important;paint-order:stroke fill}
.ye-date{font-size:20px;direction:ltr;letter-spacing:.05em;color:hsl(345 50% 15%);-webkit-text-stroke:.35px currentColor!important;paint-order:stroke fill}
html.ar .ye-s1,html.ar .ye-s2,html.ar .ye-hero-t{font-family:'Amiri',serif}
html:not(.ar) .ye-s1{font-size:19px}
html:not(.ar) .ye-hero-t{font-size:20px;max-width:310px}
@media (min-width:768px){.ye-s1{font-size:30px}.ye-s2{font-size:18px}.ye-names{font-size:44px;-webkit-text-stroke-width:.9px!important}.ye-date{font-size:25px;-webkit-text-stroke-width:.45px!important}}
/* العروسين ماشيين — رسمة القالب الأصلية */
.ye-couple{display:block;height:118px;width:auto;margin:12px auto 4px;pointer-events:none}
@media (min-width:768px){.ye-couple{height:200px}}
.ye-nt-card{position:relative;padding:38px 26px 34px;border:1px solid hsl(var(--foreground)/.28);border-radius:4px;background:hsl(var(--background)/.65)}
.ye-nt-card::before{content:"";position:absolute;inset:5px;border:1px solid hsl(var(--foreground)/.14);border-radius:2px;pointer-events:none}
.ye-nt-ic{width:30px;height:30px;margin:0 auto 12px;color:hsl(var(--foreground)/.75)}
.ye-nt-t{font-size:34px;line-height:1.15}
.ye-nt-p{margin-top:14px;font-size:14px;line-height:1.9;color:hsl(var(--foreground)/.82)}
.ye-nt-k{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px;font-size:21px;line-height:1.4;color:hsl(var(--foreground))}
.ye-nt-k::before,.ye-nt-k::after{content:"";width:28px;height:1px;background:hsl(var(--foreground)/.4)}
html.ar .ye-nt-p{font-family:'Amiri',serif;font-size:16px}
html.ar .ye-nt-t,html.ar .ye-nt-k{font-family:'Aref Ruqaa','Amiri',serif}
</style>`;

const GM = '<svg class="ye-gm" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>';
const CAM = '<svg class="ye-nt-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M9.5 5H15l1.5 2H19a2 2 0 0 1 2 2v8.5M17 19H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5"/><path d="M9.8 10.2a3 3 0 0 0 4 4"/></svg>';
const noticeHtml = (l) => `<div class="rv"><section class="ye-nt" aria-label="${NOTICE[l].t}"><div class="ye-nt-card">${CAM}
  <p class="ye-nt-t font-display text-foreground" data-elem-id="yn1">${NOTICE[l].t}</p>
  <p class="ye-nt-p font-helvetica" data-elem-id="yn2">${NOTICE[l].p}</p>
  <p class="ye-nt-k font-display" data-elem-id="yn3">${NOTICE[l].k}</p></div></section></div>`;

module.exports = {
  shortId: SHORT,
  // العربي الافتراضي (لغة البيانات) — /en أو ?lang=en للإنجليزي
  langs: ['ar', 'en'],
  // كارت لينك المشاركة (المالك 2026-11-20): الختم بحروفهم F & S جنب الأسامي عربي وإنجليزي والتاريخ والمكان (1200×630).
  // (المالك 2026-11-23) المكتوب بره "دعوة زفاف فارس وصفاء" بس — من غير سطر التاريخ والمكان اللي تحته
  // (الوصف بيتشال كله من الكارت: NO_SHARE_DESCRIPTION في utils/shareTags.js).
  share: {
    image: asset(`${DIR}share.jpg`), width: 1200, height: 630, overrideImage: true,
    title: 'دعوة زفاف فارس وصفاء',
  },
  shareByLang: {
    ar: { overrideImage: true, title: 'دعوة زفاف فارس وصفاء' },
    en: { overrideImage: true, title: 'Fares & Safaa — Wedding Invitation' },
  },

  render() {
    return { head: CSS };
  },

  transform(html, { editMode } = {}) {
    let out = html;
    const lang = /"language":"en"/.test(out) ? 'en' : 'ar';

    // الأغنية (لو العميل اختار أغنية من المحرر، بتاعته هي اللي بتشتغل)
    out = out.split('/templates/lace/song.mp3').join(SONG);
    // رسمة القاعة (من أول صفحة) مكان رسمة المكان (lc105)
    out = out.replace(/(<img\b[^>]*?)src="\/templates\/lace\/transport-lace-oval\.webp"([^>]*?)class="([^"]*)"([^>]*data-elem-id="lc105")/, (x, a, b, c, d) => `${a}src="${VILLA}"${b.replace(/alt="[^"]*"/, 'alt=""')}class="${c} ye-villa"${d}`);
    // أول صفحة: الحرفين + "كُتب لديسمبر أن يكون استثنائياً" (الباقي مستخبي بالـ CSS)
    out = out.replace(/(<div [^>]*id="heroTxt"[^>]*>)/, (x) => x + heroHtml(lang));
    // "الزي المقترح" → كلام ليلة ديسمبر والعروسين ماشيين (رسمة القالب) والأسامي والتاريخ (جوه نفس الإطار)
    out = out.replace(/<p class="font-display text-\[43px\][^"]*" data-elem-id="lc40">[\s\S]*?data-elem-id="lc42">[\s\S]*?<\/p>/, () => storyHtml(lang));
    // الختم بحروفهم (ف ص): الغلاف وفيديو الفتح
    out = out.split('/templates/lace/cover.webp?v=2').join(COVER).split('/templates/lace/open.mp4?v=2').join(OPEN);

    // العدّاد بتوقيت السعودية: الساعة المكتوبة (countdown) هي ساعة المدينة
    const m = out.match(/"countdown":\{"year":(\d{4}),"monthIndex":(\d{1,2}),"day":(\d{1,2}),"hour":(\d{1,2}),"minute":(\d{1,2})/);
    if (m) {
      const iso = new Date(Date.UTC(+m[1], +m[2], +m[3], +m[4] - KSA_OFFSET_H, +m[5])).toISOString();
      out = out.replace(/"weddingDateTimeISO":"[^"]*"/, `"weddingDateTimeISO":"${iso}"`);
    }

    // نسخة الإنجليزي: الأسامي والمكان بالإنجليزي في إعدادات الصفحة
    if (lang === 'en') {
      for (const [k, v] of Object.entries(EN_FIELDS)) {
        out = out.replace(new RegExp(`("${k}":)"(?:[^"\\\\]|\\\\.)*"`), (x, a) => `${a}${JSON.stringify(v)}`);
      }
    }

    // الكلام (برنامج الحفل) باللغة دي — لو العميل كتب حاجة مكانه من المحرر، كلامه هو اللي بيفضل
    out = out.replace(/var data = (\{.*?\});\n/, (whole, json) => {
      try {
        const d = JSON.parse(json);
        d.texts = d.texts || {};
        // الافتراضي القديم لو اتحفظ من المحرر زي ما هو (مش كلام العميل) → الجديد ياخد مكانه
        for (const [k, v] of Object.entries(TEXTS[lang])) if (!d.texts[k] || d.texts[k] === OLD_DEFAULTS[k]) d.texts[k] = v;
        return `var data = ${JSON.stringify(d).replace(/</g, '\\u003c')};\n`;
      } catch (e) { return whole; }
    });

    // زرار الاتجاهات بأيقونة جوجل ماب (الخريطة نفسها مستخبية — hiddenSections: map)
    out = out.replace(/(id="mapBtn"[^>]*>)/, `$1${GM}`);

    // التنويه في آخر الدعوة (قبل الختام)
    out = out.replace(/<div class="rv"><footer /, (x) => `${noticeHtml(lang)}${x}`);
    return out;
  },
};
