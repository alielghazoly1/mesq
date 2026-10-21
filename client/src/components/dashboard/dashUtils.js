// أدوات صغيرة مشتركة بين أجزاء لوحة العميل

// القوالب اللي ليها صورة مختلفة لكل لغة
const LANG_THUMBS = new Set(['champagne-lace', 'lily-garden', 'velvet-voice']);

/** صورة القالب (نفس صور المعرض) */
export function thumbFor(templateId, lang) {
  if (!templateId) return '/img/template-thumbs/ivory-swans.jpg';
  const suffix = LANG_THUMBS.has(templateId) ? `-${lang === 'en' ? 'en' : 'ar'}` : '';
  return `/img/template-thumbs/${templateId}${suffix}.jpg`;
}

/** كام يوم فاضل على تاريخ (سالب = عدّى) */
export function daysUntil(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b - a) / 86400000);
}

/** صباح / مساء حسب ساعة الجهاز */
export function greetingKey() {
  const h = new Date().getHours();
  if (h < 5) return 'dash2.hiNight';
  if (h < 12) return 'dash2.hiMorning';
  return 'dash2.hiEvening';
}

export function fmtNum(n, lang) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ar-EG-u-nu-latn').format(Number(n) || 0);
}

/** نسبة التغيير (null لو مفيش فترة قبلها نقارن بيها) */
export function pctDelta(cur, prev) {
  if (!prev) return cur > 0 ? null : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

export function absUrl(path) {
  if (!path) return '';
  return /^https?:/i.test(path) ? path : `${window.location.origin}${path}`;
}

/** بيضيف ?from= عشان الإحصائيات تعرف الضيف جه منين */
export function withFrom(url, from) {
  if (!from) return url;
  return `${url}${url.includes('?') ? '&' : '?'}from=${from}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch { return false; }
  }
}

export function waShareUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  return (parts[0][0] || '?') + (parts[1] ? parts[1][0] : '');
}

/** "2026-10-21" → "21 أكتوبر" */
export function shortDay(day, lang) {
  const [y, m, d] = String(day).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'short' });
}

export function hourLabel(h, lang) {
  const d = new Date(2020, 0, 1, h);
  return d.toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-EG', { hour: 'numeric' });
}
