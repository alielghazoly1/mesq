// صفحة الدعم في اللوحة — زي واتساب ويب:
//   فوق: مستنيين ردك · رسايل مش مقروءة · المحادثات
//   يمين: المحادثات (بحث + الكل/مستنيين ردك/مش مقروءة)، وكل عميل جنبه عدد
//         رسايله الجديدة، ونقطة خضرا لو على الموقع دلوقتي، و✓✓ لو شاف ردك
//   شمال: المحادثة — كلام وفويس، ردود جاهزة بضغطة، وتسجيل فويس
//
// كل حاجة بتتحدّث لوحدها: القايمة كل 10 ثواني، والمحادثة المفتوحة كل 5.
// على الموبايل: القايمة الأول، ولما تفتح محادثة بتاخد الشاشة كلها برجوع.
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Crown, Ban, MessageSquare, Search, ArrowRight, UserRound, Mic, Inbox, Clock3, MailWarning, X,
} from 'lucide-react';
import {
  adminApi, useGetSupportThreadsQuery, useGetSupportThreadQuery, useReplySupportMutation, useReplySupportVoiceMutation,
} from '../../store/adminApi.js';
import { openThread, openUser, closeUser } from '../../store/adminSlice.js';
import { Spinner } from '../../components/admin/ui.jsx';
import {
  VoicePlayer, Ticks, Composer, DayLabel, dayLabel, timeLabel,
} from '../../components/support/ChatParts.jsx';
import { countryName, waLink } from './format.js';
import ClientDrawer from './ClientDrawer.jsx';

const QUICK = [
  'أهلًا بيك 🤍 أقدر أساعدك في إيه؟',
  'تم تفعيل باقتك ✅ تقدر تعمل دعواتك دلوقتي من لوحتك.',
  'ابعتلي صورة الإيصال لو سمحت وهفعّلك على طول.',
  'ابعتلي لينك الدعوة وأنا أظبطهالك.',
  'تمام، اتظبطت 👍 شوفها كده وقولّي رأيك.',
  'كلّمني على واتساب 01035225735 وهنكمل هناك.',
];

const PALETTE = ['#b08d57', '#3f8f6b', '#7a5ea8', '#c0605a', '#3d7fb8', '#a8783d', '#5f8f3f', '#b05a8d'];
function colorFor(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  return (parts[0][0] || '?') + (parts[1] ? parts[1][0] : '');
}

