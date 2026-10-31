// دعوة MeqC70l (Lily Garden — النسخة العربي من eJCypdA، داليا و عمر) — بطلب المالك:
// نفس ختم ع و د الأخضر بالظبط، وتحته "اضغط للفتح"، وجملة "قَدَّرَ اللهُ لَنَا لِقَاءً"
// تحت صورة الغلاف على طول (مش راكبة على "مرّر لتحت"). باقي التفاصيل (الأسامي،
// التاريخ، المكان، الصورة، الأغنية، الكلام بالعربي) في utils/oneOffFixes.js
// (MeqC70l-arabic-copy).
const { make, withKids } = require('./eJCypdA');
const m = make('MeqC70l', 'اضغط للفتح', '', 'add_nmvsmyt3obu5r');
const base = m.render;
// "مرّر لتحت" بالعربي أكبر من الإنجليزي — على الشاشات القصيرة بتنزل شوية عشان الجملة تاخد مكانها
// بطلب المالك (31 أكتوبر): "حفل خطوبة" تحت البسملة على طول وفوق الأسامي (السطر lg4 —
// كان "يوم الخطوبة" تحت الأسامي — نصه في utils/oneOffFixes.js)، والأسامي نازلة شوية مكانه.
// حارس مساحة الأسماء في القالب بيصغّرها عشان تتلم بين البسملة و"يوم الخطوبة" تحتها —
// بعد ما السطر بقى فوق الأسامي حسابه بيبوظ (كان بيصغّرها لحروف صغيرة جدًا)، فهنا
// الأسامي بمقاس ثابت 87% (كل حاجة في القالب بـ cqw فالنسبة واحدة على كل الشاشات):
// البسملة ← "حفل خطوبة" ← عمر و داليا ← القوس، من غير ما حاجة تلمس حاجة.
const COVER_CSS = '#wg-invite.wg-rtl #wg-invite-1 .wday{top:10.6%}'
  + '#wg-invite.wg-rtl #wg-invite-1 .names{top:29.5%;transform:translateY(-50%) scale(.87)!important;transform-origin:50% 50%!important;margin-top:0!important}';
m.render = (o) => { const r = base(o); r.head += `<style>@media (max-height:700px){#wg-scroll-hint{bottom:34px!important}}${COVER_CSS}</style>`; return r; };
// صورة الطفلين بدل البجعتين (نفس اللي في eJCypdA) + كارت المشاركة بيهم
module.exports = withKids(m, 'e8xttnlo1ckn8w43hnuo');
