// utils/guestPhotos.js
// أدوات ألبوم صور الضيوف: الحدود، بصمة مفتاح الضيف، روابط Cloudinary
// بالمقاسات المختلفة، وتوكن صفحة الألبوم السرية.
const crypto = require('crypto');

const Invitation = require('../models/Invitation');
const { getTemplate } = require('../templates/registry');
const { generateShortId } = require('./idGenerator');

// كام صورة يقدر الضيف الواحد يرفع على الدعوة الواحدة، وكام صورة الألبوم
// كله يشيل. الأرقام واسعة لفرح حقيقي (ضيف عنده 40 صورة، والفرح كله 1500)
// وفي نفس الوقت بتمنع حد يغرق المساحة.
const MAX_PER_GUEST = 40;
const MAX_PER_ALBUM = 1500;
// أطول ضلع بيتخزن — الموبايل بيصغّر لـ 2560 قبل الرفع أصلًا، وده سقف أمان
const MAX_STORED_SIDE = 3000;

/** المفتاح اللي على جهاز الضيف: 32 حرف hex عشوائي */
function isValidGuestKey(key) {
  return typeof key === 'string' && /^[a-f0-9]{32}$/.test(key);
}

function hashGuestKey(key) {
  return crypto.createHash('sha256').update(`gp:${key}`).digest('hex');
}

/**
 * رابط Cloudinary بتحويلة. الرابط الأصلي شكله .../image/upload/v123/folder/id.jpg
 * فبنحط التحويلة بعد /upload/ مباشرة.
 */
function cloudinaryVariant(url, transform) {
  if (typeof url !== 'string' || url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

/** اسم ملف آمن للتحميل (Cloudinary بيقبل حروف وأرقام و - و _ بس) */
function attachmentName(shortId, photo) {
  const base = `mithaq-${String(shortId).replace(/[^a-zA-Z0-9_-]/g, '')}-${String(photo._id).slice(-8)}`;
  return base.slice(0, 80);
}

/**
 * شكل الصورة اللي بيرجع للمتصفح.
 * @param {object} photo مستند GuestPhoto (lean)
 * @param {string|null} viewerKeyHash بصمة مفتاح الضيف اللي بيسأل (عشان "صورتك")
 */
function serializePhoto(photo, viewerKeyHash) {
  return {
    id: String(photo._id),
    guestName: photo.guestName || '',
    // مربع صغير للشبكة (قص ذكي على الوش)، وكبيرة للعرض، والأصل للتحميل
    thumb: cloudinaryVariant(photo.url, 'c_fill,g_auto,w_420,h_420,q_auto,f_auto'),
    large: cloudinaryVariant(photo.url, 'c_limit,w_1800,h_1800,q_auto:good,f_auto'),
    download: cloudinaryVariant(photo.url, `fl_attachment:${attachmentName(photo.shortId, photo)}`),
    width: photo.width || 0,
    height: photo.height || 0,
    mine: !!viewerKeyHash && photo.guestKeyHash === viewerKeyHash,
    createdAt: photo.createdAt,
  };
}

/** وسم Cloudinary لكل صور ألبوم دعوة — بيه بنعمل "نزّل الكل" كملف zip */
function albumTag(shortId) {
  return `mithaq_album_${String(shortId).replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/** القالب ده فيه ألبوم صور ضيوف، والقسم مش مشال من الدعوة؟ */
function albumEnabled(invitation) {
  if (!invitation || !invitation.templateId) return false;
  const template = getTemplate(invitation.templateId);
  if (!template || !template.guestPhotos) return false;
  return !(invitation.hiddenSections || []).includes('guestPhotos');
}

/** القالب بيدعم الألبوم (حتى لو صاحب الدعوة شايل القسم) — للوحة العميل */
function templateHasAlbum(templateId) {
  const template = templateId ? getTemplate(templateId) : null;
  return !!(template && template.guestPhotos);
}

/**
 * توكن صفحة الألبوم — بيتولّد مرة واحدة. updateOne بشرط إن الحقل مش
 * موجود (مش save()) عشان مايعيدش التحقق من باقي مستند الدعوة القديم،
 * ولو طلبين جم في نفس اللحظة الاتنين بيرجعوا نفس التوكن.
 */
async function ensureAlbumToken(invitationId) {
  for (let i = 0; i < 5; i += 1) {
    const token = generateShortId(24);
    try {
      await Invitation.updateOne(
        { _id: invitationId, albumToken: { $exists: false } },
        { $set: { albumToken: token } }
      );
    } catch (err) {
      if (err && err.code === 11000) continue; // توكن اتكرر (نادر جدًا)
      throw err;
    }
    const fresh = await Invitation.findById(invitationId).select('albumToken').lean();
    if (fresh && fresh.albumToken) return fresh.albumToken;
  }
  throw new Error('could not generate a unique albumToken');
}

module.exports = {
  MAX_PER_GUEST,
  MAX_PER_ALBUM,
  MAX_STORED_SIDE,
  isValidGuestKey,
  hashGuestKey,
  cloudinaryVariant,
  serializePhoto,
  albumTag,
  albumEnabled,
  templateHasAlbum,
  ensureAlbumToken,
};
