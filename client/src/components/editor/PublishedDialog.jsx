// "دعوتك اتنشرت 🎉" — رسالة في نص الشاشة بعد النشر (طلب المالك 2026-11-27): لينك الدعوة (للضيوف) ولينك
// الإحصائيات (الخاص بالعروسين)، كل واحد بزرار نسخ، وزرار "ابعتها على واتساب"، وملاحظة إن الاتنين موجودين
// في لوحة العميل. شكلها واحد على الموبايل والكمبيوتر، وبتقفل بـ Esc أو برّه الكارت أو "تمام".
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, Check, Copy, ExternalLink, PartyPopper, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { copyText, waShareUrl } from '../dashboard/dashUtils.js';

function LinkRow({ icon: Icon, label, hint, url, ar }) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  async function copy() {
    const ok = await copyText(url);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800); } else setManual(true);
  }
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-3.5 text-start">
      <div className="mb-1.5 flex items-center gap-2 text-[12.5px] font-bold text-ink">
        <Icon size={14} className="text-brass" /> {label}
      </div>
      {hint && <p className="mb-2 text-[11.5px] leading-relaxed text-ink-dim">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          dir="ltr"
          onFocus={(e) => e.target.select()}
          className={`min-w-0 flex-1 rounded-xl border bg-ivory/70 px-3 py-2 text-[12px] text-ink ${manual ? 'border-brass' : 'border-line'}`}
        />
        <button
          type="button"
          onClick={copy}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition ${copied ? 'bg-ok text-white' : 'bg-night text-ivory hover:bg-emerald'}`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? (ar ? 'اتنسخ' : 'Copied') : (ar ? 'انسخ' : 'Copy')}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="hidden shrink-0 rounded-xl border border-line p-2 text-ink-dim hover:text-ink sm:inline-flex" aria-label={ar ? 'افتح' : 'Open'}>
          <ExternalLink size={14} />
        </a>
      </div>
      {manual && <p className="mt-1.5 text-[11px] text-brass">{ar ? 'المتصفح ده مش بيسمح بالنسخ — علّم اللينك وانسخه بإيدك.' : 'This browser blocks copying — select the link and copy it.'}</p>}
    </div>
  );
}

export default function PublishedDialog({ open, inviteUrl, statsUrl, onClose }) {
  const { i18n } = useTranslation();
  const ar = i18n.language !== 'en';
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  const waText = ar ? `يسعدنا دعوتكم 🤍\n${inviteUrl}` : `You're invited 🤍\n${inviteUrl}`;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="published"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-night/45 p-4 backdrop-blur-[6px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
          dir={ar ? 'rtl' : 'ltr'}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="pub-title" data-published-dialog
            className="relative max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-[28px] border border-white/40 bg-white/88 p-6 text-center shadow-[0_30px_80px_-30px_rgba(15,29,24,.6)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <button type="button" onClick={onClose} aria-label={ar ? 'قفل' : 'Close'} className="absolute end-4 top-4 rounded-full p-1.5 text-ink-dim hover:bg-ink/5 hover:text-ink">
              <X size={16} />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass">
              <PartyPopper size={26} />
            </div>
            <h2 id="pub-title" className="font-serif text-[21px] font-bold text-ink">{ar ? 'دعوتك اتنشرت 🎉' : 'Your invitation is live 🎉'}</h2>
            <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-[1.8] text-ink-dim">
              {ar ? 'انسخ اللينكات دلوقتي — وهتلاقيهم دايمًا في لوحتك.' : 'Copy your links now — they are always in your dashboard too.'}
            </p>
            <div className="mt-4 space-y-3">
              <LinkRow
                icon={ExternalLink} ar={ar} url={inviteUrl}
                label={ar ? 'لينك الدعوة — للضيوف' : 'Invitation link — for guests'}
                hint={ar ? 'ده اللي تبعته لكل الناس على واتساب أو أي مكان.' : 'Send this one to everyone on WhatsApp or anywhere.'}
              />
              {statsUrl && (
                <LinkRow
                  icon={BarChart3} ar={ar} url={statsUrl}
                  label={ar ? 'لينك الإحصائيات — ليكم بس' : 'Stats link — just for you'}
                  hint={ar ? 'مين فتح الدعوة ومين أكّد حضوره — ماتبعتوش للضيوف.' : 'Who opened it and who confirmed — don’t send it to guests.'}
                />
              )}
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a
                href={waShareUrl(waText)}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-[13.5px] font-extrabold text-white hover:brightness-105"
              >
                {ar ? 'ابعتها على واتساب' : 'Send on WhatsApp'}
              </a>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-line px-6 py-2.5 text-[13.5px] font-bold text-ink hover:border-ink/30"
              >
                {ar ? 'روح للوحتي' : 'Go to my dashboard'}
              </Link>
              <button type="button" onClick={onClose} className="rounded-full bg-night px-6 py-2.5 text-[13.5px] font-bold text-ivory hover:bg-emerald">
                {ar ? 'تمام' : 'Done'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
