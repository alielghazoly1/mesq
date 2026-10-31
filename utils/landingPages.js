// utils/landingPages.js
// صفحات جوجل: صفحة لكل كلمة بيدوّر بيها الناس ("دعوة زفاف إلكترونية"،
// "دعوة فرح"، "دعوة خطوبة"، "كروت أفراح"...). ليه صفحات منفصلة؟ الموقع
// نفسه React — الصفحة الرئيسية بتوصل لجوجل من غير ولا كلمة (كل الكلام
// بيترسم بالجافاسكربت بعدين). الصفحات دي بتتبني على السيرفر كاملة: عنوان
// وكلام حقيقي وتصاميم وأسئلة بصيغة FAQPage — جوجل بيقراها من أول مرة.
//
// كل صفحة ليها كلام بتاعها (مش نسخ مكررة بكلمة متغيّرة — جوجل بيعاقب على
// ده). الأسعار مش بتظهر هنا عمدًا: السعر بيختلف حسب دولة العميل وبيظهر
// بعد التسجيل (routes/packages.js) — فبنودّي على صفحة الباقات.
const fs = require('fs');
const path = require('path');
const { TEMPLATES } = require('../templates/registry');
const { getPublicStats } = require('./publicStats');

const SITE = 'https://mithaq-invitation.com';
const THUMBS = path.join(__dirname, '..', 'client', 'public', 'img', 'template-thumbs');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// صورة كل تصميم: النسخة العربي لو موجودة (الزائر من جوجل بيدوّر بالعربي)
function thumbOf(id) {
  for (const f of [`${id}-ar.jpg`, `${id}.jpg`]) {
    if (fs.existsSync(path.join(THUMBS, f))) return `/img/template-thumbs/${f}`;
  }
  return '';
}

// أسماء الصفحات (بالعربي في اللينك — بيظهر كده في نتيجة جوجل ويساعد في الترتيب)
const SLUGS = {
  wedding: 'دعوة-زفاف-الكترونية',
  farah: 'دعوة-فرح',
  engagement: 'دعوة-خطوبة',
  katb: 'دعوة-كتب-كتاب',
  einvite: 'دعوات-الكترونية',
  cards: 'كروت-افراح',
  wording: 'صيغ-دعوة-زفاف',
};
const urlOf = (key) => `/${SLUGS[key]}`;

// الكلام المشترك (مميزات الدعوة) — كل صفحة بتختار منه وبتكتب مقدمتها بنفسها
const FEATURES = [
  ['لينك واحد لكل ضيوفك', 'بتبعته على واتساب أو إنستجرام أو فيسبوك لعدد لا نهائي من الضيوف، ومش محتاجين يحمّلوا أي تطبيق.'],
  ['مكان القاعة على الخريطة', 'الضيف يدوس على الخريطة يوصل للقاعة بجوجل ماب على طول — من غير ما حد يتصل يسأل "العنوان فين؟".'],
  ['تأكيد الحضور', 'الضيوف بيأكدوا حضورهم من الدعوة نفسها، وانت بتشوف الأسامي والعدد في لوحتك أول بأول.'],
  ['عدّاد لحد يوم الفرح', 'عدّاد تنازلي بالأيام والساعات والدقايق بيفكّر ضيوفك بالميعاد.'],
  ['صوركم وموسيقى تختاروها', 'حط صور الخطوبة أو السيشن، واختار الأغنية اللي بتشتغل أول ما الدعوة تتفتح.'],
  ['تعديل بعد ما تبعتها', 'غيّرت الميعاد أو القاعة؟ التعديل بيظهر على نفس اللينك، والضيوف دايمًا بيشوفوا آخر نسخة.'],
  ['عربي أو إنجليزي', 'كل تصميم بنسخة عربي بخطوط عربي أنيقة ونسخة إنجليزي — وكل كلمة فيها تتعدّل.'],
  ['تهاني الضيوف وصورهم', 'سجل تهاني، وفي بعض التصاميم تهنئة صوتية وألبوم يرفع فيه الضيوف صور الفرح.'],
];

const STEPS = [
  ['اختار التصميم', 'اتفرّج على التصاميم وافتح أي واحد تشوفه شغّال بالظبط زي ما ضيوفك هيشوفوه.'],
  ['اكتب بياناتكم', 'أسامي العرسان، الميعاد، القاعة ومكانها — وغيّر أي كلمة أو صورة أو خط على الدعوة نفسها.'],
  ['فعّل باقتك', 'ادفع بفودافون كاش أو إنستاباي من مصر، أو بطرق الدفع الدولية من برّه مصر.'],
  ['ابعت اللينك', 'دعوتك بقت جاهزة بلينك خاص — ابعته لكل ضيوفك وتابع مين أكّد حضوره.'],
];

