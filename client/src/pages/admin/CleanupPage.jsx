// تنضيف الدعوات المجانية المنتهية.
//
// المسح هنا بإيدك بس: الصفحة بتوريك الأول هيتمسح كام ومين محمي، وبعدين
// لازم تكتب كلمة التأكيد عشان الزرار يشتغل. المسح بيتم على دفعات (1000)
// والشريط بيوريك وصل لفين، وتقدر توقّفه في أي وقت.
//
// القواعد نفسها في السيرفر (utils/cleanupExpired.js): المجاني بس، بعد
// الفرح بـ 5 أيام، وأي دعوة صاحبها دفع أو مستني مراجعة إيصاله محمية.
// الأرقام (العدادات والإحصائيات والرسوم) بتتحفظ قبل المسح فماتنقصش.
import { useRef, useState } from 'react';
import {
  Trash2, ShieldCheck, Crown, CalendarClock, Eye, AlertTriangle, CheckCircle2, Square, RefreshCw,
} from 'lucide-react';
import { useGetCleanupPreviewQuery, useRunCleanupMutation, adminApi } from '../../store/adminApi.js';
import { useDispatch } from 'react-redux';
import { Panel, Btn, Spinner, StatTile, fmtDate, fmtNum } from '../../components/admin/ui.jsx';

const CONFIRM_WORD = 'امسح';
const errOf = (e) => (e && e.data && e.data.error) || 'حصل خطأ، جرّب تاني.';

