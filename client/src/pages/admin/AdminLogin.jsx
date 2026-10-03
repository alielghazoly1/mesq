// شاشة دخول اللوحة.
//
// المفتاح بيتبعت مرة واحدة بس (POST /admin/login) وبعدها كوكي httpOnly
// بيتابع الجلسة — المفتاح نفسه عمره ما بيتخزّن في المتصفح لا في
// localStorage ولا في أي مكان تاني، وحقل الإدخال بيتفضّى بعد النجاح.
//
// لو التحقق بخطوتين مفعّل: بعد كلمة السر بتظهر خطوة تانية تطلب الكود
// من تطبيق الموبايل (أو كود احتياطي).
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Loader2, ShieldAlert, Smartphone, ArrowRight } from 'lucide-react';
import CodeInput from '../../components/admin/CodeInput.jsx';

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export default function AdminLogin({ onSuccess }) {
  const [key, setKey] = useState('');
  const [step, setStep] = useState('password'); // 'password' | 'code'
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitPassword(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { ok, data } = await post('/admin/login', { key });
      if (!ok) { setError(data.error || 'كلمة السر غلط.'); return; }
      setKey('');
      if (data.needCode) { setStep('code'); setCode(''); return; }
      onSuccess();
    } catch {
      setError('حصل خطأ في الاتصال، جرّب تاني.');
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(value = code) {
    if (busy || !value || (!backup && value.length !== 6)) return;
    setError('');
    setBusy(true);
    try {
      const { ok, data } = await post('/admin/login/verify', { code: value });
      if (!ok) {
        setError(data.error || 'الكود غلط.');
        setCode('');
        if (data.restart) setStep('password');
        return;
      }
      onSuccess();
    } catch {
      setError('حصل خطأ في الاتصال، جرّب تاني.');
    } finally {
      setBusy(false);
    }
  }

  const card = 'w-full max-w-[360px] rounded-2xl border border-line-lite bg-panel p-7 text-center';

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-6">
      <AnimatePresence mode="wait">
        {step === 'password' ? (
          <motion.form
            key="password"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 30 }}
            onSubmit={submitPassword}
            className={card}
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brass/15">
              <Lock size={18} className="text-brass" />
            </div>
            <h1 className="mb-1 font-serif text-[19px] font-bold text-ivory">لوحة تحكم ميثاق</h1>
            <p className="mb-6 text-[12.5px] text-ivory/45">ادخل كلمة السر عشان تكمّل.</p>

            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
              autoComplete="current-password"
              placeholder="كلمة السر"
              className="mb-3 w-full rounded-xl border border-line-lite bg-night/60 px-4 py-3 text-center text-[14px] text-ivory placeholder:text-ivory/30 focus:border-brass/60 focus:outline-none"
            />

            {error && (
              <p className="mb-3 flex items-center justify-center gap-1.5 text-[12.5px] text-error">
                <ShieldAlert size={13} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !key}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brass to-brass-soft py-3 text-[14px] font-extrabold text-[#241608] hover:brightness-105 disabled:opacity-50"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              دخول
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="code"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={(e) => { e.preventDefault(); submitCode(); }}
            className={card}
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brass/15">
              <Smartphone size={18} className="text-brass" />
            </div>
            <h1 className="mb-1 font-serif text-[19px] font-bold text-ivory">كود التحقق</h1>
            <p className="mb-6 text-[12.5px] leading-relaxed text-ivory/45">
              {backup ? 'اكتب واحد من أكواد الطوارئ اللي حفظتها.' : 'افتح Google Authenticator واكتب الكود الظاهر لـ Mithaq.'}
            </p>

            <div className="mb-3">
              <CodeInput value={code} onChange={setCode} onComplete={submitCode} backup={backup} disabled={busy} />
            </div>

            {error && (
              <p className="mb-3 flex items-center justify-center gap-1.5 text-[12.5px] text-error">
                <ShieldAlert size={13} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !code || (!backup && code.length !== 6)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brass to-brass-soft py-3 text-[14px] font-extrabold text-[#241608] hover:brightness-105 disabled:opacity-50"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              تأكيد
            </button>

            <div className="mt-4 flex items-center justify-between text-[11.5px]">
              <button type="button" onClick={() => { setBackup((b) => !b); setCode(''); setError(''); }} className="text-brass hover:underline">
                {backup ? 'استخدم كود التطبيق' : 'موبايلك مش معاك؟'}
              </button>
              <button type="button" onClick={() => { setStep('password'); setError(''); }} className="inline-flex items-center gap-1 text-ivory/45 hover:text-ivory">
                <ArrowRight size={12} /> رجوع
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
