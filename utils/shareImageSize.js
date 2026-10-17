// utils/shareImageSize.js
// مقاس صورة كارت المشاركة الحقيقي (بعد تحويل Cloudinary).
//
// ليه: إنستجرام وفيسبوك وماسنجر بيعالجوا صورة og:image في الخلفية أول مرة
// يشوفوا اللينك — ولو الصفحة مش قايلة مقاسها (og:image:width/height) بيبعتوا
// اللينك من غير صورة خالص لحد ما يخلّصوا (شكوى "على الواتساب الصورة بتظهر
// وعلى إنستجرام لأ"). مانقدرش نكتب مقاس ثابت لأن صورة العميل بأي نسبة، فبنسأل
// Cloudinary عن مقاس الصورة النهائية بالظبط (fl_getinfo) ونخزّنه في الذاكرة —
// مرة واحدة لكل صورة. لو Cloudinary اتأخر، الصفحة مابتستناش أكتر من ثانيتين
// ونص وبتطلع زي ما كانت (من غير المقاس).
const cache = new Map();
const MAX_ENTRIES = 5000;
const FAIL_TTL_MS = 10 * 60 * 1000;

/** نفس رابط الصورة بس بيرجّع بياناتها (JSON) بدل الصورة */
function infoUrl(url) {
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return '';
  const head = url.slice(0, i + marker.length);
  const parts = url.slice(i + marker.length).split('/');
  let k = 0;
  while (k < parts.length - 1 && /^(?:[a-z]{1,3}_[^/]*)(?:,[a-z]{1,3}_[^/]*)*$/.test(parts[k])) k += 1;
  parts.splice(k, 0, 'fl_getinfo');
  return head + parts.join('/');
}

/**
 * @param {string} url رابط صورة Cloudinary النهائي (اللي في og:image)
 * @param {number} [timeoutMs]
 * @returns {Promise<{width:number,height:number}|null>}
 */
async function shareImageSize(url, timeoutMs = 2500) {
  if (typeof url !== 'string' || !/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) return null;
  const hit = cache.get(url);
  if (hit) {
    if (hit.size || Date.now() - hit.at < FAIL_TTL_MS) return hit.size;
  }
  const src = infoUrl(url);
  if (!src) return null;
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, timeoutMs);
  let size = null;
  try {
    const res = await fetch(src, ctrl ? { signal: ctrl.signal } : {});
    if (res.ok) {
      const j = await res.json();
      const o = (j && j.output) || {};
      const w = Number(o.width); const h = Number(o.height);
      if (w > 0 && h > 0 && w < 20000 && h < 20000) size = { width: Math.round(w), height: Math.round(h) };
    }
  } catch { /* اتأخر أو وقع — الكارت بيطلع من غير المقاس زي الأول */ }
  clearTimeout(timer);
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(url, { size, at: Date.now() });
  return size;
}

module.exports = { shareImageSize, infoUrl };
