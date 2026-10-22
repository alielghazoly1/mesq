// صفحة "التحليلات" — كام جهاز شاف الموقع، إمتى (أكتر ساعة/يوم)، قعدوا قد إيه،
// جم منين، بأنهي أجهزة، دخلوا فين، وكام منهم سجّل ودفع.
// "جهاز" = متصفح مختلف (رقم عشوائي محفوظ عليه) — مش IP: الـ IP بيتشارك بين أجهزة
// كتير وبيتغيّر على نفس الموبايل. البرامج الآلية وأجهزتك إنت مابتتعدّش.
// الأرقام من GET /admin/api/analytics (routes/adminAnalytics.js).
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer, BarChart, Bar, ComposedChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  MonitorSmartphone, Sparkles, RotateCcw, Clock, MousePointerClick, Layers, LogOut, Wifi, TrendingUp, TrendingDown,
  Sun, Moon, Flame, Smartphone, Monitor, Tablet, Globe2, Compass, DoorOpen, Filter, Eye, Info,
} from 'lucide-react';
import { useGetAnalyticsQuery } from '../../store/adminApi.js';
import { Panel, Spinner, Empty, fmtNum, LiveDot } from '../../components/admin/ui.jsx';

const GRID = 'rgba(250,245,236,0.10)';
const AXIS = 'rgba(250,245,236,0.45)';
const RANGES = [
  { id: 'today', label: 'النهارده' }, { id: 'yesterday', label: 'امبارح' },
  { id: '7', label: '7 أيام' }, { id: '30', label: '30 يوم' }, { id: '90', label: '90 يوم' },
];
const WEEKDAYS = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];
const SOURCE = {
  ads: 'إعلان ممول', instagram: 'إنستجرام', facebook: 'فيسبوك', google: 'جوجل', search: 'بحث تاني',
  whatsapp: 'واتساب', tiktok: 'تيك توك', twitter: 'X / تويتر', snapchat: 'سناب شات', invitation: 'من دعوة',
  other: 'مواقع تانية', direct: 'مباشر (كتب اللينك / محفوظ عنده)',
};
const SECTION = {
  home: 'الرئيسية', gallery: 'التصاميم', packages: 'الباقات', checkout: 'الدفع', dashboard: 'لوحة العميل',
  editor: 'المحرر', create: 'إنشاء دعوة', account: 'الحساب', legal: 'الشروط والخصوصية', other: 'صفحات تانية',
};
const KIND = { mobile: 'موبايل', desktop: 'كمبيوتر', tablet: 'تابلت' };
const KIND_ICON = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

const hourLabel = (h) => `${h % 12 || 12} ${h < 12 ? 'ص' : 'م'}`;
const fmtDur = (sec) => {
  const s = Math.max(0, Math.round(sec || 0));
  if (s < 60) return `${s} ث`;
  const m = Math.floor(s / 60); const r = s % 60;
  if (m < 60) return r ? `${m}:${String(r).padStart(2, '0')} د` : `${m} د`;
  return `${Math.floor(m / 60)} س ${m % 60} د`;
};
const shortDay = (k) => { const [, m, d] = String(k).split('-').map(Number); return `${d}/${m}`; };

