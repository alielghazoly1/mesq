// utils/phone.js
// رقم موبايل العميل — المكان الوحيد اللي بيتحقق فيه الرقم وبيتوحّد شكله (السيرفر).
// نفس المنطق بالحرف في الواجهة: client/src/lib/phone.js (اختبار بيتأكد إنهم بيطلّعوا نفس النتيجة).
//
// المكتبة: libphonenumber-js — نسخة JavaScript من بيانات جوجل الرسمية للأرقام (libphonenumber).
// بنستخدم نسخة "mobile": الرقم لازم يبقى **موبايل حقيقي** في دولته — مش أرضي ولا ناقص ولا زيادة
// ولا بادئة مش موجودة (زي 013 في مصر). ده مهم لأننا بنكلّم العميل على الواتساب.
//
// العميل بيختار كود الدولة (+20، +966…) ويكتب رقمه بأي شكل:
//   010 1234 5678 / 1012345678 / +20 10 1234 5678 / 00201012345678 / 201012345678 / ٠١٠١٢٣٤٥٦٧٨
// كلهم بيطلعوا نفس الشكل الدولي الموحّد E.164: +201012345678 — وده اللي بيتخزّن.
// الصفر اللي في أول الرقم المحلي (010…) بيتشال لوحده لما كود الدولة بيتحط، فمفيش رقم يتسجّل
// مرتين بشكلين مختلفين، ومفيش "+20010…".
const {
  parsePhoneNumberFromString, validatePhoneNumberLength, isSupportedCountry, getCountryCallingCode, getExampleNumber, AsYouType,
} = require('libphonenumber-js/mobile');
const EXAMPLES = require('libphonenumber-js/mobile/examples');

const MESSAGES = {
  required: 'رقم الموبايل مطلوب.',
  country: 'اختار كود الدولة بتاع رقمك.',
  short: 'رقم الموبايل ناقص — راجعه.',
  long: 'رقم الموبايل فيه أرقام زيادة — راجعه.',
  invalid: 'ده مش رقم موبايل صحيح للدولة دي — راجع الرقم وكود الدولة.',
};

// أرقام عربي (٠-٩) وفارسي (۰-۹) وعريضة (０-９) → أرقام عادية. الكيبورد العربي على الموبايل بيكتبها كده.
const DIGIT_SETS = [[0x0660, 0x0669], [0x06F0, 0x06F9], [0xFF10, 0xFF19]];
function latinDigits(s) {
  let out = '';
  for (const ch of String(s == null ? '' : s)) {
    const c = ch.codePointAt(0);
    const set = DIGIT_SETS.find(([a, b]) => c >= a && c <= b);
    out += set ? String(c - set[0]) : (ch === '＋' ? '+' : ch);
  }
  return out;
}

