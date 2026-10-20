// أجزاء المحادثة المشتركة بين نافذة الدعم عند العميل وصفحة الدعم في اللوحة:
//   VoicePlayer  مشغّل فويس بموجة (زي الواتساب) + سرعة 1x/1.5x/2x
//   Ticks        ✓ اتبعتت · ✓✓ اتشافت (أزرق)
//   Composer     كتابة + تسجيل فويس (بموجة حية وعدّاد وإلغاء)
//   DayLabel     فاصل "النهارده / امبارح / التاريخ" بين الرسايل
//
// tone: 'light' (الموقع — خلفية فاتحة) أو 'dark' (اللوحة).
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, Pause, Mic, Send, Trash2, Loader2, Check, CheckCheck,
} from 'lucide-react';
import useVoiceRecorder, { canRecordVoice, fmtSeconds } from '../../hooks/useVoiceRecorder.js';

// فويس واحد بس شغال في نفس الوقت
let playing = null;

/** موجة ثابتة لكل فويس (من الـ id) — شكلها بيفضل هو هو كل مرة */
function bars(seed, n = 30) {
  let h = 2166136261;
  const s = String(seed || 'v');
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const out = [];
  for (let i = 0; i < n; i += 1) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    const r = ((h >>> 0) % 1000) / 1000;
    // شكل كلام طبيعي: أعلى في النص وأوطى على الأطراف
    const env = 0.55 + 0.45 * Math.sin((Math.PI * (i + 0.5)) / n);
    out.push(Math.max(0.16, Math.min(1, (0.25 + r * 0.75) * env)));
  }
  return out;
}

