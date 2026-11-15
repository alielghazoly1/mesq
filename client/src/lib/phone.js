// رقم موبايل العميل في الواجهة — نفس منطق السيرفر بالحرف (utils/phone.js)، عشان اللي الخانة بتقوله
// "✓ صح" هو بالظبط اللي السيرفر هيقبله. اختبار بيقارن الاتنين على مئات الأرقام.
// المكتبة: libphonenumber-js (بيانات جوجل الرسمية) نسخة "mobile" — لازم يبقى موبايل حقيقي في دولته.
import {
  parsePhoneNumberFromString, validatePhoneNumberLength, isSupportedCountry, getCountryCallingCode, getCountries, getExampleNumber, AsYouType,
} from 'libphonenumber-js/mobile';
import EXAMPLES from 'libphonenumber-js/mobile/examples';

// أرقام عربي (٠-٩) وفارسي (۰-۹) وعريضة (０-９) → أرقام عادية — الكيبورد العربي بيكتبها كده
const DIGIT_SETS = [[0x0660, 0x0669], [0x06F0, 0x06F9], [0xFF10, 0xFF19]];
export function latinDigits(s) {
  let out = '';
  for (const ch of String(s == null ? '' : s)) {
    const c = ch.codePointAt(0);
    const set = DIGIT_SETS.find(([a, b]) => c >= a && c <= b);
    out += set ? String(c - set[0]) : (ch === '＋' ? '+' : ch);
  }
  return out;
}

