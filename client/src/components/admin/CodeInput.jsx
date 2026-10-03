// خانة كود التحقق (6 أرقام) — أرقام بس، بيقبل اللصق، وعلى الموبايل
// الكيبورد بيطلع أرقام والمتصفح ممكن يقترح الكود لوحده (one-time-code).
// أول ما الـ 6 أرقام يكملوا بيبعت على طول من غير زرار.
import { useEffect, useRef } from 'react';

export default function CodeInput({ value, onChange, onComplete, disabled, autoFocus = true, backup = false }) {
  const ref = useRef(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus, backup]);

  if (backup) {
    return (
      <input
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9))}
        placeholder="XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        dir="ltr"
        className="w-full rounded-xl border border-line-lite bg-night/60 px-4 py-3 text-center font-mono text-[19px] tracking-[0.18em] text-ivory placeholder:text-ivory/25 focus:border-brass/60 focus:outline-none"
      />
    );
  }

  return (
    <input
      ref={ref}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
        onChange(v);
        if (v.length === 6 && onComplete) onComplete(v);
      }}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="one-time-code"
      placeholder="••••••"
      aria-label="كود التحقق"
      dir="ltr"
      className="w-full rounded-xl border border-line-lite bg-night/60 px-4 py-3 text-center font-mono text-[26px] font-bold tracking-[0.5em] text-ivory placeholder:text-ivory/20 focus:border-brass/60 focus:outline-none"
    />
  );
}
