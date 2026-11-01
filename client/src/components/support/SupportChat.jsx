// المحادثة مع الدعم (عند العميل) — في النافذة العايمة وفي لوحة العميل.
//
// وهي مفتوحة بتسأل السيرفر كل 6 ثواني (أي رد منك بيظهر لوحده)، وكل فتحة
// بتعلّم رسايلك مقروءة → عندك في اللوحة بتتحول ✓✓ زرقا، وعنده العدد بيصفّر.
// الرسالة بتظهر على طول وهي بتتبعت (بعلامة ساعة) وبعدين ✓.
import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Clock, RotateCcw } from 'lucide-react';
import {
  api, useGetSupportQuery, useSendSupportMessageMutation, useSendSupportVoiceMutation,
} from '../../store/api.js';
import { markAllRead } from '../../store/supportSlice.js';
import {
  VoicePlayer, Ticks, Composer, DayLabel, dayLabel, timeLabel,
} from './ChatParts.jsx';
import { whatsappLink, WHATSAPP_MESSAGES } from '../../lib/contact.js';

function WhatsAppGlyph({ size = 18 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.8c-1.98 0-3.92-.53-5.61-1.54l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.76 10.76 0 0 1 5.23 16c0-5.96 4.85-10.8 10.81-10.8 5.95 0 10.78 4.84 10.78 10.8 0 5.95-4.83 10.8-10.78 10.8Zm5.92-8.09c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.85-1.6-1.91-1.8-2.23-.18-.32-.02-.5.15-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.32-1.12 1.1-1.12 2.68 0 1.58 1.15 3.1 1.31 3.32.16.21 2.26 3.45 5.47 4.84.77.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/** الرد التلقائي التاني: رقم الواتساب + زرار يفتحه على طول */
function WhatsAppButton({ t }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGES.support)}
      target="_blank"
      rel="noopener noreferrer"
      data-support-whatsapp
      className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_8px_18px_-10px_rgba(37,211,102,.9)] transition hover:brightness-105 active:scale-[.98]"
    >
      <WhatsAppGlyph /> {t('support.whatsappCta')}
    </a>
  );
}

export function SupportAvatar({ size = 28, online }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <img src="/img/logo.png" alt="" className="h-full w-full rounded-full bg-night object-contain p-[3px] ring-1 ring-brass/30" />
      {online != null && (
        <span className={`absolute -bottom-0.5 -end-0.5 h-[30%] w-[30%] min-h-[8px] min-w-[8px] rounded-full ring-2 ring-card ${online ? 'bg-[#22c55e]' : 'bg-ink-dim/50'}`} />
      )}
    </span>
  );
}

