// دعوة ucZLlRU (Champagne Lace) — بطلب المالك (2026-11-21): الدعوة كلها برجندي، الظرف من بره والدنيا كلها من جوه.
// نفس القالب ونفس البيانات (العميل يقدر يكمّل تعديل كلامه وصوره من المحرر عادي) — اللي اتغيّر الألوان والصور بس:
// - صور القالب اتلوّنت بكسل بكسل (scratch uc/recolor.py): الظرف ورق برجندي بنفس النقشة البارزة وورق الشجر دهبي،
//   الختم دهب، الكروت برجندي بنفس النقشة البارزة، ظرف الآية دانتيل برجندي، القلوب دهب، الورد زي ما هو.
//   بطلب المالك: الورقة اللي ورا كل الأجزاء (الخلفية) فاتحة مايلة للدهبي سنة (شامبين)، وورقة الآية اللي طالعة
//   من الظرف بيضا.
//   الصور الجديدة في client/public/custom/ucZLlRU/ بنفس أسامي صور القالب، والـ transform بيبدّل المسار بس.
//   أي صورة العميل يرفعها من المحرر بتكسب (بتتحط فوق من بيانات الدعوة).
// - الكلام اللي على الورقة البيضا برجندي، واللي على الكروت البرجندي عاجي ودهبي (CSS تحت).
// - ألوان الكلام اللي العميل يغيّرها من المحرر بتكسب (المحرر بيحطها inline بـ !important).
const { asset } = require('./_asset');

const SHORT = 'ucZLlRU';
const DIR = `/custom/${SHORT}/`;
const SRC = '/templates/champagne-lace/';

// صور القالب اللي ليها نسخة برجندي
const FILES = [
  'flap-top.webp', 'flap-left.webp', 'flap-right.webp', 'flap-bottom.webp', 'seal.webp',
  'hero-background-extended.webp', 'countdown-card.webp', 'countdown-linen.webp', 'extra-1.webp',
  'scratch-coat-day.webp', 'scratch-coat-month.webp', 'scratch-coat-year.webp',
  'lace-envelope-back.webp', 'lace-envelope-front.webp',
  'heart-large.webp', 'heart-small.webp', 'closing-heart.png',
  // (2026-11-21) الوردتين اللي فوق على الشمال اتقصّوا من جديد (القص القديم كان سايب حتت من خلفية الصورة الرمادي بين
  // الورق وتحت الوردة) — scratch uc/recut_roses.py + roses_clean2.py
  'hero-roses.webp',
];

