// utils/pricing.js
// المكان الوحيد اللي بيتحسب فيه سعر أي باقة.
//
// ليه مكان واحد: السعر بيظهر في أربع أماكن مختلفة (صفحة الباقات، صفحة
// الدفع، الطلب المتسجّل في القاعدة، ولوحة التحكم). لو كل واحد فيهم
// حسب الخصم لوحده، أول ما تغيّر نسبة من اللوحة هيحصل إن العميل يشوف
// رقم ويتسجّل عليه رقم تاني — وده أسوأ حاجة ممكن تحصل في صفحة دفع.
// عشان كده كلهم بينادوا الدالة اللي هنا.
const PricingSettings = require('../models/PricingSettings');
const { cairoParts, cairoWallToDate } = require('./cairoTime');
const { sanitizeText } = require('./sanitize');
const {
  getPackage, packagesAvailableIn, packagesForCountry,
  currencyForCountry, CURRENCY_LABELS, PACKAGES, CURRENCIES,
} = require('../packages/registry');

// حدود السعر اللي المالك يقدر يكتبه (حماية من غلطة كتابة زي 0 أو رقم خرافي)
const MAX_PRICE = 1000000;

const KEY = 'default';

// كاش قصير: صفحة الباقات وصفحة الدفع بينادوا ورا بعض على طول، ومفيش
// داعي نضرب القاعدة في كل مرة. 30 ثانية يعني أي تعديل من اللوحة بيبان
// للعملاء في أقل من نص دقيقة — وده مقبول لخصم.
const CACHE_MS = 30 * 1000;
let cache = null;
let cacheAt = 0;

/** بيفضّي الكاش — بيتنادى بعد أي حفظ من لوحة التحكم عشان التعديل يبان فورًا */
function invalidateCache() {
  cache = null;
  cacheAt = 0;
}

/** بيرجع مستند الإعدادات (وبينشئه فاضي أول مرة) */
async function getPricingSettings() {
  let doc = await PricingSettings.findOne({ key: KEY });
  if (!doc) doc = await PricingSettings.create({ key: KEY });
  return doc;
}

/** نفس اللي فوق بس بكاش — ده اللي مسارات العرض بتستخدمه */
async function getPricingSettingsCached() {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
  try {
    const doc = await getPricingSettings();
    cache = {
      enabled: !!doc.enabled,
      percent: Number(doc.percent) || 0,
      perPackage: doc.perPackage || {},
      labelAr: doc.labelAr || '',
      labelEn: doc.labelEn || '',
      endsAt: doc.endsAt || null,
      prices: doc.prices || {},
      disabledPackages: doc.disabledPackages || [],
    };
    cacheAt = Date.now();
  } catch (err) {
    // القاعدة مش بترد؟ مفيش خصم — العميل بيشوف سعر القايمة الكامل.
    // أأمن اتجاه للغلط: إننا ناخد أكتر مش أقل، ومحدش بيتحاسب على سعر
    // أعلى من اللي شافه.
    console.error('Error loading pricing settings:', err);
    // الأسعار بترجع للمكتوب في السجل، وكل الباقات مفتوحة — نفس الموقع قبل الميزة دي
    cache = {
      enabled: false, percent: 0, perPackage: {}, labelAr: '', labelEn: '', endsAt: null,
      prices: {}, disabledPackages: [],
    };
    cacheAt = Date.now();
  }
  return cache;
}

function clampPercent(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(90, n));
}

/**
 * نسبة الخصم الفعلية على باقة معيّنة.
 * @param {object} pkg الباقة من السجل
 * @param {object} settings إعدادات الخصم
 * @returns {number} 0 لو مفيش خصم
 */
function discountPercentFor(pkg, settings) {
  if (!pkg || !settings || !settings.enabled) return 0;
  // عرض خلص ميعاده بيقف لوحده
  if (settings.endsAt && new Date(settings.endsAt).getTime() < Date.now()) return 0;

  const per = settings.perPackage || {};
  // نسبة خاصة موجودة (حتى لو صفر) بتغلب النسبة العامة
  const own = Object.prototype.hasOwnProperty.call(per, pkg.id) ? per[pkg.id] : null;
  // الباقة المستثناة (باقة الدعوة الواحدة) مابتاخدش النسبة العامة أبدًا —
  // بتتخصم بس لو المالك حط عليها خصم بنفسه من صفحة الباقات
  if (own === null) return pkg.noDiscount ? 0 : clampPercent(settings.percent);
  return clampPercent(own);
}

/**
 * سعر قايمة صالح؟ عدد صحيح من 1 لحد MAX_PRICE.
 * @returns {number|null}
 */