// ===== الصفحات =====
const PAGES = {
  wedding: {
    title: 'دعوة زفاف إلكترونية | اعمل دعوة فرحك أونلاين في دقايق — ميثاق',
    description: 'اعمل دعوة زفاف إلكترونية فاخرة بلينك خاص باسم العروسين: تصاميم عربي وإنجليزي، صوركم وموسيقى، عدّاد للفرح، مكان القاعة على الخريطة وتأكيد حضور — ابعتها على واتساب لكل ضيوفك.',
    eyebrow: 'دعوات زفاف إلكترونية',
    h1: 'دعوة زفاف إلكترونية',
    h1b: 'بلينك واحد يوصل لكل ضيوفك',
    lead: 'ميثاق بيخليك تعمل دعوة زفافك أونلاين بتصميم فاخر في دقايق: تختار التصميم، تكتب أساميكم وميعاد الفرح ومكان القاعة، وتبعت لضيوفك لينك واحد يفتح على أي موبايل — فيه صوركم وموسيقاكم وعدّاد لحد يوم الفرح وتأكيد الحضور.',
    sections: [
      ['يعني إيه دعوة زفاف إلكترونية؟', `<p>دعوة الزفاف الإلكترونية هي دعوة فرحك على شكل صفحة خاصة بيكم، ليها لينك باسم العروسين. الضيف بيدوس على اللينك من واتساب فيفتح ظرف بيتفتح قدامه، وجوّاه أساميكم وميعاد الفرح وآية أو كلمة ترحيب، وصوركم، وخريطة القاعة، وعدّاد بالأيام لحد الفرح، وفورم يأكد منه حضوره.</p>
<p>الفرق بينها وبين صورة الدعوة العادية اللي بتتبعت على واتساب: الصورة بتتقري وتتنسي، لكن الدعوة الإلكترونية صفحة كاملة بتتحرك وفيها موسيقى، والضيف بيرجعلها يوم الفرح عشان يوصل للقاعة من الخريطة.</p>`],
      ['ليه دعوة إلكترونية بدل كروت الفرح الورق؟', `<ul class="lp-list">
<li><b>بتوصل لكل الناس:</b> القرايب اللي برّه مصر والصحاب اللي مش هتقابلهم — كلهم بيوصلهم نفس اللينك في ثانية.</li>
<li><b>مالهاش عدد:</b> الكارت الورق بيتحسب بالواحد، لكن اللينك بيتبعت لعدد لا نهائي من غير أي تكلفة زيادة.</li>
<li><b>بتتعدّل:</b> لو الميعاد أو القاعة اتغيّروا، بتعدّل الدعوة والكل بيشوف الجديد على نفس اللينك — مش هتطبع تاني.</li>
<li><b>بتعرّفك مين جاي:</b> تأكيد الحضور بيوصلك بالاسم، فتعرف العدد الحقيقي قبل ما تتفق مع القاعة على الأكل.</li>
<li><b>بتفضل معاكم:</b> الدعوة بتفضل أونلاين طول العمر، ذكرى ترجعولها انتو وضيوفكم.</li>
</ul>`],
    ],
    faq: [
      ['يعني إيه دعوة زفاف إلكترونية؟', 'دعوة فرح على شكل لينك خاص باسم العروسين، بتفتح على أي موبايل، وفيها ميعاد الفرح ومكان القاعة على الخريطة وعدّاد لحد يوم الفرح وموسيقى وصور — والضيوف يأكدوا حضورهم منها على طول.'],
      ['إزاي أعمل دعوة زفاف إلكترونية؟', 'من ميثاق: تختار التصميم اللي عاجبك، تكتب أساميكم والميعاد والقاعة، تفعّل الباقة، ولينك دعوتك يبقى جاهز في دقايق تبعته على واتساب.'],
      ['أقدر أبعت الدعوة لكام ضيف؟', 'لعدد لا نهائي. الدعوة الواحدة لينك واحد بتبعته لكل ضيوفك مهما كان عددهم، ومفيش حد لعدد مرات الفتح.'],
      ['الضيف محتاج يحمّل تطبيق؟', 'لأ. اللينك بيفتح على طول في المتصفح على أي موبايل — آيفون أو أندرويد — أو على الكمبيوتر.'],
      ['أقدر أعدّل الدعوة بعد ما أبعتها؟', 'أيوه، التعديل بيظهر على نفس اللينك خلال مدة التعديل اللي في باقتك، فالضيوف دايمًا بيشوفوا آخر نسخة.'],
      ['الدعوة بتفضل موجودة لحد إمتى؟', 'طول العمر. الدعوة مالهاش تاريخ انتهاء ومبتتمسحش.'],
    ],
    related: ['farah', 'wording', 'engagement', 'cards'],
  },

  farah: {
    title: 'دعوة فرح إلكترونية بلينك على واتساب | تصاميم فاخرة — ميثاق',
    description: 'دعوة فرح إلكترونية تبعتها على واتساب: ظرف بيتفتح، أسامي العرسان، ميعاد الفرح، مكان القاعة على جوجل ماب، عدّاد وموسيقى وتأكيد حضور. اختار تصميمك واعمل دعوة فرحك في دقايق.',
    eyebrow: 'دعوة فرح',
    h1: 'دعوة فرح إلكترونية',
    h1b: 'تبعتها على واتساب في دقايق',
    lead: 'بدل ما تلف على المطابع وتوزّع كروت، اعمل دعوة فرحك أونلاين وابعتها لكل الناس بلينك واحد على واتساب. الضيف يفتحها يلاقي ظرف بيتفتح، وأسامي العرسان، وميعاد الفرح، ولوكيشن القاعة، وموسيقى تختاروها انتو.',
    sections: [
      ['دعوة الفرح على واتساب بقت أشيك', `<p>الناس دلوقتي بتعزم على الفرح على واتساب في كل الأحوال — والسؤال بقى: هتبعت صورة كارت، ولا لينك دعوة حقيقية؟ دعوة الفرح الإلكترونية من ميثاق بتوصل كأنها كارت متغلّف بيتفتح قدام الضيف، بحركة وموسيقى، وتحس إنها معمولة مخصوص ليكم.</p>
<p>ولأن كل حاجة فيها بتتعدّل، تقدر تكتب دعوة الفرح بالعامية أو بالفصحى، تحط آية قرآنية أو كلمة من أهل العرسان، وتختار الخطوط والألوان اللي على ذوقكم.</p>`],
      ['إيه اللي لازم يبقى في دعوة الفرح؟', `<ul class="lp-list">
<li><b>أسامي العريس والعروسة</b> — ولو حابين، أسامي الأهل اللي بيتشرفوا بدعوتكم.</li>
<li><b>اليوم والتاريخ والساعة</b> — والدعوة بتعرض عدّاد لحد يوم الفرح.</li>
<li><b>اسم القاعة وعنوانها</b> — مع خريطة جوجل ماب تودّي الضيف لحد الباب.</li>
<li><b>طريقة تأكيد الحضور</b> — زرار في الدعوة نفسها بدل ما تستنى الرد على الشات.</li>
<li><b>كلمة ترحيب</b> — شوف <a href="${urlOf('wording')}">صيغ دعوة الزفاف</a> لو محتار تكتب إيه.</li>
</ul>`],
    ],
    faq: [
      ['أقدر أبعت دعوة الفرح على واتساب؟', 'أيوه، دي أشهر طريقة. بتنسخ لينك الدعوة وتبعته لأي حد أو أي جروب، وبيظهر بصورة وعنوان الدعوة.'],
      ['الدعوة بتنفع للفرح في القاعة ولا في البيت؟', 'الاتنين. بتكتب المكان اللي انت عايزه وتحط اللوكيشن بتاعه على الخريطة.'],
      ['أقدر أكتب الدعوة بالعامية المصرية؟', 'طبعًا، كل كلمة في الدعوة بتتعدّل — تكتبها بالعامية أو بالفصحى أو بالإنجليزي.'],
      ['هعرف مين جاي الفرح؟', 'أيوه، الضيوف بيأكدوا حضورهم من الدعوة، وبتشوف الأسامي والأعداد في لوحتك وتنزّلها إكسل.'],
      ['بدفع إزاي؟', 'من مصر بفودافون كاش أو إنستاباي، ومن برّه مصر بطرق دفع دولية بتظهرلك في صفحة الدفع.'],
    ],
    related: ['wedding', 'wording', 'cards', 'katb'],
  },

  engagement: {
    title: 'دعوة خطوبة إلكترونية | اعمل دعوة خطوبتك أونلاين — ميثاق',
    description: 'دعوة خطوبة إلكترونية بتصميم أنيق ولينك خاص: أساميكم، ميعاد الخطوبة، المكان على الخريطة، صوركم وموسيقى وتأكيد حضور. ابعتها على واتساب لكل المعازيم في دقايق.',
    eyebrow: 'دعوة خطوبة',
    h1: 'دعوة خطوبة إلكترونية',
    h1b: 'أول خطوة في الحكاية تستاهل دعوة شيك',
    lead: 'الخطوبة أول فرحة، ودعوتها لازم تبقى على قدّها. اعمل دعوة خطوبتك أونلاين في دقايق: اختار التصميم، اكتب أساميكم وميعاد الخطوبة والمكان، وابعت اللينك لكل المعازيم على واتساب.',
    sections: [
      ['دعوة خطوبة بنفس فخامة دعوة الفرح', `<p>كل تصاميم ميثاق بتنفع للخطوبة زي الفرح بالظبط: بتغيّر كلمة "حفل زفاف" لـ"حفل خطوبة"، وتحط صوركم من السيشن، وتختار الأغنية — والدعوة بتبقى بتاعتكم انتو.</p>
<p>ولما ييجي ميعاد الفرح، تقدر تعمل دعوة الزفاف بنفس التصميم أو بتصميم جديد، فيبقى عندكم ذكرى كاملة من الخطوبة لحد الفرح.</p>`],
      ['ليه دعوة إلكترونية للخطوبة؟', `<ul class="lp-list">
<li><b>الخطوبة غالبًا بتتعمل بسرعة</b> — والدعوة الإلكترونية بتجهز في نفس اليوم من غير طباعة.</li>
<li><b>المعازيم كتير ومتفرقين</b> — لينك واحد بيوصل للعيلتين والصحاب في كل مكان.</li>
<li><b>المكان بيتغيّر أحيانًا</b> — والتعديل بيظهر على نفس اللينك على طول.</li>
<li><b>تعرف العدد</b> — تأكيد الحضور بيقولك مين جاي عشان تحجز على قدّه.</li>
</ul>`],
    ],
    faq: [
      ['التصاميم بتنفع للخطوبة؟', 'أيوه، كل التصاميم بتنفع للخطوبة والفرح، وبتغيّر الكلام زي ما تحب.'],
      ['أقدر أحط صور السيشن في الدعوة؟', 'أيوه، بتغيّر صور الدعوة بصوركم انتو، وفي تصاميم فيها ألبوم كامل.'],
      ['الدعوة بتجهز في قد إيه؟', 'في دقايق — بتكتب البيانات وتفعّل الباقة واللينك بيبقى جاهز تبعته على طول.'],
      ['أقدر أستخدم نفس التصميم للفرح بعدين؟', 'أيوه، تقدر تعمل دعوة الفرح بنفس التصميم أو بتصميم تاني حسب باقتك.'],
    ],
    related: ['wedding', 'katb', 'farah', 'wording'],
  },

  katb: {
    title: 'دعوة كتب كتاب إلكترونية | دعوة عقد قران بلينك — ميثاق',
    description: 'دعوة كتب كتاب (عقد قران) إلكترونية بتصميم فاخر وآية قرآنية: أسامي العروسين، الميعاد، المسجد أو القاعة على الخريطة، وتأكيد حضور. ابعتها على واتساب في دقايق.',
    eyebrow: 'دعوة كتب كتاب',
    h1: 'دعوة كتب كتاب إلكترونية',
    h1b: 'دعوة عقد قران تليق باليوم',
    lead: 'كتب الكتاب يوم مالوش زي، ودعوته تستاهل تبقى مميزة. اعمل دعوة كتب كتاب إلكترونية بآية قرآنية وتصميم فاخر، وابعتها للأهل والصحاب على واتساب بلينك واحد فيه الميعاد ومكان المسجد أو القاعة على الخريطة.',
    sections: [
      ['دعوة عقد القران بآية وكلام يليق', `<p>كل تصاميم ميثاق كلامها بيتعدّل بالكامل، فتقدر تكتب "حفل عقد قران" أو "كتب كتاب" وتختار الآية اللي تحبوها — زي قوله تعالى: <q>وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً</q>.</p>
<p>وفي تصاميم فيها مكان مخصوص للآية في ظرف دانتيل، وأماكن لأسامي الأهل اللي بيتشرفوا بدعوتكم.</p>`],
      ['كتب الكتاب والفرح في دعوة واحدة؟', `<p>لو كتب الكتاب والفرح في نفس اليوم، الدعوة الواحدة بتقول الاتنين: ميعاد عقد القران في المسجد، وميعاد الحفلة في القاعة — وكل مكان ليه خريطة. ولو في يومين مختلفين، تقدر تعمل دعوة لكل يوم.</p>
<p>محتار تكتب إيه؟ شوف <a href="${urlOf('wording')}">صيغ دعوة الزفاف وكتب الكتاب</a>.</p>`],
    ],
    faq: [
      ['ينفع أعمل دعوة لكتب الكتاب بس؟', 'أيوه، أي تصميم بتغيّر كلامه لـ"عقد قران" أو "كتب كتاب" وبيبقى دعوة كتب كتاب كاملة.'],
      ['أقدر أحط آية قرآنية؟', 'أيوه، الكلام كله بيتعدّل، وفي تصاميم فيها مكان مخصوص للآية.'],
      ['أقدر أحط مكان المسجد على الخريطة؟', 'أيوه، بتحط لوكيشن المسجد أو القاعة والضيف يوصل بجوجل ماب.'],
      ['الضيوف هيأكدوا حضورهم إزاي؟', 'من زرار في الدعوة نفسها، وبتشوف الأسامي في لوحتك.'],
    ],
    related: ['wording', 'wedding', 'engagement', 'farah'],
  },

  einvite: {
    title: 'دعوات إلكترونية للأفراح والخطوبة | دعوة إلكترونية بلينك — ميثاق',
    description: 'ميثاق موقع دعوات إلكترونية مصري: اعمل دعوة إلكترونية للفرح أو الخطوبة أو كتب الكتاب بتصميم فاخر ولينك خاص — موسيقى وصور وعدّاد وخريطة وتأكيد حضور، وتبعتها على واتساب.',
    eyebrow: 'دعوات إلكترونية',
    h1: 'دعوات إلكترونية',
    h1b: 'لفرحكم وخطوبتكم وكتب كتابكم',
    lead: 'الدعوة الإلكترونية هي الطريقة الجديدة اللي الناس بتعزم بيها على المناسبات: لينك بيفتح على أي موبايل، فيه كل تفاصيل المناسبة، والضيف بيأكد حضوره منه. في ميثاق تصاميم فاخرة جاهزة، وانت بتعدّل كل كلمة وصورة فيها بنفسك.',
    sections: [
      ['الدعوة الإلكترونية بتعمل إيه أكتر من الكارت؟', `<div class="lp-compare">
<div><h3>الكارت التقليدي</h3><ul><li>بيتطبع بعدد محدود</li><li>محتاج يتوزّع باليد</li><li>لو الميعاد اتغيّر بتطبع تاني</li><li>مش هتعرف مين جاي</li></ul></div>
<div class="on"><h3>الدعوة الإلكترونية</h3><ul><li>لينك لعدد لا نهائي</li><li>بيوصل على واتساب في ثانية</li><li>بتتعدّل على نفس اللينك</li><li>تأكيد حضور بالأسامي</li></ul></div>
</div>`],
      ['دعوات إلكترونية لكل مناسبة', `<p>ابدأ بالمناسبة اللي محتاجها:</p>
<ul class="lp-list">
<li><a href="${urlOf('wedding')}">دعوة زفاف إلكترونية</a> — ظرف بيتفتح وعدّاد لحد يوم الفرح.</li>
<li><a href="${urlOf('engagement')}">دعوة خطوبة إلكترونية</a> — بصور السيشن وموسيقاكم.</li>
<li><a href="${urlOf('katb')}">دعوة كتب كتاب</a> — بآية قرآنية ومكان المسجد على الخريطة.</li>
<li><a href="${urlOf('cards')}">كروت أفراح إلكترونية</a> — بديل الكروت الورق.</li>
</ul>`],
    ],
    faq: [
      ['يعني إيه دعوة إلكترونية؟', 'صفحة خاصة بمناسبتك ليها لينك، بتفتح على أي موبايل، وفيها الميعاد والمكان على الخريطة وصور وموسيقى وتأكيد حضور.'],
      ['الدعوة الإلكترونية بتتبعت إزاي؟', 'بتنسخ اللينك وتبعته على واتساب أو إنستجرام أو فيسبوك أو رسالة — لأي عدد من الناس.'],
      ['محتاج خبرة في التصميم؟', 'لأ خالص. التصميم جاهز، وانت بتدوس على أي كلمة أو صورة في الدعوة وتغيّرها.'],
      ['الدعوة بالعربي ولا بالإنجليزي؟', 'الاتنين — كل تصميم ليه نسخة عربي ونسخة إنجليزي.'],
      ['الدعوة بتفضل موجودة لحد إمتى؟', 'طول العمر، مالهاش تاريخ انتهاء.'],
    ],
    related: ['wedding', 'farah', 'engagement', 'katb'],
  },

  cards: {
    title: 'كروت أفراح إلكترونية | كارت فرح بلينك بدل الطباعة — ميثاق',
    description: 'كروت أفراح إلكترونية بدل كروت الفرح الورق: كارت فرح فاخر بلينك تبعته على واتساب، بيتفتح كظرف وفيه الميعاد والقاعة على الخريطة وموسيقى وتأكيد حضور — من غير طباعة ولا توزيع.',
    eyebrow: 'كروت أفراح',
    h1: 'كروت أفراح إلكترونية',
    h1b: 'كارت فرحك من غير مطبعة ولا توزيع',
    lead: 'كارت الفرح الإلكتروني بيعمل كل اللي بيعمله الكارت الورق — وأكتر: بيوصل لكل الناس على واتساب في ثانية، بيتفتح كظرف حقيقي قدام الضيف، وجوّاه الميعاد والقاعة على الخريطة وموسيقاكم وتأكيد الحضور.',
    sections: [
      ['شكل الكارت اللي بتحبوه — بس بيتحرك', `<p>تصاميم ميثاق معمولة بروح كروت الأفراح الفاخرة: ظرف بختم شمع، دانتيل وورد، خطوط عربي أنيقة — بس بدل ما الضيف يفتح ظرف ورق، بيدوس على الختم والظرف بيتفتح قدامه وتبدأ الموسيقى.</p>
<p>ولو حابين تطبعوا كام كارت للكبار في العيلة، تقدروا تحطوا عليه كود QR بيفتح الدعوة الإلكترونية — فيبقى عندكم الاتنين.</p>`],
      ['كارت إلكتروني ولا ورق؟', `<ul class="lp-list">
<li><b>العدد:</b> الورق بيتحسب بالكارت، والإلكتروني لينك واحد لعدد لا نهائي.</li>
<li><b>الوقت:</b> الورق محتاج تصميم وطباعة وتوزيع، والإلكتروني بيجهز في دقايق.</li>
<li><b>التغيير:</b> لو حاجة اتغيّرت، الإلكتروني بيتعدّل على نفس اللينك.</li>
<li><b>الوصول:</b> القرايب اللي برّه مصر بيوصلهم الكارت في نفس اللحظة.</li>
</ul>`],
    ],
    faq: [
      ['كارت الفرح الإلكتروني بيتبعت إزاي؟', 'لينك بتبعته على واتساب لأي حد أو جروب، وبيظهر بصورة الدعوة وعنوانها.'],
      ['أقدر أطبع كام كارت كمان؟', 'أيوه، تقدر تطبع كروت عليها كود QR بيفتح الدعوة الإلكترونية.'],
      ['التصاميم شكلها إيه؟', 'ظروف بختم شمع وورد ودانتيل وخطوط عربي أنيقة — افتح أي تصميم وشوفه بنفسك قبل ما تختار.'],
      ['أقدر أغيّر الألوان والخطوط؟', 'أيوه، الخطوط والصور والكلام بيتغيّروا، والألوان في الباقات الأعلى.'],
    ],
    related: ['farah', 'wedding', 'einvite', 'wording'],
  },

  wording: {
    title: 'صيغ دعوة زفاف وكلام دعوة فرح جاهز للنسخ | ميثاق',
    description: 'أجمل صيغ دعوة زفاف وكلام دعوة فرح جاهز: صيغ بآيات قرآنية، صيغ رسمية باسم الأهل، صيغ بالعامية المصرية، صيغ كتب كتاب وخطوبة، وصيغ بالإنجليزي — انسخها وحطها في دعوتك.',
    eyebrow: 'صيغ دعوات',
    h1: 'صيغ دعوة زفاف',
    h1b: 'وكلام دعوة فرح جاهز تنسخه',
    lead: 'محتار تكتب إيه في دعوة الفرح؟ جمعنالك صيغ دعوة زفاف لكل الأذواق: بآية قرآنية، رسمية باسم الأهل، بالعامية المصرية، لكتب الكتاب والخطوبة، وبالإنجليزي. انسخ اللي يعجبك وحطه في دعوتك على ميثاق — كل كلمة في الدعوة بتتعدّل.',
    sections: [
      ['صيغ دعوة زفاف بآيات قرآنية', `<div class="lp-quote"><p>بسم الله الرحمن الرحيم<br>﴿وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً﴾<br>يتشرف ... و ... بدعوتكم لحضور حفل زفاف نجليهما<br>[اسم العريس] و [اسم العروسة]<br>وذلك يوم ... الموافق ... في تمام الساعة ... بقاعة ...</p></div>
<div class="lp-quote"><p>﴿وَخَلَقْنَاكُمْ أَزْوَاجًا﴾<br>بقلوب ملؤها الفرح والسرور نتشرف بدعوتكم لمشاركتنا فرحتنا بزفاف<br>[اسم العريس] و [اسم العروسة]<br>وحضوركم يكمل فرحتنا</p></div>`],
      ['صيغ رسمية باسم الأهل', `<div class="lp-quote"><p>يتشرف السيد/ ... والسيد/ ...<br>بدعوة سيادتكم لحضور حفل زفاف نجليهما<br>[اسم العريس] و [اسم العروسة]<br>وذلك بمشيئة الله تعالى يوم ... الموافق ...<br>والدعوة عامة — حضوركم يسعدنا</p></div>
<div class="lp-quote"><p>تتشرف عائلتا ... و ...<br>بدعوتكم لمشاركتهم فرحة زفاف أبنائهم<br>[اسم العريس] و [اسم العروسة]<br>ودمتم بخير</p></div>`],
      ['كلام دعوة فرح بالعامية المصرية', `<div class="lp-quote"><p>أخيرًا جه اليوم اللي استنيناه 🤍<br>[اسم العريس] و [اسم العروسة] بيعزموكم على فرحهم<br>يوم ... الساعة ... في ...<br>وجودكم هو اللي هيكمّل فرحتنا</p></div>
<div class="lp-quote"><p>فرحتنا مش هتكمل من غيركم<br>مستنيينكم في فرح [اسم العريس] و [اسم العروسة]<br>متتأخروش 😄</p></div>`],
      ['صيغ دعوة كتب كتاب وخطوبة', `<div class="lp-quote"><p>بسم الله الرحمن الرحيم<br>﴿هُوَ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَجَعَلَ مِنْهَا زَوْجَهَا لِيَسْكُنَ إِلَيْهَا﴾<br>نتشرف بدعوتكم لحضور عقد قران<br>[اسم العريس] و [اسم العروسة]<br>بمسجد ... عقب صلاة ...</p></div>
<div class="lp-quote"><p>وبدأت الحكاية 💍<br>يسعدنا دعوتكم لحضور حفل خطوبة<br>[اسم العريس] و [اسم العروسة]<br>يوم ... في ...</p></div>
<p>دعوة الخطوبة بالتفصيل في صفحة <a href="${urlOf('engagement')}">دعوة خطوبة إلكترونية</a>، وكتب الكتاب في <a href="${urlOf('katb')}">دعوة كتب كتاب</a>.</p>`],
      ['صيغ دعوة زفاف بالإنجليزي', `<div class="lp-quote" dir="ltr"><p>Together with their families<br>[Bride] &amp; [Groom]<br>request the pleasure of your company<br>at the celebration of their marriage<br>on ... at ... o'clock · ...</p></div>
<div class="lp-quote" dir="ltr"><p>Two hearts, one love.<br>Join us as we say "I do"<br>[Bride] &amp; [Groom]</p></div>`],
      ['نصايح وانت بتكتب دعوة الزفاف', `<ul class="lp-list">
<li><b>خليها قصيرة:</b> الضيف بيقرا من الموبايل — سطرين ترحيب كفاية، والتفاصيل في أماكنها في الدعوة.</li>
<li><b>اكتب الميعاد كامل:</b> اليوم والتاريخ والساعة — والدعوة بتعمل عدّاد لوحدها.</li>
<li><b>متكتبش العنوان بس:</b> حط اللوكيشن على الخريطة عشان الضيف يوصل من غير ما يتصل.</li>
<li><b>اطلب تأكيد الحضور:</b> زرار في الدعوة بيوفّر عليك تحسب الأعداد بنفسك.</li>
</ul>`],
    ],
    faq: [
      ['إيه أفضل صيغة لدعوة الزفاف؟', 'على حسب ذوقكم: الصيغة بآية قرآنية وأسامي الأهل هي الأكتر انتشارًا في مصر، والعامية مناسبة لدعوة الصحاب، والإنجليزي لو المعازيم من جنسيات مختلفة.'],
      ['إيه اللي يتكتب في دعوة الفرح؟', 'أسامي العرسان (وأحيانًا الأهل)، اليوم والتاريخ والساعة، اسم القاعة وعنوانها، وكلمة ترحيب — وفي الدعوة الإلكترونية كمان خريطة وتأكيد حضور.'],
      ['أقدر أحط الصيغة دي في دعوة إلكترونية؟', 'أيوه، في ميثاق كل كلمة في الدعوة بتتعدّل — بتنسخ الصيغة وتحطها مكان الكلام في التصميم.'],
      ['أكتب أسامي الأهل في الدعوة؟', 'ده عُرف منتشر في الدعوات الرسمية، وفي تصاميم فيها مكان مخصوص لأسامي الأهل — ولو مش حابين، تقدروا تشيلوه.'],
    ],
    related: ['wedding', 'katb', 'farah', 'engagement'],
  },
};

