// صفحة "الباقات والأسعار" — المالك بيحدد سعر كل باقة بنفسه (جنيه ودولار)،
// وبيشغّل أو يقفل أي باقة.
//
// قواعد مهمة:
//   • خانة فاضية = السعر الأصلي المكتوب في الكود (packages/registry.js).
//     يعني الموقع مبيتغيّرش لحد ما إنت تكتب سعر بنفسك.
//   • الباقة المقفولة بتختفي من صفحة الباقات ومحدش يقدر يطلبها — اشتراكات
//     العملاء الحاليين وطلباتهم القديمة مبتتأثرش، وإنت لسه تقدر تمنحها يدويًا.
//   • الخصومات (صفحة الخصومات) بتنطبق على السعر اللي هنا.
//   • التغيير بيبان للعملاء خلال ثواني من الحفظ.
import { useEffect, useMemo, useState } from 'react';
import {
  Save, Check, RotateCcw, Power, AlertTriangle, Globe2, MapPin, BadgePercent,
} from 'lucide-react';
import { useGetPackagePricesQuery, useSavePackagePricesMutation } from '../../store/adminApi.js';
import { Panel, Btn, Spinner, Badge, fmtDate } from '../../components/admin/ui.jsx';

/** الخانة صالحة؟ فاضية (= الأصلي) أو رقم صحيح من 1 للحد الأقصى */
function priceError(value, max) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  if (!Number.isInteger(n)) return 'رقم صحيح من غير كسور';
  if (n < 1) return 'السعر لازم يبقى 1 أو أكتر';
  if (n > max) return 'رقم كبير جدًا';
  return '';
}

