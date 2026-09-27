// utils/cairoTime.js
// كل مواعيد الأفراح على الموقع بتوقيت مصر (Africa/Cairo). السيرفر ممكن
// يشتغل بأي توقيت — الإنتاج غالبًا UTC — فلو بنينا التاريخ بـ
// new Date(y,m,d,h) بيتفسّر بتوقيت السيرفر، والعميل اللي اختار 8 مساءً
// بتوقيت مصر كان العدّاد التنازلي بينزل عند 8 مساءً UTC = 11 بالليل في
// مصر (زيادة ساعتين/تلاتة حسب التوقيت الصيفي). الحل: نحسب إزاحة مصر
// الصح — بما فيها التوقيت الصيفي — من قاعدة المناطق الزمنية في Node
// (Intl)، مش من توقيت السيرفر.
const TZ = 'Africa/Cairo';

const _dtf = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  hour12: false,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

/** أجزاء التاريخ/الساعة لأي لحظة (Date) بتوقيت مصر + يوم الأسبوع (0=الأحد) */
function cairoParts(date) {
  const p = {};
  for (const part of _dtf.formatToParts(date)) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }
  let hour = Number(p.hour);
  if (hour === 24) hour = 0; // بعض البيئات بترجّع "24" لمنتصف الليل
  const year = Number(p.year);
  const month = Number(p.month); // 1..12
  const day = Number(p.day);
  // يوم الأسبوع بيتحدد من التاريخ الميلادي نفسه (مش من الساعة)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, hour, minute: Number(p.minute), second: Number(p.second), weekday };
}

/** إزاحة مصر عن UTC بالميلي ثانية عند لحظة معيّنة (موجب = مصر قدام UTC) */
function cairoOffsetMs(date) {
  const p = cairoParts(date);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - date.getTime();
}

/**
 * ساعة الحائط بتوقيت مصر -> لحظة UTC صحيحة (Date).
 * @param {number} year
 * @param {number} month0 - الشهر 0-based (زي getMonth)
 * @param {number} day
 * @param {number} hour - 0..23 بتوقيت مصر
 * @param {number} minute
 */
function cairoWallToDate(year, month0, day, hour, minute) {
  const wallAsUTC = Date.UTC(year, month0, day, hour, minute, 0);
  let ms = wallAsUTC;
  // بنصحّح مرتين-تلاتة عشان نمسك انتقالات التوقيت الصيفي بأمان
  for (let i = 0; i < 3; i++) {
    const off = cairoOffsetMs(new Date(ms));
    const next = wallAsUTC - off;
    if (next === ms) break;
    ms = next;
  }
  return new Date(ms);
}

module.exports = { cairoParts, cairoOffsetMs, cairoWallToDate, TZ };
