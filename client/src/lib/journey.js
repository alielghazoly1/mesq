// رحلة الزائر على الموقع خطوة بخطوة (لصفحة "مباشر" في لوحة التحكم).
//
// الخطوات بتتجمّع على الجهاز وتتبعت دفعة واحدة (POST /api/track):
//   • بعد ~5 ثواني من أول خطوة جديدة — مفيش أي طلب والصفحة واقفة
//   • فورًا لما يسيب التاب أو يقفل الموقع (sendBeacon — بيوصل حتى والصفحة بتتقفل)
// الخطوات: v فتح صفحة (ومعاها وقد إيه قعد في اللي قبلها ونزل فيها لحد فين)،
// c ضغطة على زرار/لينك (الكلام المكتوب عليه بس)، h ساب التاب، s رجع، x قفل.
// مابيتسجّلش أبدًا: أي حاجة بيكتبها في خانة، ولا لوحة التحكم.
import { visitorId, sourceInfo } from './visitor.js';

const SID_KEY = 'mithaq:jsid';
const IDLE_NEW_SESSION_MS = 30 * 60 * 1000;
const FLUSH_DELAY_MS = 5000;

let queue = [];
let timer = 0;
let current = null;      // { p, t } الصفحة الحالية
let maxScroll = 0;
let started = false;
let paused = false;      // لوحة التحكم: مابنسجّلش

function sid() {
  try {
    const raw = sessionStorage.getItem(SID_KEY);
    const now = Date.now();
    if (raw) {
      const [id, last] = raw.split('|');
      if (id && now - Number(last) < IDLE_NEW_SESSION_MS) {
        sessionStorage.setItem(SID_KEY, `${id}|${now}`);
        return id;
      }
    }
    const a = new Uint8Array(12);
    crypto.getRandomValues(a);
    const id = Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
    sessionStorage.setItem(SID_KEY, `${id}|${now}`);
    return id;
  } catch {
    return '';
  }
}

function send(beacon) {
  clearTimeout(timer); timer = 0;
  if (!queue.length) return;
  const id = sid();
  if (!id) { queue = []; return; }
  const body = JSON.stringify({ sid: id, vid: visitorId(), ...sourceInfo(), ev: queue.splice(0, 60) });
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* الخطوة دي مش مهمة لو ضاعت */ }
  if (queue.length) schedule();
}

function schedule() {
  if (!timer) timer = setTimeout(() => send(false), FLUSH_DELAY_MS);
}

function push(ev) {
  if (paused) return;
  queue.push({ t: Date.now(), ...ev });
  if (queue.length >= 40) send(false); else schedule();
}

function dwell() {
  return current ? Math.round((Date.now() - current.t) / 1000) : 0;
}

/** صفحة اتفتحت (تغيير المسار في الموقع) */
export function trackView(path) {
  paused = path.startsWith('/admin');
  if (paused) { current = null; return; }
  if (current && current.p === path) return;
  push({ k: 'v', p: path, d: dwell(), s: maxScroll });
  current = { p: path, t: Date.now() };
  maxScroll = 0;
  // أول صفحة: نبعت بسرعة عشان اللوحة تشوفه على طول
  if (queue.length === 1) { clearTimeout(timer); timer = setTimeout(() => send(false), 1200); }
}

function labelOf(el) {
  const t = el.getAttribute('data-track') || el.getAttribute('aria-label') || el.getAttribute('title')
    || (el.innerText || el.textContent || '');
  return String(t).replace(/\s+/g, ' ').trim().slice(0, 60);
}

function onClick(e) {
  if (paused || !current) return;
  const el = e.target && e.target.closest && e.target.closest('a,button,[role=button],[role=tab],[data-track]');
  if (!el || el.closest('input,textarea,select,[contenteditable="true"]')) return;
  let l = labelOf(el);
  if (!l && el.tagName === 'A') l = (el.getAttribute('href') || '').slice(0, 60);
  if (!l) return;
  push({ k: 'c', p: current.p, l });
}

function onScroll() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? Math.round((window.scrollY / h) * 100) : 100;
  if (pct > maxScroll) maxScroll = Math.min(100, pct);
}

function onVisibility() {
  if (paused || !current) return;
  if (document.visibilityState === 'hidden') {
    push({ k: 'h', p: current.p });
    send(true);
  } else {
    push({ k: 's', p: current.p });
  }
}

function onPageHide() {
  if (paused || !current) return;
  push({ k: 'x', p: current.p, d: dwell(), s: maxScroll });
  send(true);
}

/** بيتشغّل مرة واحدة (components/JourneyTracker.jsx) */
export function startJourney() {
  if (started || typeof window === 'undefined') return;
  started = true;
  document.addEventListener('click', onClick, true);
  window.addEventListener('scroll', (() => { let t = 0; return () => { if (t) return; t = setTimeout(() => { t = 0; onScroll(); }, 400); }; })(), { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
}
