// الجولة المرشدة ("وريني"): الشاشة كلها بتغمق، والمكان المطلوب بس بينوّر
// وجنبه كارت فيه الخطوة (1 من 3). نفس أسلوب الجولات في التطبيقات العالمية.
//
// قواعد الأمان (الجولة عمرها ما تعدّل حاجة في الدعوة):
//  • كل الشاشة متغطية بطبقات شفافة بتمسك الضغط — ولا زرار تحتها يشتغل.
//  • المكان المنوّر نفسه مقفول هو كمان، إلا لو الخطوة قالت allowClick
//    (ودي للتبويبات بس — فتح تبويب مش تعديل).
//  • الحاجة الوحيدة اللي الجولة بتعملها بنفسها: تفتح تبويب (onAction).
//
// الهدف بيتقاس كل فريم (requestAnimationFrame) — فلو حاجة اتحركت (أنيميشن،
// تغيير مقاس الشاشة، سكرول) النور بيتابعها. ولو الهدف مش موجود خالص بعد
// ثانية ونص، الكارت بيظهر في نص الشاشة بدل ما الجولة تقف.
import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, ArrowRight, Check, MousePointerClick } from 'lucide-react';
import { tr } from './helpTopics.js';
import { reportError } from '../../../lib/reportError.js';

const PAD = 6;            // المسافة بين الحاجة المنوّرة وحافة النور
const GAP = 16;           // المسافة بين النور والكارت
const MARGIN = 12;        // أقل مسافة بين الكارت وحافة الشاشة
const WAIT_MS = 2200;     // قد إيه نستنى الهدف يظهر (تبويب بيفتح، أو الدعوة بتنزل لعنصر)
const Z = 9000;

const UI = {
  step: { ar: (i, n) => `خطوة ${i} من ${n}`, en: (i, n) => `Step ${i} of ${n}` },
  next: { ar: 'التالي', en: 'Next' },
  prev: { ar: 'السابق', en: 'Back' },
  done: { ar: 'تمام، فهمت', en: 'Got it' },
  close: { ar: 'اقفل الشرح', en: 'Close guide' },
  clickHint: { ar: 'أو دوس على المكان المنوّر', en: 'or click the highlighted spot' },
};

/** هل العنصر ظاهر فعلًا (مش display:none ولا مقاسه صفر)؟ */
function visibleRect(el) {
  if (!el || !el.getBoundingClientRect) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return r;
}

