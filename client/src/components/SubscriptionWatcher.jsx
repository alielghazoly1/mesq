// مراقب تفعيل الاشتراك.
//
// المشكلة اللي بيحلها: لما الأدمن يفعّل باقة العميل (بعد تحويل فودافون
// مثلاً)، ده بيحصل في متصفّح الأدمن — ومتصفّح العميل بيفضل شايف نفسه
// "مجاني" لحد ما يعمل refresh. فكان بيروح يعمل ديزاين ويلاقي شاشة
// "اشترك الأول" رغم إنه دفع.
//
// الحل: طول ما العميل داخل ولسه مش مشترك، بنسأل السيرفر كل شوية عن
// حالته. أول ما تتفعّل، الواجهة كلها بتتحدّث لوحدها، وبنطلّعله رسالة
// تهنئة واضحة إن باقته اشتغلت. (مع refetchOnFocus في الـ store، كمان
// بيتحدّث فورًا أول ما يرجع لتابه.)
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, X, Wand2 } from 'lucide-react';
import { api, useGetMeQuery } from '../store/api.js';
import { isEditOpen } from '../lib/editWindow.js';

function isSubscribed(user) {
  const sub = user?.subscription;
  return !!sub && !!sub.packageId && sub.status !== 'suspended'
    && (sub.invitationsLeft || 0) > 0 && isEditOpen(user);
}

export default function SubscriptionWatcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useGetMeQuery();
  const user = data?.user || null;
  const subscribed = isSubscribed(user);

  // نسأل كل 20 ثانية بس وهو داخل ومش مشترك — أول ما يتفعّل بنبطّل السؤال.
  // skipPollingIfUnfocused: مانتعبش السيرفر والتاب مقفول.
  useGetMeQuery(undefined, {
    pollingInterval: user && !subscribed ? 20000 : 0,
    skipPollingIfUnfocused: true,
  });

  const [celebrate, setCelebrate] = useState(false);
  // أول قراءة بنسجّلها بس — عشان اللي داخل وهو مشترك أصلاً ماتظهرلوش الرسالة
  const prevRef = useRef(null);

  useEffect(() => {
    if (!user) { prevRef.current = null; return; }
    if (prevRef.current === null) { prevRef.current = subscribed; return; }
    if (!prevRef.current && subscribed) {
      setCelebrate(true);
      // نحدّث باقي الصفحات فورًا (اللوحة، الباقات، الرصيد) عشان كلها
      // تعكس التفعيل مرة واحدة مش لما العميل يعمل تفاعل تاني
      dispatch(api.util.invalidateTags(['Dashboard', 'Packages', 'Quota']));
    }
    prevRef.current = subscribed;
  }, [user, subscribed, dispatch]);

  return (
    <AnimatePresence>
      {celebrate && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-3"
        >
          <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-brass/50 bg-gradient-to-l from-night to-[#16281f] px-4 py-3 text-ivory shadow-2xl shadow-ink/30">
            <PartyPopper size={22} className="shrink-0 text-brass-soft" />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-brass-soft">{t('activated.title')}</div>
              <div className="text-[12.5px] text-ivory/70">{t('activated.body')}</div>
            </div>
            <button
              type="button"
              onClick={() => { setCelebrate(false); navigate('/'); }}
              className="shrink-0 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2 text-[12.5px] font-extrabold text-[#241608]"
            >
              <span className="inline-flex items-center gap-1.5"><Wand2 size={13} /> {t('activated.cta')}</span>
            </button>
            <button
              type="button"
              aria-label={t('activated.close')}
              onClick={() => setCelebrate(false)}
              className="shrink-0 text-ivory/50 hover:text-ivory"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
