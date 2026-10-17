// لينك المشاركة اللي العميل بينسخه.
//
// المشكلة: واتساب وإنستجرام بيحفظوا كارت اللينك (الصورة والعنوان والوصف)
// أول مرة يتبعت. لو العميل عدّل الكارت بعدها وبعت نفس اللينك، بيفضل يظهر
// الكارت القديم — كإنه ماكتبش حاجة.
//
// الحل: لو العميل عامل كارت مخصص، بنضيف للينك بصمة قصيرة من محتوى الكارت
// (?c=xxxxx). أي تعديل في الكارت = لينك جديد = واتساب يقرا الكارت الجديد.
// السيرفر بيتجاهل البصمة في عرض الدعوة نفسها، فاللينك القديم والجديد
// بيفتحوا نفس الدعوة بالظبط.

const CARD_VERSION = 'v2';

/** بصمة قصيرة ثابتة لنفس المحتوى (djb2 → base36) */
function fingerprint(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 6);
}

/**
 * @param {string} origin مثلًا https://mithaq-invitation.com
 * @param {string} shortId
 * @param {{title?:string, description?:string, image?:string}} [share] الكارت المحفوظ
 */
export function invitationShareUrl(origin, shortId, share) {
  const base = `${origin}/i/${shortId}`;
  const s = share || {};
  if (!s.title && !s.description && !s.image) return base;
  // CARD_VERSION بيتغيّر لما طريقة قراءة الكارت نفسها تتغيّر: كل اللينكات بتطلع
  // جديدة فإنستجرام/فيسبوك يقروا الكارت من الأول. v2 (2026-10-17): مقاس الصورة
  // بقى مكتوب في الكارت — اللينكات القديمة كانت متحفوظة عندهم من غير صورة.
  return `${base}?c=${fingerprint([CARD_VERSION, s.title || '', s.description || '', s.image || ''].join('\u0001'))}`;
}
