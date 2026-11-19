// دعوة rMMB3F1 (Champagne Lace عربي) — بطلب المالك (2026-11-19): ألبوم الذكريات (cl62–cl65) = الـ4 صور
// اللي بعتها، وأولهم صورتهم وهم صغيرين (مقصوصة من إيد اللي ماسكها، على لون الكارت، بحوافها المسننة)،
// وبعدها صورهم التلاتة متقصوصة على مقاس الكارت والاتنين في النص.
// صور العميل القديمة (Cloudinary) هي اللي في البيانات — بنشيلها من الصفحة بس لو لسه هي نفسها، فلو العميل
// رفع صورة جديدة من المحرر صورته هي اللي بتظهر. الصور كانت مستخبية → oneOffFix rMMB3F1-album-photos بيظهّرها.
const { asset } = require('./_asset');

const SHORT = 'rMMB3F1';
const DIR = `/custom/${SHORT}/`;
const OLD = { cl62: 'tz1llcnaple0lcogqtdm', cl63: 'jigwirmosg79cxt5tbyx', cl64: 'brrcqzzfmbwbhaec8cnv', cl65: 'yemvzgbfz4g1d1wwnr3l' };
const NEW = { cl62: asset(`${DIR}album-1.webp`), cl63: asset(`${DIR}album-2.webp`), cl64: asset(`${DIR}album-3.webp`), cl65: asset(`${DIR}album-4.webp`) };

module.exports = {
  shortId: SHORT,

  // من غير render() الـ transform مابيشتغلش (utils/customInvitations.js → injectCustomInvitation)
  render() {
    return {};
  },

  transform(html) {
    let out = html;
    for (const id of Object.keys(NEW)) {
      // صورة العميل القديمة في بيانات الصفحة → تتشال (الصفحة بتسيب صورة الـ img زي ما هي)
      out = out.replace(new RegExp(`"${id}":"https://res\\.cloudinary\\.com/[^"]*${OLD[id]}[^"]*",?`), '');
      // صورة الـ img نفسها في القالب → الصورة الجديدة
      out = out.replace(new RegExp(`(<img data-elem-id="${id}" src=")[^"]*(")`), `$1${NEW[id]}$2`);
    }
    // لو شلنا آخر عنصر وفضلت فاصلة قبل القوس
    out = out.replace(/"images":\{([^}]*),\}/, '"images":{$1}');
    return out;
  },
};