export function cleanPhoneInput(raw) {
  return latinDigits(raw)
    .replace(/[‎‏‪-‮⁦-⁩   ]/g, ' ')
    .replace(/[^\d+\-(). /]/g, '')
    .trim()
    // "(+20) 010…" / "(0020) …": القوس اللي قبل كود الدولة — الرقم دولي (المكتبة بتفهم الباقي)
    .replace(/^\(\s*(?=\+|00)/, '')
    // فواصل قبل الرقم (". 010…" / "- +20…") و "+00 20…" (حد كتب الـ + والـ 00 مع بعض)
    .replace(/^[^\d+(]+(?=[\d+])/, '')
    .replace(/^\+\s*00/, '+')
    .slice(0, 40);
}

/**
 * @param {string} raw  اللي العميل كتبه
 * @param {string} countryHint  كود الدولة المختار جنب الرقم (EG…)
 * @returns {{ok:true,e164:string,country:string,international:string,national:string}|{ok:false,code:string}}
 *   code: required | country | short | long | invalid
 */
// دول بنشوف فيها "الرقم ده صحيح بس بكود تاني؟" (العرب + أكتر الدول اللي عملاءنا فيها)
const NEAR = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB', 'IQ', 'LY', 'SD', 'MA', 'DZ', 'TN', 'PS', 'YE', 'SY',
  'US', 'CA', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'CH', 'AT', 'TR', 'AU', 'NZ'];
/** الرقم بيبدأ زي موبايلات الدولة المختارة؟ (010… في مصر) — ساعتها "ناقص/زيادة" أصدق من "كود غلط" */
function startsLikeMobile(text, country) {
  try {
    const ayt = new AsYouType(country); ayt.input(text);
    const nsn = ayt.getNationalNumber(); const ex = getExampleNumber(country, EXAMPLES);
    return !!(nsn && ex && nsn[0] === ex.nationalNumber[0]);
  } catch (e) { return false; }
}
function validElsewhere(text, digits, country) {
  const ok = (q) => !!(q && q.isValid() && q.country);
  try { if (ok(parsePhoneNumberFromString('+' + digits))) return true; } catch (e) { /* */ }
  for (const c of NEAR) {
    if (c === country) continue;
    try { const q = parsePhoneNumberFromString(text, c); if (ok(q) && q.country === c) return true; } catch (e) { /* */ }
  }
  return false;
}

export function normalizePhone(raw, countryHint) {
  const s = cleanPhoneInput(raw);
  const digits = s.replace(/\D/g, '');
  const fail = (code) => ({ ok: false, code });
  if (!digits) return fail('required');

  const intl = /^\+/.test(s) || /^00/.test(s);
  const text = intl ? '+' + s.replace(/^\+|^00/, '').replace(/\+/g, '') : s.replace(/\+/g, '');
  const cc = String(countryHint || '').trim().toUpperCase();
  const country = isSupportedCountry(cc) ? cc : undefined;
  if (!intl && !country) return fail('country');

  let p = parsePhoneNumberFromString(text, intl ? undefined : country);
  if ((!p || !p.isValid()) && !intl && country) {
    const code = getCountryCallingCode(country);
    if (digits.startsWith(code)) {
      const p2 = parsePhoneNumberFromString('+' + digits);
      if (p2 && p2.isValid()) p = p2;
    }
  }
  if (p && p.isValid()) {
    // أرقام مالهاش دولة (+800، +882 قمر صناعي…) — مش موبايل عميل
    if (!p.country) return fail('invalid');
    // رقم مكتوب محلي لازم يطلع من الدولة المختارة نفسها — مش دولة تالتة (المكتبة بتشيل كود الاتصال الدولي
    // للدولة المختارة زي 011 أمريكا، أو + في النص) والقايمة لسه على الكود المختار
    if (!intl && country && p.countryCallingCode !== getCountryCallingCode(country)) return fail('invalid');
    return {
      ok: true,
      e164: p.number,
      country: p.country || country || '',
      international: p.formatInternational(),
      national: p.formatNational(),
    };
  }
  // رقم صحيح بس كود الدولة غلط (رقم سعودي و +20 مختارة) → "راجع الرقم وكود الدولة" مش "ناقص/زيادة"
  if (!intl && !startsLikeMobile(text, country) && validElsewhere(text, digits, country)) return fail('invalid');
  const len = validatePhoneNumberLength(text, intl ? undefined : country);
  if (len === 'TOO_SHORT' || len === 'NOT_A_NUMBER') return fail('short');
  if (len === 'TOO_LONG') return fail('long');
  // الطول "ممكن" في الدولة (زي طول الأرضي) بس مش موبايل: لو الرقم بيبدأ زي موبايلات الدولة يبقى ناقص/زيادة
  // (010123456 → "ناقص")، غير كده يبقى مش موبايل أصلًا (أرضي زي 02…)
  // الجزء المحلي من غير الصفر اللي في الأول — بطريقة "اكتب وأنا أفهم" (بتشيل الصفر حتى في الأرقام الناقصة)
  // (try: المكتبة بترمي exception لأرقام زي "02" في الرأس الأخضر/ساموا — ده كان بيوقّع الصفحة)
  try {
    const ayt = new AsYouType(intl ? undefined : country);
    ayt.input(text);
    const nsn = ayt.getNationalNumber() || (p ? p.nationalNumber : '');
    const region = ayt.getCountry() || (p && p.country) || country;
    let ex = null;
    try { ex = region ? getExampleNumber(region, EXAMPLES) : null; } catch { ex = null; }
    if (nsn && ex && nsn[0] === ex.nationalNumber[0]) {
      if (nsn.length < ex.nationalNumber.length) return fail('short');
      if (nsn.length > ex.nationalNumber.length) return fail('long');
    }
  } catch (e) { /* invalid تحت */ }
  return fail('invalid');
}

/** "+20" لكود دولة، أو '' لو الدولة مش معروفة للمكتبة */
export function dialCode(country) {
  try { return isSupportedCountry(country) ? '+' + getCountryCallingCode(country) : ''; } catch { return ''; }
}

/** الدول اللي ليها كود اتصال (للقايمة جنب خانة الرقم) */
export function phoneCountries() {
  return getCountries();
}

/**
 * الرقم كتب دولي (+966… / 00966…) والمكتبة عرفت دولته؟ → الدولة + الجزء المحلي — عشان الخانة
 * تقلب كود الدولة لوحدها وتسيب الرقم المحلي بس.
 */
export function splitInternational(raw) {
  const s = cleanPhoneInput(raw);
  if (!/^\+/.test(s) && !/^00/.test(s)) return null;
  const p = parsePhoneNumberFromString('+' + s.replace(/^\+|^00/, '').replace(/\+/g, ''));
  if (!p || !p.country) return null;
  return { country: p.country, national: p.formatNational() };
}

/** رقم متخزّن (+201012345678 أو قديم) → {country, national} عشان الخانة تتعرض بيه */
export function splitStored(stored, fallbackCountry) {
  const v = String(stored || '').trim();
  if (!v) return { country: fallbackCountry || '', national: '' };
  const p = /^\+/.test(v) ? parsePhoneNumberFromString(v) : parsePhoneNumberFromString(v, isSupportedCountry(fallbackCountry) ? fallbackCountry : undefined);
  if (p && p.country) return { country: p.country, national: p.formatNational() };
  return { country: fallbackCountry || '', national: v };
}

/** علم الدولة (إيموجي) من كودها */
export function flagOf(country) {
  const cc = String(country || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '';
  return String.fromCodePoint(...[...cc].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65));
}