function cleanPrice(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1 || n > MAX_PRICE) return null;
  return n;
}

/**
 * سعر القايمة (قبل الخصم): اللي المالك حدّده من اللوحة، وإلا المكتوب في السجل.
 * @param {object} pkg @param {'EGP'|'USD'} currency @param {object} settings
 */
function listPriceFor(pkg, currency, settings) {
  const own = settings && settings.prices && settings.prices[pkg.id];
  const set = own ? cleanPrice(own[currency]) : null;
  if (set) return set;
  return (pkg && pkg.price && pkg.price[currency]) || 0;
}

/** الباقة شغالة (مش مقفولة من اللوحة)؟ */
function isPackageEnabled(pkgId, settings) {
  return !(settings && Array.isArray(settings.disabledPackages) && settings.disabledPackages.includes(pkgId));
}

/**
 * السعر النهائي لباقة بعملة معيّنة.
 * التقريب لأقرب 5 (جنيه) أو 1 (دولار): عشان السعر يطلع رقم طبيعي
 * الواحد يقوله بصوت عالي — 320 مش 319.2.
 */
function roundPrice(value, currency) {
  const step = currency === 'EGP' ? 5 : 1;
  return Math.max(0, Math.round(value / step) * step);
}

/**
 * بيحسب سعر باقة واحدة بعد الخصم.
 * @returns {{price:number, listPrice:number, discountPercent:number, currency:string}}
 */
function priceFor(pkg, currency, settings) {
  const listPrice = pkg ? listPriceFor(pkg, currency, settings) : 0;
  const discountPercent = discountPercentFor(pkg, settings);
  const price = discountPercent > 0
    ? roundPrice(listPrice * (1 - discountPercent / 100), currency)
    : listPrice;
  return { price, listPrice, discountPercent, currency };
}

/** نص الشارة اللي بتظهر جنب السعر */
function discountLabel(settings, percent, lang) {
  if (!percent) return '';
  const isAr = String(lang || '').toLowerCase() === 'ar';
  const custom = isAr ? (settings.labelAr || '') : (settings.labelEn || '');
  if (custom) return custom;
  return isAr ? `خصم ${percent}%` : `${percent}% off`;
}

/**
 * الباقات المتاحة لعميل، بأسعارها النهائية بعد الخصم.
 * ده اللي بيتبعت لصفحة الباقات وصفحة الدفع.
 * @param {string} countryCode @param {string} lang
 */
async function pricedPackagesFor(countryCode, lang) {
  const settings = await getPricingSettingsCached();
  const currency = currencyForCountry(countryCode);
  const l = String(lang || '').toLowerCase() === 'ar' ? 'ar' : 'en';
  // الاسم والمميزات بيتبنوا زي ما كانوا بالظبط — إحنا بنزوّد السعر بس
  const byId = {};
  packagesForCountry(countryCode, l).forEach((p) => { byId[p.id] = p; });

  // الباقات المقفولة من اللوحة مبتظهرش، ولا الباقة اللي مالهاش سعر بعملة
  // العميل ده (مثلًا باقة مصرية بس من غير سعر دولار)
  return packagesAvailableIn(countryCode)
    .filter((p) => isPackageEnabled(p.id, settings) && listPriceFor(p, currency, settings) > 0)
    .map((p) => {
    const { price, listPrice, discountPercent } = priceFor(p, currency, settings);
    return Object.assign({}, byId[p.id], {
      price,
      // سعر القايمة بيتبعت بس لما يكون فيه خصم فعلي — عشان الواجهة
      // متعرضش "كان 400 وبقى 400"
      listPrice: discountPercent > 0 ? listPrice : null,
      discountPercent,
      discountLabel: discountLabel(settings, discountPercent, l),
      currency,
      currencyLabel: CURRENCY_LABELS[currency],
    });
  });
}

/**
 * سعر باقة واحدة بالظبط — ده اللي بيتسجّل في الطلب.
 * لازم يعدي من هنا مش من السجل مباشرة، عشان العميل مايتسجّلش عليه
 * سعر غير اللي شافه على الشاشة.
 * @param {string} packageId @param {string} countryCode
 */
async function priceForOrder(packageId, countryCode) {
  const pkg = getPackage(packageId);
  if (!pkg) return null;
  const settings = await getPricingSettingsCached();
  // مقفولة من اللوحة، أو مالهاش سعر بعملته = مش متاحة للطلب
  if (!isPackageEnabled(pkg.id, settings)) return null;
  const priced = priceFor(pkg, currencyForCountry(countryCode), settings);
  return priced.price > 0 ? priced : null;
}

