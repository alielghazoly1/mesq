// صفحة "الإعلانات" — لينك لكل إعلان، وأرقامه كاملة:
// كام شخص دخل ← كام سجّل ← كام دفع ← كام فلوس، وقد إيه صرفت عليه ومكسبك منه.
// وتحت كل إعلان أسامي اللي سجّلوا منه: مين دفع، مين رفع إيصال ومستني، ومين مادفعش.
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import {
  Target, Plus, Copy, Check, Link2, Users, Crown, Wallet, Eye, Archive, ArchiveRestore,
  ChevronDown, TrendingUp, TrendingDown, Pencil, X, Camera, ThumbsUp, Music2, Search,
  MessageCircle, Ghost, Megaphone, Clock, MousePointerClick, ShieldCheck, CalendarDays, Smartphone, Monitor, Tablet,
} from 'lucide-react';
import {
  useGetCampaignsQuery, useGetCampaignQuery, useCreateCampaignMutation, useUpdateCampaignMutation,
} from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import {
  Panel, StatTile, Badge, Btn, Field, Spinner, Empty, fmtNum, fmtMoney, fmtDate,
} from '../../components/admin/ui.jsx';
import { AreaTrend, COLORS } from '../../components/admin/Charts.jsx';
import { countryName, waLink } from './format.js';
import ClientDrawer from './ClientDrawer.jsx';

const PLATFORMS = [
  { id: 'instagram', label: 'إنستجرام', icon: Camera },
  { id: 'facebook', label: 'فيسبوك', icon: ThumbsUp },
  { id: 'tiktok', label: 'تيك توك', icon: Music2 },
  { id: 'google', label: 'جوجل', icon: Search },
  { id: 'snapchat', label: 'سناب شات', icon: Ghost },
  { id: 'whatsapp', label: 'واتساب', icon: MessageCircle },
  { id: 'other', label: 'تاني', icon: Megaphone },
];
const platformOf = (id) => PLATFORMS.find((p) => p.id === id) || PLATFORMS[PLATFORMS.length - 1];
const LANDINGS = [
  { id: '/', label: 'الصفحة الرئيسية' },
  { id: '/gallery', label: 'صفحة التصاميم' },
  { id: '/packages', label: 'صفحة الباقات' },
];

const RATE_KEY = 'mithaq_usd_rate';
const readRate = () => {
  try { const n = Number(localStorage.getItem(RATE_KEY)); return n > 0 ? n : 50; } catch { return 50; }
};
// الريال (عملاء السعودية) بيتحوّل لجنيه بالسعر اللي المالك كاتبه (افتراضي 13.3)
const SAR_RATE_KEY = 'mithaq_sar_rate';
const readSarRate = () => {
  try { const n = Number(localStorage.getItem(SAR_RATE_KEY)); return n > 0 ? n : 13.3; } catch { return 13.3; }
};
// اليورو (عملاء دول اليورو) بيتحوّل لجنيه بالسعر اللي المالك كاتبه (افتراضي 58)
const EUR_RATE_KEY = 'mithaq_eur_rate';
const readEurRate = () => {
  try { const n = Number(localStorage.getItem(EUR_RATE_KEY)); return n > 0 ? n : 58; } catch { return 58; }
};
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const linkOf = (code) => `${window.location.origin}/go/${code}`;

/** كل الأرقام المحسوبة لإعلان واحد (بالجنيه، والدولار بيتحوّل بالسعر اللي المالك كاتبه) */
function money(c, rate) {
  const s = c.stats;
  const revenue = (s.revenue.EGP || 0) + (s.revenue.USD || 0) * rate + (s.revenue.SAR || 0) * readSarRate() + (s.revenue.EUR || 0) * readEurRate();
  const spend = c.spend.currency === 'USD' ? c.spend.amount * rate : c.spend.amount;
  return {
    revenue, spend,
    profit: revenue - spend,
    roas: spend ? revenue / spend : null,
    perSignup: spend && s.signups ? spend / s.signups : null,
    perPayer: spend && s.payers ? spend / s.payers : null,
  };
}

