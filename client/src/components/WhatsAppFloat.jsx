import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../store/api.js';
import { whatsappLink, WHATSAPP_MESSAGES } from '../lib/contact.js';

// زرار واتساب طاير على اليمين (بطلب المالك): أي حد يكلّمنا بلمسة واحدة.
//   - موبايل: جوه شريط التنقّل اللي تحت (BottomNav) — فوقه على اليمين، وبيختفي
//     معاه وقت الكتابة عشان مايغطّيش على الخانات والكيبورد.
//   - كمبيوتر: فوق زرار "الدعم" بالظبط (نفس الجنب).
// الجنب = start: يمين في العربي. في الإنجليزي بيبقى شمال عشان رسالة "سجّل
// دخولك الأول" بتطلع على الجنب التاني ومايتداخلوش.

// شعار واتساب (Simple Icons — CC0)
const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export default function WhatsAppFloat({ variant = 'desktop' }) {
  const { t } = useTranslation();
  const mobile = variant === 'mobile';
  const { data } = useGetMeQuery();
  const supportOpen = useSelector((st) => st.ui.supportOpen);
  const sup = useSelector((st) => st.support);
  // فقاعة "رسالة جديدة من ميثاق" بتطلع في نفس المكان (نفس شرط SupportLauncher)
  // — واتساب بيستخبى لحد ما تتقفل، وكمان وهو فاتح محادثة الدعم
  const bubble = !!data?.user && sup.unread > 0 && !!sup.latest && sup.latest.id !== sup.dismissedId;
  if (supportOpen || bubble) return null;
  return (
    <motion.a
      href={whatsappLink(WHATSAPP_MESSAGES.help)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('bottomNav.whatsapp')}
      title={t('bottomNav.whatsapp')}
      data-whatsapp-float={variant}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.5 }}
      whileTap={{ scale: 0.9 }}
      className={mobile
        ? 'absolute bottom-[calc(100%+12px)] start-1 z-[1] flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgba(18,140,70,.75)] ring-[3px] ring-white/90'
        : 'fixed bottom-[80px] start-4 z-[119] hidden h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgba(18,140,70,.75)] ring-[3px] ring-white/90 transition hover:brightness-105 md:flex'}
    >
      <svg viewBox="0 0 24 24" width={mobile ? 26 : 27} height={mobile ? 26 : 27} fill="currentColor" aria-hidden="true">
        <path d={WA_PATH} />
      </svg>
    </motion.a>
  );
}
