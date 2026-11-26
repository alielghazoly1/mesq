import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import {
  Users, Crown, FileText, Eye, MessageSquare, Clock, Ban, PauseCircle, ArrowLeft,
} from 'lucide-react';
import { useGetOverviewQuery } from '../../store/adminApi.js';
import { setPeriod, closeUser } from '../../store/adminSlice.js';
import LivePanel from '../../components/admin/LivePanel.jsx';
import MonthlyRevenue from '../../components/admin/MonthlyRevenue.jsx';
import ClientDrawer from './ClientDrawer.jsx';
import {
  Panel, StatTile, Spinner, Tabs, Empty, fmtNum, fmtMoney,
} from '../../components/admin/ui.jsx';
import { AreaTrend, BarTrend, LineTrend, COLORS } from '../../components/admin/Charts.jsx';
import RankedBars from '../../components/admin/RankedBars.jsx';
import { useMoneyHidden } from '../../components/admin/moneyPrivacy.js';
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

/**
 * الفلوس اللي دخلت — كارتين واضحين بدل 4–8 مربعات أرقام جنب بعض:
 *  • "الفترة" (التاب اللي فوق: آخر أسبوع/شهر/...) و"من أول يوم".
 *  • في كل كارت: الإجمالي بالجنيه (كل عملة اتحوّلت بأسعار الصرف بتاعة صفحة الأرباح)،
 *    وتحته كل عملة لوحدها: المبلغ بعملته + عدد الطلبات (+ قيمته بالجنيه للعملات التانية).
 *  العملات اللي مفيهاش طلبات خالص مابتظهرش (الجنيه دايمًا ظاهر).
 */
const CUR_META = [
  { c: 'EGP', name: 'جنيه مصري', note: 'فودافون كاش / إنستاباي' },
  { c: 'USD', name: 'دولار', note: 'الدفع الدولي' },
  { c: 'SAR', name: 'ريال سعودي', note: 'السعودية' },
  { c: 'EUR', name: 'يورو', note: 'دول اليورو' },
];

