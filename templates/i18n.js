// templates/i18n.js
// ترجمة النصوص اللي بتخرج من سجل التصاميم للواجهة (أسماء الأقسام
// الاختيارية، والحقول الإضافية، ووصف كل تصميم). التصاميم نفسها
// (views/*.html) مالهاش دعوة بده — ليها نظام لغات مستقل.

const TEMPLATE_TEXT = {
  'blossom-oud': {
    ar: { description: 'تصميم مغربي فاخر بألوان دافئة وخط عربي وفرنساوي' },
    en: { description: 'A luxurious Moroccan design in warm tones, with Arabic and French type' },
  },
  'viktor-paula': {
    ar: { description: 'تصميم أوروبي أنيق وبسيط، بجدول مواعيد وقسم تفاصيل تواصل' },
    en: { description: 'An elegant, minimal European design with a schedule and contact details' },
  },
  'dolce-vita': {
    ar: { description: 'تصميم عصري بألوان باستيل هادية، وفيه ودجت تفاعلي لطيف لكشف تاريخ الفرح بالخدش' },
    en: { description: 'A modern design in soft pastels, with a playful scratch-to-reveal date widget' },
  },
  'velvet-voice': {
    ar: { description: 'ظرف دانتيل عنابي بختم دهبي بيتفتح وكارت بيطلع منه — صفحات بتتقلب، عدّاد، خريطة، تأكيد حضور، وتهنئة صوتية من الضيوف' },
    en: { description: 'A burgundy lace envelope with a gold seal that opens into flip-through pages — countdown, map, RSVP, and voice greetings from guests' },
  },
  'sage-garden': {
    ar: { description: 'ظرف بختم قلب دهبي بيتفتح على كولاج كامل بيتركّب قدامك — دانتيل وورد أبيض وصور العرسان وطبق الدبل — عدّاد، برنامج اليوم، خريطة، ألوان الزي، تأكيد حضور، تهنئة صوتية وصور الضيوف' },
    en: { description: 'A gold heart-sealed envelope that opens onto a collage assembling itself — lace, white flowers, your photos and a ring tray — with countdown, schedule, map, dress-code colours, RSVP, voice wishes and guest photos' },
  },
  'mother-of-pearl': {
    ar: { description: 'ظرف صدف بختم شمع عليه قلب بيتفتح في فيديو وبعده فيونكة الكارت — عدّاد، 4 صور بتتقلب، المكان والخريطة، تأكيد الحضور، والزي المقترح' },
    en: { description: 'A mother-of-pearl envelope with a heart wax seal that opens on video, then a ribbon reveals the card — countdown, a 4-photo carousel, venue and map, RSVP and dress code' },
  },
  'golden-calla': {
    ar: { description: 'باب عاجي بزهور الكالا البارزة وختم شمع دهبي بحروف العروسين بيتفتح على كارت بإطار دهبي وصورتكم في برواز بيضاوي — عدّاد، العائلتين، برنامج الحفل، ألبوم صور، المكان والخريطة، وتأكيد الحضور' },
    en: { description: 'Ivory doors of sculpted calla lilies with a gold wax seal of your initials open onto a gold-framed card with your photo in an oval frame — countdown, families, programme, photo album, venue map and RSVP' },
  },
  'birthday-gift': {
    ar: { description: 'هدية ملفوفة بفيونكة دانتيل — ضغطة تفكّها وينزل ورد أحمر — كارت بالاسم والسن، رسالة من القلب، ألبوم ذكريات، أمنيات، وعدّاد ليوم الميلاد' },
    en: { description: 'A gift wrapped in a lace bow — one tap unties it and red roses fall — a card with their name and age, a letter from the heart, a memories album, wishes and a birthday countdown' },
    sections: {
      message: { ar: 'الرسالة', en: 'The letter' },
      gallery: { ar: 'ألبوم الذكريات', en: 'Memories album' },
      wishes: { ar: 'الأمنيات', en: 'Wishes' },
      countdown: { ar: 'العدّاد ليوم الميلاد', en: 'Birthday countdown' },
      rsvp: { ar: 'الرد على الهدية', en: 'Reply to the gift' },
    },
  },
  'lily-garden': {
    ar: { description: 'ظرف بختم شمع وزنبق وردي ينفتح — عدّاد تنازلي، تأكيد حضور، وألبوم يرفع فيه الضيوف صور الفرح' },
    en: { description: 'A wax-sealed envelope of pink lilies that opens — countdown, RSVP, and an album where guests upload their photos' },
  },
};

