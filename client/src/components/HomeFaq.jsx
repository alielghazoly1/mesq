import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const COUNT = 6;

// أسئلة شائعة في آخر الرئيسية: بتجاوب الزائر، وفي نفس الوقت هي الكلام اللي
// جوجل بيقراه عشان يفهم إن الموقع ده "دعوة زفاف إلكترونية" (الهيرو كلامه
// قليل والسطر الشارح متخفي على الموبايل). الإجابات موجودة في الصفحة حتى
// وهي مقفولة — <details> بتخفيها بس.
export default function HomeFaq() {
  const { t } = useTranslation();
  return (
    <section className="bg-ivory px-4 pb-4 pt-14 sm:px-6 sm:pt-16" aria-labelledby="home-faq-title" data-home-faq>
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 text-center text-[11.5px] font-extrabold uppercase tracking-[0.25em] text-rose">
          ✦ {t('faq.eyebrow')} ✦
        </div>
        <h2 id="home-faq-title" className="mb-7 text-center font-serif text-[clamp(22px,3.4vw,34px)] font-bold italic leading-snug text-ink">
          {t('faq.title')}
        </h2>
        <div className="space-y-2.5">
          {Array.from({ length: COUNT }, (_, i) => (
            <details key={i} className="group rounded-2xl border border-line bg-card px-4 open:border-brass/50 sm:px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-start text-[14.5px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                <h3 className="text-[14.5px] font-bold">{t(`faq.q${i + 1}`)}</h3>
                <ChevronDown size={17} className="shrink-0 text-ink-dim transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-4 text-[13.5px] leading-[1.9] text-ink-dim">{t(`faq.a${i + 1}`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
