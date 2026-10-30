// server.js
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const invitationsRouter = require('./routes/invitations');
const adminRouter = require('./routes/admin');
const adminApiRouter = require('./routes/adminApi');
const authRouter = require('./routes/auth');
const packagesRouter = require('./routes/packages');
const uploadsRouter = require('./routes/uploads');
const dashboardRouter = require('./routes/dashboard');
const accountRouter = require('./routes/account');
const editorRouter = require('./routes/editor');
const guestPhotosRouter = require('./routes/guestPhotos');
const guestVoicesRouter = require('./routes/guestVoices');
const presenceRouter = require('./routes/presence');
const trackRouter = require('./routes/track');
const adminJourneysRouter = require('./routes/adminJourneys');
const clientErrorsRouter = require('./routes/clientErrors');
const campaignsRouter = require('./routes/campaigns');
const adminFinanceRouter = require('./routes/adminFinance');
const adminAnalyticsRouter = require('./routes/adminAnalytics');
const adminOrdersDayRouter = require('./routes/adminOrdersDay');
const { ensureDeviceId, deviceInvitationLimiter } = require('./middleware/deviceLimiter');
const { attachUser } = require('./middleware/auth');
const { requireAdminSession } = require('./middleware/adminAuth');
const { requestLogger, installProcessHandlers, write: logLine, LOG_FILE } = require('./utils/requestLogger');
const { pageMeta, applyPageMeta, sitemapXml } = require('./utils/seo');

// بنمسك أي عطل بيوقّع عملية Node ونسجّله في اللوج قبل ما يطلع.
installProcessHandlers();

const app = express();
const PORT = process.env.PORT || 3000;

// الموقع شغال ورا بروكسي (Vercel/Cloudflare). من غير السطر ده، Express
// بيشوف IP البروكسي لكل الناس — يعني كل الزوار بيتحسبوا شخص واحد في
// حدود عدد المحاولات، فزائر واحد نشيط كان ممكن يستهلك الحد ويخلي باقي
// الناس تتحجب. و1 معناها "بروكسي واحد بينا وبين العميل" (مش true
// المفتوحة، اللي بتخلي أي حد يقدر يزوّر IP من هيدر X-Forwarded-For).
app.set('trust proxy', 1);

// تسجيل كل طلب (الوقت/الـIP/المسار/حالة الرد/الزمن) في logs/app.log —
// بيعلّم الطلبات البطيئة [SLOW] والأخطاء [ERROR] والمحاولات المشبوهة
// [SUSPICIOUS]. أول middleware عشان يشوف كل طلب حتى الملفات الثابتة و404.
app.use(requestLogger);

// www.mithaq-invitation.com كان بيفتح نفس الموقع بالظبط (نسخة مكررة في عين
// جوجل، وبيقسم قوة الموقع على عنوانين). أي فتح من www بيتحوّل للعنوان
// الأساسي بنفس المسار. GET/HEAD بس — أي طلب بيانات مالوش دعوة.
app.use((req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && req.hostname === 'www.mithaq-invitation.com') {
    return res.redirect(301, 'https://mithaq-invitation.com' + req.originalUrl);
  }
  return next();
});

