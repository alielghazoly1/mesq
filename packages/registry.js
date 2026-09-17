// packages/registry.js
// سجل الباقات المدفوعة — نفس فكرة templates/registry.js: كل حاجة متعرّفة
// في مكان واحد، وأي تعديل في الأسعار أو المميزات بيتعمل من هنا بس.
//
// السعر بيتحدد حسب دولة المستخدم (بنجمعها وقت التسجيل، models/User.js):
// مصر ← جنيه مصري، أي دولة تانية ← دولار.

/**
 * مميزات المحرر. المفتاح هو اللي الكود بيتحقق منه؛ العنوان والشرح
 * للعرض بس.
 * الشرح (desc) مهم: "تحريك النصوص" لوحدها مبتقولش للعميل هو هيقدر
 * يعمل إيه فعليًا، فكل ميزة معاها سطر بيوضّح المقصود بالظبط.
 */
const FEATURES = {
  fonts: {
    ar: 'أكتر من 10 خطوط عربي وإنجليزي',
    en: '10+ Arabic and English fonts',
    descAr: 'تختار خط الدعوة كلها من مكتبة خطوط جاهزة، وتشوف شكله على طول.',
    descEn: 'Pick the font for the whole invitation and see it applied instantly.',
  },
  images: {
    ar: 'تغيير أي صورة في الدعوة',
    en: 'Replace any photo',
    descAr: 'تضغط على أي صورة وترفع صورتك مكانها — وكمان تبدّل ختم الغلاف بختم أي تصميم تاني.',
    descEn: 'Click any photo and upload yours instead — and swap the cover seal for another design’s.',
  },
  music: {
    ar: 'موسيقى من اختيارك',
    en: 'Your own music',
    descAr: 'ترفع الأغنية اللي عايزها وهي اللي هتشتغل أول ما الضيف يفتح الدعوة.',
    descEn: 'Upload the track you want — it plays the moment a guest opens the invitation.',
  },
  drag: {
    ar: 'تحريك أي جزء بالسحب',
    en: 'Move any part by dragging',
    descAr: 'تمسك أي كلام أو صورة وتحطها في المكان اللي يعجبك بالظبط، بالبكسل.',
    descEn: 'Grab any text or photo and place it exactly where you want it, to the pixel.',
  },
  videoToImage: {
    ar: 'تبديل الفيديو بصورة',
    en: 'Swap the video for a photo',
    descAr: 'التصاميم فيها فيديوهات خلفية — تقدر تحط صورتك مكان أي واحد فيهم.',
    descEn: 'The designs use background videos — put your own photo in place of any of them.',
  },
  sections: {
    ar: 'إخفاء أي قسم مش عايزه',
    en: 'Hide any section you don’t need',
    descAr: 'العداد التنازلي، جدول الأوقات، الخريطة… تشيل اللي مش محتاجه وتسيب اللي يهمك.',
    descEn: 'Countdown, schedule, map… remove what you don’t need and keep what matters.',
  },
  colors: {
    ar: 'تحكم كامل في الألوان',
    en: 'Full colour control',
    descAr: 'تغيّر ألوان الزي المقترح وأي خلفية ملوّنة في الدعوة بمنتقي ألوان.',
    descEn: 'Change the dress-code colours and any coloured background with a colour picker.',
  },
};

/** بيانات كل ميزة بلغة واحدة — للعرض في صفحة الباقات */
function featureFor(key, lang) {
  const f = FEATURES[key];
  if (!f) return { key, label: key, desc: '' };
  const isAr = lang === 'ar';
  return {
    key,
    label: (isAr ? f.ar : f.en) || f.en,
    desc: (isAr ? f.descAr : f.descEn) || '',
  };
}

// ترتيب ثابت للمميزات — عشان الباقات التلاتة يبانوا بنفس الترتيب
// والعميل يقدر يقارن بينهم بعينه بسرعة
const ALL_FEATURE_KEYS = ['fonts', 'images', 'music', 'drag', 'videoToImage', 'sections', 'colors'];

