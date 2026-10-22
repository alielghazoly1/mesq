// صفحة الأرباح — حساب المكسب الحقيقي شهر بشهر (بتوقيت مصر):
//   الإيرادات (الطلبات المفعّلة) − المصاريف = صافي الربح
// المصاريف 3 أنواع: الإعلانات (تلقائي من صفحة الإعلانات)، عمولات المسوّقين
// المدفوعة (تلقائي)، ومصاريف المالك اليدوية (مرة واحدة أو شهرية).
// كل العملات بتتحوّل لجنيه بأسعار الصرف اللي المالك بيحددها في نفس الصفحة.
// الحسابات كلها في السيرفر (utils/finance.js) — الصفحة بتعرض بس.
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Wallet, MessageCircle, Crown, TrendingUp, TrendingDown, Receipt, Users, Megaphone, Share2,
  Plus, Pencil, Trash2, PauseCircle, PlayCircle, Repeat, Coins, CalendarDays, Sparkles, ArrowLeft,
} from 'lucide-react';
import {
  useGetRevenueQuery, useGetFinanceQuery, useSaveFxRatesMutation,
  useUpdateExpenseMutation, useDeleteExpenseMutation,
} from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import {
  Panel, Badge, Btn, Table, Row, Cell, Spinner, Empty, fmtDate, fmtNum, fmtMoney,
} from '../../components/admin/ui.jsx';
import { countryName, waLink } from './format.js';
import ClientDrawer from './ClientDrawer.jsx';
import ExpenseForm from './ExpenseForm.jsx';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const CUR_LABEL = { EGP: 'جنيه', USD: 'دولار', SAR: 'ريال', EUR: 'يورو' };
const GRID = 'rgba(250,245,236,0.10)';
const AXIS = 'rgba(250,245,236,0.40)';

const monthLabel = (k) => {
  if (!k || k === 'all') return 'كل الوقت';
  const [y, m] = k.split('-').map(Number);
  return `${MONTHS_AR[m - 1]} ${y}`;
};
const shortMonth = (k) => { const [, m] = String(k).split('-').map(Number); return MONTHS_AR[(m || 1) - 1]; };
/** مبلغ بالجنيه (مقرّب) — والسالب بعلامة واضحة */
const egp = (n) => {
  const v = Math.round(Number(n) || 0);
  return `${v < 0 ? '−' : ''}${fmtNum(Math.abs(v))} ج.م`;
};

