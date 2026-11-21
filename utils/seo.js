// utils/seo.js
// اللي جوجل بيشوفه في كل صفحة عامة من الموقع.
//
// الموقع صفحة React واحدة (index.html)، فقبل كده كل الصفحات كانت بترجع
// نفس العنوان ونفس الـ canonical = الصفحة الرئيسية — يعني جوجل كان فاهم إن
// /packages نسخة مكررة من الرئيسية ومش بيفهرسها. دلوقتي السيرفر بيكتب لكل
// صفحة عامة عنوانها ووصفها ورابطها الأصلي قبل ما يبعتها.
//
// فرق مهم: عنوان جوجل (<title>) فيه الكلمات اللي الناس بتدوّر بيها (دعوة
// زفاف إلكترونية…)، لكن كارت المشاركة (og:title — اللي بيظهر لما اللينك
// يتبعت على واتساب/فيسبوك) مكتوب فيه "ميثاق" بس بطلب المالك، عشان الموقع
// هيبقى فيه بعد كده دعوات أعياد ميلاد ومناسبات تانية مش أفراح بس.
const { TEMPLATES } = require('../templates/registry');
const { LANDING_KEYS, urlOf: landingUrl } = require('./landingPages');

const SITE = 'https://mithaq-invitation.com';

const PAGES = {
  '/': {
    title: 'ميثاق | دعوة زفاف إلكترونية — اعمل دعوة فرحك أونلاين بلينك خاص',
    description: 'ميثاق — موقع دعوات زفاف وخطوبة إلكترونية: اعمل دعوة فرحك أونلاين في دقائق بتصميم فاخر، صور وموسيقى تختارها، عدّاد للفرح وخريطة القاعة وتأكيد حضور، ولينك خاص باسم العروسين تبعته على واتساب.',
  },
  '/packages': {
    title: 'أسعار الدعوات الإلكترونية والباقات | ميثاق',
    description: 'باقات وأسعار دعوات الزفاف والخطوبة الإلكترونية من ميثاق: كل دعوة تبعتها لعدد لا نهائي من الضيوف، تعديل بعد النشر، وتأكيد حضور — ادفع بفودافون كاش أو إنستاباي.',
  },
  '/privacy': { title: 'سياسة الخصوصية | ميثاق', description: 'سياسة الخصوصية في ميثاق — إزاي بنتعامل مع بياناتك وبيانات ضيوفك.' },
  '/terms': { title: 'الشروط والأحكام | ميثاق', description: 'شروط استخدام موقع ميثاق للدعوات الإلكترونية.' },
  '/refund': { title: 'سياسة الاسترجاع | ميثاق', description: 'سياسة الاسترجاع في ميثاق — إمتى تقدر تسترجع فلوسك، وإزاي تطلب ده، وإمتى الفلوس بترجعلك.' },
  '/contact': { title: 'تواصل معانا | ميثاق', description: 'تواصل مع ميثاق للدعوات الإلكترونية — التليفون والواتساب والإيميل والعنوان.' },
};

// صفحات مخفية (مش لجوجل) بس ليها كارت مشاركة: لما اللينك يتبعت على واتساب/فيسبوك يطلع عنوانها وصورتها.
// السيرفر بيبعتها noindex. مش في خريطة الموقع (sitemapXml تحت مكتوبة بالإيد).
const SHARE_CARDS = {
  // معرض شغل كريم (client/src/pages/WeddingPlannerPage.jsx) — بطلب المالك (2026-11-21): العنوان
  // "Wedding Planner with Karim" والصورة تلات تصميمات من شغله (من غير كلام عليها)
  '/wedding-planner': {
    title: 'Wedding Planner with Karim',
    description: 'اتفرّج على تصميمات كريم لديكورات الحفلات والبالونات، واطلب اللي يعجبك على واتساب على طول.',
    image: '/karim/share.jpg',
    width: 1200,
    height: 630,
  },
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pageMeta(pathname) {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PAGES[p] ? { path: p, ...PAGES[p] } : null;
}

/**
 * index.html → نفس الصفحة بعنوان ووصف ورابط أصلي خاصين بالصفحة دي.
 * بنغيّر وسوم الـ head بس — السكريبتات زي ما هي (بصمات الـ CSP مابتتأثرش).
 */
function applyPageMeta(html, meta) {
  if (!meta) return html;
  const url = SITE + (meta.path === '/' ? '/' : meta.path);
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/i, `$1${esc(meta.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${esc(url)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${esc(url)}$2`);
}

/** كارت مشاركة صفحة مخفية (SHARE_CARDS) أو null */
function shareCardFor(pathname) {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return SHARE_CARDS[p] ? { path: p, ...SHARE_CARDS[p] } : null;
}

/**
 * index.html → نفس الصفحة بكارت مشاركة الصفحة دي (العنوان والوصف والصورة لواتساب/فيسبوك/تويتر)
 * وrobots noindex. وسوم الـ head بس — السكريبتات زي ما هي.
 */
