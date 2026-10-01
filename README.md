# wedding-invitations

منصة لإنشاء دعوات زفاف/خطوبة شخصية، لكل دعوة لينك فريد خاص بيها.

## التشغيل محليًا

### الباك إند (Express + MongoDB)

```bash
npm install
cp .env.example .env   # واملأ القيم الحقيقية جواه
npm run dev
```

السيرفر بيشتغل افتراضيًا على `http://localhost:3000`.

### الفرونت إند (React — `client/`)

الموقع التسويقي/فورم الإنشاء (`/` و`/create/:templateId`) مبني بـ React + Redux Toolkit + Vite، وبيتقدم من نفس سيرفر Express (من `client/dist` بعد البناء). صفحات الدعوة النهائية (`views/*.html`) ولوحة التحكم (`/admin`) لسه HTML عادي زي ما كانوا، من غير أي تغيير.

**وقت التطوير** (Hot reload على أي تعديل في React، محتاج الباك إند شغال في تاب تاني):
```bash
npm run client:install   # مرة واحدة بس
npm run client:dev       # فاتح على http://localhost:5173، وبيعمل proxy لـ /api على Express
```

**قبل أي تشغيل إنتاج (`npm start`)**، لازم تبني نسخة React الجاهزة الأول:
```bash
npm run client:build     # بيطلع client/dist اللي Express بيقدمها
npm start
```

## متغيرات البيئة (.env)

راجع `.env.example` لشرح كل متغير. أهمها:

- `MONGODB_URI` — رابط الاتصال بقاعدة بيانات MongoDB (إجباري).
- `ADMIN_SECRET` — كلمة سر لوحة التحكم. بتتدخل مرة واحدة في صفحة دخول
  `/admin/stats` (مش في الـ URL) وبعدها جلسة بكوكي httpOnly بتتابعها
  (`middleware/adminAuth.js`) — بيفضل صالح 24 ساعة.
- `ALLOWED_ORIGINS` — اختياري؛ دومينات خارجية (لو فيه) مسموح لها تتواصل مع
  الـ API عبر CORS. الموقع نفسه (الصفحة الرئيسية وصفحات الدعوات ولوحة
  التحكم) بيشتغل صح من غيره تمامًا، لأنه كله من نفس الأوريجن.

## هيكل المشروع

- `server.js` — نقطة الدخول: الأمان (helmet/CSP/CORS)، الـ rate limiting،
  وربط كل الـ routes، وتقديم `client/dist` (React) مع SPA fallback.
- `client/` — الموقع التسويقي/فورم الإنشاء (React + Redux Toolkit + Vite).
  راجع قسم "التشغيل محليًا" فوق.
- `routes/invitations.js` — إنشاء/عرض/معاينة الدعوات + تأكيد الحضور (RSVP)
  + فحص القوالب المميزة (`isPremium`, راجع `templates/registry.js`).
- `routes/auth.js` — تسجيل/دخول/خروج المستخدمين (حسابات، مش الأدمن).
- `routes/admin.js` — لوحة تحكم بمفتاح سري واحد (جلسة بكوكي، مش في الـ URL).
- `middleware/auth.js` — جلسات المستخدمين (`req.user`).
- `middleware/adminAuth.js` — جلسة لوحة التحكم.
- `middleware/deviceLimiter.js` — حد الإنشاء لكل جهاز (كوكي، من غير حساب).
- `models/` — سكيمات Mongoose (Invitation، Rsvp، RateLimit، User، Session،
  AdminSession).
- `templates/registry.js` — سجل كل تصاميم الدعوات المتاحة، وهل كل واحد
  مجاني ولا محتاج تسجيل دخول (`isPremium`). لإضافة تصميم جديد: حط ملفه في
  `views/`، وضيف سطر جديد هنا — من غير ما تلمس أي كود تاني في السيرفر أو
  الفورم.
- `views/*.html` — ملفات التصاميم نفسها. كل واحد فيه سكريبت
  `window.WEDDING_CONFIG` بيتحقن من السيرفر وقت الطلب.
  صور كل تصميم (WebP) في `client/public/templates/<id>/`، وصورة كارته في
  المعرض في `client/public/img/template-thumbs/<id>.jpg`.

### قالب Lily Garden (`views/lily-garden.html`)

ظرف بختم شمع وزنبق وردي — الضغط على الختم بيفتح الظرف (حركة Tilda
الأصلية)، والصفحات تحته HTML عادي مربوط ببيانات الدعوة:

