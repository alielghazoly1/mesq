// لوحة التحكم — /admin
//
// التطبيق كله بيتحمّل كسول (React.lazy في App.jsx)، فزائر الموقع العادي
// عمره ما ينزّل كود اللوحة ولا مكتبة الرسوم البيانية.
//
// اللوحة دايمًا عربي RTL بغض النظر عن لغة الموقع — واحد بيستخدمها، وهي
// إنت.
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard, Users, Receipt, FileText, MessageSquare,
  Settings, ScrollText, LogOut, Loader2, Menu, X, Music, BadgePercent, Wallet, Banknote, Megaphone, LayoutTemplate, Tags, Bug, ShieldCheck, Eraser, MessageCircle, Target, ReceiptText, Activity, CalendarCheck, Radio, Pin,
} from 'lucide-react';
import { adminApi, useGetOrdersAttentionQuery, useGetSupportUnreadQuery, useGetSecurityQuery, useGetPinsQuery } from '../../store/adminApi.js';
import AdminLogin from './AdminLogin.jsx';
import { LOCK_EVENT } from '../../lib/adminActivity.js';
import OverviewPage from './OverviewPage.jsx';
import ClientsPage from './ClientsPage.jsx';
import OrdersPage from './OrdersPage.jsx';
import EarningsPage from './EarningsPage.jsx';
import AnalyticsPage from './AnalyticsPage.jsx';
import OrdersDayPage from './OrdersDayPage.jsx';
import LiveJourneysPage from './LiveJourneysPage.jsx';
import ExpensesPage from './ExpensesPage.jsx';
import WithdrawalsPage from './WithdrawalsPage.jsx';
import UgcPage from './UgcPage.jsx';
import TemplatesPage from './TemplatesPage.jsx';
import InvitationsPage from './InvitationsPage.jsx';
import MusicPage from './MusicPage.jsx';
import SupportPage from './SupportPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import DiscountsPanel from './DiscountsPanel.jsx';
import PackagesPricesPage from './PackagesPricesPage.jsx';
import ClientErrorsPage from './ClientErrorsPage.jsx';
import AuditPage from './AuditPage.jsx';
import SecurityPage from './SecurityPage.jsx';
import CleanupPage from './CleanupPage.jsx';
import WhatsAppPage from './WhatsAppPage.jsx';
import CampaignsPage from './CampaignsPage.jsx';
import PinnedPage from './PinnedPage.jsx';
import LiveFloat from '../../components/admin/LiveFloat.jsx';

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'نظرة عامة' },
  { to: '/admin/pinned', icon: Pin, label: 'المثبّتين', badge: 'pins' },
  { to: '/admin/live', icon: Radio, label: 'مباشر' },
  { to: '/admin/analytics', icon: Activity, label: 'التحليلات' },
  { to: '/admin/earnings', icon: Wallet, label: 'الأرباح' },
  { to: '/admin/expenses', icon: ReceiptText, label: 'المصاريف' },
  { to: '/admin/campaigns', icon: Target, label: 'الإعلانات' },
  { to: '/admin/withdrawals', icon: Banknote, label: 'طلبات السحب' },
  { to: '/admin/ugc', icon: Megaphone, label: 'المسوّقين' },
  { to: '/admin/clients', icon: Users, label: 'العملاء' },
  { to: '/admin/orders', icon: Receipt, label: 'الطلبات', badge: 'orders' },
  { to: '/admin/orders-day', icon: CalendarCheck, label: 'طلبات اليوم' },
  { to: '/admin/invitations', icon: FileText, label: 'الدعوات' },
  { to: '/admin/templates', icon: LayoutTemplate, label: 'القوالب' },
  { to: '/admin/music', icon: Music, label: 'الموسيقى' },
  { to: '/admin/support', icon: MessageSquare, label: 'الدعم', badge: 'support' },
  { to: '/admin/packages', icon: Tags, label: 'الباقات والأسعار' },
  { to: '/admin/discounts', icon: BadgePercent, label: 'الخصومات' },
  { to: '/admin/settings', icon: Settings, label: 'بيانات الدفع' },
  { to: '/admin/whatsapp', icon: MessageCircle, label: 'واتساب' },
  { to: '/admin/cleanup', icon: Eraser, label: 'تنضيف الدعوات' },
  { to: '/admin/security', icon: ShieldCheck, label: 'الأمان' },
  { to: '/admin/audit', icon: ScrollText, label: 'سجل الإجراءات' },
  { to: '/admin/errors', icon: Bug, label: 'أعطال الواجهة' },
];

