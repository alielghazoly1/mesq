// ملف العميل → "رحلاته على الموقع": كل زيارة (إمتى، قد إيه، دخل منين وخرج منين)،
// والضغط عليها بيفتحها خطوة بخطوة.
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGetUserJourneysQuery } from '../../store/adminApi.js';
import { Panel, Spinner, Btn, LiveDot, fmtDate } from '../../components/admin/ui.jsx';
import JourneyTimeline from './JourneyTimeline.jsx';
import { pageLabel, fmtDur, SRC_LABEL, KIND_LABEL } from './journeyUtils.js';

export default function ClientJourneysPanel({ userId }) {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const { data, isLoading } = useGetUserJourneysQuery({ id: userId, page }, { pollingInterval: 15000, skipPollingIfUnfocused: true });
  return (
    <Panel title={`رحلاته على الموقع${data ? ` (${data.total})` : ''}`} subtitle="كل زيارة: فتح إيه، قعد قد إيه، ضغط على إيه — دوس على أي زيارة تشوفها خطوة بخطوة">
      {isLoading ? <Spinner /> : !data || !data.sessions.length ? (
        <p className="py-3 text-center text-[12.5px] text-ivory/40">لسه مفيش زيارات متسجّلة (التتبع بدأ النهارده).</p>
      ) : (
        <ul className="space-y-2" data-client-journeys>
          {data.sessions.map((s) => {
            const dur = Math.round((new Date(s.lastAt) - new Date(s.startedAt)) / 1000);
            const open = openId === s.id;
            return (
              <li key={s.id} className="rounded-xl border border-line-lite bg-night/30">
                <button type="button" onClick={() => setOpenId(open ? null : s.id)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-start" data-journey-row={s.id}>
                  {s.online ? <LiveDot size={8} /> : <span className="h-2 w-2 rounded-full bg-ivory/20" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-ivory/90">{fmtDate(s.startedAt, true)}{s.online ? ' · على الموقع دلوقتي' : ''}</span>
                    <span className="block truncate text-[11.5px] text-ivory/45">
                      {fmtDur(dur)} · {s.views} صفحة · {s.clicks} ضغطة · {pageLabel(s.entry)} ← {pageLabel(s.online ? s.current : s.exit)} · {KIND_LABEL[s.kind] || s.kind} · {SRC_LABEL[s.src] || s.src}
                    </span>
                  </span>
                  {open ? <ChevronUp size={16} className="text-ivory/40" /> : <ChevronDown size={16} className="text-ivory/40" />}
                </button>
                {open && <div className="border-t border-line-lite p-3.5"><JourneyTimeline id={s.id} /></div>}
              </li>
            );
          })}
        </ul>
      )}
      {data && (data.hasMore || page > 1) && (
        <div className="mt-3 flex justify-center gap-2">
          {page > 1 && <Btn size="sm" onClick={() => setPage((p) => p - 1)}>الأحدث</Btn>}
          {data.hasMore && <Btn size="sm" onClick={() => setPage((p) => p + 1)}>زيارات أقدم</Btn>}
        </div>
      )}
    </Panel>
  );
}
