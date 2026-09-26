// صفحة طلبات السحب — المسوّقين (UGC) بيطلبوا سحب أرباحهم فودافون كاش، وإنت
// بتحوّل وتأكّد (paid) أو ترفض (rejected). بالضغط على العميل بيفتح ملفه.
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, MessageCircle } from 'lucide-react';
import { useGetWithdrawalsQuery, useResolveWithdrawalMutation } from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import { AnimatePresence } from 'motion/react';
import {
  Panel, Badge, Btn, Table, Row, Cell, Spinner, Empty, Tabs, fmtDate, fmtMoney, fmtNum,
} from '../../components/admin/ui.jsx';
import { waLink } from './format.js';
import ClientDrawer from './ClientDrawer.jsx';

const FILTERS = [
  { value: 'pending', label: 'مستنية' },
  { value: 'paid', label: 'اتحوّلت' },
  { value: 'rejected', label: 'مرفوضة' },
  { value: 'all', label: 'الكل' },
];

export default function WithdrawalsPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const { data, isLoading, isFetching } = useGetWithdrawalsQuery({ status, page });
  const [resolve, { isLoading: resolving }] = useResolveWithdrawalMutation();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      if (data.page === 1) return data.withdrawals;
      const seen = new Set(prev.map((w) => w.id));
      return [...prev, ...data.withdrawals.filter((w) => !seen.has(w.id))];
    });
  }, [data]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && data?.hasMore && !isFetching) setPage((p) => p + 1);
    }, { rootMargin: '250px' });
    io.observe(el);
    return () => io.disconnect();
  }, [data?.hasMore, isFetching]);

  function changeStatus(v) { setStatus(v); setPage(1); setItems([]); }

  async function act(id, action) {
    setError(''); setBusyId(id);
    try { await resolve({ id, action }).unwrap(); setPage(1); }
    catch (e) { setError(e?.data?.error || 'حصل خطأ، جرّب تاني.'); }
    finally { setBusyId(null); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">طلبات السحب</h1>
        <p className="mt-0.5 text-[12.5px] text-ivory/45">
          المسوّقين بيطلبوا سحب أرباحهم — حوّل فودافون كاش على الرقم، وبعدين دوس "اتحوّلت".
        </p>
      </div>

      {error && <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error}</div>}

      <Panel
        title={data ? `${fmtNum(data.total)} طلب` : 'طلبات السحب'}
        subtitle={isFetching ? 'بيحدّث...' : undefined}
        action={<Tabs value={status} onChange={changeStatus} options={FILTERS} />}
      >
        {isLoading && items.length === 0 ? <Spinner /> : items.length === 0 ? (
          <Empty>مفيش طلبات هنا.</Empty>
        ) : (
          <>
            <Table head={['المسوّق', 'المبلغ', 'رقم فودافون', 'التاريخ', 'الحالة', '']}>
              {items.map((w) => (
                <Row key={w.id}>
                  <Cell>
                    <button type="button" onClick={() => dispatch(openUser(w.ugcUserId))} className="font-bold text-ivory hover:text-brass-soft">
                      {w.user.name}
                    </button>
                    <div className="text-[11px] text-ivory/40">{w.user.email}</div>
                  </Cell>
                  <Cell className="whitespace-nowrap font-bold text-brass-soft">{fmtMoney(w.amount, w.currency)}</Cell>
                  <Cell>
                    {w.phone ? (
                      <a href={waLink(w.phone, 'EG')} target="_blank" rel="noopener noreferrer" dir="ltr"
                        className="inline-flex items-center gap-1 text-emerald-bright hover:underline">
                        <MessageCircle size={12} /> {w.phone}
                      </a>
                    ) : <span className="text-ivory/30">—</span>}
                  </Cell>
                  <Cell className="whitespace-nowrap text-ivory/45">{fmtDate(w.createdAt, true)}</Cell>
                  <Cell>
                    {w.status === 'pending' && <Badge tone="warn">مستني</Badge>}
                    {w.status === 'paid' && <Badge tone="ok">اتحوّل {fmtDate(w.resolvedAt)}</Badge>}
                    {w.status === 'rejected' && <Badge tone="danger">مرفوض</Badge>}
                  </Cell>
                  <Cell>
                    {w.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <Btn tone="ok" size="sm" icon={Check} loading={resolving && busyId === w.id} onClick={() => act(w.id, 'paid')}>اتحوّلت</Btn>
                        <Btn tone="danger" size="sm" icon={X} loading={resolving && busyId === w.id} onClick={() => act(w.id, 'rejected')}>ارفض</Btn>
                      </div>
                    )}
                  </Cell>
                </Row>
              ))}
            </Table>
            <div ref={sentinelRef} className="h-8" />
            {isFetching && items.length > 0 && <p className="py-2 text-center text-[12px] text-ivory/40">بيحمّل المزيد...</p>}
          </>
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
