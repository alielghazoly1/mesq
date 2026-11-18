// دعوة Ye053hU (قالب Lace عربي) — زفاف فارس وصفاء، الخميس 17/12/2026 (8 رجب 1448)، قاعة أضواء (2) —
// قاعات أضواء للاحتفالات، المدينة المنورة. بطلب المالك (2026-11-18) من كارت التفاصيل اللي بعته:
//  • الأسامي "فارس & صفاء" مقصوصة من الكارت بتاعه نفسه (نفس الشكل واللون) — في الكارت الأول والختام.
//  • "بارك الله لهما…" فوق الأسامي، والتاريخ الهجري تحت التاريخ.
//  • "تشرف السيدة رقية عصر بدعوتكم…" في كارت الترحيب.
//  • فقرات الحفل الأربعة بأيقونات الكارت (استقبال الضيوف، الزفة المدينية، زفة العروسين، العشاء) — الفقرة الخامسة اتشالت.
//  • مكان "الزي المقترح": أجواء الحفل (ركن القهوة، الطاولة المدينية، الفوتو شوت) بصور الكارت.
//  • مكان "المواصلات": تنويه التصوير + "جنة الأطفال منازلهم"؛ والأطفال اتشالوا من تأكيد الحضور.
//  • الإقامة والهدية مستخبيين (oneOffFix Ye053hU-fares-safaa، مع الأسامي والميعاد والمكان والكلام كله — يتعدّل من المحرر).
//  • العدّاد بتوقيت السعودية (المدينة +3): الساعة 9 مساءً هناك مش 9 بتوقيت القاهرة.
// لو أي حتة من القالب مش لاقيينها بتتساب زي ما هي (ولا حاجة بتبوظ). في المحرر: الأسامي كلام عادي (عشان تتعدّل).
const { asset } = require('./_asset');

const SHORT = 'Ye053hU';
const DIR = `/custom/${SHORT}/`;
const KSA_OFFSET_H = 3;

const A = {};
['name-fares', 'name-safaa', 'ic-reception', 'ic-zaffa', 'ic-rings', 'ic-dinner', 'am-photo', 'am-table', 'am-coffee', 'ic-nocam-light']
  .forEach((n) => { A[n] = asset(`${DIR}${n}.webp`); });