// عدد الإيصالات اللي مستنية تفعيل جنب "الطلبات" — بيتحدّث لوحده كل 30
// ثانية، فأي عميل يرفع إيصال تشوفه من أي صفحة في اللوحة.
/**
 * اللوحة بتفضل مفتوحة على جهازك — فأهم حماية بقت: إن محدش يقدر يدخل
 * بكلمة السر لوحدها. لو التحقق بخطوتين مش مفعّل، شريط أحمر فوق كل صفحة.
 */
function TwoFactorBanner() {
  const { data } = useGetSecurityQuery();
  if (!data || data.enabled) return null;
  return (
    <NavLink to="/admin/security" data-2fa-banner
      className="mb-4 flex items-center gap-3 rounded-2xl border border-error/50 bg-error/15 px-4 py-3 text-[13px] font-bold text-[#f3b4a8] hover:bg-error/20">
      <ShieldCheck size={18} className="shrink-0" />
      <span className="flex-1">التحقق بخطوتين مش مفعّل — أي حد يعرف كلمة السر يقدر يدخل اللوحة. فعّله دلوقتي (دقيقة واحدة).</span>
      <span className="shrink-0 rounded-full bg-error/30 px-3 py-1 text-[12px]">فعّله ←</span>
    </NavLink>
  );
}

// عدد المثبّتين جنب "المثبّتين" (بلون هادي — مش تنبيه)
function PinsBadge() {
  const { data } = useGetPinsQuery();
  const n = (data?.users?.length || 0) + (data?.invitations?.length || 0);
  if (!n) return null;
  return (
    <span className="ms-auto min-w-[20px] rounded-full bg-ivory/[0.08] px-1.5 py-0.5 text-center text-[10.5px] font-bold leading-none text-ivory/60" data-pins-count>
      {n}
    </span>
  );
}

function OrdersBadge() {
  const { data } = useGetOrdersAttentionQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const n = data?.review || 0;
  if (!n) return null;
  return (
    <span
      className="ms-auto min-w-[20px] rounded-full bg-brass px-1.5 py-0.5 text-center text-[10.5px] font-bold leading-none text-[#241608]"
      title={`${n} إيصال مستني تفعيل`}
    >
      {n > 99 ? '99+' : n}
    </span>
  );
}

// رسايل الدعم الجديدة جنب "الدعم" — من أي صفحة في اللوحة، كل 15 ثانية.
// والعدد بيتكتب في عنوان التاب "(3)"، ولما توصل رسالة جديدة بيرن صوت خفيف.
function ding() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const now = ac.currentTime;
    [[880, 0], [1320, 0.12]].forEach(([hz, at]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = hz;
      g.gain.setValueAtTime(0.0001, now + at);
      g.gain.exponentialRampToValueAtTime(0.12, now + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.35);
      o.connect(g).connect(ac.destination);
      o.start(now + at);
      o.stop(now + at + 0.4);
    });
    setTimeout(() => ac.close().catch(() => {}), 900);
  } catch { /* الصوت إضافة — مش مهم لو مااشتغلش */ }
}

// "(3) " في أول عنوان التاب
const TITLE_COUNT = /^\(\d+\+?\)\s*/;

function SupportBadge() {
  const { data } = useGetSupportUnreadQuery(undefined, { pollingInterval: 15000 });
  const n = data?.unread || 0;
  const prev = useRef(null);
  useEffect(() => {
    if (prev.current != null && n > prev.current) ding();
    prev.current = n;
    const base = document.title.replace(TITLE_COUNT, '');
    document.title = n > 0 ? `(${n > 99 ? '99+' : n}) ${base}` : base;
  }, [n]);
  useEffect(() => () => { document.title = document.title.replace(TITLE_COUNT, ''); }, []);
  if (!n) return null;
  return (
    <span
      className="relative ms-auto min-w-[20px] rounded-full bg-error px-1.5 py-0.5 text-center text-[10.5px] font-bold leading-none text-white"
      title={`${n} رسالة جديدة من ${data.people} عميل`}
      data-support-badge
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-error/50 [animation-duration:2s]" />
      <span className="relative">{n > 99 ? '99+' : n}</span>
    </span>
  );
}

