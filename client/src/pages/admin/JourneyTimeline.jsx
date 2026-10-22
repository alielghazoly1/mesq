// زيارة واحدة خطوة بخطوة — بتتحدّث لوحدها كل 3 ثواني لو الزائر لسه على الموقع.
import { useEffect, useState } from 'react';
import {
  Eye, MousePointerClick, EyeOff, RotateCcw, LogOut, Smartphone, Monitor, Tablet, Globe, Clock, Layers, Compass,
} from 'lucide-react';
import { useGetJourneyQuery } from '../../store/adminApi.js';
import { Spinner, Empty, fmtDate, LiveDot } from '../../components/admin/ui.jsx';
import { countryName } from './format.js';
import SignupBadge from './SignupBadge.jsx';
import SourceBadge from './SourceBadge.jsx';
import {
  enrich, eventText, fmtClock, fmtDur, pageLabel, SRC_LABEL, KIND_LABEL,
} from './journeyUtils.js';

const ICON = { v: Eye, c: MousePointerClick, h: EyeOff, s: RotateCcw, x: LogOut };
const TONE = {
  v: 'bg-[#38a8ff]/15 text-[#8fcbff]', c: 'bg-brass/15 text-brass-soft', h: 'bg-ivory/[0.07] text-ivory/50',
  s: 'bg-emerald-bright/15 text-emerald-bright', x: 'bg-error/15 text-[#e8a597]',
};
const KIND_ICON = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

export default function JourneyTimeline({ id, onOpenClient }) {
  const [live, setLive] = useState(true);
  const { data, isLoading, isError } = useGetJourneyQuery(id, { pollingInterval: live ? 3000 : 0, skipPollingIfUnfocused: true });
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (data) setLive(!!data.online); }, [data]);
  // المدة "لحد دلوقتي" بتعدّ كل ثانية
  useEffect(() => { if (!live) return undefined; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [live]);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <Empty>معرفناش نجيب الزيارة دي.</Empty>;
  const ev = enrich(data.events, { live: data.online, now });
  const KIcon = KIND_ICON[data.kind] || Smartphone;
  const total = Math.round(((data.online ? now : new Date(data.lastAt).getTime()) - new Date(data.startedAt).getTime()) / 1000);

  return (
    <div data-journey={data.id}>
      {/* مين ومنين */}
      <div className="rounded-2xl border border-line-lite bg-night/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {data.online ? <LiveDot size={9} /> : <span className="h-2.5 w-2.5 rounded-full bg-ivory/25" />}
          <span className="font-serif text-[17px] font-bold text-ivory">{data.person ? data.person.name : 'زائر مش مسجّل'}</span>
          {data.person && <SignupBadge signup={data.person.signup} />}
          {data.person && <SourceBadge source={data.person.source} />}
          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${data.online ? (data.hidden ? 'bg-ivory/10 text-ivory/60' : 'bg-[#38a8ff]/15 text-[#8fcbff]') : 'bg-ivory/[0.07] text-ivory/45'}`} data-status>
            {data.online ? (data.hidden ? 'سايب التاب' : 'على الموقع دلوقتي') : data.endedAt ? 'قفل الموقع' : 'خرج'}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ivory/55">
          <span className="inline-flex items-center gap-1"><KIcon size={13} /> {KIND_LABEL[data.kind] || data.kind}{data.os ? ` · ${data.os}` : ''}{data.browser ? ` · ${data.browser}` : ''}</span>
          <span className="inline-flex items-center gap-1"><Compass size={13} /> جه من: {SRC_LABEL[data.src] || data.src}</span>
          {data.country && <span className="inline-flex items-center gap-1"><Globe size={13} /> {countryName(data.country)}</span>}
          <span className="inline-flex items-center gap-1"><Clock size={13} /> بدأ {fmtDate(data.startedAt, true)} · {fmtDur(total)}</span>
          <span className="inline-flex items-center gap-1"><Layers size={13} /> {data.views} صفحة · {data.clicks} ضغطة · زيارة رقم {data.visits}</span>
        </div>
        {data.person && onOpenClient && (
          <button type="button" onClick={() => onOpenClient(data.person.id)} className="mt-3 text-[12px] font-bold text-brass-soft hover:underline">افتح ملف العميل ←</button>
        )}
      </div>

      {/* الخطوات */}
      <ol className="relative mt-4 space-y-1.5 before:absolute before:bottom-2 before:top-2 before:w-px before:bg-line-lite ltr:before:left-[15px] rtl:before:right-[15px]" data-steps>
        {ev.map((e, i) => {
          const Icon = ICON[e.k] || Eye;
          return (
            <li key={`${e.t}-${i}`} className="relative flex items-start gap-3" data-step={e.k}>
              <span className={`relative z-[1] flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full ${TONE[e.k] || TONE.v}`}><Icon size={14} /></span>
              <span className="min-w-0 flex-1 rounded-xl px-1 py-1.5">
                <span className="block text-[13px] font-bold text-ivory/90">{eventText(e, i)}</span>
                <span className="block text-[11.5px] text-ivory/45">
                  {fmtClock(e.t)}
                  {e.k === 'v' && e.stay != null && <> · {e.open ? 'فاتحها من' : 'قعد'} <b className="text-ivory/70">{fmtDur(e.stay)}</b>{!e.open && e.scroll ? ` · نزل لحد ${e.scroll}%` : ''}</>}
                  {e.k === 'x' && e.d ? ` · كان قاعد ${fmtDur(e.d)}` : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {data.online && <p className="mt-3 text-[11.5px] text-ivory/35">بيتحدّث لوحده كل 3 ثواني — دلوقتي على: {pageLabel(data.presencePath || data.current)}</p>}
    </div>
  );
}
