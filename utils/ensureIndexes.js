// utils/ensureIndexes.js
// تصليح الفهارس القديمة اللي بقت مخالفة للسكيما الحالية.
//
// ليه ده لازم: مونجو بيبني الفهرس مرة واحدة وبيسيبه زي ما هو. لما
// نغيّر تعريفه في السكيما (زي ما حصل في جلسات الدخول: عمود `token`
// بقى قديم واتشال مكانه `tokenHash`)، الفهرس القديم بيفضل شغّال في
// القاعدة ويقع الكتابة الجديدة.
//
// بالظبط اللي حصل: `token` كان فهرس unique **مش** sparse. الجلسات
// الجديدة مبقتش بتكتب العمود ده خالص، فكلها بقت token = null — وأول
// جلستين اتعملوا، التانية وقعت بخطأ "قيمة مكررة"، يعني تسجيل الدخول
// نفسه بيرجّع 500.
//
// الدالة دي بتشتغل مرة واحدة لكل نسخة سيرفر بعد الاتصال، وبتتجاهل أي
// فشل: تصليح الفهارس مايصحش يمنع السيرفر إنه يقوم.
const mongoose = require('mongoose');

// مدة الحذف التلقائي (TTL) لبيانات التتبّع — لازم تفضل نفس الأرقام اللي في الموديلات.
// مونجو مابيغيّرش المدة لوحده لما نغيّرها في السكيما: الفهرس القديم بيفضل بالمدة القديمة،
// فبنحدّثه هنا. بطلب المالك (2026-11-24) عشان القاعدة المجانية (حدها 512 ميجا) ماتتملاش:
//   خطوات الزوار (صفحة "مباشر") 60 → 30 يوم
//   إحصائيات الأجهزة اليومية 400 → 190 يوم (بتغطي مقارنة آخر 90 يوم باللي قبلها)
// بيانات الشغل (الدعوات، العملاء، الطلبات، الردود، الدعم) مالهاش حذف تلقائي أصلًا.
const DAY = 24 * 3600;
const TTL_TARGETS = [
  ['journeysessions', 'startedAt', 30 * DAY],
  ['sitedevicedays', 'firstSeen', 190 * DAY],
];

async function syncTtl(collName, field, seconds) {
  try {
    const col = mongoose.connection.collection(collName);
    const idx = (await col.indexes()).find((i) => i.key && Object.keys(i.key).length === 1
      && i.key[field] === 1 && typeof i.expireAfterSeconds === 'number');
    if (!idx || idx.expireAfterSeconds === seconds) return; // مفيش فهرس لسه (مونجوس هيبنيه بالجديد) أو متظبط خلاص
    try {
      await mongoose.connection.db.command({ collMod: collName, index: { name: idx.name, expireAfterSeconds: seconds } });
    } catch {
      // لو collMod مش مسموح في الباقة: نشيل الفهرس ونعمله تاني بنفس الاسم والمدة الجديدة
      await col.dropIndex(idx.name);
      await col.createIndex({ [field]: 1 }, { name: idx.name, expireAfterSeconds: seconds });
    }
    console.warn(`[ttl] ${collName}.${field}: ${Math.round(idx.expireAfterSeconds / DAY)} → ${Math.round(seconds / DAY)} days`);
  } catch (err) {
    console.error(`ensureIndexes (ttl ${collName}) skipped:`, err.message);
  }
}

let done = false;

async function ensureIndexes() {
  if (done) return;
  done = true;

  try {
    const sessions = mongoose.connection.collection('sessions');
    const existing = await sessions.indexes();

    // أي فهرس unique على `token` من غير sparse = الفهرس القديم
    const legacy = existing.find((i) => i.key && i.key.token === 1 && i.unique && !i.sparse);
    if (legacy) {
      await sessions.dropIndex(legacy.name);
      console.log('🔧 اتشال فهرس الجلسات القديم:', legacy.name);
    }

    // وبنتأكد إن الفهارس الجديدة موجودة
    const names = new Set(existing.map((i) => i.name));
    if (!names.has('tokenHash_1')) {
      await sessions.createIndex({ tokenHash: 1 }, { unique: true, sparse: true, name: 'tokenHash_1' });
    }
    if (!names.has('prevTokenHash_1')) {
      await sessions.createIndex({ prevTokenHash: 1 }, { sparse: true, name: 'prevTokenHash_1' });
    }
    if (!names.has('familyId_1')) {
      await sessions.createIndex({ familyId: 1 }, { name: 'familyId_1' });
    }
  } catch (err) {
    // مش مشكلة: لو فشل، السكيما هي اللي بتحكم والسيرفر بيكمّل شغل
    console.error('ensureIndexes (sessions) skipped:', err.message);
  }

  // ===== users.phone =====
  // نفس قصة الجلسات بالظبط: بعض قواعد الإنتاج فيها فهرس unique على
  // `phone` من غير sparse/partial. التليفون بقى اختياري وبيتخزّن '' لما
  // العميل يسيبه فاضي — فأول عميلين من غير تليفون بيتعارضوا بخطأ "قيمة
  // مكررة"، واللي كان بيتفسّر غلط كـ "الإيميل مسجل بالفعل" فأي حساب جديد
  // من غير تليفون كان بيفشل. الحل: نشيل الفهرس القديم ونحط فهرس جزئي
  // يفرض التفرّد بس على الأرقام المكتوبة فعلًا.
  try {
    const users = mongoose.connection.collection('users');
    const uidx = await users.indexes();
    const badPhone = uidx.find((i) => i.key && i.key.phone === 1 && !i.partialFilterExpression);
    if (badPhone) {
      await users.dropIndex(badPhone.name);
      console.log('🔧 اتشال فهرس التليفون القديم:', badPhone.name);
    }
    const unames = new Set((await users.indexes()).map((i) => i.name));
    if (!unames.has('phone_unique_nonempty')) {
      await users.createIndex(
        { phone: 1 },
        { unique: true, name: 'phone_unique_nonempty', partialFilterExpression: { phone: { $gt: '' } } }
      );
    }
  } catch (err) {
    // مش مشكلة: لو فشل، السكيما هي اللي بتحكم والسيرفر بيكمّل شغل
    console.error('ensureIndexes skipped:', err.message);
  }

  // ===== مدة حفظ بيانات التتبّع =====
  for (const [coll, field, seconds] of TTL_TARGETS) await syncTtl(coll, field, seconds);
}

module.exports = ensureIndexes;
