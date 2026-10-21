// تبويب "التهاني" و"الصور": ملخص + زرار يفتح المكتبة الكاملة (GuestVoices /
// GuestAlbum الموجودين) + لينك المشاركة جاهز.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { Mic, Images, Headphones, Copy, Check, Loader2 } from 'lucide-react';
import GuestAlbum from '../GuestAlbum.jsx';
import GuestVoices from '../GuestVoices.jsx';
import { useGetShareLinksQuery } from '../../store/api.js';
import { absUrl, copyText, fmtNum, waShareUrl } from './dashUtils.js';

export default function MediaTab({ kind, inv, title }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: links } = useGetShareLinksQuery(inv.shortId);
  const isVoices = kind === 'voices';
  const count = isVoices ? inv.voices?.count || 0 : inv.album?.photos || 0;
  const unheard = isVoices ? inv.voices?.unheard || 0 : 0;
  const link = links ? absUrl(isVoices ? links.voices : links.album) : '';
  const Icon = isVoices ? Mic : Images;
  const tone = isVoices ? '#7a2a37' : '#a2465e';

  return (
    <div className="space-y-3" data-media={kind}>
      <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${tone}, #22150c)` }}>
        <span aria-hidden="true" className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15"><Icon size={26} /></span>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[30px] font-bold leading-none" data-media-count>{fmtNum(count, lang)}</div>
            <div className="mt-1 text-[13px] font-bold text-white/80">{isVoices ? t('dash2.voicesCount') : t('dash2.photosCount')}</div>
            {unheard > 0 && <div className="mt-1.5 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-extrabold">{t('dash2.unheard', { count: unheard })}</div>}
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} data-media-open
          className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-[13.5px] font-extrabold transition hover:brightness-95" style={{ color: tone }}>
          {isVoices ? <Headphones size={16} /> : <Images size={16} />} {isVoices ? t('dash2.listenAll') : t('dash2.viewAll')}
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="text-[13.5px] font-extrabold text-ink">{isVoices ? t('dash2.shVoices') : t('dash2.shAlbum')}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-dim">{isVoices ? t('dash2.shVoicesDesc') : t('dash2.shAlbumDesc')}</p>
        {link ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" data-media-copy
              onClick={async () => { if (await copyText(link)) { setCopied(true); setTimeout(() => setCopied(false), 1800); } }}
              className="inline-flex items-center gap-1.5 rounded-full bg-night px-3.5 py-2 text-[12px] font-bold text-ivory hover:bg-emerald">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? t('dash2.copied') : t('dash2.copyLink')}
            </button>
            <a href={waShareUrl(`${isVoices ? t('dash2.waVoices', { title }) : t('dash2.waAlbum', { title })}\n${link}`)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/12 px-3.5 py-2 text-[12px] font-bold text-[#128c4a] hover:bg-[#25D366]/20">
              {t('dash2.whatsapp')}
            </a>
          </div>
        ) : <Loader2 size={16} className="mt-3 animate-spin text-ink-dim" />}
      </div>

      <AnimatePresence>
        {open && (isVoices
          ? <GuestVoices shortId={inv.shortId} title={title} onClose={() => setOpen(false)} />
          : <GuestAlbum shortId={inv.shortId} title={title} onClose={() => setOpen(false)} />)}
      </AnimatePresence>
    </div>
  );
}
