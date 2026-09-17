// utils/pricing.js
// المكان الوحيد اللي بيتحسب فيه سعر أي باقة.
//
// ليه مكان واحد: السعر بيظهر في أربع أماكن مختلفة (صفحة الباقات، صفحة
// الدفع، الطلب المتسجّل في القاعدة، ولوحة التحكم). لو كل واحد فيهم
// حسب الخصم لوحده، أول ما تغيّر نسبة من اللوحة هيحصل إن العميل يشوف
// رقم ويتسجّل عليه رقم تاني — وده أسوأ حاجة ممكن تحصل في صفحة دفع.
// عشان كده كلهم بينادوا الدالة اللي هنا.
const PricingSettings = require('../models/PricingSettings');
const {
  getPackage, packagesAvailableIn, packagesForCountry,
  currencyForCountry, CURRENCY_LABELS,
} = require('../packages/registry');

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
    };
    cacheAt = Date.now();
  } catch (err) {
    // القاعدة مش بترد؟ مفيش خصم — العميل بيشوف سعر القايمة الكامل.
    // أأمن اتجاه للغلط: إننا ناخد أكتر مش أقل، ومحدش بيتحاسب على سعر
    // أعلى من اللي شافه.
    console.error('Error loading pricing settings:', err);
    cache = { enabled: false, percent: 0, perPackage: {}, labelAr: '', labelEn: '', endsAt: null };
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
  // الباقة المستثناة من الخصم (باقة الدعوة الواحدة) عمرها ما بتتخصم،
  // مهما كان اللي متظبط في اللوحة
  if (pkg.noDiscount) return 0;
  // عرض خلص ميعاده بيقف لوحده
  if (settings.endsAt && new Date(settings.endsAt).getTime() < Date.now()) return 0;

  const per = settings.perPackage || {};
  // نسبة خاصة موجودة (حتى لو صفر) بتغلب النسبة العامة
  const own = Object.prototype.hasOwnProperty.call(per, pkg.id) ? per[pkg.id] : null;
  return clampPercent(own === null ? settings.percent : own);
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
  const listPrice = (pkg && pkg.price && pkg.price[currency]) || 0;
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

  return packagesAvailableIn(countryCode).map((p) => {
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
  return priceFor(pkg, currencyForCountry(countryCode), settings);
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
};
