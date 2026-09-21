// شاشة "مدة التعديل خلصت" في المحرر.
//
// العميل بيوصلها لما يفتح دعوة (أو يكمّل مسودة) بعد ما مدة التعديل بتاعت
// باقته تخلص. الرسالة الأهم فيها أول سطر: الدعوة لسه شغالة زي ما هي —
// مفيش حاجة اتمسحت ولا اتقفلت على ضيوفه. وبعدها الحلول على طول: واتساب
// أو باقة جديدة بتفتح مدة تانية.
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, MessageCircle, ExternalLink, Crown } from 'lucide-react';
import { whatsappLink } from '../../lib/contact.js';
import { formatDay } from '../../lib/editWindow.js';

/**
 * @param {{shortId: string, editUntil?: string|null, days?: number}} props
 */
export default function EditWindowEnded({ shortId, editUntil, days = 30 }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const date = formatDay(editUntil, lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass">
        <Lock size={22} />
      </span>
      <h1 className="font-serif text-[22px] font-bold text-ink">{t('editor.endedTitle')}</h1>
      <p className="max-w-[46ch] text-[14px] leading-[1.95] text-ink-dim">
        {date
          ? t('editor.endedBody', { date, days: days || 30 })
          : t('editor.endedBodyNoDate')}
      </p>

      <div className="mt-2 flex w-full max-w-sm flex-col gap-2.5">
        <a
          href={whatsappLink(t('editor.endedWaMsg'))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft px-7 py-3.5 text-[14px] font-extrabold text-[#241608] hover:brightness-105"
        >
          <MessageCircle size={16} /> {t('editor.endedWa')}
        </a>
        <Link
          to="/packages"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-ink px-7 py-3 text-[13.5px] font-bold text-ink hover:bg-ink/5"
        >
          <Crown size={15} /> {t('editor.endedPackages')}
        </Link>
        {shortId && (
          <a
            href={`/i/${shortId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-[13px] font-bold text-emerald hover:bg-emerald/5"
          >
            <ExternalLink size={14} /> {t('editor.endedOpen')}
          </a>
        )}
      </div>

      <Link to="/dashboard" className="mt-1 text-[12.5px] text-ink-dim underline">
        {t('editor.back')}
      </Link>
    </div>
  );
}
