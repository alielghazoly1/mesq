// utils/inputGuard.js
// حماية عامة من "حقن" استعلامات قاعدة البيانات (NoSQL injection) ومن تلويث
// الـ prototype — طبقة فوق التنضيف اللي كل مسار بيعمله لنفسه (String(...) إلخ).
//
// 1) الكوكيز: كل الكوكيز اللي الموقع بيحطها نصوص. بس cookie-parser بيحوّل أي
//    قيمة بتبدأ بـ "j:" لأوبجكت (JSON)، فكوكي زي  wda_session=j:{"$gt":""}
//    كانت بتوصل لاستعلام الجلسة كشرط ‎$gt‎ مش كقيمة — وتطابق أي جلسة قديمة
//    (دخول على حساب عميل أو على اللوحة من غير باسورد). هنا أي كوكي قيمتها مش
//    نص بتتشال قبل ما أي كود يقراها.
//
// 2) جسم الطلب (JSON): أي مفتاح بيبدأ بـ $ (عوامل MongoDB زي ‎$ne‎ و‎$gt‎) أو
//    اسمه __proto__ / constructor / prototype → 400. الواجهة بتاعتنا عمرها ما
//    بتبعت مفاتيح زي دي.
//
// 3) الـ query: نفس الفحص، بس مفتاح $ في أول مستوى مسموح (زي ?$deeplink_path=
//    اللي بعض خدمات اللينكات بتضيفه) — ده مابيوصلش لأي استعلام، ومش هنقفل
//    صفحة دعوة على ضيف بسببه. الخطر الحقيقي ‎?x[$ne]=1‎ (أوبجكت متداخل) وده مرفوض.

const PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
// أعمق من كده مفيش طلب طبيعي — وبيحمي الفحص نفسه من stack overflow
const MAX_DEPTH = 40;

/**
 * أول مفتاح ممنوع جوه القيمة، أو null.
 * @param {*} value
 * @param {boolean} allowTopDollar مفتاح $ في أول مستوى مسموح (للـ query)
 */
function findBadKey(value, allowTopDollar, depth = 0) {
  if (depth > MAX_DEPTH) return '(nested too deep)';
  if (Array.isArray(value)) {
    for (const item of value) {
      const bad = findBadKey(item, false, depth + 1);
      if (bad) return bad;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (PROTO_KEYS.has(key)) return key;
      if (key.charCodeAt(0) === 36 /* $ */ && !(allowTopDollar && depth === 0)) return key;
      const bad = findBadKey(value[key], false, depth + 1);
      if (bad) return bad;
    }
  }
  return null;
}

/** بيشيل أي كوكي قيمتها مش نص (كوكي "j:" اتحوّلت لأوبجكت/رقم/…) */
function dropNonStringCookies(req, res, next) {
  const jars = [req.cookies, req.signedCookies];
  for (const jar of jars) {
    if (!jar || typeof jar !== 'object') continue;
    for (const name of Object.keys(jar)) {
      if (typeof jar[name] !== 'string') delete jar[name];
    }
  }
  next();
}

/** بيرفض (400) أي طلب فيه مفاتيح عوامل MongoDB أو __proto__ */
function rejectOperatorKeys(req, res, next) {
  let bad = null;
  try {
    bad = findBadKey(req.query, true) || findBadKey(req.body, false);
  } catch {
    bad = '(unreadable)';
  }
  if (!bad) return next();
  // بنسجّل المفتاح والمسار بس (مش محتوى الطلب) — عشان لو حاجة طبيعية اتقفلت بالغلط نشوفها في اللوج
  console.warn(`[input-guard] blocked key "${String(bad).slice(0, 40)}" on ${req.method} ${String(req.path || '').slice(0, 120)}`);
  return res.status(400).json({ error: 'الطلب ده فيه بيانات مش مظبوطة.' });
}

module.exports = { dropNonStringCookies, rejectOperatorKeys, findBadKey };
