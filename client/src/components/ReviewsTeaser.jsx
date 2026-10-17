// آراء العملاء — كارت صغير تحت فيديو المحرر في الهيرو، ولما حد يدوس عليه
// بيفتح عارض للرسايل الحقيقية اللي العرسان بعتوها (سكرين شوت واتساب).
//
// الصور في client/public/img/reviews/ — متخبّي منها أي رقم تليفون أو اسم أو
// صورة شخصية قبل ما تتنشر (اتعمل وقت تجهيزها، مش هنا). العارض مابيتحمّلش
// غير لما حد يفتحه، فمابيتقلش الصفحة الرئيسية.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Star, MessageCircleHeart } from 'lucide-react';

const COUNT = 7;
const REVIEWS = Array.from({ length: COUNT }, (_, i) => ({
  full: `/img/reviews/review-${i + 1}.webp`,
  thumb: `/img/reviews/review-${i + 1}-thumb.webp`,
}));

function Stars({ size = 13 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-brass-soft" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}
    </span>
  );
}

export function ReviewsTeaser() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3.5 rounded-xl text-start transition sm:gap-4"
        aria-label={t('reviews.open')}
      >
        {/* الرسايل متراصّة فوق بعض زي كوتشينة */}
        <span className="relative h-[54px] w-[78px] shrink-0 sm:h-[60px] sm:w-[86px]" aria-hidden="true">
          {[2, 1, 0].map((k) => (
            <img
              key={k}
              src={REVIEWS[k].thumb}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute top-0 h-full w-[44px] rounded-[9px] border-2 border-night object-cover object-top shadow-[0_8px_18px_-8px_rgba(0,0,0,.8)] transition duration-300 sm:w-[48px]"
              style={{
                insetInlineStart: `${k * 15}px`,
                transform: `rotate(${(k - 1) * -6}deg)`,
                zIndex: 3 - k,
              }}
            />
          ))}
          <span className="absolute -bottom-1.5 end-0 z-10 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-gradient-to-l from-brass to-brass-soft px-1.5 text-[10.5px] font-extrabold text-[#241608] shadow-[0_4px_10px_-3px_rgba(0,0,0,.7)]">
            +{COUNT}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <Stars />
            <span className="text-[11px] font-bold text-ivory/60">{t('reviews.real')}</span>
          </span>
          <span className="mt-1 block font-serif text-[15px] font-bold leading-snug text-ivory sm:text-[16px]">
            {t('reviews.title')}
          </span>
          <span className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-brass-soft transition group-hover:text-brass">
            {t('reviews.cta')}
            <ChevronLeft size={14} className="transition group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5" />
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && <ReviewsViewer onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function ReviewsViewer({ onClose }) {
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  // الشريط بيتسحب بالصباع (scroll-snap) — بنعرف إحنا على أنهي رسالة من مكانه
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    setIdx(Math.max(0, Math.min(COUNT - 1, i)));
  }, []);

  const goTo = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(0, Math.min(COUNT - 1, i));
    el.scrollTo({ left: (rtl ? -1 : 1) * n * el.clientWidth, behavior: 'smooth' });
  }, [rtl]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      // الأسهم بتمشي مع اتجاه القراءة: في العربي "يسار" = اللي بعده
      if (e.key === 'ArrowLeft') goTo(idx + (rtl ? 1 : -1));
      if (e.key === 'ArrowRight') goTo(idx + (rtl ? -1 : 1));
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [idx, rtl, goTo, onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] flex flex-col bg-[#07100c]/[0.97] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('reviews.viewerTitle')}
      onClick={onClose}
    >
      {/* العنوان */}
      <div className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-[calc(14px+env(safe-area-inset-top))] sm:px-6" onClick={(e) => e.stopPropagation()}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-soft">
          <MessageCircleHeart size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[16px] font-bold text-ivory sm:text-[18px]">{t('reviews.viewerTitle')}</div>
          <div className="flex items-center gap-2 text-[11.5px] text-ivory/55">
            <Stars size={11} /> <span dir="ltr">{idx + 1} / {COUNT}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('heroDemo.close')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ivory/20 text-ivory hover:bg-ivory/10"
        >
          <X size={18} />
        </button>
      </div>

      {/* الرسايل: سحب بالصباع على الموبايل، أسهم على الكمبيوتر */}
      <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.map((r, i) => (
            <div key={r.full} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4 sm:px-20">
              <motion.img
                src={r.full}
                alt={t('reviews.alt', { n: i + 1 })}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i === 0 ? 0.05 : 0 }}
                className="max-h-full max-w-full select-none rounded-[18px] object-contain shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)] ring-1 ring-ivory/10 sm:max-w-[460px]"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(idx - 1)}
          disabled={idx === 0}
          aria-label={t('reviews.prev')}
          className="absolute start-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/20 bg-night/70 text-ivory transition hover:bg-night disabled:opacity-0 sm:flex"
        >
          {rtl ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
        <button
          type="button"
          onClick={() => goTo(idx + 1)}
          disabled={idx === COUNT - 1}
          aria-label={t('reviews.next')}
          className="absolute end-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/20 bg-night/70 text-ivory transition hover:bg-night disabled:opacity-0 sm:flex"
        >
          {rtl ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      {/* النقط + تلميح السحب */}
      <div className="flex shrink-0 flex-col items-center gap-2 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          {REVIEWS.map((r, i) => (
            <button
              key={r.full}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t('reviews.alt', { n: i + 1 })}
              aria-current={i === idx}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-brass-soft' : 'w-1.5 bg-ivory/30 hover:bg-ivory/50'}`}
            />
          ))}
        </div>
        <p className="text-[11.5px] text-ivory/45 sm:hidden">{t('reviews.swipe')}</p>
      </div>
    </motion.div>,
    document.body
  );
}

export default ReviewsTeaser;
