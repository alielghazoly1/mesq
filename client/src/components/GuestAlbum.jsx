// ألبوم صور الضيوف — بيتفتح من كارت الدعوة في لوحة العميل.
//
// الضيوف بيرفعوا صورهم من جوه الدعوة نفسها (قسم "شاركونا اللحظات" في
// القوالب اللي بتدعمه). هنا صاحب الدعوة بيشوفهم كلهم، ينزّل أي صورة
// بجودتها الأصلية، يمسح اللي مش عايزه، ويبعت لينك صفحة الألبوم لأي حد.
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import {
  X, Images, Link2, Check, Download, Trash2, ExternalLink, Loader2, ChevronLeft, ChevronRight, EyeOff,
} from 'lucide-react';
import {
  useLazyGetGuestPhotosQuery, useDeleteGuestPhotoMutation, useGetAlbumLinkMutation,
} from '../store/api.js';

/** أيقونة واتساب (مش موجودة في lucide) */
function WhatsAppIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49 1.89.81 2.62.88 3.56.74.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

function countLabel(n, lang, t) {
  if (lang !== 'ar') return n === 1 ? t('dash.albumCountOne') : t('dash.albumCount', { count: n });
  if (n === 1) return t('dash.albumCountOne');
  if (n === 2) return 'صورتين من ضيوفك';
  if (n >= 3 && n <= 10) return `${n} صور من ضيوفك`;
  return t('dash.albumCount', { count: n });
}