function applyShareCard(html, card) {
  if (!card) return html;
  const { asset } = require('../custom-invitations/_asset');
  const url = SITE + card.path;
  const img = SITE + asset(card.image);   // ?v=بصمة → واتساب بيجيب الصورة الجديدة لو اتغيّرت
  const set = (re, val) => (h) => h.replace(re, `$1${esc(val)}$2`);
  return [
    (h) => h.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(card.title)}</title>`),
    set(/(<meta name="description" content=")[^"]*(")/i, card.description),
    set(/(<meta name="robots" content=")[^"]*(")/i, 'noindex, nofollow'),
    set(/(<link rel="canonical" href=")[^"]*(")/i, url),
    set(/(<meta property="og:title" content=")[^"]*(")/i, card.title),
    set(/(<meta property="og:description" content=")[^"]*(")/i, card.description),
    set(/(<meta property="og:url" content=")[^"]*(")/i, url),
    set(/(<meta property="og:image" content=")[^"]*(")/i, img),
    set(/(<meta property="og:image:secure_url" content=")[^"]*(")/i, img),
    set(/(<meta property="og:image:width" content=")[^"]*(")/i, String(card.width)),
    set(/(<meta property="og:image:height" content=")[^"]*(")/i, String(card.height)),
    set(/(<meta property="og:image:alt" content=")[^"]*(")/i, card.title),
    set(/(<meta name="twitter:title" content=")[^"]*(")/i, card.title),
    set(/(<meta name="twitter:description" content=")[^"]*(")/i, card.description),
    set(/(<meta name="twitter:image" content=")[^"]*(")/i, img),
  ].reduce((h, f) => f(h), String(html));
}

/** عنوان ووصف صفحة معاينة تصميم (/preview-sample/:id) */
function previewMeta(template) {
  return {
    title: `تصميم ${template.name} — دعوة زفاف إلكترونية | ميثاق`,
    description: `شوف شكل دعوة الزفاف الإلكترونية بتصميم ${template.name} من ميثاق: ${template.description || 'تصميم فاخر'}. اكتب بياناتك وابعت لضيوفك لينك جاهز في دقائق.`,
    canonical: `${SITE}/preview-sample/${template.id}`,
  };
}

/**
 * ملفات التصاميم مصدّرة من Tilda وجواها canonical بيشاور على موقع Tilda
 * (webgency.tilda.ws) — يعني كنا بنقول لجوجل إن الصفحة دي بتاعة موقع تاني.
 * بنشيله ونحط عنوان ووصف ورابط بتوعنا.
 */
function applyPreviewMeta(html, template) {
  const m = previewMeta(template);
  const img = `${SITE}/img/template-thumbs/${template.id}.jpg`;
  // كارت المشاركة: لما حد يبعت لينك التصميم (زرار المشاركة) يظهر اسم التصميم
  // وصورته — مش "دعوة فرح يوسف و أميرة" بتاعة بيانات المعاينة الوهمية
  const share = `${template.name} | ميثاق`;
  const shareDesc = `شوف تصميم دعوة ${template.name} واعمل دعوتك بيه على ميثاق.`;
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<link rel="canonical" href="${esc(m.canonical)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="ميثاق">',
    `<meta property="og:url" content="${esc(m.canonical)}">`,
    `<meta property="og:title" content="${esc(share)}">`,
    `<meta property="og:description" content="${esc(shareDesc)}">`,
    '<meta property="og:locale" content="ar_EG">',
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:secure_url" content="${esc(img)}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="640">',
    '<meta property="og:image:height" content="1385">',
    `<meta property="og:image:alt" content="${esc(share)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(share)}">`,
    `<meta name="twitter:description" content="${esc(shareDesc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
  ].join('\n    ');
  let out = String(html)
    .replace(/<link[^>]+rel\s*=\s*["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<meta[^>]+(?:property|name)\s*=\s*["'](?:og:[^"']*|twitter:[^"']*|description)["'][^>]*>\s*/gi, '');
  // العنوان الأول بس (اللي في الـ head) — أي <title> تاني جوه SVG يفضل زي ما هو
  out = out.replace(/<title>[\s\S]*?<\/title>/i, '');
  const charset = out.match(/<meta[^>]+charset[^>]*>/i);
  if (charset) {
    const at = out.indexOf(charset[0]) + charset[0].length;
    out = out.slice(0, at) + '\n    ' + tags + out.slice(at);
  } else {
    out = out.replace(/<head[^>]*>/i, (h) => `${h}\n    ${tags}`);
  }
  // شريط "رجوع" + "مشاركة" فوق المعاينة (client/public/preview-bar.js)
  const bar = `<script src="/preview-bar.js" defer data-tpl="${esc(template.id)}" data-name="${esc(template.name)}"></script>`;
  const close = out.lastIndexOf('</body>');
  return close === -1 ? out + bar : out.slice(0, close) + bar + '\n' + out.slice(close);
}

// تاريخ آخر رفع (السيرفر بيقوم من جديد مع كل رفع) — مش تاريخ النهارده كل
// يوم، عشان جوجل بيتجاهل lastmod لو لقاه بيتغيّر من غير ما الصفحة تتغيّر
const DEPLOYED = new Date().toISOString().slice(0, 10);

function sitemapXml() {
  const today = DEPLOYED;
  const urls = [
    { loc: '/', freq: 'weekly', pr: '1.0' },
    { loc: '/packages', freq: 'weekly', pr: '0.9' },
    // صفحات جوجل (utils/landingPages.js) — اللينك العربي متشفّر زي ما المواصفات طالبة
    ...LANDING_KEYS.map((k) => ({ loc: encodeURI(landingUrl(k)), freq: 'weekly', pr: '0.9' })),
    ...TEMPLATES.map((t) => ({ loc: `/preview-sample/${t.id}`, freq: 'monthly', pr: '0.7' })),
    { loc: '/privacy', freq: 'yearly', pr: '0.2' },
    { loc: '/terms', freq: 'yearly', pr: '0.2' },
    { loc: '/refund', freq: 'yearly', pr: '0.2' },
    { loc: '/contact', freq: 'yearly', pr: '0.3' },
  ];
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`).join('\n')
    + '\n</urlset>\n';
}

module.exports = { SITE, pageMeta, applyPageMeta, applyPreviewMeta, previewMeta, sitemapXml, shareCardFor, applyShareCard };
