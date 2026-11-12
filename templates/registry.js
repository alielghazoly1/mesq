// templates/registry.js
// كل قالب دعوة متاح في الموقع بيتسجل هنا. لما تضيف تصميم جديد بعدين،
// كل اللي محتاجه: تحط ملف التصميم في views/، وتضيف سطر جديد هنا — من غير
// ما تلمس أي كود تاني في السيرفر أو الفورم (بيقرأوا من السجل ده تلقائيًا).

const { SUPPORTED_LANGUAGES, SUPPORTED_OCCASIONS } = require('../i18n/strings');

const TEMPLATES = [
  {
    id: 'blossom-oud',
    name: 'Blossom & Oud',
    description: 'تصميم مغربي فاخر بألوان دافئة وخط عربي وفرنساوي',
    // ملف التصميم الفعلي جوه views/
    file: 'blossom-oud.html',
    // اللغات ونوع المناسبة اللي القالب ده بيدعمهم
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // الأقسام اللي العميل يقدر يشيلها من الدعوة قبل الإنشاء
    // (key: المفتاح المخزن في hiddenSections، label: يظهر في الفورم فقط)
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'timeline', label: 'جدول أوقات الحفلة' },
      { key: 'dressCode', label: 'الزي المقترح (Dress Code)' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'map', label: 'خريطة جوجل' },
    ],
    // مراحل جدول أوقات الحفلة الافتراضية اللي القالب ده بيعرضها
    timelineStages: ['reception', 'ceremony', 'dinner', 'party'],
    // بيانات إضافية اختيارية بيحتاجها القالب ده (تظهر في الفورم بس لو موجودة)
    extraFields: [],
    // لو true، القالب ده بيتطلب تسجيل دخول عشان أي حد يقدر يشوفه أو يستخدمه
    // (middleware/auth.js + الفحص في routes/invitations.js). كل القوالب
    // دلوقتي بباقة — الإنشاء للمشتركين بس، والمعاينة مفتوحة للكل.
    isPremium: true,
  },
  {
    id: 'viktor-paula',
    name: 'Viktor & Paula',
    description: 'تصميم أوروبي أنيق وبسيط، بجدول مواعيد وقسم تفاصيل تواصل',
    file: 'viktor-paula.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'timeline', label: 'جدول أوقات الحفلة' },
      { key: 'dressCode', label: 'الزي المقترح (Dress Code)' },
      { key: 'details', label: 'تفاصيل التواصل والهدايا' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
    ],
    timelineStages: ['ceremony', 'cocktail', 'dinner', 'party'],
    // حقول إضافية خاصة بالقالب ده بس — الفورم بيظهرها تلقائي لما تختاره
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة بالتفصيل (اختياري)', maxlength: 200 },
      { key: 'contactName', label: 'اسم الشخص المسؤول عن الاستفسارات (اختياري)', maxlength: 80 },
      { key: 'contactPhone', label: 'رقم تليفون التواصل (اختياري)', maxlength: 40 },
    ],
    isPremium: true,
  },
  {
    id: 'dolce-vita',
    name: 'Dolce Vita',
    description: 'تصميم عصري بألوان باستيل هادية، وفيه ودجت تفاعلي لطيف لكشف تاريخ الفرح بالخدش',
    file: 'dolce-vita.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    optionalSections: [
      { key: 'timeline', label: 'جدول أوقات الحفلة' },
      { key: 'dressCode', label: 'الزي المقترح (Dress Code)' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
    ],
    // ترتيب المراحل هنا لازم يفضل زي ما هو بالظبط (بيتحدد بيه ترتيب الصفوف
    // في جدول الحفلة على التصميم — مطابق لترتيبهم فعليًا على الشاشة)
    timelineStages: ['reception', 'ceremony', 'cocktail', 'dinner', 'party', 'farewell'],
    extraFields: [],
    isPremium: true,
  },
  {
    id: 'royal-maroon',
    name: 'Royal Maroon',
    description: 'تصميم ملكي بالأحمر العنابي والذهبي — ظرف يتفتح، ألبوم صور، تقويم، وسجل تهاني',
    file: 'royal-maroon.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'timeline', label: 'برنامج اليوم' },
      { key: 'dressCode', label: 'قواعد اللباس' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'map', label: 'مكان الحفل والخريطة' },
      { key: 'album', label: 'ألبوم الصور' },
      { key: 'guestbook', label: 'سجل التهاني' },
      { key: 'gift', label: 'صندوق الهدية' },
    ],
    timelineStages: ['reception', 'ceremony', 'cocktail', 'dinner', 'party'],
    extraFields: [],
    // التصميم ده للمشتركين بس — أغنى تصميم في الموقع وفيه أكتر تفاصيل
    // قابلة للتعديل، فمنطقي يكون جزء من الباقة
    isPremium: true,
  },
  {
    id: 'ivory-swans',
    name: 'Ivory Swans',
    description: 'تصميم كلاسيكي فاخر بألوان عاجية — بجعتان وإطار ورد وخط عربي أنيق، وسجل حضور احترافي',
    file: 'ivory-swans.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // كل قسم في التصميم العميل يقدر يشيله من "الأقسام" في المحرر (ما عدا
    // الغلاف). الإخفاء نفسه في views/ivory-swans.html (SECTIONS).
    optionalSections: [
      { key: 'hero', label: 'الصورة الرئيسية (البجعتين)' },
      { key: 'verse', label: 'الآية الكريمة' },
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'saveTheDate', label: 'احفظ الموعد (التقويم)' },
      { key: 'story', label: 'صوركم وحكايتكم' },
      { key: 'families', label: 'الأهل والعائلات' },
      { key: 'venue', label: 'القاعة والمكان' },
      { key: 'map', label: 'خريطة جوجل' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
    ],
    // مفيش جدول أوقات في التصميم ده
    timelineStages: [],
    extraFields: [],
    isPremium: true,
  },
  {
    id: 'lily-garden',
    name: 'Lily Garden',
    description: 'ظرف بختم شمع وزنبق وردي ينفتح — عدّاد تنازلي، تأكيد حضور، وألبوم يرفع فيه الضيوف صور الفرح',
    file: 'lily-garden.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'map', label: 'مكان الحفل والخريطة' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'guestPhotos', label: 'ألبوم صور الضيوف' },
    ],
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // التصميم بنسختين: إنجليزي (الافتراضي — المعاينة للزوار) وعربي. العميل
    // بيختار واحدة منهم وهو بيبدأ الدعوة (نافذة الاختيار في المعرض)
    designLanguages: ['en', 'ar'],
    // بيظهر "جديد" على الكارت في المعرض لحد ما المالك يشيلها من لوحة التحكم
    // (utils/siteConfig.js) — ده الافتراضي بس قبل ما المالك يرتّب بنفسه
    isNew: true,
    // القوالب اللي فيها قسم رفع صور الضيوف — لوحة العميل بتظهر "صور
    // الضيوف" للدعوات دي بس، والسيرفر بيرفض الرفع لأي قالب تاني
    guestPhotos: true,
    // اسم العريس (lg2) بقى غلاف جواه الاسم (lg79) وحرف "و" (lg80) كعنصر
    // مستقل — نص قديم محفوظ على lg2 بيتعرض على lg79 (utils/renderInvitation.js)
    textAliases: { lg2: 'lg79' },
    isPremium: true,
  },
  {
    id: 'champagne-lace',
    name: 'Champagne Lace',
    description: 'ظرف بختم شمع وورد أبيض وزنبق، تاريخ ينكشف بالخدش، ظرف دانتيل ذهبي بآية قرآنية، عدّاد، خريطة، ألبوم صور وتأكيد حضور',
    file: 'champagne-lace.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    optionalSections: [
      { key: 'dressCode', label: 'الزي المقترح (Dress Code)' },
      { key: 'verse', label: 'الآية القرآنية (ظرف الدانتيل)' },
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'map', label: 'مكان الحفل والخريطة' },
      { key: 'album', label: 'ألبوم الصور' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'closing', label: 'الختام (في انتظاركم + الأسماء)' },
    ],
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // نسختين زي Lily Garden: إنجليزي (التصميم الأصلي — المعاينة للزوار) وعربي
    designLanguages: ['en', 'ar'],
    isNew: true,
    isPremium: true,
  },
  {
    id: 'velvet-voice',
    name: 'Velvet Voice',
    description: 'ظرف دانتيل عنابي بختم دهبي بيتفتح وكارت بيطلع منه — صفحات بتتقلب: الأسماء، الآية، العدّاد، الأهل، المكان، تأكيد الحضور، وتهنئة صوتية من الضيوف',
    file: 'velvet-voice.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // كل صفحة صاحب الدعوة يقدر يشيلها (ما عدا صفحة الأسماء). الإخفاء في
    // views/velvet-voice.html (data-section على كل صفحة).
    optionalSections: [
      { key: 'verse', label: 'الآية الكريمة' },
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'families', label: 'الحكاية والأهل' },
      { key: 'venue', label: 'مكان الحفل والخريطة' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'voice', label: 'التهاني الصوتية من الضيوف' },
    ],
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // نسختين: عربي (التصميم الأصلي — المعاينة للزوار) وإنجليزي. العميل
    // بيختار واحدة منهم وهو بيبدأ الدعوة (نافذة الاختيار في المعرض)
    designLanguages: ['ar', 'en'],
    // الضيوف بيسجّلوا تهنئة صوتية من جوه الدعوة (routes/guestVoices.js) —
    // صاحب الدعوة بيسمعها في لوحته
    guestVoice: true,
    isNew: true,
    isPremium: true,
  },
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    description: 'ظرف بختم قلب دهبي بيتفتح على كولاج كامل بيتركّب قدامك — دانتيل وورد أبيض وصور العرسان وطبق الدبل — عدّاد، برنامج اليوم، خريطة، ألوان الزي، تأكيد حضور، تهنئة صوتية وصور الضيوف',
    file: 'sage-garden.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // الإخفاء في views/sage-garden.html (data-section على كل قسم). الكولاج
    // (أول شاشة) ثابت مبيتشالش.
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'timeline', label: 'برنامج اليوم' },
      { key: 'venue', label: 'مكان الحفل والخريطة' },
      { key: 'dressCode', label: 'الزي المقترح (Dress Code)' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'voice', label: 'التهاني الصوتية من الضيوف' },
      { key: 'guestPhotos', label: 'صور الضيوف' },
      { key: 'closing', label: 'الختام (طبق الدبل والأسماء)' },
    ],
    // البرنامج نصوص قابلة للتعديل جوه التصميم (مش مراحل الفورم)
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // نسختين منفصلتين: إنجليزي (التصميم الأصلي — المعاينة للزوار) وعربي.
    // العميل بيختار واحدة وهو بيبدأ الدعوة — مفيش زرار لغة جوه الدعوة.
    designLanguages: ['en', 'ar'],
    guestVoice: true,
    guestPhotos: true,
    isNew: true,
    isPremium: true,
  },
  {
    id: 'pearl-peony',
    name: 'Pearl Peony',
    description: 'ظرف دانتيل بشريطة خضرا وختم — بيتفتح بلمسة وينزل لتحت، وورد بيوني ولؤلؤ بيتمايل وورد صغير بينزل من فوق، وموسيقى شوبان — الموعد والعدّاد، برنامج الحفل، المكان، ألوان الإطلالة، ملاحظات للضيوف وتأكيد الحضور',
    file: 'pearl-peony.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // الإخفاء في views/pearl-peony.html (data-section). الافتتاحية والموعد ثابتين.
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'timeline', label: 'برنامج الحفل' },
      { key: 'venue', label: 'مكان الحفل' },
      { key: 'dressCode', label: 'ألوان الإطلالة (Dress Code)' },
      { key: 'notes', label: 'ملاحظات للضيوف' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
    ],
    // البرنامج نصوص قابلة للتعديل جوه التصميم (مش مراحل الفورم)
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // نسختين منفصلتين: إنجليزي (الافتراضي — المعاينة للزوار، بطلب المالك) وعربي.
    // العميل بيختار واحدة وهو بيبدأ الدعوة — مفيش زرار لغة جوه الدعوة.
    designLanguages: ['en', 'ar'],
    isNew: true,
    isPremium: true,
  },
  {
    id: 'mother-of-pearl',
    name: 'Mother of Pearl',
    description: 'ظرف صدف بختم شمع عليه قلب بيتفتح في فيديو وبعده فيونكة الكارت — كارت بإطار ورد بارز، عدّاد، 4 صور بتتقلب يمين وشمال، المكان وزرار الخريطة، تأكيد الحضور، الزي المقترح، والختام بختم اللؤلؤ',
    file: 'mother-of-pearl.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // الإخفاء في views/mother-of-pearl.html (data-section). الكارت الأساسي والختام ثابتين.
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'gallery', label: 'صوركم (4 صور بتتقلب)' },
      { key: 'venue', label: 'مكان الحفل وزرار الخريطة' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
      { key: 'dressCode', label: 'الزي المقترح (Dress Code)' },
    ],
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // نسختين: إنجليزي (التصميم الأصلي — المعاينة للزوار) وعربي
    designLanguages: ['en', 'ar'],
    isNew: true,
    isPremium: true,
  },
  {
    id: 'golden-calla',
    name: 'Golden Calla',
    description: 'باب عاجي بزهور الكالا البارزة وختم شمع دهبي بحروف العروسين بيتفتح على كارت بإطار دهبي وصورتكم في برواز بيضاوي — عدّاد، العائلتين، برنامج الحفل، ألبوم صور، المكان والخريطة، وتأكيد الحضور',
    file: 'golden-calla.html',
    languages: SUPPORTED_LANGUAGES,
    occasionTypes: SUPPORTED_OCCASIONS,
    // الإخفاء في views/golden-calla.html (data-section). الكارت الأساسي والختام ثابتين.
    optionalSections: [
      { key: 'countdown', label: 'العداد التنازلي' },
      { key: 'families', label: 'الأهل والعائلات' },
      { key: 'timeline', label: 'برنامج الحفل' },
      { key: 'gallery', label: 'صوركم (بتتقلب يمين وشمال)' },
      { key: 'venue', label: 'مكان الحفل والخريطة' },
      { key: 'rsvp', label: 'تأكيد الحضور (RSVP)' },
    ],
    timelineStages: [],
    extraFields: [
      { key: 'venueAddress', label: 'عنوان القاعة (بيظهر تحت اسمها — اختياري)', maxlength: 200 },
    ],
    // نسختين: إنجليزي (التصميم الأصلي — المعاينة للزوار) وعربي
    designLanguages: ['en', 'ar'],
    isNew: true,
    isPremium: true,
  },
];

