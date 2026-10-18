// تخمين دولة الزائر من المنطقة الزمنية لجهازه ولغة المتصفح — بيتستخدم عشان
// الدولة تبقى متختارة جاهزة في خطوة "الدخول بجوجل" (الدولة بتحدد العملة:
// مصر جنيه، السعودية ريال، الباقي دولار). العميل يقدر يغيّرها طبعًا.
const ZONES = {
  'Africa/Cairo': 'EG', 'Asia/Riyadh': 'SA', 'Asia/Dubai': 'AE', 'Asia/Kuwait': 'KW', 'Asia/Qatar': 'QA',
  'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Amman': 'JO', 'Asia/Beirut': 'LB', 'Asia/Baghdad': 'IQ',
  'Asia/Damascus': 'SY', 'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS', 'Africa/Tripoli': 'LY', 'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ', 'Africa/Casablanca': 'MA', 'Africa/Khartoum': 'SD', 'Asia/Aden': 'YE',
  'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Dublin': 'IE', 'Europe/Athens': 'GR', 'Europe/Istanbul': 'TR',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
};

export function guessCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (ZONES[tz]) return ZONES[tz];
  } catch { /* */ }
  try {
    const langs = navigator.languages || [navigator.language];
    for (const l of langs) {
      const m = /-([A-Z]{2})$/i.exec(l || '');
      if (m) return m[1].toUpperCase();
    }
  } catch { /* */ }
  return '';
}
