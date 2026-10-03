import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import {
  Users, Crown, FileText, Eye, MessageSquare, Wallet, Clock, Ban, PauseCircle, ArrowLeft,
} from 'lucide-react';
import { useGetOverviewQuery } from '../../store/adminApi.js';
import { setPeriod, closeUser } from '../../store/adminSlice.js';
import LivePanel from '../../components/admin/LivePanel.jsx';
import MonthlyRevenue from '../../components/admin/MonthlyRevenue.jsx';
import ClientDrawer from './ClientDrawer.jsx';
import {
  Panel, StatTile, Spinner, Tabs, Empty, fmtNum, fmtMoney,
} from '../../components/admin/ui.jsx';
import { AreaTrend, BarTrend, LineTrend, Donut, COLORS } from '../../components/admin/Charts.jsx';
import { countryName } from './format.js';

/**
 * العملاء حسب الدولة — ترتيب واضح بدل الدايرة: اسم الدولة كامل، عدد
 * المسجّلين، كام منهم دفع، وشريط بنسبتها من الكل. الدول الكتير الصغيرة
 * بتتجمّع في سطر "باقي الدول".
 */
function CountriesPanel({ rows, other, total, users }) {
  if (!rows.length) return <Empty>لسه مفيش عملاء.</Empty>;
  const max = rows[0].count || 1;
  const all = users || rows.reduce((a, r) => a + r.count, 0) + (other?.count || 0);
  const pct = (n) => (all ? Math.round((n / all) * 1000) / 10 : 0);
  return (
    <div>
      <ol className="grid gap-x-8 gap-y-2.5 md:grid-cols-2">
        {rows.map((r, i) => (
          <li key={r.id || 'unknown'} className="min-w-0">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-5 shrink-0 text-center font-mono text-[11px] text-ivory/35">{i + 1}</span>
                <span className="truncate font-bold text-ivory/90">{r.id ? countryName(r.id) : 'دولة مش محددة'}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-bold text-ivory">{fmtNum(r.count)}</span>
                <span className="text-[11px] text-ivory/40">{pct(r.count)}%</span>
                {r.paid > 0 && (
                  <span className="rounded-full bg-brass/15 px-1.5 py-0.5 text-[10.5px] font-bold text-brass-soft" title="منهم دفعوا">
                    {fmtNum(r.paid)} دفع
                  </span>
                )}
              </span>
            </div>
            <div className="ms-7 h-1.5 overflow-hidden rounded-full bg-ivory/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-brass to-brass-soft"
                style={{ width: `${Math.max(2, (r.count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      {other && other.countries > 0 && (
        <p className="mt-4 rounded-xl bg-ivory/[0.04] px-3.5 py-2.5 text-[12px] text-ivory/55">
          وباقي الدول ({fmtNum(other.countries)} دولة): {fmtNum(other.count)} عميل
          {other.paid > 0 ? ` · ${fmtNum(other.paid)} دفعوا` : ''}
        </p>
      )}
      <p className="mt-3 text-[11.5px] text-ivory/35">
        عملاء من {fmtNum(total)} دولة.
      </p>
    </div>
  );
}

const PERIODS = [
  { value: 7, label: 'آخر أسبوع' },
  { value: 30, label: 'آخر شهر' },
  { value: 90, label: '3 شهور' },
  { value: 365, label: 'سنة' },
];

export default function OverviewPage() {
  const dispatch = useDispatch();
  const period = useSelector((s) => s.admin.period);
  // ملف العميل بيتفتح من قايمة "العملاء المتصلين"
  const openUserId = useSelector((s) => s.admin.openUserId);
  const { data, isLoading, isFetching } = useGetOverviewQuery(period);

  if (isLoading) return <Spinner label="بنجمّع الأرقام..." />;
  if (!data) return <Empty>مفيش بيانات.</Empty>;

  const { kpis, revenue, series, breakdown } = data;

  return (
    <div className="space-y-5">
      {/* الفترة */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">نظرة عامة</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            الأرقام الكبيرة إجمالية، والرسوم على الفترة المختارة.
            {isFetching && ' · بيحدّث...'}
          </p>
        </div>
        <Tabs value={period} onChange={(v) => dispatch(setPeriod(v))} options={PERIODS} />
      </div>

      {/* اللحظة دي: مين على الموقع + أرقام النهارده */}
      <LivePanel />

      {/* الأرباح */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[15px] font-bold text-ivory/80">الأرباح</h2>
        <Link
          to="/admin/earnings"
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brass-soft hover:text-brass"
        >
          شوف مين دفع <ArrowLeft size={13} />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Wallet} tone="gold" delay={0}
          label="أرباح بالجنيه (كل الوقت)"
          value={fmtMoney(revenue.all.EGP.total, 'EGP')}
          hint={`${revenue.all.EGP.orders} طلب`}
        />
        <StatTile
          icon={Wallet} tone="gold" delay={0.04}
          label="أرباح بالدولار (كل الوقت)"
          value={fmtMoney(revenue.all.USD.total, 'USD')}
          hint={`${revenue.all.USD.orders} طلب`}
        />
        <StatTile
          icon={Wallet} delay={0.08}
          label={`أرباح الفترة (جنيه)`}
          value={fmtMoney(revenue.period.EGP.total, 'EGP')}
          hint={`${revenue.period.EGP.orders} طلب`}
        />
        <StatTile
          icon={Wallet} delay={0.12}
          label={`أرباح الفترة (دولار)`}
          value={fmtMoney(revenue.period.USD.total, 'USD')}
          hint={`${revenue.period.USD.orders} طلب`}
        />
      </div>

      {/* الأرباح شهر بشهر */}
      <MonthlyRevenue />

      {/* أرقام الموقع */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Users} label="عملاء مسجّلين" value={fmtNum(kpis.users)} delay={0} />
        <StatTile icon={Crown} tone="gold" label="عملاء مدفوعين" value={fmtNum(kpis.premiumUsers)} delay={0.04} />
        <StatTile icon={FileText} label="دعوات منشورة" value={fmtNum(kpis.invitations)} hint={`${kpis.draftInvitations} مسودة`} delay={0.08} />
        <StatTile icon={Eye} label="مشاهدات الدعوات" value={fmtNum(kpis.views)} delay={0.12} />
        <StatTile icon={MessageSquare} label="ردود الحضور" value={fmtNum(kpis.rsvps)} delay={0.16} />
        <StatTile
          icon={Clock} tone={kpis.pendingOrders ? 'gold' : 'default'}
          label="طلبات مستنية تفعيل" value={fmtNum(kpis.pendingOrders)} delay={0.2}
        />
        <StatTile
          icon={PauseCircle} tone={kpis.suspendedSubs ? 'danger' : 'default'}
          label="باقات موقوفة" value={fmtNum(kpis.suspendedSubs)} delay={0.24}
        />
        <StatTile
          icon={Ban} tone={kpis.blockedUsers ? 'danger' : 'default'}
          label="حسابات محظورة" value={fmtNum(kpis.blockedUsers)} delay={0.28}
        />
      </div>

      {/* الرسوم */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="الأرباح يوم بيوم" subtitle="الطلبات المفعّلة بس — العملتين منفصلين">
          <BarTrend
            data={series.revenue}
            keys={[
              { key: 'egp', label: 'جنيه', color: COLORS.GOLD },
              { key: 'usd', label: 'دولار', color: COLORS.EMERALD },
            ]}
          />
        </Panel>

        <Panel title="الدعوات الجديدة" subtitle="إجمالي الدعوات، والمميز منها">
          <AreaTrend
            data={series.invitations}
            keys={[
              { key: 'count', label: 'كل الدعوات', color: COLORS.ROSE },
              { key: 'premium', label: 'مميزة', color: COLORS.GOLD },
            ]}
          />
        </Panel>

        <Panel title="التسجيلات الجديدة" subtitle="حسابات اتعملت في الفترة">
          <AreaTrend data={series.users} keys={[{ key: 'count', label: 'حسابات', color: COLORS.EMERALD }]} />
        </Panel>

        <Panel title="ردود الحضور" subtitle="كل الردود، والموافقين منهم">
          <LineTrend
            data={series.rsvps}
            keys={[
              { key: 'count', label: 'كل الردود', color: COLORS.GOLD_SOFT },
              { key: 'yes', label: 'هيحضروا', color: COLORS.EMERALD },
            ]}
          />
        </Panel>
      </div>

      {/* التوزيعات */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="التصاميم الأكثر استخدامًا">
          {breakdown.templates.length
            ? <Donut data={breakdown.templates.map((t) => ({ label: t.label, count: t.count }))} />
            : <Empty>لسه مفيش دعوات.</Empty>}
        </Panel>

        <Panel title="الباقات المباعة">
          {breakdown.packages.length ? (
            <>
              <Donut data={breakdown.packages.map((p) => ({ label: p.label, count: p.count }))} />
              <div className="mt-3 space-y-1.5">
                {breakdown.packages.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-[12px] text-ivory/60">
                    <span>{p.label}</span>
                    <span className="text-ivory/80">
                      {p.egp > 0 && fmtMoney(p.egp, 'EGP')}
                      {p.egp > 0 && p.usd > 0 && ' · '}
                      {p.usd > 0 && fmtMoney(p.usd, 'USD')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : <Empty>لسه مفيش باقات متفعّلة.</Empty>}
        </Panel>

      </div>

      <Panel title="العملاء حسب الدولة" subtitle="أكتر الدول اللي العملاء سجّلوا منها، وكام واحد منهم دفع">
        <CountriesPanel
          rows={breakdown.countries}
          other={breakdown.countriesOther}
          total={breakdown.countriesTotal || breakdown.countries.length}
          users={kpis.users}
        />
      </Panel>

      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
    </div>
  );
}
