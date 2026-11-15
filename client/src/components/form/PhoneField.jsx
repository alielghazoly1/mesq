// خانة رقم الموبايل (واتساب) — كود الدولة جنب الرقم + تحقق فوري بنفس قواعد السيرفر (lib/phone.js).
//
// - كود الدولة بيمشي مع "الدولة" اللي العميل اختارها فوق، لحد ما يغيّره بنفسه (مصري عايش في السعودية).
// - يكتب الرقم زي ما متعود: 010… أو 10… أو حتى +966… (لو كتب كود دولة تانية، الخانة بتقلب الكود لوحدها).
// - تحت الخانة على طول: "✓ هيتسجّل كده: +20 10 12345678" — العميل يشوف الرقم النهائي قبل ما يبعت.
// - قيمة الخانة جوه الفورم: { country, input, manual } — والفورم بيبعت للسيرفر الرقم الموحّد (E.164).
import { useEffect, useMemo, useRef } from 'react';
import Select, { createFilter } from 'react-select';
import { useTranslation } from 'react-i18next';
import { Check, Phone } from 'lucide-react';
import { COUNTRY_OPTIONS } from '../../data/countries.js';
import { normalizePhone, dialCode, phoneCountries, splitInternational, flagOf } from '../../lib/phone.js';
import { examplePhone } from '../../lib/phoneUi.js';

const NAMES = Object.fromEntries(COUNTRY_OPTIONS.map((c) => [c.value, c]));
// الاسم من غير علم الدولة اللي في أوله (العلم بيتحط لوحده)
const plainName = (s) => String(s || '').replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim();

const selectClassNames = (invalid) => ({
  control: ({ isFocused }) =>
    `h-[46px] min-h-[46px] cursor-pointer rounded-s-2xl border-e border-line bg-transparent ps-2.5 pe-1 text-base ${
      isFocused ? 'bg-ink/[.03]' : ''} ${invalid ? 'text-error' : ''}`,
  valueContainer: () => 'gap-1',
  singleValue: () => 'text-ink',
  input: () => 'text-ink',
  placeholder: () => 'text-ink-dim/70',
  indicatorSeparator: () => 'hidden',
  dropdownIndicator: () => 'text-ink-dim ps-0.5',
  menu: () => 'mt-1.5 overflow-hidden rounded-2xl border border-line bg-card shadow-lg',
  menuList: () => 'max-h-60',
  option: ({ isFocused, isSelected }) =>
    `cursor-pointer px-3 py-2.5 text-[15px] ${isSelected ? 'bg-rose/15 text-rose' : isFocused ? 'bg-ink/5 text-ink' : 'text-ink'}`,
  noOptionsMessage: () => 'px-3.5 py-2 text-sm text-ink-dim',
});

// البحث في القايمة: أرقام (20 أو +20) → الأكواد اللي بتبدأ بيها بس (20 = مصر، مش +420 التشيك)؛ غير كده بالاسم
const nameFilter = createFilter({ ignoreAccents: true, matchFrom: 'any', stringify: (o) => o.label });
function codeFilter(option, input) {
  const q = String(input || '').trim().replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  if (/^\+?\d+$/.test(q)) {
    const code = String((option.data && option.data.code) || '').replace(/^\+/, '');
    return !!code && code.startsWith(q.replace(/^\+/, ''));
  }
  return nameFilter(option, input);
}

