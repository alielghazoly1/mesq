// utils/support.js
// أدوات الدعم المشتركة بين ناحية العميل (routes/dashboard.js) وناحية
// اللوحة (routes/adminApi.js): شكل الرسالة، رفع الفويس، و"أنا أونلاين".
const multer = require('multer');
const SupportMessage = require('../models/SupportMessage');
const { isCloudinaryReady, getCloudinary } = require('../config/cloudinary');
const { uploadBuffer } = require('./cloudinaryUpload');
const { sniffAudio } = require('./guestVoices');

// الفويس: لحد دقيقتين، ولحد 8MB (دقيقتين من الموبايل ~1–3MB)
const MAX_VOICE_SECONDS = 120;
const MAX_VOICE_BYTES = 8 * 1024 * 1024;
// العميل مايقدرش يغرق المحادثة: أقصى فويسات في الساعة
const MAX_USER_VOICES_PER_HOUR = 20;

const voiceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VOICE_BYTES, files: 1, fields: 3 },
});

/** نفس الرابط بامتداد mp3 — بيشتغل على كل الموبايلات (سفاري مابيشغّلش WebM) */
function asMp3(url) {
  return typeof url === 'string' ? url.replace(/\.[a-z0-9]{2,5}(\?.*)?$/i, '.mp3') : url;
}

/** شكل الرسالة اللي بيرجع للواجهتين */
function serializeMessage(m) {
  const out = {
    id: String(m._id),
    from: m.from,
    kind: m.kind || 'text',
    body: m.body || '',
    createdAt: m.createdAt,
    // "اتشافت" من الطرف التاني (✓✓)
    seen: m.from === 'user' ? !!m.readByAdmin : !!m.readByUser,
    seenAt: m.readAt || null,
  };
  if (out.kind === 'voice' && m.voice && m.voice.url) {
    out.voice = { url: asMp3(m.voice.url), duration: Math.round((m.voice.duration || 0) * 10) / 10 };
  }
  return out;
}

/** سطر المعاينة في قايمة المحادثات */
function previewOf(m) {
  if (!m) return '';
  if (m.kind === 'voice') return '🎤 رسالة صوتية';
  return m.body || '';
}

/**
 * بيرفع فويس ويرجّع { url, publicId, duration } أو { error, status }.
 * الملف بيتفحص بمحتواه إنه صوت، وبيتعاد ترميزه mp3 على Cloudinary.
 */
async function storeVoice(file, { folder, claimed, where, path }) {
  if (!isCloudinaryReady()) return { status: 503, error: 'الفويس مش متاح دلوقتي، جرّب بعد شوية أو اكتب رسالتك.' };
  if (!file) return { status: 400, error: 'سجّل الفويس الأول.' };
  const check = sniffAudio(file.buffer);
  if (!check.ok) return { status: 400, error: check.error };
  const c = Number(claimed);
  if (Number.isFinite(c) && c > MAX_VOICE_SECONDS + 5) return { status: 400, error: 'الفويس أطول من دقيقتين — سجّل أقصر.' };

  const result = await uploadBuffer(file.buffer, {
    folder, resource_type: 'video', format: 'mp3',
  }, { where, path });
  const seconds = Number(result.duration) || (Number.isFinite(c) ? c : 0);
  if (seconds > MAX_VOICE_SECONDS + 5 || (Number(result.duration) && seconds < 0.4)) {
    try { await getCloudinary().uploader.destroy(result.public_id, { resource_type: 'video', invalidate: true }); } catch { /* مش مهم */ }
    return { status: 400, error: seconds > MAX_VOICE_SECONDS ? 'الفويس أطول من دقيقتين — سجّل أقصر.' : 'الفويس قصير جدًا — سجّل تاني.' };
  }
  return { url: result.secure_url, publicId: result.public_id, duration: Math.round(Math.max(0, seconds) * 10) / 10 };
}

/** العميل بعت فويسات كتير في آخر ساعة؟ */
async function userVoiceFlood(userId) {
  const n = await SupportMessage.countDocuments({
    userId, from: 'user', kind: 'voice', createdAt: { $gte: new Date(Date.now() - 3600 * 1000) },
  });
  return n >= MAX_USER_VOICES_PER_HOUR;
}

// ===== "الدعم أونلاين" =====
// آخر مرة اللوحة سألت عن الدعم (بتسأل كل شوية وهي مفتوحة). العميل بيشوف
// "متصل دلوقتي" لو اللوحة مفتوحة في آخر دقيقتين — حقيقي، مش ديكور.
// في الذاكرة بس: لو السيرفر اتعمله ريستارت بيبان "مش متصل" لحد ما اللوحة تسأل تاني.
let adminLastSeen = 0;
const ADMIN_ONLINE_MS = 2 * 60 * 1000;
function touchAdmin() { adminLastSeen = Date.now(); }
function adminOnline() { return Date.now() - adminLastSeen < ADMIN_ONLINE_MS; }

module.exports = {
  voiceUpload, serializeMessage, previewOf, storeVoice, userVoiceFlood,
  touchAdmin, adminOnline, MAX_VOICE_SECONDS,
};
