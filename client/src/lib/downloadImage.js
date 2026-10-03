// تحميل صورة على الجهاز على طول (من غير ما تفتح في تاب جديد).
//
// - صور Cloudinary (اللي العميل رفعها): بنطلب الأصل بجودته الكاملة من
//   غير أي تصغير، مع fl_attachment — فـ Cloudinary نفسه بيبعتها كملف
//   للتحميل والصفحة مبتتحرّكش. نفس الطريقة اللي ألبوم الضيوف شغال بيها.
// - صور القالب نفسه (من الموقع أو Tilda): بنجيبها كـ blob ونحفظها باسم
//   واضح، ولو المتصفح منعها بنفتحها في تاب لوحدها كحل أخير.

const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/** اسم ملف آمن (Cloudinary بيقبل حروف وأرقام و - و _ بس) */
export function safeFileName(name) {
  return String(name || 'photo').replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'photo';
}

/**
 * رابط Cloudinary للتحميل بالجودة الأصلية: بنشيل أي تحويلات قبل رقم
 * النسخة (v123…) — التصغير/الضغط اللي بنعمله للعرض — ونضيف fl_attachment.
 * لو مفيش رقم نسخة بنسيب الرابط زي ما هو ونضيف fl_attachment بس.
 */
export function cloudinaryDownloadUrl(url, name) {
  const m = String(url || '').match(CLOUDINARY);
  if (!m) return null;
  const parts = m[2].split('/');
  const v = parts.findIndex((p) => /^v\d+$/.test(p));
  const rest = v > 0 ? parts.slice(v) : parts;
  return `${m[1]}fl_attachment:${safeFileName(name)}/${rest.join('/')}`;
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg' };

function clickLink(href, fileName) {
  const a = document.createElement('a');
  a.href = href;
  if (fileName) a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 0);
}

/**
 * @param {string} src رابط الصورة (ممكن يكون نسبي)
 * @param {string} name اسم الملف من غير امتداد
 * @param {string} [base] الرابط اللي الروابط النسبية بتتحسب منه (صفحة الدعوة)
 * @returns {Promise<'download'|'opened'>}
 */
export async function downloadImage(src, name, base) {
  let abs;
  try { abs = new URL(src, base || window.location.href).href; } catch { abs = src; }

  const cld = cloudinaryDownloadUrl(abs, name);
  if (cld) { clickLink(cld); return 'download'; }

  if (/^data:/.test(abs)) {
    const type = (abs.match(/^data:([^;,]+)/) || [])[1];
    clickLink(abs, `${safeFileName(name)}.${EXT[type] || 'jpg'}`);
    return 'download';
  }

  try {
    const res = await fetch(abs, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const ext = EXT[blob.type] || (abs.split('?')[0].match(/\.([a-z0-9]{3,4})$/i) || [])[1] || 'jpg';
    const href = URL.createObjectURL(blob);
    clickLink(href, `${safeFileName(name)}.${ext.toLowerCase()}`);
    // سفاري محتاج الرابط يفضل شوية لحد ما التحميل يبدأ
    setTimeout(() => URL.revokeObjectURL(href), 60000);
    return 'download';
  } catch {
    window.open(abs, '_blank', 'noopener');
    return 'opened';
  }
}
