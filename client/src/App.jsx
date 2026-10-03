import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AuthBar from './components/AuthBar.jsx';
import { useSelector } from 'react-redux';
import WelcomeGate from './components/WelcomeGate.jsx';
import OrderNoticeGate from './components/OrderNoticeGate.jsx';
import SupportLauncher from './components/SupportLauncher.jsx';
import BottomNav from './components/BottomNav.jsx';
import PresencePing from './components/PresencePing.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

/**
 * استيراد كسول بيعرف يصحّى نفسه.
 *
 * الملف الكسول اسمه فيه بصمة المحتوى، فبيتغيّر مع كل رفع. تاب مفتوح من
 * قبل الرفع بيفضل يطلب الاسم القديم اللي اتشال — الاستيراد بيفشل
 * والصفحة بتطلع بيضا. هنا بنجرّب تاني مرة، ولو فشلت بنعيد تحميل الصفحة
 * من السيرفر مرة واحدة بس عشان تيجي بأسماء الملفات الجديدة.
 */
function lazyWithReload(factory, key) {
  return lazy(() => factory().catch(() => factory().catch((err) => {
    const flag = 'mithaq:chunk-reload:' + key;
    let tried = false;
    try { tried = sessionStorage.getItem(flag) === '1'; } catch { /* تصفح خاص */ }
    if (tried) throw err;
    try { sessionStorage.setItem(flag, '1'); } catch { /* */ }
    window.location.reload();
    // بنرجّع وعد مش بيخلص عشان React مايرسمش حاجة والصفحة بتتحمّل
    return new Promise(() => {});
  })));
}

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
const importEditor = () => import('./pages/EditorPage.jsx');
const CreateInvitationPage = lazyWithReload(importCreate, 'create');
const PackagesPage = lazyWithReload(importPackages, 'packages');
const CheckoutPage = lazyWithReload(importCheckout, 'checkout');
const DashboardPage = lazyWithReload(importDashboard, 'dashboard');
const EditorPage = lazyWithReload(importEditor, 'editor');

// نافذة الدخول/التسجيل فيها مكتبة الفورم وقايمة الدول — تقيلة ومش
// محتاجينها غير لما الزائر يدوس "دخول". بتتحمّل أول مرة تتفتح (أو في
// وقت فراغ المتصفح قبلها)، وبعدها بتفضل موجودة عشان أنيميشن القفل.
const importAuthModal = () => import('./components/AuthModal.jsx');
const AuthModal = lazyWithReload(importAuthModal, 'auth');
function AuthModalGate() {
  const open = useSelector((s) => s.ui.authModalOpen);
  const [needed, setNeeded] = useState(open);
  useEffect(() => { if (open) setNeeded(true); }, [open]);
  if (!needed) return null;
  return <Suspense fallback={null}><AuthModal /></Suspense>;
}

/** بعد ما الصفحة تخلص تحميل ويبقى المتصفح فاضي، بنجهّز الصفحات اللي
 *  العميل غالبًا هيروحها — فالتنقّل بيفضل فوري زي الأول. */
function usePrefetchPages() {
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      // على شبكة موفّرة للبيانات مبنحمّلش حاجة زيادة
      const c = navigator.connection;
      if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
      [importAuthModal, importPackages, importDashboard, importCreate, importCheckout].forEach((f) => f().catch(() => {}));
    };
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500));
    const start = () => idle(run, { timeout: 6000 });
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => { cancelled = true; window.removeEventListener('load', start); };
  }, []);
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
  const { pathname } = useLocation();
  // المحرر بياخد الشاشة كلها (شريط أدوات + معاينة بحجمها الحقيقي)،
  // ولوحة التحكم ليها شريطها الخاص — فشريط الحساب العلوي بيتشال منهم.
  const isFullScreen = pathname.startsWith('/editor/') || pathname.startsWith('/admin');
  usePrefetchPages();

  return (
    <ErrorBoundary>
      {!isFullScreen && <AuthBar />}
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/create/:templateId" element={<Suspense fallback={<PageFallback />}><CreateInvitationPage /></Suspense>} />
        <Route path="/packages" element={<Suspense fallback={<PageFallback />}><PackagesPage /></Suspense>} />
        <Route path="/checkout/:packageId" element={<Suspense fallback={<PageFallback />}><CheckoutPage /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>} />
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
      {/* شريط التنقّل السفلي — موبايل بس، وبيقرر لوحده هو يظهر فين */}
      <BottomNav />
      {/* "أنا فاتح الموقع" للوحة التحكم (مبيشتغلش في صفحات اللوحة نفسها) */}
      <PresencePing />
    </ErrorBoundary>
  );
}
