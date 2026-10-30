// نافذة الدخول / الحساب الجديد.
//
// - على الموبايل بتطلع من تحت (bottom sheet) وبتتزحلق لو الشاشة قصيرة، وعلى
//   الكمبيوتر كارت صغير في النص.
// - كل الخانات 16px: أقل من كده الآيفون بيعمل زوم لوحده أول ما تلمس الخانة
//   (ده كان "الزوم" اللي بيحصل في الفورم).
// - كل خانة بتقول للعميل تحتها على طول لو فيه حاجة غلط، أو ✓ لما تبقى تمام —
//   بدل رسالة واحدة تحت الزرار بعد ما يدوس.
// - الباسورد: ٦ حروف أو أرقام على الأقل، من غير شروط تعقيد.
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import {
  X, Eye, EyeOff, Mail, Lock, User, Phone, Check, AlertCircle, Loader2, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { api, useLoginMutation, useRegisterMutation, useGoogleCompleteMutation } from '../store/api.js';
import { closeAuthModal, openAuthModal, showWelcome } from '../store/uiSlice.js';
import { pixelTrack } from '../lib/metaPixel.js';
import CountrySelect from './form/CountrySelect.jsx';
import GoogleSignIn from './GoogleSignIn.jsx';
import { guessCountry } from '../lib/guessCountry.js';

const PW_MIN = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// أشهر غلطات كتابة الدومين — "قصدك name@gmail.com؟" بضغطة
const DOMAIN_FIX = {
  'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com',
  'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com', 'gmail.om': 'gmail.com', 'gmali.com': 'gmail.com',
  'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmail.con': 'hotmail.com',
  'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'icloud.co': 'icloud.com', 'iclod.com': 'icloud.com',
};
function emailSuggestion(v) {
  const m = String(v || '').trim().toLowerCase().match(/^([^\s@]+)@([^\s@]+)$/);
  return m && DOMAIN_FIX[m[2]] ? `${m[1]}@${DOMAIN_FIX[m[2]]}` : '';
}

const finishAuth = (dispatch) => {
  // بنبدأ من صفحة بيضا: نمسح كاش الحساب اللي فات عشان الحساب الجديد يجيب بياناته هو
  dispatch(api.util.resetApiState());
  dispatch(closeAuthModal());
};

/* ───────────── عناصر الفورم ───────────── */

function Hint({ tone, children, id }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {children ? (
        <motion.p
          key={String(tone) + String(typeof children === 'string' ? children : 'x')}
          id={id}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`flex items-start gap-1.5 pt-1.5 text-[12.5px] leading-snug ${
            tone === 'error' ? 'text-error' : tone === 'ok' ? 'text-ok' : 'text-ink-dim'
          }`}
          role={tone === 'error' ? 'alert' : undefined}
        >
          {tone === 'error' && <AlertCircle size={13} className="mt-[2px] shrink-0" />}
          <span>{children}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

/** خانة بأيقونة + عنوان + رسالة تحتها */
function Field({ label, optional, icon: Icon, error, ok, hint, hintTone, end, children, name }) {
  const { t } = useTranslation();
  const tone = error ? 'error' : ok ? 'ok' : '';
  return (
    <div data-field={name}>
      <label className="mb-1 flex items-baseline justify-between text-[13px] font-bold text-ink/80">
        <span>{label}</span>
        {optional && <span className="text-[11.5px] font-normal text-ink-dim">{t('auth.optional')}</span>}
      </label>
      <div
        className={`group relative flex items-center rounded-2xl border bg-white transition-[border-color,box-shadow] duration-150
          focus-within:shadow-[0_0_0_4px_rgba(31,111,92,.12)]
          ${tone === 'error' ? 'border-error/70 focus-within:border-error focus-within:shadow-[0_0_0_4px_rgba(217,97,79,.12)]'
            : tone === 'ok' ? 'border-ok/50 focus-within:border-emerald' : 'border-line focus-within:border-emerald'}`}
      >
        {Icon && (
          <Icon size={17} className={`pointer-events-none absolute start-3.5 transition-colors ${
            tone === 'error' ? 'text-error' : 'text-ink-dim/70 group-focus-within:text-emerald'}`} />
        )}
        {children}
        {end || (ok && !error ? (
          <span className="pointer-events-none absolute end-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-ok text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        ) : null)}
      </div>
      <Hint tone={error ? 'error' : hintTone}>{error || hint}</Hint>
    </div>
  );
}

// 16px بالظبط (text-base) — أقل من كده الآيفون بيعمل زوم
const inputCls = 'h-[46px] w-full rounded-2xl bg-transparent ps-11 pe-11 text-base text-ink outline-none placeholder:text-ink-dim/45';

function PasswordInput({ registerProps, autoComplete, ...rest }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <>
      <input
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        className={inputCls}
        dir="ltr"
        {...rest}
        {...registerProps}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
        className="absolute inset-y-0 end-1.5 flex items-center px-2 text-ink-dim hover:text-ink"
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </>
  );
}

function SubmitButton({ loading, children }) {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.language === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative flex h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-night text-[15px] font-extrabold text-ivory
        shadow-[0_10px_24px_-12px_rgba(8,19,15,.7)] transition hover:bg-emerald active:scale-[.985] disabled:cursor-wait disabled:opacity-80"
    >
      {loading ? (
        <><Loader2 size={18} className="animate-spin" /> {t('auth.wait')}</>
      ) : (
        <>{children} <Arrow size={17} /></>
      )}
    </button>
  );
}

/** رسالة من السيرفر فوق الزرار (باسورد غلط، الحساب متوقف…) */
function ServerError({ message, action }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2 rounded-2xl bg-error/[0.08] px-3.5 py-2.5 text-[13px] leading-relaxed text-error" role="alert" data-auth-error>
            <AlertCircle size={16} className="mt-[2px] shrink-0" />
            <div className="min-w-0">
              <span>{message}</span>
              {action}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function emailRules(t) {
  return {
    required: t('auth.emailReq'),
    validate: (v) => EMAIL_RE.test(String(v || '').trim()) || t('auth.emailBad'),
  };
}

function EmailField({ register, errors, control, setValue, autoFocus, extraError }) {
  const { t } = useTranslation();
  const value = useWatch({ control, name: 'email' }) || '';
  const fix = emailSuggestion(value);
  const valid = EMAIL_RE.test(value.trim());
  return (
    <Field
      name="email"
      label={t('auth.email')}
      icon={Mail}
      error={errors.email?.message || extraError}
      ok={valid && !fix && !extraError}
      hint={fix ? (
        <button
          type="button"
          onClick={() => setValue('email', fix, { shouldValidate: true })}
          className="font-bold text-emerald underline underline-offset-2"
          data-email-fix
        >
          {t('auth.emailFix', { email: fix })}
        </button>
      ) : null}
    >
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus={autoFocus}
        dir="ltr"
        placeholder="name@gmail.com"
        className={`${inputCls} text-start`}
        {...register('email', emailRules(t))}
      />
    </Field>
  );
}

/* ───────────── الدخول ───────────── */

function LoginForm({ presetEmail }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    mode: 'onTouched',
    defaultValues: { email: presetEmail || '', password: '' },
  });
  const [login, { isLoading, error, reset }] = useLoginMutation();
  const pwRef = useRef(null);
  const pwReg = register('password', { required: t('auth.pwReq') });

  // جاي من "الإيميل ده عليه حساب — ادخل بيه": الإيميل مكتوب، فنقف على الباسورد
  useEffect(() => { if (presetEmail && pwRef.current) pwRef.current.focus(); }, [presetEmail]);

  async function onSubmit(values) {
    try {
      await login({ email: values.email.trim(), password: values.password }).unwrap();
      finishAuth(dispatch);
    } catch { /* الخطأ بيتعرض تحت */ }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} onChange={() => { if (error) reset(); }} className="space-y-3.5" data-login-form>
      <EmailField register={register} errors={errors} control={control} setValue={setValue} />
      <Field name="password" label={t('auth.password')} icon={Lock} error={errors.password?.message} end={<span />}>
        <PasswordInput
          autoComplete="current-password"
          registerProps={{ ...pwReg, ref: (el) => { pwReg.ref(el); pwRef.current = el; } }}
        />
      </Field>
      <ServerError message={error?.data?.error || (error ? t('auth.netError') : '')} />
      <SubmitButton loading={isLoading}>{t('auth.submitLogin')}</SubmitButton>
    </form>
  );
}

/* ───────────── حساب جديد ───────────── */

function PasswordStrength({ control }) {
  const { t } = useTranslation();
  const pw = useWatch({ control, name: 'password' }) || '';
  const left = Math.max(0, PW_MIN - pw.length);
  return (
    <div className="pt-2" data-pw-meter>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: PW_MIN }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < pw.length ? (left === 0 ? 'bg-ok' : 'bg-brass') : 'bg-ink/10'}`}
          />
        ))}
      </div>
    </div>
  );
}

function RegisterForm({ onEmailTaken }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', password: '', country: guessCountry() || undefined },
  });
  const [doRegister, { isLoading, error, reset }] = useRegisterMutation();
  const pw = useWatch({ control, name: 'password' }) || '';
  const name = useWatch({ control, name: 'name' }) || '';
  const left = Math.max(0, PW_MIN - pw.length);
  const serverMsg = error?.data?.error || '';
  const emailTaken = error?.status === 409 && /الإيميل/.test(serverMsg);
  const phoneTaken = error?.status === 409 && /التليفون/.test(serverMsg);

  async function onSubmit(values) {
    try {
      const res = await doRegister({ ...values, email: values.email.trim(), name: values.name.trim() }).unwrap();
      finishAuth(dispatch);
      // شاشة الترحيب مكان فورم التسجيل على طول — من غير أي فراغ بينهم
      dispatch(showWelcome((res && res.user && res.user.name) || values.name || ''));
      if (res && res.user) pixelTrack('CompleteRegistration', { content_name: 'email' }, 'signup', 'reg_' + res.user.id);
    } catch { /* الخطأ بيتعرض تحت */ }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} onChange={() => { if (error) reset(); }} className="space-y-3.5" data-register-form>
      <Field name="name" label={t('auth.name')} icon={User} error={errors.name?.message} ok={name.trim().length >= 2}>
        <input
          type="text"
          autoComplete="name"
          maxLength={80}
          className={inputCls}
          {...register('name', { validate: (v) => String(v || '').trim().length > 0 || t('auth.nameReq') })}
        />
      </Field>

      <EmailField
        register={register}
        errors={errors}
        control={control}
        setValue={setValue}
        extraError={emailTaken ? (
          <>
            {t('auth.emailTaken')}{' '}
            <button
              type="button"
              className="font-extrabold underline underline-offset-2"
              onClick={() => onEmailTaken(String(getValues('email') || '').trim())}
              data-login-instead
            >
              {t('auth.loginInstead')}
            </button>
          </>
        ) : null}
      />

      <Field
        name="password"
        label={t('auth.passwordHint')}
        icon={Lock}
        error={errors.password?.message}
        hint={pw.length === 0 ? t('auth.pwRule') : left > 0 ? t('auth.pwLeft', { n: left }) : t('auth.pwOk')}
        hintTone={left === 0 && pw.length ? 'ok' : ''}
        end={<span />}
      >
        <PasswordInput
          autoComplete="new-password"
          registerProps={register('password', {
            required: t('auth.pwReq'),
            validate: (v) => String(v || '').length >= PW_MIN || t('auth.pwLeft', { n: PW_MIN - String(v || '').length }),
          })}
        />
      </Field>
      <div className="-mt-3"><PasswordStrength control={control} /></div>

      <div data-field="country">
        <label className="mb-1 block text-[13px] font-bold text-ink/80">{t('auth.country')}</label>
        <Controller
          name="country"
          control={control}
          rules={{ required: t('auth.countryRequired') }}
          render={({ field }) => <CountrySelect value={field.value} onChange={field.onChange} invalid={!!errors.country} />}
        />
        <Hint tone="error">{errors.country?.message}</Hint>
      </div>

      <Field
        name="phone"
        label={t('auth.phone').replace(/\s*\(.*\)\s*$/, '')}
        optional
        icon={Phone}
        error={errors.phone?.message || (phoneTaken ? serverMsg : '')}
      >
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={30}
          dir="ltr"
          placeholder="01xxxxxxxxx"
          className={`${inputCls} text-start`}
          {...register('phone', {
            validate: (v) => {
              const d = String(v || '').replace(/\D/g, '');
              return d.length === 0 || d.length >= 8 || t('auth.phoneShort');
            },
          })}
        />
      </Field>

      <ServerError message={emailTaken || phoneTaken ? '' : serverMsg} />
      <SubmitButton loading={isLoading}>{t('auth.submitRegister')}</SubmitButton>
      <p className="text-center text-[11.5px] leading-relaxed text-ink-dim">
        <Trans
          i18nKey="auth.agree"
          components={[
            <Link key="t" to="/terms" target="_blank" className="font-bold text-ink/70 underline underline-offset-2" />,
            <Link key="p" to="/privacy" target="_blank" className="font-bold text-ink/70 underline underline-offset-2" />,
          ]}
        />
      </p>
    </form>
  );
}

/* ───────────── بعد جوجل (عميل جديد) ───────────── */

// خطوة واحدة بعد جوجل للعميل الجديد بس: الدولة (متختارة جاهزة من جهازه —
// بتحدد العملة) + واتساب اختياري. الاسم والإيميل جايين من جوجل.
function GoogleCompleteForm({ pending, profile, onBack }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    mode: 'onTouched',
    defaultValues: { name: profile.name || '', country: guessCountry() || undefined, phone: '' },
  });
  const [complete, { isLoading, error, reset }] = useGoogleCompleteMutation();
  const serverMsg = error?.data?.error || '';
  const phoneTaken = error?.status === 409 && /التليفون/.test(serverMsg);

  async function onSubmit(values) {
    try {
      const res = await complete({ pending, ...values, name: values.name.trim() }).unwrap();
      finishAuth(dispatch);
      if (res && res.isNew) {
        dispatch(showWelcome((res.user && res.user.name) || values.name || ''));
        if (res.user) pixelTrack('CompleteRegistration', { content_name: 'google' }, 'signup', 'reg_' + res.user.id);
      }
    } catch { /* الخطأ بيتعرض تحت */ }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} onChange={() => { if (error) reset(); }} className="space-y-3.5" data-google-complete>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-line">
          <GoogleG />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold text-ink">{t('auth.google.hello', { name: (profile.name || '').split(' ')[0] || '' })}</span>
          <span className="block truncate text-[12px] text-ink-dim" dir="ltr">{profile.email}</span>
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok text-white"><Check size={12} strokeWidth={3} /></span>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-dim">{t('auth.google.lastStep')}</p>

      <Field name="name" label={t('auth.name')} icon={User} error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          maxLength={80}
          className={inputCls}
          {...register('name', { validate: (v) => String(v || '').trim().length > 0 || t('auth.nameReq') })}
        />
      </Field>
      <div data-field="country">
        <label className="mb-1 block text-[13px] font-bold text-ink/80">{t('auth.country')}</label>
        <Controller
          name="country"
          control={control}
          rules={{ required: t('auth.countryRequired') }}
          render={({ field }) => <CountrySelect value={field.value} onChange={field.onChange} invalid={!!errors.country} />}
        />
        <Hint tone="error">{errors.country?.message}</Hint>
      </div>
      <Field
        name="phone"
        label={t('auth.phone').replace(/\s*\(.*\)\s*$/, '')}
        optional
        icon={Phone}
        error={errors.phone?.message || (phoneTaken ? serverMsg : '')}
      >
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={30}
          dir="ltr"
          placeholder="01xxxxxxxxx"
          className={`${inputCls} text-start`}
          {...register('phone', {
            validate: (v) => {
              const d = String(v || '').replace(/\D/g, '');
              return d.length === 0 || d.length >= 8 || t('auth.phoneShort');
            },
          })}
        />
      </Field>
      <ServerError message={phoneTaken ? '' : serverMsg} />
      <SubmitButton loading={isLoading}>{t('auth.google.finish')}</SubmitButton>
      <button type="button" onClick={onBack} className="w-full text-center text-[13px] font-bold text-ink-dim underline-offset-4 hover:underline">
        {t('auth.google.back')}
      </button>
    </form>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
  );
}

/* ───────────── النافذة ───────────── */

export default function AuthModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const open = useSelector((s) => s.ui.authModalOpen);
  const tab = useSelector((s) => s.ui.authModalTab);
  // عميل جديد رجع من جوجل — بيكمّل خطوة الدولة/الواتساب مكان الفورمز
  const [googleNew, setGoogleNew] = useState(null);
  // "الإيميل ده عليه حساب — ادخل بيه": بننقل الإيميل لفورم الدخول
  const [presetEmail, setPresetEmail] = useState('');
  useEffect(() => { if (!open) { setGoogleNew(null); setPresetEmail(''); } }, [open]);

  // الصفحة ورا متتزحلقش وهي مفتوحة + Escape يقفلها
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') dispatch(closeAuthModal()); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, dispatch]);

  const isLogin = tab === 'login';
  const tabs = [
    { key: 'login', label: t('auth.loginTab') },
    { key: 'register', label: t('auth.registerTab') },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-night/60 backdrop-blur-[3px] sm:items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && dispatch(closeAuthModal())}
          data-auth-modal
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-ivory shadow-[0_-20px_60px_-20px_rgba(0,0,0,.45)]
              sm:max-h-[92dvh] sm:max-w-[420px] sm:rounded-[28px] sm:shadow-[0_30px_80px_-24px_rgba(0,0,0,.6)]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            {/* مقبض السحب على الموبايل — شكل بس */}
            <span className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />

            <div className="relative overflow-y-auto overscroll-contain px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3 sm:px-7 sm:pb-7 sm:pt-6">
              <button
                type="button"
                aria-label={t('auth.close')}
                onClick={() => dispatch(closeAuthModal())}
                className="absolute top-1.5 end-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink-dim transition hover:bg-ink/5 hover:text-ink sm:top-3.5 sm:end-3.5"
              >
                <X size={18} />
              </button>

              {googleNew ? (
                <GoogleCompleteForm pending={googleNew.pending} profile={googleNew.profile} onBack={() => setGoogleNew(null)} />
              ) : (
                <>
                  <div className="mb-4 pe-9 text-start">
                    <h2 id="auth-title" className="font-serif text-[21px] font-bold leading-tight text-ink sm:text-[24px]">
                      {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-ink-dim">{isLogin ? t('auth.loginSub') : t('auth.registerSub')}</p>
                  </div>

                  {/* اختيار دخول / حساب جديد */}
                  <div className="mb-4 grid grid-cols-2 rounded-2xl bg-ink/[0.06] p-1" role="tablist">
                    {tabs.map((x) => (
                      <button
                        key={x.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === x.key}
                        onClick={() => dispatch(openAuthModal(x.key))}
                        className={`relative h-9 rounded-xl text-[14px] font-bold transition-colors ${tab === x.key ? 'text-ink' : 'text-ink-dim hover:text-ink'}`}
                        data-auth-tab={x.key}
                      >
                        {tab === x.key && (
                          <motion.span
                            layoutId="auth-tab-pill"
                            className="absolute inset-0 rounded-xl bg-white shadow-[0_2px_8px_-2px_rgba(8,19,15,.18)]"
                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                          />
                        )}
                        <span className="relative">{x.label}</span>
                      </button>
                    ))}
                  </div>

                  <GoogleSignIn onNeedsProfile={setGoogleNew} />

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                    >
                      {isLogin ? (
                        <LoginForm presetEmail={presetEmail} />
                      ) : (
                        <RegisterForm onEmailTaken={(email) => { setPresetEmail(email); dispatch(openAuthModal('login')); }} />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <p className="mt-4 text-center text-[13px] text-ink-dim">
                    {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => dispatch(openAuthModal(isLogin ? 'register' : 'login'))}
                      className="font-extrabold text-emerald hover:underline"
                    >
                      {isLogin ? t('auth.createOne') : t('auth.loginLink')}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
