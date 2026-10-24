import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';

// زرار مشاركة لينك معاينة التصميم (جنب "شوف الدعوة" في كل كارت).
// على الموبايل بيفتح قايمة المشاركة بتاعة الموبايل نفسه (واتساب، إنستجرام…).
// على الكمبيوتر بيفتح قايمة صغيرة: واتساب أو نسخ اللينك.

const coarse = () => {
  try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
};

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // متصفحات قديمة / صفحة مش آمنة
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function ShareDesignButton({ template, className = '' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef(null);
  const url = `${window.location.origin}/preview-sample/${template.id}`;
  const text = t('gallery.shareText', { name: template.name });

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away, true);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away, true); document.removeEventListener('keydown', esc); };
  }, [open]);

  async function onShare() {
    if (coarse() && navigator.share) {
      try {
        await navigator.share({ title: template.name, text, url });
        return;
      } catch (e) {
        // المستخدم قفل القايمة — خلاص. أي خطأ تاني: نوريه البديل
        if (e && e.name === 'AbortError') return;
      }
    }
    setCopied(false);
    setOpen((v) => !v);
  }

  async function onCopy() {
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1400);
    }
  }

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        onClick={onShare}
        aria-label={t('gallery.share')}
        title={t('gallery.share')}
        aria-expanded={open}
        data-share-design={template.id}
        className="flex h-full min-h-[33px] w-[33px] items-center justify-center rounded-full border border-line text-ink-dim transition hover:border-brass/50 hover:text-ink sm:min-h-[38px] sm:w-[38px]"
      >
        <Share2 size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            data-share-menu
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-[calc(100%+8px)] end-0 z-30 w-[150px] sm:w-[176px] overflow-hidden rounded-2xl border border-line bg-card p-1.5 text-start shadow-[0_18px_40px_-14px_rgba(8,19,15,.45)]"
          >
            <a
              role="menuitem"
              href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-bold text-ink transition hover:bg-ink/5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1da851]"><MessageCircle size={14} /></span>
              {t('gallery.shareWhatsapp')}
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={onCopy}
              data-share-copy
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-bold text-ink transition hover:bg-ink/5"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${copied ? 'bg-emerald/15 text-emerald' : 'bg-brass/15 text-[#8a6a20]'}`}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </span>
              {copied ? t('gallery.shareCopied') : t('gallery.shareCopy')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
