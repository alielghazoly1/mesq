// الشريط السفلي — للموبايل بس.
//
// الهدف: العميل من أول ما يفتح الموقع لحد ما يشتري، أي مكان محتاجه على
// بعد ضغطة واحدة بصباعه الكبير من غير ما يدوّر في القايمة اللي فوق:
// الرئيسية، التصاميم، الباقات، الدعم، وحسابه.
//
// بيتغيّر حسب العميل:
//   • زائر (مش مسجّل): مفيش أيقونة باقات — مكانها زرار "سجّل" في النص،
//     وأيقونة الحساب مكتوب تحتها "تسجيل دخول" وعليها نقطة تنبيه، ومنها
//     بيطلع إشعار صغير بيقوله يسجّل عشان يشوف الباقات ويستخدم التصاميم.
//   • مسجّل من غير باقة: الباقات في النص (الزرار البارز)، والحساب مكتوب
//     تحته "يوزر عادي".
//   • دفع واتفعّلت باقته: أيقونة الحساب بتبقى دهبي ومكتوب تحتها VIP —
//     وأول مرة بتتحوّل قدامه بيطلعله "مبروك، بقيت VIP".
//
// الشريط بيتشال من صفحات الشغل (lib/bottomNav.js)، وبيستخبى لوحده لما
// العميل يكتب في أي خانة (الكيبورد بيرفعه فوق الخانة ويغطّيها).
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  House, LayoutTemplate, Crown, MessageCircleMore, UserRound, UserRoundPlus, LogIn, X,
} from 'lucide-react';
import { useGetMeQuery, useGetDashboardQuery } from '../store/api.js';
import { openAuthModal, setSupportOpen, toggleSupport } from '../store/uiSlice.js';
import { readAuthHint } from '../lib/authHint.js';
import { hasBottomNav } from '../lib/bottomNav.js';

const SPRING = { type: 'spring', stiffness: 420, damping: 32 };
const GUEST_TIP_KEY = 'mithaq:nav-guest-tip'; // sessionStorage: اتقفل في الزيارة دي
const VIP_KEY = 'mithaq:nav-vip:'; // localStorage + معرّف الحساب: آخر حالة شفناها

function store(kind) {
  try { return kind === 'session' ? window.sessionStorage : window.localStorage; } catch { return null; }
}
function readKey(kind, key) {
  try { return store(kind)?.getItem(key) ?? null; } catch { return null; }
}
function writeKey(kind, key, value) {
  try { store(kind)?.setItem(key, value); } catch { /* تصفح خاص — مش مشكلة */ }
}

/** هل الباقة شغالة فعلاً؟ (موقوفة من لوحة التحكم = عادي) */
function isVipUser(user) {
  const sub = user?.subscription;
  return !!(sub && sub.packageId && sub.status !== 'suspended');
}

