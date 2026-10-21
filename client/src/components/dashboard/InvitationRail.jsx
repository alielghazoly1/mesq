// شريط الدعوات: كارت لكل دعوة بصورة تصميمها + فاضل كام يوم + أرقامها.
// الضغط على كارت بيفتح الدعوة دي في اللوحة اللي تحت (Redux: dashboard.selected).
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Eye, Check, FileText, CalendarHeart } from 'lucide-react';
import { selectInvitation } from '../../store/dashboardSlice.js';
import { thumbFor, daysUntil, fmtNum } from './dashUtils.js';

export function countdownLabel(t, date) {
  const d = daysUntil(date);
  if (d == null) return null;
  if (d > 1) return { text: t('dash2.daysToGo', { count: d }), tone: 'gold' };
  if (d === 1) return { text: t('dash2.tomorrow'), tone: 'rose' };
  if (d === 0) return { text: t('dash2.today'), tone: 'rose' };
  return { text: t('dash2.passed'), tone: 'muted' };
}

export function invTitle(inv, lang, t) {
  const couple = inv.names[lang] || inv.names.ar;
  return (inv.name && inv.name.trim()) || (couple && couple !== '&' ? couple : t('dash.untitled'));
}

export default function InvitationRail({ invitations, lang, selected }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useSelector((s) => s.dashboard.selected);

  return (
    <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0" data-rail>
      <div className="flex gap-3">
        {invitations.map((inv, i) => {
          const on = inv.shortId === selected;
          const cd = countdownLabel(t, inv.weddingDate);
          return (
            <motion.button
              key={inv.shortId}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 6) * 0.04 }}
              onClick={() => dispatch(selectInvitation(inv.shortId))}
              data-rail-item={inv.shortId}
              aria-pressed={on}
              className={`group relative w-[220px] shrink-0 overflow-hidden rounded-[20px] border bg-card text-start transition sm:w-[240px] ${
                on ? 'border-brass shadow-[0_18px_40px_-24px_rgba(176,141,87,.9)] ring-2 ring-brass/40' : 'border-line hover:border-ink/25'
              }`}
            >
              <div className="relative h-[118px] overflow-hidden bg-ivory">
                <img src={thumbFor(inv.templateId, inv.language)} alt="" loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/10 to-transparent" />
                {cd && (
                  <span className={`absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold backdrop-blur ${
                    cd.tone === 'gold' ? 'bg-night/70 text-brass-soft' : cd.tone === 'rose' ? 'bg-[#a2465e] text-white' : 'bg-ivory/80 text-ink-dim'
                  }`}
                  >
                    <CalendarHeart size={11} /> {cd.text}
                  </span>
                )}
                {inv.isDraft && (
                  <span className="absolute end-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-ivory/90 px-2 py-0.5 text-[10.5px] font-bold text-ink-dim">
                    <FileText size={10} /> {t('dash.draftBadge')}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-[14px] font-extrabold text-ink">{invTitle(inv, lang, t)}</div>
                <div className="mt-1.5 flex items-center gap-3 text-[11.5px] font-bold text-ink-dim">
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> {fmtNum(inv.views, lang)}</span>
                  <span className="inline-flex items-center gap-1 text-[#1f7a4d]"><Check size={12} /> {fmtNum(inv.rsvp.yes, lang)}</span>
                  {inv.voices && inv.voices.unheard > 0 && (
                    <span className="ms-auto rounded-full bg-[#b02f45] px-1.5 text-[10px] leading-[16px] text-white">{inv.voices.unheard}</span>
                  )}
                </div>
              </div>
              {on && <motion.span layoutId="rail-on" className="absolute inset-x-6 bottom-0 h-[3px] rounded-t-full bg-brass" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
