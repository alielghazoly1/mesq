// هوية الزائر على الجهاز (رقم عشوائي) + جه منين — مشترك بين إشارة الحضور
// (components/PresencePing.jsx) ورحلة الزائر (lib/journey.js).
const VID_KEY = 'mithaq:vid';
const SRC_KEY = 'mithaq:src';

/**
 * الزائر جه منين (لتحليلات الموقع في لوحة التحكم): الموقع اللي جه منه
 * (document.referrer) أو باراميتر في اللينك (utm_source / fbclid / gclid).
 * بيتحفظ أول مرة في الزيارة بس (sessionStorage) — التنقل جوه الموقع مابيغيّروش.
 */
export function sourceInfo() {
  try {
    const saved = sessionStorage.getItem(SRC_KEY);
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(window.location.search);
    const utm = q.get('utm_source') || (q.get('fbclid') ? 'fbclid' : '') || (q.get('gclid') ? 'gclid' : '');
    let ref = document.referrer || '';
    // من صفحة جوه الموقع نفسه = مش مصدر، إلا لو جه من دعوة (/i/…) — ده مصدر مهم
    try {
      const u = ref ? new URL(ref) : null;
      if (u && u.host === window.location.host && !u.pathname.startsWith('/i/')) ref = '';
    } catch { ref = ''; }
    const info = { ref: ref.slice(0, 300), utm: String(utm || '').slice(0, 40) };
    sessionStorage.setItem(SRC_KEY, JSON.stringify(info));
    return info;
  } catch {
    return { ref: '', utm: '' };
  }
}

export function visitorId() {
  try {
    let v = localStorage.getItem(VID_KEY);
    if (!v || !/^[a-f0-9]{32}$/.test(v)) {
      const a = new Uint8Array(16);
      crypto.getRandomValues(a);
      v = Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(VID_KEY, v);
    }
    return v;
  } catch {
    return ''; // تصفح خاص — العميل المسجّل بيتعدّ بحسابه برضو
  }
}

