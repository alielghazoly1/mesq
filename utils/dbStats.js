// utils/dbStats.js
// بيسجّل حجم قاعدة البيانات مرة واحدة مع كل تشغيل للسيرفر — بيظهر في لوج هوستنجر
// (مستوى WARN عشان يبان وسط الطلبات). الباقة المجانية في MongoDB Atlas حدها 0.5 جيجا
// (البيانات + الفهارس)، والقاعدة لو اتملت ممكن تبطّل تقبل كتابة — فلازم نعرف إحنا فين.
// قراءة بس: مابيغيّرش أي حاجة، وأي فشل بيتسجّل ويتجاهل.
const mongoose = require('mongoose');

const FREE_TIER_MB = 512;
const mb = (b) => (Number(b || 0) / 1048576).toFixed(1);

async function logDbStats() {
  const db = mongoose.connection && mongoose.connection.db;
  if (!db) return;
  const s = await db.stats();
  const used = Number(s.dataSize || 0) + Number(s.indexSize || 0);
  const pct = ((used / (FREE_TIER_MB * 1048576)) * 100).toFixed(0);
  console.warn(`[db-stats] data ${mb(s.dataSize)} MB + indexes ${mb(s.indexSize)} MB = ${mb(used)} MB (${pct}% of the 512 MB free plan) · storage ${mb(s.storageSize)} MB · ${s.objects} docs in ${s.collections} collections`);

  // أكبر الجداول — عشان لو قربنا من الحد نعرف مين اللي واكل المساحة
  const cols = await db.listCollections({}, { nameOnly: true }).toArray();
  const rows = [];
  for (const c of cols) {
    try {
      const [st] = await db.collection(c.name).aggregate([{ $collStats: { storageStats: {} } }]).toArray();
      const ss = (st && st.storageStats) || {};
      rows.push({ name: c.name, size: Number(ss.size || 0) + Number(ss.totalIndexSize || 0), count: ss.count });
    } catch {
      const count = await db.collection(c.name).estimatedDocumentCount().catch(() => '?');
      rows.push({ name: c.name, size: -1, count });
    }
  }
  rows.sort((a, b) => b.size - a.size);
  console.warn('[db-stats] biggest: ' + rows.slice(0, 15)
    .map((r) => `${r.name} ${r.size >= 0 ? mb(r.size) + 'MB' : '?MB'}/${r.count}`).join(' · '));
}

module.exports = { logDbStats };
