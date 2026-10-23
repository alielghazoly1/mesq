// "دلوقتي على الموقع" + أرقام النهارده — أول حاجة في النظرة العامة.
// بيتحدّث لوحده كل 4 ثواني (RTK Query pollingInterval) ومن غير ما الصفحة
// كلها ترمش: الأرقام بس اللي بتتغيّر بحركة خفيفة.
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  UserPlus, FileText, Receipt, Wallet, Users, Globe, Crown, ArrowLeft, MousePointerClick,
} from 'lucide-react';
import { useGetLiveQuery } from '../../store/adminApi.js';
import { openUser, setUsersStatus, setInvitationsFilter } from '../../store/adminSlice.js';
import { LiveDot, StatTile, fmtNum, fmtMoney, fmtLastSeen } from './ui.jsx';
import { countryName } from '../../pages/admin/format.js';
import SignupBadge from '../../pages/admin/SignupBadge.jsx';
import SourceBadge from '../../pages/admin/SourceBadge.jsx';

/** العميل فين في الموقع — بالعربي بدل المسار الخام */
export function placeLabel(path) {
  const p = String(path || '/');
  if (p === '/' || p === '') return 'الصفحة الرئيسية';
  if (p.startsWith('/packages')) return 'صفحة الباقات';
  if (p.startsWith('/checkout')) return 'صفحة الدفع';
  if (p.startsWith('/dashboard')) return 'لوحته';
  if (p.startsWith('/editor')) return 'بيعدّل دعوة';
  if (p.startsWith('/create')) return 'بيعمل دعوة';
  return p;
}

