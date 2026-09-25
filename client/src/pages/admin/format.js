// أدوات عرض للوحة التحكم: اسم الدولة الكامل من الكود، ولينك واتساب لرقم العميل.
import { COUNTRY_OPTIONS } from '../../data/countries.js';

const BY_CODE = COUNTRY_OPTIONS.reduce((acc, c) => { acc[c.value] = c; return acc; }, {});

/** كود الدولة (EG) → الاسم الكامل بالعلم (🇪🇬 مصر). بيرجّع الكود زي ما هو لو مش معروف. */
export function countryName(code, lang = 'ar') {
  const c = BY_CODE[String(code || '').toUpperCase()];
  if (!c) return code || '';
  return (lang === 'ar' ? c.ar : c.en) || c.en || code;
}

// أكواد الاتصال الدولية للدول الشائعة — عشان نبني لينك واتساب صح من رقم محلي.
const DIAL = {
  EG: '20', SA: '966', AE: '971', KW: '965', QA: '974', BH: '973', OM: '968',
  JO: '962', LB: '961', IQ: '964', LY: '218', SD: '249', MA: '212', DZ: '213',
  TN: '216', PS: '970', YE: '967', SY: '963', US: '1', CA: '1', GB: '44',
  DE: '49', FR: '33', IT: '39', TR: '90',
};

/**
 * بيبني لينك واتساب لرقم العميل. بيتعامل مع:
 *  - رقم دولي مكتوب بالكامل (+20... أو 0020...) → زي ما هو.
 *  - رقم محلي (0100...) → بيحط كود دولة العميل قدامه بدل الصفر.
 * بيرجّع null لو مفيش رقم.
 */
export function waLink(phone, countryCode) {
  let d = String(phone || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) {
    const dial = DIAL[String(countryCode || '').toUpperCase()];
    d = (dial || '') + d.slice(1);
  }
  return 'https://wa.me/' + d;
}