function PriceInput({ label, currency, value, def, disabled, max, onChange }) {
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
      } ${disabled ? 'opacity-40' : ''}`}
      >
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          step={1}
          dir="ltr"
          disabled={disabled}
          value={value}
          placeholder={def ? String(def) : 'مفيش سعر افتراضي'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent px-3.5 py-2.5 text-[16px] font-bold text-ivory placeholder:font-normal placeholder:text-ivory/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="shrink-0 pe-3.5 text-[12px] font-bold text-ivory/45">{currency}</span>
      </div>
      {err && <span className="text-[11px] font-bold text-error">{err}</span>}
    </label>
  );
}

export default function PackagesPricesPage() {
  const { data, isLoading } = useGetPackagePricesQuery();
  const [save, { isLoading: saving }] = useSavePackagePricesMutation();
  const [rows, setRows] = useState({}); // { id: { EGP: '', USD: '', enabled: true } }
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const max = data?.maxPrice || 1000000;

  useEffect(() => {
    if (!data) return;
    const next = {};
    data.packages.forEach((p) => {
      next[p.id] = {
        EGP: p.customEGP ? String(p.customEGP) : '',
        USD: p.customUSD ? String(p.customUSD) : '',
        enabled: p.enabled,
      };
    });
    setRows(next);
    setDirty(false);
  }, [data]);

  function update(id, patch) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setDirty(true);
    setSaved(false);
    setError('');
  }

  const packages = useMemo(() => data?.packages || [], [data]);
  const hasErrors = packages.some((p) => rows[p.id]
    && (priceError(rows[p.id].EGP, max) || priceError(rows[p.id].USD, max)));
  const enabledCount = packages.filter((p) => rows[p.id]?.enabled).length;

  async function onSave() {
    if (hasErrors) { setError('في سعر مكتوب غلط — صلّحه الأول.'); return; }
    if (enabledCount === 0) { setError('لازم تفضل باقة واحدة على الأقل شغالة للعملاء.'); return; }
    const prices = {};
    const disabled = [];
    packages.forEach((p) => {
      const r = rows[p.id];
      if (!r) return;
      const out = {};
      if (r.EGP !== '') out.EGP = Number(r.EGP);
      if (r.USD !== '') out.USD = Number(r.USD);
      if (Object.keys(out).length) prices[p.id] = out;
      if (!r.enabled) disabled.push(p.id);
    });
    try {
      await save({ prices, disabled }).unwrap();
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setError(e?.data?.error || 'حصل خطأ في الحفظ، جرّب تاني.');
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">الباقات والأسعار</h1>
          <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-ivory/45">
            حط سعر كل باقة بنفسك، وشغّل أو اقفل أي باقة. الخانة الفاضية = السعر الأصلي.
            التغيير بيبان للعملاء خلال ثواني.
            {data?.updatedAt && ` آخر تعديل: ${fmtDate(data.updatedAt, true)}`}
          </p>
        </div>
        <Btn tone="gold" icon={saved && !dirty ? Check : Save} loading={saving} onClick={onSave}
          disabled={!dirty && !saved}>
          {saved && !dirty ? 'اتحفظ' : 'احفظ الأسعار'}
        </Btn>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error/15 px-4 py-3 text-[12.5px] font-bold text-error">
          <AlertTriangle size={15} /> {error}
        </div>
      )}
      {dirty && !error && (
        <div className="rounded-xl border border-brass/30 bg-brass/[0.08] px-4 py-2.5 text-[12px] text-brass-soft">
          عندك تعديلات لسه متحفظتش — اضغط "احفظ الأسعار".
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((p) => {
          const r = rows[p.id] || { EGP: '', USD: '', enabled: true };
          const egyptOnly = p.countries.length === 1 && p.countries[0] === 'EG';
          const effEGP = r.EGP !== '' && !priceError(r.EGP, max) ? Number(r.EGP) : p.defaultEGP;
          const effUSD = r.USD !== '' && !priceError(r.USD, max) ? Number(r.USD) : p.defaultUSD;
          return (
            <Panel
              key={p.id}
              className={r.enabled ? '' : 'opacity-75'}
              title={(
                <span className="flex flex-wrap items-center gap-2">
                  {p.name}
                  <Badge tone={r.enabled ? 'ok' : 'danger'}>{r.enabled ? 'شغالة' : 'مقفولة'}</Badge>
                </span>
              )}
              subtitle={`${p.invitations} ${p.invitations === 1 ? 'دعوة' : p.invitations <= 10 ? 'دعوات' : 'دعوة'} · ${p.nameEn}`}
              action={(
                <button
                  type="button"
                  role="switch"
                  aria-checked={r.enabled}
                  onClick={() => update(p.id, { enabled: !r.enabled })}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition ${
                    r.enabled
                      ? 'border border-error/40 text-error/90 hover:bg-error/10'
                      : 'bg-ok text-[#04170f] hover:brightness-110'
                  }`}
                >
                  <Power size={13} /> {r.enabled ? 'اقفل الباقة' : 'شغّل الباقة'}
                </button>
              )}
            >
              <div className="flex gap-3">
                <PriceInput label="السعر في مصر" currency="ج.م" value={r.EGP} def={p.defaultEGP} max={max}
                  onChange={(v) => update(p.id, { EGP: v })} />
                {egyptOnly ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="text-[12px] text-ivory/55">بره مصر</span>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-line-lite px-3.5 py-2.5 text-[12px] text-ivory/45">
                      <MapPin size={14} className="shrink-0" /> الباقة دي لمصر بس
                    </div>
                  </div>
                ) : (
                  <PriceInput label="السعر بره مصر" currency="$" value={r.USD} def={p.defaultUSD} max={max}
                    onChange={(v) => update(p.id, { USD: v })} />
                )}
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-night/50 px-3.5 py-2.5 text-[12px] text-ivory/60">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 size={13} className="text-brass-soft" /> العميل هيشوف:
                </span>
                <span className="font-bold text-ivory">{effEGP} ج.م</span>
                {!egyptOnly && <span className="font-bold text-ivory">${effUSD}</span>}
                {p.discountPercent > 0 && (
                  <span className="inline-flex items-center gap-1 text-brass-soft">
                    <BadgePercent size={13} /> قبل خصم {p.discountPercent}% الشغال (صفحة الخصومات)
                  </span>
                )}
                {!r.enabled && <span className="font-bold text-error">مش هتظهر للعملاء خالص</span>}
              </div>
            </Panel>
          );
        })}
      </div>

      <p className="text-[11.5px] leading-relaxed text-ivory/40">
        العملاء اللي دفعوا قبل كده وباقاتهم شغالة مبيتأثروش بأي تغيير هنا. الطلب المستني اللي لسه
        مترفعلوش إيصال بياخد السعر الجديد لما العميل يرجع لصفحة الدفع.
      </p>
    </div>
  );
}
