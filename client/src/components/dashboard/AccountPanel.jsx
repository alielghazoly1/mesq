// "حسابك": الاسم والموبايل، تغيير الباسورد (أو إضافة واحد لحساب جوجل)،
// والخروج من كل الأجهزة التانية.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserRound, Mail, Phone, KeyRound, Eye, EyeOff, Check, Loader2, ShieldCheck, LogOut, MonitorSmartphone,
} from 'lucide-react';
import {
  useGetAccountQuery, useUpdateAccountMutation, useChangePasswordMutation, useLogoutOthersMutation,
} from '../../store/api.js';
import { initials } from './dashUtils.js';

const input = 'w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-base text-ink placeholder:text-ink-dim/60 focus:border-brass focus:outline-none sm:text-[14px]';

function Pw({ value, onChange, placeholder, autoComplete, testId }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        autoComplete={autoComplete} className={`${input} pe-11`} data-pw={testId} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-dim hover:text-ink" aria-label="show">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function AccountPanel() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetAccountQuery();
  const [update, { isLoading: saving }] = useUpdateAccountMutation();
  const [changePw, { isLoading: changing }] = useChangePasswordMutation();
  const [logoutOthers, { isLoading: loggingOut }] = useLogoutOthersMutation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [devMsg, setDevMsg] = useState('');

  useEffect(() => { if (data) { setName(data.name); setPhone(data.phone); } }, [data]);

  if (isLoading || !data) return <div className="grid place-items-center rounded-[26px] border border-line bg-card py-12"><Loader2 className="animate-spin text-ink-dim" /></div>;

  const dirty = name.trim() !== data.name || phone.trim() !== data.phone;
  const pwLeft = Math.max(0, 6 - next.length);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await update({ name: name.trim(), phone: phone.trim() }).unwrap();
      setProfileMsg({ ok: true, text: t('dash2.saved') });
      setTimeout(() => setProfileMsg(null), 2500);
    } catch (err) { setProfileMsg({ ok: false, text: err?.data?.error || t('dash2.saveFailed') }); }
  }

  async function savePw(e) {
    e.preventDefault();
    setPwMsg(null);
    if (next.length < 6) { setPwMsg({ ok: false, text: t('auth.pwLeft', { n: pwLeft }) }); return; }
    try {
      const r = await changePw({ current: cur, next }).unwrap();
      setCur(''); setNext('');
      setPwMsg({ ok: true, text: r.loggedOutOthers ? t('dash2.pwChangedOthers', { count: r.loggedOutOthers }) : t('dash2.pwChanged') });
    } catch (err) { setPwMsg({ ok: false, text: err?.data?.error || t('dash2.saveFailed') }); }
  }

  async function signOutOthers() {
    try {
      const r = await logoutOthers().unwrap();
      setDevMsg(r.loggedOut ? t('dash2.loggedOutN', { count: r.loggedOut }) : t('dash2.noOtherDevices'));
    } catch { setDevMsg(t('dash2.saveFailed')); }
  }

  return (
    <section className="rounded-[26px] border border-line bg-card p-5 sm:p-6" data-account>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-night font-serif text-[18px] font-bold text-brass-soft">{initials(data.name)}</span>
        <div className="min-w-0">
          <h2 className="font-serif text-[19px] font-bold text-ink">{t('dash2.accountTitle')}</h2>
          <p className="truncate text-[12.5px] text-ink-dim">
            {data.email}{data.google && <span className="ms-2 rounded-full bg-[#4285f4]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#4285f4]">Google</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* البيانات */}
        <form onSubmit={saveProfile} className="space-y-3 rounded-2xl border border-line bg-ivory/40 p-4" data-profile-form>
          <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><UserRound size={14} className="text-brass" /> {t('dash2.profile')}</div>
          <label className="block">
            <span className="mb-1 block text-[11.5px] font-bold text-ink-dim">{t('dash2.fName')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={input} data-field-name />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11.5px] font-bold text-ink-dim">{t('dash2.fEmail')}</span>
            <div className={`${input} flex items-center gap-2 bg-ink/[0.03] text-ink-dim`}><Mail size={14} /> <span className="truncate" dir="ltr">{data.email}</span></div>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11.5px] font-bold text-ink-dim">{t('dash2.fPhone')}</span>
            <div className="relative">
              <Phone size={14} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-dim" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" dir="ltr" placeholder="01xxxxxxxxx" className={`${input} ps-9 text-start`} data-field-phone />
            </div>
          </label>
          {profileMsg && <p className={`text-[12px] font-bold ${profileMsg.ok ? 'text-[#1f7a4d]' : 'text-[#a2465e]'}`} data-profile-msg>{profileMsg.text}</p>}
          <button type="submit" disabled={!dirty || saving} data-profile-save
            className="inline-flex items-center gap-1.5 rounded-full bg-night px-5 py-2.5 text-[13px] font-bold text-ivory transition hover:bg-emerald disabled:opacity-40">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {t('dash2.saveChanges')}
          </button>
        </form>

        {/* الباسورد والأجهزة */}
        <div className="space-y-4">
          <form onSubmit={savePw} className="space-y-3 rounded-2xl border border-line bg-ivory/40 p-4" data-pw-form>
            <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink"><KeyRound size={14} className="text-brass" /> {data.hasPassword ? t('dash2.changePw') : t('dash2.addPw')}</div>
            {!data.hasPassword && <p className="text-[12px] leading-relaxed text-ink-dim">{t('dash2.addPwNote')}</p>}
            {data.hasPassword && <Pw value={cur} onChange={setCur} placeholder={t('dash2.curPw')} autoComplete="current-password" testId="current" />}
            <Pw value={next} onChange={setNext} placeholder={t('dash2.newPw')} autoComplete="new-password" testId="next" />
            {next && (
              <p className={`text-[11.5px] font-bold ${pwLeft ? 'text-ink-dim' : 'text-[#1f7a4d]'}`}>{pwLeft ? t('auth.pwLeft', { n: pwLeft }) : t('auth.pwOk')}</p>
            )}
            {pwMsg && <p className={`text-[12px] font-bold ${pwMsg.ok ? 'text-[#1f7a4d]' : 'text-[#a2465e]'}`} data-pw-msg>{pwMsg.text}</p>}
            <button type="submit" disabled={changing || !next || (data.hasPassword && !cur)} data-pw-save
              className="inline-flex items-center gap-1.5 rounded-full bg-night px-5 py-2.5 text-[13px] font-bold text-ivory transition hover:bg-emerald disabled:opacity-40">
              {changing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} {data.hasPassword ? t('dash2.changePw') : t('dash2.addPw')}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-ivory/40 p-4" data-devices>
            <MonitorSmartphone size={18} className="text-brass" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-extrabold text-ink">{t('dash2.devicesNow', { count: data.sessions })}</div>
              <div className="text-[11.5px] text-ink-dim">{devMsg || t('dash2.devicesNote')}</div>
            </div>
            <button type="button" onClick={signOutOthers} disabled={loggingOut} data-logout-others
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12px] font-bold text-ink transition hover:border-[#a2465e]/50 hover:text-[#a2465e] disabled:opacity-50">
              <LogOut size={13} /> {t('dash2.logoutOthers')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
