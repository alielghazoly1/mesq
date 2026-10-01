// نافذة اختيار نسخة اللغة — للقوالب اللي ليها نسختين (templates/registry.js:
// designLanguages)، زي Lily Garden: إنجليزي (التصميم الأصلي) وعربي.
//
// بتظهر للعميل المشترك لما يضغط "استخدم القالب": بيشوف النسختين جنب بعض
// (صورة أول صفحة من كل واحدة)، يقدر يعاين أي واحدة، ويختار — والمسودة
// بتتعمل باللغة دي وبيدخل المحرر على طول.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { X, Check, Eye, Wand2, Loader2, Languages } from 'lucide-react';

const LABELS = {
  en: { name: 'langEn', note: 'langEnNote' },
  ar: { name: 'langAr', note: 'langArNote' },
};

export default function DesignLanguagePicker({ template, busy, error, onPick, onClose }) {
  const { t } = useTranslation();
  const langs = (template.designLanguages || []).filter((l) => LABELS[l]);
  const [picked, setPicked] = useState(langs[0] || 'en');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [busy, onClose]);

  // بره الكارت (portal): الكارت بيتحرك بـ transform، وأي عنصر fixed جوه
  // عنصر عليه transform بيتحسب مكانه منه هو مش من الشاشة — فالنافذة كانت
  // هتطلع جوه الكارت ومقصوصة
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !busy && onClose()}
      className="fixed inset-0 z-[160] flex items-end justify-center bg-night/70 backdrop-blur-sm sm:items-center sm:p-5"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('gallery.langTitle')}
        className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-[26px] bg-card px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:rounded-[26px] sm:p-7"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass">
            <Languages size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[19px] font-bold text-ink">{t('gallery.langTitle')}</div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-dim">{t('gallery.langSubtitle')}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label={t('gallery.langCancel')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink disabled:opacity-40">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4" role="radiogroup">
          {langs.map((lang) => {
            const on = picked === lang;
            return (
              <div key={lang} className="flex flex-col">
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPicked(lang)}
                  className={`group relative flex flex-col items-center rounded-[20px] border-2 p-2.5 pb-3 text-center transition ${
                    on ? 'border-brass bg-brass/[0.07] shadow-[0_14px_30px_-18px_rgba(150,110,30,.9)]' : 'border-line hover:border-brass/40'
                  }`}
                >
                  <span className="relative block aspect-[9/14] w-full overflow-hidden rounded-[14px] border-[3px] border-[#050b08] bg-[#050b08]">
                    <img
                      src={`/img/template-thumbs/${template.id}-${lang}.jpg`}
                      alt={t(`gallery.${LABELS[lang].name}`)}
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                      onError={(e) => { e.currentTarget.src = `/img/template-thumbs/${template.id}.jpg`; }}
                    />
                  </span>
                  <span className={`mt-2.5 text-[15px] font-extrabold ${on ? 'text-ink' : 'text-ink/80'}`}>
                    {t(`gallery.${LABELS[lang].name}`)}
                  </span>
                  <span className="text-[11.5px] text-ink-dim">{t(`gallery.${LABELS[lang].note}`)}</span>
                  <span className={`absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                    on ? 'border-brass bg-brass text-[#241608]' : 'border-white/80 bg-night/40 text-transparent'
                  }`}
                  >
                    <Check size={15} strokeWidth={3} />
                  </span>
                </button>
                <a
                  href={`/preview-sample/${template.id}?lang=${lang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[12px] font-bold text-ink-dim transition hover:text-brass"
                >
                  <Eye size={13} /> {t('gallery.langPreview')}
                </a>
              </div>
            );
          })}
        </div>

        {error && <p className="mt-3 text-center text-[12.5px] font-bold text-error">{error}</p>}

        <button
          type="button"
          onClick={() => onPick(picked)}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft py-3.5 text-[14px] font-extrabold text-[#241608] shadow-[0_10px_24px_-12px_rgba(150,110,30,.9)] transition hover:brightness-105 disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {t('gallery.langStart')} — {t(`gallery.${LABELS[picked].name}`)}
        </button>
      </motion.div>
    </motion.div>,
    document.body
  );
}