const CSS = `
:root{--uc-wine:#5b1526;--uc-rose:#8f4d5c;--uc-card:#6c1a2c;--uc-ink:#f6ead1;--uc-soft:#dcc395;--uc-gold:#dcbb80;
  --uc-gold-l:#ecd3a0;--uc-gold-d:#a47c40;--uc-paper:#f4ecdb;--uc-paper-rgb:244,236,219}
/* الورقة اللي ورا كل الأجزاء: مش أبيض صريح — شامبين فاتح مايل للدهبي سنة (طلب المالك)، نفس لون الكتان في الصور */
html,body{background:var(--uc-paper)!important}
#rec2442650993 .t396__artboard,#rec2442651013 .t396__artboard,#rec2442651163 .t396__artboard{background-color:var(--uc-paper)!important}
#rec2442651013{background-color:var(--uc-paper)!important}
#cl-sections,#venue,#album,#rsvp-wrap,.cl-note-wrap{background:var(--uc-paper)!important}
html body .hv{background:var(--uc-paper)}
.hv .hv-wash{background:linear-gradient(to bottom,rgba(var(--uc-paper-rgb),0) 0%,rgba(var(--uc-paper-rgb),.26) 42%,rgba(var(--uc-paper-rgb),.74) 76%,var(--uc-paper) 100%)!important}
.cd-linen::after{background:linear-gradient(to bottom,var(--uc-paper) 0,rgba(var(--uc-paper-rgb),.72) 46px,rgba(var(--uc-paper-rgb),.22) 104px,rgba(var(--uc-paper-rgb),0) 150px,rgba(var(--uc-paper-rgb),0) 548px,rgba(var(--uc-paper-rgb),.3) 600px,rgba(var(--uc-paper-rgb),.78) 646px,var(--uc-paper) 680px)!important}
/* الغلاف: "Click to open" على الظرف البرجندي */
#rec2442650973 .tn-elem[data-elem-id="1777183175514000001"] .tn-atom{color:var(--uc-gold-l)!important;text-shadow:0 1px 6px rgba(20,0,6,.7)}
/* أول شاشة: الكلام اللي على الورقة البيضا برجندي، واللي على الكارت البرجندي عاجي ودهبي
   (html body: القالب بيعرّف المتغيّرات دي بعدنا في الصفحة) */
html body .hv{--hv-ink:var(--uc-wine);--hv-paper:var(--uc-paper)}
/* (2026-11-21) الدريس كود اتشال من الكارت → الكلام نزل 22px عشان يبقى في نص الورقة بالظبط (نص الكلام 413.9 → 435.5 = نص
   الكارت 190–681). fitHeroCard بتاعة القالب لو احتاجت ترفع الكارت بتكتب top inline وتكسب */
#hv-hero .hv-card{top:272px}
.hv .hv-card{color:var(--uc-ink)!important}
.hv .hv-names>span{color:var(--uc-gold-l)}
.hv .hv-names .hv-amp{color:var(--uc-gold)!important}
.hv .hv-reveal__hint{color:var(--uc-rose)!important}.hv .hv-reveal__hint i{color:var(--uc-gold-d)!important}
.hv .hv-tile{background:var(--uc-card)!important}
.hv .hv-tile__face{background:linear-gradient(rgba(40,4,12,.12),rgba(40,4,12,.12)),url("${asset(DIR + 'extra-1.webp')}") center/cover!important;box-shadow:inset 0 0 0 1px rgba(220,187,128,.35),inset 0 0 18px rgba(12,0,4,.35)!important}
.hv .hv-tile__val{color:var(--uc-gold-l)!important}
.hv .hv-tile__label{color:var(--uc-rose)!important}
/* ظرف الآية: الظرف دانتيل برجندي، والورقة اللي طالعة منه بيضا (طلب المالك) — الكلام عليها برجندي ودهبي غامق */
#rec2442651013 .bsm{color:#9a733c!important}
#rec2442651013 .vl>span{color:#5a1424!important}
#rec2442651013 .vl>.vbr{color:#b08a52!important}
#rec2442651013 .tn-elem[data-elem-id="1705235414678"] .tn-atom{color:#8a6640!important}
/* العدّاد: كل كلامه جوه الكارت البرجندي */
html body .cd{--cd-ink:var(--uc-ink);--cd-soft:var(--uc-soft);--cd-gold:var(--uc-gold);--cd-rule:rgba(220,187,128,.42);--cd-paper:var(--uc-paper)}
.cd-title{color:var(--uc-gold-l)}
#cd-countdown .cd-cal{border-color:rgba(220,187,128,.7)!important;background:rgba(255,240,210,.06)!important;color:var(--uc-ink)!important}
#cd-countdown .cd-cal:hover,#cd-countdown .cd-cal:focus-visible{background:var(--uc-gold)!important;color:var(--uc-wine)!important;border-color:var(--uc-gold)!important}
/* المكان: الكلام على الورقة البيضا برجندي، والإطار برجندي بخط دهب */
html body .vn{--vn-ink:var(--uc-wine);--vn-soft:var(--uc-rose);--vn-gold:var(--uc-gold-d);--vn-paper:var(--uc-paper)}
.vn-frame{background:var(--uc-card)!important}
.vn-frame::after{border-color:rgba(220,187,128,.6)!important}
.vn-map{background:#5a1525!important}
#vn-venue .vn-dir{border-color:rgba(91,21,38,.55)!important}
#vn-venue .vn-dir:hover,#vn-venue .vn-dir:focus-visible{background:var(--uc-wine)!important;color:var(--uc-ink)!important}
/* الألبوم */
html body .al{--al-ink:var(--uc-wine);--al-soft:var(--uc-rose);--al-gold:var(--uc-gold-d);--al-paper:var(--uc-paper);--cd-paper:var(--uc-paper)}
.al-card{background:var(--uc-card)!important}
.al-card::after{border-color:rgba(220,187,128,.55)!important}
#al-album .al-btn{border-color:rgba(91,21,38,.45)!important}
#al-album .al-btn:hover,#al-album .al-btn:focus-visible{background:var(--uc-wine)!important;color:var(--uc-ink)!important}
/* تأكيد الحضور: العنوان على الورقة البيضا برجندي — الكارت برجندي وكلامه عاجي */
html body .rs{--rs-ink:var(--uc-wine);--rs-soft:var(--uc-rose);--rs-gold:var(--uc-gold-d);--rs-paper:var(--uc-paper)}
html body .rs-card{--rs-ink:var(--uc-ink);--rs-soft:var(--uc-soft);--rs-gold:var(--uc-gold);--rs-line:rgba(220,187,128,.45);--rs-err:#f3a993;background:var(--uc-card)!important}
.rs-card::before{border-color:rgba(220,187,128,.6)!important}
.rs-card .rs-thanks__title{color:var(--uc-gold-l)}
#rsvp .rs-textarea{background:rgba(255,240,210,.05)!important}
#rsvp .rs-textarea:focus{background:rgba(255,240,210,.09)!important}
#rsvp .rs-input::placeholder,#rsvp .rs-textarea::placeholder{color:rgba(240,220,180,.5)!important}
.rs-choice span::before{box-shadow:inset 0 0 0 3px var(--uc-card)!important}
.rs-choice input:checked+span{background:rgba(220,187,128,.12)!important;border-color:var(--uc-gold)!important}
.rs-choice input:checked+span::before{background:var(--uc-gold)!important;border-color:var(--uc-gold)!important}
#rsvp .rs-send{background:linear-gradient(180deg,#f0d9a6,#cfa765)!important;color:#4a0f1c!important}
#rsvp .rs-send:hover,#rsvp .rs-send:focus-visible{background:linear-gradient(180deg,#f5e2b6,#d8b274)!important}
.rs-spin{border-color:rgba(74,15,28,.3)!important;border-top-color:#4a0f1c!important}
/* الختام على الورقة البيضا */
#rec2442651163 .tn-elem[data-elem-id="1710522265387"] .tn-atom{color:var(--uc-wine)!important}
#rec2442651163 .tn-elem[data-elem-id="1710522265391"] .tn-atom{color:var(--uc-wine)!important}
/* زرار المزيكا برجندي بحلقة دهب */
#audio-control{background:linear-gradient(145deg,#7a2233 0%,#5d1525 55%,#45101b 100%)!important;box-shadow:0 6px 16px rgba(60,10,20,.4),0 1px 2px rgba(60,10,20,.3),inset 0 0 0 1px rgba(220,187,128,.7)!important}
#audio-icon{fill:#ecd3a0!important}
`;

