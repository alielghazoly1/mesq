// حقل كلمة السر — بيقول للعميل بالظبط إحنا محتاجين إيه، بيوريه الكتابة
// لو حب، وبيسجّل معاه علامات الصح واحدة واحدة وهو بيكتب.
//
// نتّبع فلسفة NIST الحديثة: الطول أهم من قواعد الرموز. المحقّق في السيرفر
// بيطلب ٨ حروف فقط. زيادة على كده هنا مجرد "نصايح قوة" — مش شرط رفض.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Check, Circle } from 'lucide-react';

/** قواعد بسيطة نعرضها للعميل وهو بيكتب — الأولى فقط ملزمة */
function evaluate(pw) {
  const s = String(pw || '');
  return {
    long: s.length >= 8,
    letter: /[a-zA-Z؀-ۿ]/.test(s),
    digit: /\d/.test(s),
    strong: s.length >= 12,
  };
}

/**
 * @param {object} p
 * @param {string} p.value قيمة الكلمة الحالية (react-hook-form register value)
 * @param {(v:string)=>void} p.onChange
 * @param {'new'|'current'} [p.autoComplete='new'] — new للتسجيل، current للدخول
 * @param {string} [p.label]
 * @param {boolean} [p.showChecklist=true] — قايمة القواعد تحت الحقل
 * @param {boolean} [p.required=true]
 */
export default function PasswordField({
  value, onChange, onBlur, name, autoComplete = 'new', label, showChecklist = true,
  required = true, id, error, placeholder,
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const rules = evaluate(value);
  // بنعرض القايمة أول ما العميل يبدأ يكتب، مش قبل — عشان مايبانش الفورم
  // مكتظ قبل ما يبدأ حاجة
  const started = String(value || '').length > 0;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] text-ink-dim">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          minLength={8}
          autoComplete={autoComplete === 'new' ? 'new-password' : 'current-password'}
          placeholder={placeholder}
          dir="ltr"
          className="w-full rounded-lg border border-line px-3.5 py-2.5 pe-11 text-[15px] text-ink focus:border-rose focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={t(visible ? 'auth.pwHide' : 'auth.pwShow')}
          className="absolute inset-y-0 end-1.5 flex w-9 items-center justify-center text-ink-dim hover:text-ink"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {showChecklist && autoComplete === 'new' && started && (
        <ul className="mt-2 space-y-1 text-[12px]">
          <RuleRow ok={rules.long} label={t('auth.pwRuleLong')} />
          <RuleRow ok={rules.letter} label={t('auth.pwRuleLetter')} soft />
          <RuleRow ok={rules.digit} label={t('auth.pwRuleDigit')} soft />
          <RuleRow ok={rules.strong} label={t('auth.pwRuleStrong')} soft />
        </ul>
      )}

      {error && <p className="mt-1.5 text-[12.5px] text-error">{error}</p>}
    </div>
  );
}

function RuleRow({ ok, label, soft }) {
  // القاعدة الملزمة (soft=false) بتبقى إما خضرا أو حمرا. النصايح (soft)
  // بتبقى إما خضرا أو رمادي عشان مايبانش إن العميل غلطان لو ماكانتش عنده
  return (
    <li className={`flex items-center gap-1.5 ${
      ok ? 'text-ok' : soft ? 'text-ink-dim' : 'text-error/85'
    }`}
    >
      {ok ? <Check size={13} className="shrink-0" /> : <Circle size={11} className="shrink-0" />}
      <span>{label}</span>
    </li>
  );
}
