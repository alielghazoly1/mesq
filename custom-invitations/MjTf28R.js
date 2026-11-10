// دعوة MjTf28R (Pearl Peony) — Hayat & Noufal. بطلب المالك (2026-11-10):
// - فوق الظرف على طول (البسملة وتحتها الآية — المالك 2026-11-10، أصغر عشان ماتدخلش على الورد) مكان "With all our love, we invite you to share our joy": آية سورة الروم 21 (من صورة المالك) —
//   بخط Amiri Quran (رسم عثماني بالتشكيل كامل والأقواس المزخرفة ﴿ ﴾) بلون أسامي الظرف. الصورة نفسها كانت
//   صغيرة (809px) فقصّها كان بيضيّع نقط وتشكيل — الخط أوضح وأدق على كل الشاشات.
// - خلفية الظرف الأصلية رجعت (كانت اتبدّلت بصورة الآية من المحرر — oneOffFix MjTf28R-cover-bg-back).
// - الأغنية: Calum — I'm In Love With You (الملف اللي المالك بعته) بدل موسيقى القالب. لو اتختارت أغنية من
//   المحرر هي اللي بتشتغل.
const { asset } = require('./_asset');

const SHORT = 'MjTf28R';
const DIR = `/custom/${SHORT}/`;

const VERSE = '<span class="mj-bas">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>﴿ وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا<br>وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ ﴾';

const CSS = `
.mj-verse{position:absolute;left:2cqw;right:2cqw;top:auto;bottom:77.6%;margin:0;text-align:center;direction:rtl;font-family:'Amiri Quran','Amiri',serif;
  font-size:3.55cqw;line-height:1.95;color:#1f3a28;white-space:nowrap;text-shadow:0 0 6px #f6f1e6,0 0 12px #f6f1e6,0 0 2px #f6f1e6;transition:opacity .5s ease}
/* البسملة فوق الآية (بطلب المالك) — أكبر سنة */
.mj-bas{display:block;font-size:1.25em;line-height:1.7;margin-bottom:.1em}
#coverScreen.opening .mj-verse{opacity:0}
`;

module.exports = {
  shortId: SHORT,

  render() {
    return {
      head: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=block"><style id="mj-style">${CSS}</style>`,
    };
  },

  transform(html) {
    // الكلام اللي فوق الظرف (pp1) بيستخبى، والآية مكانه
    let out = html.replace('<p class="cv-txt cv-top" data-elem-id="pp1"></p>',
      () => `<p class="cv-txt cv-top" data-elem-id="pp1" style="display:none"></p><p class="mj-verse" lang="ar" dir="rtl" aria-label="سورة الروم ٢١">${VERSE}</p>`);
    // الأغنية: ملف المالك بدل موسيقى القالب (لو العميل اختار أغنية من المحرر، سكريبت التخصيصات بيحطها فوق ده)
    out = out.replace('<audio id="invitation-audio" src="/templates/pearl-peony/song.mp3"',
      () => `<audio id="invitation-audio" src="${asset(`${DIR}song.mp3`)}"`);
    return out;
  },
};
