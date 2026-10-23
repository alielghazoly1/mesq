// المربع الطاير "على الموقع دلوقتي" — بيظهر في كل صفحات اللوحة ما عدا
// النظرة العامة (هي فيها اللوحة الكبيرة أصلًا)، وعلى الشاشات الكبيرة بس
// (لابتوب / شاشة / تلفزيون — من 1024px). على الموبايل مش بيظهر خالص ولا
// بيعمل أي طلبات.
//
// بتسحبه من أي حتة فيه وتسيبه: بيلزق في أقرب جنب (يمين أو شمال) على نفس
// الارتفاع اللي سبته عنده. مكانه وهل هو مصغّر بيتحفظوا على الجهاز ده.
// بيتحدّث كل 15 ثانية طول ما تاب اللوحة ظاهر — حتى لو الشباك نفسه مش
// متفعّل (شاشة جنبية / تلفزيون)، وبيقف لوحده لو التاب اتخبّى.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Minus, GripVertical, Users, Globe, MonitorSmartphone, UserPlus, Receipt, Wallet, ArrowLeft, Maximize2,
} from 'lucide-react';
import { useGetLiveQuery } from '../../store/adminApi.js';
import { LiveDot, fmtNum, fmtMoney } from './ui.jsx';
import { Ticker, placeLabel } from './LivePanel.jsx';

const STORE_KEY = 'mithaq-admin-livefloat';
const MARGIN = 16;
const HISTORY = 40; // آخر 40 تحديث ≈ 10 دقايق

function readPrefs() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (v && (v.side === 'left' || v.side === 'right')) return v;
  } catch { /* مفيش تخزين — نكمّل بالافتراضي */ }
  return { side: 'left', y: null, min: false };
}
function savePrefs(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch { /* عادي */ }
}

function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [m, setM] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