function CopyLink({ code, big }) {
  const [done, setDone] = useState(false);
  const url = linkOf(code);
  const copy = () => {
    const ok = () => { setDone(true); setTimeout(() => setDone(false), 1800); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(ok, () => window.prompt('انسخ اللينك:', url));
    else window.prompt('انسخ اللينك:', url);
  };
  return (
    <div className={`flex min-w-0 items-center gap-2 rounded-xl border border-line-lite bg-night/50 ${big ? 'p-2.5' : 'px-2.5 py-1.5'}`}>
      <Link2 size={13} className="shrink-0 text-brass-soft" />
      <span dir="ltr" className={`min-w-0 flex-1 truncate font-mono ${big ? 'text-[13.5px]' : 'text-[12px]'} text-ivory/85`} data-campaign-link>{url}</span>
      <button
        type="button"
        onClick={copy}
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-bold transition ${done ? 'bg-ok text-[#04170f]' : 'bg-brass/20 text-brass-soft hover:bg-brass/30'}`}
      >
        {done ? <Check size={12} /> : <Copy size={12} />} {done ? 'اتنسخ' : 'انسخ'}
      </button>
    </div>
  );
}

/** فورم إعلان جديد */
function NewCampaign({ onDone }) {
  const [create, { isLoading }] = useCreateCampaignMutation();
  const [f, setF] = useState({ name: '', platform: 'instagram', market: '', spendAmount: '', spendCurrency: 'EGP', landing: '/', code: '' });
  const [err, setErr] = useState('');
  const [made, setMade] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e && e.target ? e.target.value : e }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const r = await create({ ...f, spendAmount: Number(f.spendAmount) || 0, code: f.code.trim() || undefined }).unwrap();
      setMade(r.campaign);
    } catch (x) { setErr(x?.data?.error || 'مانفعش — جرّب تاني.'); }
  }

  if (made) {
    return (
      <Panel title="اللينك جاهز ✓" subtitle="حطه في الإعلان بدل لينك الموقع العادي">
        <CopyLink code={made.code} big />
        <p className="mt-3 text-[12px] leading-relaxed text-ivory/55">
          أي شخص حقيقي يفتح الموقع من اللينك ده بيتحسب على «{made.name}». ولو سجّل في خلال 30 يوم (حتى لو رجع بعدها لوحده)، بيتحسب على الإعلان ده.
          زياراتك إنت ومراجعة إنستجرام للإعلان مابتتحسبش — ولما الإعلان يشتغل فعلًا، حط يوم بدايته من «الأرقام بتتحسب من يوم».
        </p>
        <div className="mt-4 flex gap-2"><Btn tone="gold" onClick={onDone}>تمام</Btn></div>
      </Panel>
    );
  }

  return (
    <Panel title="لينك إعلان جديد" action={<button type="button" onClick={onDone} className="text-ivory/50 hover:text-ivory"><X size={16} /></button>}>
      <form onSubmit={submit} className="space-y-4" data-campaign-form>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم الإعلان (ليك إنت بس)" placeholder="مثلًا: إنستجرام مصر — فيديو الظرف" value={f.name} onChange={set('name')} maxLength={80} required />
          <Field label="البلد / السوق" placeholder="مصر، السعودية..." value={f.market} onChange={set('market')} maxLength={40} />
        </div>
        <div>
          <div className="mb-1.5 text-[12px] text-ivory/55">المنصة</div>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <button key={p.id} type="button" onClick={() => set('platform')(p.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${f.platform === p.id ? 'border-brass bg-brass/15 text-brass-soft' : 'border-line-lite text-ivory/60 hover:text-ivory'}`}>
                <p.icon size={13} /> {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="صرفت عليه قد إيه؟ (اختياري — تقدر تكتبه بعدين)" type="number" min="0" step="any" placeholder="1400" className="money" value={f.spendAmount} onChange={set('spendAmount')} />
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-ivory/55">العملة</span>
            <div className="flex rounded-xl border border-line-lite p-1">
              {['EGP', 'USD'].map((c) => (
                <button key={c} type="button" onClick={() => set('spendCurrency')(c)}
                  className={`flex-1 rounded-lg py-1.5 text-[12.5px] font-bold ${f.spendCurrency === c ? 'bg-brass text-[#241608]' : 'text-ivory/60'}`}>
                  {c === 'EGP' ? 'جنيه' : 'دولار'}
                </button>
              ))}
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-ivory/55">اللينك يودّي على</span>
            <select value={f.landing} onChange={set('landing')} className="rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[13.5px] text-ivory focus:border-brass/60 focus:outline-none">
              {LANDINGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </label>
        </div>
        <Field
          label="كود اللينك (اختياري)"
          hint={`لو سبته فاضي هيتعمل لوحده. مثال: ig-egypt ← ${window.location.host}/go/ig-egypt`}
          dir="ltr" placeholder="ig-egypt" value={f.code} onChange={(e) => set('code')(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} maxLength={40}
        />
        {err && <p className="rounded-xl bg-error/10 px-3.5 py-2.5 text-[12.5px] text-error">{err}</p>}
        <Btn tone="gold" type="submit" loading={isLoading} icon={Plus} onClick={submit}>اعمل اللينك</Btn>
      </form>
    </Panel>
  );
}

const STATUS = {
  paid: { label: 'دفع ✓', tone: 'ok' },
  receipt: { label: 'رفع إيصال — مستني تأكيدك', tone: 'warn' },
  ordered: { label: 'اختار باقة ومادفعش', tone: 'muted' },
  signed: { label: 'سجّل بس', tone: 'muted' },
};

/** تفاصيل إعلان: يوم بيوم + الناس */
function CampaignDetail({ id }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetCampaignQuery(id);
  const [filter, setFilter] = useState('all');
  if (isLoading || !data) return <Spinner />;
  const people = data.people || [];
  const counts = people.reduce((a, p) => { a[p.status] = (a[p.status] || 0) + 1; return a; }, {});
  const shown = filter === 'all' ? people
    : filter === 'unpaid' ? people.filter((p) => p.status !== 'paid')
      : people.filter((p) => p.status === filter);

  return (
    <div className="space-y-5" data-campaign-detail={id}>
      <div>
        <div className="mb-2 text-[12.5px] font-bold text-ivory/70">آخر 30 يوم — يوم بيوم</div>
        <AreaTrend
          data={data.daily}
          height={200}
          keys={[
            { key: 'visitors', label: 'دخلوا', color: COLORS.GOLD_SOFT },
            { key: 'signups', label: 'سجّلوا', color: COLORS.EMERALD },
            { key: 'payers', label: 'دفعوا', color: COLORS.ROSE },
          ]}
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[12.5px] font-bold text-ivory/70">اللي سجّلوا من الإعلان ده ({fmtNum(people.length)})</div>
          <div className="flex flex-wrap gap-1">
            {[
              ['all', `الكل ${people.length}`],
              ['paid', `دفعوا ${counts.paid || 0}`],
              ['receipt', `رفعوا إيصال ${counts.receipt || 0}`],
              ['unpaid', `مادفعوش ${people.length - (counts.paid || 0)}`],
            ].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} data-people-filter={k}
                className={`rounded-full px-3 py-1 text-[11.5px] font-bold ${filter === k ? 'bg-brass text-[#241608]' : 'bg-ivory/[0.06] text-ivory/60 hover:text-ivory'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {shown.length === 0 ? (
          <Empty>{people.length ? 'مفيش حد في القايمة دي.' : 'لسه محدش سجّل من الإعلان ده.'}</Empty>
        ) : (
          <div className="divide-y divide-line-lite overflow-hidden rounded-xl border border-line-lite">
            {shown.map((u) => {
              const wa = waLink(u.phone, u.country);
              const st = STATUS[u.status];
              return (
                <div key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3.5 py-2.5 text-[12.5px]" data-person={u.status}>
                  <button type="button" onClick={() => dispatch(openUser(u.id))} className="min-w-[140px] flex-1 text-start">
                    <div className="font-bold text-ivory hover:text-brass-soft">{u.name || u.email}</div>
                    <div className="text-[11px] text-ivory/40" dir="ltr">{u.email}</div>
                  </button>
                  <span className="text-[11.5px] text-ivory/50">{countryName(u.country)}</span>
                  <span className="text-[11.5px] text-ivory/45">سجّل {fmtDate(u.signedUpAt)}</span>
                  <Badge tone={st.tone}>{st.label}</Badge>
                  {u.status === 'paid' && (
                    <span className="font-bold text-brass-soft">
                      {[u.amount.EGP ? fmtMoney(u.amount.EGP, 'EGP') : '', u.amount.USD ? fmtMoney(u.amount.USD, 'USD') : '', u.amount.SAR ? fmtMoney(u.amount.SAR, 'SAR') : '', u.amount.EUR ? fmtMoney(u.amount.EUR, 'EUR') : ''].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {u.invitations > 0 && <span className="text-[11px] text-ivory/40">{u.invitations} دعوة</span>}
                  {wa && u.status !== 'paid' && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[#25d366]/15 px-2.5 py-1 text-[11px] font-bold text-[#4fe08a] hover:bg-[#25d366]/25">
                      <MessageCircle size={11} /> كلّمه
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-[11px] text-ivory/35">بيتحسب اللي سجّل حساب جديد في خلال 30 يوم من ما دخل من اللينك. اللي كان عنده حساب قبل كده مش بيتحسب كتسجيل جديد.</p>
      </div>

      <HitLog hits={data.hits || []} />
    </div>
  );
}

const SRC = { instagram: 'من جوه إنستجرام', facebook: 'من جوه فيسبوك', tiktok: 'من جوه تيك توك', snapchat: 'من جوه سناب', browser: 'متصفح' };
const HIT = {
  counted: { label: 'اتحسب ✓ — شخص فتح الصفحة فعلًا', tone: 'ok' },
  pending: { label: 'ماتحسبش — فتح وقفل على طول', tone: 'muted' },
  prefetch: { label: 'ماتحسبش — تحميل مسبق / مراجعة إنستجرام', tone: 'warn' },
  bot: { label: 'ماتحسبش — برنامج آلي أو معاينة لينك', tone: 'danger' },
  owner: { label: 'ماتحسبش — ده إنت (جهازك)', tone: 'gold' },
};

/** سجل كل مرة اللينك اتفتح — عشان المالك يشوف الأرقام جت منين */
function HitLog({ hits }) {
  const [all, setAll] = useState(false);
  if (!hits.length) return null;
  const shown = all ? hits : hits.slice(0, 15);
  const DevIcon = (d) => (d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone);
  return (
    <div data-hit-log>
      <div className="mb-2 text-[12.5px] font-bold text-ivory/70">كل مرة اللينك اتفتح ({fmtNum(hits.length)}{hits.length >= 300 ? '+' : ''})</div>
      <div className="divide-y divide-line-lite overflow-hidden rounded-xl border border-line-lite">
        {shown.map((h, i) => {
          const st = HIT[h.status] || HIT.pending;
          const D = DevIcon(h.device);
          return (
            <div key={i} className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 text-[12px] ${h.beforeStart ? 'opacity-45' : ''}`} data-hit={h.status}>
              <span className="w-[150px] shrink-0 text-ivory/60">{fmtDate(h.at, true)}</span>
              <span className="inline-flex items-center gap-1 text-ivory/55"><D size={12} /> {SRC[h.src] || 'متصفح'}</span>
              <Badge tone={st.tone}>{st.label}</Badge>
              {h.beforeStart && <span className="text-[11px] text-ivory/40">(قبل يوم بداية الإعلان — مش داخل في الحساب)</span>}
            </div>
          );
        })}
      </div>
      {hits.length > 15 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 text-[12px] font-bold text-brass-soft hover:text-brass">
          {all ? 'اعرض أقل' : `اعرض الكل (${fmtNum(hits.length)})`}
        </button>
      )}
    </div>
  );
}