/** بتنزل لقسم معيّن في الرئيسية — بتستنى لحد ما يترسم لو لسه جاي من صفحة تانية */
function scrollToSection(id) {
  const started = performance.now();
  const tick = () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (performance.now() - started < 2000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** أيقونة عادية في الشريط */
function NavItem({ item, active }) {
  const { icon: Icon, label, onClick, badge, dot, tone } = item;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.86 }}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className="relative flex h-full flex-col items-center justify-center gap-1 outline-none"
    >
      <span className="relative flex h-[34px] w-[50px] items-center justify-center">
        {/* الخلفية الغامقة بتتزحلق من أيقونة للتانية (نفس العنصر بيتنقل) */}
        {active && (
          <motion.span
            layoutId="bn-active-blob"
            transition={SPRING}
            className={`absolute inset-0 rounded-full shadow-[0_8px_18px_-8px_rgba(8,19,15,.7)] ${
              tone === 'vip'
                ? 'bg-gradient-to-br from-brass-soft via-brass to-[#9a7426]'
                : 'bg-night'
            }`}
          />
        )}
        <motion.span
          className="relative"
          animate={active ? { y: [0, -5, 0], scale: [1, 1.14, 1] } : { y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {tone === 'vip' && !active ? (
            // VIP: الأيقونة نفسها دهبي حتى وهي مش مختارة
            <span className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-br from-brass-soft via-brass to-[#9a7426] text-[#241608] shadow-[0_4px_12px_-4px_rgba(201,162,74,.9)]">
              <Icon size={17} strokeWidth={2.2} />
            </span>
          ) : (
            <Icon
              size={21}
              strokeWidth={active ? 2.3 : 1.9}
              className={`transition-colors duration-300 ${
                active ? (tone === 'vip' ? 'text-[#241608]' : 'text-brass-soft') : 'text-ink/70'
              }`}
            />
          )}
          {tone === 'vip' && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-brass drop-shadow-[0_1px_1px_rgba(0,0,0,.25)]">
              <Crown size={11} fill="currentColor" strokeWidth={1.5} />
            </span>
          )}
        </motion.span>

        {badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING}
            className="absolute -top-1 end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white ring-2 ring-card"
          >
            {badge > 9 ? '9+' : badge}
          </motion.span>
        )}
        {dot && (
          <span className="absolute top-0 end-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose ring-2 ring-card" />
          </span>
        )}
      </span>
      <span
        className={`max-w-full truncate px-0.5 text-[10.5px] leading-none transition-colors duration-300 ${
          tone === 'vip' ? 'bn-vip-text font-extrabold'
            : active ? 'font-extrabold text-ink' : 'font-semibold text-ink-dim'
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}

/** الزرار البارز في النص (الباقات، أو "سجّل" للزائر) */
function CenterItem({ item, active }) {
  const { icon: Icon, label, onClick } = item;
  return (
    <div className="relative flex h-full flex-col items-center justify-end pb-[9px]">
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className="absolute -top-[26px] flex h-[60px] w-[60px] items-center justify-center rounded-full outline-none"
      >
        {/* نبضة دهبي بتلفت النظر — بتقف لما يكون في الصفحة نفسها */}
        {!active && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-brass/45"
            animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.6 }}
          />
        )}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brass-soft via-brass to-[#8a6a20] p-[2.5px] shadow-[0_14px_26px_-10px_rgba(8,19,15,.75)] ring-[5px] ring-card">
          <span className={`flex h-full w-full items-center justify-center rounded-full transition-colors duration-300 ${
            active ? 'bg-gradient-to-br from-brass-soft to-brass' : 'bg-gradient-to-br from-[#163327] to-night'
          }`}
          >
            <motion.span
              animate={active ? { rotate: [0, -12, 10, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.55 }}
            >
              <Icon
                size={24}
                strokeWidth={2}
                className={active ? 'text-[#241608]' : 'text-brass-soft'}
                fill={active ? 'currentColor' : 'none'}
              />
            </motion.span>
          </span>
        </span>
      </motion.button>
      <span className={`text-[10.5px] leading-none ${active ? 'font-extrabold text-ink' : 'font-bold text-[#8a6a20]'}`}>
        {label}
      </span>
    </div>
  );
}

/** الإشعار الصغير اللي بيطلع فوق أيقونة الحساب */
function Tip({ title, body, cta, onCta, onClose, tone }) {
  const { t } = useTranslation();
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      style={{ transformOrigin: 'bottom' }}
      className="absolute bottom-full end-0 mb-3.5 w-[min(290px,calc(100vw-24px))]"
    >
      <div className={`relative rounded-[18px] p-3.5 pe-9 shadow-[0_20px_40px_-16px_rgba(8,19,15,.65)] ${
        tone === 'vip'
          ? 'bg-gradient-to-br from-[#1a3a2c] to-night text-ivory ring-1 ring-brass/50'
          : 'bg-night text-ivory'
      }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('bottomNav.dismiss')}
          className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-ivory/55 transition active:bg-ivory/10"
        >
          <X size={15} />
        </button>
        <div className={`text-[13.5px] font-extrabold ${tone === 'vip' ? 'text-brass-soft' : 'text-ivory'}`}>{title}</div>
        <p className="mt-1 text-[12px] leading-[1.75] text-ivory/75">{body}</p>
        {cta && (
          <button
            type="button"
            onClick={onCta}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2 text-[12px] font-extrabold text-[#241608] active:scale-95"
          >
            <LogIn size={13} className="rtl:rotate-180" /> {cta}
          </button>
        )}
        {/* السهم بيشاور على أيقونة الحساب (آخر خانة في الشريط) */}
        {/* الشريط عرضه 100vw-24px مقسوم 5 خانات، ونص آخر خانة = عُشر العرض */}
        <span className="absolute -bottom-1.5 end-[calc((100vw-24px)/10-6px)] h-3 w-3 rotate-45 bg-night" />
      </div>
    </motion.div>
  );
}

