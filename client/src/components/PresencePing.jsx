// "أنا فاتح الموقع" — بيبعت إشارة خفيفة للسيرفر كل 40 ثانية طول ما التاب
// ظاهر قدام العميل (routes/presence.js). منها لوحة التحكم بتعرف مين متصل
// دلوقتي وآخر ظهور لكل عميل.
//
// • التاب في الخلفية أو الشاشة مقفولة = مبيبعتش (مش "فاتح" فعلًا).
// • صفحات لوحة التحكم مبتبعتش — إنت مش عميل.
// • الزائر بياخد رقم عشوائي على جهازه بس (مفيش أي بيانات شخصية).
// • أول ما يسجّل دخول بيبعت على طول، فبيتحوّل من "زائر" لاسمه في اللوحة.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../store/api.js';

const EVERY_MS = 40 * 1000;
const VID_KEY = 'mithaq:vid';
const SRC_KEY = 'mithaq:src';

/**
 * الزائر جه منين (لتحليلات الموقع في لوحة التحكم): الموقع اللي جه منه
 * (document.referrer) أو باراميتر في اللينك (utm_source / fbclid / gclid).
 * بيتحفظ أول مرة في الزيارة بس (sessionStorage) — التنقل جوه الموقع مابيغيّروش.
 */
function sourceInfo() {
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

function visitorId() {
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

export default function PresencePing() {
  const { pathname } = useLocation();
  const { data } = useGetMeQuery();
  const userId = data?.user?.id || '';
  const pathRef = useRef(pathname);
  useEffect(() => { pathRef.current = pathname; }, [pathname]);
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return undefined;
    const vid = visitorId();
    let last = 0;
    function ping(force) {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      // تغيّر الصفحة بيبعت على طول، بس مش أكتر من مرة كل 5 ثواني
      if (!force && now - last < 5000) return;
      last = now;
      fetch('/api/presence', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid, path: pathRef.current, ...sourceInfo() }),
        keepalive: true,
      }).catch(() => { /* مش مهم لو فشلت مرة — الجاية هتعوّض */ });
    }
    ping(true);
    const timer = setInterval(() => ping(true), EVERY_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') ping(false); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // userId: أول ما يدخل/يخرج بنبعت على طول بالحالة الجديدة
  }, [isAdmin, userId]);

  // تغيير الصفحة = إشارة فورية بالمسار الجديد
  useEffect(() => {
    if (isAdmin || document.visibilityState !== 'visible') return;
    const t = setTimeout(() => {
      fetch('/api/presence', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid: visitorId(), path: pathname, ...sourceInfo() }),
        keepalive: true,
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [pathname, isAdmin]);

  return null;
}
