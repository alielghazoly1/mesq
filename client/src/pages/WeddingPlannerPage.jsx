// /wedding-planner — معرض شغل كريم (منسّق الحفلات، صاحب المالك) جوه موقع ميثاق — بطلب المالك (2026-11-21).
// الصفحة جزء من موقعنا: شريط ميثاق العادي فوق (اللوجو بيرجّع للرئيسية + تسجيل الدخول) وفوتر الموقع تحت،
// ومن غير أي هيدر/كلام باسم كريم — "THE COLLECTION · تصميماتنا" وتحتها الشغل وبس.
// - كل تصميم بصوره (client/public/karim/<id>-<n>.webp 1200w و -s.webp 600w)، والضغط على الصورة بيفتح عارض:
//   سحب بين الصور، تكبير بضغطتين / بصباعين / بعجلة الماوس وتحريك الصورة وهي متكبّرة، والقفل بـ ✕ أو Esc أو
//   زرار الرجوع أو ضغطة برّه الصورة أو سحبها لتحت.
// - "اطلب الآن" بيفتح واتساب كريم (01111608343) على طول برسالة فيها اسم التصميم ورقمه ولينكه.
// - مخفية: مش متلينكة من أي حتة، ومش في خريطة الموقع (utils/seo.js مايعرفهاش → السيرفر بيبعت X-Robots-Tag: noindex).
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer.jsx';

const PHONE = '201111608343';
const IMG = '/karim/';

const DESIGNS = [
  { id: 'royal-sky', n: 2,
    ar: { name: 'قوس السماء الملكي', d: 'قوس بالونات أزرق سماوي ودهبي بأعمدة ونجوم دهب — دخلة فخمة لأي احتفال كبير.' },
    en: { name: 'Royal Sky Arch', d: 'A sky-blue and gold balloon arch with columns and gold stars — a grand entrance for any big celebration.' } },
  { id: 'crimson', n: 2,
    ar: { name: 'ستارة القرمز', d: 'جارلاند أحمر وأبيض ودهبي حوالين ستارة لامعة، والاسم بحروف دهب.' },
    en: { name: 'Crimson Curtain', d: 'A red, white and gold garland around a shimmering curtain, with the name in gold letters.' } },
  { id: 'emerald', n: 2,
    ar: { name: 'حديقة الزمرد', d: 'قوس أخضر ودهبي في الهواء الطلق، بترابيزة وخلفية مطبوعة على ذوقك.' },
    en: { name: 'Emerald Garden', d: 'An outdoor green and gold arch with a table and a printed backdrop of your choice.' } },
  { id: 'ruby-noir', n: 3,
    ar: { name: 'ياقوت الليل', d: 'أحمر وأسود ودهبي مع أبيض لامع، والاسم والرقم بالدهبي.' },
    en: { name: 'Ruby Noir', d: 'Red, black and gold with glossy white, plus the name and number in gold.' } },
  { id: 'ocean-gate', n: 2,
    ar: { name: 'بوابة المحيط', d: 'درجات الأزرق حوالين الباب بسلاسل دهب — دخلة تخطف العين.' },
    en: { name: 'Ocean Gate', d: 'Shades of blue framing the door with gold chains — an entrance that turns heads.' } },
  { id: 'disco-queen', n: 2,
    ar: { name: 'ملكة الديسكو', d: 'أحمر وفضي بكرات ديسكو وحيطة ترتر فضي — لسهرة كلها لمعان.' },
    en: { name: 'Disco Queen', d: 'Red and silver with disco balls and a silver sequin wall — a night full of sparkle.' } },
  { id: 'champions', n: 2,
    ar: { name: 'ركن الأبطال', d: 'أزرق وأحمر ودهبي بكور قدم وستارة زرقا — لعشاق الكورة.' },
    en: { name: "Champions' Corner", d: 'Blue, red and gold with footballs and a blue fringe curtain — for football lovers.' } },
];

