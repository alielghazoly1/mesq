// utils/qr.js
// توليد QR للينك (زي لينك KAST) كـ data-URL صورة — بيتحسب في السيرفر من
// اللينك الحالي، فأي تغيير في اللينك بيطلّع QR جديد تلقائيًا، من غير أي
// اعتماد خارجي وقت التشغيل. المكتبة (qrcode-generator، MIT) مستضافة محليًا.
const qrcode = require('./vendor/qrcode-generator');

/**
 * QR كـ data-URL (image/gif base64) — يتحط مباشرة في <img src>.
 * @param {string} text النص/اللينك
 * @param {{cellSize?:number, margin?:number, ecc?:'L'|'M'|'Q'|'H'}} [opts]
 * @returns {string} data:image/gif;base64,... أو '' لو النص فاضي
 */
function qrDataUrl(text, opts) {
  const s = String(text == null ? '' : text).trim();
  if (!s) return '';
  const o = opts || {};
  try {
    const qr = qrcode(0, o.ecc || 'M'); // 0 = نوع تلقائي حسب طول النص
    qr.addData(s);
    qr.make();
    return qr.createDataURL(o.cellSize || 6, o.margin != null ? o.margin : 2);
  } catch (e) {
    return '';
  }
}

module.exports = { qrDataUrl };
