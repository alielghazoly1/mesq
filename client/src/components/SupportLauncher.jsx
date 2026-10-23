// نافذة الدعم — بتفضل موجودة في كل صفحة (زرار عايم، وعلى الموبايل
// أيقونة "الدعم" في الشريط السفلي).
//
// 3 شاشات:
//   home  "أهلًا بيك 👋 محتاج أي مساعدة؟" + أسئلة سريعة + كلّمنا
//   faq   العميل يضغط سؤال → يظهر كرسالة منه، و"بيكتب…" ثانية، والإجابة
//         بتتكتب قدامه (زي المساعد الذكي). وتحتها زرار للصفحة المناسبة،
//         و"لسه محتاج مساعدة؟" يفتح المحادثة مع الدعم.
//   chat  المحادثة الحقيقية (كلام + فويس) — SupportChat
//
// العدد الأحمر: Redux (supportSlice) من /support/status كل 20 ثانية
// (8 والنافذة مفتوحة). رسالة جديدة منك وهو مش فاتح → فقاعة معاينة
// جنب الزرار، والعدد على الزرار وعلى أيقونة الشريط السفلي. أول ما يفتح
// المحادثة العدد بيروح وعندك في اللوحة بتبقى ✓✓.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  MessageCircle, X, ArrowLeft, ChevronLeft, Tag, Sparkles, Wallet, Clock, Pencil, Send, Users,
  Music, Palette, Headphones, ThumbsUp, Mic,
} from 'lucide-react';
import {
  useGetMeQuery, useGetSupportStatusQuery, useGetPackagesQuery,
} from '../store/api.js';
import { whatsappLink, WHATSAPP_MESSAGES } from '../lib/contact.js';
import { setSupportOpen, toggleSupport, openAuthModal } from '../store/uiSlice.js';
import {
  setStatus, dismissPreview, setView, askFaq, resetSupport,
} from '../store/supportSlice.js';
import { hasBottomNav } from '../lib/bottomNav.js';
import { FAQ, faqText, pricesLines } from '../lib/supportFaq.js';
import SupportChat, { SupportAvatar } from './support/SupportChat.jsx';

const ICONS = {
  tag: Tag, sparkles: Sparkles, wallet: Wallet, clock: Clock, pencil: Pencil, send: Send,
  users: Users, music: Music, palette: Palette,
};

/** أيقونة واتساب — مش موجودة في lucide فرسمناها */
function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** الإجابة بتتكتب قدامه حتة حتة (والسكرول بيتابعها) */
function Typewriter({ text, onTick, onDone }) {
  const [n, setN] = useState(() => (reduceMotion() ? text.length : 0));
  useEffect(() => {
    if (n >= text.length) { onDone && onDone(); return undefined; }
    const step = Math.max(2, Math.round(text.length / 90));
    const id = setTimeout(() => { setN((x) => Math.min(text.length, x + step)); onTick && onTick(); }, 16);
    return () => clearTimeout(id);
  }, [n, text]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span className="whitespace-pre-line">
      {text.slice(0, n)}
      {n < text.length && <span className="ms-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-current align-[-2px]" />}
    </span>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1.5" data-typing>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-dim"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/** الشاشة الأولى */
function Home({
  user, unread, adminOnline, onChat, onAsk, lang,
}) {
  const { t } = useTranslation();
  const first = String(user?.name || '').trim().split(/\s+/)[0];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]" data-support-home>
      <div className="bg-gradient-to-b from-night to-[#12261e] px-5 pb-6 pt-5 text-ivory">
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-[23px] font-bold leading-tight">
          {first ? t('support.hiName', { name: first }) : t('support.hi')} <span className="inline-block origin-[70%_70%] animate-[wave_1.8s_ease-in-out_1]">👋</span>
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-1 text-[14.5px] text-ivory/75">
          {t('support.needHelp')}
        </motion.p>
      </div>

      <div className="-mt-3 space-y-3 px-3.5 pb-4">
        {/* كلّمنا */}
        <button
          type="button"
          onClick={onChat}
          data-open-chat
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-start shadow-[0_10px_30px_-18px_rgba(8,19,15,.5)] transition hover:border-ink/25 active:scale-[.99]"
        >
          <SupportAvatar size={40} online={user ? adminOnline : null} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
              {t('support.chatCta')}
              {unread > 0 && (
                <span className="rounded-full bg-rose px-1.5 py-0.5 text-[10.5px] font-bold text-white" data-home-unread>{unread}</span>
              )}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-dim">
              {user
                ? (adminOnline
                  ? <><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> {t('support.onlineNow')}</>
                  : t('support.replySoon'))
                : t('support.loginToChat')}
            </span>
          </span>
          <span className="flex items-center gap-1 text-ink-dim/70">
            <Mic size={14} />
            <ChevronLeft size={16} className="ltr:rotate-180" />
          </span>
        </button>

        {/* أسئلة سريعة */}
        <div className="rounded-2xl border border-line bg-white p-1.5 shadow-[0_10px_30px_-22px_rgba(8,19,15,.5)]">
          <p className="px-2.5 pb-1 pt-2 text-[11.5px] font-extrabold text-ink-dim">{t('support.quickTitle')}</p>
          {FAQ.map((f) => {
            const Icon = ICONS[f.icon] || Sparkles;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onAsk(f.id)}
                data-faq={f.id}
                className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-start transition hover:bg-ivory active:bg-ivory"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brass/[0.12] text-[#8a6a20]">
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1 text-[13.5px] font-bold text-ink">{faqText(f, lang).q}</span>
                <ChevronLeft size={15} className="shrink-0 text-ink-dim/40 transition group-hover:text-ink-dim ltr:rotate-180" />
              </button>
            );
          })}
        </div>

        <a
          href={whatsappLink(WHATSAPP_MESSAGES.help)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl py-2.5 text-[12.5px] font-bold text-[#1da851] transition hover:bg-[#25D366]/10"
        >
          <WhatsAppIcon size={16} /> {t('support.orWhats')}
        </a>
      </div>
    </div>
  );
}