/** أسعار الباقات وتشغيلها من اللي جاي من اللوحة (بعد التنضيف) */
function cleanPackagesInput(input) {
  const b = input || {};
  const incoming = (b.prices && typeof b.prices === 'object') ? b.prices : {};
  const prices = {};
  PACKAGES.forEach((p) => {
    const row = incoming[p.id];
    if (!row || typeof row !== 'object') return;
    const out = {};
    CURRENCIES.forEach((cur) => {
      const v = cleanPrice(row[cur]);
      // نفس سعر السجل = مفيش داعي نخزّنه (يفضل "افتراضي" ويتبع السجل)
      if (v && v !== (p.price && p.price[cur])) out[cur] = v;
    });
    if (Object.keys(out).length) prices[p.id] = out;
  });

  const valid = new Set(PACKAGES.map((p) => p.id));
  const disabled = Array.isArray(b.disabled) ? [...new Set(b.disabled.filter((id) => valid.has(id)))] : [];
  if (disabled.length >= PACKAGES.length) {
    throw Object.assign(new Error('لازم تفضل باقة واحدة على الأقل شغالة للعملاء.'), { status: 400 });
  }
  return { prices, disabledPackages: disabled };
}

/**
 * بيحفظ أسعار الباقات وتشغيلها من لوحة التحكم.
 * @param {{ prices?: object, disabled?: string[] }} input
 * @returns {Promise<object>} المستند بعد الحفظ
 */
async function savePackagePrices(input) {
  const doc = await PricingSettings.findOneAndUpdate(
    { key: KEY },
    { ...cleanPackagesInput(input), updatedAt: new Date() },
    { new: true, upsert: true }
  );
  invalidateCache();
  return doc;
}

/** "YYYY-MM-DD" (آخر يوم في العرض) → آخر دقيقة في اليوم ده بتوقيت مصر */
function endOfCairoDay(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 2020 || y > 2100) return null;
  return new Date(cairoWallToDate(y, mo - 1, d, 23, 59).getTime() + 59 * 1000);
}

/** آخر يوم في العرض بتوقيت مصر كـ "YYYY-MM-DD" (للخانة في اللوحة) */
function cairoDayOf(date) {
  if (!date) return '';
  const p = cairoParts(new Date(date));
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/**
 * صفحة "الباقات والأسعار" في اللوحة بتحفظ كل حاجة مرة واحدة: سعر كل باقة،
 * تشغيلها، والخصم اللي عليها + إعدادات العرض. كتابة واحدة — يا كله يتحفظ
 * يا مفيش حاجة، فالعميل عمره ما يشوف سعر جديد بخصم قديم.
 *
 * الخصم بقى لكل باقة لوحدها (perPackage صريح لكل باقة، والنسبة العامة 0).
 * @param {{ prices?, disabled?, discounts?: object, enabled?, labelAr?, labelEn?, endsDay? }} input
 */
async function savePricingPage(input) {
  const b = input || {};
  const packs = cleanPackagesInput(b);
  const incoming = (b.discounts && typeof b.discounts === 'object') ? b.discounts : {};
  const perPackage = {};
  PACKAGES.forEach((p) => {
    const raw = incoming[p.id];
    if (raw === '' || raw === null || raw === undefined) { perPackage[p.id] = 0; return; }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 90 || Math.round(n) !== n) {
      throw Object.assign(new Error('نسبة الخصم لازم تبقى رقم صحيح من 0 لـ 90.'), { status: 400 });
    }
    perPackage[p.id] = n;
  });
  let endsAt = null;
  if (b.endsDay) {
    endsAt = endOfCairoDay(b.endsDay);
    if (!endsAt) throw Object.assign(new Error('تاريخ نهاية العرض مش مظبوط.'), { status: 400 });
  }
  const doc = await PricingSettings.findOneAndUpdate(
    { key: KEY },
    {
      ...packs,
      enabled: !!b.enabled,
      percent: 0,
      perPackage,
      labelAr: sanitizeText(b.labelAr, 60),
      labelEn: sanitizeText(b.labelEn, 60),
      endsAt,
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );
  invalidateCache();
  return doc;
}

module.exports = {
  getPricingSettings,
  getPricingSettingsCached,
  invalidateCache,
  discountPercentFor,
  clampPercent,
  priceFor,
  priceForOrder,
  pricedPackagesFor,
  discountLabel,
  listPriceFor,
  isPackageEnabled,
  cleanPrice,
  savePackagePrices,
  savePricingPage,
  cairoDayOf,
  MAX_PRICE,
};