export default function PhoneField({ value, onChange, onBlur, accountCountry, error, extra = null, name = 'phone', label, autoFocus = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const v = { country: '', input: '', manual: false, ...(value || {}) };
  const inputRef = useRef(null);

  // كود الدولة بيتبع "الدولة" المختارة فوق لحد ما العميل يغيّره بنفسه
  useEffect(() => {
    // بيمشي مع دولة الحساب بس والخانة فاضية — رقم مكتوب (05x صحيح في السعودية والإمارات مثلًا) مايتنقلش لكود تاني من غير ما العميل يشوف
    if (!v.manual && !String(v.input || '').trim() && accountCountry && accountCountry !== v.country && dialCode(accountCountry)) {
      onChange({ ...v, country: accountCountry });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountCountry]);

  const options = useMemo(() => {
    const other = lang === 'ar' ? 'en' : 'ar';
    const list = phoneCountries().map((cc) => {
      const n = NAMES[cc];
      const local = plainName(n ? n[lang] : cc) || cc;
      const code = dialCode(cc);
      return {
        value: cc,
        name: local,
        code,
        // البحث بالاسم بالعربي أو الإنجليزي أو بالكود (+20 / 20)
        label: `${local} ${plainName(n ? n[other] : '')} ${code} ${code.slice(1)}`,
      };
    });
    list.sort((a, b) => a.name.localeCompare(b.name, lang));
    // دولة الحساب أول القايمة
    const first = list.findIndex((o) => o.value === accountCountry);
    if (first > 0) list.unshift(list.splice(first, 1)[0]);
    return list;
  }, [lang, accountCountry]);

  const selected = options.find((o) => o.value === v.country) || null;
  const n = normalizePhone(v.input, v.country);
  const ok = n.ok;
  const example = v.country ? examplePhone(v.country) : '';

  function setInput(input) {
    onChange({ ...v, input });
  }
  function handleBlur() {
    // كتب الرقم دولي بكود دولة تانية → نقلب الكود ونسيب الرقم المحلي
    const sp = splitInternational(v.input);
    if (sp && dialCode(sp.country)) onChange({ country: sp.country, input: sp.national, manual: true });
    if (onBlur) onBlur();
  }

  const tone = error ? 'error' : ok ? 'ok' : '';
  const hintId = `${name}-hint`;

  return (
    <div data-field={name}>
      <label className="mb-1 block text-[13px] font-bold text-ink/80" htmlFor={`${name}-input`}>
        {label || t('auth.phoneLabel')}
      </label>
      <div
        dir="ltr"
        className={`relative flex items-stretch rounded-2xl border bg-white transition-[border-color,box-shadow] duration-150
          focus-within:shadow-[0_0_0_4px_rgba(31,111,92,.12)]
          ${tone === 'error' ? 'border-error/70 focus-within:border-error focus-within:shadow-[0_0_0_4px_rgba(217,97,79,.12)]'
            : tone === 'ok' ? 'border-ok/50 focus-within:border-emerald' : 'border-line focus-within:border-emerald'}`}
        data-phone-row
      >
        <div className="w-[112px] shrink-0" data-phone-country>
          <Select
            unstyled
            options={options}
            value={selected}
            isSearchable
            onChange={(opt) => {
              if (!opt) return;
              onChange({ ...v, country: opt.value, manual: true });
              setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 0);
            }}
            filterOption={codeFilter}
            formatOptionLabel={(o, { context }) => (context === 'value' ? (
              <span className="flex items-center gap-1.5 whitespace-nowrap" dir="ltr">
                <span className="text-[18px] leading-none">{flagOf(o.value)}</span>
                <span className="font-bold tabular-nums">{o.code}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <span className="text-[18px] leading-none">{flagOf(o.value)}</span>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="shrink-0 text-ink-dim tabular-nums" dir="ltr">{o.code}</span>
              </span>
            ))}
            placeholder={<Phone size={16} className="text-ink-dim" />}
            noOptionsMessage={() => t('auth.countryNoResults')}
            aria-label={t('auth.phoneCodeLabel')}
            classNames={selectClassNames(!!error)}
            styles={{ menu: (base) => ({ ...base, width: 'min(290px, calc(100vw - 2rem))', zIndex: 60 }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            classNamePrefix="phone-cc"
          />
        </div>
        <input
          ref={inputRef}
          id={`${name}-input`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          maxLength={24}
          dir="ltr"
          value={v.input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleBlur}
          placeholder={example}
          aria-invalid={!!error}
          aria-describedby={hintId}
          className="h-[46px] w-0 min-w-0 flex-1 rounded-e-2xl bg-transparent px-3 pe-10 text-base text-ink outline-none placeholder:text-ink-dim/45"
          data-phone-input
        />
        {ok && !error && (
          <span className="pointer-events-none absolute end-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-ok text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <p
        id={hintId}
        className={`pt-1.5 text-[12.5px] leading-snug ${error ? 'text-error' : ok ? 'text-ok' : 'text-ink-dim'}`}
        role={error ? 'alert' : undefined}
        data-phone-hint
      >
        {error || (ok
          ? <>{t('auth.phoneWillSave')} <b dir="ltr" className="inline-block tabular-nums">{n.international}</b></>
          : (example ? t('auth.phoneExample', { n: '\u2066' + example + '\u2069' }) : t('auth.phoneHelp')))}
      </p>
      {extra ? <div className="pt-1 text-[12.5px] leading-snug text-ink-dim" data-phone-extra>{extra}</div> : null}
    </div>
  );
}
