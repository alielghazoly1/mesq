import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, Receipt, ExternalLink, Undo2, ShieldAlert, CreditCard, MessageCircle, Loader2 } from 'lucide-react';
import { countryLabel } from '../../data/countryLookup.js';
import { whatsappForNumber } from '../../lib/contact.js';
import {
  useGetOrdersQuery, useActivateOrderMutation, useCancelOrderMutation,
  useGetAdminPackagesQuery,
} from '../../store/adminApi.js';
import { setOrdersStatus, openUser } from '../../store/adminSlice.js';
import {
  Panel, Badge, Btn, Table, Row, Cell, Spinner, Empty, Tabs, fmtDate, fmtMoney,
} from '../../components/admin/ui.jsx';

const FILTERS = [
  { value: 'pending', label: 'مستنية' },
  { value: 'activated', label: 'مفعّلة' },
  { value: 'cancelled', label: 'ملغية' },
];

export default function OrdersPage() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.admin.ordersStatus);
  // cursor بيحدّد أنهي صفحة بنجيبها؛ null = من الأول.
  // كل ما ننزل تحت، بنغيّر الـcursor للـ nextCursor اللي رجع من السيرفر،
  // فالكاش بيتلمّ فيه كل الطلبات (merge في adminApi).
  const [cursor, setCursor] = useState(null);
  const { data, isLoading, isFetching } = useGetOrdersQuery({ status, cursor });
  const [activate, { isLoading: activating }] = useActivateOrderMutation();
  const [cancel, { isLoading: cancelling }] = useCancelOrderMutation();
  const { data: pkgData } = useGetAdminPackagesQuery();
  const editDays = pkgData?.editWindowDays || 0;
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  // إلغاء باقة مدفوعة بيسحب رصيد من عميل دافع — تأكيد صريح قبل التنفيذ
  const [confirmId, setConfirmId] = useState(null);
  const [result, setResult] = useState('');

  // تغيّر التبويب: cursor يرجع للأول، والكاش هيتستبدل (merge بيشيك arg.cursor)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status;
      setCursor(null);
    }
  }, [status]);

  // ملاحظ آخر صف بيدخل الشاشة → نجيب الصفحة اللي بعده تلقائيًا
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !data?.hasMore || isFetching) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && data.nextCursor) {
        setCursor(data.nextCursor);
      }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [data?.hasMore, data?.nextCursor, isFetching]);

  async function act(fn, id) {
    setError('');
    setBusyId(id);
    try {
      await fn(id).unwrap();
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
        title={data ? `${data.orders.length}${data.hasMore ? '+' : ''} طلب` : 'الطلبات'}
        subtitle={isFetching && !cursor ? 'بيحدّث...' : undefined}
        action={<Tabs value={status} onChange={(v) => dispatch(setOrdersStatus(v))} options={FILTERS} />}
      >
        {isLoading ? <Spinner /> : !data || data.orders.length === 0 ? (
          <Empty>مفيش طلبات هنا.</Empty>
        ) : (
          <Table head={['العميل', 'الباقة', 'المبلغ', 'الإيصال', 'التاريخ', '']}>
            {data.orders.map((o) => (
              <Row key={o.id}>
                <Cell>
                  <button
                    type="button"
                    onClick={() => dispatch(openUser(o.userId))}
                    className="font-bold text-ivory hover:text-brass-soft"
                  >
                    {o.user.name}
                  </button>
                  <div className="text-[11px] text-ivory/40">
                    {o.user.email} · {countryLabel(o.user.country, 'ar')}
                  </div>
                  {(() => {
                    const wa = whatsappForNumber(o.user.phone);
                    if (!wa) return null;
                    return (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[10.5px] font-bold text-emerald hover:bg-emerald/25"
                      >
                        <MessageCircle size={10} /> <span dir="ltr">{o.user.phone}</span>
                      </a>
                    );
                  })()}
                </Cell>
                <Cell>
                  {o.packageName}
                  <div className="text-[11px] text-ivory/40">{o.invitations} دعوة</div>
                </Cell>
                <Cell className="whitespace-nowrap font-bold text-brass-soft">
                  {fmtMoney(o.price, o.currency)}
                </Cell>
                <Cell>
                  {o.paymentMethod === 'xpay' ? (
                    <Badge tone="ok">
                      <span className="inline-flex items-center gap-1"><CreditCard size={11} /> فيزا · XPay</span>
                    </Badge>
                  ) : o.paymentProofUrl ? (
                    <a
                      href={o.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brass-soft hover:underline"
                    >
                      <Receipt size={12} /> شوف الصورة <ExternalLink size={10} />
                    </a>
                  ) : (
                    <Badge tone="muted">مرفعش إيصال</Badge>
                  )}
                </Cell>
                <Cell className="whitespace-nowrap text-ivory/45">{fmtDate(o.createdAt, true)}</Cell>
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

                  {/* الإلغاء بعد الدفع: بيسحب الرصيد من العميل كمان */}
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
        )}

        {/* Sentinel لجلب الصفحة اللي بعد كل ما نوصلها بالسكرول */}
        {data?.hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4 text-[12.5px] text-ivory/45">
            {isFetching ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> بنجيب المزيد...
              </span>
            ) : 'اسحب لتحت للمزيد'}
          </div>
        )}
      </Panel>
    </div>
  );
}