/** نسبة التغيير عن الشهر اللي فات — أخضر لو أحسن (للمصاريف العكس) */
function Delta({ value, inverse = false, label = 'عن الشهر اللي فات' }) {
  if (value == null) return <span className="text-[11px] text-ivory/35">مفيش مقارنة</span>;
  const good = inverse ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-bold ${good ? 'text-emerald-bright' : 'text-error'}`}>
      <Icon size={13} /> <span dir="ltr">{value > 0 ? '+' : ''}{value}%</span>
      <span className="font-normal text-ivory/40">{label}</span>
    </span>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-line-lite bg-night px-3 py-2 text-[12px] shadow-xl">
      <div className="mb-1 font-bold text-ivory/80">{/^\d{4}-\d{2}$/.test(label) ? monthLabel(label) : label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-ivory/70">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <b className="text-ivory">{egp(p.value)}</b>
        </div>
      ))}
    </div>
  );
}

/** ترتيب بالفلوس (المصادر/الباقات/الدول) — شريط على قد المبلغ + نسبته */
function MoneyBars({ rows, empty = 'لسه مفيش', labelOf = (r) => r.label, icons }) {
  const total = rows.reduce((a, r) => a + (r.eq || 0), 0);
  const max = Math.max(1, ...rows.map((r) => r.eq || 0));
  if (!rows.length || !total) return <Empty>{empty}</Empty>;
  return (
    <ol className="space-y-3.5">
      {rows.map((r, i) => {
        const pct = total ? Math.round((r.eq / total) * 1000) / 10 : 0;
        const Icon = icons && icons[r.id];
        return (
          <li key={r.id || i} data-money-row={r.id} className={!r.eq ? 'opacity-50' : ''}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-[13.5px] font-bold text-ivory/90">
                {Icon && <Icon size={14} className="shrink-0 text-ivory/50" />}
                <span className="truncate">{labelOf(r)}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-serif text-[16px] font-bold text-ivory">{egp(r.eq)}</span>
                <span className="w-12 text-end text-[12px] font-bold text-ivory/55">{pct}%</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ivory/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${r.eq ? Math.max(2, (r.eq / max) * 100) : 0}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-l from-brass to-brass-soft' : 'bg-gradient-to-l from-emerald to-emerald-bright'}`}
              />
            </div>
            <div className="mt-1 text-[11.5px] text-ivory/45">
              {fmtNum(r.orders)} طلب · {fmtNum(r.payers)} عميل
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ===== أسعار الصرف =====
function RatesPanel({ rates }) {
  const [v, setV] = useState({ USD: '', SAR: '', EUR: '' });
  const [save, { isLoading }] = useSaveFxRatesMutation();
  const [msg, setMsg] = useState('');
  useEffect(() => { if (rates) setV({ USD: String(rates.USD), SAR: String(rates.SAR), EUR: String(rates.EUR) }); }, [rates]);
  async function submit() {
    setMsg('');
    try { await save({ USD: Number(v.USD), SAR: Number(v.SAR), EUR: Number(v.EUR) }).unwrap(); setMsg('اتحفظ ✓ — كل الأرقام اتحسبت من جديد'); }
    catch (ex) { setMsg(ex?.data?.error || 'معرفناش نحفظ'); }
  }
  return (
    <Panel title="أسعار الصرف" subtitle="بيها بنحوّل الدولار والريال واليورو لجنيه عشان صافي الربح يبقى رقم واحد">
      <div className="grid gap-3 sm:grid-cols-3" data-rates>
        {['USD', 'SAR', 'EUR'].map((c) => (
          <label key={c} className="flex flex-col gap-1.5">
            <span className="text-[12px] text-ivory/55">1 {CUR_LABEL[c]} = كام جنيه؟</span>
            <input
              name={`rate-${c}`} dir="ltr" inputMode="decimal" value={v[c]}
              onChange={(e) => setV((x) => ({ ...x, [c]: e.target.value }))}
              className="rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[13.5px] text-ivory focus:border-brass/60 focus:outline-none"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn tone="gold" loading={isLoading} onClick={submit} icon={Coins}>احفظ الأسعار</Btn>
        {msg && <span className="text-[12.5px] text-ivory/60">{msg}</span>}
      </div>
    </Panel>
  );
}

// ===== مين دفع (في الفترة المختارة) =====
function Payers({ month }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const { data, isLoading, isFetching } = useGetRevenueQuery({ page, month });
  const flags = useRef({ hasMore: false, isFetching: true });
  flags.current = { hasMore: !!data?.hasMore, isFetching };
  const ioRef = useRef(null);
  useEffect(() => { setPage(1); setItems([]); }, [month]);
  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      if (data.page === 1) return data.customers;
      const seen = new Set(prev.map((c) => c.userId));
      return [...prev, ...data.customers.filter((c) => !seen.has(c.userId))];
    });
  }, [data]);
  const loadMore = () => { if (flags.current.hasMore && !flags.current.isFetching) setPage((p) => p + 1); };
  const sentinelRef = useCallback((node) => {
    if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null; }
    if (!node) return;
    ioRef.current = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadMore(); }, { rootMargin: '600px 0px' });
    ioRef.current.observe(node);
  }, []);
  return (
    <Panel title="مين دفع" subtitle={`${month === 'all' ? 'كل الوقت' : monthLabel(month)}${data ? ` · ${fmtNum(data.totalPayers)} عميل` : ''}${isFetching ? ' · بيحدّث...' : ''}`}>
      {isLoading && items.length === 0 ? <Spinner /> : items.length === 0 ? (
        <Empty>محدش دفع في الفترة دي.</Empty>
      ) : (
        <>
          <Table head={['العميل', 'الباقة', 'دفع (جنيه)', 'دفع (دولار / ريال / يورو)', 'طلبات', 'آخر دفعة']}>
            {items.map((c) => (
              <Row key={c.userId} onClick={() => dispatch(openUser(c.userId))}>
                <Cell>
                  <span className="font-bold text-ivory">{c.name}</span>
                  <div className="text-[11px] text-ivory/40">{c.email} · {countryName(c.country)}</div>
                  {c.phone && (
                    <a href={waLink(c.phone, c.country)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-bright hover:underline" dir="ltr">
                      <MessageCircle size={11} /> {c.phone}
                    </a>
                  )}
                </Cell>
                <Cell>{c.packageName ? <Badge tone="gold" icon={Crown}>{c.packageName}</Badge> : <span className="text-ivory/35">—</span>}</Cell>
                <Cell className="whitespace-nowrap font-bold text-brass-soft">{c.egp ? fmtMoney(c.egp, 'EGP') : <span className="text-ivory/25">—</span>}</Cell>
                <Cell className="whitespace-nowrap font-bold text-brass-soft">
                  {c.usd || c.sar || c.eur
                    ? [c.usd ? fmtMoney(c.usd, 'USD') : '', c.sar ? fmtMoney(c.sar, 'SAR') : '', c.eur ? fmtMoney(c.eur, 'EUR') : ''].filter(Boolean).join(' · ')
                    : <span className="text-ivory/25">—</span>}
                </Cell>
                <Cell className="text-ivory/55">{fmtNum(c.orders)}</Cell>
                <Cell className="whitespace-nowrap text-ivory/45">{c.lastPaidAt ? fmtDate(c.lastPaidAt) : 'لسه'}</Cell>
              </Row>
            ))}
          </Table>
          <div ref={sentinelRef} aria-hidden="true" className="h-1" />
          {isFetching && items.length > 0 && <p className="py-2 text-center text-[12px] text-ivory/40">بيحمّل المزيد...</p>}
          {!data?.hasMore && items.length > 0 && <p className="py-2 text-center text-[12px] text-ivory/30">دي كل العملاء الدافعين في الفترة دي</p>}
        </>
      )}
    </Panel>
  );
}

