// "تقدر تغيّر كل ده بسهولة" — قايمة بالطول في الهيرو تحت الزرارين، نازلة جنب
// فيديو المحرر. خط دهبي رفيع على الجنب وعليه نقط، وجنب كل نقطة حاجة بتتعدّل
// في الدعوة. الحاجات بتظهر ورا بعض، وبعدها كل سطر بينوّر بالدور كإن حد
// بيعدّل فيه دلوقتي.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';

const ITEMS = ['text', 'font', 'photos', 'music', 'colors', 'date'];

export default function EditableFeatures() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(-1);

  // نبضة بتلف على السطور واحد واحد (بتقف لو الجهاز طالب حركة أقل)
  useEffect(() => {
    if (reduce) return undefined;
    let i = -1;
    const iv = setInterval(() => { i = (i + 1) % ITEMS.length; setLit(i); }, 1500);
    return () => clearInterval(iv);
  }, [reduce]);

  return (
    <div className="mt-4 sm:mt-6">
      <p className="mb-2.5 text-[11px] font-bold text-brass-soft sm:mb-3 sm:text-[13px]">
        {t('heroEdit.title')}
      </p>
      <ul className="relative space-y-[7px] ps-3.5 sm:space-y-2.5 sm:ps-5">
        {/* الخط الدهبي النازل */}
        <span
          aria-hidden="true"
          className="absolute bottom-[7px] start-[3px] top-[7px] w-px bg-gradient-to-b from-brass-soft/70 via-brass-soft/35 to-transparent sm:start-[5px]"
        />
        {ITEMS.map((key, i) => {
          const on = lit === i;
          return (
            <motion.li
              key={key}
              initial={reduce ? false : { opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center"
            >
              <span
                aria-hidden="true"
                className={`absolute -start-3.5 h-[7px] w-[7px] rotate-45 transition-all duration-500 sm:-start-5 sm:h-[9px] sm:w-[9px] ${
                  on ? 'scale-125 bg-brass-soft shadow-[0_0_10px_1px_rgba(230,198,132,.75)]' : 'bg-brass-soft/45'
                }`}
              />
              <span
                className={`text-[12px] font-bold leading-tight transition-colors duration-500 sm:text-[14.5px] ${
                  on ? 'text-ivory' : 'text-ivory/65'
                }`}
              >
                {t(`heroEdit.${key}`)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
