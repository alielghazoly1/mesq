import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { X, Mail, User as UserIcon } from 'lucide-react';
import { useLoginMutation, useRegisterMutation } from '../store/api.js';
import { closeAuthModal, openAuthModal, showWelcome } from '../store/uiSlice.js';
import CountrySelect from './form/CountrySelect.jsx';
import PhoneField from './form/PhoneField.jsx';
import PasswordField from './form/PasswordField.jsx';

const inputClass =
  'w-full rounded-lg border border-line px-3.5 py-2.5 text-[15px] text-ink focus:border-rose focus:outline-none';

/** إطار حقل بأيقونة على الجنب — الفورم بيبقى أوضح وأقل زحمة بصريًا */
function IconInput({ icon: Icon, ...inputProps }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 start-0 flex w-10 items-center justify-center text-ink-dim">
        <Icon size={16} />
      </span>
      <input {...inputProps} className={`${inputClass} ps-10`} />
    </div>
  );
}

function LoginForm() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { register, handleSubmit, control } = useForm({ defaultValues: { password: '' } });
  const [login, { isLoading, error }] = useLoginMutation();

  async function onSubmit(values) {
    try {
      await login(values).unwrap();
      dispatch(closeAuthModal());
    } catch {
      /* الخطأ بيتعرض تحت */
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.email')}</label>
        <IconInput
          icon={Mail}
          type="email"
          required
          autoComplete="email"
          {...register('email')}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.password')}</label>
        <Controller
          name="password"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <PasswordField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              autoComplete="current"
              showChecklist={false}
            />
          )}
        />
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
  const {
    register, handleSubmit, control, watch, formState,
  } = useForm({
    defaultValues: {
      name: '', email: '', password: '', country: '', phone: '',
    },
  });
  const [doRegister, { isLoading, error }] = useRegisterMutation();
  // نراقب الدولة عشان حقل التليفون يوري كود الاتصال الصح
  const country = watch('country');

  async function onSubmit(values) {
    try {
      const res = await doRegister(values).unwrap();
      dispatch(closeAuthModal());
      dispatch(showWelcome((res && res.user && res.user.name) || values.name || ''));
    } catch {
      /* الخطأ بيتعرض تحت */
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.name')}</label>
        <IconInput
          icon={UserIcon}
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          {...register('name')}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.email')}</label>
        <IconInput
          icon={Mail}
          type="email"
          required
          autoComplete="email"
          {...register('email')}
        />
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

      {/* اختياري — بس مفيد جدًا لينا (الأدمن) عشان نتواصل بواتساب */}
      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">
          {t('auth.phone')} <span className="text-ink-dim/60">({t('auth.optional')})</span>
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneField
              country={country}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('auth.phonePlaceholder')}
            />
          )}
        />
        <p className="text-[11.5px] text-ink-dim/80">{t('auth.phoneHint')}</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] text-ink-dim">{t('auth.password')}</label>
        <Controller
          name="password"
          control={control}
          rules={{ required: true, minLength: 8 }}
          render={({ field }) => (
            <PasswordField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              autoComplete="new"
            />
          )}
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

export default function AuthModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const open = useSelector((s) => s.ui.authModalOpen);
  const tab = useSelector((s) => s.ui.authModalTab);

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
            // على الموبايل: الفورم بيطلع في النص، بس بيسمح بالسكرول لو
            // اتطوّل — قبل كده كان بيقصّ آخر الحقول لو الشاشة صغيرة
            className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-[22px] bg-card p-8"
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

            {tab === 'login' ? <LoginForm /> : <RegisterForm />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
