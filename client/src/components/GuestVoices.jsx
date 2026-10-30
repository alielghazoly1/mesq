// التهاني الصوتية من الضيوف — بتتفتح من كارت الدعوة في لوحة العميل.
//
// الضيوف بيسجّلوا تهنئة بصوتهم من جوه الدعوة (زرار المايك — قالب Velvet
// Voice). هنا صاحب الدعوة بيسمعهم واحدة واحدة باسم صاحبها، ينزّل أي تهنئة
// أو الكل مرة واحدة، ويمسح اللي مش عايزه. اللي لسه ماسمعهاش عليها "جديدة".
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { X, Mic, Play, Pause, Download, Trash2, Loader2, EyeOff } from 'lucide-react';
import {
  useLazyGetGuestVoicesQuery, useDeleteGuestVoiceMutation, useMarkVoiceHeardMutation,
} from '../store/api.js';

const fmt = (s) => {
  const n = Math.max(0, Math.round(Number(s) || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
};

function countLabel(n, lang, t) {
  if (n === 1) return t('dash.voicesCountOne');
  if (lang === 'ar' && n === 2) return 'تهنئتين';
  return t('dash.voicesCount', { count: n });
}

export default function GuestVoices({ shortId, title, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const [fetchPage, { isFetching }] = useLazyGetGuestVoicesQuery();
  const [deleteVoice] = useDeleteGuestVoiceMutation();
  const [markHeard] = useMarkVoiceHeardMutation();

  const [voices, setVoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [unheard, setUnheard] = useState(0);
  // هتحضر ولا لأ (الدعوات اللي بتسأل مع التهنئة)
  const [att, setAtt] = useState({ yes: 0, no: 0 });
  const [cursor, setCursor] = useState(null);
  const [meta, setMeta] = useState({ loaded: false, enabled: true });
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  // التشغيل: تهنئة واحدة بس في نفس الوقت
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState({ id: null, on: false, t: 0, d: 0, loading: false });

  const load = useCallback(async (before) => {
    setError('');
    try {
      const r = await fetchPage({ shortId, before }).unwrap();
      setVoices((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        return before ? prev.concat(r.voices.filter((v) => !seen.has(v.id))) : r.voices;
      });
      setTotal(r.total);
      setUnheard(r.unheard);
      if (r.attending) setAtt(r.attending);
      setCursor(r.nextCursor);
      setMeta({ loaded: true, enabled: r.enabled });
    } catch {
      setError(t('dash.statsError'));
      setMeta((m) => ({ ...m, loaded: true }));
    }
  }, [fetchPage, shortId, t]);

  useEffect(() => { load(null); }, [load]);

  useEffect(() => {
    const a = new Audio();
    a.preload = 'none';
    audioRef.current = a;
    const sync = () => setPlaying((p) => ({ ...p, t: a.currentTime || 0, d: Number.isFinite(a.duration) ? a.duration : p.d }));
    a.addEventListener('timeupdate', sync);
    a.addEventListener('loadedmetadata', sync);
    a.addEventListener('playing', () => setPlaying((p) => ({ ...p, on: true, loading: false })));
    a.addEventListener('pause', () => setPlaying((p) => ({ ...p, on: false })));
    a.addEventListener('ended', () => setPlaying((p) => ({ ...p, on: false, t: 0 })));
    a.addEventListener('error', () => {
      setPlaying((p) => ({ ...p, on: false, loading: false }));
      if (a.getAttribute('src')) setError(t('dash.voicesPlayError'));
    });
    return () => { a.pause(); a.removeAttribute('src'); a.load(); };
  }, [t]);

  // Escape بيقفل، والصفحة ورا مبتتزحلقش
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  function toggle(v) {
    const a = audioRef.current;
    if (!a) return;
    setError('');
    if (playing.id === v.id) {
      if (a.paused) a.play().catch(() => setError(t('dash.voicesPlayError')));
      else a.pause();
      return;
    }
    a.pause();
    a.src = v.url;
    setPlaying({ id: v.id, on: false, t: 0, d: v.duration || 0, loading: true });
    a.play().catch(() => { setPlaying((p) => ({ ...p, loading: false })); });
    if (!v.heard) {
      setVoices((list) => list.map((x) => (x.id === v.id ? { ...x, heard: true } : x)));
      setUnheard((n) => Math.max(0, n - 1));
      markHeard({ shortId, id: v.id }).catch(() => {});
    }
  }

  function seek(v, e) {
    const a = audioRef.current;
    if (!a || playing.id !== v.id) return;
    const r = e.currentTarget.getBoundingClientRect();
    const d = Number.isFinite(a.duration) ? a.duration : (v.duration || 0);
    if (!d) return;
    let k = (e.clientX - r.left) / r.width;
    if (getComputedStyle(e.currentTarget).direction === 'rtl') k = 1 - k;
    a.currentTime = Math.max(0, Math.min(d, k * d));
  }

  async function remove(v) {
    if (!window.confirm(t('dash.voicesDeleteAsk'))) return;
    setBusyId(v.id);
    try {
      await deleteVoice({ shortId, id: v.id }).unwrap();
      if (playing.id === v.id) { audioRef.current?.pause(); setPlaying({ id: null, on: false, t: 0, d: 0, loading: false }); }
      setVoices((prev) => prev.filter((x) => x.id !== v.id));
      setTotal((n) => Math.max(0, n - 1));
      if (!v.heard) setUnheard((n) => Math.max(0, n - 1));
      if (v.attending) setAtt((a) => ({ ...a, [v.attending]: Math.max(0, a[v.attending] - 1) }));
    } catch { setError(t('dash.statsError')); }
    setBusyId(null);
  }

  const when = (d) => {
    try {
      return new Date(d).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
      });
    } catch { return ''; }
  };

  const btn = 'inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 text-[12.5px] font-bold transition disabled:opacity-60';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-end justify-center bg-night/70 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('dash.voicesTitle')}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[26px] bg-card shadow-2xl sm:rounded-[26px]"
      >
        {/* العنوان */}
        <div className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7a2a37]/12 text-[#7a2a37]">
            <Mic size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[18px] font-bold text-ink">{t('dash.voicesTitle')}</div>
            <div className="truncate text-[12.5px] text-ink-dim">
              {title}{meta.loaded ? ` · ${countLabel(total, lang, t)}` : ''}
              {meta.loaded && unheard > 0 && (
                <span className="ms-1.5 rounded-full bg-[#7a2a37] px-1.5 text-[10.5px] font-bold leading-[17px] text-white">
                  {t('dash.voicesNew', { count: unheard })}
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('auth.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {(total > 0 || (meta.loaded && !meta.enabled) || error) && (
          <div className="shrink-0 border-b border-line px-5 py-3.5">
            {att.yes + att.no > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] font-bold" data-voices-att>
                <span className="rounded-full bg-[#1f7a4d]/12 px-3 py-1 text-[#1f7a4d]">✓ {att.yes} {t('dash.voicesAttYes')}</span>
                <span className="rounded-full bg-[#9a3b3b]/10 px-3 py-1 text-[#9a3b3b]">{att.no} {t('dash.voicesAttNo')}</span>
              </div>
            )}
            {total > 0 && (
              <a href={`/api/dashboard/invitations/${encodeURIComponent(shortId)}/voices/zip`} target="_blank" rel="noopener noreferrer"
                className={`${btn} bg-night text-ivory hover:bg-emerald`}>
                <Download size={14} /> {t('dash.voicesZip')}
              </a>
            )}
            {meta.loaded && !meta.enabled && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-ink/[0.05] px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-dim">
                <EyeOff size={14} className="mt-0.5 shrink-0" /> {t('dash.voicesHidden')}
              </p>
            )}
            {error && <p className="mt-2 text-[12.5px] font-bold text-error">{error}</p>}
          </div>
        )}

        {/* التهاني */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {!meta.loaded && (
            <div className="flex justify-center py-16 text-ink-dim"><Loader2 className="animate-spin" /></div>
          )}
          {meta.loaded && voices.length === 0 && (
            <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-line px-6 py-12 text-center text-[13.5px] leading-relaxed text-ink-dim">
              <Mic size={26} className="mx-auto mb-3 text-[#7a2a37]/70" />
              {t('dash.voicesEmpty')}
            </div>
          )}
          <ul className="space-y-2.5">
            {voices.map((v) => {
              const active = playing.id === v.id;
              const d = active && playing.d ? playing.d : (v.duration || 0);
              const pct = active && d ? Math.min(100, (playing.t / d) * 100) : 0;
              const name = v.guestName || t('dash.voicesGuest');
              return (
                <li key={v.id} className={`rounded-2xl border px-3 py-3 transition sm:px-4 ${active ? 'border-[#7a2a37]/40 bg-[#7a2a37]/[0.05]' : 'border-line bg-card'}`}>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => toggle(v)}
                      aria-label={active && playing.on ? t('dash.voicesPause') : t('dash.voicesPlay')}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#8a3240] to-[#531823] text-[#fbefe6] shadow-[0_6px_14px_-6px_rgba(83,24,35,.7)] hover:brightness-110">
                      {active && playing.loading ? <Loader2 size={17} className="animate-spin" />
                        : active && playing.on ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="translate-x-[1px] rtl:-translate-x-[1px]" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-ink">{name}</span>
                        {v.attending && (
                          <span data-att={v.attending} className={`shrink-0 rounded-full px-2 text-[10.5px] font-bold leading-[18px] ${v.attending === 'yes' ? 'bg-[#1f7a4d]/12 text-[#1f7a4d]' : 'bg-[#9a3b3b]/10 text-[#9a3b3b]'}`}>
                            {v.attending === 'yes' ? `✓ ${t('dash.voicesAttYes')}` : t('dash.voicesAttNo')}
                          </span>
                        )}
                        {!v.heard && (
                          <span className="shrink-0 rounded-full bg-[#7a2a37] px-1.5 text-[10px] font-bold leading-[16px] text-white">{t('dash.voicesNewBadge')}</span>
                        )}
                        <span className="ms-auto shrink-0 text-[11.5px] text-ink-dim">{when(v.createdAt)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <div
                          role="slider" tabIndex={-1} aria-valuemin={0} aria-valuemax={Math.round(d)} aria-valuenow={Math.round(active ? playing.t : 0)}
                          onClick={(e) => seek(v, e)}
                          className={`relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10 ${active ? 'cursor-pointer' : ''}`}
                        >
                          <span className="absolute inset-y-0 start-0 rounded-full bg-[#7a2a37] transition-[width] duration-150" style={{ width: `${pct}%` }} />
                        </div>
                        <span dir="ltr" className="w-[66px] shrink-0 text-end text-[11.5px] tabular-nums text-ink-dim">
                          {active ? `${fmt(playing.t)} / ${fmt(d)}` : fmt(d)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex justify-end gap-1.5">
                    <a href={v.download} className={`${btn} border border-line px-3 py-1.5 text-ink hover:bg-ink/5`}>
                      <Download size={13} /> {t('dash.voicesDownload')}
                    </a>
                    <button type="button" onClick={() => remove(v)} disabled={busyId === v.id}
                      className={`${btn} px-3 py-1.5 text-error hover:bg-error/10`}>
                      {busyId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} {t('dash.voicesDelete')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {cursor && (
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={() => load(cursor)} disabled={isFetching}
                className={`${btn} border border-line text-ink hover:bg-ink/5`}>
                {isFetching ? <Loader2 size={14} className="animate-spin" /> : null}
                {t('dash.voicesMore')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
