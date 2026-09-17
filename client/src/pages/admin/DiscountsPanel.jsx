// لوحة الخصومات — الخصم كله بيتظبط من هنا، مفيش أي رقم متكتوب في الكود.
//
// أهم حاجة في الشاشة دي إنها بتوريك أثر اللي بتظبطه **وإنت بتظبطه**:
// جدول الباقات تحت بيتحدّث مع كل حرف، بالجنيه والدولار مع بعض. عشان
// متضغطش "احفظ" وإنت مش متأكد إيه اللي العميل هيشوفه بالظبط.
import { useEffect, useMemo, useState } from 'react';
import { Save, Check, Percent, Tag, CalendarClock, AlertTriangle } from 'lucide-react';
import {
  useGetPricingSettingsQuery, useSavePricingSettingsMutation,
} from '../../store/adminApi.js';
import { Panel, Btn, Field, Spinner, Badge, fmtDate } from '../../components/admin/ui.jsx';

/** نفس حساب السيرفر بالظبط (utils/pricing.js) — عشان المعاينة تبقى صادقة */
function clampPercent(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(90, n));
}

function roundPrice(value, currency) {
  const step = currency === 'EGP' ? 5 : 1;
  return Math.max(0, Math.round(value / step) * step);
}

function effectivePercent(pkg, form) {
  if (!form.enabled) return 0;
  if (pkg.noDiscount) return 0;
  if (form.endsAt && new Date(form.endsAt).getTime() < Date.now()) return 0;
  const own = form.perPackage[pkg.id];
  if (own === '' || own === undefined || own === null) return clampPercent(form.percent);
  return clampPercent(own);
}

function finalPrice(listPrice, percent, currency) {
  if (!percent) return listPrice;
  return roundPrice(listPrice * (1 - percent / 100), currency);
}

/** صف باقة في جدول المعاينة */
function PreviewRow({ pkg, form }) {
  const percent = effectivePercent(pkg, form);
  const egp = finalPrice(pkg.egp.listPrice, percent, 'EGP');
  const usd = finalPrice(pkg.usd.listPrice, percent, 'USD');
  const egyptOnly = (pkg.countries || []).length > 0;

  return (
    <tr className="border-b border-line-lite/60 last:border-0">
      <td className="px-2.5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-ivory">{pkg.name}</span>
          {egyptOnly && <Badge tone="muted">مصر بس</Badge>}
          {pkg.noDiscount && <Badge tone="muted">من غير خصم</Badge>}
        </div>
        <div className="mt-0.5 text-[11px] text-ivory/40">{pkg.invitations} دعوة</div>
      </td>

      <td className="px-2.5 py-3">
        {pkg.noDiscount ? (
          <span className="text-[11.5px] text-ivory/30">—</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="90"
              placeholder={String(clampPercent(form.percent))}
              value={form.perPackage[pkg.id] ?? ''}
              onChange={(e) => form.setPerPackage(pkg.id, e.target.value)}
              className="w-[68px] rounded-lg border border-line-lite bg-night/60 px-2 py-1.5 text-center text-[12.5px] text-ivory placeholder:text-ivory/25 focus:border-brass/60 focus:outline-none"
            />
            <span className="text-[11.5px] text-ivory/35">%</span>
          </div>
        )}
      </td>

      {[['EGP', pkg.egp.listPrice, egp, 'ج.م'], ['USD', pkg.usd.listPrice, usd, '$']].map(
        ([cur, list, now, label]) => (
          <td key={cur} className="whitespace-nowrap px-2.5 py-3">
            {/* الباقة المصرية مالهاش سعر دولار أصلاً */}
            {!list ? (
              <span className="text-[11.5px] text-ivory/25">—</span>
            ) : percent > 0 ? (
              <span className="flex items-baseline gap-1.5">
                <span className="text-[11.5px] text-ivory/35 line-through">{list}</span>
                <span className="font-bold text-ok">{now}</span>
                <span className="text-[11px] text-ivory/40">{label}</span>
              </span>
            ) : (
              <span className="flex items-baseline gap-1">
                <span className="font-bold text-ivory">{list}</span>
                <span className="text-[11px] text-ivory/40">{label}</span>
              </span>
            )}
          </td>
        )
      )}
    </tr>
  );
}

