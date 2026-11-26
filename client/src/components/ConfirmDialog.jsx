// رسالة تأكيد شيك في نص الشاشة بدل window.confirm (طلب المالك 2026-11-27): خلفية شفافة مضبّبة، كارت في
// النص، زرار التأكيد بلونه (أحمر للمسح)، و"لأ". بتشتغل بالكيبورد (Esc = لأ، Enter = تأكيد) وبتقفل لو
// ضغطت برّه الكارت. الاستخدام:
//   const confirm = useConfirm();
//   if (!(await confirm({ title, message, confirmText, tone: 'danger' }))) return;
// (ConfirmProvider ملفوف حوالين التطبيق في App.jsx)
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Ctx = createContext(null);

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null); // { title, message, confirmText, cancelText, tone, resolve }
  const confirm = useCallback((opts) => new Promise((resolve) => setReq({ ...opts, resolve })), []);
  const close = (value) => { if (req) req.resolve(value); setReq(null); };
  return (
    <Ctx.Provider value={confirm}>
      {children}
      {createPortal(<Dialog req={req} onClose={close} />, document.body)}
    </Ctx.Provider>
  );
}

/** بيرجّع دالة confirm(opts) → Promise<boolean>. من غير Provider بترجع لـ window.confirm (أمان) */
export function useConfirm() {
  const fn = useContext(Ctx);
  return fn || ((o) => Promise.resolve(window.confirm(o && (o.message || o.title))));
}

function Dialog({ req, onClose }) {
  const { t, i18n } = useTranslation();
  const okRef = useRef(null);
  const ar = i18n.language !== 'en';
  useEffect(() => {
    if (!req) return undefined;
    const prev = document.activeElement;
    const tm = setTimeout(() => okRef.current && okRef.current.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(tm); window.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); };
  }, [req, onClose]);
  const danger = req && req.tone === 'danger';
  const Icon = danger ? AlertTriangle : HelpCircle;
  return (
    <AnimatePresence>
      {req && (
        <motion.div
          key="confirm"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-night/45 p-5 backdrop-blur-[6px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false); }}
          dir={ar ? 'rtl' : 'ltr'}
        >
          <motion.div
            role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-msg"
            className="w-full max-w-[400px] rounded-[26px] border border-white/40 bg-white/85 p-6 text-center shadow-[0_30px_80px_-30px_rgba(15,29,24,.55)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-error/10 text-error' : 'bg-brass/15 text-brass'}`}>
              <Icon size={22} />
            </div>
            <h2 id="cd-title" className="font-serif text-[18px] font-bold text-ink">{req.title}</h2>
            {req.message && <p id="cd-msg" className="mt-2 text-[13.5px] leading-[1.85] text-ink-dim">{req.message}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="rounded-full border border-line px-6 py-2.5 text-[13.5px] font-bold text-ink hover:border-ink/30"
              >
                {req.cancelText || t('common.cancel', ar ? 'لأ، رجوع' : 'Cancel')}
              </button>
              <button
                ref={okRef}
                type="button"
                onClick={() => onClose(true)}
                className={`rounded-full px-6 py-2.5 text-[13.5px] font-extrabold text-white shadow-sm ${danger ? 'bg-error hover:brightness-110' : 'bg-night hover:bg-emerald'}`}
              >
                {req.confirmText || (ar ? 'أيوه، متأكد' : 'Yes, continue')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