// (المالك 2026-11-18) البرجندي بتاع الدعوة كلها = نفس برجندي الكارت والأيقونات بتاعته (#701619) بدل نبيتي القالب
['art-1', 'art-4', 'villa-illustration-thick'].forEach((n) => { A[n] = asset(`${DIR}${n}.svg`); });
A.tulle = asset(`${DIR}tulle-texture-burgundy.webp`);
const CSS = `<style id="ye-style">
html:root{--foreground:358 67% 26%!important;--primary:358 62% 31%!important;--accent:358 62% 31%!important;--ring:358 62% 31%!important;
  --card-foreground:358 62% 31%!important;--muted-foreground:358 62% 31%!important;--popover-foreground:358 62% 31%!important;--secondary-foreground:358 62% 31%!important}
#countdown{background-color:#701619!important}
/* الأسامي صور (من كارت المالك) */
.ye-nm{display:block;height:auto;margin:0 auto;pointer-events:none;-webkit-user-select:none;user-select:none}
.ye-hero-nm{width:min(46vw,210px)}
.ye-hero-nm.s{width:min(45vw,205px)}
.ye-has-img{display:none!important}
.ye-end-nm{display:inline-block;vertical-align:middle;height:1.05em;width:auto}
.ye-hijri{margin-top:6px;font-family:'Amiri',serif;font-size:15px;line-height:1.6;color:hsl(var(--foreground)/.75)}
/* فقرات الحفل (المالك 2026-11-18): الأيقونات كلها عمود واحد تحت بعض، نفس المقاس، والكلام جنبها */
.ye-tl{position:relative;width:max-content;max-width:min(340px,100%);min-width:250px;margin:0 auto;padding:4px 0}
.ye-tl::before{content:"";position:absolute;top:44px;bottom:44px;right:47px;width:1px;background:linear-gradient(hsl(var(--foreground)/0),hsl(var(--foreground)/.35) 12%,hsl(var(--foreground)/.35) 88%,hsl(var(--foreground)/0))}
.ye-tl-row{position:relative;display:grid;grid-template-columns:96px minmax(0,1fr);align-items:center;column-gap:18px;padding:14px 0}
.ye-tl-ic{position:relative;z-index:1;width:96px;height:80px;display:flex;align-items:center;justify-content:center;background:hsl(var(--background))}
.ye-tl-ic img{width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-select:none;user-select:none}
.ye-tl-tx{display:flex;flex-direction:column;align-items:flex-start;text-align:right;min-width:0}
.ye-tl-time{display:inline-block;padding:3px 14px 4px;border-radius:99px;background:hsl(var(--foreground));color:hsl(var(--background));font-family:'Amiri',serif;font-weight:700;font-size:14px;line-height:1.45;white-space:nowrap}
.ye-tl-title{margin-top:7px;font-family:'Amiri',serif;font-weight:700;font-size:20px;line-height:1.35;color:hsl(var(--foreground))}
.ye-tl-desc{margin-top:1px;font-family:'Amiri',serif;font-size:14px;line-height:1.45;color:hsl(var(--foreground)/.72)}
@media (min-width:768px){.ye-tl{max-width:420px}.ye-tl-title{font-size:23px}.ye-tl-time{font-size:15px}}
/* أجواء الحفل: الصور كبيرة وواضحة، كل واحدة في سطرها */
.ye-am{position:relative;padding:72px 20px 40px;text-align:center}
.ye-am-t{font-size:44px;line-height:1.15}
.ye-am-orn{display:block;width:120px;height:14px;margin:14px auto 30px;color:hsl(var(--foreground)/.55)}
.ye-am-it img{display:block;margin:0 auto;-webkit-user-select:none;user-select:none}
.ye-am-it.big img{width:min(72vw,320px);height:auto}
.ye-am-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:330px;margin:28px auto 0;align-items:end}
.ye-am-row img{width:100%;height:118px;object-fit:contain}
.ye-pill{display:inline-block;margin-top:12px;padding:6px 18px;border-radius:99px;background:linear-gradient(#f1dfd2,#e7cdbb);color:hsl(var(--foreground));
  font-family:'Amiri',serif;font-weight:700;font-size:16px;line-height:1.4;box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 2px 6px rgba(110,40,40,.08)}
@media (min-width:768px){.ye-am-t{font-size:64px}.ye-am-it.big img{width:400px}.ye-am-row{max-width:420px}.ye-am-row img{height:150px}}
/* التنويه (مكان المواصلات) */
.ye-nocam{width:96px!important;height:auto}
.ye-kids-wrap{margin-top:34px;display:flex;align-items:center;justify-content:center;gap:12px}
.ye-kids-wrap .ye-kd{flex:none;width:30px;height:1px;background:hsl(var(--background)/.55)}
.ye-kids-wrap p.ye-kids{margin:0!important;max-width:none!important;font-family:'Amiri',serif;font-weight:700;font-size:21px!important;line-height:1.5;color:hsl(var(--background))!important}
/* تأكيد الحضور من غير أطفال (جنة الأطفال منازلهم) */
#mithaq-rsvp div:has(> [data-elem-id="lc83"]){display:none!important}
</style>`;

const ORN = '<svg class="ye-am-orn" viewBox="0 0 120 14" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M2 7h44M74 7h44"/><path d="M60 2l5 5-5 5-5-5z"/><circle cx="50" cy="7" r="1.4" fill="currentColor"/><circle cx="70" cy="7" r="1.4" fill="currentColor"/></svg>';

