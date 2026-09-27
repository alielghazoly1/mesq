// صفحة المسوّقين (UGC) — كل حسابات العمولة اللي المالك عاملها، وإحصائياتهم،
// والأهم: عليه فلوس قد إيه لكل واحد (المتاح للسحب). بالضغط على أي مسوّق
// بيفتح ملفه الكامل (تقدر توصله، تغيّر نسبته، تشوف تفاصيله).
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'motion/react';
import { Users, Wallet, Crown, MessageCircle, Link2, Clock } from 'lucide-react';
import { useGetUgcQuery } from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import {
  Panel, StatTile, Badge, Table, Row, Cell, Spinner, Empty, fmtDate, fmtNum, fmtMoney,
} from '../../components/admin/ui.jsx';
import { countryName, waLink } from './format.js';
import ClientDrawer from './ClientDrawer.jsx';

// بيعرض مبلغ بعملتيه (جنيه/دولار) فوق بعض — نعرض اللي فيه رقم بس، وإلا "—"
function Money({ egp, usd, tone = 'text-ivory' }) {
  const parts = [];
  if (egp) parts.push(<div key="e" className={`whitespace-nowrap font-bold ${tone}`}>{fmtMoney(egp, 'EGP')}</div>);
  if (usd) parts.push(<div key="u" className={`whitespace-nowrap font-bold ${tone}`}>{fmtMoney(usd, 'USD')}</div>);
  if (!parts.length) return <span className="text-ivory/30">—</span>;
  return <div className="space-y-0.5">{parts}</div>;
}

export default function UgcPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const { data, isLoading, isFetching } = useGetUgcQuery();
  const affiliates = data?.affiliates || [];
  const t = data?.totals;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">المسوّقين (UGC)</h1>
        <p className="mt-0.5 text-[12.5px] text-ivory/45">
          كل الحسابات اللي عاملها UGC، وعليك فلوس قد إيه لكل واحد. اضغط أي مسوّق تفتح ملفه الكامل.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users} tone="gold" label="عدد المسوّقين" value={fmtNum(t?.count || 0)} />
        <StatTile icon={Wallet} tone="danger" label="مستحق عليك (جنيه)" value={fmtMoney(t?.available?.EGP || 0, 'EGP')} />
        <StatTile icon={Wallet} tone="danger" label="مستحق عليك (دولار)" value={fmtMoney(t?.available?.USD || 0, 'USD')} />
        <StatTile icon={Crown} tone="ok" label="عملاء جابوهم ودفعوا" value={fmtNum(t?.paidCustomers || 0)} />
      </div>

      <Panel
        title={data ? `${fmtNum(t?.count || 0)} مسوّق` : 'المسوّقين'}
        subtitle={isFetching ? 'بيحدّث...' : 'المستحق = المكتسب ناقص المسحوب والمعلّق'}
      >
        {isLoading && affiliates.length === 0 ? <Spinner /> : affiliates.length === 0 ? (
          <Empty>لسه مفيش مسوّقين. فعّل UGC لأي عميل من ملفه.</Empty>
        ) : (
          <Table head={['المسوّق', 'العمولة', 'سجّلوا', 'دفعوا', 'مستحق عليك', 'معلّق', 'رقم الدفع']}>
            {affiliates.map((a) => (
              <Row key={a.id}>
                <Cell>
                  <button type="button" onClick={() => dispatch(openUser(a.id))} className="font-bold text-ivory hover:text-brass-soft">
                    {a.name}
                  </button>
                  <div className="text-[11px] text-ivory/40">{a.email}</div>
                  {a.referralCode && (
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-ivory/35" dir="ltr">
                      <Link2 size={10} /> /r/{a.referralCode}
                    </div>
                  )}
                  <div className="text-[10.5px] text-ivory/30">{countryName(a.country)} · انضم {fmtDate(a.createdAt)}</div>
                </Cell>
                <Cell className="whitespace-nowrap"><Badge tone="gold">{a.commissionRate}%</Badge></Cell>
                <Cell className="text-ivory/70">{fmtNum(a.stats?.registrations || 0)}</Cell>
                <Cell className="text-ivory/70">{fmtNum(a.stats?.paidCustomers || 0)}</Cell>
                <Cell><Money egp={a.stats?.available?.EGP} usd={a.stats?.available?.USD} tone="text-brass-soft" /></Cell>
                <Cell>
                  {(a.stats?.pending?.EGP || a.stats?.pending?.USD)
                    ? <span className="inline-flex items-center gap-1 text-amber-300/80"><Clock size={11} /><Money egp={a.stats?.pending?.EGP} usd={a.stats?.pending?.USD} tone="text-amber-300/80" /></span>
                    : <span className="text-ivory/30">—</span>}
                </Cell>
                <Cell>
                  {a.payoutPhone ? (
                    <a href={waLink(a.payoutPhone, 'EG')} target="_blank" rel="noopener noreferrer" dir="ltr"
                      className="inline-flex items-center gap-1 whitespace-nowrap text-emerald-bright hover:underline">
                      <MessageCircle size={12} /> {a.payoutPhone}
                    </a>
                  ) : <span className="text-ivory/30">—</span>}
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
      {openUserId && (
        <button type="button" aria-label="اقفل" onClick={() => dispatch(closeUser())} className="fixed inset-0 z-40 bg-black/55" />
      )}
    </div>
  );
}