// (2026-11-21) ألبوم "Our Memories" = صور إبراهيم وعبير التلاتة اللي المالك بعتها (زي ما هي، الكارت بيقص بـ object-fit):
// وهم صغيرين، بعدين صورتهم سوا، بعدين منديل كتب الكتاب. صورة العميل اللي يرفعها من المحرر (cl62–cl64) بتكسب.
const ALBUM = [
  { id: 'cl62', src: asset(`${DIR}album-1.webp`), pos: '50% 45%', alt: 'Ebraheem & Abeer as children' },
  { id: 'cl63', src: asset(`${DIR}album-2.webp`), pos: '54% 50%', alt: 'Ebraheem & Abeer' },
  { id: 'cl64', src: asset(`${DIR}album-3.webp`), pos: '50% 52%', alt: 'Ebraheem & Abeer — katb el-ketab' },
];

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الظرف البرجندي بالختم الدهب من غير أي كلام على الصورة (المالك بيحب كده)؛
  // العنوان والوصف من بيانات الدعوة
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
  },

  render() {
    return { head: `<style id="uc-burgundy">${CSS}</style>` };
  },

  transform(html) {
    let out = html;
    for (const f of FILES) out = out.split(SRC + f).join(asset(DIR + f));
    // ورقة الخربشة: كانت بتتصبغ شامبين فوق صورة الورق — صورتنا دهب جاهزة، فالصبغة بقت بيضا (من غير تغيير)
    out = out.replace("g.addColorStop(0, '#f1e9da'); g.addColorStop(.5, '#e6dac3'); g.addColorStop(1, '#ddcdb0');",
      "g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#fbf3e4'); g.addColorStop(1, '#f2e4c8');");
    // الكونفيتي بعد الخربشة: دهب وعاجي وبرجندي (كان فيه قطع سودا)
    out = out.replace("'#f5ede0', '#1a1916', '#d4c090'", "'#f5ede0', '#8a2238', '#d4c090'");
    // العريس الأول في الأسامي (الكارت والختام) زي ما المالك بيكتبها: Ebraheem & Abeer
    out = out.replace("var n1 = LANG === 'ar' ? groom : bride, n2 = LANG === 'ar' ? bride : groom;", 'var n1 = groom, n2 = bride;');
    // الألبوم: 3 صور بدل 4 (الكارت الرابع والنقطة الرابعة اتشالوا، والعدّاد / 03)
    const fig = /\s*<figure class="al-card" data-i="(\d)"><img data-elem-id="(cl6[2-5])" src="[^"]*" alt="[^"]*" style="object-position:[^"]*"/g;
    if ((out.match(fig) || []).length === 4) {
      out = out.replace(/\s*<figure class="al-card" data-i="3">[\s\S]*?<\/figure>/, '');
      ALBUM.forEach((a, i) => {
        out = out.replace(new RegExp(`(<figure class="al-card" data-i="${i}"><img data-elem-id="${a.id}" src=")[^"]*(" alt=")[^"]*(" style="object-position:)[^"]*"`),
          `$1${a.src}$2${a.alt}$3${a.pos}"`);
      });
      out = out.replace('<span>/ 04</span>', '<span>/ 03</span>').replace('<i data-i="3"></i></div>', '</div>');
    }
    return out;
  },
};
