import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, Receipt, ExternalLink, Undo2, ShieldAlert, MessageCircle, Sparkles } from 'lucide-react';
import {
  adminApi,
  useGetOrdersQuery, useActivateOrderMutation, useCancelOrderMutation,
  useGetAdminPackagesQuery,
} from '../../store/adminApi.js';
import { setOrdersStatus, openUser } from '../../store/adminSlice.js';
import {
  Panel, Badge, Btn, Table, Row, Cell, Spinner, Empty, Tabs, fmtDate, fmtMoney, fmtNum, fmtLastSeen,
} from '../../components/admin/ui.jsx';
import { countryName, waLink } from './format.js';

const FILTERS = [
  { value: 'review', label: 'إيصالات مستنية تفعيل' },
  { value: 'pending', label: 'مستنية' },
  { value: 'activated', label: 'مفعّلة' },
  { value: 'cancelled', label: 'ملغية' },
  { value: 'receipt', label: 'رفعوا إيصال' },
  { value: 'all', label: 'الكل' },
];

// إيصال "جديد" = اترفع في آخر 24 ساعة والطلب لسه مستني تفعيل
const NEW_RECEIPT_MS = 24 * 60 * 60 * 1000;
function isNewReceipt(o) {
  return o.status === 'pending' && o.paymentProofAt
    && Date.now() - new Date(o.paymentProofAt).getTime() < NEW_RECEIPT_MS;
}

