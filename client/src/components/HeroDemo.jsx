// موبايل جوّاه فيديو المحرر وهو شغّال — ده بطل الصفحة الرئيسية.
//
// ليه موبايل مش إطار متصفح: التسجيل نفسه من موبايل (284×624)، وكل
// ضيوف العميل هيفتحوا الدعوة من موبايل. الإطار بيخلي اللي بيتفرّج
// يشوف نفسه ماسك التليفون، مش بيتفرّج على لقطة شاشة.
//
// الوزن: اللقطة الصامتة (0.45 ميجا) هي اللي بتتحمّل مع الصفحة،
// والنسخة الكاملة بصوتها مبتتحمّلش غير لما يضغط عليها بنفسه.
// والتشغيل بيبدأ لما الفيديو يبان في الشاشة بس.
//
// المكوّن بيرجّع حتّتين منفصلين (التليفون، والرسالة اللي تحته) عشان
// الهيرو يحطّ كل واحدة في مكانها من الشبكة: على الموبايل التليفون
// جنب الكلام، والرسالة تحتهم بعرض الشاشة كلها.
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import ReviewsTeaser from './ReviewsTeaser.jsx';
import EditableFeatures from './EditableFeatures.jsx';

const LOOP_MP4 = '/video/hero-demo-loop.mp4';
const LOOP_WEBM = '/video/hero-demo-loop.webm';
const POSTER = '/video/hero-demo-poster.jpg';

export default function HeroDemo() {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const wrapRef = useRef(null);

  // بيشتغل وهو بايـن بس — مفيش فيديو بيلف في الخلفية وبياكل بطارية
  // وبيانات من غير ما حد شايفه
  useEffect(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ===== التليفون ===== */}
      {/* المقاس على الشاشة الكبيرة متظبط عشان التليفون والرسالة اللي
          تحته يبانوا مع بعض في شاشة واحدة من غير تمرير */}
      {/* التليفون + شريط "تقدر تغيّر كل ده" جنبه على طول (ناحية الكلام) */}
      <div className="flex items-stretch justify-center gap-1.5 sm:gap-3 lg:gap-4">
      <EditableFeatures />
      <div ref={wrapRef} className="relative min-w-0 flex-1 max-w-[168px] sm:max-w-[240px] lg:max-w-[264px]">
        <div
          className="pointer-events-none absolute -inset-8 blur-[24px]"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(201,120,138,0.3), transparent 62%)' }}
        />

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 22, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative rounded-[22px] border-[5px] border-[#050b08] bg-[#050b08] shadow-[0_28px_60px_-24px_rgba(0,0,0,.85)] sm:rounded-[28px] sm:border-[6px] lg:rounded-[34px] lg:border-[7px]">
            <span className="absolute start-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-[#1c2b24] sm:top-2 sm:h-1.5 sm:w-14" />
            <video
              ref={videoRef}
              className="block w-full rounded-[17px] sm:rounded-[22px] lg:rounded-[27px]"
              poster={POSTER}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={t('heroDemo.alt')}
            >
              <source src={LOOP_WEBM} type="video/webm" />
              <source src={LOOP_MP4} type="video/mp4" />
            </video>
          </div>

          {/* شارة على حرف التليفون — بتقول ده إيه من غير ما يقرا حاجة */}
          <span className="absolute -top-2.5 start-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-brass to-brass-soft px-2 py-1 text-[9.5px] font-extrabold text-[#241608] shadow-[0_8px_20px_-8px_rgba(0,0,0,.6)] sm:-top-3 sm:start-5 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px]">
            <Sparkles size={10} /> {t('heroDemo.chip')}
          </span>
        </motion.div>
      </div>
      </div>

      {/* ===== آراء العملاء ===== */}
      {/* بعرض الشاشة كلها على الموبايل (تحت الكلام والتليفون)، وتحت
          التليفون بس على الشاشة الكبيرة */}
      <div className="col-span-2 rounded-2xl border border-brass-soft/25 bg-ivory/[0.05] px-4 py-3.5 text-center lg:col-span-1 lg:col-start-2 lg:mt-1">
        {/* آراء العملاء الحقيقية — بتفتح رسايلهم */}
        <ReviewsTeaser />
      </div>

    </>
  );
}
