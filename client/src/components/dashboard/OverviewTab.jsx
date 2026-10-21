// تبويب "نظرة عامة": أرقام الفترة + رسم المشاهدات يوم بيوم + الضيوف جايين
// منين + موبايل ولا كمبيوتر + أكتر ساعة بيفتحوا فيها + نسبة الحضور.
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  Eye, UserRound, Check, X as XIcon, Smartphone, Monitor, Tablet, Clock, ArrowUpRight, ArrowDownRight,
  Loader2, Sparkles,
} from 'lucide-react';
import { useGetInsightsQuery } from '../../store/api.js';
import { setRange } from '../../store/dashboardSlice.js';
import { fmtNum, pctDelta, shortDay, hourLabel } from './dashUtils.js';

const SOURCE_META = {
  direct: { color: '#25D366', key: 'dash2.srcDirect' },
  whatsapp: { color: '#1da851', key: 'dash2.srcWhatsapp' },
  instagram: { color: '#d62976', key: 'dash2.srcInstagram' },
  facebook: { color: '#1877f2', key: 'dash2.srcFacebook' },
  tiktok: { color: '#111111', key: 'dash2.srcTiktok' },
  snapchat: { color: '#e8c400', key: 'dash2.srcSnapchat' },
  google: { color: '#4285f4', key: 'dash2.srcGoogle' },
  qr: { color: '#b08d57', key: 'dash2.srcQr' },
  other: { color: '#8a7a68', key: 'dash2.srcOther' },
};

