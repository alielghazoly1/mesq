// تبويب "الضيوف": كل ردود الحضور — بحث بالاسم، فلتر (هيحضروا / معتذرين)،
// نسخ الأسماء، وتنزيل الكشف كملف Excel (CSV بالعربي).
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Search, Download, Copy, Check, X as XIcon, Loader2, MessageSquareQuote, Users,
} from 'lucide-react';
import { useGetRsvpsQuery } from '../../store/api.js';
import { setGuestFilter, setGuestQuery } from '../../store/dashboardSlice.js';
import { copyText, fmtNum, initials } from './dashUtils.js';

const PALETTE = ['#b08d57', '#3f8f6b', '#7a5ea8', '#c0605a', '#3d7fb8', '#a8783d', '#5f8f3f', '#b05a8d'];
const colorFor = (s) => PALETTE[[...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % PALETTE.length];

function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function GuestsTab({ shortId, title }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const dispatch = useDispatch();
  const filter = useSelector((s) => s.dashboard.guestFilter);
  const query = useSelector((s) => s.dashboard.guestQuery);
  const { data, isLoading } = useGetRsvpsQuery(shortId, { pollingInterval: 60000, skipPollingIfUnfocused: true });
  const [copied, setCopied] = useState(false);

  const all = data?.rsvps || [];
  const yes = all.filter((r) => r.attending).length;
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((r) => (filter === 'all' || (filter === 'yes' ? r.attending : !r.attending))
      && (!q || String(r.guestName || '').toLowerCase().includes(q) || String(r.note || '').toLowerCase().includes(q)));
  }, [all, filter, query]);

  function exportCsv() {
    const head = [t('dash2.csvName'), t('dash2.csvStatus'), t('dash2.csvNote'), t('dash2.csvDate')];
    const rows = all.map((r) => [r.guestName, r.attending ? t('dash.attending') : t('dash.notAttending'), r.note || '',
      new Date(r.createdAt).toLocaleString(lang === 'en' ? 'en-GB' : 'ar-EG')]);
    const csv = '﻿' + [head, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${String(title || 'guests').replace(/[\\/:*?"<>|]/g, '').slice(0, 40)}-guests.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function copyNames() {
    const names = list.filter((r) => r.attending).map((r, i) => `${i + 1}. ${r.guestName}`).join('\n');
    if (await copyText(names || '-')) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const FILTERS = [
    { k: 'all', label: t('dash2.fAll'), n: all.length },
    { k: 'yes', label: t('dash.attending'), n: yes },
    { k: 'no', label: t('dash.notAttending'), n: all.length - yes },
  ];

  return (
    <div className="space-y-3" data-guests>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-ink/[0.05] p-1">
          {FILTERS.map((f) => (
            <button key={f.k} type="button" onClick={() => dispatch(setGuestFilter(f.k))} data-guest-filter={f.k}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition ${filter === f.k ? 'bg-night text-ivory shadow-sm' : 'text-ink-dim hover:text-ink'}`}>
              {f.label}
              <span className={`rounded-full px-1.5 text-[10.5px] leading-[17px] ${filter === f.k ? 'bg-ivory/20' : 'bg-ink/10'}`}>{fmtNum(f.n, lang)}</span>
            </button>
          ))}
        </div>
        <div className="ms-auto flex gap-2">
          <button type="button" onClick={copyNames} disabled={!yes} data-copy-names
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-2 text-[12px] font-bold text-ink transition hover:border-ink/30 disabled:opacity-40">
            {copied ? <Check size={13} className="text-[#1f7a4d]" /> : <Copy size={13} />} {copied ? t('dash2.copied') : t('dash2.copyNames')}
          </button>
          <button type="button" onClick={exportCsv} disabled={!all.length} data-export
            className="inline-flex items-center gap-1.5 rounded-full bg-night px-3.5 py-2 text-[12px] font-bold text-ivory transition hover:bg-emerald disabled:opacity-40">
            <Download size={13} /> {t('dash2.exportExcel')}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-dim" />
        <input value={query} onChange={(e) => dispatch(setGuestQuery(e.target.value))} placeholder={t('dash2.searchGuests')} data-guest-search
          className="w-full rounded-full border border-line bg-card py-2.5 pe-4 ps-10 text-base text-ink placeholder:text-ink-dim/70 focus:border-brass focus:outline-none sm:text-[13.5px]" />
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-12 text-ink-dim"><Loader2 className="animate-spin" /></div>
      ) : !all.length ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-12 text-center" data-guests-empty>
          <Users size={26} className="text-brass" />
          <p className="text-[13.5px] font-bold text-ink">{t('dash2.noGuestsTitle')}</p>
          <p className="max-w-[44ch] text-[12.5px] leading-relaxed text-ink-dim">{t('dash2.noGuestsBody')}</p>
        </div>
      ) : !list.length ? (
        <p className="py-8 text-center text-[13px] text-ink-dim">{t('dash2.noMatch')}</p>
      ) : (
        <ul className="max-h-[520px] space-y-2 overflow-y-auto pe-1 [scrollbar-width:thin]" data-guest-list>
          {list.map((r) => (
            <li key={`${r.createdAt}-${r.guestName}`} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3" data-guest>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-white" style={{ background: colorFor(r.guestName) }}>
                {initials(r.guestName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-extrabold text-ink">{r.guestName}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${r.attending ? 'bg-[#1f7a4d]/10 text-[#1f7a4d]' : 'bg-[#a2465e]/10 text-[#a2465e]'}`}>
                    {r.attending ? <Check size={10} /> : <XIcon size={10} />} {r.attending ? t('dash.attending') : t('dash.notAttending')}
                  </span>
                  <span className="ms-auto text-[11px] text-ink-dim">
                    {new Date(r.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {r.note && (
                  <p className="mt-1.5 flex gap-1.5 rounded-xl bg-ivory/70 px-2.5 py-1.5 text-[12.5px] leading-relaxed text-ink-dim">
                    <MessageSquareQuote size={13} className="mt-0.5 shrink-0 text-brass" /> {r.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