// أمان أساسي على مستوى الـ HTTP headers، بما فيها Content-Security-Policy
// مضبوطة فعليًا (مش متقفلة) — بتسمح بس بالمصادر الخارجية اللي التصميم
// فعلاً محتاجها (سكريبت/تنسيق Tilda الأساسي للتصميم، خطوط جوجل، خريطة
// جوجل المضمّنة، وملفات الصوت/الفيديو الخلفية)، وتمنع أي حاجة تانية —
// ده خط دفاع إضافي (defense in depth) حتى لو حصل خطأ حقن مستقبلًا في
// أي مكان تاني من الكود.
// Tilda بتوزّع ملفات التصاميم على نطاقات فرعية كتير وبتغيّرها من وقت للتاني
// (static / static3 / optim / neo / ws / thb ...) وعلى أكتر من امتداد
// (.net/.com/.one). لما كنا بنسمح لأربع نطاقات محددة بس، شاشة الغلاف
// ("اضغط للفتح") كانت بتتكسر في التصاميم لأن سكريبت وصور Tilda الأساسية
// كانت بتتمنع — فالدعوة كانت بتفتح على طول من غير الغلاف. بنسمح هنا لنطاقات
// Tilda كلها (نطاق المزوّد نفسه اللي التصاميم متصدّرة منه أصلًا) بدل
// ملاحقة كل نطاق فرعي جديد يدويًا.
const TILDA_CDN_HOSTS = [
  'https://*.tildacdn.net',
  'https://*.tildacdn.com',
  'https://*.tildacdn.one',
  'https://*.tildacdn.pub',
];
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // 'unsafe-inline' لازم للسكريبتات المضمّنة جوه صفحات الدعوة نفسها
      // (إعداد اللغة/البيانات لكل دعوة) — تصعيبها لصفر يحتاج إعادة بناء
      // كامل لنظام القوالب بـ nonce/hash لكل سكريبت
      // accounts.google.com/gsi: زرار "المتابعة بجوجل" الرسمي (سكريبت + iframe + ستايل)
      // connect.facebook.net: بيكسل ميتا (client/src/lib/metaPixel.js + utils/metaPixel.js)
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com/gsi/client', 'https://connect.facebook.net', ...TILDA_CDN_HOSTS],
      // helmet بيحط script-src-attr 'none' افتراضيًا، وده بيمنع الـ
      // onload/onerror المكتوبين جوه وسوم الصور في تصاميم Tilda (بيعتمد
      // عليهم التحميل الكسول للصور). بنسمح بيهم هنا — نفس مستوى الخطورة
      // بتاع 'unsafe-inline' اللي مسموح أصلًا فوق، مش تنازل إضافي.
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com/gsi/style', ...TILDA_CDN_HOSTS],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', ...TILDA_CDN_HOSTS, 'data:'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://www.facebook.com', ...TILDA_CDN_HOSTS],
      // asmaa-mohamed.vercel.app: أغنية Ivory Swans الافتراضية متخزّنة هناك — من
      // غيره الأغنية كانت متمنوعة ومبتشتغلش خالص في القالب ده
      // blob: — التهنئة الصوتية اللي الضيف لسه مسجّلها بتتسمع من جهازه قبل
      // ما تتبعت (Velvet Voice). من غيره زرار التشغيل كان مابيعملش حاجة.
      mediaSrc: ["'self'", 'blob:', 'https://res.cloudinary.com', 'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev', 'https://asmaa-mohamed.vercel.app'],
      connectSrc: ["'self'", 'https://accounts.google.com/gsi/', 'https://www.facebook.com', 'https://connect.facebook.net', ...TILDA_CDN_HOSTS],
      // 'self' لازم عشان المحرر المباشر بيعرض الدعوة نفسها جوه iframe من
      // نفس الأوريجن؛ google.com للخرايط المضمّنة جوه الدعوة.
      // www.facebook.com (هنا وفي formAction): بيكسل ميتا بيبعت الأحداث بفورم مخفي جوه iframe
      frameSrc: ["'self'", 'https://www.google.com', 'https://accounts.google.com/gsi/', 'https://www.facebook.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", 'https://www.facebook.com'],
      frameAncestors: ["'self'"],
      // ترقية أي طلب http لـ https — مهمة على الإنتاج، بس لازم تتشال
      // في التطوير. سبب عملي: كروم بيستثني localhost من الترقية دي،
      // وسفاري (WebKit) **لأ** — فالتطوير المحلي على http كان بيقع
      // عنده بـ SSL connect error وكل ملفات الصفحة مبتحمّلش. وده خلانا
      // منقدرش نختبر سفاري محليًا أصلًا.
      // null (مش حذف السطر) لأن helmet بيضيف التوجيه ده من إعداداته
      // الافتراضية، وnull هي الطريقة الوحيدة لإلغاء توجيه افتراضي.
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  // نافذة "المتابعة بجوجل" لازم تقدر ترجّع النتيجة للصفحة اللي فتحتها —
  // الافتراضي (same-origin) بيقطع الاتصال ده. ده اللي جوجل بتوصي بيه.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// CORS: مقفول افتراضيًا لأي دومين خارجي — الموقع بتاعنا (الصفحة الرئيسية،
// صفحات الدعوات، لوحة التحكم) كله بيتقدّم من نفس الأوريجن، فمش محتاج CORS
// أصلًا عشان يشتغل (المتصفح مبيطبقش قيود CORS على طلبات نفس الأوريجن).
// لو محتاج تسمح لدومين خارجي معين (زي موقع تسويقي منفصل) يكلم الـ API،
// ضيفه في متغير البيئة ALLOWED_ORIGINS (مفصول بفاصلة).
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // مفيش Origin header خالص (طلبات نفس الأوريجن، أو أدوات زي curl/Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

// بنتأكد إن قاعدة البيانات متصلة قبل أي طلب يحتاجها فعليًا (إنشاء/عرض دعوة).
// المعاينة الحية وقائمة القوالب (/api/preview, /api/templates) مايحتاجوش
// قاعدة بيانات أصلًا، فبيفضلوا شغالين حتى لو حصلت مشكلة مؤقتة في الاتصال.
const requireDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(503).json({ error: 'السيرفر مش قادر يوصل لقاعدة البيانات دلوقتي.' });
  }
};
app.use('/api/invitations', requireDB);
app.use('/api/public-stats', requireDB);
app.use('/i', requireDB);
app.use('/i', attachUser);
// صفحة الإحصائيات المشاركة (رابط سري) محتاجة قاعدة البيانات
app.use('/s', requireDB);
// لينك إحالة الـ UGC محتاج قاعدة البيانات (بيعدّ زيارة ويحط كوكي)
app.use('/r', requireDB);
// لينكات الإعلانات (/go/<code>)
app.use('/go', requireDB);
app.use('/api/campaign-seen', requireDB);
// صفحة ألبوم صور الضيوف المشاركة (routes/guestPhotos.js)
app.use('/a', requireDB);
// صفحة التهاني الصوتية المشاركة (لينك سري)
app.use('/v', requireDB);
app.use('/admin', requireDB);
app.use('/api/auth', requireDB);
app.use('/api/packages', requireDB);
app.use('/api/uploads', requireDB);
app.use('/api/dashboard', requireDB);
app.use('/api/account', requireDB);
app.use('/api/editor', requireDB);
app.use('/api/presence', requireDB);
app.use('/api/client-error', requireDB);

