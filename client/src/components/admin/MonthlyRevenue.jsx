// الأرباح شهر بشهر — كل شهر لوحده بتوقيت مصر، الجنيه والدولار منفصلين
// (مينفعش يتجمعوا في رقم واحد). رسم أعمدة للعملة المختارة + جدول فيه كل
// شهر بأرقامه ونسبة النمو عن الشهر اللي قبله.
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGetRevenueMonthlyQuery } from '../../store/adminApi.js';
import { Panel, Tabs, Spinner, Empty, fmtNum, fmtMoney } from './ui.jsx';

const RANGES = [
  { value: 6, label: '6 شهور' },
  { value: 12, label: 'سنة' },
  { value: 24, label: 'سنتين' },
];
const CURRENCIES = [
  { value: 'egp', label: 'بالجنيه' },
  { value: 'usd', label: 'بالدولار' },
];

const GRID = 'rgba(250,245,236,0.10)';
const AXIS = 'rgba(250,245,236,0.40)';

/** "2026-10" ← "أكتوبر 2026" / "أكتوبر" (قصير للمحور) */
function monthName(key, withYear) {
  const [y, m] = String(key).split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 15));
  return d.toLocaleDateString('ar-EG-u-nu-latn', {
    month: 'long', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC',
  });
}

function growth(cur, prev) {
  if (!prev && !cur) return null;
  if (!prev) return { pct: null, up: true };
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { pct, up: pct >= 0 };
}

function ChartTip({ active, payload, currency }) {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0].payload;
  return (
    <div className="rounded-xl border border-line-lite bg-night px-3 py-2 text-[12px] shadow-xl">
      <div className="mb-1 font-bold text-ivory/85">{monthName(r.month, true)}</div>
      <div className="text-ivory/70">الأرباح: <b className="text-ivory">{fmtMoney(r[currency], currency === 'egp' ? 'EGP' : 'USD')}</b></div>
      <div className="text-ivory/55">{r[currency === 'egp' ? 'egpOrders' : 'usdOrders']} طلب · {r.signups} تسجيل</div>
    </div>
  );
}

