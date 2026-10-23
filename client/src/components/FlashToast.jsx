// رسالة صغيرة بتطلع تحت الشاشة وتختفي لوحدها بعد شوية (زي "تم تسجيل الخروج").
// بتتشغّل من أي حتة بـ dispatch(showFlash('...')).
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { hideFlash } from '../store/uiSlice.js';

export default function FlashToast() {
  const dispatch = useDispatch();
  const flash = useSelector((s) => s.ui.flash);

  useEffect(() => {
    if (!flash) return undefined;
    const id = setTimeout(() => dispatch(hideFlash()), 3200);
    return () => clearTimeout(id);
  }, [flash, dispatch]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(92px+env(safe-area-inset-bottom))] z-[220] flex justify-center px-4 sm:bottom-8">
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.at}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-night px-3.5 py-2 text-[12.5px] font-bold text-ivory shadow-[0_14px_34px_-14px_rgba(0,0,0,.7)]"
            role="status"
            data-flash
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok text-white">
              <Check size={12} strokeWidth={3} />
            </span>
            {flash.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