// لو فيه جلسة دخول صالحة (كوكي wda_session)، بيحط req.user؛ غير كده
// req.user = null من غير ما يوقف الطلب (middleware/auth.js). مربوط بس
// بالمسارات اللي فعلاً محتاجة تعرف حالة الدخول — مش عالميًا على كل الموقع
// (زي الملفات الثابتة أو صفحة الدعوة نفسها)، عشان نفس فلسفة الأداء
// والمرونة اللي requireDB بتتبعها.
app.use(['/api/preview', '/preview-sample', '/api/invitations', '/api/auth', '/api/packages', '/api/uploads', '/api/dashboard', '/api/account', '/api/editor', '/api/presence', '/api/track', '/api/client-error'], attachUser);

// الموقع التسويقي/فورم الإنشاء بقى React (client/) مبني بـ Vite — الملفات
// الثابتة الناتجة (client/dist) هي اللي بتتقدم هنا بدل public/ القديم.
// (ملحوظة: لو استضفت المشروع على Vercel، الفولدر ده بيتقدّم من الـ CDN
// بتاعهم مباشرة وبيتجاهل السطر ده تلقائيًا — راجع README لو مش فاهم ليه)
const CLIENT_DIST = path.join(__dirname, 'client', 'dist');
// خريطة الموقع لجوجل: بتتعمل من قايمة التصاميم نفسها، فأي تصميم جديد
// بيدخلها لوحده (utils/seo.js)
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(sitemapXml());
});
// /gallery مكانتش صفحة أصلًا (كانت بتفتح فاضية) — التصاميم في الرئيسية
app.get('/gallery', (req, res) => res.redirect(301, '/#gallery'));
app.use(express.static(CLIENT_DIST, {
  // الصفحة الرئيسية مابتتبعتش من هنا: بتعدّي على آخر الملف عشان تاخد
  // عنوانها ووصفها لجوجل (utils/seo.js) زي باقي الصفحات
  index: false,
  // ملفات /assets/ اسمها فيه بصمة محتواها (index-BEQg6LwI.js) — يعني أي
  // تعديل بيغيّر الاسم. فنقدر نخليها تتخزّن للأبد بأمان.
  // index.html بالعكس: لازم المتصفح يسأل عنها كل مرة، لأنها هي اللي
  // بتقول أسماء الملفات الحالية. لو اتخزّنت، المتصفح هيفضل يطلب ملفات
  // نسخة قديمة بعد كل رفع — وده اللي كان بيدي شاشة بيضا.
  setHeaders(res, filePath) {
    if (/[\\/]assets[\\/]/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('index.html')) {
      // no-store مش no-cache: بعض المتصفحات/البروكسيات بتتعامل مع
      // no-cache على إنه "خزّن وبعدين اتأكد" وممكن تعرض نسخة قديمة
      // لو فشل الاتصال بالسيرفر مؤقتًا. no-store بتقفل الاحتمال ده
      // تمامًا — الصفحة دي لازم تتجاب من السيرفر كل مرة، من غير نقاش.
      res.setHeader('Cache-Control', 'no-store');
    } else if (/\.(webp|avif|png|jpe?g|gif|svg|ico|mp4|webm|mp3|woff2?|ttf)$/i.test(filePath)) {
      // صور القوالب والفيديوهات واللوجو: كانت max-age=0، فالـ CDN بتاع
      // Hostinger مكانش بيخزّنها خالص (MISS كل مرة) وكل صورة كانت بتيجي
      // من السيرفر نفسه في كل زيارة — وده كان أبطأ حاجة على الموبايل.
      // اسمها مفيهوش بصمة فمش immutable: أسبوع، وبعده المتصفح بيعرض
      // النسخة اللي عنده فورًا ويجيب الجديدة في الخلفية لو اتغيّرت.
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
    } else {
      // editor-runtime.js وأي ملف تاني من غير بصمة: يتأكد كل مرة (304 لو
      // ماتغيّرش) عشان أي تعديل يوصل للعملاء على طول بعد الرفع
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// ====== الحماية من إساءة الاستخدام ======

// 1) خط دفاع أول سريع: حد عام تقريبي لكل IP (مفيد بالذات على سيرفر VPS
//    تقليدي شغال بنسخة واحدة طول الوقت في الذاكرة)
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 30,                  // 30 محاولة كحد أقصى لكل IP كل 15 دقيقة
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من المحاولات من نفس الاتصال، حاول تاني بعد شوية.' },
});

// 2) خط الدفاع الأساسي والدقيق: حد لكل جهاز (متخزن في قاعدة البيانات، فبيشتغل
//    صح حتى لو السيرفر شغال على منصة سيرفرلس زي Vercel أو خلف أكتر من نسخة)
app.use('/api/invitations', ipLimiter, ensureDeviceId, deviceInvitationLimiter);

// حد خفيف على مستوى الـ IP لردود تأكيد الحضور — أعلى بكتير من حد الجهاز
// (middleware/deviceLimiter.js: rsvpLimiter) عمدًا، عشان ضيوف كتير بيردوا
// من نفس الشبكة (بيت العيلة، شبكة القاعة) ميتحظروش بالغلط.
const rsvpIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من المحاولات، حاول تاني بعد شوية.' },
});
app.use('/i/:shortId/rsvp', rsvpIpLimiter);

// المعاينة الحية بتتنادى كل شوية وهو بيكتب في الفورم، فمحتاجة سقف أعلى
// بكتير من إنشاء الدعوة الفعلي (مفيش حفظ في قاعدة البيانات هنا أصلًا)
const previewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'استنى شوية وجرب تاني.' },
});
app.use('/api/preview', previewLimiter);