const NAV_LABEL = {
  wedding: 'دعوة زفاف إلكترونية', farah: 'دعوة فرح', engagement: 'دعوة خطوبة', katb: 'دعوة كتب كتاب',
  einvite: 'دعوات إلكترونية', cards: 'كروت أفراح', wording: 'صيغ دعوة زفاف',
};

// "/دعوة-فرح" (أو نفس اللينك متشفّر) → مفتاح الصفحة
function landingKeyFor(reqPath) {
  let p = String(reqPath || '');
  try { p = decodeURIComponent(p); } catch (_) { return null; }
  p = p.replace(/\/+$/, '');
  return Object.keys(SLUGS).find((k) => `/${SLUGS[k]}` === p) || null;
}

const fmt = (n) => Number(n || 0).toLocaleString('en-US');

const CSS = `
:root{--night:#08130f;--ivory:#faf5ec;--ivory-dim:#efe4d2;--card:#fffdf8;--rose:#c9788a;--emerald:#1f6f5c;--brass:#c9a24a;--brass-soft:#e6c684;--ink:#0f1d18;--ink-dim:#5c6b64;--line:rgba(15,29,24,.13)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ivory);color:var(--ink);font:400 16px/1.9 'Cairo',system-ui,sans-serif}
a{color:var(--emerald)}img{max-width:100%;display:block}
.wrap{max-width:1040px;margin:0 auto;padding:0 18px}
.top{position:sticky;top:0;z-index:5;background:rgba(250,245,236,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);font:700 20px/1 'Amiri',serif}
.brand img{height:40px;width:auto}
.top nav{display:flex;gap:6px;align-items:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;padding:11px 22px;font-weight:700;font-size:15px;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease}
.btn:hover{transform:translateY(-1px)}
.btn-main{background:var(--night);color:var(--ivory);box-shadow:0 8px 22px rgba(8,19,15,.18)}
.btn-soft{border:1px solid var(--line);color:var(--ink);background:var(--card)}
.top .btn{padding:8px 16px;font-size:13.5px}
.hero{background:radial-gradient(120% 90% at 50% 0%,#0f2a20 0%,var(--night) 70%);color:var(--ivory);padding:54px 0 60px;text-align:center;position:relative;overflow:hidden}
.hero:after{content:"";position:absolute;inset:auto 0 0;height:1px;background:linear-gradient(90deg,transparent,var(--brass),transparent)}
.eyebrow{display:inline-block;font-size:12.5px;font-weight:700;letter-spacing:0;color:var(--brass-soft);border:1px solid rgba(230,198,132,.35);border-radius:999px;padding:4px 14px;margin-bottom:16px}
h1{margin:0;font:700 clamp(34px,7vw,58px)/1.25 'Amiri',serif}
h1 span{display:block;font-size:.52em;color:var(--brass-soft);margin-top:6px}
.lead{max-width:680px;margin:18px auto 0;color:rgba(250,245,236,.82);font-size:16.5px}
.hero .cta{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:26px}
.hero .btn-main{background:var(--brass);color:var(--night)}
.hero .btn-soft{background:transparent;color:var(--ivory);border-color:rgba(250,245,236,.3)}
.stats{display:flex;justify-content:center;gap:28px;flex-wrap:wrap;margin-top:30px}
.stats b{display:block;font:700 26px/1.2 'Cairo',sans-serif;color:var(--ivory)}
.stats span{font-size:12.5px;color:rgba(250,245,236,.65)}
section{padding:46px 0}
section+section{border-top:1px solid var(--line)}
h2{font:700 clamp(24px,4.6vw,32px)/1.35 'Amiri',serif;margin:0 0 14px;color:var(--ink)}
h3{margin:0 0 6px;font-size:17px}
.prose{max-width:760px}
.prose p{margin:0 0 12px;color:#26352f}
.lp-list{padding:0 20px 0 0;margin:0}
.lp-list li{margin:0 0 8px}
q{quotes:"«" "»";font-family:'Amiri',serif;font-size:1.08em}
.grid{display:grid;gap:14px}
.feat{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.feat div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px}
.feat p{margin:0;color:var(--ink-dim);font-size:14.5px;line-height:1.8}
.designs{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.design{display:block;text-decoration:none;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}
.design:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(15,29,24,.12)}
.design img{width:100%;aspect-ratio:3/4;object-fit:cover;background:var(--ivory-dim)}
.design div{padding:10px 12px 12px}
.design b{display:block;font-size:14px}
.design small{display:block;color:var(--ink-dim);font-size:12px;line-height:1.6;margin-top:2px}
.design i{font-style:normal;font-size:12.5px;color:var(--emerald);font-weight:700}
.steps{grid-template-columns:repeat(auto-fit,minmax(200px,1fr));counter-reset:s}
.steps div{position:relative;padding:18px 18px 18px;background:var(--card);border:1px solid var(--line);border-radius:18px}
.steps div:before{counter-increment:s;content:counter(s);display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--night);color:var(--brass-soft);font-weight:700;margin-bottom:8px}
.steps p{margin:0;color:var(--ink-dim);font-size:14.5px;line-height:1.8}
.lp-quote{background:var(--card);border:1px solid var(--line);border-right:3px solid var(--brass);border-radius:14px;padding:14px 18px;margin:0 0 12px;font-family:'Amiri',serif;font-size:18px;line-height:2}
.lp-quote[dir=ltr]{border-right:1px solid var(--line);border-left:3px solid var(--brass);font-family:Georgia,serif;font-size:16px}
.lp-quote p{margin:0}
.lp-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lp-compare>div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px}
.lp-compare>div.on{border-color:var(--emerald);background:#f2f8f5}
.lp-compare ul{margin:0;padding:0 18px 0 0;font-size:14.5px}
details{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:0 16px;margin:0 0 10px}
summary{cursor:pointer;font-weight:700;padding:14px 0;list-style:none}
summary::-webkit-details-marker{display:none}
summary:after{content:"+";float:left;color:var(--brass);font-size:20px;line-height:1}
details[open] summary:after{content:"−"}
details p{margin:0 0 14px;color:var(--ink-dim)}
.band{background:var(--night);color:var(--ivory);border-radius:24px;padding:30px 22px;text-align:center}
.band h2{color:var(--ivory)}
.band p{color:rgba(250,245,236,.78);margin:0 0 18px}
.band .btn-main{background:var(--brass);color:var(--night)}
.related{display:flex;flex-wrap:wrap;gap:8px}
.related a{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 14px;font-size:14px;text-decoration:none;color:var(--ink)}
.related a:hover{border-color:var(--brass)}
.crumbs{font-size:13px;color:var(--ink-dim);padding:14px 0 0}
.crumbs a{color:var(--ink-dim)}
footer{padding:30px 0 40px;text-align:center;font-size:13px;color:var(--ink-dim);border-top:1px solid var(--line)}
footer nav{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-bottom:12px}
footer a{color:var(--ink-dim)}
@media (max-width:560px){.top nav .btn-soft{display:none}.lp-compare{grid-template-columns:1fr}section{padding:36px 0}.stats{gap:18px}}
@media (prefers-reduced-motion:reduce){.btn,.design{transition:none}}
`;

