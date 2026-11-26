import { Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import AuthBar from './components/AuthBar.jsx';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from './store/api.js';
import WelcomeGate from './components/WelcomeGate.jsx';
import OrderNoticeGate from './components/OrderNoticeGate.jsx';
import SupportLauncher from './components/SupportLauncher.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import FlashToast from './components/FlashToast.jsx';
import BottomNav from './components/BottomNav.jsx';
import PresencePing from './components/PresencePing.jsx';
import JourneyTracker from './components/JourneyTracker.jsx';
import { startCampaignBeacon } from './lib/campaignBeacon.js';
import GalleryPage from './pages/GalleryPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
// استيراد كسول بيعرف يصحّى نفسه بعد أي رفع جديد (الشرح جوه الملف)
import { lazyWithReload } from './lib/lazyWithReload.js';
import { importAuthModal, watchAuthIntent, preloadAuthModalOnFirstScroll } from './lib/authModalPreload.js';

// لوحة التحكم بتتحمّل كسول: زائر الموقع العادي عمره ما ينزّل كودها ولا
// مكتبة الرسوم البيانية اللي جواها (recharts).
const AdminApp = lazyWithReload(() => import('./pages/admin/AdminApp.jsx'), 'admin');

// باقي الصفحات كمان كسولة: الكود كله كان ملف واحد 1MB (المحرر لوحده
// تقيل جدًا)، وموبايل متوسط كان بيقعد ثواني يقرا الملف ده قبل ما يرسم
// الصفحة الرئيسية. دلوقتي الرئيسية بتنزّل كودها هي بس.
const importCreate = () => import('./pages/CreateInvitationPage.jsx');
const importPackages = () => import('./pages/PackagesPage.jsx');
const importCheckout = () => import('./pages/CheckoutPage.jsx');
const importDashboard = () => import('./pages/DashboardPage.jsx');
const importAccount = () => import('./pages/AccountPage.jsx');
const importEditor = () => import('./pages/EditorPage.jsx');
const CreateInvitationPage = lazyWithReload(importCreate, 'create');
const PackagesPage = lazyWithReload(importPackages, 'packages');
const CheckoutPage = lazyWithReload(importCheckout, 'checkout');
const DashboardPage = lazyWithReload(importDashboard, 'dashboard');
const AccountPage = lazyWithReload(importAccount, 'account');
const EditorPage = lazyWithReload(importEditor, 'editor');
// سياسة الخصوصية والشروط (جوجل بتطلب لينك الخصوصية للدخول بجوجل)
const LegalPage = lazyWithReload(() => import('./pages/LegalPage.jsx'), 'legal');
// معرض شغل كريم (منسّق حفلات، صاحب المالك) — صفحة مخفية مش متلينكة من أي حتة (pages/WeddingPlannerPage.jsx)
const WeddingPlannerPage = lazyWithReload(() => import('./pages/WeddingPlannerPage.jsx'), 'wedding-planner');

// نافذة الدخول/التسجيل فيها مكتبة الفورم وقايمة الدول — تقيلة ومش
// محتاجينها غير لما الزائر يدوس "دخول". بتتحمّل أول مرة تتفتح (أو قبلها
// على نيّة الضغط: lib/authModalPreload.js)، وبعدها بتفضل موجودة عشان أنيميشن القفل.
const AuthModal = lazyWithReload(importAuthModal, 'auth');
function AuthModalGate() {
  const open = useSelector((s) => s.ui.authModalOpen);
  const [needed, setNeeded] = useState(open);
  useEffect(() => { if (open) setNeeded(true); }, [open]);
  if (!needed) return null;
  return <Suspense fallback={null}><AuthModal /></Suspense>;
}

/** الزائر (مش داخل بحسابه) — ملف نافذة الدخول بيتحمّل على أول لمسة لزرار دخول/تسجيل، أو أول
 *  سكرول بإيده. المحرر ولوحة التحكم مفيهمش النافذة دي أصلًا فمش بنحمّلها هناك على السكرول. */
function useAuthModalWarmup(isFullScreen) {
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const guest = !meLoading && !me?.user;
  useEffect(() => watchAuthIntent(), []);
  useEffect(() => (guest && !isFullScreen ? preloadAuthModalOnFirstScroll() : undefined), [guest, isFullScreen]);
}

/** بعد ما الصفحة تخلص تحميل ويبقى المتصفح فاضي، بنجهّز الصفحات اللي
 *  العميل غالبًا هيروحها — فالتنقّل بيفضل فوري زي الأول. */
// زيارة جاية من لينك إعلان؟ نأكّد إن شخص حقيقي شاف الصفحة (lib/campaignBeacon.js)
startCampaignBeacon();

function usePrefetchPages() {
  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const loggedIn = !!me?.user;
  useEffect(() => {
    if (meLoading) return undefined;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      // المحرر: شغل تقيل على الشاشة (المعاينة وصورها) — مفيش داعي ننزّل صفحات تانية جنبه
      if (window.location.pathname.startsWith('/editor/')) return;
      // على شبكة موفّرة للبيانات أو بطيئة (لحد 3G — أغلب الموبايلات في مصر) مبنحمّلش حاجة زيادة:
      // التحميل ده كان بيزاحم الصفحة المفتوحة نفسها على النت
      const c = navigator.connection;
      if (c && (c.saveData || /^(slow-2g|2g|3g)$/.test(c.effectiveType || ''))) return;
      // زائر مش مسجّل: نافذة الدخول والباقات بس (دول اللي هيدوس عليهم). لوحة العميل والدفع
      // (ومعاهم مكتبة الرسوم، ~0.5 ميجا) للّي داخل بحسابه — كانوا بينزلوا ويتنفّذوا لكل زائر
      // في نفس اللحظة اللي الصفحة بتنزل فيها للمعرض، فالحركة كانت بتعلّق.
      // اللي داخل بحسابه مش محتاج نافذة الدخول (~100KB) — مابتتحمّلش له غير لو فتحها فعلًا.
      const list = loggedIn
        ? [importPackages, importDashboard, importCreate, importCheckout]
        : [importAuthModal, importPackages];
      list.forEach((f) => f().catch(() => {}));
    };
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500));
    let timer = 0;
    // بعد ما الصفحة تهدى (والنزول التلقائي على الموبايل يخلص)
    const start = () => { timer = window.setTimeout(() => idle(run, { timeout: 6000 }), loggedIn ? 1500 : 12000); };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener('load', start); };
  }, [loggedIn]);
}

