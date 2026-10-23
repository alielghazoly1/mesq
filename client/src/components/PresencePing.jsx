// "أنا فاتح الموقع" — بيبعت إشارة خفيفة للسيرفر كل 20 ثانية طول ما التاب
// ظاهر قدام العميل (routes/presence.js). منها لوحة التحكم بتعرف مين متصل
// دلوقتي وآخر ظهور لكل عميل.
//
// • قفل التاب / راح تاب تاني / قفل الشاشة = بيبعت "خرجت" على طول (sendBeacon —
//   بيوصل حتى والصفحة بتتقفل)، فبيختفي من اللوحة في نفس اللحظة. ولما يرجع
//   بيبعت على طول فبيظهر تاني.
// • صفحات لوحة التحكم مبتبعتش — إنت مش عميل.
// • الزائر بياخد رقم عشوائي على جهازه بس (مفيش أي بيانات شخصية).
// • أول ما يسجّل دخول بيبعت على طول، فبيتحوّل من "زائر" لاسمه في اللوحة.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetMeQuery } from '../store/api.js';
import { visitorId, sourceInfo } from '../lib/visitor.js';

const EVERY_MS = 20 * 1000;
// رقم التاب ده بس (جديد مع كل فتحة صفحة) — عشان قفل تاب واحد مايشيلش
// العميل من اللوحة وهو لسه فاتح تاب تاني
const TAB = (() => {
  try {
    const a = new Uint8Array(9);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 16);
  } catch {
    return Math.random().toString(36).slice(2, 12).padEnd(10, '0');
  }
})();

// رقم ترتيب كل إشارة من التاب ده — السيرفر بيتجاهل "أنا هنا" لو وصلت بعد
// "خرجت" اللي اتبعتت بعدها
let seq = 0;

function post(body) {
  // التاب مستخبي = مش فاتح فعلًا — ولا إشارة متأخرة ترجّعه "متصل" بعد ما قال "خرجت"
  if (document.visibilityState !== 'visible') return;
  fetch('/api/presence', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab: TAB, n: ++seq, ...body }),
    keepalive: true,
  }).catch(() => { /* مش مهم لو فشلت مرة — الجاية هتعوّض */ });
}

function bye(vid) {
  const body = JSON.stringify({ vid, tab: TAB, n: ++seq, bye: 1 });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/presence', new Blob([body], { type: 'application/json' }))) return;
  } catch { /* نجرّب fetch */ }
  fetch('/api/presence', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body, keepalive: true,
  }).catch(() => {});
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
    let away = false; // بعتنا "خرجت" ولسه مارجعش
    let closed = false; // الصفحة بتتقفل — مفيش "أنا هنا" تاني إلا لو رجعت فعلًا
    function ping() {
      if (closed || document.visibilityState !== 'visible') return;
      away = false;
      post({ vid, path: pathRef.current, ...sourceInfo() });
    }
    function leave() {
      if (away) return;
      away = true;
      bye(vid);
    }
    ping();
    const timer = setInterval(ping, EVERY_MS);
    // ساب التاب = خرج، رجع = متصل تاني على طول
    const onVis = () => { if (document.visibilityState === 'visible') ping(); else leave(); };
    // رجع للصفحة من زرار "رجوع" (الصفحة كانت محفوظة في المتصفح)
    const onShow = (e) => { if (e.persisted) { closed = false; ping(); } };
    const onHide = () => { closed = true; leave(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    window.addEventListener('pageshow', onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('pageshow', onShow);
      // دخل لوحة التحكم من نفس التاب — مش عميل
      if (window.location.pathname.startsWith('/admin')) leave();
    };
    // userId: أول ما يدخل/يخرج بنبعت على طول بالحالة الجديدة
  }, [isAdmin, userId]);

  // تغيير الصفحة = إشارة فورية بالمسار الجديد
  useEffect(() => {
    if (isAdmin || document.visibilityState !== 'visible') return;
    const t = setTimeout(() => post({ vid: visitorId(), path: pathname, ...sourceInfo() }), 1500);
    return () => clearTimeout(t);
  }, [pathname, isAdmin]);

  return null;
}
