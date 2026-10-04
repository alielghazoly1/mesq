// utils/whatsapp/phone.js
// رقم العميل زي ما كتبه وقت التسجيل → رقم دولي (أرقام بس) ينفع لواتساب.
//
// العميل ممكن يكتب: +20 100 123 4567 / 00201001234567 / 01001234567 /
// 1001234567 — كلهم لازم يطلعوا 201001234567. الرقم المحلي بنحط قدامه
// كود دولة العميل (من الدولة اللي اختارها وقت التسجيل).
// لو مش قادرين نعرف الرقم صح بنرجّع '' — ومش بنبعت (أحسن من رقم غلط).

const DIAL = {
  EG: '20', SA: '966', AE: '971', KW: '965', QA: '974', BH: '973', OM: '968',
  JO: '962', LB: '961', IQ: '964', LY: '218', SD: '249', MA: '212', DZ: '213',
  TN: '216', PS: '970', YE: '967', SY: '963', MR: '222', SO: '252', DJ: '253', KM: '269',
  US: '1', CA: '1', GB: '44', IE: '353', DE: '49', FR: '33', IT: '39', ES: '34',
  PT: '351', NL: '31', BE: '32', LU: '352', AT: '43', CH: '41', SE: '46', NO: '47',
  DK: '45', FI: '358', PL: '48', CZ: '420', SK: '421', HU: '36', RO: '40', GR: '30',
  CY: '357', MT: '356', HR: '385', EE: '372', TR: '90', AU: '61', NZ: '64', BR: '55',
  RE: '262', YT: '262', MY: '60', ID: '62', PK: '92', IN: '91', NG: '234', KE: '254',
  ZA: '27', RU: '7', UA: '380', CN: '86', JP: '81', KR: '82', SG: '65',
};

// طول الرقم المحلي (من غير الصفر) للدول اللي بنقدر نتأكد منها
const LOCAL_LEN = { EG: 10, SA: 9, AE: 9, KW: 8, QA: 8, BH: 8, OM: 8, JO: 9, US: 10, CA: 10, GB: 10 };

function toWhatsAppNumber(raw, country) {
  let d = String(raw || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  const cc = String(country || '').toUpperCase();
  const dial = DIAL[cc] || '';

  if (d.startsWith('+')) d = d.slice(1).replace(/\+/g, '');
  else if (d.startsWith('00')) d = d.slice(2);
  else {
    d = d.replace(/\+/g, '');
    // رقم مكتوب بكود دولته من غير + (201001234567)
    if (dial && d.startsWith(dial) && (!LOCAL_LEN[cc] || d.length === dial.length + LOCAL_LEN[cc])) {
      // سيبه زي ما هو
    } else if (d.startsWith('0')) {
      if (!dial) return '';
      d = dial + d.slice(1);
    } else if (dial && LOCAL_LEN[cc] && d.length === LOCAL_LEN[cc]) {
      // محلي من غير الصفر (1001234567)
      d = dial + d;
    } else if (!dial) {
      return '';
    }
  }

  // مصر: الموبايل لازم 20 + 1x + 8 أرقام
  if (d.startsWith('20') && !/^201[0125]\d{8}$/.test(d)) return '';
  if (d.length < 8 || d.length > 15) return '';
  return d;
}

module.exports = { toWhatsAppNumber, DIAL };
