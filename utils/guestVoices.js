// utils/guestVoices.js
// أدوات التهاني الصوتية: الحدود، فحص الملف إنه صوت فعلًا، روابط Cloudinary
// للتشغيل والتنزيل، وهل القالب بيدعمها.
const { getTemplate } = require('../templates/registry');

// كام تهنئة الجهاز الواحد يقدر يبعت على الدعوة، وكام تهنئة الدعوة كلها تشيل
const MAX_PER_GUEST = 10;
const MAX_PER_INVITATION = 1500;
// أقصى مدة (ثانية) — الزرار بيوقف التسجيل عند 60، وفيه سماحية بسيطة
const MAX_SECONDS = 75;
const MIN_SECONDS = 0.5;
// أقصى حجم للملف: دقيقة صوت من الموبايل ~0.5–1.5MB؛ السقف ده بيرفض أي حاجة غريبة
const MAX_VOICE_BYTES = 6 * 1024 * 1024;

/**
 * الملف صوت فعلًا؟ بنبص على أول بايتات (مش على الاسم ولا النوع اللي المتصفح بيقوله).
 * اللي بيطلع من MediaRecorder: WebM (كروم/أندرويد/فايرفوكس)، MP4/M4A (سفاري/آيفون)،
 * وأحيانًا Ogg. وبنقبل WAV وMP3 كمان.
 * @param {Buffer} buf
 * @returns {{ok: boolean, kind?: string, error?: string}}
 */
function sniffAudio(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 64) return { ok: false, error: 'التسجيل فاضي أو ناقص — سجّل تاني.' };
  const b = buf;
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { ok: true, kind: 'webm' };
  if (b.toString('latin1', 0, 4) === 'OggS') return { ok: true, kind: 'ogg' };
  if (b.toString('latin1', 4, 8) === 'ftyp') return { ok: true, kind: 'mp4' };
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WAVE') return { ok: true, kind: 'wav' };
  if (b.toString('latin1', 0, 3) === 'ID3') return { ok: true, kind: 'mp3' };
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return { ok: true, kind: 'mpeg' };
  return { ok: false, error: 'الملف ده مش تسجيل صوت.' };
}

/** رابط Cloudinary بتحويلة بعد /upload/ */
function cloudinaryVariant(url, transform) {
  if (typeof url !== 'string' || url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

/** نفس الرابط بامتداد mp3 — Cloudinary بيحوّل الصوت لـ mp3 (بيشتغل على كل الموبايلات) */
function asMp3(url) {
  if (typeof url !== 'string') return url;
  return url.replace(/\.[a-z0-9]{2,5}(\?.*)?$/i, '.mp3');
}

/** اسم ملف آمن للتنزيل (Cloudinary بيقبل حروف وأرقام و - و _ بس) */
function attachmentName(shortId, voice) {
  return `mithaq-voice-${String(shortId).replace(/[^a-zA-Z0-9_-]/g, '')}-${String(voice._id).slice(-8)}`.slice(0, 80);
}

/** شكل التهنئة اللي بيرجع للوحة صاحب الدعوة */
function serializeVoice(v) {
  return {
    id: String(v._id),
    guestName: v.guestName || '',
    url: asMp3(v.url),
    download: asMp3(cloudinaryVariant(v.url, `fl_attachment:${attachmentName(v.shortId, v)}`)),
    duration: Math.round((v.duration || 0) * 10) / 10,
    heard: !!v.heardAt,
    createdAt: v.createdAt,
  };
}

/** وسم Cloudinary لكل تهاني دعوة — بيه بنعمل "نزّل الكل" كملف zip */
function voiceTag(shortId) {
  return `mithaq_voice_${String(shortId).replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/** القالب بيدعم التهاني الصوتية (حتى لو صاحب الدعوة شايل القسم) */
function templateHasVoice(templateId) {
  const template = templateId ? getTemplate(templateId) : null;
  return !!(template && template.guestVoice);
}

/** القالب بيدعمها والقسم مش مشال من الدعوة؟ */
function voiceEnabled(invitation) {
  if (!invitation || !templateHasVoice(invitation.templateId)) return false;
  return !(invitation.hiddenSections || []).includes('voice');
}

module.exports = {
  MAX_PER_GUEST, MAX_PER_INVITATION, MAX_SECONDS, MIN_SECONDS, MAX_VOICE_BYTES,
  sniffAudio, serializeVoice, voiceTag, templateHasVoice, voiceEnabled, asMp3,
};
