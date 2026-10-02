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
  families: { ar: 'الأهل والعائلات', en: 'Families' },
  venue: { ar: 'القاعة والمكان', en: 'Venue' },
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
    optionalSections: (t.optionalSections || []).map((s) => ({
      key: s.key,
      label: pick(SECTION_LABELS, s.key, l, s.label),
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
