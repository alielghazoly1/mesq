// "مباشر" — مين على الموقع دلوقتي وبيعمل إيه: هو فين، جه منين، فتح إيه قبلها،
// قعد قد إيه، ومين لسه خارج. بيتحدّث لوحده كل 4 ثواني. الضغط على أي حد
// بيفتح زيارته خطوة بخطوة (وبتتحدّث لايف).
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import { Radio, Smartphone, Monitor, Tablet, ChevronLeft, X, EyeOff, LogOut, Users, Globe } from 'lucide-react';
import { useGetLiveJourneysQuery } from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import { Panel, Spinner, Empty, LiveDot, fmtNum } from '../../components/admin/ui.jsx';
import { countryName } from './format.js';
import SignupBadge from './SignupBadge.jsx';
import SourceBadge from './SourceBadge.jsx';
import ClientDrawer from './ClientDrawer.jsx';
import JourneyTimeline from './JourneyTimeline.jsx';
import { pageLabel, fmtDur, ago, SRC_LABEL, KIND_LABEL } from './journeyUtils.js';

const KIND_ICON = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

function Card({ s, now, onOpen }) {
  const KIcon = KIND_ICON[s.kind] || Smartphone;
  const lastView = s.trail[s.trail.length - 1];
  const onPageFor = lastView ? Math.round((now - new Date(lastView.t).getTime()) / 1000) : 0;
  const total = Math.round(((s.online ? now : new Date(s.lastAt).getTime()) - new Date(s.startedAt).getTime()) / 1000);
  const lastClick = s.lastEvent && s.lastEvent.k === 'c' ? s.lastEvent : null;
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
      <button type="button" onClick={() => onOpen(s.id)} data-live-card={s.id}
        className={`w-full rounded-2xl border p-4 text-start transition hover:border-[#38a8ff]/50 ${s.online ? 'border-[#38a8ff]/25 bg-panel' : 'border-line-lite bg-panel/60 opacity-80'}`}>
        <div className="flex flex-wrap items-center gap-2">
          {s.online ? <LiveDot size={9} /> : <LogOut size={13} className="text-ivory/35" />}
          <span className="text-[14px] font-bold text-ivory">{s.person ? s.person.name : 'زائر'}</span>
          {s.person && <SignupBadge signup={s.person.signup} />}
          {s.person ? <SourceBadge source={s.person.source} compact /> : <span className="rounded-full bg-ivory/[0.06] px-2 py-0.5 text-[10.5px] font-bold text-ivory/50">جه من: {SRC_LABEL[s.src] || s.src}</span>}
          <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-ivory/45"><KIcon size={12} /> {KIND_LABEL[s.kind] || s.kind}{s.os ? ` · ${s.os}` : ''}{s.country ? ` · ${countryName(s.country)}` : ''}</span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 text-[13px]">
          {s.online ? (
            s.hidden
              ? <span className="inline-flex items-center gap-1 font-bold text-ivory/60"><EyeOff size={13} /> سايب التاب على {pageLabel(s.current)}</span>
              : <span className="font-bold text-[#8fcbff]">دلوقتي على: {pageLabel(s.current)}</span>
          ) : <span className="font-bold text-ivory/60">خرج من {pageLabel(s.exit)} {ago(s.lastAt, now)}</span>}
          {s.online && !s.hidden && lastView && <span className="text-[11.5px] text-ivory/45">من {fmtDur(onPageFor)}</span>}
        </div>
        {lastClick && s.online && <div className="mt-1 text-[12px] text-brass-soft/90">آخر حاجة: ضغط على «{lastClick.l}» {ago(lastClick.t, now)}</div>}
        {/* المشوار: الصفحات اللي فتحها بالترتيب */}
        {s.trail.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[11.5px]" data-trail>
            {s.trail.map((t, i) => (
              <span key={`${t.t}-${i}`} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronLeft size={12} className="text-ivory/30" />}
                <span className={`rounded-full px-2 py-0.5 ${i === s.trail.length - 1 ? 'bg-[#38a8ff]/15 font-bold text-[#8fcbff]' : 'bg-ivory/[0.06] text-ivory/60'}`}>
                  {pageLabel(t.p)}{t.d ? ` · ${fmtDur(t.d)}` : ''}
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 text-[11px] text-ivory/40">على الموقع {fmtDur(total)} · {s.views} صفحة · {s.clicks} ضغطة · دخل من {pageLabel(s.entry)}</div>
      </button>
    </motion.li>
  );
}

export default function LiveJourneysPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((st) => st.admin.openUserId);
  const { data, isLoading, isError } = useGetLiveJourneysQuery(undefined, { pollingInterval: 4000, skipPollingIfUnfocused: true });
  const [openId, setOpenId] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-5" data-live-page>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-[21px] font-bold text-ivory"><Radio size={19} className="text-[#38a8ff]" /> مباشر</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">مين على الموقع دلوقتي، هو فين، جه منين، وراح فين قبلها — بيتحدّث لوحده كل 4 ثواني. دوس على أي حد تشوف زيارته خطوة بخطوة.</p>
        </div>
        {data && (
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#38a8ff]/30 bg-[#38a8ff]/10 px-4 py-2 text-[13px] font-bold text-[#8fcbff]" data-live-count><LiveDot size={8} /> {fmtNum(data.counts.live)} على الموقع</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-lite bg-panel px-4 py-2 text-[13px] font-bold text-ivory/70"><Users size={14} /> {fmtNum(data.counts.users)} عملاء · <Globe size={14} /> {fmtNum(data.counts.live - data.counts.users)} زوار</span>
          </div>
        )}
      </div>

      {isLoading || !data ? (isError ? <Empty>معرفناش نحمّل — هنجرّب تاني.</Empty> : <Spinner />) : (
        <>
          <Panel title="على الموقع دلوقتي" subtitle="المتصل = فاتح الموقع في آخر دقيقة ونص (حتى لو قاعد يقرا من غير ما يضغط)">
            {data.live.length === 0 ? <Empty>مفيش حد على الموقع دلوقتي.</Empty> : (
              <ul className="grid gap-3 lg:grid-cols-2" data-live-list>
                <AnimatePresence initial={false}>
                  {data.live.map((s) => <Card key={s.id} s={s} now={now} onOpen={setOpenId} />)}
                </AnimatePresence>
              </ul>
            )}
          </Panel>
          <Panel title="خرجوا في آخر ربع ساعة" subtitle="آخر صفحة كانوا عليها قبل ما يمشوا">
            {data.left.length === 0 ? <Empty>محدش خرج في آخر ربع ساعة.</Empty> : (
              <ul className="grid gap-3 lg:grid-cols-2" data-left-list>
                {data.left.map((s) => <Card key={s.id} s={s} now={now} onOpen={setOpenId} />)}
              </ul>
            )}
          </Panel>
        </>
      )}

      <AnimatePresence>
        {openId && (
          <>
            <motion.button type="button" aria-label="اقفل" onClick={() => setOpenId(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/55" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-[540px] flex-col border-e border-line-lite bg-night shadow-2xl" data-journey-drawer>
              <header className="flex items-center justify-between border-b border-line-lite px-5 py-3.5">
                <h2 className="font-serif text-[16px] font-bold text-ivory">الزيارة خطوة بخطوة</h2>
                <button type="button" onClick={() => setOpenId(null)} aria-label="اقفل" className="rounded-full p-1.5 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"><X size={18} /></button>
              </header>
              <div className="flex-1 overflow-y-auto p-5">
                <JourneyTimeline id={openId} onOpenClient={(uid) => { setOpenId(null); dispatch(openUser(uid)); }} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
      {openUserId && <button type="button" aria-label="اقفل" onClick={() => dispatch(closeUser())} className="fixed inset-0 z-40 bg-black/55" />}
    </div>
  );
}