const L = {
  ar: { eyebrow: 'THE COLLECTION', title: 'تصميماتنا', sub: 'Signature Designs', order: 'اطلب الآن', photos: 'الصور', count: (n) => `${n} صور`,
    zoom: 'اضغط للتكبير', hint: 'اضغط مرتين أو افتح بصباعين عشان تكبّر الصورة', orderThis: 'اطلب التصميم ده', close: 'قفل',
    prev: 'الصورة اللي قبل', next: 'الصورة اللي بعد', photo: 'صورة', viewer: 'صور التصميم',
    msg: (d, c, url) => `أهلاً 👋\nحابب أطلب تصميم «${d.ar.name}» (${d.en.name}) — ${c}\n${url}` },
  en: { eyebrow: 'THE COLLECTION', title: 'Our Designs', sub: 'Signature Designs', order: 'Order now', photos: 'Photos', count: (n) => `${n} photos`,
    zoom: 'Tap to zoom', hint: 'Double-tap or pinch to zoom', orderThis: 'Order this design', close: 'Close',
    prev: 'Previous photo', next: 'Next photo', photo: 'Photo', viewer: 'Design photos',
    msg: (d, c, url) => `Hello 👋\nI'd like to order the «${d.en.name}» (${d.ar.name}) design — ${c}\n${url}` },
};

const code = (i) => `K-${String(i + 1).padStart(2, '0')}`;
const src = (d, k, small) => `${IMG}${d.id}-${k + 1}${small ? '-s' : ''}.webp`;
const arDigits = (s) => String(s).replace(/\d/g, (c) => '٠١٢٣٤٥٦٧٨٩'[c]);
function orderLink(i, lang) {
  const d = DESIGNS[i];
  const url = `${window.location.origin}/wedding-planner#${d.id}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(L[lang].msg(d, code(i), url))}`;
}

// شعار واتساب (Simple Icons — CC0) — نفس اللي في WhatsAppFloat
const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
function WhatsAppIcon({ size = 18, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d={WA_PATH} /></svg>;
}
function CameraIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.5" /><path d="M8.5 6l1.5-2h4l1.5 2" /></svg>;
}
function ZoomIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2M11 8v6M8 11h6" /></svg>;
}