function MoneyCard({ title, subtitle, data, rates, tone }) {
  const rows = CUR_META.filter(({ c }) => c === 'EGP' || (data[c] && data[c].orders > 0));
  const toEgp = (c) => Math.round(((data[c] && data[c].total) || 0) * ((rates && rates[c]) || 0));
  const totalEgp = rows.reduce((a, { c }) => a + toEgp(c), 0);
  const orders = rows.reduce((a, { c }) => a + ((data[c] && data[c].orders) || 0), 0);
  const ratesOk = !!rates;
  return (
    <section className={`rounded-2xl border p-5 ${tone === 'gold' ? 'border-brass/40 bg-brass/[0.07]' : 'border-line-lite bg-panel'}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-[15px] font-bold text-ivory">{title}</h3>
        <span className="text-[11.5px] text-ivory/45">{subtitle}</span>
      </div>
      <div className="mt-3">
        <div className="text-[11.5px] font-bold text-ivory/50">
          {ratesOk ? 'الإجمالي محوّل لجنيه' : 'بالجنيه'}
        </div>
        <div className={`mt-0.5 font-serif text-[28px] font-bold leading-tight ${tone === 'gold' ? 'text-brass-soft' : 'text-ivory'}`}>
          {ratesOk ? fmtMoney(totalEgp, 'EGP') : fmtMoney((data.EGP && data.EGP.total) || 0, 'EGP')}
        </div>
        <div className="mt-0.5 text-[11.5px] text-ivory/45">{fmtNum(orders)} طلب مفعّل</div>
      </div>
      <ul className="mt-4 divide-y divide-ivory/[0.06] border-t border-ivory/[0.08]">
        {rows.map(({ c, name, note }) => {
          const d = data[c] || { total: 0, orders: 0 };
          return (
            <li key={c} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-ivory/85">{name}</div>
                <div className="text-[11px] text-ivory/40">{note} · {fmtNum(d.orders)} طلب</div>
              </div>
              <div className="shrink-0 text-end">
                <div className="text-[14px] font-bold text-ivory">{fmtMoney(d.total, c)}</div>
                {c !== 'EGP' && ratesOk && d.total > 0 && (
                  <div className="text-[11px] text-ivory/40">≈ {fmtMoney(toEgp(c), 'EGP')}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MoneySummary({ revenue, periodLabel }) {
  const rates = revenue.rates || null;
  const used = CUR_META.filter(({ c }) => c !== 'EGP' && revenue.all[c] && revenue.all[c].orders > 0);
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <MoneyCard title="الفترة دي" subtitle={periodLabel} data={revenue.period} rates={rates} tone="gold" />
        <MoneyCard title="من أول يوم" subtitle="كل الوقت" data={revenue.all} rates={rates} />
      </div>
      {rates && used.length > 0 && (
        <p className="mt-2 text-[11px] text-ivory/35">
          التحويل لجنيه بأسعار صفحة الأرباح: {used.map(({ c }) => `${fmtMoney(1, c)} = ${fmtNum(rates[c])} ج.م`).join(' · ')}
        </p>
      )}
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
  const hideMoney = useMoneyHidden();

  if (isLoading) return <Spinner label="بنجمّع الأرقام..." />;
  if (!data) return <Empty>مفيش بيانات.</Empty>;

  const { kpis, revenue, series, breakdown } = data;
  // "+5 في آخر 30 يوم" — صياغة تتقري جوه جملة (أسماء التابات قصيرة)
  const periodLabel = { 7: 'آخر 7 أيام', 30: 'آخر 30 يوم', 90: 'آخر 3 شهور', 365: 'آخر سنة' }[period] || 'الفترة دي';

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

      {/* الأرباح — بتتشال خالص لما "إخفاء الفلوس" شغال (صفحة الأمان) */}
      {!hideMoney && (<>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-[15px] font-bold text-ivory/80">الفلوس اللي دخلت</h2>
          <p className="mt-0.5 text-[11.5px] text-ivory/40">
            اللي العملاء دفعوه في الطلبات المفعّلة — قبل مصاريف الإعلانات والعمولات.
          </p>
        </div>
        <Link
          to="/admin/earnings"
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brass-soft hover:text-brass"
        >
          صافي الربح بعد المصاريف + مين دفع <ArrowLeft size={13} />
        </Link>
      </div>
      <MoneySummary revenue={revenue} periodLabel={periodLabel} />

      {/* الأرباح شهر بشهر */}
      <MonthlyRevenue />
      </>)}

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
        {!hideMoney && (
        <Panel title="الفلوس اللي دخلت يوم بيوم" subtitle="الطلبات المفعّلة بس — كل عملة لوحدها">
          <BarTrend
            money
            data={series.revenue}
            keys={[
              { key: 'egp', label: 'جنيه', color: COLORS.GOLD },
              { key: 'usd', label: 'دولار', color: COLORS.EMERALD },
              { key: 'sar', label: 'ريال', color: COLORS.ROSE },
            ]}
          />
        </Panel>
        )}

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

        <Panel title="ردود الحضور" subtitle="كل الردود، والموافقين منهم" className={hideMoney ? 'xl:col-span-2' : ''}>
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
        {/* ترتيب بالأرقام بدل الدايرة: كام دعوة اتعملت بكل تصميم، ونسبته،
            وكام منها في الفترة المختارة. كل التصاميم بتظهر حتى اللي بصفر. */}
        <Panel title="التصاميم الأكثر استخدامًا" subtitle="عدد الدعوات المنشورة بكل تصميم (كل الوقت)">
          {breakdown.templates.length ? (
            <RankedBars rows={breakdown.templates} unit="دعوة" periodLabel={periodLabel} />
          ) : <Empty>لسه مفيش دعوات.</Empty>}
        </Panel>

        <Panel title="الباقات المباعة" subtitle={hideMoney ? 'عدد الباقات المتفعّلة (المدفوعة) — كل الوقت' : 'عدد الباقات المتفعّلة (المدفوعة) وفلوس كل باقة (كل الوقت)'}>
          {breakdown.packages.length ? (
            <RankedBars
              rows={breakdown.packages}
              unit="باقة"
              periodLabel={periodLabel}
              emptyLabel="لسه ماتباعتش"
              renderExtra={(p) => (!hideMoney && (p.egp > 0 || p.usd > 0 || p.sar > 0 || p.eur > 0) ? (
                <span className="font-bold text-brass-soft" data-ranked-money>
                  {[p.egp > 0 && fmtMoney(p.egp, 'EGP'), p.usd > 0 && fmtMoney(p.usd, 'USD'), p.sar > 0 && fmtMoney(p.sar, 'SAR'), p.eur > 0 && fmtMoney(p.eur, 'EUR')]
                    .filter(Boolean).join(' · ')}
                </span>
              ) : null)}
            />
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