const AMBIENCE = `<section class="ye-am" aria-label="أجواء الحفل">
      <h2 class="ye-am-t font-display text-foreground" data-elem-id="ya1">أجواء الحفل</h2>
      ${ORN}
      <div class="ye-am-it big rvf"><img loading="lazy" decoding="async" src="${A['am-table']}" alt="الطاولة المدينية" draggable="false" data-elem-id="ya5"><span class="ye-pill" data-elem-id="ya2">الطاولة المدينية</span></div>
      <div class="ye-am-row">
        <div class="ye-am-it rvf"><img loading="lazy" decoding="async" src="${A['am-coffee']}" alt="ركن القهوة" draggable="false" data-elem-id="ya6"><span class="ye-pill" data-elem-id="ya3">ركن القهوة</span></div>
        <div class="ye-am-it rvf"><img loading="lazy" decoding="async" src="${A['am-photo']}" alt="الفوتو شوت" draggable="false" data-elem-id="ya7"><span class="ye-pill" data-elem-id="ya4">الفوتو شوت</span></div>
      </div>
    </section>`;

// فقرات الحفل: نفس أرقام عناصر القالب (lc25–lc36) عشان الكلام يتعدّل من المحرر زي ما هو، والأيقونات lc97/lc106/lc98/lc107
const TL_ROWS = [
  ['lc97', 'ic-reception', 'lc25', 'lc26', 'lc27'],
  ['lc106', 'ic-zaffa', 'lc28', 'lc29', 'lc30'],
  ['lc98', 'ic-rings', 'lc31', 'lc32', 'lc33'],
  ['lc107', 'ic-dinner', 'lc34', 'lc35', 'lc36'],
];
const TIMELINE = () => `<div class="ye-tl">${TL_ROWS.map(([icId, ic, t, n, d]) => `
      <div class="ye-tl-row rvf"><div class="ye-tl-ic"><img loading="lazy" decoding="async" src="${A[ic]}" alt="" draggable="false" data-elem-id="${icId}"></div>
        <div class="ye-tl-tx"><span class="ye-tl-time" data-elem-id="${t}"></span><span class="ye-tl-title" data-elem-id="${n}"></span><span class="ye-tl-desc" data-elem-id="${d}"></span></div></div>`).join('')}
    </div>`;

/** آخر الـ div اللي بيبدأ عند start (عدّ الفتح والقفل) */
function divEnd(html, start) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') { depth--; if (depth === 0) return re.lastIndex; } else depth++;
  }
  return -1;
}
function setImg(html, id, src) {
  return html.replace(new RegExp(`(<img\\b[^>]*?)src="[^"]*"([^>]*data-elem-id="${id}")`), (m, a, b) => `${a}src="${src}"${b}`);
}

