// تجهيز الصورة قبل الرفع: صور الموبايل الحديثة بتبقى 5–12 ميجا، والسيرفر
// بيرفض أي حاجة فوق 4 ميجا — فالعميل كان بيختار صورته وماتتغيّرش (والرسالة
// كانت بتظهر في الشريط وهو مقفول على الموبايل). بنصغّرها هنا لحد 2000
// بكسل (نفس اللي Cloudinary بيعمله أصلاً) فتعدّي من غير ما العميل يحس.
import { MAX_UPLOAD_BYTES } from './uploadLimits.js';

const MAX_SIDE = 2000;
// تحت الحد بمسافة أمان — نسيب الملفات الصغيرة زي ما هي بجودتها الأصلية
const SAFE_BYTES = 2.5 * 1024 * 1024;

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    try { canvas.toBlob((b) => resolve(b), type, quality); } catch { resolve(null); }
  });
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* نجرّب الطريقة التانية */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

/**
 * بترجّع الملف نفسه لو صغير، وإلا نسخة مصغّرة (JPEG، أو WebP لو PNG
 * شفاف). لو التصغير فشل لأي سبب بترجّع الملف الأصلي والرفع يقرر.
 */
export async function prepareImage(file) {
  if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  if (file.size <= SAFE_BYTES) return file;
  try {
    const src = await decode(file);
    const w = src.width || src.naturalWidth;
    const h = src.height || src.naturalHeight;
    const k = Math.min(1, MAX_SIDE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * k));
    canvas.height = Math.max(1, Math.round(h * k));
    const ctx = canvas.getContext('2d');
    const keepAlpha = file.type === 'image/png';
    if (!keepAlpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    if (src.close) src.close();

    const tries = keepAlpha
      ? [['image/webp', 0.9], ['image/jpeg', 0.88]]
      : [['image/jpeg', 0.88], ['image/jpeg', 0.75], ['image/jpeg', 0.6]];
    for (const [type, q] of tries) {
      const blob = await toBlob(canvas, type, q);
      // المتصفح اللي مابيدعمش النوع بيرجّع PNG — مانقبلهوش لو أكبر
      if (blob && blob.type === type && blob.size <= MAX_UPLOAD_BYTES) {
        const ext = type === 'image/webp' ? 'webp' : 'jpg';
        return new File([blob], (file.name || 'photo').replace(/\.[^.]+$/, '') + '.' + ext, { type });
      }
    }
  } catch { /* الأصلي */ }
  return file;
}