/* ===================== the viewer ===================== */
function Viewer({ i, start, lang, onClose }) {
  const d = DESIGNS[i];
  const t = L[lang];
  const rtl = document.documentElement.dir === 'rtl';
  const [k, setK] = useState(start);
  const kRef = useRef(start);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const lbRef = useRef(null);
  const imgs = useRef([]);
  const z = useRef({ s: 1, x: 0, y: 0 });
  const closing = useRef(false);
  const MAX = 4;

  const close = useCallback((fromPop) => {
    if (closing.current) return;
    closing.current = true;
    onClose();
    if (!fromPop) { try { window.history.back(); } catch { /* */ } }
  }, [onClose]);

  // back button closes the viewer (an extra history entry while it's open)
  useEffect(() => {
    try { window.history.pushState({ ...(window.history.state || {}), karimViewer: 1 }, ''); } catch { /* */ }
    const onPop = () => close(true);
    window.addEventListener('popstate', onPop);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { window.removeEventListener('popstate', onPop); html.style.overflow = prev; };
  }, [close]);

  // the full-size photos replace the thumbnails as soon as they arrive
  useEffect(() => {
    for (let j = 0; j < d.n; j++) {
      const full = new Image();
      full.onload = () => { const im = imgs.current[j]; if (im) im.src = full.src; };
      full.src = src(d, j, false);
    }
  }, [d]);

  const setTrack = useCallback((dx, anim) => {
    const tr = trackRef.current, st = stageRef.current;
    if (!tr || !st) return;
    tr.style.transition = anim ? 'transform .35s cubic-bezier(.2,.7,.2,1)' : 'none';
    const w = st.clientWidth;
    // RTL: الصور مرصوصة من اليمين للشمال → الجاية على الشمال
    tr.style.transform = `translate3d(${(rtl ? 1 : -1) * kRef.current * w + dx}px,0,0)`;
  }, [rtl]);
  const resetZoom = useCallback((anim) => {
    Object.assign(z.current, { s: 1, x: 0, y: 0 });
    imgs.current.forEach((im) => { if (im) { im.style.transition = anim ? 'transform .28s ease' : 'none'; im.style.transform = ''; } });
  }, []);
  const go = useCallback((nk, instant) => {
    const v = Math.max(0, Math.min(d.n - 1, nk));
    kRef.current = v; setK(v);
    resetZoom(false);
    setTrack(0, !instant);
  }, [d.n, resetZoom, setTrack]);
  useEffect(() => { go(start, true); }, [go, start]);

  useEffect(() => {
    const stage = stageRef.current, lb = lbRef.current;
    const img = () => imgs.current[kRef.current];
    const apply = (anim) => {
      const im = img(); if (!im) return;
      im.style.transition = anim ? 'transform .28s ease' : 'none';
      im.style.transform = `translate(${z.current.x}px,${z.current.y}px) scale(${z.current.s})`;
    };
    // the zoomed photo always covers the stage (no empty gaps while panning)
    const clamp = () => {
      const im = img(); if (!im) return;
      const zz = z.current;
      const w = im.offsetWidth * zz.s, h = im.offsetHeight * zz.s;
      const r = im.parentNode.getBoundingClientRect();
      const bx = (r.width - im.offsetWidth) / 2, by = (r.height - im.offsetHeight) / 2;
      let minX = Math.min(0, r.width - w) - bx, maxX = Math.max(0, r.width - w) - bx;
      let minY = Math.min(0, r.height - h) - by, maxY = Math.max(0, r.height - h) - by;
      if (w <= r.width) { minX = maxX = (r.width - w) / 2 - bx; }
      if (h <= r.height) { minY = maxY = (r.height - h) / 2 - by; }
      zz.x = Math.max(minX, Math.min(maxX, zz.x)); zz.y = Math.max(minY, Math.min(maxY, zz.y));
    };
    // zoom to s keeping the point (px,py) still
    const zoomAt = (s, px, py, anim) => {
      const im = img(); if (!im) return;
      const zz = z.current;
      s = Math.max(1, Math.min(MAX, s));
      const r = im.getBoundingClientRect();
      const ox = (px - r.left) / zz.s, oy = (py - r.top) / zz.s;
      const bx = r.left - zz.x, by = r.top - zz.y;
      zz.x = px - bx - ox * s; zz.y = py - by - oy * s; zz.s = s;
      if (s === 1) { zz.x = 0; zz.y = 0; } else clamp();
      apply(anim);
    };

    const pts = new Map();
    let g = null, lastTap = 0, lastX = 0, lastY = 0, tapTimer = 0;
    const down = (e) => {
      if (e.target.closest('[data-nav]')) return;
      try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const a = [...pts.values()];
        g = { mode: 'pinch', d0: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), s0: z.current.s };
      } else if (pts.size === 1) {
        g = { mode: z.current.s > 1 ? 'pan' : 'swipe', x0: e.clientX, y0: e.clientY, zx: z.current.x, zy: z.current.y, t0: Date.now(), axis: null };
      }
    };
    const move = (e) => {
      if (!pts.has(e.pointerId) || !g) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (g.mode === 'pinch' && pts.size >= 2) {
        const a = [...pts.values()];
        const dd = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        zoomAt(g.s0 * dd / g.d0, (a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2, false);
      } else if (g.mode === 'pan') {
        z.current.x = g.zx + (e.clientX - g.x0); z.current.y = g.zy + (e.clientY - g.y0); clamp(); apply(false);
      } else if (g.mode === 'swipe') {
        const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
        if (!g.axis && Math.hypot(dx, dy) > 8) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (g.axis === 'x') setTrack(dx, false);
        else if (g.axis === 'y' && dy > 0) {
          const im = img(); im.style.transition = 'none';
          im.style.transform = `translateY(${dy}px) scale(${Math.max(0.85, 1 - dy / 1200)})`;
          lb.style.background = `rgba(12,10,9,${Math.max(0.4, 1 - dy / 600)})`;
        }
      }
    };
    const up = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (!g) return;
      if (g.mode === 'pinch') {
        if (pts.size === 0) { if (z.current.s < 1.05) resetZoom(true); g = null; } else {
          const p = [...pts.values()][0];
          g = { mode: z.current.s > 1 ? 'pan' : 'swipe', x0: p.x, y0: p.y, zx: z.current.x, zy: z.current.y, t0: Date.now(), axis: null };
        }
        return;
      }
      const dx = e.clientX - g.x0, dy = e.clientY - g.y0, dt = Date.now() - g.t0;
      if (g.mode === 'swipe') {
        lb.style.background = '';
        if (g.axis === 'x') {
          const w = stage.clientWidth, kk = kRef.current;
          const fwd = rtl ? dx : -dx;   // RTL: السحب لليمين = الجاية
          if ((fwd > w * 0.18 || (fwd > 40 && dt < 300)) && kk < d.n - 1) go(kk + 1);
          else if ((fwd < -w * 0.18 || (fwd < -40 && dt < 300)) && kk > 0) go(kk - 1);
          else setTrack(0, true);
        } else if (g.axis === 'y') {
          if (dy > 110 || (dy > 50 && dt < 260)) close(false);
          else { const im = img(); im.style.transition = 'transform .25s ease'; im.style.transform = ''; }
        } else if (Math.hypot(dx, dy) < 10) {
          // tap: double = zoom in/out at the tap; one tap on the dark area around the photo = close
          const now = Date.now();
          clearTimeout(tapTimer);
          if (now - lastTap < 300 && Math.hypot(e.clientX - lastX, e.clientY - lastY) < 30) { zoomAt(z.current.s > 1 ? 1 : 2.5, e.clientX, e.clientY, true); lastTap = 0; } else {
            lastTap = now; lastX = e.clientX; lastY = e.clientY;
            const ir = img().getBoundingClientRect();
            const outside = e.clientX < ir.left || e.clientX > ir.right || e.clientY < ir.top || e.clientY > ir.bottom;
            if (outside) tapTimer = setTimeout(() => { if (lastTap === now) close(false); }, 320);
          }
        }
      } else if (g.mode === 'pan' && Math.hypot(dx, dy) < 10) {
        const now = Date.now();
        if (now - lastTap < 300) { zoomAt(1, e.clientX, e.clientY, true); lastTap = 0; } else { lastTap = now; lastX = e.clientX; lastY = e.clientY; }
      }
      g = null;
    };
    const wheel = (e) => { e.preventDefault(); zoomAt(z.current.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY, false); };
    const dbl = (e) => e.preventDefault();
    const key = (e) => {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'ArrowLeft') go(kRef.current + (rtl ? 1 : -1));
      else if (e.key === 'ArrowRight') go(kRef.current + (rtl ? -1 : 1));
    };
    const resize = () => { resetZoom(false); setTrack(0, false); };
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', wheel, { passive: false });
    stage.addEventListener('dblclick', dbl);
    window.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    window.__karimViewer = { z: z.current, get k() { return kRef.current; } };
    return () => {
      clearTimeout(tapTimer);
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', up);
      stage.removeEventListener('wheel', wheel);
      stage.removeEventListener('dblclick', dbl);
      window.removeEventListener('keydown', key);
      window.removeEventListener('resize', resize);
      delete window.__karimViewer;
    };
  }, [d.n, go, resetZoom, setTrack, close, rtl]);

  const closeBtn = useRef(null);
  useEffect(() => { closeBtn.current?.focus({ preventScroll: true }); }, []);

  return createPortal(
    <div ref={lbRef} data-karim-viewer role="dialog" aria-modal="true" aria-label={t.viewer}
      className="fixed inset-0 z-[3000] flex select-none flex-col bg-[#0c0a09] text-[#f4ead6]" style={{ touchAction: 'none' }}>
      <div className="relative z-[3] flex items-center gap-3 px-3.5 pb-2.5 pt-[calc(10px+env(safe-area-inset-top))]">
        <button ref={closeBtn} type="button" data-close aria-label={t.close} onClick={() => close(false)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          <b data-name className="block truncate font-serif text-[18px] font-bold">{d[lang].name}</b>
          <span className="block font-serif text-[14px] italic text-brass-soft">{(lang === 'ar' ? d.en.name : d.ar.name)} · {code(i)}</span>
        </div>
        <div data-count className="shrink-0 text-[13px] font-semibold tracking-[.12em] text-[#d8c9ad]" dir="ltr">{k + 1} / {d.n}</div>
      </div>
      <div ref={stageRef} data-stage className="relative min-h-0 flex-1 overflow-hidden">
        <div ref={trackRef} className="absolute inset-0 flex will-change-transform">
          {Array.from({ length: d.n }, (_, j) => (
            <div key={j} className="relative flex h-full shrink-0 grow-0 basis-full items-center justify-center overflow-hidden">
              <img ref={(el) => { imgs.current[j] = el; }} src={src(d, j, true)} alt={`${d[lang].name} ${j + 1}`} draggable={false}
                className="max-h-full max-w-full object-contain will-change-transform" style={{ transformOrigin: '0 0' }} />
            </div>
          ))}
        </div>
        {d.n > 1 && (
          <>
            <button type="button" data-nav aria-label={t.prev} onClick={() => go(k - 1)}
              className="absolute start-4 top-1/2 z-[2] -mt-6 hidden h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 [@media(hover:hover)_and_(pointer:fine)]:grid">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:-scale-x-100"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" data-nav data-next aria-label={t.next} onClick={() => go(k + 1)}
              className="absolute end-4 top-1/2 z-[2] -mt-6 hidden h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 [@media(hover:hover)_and_(pointer:fine)]:grid">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:-scale-x-100"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </>
        )}
      </div>
      <div className="relative z-[3] flex flex-col items-center gap-3 px-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-2.5">
        {d.n > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: d.n }, (_, j) => (
              <button key={j} type="button" aria-label={`${t.photo} ${j + 1}`} onClick={() => go(j)}
                className={`h-[60px] w-[46px] overflow-hidden rounded-[5px] outline outline-1 transition ${j === k ? 'opacity-100 outline-brass-soft' : 'opacity-50 outline-transparent'}`}>
                <img src={src(d, j, true)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="text-[12.5px] text-[#a99c86]">{t.hint}</div>
        <a data-order href={orderLink(i, lang)} target="_blank" rel="noopener noreferrer"
          className="inline-flex h-[50px] items-center gap-2.5 rounded-full bg-gradient-to-b from-[#f1dcae] to-[#cfa96a] px-7 text-[16px] font-bold text-[#241a10]">
          <WhatsAppIcon className="text-[#14743b]" /> {t.orderThis}
        </a>
      </div>
    </div>,
    document.body,
  );
}

/* ===================== the page ===================== */
export default function WeddingPlannerPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const t = L[lang];
  const [view, setView] = useState(null);   // { i, k }
  const gridRef = useRef(null);

  // مش لجوجل (السيرفر بيبعت X-Robots-Tag: noindex كمان) + عنوان التاب
  // (index.html فيها robots "index, follow" — بنغيّرها هي نفسها وبنرجّعها لما نخرج من الصفحة)
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    if (created) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    const prevRobots = meta.content;
    meta.content = 'noindex, nofollow';
    const prevTitle = document.title;
    document.title = lang === 'ar' ? 'تصميماتنا | ميثاق' : 'Our Designs | Mithaq';
    return () => { if (created) meta.remove(); else meta.content = prevRobots; document.title = prevTitle; };
  }, [lang]);

  // الكروت بتظهر بالراحة وهي داخلة الشاشة
  useEffect(() => {
    const cards = gridRef.current ? [...gridRef.current.querySelectorAll('[data-design]')] : [];
    if (!('IntersectionObserver' in window)) { cards.forEach((c) => c.classList.add('is-in')); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // لينك مباشر لتصميم (/wedding-planner#disco-queen)
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el) { el.classList.add('is-in'); setTimeout(() => el.scrollIntoView({ block: 'start' }), 60); }
  }, []);

  const closeView = useCallback(() => setView(null), []);
  const num = (n) => (lang === 'ar' ? arDigits(n) : String(n));

  return (
    <>
      <main className="mx-auto max-w-6xl px-3.5 pb-[64px] pt-8 sm:px-6 sm:pb-[80px] sm:pt-12" data-karim-page>
        <div className="mb-8 text-center sm:mb-10">
          <div className="text-[11.5px] font-semibold tracking-[.3em] text-brass" dir="ltr">{t.eyebrow}</div>
          <h1 className="mt-2.5 font-serif text-[clamp(28px,4.2vw,44px)] font-bold italic text-ink">{t.title}</h1>
          <div className="mt-0.5 font-serif text-[19px] italic text-brass" dir="ltr">{t.sub}</div>
        </div>

        {/* (المالك) على الموبايل تصميمين جنب بعض */}
        <div ref={gridRef} className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3">
          {DESIGNS.map((d, i) => (
            <article key={d.id} id={d.id} data-design
              className="karim-card flex scroll-mt-20 flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-[0_18px_36px_-26px_rgba(8,19,15,.55)] sm:rounded-[18px]">
              <button type="button" onClick={() => setView({ i, k: 0 })} aria-label={`${t.zoom} — ${d[lang].name}`}
                className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-ivory-dim">
                <span className="absolute start-2.5 top-2.5 z-[1] rounded-full bg-black/55 px-2 py-1 text-[9.5px] font-semibold tracking-[.14em] text-[#fff6e4] backdrop-blur sm:start-4 sm:top-4 sm:px-2.5 sm:py-1.5 sm:text-[11px]"><bdi dir="ltr">{code(i)}</bdi></span>
                <span className="absolute end-2.5 top-2.5 z-[1] inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-[11px] font-semibold text-ink sm:end-4 sm:top-4 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[12px]">
                  <CameraIcon /> <span className="sm:hidden">{num(d.n)}</span><span className="hidden sm:inline">{t.count(num(d.n))}</span>
                </span>
                <img src={src(d, 0, true)} alt={d[lang].name} loading={i < 2 ? 'eager' : 'lazy'} decoding="async"
                  className="h-full w-full object-cover transition duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]" />
                <span className="pointer-events-none absolute inset-1.5 rounded-[10px] border border-white/50 sm:inset-2 sm:rounded-[12px]" />
                <span className="absolute bottom-2.5 start-2.5 z-[1] inline-flex items-center gap-1.5 rounded-full bg-black/50 p-1.5 text-[12px] font-medium text-[#fff6e4] sm:bottom-4 sm:start-4 sm:px-3">
                  <ZoomIcon /> <span className="hidden sm:inline">{t.zoom}</span>
                </span>
              </button>
              <div className="flex flex-1 flex-col px-3 pb-3.5 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <h2 className="font-serif text-[16.5px] font-bold leading-snug text-ink sm:text-[23px]">{d[lang].name}</h2>
                <div className="font-serif text-[13.5px] italic leading-tight text-brass sm:text-[18px]">{lang === 'ar' ? d.en.name : d.ar.name}</div>
                <p className="mt-2.5 hidden text-[14.5px] leading-[1.75] text-ink-dim sm:block">{d[lang].d}</p>
                <div className="mt-auto flex gap-2.5 pt-3 sm:pt-4">
                  <a data-order href={orderLink(i, lang)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3 text-[13.5px] font-bold text-ivory shadow-[0_12px_26px_-14px_rgba(8,19,15,.8)] transition active:scale-[.97] sm:h-12 sm:gap-2 sm:px-5 sm:text-[15px]">
                    <WhatsAppIcon size={16} className="shrink-0 text-[#5fe08f]" /> {t.order}
                  </a>
                  <button type="button" onClick={() => setView({ i, k: 0 })}
                    className="hidden h-12 items-center justify-center rounded-full border border-brass px-5 text-[15px] font-bold text-brass transition hover:bg-ivory active:scale-[.97] sm:inline-flex">
                    {t.photos}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
      {view && <Viewer key={`${view.i}`} i={view.i} start={view.k} lang={lang} onClose={closeView} />}
    </>
  );
}
