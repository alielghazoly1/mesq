// حقل رقم تليفون بكود اتصال دولي.
//
// إدارته بسيطة: بيرجع سلسلة E.164 واحدة (+201234567890) للـ form. مفيش
// انفصال بين "كود الدولة" و"الرقم" في القيمة النهائية — الأدمن ومحقّق
// السيرفر بيتعاملوا مع سلسلة واحدة، وده أوضح وأصعب في الخطأ.
//
// كود الاتصال بيتظبط لوحده على أساس الدولة اللي العميل اختارها فوق —
// فالعميل مايختارش الكود مرة تانية.
import { useEffect, useMemo, useRef } from 'react';
import { getCountry } from '../../data/countryLookup.js';

// بنسيب أرقام + المسافات و '-' في الإدخال (شكل مألوف للعميل)، وبنبعت
// الرقم للسيرفر بعد ما نشيلهم. مبنسيبش المستخدم يكتب '+' جوه الحقل عشان
// الكود بيتظبط لوحده من الدولة.
function stripFormatting(v) {
  return String(v || '').replace(/[^\d]/g, '');
}

export default function PhoneField({ country, value, onChange, placeholder, className, id }) {
  const info = getCountry(country);
  const dial = info?.dial || '';
  // آخر كود دولة استخدمناه — عشان لو العميل غيّر دولته، الرقم يفضل صح
  // (الكود القديم يتشال والجديد يتحط لو الفورم بتخزّن E.164 كامل)
  const prevDialRef = useRef(dial);

  // القيمة الظاهرة في الحقل: الأرقام بعد الكود بس. ليه: العميل شايف الكود
  // ثابت جنب الحقل، فمش هيكتبه تاني، والرقم في الفورم بيبقى دايمًا E.164.
  const local = useMemo(() => {
    const s = String(value || '');
    if (dial && s.startsWith(dial)) return s.slice(dial.length);
    // قيمة قديمة بكود مختلف — بنستخرج بس آخر الأرقام
    return stripFormatting(s);
  }, [value, dial]);

  // تغيّرت الدولة → نعيد بناء E.164 بكود الجديد (بعد ما نشيل القديم لو مركّب)
  useEffect(() => {
    if (prevDialRef.current === dial) return;
    const digits = stripFormatting(local);
    onChange(digits ? `${dial}${digits}` : '');
    prevDialRef.current = dial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial]);

  function handleChange(e) {
    const digits = stripFormatting(e.target.value);
    onChange(digits ? `${dial}${digits}` : '');
  }

  return (
    <div className={`flex items-stretch rounded-lg border border-line focus-within:border-rose ${className || ''}`}>
      <span
        className="flex items-center gap-1 border-e border-line bg-ivory/40 px-3 text-[14px] font-bold text-ink-dim"
        aria-hidden
      >
        {info?.flag && <span>{info.flag}</span>}
        <span dir="ltr">{dial || '+—'}</span>
      </span>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        dir="ltr"
        className="min-w-0 flex-1 rounded-e-lg bg-transparent px-3 py-2.5 text-[15px] text-ink focus:outline-none"
      />
    </div>
  );
}
