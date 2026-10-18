import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { X, Eye, EyeOff } from 'lucide-react';
import { api, useLoginMutation, useRegisterMutation, useGoogleCompleteMutation } from '../store/api.js';
import { closeAuthModal, openAuthModal, showWelcome } from '../store/uiSlice.js';
import CountrySelect from './form/CountrySelect.jsx';
import GoogleSignIn from './GoogleSignIn.jsx';
import { guessCountry } from '../lib/guessCountry.js';

const inputClass =
  'w-full rounded-lg border border-line px-3.5 py-2.5 text-[15px] text-ink focus:border-rose focus:outline-none';

// حقل باسورد فيه زرار "عين" يوري/يخفي الكلمة اللي العميل كتبها — بيسهّل عليه
// يتأكد إنه كتبها صح (خصوصًا على الموبايل) بدل ما يكتبها غلط ومايعرفش.
function PasswordField({ registerProps, autoComplete, minLength, placeholder }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${inputClass} pe-11`}
        {...registerProps}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
        className="absolute inset-y-0 end-2 flex items-center px-1.5 text-ink-dim hover:text-ink"
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function LoginForm() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm();
  const [login, { isLoading, error, reset }] = useLoginMutation();

  async function onSubmit(values) {
    try {
      await login(values).unwrap();
      // بنبدأ من صفحة بيضا: نمسح كل كاش الحساب اللي فات عشان الحساب الجديد
      // يجيب بياناته هو (اشتراكه ودعواته) من الأول، مش بيانات حد قبله.
      dispatch(api.util.resetApiState());
      dispatch(closeAuthModal());
    } catch {
      /* الخطأ بيتعرض من error.data.error تحت */
    }
  }

  return (
    // أول ما يعدّل أي حقل، بنمسح رسالة الخطأ القديمة (مكانتش بتختفي قبل كده)
    <form onSubmit={handleSubmit(onSubmit)} onChange={() => { if (error) reset(); }} className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.email')}</label>
        <input type="email" required autoComplete="email" className={inputClass} {...register('email')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.password')}</label>
        <PasswordField registerProps={register('password')} autoComplete="current-password" />
      </div>
      <p className="min-h-[18px] text-[13px] text-error">{error?.data?.error}</p>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-night py-3 font-extrabold text-ivory hover:bg-emerald disabled:opacity-60"
      >
        {isLoading ? '...' : t('auth.submitLogin')}
      </button>
    </form>
  );
}

function RegisterForm() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState } = useForm();
  const [doRegister, { isLoading, error, reset }] = useRegisterMutation();

  async function onSubmit(values) {
    try {
      const res = await doRegister(values).unwrap();
      dispatch(api.util.resetApiState());
      dispatch(closeAuthModal());
      // شاشة الترحيب مكان فورم التسجيل على طول — من غير أي فراغ بينهم
      dispatch(showWelcome((res && res.user && res.user.name) || values.name || ''));
    } catch {
      /* الخطأ بيتعرض من error.data.error تحت */
    }
  }

  return (
    // أول ما يعدّل أي حقل، بنمسح رسالة الخطأ القديمة (زي "الإيميل مسجل بالفعل")
    <form onSubmit={handleSubmit(onSubmit)} onChange={() => { if (error) reset(); }} className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.name')}</label>
        <input type="text" required maxLength={80} autoComplete="name" className={inputClass} {...register('name')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.email')}</label>
        <input type="email" required autoComplete="email" className={inputClass} {...register('email')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.phone')}</label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={30}
          placeholder={t('auth.phonePlaceholder')}
          className={inputClass}
          {...register('phone')}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.passwordHint')}</label>
        <PasswordField registerProps={register('password')} autoComplete="new-password" minLength={8} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.country')}</label>
        <Controller
          name="country"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <CountrySelect value={field.value} onChange={field.onChange} />}
        />
      </div>
      <p className="min-h-[18px] text-[13px] text-error">
        {error?.data?.error || (formState.errors.country && t('auth.countryRequired'))}
      </p>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-night py-3 font-extrabold text-ivory hover:bg-emerald disabled:opacity-60"
      >
        {isLoading ? '...' : t('auth.submitRegister')}
      </button>
    </form>
  );
}

// خطوة واحدة بعد جوجل للعميل الجديد بس: الدولة (متختارة جاهزة من جهازه —
// بتحدد العملة) + واتساب اختياري. الاسم والإيميل جايين من جوجل.
function GoogleCompleteForm({ pending, profile, onBack }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState } = useForm({
    defaultValues: { name: profile.name || '', country: guessCountry() || undefined, phone: '' },
  });
  const [complete, { isLoading, error, reset }] = useGoogleCompleteMutation();

  async function onSubmit(values) {
    try {
      const res = await complete({ pending, ...values }).unwrap();
      dispatch(api.util.resetApiState());
      dispatch(closeAuthModal());
      if (res && res.isNew) dispatch(showWelcome((res.user && res.user.name) || values.name || ''));
    } catch { /* الخطأ بيتعرض تحت */ }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={() => { if (error) reset(); }} className="space-y-3.5" data-google-complete>
      <div className="flex items-center gap-3 rounded-2xl bg-ink/[0.04] px-3.5 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-line">
          <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-extrabold text-ink">{t('auth.google.hello', { name: (profile.name || '').split(' ')[0] || '' })}</span>
          <span className="block truncate text-[12px] text-ink-dim" dir="ltr">{profile.email}</span>
        </span>
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink-dim">{t('auth.google.lastStep')}</p>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.name')}</label>
        <input type="text" required maxLength={80} autoComplete="name" className={inputClass} {...register('name')} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.country')}</label>
        <Controller
          name="country"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <CountrySelect value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.phone')}</label>
        <input type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder={t('auth.phonePlaceholder')} className={inputClass} {...register('phone')} />
      </div>
      <p className="min-h-[18px] text-[13px] text-error">
        {error?.data?.error || (formState.errors.country && t('auth.countryRequired'))}
      </p>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-night py-3 font-extrabold text-ivory hover:bg-emerald disabled:opacity-60"
      >
        {isLoading ? '...' : t('auth.google.finish')}
      </button>
      <button type="button" onClick={onBack} className="w-full text-center text-[12.5px] text-ink-dim underline-offset-4 hover:underline">
        {t('auth.google.back')}
      </button>
    </form>
  );
}

export default function AuthModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const open = useSelector((s) => s.ui.authModalOpen);
  const tab = useSelector((s) => s.ui.authModalTab);
  // عميل جديد رجع من جوجل — بيكمّل خطوة الدولة/الواتساب مكان الفورمز
  const [googleNew, setGoogleNew] = useState(null);
  useEffect(() => { if (!open) setGoogleNew(null); }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-night/70 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && dispatch(closeAuthModal())}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-[22px] bg-card p-8"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label={t('auth.close')}
              onClick={() => dispatch(closeAuthModal())}
              className="absolute top-3.5 end-3.5 text-ink-dim hover:text-ink"
            >
              <X size={18} />
            </button>

            {googleNew ? (
              <GoogleCompleteForm pending={googleNew.pending} profile={googleNew.profile} onBack={() => setGoogleNew(null)} />
            ) : (
            <>
            <div className="mb-5 flex gap-2">
              <button
                type="button"
                onClick={() => dispatch(openAuthModal('login'))}
                className={`flex-1 rounded-full border py-2 text-[13.5px] ${
                  tab === 'login' ? 'border-night bg-night text-ivory' : 'border-line text-ink-dim'
                }`}
              >
                {t('auth.loginTab')}
              </button>
              <button
                type="button"
                onClick={() => dispatch(openAuthModal('register'))}
                className={`flex-1 rounded-full border py-2 text-[13.5px] ${
                  tab === 'register' ? 'border-night bg-night text-ivory' : 'border-line text-ink-dim'
                }`}
              >
                {t('auth.registerTab')}
              </button>
            </div>

            <h2 className="mb-4 font-serif text-xl italic text-ink">
              {tab === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h2>

            <GoogleSignIn onNeedsProfile={setGoogleNew} />

            {tab === 'login' ? <LoginForm /> : <RegisterForm />}
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