/** رقم بيتغيّر بحركة (القديم بيطلع لفوق والجديد بيدخل) */
export function Ticker({ value, className }) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className || ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '60%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-60%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          {fmtNum(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** التاب ده ظاهر؟ (مابنسألش السيرفر والتاب في الخلفية) */
export function usePageVisible() {
  const [v, setV] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const on = () => setV(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return v;
}

export default function LivePanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const visible = usePageVisible();
  // كل 4 ثواني (حتى لو اللوحة مفتوحة على شاشة تانية مش عليها الماوس) —
  // واللي يقفل التاب بيختفي في نفس اللحظة من السيرفر، فاللوحة بتلحقه على طول
  const { data, isError } = useGetLiveQuery(undefined, {
    pollingInterval: visible ? 4000 : 0,
    refetchOnFocus: true,
    skipPollingIfUnfocused: false,
  });

  const online = data?.online || { total: 0, users: 0, visitors: 0 };
  const today = data?.today;
  const list = data?.onlineUsers || [];

  function showAllOnline() {
    dispatch(setUsersStatus('online'));
    navigate('/admin/clients');
  }
  // كروت "النهارده" بتوديك للقايمة اللي ورا الرقم
  const goClients = (status) => { dispatch(setUsersStatus(status)); navigate('/admin/clients'); };
  const goInvitations = () => { dispatch(setInvitationsFilter('today')); navigate('/admin/invitations'); };
  // الطلبات اللي اتعملت النهارده / اللي اتفعّلت النهارده → صفحة طلبات اليوم بالتفاصيل
  const goOrders = () => navigate('/admin/orders-day?kind=created');

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-[#38a8ff]/25 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(56,168,255,0.13),transparent_55%)] bg-panel">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* العدد */}
          <div className="border-b border-line-lite p-5 lg:border-b-0 lg:border-e">
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-[#8fcbff]">
              <LiveDot size={9} /> دلوقتي على الموقع
            </div>
            <div className="mt-3 flex items-end gap-3">
              <Ticker value={online.total} className="font-serif text-[54px] font-bold leading-none text-ivory" />
              <span className="mb-1.5 text-[13px] text-ivory/45">{online.total === 1 ? 'شخص' : 'شخص فاتح الموقع'}</span>
            </div>
            {/* كام جهاز شاف الموقع النهارده → صفحة التحليلات */}
            <button type="button" onClick={() => navigate('/admin/analytics')} data-devices-today
              className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-[#38a8ff]/30 bg-[#38a8ff]/[0.08] px-3.5 py-2.5 text-start transition hover:border-[#38a8ff]/60">
              <span>
                <span className="block text-[11.5px] font-bold text-[#8fcbff]">أجهزة شافت الموقع النهارده</span>
                <span className="mt-0.5 flex items-baseline gap-2">
                  <Ticker value={today?.devices || 0} className="font-serif text-[26px] font-bold leading-none text-ivory" />
                  {today?.newDevices ? <span className="text-[11.5px] font-bold text-emerald-bright">{fmtNum(today.newDevices)} جديد</span> : null}
                </span>
              </span>
              <span className="shrink-0 text-[11.5px] font-bold text-[#8fcbff]">التحليلات ←</span>
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38a8ff]/12 px-3 py-1.5 text-[12px] font-bold text-[#8fcbff]">
                <Users size={13} /> <Ticker value={online.users} /> عميل مسجّل
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/[0.07] px-3 py-1.5 text-[12px] font-bold text-ivory/65">
                <Globe size={13} /> <Ticker value={online.visitors} /> زائر
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ivory/35">
              {isError ? 'معرفناش نحدّث دلوقتي — هنجرّب تاني لوحدنا.'
                : 'بيتحدّث لوحده كل 4 ثواني. "متصل" = فاتح الموقع قدامه دلوقتي — أول ما يقفل التاب أو يروح تاب تاني بيختفي.'}
            </p>
          </div>

          {/* العملاء المتصلين */}
          <div className="min-w-0 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-serif text-[15px] font-bold text-ivory">العملاء المتصلين</h2>
              <span className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/admin/live')} data-go-live
                className="inline-flex items-center gap-1 rounded-full bg-[#38a8ff]/15 px-3 py-1 text-[12px] font-bold text-[#8fcbff] hover:bg-[#38a8ff]/25">
                شوفهم بيعملوا إيه لايف <ArrowLeft size={13} />
              </button>
              {online.users > 0 && (
                <button type="button" onClick={showAllOnline}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#8fcbff] hover:text-white">
                  شوف الكل <ArrowLeft size={13} />
                </button>
              )}
              </span>
            </div>
            {list.length === 0 ? (
              <p className="py-6 text-center text-[12.5px] text-ivory/35">
                مفيش عميل مسجّل فاتح الموقع دلوقتي{online.visitors ? ' — بس فيه زوار بيتفرجوا' : ''}.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                <AnimatePresence initial={false}>
                  {list.slice(0, 8).map((u) => (
                    <motion.li
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                    >
                      <button type="button" onClick={() => dispatch(openUser(u.id))}
                        className="flex w-full items-center gap-3 rounded-xl border border-line-lite bg-night/40 px-3 py-2.5 text-start transition hover:border-[#38a8ff]/40">
                        <LiveDot size={8} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 truncate text-[13px] font-bold text-ivory">
                            <span className="truncate">{u.name}</span>
                            {u.isPremium && <Crown size={12} className="shrink-0 text-brass" />}
                          </span>
                          <span className="block truncate text-[11px] text-ivory/45">
                            {placeLabel(u.path)} · {countryName(u.country)}
                          </span>
                          {/* سجّل بجوجل ولا لأ، وجه من إعلان ولا لأ */}
                          <span className="mt-1 flex flex-wrap items-center gap-1">
                            <SignupBadge signup={u.signup} />
                            <SourceBadge source={u.source} />
                            {u.newToday && <span className="rounded-full bg-ok/15 px-2 py-0.5 text-[10.5px] font-extrabold text-ok">جديد النهارده</span>}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10.5px] text-ivory/35">{fmtLastSeen(u.lastSeen, false)}</span>
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* النهارده (بتوقيت مصر) */}
      <div>
        <h2 className="mb-2.5 font-serif text-[15px] font-bold text-ivory/80">النهارده</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatTile icon={UserPlus} tone="gold" label="سجّلوا النهارده" value={fmtNum(today?.signups || 0)} delay={0}
            onClick={() => goClients('today')} />
          <StatTile
            icon={MousePointerClick} label="فتحوا الموقع النهارده" value={fmtNum(today?.activeUsers || 0)} delay={0.03}
            hint={today?.returning ? `منهم ${fmtNum(today.returning)} مسجّلين قبل كده` : 'عملاء مسجّلين'}
            onClick={() => goClients('activeToday')}
          />
          <StatTile icon={FileText} label="دعوات اتنشرت النهارده" value={fmtNum(today?.invitations || 0)} delay={0.06}
            onClick={goInvitations} />
          <StatTile icon={Receipt} label="طلبات باقات النهارده" value={fmtNum(today?.orders || 0)} delay={0.09}
            onClick={goOrders} cta="شوفهم" />
          <StatTile
            icon={Wallet} label="أرباح النهارده" delay={0.12} onClick={() => navigate('/admin/orders-day')} cta="الطلبات"
            value={fmtMoney(today?.revenue?.EGP?.total || 0, 'EGP')}
            hint={(today?.revenue?.USD?.total || today?.revenue?.SAR?.total || today?.revenue?.EUR?.total)
              ? [today.revenue.USD?.total ? `+ ${fmtMoney(today.revenue.USD.total, 'USD')}` : '', today.revenue.SAR?.total ? `+ ${fmtMoney(today.revenue.SAR.total, 'SAR')}` : '', today.revenue.EUR?.total ? `+ ${fmtMoney(today.revenue.EUR.total, 'EUR')}` : ''].filter(Boolean).join(' ')
              : 'الطلبات اللي اتفعّلت النهارده'}
          />
        </div>
      </div>
    </div>
  );
}
