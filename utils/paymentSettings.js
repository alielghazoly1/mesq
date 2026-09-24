// utils/paymentSettings.js
// قراءة/كتابة بيانات الدفع، وتنضيف كل المدخلات قبل ما تتخزن أو تتعرض.
// البيانات دي بتتكتب من لوحة التحكم وبتتعرض للعملاء، فبتعدي على
// sanitizeText زي أي نص تاني بيتعرض في الموقع (utils/sanitize.js).
const PaymentSettings = require('../models/PaymentSettings');
const { sanitizeText } = require('./sanitize');
const { isXpayEnabled } = require('./xpay');

const KEY = 'default';

/** بيرجع المستند (وبينشئه فاضي أول مرة) */
async function getPaymentSettings() {
  let doc = await PaymentSettings.findOne({ key: KEY });
  if (!doc) doc = await PaymentSettings.create({ key: KEY });
  return doc;
}

/**
 * بيحدّث البيانات من مدخلات لوحة التحكم بعد تنضيفها.
 * @param {object} body
 */
async function updatePaymentSettings(body) {
  const b = body || {};
  const v = b.vodafone || {};
  const k = b.bank || {};

  const update = {
    vodafone: {
      number: sanitizeText(v.number, 40),
      holderName: sanitizeText(v.holderName, 120),
      note: sanitizeText(v.note, 400),
    },
    bank: {
      bankName: sanitizeText(k.bankName, 120),
      accountNameAr: sanitizeText(k.accountNameAr, 120),
      accountNameEn: sanitizeText(k.accountNameEn, 120),
      accountNumber: sanitizeText(k.accountNumber, 60),
      iban: sanitizeText(k.iban, 60),
      swift: sanitizeText(k.swift, 30),
      address: sanitizeText(k.address, 300),
      note: sanitizeText(k.note, 400),
    },
    whatsapp: sanitizeText(b.whatsapp, 40),
    // القيمة الافتراضية true — بس لو الأدمن بعت false صريح بنقفلها
    xpayEnabled: b.xpayEnabled !== false,
    updatedAt: new Date(),
  };

  return PaymentSettings.findOneAndUpdate({ key: KEY }, update, { new: true, upsert: true });
}

/**
 * الدفع بالفيزا شغّال فعليًا؟ = المفاتيح متظبطة في env **و** الأدمن مقفلوش
 * من اللوحة. ده المصدر الوحيد اللي الراوتس بتسأله.
 * @param {object} doc مستند إعدادات الدفع
 */
function xpayLive(doc) {
  return isXpayEnabled() && (!doc || doc.xpayEnabled !== false);
}

/**
 * الشكل اللي بيتعرض للعميل: طريقة الدفع بتاعت بلده بس، مش كل الطرق.
 * @param {object} doc
 * @param {string} countryCode
 */
function publicPaymentInfo(doc, countryCode) {
  const isEgypt = String(countryCode || '').toUpperCase() === 'EG';
  // الدفع بالفيزا متاح؟ الواجهة بتقرا ده عشان تعرض خيار الفيزا من عدمه
  const xpay = xpayLive(doc);
  if (isEgypt) {
    return {
      method: 'vodafone',
      xpay,
      whatsapp: doc.whatsapp || '',
      vodafone: {
        number: doc.vodafone?.number || '',
        holderName: doc.vodafone?.holderName || '',
        note: doc.vodafone?.note || '',
      },
    };
  }
  return {
    method: 'bank',
    xpay,
    whatsapp: doc.whatsapp || '',
    bank: {
      bankName: doc.bank?.bankName || '',
      accountNameAr: doc.bank?.accountNameAr || '',
      accountNameEn: doc.bank?.accountNameEn || '',
      accountNumber: doc.bank?.accountNumber || '',
      iban: doc.bank?.iban || '',
      swift: doc.bank?.swift || '',
      address: doc.bank?.address || '',
      note: doc.bank?.note || '',
    },
  };
}

module.exports = { getPaymentSettings, updatePaymentSettings, publicPaymentInfo, xpayLive };
