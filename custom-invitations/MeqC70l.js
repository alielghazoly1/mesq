// دعوة MeqC70l (Lily Garden — النسخة العربي من eJCypdA، داليا و عمر) — بطلب المالك:
// نفس ختم ع و د الأخضر بالظبط، وتحته "اضغط للفتح"، وجملة "قَدَّرَ اللهُ لَنَا لِقَاءً"
// تحت صورة الغلاف على طول (مش راكبة على "مرّر لتحت"). باقي التفاصيل (الأسامي،
// التاريخ، المكان، الصورة، الأغنية، الكلام بالعربي) في utils/oneOffFixes.js
// (MeqC70l-arabic-copy).
const m = require('./eJCypdA').make('MeqC70l', 'اضغط للفتح', '', 'add_nmvsmyt3obu5r');
const base = m.render;
// "مرّر لتحت" بالعربي أكبر من الإنجليزي — على الشاشات القصيرة بتنزل شوية عشان الجملة تاخد مكانها
m.render = (o) => { const r = base(o); r.head += '<style>@media (max-height:700px){#wg-scroll-hint{bottom:34px!important}}</style>'; return r; };
module.exports = m;
