// بيانات الدفع اللي بتظهر للعميل بعد ما يطلب باقة.
// المصريين بيشوفوا فودافون كاش، وغيرهم بيشوفوا الحساب البنكي.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Save, Smartphone, Landmark, MessageCircle, Check, CreditCard, AlertTriangle,
} from 'lucide-react';
import {
  useGetPaymentSettingsQuery, useSavePaymentSettingsMutation, useLazyDiagnoseXpayQuery,
} from '../../store/adminApi.js';
import { Panel, Btn, Field, Spinner, fmtDate } from '../../components/admin/ui.jsx';

// صف في checklist متغيّرات XPay — علامة صح/غلط + الاسم + القيمة المختصرة
function DiagRow({ ok, label, value }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-ivory/70">
        <span className={ok ? 'text-ok' : 'text-error'}>{ok ? '✓' : '✗'}</span>
        {label}
      </span>
      <span dir="ltr" className="truncate font-mono text-[10.5px] text-ivory/45">{value}</span>
    </li>
  );
}

export default function SettingsPage() {
  const { data, isLoading } = useGetPaymentSettingsQuery();
  const [save, { isLoading: saving, isSuccess }] = useSavePaymentSettingsMutation();
  const [runDiagnose, { data: diag, isFetching: diagBusy }] = useLazyDiagnoseXpayQuery();
  const { register, handleSubmit, reset, formState } = useForm({ defaultValues: {} });

  useEffect(() => {
    if (data) {
      reset({
        vodafone: data.vodafone || {},
        bank: data.bank || {},
        whatsapp: data.whatsapp || '',
        xpayEnabled: data.xpayEnabled !== false,
      });
    }
  }, [data, reset]);

  if (isLoading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit((v) => save(v))} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">بيانات الدفع</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            دي البيانات اللي العميل بيشوفها بالظبط لما يطلب باقة.
            {data?.updatedAt && ` آخر تعديل: ${fmtDate(data.updatedAt, true)}`}
          </p>
        </div>
        <Btn
          tone="gold"
          icon={isSuccess && !formState.isDirty ? Check : Save}
          loading={saving}
          onClick={handleSubmit((v) => save(v))}
        >
          {isSuccess && !formState.isDirty ? 'اتحفظ' : 'احفظ التعديلات'}
        </Btn>
      </div>

      {/* الدفع بالفيزا (XPay) — الطريقة الأوتوماتيكية */}
      <Panel title="الدفع بالفيزا (XPay)" subtitle="دفع أوتوماتيك بالبطاقة — بيتفعّل لوحده بعد الدفع">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-ivory/[0.04] p-3.5">
          <input type="checkbox" {...register('xpayEnabled')} className="h-5 w-5 shrink-0 accent-emerald" />
          <span className="flex items-center gap-2 text-[13.5px] font-bold text-ivory">
            <CreditCard size={15} className="text-brass-soft" /> تفعيل الدفع بالفيزا للعملاء
          </span>
        </label>

        {data?.xpayConfigured ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-ok/[0.08] p-3 text-[11.5px] text-ok">
            <Check size={13} className="mt-0.5 shrink-0" />
            مفاتيح XPay متظبطة في السيرفر ✓ — الدفع بالفيزا شغّال (طول ما الخيار فوق مفعّل).
          </p>
        ) : (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-brass/[0.1] p-3 text-[11.5px] text-brass-soft">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            مفاتيح XPay لسه مش متظبطة في إعدادات السيرفر (متغيّرات XPAY_ في env). لحد ما تتحط،
            الدفع بالفيزا مش هيبان للعملاء حتى لو الخيار مفعّل — والموقع بيرجع للتحويل اليدوي عادي.
          </p>
        )}

        {/* اختبار الاتصال — بيوري السبب الحقيقي لأي فشل في الدفع بالفيزا */}
        <div className="mt-3 border-t border-ivory/10 pt-3">
          <Btn tone="ghost" size="sm" loading={diagBusy} onClick={() => runDiagnose()}>
            اختبر اتصال XPay
          </Btn>
          {diag && (
            <div className="mt-3 space-y-3">
              {/* المتغيّرات اللي في السيرفر — تتأكد إن اللي حطيته في Hostinger واصل */}
              <div className="rounded-xl bg-ivory/[0.04] p-3">
                <div className="mb-2 text-[11px] font-bold text-ivory/60">المتغيّرات اللي وصلت للسيرفر:</div>
                <ul className="space-y-1.5 text-[11.5px]">
                  <DiagRow ok={diag.config?.enabledFlag} label="التشغيل (XPAY_ENABLED)" value={diag.config?.enabledFlag ? 'مفعّل' : 'مش true'} />
                  <DiagRow ok={!!diag.config?.apiBase} label="عنوان الـ API" value={diag.config?.apiBase} />
                  <DiagRow ok={diag.config?.hasSecretKey} label="المفتاح السري (sk_)" value={diag.config?.secretKeyPrefix || 'فاضي'} />
                  <DiagRow ok={diag.config?.hasPublishableKey} label="المفتاح العلني (pk_)" value={diag.config?.hasPublishableKey ? 'موجود' : 'فاضي'} />
                  <DiagRow ok={diag.config?.hasWebhookSecret} label="سر الـ webhook (whsec_)" value={diag.config?.hasWebhookSecret ? 'موجود' : 'فاضي'} />
                </ul>
              </div>

              {/* نتيجة اختبار الاتصال الفعلي */}
              <div className={`rounded-xl p-3 text-[12px] ${diag.test?.ok ? 'bg-ok/[0.1] text-ok' : 'bg-error/[0.1] text-error'}`}>
                {diag.test?.ok ? (
                  <div className="font-bold">✓ الاتصال بـ XPay نجح — الدفع بالفيزا شغّال. جرّب دفعة حقيقية من صفحة باقة.</div>
                ) : (
                  <>
                    <div className="mb-1 font-bold">✗ الاتصال فشل:</div>
                    <p dir="ltr" className="whitespace-pre-wrap break-words font-mono text-[10.5px] leading-relaxed opacity-90">
                      {diag.test?.message}
                    </p>
                    <p className="mt-2 text-ivory/50">لو مش واضح، انسخ ده وابعتهولي.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="فودافون كاش" subtitle="بيظهر للعملاء المصريين">
          <div className="space-y-3.5">
            <Field label="رقم المحفظة" placeholder="01xxxxxxxxx" {...register('vodafone.number')} />
            <Field label="اسم صاحب المحفظة" {...register('vodafone.holderName')} />
            <Field label="ملاحظة للعميل" placeholder="اكتب اسمك في تعليق التحويل..." {...register('vodafone.note')} />
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-ivory/[0.04] p-3 text-[11.5px] text-ivory/50">
            <Smartphone size={13} className="mt-0.5 shrink-0" />
            العميل بيحوّل وبيرفع صورة التحويل من الموقع، وبتوصلك في قسم الطلبات.
          </p>
        </Panel>

        <Panel title="الحساب البنكي" subtitle="بيظهر لأي عميل برّه مصر">
          <div className="space-y-3.5">
            <Field label="اسم البنك" {...register('bank.bankName')} />
            <Field label="اسم الحساب بالعربي" {...register('bank.accountNameAr')} />
            <Field label="اسم الحساب بالإنجليزي" {...register('bank.accountNameEn')} />
            <Field label="رقم الحساب" {...register('bank.accountNumber')} />
            <Field label="IBAN" {...register('bank.iban')} />
            <Field label="SWIFT / BIC" {...register('bank.swift')} />
            <Field label="عنوان البنك" {...register('bank.address')} />
            <Field label="ملاحظة للعميل" {...register('bank.note')} />
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-ivory/[0.04] p-3 text-[11.5px] text-ivory/50">
            <Landmark size={13} className="mt-0.5 shrink-0" />
            اسم الحساب بيظهر بالعربي والإنجليزي مع العنوان — زي ما البنوك بتطلب في التحويلات الدولية.
          </p>
        </Panel>
      </div>

      <Panel title="واتساب الدعم" subtitle="لو حطيته، بيظهر للعميل كطريقة تواصل سريعة">
        <Field label="رقم الواتساب (بكود الدولة)" placeholder="201xxxxxxxxx" {...register('whatsapp')} />
        <p className="mt-3 flex items-start gap-2 text-[11.5px] text-ivory/45">
          <MessageCircle size={13} className="mt-0.5 shrink-0" />
          سيبه فاضي لو مش عايز تعرض رقم — خانة الدعم جوه الموقع بتفضل شغالة عادي.
        </p>
      </Panel>
    </form>
  );
}