// قوالب جاهزة بس لسه مش في المعرض (المالك بيراجعها الأول): المعاينة والمحرر شغالين باللينك
// المباشر، ومابتظهرش في قايمة التصاميم ولا خريطة الموقع ولا لوحة التحكم. لما المالك يوافق
// بتتنقل لـ TEMPLATES فوق.
const UNLISTED_TEMPLATES = [
  {
    id: 'birthday-gift',
    name: 'Birthday Gift',
    description: 'هدية عيد ميلاد إلكترونية: كارت نبيتي بفيونكة دانتيل — ضغطة عليها تفتح الهدية وينزل ورد أحمر — كارت بالاسم ورسمة التورتة والسن، رسالة من القلب، ألبوم ذكريات بيتقلب، أمنيات، وختام بختم الشمع',
    file: 'birthday-gift.html',
    languages: SUPPORTED_LANGUAGES,
    // قسم تاني غير دعوات الفرح: هدية لصاحبة/أخت/أم/حبيبة
    category: 'birthday',
    occasionTypes: ['birthday'],
    // الإخفاء في views/birthday-gift.html (data-section). الكارت الأساسي والختام ثابتين.
    optionalSections: [
      { key: 'message', label: 'الرسالة' },
      { key: 'gallery', label: 'ألبوم الذكريات' },
      { key: 'wishes', label: 'الأمنيات' },
      { key: 'countdown', label: 'العدّاد ليوم الميلاد' },
      { key: 'rsvp', label: 'رد صاحب/ة الهدية' },
    ],
    timelineStages: [],
    extraFields: [],
    // بيانات المسودة الجديدة: brideName = صاحب/ة العيد، groomName = اللي باعت الهدية
    draftDefaults: { brideName: 'Sarah', brideNameAr: 'سارة', groomName: 'Your Name', groomNameAr: 'اسمك', venueName: 'Home', venueCity: 'City' },
    designLanguages: ['en', 'ar'],
    isNew: true,
    isPremium: true,
  },
];

function getTemplate(templateId) {
  return TEMPLATES.find((t) => t.id === templateId) || UNLISTED_TEMPLATES.find((t) => t.id === templateId) || null;
}

function getDefaultTemplate() {
  return TEMPLATES[0];
}

module.exports = { TEMPLATES, UNLISTED_TEMPLATES, getTemplate, getDefaultTemplate };
