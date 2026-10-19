// العميل سجّل إزاي؟ — شارة صغيرة جنب اسمه في قايمة العملاء وفي ملفه.
//   google = بيدخل بجوجل بس · both = عنده باسورد وربط جوجل كمان · email = إيميل وباسورد
function GoogleG({ size = 11 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
  );
}

export default function SignupBadge({ signup, full = false }) {
  if (signup === 'google' || signup === 'both') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-extrabold text-[#3c4043] ring-1 ring-black/5"
        title={signup === 'both' ? 'سجّل بالإيميل وربط جوجل كمان' : 'سجّل بحساب جوجل'}
        data-signup={signup}
      >
        <GoogleG />
        {full ? (signup === 'both' ? 'جوجل + باسورد' : 'سجّل بجوجل') : 'جوجل'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-ivory/[0.07] px-2 py-0.5 text-[10.5px] font-bold text-ivory/50" title="سجّل بالإيميل والباسورد" data-signup="email">
      {full ? 'سجّل بالإيميل' : 'إيميل'}
    </span>
  );
}