export default function EarningsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const [month, setMonth] = useState('');
  const { data, isLoading, isFetching, isError } = useGetFinanceQuery(month);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const formRef = useRef(null);
  const sel = data?.month || month || '';

  const trend = useMemo(() => (data?.trend || []).map((t) => ({ ...t, label: t.month })), [data]);
  const daily = useMemo(() => (data?.daily || []).map((d) => ({ ...d, day: Number(d.date.slice(8)) })), [data]);

  function startEdit(item) {
    setEditing(item); setShowForm(true);
    setTimeout(() => formRef.current && formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }
  async function remove(item) {
    if (!window.confirm(`تمسح "${item.title}"؟ ${item.recurring ? 'هيتشال من كل الشهور اللي اتحسب فيها.' : ''}`)) return;
    try { await deleteExpense(item.id).unwrap(); } catch (ex) { window.alert(ex?.data?.error || 'معرفناش نمسح'); }
  }
  async function toggleStop(item) {
    try { await updateExpense({ id: item.id, stop: item.active }).unwrap(); } catch (ex) { window.alert(ex?.data?.error || 'معرفناش نحفظ'); }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <h1 className="font-serif text-[21px] font-bold text-ivory">الأرباح</h1>
        {isError ? <Empty>معرفناش نحمّل الأرقام — جرّب تاني.</Empty> : <Spinner label="بنحسب الأرباح..." />}
      </div>
    );
  }

  const r = data.revenue; const ex = data.expenses; const net = data.net;
  const isAll = sel === 'all'; const isNow = sel === data.nowMonth;
  const positive = net >= 0;
  const expRows = [
    ...ex.ads.map((a) => ({ ...a, group: 'ads' })),
    ...ex.commissions.map((c) => ({ ...c, group: 'commissions' })),
    ...ex.manual.map((m) => ({ ...m, group: 'manual' })),
  ];

  return (
    <div className="space-y-5" data-finance-page>
      {/* ===== العنوان + اختيار الشهر ===== */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">الأرباح</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            الإيرادات − المصاريف = صافي الربح. الإعلانات وعمولات المسوّقين بيتخصموا لوحدهم.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-line-lite bg-panel p-1">
            <button type="button" onClick={() => setMonth(data.nowMonth)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${isNow ? 'bg-brass text-[#241608]' : 'text-ivory/65 hover:text-ivory'}`}>الشهر ده</button>
            <button type="button" onClick={() => setMonth('all')}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${isAll ? 'bg-brass text-[#241608]' : 'text-ivory/65 hover:text-ivory'}`}>كل الوقت</button>
          </div>
          <label className="flex items-center gap-2 rounded-full border border-line-lite bg-panel px-3 py-1.5 text-[12.5px] text-ivory/70">
            <CalendarDays size={14} className="text-brass-soft" />
            <select name="month" value={sel} onChange={(e) => setMonth(e.target.value)} className="bg-transparent font-bold text-ivory focus:outline-none" data-month-picker>
              {data.months.map((k) => <option key={k} value={k} className="bg-night">{monthLabel(k)}</option>)}
              <option value="all" className="bg-night">كل الوقت</option>
            </select>
          </label>
          {isFetching && <span className="text-[11.5px] text-ivory/40">بيحدّث...</span>}
        </div>
      </div>

      {/* ===== الحساب الختامي ===== */}
      <section
        className={`relative overflow-hidden rounded-2xl border p-5 ${positive ? 'border-emerald-bright/30 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(47,156,128,0.16),transparent_55%)]' : 'border-error/35 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(217,97,79,0.14),transparent_55%)]'} bg-panel`}
        data-pnl
      >
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold text-ivory/60">
          <Sparkles size={14} className="text-brass-soft" /> الحساب الختامي — {monthLabel(sel)}
          {isNow && <span className="rounded-full bg-ivory/[0.07] px-2 py-0.5 text-[10.5px] text-ivory/50">لحد النهارده</span>}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1.15fr] lg:items-center">
          <div>
            <div className="text-[12px] text-ivory/50">الإيرادات</div>
            <div className="mt-1 font-serif text-[30px] font-bold leading-none text-ivory" data-revenue>{egp(r.eq)}</div>
            <div className="mt-1.5">{data.prev ? <Delta value={data.prev.revenueChange} /> : <span className="text-[11px] text-ivory/35">{fmtNum(r.orders)} طلب مفعّل</span>}</div>
          </div>
          <div className="hidden font-serif text-[28px] text-ivory/25 lg:block">−</div>
          <div>
            <div className="text-[12px] text-ivory/50">المصاريف</div>
            <div className="mt-1 font-serif text-[30px] font-bold leading-none text-[#e8a597]" data-expenses>{egp(ex.eq)}</div>
            <div className="mt-1.5">{data.prev ? <Delta value={data.prev.expensesChange} inverse /> : <span className="text-[11px] text-ivory/35">إعلانات + عمولات + مصاريف</span>}</div>
          </div>
          <div className="hidden font-serif text-[28px] text-ivory/25 lg:block">=</div>
          <div className={`rounded-2xl border px-4 py-3.5 ${positive ? 'border-emerald-bright/40 bg-emerald-bright/[0.10]' : 'border-error/45 bg-error/[0.10]'}`}>
            <div className="text-[12px] font-bold text-ivory/70">صافي الربح</div>
            <div className={`mt-1 font-serif text-[36px] font-bold leading-none ${positive ? 'text-emerald-bright' : 'text-error'}`} data-net>{egp(net)}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {data.margin != null && <span className="rounded-full bg-ivory/[0.07] px-2 py-0.5 text-[11.5px] font-bold text-ivory/65">هامش الربح <span dir="ltr">{data.margin < 0 ? '−' : ''}{Math.abs(data.margin)}%</span></span>}
              {data.prev && <Delta value={data.prev.netChange} />}
            </div>
          </div>
        </div>
        {/* تفصيل المصاريف في سطر */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11.5px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2a33a]/12 px-3 py-1.5 font-bold text-[#f6bd6a]"><Megaphone size={12} /> إعلانات {egp(ex.totals.ads)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9c7fc9]/15 px-3 py-1.5 font-bold text-[#c3aef0]"><Share2 size={12} /> عمولات مسوّقين {egp(ex.totals.commissions)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/[0.07] px-3 py-1.5 font-bold text-ivory/65"><Receipt size={12} /> مصاريف تانية {egp(ex.totals.manual)}</span>
        </div>
      </section>

      {/* ===== أرقام سريعة ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line-lite bg-panel p-4">
          <div className="flex items-center justify-between"><Receipt size={16} className="text-ivory/50" />{data.prev && <Delta value={data.prev.ordersChange} label="" />}</div>
          <div className="mt-2.5 font-serif text-[27px] font-bold leading-none text-ivory">{fmtNum(r.orders)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/55">طلب مفعّل</div>
        </div>
        <div className="rounded-2xl border border-line-lite bg-panel p-4">
          <Users size={16} className="text-ivory/50" />
          <div className="mt-2.5 font-serif text-[27px] font-bold leading-none text-ivory">{fmtNum(r.payers)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/55">عميل دفع · <span className="text-emerald-bright">{fmtNum(r.newPayers)} جديد</span> · {fmtNum(r.returningPayers)} جدّد</div>
        </div>
        <div className="rounded-2xl border border-line-lite bg-panel p-4">
          <Wallet size={16} className="text-ivory/50" />
          <div className="mt-2.5 font-serif text-[27px] font-bold leading-none text-ivory">{egp(r.avgOrder)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/55">متوسط الطلب الواحد</div>
        </div>
        <div className="rounded-2xl border border-brass/35 bg-brass/[0.07] p-4">
          <TrendingUp size={16} className="text-brass-soft/80" />
          {data.forecast ? (
            <>
              <div className="mt-2.5 font-serif text-[27px] font-bold leading-none text-brass-soft">{egp(data.forecast.revenue)}</div>
              <div className="mt-1.5 text-[12px] text-brass-soft/70">متوقّع آخر الشهر (بمعدل {egp(data.forecast.perDay)} في اليوم)</div>
            </>
          ) : (
            <>
              <div className="mt-2.5 font-serif text-[27px] font-bold leading-none text-brass-soft">{egp(r.eq && r.payers ? r.eq / r.payers : 0)}</div>
              <div className="mt-1.5 text-[12px] text-brass-soft/70">متوسط اللي دفعه العميل</div>
            </>
          )}
        </div>
      </div>

      {/* الفلوس بعملتها الأصلية */}
      <div className="flex flex-wrap gap-2" data-by-currency>
        {Object.entries(r.byCurrency).filter(([, v]) => v.total > 0).map(([c, v]) => (
          <span key={c} className="inline-flex items-center gap-2 rounded-xl border border-line-lite bg-panel px-3 py-2 text-[12.5px]">
            <b className="text-brass-soft">{fmtMoney(v.total, c)}</b>
            <span className="text-ivory/45">{fmtNum(v.orders)} طلب{c !== 'EGP' ? ` · ≈ ${egp(v.eq)}` : ''}</span>
          </span>
        ))}
      </div>

      {/* ===== الرسوم ===== */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="آخر 12 شهر" subtitle="الإيرادات والمصاريف وصافي الربح كل شهر — دوس على أي شهر تفتحه">
          <div data-trend-chart>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={trend} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
                onClick={(e) => { if (e && e.activeLabel) setMonth(e.activeLabel); }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tickFormatter={shortMonth} stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} interval={0} angle={-30} textAnchor="end" height={44} />
                <YAxis stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} width={56} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : v)} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(250,245,236,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: AXIS }} />
                <Bar dataKey="revenue" name="الإيرادات" fill="#2f9c80" radius={[4, 4, 0, 0]} maxBarSize={22} cursor="pointer" />
                <Bar dataKey="expenses" name="المصاريف" fill="#c9788a" radius={[4, 4, 0, 0]} maxBarSize={22} cursor="pointer" />
                <Line dataKey="net" name="صافي الربح" stroke="#e6c684" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        {!isAll ? (
          <Panel title={`يوم بيوم — ${monthLabel(sel)}`} subtitle="الإيرادات المفعّلة كل يوم (بالجنيه)">
            {daily.some((d) => d.revenue) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={daily} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="day" stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={8} />
                  <YAxis stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} width={56} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(250,245,236,0.05)' }} />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#c9a24a" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty>مفيش إيرادات في الشهر ده لسه.</Empty>}
          </Panel>
        ) : (
          <Panel title="الشهور" subtitle="صافي الربح كل شهر">
            <div className="space-y-2">
              {[...trend].reverse().map((t) => (
                <button key={t.month} type="button" onClick={() => setMonth(t.month)}
                  className="flex w-full items-center justify-between rounded-xl border border-line-lite bg-night/40 px-3.5 py-2.5 text-[12.5px] transition hover:border-brass/40">
                  <span className="font-bold text-ivory/85">{monthLabel(t.month)}</span>
                  <span className="text-ivory/45">{egp(t.revenue)} − {egp(t.expenses)}</span>
                  <b className={t.net >= 0 ? 'text-emerald-bright' : 'text-error'}>{egp(t.net)}</b>
                </button>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {/* ===== الفلوس جت منين ===== */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="جت منين" subtitle="إعلان / مسوّق / دخل لوحده">
          <MoneyBars rows={data.bySource} icons={{ ads: Megaphone, ugc: Share2, direct: Users }} empty="مفيش إيرادات في الفترة دي." />
        </Panel>
        <Panel title="الباقات" subtitle="كل باقة جابت كام">
          <MoneyBars rows={data.byPackage} empty="مفيش باقات اتباعت في الفترة دي." />
        </Panel>
        <Panel title="الدول" subtitle="الفلوس حسب دولة العميل">
          <MoneyBars rows={data.byCountry} labelOf={(row) => countryName(row.id) || 'مش معروف'} empty="مفيش إيرادات في الفترة دي." />
        </Panel>
      </div>

      {/* ===== الإعلانات: صرفت كام وجابت كام ===== */}
      <Panel
        title="الإعلانات — صرفت كام وجابت كام"
        subtitle="الميزانية من صفحة الإعلانات (بتتخصم في شهر بداية الحملة)، والإيرادات من الناس اللي سجّلوا من لينكها"
        action={<Btn size="sm" onClick={() => navigate('/admin/campaigns')} icon={ArrowLeft}>صفحة الإعلانات</Btn>}
      >
        {data.byCampaign.length === 0 ? <Empty>مفيش إعلانات في الفترة دي.</Empty> : (
          <Table head={['الحملة', 'اتصرف', 'جابت', 'المكسب', 'العائد', 'تكلفة العميل الدافع']}>
            {data.byCampaign.map((c) => (
              <Row key={c.code}>
                <Cell><span className="font-bold text-ivory">{c.name}</span><div className="text-[11px] text-ivory/35" dir="ltr">/go/{c.code}</div></Cell>
                <Cell className="whitespace-nowrap text-[#e8a597]">{egp(c.spend)}</Cell>
                <Cell className="whitespace-nowrap text-ivory/85">{egp(c.revenue)} <span className="text-[11px] text-ivory/40">· {fmtNum(c.payers)} دفعوا</span></Cell>
                <Cell className={`whitespace-nowrap font-bold ${c.profit >= 0 ? 'text-emerald-bright' : 'text-error'}`}>{egp(c.profit)}</Cell>
                <Cell className="whitespace-nowrap">{c.roas != null ? <span dir="ltr">{c.roas}×</span> : '—'}</Cell>
                <Cell className="whitespace-nowrap text-ivory/60">{c.costPerPayer != null ? egp(c.costPerPayer) : '—'}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      {/* ===== المصاريف ===== */}
      <Panel
        title={`المصاريف — ${monthLabel(sel)}`}
        subtitle={`${egp(ex.eq)} · الإعلانات والعمولات تلقائي، والباقي بتسجّله إنت`}
        action={(
          <span className="flex gap-2">
            <Btn size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/expenses')}>صفحة المصاريف</Btn>
            {!showForm && <Btn tone="gold" size="sm" icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>سجّل مصروف</Btn>}
          </span>
        )}
      >
        <div ref={formRef}>
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                <ExpenseForm categories={data.categories} editing={editing} onDone={() => { setEditing(null); setShowForm(false); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {ex.byCategory.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {ex.byCategory.map((c) => (
              <span key={c.id} className="rounded-full bg-ivory/[0.06] px-3 py-1 text-[11.5px] text-ivory/65">{c.label}: <b className="text-ivory/90">{egp(c.eq)}</b></span>
            ))}
          </div>
        )}
        {expRows.length === 0 ? <Empty>مفيش مصاريف في الفترة دي.</Empty> : (
          <ul className="divide-y divide-line-lite" data-expense-list>
            {expRows.map((e) => (
              <li key={`${e.group}-${e.id}`} className="flex flex-wrap items-center gap-3 py-3" data-expense-row={e.group}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${e.group === 'ads' ? 'bg-[#f2a33a]/15 text-[#f6bd6a]' : e.group === 'commissions' ? 'bg-[#9c7fc9]/18 text-[#c3aef0]' : 'bg-ivory/[0.07] text-ivory/60'}`}>
                  {e.group === 'ads' ? <Megaphone size={16} /> : e.group === 'commissions' ? <Share2 size={16} /> : e.recurring ? <Repeat size={16} /> : <Receipt size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-bold text-ivory">
                    {e.group === 'commissions' ? `عمولة: ${e.title}` : e.title}
                    {e.group !== 'manual' && <Badge tone="muted">تلقائي</Badge>}
                    {e.group === 'manual' && e.recurring && <Badge tone="gold">شهري{e.months > 1 ? ` × ${e.months}` : ''}</Badge>}
                  </span>
                  <span className="block text-[11.5px] text-ivory/45">
                    {e.group === 'ads' ? `إعلان${e.platform ? ` ${e.platform}` : ''} · بدأ ${fmtDate(e.date)}`
                      : e.group === 'commissions' ? `اتدفعت ${fmtDate(e.date)}`
                        : `${(data.categories.find((c) => c.id === e.category) || {}).label || ''}${e.recurring ? '' : ` · ${fmtDate(e.date)}`}${e.note ? ` · ${e.note}` : ''}`}
                  </span>
                </span>
                <span className="text-end">
                  <b className="block font-serif text-[16px] text-[#e8a597]">{egp(e.eq)}</b>
                  {e.currency !== 'EGP' && <span className="text-[11px] text-ivory/40">{fmtMoney(e.group === 'manual' ? e.total || e.amount : e.amount, e.currency)}</span>}
                </span>
                {e.group === 'manual' && (() => {
                  const item = data.expenseItems.find((x) => x.id === e.id);
                  return item ? (
                    <span className="flex gap-1">
                      <button type="button" title="عدّل" onClick={() => startEdit(item)} className="rounded-lg p-1.5 text-ivory/45 hover:bg-ivory/10 hover:text-ivory"><Pencil size={14} /></button>
                      <button type="button" title="امسح" onClick={() => remove(item)} className="rounded-lg p-1.5 text-ivory/45 hover:bg-error/15 hover:text-error" data-delete-expense><Trash2 size={14} /></button>
                    </span>
                  ) : null;
                })()}
                {e.group === 'ads' && (
                  <button type="button" onClick={() => navigate('/admin/campaigns')} className="text-[11.5px] font-bold text-ivory/45 hover:text-brass-soft">عدّل الميزانية ←</button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* المصاريف الشهرية الثابتة — توقيف/تشغيل */}
        {data.expenseItems.some((x) => x.recurring) && (
          <div className="mt-5 rounded-2xl border border-line-lite bg-night/30 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ivory/80"><Repeat size={14} className="text-brass-soft" /> المصاريف الشهرية الثابتة</h3>
            <ul className="space-y-2">
              {data.expenseItems.filter((x) => x.recurring).map((x) => (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]" data-recurring={x.active ? 'on' : 'off'}>
                  <span className="text-ivory/80">
                    <b>{x.title}</b> — {fmtMoney(x.amount, x.currency)} في الشهر
                    <span className="text-ivory/40"> · من {monthLabel(`${new Date(x.date).getFullYear()}-${String(new Date(x.date).getMonth() + 1).padStart(2, '0')}`)}{x.endedAt ? ` لحد ${fmtDate(x.endedAt)}` : ''}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {x.active ? <Badge tone="ok">شغال</Badge> : <Badge tone="muted">واقف</Badge>}
                    <Btn size="sm" icon={x.active ? PauseCircle : PlayCircle} onClick={() => toggleStop(x)}>{x.active ? 'وقّفه' : 'شغّله تاني'}</Btn>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Payers month={sel || 'all'} />

      <RatesPanel rates={data.rates} />

      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
      {openUserId && (
        <button type="button" aria-label="اقفل" onClick={() => dispatch(closeUser())} className="fixed inset-0 z-40 bg-black/55" />
      )}
    </div>
  );
}