- **الأسماء/التاريخ/الساعة/القاعة/العنوان/الخريطة/العداد** بتتملا من
  `WEDDING_CONFIG` (الساعة والعداد من `C.countdown` و`C.weddingDateTimeISO`
  — بتوقيت مصر الصح). القالب **بنسختين** (`designLanguages: ['en','ar']` في السجل): الإنجليزي هو
  التصميم الأصلي والافتراضي (المعاينة للزوار `/preview-sample/lily-garden`)،
  والعربي لما العميل يختاره (`?lang=ar` للمعاينة). العميل المشترك بيختار من
  نافذة `DesignLanguagePicker.jsx` لما يضغط "استخدم القالب"، والمسودة بتتعمل
  باللغة دي (`POST /api/editor/draft {templateId, language}`). الإنجليزي
  بالأسماء اللاتيني دايمًا (`C.groomNameLatin`/`C.brideNameLatin`).
  خطوبة ولا فرح حسب `C.occasionType`.
- **التعديل:** كل نص وصورة عليه `data-elem-id="lgN"` (lg1…lg26) — صاحب
  الدعوة يعدّله أو يبدّله من المحرر، وتعديله بيغلب القيمة الافتراضية.
  خلفيات الصفحات (الفاونيا، إطار الختم) صور مستقلة قابلة للتبديل.
  الخريطة (`lg23`) عنصر "خريطة" في المحرر.
- **الحركة:** الزنبق بيدخل من الجنبين ويتمايل، الأسماء بتتكتب، القوس بيطلع،
  وباقي الأقسام بتظهر مع التمرير (`data-wg-reveal`). في المحرر (`autoOpen`)
  الصفحة بتتفتح على طول من غير حركة مستمرة (`wg-static`).
- **تأكيد الحضور** (`#mithaq-rsvp`): الاسم + هيحضر ولا لأ + رسالة للعروسين
  → `POST /i/:shortId/rsvp`. نصوص الفورم اللي صاحب الدعوة عدّلها من البانل
  بتوصل في `C.rsvpOverrides` وبتغلب كلام التصميم.
- **ألبوم صور الضيوف** (`#mithaq-photos`) — شوف تحت.
- الأقسام الاختيارية: `countdown`, `map`, `rsvp`, `guestPhotos`.
- الأغنية الرسمية: "Forever and Ever and Always" (نفس أغنية Dolce Vita،
  على r2.dev) — صاحب الدعوة يقدر يغيّرها من المحرر.

### مين على الموقع دلوقتي + أرقام النهارده + الأرباح شهر بشهر (لوحة التحكم)

- `client/src/components/PresencePing.jsx` بيبعت `POST /api/presence` كل 40 ثانية
  طول ما التاب ظاهر (مش في صفحات `/admin`). `routes/presence.js` بيحدّث
  `models/Presence.js` (سجل لكل عميل `u:<id>` أو زائر `v:<رقم عشوائي>`، بيتمسح
  لوحده بعد 15 دقيقة) و`User.lastSeenAt` (كل دقيقتين على الأكتر).
  "متصل" = آخر إشارة في آخر 100 ثانية (`utils/presence.js`).
- `GET /admin/api/live`: عدد المتصلين (عملاء/زوار)، العملاء المتصلين وهما في
  أنهي صفحة، وأرقام النهارده بتوقيت مصر — اللوحة بتسأل كل 15 ثانية.
- `GET /admin/api/revenue-monthly?months=12`: الأرباح شهر بشهر بتوقيت مصر
  (الطلبات المفعّلة بس، الجنيه والدولار منفصلين) + التسجيلات في كل شهر.
- قايمة العملاء: نقطة زرقا متوهجة لأي حد متصل + فلتر "متصلين دلوقتي"، وملف
  العميل بيوري "متصل دلوقتي" أو آخر ظهور.

### أسعار الباقات وتشغيلها (لوحة التحكم ← الباقات والأسعار)

المالك بيحدد سعر كل باقة بالجنيه والدولار، وبيقفل أو يفتح أي باقة —
`PricingSettings.prices` و`disabledPackages`، والحساب كله في
`utils/pricing.js` (`listPriceFor`, `isPackageEnabled`, `savePackagePrices`).
السعر اللي مش متحدد بيفضل على `packages/registry.js`، والخصومات بتنطبق على
السعر الجديد. الباقة المقفولة بتختفي من صفحة الباقات وطلبها بيرجع 403، ومشتركينها
الحاليين مبيتأثروش. الطلب المستني اللي العميل رفع له إيصال سعره بيتقفل (مبيتغيّرش
لو السعر اتغيّر بعدها). صور كروت المعرض = غلاف كل تصميم على شاشة 390×844.