export function VoicePlayer({ id, url, duration, mine, tone = 'light' }) {
  const audio = useRef(null);
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(Number(duration) || 0);
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(false);
  const shape = useMemo(() => bars(id), [id]);

  useEffect(() => () => {
    if (audio.current) audio.current.pause();
    if (playing === audio.current) playing = null;
  }, []);

  function el() {
    if (!audio.current) {
      const a = new Audio();
      a.preload = 'metadata';
      a.src = url;
      a.addEventListener('timeupdate', () => setT(a.currentTime));
      a.addEventListener('loadedmetadata', () => { if (Number.isFinite(a.duration) && a.duration > 0) setDur(a.duration); });
      a.addEventListener('playing', () => { setLoading(false); setOn(true); });
      a.addEventListener('waiting', () => setLoading(true));
      a.addEventListener('pause', () => setOn(false));
      a.addEventListener('ended', () => { setOn(false); setT(0); });
      a.addEventListener('error', () => { setLoading(false); setOn(false); });
      audio.current = a;
    }
    return audio.current;
  }

  function toggle() {
    const a = el();
    if (on) { a.pause(); return; }
    if (playing && playing !== a) playing.pause();
    playing = a;
    a.playbackRate = rate;
    setLoading(true);
    a.play().catch(() => setLoading(false));
  }

  function seek(e) {
    if (!dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    let p = (e.clientX - r.left) / r.width;
    if (rtl) p = 1 - p;
    const a = el();
    a.currentTime = Math.max(0, Math.min(dur, p * dur));
    setT(a.currentTime);
  }

  function cycleRate() {
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(next);
    if (audio.current) audio.current.playbackRate = next;
  }

  const p = dur ? Math.min(1, t / dur) : 0;
  const dark = tone === 'dark';
  const btn = mine
    ? (dark ? 'bg-[#241608] text-brass-soft' : 'bg-white text-night')
    : (dark ? 'bg-brass text-[#241608]' : 'bg-night text-ivory');
  const barOn = mine ? (dark ? 'bg-[#241608]' : 'bg-white') : (dark ? 'bg-brass' : 'bg-night');
  const barOff = mine ? (dark ? 'bg-[#241608]/30' : 'bg-white/40') : (dark ? 'bg-ivory/25' : 'bg-night/20');

  return (
    <div className="flex w-[230px] max-w-full items-center gap-2.5" data-voice-player dir="ltr">
      <button
        type="button"
        onClick={toggle}
        aria-label={on ? 'pause' : 'play'}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full shadow-sm transition active:scale-90 ${btn}`}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : on ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="translate-x-[1px]" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-7 cursor-pointer items-center gap-[2px]" onClick={seek} role="slider" aria-valuenow={Math.round(p * 100)} tabIndex={-1}>
          {shape.map((h, i) => (
            <span
              key={i}
              className={`w-[3px] flex-1 rounded-full transition-colors ${i / shape.length < p ? barOn : barOff}`}
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          ))}
        </div>
        <div className={`mt-0.5 flex items-center justify-between text-[10.5px] font-bold tabular-nums ${mine ? (dark ? 'text-[#241608]/70' : 'text-white/80') : (dark ? 'text-ivory/50' : 'text-ink-dim')}`}>
          <span>{fmtSeconds(on || t ? t : dur)}</span>
          <button type="button" onClick={cycleRate} className="rounded-full px-1.5 leading-4 ring-1 ring-current/30 hover:ring-current">
            {rate}x
          </button>
        </div>
      </div>
    </div>
  );
}

export function Ticks({ seen, dark }) {
  return seen
    ? <CheckCheck size={14} className={dark ? 'text-sky-300' : 'text-sky-500'} aria-label="seen" data-seen="1" />
    : <Check size={14} className="opacity-60" aria-label="sent" data-seen="0" />;
}

/** "النهارده" / "امبارح" / 12 أكتوبر */
export function dayLabel(date, lang = 'ar') {
  const d = new Date(date);
  const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return lang === 'en' ? 'Today' : 'النهارده';
  if (same(d, y)) return lang === 'en' ? 'Yesterday' : 'امبارح';
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'long', ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) });
}

export function timeLabel(date, lang = 'ar') {
  return new Date(date).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'ar-EG', { hour: 'numeric', minute: '2-digit' });
}

export function DayLabel({ children, dark }) {
  return (
    <div className="my-2 flex justify-center">
      <span className={`rounded-full px-3 py-1 text-[10.5px] font-bold ${dark ? 'bg-ivory/[0.06] text-ivory/45' : 'bg-ink/[0.05] text-ink-dim'}`}>
        {children}
      </span>
    </div>
  );
}

/**
 * مربع الكتابة + الفويس.
 * labels: { placeholder, send, record, cancel, recording, denied, nomic, unsupported, short, release }
 */
export function Composer({
  onSendText, onSendVoice, sending, labels, tone = 'light', maxSeconds = 120, autoFocus, disabled,
  textRef: externalRef, inject,
}) {
  const [text, setText] = useState('');
  const innerRef = useRef(null);
  const ta = externalRef || innerRef;
  const rec = useVoiceRecorder({
    maxSeconds,
    onDone: ({ blob, duration }) => onSendVoice && onSendVoice({ blob, duration }),
  });
  const dark = tone === 'dark';
  const voiceOk = canRecordVoice() && !!onSendVoice;

  // ردود جاهزة من بره (اللوحة): بتتحط في المربع للتعديل قبل الإرسال
  useEffect(() => {
    if (!inject || !inject.text) return;
    setText(inject.text);
    requestAnimationFrame(() => { const el = ta.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
  }, [inject]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text, ta]);

  useEffect(() => {
    if (!rec.error) return undefined;
    const id = setTimeout(rec.clearError, 4200);
    return () => clearTimeout(id);
  }, [rec.error]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    if (e) e.preventDefault();
    const v = text.trim();
    if (!v || sending || disabled) return;
    const ok = await onSendText(v);
    if (ok !== false) setText('');
  }

  const recording = rec.state === 'recording' || rec.state === 'asking';
  const wrap = dark
    ? 'border-line-lite bg-night/60'
    : 'border-line bg-white';

  return (
    <div className="shrink-0" data-composer>
      {rec.error && (
        <p className={`mb-2 rounded-xl px-3 py-2 text-[12px] font-bold ${dark ? 'bg-error/15 text-error' : 'bg-rose/10 text-rose'}`} data-rec-error>
          {labels[rec.error] || labels.nomic}
        </p>
      )}
      {recording ? (
        <div className={`flex items-center gap-2 rounded-[22px] border p-1.5 ${wrap}`} data-recording>
          <button
            type="button"
            onClick={rec.cancel}
            aria-label={labels.cancel}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${dark ? 'text-ivory/50 hover:bg-error/15 hover:text-error' : 'text-ink-dim hover:bg-rose/10 hover:text-rose'}`}
          >
            <Trash2 size={17} />
          </button>
          <span className="flex items-center gap-1.5 ps-1">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#e5484d]" />
            <span className={`text-[13px] font-extrabold tabular-nums ${dark ? 'text-ivory' : 'text-ink'}`}>{fmtSeconds(rec.seconds)}</span>
          </span>
          <div className="flex h-8 min-w-0 flex-1 items-center justify-center gap-[2px] overflow-hidden px-1" dir="ltr">
            {rec.levels.map((v, i) => (
              <span key={i} className={`w-[3px] rounded-full ${dark ? 'bg-brass' : 'bg-night'}`} style={{ height: `${Math.round(v * 100)}%`, opacity: 0.35 + v * 0.65 }} />
            ))}
          </div>
          <button
            type="button"
            onClick={rec.stop}
            disabled={rec.state === 'asking'}
            aria-label={labels.send}
            data-rec-send
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-sm transition active:scale-90 ${dark ? 'bg-brass text-[#241608]' : 'bg-night text-ivory'}`}
          >
            {rec.state === 'asking' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="rtl:-scale-x-100" />}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className={`flex items-end gap-1.5 rounded-[22px] border p-1.5 transition focus-within:shadow-[0_0_0_3px_rgba(176,141,87,.15)] ${wrap}`}>
          <textarea
            ref={ta}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
            }}
            rows={1}
            maxLength={2000}
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={labels.placeholder}
            data-composer-input
            className={`max-h-[132px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-base leading-[1.55] focus:outline-none sm:text-[14px] ${dark ? 'text-ivory placeholder:text-ivory/30' : 'text-ink placeholder:text-ink-dim/70'}`}
          />
          {text.trim() || !voiceOk ? (
            <button
              type="submit"
              disabled={!text.trim() || sending || disabled}
              aria-label={labels.send}
              data-send
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-sm transition active:scale-90 disabled:opacity-40 ${dark ? 'bg-brass text-[#241608]' : 'bg-night text-ivory'}`}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="rtl:-scale-x-100" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={rec.start}
              disabled={sending || disabled}
              aria-label={labels.record}
              title={labels.record}
              data-record
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-sm transition active:scale-90 disabled:opacity-40 ${dark ? 'bg-brass text-[#241608]' : 'bg-night text-ivory'}`}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Mic size={17} />}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