export default function MonthlyRevenue() {
  const [months, setMonths] = useState(12);
  const [currency, setCurrency] = useState('egp');
  const { data, isLoading, isFetching } = useGetRevenueMonthlyQuery(months);
  const cur = currency === 'egp' ? 'EGP' : 'USD';

  const rows = useMemo(() => (data?.months || []).map((r, i, arr) => ({
    ...r,
    label: monthName(r.month, false),
    g: i > 0 ? growth(r[currency], arr[i - 1][currency]) : null,
  })), [data, currency]);

  const best = rows.reduce((b, r) => (r[currency] > (b ? b[currency] : 0) ? r : b), null);
  const thisMonth = rows[rows.length - 1];

  return (
    <Panel
      title="الأرباح شهر بشهر"
      subtitle={`كل شهر لوحده بتوقيت مصر — الطلبات المفعّلة بس${isFetching ? ' · بيحدّث...' : ''}`}
      action={(
        <div className="flex flex-wrap gap-2">
          <Tabs value={currency} onChange={setCurrency} options={CURRENCIES} />
          <Tabs value={months} onChange={setMonths} options={RANGES} />
        </div>
      )}
    >
      {isLoading ? <Spinner /> : !rows.length ? <Empty>مفيش بيانات.</Empty> : (
        <>
          {/* ملخص سريع */}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brass/30 bg-brass/[0.07] px-4 py-3">
              <div className="text-[11.5px] text-ivory/50">الشهر ده ({monthName(thisMonth.month, false)})</div>
              <div className="mt-1 font-serif text-[22px] font-bold text-brass-soft">{fmtMoney(thisMonth[currency], cur)}</div>
              {thisMonth.g && thisMonth.g.pct !== null && (
                <div className={`mt-0.5 inline-flex items-center gap-1 text-[11.5px] font-bold ${thisMonth.g.up ? 'text-ok' : 'text-error'}`}>
                  {thisMonth.g.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {thisMonth.g.pct > 0 ? '+' : ''}{thisMonth.g.pct}% عن الشهر اللي فات
                  <span className="font-normal text-ivory/40">(لسه الشهر مخلصش)</span>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-line-lite bg-night/40 px-4 py-3">
              <div className="text-[11.5px] text-ivory/50">إجمالي الفترة</div>
              <div className="mt-1 font-serif text-[22px] font-bold text-ivory">{fmtMoney(data.totals[currency], cur)}</div>
              <div className="mt-0.5 text-[11.5px] text-ivory/45">{fmtNum(data.totals.orders)} طلب · {fmtNum(data.totals.signups)} تسجيل</div>
            </div>
            <div className="rounded-xl border border-line-lite bg-night/40 px-4 py-3">
              <div className="text-[11.5px] text-ivory/50">أحسن شهر</div>
              <div className="mt-1 font-serif text-[22px] font-bold text-ivory">
                {best && best[currency] > 0 ? fmtMoney(best[currency], cur) : '—'}
              </div>
              <div className="mt-0.5 text-[11.5px] text-ivory/45">{best && best[currency] > 0 ? monthName(best.month, true) : 'لسه مفيش أرباح بالعملة دي'}</div>
            </div>
          </div>

          {/* الرسم */}
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rows} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" minTickGap={8} />
                <YAxis allowDecimals={false} stroke={AXIS} tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} width={56}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : v)} />
                <Tooltip content={<ChartTip currency={currency} />} cursor={{ fill: 'rgba(250,245,236,0.05)' }} />
                <Bar dataKey={currency} radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {rows.map((r) => (
                    <Cell key={r.month} fill={r.current ? '#e6c684' : currency === 'egp' ? '#c9a24a' : '#2f9c80'} fillOpacity={r.current ? 1 : 0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* الجدول — الأحدث فوق */}
          <div className="-mx-5 mt-4 overflow-x-auto px-5">
            <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-line-lite text-start text-[11.5px] text-ivory/45">
                  <th className="py-2 text-start font-bold">الشهر</th>
                  <th className="py-2 text-start font-bold">بالجنيه</th>
                  <th className="py-2 text-start font-bold">بالدولار</th>
                  <th className="py-2 text-start font-bold">طلبات</th>
                  <th className="py-2 text-start font-bold">تسجيلات</th>
                  <th className="py-2 text-start font-bold">النمو ({currency === 'egp' ? 'جنيه' : 'دولار'})</th>
                </tr>
              </thead>
              <tbody>
                {[...rows].reverse().map((r) => (
                  <tr key={r.month} className={`border-b border-line-lite/60 ${r.current ? 'bg-brass/[0.06]' : ''}`}>
                    <td className="py-2.5 font-bold text-ivory">
                      {monthName(r.month, true)}
                      {r.current && <span className="ms-2 rounded-full bg-brass/20 px-2 py-0.5 text-[10px] text-brass-soft">الشهر ده</span>}
                    </td>
                    <td className={`py-2.5 ${r.egp ? 'text-ivory' : 'text-ivory/30'}`}>{fmtMoney(r.egp, 'EGP')}</td>
                    <td className={`py-2.5 ${r.usd ? 'text-ivory' : 'text-ivory/30'}`}>{fmtMoney(r.usd, 'USD')}</td>
                    <td className="py-2.5 text-ivory/70">{fmtNum(r.orders)}</td>
                    <td className="py-2.5 text-ivory/70">{fmtNum(r.signups)}</td>
                    <td className="py-2.5">
                      {!r.g ? <span className="text-ivory/25">—</span>
                        : r.g.pct === null ? <span className="text-[11.5px] font-bold text-ok">أول أرباح</span>
                          : (
                            <span className={`inline-flex items-center gap-1 text-[11.5px] font-bold ${r.g.pct > 0 ? 'text-ok' : r.g.pct < 0 ? 'text-error' : 'text-ivory/45'}`}>
                              {r.g.pct > 0 ? <TrendingUp size={12} /> : r.g.pct < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                              {r.g.pct > 0 ? '+' : ''}{r.g.pct}%
                            </span>
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}