// 3) لوحة التحكم بيها مفتاح سري واحد بيتقارن في كل طلب (routes/admin.js) —
//    من غير حد على عدد المحاولات، أي حد يقدر يجرب يخمّن المفتاح عدد لا
//    نهائي من المرات. الحد هنا منخفض عمدًا لأن الاستخدام الطبيعي للوحة
//    التحكم قليل جدًا مقارنة بباقي الموقع.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من المحاولات، حاول تاني بعد شوية.' },
});
app.use('/admin/login', adminLoginLimiter);

// اللوحة نفسها (بعد الدخول) بتطلب بيانات كتير — رسوم بيانية، قوايم،
// ملفات عملاء — فحدها لازم يكون واسع. المفتاح مبيتبعتش هنا أصلًا،
// فمفيش حاجة تتخمّن؛ الحد ده لمنع الإغراق بس.
const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // اللوحة بقت بتفضل مفتوحة ساعات (صفحة "مباشر" بتتحدّث كل 4 ثواني + باقي
  // الصفحات) — 600 كانت بتخلص في نص ساعة شغل. اللي مش داخل أصلًا بيترفض
  // من الحارس العام من غير ما يلمس قاعدة البيانات، فالرقم ده مش باب تخمين.
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من الطلبات، استنى شوية.' },
});
app.use('/admin/api', adminApiLimiter);
// حارس عام: كل /admin/api محتاج جلسة أدمن — حتى لو مسار جديد اتنسى عليه
// requireAdminSession، مايبقاش مفتوح (طبقة حماية تانية فوق حارس كل مسار)
app.use('/admin/api', requireAdminSession);

