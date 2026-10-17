// شريط "تقدر تغيّر كل ده بسهولة" — أيقونات بالطول جنب فيديو المحرر على طول
// (ناحية الكلام)، تحت كل أيقونة اسمها. بتظهر ورا بعض، وبعدها كل واحدة بتنوّر
// بالدور كإن حد بيعدّل فيها دلوقتي. الشريط بيمتد بطول التليفون نفسه.
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

  useEffect(() => {
    if (reduce) return undefined;
    let i = -1;
    const iv = setInterval(() => { i = (i + 1) % ITEMS.length; setLit(i); }, 1500);
    return () => clearInterval(iv);
  }, [reduce]);

  return (
    <ul
      aria-label={t('heroEdit.title')}
      title={t('heroEdit.title')}
      className="relative flex w-[40px] shrink-0 flex-col items-center justify-between py-3 sm:w-[58px] sm:py-5 lg:w-[66px]"
    >
      {/* العنوان فوق الأيقونات: "تقدر تغيّر كل ده" على سطرين صغيرين */}
      <li className="relative z-[1] -mb-1 flex flex-col items-center text-center" aria-hidden="true">
        <span className="whitespace-nowrap text-[9px] font-extrabold leading-[1.35] text-brass-soft sm:text-[11px] lg:text-[12.5px]">
          {t('heroEdit.titleTop')}
          <br />
          {t('heroEdit.titleBottom')}
        </span>
        <span className="mt-1 h-px w-5 bg-gradient-to-l from-transparent via-brass-soft/70 to-transparent sm:w-8" />
      </li>
      {/* خط دهبي رفيع ورا الأيقونات بيربطهم ببعض */}
      <span
        aria-hidden="true"
        className="absolute bottom-6 top-14 start-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-brass-soft/35 to-transparent rtl:translate-x-1/2"
      />
      {ITEMS.map(({ key, Icon }, i) => {
        const on = lit === i;
        return (
          <motion.li
            key={key}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[1] flex flex-col items-center gap-1"
          >
            <span
              aria-hidden="true"
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border transition-all duration-500 sm:h-9 sm:w-9 lg:h-10 lg:w-10 ${
                on
                  ? 'scale-110 border-transparent bg-gradient-to-l from-brass to-brass-soft text-[#241608] shadow-[0_0_16px_-1px_rgba(201,162,74,.75)]'
                  : 'border-brass-soft/30 bg-night text-brass-soft'
              }`}
            >
              <Icon strokeWidth={2} className="h-[13px] w-[13px] sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
            </span>
            <span
              className={`whitespace-nowrap text-center text-[8.5px] font-bold leading-none transition-colors duration-500 sm:text-[10.5px] lg:text-[11.5px] ${
                on ? 'text-ivory' : 'text-ivory/60'
              }`}
            >
              {t(`heroEdit.${key}`)}
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}
