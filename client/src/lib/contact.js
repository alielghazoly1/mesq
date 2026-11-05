// كل طرق التواصل في مكان واحد.
//
// قبل كده رقم الواتساب كان متكتوب بإيده في مكانين مختلفين — فأي تغيير
// فيه لازم تفتكر كل الأماكن. هنا رقم واحد، ودوال بتبني اللينك ومعاه
// رسالة مكتوبة جاهزة حسب المكان اللي العميل جاي منه، عشان يبعت من غير
// ما يفكر يكتب إيه — واللي مستلم يعرف هو جاي منين من غير ما يسأل.
export const WHATSAPP_PHONE = '01035225735';
const WHATSAPP_INTL = '2' + WHATSAPP_PHONE; // مصر

/** الرقم بشكل يقراه الإنسان */
export const phoneDisplay = WHATSAPP_PHONE;
/** نفس الرقم بالكود الدولي (+20) — لصفحة "تواصل معانا" */
export const phoneIntlDisplay = '+20 ' + WHATSAPP_PHONE.slice(1, 3) + ' ' + WHATSAPP_PHONE.slice(3, 7) + ' ' + WHATSAPP_PHONE.slice(7);
/** لينك اتصال مباشر */
export const telLink = 'tel:+' + WHATSAPP_INTL;

export const CONTACT_EMAIL = 'mithaq@mithaq-invitation.com';

// العنوان في مصر — بوابة الدفع (XPay) والبنك المركزي طالبين عنوان واضح
// (المنطقة والمحافظة والبلد) في صفحة "تواصل معانا" وتحت في الموقع
export const ADDRESS = {
  ar: 'ابني بيتك 6، عمارات الربوة 11، عمارة رقم 160، شقة رقم 15 — أكتوبر الجديدة، محافظة الجيزة، جمهورية مصر العربية',
  en: 'Apartment 15, Building 160, Al Rabwa Buildings 11, Ebny Beitak 6 — New October City, Giza Governorate, Egypt',
};

/**
 * لينك واتساب برسالة جاهزة.
 * @param {string} [message] الرسالة المبدئية
 */
export function whatsappLink(message) {
  const base = 'https://wa.me/' + WHATSAPP_INTL;
  return message ? base + '?text=' + encodeURIComponent(message) : base;
}

/**
 * رسايل جاهزة حسب سبب التواصل. كل واحدة بتقول لصاحب الموقع الموضوع
 * من أول سطر، فمفيش وقت بيضيع في "أقدر أساعدك في إيه؟"
 */
export const WHATSAPP_MESSAGES = {
  help: 'السلام عليكم، محتاج مساعدة في موقع ميثاق.',
  packages: 'السلام عليكم، عايز أسأل عن الباقات والأسعار.',
  payment: 'السلام عليكم، عندي سؤال في التحويل والدفع.',
  editor: 'السلام عليكم، محتاج مساعدة في تعديل دعوتي.',
  // من زرار الرد التلقائي في رسائل الدعم
  support: 'السلام عليكم، بعتلكم رسالة على الدعم في موقع ميثاق.',
  // ده اللي بيجيب الشغل الكبير: موقع كامل أو تصميم مخصص
  custom: 'السلام عليكم، عايز أعمل موقع أو تصميم مخصص. ممكن نتكلم؟',
};
