// utils/shareTags.js
// الكارت اللي بيظهر لما لينك الدعوة يتبعت على واتساب أو فيسبوك.
//
// المشكلة اللي بيحلها: ملفات التصاميم مصدّرة من Tilda وجواها وسوم
// og: بتاعتهم هم — عنوان "Blossom & Oud" وصورة شعار Tilda. يعني أي
// دعوة اتبعتت على واتساب كانت بتظهر باسم التصميم وصورة مالهاش أي
// علاقة بالعروسين. وده أول حاجة الضيف بيشوفها قبل ما يفتح أصلًا.
//
// الحل: بنشيل وسوم Tilda ونحط بتاعتنا — بأسماء العروسين والتاريخ
// والمكان افتراضيًا، والعميل المدفوع يقدر يغيّر العنوان والوصف
// والصورة بنفسه.
const { isAllowedMediaUrl } = require('./customizations');

/**
 * أصل الموقع (https://domain) من لينك الصفحة. ميتا (إنستجرام/فيسبوك/ماسنجر)
 * بترفض صور og من غير https مطلق، فبنجبر https لأي دومين حقيقي.
 */
function originOf(pageUrl) {
  try {
    const u = new URL(pageUrl);
    const local = /^(localhost|127\.|10\.|192\.168\.)/.test(u.hostname);
    return `${local ? u.protocol : 'https:'}//${u.host}`;
  } catch {
    return '';
  }
}

/**
 * صورة Cloudinary اللي العميل رفعها → نفس الصورة بشكلها الطبيعي بالظبط
 * (طويلة تفضل طويلة، عريضة تفضل عريضة — **مفيش أي قص**)، بس:
 *   - بصيغة JPEG: إنستجرام/فيسبوك ساعات بيتجاهلوا WebP/HEIC.
 *   - بحجم معقول (c_limit = تصغير لو أكبر بس، من غير تكبير ولا قص):
 *     الصور الضخمة من الموبايل كانت بتتأخر أو تترفض من كراولر ميتا.
 * التحويل بيتحط في آخر سلسلة التحويلات الموجودة (لو فيه) عشان يكون هو
 * الأخير اللي بيتطبّق.
 */
function cloudinaryShareImage(url) {
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const head = url.slice(0, i + marker.length);
  const parts = url.slice(i + marker.length).split('/');
  let k = 0;
  while (k < parts.length - 1 && /^(?:[a-z]{1,3}_[^/]*)(?:,[a-z]{1,3}_[^/]*)*$/.test(parts[k])) k += 1;
  parts.splice(k, 0, 'c_limit,w_1200,h_1600,f_jpg,q_auto');
  return head + parts.join('/');
}

/** بيهرّب النص عشان يتحط جوه خاصية HTML بأمان */
function attr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const clamp = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

/** حدود منطقية: واتساب بيقص اللي أطول من كده أصلًا */
const MAX_TITLE = 90;
const MAX_DESC = 200;

/**
 * العنوان والوصف الافتراضيين من بيانات الدعوة نفسها.
 * @param {object} data بيانات الدعوة
 */
