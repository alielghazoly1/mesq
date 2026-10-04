// بيانات الدفع اللي بتظهر للعميل بعد ما يطلب باقة.
// المصريين بيشوفوا فودافون كاش، وغيرهم بيشوفوا الحساب البنكي.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Smartphone, Landmark, MessageCircle, Check } from 'lucide-react';
import {
  useGetPaymentSettingsQuery, useSavePaymentSettingsMutation,
} from '../../store/adminApi.js';
import { Panel, Btn, Field, Spinner, fmtDate } from '../../components/admin/ui.jsx';
import { countryName } from './format.js';
import { VodafoneMark } from '../../components/PayBrand.jsx';

export default function SettingsPage() {
  const { data, isLoading } = useGetPaymentSettingsQuery();
  const [save, { isLoading: saving, isSuccess, error: saveError }] = useSavePaymentSettingsMutation();
  const { register, handleSubmit, reset, formState } = useForm({ defaultValues: {} });

  useEffect(() => {
    if (data) {
      reset({
        vodafone: data.vodafone || {},
        bank: data.bank || {},
        kast: data.kast || { enabled: false, link: '', holderName: '', note: '' },
        usdt: data.usdt || { enabled: false, address: '', note: '' },
        taptap: data.taptap || { enabled: false, phone: '', recipientName: '', location: '', note: '' },
        whatsapp: data.whatsapp || '',
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

      {/* السيرفر بيرفض عنوان محفظة غلط — الرسالة بتظهر هنا */}
      {saveError && (
        <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">
          {saveError?.data?.error || 'الحفظ فشل، جرّب تاني.'}
        </div>
      )}

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

      <Panel title="KAST (وسيلة دفع عالمية)" subtitle="بتظهر جنب الحساب البنكي للعملاء برّه مصر — فعّلها أو اقفلها وقت ما تحب">
        <label className="mb-3.5 flex cursor-pointer items-center gap-2.5 rounded-xl border border-ivory/10 bg-ivory/[0.03] p-3">
          <input type="checkbox" {...register('kast.enabled')} className="h-4 w-4 accent-brass" />
          <span className="text-[13px] font-bold text-ivory">اعرض KAST للعملاء</span>
          <span className="text-[11.5px] text-ivory/40">— لو اتقفلت، مش هتظهر خالص</span>
        </label>
        <div className="space-y-3.5">
          <Field label="لينك KastTag" placeholder="https://app.kast.xyz/kasttag/user_..." {...register('kast.link')} />
          <Field label="اسم صاحب الحساب (اختياري)" {...register('kast.holderName')} />
          <Field label="ملاحظة للعميل (اختياري)" placeholder="اكتب اسمك في الملاحظة عند التحويل..." {...register('kast.note')} />
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-ivory/[0.04] p-3 text-[11.5px] text-ivory/50">
          <Landmark size={13} className="mt-0.5 shrink-0" />
          العميل بيشوف لوجو KAST + QR بيتولّد من اللينك تلقائيًا + اللينك نفسه. غيّر اللينك أي وقت والـ QR بيتغيّر معاه.
        </p>
      </Panel>

      <Panel
        title="Taptap Send (تحويل على فودافون كاش)"
        subtitle="بتظهر بس للعملاء المسجّلين من البلاد اللي التطبيق بيبعت منها لمصر"
        action={(
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pe-3 ps-1" dir="ltr">
            <VodafoneMark size={18} />
            <span className="text-[11px] font-extrabold text-[#E60000]">Vodafone Cash</span>
          </span>
        )}
      >
        <label className="mb-3.5 flex cursor-pointer items-center gap-2.5 rounded-xl border border-ivory/10 bg-ivory/[0.03] p-3">
          <input type="checkbox" {...register('taptap.enabled')} className="h-4 w-4 accent-brass" />
          <img src="/img/taptap-logo.svg" alt="" className="h-5 w-5 rounded-full" />
          <span className="text-[13px] font-bold text-ivory">اعرض Taptap Send للعملاء</span>
          <span className="text-[11.5px] text-ivory/40">— لو اتقفلت، مش هتظهر خالص</span>
        </label>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="رقم فودافون كاش" dir="ltr" placeholder="01xxxxxxxxx" {...register('taptap.phone')} />
          <Field label="اسم المستلم (زي ما هيكتبه العميل في التطبيق)" {...register('taptap.recipientName')} />
          <Field label="مكان المستلم (المدينة/المحافظة)" placeholder="القاهرة، مصر" {...register('taptap.location')} />
          <Field label="ملاحظة للعميل (اختياري)" placeholder="ابعت صورة التحويل بعد ما تحوّل..." {...register('taptap.note')} />
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-ivory/[0.04] p-3 text-[11.5px] leading-relaxed text-ivory/50">
          <Landmark size={13} className="mt-0.5 shrink-0" />
          <span>
            العميل بيشوف لوجو Taptap Send + الرقم والاسم والمكان (كل واحد بينتسخ بضغطة) + المبلغ + زرار يفتح التطبيق.
            بتظهر لعملاء {data?.taptapCountries?.length || 33} دولة بس: {(data?.taptapCountries || []).map((c) => countryName(c)).join('، ')}.
          </span>
        </p>
      </Panel>

      <Panel title="USDT على شبكة Solana" subtitle="وسيلة تالتة للعملاء برّه مصر بس — جنب البنك و KAST">
        <label className="mb-3.5 flex cursor-pointer items-center gap-2.5 rounded-xl border border-ivory/10 bg-ivory/[0.03] p-3">
          <input type="checkbox" {...register('usdt.enabled')} className="h-4 w-4 accent-brass" />
          <img src="/img/usdt-logo.svg" alt="" className="h-5 w-5" />
          <span className="text-[13px] font-bold text-ivory">اعرض USDT للعملاء</span>
          <span className="text-[11.5px] text-ivory/40">— لو اتقفلت، مش هتظهر خالص</span>
        </label>
        <div className="space-y-3.5">
          <Field label="عنوان المحفظة (Solana)" dir="ltr" className="font-mono" placeholder="DQZ5mr...p1Ec" {...register('usdt.address')} />
          <Field label="ملاحظة للعميل (اختياري)" placeholder="ابعت صورة التحويل بعد ما تبعت..." {...register('usdt.note')} />
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-ivory/[0.04] p-3 text-[11.5px] text-ivory/50">
          <Landmark size={13} className="mt-0.5 shrink-0" />
          العميل بيشوف لوجو USDT + شبكة Solana + QR بالعنوان + زرار نسخ، وتحذير إنه يبعت على Solana بس.
          السيرفر بيرفض أي عنوان مش بصيغة Solana عشان فلوس العميل ماتضيعش.
        </p>
      </Panel>

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
