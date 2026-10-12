// utils/cloudinaryUpload.js
// رفع بافر لـ Cloudinary مع إعادة محاولة تلقائية.
//
// ليه: الاتصال بين السيرفر و Cloudinary بيقع أحيانًا لثواني (اتقطع، اتأخر،
// أو Cloudinary رد بخطأ مؤقت 5xx). قبل كده أول وقعة كانت بترجع للعميل
// "الرفع فشل، حاول تاني" حتى لو المحاولة اللي بعدها بثانية كانت هتنجح —
// اتشاف ده فعليًا على الموقع: نفس الصورة فشلت وبعد دقيقة اترفعت عادي.
// دلوقتي الأخطاء المؤقتة بتتعاد لوحدها، والأخطاء الحقيقية (ملف بايظ،
// مفاتيح غلط) بترجع على طول من غير ما نضيّع وقت العميل.
//
// وأي فشل نهائي بيتسجّل في لوحة التحكم ← "أعطال الواجهة" بالسبب الحقيقي،
// عشان لو اتكرر نعرف بالظبط حصل إيه بدل التخمين.
const { getCloudinary } = require('../config/cloudinary');
const ClientError = require('../models/ClientError');

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [700, 1800];
// مهلة كل محاولة (الافتراضي في المكتبة 60 ثانية — كتير على عميل مستني)
const ATTEMPT_TIMEOUT_MS = 40000;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** محاولة واحدة */
function uploadOnce(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { timeout: ATTEMPT_TIMEOUT_MS, ...options },
      (err, result) => {
        if (err) return reject(err);
        if (!result || !result.secure_url) return reject(new Error('Cloudinary رجّع رد من غير رابط'));
        return resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * الخطأ ده مؤقت ويستاهل نعيد؟
 * - من غير http_code = مشكلة شبكة (اتقطع/DNS/اتصال اترفض)
 * - 499 مهلة، 420/429 ضغط، 5xx عطل عندهم
 * أما 400/401/403/404 فدي حاجة غلط في الطلب نفسه — الإعادة مش هتفيد.
 */
function isTransient(err) {
  const code = err && err.http_code;
  if (!code) return true;
  return code === 499 || code === 420 || code === 429 || code >= 500;
}

function describe(err) {
  if (!err) return 'unknown';
  const parts = [];
  if (err.http_code) parts.push(`http ${err.http_code}`);
  if (err.code) parts.push(err.code);
  if (err.name && err.name !== 'Error') parts.push(err.name);
  parts.push(err.message || String(err));
  return parts.join(' · ');
}

/** بيسجّل الفشل النهائي في لوحة التحكم — عمره ما يوقّع الطلب نفسه */
function report(err, { where, path, userId, bytes, attempts }) {
  const message = `رفع ملف فشل (عدد المحاولات ${attempts}): ${describe(err)}`.slice(0, 500);
  console.error(`[upload] ${where}:`, message);
  ClientError.create({
    message,
    stack: String((err && err.stack) || '').slice(0, 4000),
    path: String(path || '').split(/[?#]/)[0].slice(0, 200),
    where: String(where || 'upload').slice(0, 80),
    context: `server · ${Math.max(1, Math.round((bytes || 0) / 1024))}KB`,
    userId: userId || null,
  }).catch(() => {});
}

/**
 * @param {Buffer} buffer
 * @param {object} options خيارات Cloudinary (folder, resource_type, ...)
 * @param {{where?: string, path?: string, userId?: any}} [meta] للتسجيل لو فشل
 */
async function uploadBuffer(buffer, options, meta = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await uploadOnce(buffer, options);
      if (attempt > 1) console.warn(`[upload] ${meta.where || ''} نجح في المحاولة ${attempt}`);
      return result;
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === MAX_ATTEMPTS) {
        report(err, { ...meta, bytes: buffer && buffer.length, attempts: attempt });
        throw err;
      }
      console.warn(`[upload] ${meta.where || ''} محاولة ${attempt} فشلت (${describe(err)}) — بنعيد`);
      await wait(BACKOFF_MS[attempt - 1] || 2000);
    }
  }
  throw lastErr;
}

module.exports = { uploadBuffer, isTransient };