// 4) تسجيل/دخول: حد صارم عشان يصعب تخمين باسورد حساب حد (brute force)
//    أو عمل حسابات وهمية بالجملة.
//
//    ⚠ الحد ده على **بيانات الدخول بس** (login/register) — مش على
//    /api/auth/me. سبب مهم جدًا: /api/auth/me بتتنادى مع كل فتحة صفحة
//    عشان الموقع يعرف مين الداخل. لما كانت داخلة تحت نفس الحد، العميل
//    اللي بيتصفح عادي كان بيستهلك الـ 20 محاولة من غير ما يعمل حاجة،
//    وبعدها الطلب بيرجع 429 والموقع بيقراه كأنه مش مسجّل — فيلاقي نفسه
//    مطرود من غير سبب. وده اللي كان بيحصل "كل ما أعمل ريفرش".
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من المحاولات، حاول تاني بعد شوية.' },
});
app.use('/api/auth/login', credentialsLimiter);
// تغيير الباسورد بيتحقق من الباسورد الحالي — نفس حد المحاولات
app.use('/api/account/password', credentialsLimiter);
app.use('/api/auth/register', credentialsLimiter);
// الدخول بجوجل نفس الحد (التحقق من التوكن + إنشاء الحساب)
app.use('/api/auth/google', (req, res, next) => (req.method === 'POST' ? credentialsLimiter(req, res, next) : next()));

// قراءة حالة الدخول والخروج: حد واسع — دول مش بيتخمّن فيهم أي سر،
// و/me بتتنادى مع كل صفحة. الحد هنا لمنع الإغراق بس.
const sessionReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من الطلبات، استنى شوية.' },
});
app.use('/api/auth', sessionReadLimiter);

// 5) الرفع: حد لكل IP عشان محدش يغرق مساحة التخزين (وفاتورتها) بملفات
//    كتير. الفحص الأمني نفسه في utils/uploadSecurity.js — ده حد الكمية بس.
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'رفعت ملفات كتير في وقت قصير، استنى شوية وجرب تاني.' },
});
app.use('/api/uploads', uploadLimiter);

// صور الضيوف من جوه الدعوة: حد واسع لكل IP (ضيوف كتير على شبكة القاعة
// نفسها)، والحد الدقيق لكل جهاز في middleware/deviceLimiter.js
// (guestPhotoLimiter). على الرفع بس — العرض والمسح من غيره.
const guestPhotoIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'صور كتير من نفس الشبكة في وقت قصير، استنى شوية وكمّل.' },
});
app.post('/i/:shortId/photos', guestPhotoIpLimiter);

// إشارة "أنا فاتح الموقع" — كل تاب بيبعتها كل 20 ثانية (+ "خرجت/رجعت")، فالحد
// واسع (لو العيلة كلها فاتحة من نفس الواي فاي). لمنع الإغراق بس.
const presenceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من الطلبات.' },
});
app.use('/api/presence', presenceLimiter);

// رحلة الزائر (دفعات خطوات) — دفعة كل كام ثانية بس لما يحصل حاجة، فالحد واسع.
// لمنع الإغراق بس.
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من الطلبات.' },
});
app.use('/api/track', trackLimiter);