export default function CleanupPage() {
  const dispatch = useDispatch();
  const { data, isLoading, isFetching, refetch, error: loadError } = useGetCleanupPreviewQuery();
  const [runBatch] = useRunCleanupMutation();
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | running | done | stopped
  const [progress, setProgress] = useState({ deleted: 0, total: 0 });
  const [error, setError] = useState('');
  const stopRef = useRef(false);

  async function start() {
    if (typed.trim() !== CONFIRM_WORD || !data || !data.totalMatching) return;
    setError('');
    stopRef.current = false;
    const total = data.totalMatching;
    let deleted = 0;
    setProgress({ deleted, total });
    setPhase('running');
    try {
      // دفعة ورا دفعة لحد ما يخلص (أو توقّفه)
      for (let i = 0; i < 500; i++) {
        const r = await runBatch().unwrap();
        deleted += r.deleted || 0;
        setProgress({ deleted, total });
        if (!r.deleted || !r.remaining) break;
        if (stopRef.current) { setPhase('stopped'); break; }
      }
      setPhase((p) => (p === 'stopped' ? 'stopped' : 'done'));
    } catch (e) {
      setError(errOf(e));
      setPhase('stopped');
    } finally {
      setTyped('');
      // الأرقام في باقي الصفحات تتحدّث
      dispatch(adminApi.util.invalidateTags(['Overview', 'Invitations', 'Audit']));
      refetch();
    }
  }

  if (isLoading) return <Spinner label="بنحسب الدعوات المنتهية…" />;
  if (loadError) return <Panel><p className="text-[13px] text-error">{errOf(loadError)}</p></Panel>;

  const running = phase === 'running';
  const pct = progress.total ? Math.min(100, Math.round((progress.deleted / progress.total) * 100)) : 0;
  const ready = typed.trim() === CONFIRM_WORD && data.totalMatching > 0 && !running;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[22px] font-bold text-ivory">تنضيف الدعوات المنتهية</h1>
        <p className="mt-1 text-[12.5px] text-ivory/50">
          بيمسح الدعوات <b className="text-ivory/80">المجانية</b> اللي عدى على ميعاد فرحها {data.graceDays} أيام — والأرقام والإحصائيات بتفضل زي ما هي.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Trash2} tone="danger" label="هتتمسح" value={fmtNum(data.totalMatching)} hint={`من ${fmtNum(data.totalInvitations)}`} />
        <StatTile icon={Crown} tone="ok" label="مدفوعة — محمية" value={fmtNum(data.protected.premium)} delay={0.05} />
        <StatTile icon={ShieldCheck} tone="ok" label="مجانية صاحبها دفع — محمية" value={fmtNum(data.protected.paidOwnerFree)} delay={0.1} />
        <StatTile icon={Eye} label="مشاهداتها (بتتحفظ في العداد)" value={fmtNum(data.views)} delay={0.15} />
      </div>

      <Panel title="مين بيتمسح ومين لأ">
        <ul className="space-y-2 text-[13px] leading-[1.9] text-ivory/75">
          <li className="flex gap-2"><Trash2 size={15} className="mt-1.5 shrink-0 text-error" /> الدعوة المجانية اللي عدى على ميعاد فرحها {data.graceDays} أيام أو أكتر.</li>
          <li className="flex gap-2"><ShieldCheck size={15} className="mt-1.5 shrink-0 text-ok" /> أي دعوة مدفوعة — عمرها ما تتمسح.</li>
          <li className="flex gap-2"><ShieldCheck size={15} className="mt-1.5 shrink-0 text-ok" /> أي دعوة صاحبها دفع في أي وقت، أو رفع إيصال ولسه مستني المراجعة — حتى لو هي نفسها مجانية.</li>
          <li className="flex gap-2"><CalendarClock size={15} className="mt-1.5 shrink-0 text-ok" /> أي دعوة فرحها لسه ماجاش أو ماعداش عليه {data.graceDays} أيام.</li>
        </ul>
        {data.totalMatching > 0 && data.oldest && (
          <p className="mt-3 text-[12px] text-ivory/45">أقدم دعوة هتتمسح فرحها كان {fmtDate(data.oldest)}.</p>
        )}
        {data.archived && data.archived.lastCleanupAt && (
          <p className="mt-1 text-[12px] text-ivory/45">
            آخر تنضيف: {fmtDate(data.archived.lastCleanupAt, true)} — اتحفظ لحد دلوقتي أرقام {fmtNum(data.archived.invitations)} دعوة ممسوحة.
          </p>
        )}
      </Panel>

      <Panel title="المسح">
        {phase === 'done' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-ok/40 bg-ok/[0.08] p-3.5 text-[13px] text-ok">
            <CheckCircle2 size={16} /> خلص — اتمسح {fmtNum(progress.deleted)} دعوة، والأرقام اتحفظت.
          </div>
        )}
        {phase === 'stopped' && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-brass/40 bg-brass/[0.08] p-3.5 text-[13px] text-brass">
            <AlertTriangle size={16} /> وقف بعد {fmtNum(progress.deleted)} دعوة. تقدر تكمّل في أي وقت.
          </div>
        )}
        {error && <p className="mb-3 text-[12.5px] text-error">{error}</p>}

        {running ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12.5px] text-ivory/70">
              <span>بيمسح… {fmtNum(progress.deleted)} من {fmtNum(progress.total)}</span>
              <span className="font-bold text-ivory">{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ivory/10">
              <div className="h-full rounded-full bg-gradient-to-l from-brass to-brass-soft transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11.5px] text-ivory/40">سيب الصفحة مفتوحة لحد ما يخلص.</p>
            <Btn icon={Square} onClick={() => { stopRef.current = true; }}>وقّف بعد الدفعة دي</Btn>
          </div>
        ) : data.totalMatching === 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 text-[13px] text-ok"><CheckCircle2 size={16} /> مفيش دعوات منتهية تتمسح دلوقتي.</p>
            <Btn size="sm" icon={RefreshCw} loading={isFetching} onClick={refetch}>حدّث</Btn>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-error/35 bg-error/[0.06] p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-error" />
              <p className="text-[12.5px] leading-[1.9] text-ivory/80">
                هيتمسح <b className="text-ivory">{fmtNum(data.totalMatching)}</b> دعوة مجانية منتهية نهائيًا، مع ردود الحضور والصور بتاعتها.
                <span className="block text-ivory/50">المسح مالوش رجوع. المدفوع مش هيتلمس، والعدادات والإحصائيات هتفضل بنفس أرقامها.</span>
              </p>
            </div>
            <label className="block text-[12.5px] text-ivory/60">
              للتأكيد اكتب كلمة <b className="text-ivory">«{CONFIRM_WORD}»</b>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={CONFIRM_WORD}
                autoComplete="off"
                className="mt-1.5 block w-full max-w-[260px] rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[14px] text-ivory placeholder:text-ivory/20 focus:border-error/60 focus:outline-none"
              />
            </label>
            <Btn tone="danger" icon={Trash2} disabled={!ready} onClick={start} data-cleanup-run>
              امسح {fmtNum(data.totalMatching)} دعوة منتهية
            </Btn>
          </div>
        )}
      </Panel>
    </div>
  );
}