function usePageVisible() {
  const [v, setV] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const on = () => setV(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return v;
}

/** خط صغير بيوري عدد المتصلين في آخر دقايق */
function Spark({ points }) {
  if (points.length < 2) return <div className="h-7" />;
  const w = 100; const h = 28;
  const max = Math.max(...points, 1);
  const step = w / (points.length - 1);
  const xy = points.map((p, i) => [i * step, h - 2 - (p / max) * (h - 6)]);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="lf-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#38a8ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#38a8ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill="url(#lf-fill)" />
      <polyline points={line} fill="none" stroke="#8fcbff" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ icon: Icon, label, children, onClick, accent }) {
  return (
    <button type="button" onClick={onClick} data-lf-stat
      className="min-w-0 rounded-xl border border-line-lite bg-night/50 px-2.5 py-2 text-start transition hover:border-[#38a8ff]/45">
      <span className={`flex items-center gap-1 text-[10.5px] font-bold lf-label ${accent || 'text-ivory/45'}`}>
        <Icon size={11} className="shrink-0" /> <span className="truncate">{label}</span>
      </span>
      <span className="mt-1 block truncate font-serif text-[19px] font-bold leading-tight text-ivory lf-num">{children}</span>
    </button>
  );
}

export default function LiveFloat() {
  const big = useMedia('(min-width: 1024px)');
  if (!big) return null;
  return <LiveFloatInner />;
}

function LiveFloatInner() {
  const navigate = useNavigate();
  const visible = usePageVisible();
  const tv = useMedia('(min-width: 1800px)');
  const { data, isError, fulfilledTimeStamp } = useGetLiveQuery(undefined, {
    pollingInterval: visible ? 15000 : 0,
    skipPollingIfUnfocused: false,
    refetchOnFocus: true,
  });

  const [prefs, setPrefs] = useState(readPrefs);
  const boxRef = useRef(null);
  const drag = useRef(null);
  const [pos, setPos] = useState(null); // {x, y} بالبكسل وقت السحب بس
  const [size, setSize] = useState({ w: 280, h: 360 });
  const [vh, setVh] = useState(() => window.innerHeight);
  const [vw, setVw] = useState(() => window.innerWidth);

  // القايمة الجانبية بتتحرك بأنيميشن لما الشاشة تكبر — بنقيس تاني بعد ما تخلص
  const [, remeasure] = useState(0);
  useEffect(() => {
    let t;
    const on = () => {
      setVh(window.innerHeight); setVw(window.innerWidth);
      clearTimeout(t); t = setTimeout(() => remeasure((n) => n + 1), 400);
    };
    window.addEventListener('resize', on);
    // وقت ما المربع يظهر (والقايمة لسه بتتحرك) + آخر أي حركة للقايمة
    const t0 = setTimeout(() => remeasure((n) => n + 1), 450);
    const onEnd = (e) => { if (e.target?.matches?.('[data-admin-nav]')) remeasure((n) => n + 1); };
    document.addEventListener('transitionend', onEnd);
    return () => {
      clearTimeout(t); clearTimeout(t0);
      window.removeEventListener('resize', on);
      document.removeEventListener('transitionend', onEnd);
    };
  }, []);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [prefs.min]);

  const update = useCallback((patch) => {
    setPrefs((p) => { const n = { ...p, ...patch }; savePrefs(n); return n; });
  }, []);

  // تاريخ عدد المتصلين للخط الصغير + ومضة لما حد جديد يدخل
  const [hist, setHist] = useState([]);
  const [flash, setFlash] = useState(0);
  const lastTotal = useRef(null);
  useEffect(() => {
    if (!data) return;
    const t = data.online?.total || 0;
    setHist((h) => [...h, t].slice(-HISTORY));
    if (lastTotal.current != null && t > lastTotal.current) setFlash((f) => f + 1);
    lastTotal.current = t;
  }, [data, fulfilledTimeStamp]);

  // "اتحدّث من 8 ث"
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(id); }, []);

  const maxY = Math.max(MARGIN, vh - size.h - MARGIN);
  const restY = Math.min(maxY, Math.max(MARGIN, prefs.y == null ? maxY : prefs.y));
  // القايمة الجانبية على اليمين (اللوحة عربي) — المربع بيلزق جنبها مش تحتها.
  // بنقيسها وقت الرسم نفسه عشان مقاسها يبقى مظبوط بعد أي تكبير/تصغير للشاشة.
  const navEl = typeof document !== 'undefined' ? document.querySelector('[data-admin-nav]') : null;
  const nr = navEl ? navEl.getBoundingClientRect() : null;
  const rail = nr && nr.width && nr.left < vw ? nr : null;
  let rightX = vw - size.w - MARGIN;
  if (rail && rightX + size.w > rail.left && rightX < rail.right) rightX = rail.left - size.w - MARGIN;
  const restX = prefs.side === 'left' ? MARGIN : Math.max(MARGIN, rightX);
  const x = pos ? pos.x : restX;

  // على الشاشات الكبيرة المربع بياخد مكانه جنب المحتوى بدل ما يغطّي عليه
  // (كان بيقعد فوق زراير الجداول اللي على الشمال). المحتوى بيوسّع له مسافة
  // من ناحيته بس. أثناء السحب بنسيب المسافة زي ما هي لحد ما تسيبه.
  const dock = useMedia('(min-width: 1280px)');
  useLayoutEffect(() => {
    const main = document.querySelector('[data-admin-main]');
    if (!main) return undefined;
    const clear = () => { main.style.paddingLeft = ''; main.style.paddingRight = ''; };
    if (!dock || prefs.min) { clear(); return clear; }
    const base = 28;
    clear();
    const mr = main.getBoundingClientRect();
    if (prefs.side === 'left') {
      main.style.paddingLeft = `${Math.max(base, MARGIN + size.w + 20 - mr.left)}px`;
    } else {
      main.style.paddingRight = `${Math.max(base, mr.right - restX + 20)}px`;
    }
    return clear;
  }, [dock, prefs.min, prefs.side, size.w, vw, restX]);
  const y = pos ? pos.y : restY;

  // السحب: بنسمع لحركة الماوس على الصفحة كلها (مش المربع بس) عشان لو
  // سحبت بسرعة والماوس سبق المربع، يفضل ماشي وراه.
  const geo = useRef({});
  geo.current = { x, y, vw, vh, size, maxY };
  function onPointerDown(e) {
    if (e.button !== 0 || e.target.closest('[data-lf-nodrag]')) return;
    const g = geo.current;
    const d = { sx: e.clientX, sy: e.clientY, ox: g.x, oy: g.y, moved: false, id: e.pointerId, last: null };
    drag.current = d;
    const move = (ev) => {
      if (ev.pointerId !== d.id) return;
      const dx = ev.clientX - d.sx; const dy = ev.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 5) return;
      d.moved = true;
      ev.preventDefault();
      const c = geo.current;
      d.last = {
        x: Math.min(c.vw - c.size.w - 4, Math.max(4, d.ox + dx)),
        y: Math.min(c.vh - c.size.h - 4, Math.max(4, d.oy + dy)),
      };
      setPos(d.last);
    };
    const up = (ev) => {
      if (ev.pointerId !== d.id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      drag.current = null;
      if (!d.moved || !d.last) return;
      const c = geo.current;
      const side = d.last.x + c.size.w / 2 < c.vw / 2 ? 'left' : 'right';
      update({ side, y: Math.round(Math.min(c.maxY, Math.max(MARGIN, d.last.y))) });
      setPos(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }
  // الضغطة اللي كانت سحب متفتحش حاجة
  function onClickCapture(e) {
    if (e.detail !== 0 && dragJustEnded.current) { e.stopPropagation(); e.preventDefault(); }
  }
  const dragJustEnded = useRef(false);
  useEffect(() => {
    if (pos) { dragJustEnded.current = true; return undefined; }
    const t = setTimeout(() => { dragJustEnded.current = false; }, 50);
    return () => clearTimeout(t);
  }, [pos]);

  const online = data?.online || { total: 0, users: 0, visitors: 0 };
  const today = data?.today;
  const people = data?.onlineUsers || [];
  const secs = fulfilledTimeStamp ? Math.max(0, Math.round((Date.now() - fulfilledTimeStamp) / 1000)) : null;
  const rev = today?.revenue || {};
  const extraRev = ['USD', 'SAR', 'EUR'].filter((c) => rev[c]?.total).map((c) => fmtMoney(rev[c].total, c));

  const style = {
    left: x, top: y,
    transition: pos ? 'none' : 'left .38s cubic-bezier(.2,.9,.25,1.15), top .38s cubic-bezier(.2,.9,.25,1.15)',
  };

  return (
    <div
      ref={boxRef}
      data-live-float
      data-side={prefs.side}
      data-min={prefs.min ? '1' : '0'}
      dir="rtl"
      style={style}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
      className={`fixed z-[35] touch-none select-none ${pos ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {prefs.min ? (
        <button type="button" data-lf-expand onClick={() => update({ min: false })} title="كبّر المربع"
          className="flex items-center gap-2.5 rounded-full border border-[#38a8ff]/35 bg-panel/95 py-2 pe-4 ps-3 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-md transition hover:border-[#38a8ff]/70">
          <LiveDot size={9} />
          <Ticker value={online.total} className="font-serif text-[20px] font-bold leading-none text-ivory" />
          <span className="text-[11.5px] font-bold text-[#8fcbff]">على الموقع</span>
          <span className="h-4 w-px bg-line-lite" />
          <span className="text-[11.5px] text-ivory/55"><span className="font-bold text-ivory/85">{fmtNum(today?.devices || 0)}</span> جهاز النهارده</span>
          <Maximize2 size={12} className="text-ivory/40" />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          style={{ width: tv ? 330 : 280 }}
          className={`relative overflow-hidden rounded-[22px] border border-[#38a8ff]/30 bg-panel/95 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-md ${tv ? 'lf-tv' : ''} ${pos ? 'ring-2 ring-[#38a8ff]/40' : ''}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(56,168,255,0.16),transparent_60%)]" />
          <AnimatePresence>
            <motion.div key={flash} initial={{ opacity: flash ? 0.55 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 1.6 }}
              className="pointer-events-none absolute inset-0 rounded-[22px] ring-2 ring-inset ring-[#38a8ff]" />
          </AnimatePresence>

          <div className="relative p-3.5">
            {/* الهيدر */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[12px] font-bold text-[#8fcbff]">
                <LiveDot size={8} /> على الموقع دلوقتي
              </span>
              <span className="flex items-center gap-0.5 text-ivory/35">
                <span title="اسحبه لأي مكان — بيلزق يمين أو شمال"><GripVertical size={14} /></span>
                <button type="button" data-lf-nodrag data-lf-minimize onClick={() => update({ min: true })} title="صغّره"
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-ivory/[0.08] hover:text-ivory">
                  <Minus size={14} />
                </button>
              </span>
            </div>

            {/* الرقم الكبير */}
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="flex items-end gap-2">
                <Ticker value={online.total} className={`font-serif font-bold leading-none text-ivory ${tv ? 'text-[60px]' : 'text-[48px]'}`} />
                <span className="mb-1 text-[11.5px] text-ivory/45">شخص</span>
              </div>
              <div className="mb-1 flex flex-col items-end gap-1 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#38a8ff]/12 px-2 py-0.5 text-[#8fcbff]"><Users size={11} /> <Ticker value={online.users} /> عميل</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-ivory/[0.07] px-2 py-0.5 text-ivory/60"><Globe size={11} /> <Ticker value={online.visitors} /> زائر</span>
              </div>
            </div>
            <div className="mt-1.5"><Spark points={hist} /></div>

            {/* النهارده */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5" data-lf-nodrag>
              <Stat icon={MonitorSmartphone} label="أجهزة النهارده" accent="text-[#8fcbff]" onClick={() => navigate('/admin/analytics')}>
                {fmtNum(today?.devices || 0)}
                {today?.newDevices ? <span className="ms-1 font-sans text-[10.5px] font-bold text-emerald-bright">+{fmtNum(today.newDevices)} جديد</span> : null}
              </Stat>
              <Stat icon={UserPlus} label="سجّلوا النهارده" accent="text-brass-soft" onClick={() => navigate('/admin/clients')}>
                {fmtNum(today?.signups || 0)}
              </Stat>
              <Stat icon={Receipt} label="طلبات النهارده" onClick={() => navigate('/admin/orders-day?kind=created')}>
                {fmtNum(today?.orders || 0)}
              </Stat>
              <Stat icon={Wallet} label="أرباح النهارده" accent="text-brass-soft" onClick={() => navigate('/admin/orders-day')}>
                <span title={extraRev.join(' + ')}>{fmtMoney(rev.EGP?.total || 0, 'EGP')}</span>
              </Stat>
            </div>
            {extraRev.length > 0 && <p className="mt-1 truncate text-[10.5px] text-ivory/40">+ {extraRev.join(' + ')}</p>}

            {/* العملاء المتصلين */}
            <div className="mt-2.5" data-lf-nodrag>
              {people.length === 0 ? (
                <p className="rounded-xl bg-night/40 px-3 py-2 text-[11px] text-ivory/35">
                  مفيش عميل مسجّل فاتح دلوقتي{online.visitors ? ' — فيه زوار بيتفرجوا' : ''}.
                </p>
              ) : (
                <ul className="space-y-1">
                  <AnimatePresence initial={false}>
                    {people.slice(0, 3).map((u) => (
                      <motion.li key={u.id} layout initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        <button type="button" onClick={() => navigate('/admin/live')}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-ivory/[0.05]">
                          <LiveDot size={6} />
                          <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-ivory/85">{u.name}</span>
                          <span className="max-w-[45%] shrink-0 truncate text-[10.5px] text-ivory/40">{placeLabel(u.path)}</span>
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* تحت */}
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line-lite pt-2 text-[10.5px]" data-lf-nodrag>
              <span className={isError ? 'text-error/80' : 'text-ivory/30'}>
                {isError ? 'مش قادر يحدّث — هيجرّب تاني' : secs == null ? 'بيحمّل...' : secs < 5 ? 'لسه متحدّث' : `اتحدّث من ${secs} ث`}
              </span>
              <button type="button" onClick={() => navigate('/admin/live')}
                className="inline-flex items-center gap-1 font-bold text-[#8fcbff] hover:text-white">
                {people.length > 3 ? `+${people.length - 3} كمان · ` : ''}مباشر <ArrowLeft size={11} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
