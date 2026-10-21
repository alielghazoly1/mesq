// خط صغير بيوضّح اتجاه رقم (آخر كام يوم) — SVG خفيف من غير مكتبة
export default function Sparkline({ values, color = '#c9a24a', height = 34, fill = true }) {
  const v = (values || []).map((x) => Number(x) || 0);
  if (v.length < 2) return <div style={{ height }} />;
  const max = Math.max(1, ...v);
  const w = 100;
  const step = w / (v.length - 1);
  const pts = v.map((x, i) => [i * step, height - 3 - (x / max) * (height - 8)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const area = `${line} L${w},${height} L0,${height} Z`;
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
