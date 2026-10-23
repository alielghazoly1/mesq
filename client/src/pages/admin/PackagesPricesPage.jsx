// صفحة "الباقات والأسعار" — كل حاجة تخص سعر الباقة في مكان واحد:
// سعر كل باقة بكل عملة، تشغيلها أو قفلها، والخصم اللي عليها — ومعاه
// السعر بعد الخصم بالظبط زي ما العميل هيشوفه، وإنت بتكتب.
//
// قواعد مهمة:
//   • خانة السعر الفاضية = السعر الأصلي المكتوب في الكود (packages/registry.js).
//   • الخصم لكل باقة لوحدها. "طبّق على كل الباقات" بيملا الخانات بس — وبيسيب
//     باقة الدعوة الواحدة (أرخص باقة) إلا لو حطيت لها خصم بإيدك.
//   • مفتاح "الخصومات شغالة" بيوقف كل الخصومات مرة واحدة من غير ما يمسح النسب.
//   • زرار حفظ واحد: الأسعار والخصومات بيتحفظوا مع بعض في كتابة واحدة.
//   • الحساب هنا نفس حساب السيرفر بالظبط (utils/pricing.js) — المعاينة صادقة.
//   • التغيير بيبان للعملاء خلال ثواني من الحفظ.
import { useEffect, useMemo, useState } from 'react';
import {
  Save, Check, RotateCcw, Power, AlertTriangle, MapPin, BadgePercent, CalendarClock,
  Wand2, Eraser, Undo2, Eye, Tag, Info,
} from 'lucide-react';
import { useGetPricingQuery, useSavePricingMutation } from '../../store/adminApi.js';
import { Panel, Btn, Spinner, Badge, fmtDate } from '../../components/admin/ui.jsx';

const CURS = [
  { id: 'EGP', label: 'مصر', unit: 'ج.م' },
  { id: 'SAR', label: 'السعودية', unit: 'ر.س' },
  { id: 'EUR', label: 'دول اليورو', unit: '€' },
  { id: 'USD', label: 'باقي الدول', unit: '$' },
];
const QUICK = [10, 15, 20, 25, 30, 50];

/** نفس utils/pricing.js: التقريب لأقرب 5 جنيه / 1 لباقي العملات */
function roundPrice(value, currency) {
  const step = currency === 'EGP' ? 5 : 1;
  return Math.max(0, Math.round(value / step) * step);
}
function afterDiscount(list, pct, currency) {
  return pct > 0 ? roundPrice(list * (1 - pct / 100), currency) : list;
}

/** الخانة صالحة؟ فاضية (= الأصلي) أو رقم صحيح من 1 للحد الأقصى */
function priceError(value, max) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  if (!Number.isInteger(n)) return 'رقم صحيح من غير كسور';
  if (n < 1) return 'السعر لازم يبقى 1 أو أكتر';
  if (n > max) return 'رقم كبير جدًا';
  return '';
}
function discountError(value) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  if (!Number.isInteger(n)) return 'رقم صحيح من غير كسور';
  if (n < 0 || n > 90) return 'من 0 لـ 90%';
  return '';
}
const pctOf = (v) => (discountError(v) || v === '' ? 0 : Number(v));

/** النهارده بتوقيت مصر "YYYY-MM-DD" */
function cairoToday() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
const fmt = (n) => Number(n || 0).toLocaleString('en-US');

function fromData(data) {
  const rows = {};
  data.packages.forEach((p) => {
    rows[p.id] = {
      EGP: p.EGP.custom ? String(p.EGP.custom) : '',
      USD: p.USD.custom ? String(p.USD.custom) : '',
      SAR: p.SAR.custom ? String(p.SAR.custom) : '',
      EUR: p.EUR.custom ? String(p.EUR.custom) : '',
      enabled: p.enabled,
      discount: p.discount ? String(p.discount) : '',
    };
  });
  return {
    rows,
    enabled: !!data.discount.enabled,
    labelAr: data.discount.labelAr || '',
    labelEn: data.discount.labelEn || '',
    endsDay: data.discount.endsDay || '',
  };
}