export default function OrdersPage() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.admin.ordersStatus);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  // القايمة مترتبة بآخر حركة (طلب أو رفع إيصال)، فأي إيصال جديد بيطلع
  // أولها. وإنت على أول صفحة بتتحدّث لوحدها كل 20 ثانية — فالإيصال يظهرلك
  // من غير ما تعمل refresh. (مش بنحدّث وإنت نازل تحت عشان القايمة ماتتلخبطش.)
  const { data, isLoading, isFetching } = useGetOrdersQuery({ status, page }, {
    pollingInterval: page === 1 ? 20000 : 0,
    skipPollingIfUnfocused: true,
  });
  const reviewCount = data?.counts?.review;
  // العداد اللي في القايمة الجانبية ياخد نفس الرقم فورًا مع كل تحديث للقايمة
  // (من غير ما يستنى دورته هو) — رقم واحد في الكاش، مكانين بيعرضوه.
  useEffect(() => {
    if (typeof reviewCount !== 'number') return;
    dispatch(adminApi.util.upsertQueryData('getOrdersAttention', undefined, { review: reviewCount }));
  }, [reviewCount, dispatch]);
  const filters = FILTERS.map((f) => (f.value === 'review' && typeof reviewCount === 'number' ? { ...f, count: reviewCount } : f));
  const [activate, { isLoading: activating }] = useActivateOrderMutation();
  const [cancel, { isLoading: cancelling }] = useCancelOrderMutation();
  const { data: pkgData } = useGetAdminPackagesQuery();
  const editDays = pkgData?.editWindowDays || 0;
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [result, setResult] = useState('');
  // أحدث القيم في ref عشان كول-باك المراقب مايقراش قيم قديمة (stale)
  const flags = useRef({ hasMore: false, isFetching: true });
  flags.current = { hasMore: !!data?.hasMore, isFetching };
  const ioRef = useRef(null);

  // بنجمّع الصفحات مع بعض: صفحة 1 بتستبدل، والباقي بتتضاف (من غير تكرار).
  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      if (data.page === 1) return data.orders;
      const seen = new Set(prev.map((o) => o.id));
      return [...prev, ...data.orders.filter((o) => !seen.has(o.id))];
    });
  }, [data]);

  function loadMore() {
    if (flags.current.hasMore && !flags.current.isFetching) setPage((p) => p + 1);
  }

  // تحميل تلقائي وإحنا بننزل (infinite scroll). بنستخدم callback ref عشان
  // المراقب يتعلّق بعنصر النهاية أول ما يظهر فعلًا في الصفحة (مش قبل ما
  // يترسم)، وبنقرا القيم الحديثة من flags.current عشان مايعلّقش على قيم
  // قديمة. rootMargin كبير عشان يبدأ التحميل بدري وإنت بتقرّب من التحت.
  const sentinelRef = useCallback((node) => {
    if (ioRef.current) { ioRef.current.disconnect(); ioRef.current = null; }
    if (!node) return;
    ioRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '600px 0px' });
    ioRef.current.observe(node);
  }, []);

  function changeStatus(v) {
    dispatch(setOrdersStatus(v));
    setPage(1);
    setItems([]);
  }

  async function act(fn, id) {
    setError('');
    setResult('');
    setBusyId(id);
    try {
      await fn(id).unwrap();
      setPage(1); // نرجع لأول صفحة عشان القايمة تتحدّث نضيف
    } catch (err) {
      setError(err?.data?.error || 'حصل خطأ، جرّب تاني.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">الطلبات</h1>
        <p className="mt-0.5 text-[12.5px] text-ivory/45">
          العميل بيدفع برّه الموقع ويرفع صورة التحويل — وإنت بتفعّل بعد ما تتأكد.
        </p>
        {editDays > 0 && (
          <p className="mt-1 text-[12px] leading-relaxed text-ivory/45">
            التفعيل بيفتح للعميل الجديد {editDays} يوم تعديل من يوم التفعيل (والتجديد بيضيف {editDays} يوم فوق اللي فاضل).
            العميل اللي اشترى قبل كده تعديله بيفضل مفتوح زي ما هو. تقدر تمدّ المدة من ملف العميل.
          </p>
        )}
      </div>

      {error && <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error}</div>}
      {result && <div className="rounded-xl bg-ok/15 px-4 py-3 text-[12.5px] text-ok">{result}</div>}

      {confirmId && (
        <div className="rounded-2xl border border-error/50 bg-error/10 p-5">
          <p className="mb-3 flex items-start gap-2 text-[13px] text-ivory/85">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-error" />
            إلغاء باقة مدفوعة: الطلب هيتحوّل لـ"ملغي"، وهيتسحب من رصيد العميل بقدر
            الباقة دي. الدعوات اللي عملها فعلاً بتفضل شغالة زي ما هي — اللي اتستهلك
            مش بيرجع.
          </p>
          <div className="flex gap-2">
            <Btn
              tone="danger" size="sm" loading={cancelling}
              onClick={async () => {
                setResult('');
                const id = confirmId;
                setConfirmId(null);
                setBusyId(id);
                try {
                  const r = await cancel(id).unwrap();
                  setResult(`الباقة اتلغت — اتسحب ${r.creditsRemoved} من رصيد العميل.`);
                  setPage(1);
                } catch (err) {
                  setError(err?.data?.error || 'حصل خطأ، جرّب تاني.');
                } finally {
                  setBusyId(null);
                }
              }}
            >
              أيوه، ألغِ الباقة
            </Btn>
            <Btn size="sm" onClick={() => setConfirmId(null)}>لأ</Btn>
          </div>
        </div>
      )}

      <Panel
        title={data ? `${fmtNum(data.total)} طلب` : 'الطلبات'}
        subtitle={isFetching ? 'بيحدّث...' : undefined}
        action={<Tabs value={status} onChange={changeStatus} options={filters} />}
      >
        {isLoading && items.length === 0 ? <Spinner /> : items.length === 0 ? (
          <Empty>مفيش طلبات هنا.</Empty>
        ) : (
          <>
            <Table head={['العميل', 'الباقة', 'المبلغ', 'الإيصال', 'اتطلب', '']}>
              {items.map((o) => (
                <Row key={o.id}>
                  <Cell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => dispatch(openUser(o.userId))}
                        className="font-bold text-ivory hover:text-brass-soft"
                      >
                        {o.user.name}
                      </button>
                      {isNewReceipt(o) && <Badge tone="gold" icon={Sparkles}>إيصال جديد</Badge>}
                    </div>
                    <div className="text-[11px] text-ivory/40">{o.user.email} · {countryName(o.user.country)}</div>
                    {o.user.phone && (
                      <a
                        href={waLink(o.user.phone, o.user.country)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-bright hover:underline"
                        dir="ltr"
                      >
                        <MessageCircle size={11} /> {o.user.phone}
                      </a>
                    )}
                  </Cell>
                  <Cell>
                    {o.packageName}
                    <div className="text-[11px] text-ivory/40">{o.invitations} دعوة</div>
                  </Cell>
                  <Cell className="whitespace-nowrap font-bold text-brass-soft">
                    {fmtMoney(o.price, o.currency)}
                  </Cell>
                  <Cell>
                    {o.paymentProofUrl ? (
                      <a
                        href={o.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brass-soft hover:underline"
                      >
                        <Receipt size={12} /> شوف الصورة <ExternalLink size={10} />
                      </a>
                    ) : null}
                    {o.paymentProofUrl && o.paymentProofAt && (
                      <div className="mt-0.5 whitespace-nowrap text-[11px] text-ivory/45" title={fmtDate(o.paymentProofAt, true)}>
                        اترفع {fmtDate(o.paymentProofAt, true)}
                        <span className={isNewReceipt(o) ? 'block font-bold text-brass-soft' : 'block'}>
                          ({fmtLastSeen(o.paymentProofAt, false)})
                        </span>
                      </div>
                    )}
                    {!o.paymentProofUrl && (
                      <Badge tone="muted">مرفعش إيصال</Badge>
                    )}
                  </Cell>
                  <Cell className="whitespace-nowrap text-ivory/45">
                    {fmtDate(o.createdAt, true)}
                    <div className="text-[11px] text-ivory/35">({fmtLastSeen(o.createdAt, false)})</div>
                  </Cell>
                  <Cell>
                    {o.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <Btn
                          tone="ok" size="sm" icon={Check}
                          loading={activating && busyId === o.id}
                          onClick={() => act(activate, o.id)}
                        >
                          فعّل
                        </Btn>
                        <Btn
                          tone="danger" size="sm" icon={X}
                          loading={cancelling && busyId === o.id}
                          onClick={() => act(cancel, o.id)}
                        >
                          ألغِ
                        </Btn>
                      </div>
                    )}

                    {o.status === 'activated' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="ok">اتفعّل {fmtDate(o.activatedAt)}</Badge>
                        <Btn
                          tone="danger" size="sm" icon={Undo2}
                          loading={cancelling && busyId === o.id}
                          onClick={() => setConfirmId(o.id)}
                        >
                          ألغِ الباقة
                        </Btn>
                      </div>
                    )}

                    {o.status === 'cancelled' && <Badge tone="muted">ملغي</Badge>}
                  </Cell>
                </Row>
              ))}
            </Table>
            {/* نقطة التحميل التلقائي وإحنا بننزل */}
            <div ref={sentinelRef} aria-hidden="true" className="h-1" />
            {isFetching && items.length > 0 && (
              <p className="py-2 text-center text-[12px] text-ivory/40">بيحمّل المزيد...</p>
            )}
            {/* زرار احتياطي — يضمن إن العميل يقدر يجيب باقي الطلبات حتى لو
                التحميل التلقائي ما اشتغلش لأي سبب */}
            {data?.hasMore && !isFetching && (
              <button
                type="button"
                onClick={loadMore}
                className="mx-auto mt-2 flex items-center justify-center gap-1.5 rounded-full border border-ivory/20 px-5 py-2.5 text-[12.5px] font-bold text-ivory/80 transition hover:border-brass/50 hover:text-brass-soft"
              >
                حمّل المزيد ({fmtNum((data?.total || 0) - items.length)} فاضلين)
              </button>
            )}
            {!data?.hasMore && items.length > 0 && (
              <p className="py-2 text-center text-[12px] text-ivory/30">دي كل الطلبات ({fmtNum(items.length)})</p>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
