// رسالة مرة واحدة بنتيجة مراجعة الإيصال: "باقتك اتفعّلت 🎉" أو "الإيصال
// ماتقبلش". الحالة كلها على السيرفر (Order.notice / noticeSeenAt) — فبتظهر
// مرة واحدة بس حتى لو عمل refresh أو فتح من جهاز تاني.
//
// وهو مستني المراجعة (رافع إيصال) بنسأل كل 30 ثانية، فلو فعّلت الباقة وهو
// فاتح الموقع الرسالة بتوصله على طول من غير ما يعمل refresh. من غير طلب
// مستني مبنسألش خالص (مفيش ضغط على السيرفر).
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Sparkles, X, LayoutTemplate, Upload, MessageCircle } from 'lucide-react';
import {
  api, useGetMeQuery, useGetOrderStatusQuery, useMarkOrderNoticeSeenMutation,
} from '../store/api.js';
import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';

export default function OrderNoticeGate() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { data: me } = useGetMeQuery();
  const loggedIn = !!me?.user;
  // استعلام واحد، وفترة السؤال بتتغيّر مع حالته: كل 30 ثانية وهو مستني
  // مراجعة إيصاله، ومن غير سؤال خالص غير كده (مفيش ضغط على السيرفر).
  // من غير skipPollingIfUnfocused: العميل ممكن يكون فاتح واتساب يبعتلك
  // الإيصال ويرجع.
  const [poll, setPoll] = useState(0);
  const { data, refetch } = useGetOrderStatusQuery(undefined, {
    skip: !loggedIn,
    pollingInterval: poll,
  });
  const reviewing = !!data?.reviewing;
  useEffect(() => { setPoll(reviewing ? 30000 : 0); }, [reviewing]);
  // أول ما يرجع للتاب بنسأل على طول بدل ما يستنى الدورة
  useEffect(() => {
    if (!loggedIn || !reviewing) return undefined;
    const onVis = () => { if (document.visibilityState === 'visible') refetch(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
    };
  }, [loggedIn, reviewing, refetch]);
  const status = data;
  const notice = status?.notice || null;
  const [markSeen] = useMarkOrderNoticeSeenMutation();

  // أول ما الباقة تتفعّل: بيانات الحساب (الرصيد والباقة) لازم تتحدّث فورًا
  const lastType = useRef(null);
  useEffect(() => {
    if (notice?.type === 'activated' && lastType.current !== notice.orderId) {
      lastType.current = notice.orderId;
      dispatch(api.util.invalidateTags(['Me', 'Packages', 'Dashboard']));
    }
  }, [notice, dispatch]);

  // لوحة التحكم بتاعتك إنت مش بتاعة العميل
  if (!loggedIn || !notice || pathname.startsWith('/admin')) return null;

  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const pkgName = (notice.packageName && (notice.packageName[lang] || notice.packageName.ar)) || '';
  const activated = notice.type === 'activated';

  function close(then) {
    markSeen(notice.orderId);
    if (then) navigate(then);
  }

  return (
    <AnimatePresence>
      <motion.div
        key={notice.orderId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] flex items-end justify-center overflow-y-auto bg-night/75 p-3 backdrop-blur-sm sm:items-center sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-notice-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 26 }}
          className="relative my-auto w-full max-w-[430px] overflow-hidden rounded-[26px] border border-brass/35 bg-gradient-to-b from-[#0d1f18] to-night text-ivory shadow-[0_28px_80px_-28px_rgba(0,0,0,.85)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(230,198,132,.2),transparent)]" />
          <button
            type="button"
            aria-label={t('auth.close')}
            onClick={() => close()}
            className="absolute top-4 end-4 z-10 text-ivory/45 transition hover:text-ivory"
          >
            <X size={18} />
          </button>

          <div className="relative p-6 text-center sm:p-7">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 18 }}
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${activated ? 'bg-ok/15 text-ok' : 'bg-error/15 text-error'}`}
            >
              {activated ? <Check size={26} strokeWidth={3} /> : <X size={26} strokeWidth={3} />}
            </motion.div>

            {activated && (
              <div className="mb-1.5 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/15 px-3 py-1 text-[11px] font-bold text-brass-soft">
                  <Sparkles size={11} /> {pkgName}
                </span>
              </div>
            )}

            <h2 id="order-notice-title" className="font-serif text-[22px] font-bold leading-snug text-ivory">
              {activated ? t('orderNotice.activatedTitle') : t('orderNotice.rejectedTitle')}
            </h2>
            <p className="mt-2.5 text-[13.5px] leading-[1.9] text-ivory/70">
              {activated
                ? t('orderNotice.activatedBody', { count: notice.invitations || 0 })
                : t('orderNotice.rejectedBody')}
            </p>

            {activated ? (
              <button
                type="button"
                onClick={() => close('/')}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft py-3.5 text-[13.5px] font-extrabold text-[#241608] transition hover:brightness-105"
              >
                <LayoutTemplate size={15} /> {t('orderNotice.activatedCta')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => close(`/checkout/${notice.packageId}`)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft py-3.5 text-[13.5px] font-extrabold text-[#241608] transition hover:brightness-105"
                >
                  <Upload size={15} /> {t('orderNotice.rejectedCta')}
                </button>
                <button
                  type="button"
                  onClick={() => close('/dashboard')}
                  className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ivory/20 py-3 text-[13px] font-bold text-ivory/80 transition hover:border-brass/50"
                >
                  <MessageCircle size={14} /> {t('orderNotice.contact')}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
