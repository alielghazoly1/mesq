// طرق دفع العملاء في السعودية (بالريال) — بتظهر في صفحة الدفع مكان طرق
// الدفع الدولية. كل طريقة بتظهر بس لو المالك مفعّلها وكاتب بياناتها من
// لوحة التحكم ← بيانات الدفع ← السعودية:
//   • تحويل بنكي (حساب سعودي — IBAN)
//   • برق (تحويل لرقم الجوال/المحفظة)
//   • فودافون كاش (تحويل دولي على المحفظة المصرية)
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, Zap, Wallet } from 'lucide-react';

export default function SaudiPay({ info, CopyTile, amount }) {
  const { t } = useTranslation();
  const tabs = [
    ...(info.saBank ? [{ key: 'bank', icon: Landmark, label: t('saPay.bank'), tone: 'bg-white text-ink shadow-sm' }] : []),
    ...(info.barq ? [{ key: 'barq', icon: Zap, label: t('saPay.barq'), tone: 'bg-[#4b2fd1] text-white shadow-sm' }] : []),
    ...(info.wallet ? [{ key: 'wallet', icon: Wallet, label: t('saPay.wallet'), tone: 'bg-[#E60000] text-white shadow-sm' }] : []),
  ];
  const [tab, setTab] = useState(tabs[0] ? tabs[0].key : 'bank');
  const active = tabs.some((x) => x.key === tab) ? tab : (tabs[0] && tabs[0].key);
  if (!tabs.length) return null;

  const amountRow = (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald/25 bg-emerald/[0.06] px-3.5 py-2.5">
      <span className="text-[12px] font-bold text-emerald">{t('saPay.amount')}</span>
      <span className="text-[15px] font-extrabold text-emerald" dir="ltr">{amount}</span>
    </div>
  );

  return (
    <div>
      {tabs.length > 1 && (
        <div className={`mb-4 grid gap-1.5 rounded-2xl bg-ink/[0.05] p-1 ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="tablist">
          {tabs.map(({ key, icon: Icon, label, tone }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold transition ${active === key ? tone : 'text-ink-dim'}`}
            >
              <Icon size={15} /> <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      )}

      {active === 'bank' && info.saBank && (
        <>
          {tabs.length === 1 && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-[12.5px] font-bold text-ink">
              <Landmark size={16} /> {t('saPay.bankTitle')}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <CopyTile label={t('saPay.iban')} value={info.saBank.iban} wide />
            <CopyTile label={t('saPay.bankName')} value={info.saBank.bankName} />
            <CopyTile label={t('saPay.accountName')} value={info.saBank.accountName} />
            {info.saBank.accountNumber && <CopyTile label={t('saPay.accountNumber')} value={info.saBank.accountNumber} wide />}
          </div>
          {amountRow}
          {info.saBank.note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{info.saBank.note}</p>}
        </>
      )}

      {active === 'barq' && info.barq && (
        <div className="rounded-2xl border-2 border-[#4b2fd1]/20 bg-[#4b2fd1]/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4b2fd1] text-white shadow-sm"><Zap size={19} /></span>
            <div>
              <div className="text-[14px] font-extrabold text-ink">{t('saPay.barqTitle')}</div>
              <div className="text-[11.5px] font-bold text-ink-dim">{t('saPay.barqHow')}</div>
            </div>
          </div>
          <div className="grid gap-2.5">
            <CopyTile label={t('saPay.barqPhone')} value={info.barq.phone} wide />
            {info.barq.name && <CopyTile label={t('saPay.recipient')} value={info.barq.name} wide />}
          </div>
          {amountRow}
          {info.barq.note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{info.barq.note}</p>}
        </div>
      )}

      {active === 'wallet' && info.wallet && (
        <div className="rounded-2xl border-2 border-[#E60000]/20 bg-[#E60000]/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E60000] text-white shadow-sm"><Wallet size={18} /></span>
            <div>
              <div className="text-[14px] font-extrabold text-ink">{t('saPay.walletTitle')}</div>
              <div className="text-[11.5px] font-bold text-ink-dim">{t('saPay.walletHow')}</div>
            </div>
          </div>
          <div className="grid gap-2.5">
            <CopyTile label={t('saPay.walletNumber')} value={info.wallet.number} wide />
            {info.wallet.name && <CopyTile label={t('saPay.recipient')} value={info.wallet.name} wide />}
          </div>
          {amountRow}
          {info.wallet.note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{info.wallet.note}</p>}
        </div>
      )}
      <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('checkout.tapToCopy')}</p>
    </div>
  );
}
