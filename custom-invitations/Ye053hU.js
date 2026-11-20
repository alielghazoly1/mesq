// دعوة Ye053hU (قالب Lace) — زفاف فارس وصفاء، الخميس 17/12/2026 — قاعات أضواء للاحتفالات، المدينة المنورة.
// بطلب المالك (2026-11-20): الدعوة رجعت لشكل القالب الطبيعي بألوانه وصوره (اتشالت كل الإضافات القديمة: البرجندي،
// صور الكارت، الأيقونات، أجواء الحفل…)، وفوقه بس:
//  • حروفهم (ف ص — الصورة اللي بعتها) محفورة في الشمع على الختم بره: صورة الغلاف + فيديو الفتح فريم فريم.
//  • نسخة إنجليزي على /en (والعربي الافتراضي، و /ar كمان) — كل الكلام والأسامي والمكان وكارت المشاركة باللغة دي.
//  • برنامج الحفل سطرين: الحضور 9 ومراسم الزفاف 10 (باقي الفقرات مستخبية).
//  • من غير خريطة iframe — زرار الاتجاهات بس بأيقونة جوجل ماب.
//  • تأكيد الحضور: الاسم والحضور بس (من غير +1 والأطفال والأكل والرسالة).
//  • في آخر الدعوة: تنويه التصوير + "جنة الأطفال منازلهم".
//  • العدّاد بتوقيت السعودية (المدينة +3).
// الأقسام المستخبية (الإقامة/الهدية/المواصلات/الخريطة) والكلام القديم اتشالوا بـ oneOffFix Ye053hU-natural-nov20.
const { asset } = require('./_asset');

const SHORT = 'Ye053hU';
const DIR = `/custom/${SHORT}/`;
const KSA_OFFSET_H = 3;
const COVER = asset(`${DIR}cover.webp`);
const OPEN = asset(`${DIR}open.mp4`);

// الكلام لكل لغة (بيتحط بس لو العميل ماكتبش حاجة مكانه من المحرر)
const TEXTS = {
  ar: {
    lc25: '٩:٠٠ م', lc26: 'حضور الضيوف', lc27: 'نستقبلكم بكل الحب والفرح',
    lc28: '١٠:٠٠ م', lc29: 'مراسم الزفاف', lc30: 'دخول العروسين وبداية ليلة العمر',
  },
  en: {
    lc25: '9:00 PM', lc26: 'Guests Arrival', lc27: 'Welcoming you with love and joy.',
    lc28: '10:00 PM', lc29: 'Wedding Ceremony', lc30: 'The grand entrance of the bride and groom.',
  },
};
// الأسامي والمكان بالإنجليزي في نسخة /en (البيانات نفسها عربي)
const EN_FIELDS = {
  groomName: 'Fares', brideName: 'Safaa',
  venueName: 'Adwaa Hall (2)', venueCity: 'Al Madinah Al Munawwarah', venueAddress: 'Adwaa Celebration Halls',
};
const NOTICE = {
  ar: { t: 'تنويه مهم', p: 'نرجو من ضيوفنا الكرام الاستمتاع بتصوير فقرات الحفل واللقطات التذكارية الخاصة، مع الالتزام بعدم تصوير العروسين وأهل العروسين، حفاظًا على خصوصيتهم وتقديرًا لهم.', k: 'جنة الأطفال منازلهم' },
  en: { t: 'Kind Notice', p: 'We warmly invite our guests to enjoy capturing the celebration and their own special moments, while kindly refraining from photographing the bride, the groom and their families, out of respect for their privacy.', k: 'Children are best enjoyed at home 🤍' },
};

const CSS = `<style id="ye-style">
/* برنامج الحفل: سطرين بس (الحضور ومراسم الزفاف) */
[data-section="timeline"] .grid:has([data-elem-id="lc31"]),[data-section="timeline"] .grid:has([data-elem-id="lc34"]),[data-section="timeline"] .grid:has([data-elem-id="lc37"]){display:none!important}
/* تأكيد الحضور: الاسم والحضور بس */
#lcForm div:has(> [data-elem-id="lc80"]),#lcForm div:has(> [data-elem-id="lc83"]),#lcForm div:has(> [data-elem-id="lc84"]),#lcForm div:has(> [data-elem-id="lc85"]){display:none!important}
/* زرار الاتجاهات بأيقونة جوجل ماب (من غير الخريطة) */
#mapBtn{display:inline-flex!important;align-items:center;gap:10px;color:hsl(var(--foreground))!important;border-color:hsl(var(--foreground)/.45)!important;padding-left:30px!important;padding-right:30px!important}
#mapBtn .ye-gm{width:20px;height:20px;flex:none}
/* التنويه في آخر الدعوة */
.ye-nt{position:relative;margin:24px auto 0;max-width:520px;padding:0 26px;text-align:center}
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
  shareByLang: {
    ar: { title: 'دعوة زفاف فارس وصفاء', description: 'الخميس ١٧ ديسمبر ٢٠٢٦ · قاعات أضواء للاحتفالات — المدينة المنورة' },
    en: { title: 'Fares & Safaa — Wedding Invitation', description: 'Thursday, 17 December 2026 · Adwaa Celebration Halls, Al Madinah' },
  },

  render() {
    return { head: CSS };
  },

  transform(html, { editMode } = {}) {
    let out = html;
    const lang = /"language":"en"/.test(out) ? 'en' : 'ar';

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
        for (const [k, v] of Object.entries(TEXTS[lang])) if (!d.texts[k]) d.texts[k] = v;
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
