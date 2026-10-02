// utils/paymentSettings.js
// قراءة/كتابة بيانات الدفع، وتنضيف كل المدخلات قبل ما تتخزن أو تتعرض.
// البيانات دي بتتكتب من لوحة التحكم وبتتعرض للعملاء، فبتعدي على
// sanitizeText زي أي نص تاني بيتعرض في الموقع (utils/sanitize.js).
const PaymentSettings = require('../models/PaymentSettings');
const { sanitizeText } = require('./sanitize');
const { qrDataUrl } = require('./qr');

const KEY = 'default';

// عنوان محفظة Solana: base58 (من غير 0 وO وI وl) وطوله 32–44 حرف
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
// الشبكة ثابتة — USDT على Solana بس (أي شبكة تانية الفلوس بتضيع)
const USDT_NETWORK = 'Solana';

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
    kast: {
      enabled: !!(b.kast && b.kast.enabled),
      link: sanitizeText(b.kast && b.kast.link, 300),
      holderName: sanitizeText(b.kast && b.kast.holderName, 120),
      note: sanitizeText(b.kast && b.kast.note, 400),
    },
    usdt: {
      enabled: !!(b.usdt && b.usdt.enabled),
      address: String((b.usdt && b.usdt.address) || '').trim().slice(0, 64),
      note: sanitizeText(b.usdt && b.usdt.note, 400),
    },
    whatsapp: sanitizeText(b.whatsapp, 40),
    updatedAt: new Date(),
  };

  // عنوان غلط = فلوس العميل تضيع، فمبنحفظوش أصلًا
  if (update.usdt.address && !SOLANA_ADDRESS_RE.test(update.usdt.address)) {
    const err = new Error('عنوان محفظة USDT (Solana) مش صحيح — راجعه حرف حرف.');
    err.status = 400;
    throw err;
  }
  if (update.usdt.enabled && !update.usdt.address) {
    const err = new Error('اكتب عنوان محفظة USDT الأول قبل ما تفعّلها.');
    err.status = 400;
    throw err;
  }

  return PaymentSettings.findOneAndUpdate({ key: KEY }, update, { new: true, upsert: true });
}

/**
 * الشكل اللي بيتعرض للعميل: طريقة الدفع بتاعت بلده بس، مش كل الطرق.
 * @param {object} doc
 * @param {string} countryCode
 */
function publicPaymentInfo(doc, countryCode) {
  const isEgypt = String(countryCode || '').toUpperCase() === 'EG';
  if (isEgypt) {
    return {
      method: 'vodafone',
      whatsapp: doc.whatsapp || '',
      vodafone: {
        number: doc.vodafone?.number || '',
        holderName: doc.vodafone?.holderName || '',
        note: doc.vodafone?.note || '',
      },
    };
  }
  const info = {
    method: 'bank',
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
  // KAST وسيلة عالمية اختيارية — بتظهر جنب البنك للعميل الدولي لو المالك
  // مفعّلها. الـ QR بيتولّد من اللينك الحالي في السيرفر.
  if (doc.kast?.enabled && doc.kast?.link) {
    info.kast = {
      link: doc.kast.link,
      holderName: doc.kast.holderName || '',
      note: doc.kast.note || '',
      qr: qrDataUrl(doc.kast.link, { cellSize: 6, margin: 2 }),
    };
  }
  // USDT (Solana) — التالتة للعميل الدولي. الـ QR = العنوان نفسه (أي محفظة
  // بتقراه)، والشبكة ثابتة ومكتوبة قدامه بوضوح.
  if (doc.usdt?.enabled && doc.usdt?.address && SOLANA_ADDRESS_RE.test(doc.usdt.address)) {
    info.usdt = {
      address: doc.usdt.address,
      network: USDT_NETWORK,
      note: doc.usdt.note || '',
      qr: qrDataUrl(doc.usdt.address, { cellSize: 6, margin: 2 }),
    };
  }
  return info;
}

module.exports = { getPaymentSettings, updatePaymentSettings, publicPaymentInfo };
