// تبويب إنستاباي للعميل المصري (جنب فودافون كاش). البيانات من لوحة التحكم
// ← بيانات الدفع ← إنستاباي:
//   • على الموبايل: زرار "ادفع بإنستاباي" بيفتح لينك المالك (ipn.eg) فالتطبيق
//     بيتفتح على عنوانه على طول — العميل يكتب المبلغ ويأكّد.
//   • على الكمبيوتر: QR من نفس اللينك يصوّره بكاميرا موبايله.
//   • والعنوان (xxx@instapay) قدامه للنسخ لو حب يكتبه بإيده.
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

const PURPLE = '#5a2a82';

export default function InstaPay({ info, CopyTile, amount }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#5a2a82]/20 bg-[#5a2a82]/[0.035]" data-instapay>
      <div className="flex items-center gap-3 border-b border-[#5a2a82]/12 bg-white px-4 py-3.5">
        <img src="/img/instapay-logo.webp" alt="InstaPay" width={48} height={48} className="h-12 w-12 rounded-xl ring-1 ring-[#5a2a82]/10" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-[16px] font-extrabold" style={{ color: PURPLE }} dir="ltr">InstaPay</span>
          <span className="text-[11.5px] font-bold text-ink-dim">{t('instapay.tagline')}</span>
        </span>
      </div>

      <div className="p-4">
        {info.link && (
          <>
            <a
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-extrabold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]"
              style={{ background: `linear-gradient(90deg, ${PURPLE}, #7b3fa8)` }}
              data-instapay-open
            >
              {t('instapay.open')} <span>{amount}</span> <ExternalLink size={15} />
            </a>
            <p className="mt-2 text-center text-[11.5px] leading-relaxed text-ink-dim">{t('instapay.openHint')}</p>
          </>
        )}

        {/* على الكمبيوتر: يصوّر الكود بموبايله — على الموبايل الزرار كفاية */}
        {info.qr && (
          <div className="mt-3 hidden flex-col items-center sm:flex">
            <img src={info.qr} alt="InstaPay QR" width={150} height={150} className="rounded-xl border border-line bg-white p-2" style={{ imageRendering: 'pixelated' }} />
            <p className="mt-1.5 text-[11.5px] text-ink-dim">{t('instapay.scan')}</p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {info.address && <CopyTile label={t('instapay.address')} value={info.address} wide />}
          {info.name && <CopyTile label={t('instapay.name')} value={info.name} wide />}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald/[0.07] px-4 py-3">
          <span className="text-[12.5px] font-bold text-emerald">{t('checkout.amountToSend')}</span>
          <span className="font-serif text-[18px] font-bold text-emerald">{amount}</span>
        </div>
        {info.note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{info.note}</p>}
      </div>
    </div>
  );
}
