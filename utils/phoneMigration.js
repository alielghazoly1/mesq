// utils/phoneMigration.js
// توحيد أرقام الحسابات القديمة لنفس الشكل الدولي E.164 (+201012345678) — بيشتغل في الخلفية بعد
// الاتصال بقاعدة البيانات (config/db.js)، وفشله مابيأثرش على أي طلب.
//
// قبل 2026-11-15 الرقم كان اختياري وبيتخزّن زي ما العميل كتبه (01012345678، +20 10…، 0020…،
// +2001012345678 — كود الدولة وبعده الصفر). دلوقتي كل رقم جديد بيتخزّن موحّد، فالقديم لازم يبقى زيه عشان:
//   - البحث عن رقم مستخدم قبل كده يلاقيه مهما كان مكتوب إزاي
//   - لوحة التحكم والواتساب يشوفوا كل الأرقام بنفس الشكل
// القواعد (ولا رقم بيضيع):
//   - بنحوّل بس الرقم اللي المكتبة متأكدة إنه موبايل صحيح (بدولة صاحبه لو مكتوب محلي) — مفيش تخمين
//     لدولة تانية (رقم غلط أوحش من مفيش رقم: الواتساب ممكن يروح لحد غريب)
//   - الشكل القديم بيتحفظ في phoneRaw قبل التغيير
//   - لو الرقم بعد التوحيد بتاع حساب تاني (نفس الرقم مكتوب بشكلين) → بنسيبه زي ما هو ونعدّه "تعارض"
//   - الأرقام اللي مش صحيحة بتفضل زي ما هي (مابنمسحش حاجة)
// بيعدّي على كل الأرقام (حتى اللي شكلها دولي "+…" — زي +2001012345678 اللي شكله موحّد وهو مش صحيح)،
// واللي متخزّن صح بيتعدّى من غير أي كتابة. التعديل على دفعات (200 رقم: سؤال واحد + كتابة واحدة).
// اللوج بالأعداد بس (ومن غير أرقام العملاء).
const { normalizePhone } = require('./phone');

const BATCH = 200;
let running = false;

async function runPhoneMigration({ log = console } = {}) {
  if (running) return null;
  running = true;
  const User = require('../models/User');
  const out = { checked: 0, alreadyOk: 0, converted: 0, invalid: 0, conflicts: 0, failed: 0 };
  const conflictIds = [];
  let batch = [];

  async function flush() {
    const items = batch;
    batch = [];
    if (!items.length) return;
    // نفس الرقم متخزّن موحّد في حساب تاني؟ (نفس الشخص عامل حسابين) — مابنلمسش ده
    const holders = await User.find({ phone: { $in: items.map((x) => x.e164) } }).select('_id phone').lean();
    const owner = new Map(holders.map((h) => [h.phone, String(h._id)]));
    const ops = [];
    for (const it of items) {
      const id = String(it.u._id);
      const h = owner.get(it.e164);
      if (h && h !== id) { out.conflicts += 1; conflictIds.push(id); continue; }
      owner.set(it.e164, id); // حسابين قدام في نفس الدفعة بيتحوّلوا لنفس الرقم: الأول بس
      ops.push({
        updateOne: {
          // phone: القديم — لو العميل غيّر رقمه في نفس اللحظة مانكتبش فوق الجديد
          filter: { _id: it.u._id, phone: it.u.phone },
          update: { $set: { phone: it.e164, ...(it.u.phoneRaw ? {} : { phoneRaw: it.u.phone }) } },
        },
      });
    }
    if (!ops.length) return;
    try {
      const r = await User.bulkWrite(ops, { ordered: false });
      out.converted += r.modifiedCount || 0;
    } catch (err) {
      // E11000: رقم اتسجّل في حساب تاني في نفس اللحظة → تعارض؛ باقي الدفعة اتكتب عادي
      const res = (err && err.result) || {};
      out.converted += res.modifiedCount || res.nModified || 0;
      const errs = [].concat((err && err.writeErrors) || []);
      if (!errs.length) { out.failed += ops.length; log.error && log.error('[phone-migration] batch failed:', err && err.message); return; }
      for (const e of errs) {
        if (e && e.code === 11000) out.conflicts += 1; else out.failed += 1;
      }
    }
  }

  try {
    const cursor = User.find({ phone: { $gt: '' } })
      .select('_id phone country phoneRaw').lean().cursor({ batchSize: BATCH });
    for await (const u of cursor) {
      out.checked += 1;
      let n;
      try { n = normalizePhone(u.phone, u.country); } catch (e) { n = { ok: false }; } // رقم غريب واحد مايوقفش الباقي
      if (!n.ok) { out.invalid += 1; continue; }
      if (n.e164 === u.phone) { out.alreadyOk += 1; continue; }
      batch.push({ u, e164: n.e164 });
      if (batch.length >= BATCH) await flush();
    }
    await flush();
    if (out.checked) {
      const ids = conflictIds.length ? ` conflictIds=${conflictIds.slice(0, 20).join(',')}${conflictIds.length > 20 ? ',…' : ''}` : '';
      log.log && log.log(`[phone-migration] ${JSON.stringify(out)}${ids}`);
    }
    return out;
  } catch (err) {
    log.error && log.error('[phone-migration] failed:', err.message);
    return out;
  } finally {
    running = false;
  }
}

module.exports = { runPhoneMigration };
