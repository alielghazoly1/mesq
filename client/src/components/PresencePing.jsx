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
import { visitorId, sourceInfo } from '../lib/visitor.js';

const EVERY_MS = 40 * 1000;
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