/** اللي اتشال من العدّ وليه */
function Filtered({ f }) {
  if (!f) return null;
  const parts = [
    f.pending ? `${fmtNum(f.pending)} فتحوا وقفلوا على طول` : '',
    f.prefetch ? `${fmtNum(f.prefetch)} تحميل مسبق / مراجعة إنستجرام` : '',
    f.bot ? `${fmtNum(f.bot)} برامج آلية ومعاينة لينك` : '',
    f.owner ? `${fmtNum(f.owner)} مرة إنت فتحته` : '',
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-ivory/[0.04] px-3 py-2 text-[11.5px] leading-relaxed text-ivory/55" data-filtered>
      <ShieldCheck size={13} className="mt-0.5 shrink-0 text-ok" />
      <span>مااتحسبوش (عشان الرقم يبقى ناس حقيقية بس): {parts.join(' · ')}</span>
    </p>
  );
}

/** من إمتى الأرقام بتتحسب */
/** اللينك بيودّي على أنهي صفحة — يتغيّر في أي وقت (اللينك نفسه مبيتغيّرش) */
function LandingPicker({ c }) {
  const [update, { isLoading }] = useUpdateCampaignMutation();
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ivory/60" data-landing>
      <Link2 size={13} className="text-brass-soft" />
      <span>اللينك بيودّي على:</span>
      <div className="flex flex-wrap gap-1">
        {LANDINGS.map((l) => (
          <button
            key={l.id}
            type="button"
            disabled={isLoading}
            data-landing-option={l.id}
            onClick={() => { if (c.landing !== l.id) update({ id: c.id, landing: l.id }); }}
            className={`rounded-full px-3 py-1 text-[11.5px] font-bold transition disabled:opacity-50 ${c.landing === l.id ? 'bg-brass text-[#241608]' : 'bg-ivory/[0.06] text-ivory/60 hover:text-ivory'}`}
          >
            {c.landing === l.id ? '✓ ' : ''}{l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StartDate({ c }) {
  const [update, { isLoading }] = useUpdateCampaignMutation();
  const [edit, setEdit] = useState(false);
  const toKey = (d) => {
    const x = new Date(d);
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(x);
    return p;
  };
  const [val, setVal] = useState(toKey(c.startedAt));
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ivory/60" data-start-date>
      <CalendarDays size={13} className="text-brass-soft" />
      <span>الأرقام بتتحسب من يوم <b className="text-ivory">{fmtDate(c.startedAt)}</b></span>
      {!edit ? (
        <button type="button" onClick={() => setEdit(true)} className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brass-soft hover:text-brass">
          <Pencil size={11} /> غيّره ليوم ما الإعلان اشتغل
        </button>
      ) : (
        <>
          <input type="date" value={val} onChange={(e) => setVal(e.target.value)} data-start-input
            className="rounded-lg border border-line-lite bg-night/60 px-2 py-1 text-[12.5px] text-ivory focus:border-brass/60 focus:outline-none" />
          <Btn size="sm" tone="gold" loading={isLoading} onClick={async () => { await update({ id: c.id, startedAt: val }); setEdit(false); }}>احفظ</Btn>
          <Btn size="sm" onClick={() => setEdit(false)}>إلغاء</Btn>
          <span className="w-full text-[11px] text-ivory/40">أي حاجة قبل اليوم ده (مراجعة إنستجرام للإعلان، تجربتك للينك) مش بتدخل في الحساب.</span>
        </>
      )}
    </div>
  );
}

function SpendEditor({ c, onClose }) {
  const [update, { isLoading }] = useUpdateCampaignMutation();
  const [amount, setAmount] = useState(String(c.spend.amount || ''));
  const [cur, setCur] = useState(c.spend.currency);
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl bg-ivory/[0.04] p-3">
      <Field label="صرفت قد إيه" type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32 money" />
      <div className="flex rounded-xl border border-line-lite p-1">
        {['EGP', 'USD'].map((x) => (
          <button key={x} type="button" onClick={() => setCur(x)} className={`rounded-lg px-3 py-1.5 text-[12px] font-bold ${cur === x ? 'bg-brass text-[#241608]' : 'text-ivory/60'}`}>{x === 'EGP' ? 'جنيه' : 'دولار'}</button>
        ))}
      </div>
      <Btn tone="gold" size="sm" loading={isLoading} onClick={async () => { await update({ id: c.id, spendAmount: Number(amount) || 0, spendCurrency: cur }); onClose(); }}>احفظ</Btn>
      <Btn size="sm" onClick={onClose}>إلغاء</Btn>
    </div>
  );
}

function CampaignCard({ c, rate, open, onToggle }) {
  const [update, { isLoading: archiving }] = useUpdateCampaignMutation();
  const [editSpend, setEditSpend] = useState(false);
  const s = c.stats;
  const m = money(c, rate);
  const P = platformOf(c.platform);
  const max = Math.max(1, s.visitors);
  const steps = [
    { key: 'visitors', label: 'دخلوا فعلًا', n: s.visitors, sub: `فتحوا اللينك ${fmtNum(s.clicks)} مرة`, icon: Eye },
    { key: 'signups', label: 'سجّلوا', n: s.signups, sub: `${pct(s.signups, s.visitors)}% من اللي دخلوا`, icon: Users },
    { key: 'payers', label: 'دفعوا', n: s.payers, sub: `${pct(s.payers, s.signups)}% من اللي سجّلوا`, icon: Crown },
  ];

  return (
    <section className={`rounded-2xl border bg-panel ${c.archived ? 'border-line-lite opacity-70' : 'border-line-lite'}`} data-campaign={c.code}>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brass/15 text-brass-soft"><P.icon size={15} /></span>
              <h3 className="font-serif text-[16.5px] font-bold text-ivory">{c.name}</h3>
              {c.market && <Badge tone="gold">{c.market}</Badge>}
              {c.archived && <Badge>مقفول</Badge>}
            </div>
            <div className="mt-1 text-[11.5px] text-ivory/40">{P.label} · اتعمل {fmtDate(c.createdAt)}</div>
          </div>
          <div className="flex gap-1.5">
            <Btn size="sm" icon={c.archived ? ArchiveRestore : Archive} loading={archiving} onClick={() => update({ id: c.id, archived: !c.archived })}>
              {c.archived ? 'رجّعه' : 'اقفله'}
            </Btn>
          </div>
        </div>

        <CopyLink code={c.code} />

        {/* القمع: دخلوا ← سجّلوا ← دفعوا */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((st, i) => (
            <div key={st.key} className="rounded-xl bg-ivory/[0.04] p-3" data-funnel={st.key}>
              <div className="flex items-center justify-between text-[11.5px] text-ivory/50">
                <span className="inline-flex items-center gap-1.5"><st.icon size={12} /> {st.label}</span>
                <span>{st.sub}</span>
              </div>
              <div className="mt-1 font-serif text-[26px] font-bold leading-tight text-ivory">{fmtNum(st.n)}</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ivory/[0.06]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${st.n ? Math.max(3, (st.n / max) * 100) : 0}%` }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  className={`h-full rounded-full ${i === 2 ? 'bg-gradient-to-l from-brass to-brass-soft' : 'bg-gradient-to-l from-emerald to-emerald-bright'}`} />
              </div>
            </div>
          ))}
        </div>

        <Filtered f={s.filtered} />
        <LandingPicker c={c} />
        <StartDate c={c} />

        {s.pendingReceipts > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brass/10 px-3 py-1.5 text-[11.5px] font-bold text-brass-soft">
            <Clock size={12} /> {fmtNum(s.pendingReceipts)} رفعوا إيصال ومستنيين تأكيدك
          </p>
        )}

        {/* الفلوس */}
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-ivory/[0.04] p-3">
            <div className="text-[11.5px] text-ivory/50">دخل فلوس</div>
            <div className="mt-1 font-bold text-brass-soft" data-campaign-revenue>
              {s.revenue.EGP || s.revenue.USD || s.revenue.SAR || s.revenue.EUR
                ? [s.revenue.EGP ? fmtMoney(s.revenue.EGP, 'EGP') : '', s.revenue.USD ? fmtMoney(s.revenue.USD, 'USD') : '', s.revenue.SAR ? fmtMoney(s.revenue.SAR, 'SAR') : '', s.revenue.EUR ? fmtMoney(s.revenue.EUR, 'EUR') : ''].filter(Boolean).join(' + ')
                : '—'}
            </div>
            <div className="text-[10.5px] text-ivory/35">{fmtNum(s.orders)} باقة اتباعت</div>
          </div>
          <div className="rounded-xl bg-ivory/[0.04] p-3">
            <div className="flex items-center justify-between text-[11.5px] text-ivory/50">
              <span>صرفت</span>
              <button type="button" onClick={() => setEditSpend((v) => !v)} className="text-ivory/40 hover:text-brass-soft" title="عدّل المبلغ"><Pencil size={11} /></button>
            </div>
            <div className="mt-1 font-bold text-ivory">{c.spend.amount ? fmtMoney(c.spend.amount, c.spend.currency) : <span className="text-ivory/35">اكتبه ←</span>}</div>
          </div>
          <div className="rounded-xl bg-ivory/[0.04] p-3">
            <div className="text-[11.5px] text-ivory/50">تكلفة العميل اللي دفع</div>
            <div className="mt-1 font-bold text-ivory">{m.perPayer != null ? fmtMoney(Math.round(m.perPayer), 'EGP') : '—'}</div>
            <div className="text-[10.5px] text-ivory/35">{m.perSignup != null ? `والتسجيل الواحد ${fmtMoney(Math.round(m.perSignup), 'EGP')}` : ''}</div>
          </div>
          <div className={`rounded-xl p-3 ${!c.spend.amount ? 'bg-ivory/[0.04]' : m.profit >= 0 ? 'bg-ok/10' : 'bg-error/10'}`} data-campaign-profit>
            <div className="text-[11.5px] text-ivory/50">{!c.spend.amount ? 'المكسب' : m.profit >= 0 ? 'كسبان' : 'لسه خسران'}</div>
            <div className={`mt-1 inline-flex items-center gap-1 font-bold ${!c.spend.amount ? 'text-ivory/35' : m.profit >= 0 ? 'text-ok' : 'text-error'}`}>
              {c.spend.amount ? (m.profit >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />) : null}
              {c.spend.amount ? fmtMoney(Math.round(Math.abs(m.profit)), 'EGP') : 'اكتب صرفت كام'}
            </div>
            {m.roas != null && <div className="text-[10.5px] text-ivory/45">كل جنيه صرفته رجّع {m.roas.toFixed(1)} جنيه</div>}
          </div>
        </div>
        {editSpend && <div className="mt-3"><SpendEditor c={c} onClose={() => setEditSpend(false)} /></div>}

        <button type="button" onClick={onToggle} data-campaign-open={c.code}
          className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brass-soft hover:text-brass">
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          {open ? 'اخفي التفاصيل' : `مين سجّل ومين دفع + يوم بيوم`}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="border-t border-line-lite p-5"><CampaignDetail id={c.id} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function CampaignsPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const { data, isLoading, isFetching } = useGetCampaignsQuery(undefined, { pollingInterval: 60000 });
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [rate, setRate] = useState(readRate);
  const [sarRate, setSarRate] = useState(readSarRate);
  const [eurRate, setEurRate] = useState(readEurRate);
  const all = data?.campaigns || [];
  const list = all.filter((c) => showArchived || !c.archived);
  const archivedCount = all.filter((c) => c.archived).length;

  const tot = useMemo(() => {
    const t = { visitors: 0, signups: 0, payers: 0, revenue: 0, spend: 0, clicks: 0 };
    list.forEach((c) => {
      const m = money(c, rate);
      t.visitors += c.stats.visitors; t.signups += c.stats.signups; t.payers += c.stats.payers;
      t.clicks += c.stats.clicks; t.revenue += m.revenue; t.spend += m.spend;
    });
    return t;
  }, [list, rate]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 font-serif text-[21px] font-bold text-ivory"><Target size={19} className="text-brass-soft" /> الإعلانات</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            لينك لكل إعلان — وتعرف كل إعلان جاب كام زيارة، كام سجّل، مين دفع، وكسبت ولا خسرت.{isFetching && ' · بيحدّث...'}
          </p>
        </div>
        {!creating && <Btn tone="gold" icon={Plus} onClick={() => setCreating(true)}>لينك إعلان جديد</Btn>}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-ok/25 bg-ok/[0.06] px-4 py-3 text-[12px] leading-relaxed text-ivory/70">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ok" />
        <div>
          <b className="text-ivory">إزاي بنعدّ:</b> الشخص بيتحسب بس لما يفتح الصفحة فعلًا ويفضل عليها (مش مجرد إن اللينك اتفتح).
          مراجعة إنستجرام وفيسبوك للإعلان، والتحميل المسبق، والبرامج الآلية، وجهازك إنت — بيتسجّلوا في السجل بس ومابيتحسبوش.
          ومن يوم ما تحدده إن الإعلان اشتغل.
        </div>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <NewCampaign onDone={() => setCreating(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? <Spinner label="بنجمّع أرقام الإعلانات..." /> : all.length === 0 && !creating ? (
        <Panel>
          <div className="py-6 text-center">
            <Target size={28} className="mx-auto text-brass-soft" />
            <p className="mt-3 font-bold text-ivory">لسه معملتش لينك إعلان</p>
            <p className="mx-auto mt-1 max-w-md text-[12.5px] leading-relaxed text-ivory/50">
              اعمل لينك لكل إعلان (مثلًا واحد لمصر وواحد للسعودية) وحطه في الإعلان. هتعرف كل واحد جاب مين ودفع مين.
            </p>
            <Btn tone="gold" icon={Plus} className="mt-4" onClick={() => setCreating(true)}>اعمل أول لينك</Btn>
          </div>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile icon={Eye} label="دخلوا من الإعلانات" value={fmtNum(tot.visitors)} hint={`${fmtNum(tot.clicks)} ضغطة`} />
            <StatTile icon={Users} label="سجّلوا" value={fmtNum(tot.signups)} hint={`${pct(tot.signups, tot.visitors)}%`} />
            <StatTile icon={Crown} tone="ok" label="دفعوا" value={fmtNum(tot.payers)} hint={`${pct(tot.payers, tot.signups)}%`} />
            <StatTile icon={Wallet} tone="gold" label="دخل فلوس (بالجنيه)" value={fmtMoney(Math.round(tot.revenue), 'EGP')} hint={tot.spend ? `صرفت ${fmtMoney(Math.round(tot.spend), 'EGP')}` : ''} />
            <StatTile
              icon={tot.revenue - tot.spend >= 0 ? TrendingUp : TrendingDown}
              tone={!tot.spend ? 'default' : tot.revenue - tot.spend >= 0 ? 'ok' : 'danger'}
              label={!tot.spend ? 'المكسب (اكتب الصرف)' : tot.revenue - tot.spend >= 0 ? 'كسبان' : 'لسه خسران'}
              value={tot.spend ? fmtMoney(Math.round(Math.abs(tot.revenue - tot.spend)), 'EGP') : '—'}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-lite bg-panel px-4 py-3">
            <label className="flex items-center gap-2 text-[12px] text-ivory/60">
              <MousePointerClick size={13} /> سعر الدولار بالجنيه (للحساب بس):
              <input
                type="number" min="1" step="any" value={rate} data-usd-rate
                onChange={(e) => { const n = Number(e.target.value) || 0; setRate(n); try { if (n > 0) localStorage.setItem(RATE_KEY, String(n)); } catch { /* */ } }}
                className="w-20 rounded-lg border border-line-lite bg-night/60 px-2 py-1 text-center text-[12.5px] text-ivory focus:border-brass/60 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[12px] text-ivory/60">
              سعر الريال بالجنيه:
              <input
                type="number" min="0.1" step="any" value={sarRate} data-sar-rate
                onChange={(e) => { const n = Number(e.target.value) || 0; setSarRate(n); try { if (n > 0) localStorage.setItem(SAR_RATE_KEY, String(n)); } catch { /* */ } }}
                className="w-20 rounded-lg border border-line-lite bg-night/60 px-2 py-1 text-center text-[12.5px] text-ivory focus:border-brass/60 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[12px] text-ivory/60">
              سعر اليورو بالجنيه:
              <input
                type="number" min="0.1" step="any" value={eurRate} data-eur-rate
                onChange={(e) => { const n = Number(e.target.value) || 0; setEurRate(n); try { if (n > 0) localStorage.setItem(EUR_RATE_KEY, String(n)); } catch { /* */ } }}
                className="w-20 rounded-lg border border-line-lite bg-night/60 px-2 py-1 text-center text-[12.5px] text-ivory focus:border-brass/60 focus:outline-none"
              />
            </label>
            {archivedCount > 0 && (
              <button type="button" onClick={() => setShowArchived((v) => !v)} className="text-[12px] font-bold text-ivory/55 hover:text-ivory">
                {showArchived ? 'اخفي المقفولة' : `ورّيني المقفولة (${archivedCount})`}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {list.map((c) => (
              <CampaignCard key={c.id} c={c} rate={rate} open={openId === c.id} onToggle={() => setOpenId((x) => (x === c.id ? null : c.id))} />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
    </div>
  );
}