const SECTION_LABELS = {
  countdown: { ar: 'العداد التنازلي', en: 'Countdown' },
  timeline: { ar: 'جدول أوقات الحفلة', en: 'Event schedule' },
  dressCode: { ar: 'الزي المقترح (Dress Code)', en: 'Dress code' },
  rsvp: { ar: 'تأكيد الحضور (RSVP)', en: 'RSVP' },
  map: { ar: 'خريطة جوجل', en: 'Google map' },
  details: { ar: 'تفاصيل التواصل والهدايا', en: 'Contact & gift details' },
  guestPhotos: { ar: 'ألبوم صور الضيوف', en: 'Guest photo album' },
  hero: { ar: 'الصورة الرئيسية', en: 'Main picture' },
  verse: { ar: 'الآية الكريمة', en: 'Quran verse' },
  saveTheDate: { ar: 'احفظ الموعد (التقويم)', en: 'Save the date (calendar)' },
  story: { ar: 'صوركم وحكايتكم', en: 'Your photos & story' },
  gallery: { ar: 'صوركم (بتتقلب يمين وشمال)', en: 'Photo carousel' },
  families: { ar: 'الأهل والعائلات', en: 'Families' },
  venue: { ar: 'القاعة والمكان', en: 'Venue' },
  voice: { ar: 'التهاني الصوتية من الضيوف', en: 'Guest voice greetings' },
};

const EXTRA_FIELD_LABELS = {
  venueAddress: { ar: 'عنوان القاعة بالتفصيل (اختياري)', en: 'Full venue address (optional)' },
  contactName: { ar: 'اسم الشخص المسؤول عن الاستفسارات (اختياري)', en: 'Contact person for questions (optional)' },
  contactPhone: { ar: 'رقم تليفون التواصل (اختياري)', en: 'Contact phone number (optional)' },
};

/** @param {*} lang @returns {'ar'|'en'} */
function normalizeLang(lang) {
  return String(lang || '').toLowerCase() === 'ar' ? 'ar' : 'en';
}

function pick(map, key, lang, fallback) {
  const entry = map[key];
  if (!entry) return fallback;
  return entry[lang] || entry.en || fallback;
}

/**
 * بترجع التصميم بالشكل اللي بيتبعت للواجهة، بنصوص اللغة المطلوبة.
 * @param {object} t تصميم من templates/registry.js
 * @param {*} lang
 */
function localizeTemplate(t, lang) {
  const l = normalizeLang(lang);
  const text = TEMPLATE_TEXT[t.id] || {};
  const description = (text[l] || text.en || {}).description || t.description;

  return {
    id: t.id,
    name: t.name, // أسماء التصاميم لاتينية أصلًا (Blossom & Oud...) فمش بتترجم
    description,
    languages: t.languages,
    occasionTypes: t.occasionTypes,
    // 'birthday' = قسم هدايا عيد الميلاد (غير كده دعوات الفرح)
    category: t.category || 'wedding',
    optionalSections: (t.optionalSections || []).map((s) => ({
      key: s.key,
      // القالب ممكن يسمّي أقسامه بنفسه (هدية عيد الميلاد: "ألبوم الذكريات" مش "صوركم")
      label: pick(text.sections || {}, s.key, l, null) || pick(SECTION_LABELS, s.key, l, s.label),
    })),
    timelineStages: t.timelineStages,
    extraFields: (t.extraFields || []).map((f) => ({
      key: f.key,
      label: pick(EXTRA_FIELD_LABELS, f.key, l, f.label),
      maxlength: f.maxlength,
    })),
    isPremium: !!t.isPremium,
    // التصميم ليه نسختين لغة يختار منهم العميل (مثلًا ['en','ar'])
    designLanguages: t.designLanguages || null,
  };
}

module.exports = { localizeTemplate, normalizeLang };
