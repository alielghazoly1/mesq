// utils/spaPreloads.js
// صفحات الموقع (React) اللي ملفها بيتحمّل كسول: الباقات، الدفع، إنشاء دعوة، لوحة العميل، المحرر.
// المتصفح ماكانش بيعرف ملف الصفحة غير بعد ما الجافاسكريبت الأساسي (~200 كيلو) يتحمّل ويشتغل —
// على نت الموبايل ده ثواني زيادة قبل ما الصفحة تبان (ملف صفحة الدفع كان بيبدأ عند الثانية 3.7).
// هنا السيرفر بيكتب <link rel="modulepreload"> لملف الصفحة والملفات اللي بيستوردها في الـ HTML نفسه،
// فالمتصفح بيحمّلهم جنب الجافاسكريبت الأساسي مش بعده.
//
// المصدر: client/dist/.vite/manifest.json (من vite build — build.manifest في client/vite.config.js).
// الملف مش موجود أو بايظ → مفيش preload خالص والصفحة زي الأول بالظبط. أي ملف موجود أصلًا في
// index.html مابيتكررش، وأي ملف مش موجود على الهارد مابيتكتبش (preload فاشل ممكن يخلّي
// شبكة الأمان في index.html تعيد تحميل الصفحة).
const fs = require('fs');
const path = require('path');

// نفس المسارات في client/src/App.jsx (react-router مابيفرّقش بين الحروف الكبيرة والصغيرة)
const ROUTES = [
  [/^\/packages\/?$/i, 'src/pages/PackagesPage.jsx'],
  [/^\/checkout\/[^/]+\/?$/i, 'src/pages/CheckoutPage.jsx'],
  [/^\/create\/[^/]+\/?$/i, 'src/pages/CreateInvitationPage.jsx'],
  [/^\/dashboard\/?$/i, 'src/pages/DashboardPage.jsx'],
  [/^\/editor\/[^/]+\/?$/i, 'src/pages/EditorPage.jsx'],
];

const ASSET_FILE = /^assets\/[A-Za-z0-9][A-Za-z0-9_.-]*\.js$/;

// distDir → { mtimeMs, size, manifest, tags: Map<module, string> } — بيتقري تاني بس لو الملف اتغيّر (build جديد)
const cache = new Map();

function manifestFor(distDir) {
  const file = path.join(distDir, '.vite', 'manifest.json');
  let st;
  try { st = fs.statSync(file); } catch (_) { cache.delete(distDir); return null; }
  const hit = cache.get(distDir);
  if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit;
  let manifest = null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) manifest = parsed;
  } catch (_) { manifest = null; }
  const entry = { mtimeMs: st.mtimeMs, size: st.size, manifest, tags: new Map() };
  cache.set(distDir, entry);
  return entry;
}

/** الملف + كل اللي بيستورده (استيراد ثابت) — بالترتيب، من غير تكرار */
function staticClosure(manifest, key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  const chunk = manifest[key];
  if (chunk && Array.isArray(chunk.imports)) chunk.imports.forEach((k) => staticClosure(manifest, k, seen));
  return seen;
}

function buildTags(manifest, moduleKey, distDir, indexHtml) {
  const page = manifest[moduleKey];
  if (!page || typeof page.file !== 'string') return '';
  // اللي index.html بيحمّله أصلًا: الملف الأساسي وكل اللي بيستورده
  const loaded = new Set();
  Object.keys(manifest).forEach((k) => {
    if (manifest[k] && manifest[k].isEntry) staticClosure(manifest, k).forEach((x) => { if (manifest[x] && manifest[x].file) loaded.add(manifest[x].file); });
  });
  const files = [];
  staticClosure(manifest, moduleKey).forEach((k) => {
    const f = manifest[k] && manifest[k].file;
    if (typeof f !== 'string' || !ASSET_FILE.test(f) || loaded.has(f) || String(indexHtml || '').includes(`/${f}`)) return;
    if (!fs.existsSync(path.join(distDir, f))) return;
    files.push(f);
  });
  return files.map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`).join('\n  ');
}

/**
 * وسوم modulepreload لصفحة الـ SPA دي ('' لو الصفحة مش منهم أو الخريطة مش موجودة)
 * @param {string} pathname req.path
 * @param {string} distDir client/dist
 * @param {string} indexHtml index.html اللي هيتبعت (ملفاته مابتتكررش)
 */
function modulePreloadTags(pathname, distDir, indexHtml) {
  const route = ROUTES.find(([re]) => re.test(String(pathname || '')));
  if (!route) return '';
  const entry = manifestFor(distDir);
  if (!entry || !entry.manifest) return '';
  if (!entry.tags.has(route[1])) {
    let tags = '';
    try { tags = buildTags(entry.manifest, route[1], distDir, indexHtml); } catch (_) { tags = ''; }
    entry.tags.set(route[1], tags);
  }
  return entry.tags.get(route[1]);
}

module.exports = { modulePreloadTags };