### ترتيب المعرض وشارة "جديد"

المالك بيتحكم من لوحة التحكم (القوالب) في: ترتيب القوالب في المعرض، شارة
"جديد" على أي قالب، والإخفاء. محفوظين في `SiteConfig` (`templateOrder`,
`newTemplates`, `templatesConfigured`) — `utils/siteConfig.js`
(`getTemplateLayout`). قبل ما المالك يرتّب بنفسه، القوالب اللي عليها
`isNew: true` في السجل بتيجي الأول وعليها "جديد". `GET /api/templates`
بيرجّع القوالب بالترتيب ومعاها `isNew` و`designLanguages`. المعرض على
الموبايل كارتين جنب بعض (`TemplateGallery.jsx`).

### ألبوم صور الضيوف (`routes/guestPhotos.js`)

الضيوف بيرفعوا صور الفرح من جوه الدعوة (من غير حساب)، وصاحب الدعوة بيشوفها
في لوحته ويبعت لينك صفحة الألبوم لأي حد. متاح للقوالب اللي عليها
`guestPhotos: true` في `templates/registry.js` (دلوقتي Lily Garden).

- **الموديل:** `models/GuestPhoto.js` (`shortId`, رابط Cloudinary، المقاس،
  اسم الضيف، بصمة مفتاحه). `Invitation.albumToken` = توكن صفحة الألبوم
  السرية (بيتولّد أول مرة بس، بـ`updateOne` مش `save()`).
- **مفتاح الضيف:** كل جهاز بياخد مفتاح عشوائي (32 hex) في `localStorage`
  وبيتبعت في هيدر `X-Guest-Key`. السيرفر بيخزّن بصمته (sha256) بس، والضيف
  يقدر يمسح صوره هو بس.
- **الرفع:** المتصفح بيصغّر الصورة لأطول ضلع 2560px قبل الرفع (عشان تفضل
  تحت حد Vercel ‏4.5 ميجا)، والسيرفر بيفحص النوع الحقيقي
  (`utils/uploadSecurity.js`) ويرفع لـ Cloudinary بأعلى جودة
  (`quality: auto:best`) في `mithaq/guest-photos/<shortId>` بوسم
  `mithaq_album_<shortId>`.
- **الحدود** (`utils/guestPhotos.js`): 40 صورة لكل ضيف، 1500 للألبوم،
  60 رفعة في الساعة لكل جهاز (`guestPhotoLimiter`)، و200 لكل IP.
- **المسارات:**
  - `GET/POST /i/:shortId/photos`, `DELETE /i/:shortId/photos/:id` — الضيوف.
  - `GET /api/dashboard/invitations/:shortId/photos`,
    `DELETE …/photos/:id`, `POST …/album-link` — صاحب الدعوة.
  - `GET /a/:token` — صفحة الألبوم المشاركة (`utils/albumPage.js`)،
    و`GET /a/:token/zip` بيوجّه لرابط Cloudinary موقّع بينزّل كل الصور
    الأصلية في ملف zip واحد.
- **اللوحة:** زرار "صور الضيوف" على كارت الدعوة بيفتح
  `client/src/components/GuestAlbum.jsx` (عرض/تحميل/مسح/نسخ اللينك/واتساب).
- `i18n/` — كل النصوص الثابتة (عربي/إنجليزي/فرنساوي)، ونص فقرة الدعوة
  الرئيسية حسب اللغة والمناسبة.
- `utils/` — أدوات مشتركة: توليد اللينكات القصيرة، تنسيق التاريخ، تنضيف
  المدخلات، تحويل لينكات الخرائط، تشفير الباسورد (`password.js` — نفس
  التكلفة في التسجيل وفي تغيير الباسورد من اللوحة)، ورندر صفحة الدعوة
  النهائية.

## النشر (Vercel)

المشروع مبني عشان يشتغل على منصة سيرفرلس زي Vercel — الاتصال بقاعدة
البيانات متخزّن (cached) بين الطلبات بدل ما يتفتح اتصال جديد في كل مرة.
#   m e s q 
 
 #   m e s q 
 
 