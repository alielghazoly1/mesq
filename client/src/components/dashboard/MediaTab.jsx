// تبويب "التهاني" و"الصور": العدد + زرار يفتح المكتبة الكاملة (GuestVoices /
// GuestAlbum الموجودين). لينكات المشاركة بتاعتهم جوه صفحة الإحصائيات.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { Mic, Images, Headphones } from 'lucide-react';
import GuestAlbum from '../GuestAlbum.jsx';
import GuestVoices from '../GuestVoices.jsx';
import { fmtNum } from './dashUtils.js';

export default function MediaTab({ kind, inv, title }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const [open, setOpen] = useState(false);
  const isVoices = kind === 'voices';
  const count = isVoices ? inv.voices?.count || 0 : inv.album?.photos || 0;
  const unheard = isVoices ? inv.voices?.unheard || 0 : 0;
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

      <AnimatePresence>
        {open && (isVoices
          ? <GuestVoices shortId={inv.shortId} title={title} onClose={() => setOpen(false)} />
          : <GuestAlbum shortId={inv.shortId} title={title} onClose={() => setOpen(false)} />)}
      </AnimatePresence>
    </div>
  );
}