// تبليغ أعطال الواجهة — حد صغير (الانهيار نادر، ومنعًا للإغراق)
const clientErrorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'عدد كبير جدًا من الطلبات.' },
});
app.use('/api/client-error', clientErrorLimiter);

app.use('/', invitationsRouter);
app.use('/', adminRouter);
app.use('/', adminApiRouter);
app.use('/', campaignsRouter);
app.use('/', adminFinanceRouter);
app.use('/', adminAnalyticsRouter);
app.use('/', adminOrdersDayRouter);
app.use('/', authRouter);
app.use('/', packagesRouter);
app.use('/', uploadsRouter);
app.use('/', dashboardRouter);
app.use('/', accountRouter);
app.use('/', editorRouter);
app.use('/', guestPhotosRouter);
app.use('/', guestVoicesRouter);
app.use('/', presenceRouter);
app.use('/', trackRouter);
app.use('/', adminJourneysRouter);

// حالة خدمة الواتساب (من غير أي رقم أو بيانات) — للتشخيص من بره من غير لوحة التحكم
app.get('/api/health/whatsapp', async (req, res) => {
  try {
    const st = await require('./models/WhatsAppState').findOne({ key: 'default' }).lean();
    const alive = !!(st && st.heartbeatAt && Date.now() - new Date(st.heartbeatAt).getTime() < 3 * 60 * 1000);
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      alive,
      heartbeatAt: (st && st.heartbeatAt) || null,
      status: (st && st.status) || 'off',
      wantLinked: !!(st && st.wantLinked),
      diag: st && st.diag ? { stage: st.diag.stage, code: st.diag.code, message: st.diag.message, at: st.diag.at, attempts: st.diag.attempts, version: st.diag.version } : null,
      node: process.version,
    });
  } catch {
    return res.status(500).json({ error: 'failed' });
  }
});
app.use('/', clientErrorsRouter);

// أي GET route تاني مش API معروف بيرجع صفحة React (client/dist/index.html)
// عشان react-router يشتغل صح حتى لو حد عمل refresh على لينك زي /create/xyz
// (اللي مش ملف حقيقي على السيرفر، React نفسه هو اللي بيقرر يعرض إيه).
// ملحوظة: /admin نفسه مستثنى**ش** — لوحة التحكم بقت جزء من تطبيق React،
// فأي مسار زي /admin/clients لازم يرجّع صفحة React. المستثنى هو مسارات
// الـ API بتاعتها بس (/admin/api/…) وتسجيل الدخول والخروج.
const CLIENT_ROUTE_EXCLUDED_PREFIXES = [
  '/api', '/admin/api', '/admin/login', '/admin/logout', '/admin/session',
  '/i/', '/preview-sample',
];
// طلب ملف (فيه امتداد) مش موجود لازم يرجّع 404 — مش صفحة React.
//
// ليه ده مهم جدًا: بعد أي رفع جديد، أسماء ملفات /assets/ بتتغيّر. لو
// متصفّح عنده نسخة قديمة من index.html وطلب ملف اتشال، السطر اللي تحت
// كان بيرجّعله **صفحة HTML** بحالة 200 مكان ملف الجافاسكريبت. المتصفح
// بيرفضها ("Expected a JavaScript module but got text/html") ومبيشتغلش
// أي كود — يعني شاشة بيضا فاضية من غير ولا رسالة خطأ.
// دلوقتي بيرجّع 404 صريح، والصفحة بتعرف تتصرف وتعيد التحميل (client/index.html).
const FILE_LIKE = /\.[a-z0-9]{2,6}$/i;

// لوحة التحكم أخطر صفحة في الموقع (بيانات كل العملاء والفلوس)، فبتاخد سياسة
// أمان (CSP) أشد من باقي الموقع: مفيش أي سكريبت من برّه (لا Tilda ولا جوجل)
// ولا أي كود مكتوب جوه الصفحة غير السكريبت الوحيد بتاع index.html (بالبصمة).
// يعني حتى لو حد قدر يدسّ نص فيه <script> في أي حتة بتتعرض في اللوحة،
// المتصفح مش هيشغّله. السياسة بتتحسب من index.html نفسه (بيتغيّر مع كل رفع).
// index.html نفسه (بيتقري مرة لكل رفع) — الصفحات العامة بتاخده وتغيّر
// العنوان والوصف بس
let spaCache = { mtime: 0, html: '' };
function spaHtml() {
  try {
    const file = path.join(CLIENT_DIST, 'index.html');
    const { mtimeMs } = require('fs').statSync(file);
    if (spaCache.mtime !== mtimeMs) spaCache = { mtime: mtimeMs, html: require('fs').readFileSync(file, 'utf8') };
    return spaCache.html;
  } catch {
    return '';
  }
}