function Avatar({ id, name, online, size = 42 }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="grid h-full w-full place-items-center rounded-full text-[14px] font-extrabold text-white"
        style={{ background: colorFor(id), fontSize: size * 0.34 }}
      >
        {initials(name)}
      </span>
      {online && <span className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full bg-[#22c55e] ring-[2.5px] ring-[#0e1a15]" data-online />}
    </span>
  );
}

/** "دلوقتي" / "من 5 د" / "من 3 س" / "امبارح" / التاريخ */
function ago(date) {
  const d = new Date(date);
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'دلوقتي';
  if (s < 3600) return `${Math.floor(s / 60)} د`;
  if (s < 86400) return `${Math.floor(s / 3600)} س`;
  if (s < 2 * 86400) return 'امبارح';
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}

function lastSeenText(user) {
  if (!user) return '';
  if (user.online) return 'على الموقع دلوقتي';
  if (!user.lastSeenAt) return 'مافيش ظهور مسجّل';
  return `آخر ظهور ${ago(user.lastSeenAt) === 'دلوقتي' ? 'من شوية' : `من ${ago(user.lastSeenAt)}`}`;
}

function Thread({ userId, onBack }) {
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useGetSupportThreadQuery(userId, {
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
    refetchOnMountOrArgChange: true,
  });
  const [reply] = useReplySupportMutation();
  const [replyVoice] = useReplySupportVoiceMutation();
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [inject, setInject] = useState(null);
  const box = useRef(null);
  const msgs = data?.messages || [];
  const user = data?.user;

  useEffect(() => { setPending([]); setError(''); }, [userId]);
  // فتحت المحادثة = رسايله اتقرت → العدد في القايمة الجانبية والقايمة ينقص على طول
  const lastId = useRef('');
  useEffect(() => {
    if (!data) return;
    const last = msgs[msgs.length - 1];
    const id = `${userId}:${last ? last.id : '-'}`;
    if (id !== lastId.current) {
      lastId.current = id;
      dispatch(adminApi.util.invalidateTags(['SupportUnread', 'Support']));
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, pending.length, userId]);

  async function run(item, fn) {
    setError('');
    setPending((p) => [...p, item]);
    try {
      await fn();
      setPending((p) => p.filter((x) => x.key !== item.key));
      return true;
    } catch (err) {
      setPending((p) => p.filter((x) => x.key !== item.key));
      setError(err?.data?.error || 'الرسالة مابعتتش، جرّب تاني.');
      return false;
    }
  }

  function sendText(body) {
    run({ key: `p${Date.now()}`, kind: 'text', body }, () => reply({ userId, body }).unwrap());
    return true;
  }
  function sendVoice({ blob, duration }) {
    const form = new FormData();
    const ext = /mp4/.test(blob.type) ? 'm4a' : /ogg/.test(blob.type) ? 'ogg' : 'webm';
    form.append('duration', String(Math.round(duration * 10) / 10));
    form.append('file', blob, `voice.${ext}`);
    run({ key: `v${Date.now()}`, kind: 'voice' }, () => replyVoice({ userId, form }).unwrap());
  }

  let lastDay = '';
  const wa = user?.phone ? waLink(user.phone, user.country) : null;

  return (
    <div className="flex h-full min-h-0 flex-col" data-admin-thread>
      {/* رأس المحادثة */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line-lite px-4 py-3">
        <button type="button" onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full text-ivory/60 hover:bg-ivory/[0.06] lg:hidden" aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        {user ? <Avatar id={user.id} name={user.name} online={user.online} size={40} /> : <span className="h-10 w-10 rounded-full bg-ivory/10" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate text-[14.5px] font-extrabold text-ivory">
            {user?.name || '...'}
            {user?.packageId && <Crown size={13} className="shrink-0 text-brass" />}
            {user?.isBlocked && <Ban size={13} className="shrink-0 text-error" />}
          </div>
          <div className="flex items-center gap-1.5 truncate text-[11.5px] text-ivory/45" data-thread-status>
            {user?.online && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" />}
            <span className={user?.online ? 'text-[#4ade80]' : ''}>{lastSeenText(user)}</span>
            {user?.country && <span>· {countryName(user.country)}</span>}
            {user?.email && <span className="hidden truncate sm:inline">· {user.email}</span>}
          </div>
        </div>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-full bg-[#25D366]/15 px-3 py-1.5 text-[12px] font-bold text-[#4ade80] transition hover:bg-[#25D366]/25 sm:flex">
            واتساب
          </a>
        )}
        <button
          type="button"
          onClick={() => dispatch(openUser(userId))}
          className="flex items-center gap-1.5 rounded-full border border-line-lite px-3 py-1.5 text-[12px] font-bold text-ivory/70 transition hover:border-brass/50 hover:text-brass-soft"
          data-open-profile
        >
          <UserRound size={13} /> <span className="hidden sm:inline">ملف العميل</span>
        </button>
      </div>

      {/* الرسايل */}
      <div
        ref={box}
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:thin]"
        style={{ backgroundImage: 'radial-gradient(rgba(176,141,87,.06) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      >
        {isLoading && <Spinner />}
        {isError && <p className="py-8 text-center text-[13px] text-error">المحادثة مااتحمّلتش.</p>}
        {msgs.map((m, i) => {
          const day = dayLabel(m.createdAt, 'ar');
          const showDay = day !== lastDay;
          lastDay = day;
          const mine = m.from === 'admin';
          const next = msgs[i + 1];
          const tail = !next || next.from !== m.from;
          return (
            <Fragment key={m.id}>
              {showDay && <DayLabel dark>{day}</DayLabel>}
              <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`} data-msg={m.from}>
                <div
                  className={`max-w-[78%] px-3.5 py-2 text-[13.5px] leading-[1.75] shadow-sm ${
                    mine
                      ? `bg-brass text-[#241608] ${tail ? 'rounded-[18px] rounded-ee-md' : 'rounded-[18px]'}`
                      : `bg-[#1b2a23] text-ivory/90 ${tail ? 'rounded-[18px] rounded-es-md' : 'rounded-[18px]'}`
                  }`}
                >
                  {m.kind === 'voice' && m.voice
                    ? <VoicePlayer id={m.id} url={m.voice.url} duration={m.voice.duration} mine={mine} tone="dark" />
                    : <p className="whitespace-pre-line break-words">{m.body}</p>}
                  <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] tabular-nums ${mine ? 'text-[#241608]/60' : 'text-ivory/35'}`}>
                    {timeLabel(m.createdAt, 'ar')}
                    {mine && <Ticks seen={m.seen} />}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
        {pending.map((p) => (
          <div key={p.key} className="flex justify-end" data-pending>
            <div className="max-w-[78%] rounded-[18px] rounded-ee-md bg-brass/70 px-3.5 py-2 text-[13.5px] leading-[1.75] text-[#241608]">
              {p.kind === 'voice' ? <span className="flex items-center gap-1.5 font-bold"><Mic size={13} /> الفويس بيتبعت…</span> : <p className="whitespace-pre-line">{p.body}</p>}
              <div className="mt-0.5 flex justify-end"><Clock3 size={11} className="animate-pulse opacity-60" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* الرد */}
      <div className="shrink-0 border-t border-line-lite p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" data-quick-replies>
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setInject({ text: q, n: Date.now() })}
              className="shrink-0 rounded-full border border-line-lite bg-ivory/[0.03] px-3 py-1.5 text-[11.5px] font-bold text-ivory/65 transition hover:border-brass/50 hover:text-brass-soft"
            >
              {q.length > 34 ? `${q.slice(0, 32)}…` : q}
            </button>
          ))}
        </div>
        {error && <p className="mb-2 text-[12px] font-bold text-error" data-chat-error>{error}</p>}
        <Composer
          tone="dark"
          inject={inject}
          onSendText={sendText}
          onSendVoice={sendVoice}
          labels={{
            placeholder: 'اكتب ردك…',
            send: 'إرسال',
            record: 'سجّل فويس',
            cancel: 'إلغاء',
            denied: 'المايك مقفول — اسمح بيه من إعدادات المتصفح.',
            nomic: 'مش لاقي مايك على الجهاز ده.',
            unsupported: 'المتصفح ده مابيسجّلش فويس.',
            short: 'الفويس قصير قوي — سجّل تاني.',
          }}
        />
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'waiting', label: 'مستنيين ردك' },
  { key: 'unread', label: 'مش مقروءة' },
];

export default function SupportPage() {
  const dispatch = useDispatch();
  const openThreadId = useSelector((s) => s.admin.openThreadId);
  const openUserId = useSelector((s) => s.admin.openUserId);
  const [filter, setFilter] = useState('all');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { const id = setTimeout(() => setQ(qInput.trim()), 300); return () => clearTimeout(id); }, [qInput]);

  const { data, isLoading, isFetching } = useGetSupportThreadsQuery({ filter, q }, {
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });
  const threads = data?.threads || [];
  const unreadTotal = data?.unreadTotal || 0;
  const waitingTotal = data?.waitingTotal || 0;
  const onlineNow = useMemo(() => threads.filter((t) => t.online).length, [threads]);

  // لما تفتح الصفحة على محادثة مقفولة (اتمسحت/مش في الفلتر) مانسيبهاش معلّقة
  useEffect(() => () => { dispatch(closeUser()); }, [dispatch]);

  const stats = [
    { icon: Clock3, label: 'مستنيين ردك', value: waitingTotal, tone: waitingTotal ? 'text-brass-soft' : 'text-ivory/80', ring: waitingTotal ? 'ring-brass/40' : 'ring-line-lite', on: () => setFilter('waiting') },
    { icon: MailWarning, label: 'رسايل مش مقروءة', value: unreadTotal, tone: unreadTotal ? 'text-[#ff7b72]' : 'text-ivory/80', ring: unreadTotal ? 'ring-error/40' : 'ring-line-lite', on: () => setFilter('unread'), pulse: unreadTotal > 0 },
    { icon: Inbox, label: 'محادثات', value: filter === 'all' && !q ? threads.length : '—', tone: 'text-ivory/80', ring: 'ring-line-lite', on: () => setFilter('all'), sub: onlineNow ? `${onlineNow} على الموقع دلوقتي` : '' },
  ];

  return (
    <div className="space-y-4" data-admin-support>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">الدعم</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            {unreadTotal > 0 ? `${unreadTotal} رسالة جديدة مستنياك` : 'كل الرسايل مقروءة ✓'}
          </p>
        </div>
        {isFetching && !isLoading && <span className="text-[11px] text-ivory/30">بيتحدّث…</span>}
      </div>

      {/* على الموبايل والمحادثة مفتوحة: الكروت بتستخبى عشان المحادثة تاخد الشاشة */}
      <div className={`grid-cols-3 gap-2.5 ${openThreadId ? 'hidden lg:grid' : 'grid'}`}>
        {stats.map(({ icon: Icon, label, value, tone, ring, on, pulse, sub }) => (
          <button key={label} type="button" onClick={on} className={`relative rounded-2xl bg-[#101c17] p-3 text-start ring-1 transition hover:bg-[#13221b] sm:p-4 ${ring}`}>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-ivory/45 sm:text-[12px]">
              <Icon size={13} /> {label}
              {pulse && <span className="h-2 w-2 animate-pulse rounded-full bg-error" />}
            </span>
            <span className={`mt-1 block font-serif text-[24px] font-bold leading-none sm:text-[28px] ${tone}`} data-stat={label}>{value}</span>
            {sub && <span className="mt-1 block truncate text-[10.5px] text-[#4ade80]">{sub}</span>}
          </button>
        ))}
      </div>

      <div className={`grid ${openThreadId ? 'h-[calc(100dvh-170px)] lg:h-[calc(100dvh-250px)]' : 'h-[calc(100dvh-250px)]'} min-h-[460px] grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[22px] border border-line-lite bg-[#0e1a15] lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]`}>
        {/* القايمة */}
        <div className={`min-h-0 min-w-0 flex-col border-line-lite lg:flex lg:border-e ${openThreadId ? 'hidden' : 'flex'}`}>
          <div className="space-y-2.5 border-b border-line-lite p-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ivory/35" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="دوّر باسم، إيميل، أو موبايل"
                className="w-full rounded-full border border-line-lite bg-night/60 py-2.5 pe-9 ps-9 text-[13px] text-ivory placeholder:text-ivory/30 focus:border-brass/60 focus:outline-none"
                data-support-search
              />
              {qInput && (
                <button type="button" onClick={() => setQInput('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-ivory" aria-label="امسح">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-1.5">
              {FILTERS.map((f) => {
                const n = f.key === 'waiting' ? waitingTotal : f.key === 'unread' ? unreadTotal : 0;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    data-filter={f.key}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                      filter === f.key ? 'bg-brass text-[#241608]' : 'bg-ivory/[0.05] text-ivory/60 hover:text-ivory'
                    }`}
                  >
                    {f.label}
                    {n > 0 && (
                      <span className={`min-w-[18px] rounded-full px-1 text-center text-[10px] leading-[18px] ${filter === f.key ? 'bg-[#241608]/15' : f.key === 'unread' ? 'bg-error text-white' : 'bg-brass/25 text-brass-soft'}`}>
                        {n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]" data-thread-list>
            {isLoading ? <Spinner /> : threads.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center text-ivory/35">
                <MessageSquare size={26} />
                <p className="text-[13px]">
                  {q ? 'مافيش نتايج.' : filter === 'unread' ? 'مافيش رسايل جديدة — كله متقري 👌' : filter === 'waiting' ? 'مافيش حد مستني رد 👌' : 'مفيش محادثات لسه.'}
                </p>
              </div>
            ) : threads.map((t) => {
              const active = openThreadId === t.userId;
              const hot = t.unread > 0;
              return (
                <button
                  key={t.userId}
                  type="button"
                  onClick={() => dispatch(openThread(t.userId))}
                  data-thread={t.userId}
                  data-unread={t.unread}
                  className={`relative flex w-full items-center gap-3 border-b border-line-lite/60 px-3.5 py-3 text-start transition ${
                    active ? 'bg-brass/[0.1]' : hot ? 'bg-error/[0.04] hover:bg-ivory/[0.04]' : 'hover:bg-ivory/[0.03]'
                  }`}
                >
                  {(active || hot) && <span className={`absolute inset-y-2 start-0 w-[3px] rounded-e-full ${active ? 'bg-brass' : 'bg-error'}`} />}
                  <Avatar id={t.userId} name={t.name} online={t.online} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`flex min-w-0 items-center gap-1.5 truncate text-[13.5px] ${hot ? 'font-extrabold text-ivory' : 'font-bold text-ivory/85'}`}>
                        <span className="truncate">{t.name}</span>
                        {t.isPremium && <Crown size={11} className="shrink-0 text-brass" />}
                        {t.isBlocked && <Ban size={11} className="shrink-0 text-error" />}
                      </span>
                      <span className={`shrink-0 text-[10.5px] ${hot ? 'font-bold text-[#ff7b72]' : 'text-ivory/35'}`}>{ago(t.lastAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={`flex min-w-0 items-center gap-1 truncate text-[12px] ${hot ? 'text-ivory/75' : 'text-ivory/40'}`}>
                        {t.lastFrom === 'admin' && <span className="shrink-0"><Ticks seen={t.lastSeen} dark /></span>}
                        {t.lastFrom === 'admin' && <span className="shrink-0">أنت:</span>}
                        {t.lastKind === 'voice' && <Mic size={12} className="shrink-0 text-brass" />}
                        <span className="truncate">{t.lastKind === 'voice' ? 'رسالة صوتية' : t.lastMessage}</span>
                      </span>
                      {hot && (
                        <span className="grid h-5 min-w-[20px] shrink-0 place-items-center rounded-full bg-error px-1.5 text-[10.5px] font-extrabold text-white shadow-[0_0_0_3px_rgba(229,72,77,.15)]" data-thread-unread>
                          {t.unread > 99 ? '99+' : t.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* المحادثة */}
        <div className={`min-h-0 min-w-0 ${openThreadId ? 'block' : 'hidden lg:block'}`}>
          {openThreadId ? (
            <Thread key={openThreadId} userId={openThreadId} onBack={() => dispatch(openThread(null))} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-ivory/30">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-ivory/[0.04]"><MessageSquare size={26} /></span>
              <p className="text-[13px]">اختار محادثة من الجنب.</p>
              {waitingTotal > 0 && (
                <button type="button" onClick={() => setFilter('waiting')} className="rounded-full bg-brass/15 px-4 py-2 text-[12.5px] font-bold text-brass-soft">
                  {waitingTotal} مستنيين ردك
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
    </div>
  );
}
