// دعوة 1KKXOzW (Velvet Voice عربي) — خطوبة أحمد وتسنيم، الاثنين 30/11/2026 الساعة 7 مساءً،
// نادي الحرية — صالة ست الكل (حلب). بطلب المالك (2026-11-19):
//  • صفحة "ملحوظة مهمة: ممنوع الأطفال" قبل تأكيد الحضور، بصورة طفل نايم على القمر
//    (نومًا هنيئًا لأطفالنا في منازلهم). كلامها بيتعدّل من المحرر (vk1–vk3).
//  • العدّاد وزرار التقويم بتوقيت سوريا (UTC+3) — الساعة المكتوبة هي ساعة حلب.
//  • الأسامي أصغر (المالك: كانت كبيرة أوي) + أغنية المالك + كارت لينك المشاركة.
// البيانات (الأسامي/التاريخ/المكان/الآية) في utils/oneOffFixes.js (1KKXOzW-ahmed-tasneem).
const { asset } = require('./_asset');

const SHORT = '1KKXOzW';
const DIR = `/custom/${SHORT}/`;
const SYRIA_OFFSET_H = 3;
const MOON = asset(`${DIR}kids-moon.webp`);
const SONG = asset(`${DIR}song.mp3`);

const CSS = `<style id="kz-style">
.p-kids .kz-img{width:300px;height:300px;margin:4px 0 2px;display:block;pointer-events:none;user-select:none}
.p-kids .kick{color:var(--gold);letter-spacing:0;font-weight:700}
.p-kids .ttl{font-size:38px;line-height:1.4}
.p-kids .para{max-width:380px}
/* أسامي الأهل لسه ماوصلتش (أهل القالب مخفيين) → من غير الإطارات الفاضية */
#vv-story .fam,#vv-story .fathers{display:none}
/* الأسامي أصغر */
#vv-names .nm{font-size:96px;padding:4px 10px 10px}
#vv-names .amp{margin:-14px 0 -8px}
</style>`;

const KIDS_PAGE = `
    <section class="sec" id="vv-kids" data-wda-page="kids" data-wda-added-host>
      <div class="pg p-kids"><div class="pgi">
        <p class="kick rv" data-elem-id="vk1">ملحوظة مهمة</p>
        <img class="kz-img rv z" style="--d:.8" src="${MOON}" alt="" draggable="false">
        <h2 class="ttl rv" style="--d:1.6" data-elem-id="vk2">نعتذر عن اصطحاب الأطفال</h2>
        <i class="orn rv dv" style="--d:2.2"><b></b></i>
        <p class="para sm rv" style="--d:2.7" data-elem-id="vk3">حرصًا على راحة الجميع، نتمنّى لأطفالنا الأحباء نومًا هنيئًا في منازلهم 🤍</p>
      </div></div>
    </section>
`;

module.exports = {
  shortId: SHORT,

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة خطوبة أحمد وتسنيم',
    description: 'الاثنين 30-11-2026 · الساعة 7 مساءً · نادي الحرية — حلب',
  },

  render() {
    return { head: CSS };
  },

  transform(html) {
    let out = html;
    // أغنية المالك (لو العميل حط أغنية من المحرر، بتاعته هي اللي بتشتغل)
    out = out.replace('src="/templates/velvet-voice/music.mp3"', `src="${SONG}"`);
    // العدّاد بتوقيت سوريا: الساعة المكتوبة (countdown) هي ساعة حلب
    const m = out.match(/"countdown":\{"year":(\d{4}),"monthIndex":(\d{1,2}),"day":(\d{1,2}),"hour":(\d{1,2}),"minute":(\d{1,2})/);
    if (m) {
      const iso = new Date(Date.UTC(+m[1], +m[2], +m[3], +m[4] - SYRIA_OFFSET_H, +m[5])).toISOString();
      if (/"weddingDateTimeISO":"[^"]*"/.test(out)) out = out.replace(/"weddingDateTimeISO":"[^"]*"/, `"weddingDateTimeISO":"${iso}"`);
      else out = out.replace(/"countdown":\{/, `"weddingDateTimeISO":"${iso}","countdown":{`);
    }
    // صفحة الأطفال قبل تأكيد الحضور
    out = out.replace(/(\s*<!-- =+ 6 · تأكيد الحضور)/, `${KIDS_PAGE}$1`);
    if (!out.includes('id="vv-kids"')) out = out.replace(/(<section class="sec" id="vv-rsvp")/, `${KIDS_PAGE.trim()}\n    $1`);
    return out;
  },
};