function defaultShare(data) {
  const isAr = String(data.language || 'ar').toLowerCase() === 'ar';
  const bride = (isAr ? data.brideNameAr : data.brideName) || data.brideNameAr || data.brideName || '';
  const groom = (isAr ? data.groomNameAr : data.groomName) || data.groomNameAr || data.groomName || '';
  const names = [groom, bride].filter(Boolean).join(isAr ? ' و ' : ' & ');

  const title = names
    ? (isAr ? `دعوة فرح ${names}` : `${names} — Wedding Invitation`)
    : (isAr ? 'دعوة فرح' : 'Wedding Invitation');

  const place = [data.venueName, data.venueCity].filter(Boolean).join('، ');
  let when = '';
  if (data.weddingDateTime) {
    try {
      when = new Date(data.weddingDateTime).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { /* تاريخ غير صالح — بنسيبه فاضي */ }
  }
  const desc = [when, place].filter(Boolean).join(' · ')
    || (isAr ? 'اضغط اللينك عشان تشوف الدعوة.' : 'Open the link to see the invitation.');

  return { title, description: desc };
}

/**
 * بيبني وسوم المشاركة النهائية.
 * @param {object} data بيانات الدعوة
 * @param {string} pageUrl لينك الدعوة الكامل
 * @param {string} [fallbackImage] صورة التصميم لو العميل مارفعش صورة
 */
function buildShareTags(data, pageUrl, fallbackImage) {
  const c = (data && data.customizations) || {};
  const share = c.share || {};
  const base = defaultShare(data || {});

  const title = clamp(share.title, MAX_TITLE) || base.title;
  const description = clamp(share.description, MAX_DESC) || base.description;
  const origin = originOf(pageUrl);
  const abs = (u) => (u && u.startsWith('/') && origin ? origin + u : u);

  // الصورة اللي العميل حطها بنفسه بس — بنفس شكلها (مفيش قص ولا كارت
  // افتراضي من عندنا). ولازم تعدي نفس فحص الروابط بتاع باقي التخصيصات.
  let image = '';
  if (isAllowedMediaUrl(share.image) && share.image) {
    image = /^https:\/\/res\.cloudinary\.com\//.test(share.image)
      ? cloudinaryShareImage(share.image)
      : abs(share.image);
  } else {
    image = abs(fallbackImage || '');
  }
  // ميتا محتاجة رابط مطلق — أي حاجة غير كده مالهاش لازمة نعلن عنها
  if (!/^https?:\/\//.test(image)) image = '';

  const isAr = String(data.language || 'ar').toLowerCase() === 'ar';
  // og:url بيشيل بصمة الكارت (?c=) لو موجودة — عشان فيسبوك/إنستجرام يعتبروا
  // الكارت المعدّل كارت جديد. الـ canonical بيفضل نضيف من غيرها (للبحث).
  const u = pageUrl && origin ? new URL(pageUrl) : null;
  const url = u ? origin + u.pathname + u.search : pageUrl;
  const canonical = u ? origin + u.pathname : pageUrl;
  const siteName = isAr ? 'ميثاق — دعوات الأفراح' : 'Mithaq — Wedding Invitations';

  return [
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${attr(siteName)}">`,
    url ? `<meta property="og:url" content="${attr(url)}">` : '',
    `<meta property="og:title" content="${attr(title)}">`,
    `<meta property="og:description" content="${attr(description)}">`,
    `<meta property="og:locale" content="${isAr ? 'ar_EG' : 'en_US'}">`,
    image ? `<meta property="og:image" content="${attr(image)}">` : '',
    // إنستجرام/فيسبوك بيعتمدوا على secure_url والنوع والمقاس عشان يعرضوا
    // الكارت الكبير — من غيرهم ساعات بيبعت اللينك كنص عادي
    image && image.startsWith('https://') ? `<meta property="og:image:secure_url" content="${attr(image)}">` : '',
    image ? '<meta property="og:image:type" content="image/jpeg">' : '',
    // مبنعلنش عن مقاس ثابت: صورة العميل بأي نسبة (طويلة/عريضة)، ولو
    // كتبنا مقاس غلط ميتا بتعرضها مضغوطة أو مقصوصة. هي بتقيس الصورة لوحدها.
    image ? `<meta property="og:image:alt" content="${attr(title)}">` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${attr(title)}">`,
    `<meta name="twitter:description" content="${attr(description)}">`,
    image ? `<meta name="twitter:image" content="${attr(image)}">` : '',
    `<meta name="description" content="${attr(description)}">`,
    canonical ? `<link rel="canonical" href="${attr(canonical)}">` : '',
    `<title>${attr(title)}</title>`,
  ].filter(Boolean).join('\n    ');
}

/**
 * بيشيل وسوم المشاركة والعنوان اللي جاية من ملف التصميم الأصلي.
 * لازم تتشال قبل ما نحط بتاعتنا — لو اتسابت، واتساب ممكن ياخد
 * الأولى اللي يلاقيها ويسيب بتاعتنا.
 */
function stripTemplateShareTags(html) {
  return String(html)
    .replace(/<meta[^>]+(?:property|name)\s*=\s*["'](?:og:[^"']*|twitter:[^"']*|description)["'][^>]*>\s*/gi, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '');
}

/**
 * بيحقن الوسوم جوه <head> — **بعد** وسم الترميز (charset).
 *
 * الترتيب مش تفصيلة: المتصفح (وواتساب) بيقرا أول جزء من الصفحة عشان
 * يعرف الترميز. لو حطينا عنوان عربي قبل ما يعرف إنها utf-8، الكارت
 * ممكن يطلع بحروف مشوّهة. فبنحط وسومنا بعد الـ charset مباشرة — أول
 * حاجة بعد ما الترميز يبقى معروف.
 */
function injectShareTags(html, tags) {
  if (!tags) return html;
  const clean = stripTemplateShareTags(html);

  // بعد آخر وسم charset في أول الصفحة
  const charset = clean.match(/<meta[^>]+charset[^>]*>/i);
  if (charset) {
    const at = clean.indexOf(charset[0]) + charset[0].length;
    return clean.slice(0, at) + '\n    ' + tags + clean.slice(at);
  }

  // مفيش charset؟ نحطه إحنا قبل وسومنا — العربي مايطلعش مشوّه بأي حال
  const i = clean.search(/<head[^>]*>/i);
  if (i === -1) return clean;
  const end = clean.indexOf('>', i) + 1;
  return clean.slice(0, end) + '\n    <meta charset="utf-8">\n    ' + tags + clean.slice(end);
}

/** بيتأكد إن اللي جاي من العميل مقبول قبل ما يتخزن */
function sanitizeShare(input) {
  const s = input && typeof input === 'object' ? input : {};
  const out = {
    title: clamp(s.title, MAX_TITLE),
    description: clamp(s.description, MAX_DESC),
    image: isAllowedMediaUrl(s.image) ? String(s.image).slice(0, 500) : '',
  };
  // مفيش داعي نخزّن كائن فاضي
  return (out.title || out.description || out.image) ? out : null;
}

module.exports = {
  buildShareTags,
  cloudinaryShareImage,
  injectShareTags,
  stripTemplateShareTags,
  sanitizeShare,
  defaultShare,
  MAX_TITLE,
  MAX_DESC,
};