export default function BottomNav() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const supportOpen = useSelector((s) => s.ui.supportOpen);
  const authModalOpen = useSelector((s) => s.ui.authModalOpen);

  const { data, isLoading } = useGetMeQuery();
  const [hint] = useState(readAuthHint);
  const answered = !isLoading && data !== undefined;
  const serverUser = data?.user ?? null;
  // نفس فكرة الشريط العلوي: لحد ما رد السيرفر يوصل بنعتمد على "التلميح"
  // عشان الشريط ميطلعش "تسجيل دخول" لعميل داخل فعلاً
  const user = answered ? serverUser : (hint ? { name: hint.name } : null);
  const userKey = serverUser ? String(serverUser._id || serverUser.email || '') : '';
  const vip = answered ? isVipUser(serverUser) : (hint ? readKey('local', VIP_KEY + 'last') === '1' : false);

  const { data: dash } = useGetDashboardQuery(undefined, { skip: !serverUser });
  const unread = (serverUser && dash?.unreadSupport) || 0;

  const enabled = hasBottomNav(pathname);

  // ===== أي قسم ظاهر في الرئيسية (الرئيسية ولا التصاميم) =====
  const [homeSection, setHomeSection] = useState('home');
  useEffect(() => {
    if (pathname !== '/') return undefined;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = document.getElementById('gallery');
      if (!el) { setHomeSection('home'); return; }
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.45;
      setHomeSection(r.top < mid && r.bottom > mid ? 'designs' : 'home');
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // ===== بيستخبى وهو بيكتب =====
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el) => !!el && (
      el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable
      || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit', 'range', 'file', 'color'].includes(el.type))
    );
    const onIn = (e) => { if (isField(e.target)) setTyping(true); };
    // بنستنى لحظة: لو انتقل من خانة لخانة، الشريط ميرمش
    let timer = 0;
    const onOut = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setTyping(isField(document.activeElement)), 120);
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
      clearTimeout(timer);
    };
  }, []);

  // ===== إشعار الزائر: "سجّل دخول عشان..." =====
  const [guestTip, setGuestTip] = useState(false);
  useEffect(() => {
    // لما يسجّل، الإشعار بيختفي لوحده (showGuestTip بيشترط إنه زائر)
    if (!answered || serverUser || !enabled) return undefined;
    if (readKey('session', GUEST_TIP_KEY) === '1') return undefined;
    // بيطلع بعد ما يبص على الصفحة شوية، مش في وشّه أول ما يفتح
    const id = setTimeout(() => setGuestTip(true), 2200);
    return () => clearTimeout(id);
  }, [answered, serverUser, enabled]);
  function closeGuestTip() {
    setGuestTip(false);
    writeKey('session', GUEST_TIP_KEY, '1');
  }

  // ===== "مبروك بقيت VIP" — مرة واحدة لما الحالة تتغيّر قدامه =====
  // بيشتغل مع كل تحديث لبيانات الحساب — فلو الأدمن فعّل الباقة وهو فاتح
  // الموقع، أول ما البيانات تتحدّث بيشوف التهنئة
  const [vipTip, setVipTip] = useState(false);
  useEffect(() => {
    if (!serverUser || !userKey) return;
    const key = VIP_KEY + userKey;
    const before = readKey('local', key);
    const now = isVipUser(serverUser) ? '1' : '0';
    // before === null = أول مرة نشوف الحساب ده على الجهاز ده — مبنحتفلش،
    // لأننا مش عارفين هو دافع إمتى (ممكن من سنة)
    if (before === '0' && now === '1') setVipTip(true);
    if (before !== now) writeKey('local', key, now);
    writeKey('local', VIP_KEY + 'last', now);
  }, [serverUser, userKey]);

  if (!enabled) return null;

  // ===== التنقّل =====
  function go(to) {
    dispatch(setSupportOpen(false));
    if (pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(to);
    window.scrollTo({ top: 0 });
  }
  function goDesigns() {
    dispatch(setSupportOpen(false));
    if (pathname !== '/') navigate('/');
    scrollToSection('gallery');
  }
  function openLogin() {
    closeGuestTip();
    dispatch(setSupportOpen(false));
    dispatch(openAuthModal('login'));
  }

  const routeActive = supportOpen ? 'support'
    : pathname === '/' ? homeSection
      : pathname.startsWith('/packages') ? 'center'
        : pathname.startsWith('/dashboard') ? 'account'
          : '';

  const items = [
    { key: 'home', icon: House, label: t('bottomNav.home'), onClick: () => go('/') },
    { key: 'designs', icon: LayoutTemplate, label: t('bottomNav.designs'), onClick: goDesigns },
    user
      ? { key: 'center', icon: Crown, label: t('bottomNav.packages'), onClick: () => go('/packages') }
      : {
        key: 'center',
        icon: UserRoundPlus,
        label: t('bottomNav.join'),
        onClick: () => { closeGuestTip(); dispatch(setSupportOpen(false)); dispatch(openAuthModal('register')); },
      },
    {
      key: 'support',
      icon: MessageCircleMore,
      label: t('bottomNav.support'),
      onClick: () => dispatch(toggleSupport()),
      badge: unread,
    },
    user
      ? {
        key: 'account',
        icon: UserRound,
        label: vip ? t('bottomNav.vip') : t('bottomNav.member'),
        onClick: () => { setVipTip(false); go('/dashboard'); },
        tone: vip ? 'vip' : undefined,
      }
      : {
        key: 'account', icon: LogIn, label: t('bottomNav.login'), onClick: openLogin, dot: true,
      },
  ];

  const showGuestTip = guestTip && !user && !authModalOpen && !supportOpen;
  const showVipTip = vipTip && !!user && vip && !supportOpen;

  return (
    <MotionConfig reducedMotion="user">
      {/* مسافة في آخر الصفحة بطول الشريط — عشان آخر حاجة في الصفحة
          (الفوتر مثلاً) متستخباش وراه */}
      <div aria-hidden="true" className="h-[calc(88px+env(safe-area-inset-bottom))] md:hidden" />

      <AnimatePresence>
        {!typing && (
          <motion.nav
            key="bottom-nav"
            aria-label={t('bottomNav.label')}
            initial={{ y: 110, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 110, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            // z فوق غطاء لوحة الدعم (115) وتحت اللوحة نفسها (120) — عشان
            // أيقونة الدعم تفضل ظاهرة ومختارة وتقفل اللوحة لو ضغط عليها تاني
            className="fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-[117] md:hidden"
          >
            <AnimatePresence>
              {showGuestTip && (
                <Tip
                  key="guest"
                  title={t('bottomNav.guestTipTitle')}
                  body={t('bottomNav.guestTip')}
                  cta={t('bottomNav.guestTipCta')}
                  onCta={openLogin}
                  onClose={closeGuestTip}
                />
              )}
              {showVipTip && (
                <Tip
                  key="vip"
                  tone="vip"
                  title={t('bottomNav.vipTipTitle')}
                  body={t('bottomNav.vipTip')}
                  onClose={() => setVipTip(false)}
                />
              )}
            </AnimatePresence>

            <div className="grid h-[66px] grid-cols-5 rounded-[24px] border border-line bg-card/95 px-1 shadow-[0_18px_44px_-16px_rgba(8,19,15,.5)] backdrop-blur-xl">
              {items.map((item) => (item.key === 'center'
                ? <CenterItem key={item.key + (user ? '-u' : '-g')} item={item} active={routeActive === 'center'} />
                : <NavItem key={item.key} item={item} active={routeActive === item.key} />))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