function renderLanding(key, stats) {
  const pg = PAGES[key];
  const url = SITE + encodeURI(urlOf(key));
  const designs = TEMPLATES.map((t) => {
    const img = thumbOf(t.id);
    return `<a class="design" href="/preview-sample/${esc(t.id)}">
${img ? `<img src="${esc(img)}" alt="تصميم دعوة زفاف إلكترونية ${esc(t.name)}" width="300" height="400" loading="lazy" decoding="async">` : ''}
<div><b>${esc(t.name)}</b><small>${esc(t.description)}</small><i>شوف الدعوة ←</i></div></a>`;
  }).join('\n');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#page`, url, name: pg.title, description: pg.description, inLanguage: 'ar',
        isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#org` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ميثاق', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: NAV_LABEL[key], item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: pg.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };

  const statsHtml = stats && stats.totalInvitations
    ? `<div class="stats"><div><b>+${fmt(stats.totalInvitations)}</b><span>دعوة اتعملت على ميثاق</span></div><div><b>+${fmt(stats.totalViews)}</b><span>فتحة للدعوات</span></div></div>`
    : '';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(pg.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ميثاق">
<meta property="og:locale" content="ar_EG">
<meta property="og:title" content="${esc(pg.h1)} — ميثاق">
<meta property="og:description" content="${esc(pg.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITE}/img/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#08130f">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&display=swap">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="ميثاق — الرئيسية"><img src="/img/logo.png" alt="ميثاق" width="70" height="40"></a>
<nav><a class="btn btn-soft" href="/packages">الباقات</a><a class="btn btn-main" href="/#gallery">اعمل دعوتك</a></nav>
</div></header>
<main>
<div class="hero"><div class="wrap">
<span class="eyebrow">${esc(pg.eyebrow)}</span>
<h1>${esc(pg.h1)}<span>${esc(pg.h1b)}</span></h1>
<p class="lead">${esc(pg.lead)}</p>
<div class="cta"><a class="btn btn-main" href="/#gallery">اختار تصميمك وابدأ</a><a class="btn btn-soft" href="#designs">اتفرّج على التصاميم</a></div>
${statsHtml}
</div></div>
<div class="wrap crumbs"><a href="/">ميثاق</a> ‹ <span>${esc(NAV_LABEL[key])}</span></div>
${pg.sections.map(([h, body], i) => `<section${i === 0 ? '' : ''}><div class="wrap prose"><h2>${esc(h)}</h2>${body}</div></section>`).join('\n')}
<section id="designs"><div class="wrap"><h2>تصاميم ${esc(NAV_LABEL[key] === 'صيغ دعوة زفاف' ? 'دعوات زفاف' : NAV_LABEL[key])} جاهزة</h2>
<p class="prose" style="margin:0 0 16px;color:var(--ink-dim)">افتح أي تصميم وشوفه شغّال بالظبط زي ما ضيوفك هيشوفوه — وكل كلمة وصورة فيه بتتغيّر.</p>
<div class="grid designs">${designs}</div></div></section>
<section><div class="wrap"><h2>كل اللي في الدعوة</h2><div class="grid feat">${FEATURES.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div></div></section>
<section><div class="wrap"><h2>إزاي تعمل دعوتك في 4 خطوات</h2><div class="grid steps">${STEPS.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div></div></section>
<section><div class="wrap prose"><h2>أسئلة بتتسأل كتير</h2>${pg.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
<section><div class="wrap"><div class="band"><h2>دعوتكم جاهزة في دقايق</h2><p>اختار التصميم، اكتب بياناتكم، وابعت اللينك لكل ضيوفكم.</p><a class="btn btn-main" href="/#gallery">ابدأ دلوقتي</a> <a class="btn btn-soft" style="background:transparent;color:var(--ivory);border-color:rgba(250,245,236,.3)" href="/packages">الباقات والأسعار</a></div>
<h2 style="margin-top:34px;font-size:22px">صفحات ممكن تفيدك</h2>
<div class="related">${pg.related.map((k) => `<a href="${esc(urlOf(k))}">${esc(NAV_LABEL[k])}</a>`).join('')}</div></div></section>
</main>
<footer><div class="wrap">
<nav>${Object.keys(SLUGS).map((k) => `<a href="${esc(urlOf(k))}">${esc(NAV_LABEL[k])}</a>`).join('')}<a href="/packages">الباقات</a><a href="/privacy">الخصوصية</a></nav>
ميثاق — دعوات للحظات العمر الجميلة · <a href="mailto:mithaq@mithaq-invitation.com">mithaq@mithaq-invitation.com</a>
</div></footer>
</body>
</html>`;
}

// الأرقام بتيجي من قاعدة البيانات — لو مش متاحة، الصفحة بتطلع من غيرها
async function landingHtml(key) {
  let stats = null;
  // مانستناش قاعدة البيانات أكتر من ثانية ونص — جوجل بيحب الصفحات السريعة
  try {
    stats = await Promise.race([getPublicStats(), new Promise((r) => setTimeout(() => r(null), 1500))]);
  } catch (_) { stats = null; }
  return renderLanding(key, stats);
}

const LANDING_KEYS = Object.keys(SLUGS);

module.exports = { landingKeyFor, landingHtml, renderLanding, urlOf, LANDING_KEYS, NAV_LABEL, SLUGS };
