// صفحة "حسابك" لوحدها (/account) — بتتفتح من أيقونة الحساب جنب التحية في
// اللوحة: الاسم والموبايل، الباسورد، الأجهزة، والخروج.
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowRight, LogOut } from 'lucide-react';
import { api, useGetMeQuery, useLogoutMutation } from '../store/api.js';
import { showFlash } from '../store/uiSlice.js';
import AccountPanel from '../components/dashboard/AccountPanel.jsx';
import Footer from '../components/Footer.jsx';

export default function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: me, isLoading } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  async function signOut() {
    try { await logout().unwrap(); } catch { /* */ }
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch { /* */ }
    navigate('/', { replace: true });
    dispatch(api.util.resetApiState());
    window.scrollTo(0, 0);
    dispatch(showFlash(t('auth.loggedOut')));
  }

  if (!isLoading && !me?.user) {
    return (
      <div className="p-16 text-center text-ink-dim">
        {t('dash.needLogin')} <Link to="/" className="text-rose underline">{t('packages.back')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory" data-account-page>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Link to="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-rose" data-back-dashboard>
          <ArrowRight size={15} /> {t('dash2.backToDash')}
        </Link>
        <AccountPanel />
        <button type="button" onClick={signOut} data-signout
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a2465e]/30 bg-card py-3 text-[13.5px] font-bold text-[#a2465e] transition hover:bg-[#a2465e]/[0.06]">
          <LogOut size={15} /> {t('nav.logout')}
        </button>
      </div>
      <Footer />
    </div>
  );
}
