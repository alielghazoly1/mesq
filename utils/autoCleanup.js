// utils/autoCleanup.js
// التنضيف التلقائي للدعوات المجانية المنتهية — مرة في اليوم، لوحده.
//
// - بيشتغل بعد ما السيرفر يقوم بدقيقتين (مايتقّلش على أول الطلبات)،
//   وبعدين بيبص كل ساعة: لو عدى 23 ساعة على آخر تنضيف، بيشتغل.
// - القفل في قاعدة البيانات (SiteTotals.autoCleanupAt) بيتاخد بعملية
//   واحدة ذرّية — فلو فيه أكتر من نسخة من السيرفر، واحدة بس اللي بتنضّف.
// - بيمسح على دفعات (1000) بفاصل صغير بينها، وبحد أقصى في اليوم، عشان
//   القاعدة ماتتقفلش والموقع يفضل سريع. أول مرة لو فيه كمية كبيرة
//   بتخلص على كذا يوم.
// - القواعد نفسها (مين يتمسح ومين لأ) في utils/cleanupExpired.js.
// - تقفله بـ AUTO_CLEANUP=off في متغيرات البيئة.

const connectDB = require('../config/db');
const SiteTotals = require('../models/SiteTotals');
const { cleanupExpiredInvitations, DEFAULT_GRACE_DAYS } = require('./cleanupExpired');

const HOUR = 60 * 60 * 1000;
const EVERY = 23 * HOUR;
const BATCH = 1000;
const MAX_BATCHES_PER_RUN = 20;

/** بياخد القفل لو عدى وقت كفاية على آخر مرة — true يعني دورك تنضّف */
async function claim(now = new Date()) {
  await SiteTotals.updateOne({ key: 'default' }, { $setOnInsert: { key: 'default' } }, { upsert: true });
  const res = await SiteTotals.updateOne(
    { key: 'default', $or: [{ autoCleanupAt: null }, { autoCleanupAt: { $lt: new Date(now.getTime() - EVERY) } }] },
    { $set: { autoCleanupAt: now } }
  );
  return res.modifiedCount === 1;
}

async function runOnce({ force = false } = {}) {
  await connectDB();
  if (!force && !(await claim())) return null;
  let deleted = 0;
  for (let i = 0; i < MAX_BATCHES_PER_RUN; i++) {
    const r = await cleanupExpiredInvitations({ graceDays: DEFAULT_GRACE_DAYS, dryRun: false, limit: BATCH });
    deleted += r.deleted;
    if (r.deleted < BATCH) break;
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  if (deleted) console.log(`🧹 auto-cleanup: removed ${deleted} expired free invitations (counters kept)`);
  return deleted;
}

function startAutoCleanup() {
  if (String(process.env.AUTO_CLEANUP || '').toLowerCase() === 'off') return;
  const tick = () => runOnce().catch((err) => console.error('auto-cleanup failed:', err && err.message));
  setTimeout(tick, 2 * 60 * 1000).unref();
  setInterval(tick, HOUR).unref();
}

module.exports = { startAutoCleanup, runOnce, claim };
