// utils/calendarIcs.js
// ملف موعد الفرح (.ics) لزرار "احفظ الموعد" — على الآيفون سفاري بيفتحه في تقويم
// أبل على طول ("إضافة إلى التقويم")، وعلى أندرويد بيتنزّل ويتفتح في التقويم.
//
// الميعاد "عائم" (من غير منطقة زمنية): الساعة اللي العميل كتبها بالظبط (6 مساءً
// تفضل 6 مساءً على أي موبايل). الفرح في مكان ثابت، فده اللي الضيف محتاجه — ومش
// بيتلخبط لو الفرح برّه مصر أو الضيف في بلد تانية.

const pad = (n) => String(n).padStart(2, '0');

/** نص آمن جوه سطر ICS (RFC 5545 §3.3.11) */
function icsText(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * السطور الأطول من 75 بايت بتتقسم (RFC 5545 §3.1) — بالحرف مش بالبايت، عشان
 * الحروف العربي (2 بايت) ماتتقسمش من النص. السطر الكمّلة بيبدأ بمسافة.
 */
function fold(line) {
  const out = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, 'utf8');
    if (bytes + b > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

/** "20270122T180000" — ساعة عائمة من أجزاء الميعاد ({year, monthIndex, day, hour, minute}) */
function floating(t) {
  return `${t.year}${pad(t.monthIndex + 1)}${pad(t.day)}T${pad(t.hour)}${pad(t.minute)}00`;
}

/**
 * @param {object} o
 * @param {string} o.uid معرّف ثابت للحدث (إضافته تاني بتحدّثه بدل ما تكرره)
 * @param {string} o.title
 * @param {{year:number,monthIndex:number,day:number,hour:number,minute:number}} o.start الساعة زي ما هي مكتوبة في الدعوة
 * @param {number} [o.hours] مدة الحفلة
 * @param {string} [o.location]
 * @param {string} [o.description]
 * @param {string} [o.url] لينك الدعوة
 * @param {Date} [o.now]
 * @returns {string}
 */
function buildEventIcs({ uid, title, start, hours = 6, location, description, url, now = new Date() }) {
  const e = new Date(Date.UTC(start.year, start.monthIndex, start.day, start.hour, start.minute) + hours * 3600 * 1000);
  const end = { year: e.getUTCFullYear(), monthIndex: e.getUTCMonth(), day: e.getUTCDate(), hour: e.getUTCHours(), minute: e.getUTCMinutes() };
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mithaq//Wedding Invitation//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${floating(start)}`,
    `DTEND:${floating(end)}`,
    `SUMMARY:${icsText(title)}`,
    location ? `LOCATION:${icsText(location)}` : '',
    description ? `DESCRIPTION:${icsText(description)}` : '',
    url ? `URL:${url}` : '',
    // تنبيه قبلها بيوم (زي ملف القالب نفسه)
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(title)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).map(fold).join('\r\n') + '\r\n';
}

module.exports = { buildEventIcs, icsText, fold };