function PriceInput({ label, unit, value, def, max, onChange }) {
  const err = priceError(value, max);
  const custom = value !== '' && Number(value) !== def;
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-[12px] text-ivory/55">
        {label}
        {custom && !err && (
          <button type="button" onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brass-soft/80 hover:text-brass-soft">
            <RotateCcw size={11} /> الأصلي ({def})
          </button>
        )}
      </span>
      <div className={`flex items-center rounded-xl border bg-night/60 transition focus-within:border-brass/60 ${
        err ? 'border-error/70' : custom ? 'border-brass/45' : 'border-line-lite'
      }`}
      >
        <input
          type="number" inputMode="numeric" min={1} max={max} step={1} dir="ltr"
          value={value}
          placeholder={def ? String(def) : 'مفيش سعر افتراضي'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent px-3.5 py-2.5 text-[16px] font-bold text-ivory placeholder:font-normal placeholder:text-ivory/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="shrink-0 pe-3.5 text-[12px] font-bold text-ivory/45">{unit}</span>
      </div>
      {err && <span className="text-[11px] font-bold text-error">{err}</span>}
    </label>
  );
}

/** خانة الخصم + أزرار سريعة */
function DiscountInput({ value, onChange, id }) {
  const err = discountError(value);
  const n = pctOf(value);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className={`flex w-[112px] items-center rounded-xl border bg-night/60 transition focus-within:border-rose/60 ${
          err ? 'border-error/70' : n > 0 ? 'border-rose/50' : 'border-line-lite'
        }`}
        >
          <input
            type="number" inputMode="numeric" min={0} max={90} step={1} dir="ltr"
            data-discount-input={id}
            value={value}
            placeholder="0"
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-w-0 bg-transparent px-3 py-2 text-[16px] font-bold text-ivory placeholder:font-normal placeholder:text-ivory/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="shrink-0 pe-3 text-[13px] font-bold text-ivory/45">%</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => onChange(String(q))}
              className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold transition ${
                n === q ? 'bg-rose text-white' : 'bg-ivory/[0.07] text-ivory/60 hover:bg-ivory/[0.13] hover:text-ivory'
              }`}
            >
              {q}%
            </button>
          ))}
          {n > 0 && (
            <button type="button" onClick={() => onChange('')} data-discount-clear={id}
              className="rounded-full border border-line-lite px-2.5 py-1 text-[11.5px] font-bold text-ivory/55 hover:text-ivory">
              من غير خصم
            </button>
          )}
        </div>
      </div>
      {err && <p className="mt-1.5 text-[11px] font-bold text-error">{err}</p>}
    </div>
  );
}

/** كارت صغير زي اللي العميل بيشوفه في صفحة الباقات بالظبط (سعر + شارة) */
function CustomerPreview({ name, price, list, unit, badge }) {
  return (
    <div data-customer-preview className="rounded-2xl border border-[#e5dccb] bg-[#fbf7ef] p-3.5 text-[#1d2b24] shadow-[0_10px_30px_-18px_rgba(0,0,0,.6)]">
      <div className="mb-2 flex min-h-[20px] flex-wrap items-center gap-1.5">
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#c2185b]/12 px-2 py-0.5 text-[10.5px] font-extrabold text-[#b0124f]">
            <BadgePercent size={11} /> {badge}
          </span>
        )}
      </div>
      <div className="font-serif text-[14.5px] font-bold">{name}</div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-serif text-[26px] font-bold leading-none text-[#0f5b44]">{fmt(price)}</span>
        <span className="text-[12.5px] text-[#55625b]">{unit}</span>
        {list > price && <span className="text-[14px] text-[#55625b]/70 line-through">{fmt(list)}</span>}
      </div>
    </div>
  );
}

export default function PackagesPricesPage() {
  const { data, isLoading } = useGetPricingQuery();
  const [save, { isLoading: saving }] = useSavePricingMutation();
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [bulk, setBulk] = useState('20');
  const max = data?.maxPrice || 1000000;

  useEffect(() => {
    if (!data || dirty) return;
    setForm(fromData(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // سايب تعديلات من غير حفظ؟ المتصفح يسألك قبل ما تقفل الصفحة
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const packages = useMemo(() => data?.packages || [], [data]);

  function touch() { setDirty(true); setSaved(false); setError(''); }
  function updateRow(id, patch) {
    setForm((f) => ({ ...f, rows: { ...f.rows, [id]: { ...f.rows[id], ...patch } } }));
    touch();
  }
  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); touch(); }
  function applyAll(value) {
    setForm((f) => {
      const rows = { ...f.rows };
      packages.forEach((p) => {
        if (p.noDiscount && value !== '') return; // أرخص باقة: بإيدك بس
        rows[p.id] = { ...rows[p.id], discount: value };
      });
      return { ...f, rows };
    });
    touch();
  }
  function undo() { setForm(fromData(data)); setDirty(false); setError(''); }

  if (isLoading || !form) return <Spinner />;

  const today = cairoToday();
  const expired = !!form.endsDay && form.endsDay < today;
  const live = form.enabled && !expired; // الخصومات بتظهر للعملاء دلوقتي؟

  const view = packages.map((p) => {
    const r = form.rows[p.id];
    const egyptOnly = p.countries.length === 1 && p.countries[0] === 'EG';
    const pct = pctOf(r.discount);
    const curs = CURS.filter((c) => (egyptOnly ? c.id === 'EGP' : true)).map((c) => {
      const raw = r[c.id];
      const list = raw !== '' && raw != null && !priceError(raw, max) ? Number(raw) : p[c.id].def;
      return { ...c, list, final: afterDiscount(list, pct, c.id), now: afterDiscount(list, live ? pct : 0, c.id) };
    }).filter((c) => c.list > 0);
    return { p, r, egyptOnly, pct, curs };
  });

  const hasErrors = view.some(({ r }) => ['EGP', 'USD', 'SAR', 'EUR'].some((c) => priceError(r[c], max)) || discountError(r.discount));
  const zeroAfter = view.some(({ curs, pct }) => pct > 0 && curs.some((c) => c.final <= 0));
  const enabledCount = view.filter(({ r }) => r.enabled).length;
  const discounted = view.filter(({ pct, r }) => pct > 0 && r.enabled);
  const badgeFor = (pct) => (pct > 0 ? (form.labelAr || `خصم ${pct}%`) : '');

  async function onSave() {
    if (hasErrors) { setError('في رقم مكتوب غلط — صلّحه الأول (متعلّم بالأحمر).'); return; }
    if (zeroAfter) { setError('في باقة سعرها بعد الخصم بقى صفر — قلّل الخصم.'); return; }
    if (enabledCount === 0) { setError('لازم تفضل باقة واحدة على الأقل شغالة للعملاء.'); return; }
    const prices = {}; const disabled = []; const discounts = {};
    packages.forEach((p) => {
      const r = form.rows[p.id];
      const out = {};
      ['EGP', 'USD', 'SAR', 'EUR'].forEach((c) => { if (r[c] !== '' && r[c] != null) out[c] = Number(r[c]); });
      if (Object.keys(out).length) prices[p.id] = out;
      if (!r.enabled) disabled.push(p.id);
      discounts[p.id] = pctOf(r.discount);
    });
    try {
      await save({
        prices, disabled, discounts,
        enabled: form.enabled, labelAr: form.labelAr, labelEn: form.labelEn, endsDay: form.endsDay || null,
      }).unwrap();
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setError(e?.data?.error || 'حصل خطأ في الحفظ، جرّب تاني.');
    }
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">الباقات والأسعار</h1>
          <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-ivory/45">
            سعر كل باقة والخصم اللي عليها في مكان واحد — وتحت كل باقة السعر بعد الخصم زي ما العميل هيشوفه بالظبط.
            {data?.updatedAt && ` آخر تعديل: ${fmtDate(data.updatedAt, true)}`}
          </p>
        </div>
        <Btn tone="gold" icon={saved && !dirty ? Check : Save} loading={saving} onClick={onSave}
          disabled={!dirty && !saved} data-save-pricing>
          {saved && !dirty ? 'اتحفظ' : 'احفظ'}
        </Btn>
      </div>

      {error && (
        <div data-pricing-error className="flex items-center gap-2 rounded-xl bg-error/15 px-4 py-3 text-[12.5px] font-bold text-error">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ===== العرض: تشغيل الخصومات + ميعاد النهاية + الشارة + تطبيق على الكل ===== */}
      <Panel
        title={(
          <span className="flex items-center gap-2">
            <BadgePercent size={16} className="text-rose" /> الخصومات
          </span>
        )}
        subtitle="حط الخصم على كل باقة في الكارت بتاعها تحت — أو مرة واحدة على الكل من هنا"
      >
        <button
          type="button"
          role="switch"
          aria-checked={form.enabled}
          data-discounts-switch
          onClick={() => setField('enabled', !form.enabled)}
          className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-start transition ${
            live ? 'border-ok/45 bg-ok/[0.07]' : form.enabled ? 'border-error/40 bg-error/[0.06]' : 'border-line-lite bg-night/40'
          }`}
        >
          <span className="min-w-0">
            <span className={`block text-[14px] font-bold ${live ? 'text-ok' : form.enabled ? 'text-error' : 'text-ivory/70'}`}>
              {live ? 'الخصومات شغالة — العملاء شايفينها' : form.enabled ? 'الخصومات واقفة: ميعاد العرض خلص' : 'الخصومات مقفولة'}
            </span>
            <span className="mt-0.5 block text-[11.5px] text-ivory/45">
              {live
                ? (discounted.length ? `${discounted.length} ${discounted.length === 1 ? 'باقة عليها' : 'باقات عليها'} خصم دلوقتي — السعر القديم بيبان مشطوب جنب الجديد` : 'مفيش باقة عليها خصم لسه — حط نسبة في أي باقة تحت')
                : 'العملاء بيشوفوا السعر العادي. النسب اللي ظابطها محفوظة — شغّل وهترجع زي ما هي'}
            </span>
          </span>
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${form.enabled ? 'bg-ok' : 'bg-ivory/15'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.enabled ? 'start-[22px]' : 'start-0.5'}`} />
          </span>
        </button>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line-lite bg-night/30 p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ivory/80">
              <Wand2 size={13} className="text-brass-soft" /> نفس الخصم على كل الباقات
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex w-[100px] items-center rounded-xl border border-line-lite bg-night/60 focus-within:border-brass/60">
                <input type="number" inputMode="numeric" min={0} max={90} dir="ltr" value={bulk} data-bulk-input
                  onChange={(e) => setBulk(e.target.value)}
                  className="w-full min-w-0 bg-transparent px-3 py-2 text-[15px] font-bold text-ivory focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                <span className="pe-3 text-[12px] font-bold text-ivory/45">%</span>
              </div>
              <Btn tone="solid" size="sm" icon={Wand2} data-bulk-apply
                disabled={!!discountError(bulk) || bulk === '' || Number(bulk) === 0}
                onClick={() => applyAll(String(Number(bulk)))}>
                طبّق على الكل
              </Btn>
              <Btn tone="ghost" size="sm" icon={Eraser} data-bulk-clear onClick={() => applyAll('')}>
                شيل الخصم من الكل
              </Btn>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ivory/35">
              باقة الدعوة الواحدة مش بتدخل هنا (هي أرخص باقة) — لو عايز تخصمها، حط لها نسبة في الكارت بتاعها.
            </p>
          </div>

          <div className="rounded-xl border border-line-lite bg-night/30 p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ivory/80">
              <CalendarClock size={13} className="text-brass-soft" /> آخر يوم في العرض (اختياري)
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" value={form.endsDay} min={today} data-ends-day
                onChange={(e) => setField('endsDay', e.target.value)}
                className="rounded-xl border border-line-lite bg-night/60 px-3 py-2 text-[13.5px] text-ivory [color-scheme:dark] focus:border-brass/60 focus:outline-none" />
              {form.endsDay && (
                <Btn tone="ghost" size="sm" onClick={() => setField('endsDay', '')}>من غير ميعاد</Btn>
              )}
            </div>
            <p className={`mt-2 text-[11px] leading-relaxed ${expired ? 'font-bold text-error' : 'text-ivory/35'}`}>
              {expired
                ? 'الميعاد ده عدّى — الخصومات واقفة. غيّره أو امسحه عشان ترجع.'
                : form.endsDay
                  ? `الخصم شغال لحد آخر يوم ${form.endsDay} (12 بالليل بتوقيت مصر) وبعدها بيقف لوحده.`
                  : 'سيبه فاضي والعرض يفضل شغال لحد ما تقفله بإيدك.'}
            </p>
          </div>
        </div>

        <details className="group mt-3 rounded-xl border border-line-lite bg-night/30 p-3.5">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] font-bold text-ivory/80">
            <Tag size={13} className="text-brass-soft" /> كلام الشارة اللي بتظهر جنب السعر
            <span className="ms-auto text-[11px] font-normal text-ivory/40">
              {form.labelAr || form.labelEn ? 'متغيّر' : 'تلقائي: "خصم 20%"'}
            </span>
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-ivory/55">بالعربي</span>
              <input value={form.labelAr} maxLength={60} placeholder="سيبها فاضية = خصم 20%"
                onChange={(e) => setField('labelAr', e.target.value)}
                className="rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[13.5px] text-ivory placeholder:text-ivory/30 focus:border-brass/60 focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-ivory/55">بالإنجليزي</span>
              <input value={form.labelEn} maxLength={60} dir="ltr" placeholder="20% off"
                onChange={(e) => setField('labelEn', e.target.value)}
                className="rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[13.5px] text-ivory placeholder:text-ivory/30 focus:border-brass/60 focus:outline-none" />
            </label>
          </div>
          <p className="mt-2 text-[11px] text-ivory/35">
            الكلام ده بيظهر على كل باقة عليها خصم. لو فاضي بيتكتب لوحده بنسبة كل باقة.
          </p>
        </details>
      </Panel>

      {/* ===== الباقات ===== */}
      <div className="grid gap-4 xl:grid-cols-2">
        {view.map(({ p, r, egyptOnly, pct, curs }) => {
          const main = curs[0];
          return (
            <Panel
              key={p.id}
              className={r.enabled ? '' : 'opacity-75'}
              title={(
                <span className="flex flex-wrap items-center gap-2" data-package-card={p.id}>
                  {p.name}
                  <Badge tone={r.enabled ? 'ok' : 'danger'}>{r.enabled ? 'شغالة' : 'مقفولة'}</Badge>
                  {pct > 0 && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${live ? 'bg-rose/20 text-rose' : 'bg-ivory/10 text-ivory/50'}`}>
                      <BadgePercent size={10} /> خصم {pct}%{!live && ' (مقفول)'}
                    </span>
                  )}
                </span>
              )}
              subtitle={`${p.invitations} ${p.invitations === 1 ? 'دعوة' : p.invitations <= 10 ? 'دعوات' : 'دعوة'} · ${p.nameEn}`}
              action={(
                <button
                  type="button" role="switch" aria-checked={r.enabled}
                  onClick={() => updateRow(p.id, { enabled: !r.enabled })}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition ${
                    r.enabled ? 'border border-error/40 text-error/90 hover:bg-error/10' : 'bg-ok text-[#04170f] hover:brightness-110'
                  }`}
                >
                  <Power size={13} /> {r.enabled ? 'اقفل الباقة' : 'شغّل الباقة'}
                </button>
              )}
            >
              {/* 1) السعر */}
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ivory/35">سعر الباقة</div>
              <div className={`grid gap-3 ${egyptOnly ? 'sm:flex' : 'sm:grid-cols-2'}`}>
                <PriceInput label="مصر" unit="ج.م" value={r.EGP} def={p.EGP.def} max={max} onChange={(v) => updateRow(p.id, { EGP: v })} />
                {egyptOnly ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="text-[12px] text-ivory/55">بره مصر</span>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-line-lite px-3.5 py-2.5 text-[12px] text-ivory/45">
                      <MapPin size={14} className="shrink-0" /> الباقة دي لمصر بس
                    </div>
                  </div>
                ) : (
                  <>
                    <PriceInput label="السعودية" unit="ر.س" value={r.SAR} def={p.SAR.def} max={max} onChange={(v) => updateRow(p.id, { SAR: v })} />
                    <PriceInput label="دول اليورو (فرنسا، ألمانيا…)" unit="€" value={r.EUR} def={p.EUR.def} max={max} onChange={(v) => updateRow(p.id, { EUR: v })} />
                    <PriceInput label="باقي الدول" unit="$" value={r.USD} def={p.USD.def} max={max} onChange={(v) => updateRow(p.id, { USD: v })} />
                  </>
                )}
              </div>

              {/* 2) الخصم */}
              <div className="mt-4 rounded-xl border border-rose/20 bg-rose/[0.04] p-3.5">
                <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-ivory/85">
                  <BadgePercent size={14} className="text-rose" /> الخصم على الباقة دي
                </div>
                <DiscountInput id={p.id} value={r.discount} onChange={(v) => updateRow(p.id, { discount: v })} />
                {p.noDiscount && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-brass-soft/80">
                    <Info size={12} className="mt-0.5 shrink-0" /> دي أرخص باقة في الموقع — أي خصم عليها بيقلّل مكسبك من كل دعوة.
                  </p>
                )}
              </div>

              {/* 3) العميل هيشوف */}
              <div className="mt-4 grid gap-3 2xl:grid-cols-[1fr_200px] 2xl:items-start">
                <div data-price-table={p.id} className="overflow-hidden rounded-xl border border-line-lite">
                  <div className="flex items-center gap-1.5 bg-night/50 px-3.5 py-2 text-[11.5px] font-bold text-ivory/55">
                    <Eye size={13} className="text-brass-soft" /> العميل هيدفع
                  </div>
                  {curs.map((c) => (
                    <div key={c.id} data-cur={c.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-line-lite/60 px-3.5 py-2 text-[12.5px]">
                      <span className="text-ivory/55">{c.label}</span>
                      <span className="flex items-baseline gap-2 whitespace-nowrap">
                        {pct > 0 && <span className="text-[11.5px] text-ivory/35 line-through">{fmt(c.list)}</span>}
                        <span data-final className={`text-[14px] font-extrabold ${pct > 0 ? (live ? 'text-ok' : 'text-ivory/60') : 'text-ivory'}`}>{fmt(c.final)}</span>
                        <span className="text-[11px] text-ivory/40">{c.unit}</span>
                        {pct > 0 && <span className="text-[10.5px] font-bold text-rose/80">يوفّر {fmt(c.list - c.final)}</span>}
                      </span>
                    </div>
                  ))}
                  {pct > 0 && !live && (
                    <div className="border-t border-line-lite/60 bg-error/[0.06] px-3.5 py-2 text-[11px] font-bold text-error/90">
                      الخصم ده مش باين للعملاء دلوقتي — {expired ? 'ميعاد العرض خلص' : 'شغّل "الخصومات" فوق'}. دلوقتي بيدفعوا {fmt(main?.list)} {main?.unit}.
                    </div>
                  )}
                  {!r.enabled && (
                    <div className="border-t border-line-lite/60 bg-error/[0.06] px-3.5 py-2 text-[11px] font-bold text-error/90">
                      الباقة مقفولة — مش هتظهر للعملاء خالص.
                    </div>
                  )}
                </div>
                {main && r.enabled && (
                  <div className="max-w-[260px]">
                    <div className="mb-1.5 text-[10.5px] font-bold text-ivory/35">كده بالظبط في صفحة الباقات</div>
                    <CustomerPreview name={p.name} unit={main.unit} price={main.now} list={main.list} badge={live ? badgeFor(pct) : ''} />
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <p className="text-[11.5px] leading-relaxed text-ivory/40">
        الأسعار بعد الخصم بتتقرّب لأقرب 5 جنيه (أو رقم صحيح في باقي العملات) — نفس اللي العميل بيدفعه بالظبط.
        العملاء اللي دفعوا قبل كده مبيتأثروش بأي تغيير هنا، والطلب المستني اللي لسه مترفعلوش إيصال بياخد السعر الجديد لما العميل يرجع لصفحة الدفع.
      </p>

      {/* شريط الحفظ تحت — بيظهر بس لما يكون فيه تعديل */}
      {dirty && (
        <div data-save-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-brass/30 bg-night/95 px-4 py-3 backdrop-blur lg:bottom-4 lg:left-1/2 lg:right-auto lg:w-[min(680px,90vw)] lg:-translate-x-1/2 lg:rounded-2xl lg:border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[12.5px] font-bold text-brass-soft">عندك تعديلات لسه متحفظتش</span>
            <div className="flex gap-2">
              <Btn tone="ghost" size="sm" icon={Undo2} onClick={undo} data-undo-pricing>تراجع</Btn>
              <Btn tone="gold" size="sm" icon={Save} loading={saving} onClick={onSave} data-save-pricing-bar>احفظ</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