export default function SupportChat({ className = '', autoFocus = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const dispatch = useDispatch();
  const { data, isLoading, isError, refetch } = useGetSupportQuery(undefined, {
    pollingInterval: 6000,
    skipPollingIfUnfocused: true,
    refetchOnMountOrArgChange: true,
  });
  const [sendText] = useSendSupportMessageMutation();
  const [sendVoice] = useSendSupportVoiceMutation();
  const [pending, setPending] = useState([]); // رسايل بتتبعت دلوقتي
  const [error, setError] = useState('');
  const box = useRef(null);
  const count = (data?.messages?.length || 0) + pending.length;

  // كل مرة المحادثة تتجاب، رسايلك اتعلّمت مقروءة على السيرفر — العدد يصفّر
  // على طول. واللوحة بتتحدّث بس لما توصل رسالة جديدة (مش مع كل سؤال كل 6 ثواني)
  const lastId = useRef('');
  useEffect(() => {
    if (!data) return;
    dispatch(markAllRead());
    const last = data.messages?.[data.messages.length - 1];
    const id = last ? last.id : '-';
    if (id !== lastId.current) {
      lastId.current = id;
      dispatch(api.util.invalidateTags(['SupportStatus', 'Dashboard']));
    }
  }, [data, dispatch]);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  const labels = {
    placeholder: t('support.placeholder'),
    send: t('support.send'),
    record: t('support.record'),
    cancel: t('support.cancelRec'),
    denied: t('support.micDenied'),
    nomic: t('support.micMissing'),
    unsupported: t('support.micUnsupported'),
    short: t('support.recShort'),
  };

  async function run(item, fn) {
    setError('');
    setPending((p) => [...p, item]);
    try {
      await fn();
      setPending((p) => p.filter((x) => x.key !== item.key));
      return true;
    } catch (err) {
      setPending((p) => p.map((x) => (x.key === item.key ? { ...x, failed: true } : x)));
      setError(err?.data?.error || t('support.sendFailed'));
      return false;
    }
  }

  function onSendText(body) {
    const item = { key: `p${Date.now()}`, kind: 'text', body, retry: () => onSendText(body) };
    run(item, () => sendText({ body }).unwrap());
    return true;
  }

  function onSendVoice({ blob, duration }) {
    const form = new FormData();
    const ext = /mp4/.test(blob.type) ? 'm4a' : /ogg/.test(blob.type) ? 'ogg' : 'webm';
    form.append('duration', String(Math.round(duration * 10) / 10));
    form.append('file', blob, `voice.${ext}`);
    const item = { key: `v${Date.now()}`, kind: 'voice', duration, retry: () => onSendVoice({ blob, duration }) };
    run(item, () => sendVoice(form).unwrap());
  }

  const msgs = data?.messages || [];
  let lastDay = '';

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`} data-support-chat>
      <div ref={box} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3.5 py-3 [scrollbar-width:thin]">
        {isLoading && (
          <div className="space-y-2 py-2">
            {[60, 40, 70].map((w, i) => (
              <div key={i} className={`h-10 animate-pulse rounded-2xl bg-ink/[0.06] ${i % 2 ? 'ms-auto' : ''}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        )}
        {isError && !data && (
          <button type="button" onClick={refetch} className="mx-auto flex items-center gap-1.5 py-6 text-[12.5px] font-bold text-ink-dim">
            <RotateCcw size={13} /> {t('support.retry')}
          </button>
        )}
        {data && msgs.length === 0 && pending.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <SupportAvatar size={44} online={data.adminOnline} />
            <p className="text-[13px] font-bold text-ink">{t('support.emptyTitle')}</p>
            <p className="text-[12px] leading-relaxed text-ink-dim">{t('support.empty')}</p>
          </div>
        )}
        {msgs.map((m, i) => {
          const day = dayLabel(m.createdAt, lang);
          const showDay = day !== lastDay;
          lastDay = day;
          const mine = m.from === 'user';
          const next = msgs[i + 1];
          const tail = !next || next.from !== m.from;
          return (
            <Fragment key={m.id}>
              {showDay && <DayLabel>{day}</DayLabel>}
              <div className={`flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`} data-msg={m.from}>
                {!mine && (tail ? <SupportAvatar size={24} /> : <span className="w-6 shrink-0" />)}
                <div
                  className={`max-w-[82%] px-3.5 py-2 text-[13.5px] leading-[1.75] shadow-sm ${
                    mine
                      ? `bg-night text-ivory ${tail ? 'rounded-[18px] rounded-ee-md' : 'rounded-[18px]'}`
                      : `border border-line bg-white text-ink ${tail ? 'rounded-[18px] rounded-es-md' : 'rounded-[18px]'}`
                  }`}
                >
                  {m.kind === 'voice' && m.voice
                    ? <VoicePlayer id={m.id} url={m.voice.url} duration={m.voice.duration} mine={mine} />
                    : <p className="whitespace-pre-line break-words">{m.body}</p>}
                  {m.auto === 'whatsapp' && <WhatsAppButton t={t} />}
                  <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] tabular-nums ${mine ? 'text-ivory/55' : 'text-ink-dim/80'}`}>
                    {timeLabel(m.createdAt, lang)}
                    {mine && <Ticks seen={m.seen} dark />}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
        {pending.map((p) => (
          <div key={p.key} className="flex justify-end" data-pending>
            <div className={`max-w-[82%] rounded-[18px] rounded-ee-md px-3.5 py-2 text-[13.5px] leading-[1.75] shadow-sm ${p.failed ? 'bg-rose/90 text-white' : 'bg-night/80 text-ivory'}`}>
              {p.kind === 'voice'
                ? <span className="flex items-center gap-2 text-[12.5px] font-bold">🎤 {t('support.voiceSending')}</span>
                : <p className="whitespace-pre-line break-words">{p.body}</p>}
              <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-ivory/70">
                {p.failed
                  ? (
                    <button
                      type="button"
                      onClick={() => { setPending((x) => x.filter((y) => y.key !== p.key)); p.retry(); }}
                      className="flex items-center gap-1 font-bold underline"
                    >
                      <RotateCcw size={11} /> {t('support.retry')}
                    </button>
                  )
                  : <Clock size={11} className="animate-pulse" />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line bg-ivory/60 p-2.5">
        {error && <p className="mb-2 px-1 text-[12px] font-bold text-rose" data-chat-error>{error}</p>}
        <Composer
          onSendText={onSendText}
          onSendVoice={onSendVoice}
          labels={labels}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}