export default function GuestAlbum({ shortId, title, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const [fetchPage, { isFetching }] = useLazyGetGuestPhotosQuery();
  const [deletePhoto] = useDeleteGuestPhotoMutation();
  const [getAlbumLink, { isLoading: linking }] = useGetAlbumLinkMutation();

  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [meta, setMeta] = useState({ loaded: false, enabled: true, albumPath: null });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [viewer, setViewer] = useState(-1);

  const load = useCallback(async (before) => {
    setError('');
    try {
      const r = await fetchPage({ shortId, before }).unwrap();
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return before ? prev.concat(r.photos.filter((p) => !seen.has(p.id))) : r.photos;
      });
      setTotal(r.total);
      setCursor(r.nextCursor);
      setMeta({ loaded: true, enabled: r.enabled, albumPath: r.albumPath });
    } catch {
      setError(t('dash.statsError'));
      setMeta((m) => ({ ...m, loaded: true }));
    }
  }, [fetchPage, shortId, t]);

  useEffect(() => { load(null); }, [load]);

  // Escape بيقفل (العرض الكبير الأول لو مفتوح)، والصفحة ورا مبتتزحلقش
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (viewer >= 0) setViewer(-1); else onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [viewer, onClose]);

  async function albumUrl() {
    let path = meta.albumPath;
    if (!path) {
      const r = await getAlbumLink(shortId).unwrap();
      path = r.albumPath;
      setMeta((m) => ({ ...m, albumPath: path }));
    }
    return window.location.origin + path;
  }

  async function copyLink() {
    try {
      const url = await albumUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch { setError(t('dash.albumLinkError')); }
  }

  // بنفتح التاب الأول وبعدين نحط اللينك فيه — لو استنينا الرد قبل
  // window.open المتصفح بيعتبره popup ويمنعه (سفاري بالذات)
  async function openWith(build) {
    const w = window.open('about:blank', '_blank');
    try {
      const url = await albumUrl();
      if (w) w.location.href = build(url); else window.location.href = build(url);
    } catch {
      if (w) w.close();
      setError(t('dash.albumLinkError'));
    }
  }

  async function remove(p) {
    if (!window.confirm(t('dash.albumDeleteAsk'))) return;
    setBusyId(p.id);
    try {
      await deletePhoto({ shortId, id: p.id }).unwrap();
      setPhotos((prev) => prev.filter((x) => x.id !== p.id));
      setTotal((n) => Math.max(0, n - 1));
      setViewer(-1);
    } catch { setError(t('dash.statsError')); }
    setBusyId(null);
  }

  const current = viewer >= 0 ? photos[viewer] : null;
  const step = (d) => setViewer((i) => (photos.length ? (i + d + photos.length) % photos.length : -1));

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
        aria-label={t('dash.albumTitle')}
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] bg-card shadow-2xl sm:rounded-[26px]"
      >
        {/* العنوان */}
        <div className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass">
            <Images size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[18px] font-bold text-ink">{t('dash.albumTitle')}</div>
            <div className="truncate text-[12.5px] text-ink-dim">
              {title}{meta.loaded ? ` · ${countLabel(total, lang, t)}` : ''}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('auth.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* المشاركة */}
        <div className="shrink-0 border-b border-line px-5 py-3.5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyLink} disabled={linking}
              className={`${btn} border border-brass/40 bg-brass/[0.08] text-brass hover:bg-brass/15`}>
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? t('dash.albumCopied') : t('dash.albumCopy')}
            </button>
            <button type="button" disabled={linking}
              onClick={() => openWith((url) => `https://wa.me/?text=${encodeURIComponent(`${t('dash.albumShareMsg')}\n${url}`)}`)}
              className={`${btn} bg-[#25D366]/15 text-[#128c43] hover:bg-[#25D366]/25`}>
              <WhatsAppIcon /> {t('dash.albumWhatsapp')}
            </button>
            <button type="button" disabled={linking} onClick={() => openWith((url) => url)}
              className={`${btn} border border-line text-ink hover:bg-ink/5`}>
              <ExternalLink size={14} /> {t('dash.albumOpen')}
            </button>
            {total > 0 && (
              <button type="button" disabled={linking} onClick={() => openWith((url) => `${url}/zip`)}
                className={`${btn} bg-night text-ivory hover:bg-emerald`}>
                <Download size={14} /> {t('dash.albumZip')}
              </button>
            )}
          </div>
          {meta.loaded && !meta.enabled && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-ink/[0.05] px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-dim">
              <EyeOff size={14} className="mt-0.5 shrink-0" /> {t('dash.albumHidden')}
            </p>
          )}
          {error && <p className="mt-2 text-[12.5px] font-bold text-error">{error}</p>}
        </div>

        {/* الصور */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!meta.loaded && (
            <div className="flex justify-center py-16 text-ink-dim"><Loader2 className="animate-spin" /></div>
          )}
          {meta.loaded && photos.length === 0 && (
            <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-line px-6 py-12 text-center text-[13.5px] leading-relaxed text-ink-dim">
              <Images size={26} className="mx-auto mb-3 text-brass/70" />
              {t('dash.albumEmpty')}
            </div>
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p, i) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-ivory-dim">
                  <button type="button" onClick={() => setViewer(i)} className="block h-full w-full cursor-zoom-in"
                    aria-label={p.guestName ? t('dash.albumBy', { name: p.guestName }) : String(i + 1)}>
                    <img src={p.thumb} alt="" loading="lazy" decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </button>
                  {p.guestName && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-night/75 to-transparent px-2 pb-1.5 pt-5 text-[11px] font-bold text-ivory">
                      {p.guestName}
                    </span>
                  )}
                  {busyId === p.id && (
                    <span className="absolute inset-0 flex items-center justify-center bg-night/50 text-ivory">
                      <Loader2 size={18} className="animate-spin" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {cursor && (
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={() => load(cursor)} disabled={isFetching}
                className={`${btn} border border-line text-ink hover:bg-ink/5`}>
                {isFetching ? <Loader2 size={14} className="animate-spin" /> : null}
                {t('dash.albumMore')}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* العرض الكبير */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[170] flex flex-col bg-[#0b0d07]/[0.98]"
            onClick={(e) => { e.stopPropagation(); setViewer(-1); }}
          >
            <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[calc(12px+env(safe-area-inset-top))] text-[13px] text-ivory/80">
              <span dir="ltr">{viewer + 1} / {photos.length}</span>
              <button type="button" aria-label={t('auth.close')} onClick={() => setViewer(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 text-ivory"><X size={18} /></button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2" onClick={(e) => e.stopPropagation()}>
              <img src={current.large} alt="" className="max-h-full max-w-full object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => step(lang === 'ar' ? 1 : -1)} aria-label="prev"
                    className="absolute start-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 text-ivory">
                    {lang === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  </button>
                  <button type="button" onClick={() => step(lang === 'ar' ? -1 : 1)} aria-label="next"
                    className="absolute end-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 text-ivory">
                    {lang === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </button>
                </>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3"
              onClick={(e) => e.stopPropagation()}>
              <span className="truncate text-[13px] text-ivory/80">
                {current.guestName ? t('dash.albumBy', { name: current.guestName }) : ''}
              </span>
              <div className="flex gap-2">
                <a href={current.download}
                  className={`${btn} bg-ivory text-night`}><Download size={14} /> {t('dash.albumDownload')}</a>
                <button type="button" onClick={() => remove(current)} disabled={busyId === current.id}
                  className={`${btn} bg-error/90 text-white`}><Trash2 size={14} /> {t('dash.albumDelete')}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