const PACKAGES = [
  {
    // باقة الدعوة الواحدة — للعملاء في مصر بس.
    //
    // ليه موجودة: أغلب اللي بيدخل الموقع عايز دعوة فرحه هو، دعوة
    // واحدة وخلاص. كان قدامه 400 جنيه لأربع دعوات، فبيدفع تمن تلات
    // دعوات مش محتاجها عشان ياخد الواحدة اللي محتاجها فعلاً. ده كان
    // بيوقف ناس كتير عند صفحة الأسعار.
    //
    // مميزاتها نفس مميزات الباقة الأساسية بالحرف — الفرق في العدد بس.
    // اللي عايز أكتر من دعوة، الباقة الأساسية بتفضل أوفر له في الدعوة
    // الواحدة (100 بدل 150)، فالسلّم فضل منطقي.
    id: 'solo',
    name: { ar: 'باقة الدعوة الواحدة', en: 'Single Invitation' },
    invitations: 1,
    price: { EGP: 150, USD: 0 },
    // متاحة في مصر بس — بالدولار مفيش سعر ليها أصلاً
    countries: ['EG'],
    // الخصومات مبتنطبقش عليها: هي أصلاً أرخص حاجة في الموقع، وأي خصم
    // فوق كده بيخليها أرخص من تكلفتها
    noDiscount: true,
    features: ['fonts', 'images', 'music', 'sections'],
  },
  {
    id: 'basic',
    name: { ar: 'الباقة الأساسية', en: 'Essential' },
    invitations: 4,
    price: { EGP: 400, USD: 15 },
    // "إخفاء الأقسام" في كل الباقات: ده مش رفاهية، ده إن العميل يشيل
    // قسم مالوش لازمة في فرحه. لو قفلناه على الباقة الأعلى، اللي دافع
    // بيبص على دعوته وفيها جزء مش عايزه ومش قادر يشيله — وده إحساس
    // وحش عن حق.
    features: ['fonts', 'images', 'music', 'sections'],
  },
  {
    id: 'plus',
    name: { ar: 'الباقة المتقدمة', en: 'Plus' },
    invitations: 9,
    price: { EGP: 600, USD: 30 },
    features: ['fonts', 'images', 'music', 'drag', 'videoToImage', 'sections'],
  },
  {
    id: 'pro',
    name: { ar: 'الباقة الاحترافية', en: 'Professional' },
    invitations: 50,
    price: { EGP: 1500, USD: 70 },
    features: ['fonts', 'images', 'music', 'drag', 'videoToImage', 'sections', 'colors'],
  },
];

const CURRENCY_LABELS = { EGP: 'ج.م', USD: '$' };

/** @param {string} countryCode كود الدولة (ISO alpha-2) @returns {'EGP'|'USD'} */
function currencyForCountry(countryCode) {
  return String(countryCode || '').toUpperCase() === 'EG' ? 'EGP' : 'USD';
}

/** @param {string} id @returns {object|null} */
function getPackage(id) {
  return PACKAGES.find((p) => p.id === id) || null;
}

/**
 * الباقة دي متاحة لعميل في الدولة دي؟
 * الباقات اللي مالهاش قايمة دول متاحة للكل (السلوك القديم زي ما هو).
 * @param {object} pkg @param {string} countryCode
 */
function packageAllowedInCountry(pkg, countryCode) {
  if (!pkg) return false;
  if (!Array.isArray(pkg.countries) || !pkg.countries.length) return true;
  return pkg.countries.includes(String(countryCode || '').toUpperCase());
}

/** الباقات المتاحة لدولة معيّنة (بيانات خام، من غير خصم ولا ترجمة) */
function packagesAvailableIn(countryCode) {
  return PACKAGES.filter((p) => packageAllowedInCountry(p, countryCode));
}

/**
 * الباقات بالشكل اللي بيتعرض للمستخدم — بسعر عملته هو بس، مش كل العملات،
 * وبالباقات المتاحة في بلده بس.
 *
 * ملحوظة: السعر اللي بيرجع هنا هو سعر القايمة قبل أي خصم. الخصم بيتحط
 * فوقه في utils/pricing.js — عشان الخصومات (اللي بتتغير من لوحة التحكم)
 * تفضل في مكان واحد بعيد عن تعريف الباقات نفسه.
 * @param {string} countryCode
 */
function packagesForCountry(countryCode, lang) {
  const currency = currencyForCountry(countryCode);
  const l = String(lang || '').toLowerCase() === 'ar' ? 'ar' : 'en';
  return packagesAvailableIn(countryCode).map((p) => ({
    id: p.id,
    name: p.name[l] || p.name.en,
    invitations: p.invitations,
    price: p.price[currency],
    currency,
    currencyLabel: CURRENCY_LABELS[currency],
    features: p.features.map((key) => featureFor(key, l)),
    // الميزات اللي **مش** في الباقة دي — بتتعرض باهتة، عشان العميل
    // يشوف الفرق بين الباقات من غير ما يفتح تلاتة جنب بعض ويقارن
    missing: ALL_FEATURE_KEYS
      .filter((key) => !p.features.includes(key))
      .map((key) => featureFor(key, l)),
  }));
}

/**
 * هل الباقة دي فيها الميزة دي؟ (بيتستخدم في حجب أدوات المحرر)
 * @param {string} packageId @param {string} featureKey
 */
function packageHasFeature(packageId, featureKey) {
  const pkg = getPackage(packageId);
  return !!pkg && pkg.features.includes(featureKey);
}

module.exports = {
  PACKAGES,
  FEATURES,
  CURRENCY_LABELS,
  getPackage,
  packagesForCountry,
  packagesAvailableIn,
  packageAllowedInCountry,
  currencyForCountry,
  packageHasFeature,
};