export default function AdminApp() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [auth, setAuth] = useState(null); // null = بنشيك لسه
  const [lockNotice, setLockNotice] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await fetch('/admin/session', { credentials: 'include' });
      const data = await res.json();
      setAuth(!!data.authenticated);
    } catch {
      setAuth(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  // اللوحة بتفضل مفتوحة على جهازك (بطلب المالك). بس لو الجلسة اتقفلت من
  // السيرفر (قفلتها من جهاز تاني، أو اتستخدمت من جهاز غريب) أي طلب بيرجع
  // 401 → الشاشة تتقفل على طول وبيانات العملاء تتمسح من الذاكرة.
  useEffect(() => {
    if (!auth) return undefined;
    const onLocked = () => {
      dispatch(adminApi.util.resetApiState());
      setLockNotice('الجلسة على الجهاز ده اتقفلت — ادخل تاني.');
      setAuth(false);
    };
    window.addEventListener(LOCK_EVENT, onLocked);
    return () => window.removeEventListener(LOCK_EVENT, onLocked);
  }, [auth, dispatch]);

  // اللوحة عربي دايمًا — بنظبط الاتجاه على الصفحة نفسها ونرجّعه زي ما كان
  // لما نخرج منها، عشان مانلخبطش لغة الموقع لو المستخدم كان بالإنجليزي.
  useEffect(() => {
    const prevDir = document.documentElement.dir;
    const prevLang = document.documentElement.lang;
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.classList.add('bg-night');
    return () => {
      document.documentElement.dir = prevDir;
      document.documentElement.lang = prevLang;
      document.body.classList.remove('bg-night');
    };
  }, []);

  // قفل القايمة الجانبية بعد أي تنقل على الموبايل
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  async function logout() {
    await fetch('/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Admin-Request': '1' },
    }).catch(() => {});
    // مسح كل الكاش عشان بيانات العملاء متفضلش في الذاكرة بعد الخروج
    dispatch(adminApi.util.resetApiState());
    setAuth(false);
  }

  if (auth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-night text-[13px] text-ivory/50">
        <Loader2 size={16} className="animate-spin" /> بنتأكد من الجلسة...
      </div>
    );
  }

  if (!auth) return <AdminLogin notice={lockNotice} onSuccess={() => { dispatch(adminApi.util.resetApiState()); setLockNotice(''); setAuth(true); }} />;

  return (
    <div className="min-h-screen bg-night text-ivory" dir="rtl">
      <div className="mx-auto flex max-w-[1500px]">
        {/* القايمة الجانبية */}
        <aside
          data-admin-nav
          className={`fixed inset-y-0 start-0 z-40 w-[232px] shrink-0 border-e border-line-lite bg-panel transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            navOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-4 flex shrink-0 items-center justify-between px-2 pt-2">
              <div>
                <div className="font-serif text-[17px] font-bold text-brass-soft">ميثاق</div>
                <div className="text-[11px] text-ivory/35">لوحة التحكم</div>
              </div>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="text-ivory/50 hover:text-ivory lg:hidden"
              >
                <X size={17} />
              </button>
            </div>

            {/* الأقسام كتير — القايمة نفسها بتسكرول جوه الشريط (والشعار
                وزرار الخروج ثابتين)، فأي قسم توصله من غير ما حاجة تتقص */}
            <nav className="-me-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pe-2 [scrollbar-width:thin]">
              {NAV.map(({ to, end, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition ${
                      isActive
                        ? 'bg-brass/15 text-brass-soft'
                        : 'text-ivory/55 hover:bg-ivory/[0.05] hover:text-ivory'
                    }`}
                >
                  <Icon size={15} /> {label}
                  {badge === 'orders' && <OrdersBadge />}
                  {badge === 'support' && <SupportBadge />}
                  {badge === 'pins' && <PinsBadge />}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={logout}
              className="mt-2 flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-ivory/45 transition hover:bg-error/10 hover:text-error"
            >
              <LogOut size={15} /> خروج
            </button>
          </div>
        </aside>

        {navOpen && (
          <button
            type="button"
            aria-label="اقفل القايمة"
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}

        {/* المحتوى */}
        <main data-admin-main className="min-w-0 flex-1 p-5 transition-[padding] duration-300 lg:p-7">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-lite px-4 py-2 text-[12.5px] text-ivory/70 lg:hidden"
          >
            <Menu size={15} /> الأقسام
            {/* على الموبايل القايمة مقفولة — العداد يبان على الزرار نفسه */}
            <OrdersBadge />
          </button>

          <TwoFactorBanner />
          <Routes>
            <Route index element={<OverviewPage />} />
            <Route path="pinned" element={<PinnedPage />} />
            <Route path="live" element={<LiveJourneysPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="withdrawals" element={<WithdrawalsPage />} />
            <Route path="ugc" element={<UgcPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders-day" element={<OrdersDayPage />} />
            <Route path="invitations" element={<InvitationsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="music" element={<MusicPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="packages" element={<PackagesPricesPage />} />
            <Route path="errors" element={<ClientErrorsPage />} />
            <Route path="discounts" element={<DiscountsPanel />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="cleanup" element={<CleanupPage />} />
            <Route path="whatsapp" element={<WhatsAppPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        {/* المربع الطاير "على الموقع دلوقتي" — كل الصفحات ما عدا النظرة العامة، شاشات كبيرة بس */}
        {!/^\/admin\/?$/.test(location.pathname) && <LiveFloat />}
      </div>
    </div>
  );
}
