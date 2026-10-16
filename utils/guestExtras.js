// utils/guestExtras.js
// إضافات للضيوف على دعوة معيّنة بالذات (Invitation.guestExtras): تهنئة صوتية
// زي فويس الواتساب ورفع صور الفرح. الواجهة نفسها ملفين ثابتين
// (client/public/guest-extras.js + .css) بيتحقنوا آخر الصفحة، وبيتحطوا تحت
// فورم تأكيد الحضور بستايل الدعوة. الإرسال بيروح لنفس مسارات القوالب اللي
// فيها الميزتين (routes/guestVoices.js و routes/guestPhotos.js)، والتهاني
// والصور بتوصل لصاحب الدعوة في لوحته.
const fs = require('fs');
const path = require('path');
const { safeJsonForScript } = require('./sanitize');

// بصمة نسخة (من تاريخ الملف) عشان المتصفح مايفضلش على نسخة قديمة بعد أي تصليح
const VERSION = (() => {
  try {
    return String(Math.floor(fs.statSync(path.join(__dirname, '..', 'client', 'dist', 'guest-extras.js')).mtimeMs));
  } catch {
    return String(Date.now());
  }
})();

/** الدعوة دي عليها إضافات للضيوف؟ */
function hasGuestExtras(invitation) {
  const g = invitation && invitation.guestExtras;
  return !!(g && (g.voice || g.photos));
}

/**
 * @param {object} invitation مستند الدعوة
 * @param {{editMode?: boolean}} [options]
 * @returns {string} وسوم بتتحط قبل </body>
 */
function guestExtrasTags(invitation, options) {
  if (!hasGuestExtras(invitation)) return '';
  const g = invitation.guestExtras;
  const cfg = {
    voice: !!g.voice,
    photos: !!g.photos,
    shortId: invitation.shortId || null,
    lang: invitation.language === 'ar' ? 'ar' : 'en',
    editMode: !!(options && options.editMode),
  };
  return [
    `<link rel="stylesheet" href="/guest-extras.css?v=${VERSION}">`,
    `<script>window.MITHAQ_EXTRAS = ${safeJsonForScript(cfg)};</script>`,
    `<script src="/guest-extras.js?v=${VERSION}" defer></script>`,
  ].join('\n');
}

module.exports = { guestExtrasTags, hasGuestExtras };
