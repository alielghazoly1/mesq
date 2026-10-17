// "تقدر تغيّر كل ده بسهولة" — أيقونات صغيرة في الهيرو تحت الزرارين، جنب
// فيديو المحرر. بتوصّل فكرة إن كل حاجة في الدعوة بتتعدّل بنظرة واحدة (زي
// مواقع التصميم الكبيرة)، من غير فقرة كلام. الأيقونات بتظهر ورا بعض، وبعدها
// كل واحدة بتنوّر بالدور كإن حد بيعدّل فيها دلوقتي.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { Type, CaseSensitive, ImageIcon, Music, Palette, CalendarHeart } from 'lucide-react';

const ITEMS = [
  { key: 'text', Icon: Type },
  { key: 'font', Icon: CaseSensitive },
  { key: 'photos', Icon: ImageIcon },
  { key: 'music', Icon: Music },
  { key: 'colors', Icon: Palette },
  { key: 'date', Icon: CalendarHeart },
];

export default function EditableFeatures() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(-1);

  // نبضة بتلف على الأيقونات واحدة واحدة (بتقف لو الجهاز طالب حركة أقل)
  useEffect(() => {
    if (reduce) return undefined;
    let i = 0;
    const start = setTimeout(() => {
      setLit(0);
      i = 0;
    }, 1400);
    const iv = setInterval(() => { i = (i + 1) % ITEMS.length; setLit(i); }, 1600);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [reduce]);

  return (
    <div className="mt-4 sm:mt-6">
      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold text-brass-soft sm:mb-3 sm:text-[12.5px]">
        <span className="h-px w-3 bg-gradient-to-l from-brass-soft to-transparent sm:w-5" />
        {t('heroEdit.title')}
      </p>
      <ul className="grid grid-cols-3 gap-1.5 sm:max-w-[520px] sm:grid-cols-6 sm:gap-2">
        {ITEMS.map(({ key, Icon }, i) => {
          const on = lit === i;
          return (
            <motion.li
              key={key}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-1.5 transition-colors duration-500 sm:gap-1.5 sm:py-2.5 ${
                on ? 'border-brass-soft/55 bg-brass/[0.12]' : 'border-ivory/10 bg-ivory/[0.04]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 sm:h-8 sm:w-8 ${
                  on
                    ? 'bg-gradient-to-l from-brass to-brass-soft text-[#241608] shadow-[0_0_16px_-2px_rgba(201,162,74,.7)]'
                    : 'bg-ivory/[0.07] text-brass-soft'
                }`}
                aria-hidden="true"
              >
                <Icon size={13} strokeWidth={2} className="sm:h-4 sm:w-4" />
              </span>
              <span className={`text-[9.5px] font-bold leading-none transition-colors duration-500 sm:text-[11.5px] ${on ? 'text-ivory' : 'text-ivory/70'}`}>
                {t(`heroEdit.${key}`)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