export default function DiscountsPanel() {
  const { data, isLoading } = useGetPricingSettingsQuery();
  const [save, { isLoading: saving, isSuccess }] = useSavePricingSettingsMutation();

  const [enabled, setEnabled] = useState(false);
  const [percent, setPercent] = useState(0);
  const [perPackage, setPerPackageState] = useState({});
  const [labelAr, setLabelAr] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!data) return;
    setEnabled(!!data.enabled);
    setPercent(data.percent || 0);
    setPerPackageState(data.perPackage || {});
    setLabelAr(data.labelAr || '');
    setLabelEn(data.labelEn || '');
    setEndsAt(data.endsAt ? String(data.endsAt).slice(0, 10) : '');
    setDirty(false);
  }, [data]);

  function setPerPackage(id, value) {
    setPerPackageState((prev) => {
      const next = { ...prev };
      if (value === '') delete next[id];
      else next[id] = value;
      return next;
    });
    setDirty(true);
  }

  const form = useMemo(
    () => ({ enabled, percent, perPackage, endsAt, setPerPackage }),
    [enabled, percent, perPackage, endsAt]
  );

  const packages = data?.preview || [];
  // عرض خلص ميعاده لسه شغّال في اللوحة — لازم يبان، مش يعدي بالسكوت
  const expired = !!endsAt && new Date(endsAt).getTime() < Date.now();

  function onSave() {
    save({
      enabled,
      percent: clampPercent(percent),
      // الفاضي بيترمي هنا كمان — عشان السيرفر يرجّعه للنسبة العامة
      perPackage: Object.fromEntries(
        Object.entries(perPackage).filter(([, v]) => v !== '' && v !== null)
      ),
      labelAr,
      labelEn,
      endsAt: endsAt || null,
    }).unwrap().then(() => setDirty(false), () => {});
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">الخصومات</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            الخصم بينطبق على سعر الجنيه وسعر الدولار مع بعض بنفس النسبة.
            {data?.updatedAt && ` آخر تعديل: ${fmtDate(data.updatedAt, true)}`}
          </p>
        </div>
        <Btn
          tone="gold"
          icon={isSuccess && !dirty ? Check : Save}
          loading={saving}
          onClick={onSave}
        >
          {isSuccess && !dirty ? 'اتحفظ' : 'احفظ الخصومات'}
        </Btn>
      </div>

      <Panel
        title="الخصم الشغّال"
        subtitle="اقفله وكل الأسعار ترجع لسعر القايمة على طول — من غير ما تمسح النسب اللي ظابطها"
      >
        {/* القفل الرئيسي */}
        <button
          type="button"
          onClick={() => { setEnabled((v) => !v); setDirty(true); }}
          className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-start transition ${
            enabled ? 'border-ok/45 bg-ok/[0.07]' : 'border-line-lite bg-night/40'
          }`}
        >
          <span className="min-w-0">
            <span className={`block text-[14px] font-bold ${enabled ? 'text-ok' : 'text-ivory/70'}`}>
              {enabled ? 'الخصم شغّال دلوقتي' : 'الخصم مقفول'}
            </span>
            <span className="mt-0.5 block text-[11.5px] text-ivory/45">
              {enabled
                ? 'العملاء بيشوفوا السعر القديم مشطوب جنب السعر الجديد'
                : 'العملاء بيشوفوا سعر القايمة عادي'}
            </span>
          </span>
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              enabled ? 'bg-ok' : 'bg-ivory/15'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                enabled ? 'start-[22px]' : 'start-0.5'
              }`}
            />
          </span>
        </button>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-ivory/55">النسبة العامة (٪)</span>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="90"
                value={percent}
                onChange={(e) => { setPercent(e.target.value); setDirty(true); }}
                className="w-full rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 pe-9 text-[13.5px] text-ivory focus:border-brass/60 focus:outline-none"
              />
              <Percent
                size={14}
                className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-ivory/30"
              />
            </div>
            <span className="text-[11px] text-ivory/35">
              بتنطبق على أي باقة مالهاش نسبة خاصة تحت
            </span>
          </label>

          <Field
            label="آخر ميعاد للعرض (اختياري)"
            type="date"
            value={endsAt}
            onChange={(e) => { setEndsAt(e.target.value); setDirty(true); }}
            hint="بعد الميعاد ده الخصم بيقف لوحده — سيبها فاضية لو العرض مفتوح"
          />
        </div>

        {expired && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-error/40 bg-error/[0.07] p-3 text-[11.5px] text-error">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            الميعاد ده عدّى خلاص، فالخصم واقف دلوقتي حتى لو المفتاح فوق شغّال. غيّر
            الميعاد أو امسحه عشان يشتغل تاني.
          </p>
        )}

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <Field
            label="كلام الشارة بالعربي"
            placeholder="خصم 20%"
            value={labelAr}
            onChange={(e) => { setLabelAr(e.target.value); setDirty(true); }}
            hint="سيبها فاضية وهتتكتب تلقائي من النسبة"
          />
          <Field
            label="كلام الشارة بالإنجليزي"
            placeholder="20% off"
            value={labelEn}
            onChange={(e) => { setLabelEn(e.target.value); setDirty(true); }}
          />
        </div>
      </Panel>

      <Panel
        title="الباقات والأسعار"
        subtitle="سيب خانة النسبة فاضية عشان الباقة تاخد النسبة العامة، أو حط 0 عشان تستثنيها من الخصم"
      >
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-line-lite">
                {['الباقة', 'نسبة خاصة', 'بالجنيه', 'بالدولار'].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-2.5 py-2.5 text-start text-[11px] font-bold uppercase tracking-wider text-ivory/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <PreviewRow key={pkg.id} pkg={pkg} form={form} />
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-ivory/[0.04] p-3 text-[11.5px] text-ivory/50">
          <Tag size={13} className="mt-0.5 shrink-0" />
          الأسعار بتتقرّب لأقرب 5 جنيه (أو دولار صحيح) — عشان الرقم يطلع طبيعي.
          الطلبات المعلّقة بتتحدّث لسعرها الجديد لوحدها لما العميل يفتح صفحة الدفع.
        </p>
        <p className="mt-2 flex items-start gap-2 text-[11.5px] text-ivory/40">
          <CalendarClock size={13} className="mt-0.5 shrink-0" />
          التعديل بيوصل للعملاء في أقل من نص دقيقة.
        </p>
      </Panel>
    </div>
  );
}
