// تبويب "SEPA" — تحويل بنكي باليورو لعملاء أوروبا اللي بيدفعوا باليورو بس
// (السيرفر بيبعته ليهم بس: utils/paymentSettings.js ← sepaAllowed). أول تبويب عندهم.
//
// الحساب = حساب اليورو بتاع المالك على تطبيق KAST (آيبان مالطي من OpenPayd).
// KAST بتستقبل SEPA بس (مش SWIFT)، وقالت: المرجع (Reference) يتكتب بس لو بنك
// العميل طلبه — فبنقوله يسيبه فاضي، ولو بنكه أصرّ يكتب اسمه.
// من أكتوبر 2025 بنوك منطقة اليورو بتقارن اسم المستفيد بالآيبان قبل التحويل
// (Verification of Payee) — عشان كده الاسم بينتسخ زي ما هو بالظبط، والتنبيه
// تحت بيقوله يعمل إيه لو بنكه قال إنه مش قادر يتأكد من الاسم.
// البيانات نفسها من لوحة التحكم ← بيانات الدفع ← SEPA.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check, Copy, Clock, ShieldCheck, ChevronDown, ChevronUp, AlertTriangle, Info,
} from 'lucide-react';

/** الآيبان بمسافة كل 4 حروف للعرض بس — النسخ بيبقى من غير مسافات */
function groupIban(v) {
  return String(v || '').replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ');
}

/**
 * خانة نسخ كبيرة: العنوان وزرار النسخ في سطر فوق، والقيمة تحتهم بعرض الخانة كله
 * (الاسم والآيبان طوال — جنب الزرار كانوا بيتكسروا على 3 سطور في الموبايل).
 * "اتنسخ ✓" بيظهر مكان زرار النسخ.
 */
function SepaCopy({ label, value, display, mono, field }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      data-sepa-copy={field}
      onClick={() => navigator.clipboard.writeText(String(value)).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 1800); },
        () => {}
      )}
      className={`flex w-full flex-col gap-1.5 rounded-2xl border-[1.5px] px-4 py-3 text-start transition ${
        copied ? 'border-ok bg-ok/[0.06]' : 'border-[#003399]/15 bg-[#f4f6fb] hover:border-[#003399]/45 active:scale-[.99]'
      }`}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[11.5px] font-bold text-ink-dim">{label}</span>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
          copied ? 'bg-ok text-white' : 'bg-[#003399] text-white'
        }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? t('checkout.taptapCopied') : t('checkout.taptapCopy')}
        </span>
      </span>
      <span
        className={`block w-full font-extrabold text-ink ${mono ? 'font-mono text-[clamp(15px,4.6vw,18px)] leading-snug tracking-wide' : 'break-words text-[16px] leading-snug'}`}
        dir="ltr"
        style={{ textAlign: 'left' }}
      >
        {display || value}
      </span>
    </button>
  );
}

export default function SepaPay({ sepa, amount }) {
  const { t } = useTranslation();
  const [more, setMore] = useState(false);
  const steps = t('sepa.steps', { returnObjects: true });
  const hasMore = !!(sepa.bankName || sepa.bankAddress);
  return (
    <div className="mt-4 overflow-hidden rounded-[22px] border border-[#003399]/15 bg-white shadow-[0_18px_40px_-30px_rgba(0,51,153,.55)]" data-sepa>
      {/* الراس: أزرق أوروبا + علامة اليورو (من غير لوجوهات رسمية) */}
      <div className="relative flex items-center justify-between gap-3 overflow-hidden bg-[#003399] px-4 py-3.5 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-12 -end-10 h-32 w-32 rounded-full bg-white/[0.07]" />
        <span className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FFCC00] font-sans text-[21px] font-black leading-none text-[#003399]">€</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[16px] font-extrabold tracking-wide" dir="ltr">SEPA</span>
            <span className="text-[11.5px] font-bold text-white/80">{t('sepa.title')}</span>
          </span>
        </span>
        <span className="relative max-w-[45%] text-end text-[11px] font-bold leading-snug text-white/80">{t('sepa.tagline')}</span>
      </div>

      <div className="p-4">
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#003399]/[0.07] px-2.5 py-1 text-[11px] font-bold text-[#003399]"><Clock size={12} /> {t('sepa.fast')}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#003399]/[0.07] px-2.5 py-1 text-[11px] font-bold text-[#003399]"><ShieldCheck size={12} /> {t('sepa.local')}</span>
        </div>

        {/* إزاي يحوّل — خطوة خطوة من تطبيق البنك */}
        <ol className="mb-4 space-y-2" data-sepa-steps>
          {Array.isArray(steps) && steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12.5px] font-bold leading-relaxed text-ink">
              <span className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-[#003399] text-[11px] font-extrabold text-white">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <div className="space-y-2.5">
          <SepaCopy label={t('sepa.beneficiary')} value={sepa.beneficiary} field="name" />
          <SepaCopy label={t('sepa.iban')} value={sepa.iban} display={groupIban(sepa.iban)} mono field="iban" />
          <SepaCopy label={t('sepa.bic')} value={sepa.bic} mono field="bic" />
        </div>
        <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('checkout.tapToCopy')}</p>

        {/* اسم البنك وعنوانه — SEPA مش محتاجهم في العادة، فمطويين */}
        {hasMore && (
          <>
            <button
              type="button"
              onClick={() => setMore((v) => !v)}
              aria-expanded={more}
              data-sepa-more
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[12px] font-bold text-ink-dim transition hover:border-ink/30 hover:text-ink"
            >
              {more ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {more ? t('sepa.less') : t('sepa.more')}
            </button>
            {more && (
              <div className="mt-2.5 space-y-2.5">
                <SepaCopy label={t('sepa.bank')} value={sepa.bankName} field="bank" />
                <SepaCopy label={t('sepa.bankAddress')} value={sepa.bankAddress} field="address" />
              </div>
            )}
          </>
        )}

        {/* المبلغ — آخر حاجة يشوفها قبل ما يفتح تطبيق البنك */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#003399] px-4 py-3 text-white" data-sepa-amount>
          <span className="flex flex-col">
            <span className="text-[12px] font-bold text-white/80">{t('checkout.amountToSend')}</span>
            <span className="text-[10.5px] leading-snug text-white/65">{t('sepa.amountHint')}</span>
          </span>
          <span className="shrink-0 font-serif text-[22px] font-bold leading-none text-[#FFCC00]" dir="ltr">{amount}</span>
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#f5a524]/[0.12] px-3.5 py-3 text-[12px] font-bold leading-relaxed text-[#8a5a00]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {t('sepa.onlySepa')}
        </p>
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-ink/[0.03] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-dim" data-sepa-vop>
          <Info size={14} className="mt-0.5 shrink-0" /> {t('sepa.vop')}
        </p>
        {sepa.note && (
          <p className="mt-3 rounded-xl bg-ink/[0.03] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-dim">{sepa.note}</p>
        )}
      </div>
    </div>
  );
}
