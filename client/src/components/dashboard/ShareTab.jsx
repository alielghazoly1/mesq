// تبويب "المشاركة": كل لينكات الدعوة في مكان واحد — الدعوة نفسها، صفحة
// الإحصائيات، ألبوم الصور، التهاني الصوتية. لكل لينك: نسخ، واتساب، فتح،
// و QR ينزل صورة (للكروت المطبوعة). لينكات الدعوة بتاخد ?from= فالإحصائيات
// تعرف الضيف جه من واتساب ولا إنستجرام ولا الكارت المطبوع.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import QRCode from 'qrcode';
import {
  Copy, Check, ExternalLink, QrCode, Download, X as XIcon, Loader2, Mail, BarChart3, AlertTriangle,
} from 'lucide-react';
import { useGetShareLinksQuery } from '../../store/api.js';
import { absUrl, copyText, waShareUrl, withFrom } from './dashUtils.js';

function WaIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

function QrModal({ url, title, onClose }) {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(url, { width: 720, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#22150c', light: '#ffffff' } })
      .then(setSrc).catch(() => setSrc(''));
  }, [url]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] grid place-items-center bg-night/60 p-4 backdrop-blur-sm" onClick={onClose} data-qr-modal>
      <motion.div initial={{ scale: 0.94, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
        onClick={(e) => e.stopPropagation()} className="w-full max-w-[340px] rounded-[24px] bg-card p-5 text-center shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[14px] font-extrabold text-ink">{title}</span>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-ink-dim hover:bg-ink/5" aria-label={t('auth.close')}><XIcon size={16} /></button>
        </div>
        <div className="mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl border border-line bg-white p-2">
          {src ? <img src={src} alt="QR" className="h-full w-full" data-qr-img /> : <div className="grid h-full place-items-center"><Loader2 className="animate-spin text-ink-dim" /></div>}
        </div>
        <a href={src || undefined} download="mithaq-qr.png"
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-night py-3 text-[13px] font-bold text-ivory transition hover:bg-emerald ${src ? '' : 'pointer-events-none opacity-50'}`}>
          <Download size={15} /> {t('dash2.qrDownload')}
        </a>
      </motion.div>
    </motion.div>
  );
}

function LinkCard({ icon: Icon, tone, title, url, waText, qr, extra, testId }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const copy = async (u, k) => { if (await copyText(u)) { setCopied(k); setTimeout(() => setCopied(''), 1800); } };
  const btn = 'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition';
  return (
    <div className="rounded-2xl border border-line bg-card p-4" data-share-card={testId}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${tone}18`, color: tone }}><Icon size={18} /></span>
        <div className="min-w-0 flex-1 text-[15px] font-extrabold text-ink">{title}</div>
      </div>
      <button type="button" onClick={() => copy(url, 'main')} data-share-url
        className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-line bg-ivory/60 px-3 py-2.5 text-start transition hover:border-brass/60">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink" dir="ltr">{url.replace(/^https?:\/\//, '')}</span>
        {copied === 'main' ? <Check size={14} className="shrink-0 text-[#1f7a4d]" /> : <Copy size={14} className="shrink-0 text-ink-dim" />}
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(url, 'main')} className={`${btn} bg-night text-ivory hover:bg-emerald`} data-share-copy>
          {copied === 'main' ? <Check size={13} /> : <Copy size={13} />} {copied === 'main' ? t('dash2.copied') : t('dash2.copyLink')}
        </button>
        {waText && (
          <a href={waShareUrl(waText)} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366]/12 text-[#128c4a] hover:bg-[#25D366]/20`} data-share-wa>
            <WaIcon /> {t('dash2.whatsapp')}
          </a>
        )}
        {extra && extra.map((x) => (
          <button key={x.k} type="button" onClick={() => copy(x.url, x.k)} className={`${btn} border border-line text-ink hover:border-ink/30`}>
            {copied === x.k ? <Check size={13} className="text-[#1f7a4d]" /> : <x.icon size={13} />} {copied === x.k ? t('dash2.copied') : x.label}
          </button>
        ))}
        {qr && (
          <button type="button" onClick={() => setQrOpen(true)} className={`${btn} border border-line text-ink hover:border-ink/30`} data-share-qr>
            <QrCode size={13} /> QR
          </button>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className={`${btn} text-ink-dim hover:text-ink`}>
          <ExternalLink size={13} /> {t('dash.open')}
        </a>
      </div>
      <AnimatePresence>{qrOpen && <QrModal url={qr} title={title} onClose={() => setQrOpen(false)} />}</AnimatePresence>
    </div>
  );
}

export default function ShareTab({ shortId, title }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useGetShareLinksQuery(shortId);
  if (isLoading || !data) {
    return (
      <div className="grid place-items-center py-14 text-ink-dim">
        {isError ? <button type="button" onClick={refetch} className="text-[13px] font-bold underline">{t('dash2.retry')}</button> : <Loader2 className="animate-spin" />}
      </div>
    );
  }
  const invite = absUrl(data.invite);
  return (
    <div className="space-y-3" data-share>
      {data.isDraft && (
        <div className="flex items-start gap-2 rounded-2xl border border-brass/40 bg-brass/[0.08] p-3 text-[12.5px] text-ink">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-brass" /> {t('dash2.draftShareNote')}
        </div>
      )}
      <LinkCard testId="invite" icon={Mail} tone="#b08d57" title={t('dash2.shInvite')}
        url={invite} waText={`${t('dash2.waInvite', { title })}\n${withFrom(invite, 'wa')}`} qr={withFrom(invite, 'qr')} />
      <LinkCard testId="stats" icon={BarChart3} tone="#0f1d18" title={t('dash2.shStats')}
        url={absUrl(data.stats)} waText={`${t('dash2.waStats', { title })}\n${absUrl(data.stats)}`} />
    </div>
  );
}
