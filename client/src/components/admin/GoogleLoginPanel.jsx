// لوحة "الدخول بجوجل" في الإعدادات: الـ Client ID من Google Cloud + تشغيل/قفل،
// والخطوات بالترتيب عشان المالك يعمله بنفسه. الزرار مبيظهرش للعملاء غير لما
// الـ ID يتحط ويتفعّل (utils/googleAuth.js بيتأكد من شكله).
import { useEffect, useState } from 'react';
import { Check, Copy, Save } from 'lucide-react';
import { useGetGoogleLoginQuery, useSaveGoogleLoginMutation } from '../../store/adminApi.js';
import { Panel, Btn, Field, fmtNum } from './ui.jsx';

const G = (
  <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
);

export default function GoogleLoginPanel() {
  const { data } = useGetGoogleLoginQuery();
  const [save, { isLoading, isSuccess, error, reset }] = useSaveGoogleLoginMutation();
  const [clientId, setClientId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (data) { setClientId(data.clientId || ''); setEnabled(!!data.enabled); } }, [data]);

  const origin = (data && data.origin) || window.location.origin;
  const live = !!(data && data.clientId && data.enabled);
  function copyOrigin() {
    navigator.clipboard && navigator.clipboard.writeText(origin).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <Panel
      title={<span className="inline-flex items-center gap-2">{G} الدخول بجوجل</span>}
      subtitle="العميل يدخل أو يعمل حساب بضغطة على زرار جوجل — الزرار بيظهر بس لما تحط الـ Client ID وتفعّله"
      action={live ? <span className="rounded-full bg-ok/15 px-2.5 py-1 text-[11px] font-bold text-ok">شغّال</span> : <span className="rounded-full bg-ivory/10 px-2.5 py-1 text-[11px] font-bold text-ivory/50">مقفول</span>}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); save({ clientId: clientId.trim(), enabled }); }}
        onChange={() => { if (error || isSuccess) reset(); }}
        className="space-y-3.5"
        data-google-admin
      >
        <Field
          label="Google Client ID"
          dir="ltr"
          className="font-mono"
          placeholder="123456789012-xxxxxxxxxxxx.apps.googleusercontent.com"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-brass" />
          <span className="text-[13px] font-bold text-ivory">فعّل زرار جوجل للعملاء</span>
        </label>
        {error?.data?.error && <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error.data.error}</div>}
        <div className="flex flex-wrap items-center gap-3">
          <Btn type="submit" tone="brass" loading={isLoading} icon={isSuccess ? Check : Save}>{isSuccess ? 'اتحفظ' : 'احفظ'}</Btn>
          {data && (
            <span className="text-[12px] text-ivory/50">
              {fmtNum(data.googleUsers || 0)} حساب بيدخل بجوجل · منهم {fmtNum(data.googleNew || 0)} اتعملوا بجوجل من الأول
            </span>
          )}
        </div>
      </form>

      <details className="mt-4 rounded-xl bg-ivory/[0.04] p-3.5 text-[12px] leading-relaxed text-ivory/65" open={!live}>
        <summary className="cursor-pointer font-bold text-ivory/85">إزاي تجيب الـ Client ID (مرة واحدة بس — 5 دقايق)</summary>
        <ol className="mt-2.5 list-decimal space-y-1.5 ps-5">
          <li>افتح <b dir="ltr">console.cloud.google.com</b> وادخل بإيميل جوجل بتاعك، واعمل مشروع جديد باسم <b>Mithaq</b>.</li>
          <li>من القايمة: <b dir="ltr">APIs &amp; Services ← OAuth consent screen</b> (أو Google Auth Platform) ← اختار <b dir="ltr">External</b> ← اكتب اسم التطبيق <b>Mithaq</b> وإيميل الدعم ← واحفظ. وبعدها اضغط <b dir="ltr">Publish app</b> عشان يشتغل لكل الناس.</li>
          <li>من <b dir="ltr">Credentials ← Create credentials ← OAuth client ID</b> ← النوع <b dir="ltr">Web application</b>.</li>
          <li>
            في <b dir="ltr">Authorized JavaScript origins</b> حط اللينك ده بالظبط:
            <button type="button" onClick={copyOrigin} className="ms-1.5 inline-flex items-center gap-1 rounded-md bg-ivory/10 px-2 py-0.5 font-mono text-[11.5px] text-ivory" dir="ltr">
              {origin} {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            {' '}(ومش محتاج Redirect URI).
          </li>
          <li>اضغط <b dir="ltr">Create</b>، وانسخ الـ <b dir="ltr">Client ID</b> اللي بيخلص بـ <span dir="ltr">.apps.googleusercontent.com</span> وحطه فوق واحفظ — الزرار بيظهر للعملاء على طول.</li>
        </ol>
        <p className="mt-2.5 text-ivory/50">الـ Client ID مش سر (بيظهر في الصفحة عادي) — مفيش "Client secret" محتاج يتحط هنا. جوه إنستجرام/فيسبوك جوجل بتمنع الدخول، فالعميل بيشوف زرار "افتح في Chrome" والإيميل شغال عادي.</p>
      </details>
    </Panel>
  );
}