function Metric({ icon: Icon, label, value, delta, tone, lang }) {
  const c = { ink: 'text-ink', ok: 'text-[#1f7a4d]', rose: 'text-[#a2465e]' }[tone || 'ink'];
  return (
    <div className="rounded-2xl border border-line bg-ivory/50 p-3.5" data-metric>
      <div className="flex items-center justify-between text-[11.5px] font-bold text-ink-dim">
        <span className="flex items-center gap-1.5"><Icon size={13} className={c} /> {label}</span>
        {delta != null && (
          <span className={`inline-flex items-center text-[10.5px] font-extrabold ${delta >= 0 ? 'text-[#1f7a4d]' : 'text-[#a2465e]'}`}>
            {delta >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={`mt-1.5 font-serif text-[26px] font-bold leading-none ${c}`}>{fmtNum(value, lang)}</div>
    </div>
  );
}

function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-line bg-card p-4 ${className}`}>
      <div className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
        {Icon && <Icon size={14} className="text-brass" />} {title}
      </div>
      {children}
    </div>
  );
}

function Bars({ rows, lang }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((a, r) => a + r.value, 0) || 1;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.key} data-bar={r.key}>
          <div className="mb-1 flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              {r.icon ? <r.icon size={13} style={{ color: r.color }} /> : <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className="font-bold tabular-nums text-ink-dim">{fmtNum(r.value, lang)} · {Math.round((r.value / total) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/[0.06]">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.value / max) * 100}%`, background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Ring({ pct, label }) {
  const r = 42; const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-[120px] w-[120px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(15,29,24,.08)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f7a4d" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-serif text-[26px] font-bold leading-none text-[#1f7a4d]">{pct}%</div>
          <div className="mt-1 text-[10.5px] font-bold text-ink-dim">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({ shortId }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const dispatch = useDispatch();
  const range = useSelector((s) => s.dashboard.range);
  const { data, isFetching, isError, refetch } = useGetInsightsQuery({ shortId, range }, { pollingInterval: 60000, skipPollingIfUnfocused: true });

  const RANGES = [{ v: 7, k: 'dash2.r7' }, { v: 30, k: 'dash2.r30' }, { v: 90, k: 'dash2.r90' }, { v: 0, k: 'dash2.rAll' }];

  if (!data) {
    return (
      <div className="grid place-items-center py-16 text-ink-dim">
        {isError
          ? <button type="button" onClick={refetch} className="text-[13px] font-bold underline">{t('dash2.retry')}</button>
          : <Loader2 className="animate-spin" />}
      </div>
    );
  }

  const sources = Object.entries(data.sources || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ key: k, value: v, color: (SOURCE_META[k] || SOURCE_META.other).color, label: t((SOURCE_META[k] || SOURCE_META.other).key) }));
  const devices = [
    { key: 'mobile', value: data.devices.mobile, color: '#0f1d18', icon: Smartphone, label: t('dash2.devMobile') },
    { key: 'desktop', value: data.devices.desktop, color: '#b08d57', icon: Monitor, label: t('dash2.devDesktop') },
    { key: 'tablet', value: data.devices.tablet, color: '#8a7a68', icon: Tablet, label: t('dash2.devTablet') },
  ].filter((d) => d.value > 0);
  const hours = data.hours || [];
  const peak = hours.reduce((best, v, i) => (v > hours[best] ? i : best), 0);
  const hasHours = hours.some((v) => v > 0);
  const maxH = Math.max(1, ...hours);
  const attendPct = data.rsvp.total ? Math.round((data.rsvp.yes / data.rsvp.total) * 100) : 0;
  const series = data.series.map((p) => ({ ...p, label: shortDay(p.day, lang) }));
  const empty = !data.since;

  return (
    <div className="space-y-4" data-overview>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full bg-ink/[0.05] p-1" role="tablist" data-ranges>
          {RANGES.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => dispatch(setRange(r.v))}
              data-range={r.v}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition ${range === r.v ? 'bg-night text-ivory shadow-sm' : 'text-ink-dim hover:text-ink'}`}
            >
              {t(r.k)}
            </button>
          ))}
        </div>
        {isFetching && <Loader2 size={15} className="animate-spin text-ink-dim" />}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Metric icon={Eye} label={t('dash2.mViews')} value={data.views} delta={range ? pctDelta(data.views, data.prevViews) : null} lang={lang} />
        <Metric icon={UserRound} label={t('dash2.mUniques')} value={data.uniques} delta={range ? pctDelta(data.uniques, data.prevUniques) : null} lang={lang} />
        <Metric icon={Check} label={t('dash2.mYes')} value={data.rsvp.yes} tone="ok" lang={lang} />
        <Metric icon={XIcon} label={t('dash2.mNo')} value={data.rsvp.no} tone="rose" lang={lang} />
      </div>

      {empty && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-brass/30 bg-brass/[0.07] p-3.5 text-[12.5px] leading-relaxed text-ink" data-insights-empty>
          <Sparkles size={15} className="mt-0.5 shrink-0 text-brass" />
          <span>{t('dash2.trackingStarts', { count: data.totalViews })}</span>
        </div>
      )}

      <Card title={t('dash2.chartTitle')} icon={Eye}>
        <div className="h-[210px] w-full" dir="ltr" data-chart>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a24a" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#c9a24a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f1d18" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0f1d18" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,29,24,.07)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: '#8a7a68' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10.5, fill: '#8a7a68' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 14, border: '1px solid rgba(15,29,24,.1)', fontSize: 12, direction: lang === 'en' ? 'ltr' : 'rtl' }}
                formatter={(v, n) => [fmtNum(v, lang), n === 'views' ? t('dash2.mViews') : t('dash2.mUniques')]}
              />
              <Area type="monotone" dataKey="views" stroke="#b08d57" strokeWidth={2.2} fill="url(#gv)" />
              <Area type="monotone" dataKey="uniques" stroke="#0f1d18" strokeWidth={1.6} fill="url(#gu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-[11.5px] font-bold text-ink-dim">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[#b08d57]" /> {t('dash2.mViews')}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-night" /> {t('dash2.mUniques')}</span>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={t('dash2.sourcesTitle')}>
          {sources.length ? <Bars rows={sources} lang={lang} /> : <p className="text-[12.5px] text-ink-dim">{t('dash2.noDataYet')}</p>}
        </Card>
        <Card title={t('dash2.rsvpTitle')}>
          {data.rsvp.total ? (
            <div className="flex items-center gap-4">
              <Ring pct={attendPct} label={t('dash2.attendRate')} />
              <div className="flex-1 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between rounded-xl bg-[#1f7a4d]/[0.08] px-3 py-2 font-bold text-[#1f7a4d]"><span>{t('dash.attending')}</span><span>{fmtNum(data.rsvp.yes, lang)}</span></div>
                <div className="flex items-center justify-between rounded-xl bg-[#a2465e]/[0.08] px-3 py-2 font-bold text-[#a2465e]"><span>{t('dash.notAttending')}</span><span>{fmtNum(data.rsvp.no, lang)}</span></div>
                {data.uniques > 0 && (
                  <p className="text-[11px] text-ink-dim">{t('dash2.responseRate', { pct: Math.min(100, Math.round((data.rsvp.total / Math.max(1, data.uniques)) * 100)) })}</p>
                )}
              </div>
            </div>
          ) : <p className="text-[12.5px] text-ink-dim">{t('dash.rsvpEmpty')}</p>}
        </Card>
        <Card title={t('dash2.devicesTitle')}>
          {devices.length ? <Bars rows={devices} lang={lang} /> : <p className="text-[12.5px] text-ink-dim">{t('dash2.noDataYet')}</p>}
        </Card>
        <Card title={t('dash2.hoursTitle')} icon={Clock}>
          {hasHours ? (
            <>
              <p className="mb-3 text-[12.5px] text-ink">{t('dash2.peakHour', { hour: hourLabel(peak, lang) })}</p>
              <div className="flex h-[70px] items-end gap-[3px]" dir="ltr" data-hours>
                {hours.map((v, i) => (
                  <div key={i} title={`${hourLabel(i, lang)} — ${v}`}
                    className={`flex-1 rounded-t-[3px] ${i === peak ? 'bg-brass' : 'bg-night/20'}`}
                    style={{ height: `${Math.max(4, (v / maxH) * 100)}%` }} />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-ink-dim" dir="ltr">
                <span>{hourLabel(0, lang)}</span><span>{hourLabel(12, lang)}</span><span>{hourLabel(23, lang)}</span>
              </div>
            </>
          ) : <p className="text-[12.5px] text-ink-dim">{t('dash2.noDataYet')}</p>}
        </Card>
      </div>
    </div>
  );
}