function Delta({ value, label }) {
  if (value == null) return <span className="text-[11px] text-ivory/35">مفيش مقارنة لسه</span>;
  const up = value >= 0; const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 text-[11.5px] font-bold ${up ? 'text-emerald-bright' : 'text-error'}`}>
      <Icon size={13} /> <span dir="ltr">{value > 0 ? '+' : ''}{value}%</span> <span className="font-normal text-ivory/40">{label}</span>
    </span>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone = 'default', delay = 0, big }) {
  const tones = {
    default: 'border-line-lite bg-panel', blue: 'border-[#38a8ff]/30 bg-[#38a8ff]/[0.07]',
    gold: 'border-brass/35 bg-brass/[0.07]', green: 'border-emerald-bright/30 bg-emerald-bright/[0.07]',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-[12px] font-bold text-ivory/60"><Icon size={15} className="opacity-80" /> {label}</div>
      <div className={`mt-2 font-serif font-bold leading-none text-ivory ${big ? 'text-[40px]' : 'text-[27px]'}`}>{value}</div>
      {sub && <div className="mt-2">{sub}</div>}
    </motion.div>
  );
}

/** ترتيب بالنسب — نفس ستايل باقي اللوحة */
function Bars({ rows, labels, icons, empty = 'لسه مفيش بيانات', unit = 'جهاز' }) {
  const total = rows.reduce((a, r) => a + r.n, 0);
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!total) return <Empty>{empty}</Empty>;
  return (
    <ol className="space-y-3">
      {rows.map((r, i) => {
        const Icon = icons && icons[r.id];
        const p = Math.round((r.n / total) * 1000) / 10;
        return (
          <li key={r.id} data-bar={r.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-ivory/85">
                {Icon && <Icon size={14} className="shrink-0 text-ivory/45" />}
                <span className="truncate">{(labels && labels[r.id]) || r.id}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-serif text-[15px] font-bold text-ivory">{fmtNum(r.n)}</span>
                <span className="text-[10.5px] text-ivory/40">{unit}</span>
                <span className="w-11 text-end text-[11.5px] font-bold text-ivory/55">{p}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ivory/[0.06]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(2, (r.n / max) * 100)}%` }} transition={{ duration: 0.55, delay: i * 0.03 }}
                className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-l from-[#38a8ff] to-[#8fcbff]' : 'bg-gradient-to-l from-emerald to-emerald-bright'}`} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function HourTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-line-lite bg-night px-3 py-2 text-[12px] shadow-xl">
      <div className="mb-0.5 font-bold text-ivory">الساعة {hourLabel(d.h)} – {hourLabel((d.h + 1) % 24)}</div>
      <div className="text-ivory/70">{fmtNum(d.devices)} جهاز{d.avg !== d.devices ? ` · متوسط ${d.avg} في اليوم` : ''}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('today');
  const { data, isLoading, isFetching, isError } = useGetAnalyticsQuery(range, {
    pollingInterval: range === 'today' ? 60000 : 0, skipPollingIfUnfocused: true,
  });
  const multi = data && data.days.length > 1;
  const heatMax = useMemo(() => (data ? Math.max(1, ...data.heat.flat()) : 1), [data]);
  const bestWd = useMemo(() => (data ? [...data.wdTotals].filter((w) => w.days).sort((a, b) => b.devices / b.days - a.devices / a.days)[0] : null), [data]);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <h1 className="font-serif text-[21px] font-bold text-ivory">التحليلات</h1>
        {isError ? <Empty>معرفناش نحمّل التحليلات — جرّب تاني.</Empty> : <Spinner label="بنجمع الأرقام..." />}
      </div>
    );
  }
  const S = data.summary; const P = data.prev;
  const rangeLabel = (RANGES.find((r) => r.id === data.range) || {}).label;
  const hoursData = data.hours.map((h) => ({ ...h, label: hourLabel(h.h) }));

  return (
    <div className="space-y-5" data-analytics-page>
      {/* ===== العنوان + الفترة ===== */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">التحليلات</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">كام جهاز شاف الموقع، إمتى، قعد قد إيه، وجه منين — بتوقيت مصر. أجهزتك إنت والبرامج الآلية مش محسوبين.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-full border border-line-lite bg-panel p-1" data-ranges>
            {RANGES.map((r) => (
              <button key={r.id} type="button" onClick={() => setRange(r.id)} data-range={r.id}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${data.range === r.id ? 'bg-[#38a8ff] text-[#04121f]' : 'text-ivory/65 hover:text-ivory'}`}>
                {r.label}
              </button>
            ))}
          </div>
          {isFetching && <span className="text-[11.5px] text-ivory/40">بيحدّث...</span>}
        </div>
      </div>

      {/* ===== الرقم الأساسي ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#38a8ff]/30 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(56,168,255,0.16),transparent_55%)] bg-panel p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold text-[#8fcbff]">
              <MonitorSmartphone size={15} /> أجهزة شافت الموقع — {rangeLabel}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38a8ff]/12 px-2.5 py-0.5 text-[11px]"><LiveDot size={7} /> {fmtNum(data.live.total)} دلوقتي</span>
            </div>
            <div className="mt-3 font-serif text-[58px] font-bold leading-none text-ivory" data-devices>{fmtNum(S.devices)}</div>
            <div className="mt-2"><Delta value={P.devicesChange} label={P.label} /></div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-bright/12 px-3 py-1.5 font-bold text-emerald-bright"><Sparkles size={13} /> {fmtNum(S.newDevices)} جهاز جديد</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/[0.07] px-3 py-1.5 font-bold text-ivory/70"><RotateCcw size={13} /> {fmtNum(S.returningDevices)} رجع تاني</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/12 px-3 py-1.5 font-bold text-brass-soft">{fmtNum(S.loggedIn)} منهم عملاء مسجّلين</span>
              {multi && <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/[0.07] px-3 py-1.5 font-bold text-ivory/60">≈ {fmtNum(S.perDay)} في اليوم</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-night/40 p-3.5">
              <div className="text-[11.5px] text-ivory/50">أكتر ساعة</div>
              <div className="mt-1 font-serif text-[24px] font-bold text-brass-soft" data-peak>{data.peak ? hourLabel(data.peak.h) : '—'}</div>
              <div className="text-[11px] text-ivory/45">{data.peak ? `${fmtNum(data.peak.devices)} جهاز` : 'لسه مفيش'}</div>
            </div>
            <div className="rounded-xl bg-night/40 p-3.5">
              <div className="text-[11.5px] text-ivory/50">أحسن 3 ساعات تنشر / تعلن فيهم</div>
              <div className="mt-1 font-serif text-[22px] font-bold text-ivory">{data.bestWindow ? `${hourLabel(data.bestWindow.from)} – ${hourLabel(data.bestWindow.to)}` : '—'}</div>
              <div className="text-[11px] text-ivory/45">{data.bestWindow ? `${fmtNum(data.bestWindow.devices)} جهاز في التلات ساعات` : ''}</div>
            </div>
            <div className="rounded-xl bg-night/40 p-3.5">
              <div className="text-[11.5px] text-ivory/50">أهدى ساعة</div>
              <div className="mt-1 font-serif text-[22px] font-bold text-ivory/80">{data.quiet && data.peak ? hourLabel(data.quiet.h) : '—'}</div>
              <div className="text-[11px] text-ivory/45">{data.quiet && data.peak ? `${fmtNum(data.quiet.devices)} جهاز` : ''}</div>
            </div>
            <div className="rounded-xl bg-night/40 p-3.5">
              <div className="text-[11.5px] text-ivory/50">{multi ? 'أزحم يوم في الأسبوع' : 'شبكات مختلفة (IP)'}</div>
              <div className="mt-1 font-serif text-[22px] font-bold text-ivory/80">{multi ? (bestWd && bestWd.devices ? WEEKDAYS[bestWd.wd] : '—') : fmtNum(S.ips)}</div>
              <div className="text-[11px] text-ivory/45">{multi ? (bestWd && bestWd.devices ? 'أكتر يوم الموقع بيتفتح فيه (في المتوسط)' : '') : 'رقم جانبي — الـIP بيتشارك'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== قعدوا قد إيه ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Clock} tone="gold" label="متوسط الوقت على الموقع" value={fmtDur(S.avgSec)} sub={<Delta value={P.avgSecChange} label="" />} delay={0} />
        <Kpi icon={MousePointerClick} label="زيارات" value={fmtNum(S.sessions)} sub={<span className="text-[11.5px] text-ivory/45">متوسط الزيارة {fmtDur(S.avgSessionSec)}</span>} delay={0.04} />
        <Kpi icon={Layers} label="أقسام لكل جهاز" value={S.pagesPerDevice} sub={<span className="text-[11.5px] text-ivory/45">{fmtNum(S.totalHours)} ساعة مشاهدة إجمالي</span>} delay={0.08} />
        <Kpi icon={LogOut} label="مشيوا بسرعة" value={`${S.bounceRate}%`} sub={<span className="text-[11.5px] text-ivory/45">أقل من 40 ثانية وصفحة واحدة</span>} delay={0.12} />
      </div>

      {/* ===== الساعات ===== */}
      <Panel
        title={`الموقع بيتشاف إمتى — ${rangeLabel}`}
        subtitle={multi ? 'كل ساعة: كام جهاز كان فاتح الموقع فيها (مجموع الأيام) — الدهبي = أكتر ساعة' : 'كل ساعة: كام جهاز كان فاتح الموقع فيها — الدهبي = أكتر ساعة'}
      >
        <div data-hours-chart>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hoursData} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" stroke={AXIS} tick={{ fontSize: 10.5, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} interval={1} />
              <YAxis allowDecimals={false} stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} width={44} />
              <Tooltip content={<HourTip />} cursor={{ fill: 'rgba(250,245,236,0.05)' }} />
              <Bar dataKey="devices" name="أجهزة" radius={[5, 5, 0, 0]} maxBarSize={24}>
                {hoursData.map((h) => (
                  <Cell key={h.h} fill={data.peak && h.h === data.peak.h ? '#e6c684' : data.currentHour === h.h ? '#8fcbff' : data.currentHour != null && h.h > data.currentHour ? 'rgba(56,168,255,0.12)' : '#38a8ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-ivory/55">
          <span className="inline-flex items-center gap-1.5"><Flame size={13} className="text-brass-soft" /> الذروة: {data.peak ? `${hourLabel(data.peak.h)} (${fmtNum(data.peak.devices)} جهاز)` : '—'}</span>
          <span className="inline-flex items-center gap-1.5"><Sun size={13} /> الصبح (6 ص – 12 م): {fmtNum(data.hours.slice(6, 12).reduce((a, h) => a + h.devices, 0))}</span>
          <span className="inline-flex items-center gap-1.5"><Sun size={13} className="text-brass-soft" /> بعد الضهر (12 – 6 م): {fmtNum(data.hours.slice(12, 18).reduce((a, h) => a + h.devices, 0))}</span>
          <span className="inline-flex items-center gap-1.5"><Moon size={13} className="text-[#8fcbff]" /> بالليل (6 م – 12 ص): {fmtNum(data.hours.slice(18, 24).reduce((a, h) => a + h.devices, 0))}</span>
          <span className="inline-flex items-center gap-1.5"><Moon size={13} /> آخر الليل (12 – 6 ص): {fmtNum(data.hours.slice(0, 6).reduce((a, h) => a + h.devices, 0))}</span>
        </div>
      </Panel>

      {/* ===== أيام الأسبوع × الساعات ===== */}
      {multi && (
        <Panel title="خريطة الزحمة — أيام الأسبوع × الساعات" subtitle="كل مربع = كام جهاز كان فاتح في اليوم ده والساعة دي. كل ما يغمق كل ما الزحمة أكتر">
          <div className="-mx-2 overflow-x-auto px-2" data-heatmap>
            <div className="min-w-[760px]" dir="ltr">
              <div className="mb-1 grid grid-cols-[64px_repeat(24,minmax(0,1fr))] gap-[3px]">
                <span />
                {Array.from({ length: 24 }, (_, h) => <span key={h} className="text-center text-[9.5px] text-ivory/40">{h % 3 === 0 ? hourLabel(h) : ''}</span>)}
              </div>
              {data.heat.map((row, wd) => (
                <div key={wd} className="mb-[3px] grid grid-cols-[64px_repeat(24,minmax(0,1fr))] gap-[3px]">
                  <span className="text-[11.5px] font-bold text-ivory/60" dir="rtl">{WEEKDAYS[wd]}</span>
                  {row.map((n, h) => (
                    <span key={h} title={`${WEEKDAYS[wd]} ${hourLabel(h)}: ${n} جهاز`}
                      className="h-6 rounded-[4px]"
                      style={{ background: n ? `rgba(56,168,255,${0.12 + 0.88 * (n / heatMax)})` : 'rgba(250,245,236,0.04)' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* ===== يوم بيوم ===== */}
      {multi && (
        <Panel title="يوم بيوم" subtitle="الأجهزة كل يوم والجديدة منها">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.daily} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="day" tickFormatter={shortDay} stroke={AXIS} tick={{ fontSize: 10.5, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={14} />
              <YAxis allowDecimals={false} stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} width={44} />
              <Tooltip
                contentStyle={{ background: '#08130f', border: '1px solid rgba(250,245,236,.12)', borderRadius: 12, fontSize: 12 }}
                labelFormatter={shortDay}
                formatter={(v, name) => [fmtNum(v), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: AXIS }} />
              <Bar dataKey="devices" name="أجهزة" fill="#38a8ff" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="newDevices" name="جديدة" fill="#2f9c80" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {/* ===== جم منين / بأنهي أجهزة ===== */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="جم منين" subtitle="أول مصدر للجهاز في اليوم"><Bars rows={data.sources} labels={SOURCE} icons={{ direct: Compass, ads: Flame, invitation: Eye }} /></Panel>
        <Panel title="نوع الجهاز"><Bars rows={data.kinds} labels={KIND} icons={KIND_ICON} /></Panel>
        <Panel title="نظام التشغيل"><Bars rows={data.oss.map((r) => ({ ...r, id: r.id || 'other' }))} labels={{ other: 'غيره' }} /></Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="أول صفحة دخلها" subtitle="الباب اللي دخلوا منه"><Bars rows={data.entries} labels={SECTION} icons={{ home: DoorOpen }} /></Panel>
        <Panel title="الأقسام اللي اتفتحت" subtitle="كام جهاز دخل كل قسم"><Bars rows={data.pages} labels={SECTION} /></Panel>
        <Panel title="المتصفح" subtitle="إنستجرام/فيسبوك = فتحوا من جوه التطبيق"><Bars rows={data.browsers} icons={{ Chrome: Globe2 }} /></Panel>
      </div>

      {/* ===== قعدوا قد إيه + التحويل ===== */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="قعدوا قد إيه" subtitle="الوقت الفعلي والموقع قدامهم (التاب ظاهر)">
          <Bars rows={data.durations.map((d) => ({ id: d.id, n: d.n }))} labels={Object.fromEntries(data.durations.map((d) => [d.id, d.label]))} />
        </Panel>
        <Panel title="من الشوف للدفع" subtitle={`في ${rangeLabel}`}>
          <div className="space-y-3" data-funnel>
            {[
              { k: 'devices', label: 'أجهزة شافت الموقع', n: data.funnel.devices, w: 100, c: 'from-[#38a8ff] to-[#8fcbff]' },
              { k: 'signups', label: 'سجّلوا حساب', n: data.funnel.signups, w: data.funnel.devices ? Math.max(4, (data.funnel.signups / data.funnel.devices) * 100) : 0, c: 'from-emerald to-emerald-bright', rate: data.funnel.signupRate },
              { k: 'paid', label: 'دفعوا', n: data.funnel.paid, w: data.funnel.devices ? Math.max(4, (data.funnel.paid / data.funnel.devices) * 100) : 0, c: 'from-brass to-brass-soft', rate: data.funnel.paidRate },
            ].map((s) => (
              <div key={s.k}>
                <div className="mb-1 flex items-baseline justify-between text-[13px]">
                  <span className="flex items-center gap-1.5 font-bold text-ivory/85"><Filter size={13} className="text-ivory/40" /> {s.label}</span>
                  <span><b className="font-serif text-[17px] text-ivory">{fmtNum(s.n)}</b>{s.rate != null && <span className="ms-2 text-[11.5px] font-bold text-ivory/50">{s.rate}% من الأجهزة</span>}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-ivory/[0.06]"><div className={`h-full rounded-full bg-gradient-to-l ${s.c}`} style={{ width: `${s.w}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-line-lite bg-night/40 p-3.5 text-[12.5px] text-ivory/70">
            <div className="flex items-center gap-2 font-bold text-ivory/85"><Eye size={14} /> ضيوف الدعوات (صفحات الدعوات نفسها)</div>
            <div className="mt-1.5">{fmtNum(data.guests.views)} فتحة دعوة · {fmtNum(data.guests.uniques)} ضيف مختلف — دول بيتعدّوا لوحدهم ومش داخلين في أجهزة الموقع فوق.</div>
          </div>
        </Panel>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-line-lite bg-panel/60 p-3.5 text-[11.5px] leading-relaxed text-ivory/45">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          "جهاز" = متصفح مختلف (رقم عشوائي محفوظ عليه) — أدق من الـIP: الـIP الواحد بيتشارك بين كل اللي على نفس الواي فاي أو شبكة الموبايل وبيتغيّر على نفس الموبايل، فبنعرضه كرقم جانبي بس ({fmtNum(S.ips)} شبكة).
          الوقت بيتحسب والموقع ظاهر قدامهم بس. البرامج الآلية وأجهزتك إنت (وإنت داخل اللوحة) مش محسوبين.
          {data.since ? ` العدّ بدأ ${data.since}.` : ' العدّ بدأ من النهارده.'} {fmtNum(S.everDevices)} جهاز شاف الموقع من ساعتها. <Wifi size={11} className="inline" />
        </span>
      </div>
    </div>
  );
}