/** شاشة انتظار خفيفة لحد ما كود الصفحة يوصل (غالبًا مش بتلحق تبان) */
function PageFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-brass/25 border-t-brass" />
    </div>
  );
}

export default function App() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  // أي انتقال لصفحة جديدة (زي "اشترك للاستخدام" → الباقات) بيبدأ من أول
  // الصفحة. زرار الرجوع في المتصفح (POP) بيسيب المتصفح يرجّع مكانه، واللينكات
  // اللي فيها # (زي #gallery) بتروح لمكانها هي.
  useEffect(() => {
    if (navType === 'POP' || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navType]);
  // المحرر بياخد الشاشة كلها (شريط أدوات + معاينة بحجمها الحقيقي)،
  // ولوحة التحكم ليها شريطها الخاص — فشريط الحساب العلوي بيتشال منهم.
  const isFullScreen = pathname.startsWith('/editor/') || pathname.startsWith('/admin');
  usePrefetchPages();
  useAuthModalWarmup(isFullScreen);

  return (
    <ErrorBoundary>
      {!isFullScreen && <AuthBar />}
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/create/:templateId" element={<Suspense fallback={<PageFallback />}><CreateInvitationPage /></Suspense>} />
        <Route path="/packages" element={<Suspense fallback={<PageFallback />}><PackagesPage /></Suspense>} />
        <Route path="/checkout/:packageId" element={<Suspense fallback={<PageFallback />}><CheckoutPage /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><LegalPage kind="privacy" /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageFallback />}><LegalPage kind="terms" /></Suspense>} />
        <Route path="/refund" element={<Suspense fallback={<PageFallback />}><LegalPage kind="refund" /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageFallback />}><LegalPage kind="contact" /></Suspense>} />
        <Route path="/wedding-planner" element={<Suspense fallback={<PageFallback />}><WeddingPlannerPage /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>} />
        <Route path="/account" element={<Suspense fallback={<PageFallback />}><AccountPage /></Suspense>} />
        <Route path="/editor/:shortId" element={<Suspense fallback={<div className="min-h-screen bg-ivory" />}><EditorPage /></Suspense>} />
        <Route
          path="/admin/*"
          element={(
            // حاجز خاص بلوحة التحكم كمان: لو ملفها الكسول فشل، الخطأ
            // ميوقعش الموقع كله
            <ErrorBoundary>
              <Suspense fallback={<div className="min-h-screen bg-night" />}>
                <AdminApp />
              </Suspense>
            </ErrorBoundary>
          )}
        />
      </Routes>
      {!isFullScreen && <AuthModalGate />}
      {/* برّه الشرط بالقصد: التسجيل ممكن يحصل وهو في المحرر أو لوحته */}
      <WelcomeGate />
      {/* "باقتك اتفعّلت" / "الإيصال ماتقبلش" — مرة واحدة على أي صفحة */}
      <OrderNoticeGate />
      {/* زرار التواصل في كل صفحة — إلا المحرر (شاشة شغل كاملة وعنده
          درج أدوات تحت) ولوحة التحكم (دي بتاعتك إنت مش بتاعة العميل) */}
      {!isFullScreen && <SupportLauncher />}
      {/* واتساب طاير على الكمبيوتر (على الموبايل جوه الشريط اللي تحت) */}
      {!isFullScreen && <WhatsAppFloat />}
      {/* شريط التنقّل السفلي — موبايل بس، وبيقرر لوحده هو يظهر فين */}
      <BottomNav />
      <FlashToast />
      {/* "أنا فاتح الموقع" للوحة التحكم (مبيشتغلش في صفحات اللوحة نفسها) */}
      <PresencePing />
      <JourneyTracker />
    </ErrorBoundary>
  );
}