/** اللي العميل كتبه بعد التنضيف: أرقام لاتيني + "+" وفواصل الكتابة بس (المسافة - . () /) */
function cleanPhoneInput(raw) {
  return latinDigits(raw)
    // علامات الاتجاه اللي بتلزق مع الرقم في الصفحات العربي (LRM/RLM…) ومسافات غريبة
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
 * @param {string} raw          اللي العميل كتبه (أي شكل)
 * @param {string} countryHint  كود الدولة اللي اختاره للرقم (EG، SA…) — بيتجاهل لو الرقم مكتوب دولي (+ أو 00)
 * @returns {{ok:true, e164:string, country:string, international:string, national:string}
 *         | {ok:false, code:'required'|'country'|'short'|'long'|'invalid', error:string}}
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

function normalizePhone(raw, countryHint) {
  const s = cleanPhoneInput(raw);
  const digits = s.replace(/\D/g, '');
  const fail = (code) => ({ ok: false, code, error: MESSAGES[code] });
  if (!digits) return fail('required');

  // دولي: يبدأ بـ + أو 00 (00 هو "+" من أي تليفون في مصر والخليج وأوروبا)
  const intl = /^\+/.test(s) || /^00/.test(s);
  const text = intl ? '+' + s.replace(/^\+|^00/, '').replace(/\+/g, '') : s.replace(/\+/g, '');
  const cc = String(countryHint || '').trim().toUpperCase();
  const country = isSupportedCountry(cc) ? cc : undefined;
  if (!intl && !country) return fail('country');

  let p = parsePhoneNumberFromString(text, intl ? undefined : country);
  // الرقم مكتوب بكود دولته من غير + (201012345678 أو 966501234567) وده نفس كود الدولة المختارة
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

/** رقم متخزّن بالشكل الموحّد؟ (+ وبعده 7-15 رقم) */
function isE164(v) {
  return /^\+[1-9]\d{6,14}$/.test(String(v || ''));
}

/**
 * الأشكال اللي ممكن يكون نفس الرقم متخزّن بيها في حسابات قديمة (قبل التوحيد) — للبحث عن رقم مستخدم قبل كده.
 * @param {string} e164
 */
function phoneLookupValues(e164) {
  const p = parsePhoneNumberFromString(String(e164 || ''));
  if (!p) return [String(e164 || '')];
  const intlDigits = p.number.slice(1);
  const nationalDigits = p.formatNational().replace(/\D/g, '');
  return [...new Set([
    p.number, intlDigits, '00' + intlDigits, nationalDigits, p.nationalNumber,
    p.formatInternational(), p.formatNational(),
  ].filter(Boolean))];
}

/**
 * فلتر Mongo: "الرقم ده متسجّل في حساب؟" — للتسجيل وتعديل الحساب.
 * الأشكال الدولية (+20…، 0020…، 20…) بتتقارن مع كل الحسابات، لكن الشكل المحلي (010…، 50…)
 * بيتقارن بس مع حسابات نفس الدولة: "0501234567" القديم في حساب سعودي مش نفس رقم +971501234567
 * الإماراتي — من غير كده عميل جديد كان ممكن يتقاله "رقمك مستخدم" وهو مش مستخدم.
 * @param {string} e164
 */
function phoneOwnerFilter(e164) {
  const v = String(e164 || '');
  const p = parsePhoneNumberFromString(v);
  if (!p) return { phone: v };
  const intlDigits = p.number.slice(1);
  const intl = [...new Set([p.number, intlDigits, '00' + intlDigits, p.formatInternational()])];
  const national = [...new Set([p.formatNational().replace(/\D/g, ''), p.nationalNumber, p.formatNational()].filter(Boolean))];
  if (!p.country) return { phone: { $in: intl } };
  return { $or: [{ phone: { $in: intl } }, { phone: { $in: national }, country: p.country }] };
}

/**
 * شروط بحث لوحة التحكم عن عميل برقمه — المالك بيكتب الرقم زي ما يعرفه (01012345678 أو +20 10…)
 * والمتخزّن موحّد (+201012345678) أو بشكل قديم. بيرجع شروط $or على حقل phone.
 * @param {string} q  اللي اتكتب في خانة البحث
 */
function phoneSearchClauses(q) {
  const text = String(q || '').trim();
  const out = [];
  const digits = latinDigits(text).replace(/\D/g, '');
  if (digits.length >= 5) {
    // جزء من الرقم من غير الصفر/الأصفار اللي في أوله: "01012345678" → يلاقي "+201012345678"
    const core = digits.replace(/^0+/, '');
    if (core.length >= 5) out.push({ phone: new RegExp(core) });
    for (const cc of ['EG', 'SA']) {
      const n = normalizePhone(text, cc);
      if (n.ok) out.push({ phone: { $in: phoneLookupValues(n.e164) } });
    }
  }
  return out;
}

module.exports = {
  normalizePhone, cleanPhoneInput, latinDigits, isE164, phoneLookupValues, phoneOwnerFilter, phoneSearchClauses, PHONE_MESSAGES: MESSAGES,
};
