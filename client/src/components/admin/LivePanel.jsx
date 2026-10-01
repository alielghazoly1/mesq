// "دلوقتي على الموقع" + أرقام النهارده — أول حاجة في النظرة العامة.
// بيتحدّث لوحده كل 15 ثانية (RTK Query pollingInterval) ومن غير ما الصفحة
// كلها ترمش: الأرقام بس اللي بتتغيّر بحركة خفيفة.
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  UserPlus, FileText, Receipt, Wallet, Users, Globe, Crown, ArrowLeft,
} from 'lucide-react';
import { useGetLiveQuery } from '../../store/adminApi.js';
import { openUser, setUsersStatus } from '../../store/adminSlice.js';
import { LiveDot, StatTile, fmtNum, fmtMoney, fmtLastSeen } from './ui.jsx';
import { countryName } from '../../pages/admin/format.js';

/** العميل فين في الموقع — بالعربي بدل المسار الخام */
function placeLabel(path) {
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
function Ticker({ value, className }) {
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

export default function LivePanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isError } = useGetLiveQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    skipPollingIfUnfocused: true,
  });

  const online = data?.online || { total: 0, users: 0, visitors: 0 };
  const today = data?.today;
  const list = data?.onlineUsers || [];

  function showAllOnline() {
    dispatch(setUsersStatus('online'));
    navigate('/admin/clients');
  }

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
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38a8ff]/12 px-3 py-1.5 text-[12px] font-bold text-[#8fcbff]">
                <Users size={13} /> <Ticker value={online.users} /> عميل مسجّل
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/[0.07] px-3 py-1.5 text-[12px] font-bold text-ivory/65">
                <Globe size={13} /> <Ticker value={online.visitors} /> زائر
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ivory/35">
              {isError ? 'معرفناش نحدّث دلوقتي — هنجرّب تاني لوحدنا.'
                : 'بيتحدّث لوحده كل 15 ثانية. "متصل" = فاتح الموقع في آخر دقيقة ونص.'}
            </p>
          </div>

          {/* العملاء المتصلين */}
          <div className="min-w-0 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-serif text-[15px] font-bold text-ivory">العملاء المتصلين</h2>
              {online.users > 0 && (
                <button type="button" onClick={showAllOnline}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#8fcbff] hover:text-white">
                  شوف الكل <ArrowLeft size={13} />
                </button>
              )}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={UserPlus} tone="gold" label="سجّلوا النهارده" value={fmtNum(today?.signups || 0)} delay={0} />
          <StatTile icon={FileText} label="دعوات اتنشرت النهارده" value={fmtNum(today?.invitations || 0)} delay={0.04} />
          <StatTile icon={Receipt} label="طلبات باقات النهارده" value={fmtNum(today?.orders || 0)} delay={0.08} />
          <StatTile
            icon={Wallet} label="أرباح النهارده" delay={0.12}
            value={fmtMoney(today?.revenue?.EGP?.total || 0, 'EGP')}
            hint={today?.revenue?.USD?.total ? `+ ${fmtMoney(today.revenue.USD.total, 'USD')}` : 'الطلبات اللي اتفعّلت النهارده'}
          />
        </div>
      </div>
    </div>
  );
}
