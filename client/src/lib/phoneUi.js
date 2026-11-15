// أدوات خانة رقم الموبايل اللي بتحتاج الترجمة أو أرقام المثال (منفصلة عن lib/phone.js عشان
// ده يفضل نفس منطق السيرفر بالحرف ويتختبر لوحده).
import { getExampleNumber } from 'libphonenumber-js/mobile';
import examples from 'libphonenumber-js/mobile/examples';
import { normalizePhone, dialCode } from './phone.js';

/** رقم مثال للدولة بالشكل المحلي اللي الناس متعودة عليه (مصر: 010 12345678) */
export function examplePhone(country) {
  try {
    const ex = getExampleNumber(country, examples);
    return ex ? ex.formatNational() : '';
  } catch { return ''; }
}

/** رسالة الخطأ المترجمة لكود من normalizePhone */
export function phoneErrorText(t, code, country) {
  const map = { required: 'auth.phoneRequired', country: 'auth.phoneCountry', short: 'auth.phoneShort', long: 'auth.phoneLong', invalid: 'auth.phoneInvalid' };
  // الكود (+20) معزول LTR عشان مايتقلبش "20+" جوه الجملة العربي
  return t(map[code] || 'auth.phoneInvalid', { code: '\u2066' + dialCode(country) + '\u2069' });
}

/** رد السيرفر عن الرقم (field: 'phone') بلغة الصفحة — من الـ code، والنص العربي اللي جاي من السيرفر احتياطي بس */
export function phoneServerText(t, data, country) {
  const c = String((data && data.code) || '');
  if (c === 'phone_taken') return t('auth.phoneTaken');
  if (/^phone_(required|country|short|long|invalid)$/.test(c)) return phoneErrorText(t, c.slice(6), country);
  return (data && data.error) || '';
}

/** قاعدة react-hook-form للخانة: إجباري + صحيح */
export function phoneRule(t) {
  return {
    validate: (v) => {
      const n = normalizePhone(v && v.input, v && v.country);
      return n.ok || phoneErrorText(t, n.code, v && v.country);
    },
  };
}