module.exports = {
  shortId: SHORT,

  share: {
    title: 'دعوة زفاف فارس وصفاء',
    description: 'الخميس ١٧ ديسمبر ٢٠٢٦ — قاعات أضواء للاحتفالات، المدينة المنورة',
  },

  render({ editMode } = {}) {
    return { head: CSS };
  },

  transform(html, { editMode } = {}) {
    let out = html;

    // العدّاد بتوقيت السعودية: الساعة المكتوبة (countdown) هي ساعة المدينة
    const m = out.match(/"countdown":\{"year":(\d{4}),"monthIndex":(\d{1,2}),"day":(\d{1,2}),"hour":(\d{1,2}),"minute":(\d{1,2})/);
    if (m) {
      const iso = new Date(Date.UTC(+m[1], +m[2], +m[3], +m[4] - KSA_OFFSET_H, +m[5])).toISOString();
      out = out.replace(/"weddingDateTimeISO":"[^"]*"/, `"weddingDateTimeISO":"${iso}"`);
    }

    // الأسامي (صور من كارت المالك) — في المحرر بتفضل كلام عشان تتعدّل
    if (!editMode) {
      out = out.replace(/(<h1\b[^>]*?)class="([^"]*)"([^>]*data-elem-id="lc3"[^>]*>[^<]*<\/h1>)/, (x, a, c, b) => `${a}class="${c} ye-has-img"${b}<img class="ye-nm ye-hero-nm" src="${A['name-fares']}" alt="فارس" draggable="false">`);
      out = out.replace(/(<h1\b[^>]*?)class="([^"]*)"([^>]*data-elem-id="lc5"[^>]*>[^<]*<\/h1>)/, (x, a, c, b) => `${a}class="${c} ye-has-img"${b}<img class="ye-nm ye-hero-nm s" src="${A['name-safaa']}" alt="صفاء" draggable="false">`);
      out = out.replace(/(<span data-f="name1" data-elem-id="lc91")>[^<]*<\/span>/, `$1 class="ye-has-img"></span><img class="ye-end-nm" src="${A['name-fares']}" alt="فارس" draggable="false">`);
      out = out.replace(/(<span data-f="name2" data-elem-id="lc93")>[^<]*<\/span>/, `$1 class="ye-has-img"></span><img class="ye-end-nm" src="${A['name-safaa']}" alt="صفاء" draggable="false">`);
    }
    // الرسومات اللي لونها جوه الملف نفسه → نسخ بلون الكارت
    for (const n of ['art-1', 'art-4', 'villa-illustration-thick']) out = out.split(`/templates/lace/${n}.svg`).join(A[n]);
    out = out.split('/templates/lace/tulle-texture-burgundy.webp').join(A.tulle);
    // التاريخ الهجري تحت التاريخ
    out = out.replace(/(<p\b[^>]*data-f="dateDots"[^>]*data-elem-id="lc6"[^>]*>[^<]*<\/p>)/, `$1<p class="ye-hijri" data-elem-id="ya8">الخميس ٨ رجب ١٤٤٨ هـ</p>`);

    // فقرات الحفل: قايمة القالب كلها (5 فقرات بالتبادل يمين وشمال) → 4 فقرات تحت بعض بأيقونات الكارت في عمود واحد
    const f1 = out.indexOf('data-elem-id="lc97"');
    const tl = f1 === -1 ? -1 : out.lastIndexOf('<div class="relative max-w-md mx-auto">', f1);
    const tlEnd = tl === -1 ? -1 : divEnd(out, tl);
    if (tlEnd !== -1 && out.slice(tl, tlEnd).includes('data-elem-id="lc39"')) out = out.slice(0, tl) + TIMELINE() + out.slice(tlEnd);

    // الزي المقترح → أجواء الحفل
    const dc = out.indexOf('<div class="rv" data-section="dressCode">');
    if (dc !== -1) {
      const e = divEnd(out, dc);
      if (e !== -1) out = out.slice(0, dc) + `<div class="rv" data-section="dressCode">${AMBIENCE}</div>` + out.slice(e);
    }

    // المواصلات → التنويه: أيقونة "ممنوع التصوير" + "جنة الأطفال منازلهم"، من غير زرار مكان التجمع
    out = setImg(out, 'lc114', A['ic-nocam-light']);
    out = out.replace(/(<img\b[^>]*?)class="([^"]*)"([^>]*data-elem-id="lc114")/, (x, a, c, b) => `${a}class="${c} ye-nocam"${b}`);
    out = out.replace(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*data-elem-id="lc47"[\s\S]*?<\/a>/, '');
    out = out.replace(/(<p\b[^>]*?)class="([^"]*)"([^>]*data-elem-id="lc46")/, (x, a, c, b) => `<div class="ye-kids-wrap"><span class="ye-kd"></span>${a}class="${c} ye-kids"${b}`);
    out = out.replace(/(data-elem-id="lc46"[^>]*>[\s\S]*?<\/p>)/, '$1<span class="ye-kd"></span></div>');
    return out;
  },
};
