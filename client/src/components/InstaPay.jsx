// تبويب إنستاباي للعميل المصري (الافتراضي، جنب فودافون كاش). البيانات من
// لوحة التحكم ← بيانات الدفع ← إنستاباي:
//   • زرار كبير متحرك "اضغط هنا للدفع بإنستاباي مباشرةً" بيفتح لينك المالك
//     (ipn.eg) فالتطبيق بيتفتح على حسابه على طول — العميل يكتب المبلغ ويأكّد.
//   • على الكمبيوتر: QR من نفس اللينك يصوّره بكاميرا موبايله.
//   • العنوان والرقم والاسم مخفيين تحت "بيانات إنستاباي" — للي عايز يحوّل بإيده.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PURPLE = '#5a2a82';

// لمعة بتعدّي على الزرار + نبض خفيف حواليه + إيد بتشاور — بتشد العين للزرار.
// كلها بتقف لو الجهاز طالب حركة أقل.
const CSS = `
@keyframes ipShine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%, 100% { transform: translateX(320%) skewX(-20deg); } }
@keyframes ipPulse { 0% { box-shadow: 0 0 0 0 rgba(123,63,168,.55); } 70% { box-shadow: 0 0 0 14px rgba(123,63,168,0); } 100% { box-shadow: 0 0 0 0 rgba(123,63,168,0); } }
@keyframes ipTap { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.08); } }
.ip-cta { animation: ipPulse 2s ease-out infinite; }
.ip-cta .ip-shine { animation: ipShine 2.6s ease-in-out infinite; }
.ip-cta .ip-tap { animation: ipTap 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ip-cta, .ip-cta .ip-shine, .ip-cta .ip-tap { animation: none; } }
`;

export default function InstaPay({ info, CopyTile, amount }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const hasDetails = !!(info.address || info.phone || info.name);
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#5a2a82]/20 bg-[#5a2a82]/[0.035]" data-instapay>
      <style>{CSS}</style>
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
              className="ip-cta relative flex w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl px-4 py-4 text-center text-white transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: `linear-gradient(100deg, ${PURPLE}, #7b3fa8 55%, #f26a21)` }}
              data-instapay-open
            >
              <span aria-hidden className="ip-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/30 blur-[2px]" />
              <span className="relative flex items-center gap-2 text-[15.5px] font-extrabold leading-snug">
                <Hand size={19} className="ip-tap shrink-0 -scale-x-100" />
                {t('instapay.open')}
              </span>
              <span className="relative text-[13px] font-bold text-white/85">{amount}</span>
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

        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald/[0.07] px-4 py-3">
          <span className="text-[12.5px] font-bold text-emerald">{t('checkout.amountToSend')}</span>
          <span className="font-serif text-[18px] font-bold text-emerald">{amount}</span>
        </div>

        {/* البيانات مخفية — بتظهر بس للي عايز يحوّل بإيده */}
        {hasDetails && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              data-instapay-details
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#5a2a82]/20 py-2 text-[12px] font-bold text-[#5a2a82] transition hover:bg-[#5a2a82]/[0.05]"
            >
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {open ? t('instapay.hideDetails') : t('instapay.details')}
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {info.address && <CopyTile label={t('instapay.address')} value={info.address} wide />}
                    {info.phone && <CopyTile label={t('instapay.phone')} value={info.phone} wide />}
                    {info.name && <CopyTile label={t('instapay.name')} value={info.name} wide />}
                  </div>
                  <p className="mt-2 text-center text-[11.5px] text-ink-dim">{t('checkout.tapToCopy')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {info.note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{info.note}</p>}
      </div>
    </div>
  );
}
