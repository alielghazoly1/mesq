// لوحة الدعوة المختارة: اسمها (وتغييره)، تاريخ الفرح، زراير التعديل والفتح،
// والتبويبات: نظرة عامة / الضيوف / التهاني / الصور / المشاركة.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import {
  Pencil, Wand2, Lock, ExternalLink, LayoutDashboard, Users, Mic, Images, Share2, Crown, FileText, CalendarDays, Check,
} from 'lucide-react';
import { useRenameInvitationMutation } from '../../store/api.js';
import { setTab } from '../../store/dashboardSlice.js';
import OverviewTab from './OverviewTab.jsx';
import GuestsTab from './GuestsTab.jsx';
import ShareTab from './ShareTab.jsx';
import MediaTab from './MediaTab.jsx';
import { thumbFor, fmtNum } from './dashUtils.js';
import { countdownLabel, invTitle } from './InvitationRail.jsx';

export default function InvitationPanel({ inv, lang, editEnded }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const storedTab = useSelector((s) => s.dashboard.tab);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(inv.name || '');
  const [saved, setSaved] = useState(false);
  const [rename, { isLoading: saving }] = useRenameInvitationMutation();

  const title = invTitle(inv, lang, t);
  const couple = inv.names[lang] || inv.names.ar;
  const showCouple = !!(inv.name && inv.name.trim() && couple && couple !== '&');
  const cd = countdownLabel(t, inv.weddingDate);
  const total = inv.rsvp.yes + inv.rsvp.no;

  const tabs = [
    { k: 'overview', label: t('dash2.tOverview'), icon: LayoutDashboard },
    { k: 'guests', label: t('dash2.tGuests'), icon: Users, n: total },
    ...(inv.voices ? [{ k: 'voices', label: t('dash2.tVoices'), icon: Mic, n: inv.voices.unheard || inv.voices.count, hot: inv.voices.unheard > 0 }] : []),
    ...(inv.album ? [{ k: 'photos', label: t('dash2.tPhotos'), icon: Images, n: inv.album.photos }] : []),
    { k: 'share', label: t('dash2.tShare'), icon: Share2 },
  ];
  const tab = tabs.some((x) => x.k === storedTab) ? storedTab : 'overview';

  async function saveName() {
    try {
      await rename({ shortId: inv.shortId, name: draft.trim() }).unwrap();
      setRenaming(false); setSaved(true); setTimeout(() => setSaved(false), 1800);
    } catch { /* بيفضل مفتوح */ }
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-line bg-card shadow-[0_24px_60px_-44px_rgba(15,29,24,.6)]" data-panel={inv.shortId}>
      {/* الرأس */}
      <div className="flex flex-wrap items-center gap-4 border-b border-line bg-gradient-to-l from-ivory/40 to-card p-4 sm:p-5">
        <img src={thumbFor(inv.templateId, inv.language)} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover object-top shadow-sm ring-1 ring-line" />
        <div className="min-w-0 flex-1">
          {renaming ? (
            <div className="flex flex-wrap items-center gap-2">
              <input autoFocus value={draft} maxLength={80} onChange={(e) => setDraft(e.target.value)} data-rename-input
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setRenaming(false); }}
                placeholder={t('dash.renamePlaceholder')}
                className="w-56 max-w-full rounded-xl border border-line bg-card px-3 py-2 text-base focus:border-brass focus:outline-none sm:text-[14px]" />
              <button type="button" onClick={saveName} disabled={saving} data-rename-save
                className="rounded-full bg-night px-3.5 py-2 text-[12px] font-bold text-ivory hover:bg-emerald disabled:opacity-60">{t('dash.saveName')}</button>
              <button type="button" onClick={() => { setRenaming(false); setDraft(inv.name || ''); }} className="text-[12px] text-ink-dim hover:text-ink">{t('dash.cancel')}</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-serif text-[21px] font-bold text-ink" data-panel-title>{title}</h2>
              <button type="button" onClick={() => { setDraft(inv.name || ''); setRenaming(true); }} aria-label={t('dash.rename')} title={t('dash.rename')}
                className="grid h-7 w-7 place-items-center rounded-full text-ink-dim transition hover:bg-brass/10 hover:text-brass" data-rename>
                {saved ? <Check size={14} className="text-[#1f7a4d]" /> : <Pencil size={13} />}
              </button>
              {inv.isPremium && <span className="inline-flex items-center gap-1 rounded-full bg-brass/15 px-2 py-0.5 text-[10.5px] font-bold text-[#8a6a20]"><Crown size={10} /> {t('dash.premiumBadge')}</span>}
              {inv.isDraft && <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-2 py-0.5 text-[10.5px] font-bold text-ink-dim"><FileText size={10} /> {t('dash.draftBadge')}</span>}
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-dim">
            {showCouple && <span className="truncate">{couple}</span>}
            {inv.weddingDate && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} />
                {new Date(inv.weddingDate).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {cd && <span className={`font-extrabold ${cd.tone === 'rose' ? 'text-[#a2465e]' : cd.tone === 'gold' ? 'text-[#8a6a20]' : ''}`}>· {cd.text}</span>}
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {inv.isPremium && (editEnded ? (
            <span title={t('dash.editEndedTitle')} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-[12.5px] font-bold text-ink-dim">
              <Lock size={13} /> {t('dash.editLocked')}
            </span>
          ) : (
            <Link to={`/editor/${inv.shortId}`} data-edit
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2.5 text-[12.5px] font-extrabold text-[#241608] transition hover:brightness-105 sm:flex-none">
              <Wand2 size={14} /> {inv.isDraft ? t('dash.continueDraft') : t('dash.edit')}
            </Link>
          ))}
          {!inv.isDraft && (
            <a href={inv.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-night px-4 py-2.5 text-[12.5px] font-bold text-ivory transition hover:bg-emerald sm:flex-none">
              <ExternalLink size={14} /> {t('dash.open')}
            </a>
          )}
        </div>
      </div>

      {/* التبويبات */}
      <div className="overflow-x-auto border-b border-line px-2 [scrollbar-width:none] sm:px-4" role="tablist" data-tabs>
        <div className="flex min-w-max gap-1">
          {tabs.map((x) => (
            <button key={x.k} type="button" role="tab" aria-selected={tab === x.k} onClick={() => dispatch(setTab(x.k))} data-tab={x.k}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[13px] font-bold transition ${tab === x.k ? 'text-ink' : 'text-ink-dim hover:text-ink'}`}>
              <x.icon size={15} className={tab === x.k ? 'text-brass' : ''} /> {x.label}
              {x.n > 0 && (
                <span className={`rounded-full px-1.5 text-[10.5px] leading-[17px] ${x.hot ? 'bg-[#b02f45] text-white' : 'bg-ink/10 text-ink-dim'}`}>{fmtNum(x.n, lang)}</span>
              )}
              {tab === x.k && <motion.span layoutId={`tab-${inv.shortId}`} className="absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-brass" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div key={`${inv.shortId}-${tab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {tab === 'overview' && <OverviewTab shortId={inv.shortId} />}
            {tab === 'guests' && <GuestsTab shortId={inv.shortId} title={title} />}
            {tab === 'voices' && <MediaTab kind="voices" inv={inv} title={title} />}
            {tab === 'photos' && <MediaTab kind="photos" inv={inv} title={title} />}
            {tab === 'share' && <ShareTab shortId={inv.shortId} title={title} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
