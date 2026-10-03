// صفحة الأرباح — الفلوس جت من مين. بتعرض إجمالي اللي اتحصّل، وقائمة كل عميل
// دافع مع اللي دفعه، وبالضغط على أي عميل بيفتح ملفه عشان توصله وتعدّله.
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'motion/react';
import { Wallet, MessageCircle, Crown } from 'lucide-react';
import { useGetRevenueQuery } from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import {
  Panel, StatTile, Badge, Table, Row, Cell, Spinner, Empty, fmtDate, fmtNum, fmtMoney,
} from '../../components/admin/ui.jsx';
import { countryName, waLink } from './format.js';
import ClientDrawer from './ClientDrawer.jsx';

export default function EarningsPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const { data, isLoading, isFetching } = useGetRevenueQuery({ page });
  const flags = useRef({ hasMore: false, isFetching: true });
  flags.current = { hasMore: !!data?.hasMore, isFetching };
  const ioRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      if (data.page === 1) return data.customers;
      const seen = new Set(prev.map((c) => c.userId));
      return [...prev, ...data.customers.filter((c) => !seen.has(c.userId))];
    });
  }, [data]);

  function loadMore() {
    if (flags.current.hasMore && !flags.current.isFetching) setPage((p) => p + 1);
  }
  // callback ref: المراقب يتعلّق بعنصر النهاية أول ما يظهر فعلًا، ويقرا
  // القيم الحديثة من flags.current (مش قيم قديمة) — تحميل تلقائي موثوق
  const sentinelRef = useCallback((node) => {
    if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null; }
    if (!node) return;
    ioRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '600px 0px' });
    ioRef.current.observe(node);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">الأرباح</h1>
        <p className="mt-0.5 text-[12.5px] text-ivory/45">
          الفلوس اللي اتحصّلت فعلًا (الطلبات المفعّلة بس) — وجاية من مين. اضغط أي عميل تفتح ملفه.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={Wallet} tone="ok" label="إجمالي بالجنيه" value={fmtMoney(data?.grand?.EGP || 0, 'EGP')} />
        <StatTile icon={Wallet} tone="ok" label="إجمالي بالدولار" value={fmtMoney(data?.grand?.USD || 0, 'USD')} />
        <StatTile icon={Crown} tone="gold" label="عملاء دافعين" value={fmtNum(data?.totalPayers || 0)} />
      </div>

      <Panel title="مين دفع" subtitle={isFetching ? 'بيحدّث...' : undefined}>
        {isLoading && items.length === 0 ? <Spinner /> : items.length === 0 ? (
          <Empty>لسه مفيش أرباح.</Empty>
        ) : (
          <>
            <Table head={['العميل', 'الباقة', 'دفع (جنيه)', 'دفع (دولار)', 'طلبات', 'آخر دفعة']}>
              {items.map((c) => (
                <Row key={c.userId} onClick={() => dispatch(openUser(c.userId))}>
                  <Cell>
                    <span className="font-bold text-ivory">{c.name}</span>
                    <div className="text-[11px] text-ivory/40">{c.email} · {countryName(c.country)}</div>
                    {c.phone && (
                      <a
                        href={waLink(c.phone, c.country)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-bright hover:underline"
                        dir="ltr"
                      >
                        <MessageCircle size={11} /> {c.phone}
                      </a>
                    )}
                  </Cell>
                  <Cell>{c.packageName ? <Badge tone="gold" icon={Crown}>{c.packageName}</Badge> : <span className="text-ivory/35">—</span>}</Cell>
                  <Cell className="whitespace-nowrap font-bold text-brass-soft">
                    {c.egp ? fmtMoney(c.egp, 'EGP') : <span className="text-ivory/25">—</span>}
                  </Cell>
                  <Cell className="whitespace-nowrap font-bold text-brass-soft">
                    {c.usd ? fmtMoney(c.usd, 'USD') : <span className="text-ivory/25">—</span>}
                  </Cell>
                  <Cell className="text-ivory/55">{fmtNum(c.orders)}</Cell>
                  <Cell className="whitespace-nowrap text-ivory/45">{c.lastPaidAt ? fmtDate(c.lastPaidAt) : 'لسه'}</Cell>
                </Row>
              ))}
            </Table>
            <div ref={sentinelRef} aria-hidden="true" className="h-1" />
            {isFetching && items.length > 0 && (
              <p className="py-2 text-center text-[12px] text-ivory/40">بيحمّل المزيد...</p>
            )}
            {data?.hasMore && !isFetching && (
              <button
                type="button"
                onClick={loadMore}
                className="mx-auto mt-2 flex items-center justify-center gap-1.5 rounded-full border border-ivory/20 px-5 py-2.5 text-[12.5px] font-bold text-ivory/80 transition hover:border-brass/50 hover:text-brass-soft"
              >
                حمّل المزيد
              </button>
            )}
            {!data?.hasMore && items.length > 0 && (
              <p className="py-2 text-center text-[12px] text-ivory/30">دي كل العملاء الدافعين</p>
            )}
          </>
        )}
      </Panel>

      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
      {openUserId && (
        <button
          type="button"
          aria-label="اقفل"
          onClick={() => dispatch(closeUser())}
          className="fixed inset-0 z-40 bg-black/55"
        />
      )}
    </div>
  );
}
