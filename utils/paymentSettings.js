// utils/paymentSettings.js
// قراءة/كتابة بيانات الدفع، وتنضيف كل المدخلات قبل ما تتخزن أو تتعرض.
// البيانات دي بتتكتب من لوحة التحكم وبتتعرض للعملاء، فبتعدي على
// sanitizeText زي أي نص تاني بيتعرض في الموقع (utils/sanitize.js).
const PaymentSettings = require('../models/PaymentSettings');
const { sanitizeText } = require('./sanitize');
const { qrDataUrl } = require('./qr');
const { currencyForCountry } = require('../packages/registry');

const KEY = 'default';

// إنستاباي: لينك الدفع لازم يبقى https على دومين إنستاباي الرسمي (ipn.eg أو
// instapay.eg) — عشان محدش يحط لينك غريب يتفتح للعميل. والعنوان xxx@instapay
const INSTAPAY_ADDRESS_RE = /^[a-z0-9._-]{2,80}@instapay$/i;
function isInstapayLink(link) {
  try {
    const u = new URL(link);
    return u.protocol === 'https:' && /(^|\.)(ipn\.eg|instapay\.eg)$/i.test(u.hostname);
  } catch { return false; }
}

// عنوان محفظة Solana: base58 (من غير 0 وO وI وl) وطوله 32–44 حرف
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
// الشبكة ثابتة — USDT على Solana بس (أي شبكة تانية الفلوس بتضيع)
const USDT_NETWORK = 'Solana';

// Taptap Send: البلاد اللي التطبيق بيبعت منها فلوس لمصر (من موقعهم
// taptapsend.com) — العميل اللي مسجّل من واحدة منهم بس هو اللي بيشوفها.
// النمسا، أستراليا، البحرين، بلجيكا، البرازيل، كندا، كرواتيا، التشيك، قبرص،
// الدنمارك، إستونيا، فنلندا، فرنسا، ألمانيا، اليونان، المجر، أيرلندا، إيطاليا،
// لوكسمبورغ، مالطا، مايوت، هولندا، النرويج، بولندا، البرتغال، ريونيون،
// رومانيا، سلوفاكيا، إسبانيا، السويد، الإمارات، المملكة المتحدة، أمريكا.
const TAPTAP_COUNTRIES = new Set([
  'AT', 'AU', 'BH', 'BE', 'BR', 'CA', 'HR', 'CZ', 'CY', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LU', 'MT', 'YT', 'NL', 'NO', 'PL', 'PT', 'RE',
  'RO', 'SK', 'ES', 'SE', 'AE', 'GB', 'US',
]);

// SEPA (تحويل اليورو بين بنوك أوروبا): الدول اللي في نطاق SEPA حسب قايمة
// مجلس المدفوعات الأوروبي (EPC409-09 v8.0، 2026) — 41 دولة: الاتحاد الأوروبي
// (27) + أيسلندا، ليختنشتاين، النرويج + سويسرا، بريطانيا، موناكو، سان مارينو،
// الفاتيكان، أندورا + ألبانيا، مولدوفا، الجبل الأسود، مقدونيا الشمالية، صربيا
// (دخلوا 2025). ومعاهم الأقاليم اللي ليها كود دولة لوحدها وهي جوه SEPA مع
// بلدها: جويانا الفرنسية، جوادلوب، مارتينيك، ريونيون، مايوت، سان بارتيلمي،
// سان مارتن، سان بيير وميكلون، جزر أولاند، جبل طارق، جيرنزي، جيرزي، جزيرة مان.
// كوسوفو بتستخدم اليورو بس مش في SEPA.
const SEPA_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO', 'CH', 'GB', 'MC', 'SM', 'VA', 'AD',
  'AL', 'MD', 'ME', 'MK', 'RS',
  'GF', 'GP', 'MQ', 'RE', 'YT', 'BL', 'MF', 'PM', 'AX', 'GI', 'GG', 'JE', 'IM',
]);

/**
 * العميل ده يشوف تبويب SEPA؟ — لازم يكون بيدفع باليورو (سعره بالـ €) وبلده في
 * SEPA. اللي في بريطانيا/سويسرا/السويد... بيدفع بالدولار عندنا فمش بيشوفه
 * (التحويل ده باليورو بس، والمبلغ لازم يبقى نفس سعر الباقة).
 */
function sepaAllowed(countryCode) {
  const cc = String(countryCode || '').toUpperCase();
  return SEPA_COUNTRIES.has(cc) && currencyForCountry(cc) === 'EUR';
}