/** عنصر جوه الدعوة (الـ iframe) — من غير ما نسكرول الدعوة نفسها أبدًا */
function frameTarget(kind) {
  try {
    const iframe = document.querySelector('[data-help="preview"] iframe');
    const fr = visibleRect(iframe);
    const doc = iframe && iframe.contentDocument;
    const win = iframe && iframe.contentWindow;
    if (!fr || !doc || !win) return null;
    const vh = win.innerHeight;
    const vw = win.innerWidth;

    let list = [];
    if (kind === 'help') {
      const el = doc.querySelector('[data-wda-help-target]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      // لسه بينزل له (سكرول) — نستنى لحد ما يبان جزء كويس منه
      const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, vh);
      if (r.width < 8 || bottom - top < Math.min(60, r.height * 0.9)) return null;
      const sx = fr.width / (iframe.clientWidth || fr.width);
      const sy = fr.height / (iframe.clientHeight || fr.height);
      return {
        el: null,
        rect: {
          left: fr.left + Math.max(r.left, 0) * sx,
          top: fr.top + top * sy,
          width: (Math.min(r.right, vw) - Math.max(r.left, 0)) * sx,
          height: (bottom - top) * sy,
        },
      };
    }
    if (kind === 'text') list = [...doc.querySelectorAll('[data-wda-kind="text"]')];
    else if (kind === 'date') {
      const all = [...doc.querySelectorAll('[data-wda-kind="text"], [data-wda-kind="live"]')];
      list = all.filter((el) => /\b20\d{2}\b/.test(el.textContent || ''));
    } else if (kind === 'map') list = [...doc.querySelectorAll('[data-wda-kind="map"]')];
    else if (kind === 'image') list = [...doc.querySelectorAll('[data-wda-kind="image"]')];

    for (const el of list) {
      const r = el.getBoundingClientRect();
      // لازم يكون ظاهر بالكامل تقريبًا في الجزء اللي العميل شايفه (وتحت
      // شارة "وضع التحرير" اللي فوق)
      if (r.width < 24 || r.height < 10) continue;
      if (r.top < 44 || r.bottom > vh - 6 || r.left < -2 || r.right > vw + 2) continue;
      if (kind === 'text') {
        const len = (el.textContent || '').trim().length;
        if (len < 2 || len > 80) continue;
      }
      const cs = win.getComputedStyle(el);
      if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.3) continue;
      // المعاينة ممكن تكون متصغّرة (مش 1:1) — بنحوّل الإحداثيات بالنسبة
      const sx = fr.width / (iframe.clientWidth || fr.width);
      const sy = fr.height / (iframe.clientHeight || fr.height);
      const left = fr.left + r.left * sx;
      const top = fr.top + r.top * sy;
      return {
        el: null,
        rect: { left, top, width: r.width * sx, height: r.height * sy },
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** بيلاقي أول هدف موجود من قايمة الأهداف */
function resolveTarget(target) {
  const keys = Array.isArray(target) ? target : [target];
  for (const key of keys) {
    if (!key) continue;
    if (key.indexOf('frame:') === 0) {
      const hit = frameTarget(key.slice(6));
      if (hit) return { ...hit, key };
      continue;
    }
    const els = document.querySelectorAll(`[data-help="${key}"]`);
    for (const el of els) {
      const r = visibleRect(el);
      if (r) return { el, key, rect: { left: r.left, top: r.top, width: r.width, height: r.height } };
    }
  }
  return null;
}

/** يجيب العنصر قدام العميل جوه الشريط اللي بيتسكرول (من غير scrollIntoView
 *  اللي ممكن يحرّك الصفحة كلها) */
function ensureVisible(el) {
  let p = el && el.parentElement;
  while (p && p !== document.body) {
    const cs = getComputedStyle(p);
    if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 1) {
      const pr = p.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      if (er.top < pr.top + 12 || er.bottom > pr.bottom - 12) {
        const room = pr.height - er.height;
        const offset = room > 24 ? room / 2 : 12;
        const top = p.scrollTop + (er.top - pr.top) - offset;
        p.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
      return;
    }
    p = p.parentElement;
  }
}

/** مكان الكارت: الجنب اللي فيه أكبر مساحة، والسهم بيشاور على الهدف */
function placeCard(hole, card, vw, vh) {
  if (!hole) {
    return { left: (vw - card.w) / 2, top: (vh - card.h) / 2, side: null, arrow: 0 };
  }
  const space = {
    left: hole.left - MARGIN,
    right: vw - (hole.left + hole.width) - MARGIN,
    top: hole.top - MARGIN,
    bottom: vh - (hole.top + hole.height) - MARGIN,
  };
  const fits = {
    left: space.left >= card.w + GAP,
    right: space.right >= card.w + GAP,
    top: space.top >= card.h + GAP,
    bottom: space.bottom >= card.h + GAP,
  };
  const order = ['left', 'right', 'bottom', 'top']
    .filter((s) => fits[s])
    .sort((a, b) => space[b] - space[a]);
  const side = order[0] || null;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const cx = hole.left + hole.width / 2;
  const cy = hole.top + hole.height / 2;
  let left;
  let top;
  if (side === 'left' || side === 'right') {
    left = side === 'left' ? hole.left - GAP - card.w : hole.left + hole.width + GAP;
    top = clamp(cy - card.h / 2, MARGIN, vh - card.h - MARGIN);
  } else if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? hole.top - GAP - card.h : hole.top + hole.height + GAP;
    left = clamp(cx - card.w / 2, MARGIN, vw - card.w - MARGIN);
  } else {
    // مفيش مكان جنب الهدف (هدف ضخم): الكارت تحت في النص فوق الهدف
    left = clamp(cx - card.w / 2, MARGIN, vw - card.w - MARGIN);
    top = vh - card.h - MARGIN * 2;
  }
  // السهم: مكانه على حافة الكارت قصاد نص الهدف
  const arrow = side === 'left' || side === 'right'
    ? clamp(cy - top, 18, card.h - 18)
    : clamp(cx - left, 18, card.w - 18);
  return { left, top, side, arrow };
}

const sameRect = (a, b) => (!a && !b) || (a && b
  && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.top - b.top) < 0.5
  && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5);

function TourInner({ steps, lang, onClose, onAction }) {
  const [index, setIndex] = useState(0);
  const [hole, setHole] = useState(null);       // مستطيل النور (بالـ padding)
  const [mode, setMode] = useState('waiting');  // waiting | target | center
  const [hitKey, setHitKey] = useState('');
  const [pos, setPos] = useState(null);
  const cardRef = useRef(null);
  const elRef = useRef(null);
  const [targetEl, setTargetEl] = useState(null);
  const nextBtnRef = useRef(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });

  const step = steps[index];
  const total = steps.length;
  const last = index === total - 1;
  const rtl = document.documentElement.dir === 'rtl';
  const reduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const next = useCallback(() => {
    if (last) onClose('done');
    else setIndex((i) => Math.min(i + 1, total - 1));
  }, [last, total, onClose]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // ===== أول الخطوة: افتح التبويب المطلوب، وابدأ تدوير على الهدف =====
  useEffect(() => {
    if (!step) return undefined;
    if ((step.tab || step.reveal) && onAction) onAction({ tab: step.tab, reveal: step.reveal });
    setMode('waiting');
    elRef.current = null;
    setTargetEl(null);

    const started = performance.now();
    let scrolled = false;
    let raf = 0;
    let lastHole = null;
    const loop = () => {
      // خطوة بتنزل لعنصر جوه الدعوة: أول ثانية ونص بندوّر على العنصر ده بس
      // (لسه بينزل له) — عشان النور مايروحش لحاجة تانية ويرجع
      const targets = Array.isArray(step.target) ? step.target : [step.target];
      const early = step.reveal && performance.now() - started < 1500;
      const hit = resolveTarget(early ? targets.slice(0, 1) : targets);
      if (hit) {
        if (hit.el && !scrolled) { scrolled = true; ensureVisible(hit.el); }
        if (hit.el !== elRef.current) { elRef.current = hit.el; setTargetEl(hit.el); }
        const r = hit.rect;
        const h = {
          left: r.left - PAD, top: r.top - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2,
        };
        if (!sameRect(h, lastHole)) { lastHole = h; setHole(h); }
        setHitKey(hit.key);
        setMode('target');
      } else if (performance.now() - started > WAIT_MS) {
        if (lastHole) { lastHole = null; setHole(null); }
        setMode('center');
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // onAction ثابت من الأب؛ الخطوة نفسها هي اللي بتحدد
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, steps]);

  // ===== مقاس الشاشة =====
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ===== مكان الكارت =====
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const size = { w: card.offsetWidth, h: card.offsetHeight };
    const p = placeCard(mode === 'target' ? hole : null, size, vp.w, vp.h);
    setPos((old) => (old && old.left === p.left && old.top === p.top && old.side === p.side && old.arrow === p.arrow ? old : p));
  }, [hole, mode, vp, index, lang]);

  // ===== الضغط على المكان المنوّر بيكمّل (للتبويبات بس) =====
  useEffect(() => {
    if (!targetEl || !step || !step.allowClick || !step.advanceOnClick) return undefined;
    const onClick = () => setTimeout(next, 60);
    targetEl.addEventListener('click', onClick);
    return () => targetEl.removeEventListener('click', onClick);
  }, [targetEl, step, next]);

  // ===== الكيبورد: Esc يقفل، الأسهم تتنقّل، و Tab مايهربش من الكارت =====
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose('esc'); return; }
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === fwd) { e.preventDefault(); next(); return; }
      if (e.key === back) { e.preventDefault(); prev(); return; }
      if (e.key === 'Tab' && cardRef.current) {
        const f = cardRef.current.querySelectorAll('button');
        if (!f.length) return;
        const first = f[0];
        const lastBtn = f[f.length - 1];
        if (!cardRef.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastBtn.focus(); }
        else if (!e.shiftKey && document.activeElement === lastBtn) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [next, prev, onClose, rtl]);

  // التركيز على زرار "التالي" مع كل خطوة — Enter يكمّل على طول
  useEffect(() => {
    const t = setTimeout(() => { try { nextBtnRef.current?.focus({ preventScroll: true }); } catch { /* */ } }, 30);
    return () => clearTimeout(t);
  }, [index]);

  if (!step) return null;

  const showHole = mode === 'target' && hole;
  const clickable = showHole && step.allowClick;
  const anim = reduced ? 'none' : 'left .32s cubic-bezier(.2,.8,.2,1), top .32s cubic-bezier(.2,.8,.2,1), width .32s cubic-bezier(.2,.8,.2,1), height .32s cubic-bezier(.2,.8,.2,1)';

  // الطبقات اللي بتمسك الضغط حوالين النور (والنور نفسه لو مش مسموح)
  const blockers = [];
  const blockStyle = { position: 'fixed', zIndex: Z, background: 'transparent' };
  if (showHole) {
    const h = hole;
    blockers.push(
      { key: 'top', left: 0, top: 0, width: '100vw', height: Math.max(0, h.top) },
      { key: 'bottom', left: 0, top: h.top + h.height, width: '100vw', height: Math.max(0, vp.h - h.top - h.height) },
      { key: 'left', left: 0, top: h.top, width: Math.max(0, h.left), height: h.height },
      { key: 'right', left: h.left + h.width, top: h.top, width: Math.max(0, vp.w - h.left - h.width), height: h.height },
    );
    if (!clickable) blockers.push({ key: 'hole', left: h.left, top: h.top, width: h.width, height: h.height });
  } else {
    blockers.push({ key: 'all', left: 0, top: 0, width: '100vw', height: '100vh' });
  }

  const arrowStyle = (() => {
    if (!pos || !pos.side || mode !== 'target') return null;
    const s = { position: 'absolute', width: 14, height: 14, background: 'inherit', transform: 'rotate(45deg)' };
    if (pos.side === 'left') return { ...s, right: -7, top: pos.arrow - 7 };
    if (pos.side === 'right') return { ...s, left: -7, top: pos.arrow - 7 };
    if (pos.side === 'top') return { ...s, bottom: -7, left: pos.arrow - 7 };
    return { ...s, top: -7, left: pos.arrow - 7 };
  })();

  return createPortal(
    <div data-tour-root="" aria-live="polite">
      <style>{`
        @keyframes mithaq-tour-pulse {
          0% { box-shadow: 0 0 0 0 rgba(212,175,106,.75); }
          70% { box-shadow: 0 0 0 14px rgba(212,175,106,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,175,106,0); }
        }
        @keyframes mithaq-tour-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          [data-tour-ring], [data-tour-card-body] { animation: none !important; }
        }
      `}</style>

      {/* الغمقان: لو فيه هدف — نور مكانه بظل ضخم حواليه؛ لو مفيش — الشاشة كلها */}
      {showHole ? (
        <div
          data-tour-spot={hitKey}
          style={{
            position: 'fixed', zIndex: Z, pointerEvents: 'none', borderRadius: 14,
            left: hole.left, top: hole.top, width: hole.width, height: hole.height,
            boxShadow: '0 0 0 9999px rgba(10,16,13,.72)',
            transition: anim,
          }}
        >
          <div
            data-tour-ring=""
            style={{
              position: 'absolute', inset: 0, borderRadius: 14,
              border: '2px solid #d4af6a',
              animation: 'mithaq-tour-pulse 1.6s ease-out infinite',
            }}
          />
        </div>
      ) : (
        <div style={{ position: 'fixed', inset: 0, zIndex: Z, pointerEvents: 'none', background: 'rgba(10,16,13,.72)' }} />
      )}

      {blockers.map(({ key, ...b }) => (
        <div key={key} data-tour-block={key} style={{ ...blockStyle, ...b }} onClick={(e) => e.stopPropagation()} />
      ))}

      {/* الكارت */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mithaq-tour-title"
        data-tour-card={mode}
        data-tour-step={index}
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          position: 'fixed', zIndex: Z + 1, width: 330, maxWidth: 'calc(100vw - 24px)',
          left: pos ? pos.left : -9999, top: pos ? pos.top : -9999,
          visibility: pos ? 'visible' : 'hidden',
          transition: reduced ? 'none' : 'left .32s cubic-bezier(.2,.8,.2,1), top .32s cubic-bezier(.2,.8,.2,1)',
        }}
        className="rounded-2xl bg-card text-ink shadow-[0_24px_60px_-18px_rgba(0,0,0,.55)] ring-1 ring-black/5"
      >
        {arrowStyle && <span aria-hidden="true" style={arrowStyle} className="bg-card" />}
        <div key={index} data-tour-card-body="" className="relative p-4" style={{ animation: 'mithaq-tour-in .25s ease-out' }}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span data-tour-label="" className="rounded-full bg-brass/15 px-2.5 py-1 text-[11px] font-extrabold text-[#7a5a1a]">
              {UI.step[lang === 'en' ? 'en' : 'ar'](index + 1, total)}
            </span>
            <button
              type="button"
              onClick={() => onClose('x')}
              aria-label={tr(UI.close, lang)}
              title={tr(UI.close, lang)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink"
            >
              <X size={15} />
            </button>
          </div>

          <h3 id="mithaq-tour-title" className="font-serif text-[16px] font-bold leading-snug text-ink">
            {tr(step.title, lang)}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{tr(step.body, lang)}</p>

          {clickable && step.advanceOnClick && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-rose">
              <MousePointerClick size={12} /> {tr(UI.clickHint, lang)}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            {/* نقط التقدّم */}
            <div className="flex flex-1 items-center gap-1" aria-hidden="true">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-brass' : i < index ? 'w-1.5 bg-brass/50' : 'w-1.5 bg-ink/15'}`}
                />
              ))}
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={prev}
                data-tour-prev=""
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[12px] font-bold text-ink-dim hover:border-ink/30 hover:text-ink"
              >
                {rtl ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
                {tr(UI.prev, lang)}
              </button>
            )}
            <button
              ref={nextBtnRef}
              type="button"
              onClick={next}
              data-tour-next=""
              className="inline-flex items-center gap-1 rounded-full bg-night px-4 py-1.5 text-[12px] font-bold text-ivory hover:bg-emerald"
            >
              {last ? <Check size={12} /> : null}
              {last ? tr(UI.done, lang) : tr(UI.next, lang)}
              {!last && (rtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * لو الجولة نفسها وقعت لأي سبب: تتقفل بهدوء (من غير ما تسيب الشاشة غامقة
 * أو توقّع المحرر)، والسبب يتبعت للوحة التحكم.
 */
class TourBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    reportError(error, {
      where: 'editor-tour',
      componentStack: info && info.componentStack,
      context: `tour=${this.props.tourId || '-'}`,
    });
    if (this.props.onClose) this.props.onClose('error');
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

export default function GuidedTour(props) {
  return (
    <TourBoundary tourId={props.tourId} onClose={props.onClose}>
      <TourInner {...props} />
    </TourBoundary>
  );
}