/** الأسئلة كمحادثة: السؤال منه، والإجابة بتتكتب */
function Faq({
  log, lang, user, onAsk, onChat, onNavigate,
}) {
  const { t } = useTranslation();
  const box = useRef(null);
  const [typingFor, setTypingFor] = useState(null); // آخر سؤال لسه "بيكتب…"
  const [doneFor, setDoneFor] = useState(null);
  const latest = log[log.length - 1];
  const { data: pk } = useGetPackagesQuery(lang, { skip: !user });

  const scroll = () => { const el = box.current; if (el) el.scrollTop = el.scrollHeight; };

  useEffect(() => {
    if (!latest) return undefined;
    setTypingFor(latest.at);
    setDoneFor(null);
    scroll();
    const id = setTimeout(() => setTypingFor(null), reduceMotion() ? 0 : 650);
    return () => clearTimeout(id);
  }, [latest && latest.at]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(scroll, [typingFor, doneFor]);

  const answerFor = (item) => {
    const base = faqText(item, lang).a;
    if (item.id === 'prices') {
      const lines = pricesLines(pk?.packages, lang);
      return lines ? `${lines}\n\n${base}` : base;
    }
    return base;
  };

  const asked = new Set(log.map((l) => l.id));
  const more = FAQ.filter((f) => !asked.has(f.id)).slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={box} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-3.5 py-3 [scrollbar-width:thin]" data-faq-thread>
        {log.map((entry) => {
          const item = FAQ.find((f) => f.id === entry.id);
          if (!item) return null;
          const txt = faqText(item, lang);
          const isLatest = entry === latest;
          const typing = isLatest && typingFor === entry.at;
          return (
            <div key={entry.at} className="space-y-2.5">
              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-[18px] rounded-ee-md bg-night px-3.5 py-2 text-[13.5px] font-bold leading-[1.7] text-ivory shadow-sm">{txt.q}</div>
              </div>
              <div className="flex items-end gap-1.5" data-faq-answer={entry.id}>
                <SupportAvatar size={24} />
                <div className="max-w-[86%] rounded-[18px] rounded-es-md border border-line bg-white px-3.5 py-2.5 text-[13.5px] leading-[1.8] text-ink shadow-sm">
                  {typing
                    ? <TypingDots />
                    : isLatest && doneFor !== entry.at
                      ? <Typewriter text={answerFor(item)} onTick={scroll} onDone={() => setDoneFor(entry.at)} />
                      : <span className="whitespace-pre-line">{answerFor(item)}</span>}
                  {!typing && (!isLatest || doneFor === entry.at) && item.action && (!item.action.auth || user) && (
                    item.action.wa ? (
                      <a
                        href={whatsappLink(WHATSAPP_MESSAGES[item.action.wa] || WHATSAPP_MESSAGES.help)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 text-[12.5px] font-extrabold text-white"
                      >
                        <WhatsAppIcon size={15} /> {txt.actionLabel}
                      </a>
                    ) : (
                      <Link
                        to={item.action.to}
                        onClick={onNavigate}
                        data-faq-action
                        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full bg-night py-2 text-[12.5px] font-extrabold text-ivory"
                      >
                        {txt.actionLabel} <ArrowLeft size={13} className="ltr:rotate-180" />
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {latest && doneFor === latest.at && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-1" data-faq-after>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1 text-[11.5px] font-bold text-ink-dim"><ThumbsUp size={12} /> {t('support.helped')}</span>
              <button
                type="button"
                onClick={onChat}
                data-still-need
                className="flex items-center gap-1.5 rounded-full border border-night/15 bg-white px-3 py-1.5 text-[12px] font-extrabold text-ink shadow-sm transition hover:border-night/40"
              >
                <Headphones size={13} /> {t('support.stillNeed')}
              </button>
            </div>
            {more.length > 0 && (
              <div className="pt-1">
                <p className="mb-1.5 text-center text-[11px] font-bold text-ink-dim">{t('support.moreQuestions')}</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {more.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onAsk(f.id)}
                      data-faq-more={f.id}
                      className="rounded-full border border-brass/30 bg-brass/[0.07] px-3 py-1.5 text-[12px] font-bold text-[#7a5a1a] transition hover:bg-brass/[0.14]"
                    >
                      {faqText(f, lang).q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SupportLauncher() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const open = useSelector((s) => s.ui.supportOpen);
  const {
    unread, adminOnline, latest, dismissedId, view, faqLog,
  } = useSelector((s) => s.support);
  const setOpen = (v) => dispatch(setSupportOpen(v));
  const withNav = hasBottomNav(pathname);
  const overBar = pathname.startsWith('/checkout/');

  const { data: meData } = useGetMeQuery();
  const user = meData?.user ?? null;

  // العدد + "متصل" — خفيف، كل 20 ثانية (8 والنافذة مفتوحة)، ومن غير ما يسأل والتاب مش ظاهر
  const { data: status } = useGetSupportStatusQuery(undefined, {
    skip: !user,
    pollingInterval: open ? 8000 : 20000,
    skipPollingIfUnfocused: true,
  });
  useEffect(() => {
    if (!status) return;
    // والمحادثة مفتوحة قدامه، أي رسالة جديدة بتتعلّم مقروءة على طول — مايظهرش عدد
    if (open && view === 'chat') dispatch(setStatus({ ...status, unread: 0, latest: null }));
    else dispatch(setStatus(status));
  }, [status, open, view, dispatch]);

  // خروج من الحساب → كل حالة الدعم تتمسح
  const hadUser = useRef(!!user);
  useEffect(() => {
    if (hadUser.current && !user) dispatch(resetSupport());
    hadUser.current = !!user;
  }, [user, dispatch]);

  // كل فتحة بتبدأ من الأول — إلا لو فيه رسايل مستنياه، فبتفتح على المحادثة على طول
  const prevOpen = useRef(open);
  useEffect(() => {
    if (open && !prevOpen.current) dispatch(setView(user && unread > 0 ? 'chat' : 'home'));
    prevOpen.current = open;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { dispatch(setSupportOpen(false)); }, [pathname, dispatch]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') dispatch(setSupportOpen(false)); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dispatch]);

  const goChat = () => {
    if (!user) { setOpen(false); dispatch(openAuthModal('register')); return; }
    dispatch(setView('chat'));
  };
  const ask = (id) => dispatch(askFaq(id));

  const showPreview = !open && user && unread > 0 && latest && latest.id !== dismissedId;
  const title = view === 'chat' ? t('support.chatTitle') : t('support.title');
  const sub = view === 'chat'
    ? (adminOnline ? t('support.onlineNow') : t('support.replySoon'))
    : t('support.subtitle');

  const panelPos = useMemo(() => (withNav
    ? 'bottom-[calc(96px+env(safe-area-inset-bottom))] h-[min(640px,calc(100dvh-170px))] md:bottom-20 md:h-[min(640px,calc(100dvh-110px))]'
    : overBar
      ? 'bottom-[calc(160px+env(safe-area-inset-bottom))] h-[min(600px,calc(100dvh-230px))] sm:bottom-20 sm:h-[min(640px,calc(100dvh-110px))]'
      : 'bottom-20 h-[min(640px,calc(100dvh-110px))]'), [withNav, overBar]);

  return (
    <>
      {/* فقاعة "رسالة جديدة" جنب الزرار */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className={`fixed start-4 z-[121] w-[min(248px,calc(100vw-32px))] ${withNav
              ? 'bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-[84px]'
              : overBar ? 'bottom-[calc(150px+env(safe-area-inset-bottom))] sm:bottom-[84px]' : 'bottom-[84px]'}`}
            data-support-preview
          >
            <div className="relative rounded-[15px] border border-line bg-white p-2.5 pe-7 shadow-[0_14px_34px_-16px_rgba(8,19,15,.5)]">
              <button
                type="button"
                onClick={() => dispatch(dismissPreview())}
                aria-label={t('auth.close')}
                className="absolute end-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full text-ink-dim hover:bg-ink/5"
              >
                <X size={12} />
              </button>
              <button type="button" onClick={() => { dispatch(setSupportOpen(true)); dispatch(setView('chat')); }} className="flex w-full items-start gap-2.5 text-start">
                <SupportAvatar size={28} online={adminOnline} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11.5px] font-extrabold text-ink">
                    {unread > 1 ? t('support.newMany', { n: unread }) : t('support.newOne')}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-ink-dim">{latest.preview}</span>
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الزرار العايم */}
      <button
        type="button"
        onClick={() => dispatch(toggleSupport())}
        aria-label={t('support.launcher')}
        data-support-launcher
        className={`fixed ${overBar ? 'bottom-[calc(88px+env(safe-area-inset-bottom))] sm:bottom-4' : 'bottom-4'} start-4 z-[120] ${withNav ? 'hidden md:flex' : 'flex'} h-13 items-center gap-2 rounded-full bg-night px-4 py-3.5
          text-ivory shadow-[0_12px_30px_-10px_rgba(8,19,15,.7)] transition hover:bg-emerald active:scale-95`}
      >
        {!open && unread > 0 && <span className="absolute inset-0 animate-ping rounded-full bg-rose/30 [animation-duration:2.2s]" />}
        {open ? <X size={19} /> : <MessageCircle size={19} />}
        {!open && (
          <span className="hidden text-[13px] font-bold sm:inline">{t('support.launcher')}</span>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -end-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-white ring-2 ring-ivory" data-launcher-unread>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[115] bg-night/40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className={`fixed start-3 end-3 z-[120] flex flex-col overflow-hidden rounded-[24px] border border-line bg-ivory
                shadow-[0_28px_70px_-24px_rgba(8,19,15,.6)] sm:end-auto sm:w-[380px] ${panelPos}`}
              data-support-panel
              data-view={view}
            >
              <div className="flex shrink-0 items-center gap-2.5 bg-night px-3.5 py-3 text-ivory">
                {view !== 'home' && (
                  <button
                    type="button"
                    onClick={() => dispatch(setView('home'))}
                    aria-label={t('support.back')}
                    data-support-back
                    className="grid h-8 w-8 place-items-center rounded-full text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory"
                  >
                    <ArrowLeft size={17} className="ltr:rotate-180" />
                  </button>
                )}
                <SupportAvatar size={34} online={user ? adminOnline : null} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-extrabold">{title}</div>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-ivory/60" data-support-status>
                    {view === 'chat' && adminOnline && <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />}
                    {sub}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('auth.close')}
                  className="grid h-8 w-8 place-items-center rounded-full text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory"
                >
                  <X size={17} />
                </button>
              </div>

              {view === 'chat' && user ? (
                <SupportChat autoFocus={typeof window !== 'undefined' && window.innerWidth >= 768} />
              ) : view === 'faq' && faqLog.length ? (
                <Faq log={faqLog} lang={lang} user={user} onAsk={ask} onChat={goChat} onNavigate={() => setOpen(false)} />
              ) : (
                <Home user={user} unread={unread} adminOnline={adminOnline} onChat={goChat} onAsk={ask} lang={lang} />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
