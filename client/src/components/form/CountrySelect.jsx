import { useMemo } from 'react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { COUNTRY_OPTIONS } from '../../data/countries.js';

// 16px (text-base): أقل من كده الآيفون بيعمل زوم أول ما تلمس الخانة
const makeClassNames = (invalid) => ({
  control: ({ isFocused }) =>
    `min-h-[46px] rounded-2xl border bg-white px-2 text-base transition-[border-color,box-shadow] ${
      invalid ? 'border-error/70' : isFocused ? 'border-emerald shadow-[0_0_0_4px_rgba(31,111,92,.12)]' : 'border-line'}`,
  placeholder: () => 'text-ink-dim/70 px-1.5',
  input: () => 'text-ink px-1.5',
  singleValue: () => 'text-ink px-1.5',
  indicatorSeparator: () => 'hidden',
  dropdownIndicator: () => 'text-ink-dim',
  menu: () => 'mt-1.5 overflow-hidden rounded-2xl border border-line bg-card shadow-lg',
  menuList: () => 'max-h-56',
  option: ({ isFocused, isSelected }) =>
    `cursor-pointer px-3.5 py-2.5 text-[15px] ${
      isSelected ? 'bg-rose/15 text-rose' : isFocused ? 'bg-ink/5 text-ink' : 'text-ink'
    }`,
  noOptionsMessage: () => 'px-3.5 py-2 text-sm text-ink-dim',
});

export default function CountrySelect({ value, onChange, invalid = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  // أسماء الدول بتتقلب مع لغة الموقع، وبتترتب أبجديًا حسب اللغة نفسها
  const options = useMemo(
    () =>
      COUNTRY_OPTIONS.map((c) => ({ value: c.value, label: c[lang] })).sort((a, b) =>
        a.label.localeCompare(b.label, lang)
      ),
    [lang]
  );

  const selected = options.find((o) => o.value === value) || null;

  return (
    <Select
      unstyled
      options={options}
      value={selected}
      onChange={(opt) => onChange(opt ? opt.value : '')}
      placeholder={t('auth.countryPlaceholder')}
      noOptionsMessage={() => t('auth.countryNoResults')}
      classNames={makeClassNames(invalid)}
      classNamePrefix="country-select"
    />
  );
}
