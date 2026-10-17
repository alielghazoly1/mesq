// تبويب "برق" للعميل اللي في السعودية — أول طريقة في صفحة الدفع بتاعته.
// برق بيحوّل دولي لمصر على محفظة الجوال: تحويل دولي ← تحويل إلى مستفيد ←
// مصر ← محفظة الجوال ← ميزة، وبيوصل على فودافون كاش بتاع المالك.
// الرقم والاسم من لوحة التحكم ← بيانات الدفع ← برق.
import { useTranslation } from 'react-i18next';

export default function BarqPay({ barq, CopyTile, amount }) {
  const { t } = useTranslation();
  const steps = t('saPay.steps', { returnObjects: true });
  return (
    <div className="mt-4 rounded-2xl border border-line bg-ink/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <img src="/img/barq-logo.svg" alt="barq" className="h-11 w-11 rounded-[11px] shadow-sm" />
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-extrabold text-ink">{t('saPay.barqTitle')}</span>
          <span className="text-[11px] font-bold text-ink-dim">{t('saPay.barqTagline')}</span>
        </span>
      </div>

      {/* الخطوات جوه التطبيق بالترتيب — العميل يمشي عليها زرار زرار */}
      <ol className="mb-3 space-y-1.5 rounded-xl bg-ink/[0.04] px-3.5 py-3" data-barq-steps>
        {Array.isArray(steps) && steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink">
            <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10.5px] font-extrabold text-white">{i + 1}</span>
            <span className="font-bold">{s}</span>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-2 gap-2.5">
        <CopyTile label={t('saPay.walletNumber')} value={barq.phone} wide />
        {barq.name && <CopyTile label={t('saPay.recipient')} value={barq.name} wide />}
      </div>
      <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('checkout.tapToCopy')}</p>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald/[0.07] px-4 py-3">
        <span className="text-[12.5px] font-bold text-emerald">{t('checkout.amountToSend')}</span>
        <span className="font-serif text-[18px] font-bold text-emerald">{amount}</span>
      </div>
      {barq.note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{barq.note}</p>}
    </div>
  );
}