let adminCspCache = { mtime: 0, value: '' };
function adminCsp() {
  try {
    const file = path.join(CLIENT_DIST, 'index.html');
    const { mtimeMs } = require('fs').statSync(file);
    if (adminCspCache.mtime === mtimeMs) return adminCspCache.value;
    const html = require('fs').readFileSync(file, 'utf8');
    const hashes = [];
    html.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi, (m, attrs = '', body) => {
      if (/\bsrc=/i.test(attrs) || /application\/ld\+json/i.test(attrs) || !body.trim()) return m;
      // المتصفح بيحوّل نهايات السطور (\r\n) لـ \n قبل ما يحسب البصمة — لازم نعمل زيه
      const text = body.replace(/\r\n?/g, '\n');
      hashes.push(`'sha256-${require('crypto').createHash('sha256').update(text).digest('base64')}'`);
      return m;
    });
    const media = "'self' blob: https://res.cloudinary.com https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev https://asmaa-mohamed.vercel.app";
    const value = [
      "default-src 'self'",
      `script-src 'self' ${hashes.join(' ')}`.trim(),
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      `media-src ${media}`,
      "connect-src 'self'",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
    ].join('; ');
    adminCspCache = { mtime: mtimeMs, value };
    return value;
  } catch {
    return '';
  }
}

app.get('*', (req, res, next) => {
  if (CLIENT_ROUTE_EXCLUDED_PREFIXES.some((p) => req.path.startsWith(p))) return next();
  if (req.path.startsWith('/assets/') || FILE_LIKE.test(req.path)) {
    return res.status(404).type('text/plain').send('Not found');
  }
  // الصفحة نفسها عمرها ما تتخزّن: هي اللي بتقول أسماء الملفات الحالية
  res.setHeader('Cache-Control', 'no-store');
  if (req.path === '/admin' || req.path.startsWith('/admin/')) {
    const csp = adminCsp();
    if (csp) res.setHeader('Content-Security-Policy', csp);
    // اللوحة مش لازم تتفهرس ولا يتبعت معاها أي رابط لمواقع تانية
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Referrer-Policy', 'no-referrer');
  }
  const meta = pageMeta(req.path);
  if (meta) {
    const html = spaHtml();
    if (html) return res.type('html').send(applyPageMeta(html, meta));
  } else if (!res.getHeader('X-Robots-Tag')) {
    // صفحات الحساب والدفع والمحرر، وأي مسار مش موجود: مش لجوجل
    res.setHeader('X-Robots-Tag', 'noindex');
  }
  return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// صفحة 404 بسيطة لأي مسار تاني مش موجود (POST لمسار غلط، إلخ)
app.use((req, res) => {
  res.status(404).send('Not found');
});

// بنشغل app.listen بس لو الملف ده اتنفذ مباشرة (node server.js) —
// ده بيخلي نفس الكود يشتغل صح سواء على VPS تقليدي (app.listen) أو على
// منصة سيرفرلس زي Vercel (اللي بتاخد الـ app نفسه وتستخدمه من غير listen).
// واتساب المالك (الرسايل التلقائية) — بيتصل لوحده لو كان مربوط قبل كده.
// برّه شرط require.main: الاستضافة (Hostinger) بتشغّل الملف ده من خلال برنامج
// تاني، فالشرط ده مابيتحققش هناك — والخدمة ماكانتش بتبدأ خالص. القفل (lease)
// في قاعدة البيانات بيضمن إن نسخة واحدة بس هي اللي تتصل.
if (process.env.NODE_ENV !== 'test') {
  require('./utils/whatsapp/manager').startWhatsApp();
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
    logLine(`server started on port ${PORT} (logging to ${LOG_FILE})`);
  });
}

module.exports = app;