/** IBAN سليم؟ (الشكل + رقم التحقق mod 97 — ISO 13616). رقم غلط = فلوس العميل ترجع أو تتأخر */
function isValidIban(v) {
  const s = String(v || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const digits = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let m = 0;
  for (const d of digits) m = (m * 10 + Number(d)) % 97;
  return m === 1;
}
// BIC/SWIFT: 4 حروف البنك + 2 الدولة + 2 المكان + (3 الفرع اختياري)
const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// عنوان البنك: نفس sanitizeText بس من غير ما نشيل الـ ' ("St. Julian's") —
// بيتعرض كنص عادي في React فمفيش منه خطر
function cleanAddress(input, maxLen) {
  if (typeof input !== 'string') return '';
  // eslint-disable-next-line no-control-regex -- بنشيل حروف التحكم بالقصد (زي sanitizeText)
  return input.replace(/<[^>]*>/g, '').replace(/[<>"`]/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

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
    instapay: {
      enabled: !!(b.instapay && b.instapay.enabled),
      link: String((b.instapay && b.instapay.link) || '').trim().slice(0, 300),
      address: String((b.instapay && b.instapay.address) || '').trim().toLowerCase().slice(0, 120),
      phone: sanitizeText(b.instapay && b.instapay.phone, 40),
      name: sanitizeText(b.instapay && b.instapay.name, 120),
      note: sanitizeText(b.instapay && b.instapay.note, 400),
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
    taptap: {
      enabled: !!(b.taptap && b.taptap.enabled),
      phone: sanitizeText(b.taptap && b.taptap.phone, 40),
      recipientName: sanitizeText(b.taptap && b.taptap.recipientName, 120),
      location: sanitizeText(b.taptap && b.taptap.location, 160),
      note: sanitizeText(b.taptap && b.taptap.note, 400),
    },
    usdt: {
      enabled: !!(b.usdt && b.usdt.enabled),
      address: String((b.usdt && b.usdt.address) || '').trim().slice(0, 64),
      note: sanitizeText(b.usdt && b.usdt.note, 400),
    },
    sepa: (() => {
      const e = b.sepa || {};
      return {
        enabled: !!e.enabled,
        // اسم المستفيد بالحروف الكبيرة زي ما KAST كاتباه (البنك بيقارنه بالاسم المسجّل)
        beneficiary: sanitizeText(e.beneficiary, 120).replace(/\s+/g, ' '),
        // الآيبان والـ BIC من غير مسافات وبحروف كبيرة — أسهل في النسخ والفحص
        iban: String(e.iban || '').replace(/\s+/g, '').toUpperCase().slice(0, 34),
        bic: String(e.bic || '').replace(/\s+/g, '').toUpperCase().slice(0, 11),
        bankName: sanitizeText(e.bankName, 120),
        bankAddress: cleanAddress(e.bankAddress, 300),
        note: sanitizeText(e.note, 400),
      };
    })(),
    saudi: (() => {
      const sa = b.saudi || {};
      const bk = sa.bank || {}; const bq = sa.barq || {}; const w = sa.wallet || {};
      return {
        bank: {
          enabled: !!bk.enabled,
          bankName: sanitizeText(bk.bankName, 120),
          accountName: sanitizeText(bk.accountName, 120),
          // الآيبان بيتخزن من غير مسافات وبحروف كبيرة — أسهل في النسخ
          iban: String(bk.iban || '').replace(/\s+/g, '').toUpperCase().slice(0, 60),
          accountNumber: sanitizeText(bk.accountNumber, 60),
          note: sanitizeText(bk.note, 400),
        },
        barq: {
          enabled: !!bq.enabled,
          phone: sanitizeText(bq.phone, 40),
          name: sanitizeText(bq.name, 120),
          note: sanitizeText(bq.note, 400),
        },
        wallet: {
          enabled: !!w.enabled,
          number: sanitizeText(w.number, 40),
          name: sanitizeText(w.name, 120),
          note: sanitizeText(w.note, 400),
        },
      };
    })(),
    whatsapp: sanitizeText(b.whatsapp, 40),
    updatedAt: new Date(),
  };

  // برق بيوصل على فودافون كاش — لو رقمه فاضي بناخد رقم فودافون كاش الأساسي،
  // ولو الاتنين فاضيين مينفعش يتفعّل (العميل هيشوف خانة فاضية)
  const sa = update.saudi;
  if (sa.barq.enabled && !sa.barq.phone && !update.vodafone.number) {
    throw Object.assign(new Error('برق محتاج رقم فودافون كاش اللي هيستقبل التحويل قبل ما يتفعّل.'), { status: 400 });
  }

  const ip = update.instapay;
  if (ip.link && !isInstapayLink(ip.link)) {
    throw Object.assign(new Error('لينك إنستاباي لازم يبقى من إنستاباي نفسها (يبدأ بـ https://ipn.eg/) — انسخه من التطبيق.'), { status: 400 });
  }
  if (ip.address && !INSTAPAY_ADDRESS_RE.test(ip.address)) {
    throw Object.assign(new Error('عنوان إنستاباي لازم يكون بالشكل ده: name@instapay'), { status: 400 });
  }
  if (ip.enabled && !ip.link && !ip.address) {
    throw Object.assign(new Error('إنستاباي محتاج اللينك أو العنوان قبل ما يتفعّل.'), { status: 400 });
  }

  // عنوان غلط = فلوس العميل تضيع، فمبنحفظوش أصلًا
  if (update.usdt.address && !SOLANA_ADDRESS_RE.test(update.usdt.address)) {
    const err = new Error('عنوان محفظة USDT (Solana) مش صحيح — راجعه حرف حرف.');
    err.status = 400;
    throw err;
  }
  if (update.taptap.enabled && (!update.taptap.phone || !update.taptap.recipientName)) {
    const err = new Error('Taptap Send محتاجة رقم فودافون كاش واسم المستلم قبل ما تتفعّل.');
    err.status = 400;
    throw err;
  }
  // SEPA: آيبان غلط = التحويل يرجع للعميل بعد أيام، فمبنحفظوش أصلًا
  const sp = update.sepa;
  if (sp.iban && !isValidIban(sp.iban)) {
    throw Object.assign(new Error('الـ IBAN بتاع SEPA مش صحيح (رقم التحقق مش مظبوط) — انسخه تاني من تطبيق KAST.'), { status: 400 });
  }
  if (sp.bic && !BIC_RE.test(sp.bic)) {
    throw Object.assign(new Error('كود BIC / SWIFT لازم يكون 8 أو 11 حرف (زي CFTEMTM1XXX).'), { status: 400 });
  }
  if (sp.enabled && (!sp.iban || !sp.beneficiary)) {
    throw Object.assign(new Error('تحويل SEPA محتاج الـ IBAN واسم المستفيد قبل ما يتفعّل.'), { status: 400 });
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
    // إنستاباي جنب فودافون كاش — لو المالك مفعّله وفيه لينك أو عنوان سليم
    const ip = doc.instapay || {};
    const ipLink = ip.link && isInstapayLink(ip.link) ? ip.link : '';
    const ipAddr = ip.address && INSTAPAY_ADDRESS_RE.test(ip.address) ? ip.address : '';
    const instapay = ip.enabled && (ipLink || ipAddr) ? {
      link: ipLink,
      address: ipAddr,
      phone: ip.phone || '',
      name: ip.name || '',
      note: ip.note || '',
      qr: ipLink ? qrDataUrl(ipLink, { cellSize: 6, margin: 2 }) : '',
    } : undefined;
    return {
      method: 'vodafone',
      ...(instapay ? { instapay } : {}),
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
  // Taptap Send — للعميل اللي بلده من البلاد اللي التطبيق بيبعت منها بس.
  // بيحوّل من التطبيق على فودافون كاش برقم الموبايل واسم المستلم بس (المكان مش لازم).
  const cc = String(countryCode || '').toUpperCase();
  if (doc.taptap?.enabled && doc.taptap?.phone && doc.taptap?.recipientName && TAPTAP_COUNTRIES.has(cc)) {
    info.taptap = {
      phone: doc.taptap.phone,
      recipientName: doc.taptap.recipientName,
      note: doc.taptap.note || '',
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

  // SEPA (تحويل بنكي باليورو) — لعملاء أوروبا اللي بيدفعوا باليورو بس
  // (sepaAllowed). أول تبويب عندهم في صفحة الدفع.
  const sp = doc.sepa;
  if (sp?.enabled && sp?.beneficiary && isValidIban(sp?.iban) && sepaAllowed(cc)) {
    info.sepa = {
      beneficiary: sp.beneficiary,
      iban: String(sp.iban).replace(/\s+/g, '').toUpperCase(),
      bic: sp.bic || '',
      bankName: sp.bankName || '',
      bankAddress: sp.bankAddress || '',
      note: sp.note || '',
    };
  }

  // السعودية (بالريال): برق أول طريقة — تحويل دولي لمصر على محفظة الجوال
  // (ميزة) بيوصل فودافون كاش. وبعده نفس طرق العميل الدولي (البنك المصري
  // تحويل دولي، KAST، USDT). الرقم الافتراضي = رقم فودافون كاش الأساسي.
  const barq = doc.saudi?.barq;
  const barqPhone = (barq?.phone || doc.vodafone?.number || '').trim();
  if (cc === 'SA' && barq?.enabled && barqPhone) {
    info.barq = {
      phone: barqPhone,
      name: barq.name || doc.vodafone?.holderName || '',
      note: barq.note || '',
    };
  }
  return info;
}

module.exports = {
  getPaymentSettings, updatePaymentSettings, publicPaymentInfo, TAPTAP_COUNTRIES,
  SEPA_COUNTRIES, sepaAllowed, isValidIban,
};
