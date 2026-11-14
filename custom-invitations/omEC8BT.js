// هدية omEC8BT — عيد ميلاد شهد الـ 20 (21 نوفمبر 2026). بطلب المالك (2026-11-14): العميل كان عاملها على قالب فرح
// (Royal Maroon)، فاتنقلت لقالب "هدية عيد الميلاد" (birthday-gift) بالعربي، بكلام العميل وصوره وأغنيته — البيانات
// والكلام والصور في oneOffFix omEC8BT-birthday-gift (يقدر يعدّلهم من المحرر عادي).
// الملف ده بيضيف اللي القالب مافيهوش:
//   - قسم "عيونك" بعد الكارت الأول: صورة العيون اللي بعتها المالك (أبيض وأسود) والبيت اللي بعته:
//     «عَيْنَاكِ بَحْرٌ وَالْهَوَى فِيهِ غَرِقْ / وَالْقَلْبُ فِي سِحْرِ الْجُفُونِ قَدْ عَلِقْ ❣️»
//     وتحته جملة العميل (كانت بالإنجليزي): «وكل سنة وعيونك أجمل حاجة شافتها عيوني».
//   - ألبوم الذكريات 8 صور بدل 5 (التلاتة الزيادة من صور العميل) — كود الألبوم بيعدّ الصور اللي في الصفحة.
const { asset } = require('./_asset');

const SHORT = 'omEC8BT';
const CLD = 'https://res.cloudinary.com/dxtkmyscw/image/upload/c_limit,w_900,f_auto,q_auto/';
const U = 'mithaq/users/6ae3ed15bd8994520d0ef392/images/';
// صور العميل الزيادة (ترتيبها بعد الخمسة اللي في القالب) + كلام تحت كل صورة
const EXTRA = [
  [`${CLD}v1794349439/${U}jotauwz587lrdh6cthsd.jpg`, 'كل سنة وانتي طيبة'],
  [`${CLD}v1794349405/${U}cajndn9mhclwiwvzzv05.jpg`, 'شهد ❣️'],
  [`${CLD}v1794349383/${U}ymxv4bttj3ejqgg4x2lt.jpg`, 'أحلى ابتسامة'],
];

const EYES = `
  <!-- عيونك (بطلب المالك) -->
  <section class="sec rv om-eyes" aria-label="عيونك">
    <figure class="om-ph"><img src="${asset(`/custom/${SHORT}/eyes.webp`)}" alt="" loading="lazy" decoding="async" draggable="false"></figure>
    <p class="om-v">عَيْنَاكِ بَحْرٌ وَالْهَوَى فِيهِ غَرِقْ</p>
    <p class="om-v">وَالْقَلْبُ فِي سِحْرِ الْجُفُونِ قَدْ عَلِقْ ❣️</p>
    <i class="om-l" aria-hidden="true"></i>
    <p class="om-s">وكل سنة وعيونك أجمل حاجة شافتها عيوني</p>
  </section>
`;

const CSS = `
.om-eyes{padding-top:calc(var(--u)*40)}
.om-ph{position:relative;margin:0 auto calc(var(--u)*30);width:calc(var(--u)*322);padding:calc(var(--u)*9) calc(var(--u)*9) calc(var(--u)*11);background:#fbf7f0;
  box-shadow:0 calc(var(--u)*10) calc(var(--u)*24) rgba(0,0,0,.45);transform:rotate(-1.6deg)}
.om-ph::before{content:"";position:absolute;left:50%;top:calc(var(--u)*-9);width:calc(var(--u)*64);height:calc(var(--u)*20);transform:translateX(-50%) rotate(-3deg);
  background:rgba(201,163,106,.55);box-shadow:0 1px 2px rgba(0,0,0,.15)}
.om-ph img{display:block;width:100%;height:auto;aspect-ratio:1125/524;object-fit:cover;filter:contrast(1.04)}
.om-v{margin:0;font:700 calc(var(--u)*25)/1.75 'Aref Ruqaa','Amiri',serif;color:#f6e9df;direction:rtl}
.om-l{display:block;width:calc(var(--u)*70);height:1px;margin:calc(var(--u)*16) auto calc(var(--u)*14);background:linear-gradient(90deg,transparent,#c9a36a,transparent)}
.om-s{margin:0;font:400 calc(var(--u)*18)/1.7 'Amiri',serif;color:#d9bfb2;direction:rtl}
`;

module.exports = {
  shortId: SHORT,

  render() {
    return { head: `<style id="om-style">${CSS}</style>` };
  },

  transform(html) {
    let out = html;
    // أغنية الهدية: اللي بعتها المالك (2026-11-14) مكان أغنية القالب — صوتها متظبط (من -6 لـ -14.5 LUFS) وبتختفي بالراحة
    // في الآخر عشان اللفّة تبقى ناعمة (scratch bd/song). أغنية العميل القديمة اتشالت من التخصيصات (oneOffFix
    // omEC8BT-owner-song)؛ لو العميل اختار أغنية من المحرر بعد كده هي اللي هتشتغل.
    out = out.replace('src="/templates/birthday-gift/song.mp3"', () => `src="${asset(`/custom/${SHORT}/song.mp3`)}"`);
    // قسم العيون بين الكارت الأول والرسالة
    out = out.replace('<!-- 3) الرسالة -->', (m) => `${EYES}\n  ${m}`);
    // صور الألبوم الزيادة بعد آخر صورة في القالب (bg23)
    const extra = EXTRA.map(([src, cap]) => `<figure class="pol"><img src="${src}" alt="" loading="lazy" decoding="async" draggable="false"><figcaption dir="auto">${cap}</figcaption></figure>`).join('');
    out = out.replace(/(<figure class="pol"><img data-elem-id="bg23"[^]*?<\/figure>)/, (m) => m + extra);
    return out;
  },
};
