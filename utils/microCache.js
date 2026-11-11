// utils/microCache.js
// كاش صغير في الذاكرة للوحة التحكم (2026-11-12 — الموقع بدأ يتقل مع زيادة البيانات):
// اللوحة بتسأل السيرفر كل كام ثانية (مين أونلاين، أرقام النهارده، الدعم، الإحصائيات…)، وكل سؤال
// كان بيلفّ على آلاف العملاء والدعوات في قاعدة البيانات. مع كل تاب مفتوح الحمل بيتضاعف،
// وقاعدة البيانات المشغولة بتبطّأ الموقع كله (الضيوف والعملاء).
//
// الحل: نفس الإجابة بتتقدّم لكل اللي يسأل خلال ثواني قليلة، والحساب بيتعمل مرة واحدة حتى لو
// كذا طلب وصلوا مع بعض. أي تعديل من اللوحة (تفعيل طلب، رد دعم، تغيير سعر…) بيمسح الكاش فورًا —
// فالمالك بيشوف نتيجة اللي عمله على طول.
//
// مافيش بيانات بتتخزن برّه الذاكرة، والكاش بيتقدّم بس بعد التحقق من جلسة الأدمن.

const store = new Map(); // key -> { at, ttl, value } | { pending: Promise }
const MAX_KEYS = 400;

function prune() {
  if (store.size <= MAX_KEYS) return;
  const now = Date.now();
  for (const [k, v] of store) { if (!v.pending && now - v.at > v.ttl) store.delete(k); }
  // لسه كتير؟ نمسح الأقدم
  while (store.size > MAX_KEYS) store.delete(store.keys().next().value);
}

/**
 * قيمة محسوبة بتتخزن ttlMs — والطلبات اللي تيجي والحساب شغال بتستنى نفس النتيجة.
 * لو الحساب فشل مابيتخزنش حاجة (الطلب اللي بعده يحاول من جديد).
 */
function cached(key, ttlMs, compute) {
  const hit = store.get(key);
  if (hit) {
    if (hit.pending) return hit.pending;
    if (Date.now() - hit.at < hit.ttl) return Promise.resolve(hit.value);
  }
  const gen = generation;
  const pending = Promise.resolve().then(compute).then((value) => {
    // لو الكاش اتمسح (تعديل من اللوحة) والحساب شغال، النتيجة دي قديمة — ماتتخزنش
    if (gen === generation) { store.set(key, { at: Date.now(), ttl: ttlMs, value }); prune(); } else if (store.get(key) && store.get(key).pending === pending) store.delete(key);
    return value;
  }, (err) => { if (store.get(key) && store.get(key).pending === pending) store.delete(key); throw err; });
  store.set(key, { pending });
  return pending;
}

let generation = 0;
function clear() { generation += 1; store.clear(); }
/** مسح مفاتيح معيّنة بس (مثلًا رسالة دعم جديدة من عميل → قايمة الدعم تتحدّث فورًا) */
function drop(re) { generation += 1; for (const k of [...store.keys()]) if (re.test(k)) store.delete(k); }

// المسارات اللي اللوحة بتكررها + مدة صلاحية كل واحد (بالمللي ثانية)
const RULES = [
  [/^\/admin\/api\/overview(\?|$)/, 40000],
  [/^\/admin\/api\/live(\?|$)/, 3000],
  [/^\/admin\/api\/journeys\/live(\?|$)/, 3000],
  // قايمة الدعم: بتتمسح فورًا مع أي رسالة جديدة/قراءة (models/SupportMessage.js) — فالمدة هنا للحالات الهادية بس
  [/^\/admin\/api\/support(\?|$)/, 15000],
  [/^\/admin\/api\/analytics(\?|$)/, 30000],
  [/^\/admin\/api\/orders-day(\?|$)/, 15000],
  [/^\/admin\/api\/invitations(\?|$)/, 8000],
  [/^\/admin\/api\/revenue(-monthly)?(\?|$)/, 30000],
  [/^\/admin\/api\/finance(\?|$)/, 30000],
];
function ttlFor(url) {
  for (const [re, ttl] of RULES) if (re.test(url)) return ttl;
  return 0;
}

/**
 * ميدلوير للوحة (بيتركّب بعد requireAdminSession): GET على المسارات اللي فوق بيتقدّم من الكاش،
 * وأي طلب تعديل (POST/PUT/PATCH/DELETE) بيمسح الكاش كله بعد ما يخلص.
 */
function adminMicroCache(req, res, next) {
  const url = req.originalUrl || req.url || '';
  if (req.method !== 'GET') {
    res.on('finish', clear);
    return next();
  }
  const ttl = ttlFor(url);
  if (!ttl) return next();
  const key = `http:${url}`;
  const hit = store.get(key);
  if (hit && !hit.pending && Date.now() - hit.at < hit.ttl) {
    res.set('X-Mithaq-Cache', 'hit');
    return res.status(200).type('application/json').send(hit.value);
  }
  if (hit && hit.pending) {
    // نفس السؤال بيتحسب دلوقتي لطلب تاني — نستنى نتيجته بدل ما نحسب مرتين
    return hit.pending.then((body) => {
      if (body == null) return next();
      res.set('X-Mithaq-Cache', 'shared');
      return res.status(200).type('application/json').send(body);
    }, () => next());
  }
  let done;
  const gen = generation;
  const pending = new Promise((resolve) => { done = resolve; });
  store.set(key, { pending });
  const json = res.json.bind(res);
  res.json = (body) => {
    let text = null;
    try { if (res.statusCode === 200) text = JSON.stringify(body); } catch (e) { text = null; }
    if (text != null && gen === generation) { store.set(key, { at: Date.now(), ttl, value: text }); prune(); } else if (store.get(key) && store.get(key).pending === pending) store.delete(key);
    done(text);
    return json(body);
  };
  // الرد خلص من غير res.json (خطأ/اتقطع): مانسيبش حد مستني
  res.on('close', () => { if (store.get(key) && store.get(key).pending === pending) store.delete(key); done(null); });
  return next();
}

module.exports = { cached, clear, drop, adminMicroCache, ttlFor, _size: () => store.size };
