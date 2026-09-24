// أدوات بحث لبيانات الدول — مشتركة بين الفورم واللوحة والفوتر.
// بنبني الفهرس مرة واحدة بس (Map) عشان أي بحث بكود ISO يبقى O(1).
import { COUNTRY_OPTIONS } from './countries.js';

const BY_CODE = new Map(COUNTRY_OPTIONS.map((c) => [c.value, c]));

/** بيرجع سجل الدولة الكامل (اسم عربي/إنجليزي، علم، كود اتصال) */
export function getCountry(code) {
  if (!code) return null;
  return BY_CODE.get(String(code).toUpperCase()) || null;
}

/**
 * اسم الدولة الكامل بلغة معيّنة + العلم — للعرض في اللوحة والفوتر.
 * لو الدولة مش معروفة (بيانات قديمة)، بنرجع الكود نفسه بدل ما نبان "غير معروف".
 */
export function countryLabel(code, lang = 'en') {
  const c = getCountry(code);
  if (!c) return code || '—';
  const isAr = String(lang).toLowerCase() === 'ar';
  const name = isAr ? (c.nameAr || c.nameEn) : c.nameEn;
  return c.flag ? `${c.flag} ${name}` : name;
}

/** كود الاتصال الدولي (+20 مثلاً) لدولة، فاضي لو مش معروف */
export function dialCode(code) {
  return getCountry(code)?.dial || '';
}
