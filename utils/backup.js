// utils/backup.js
// نسخة احتياطية يومية من قاعدة البيانات — بطلب المالك (2026-11-24).
//
// ليه: القاعدة على MongoDB Atlas المجانية، ومافيهاش أي نسخ احتياطي خالص. لو حاجة اتمسحت
// أو اتبوّظت بالغلط، الدعوات والعملاء والطلبات مكانش ليهم رجوع.
//
// إزاي:
//   - كل يوم من الساعة 4 الفجر بتوقيت القاهرة، سيرفر واحد بس (حجز في القاعدة) بيقرا كل
//     الجداول ويكتبها في ملف واحد مضغوط: سطر لكل مستند {"c":"<الجدول>","d":<EJSON>}.
//     EJSON بيحفظ الأنواع (ObjectId، التواريخ...) فالاسترجاع بيرجّعها زي ما كانت بالظبط.
//   - الملف في فولدر على حساب هوستنجر برّه الموقع خالص (مش متاح من النت) — آخر 14 يوم.
//   - اللوحة (الأمان) بتوري آخر نسخة وتنزّل أي نسخة، وفيها "اعمل نسخة دلوقتي".
//   - الاسترجاع: scripts/restore-backup.js (اتجرّب كامل قبل التشغيل).
//
// اللي مش داخل في النسخة (مش لازم لرجوع الموقع، أو سري):
//   بيانات تتبّع الزوار والأجهزة (بتتبني تاني لوحدها)، جلسات الدخول (العميل بيسجّل تاني)،
//   مفاتيح واتساب (بتتربط تاني بالـ QR)، سر التحقق بخطوتين، وسجلات الأخطاء.
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { once } = require('events');
const mongoose = require('mongoose');
const { cairoParts } = require('./cairoTime');

const { EJSON } = mongoose.mongo.BSON;

const EXCLUDE = new Set([
  'journeysessions', 'sitedevicedays', 'sitedevices', 'presences', 'visits', 'campaignhits', 'metaevents',
  'sessions', 'adminsessions', 'adminlogintickets', 'ratelimits',
  'whatsappauths', 'whatsappstates', 'whatsappoutboxes',
  'adminsecurities', 'clienterrors',
  'backupstate', // حالة النسخ نفسها
]);
const KEEP = 14;
const NAME_RE = /^mithaq-backup-\d{4}-\d{2}-\d{2}-\d{6}\.ndjson\.gz$/;
const START_HOUR = 4; // الساعة 4 الفجر بتوقيت القاهرة

const backupDir = () => process.env.BACKUP_DIR || path.join(os.homedir(), 'mithaq-backups');
const pad = (n) => String(n).padStart(2, '0');
function cairoStamp(d = new Date()) {
  const p = cairoParts(d);
  return { day: `${p.year}-${pad(p.month)}-${pad(p.day)}`, hm: `${pad(p.hour)}${pad(p.minute)}${pad(p.second)}`, hour: p.hour };
}

let running = null; // نسخة شغّالة دلوقتي في نفس السيرفر — مانبدأش تانية فوقها

/**
 * بتعمل نسخة دلوقتي.
 * @returns {Promise<{file:string, bytes:number, docs:number, counts:Object<string,number>, ms:number}>}
 */
function runBackup({ reason = 'manual' } = {}) {
  if (running) return running;
  running = (async () => {
    const t0 = Date.now();
    const db = mongoose.connection && mongoose.connection.db;
    if (!db) throw new Error('قاعدة البيانات مش متصلة');
    const dir = backupDir();
    await fsp.mkdir(dir, { recursive: true, mode: 0o700 });
    const { day, hm } = cairoStamp();
    const file = `mithaq-backup-${day}-${hm}.ndjson.gz`;
    const tmp = path.join(dir, `.${file}.${process.pid}.tmp`);
    const gz = zlib.createGzip({ level: 6 });
    const out = fs.createWriteStream(tmp, { mode: 0o600 });
    gz.pipe(out);
    const write = async (obj) => { if (!gz.write(JSON.stringify(obj) + '\n')) await once(gz, 'drain'); };
    const counts = {};
    let docs = 0;
    try {
      await write({ t: 'meta', v: 1, at: new Date().toISOString(), reason, db: db.databaseName });
      const cols = (await db.listCollections({}, { nameOnly: true }).toArray())
        .map((c) => c.name).filter((n) => !EXCLUDE.has(n) && !n.startsWith('system.')).sort();
      for (const name of cols) {
        let n = 0;
        // دفعات صغيرة ومن غير ضغط على الباقة المجانية (100 عملية/ثانية)
        const cursor = db.collection(name).find({}, { batchSize: 500 });
        for await (const doc of cursor) {
          await write({ c: name, d: EJSON.serialize(doc, { relaxed: false }) });
          n += 1;
        }
        counts[name] = n;
        docs += n;
      }
      await write({ t: 'end', docs, counts });
      gz.end();
      await once(out, 'finish');
    } catch (err) {
      gz.destroy(); out.destroy();
      await fsp.rm(tmp, { force: true }).catch(() => {});
      throw err;
    }
    const final = path.join(dir, file);
    await fsp.rename(tmp, final);
    const { size } = await fsp.stat(final);
    await pruneOld();
    return { file, bytes: size, docs, counts, ms: Date.now() - t0 };
  })().finally(() => { running = null; });
  return running;
}

/** بيسيب آخر KEEP نسخ بس */
async function pruneOld() {
  const files = await listBackups();
  for (const f of files.slice(KEEP)) await fsp.rm(path.join(backupDir(), f.name), { force: true }).catch(() => {});
}

/** النسخ الموجودة، الأحدث الأول */
async function listBackups() {
  let names = [];
  try { names = await fsp.readdir(backupDir()); } catch { return []; }
  const rows = [];
  for (const name of names.filter((n) => NAME_RE.test(n))) {
    try {
      const st = await fsp.stat(path.join(backupDir(), name));
      rows.push({ name, bytes: st.size, at: st.mtime });
    } catch { /* اتمسح في نفس اللحظة */ }
  }
  return rows.sort((a, b) => (a.name < b.name ? 1 : -1));
}

/** المسار الكامل لنسخة باسمها — أو null لو الاسم مش اسم نسخة (حماية من ../) */
function backupPath(name) {
  if (!NAME_RE.test(String(name || ''))) return null;
  return path.join(backupDir(), name);
}

// ===== الحالة والجدول اليومي =====
const stateCol = () => mongoose.connection.collection('backupstate');

/** سيرفر واحد بس بياخد يوم القاهرة ده — الباقيين بيلاقوا اليوم محجوز */
async function claimDay(day) {
  try {
    const r = await stateCol().findOneAndUpdate(
      { _id: 'daily', day: { $ne: day } },
      { $set: { day, claimedAt: new Date(), host: os.hostname(), pid: process.pid } },
      { upsert: true, returnDocument: 'after' },
    );
    return !!r;
  } catch (err) {
    if (err && err.code === 11000) return false; // اليوم محجوز خلاص
    throw err;
  }
}

async function saveStatus(fields) {
  await stateCol().updateOne({ _id: 'daily' }, { $set: fields }, { upsert: true });
}

async function getStatus() {
  const s = await stateCol().findOne({ _id: 'daily' });
  return s ? { day: s.day, lastOk: s.lastOk || null, lastError: s.lastError || null } : { day: null, lastOk: null, lastError: null };
}

const MAX_FAILS_PER_DAY = 3;

/**
 * نسخة دلوقتي + تسجيل نتيجتها (للزرار في اللوحة وللجدول اليومي).
 * @param {string} reason
 * @param {string} [day] يوم القاهرة اللي الجدول حجزه — لو النسخة فشلت بنفكّ الحجز عشان
 *   تتعاد بعد ربع ساعة (لحد 3 مرات في اليوم، من غير ما اللوج يتملي)
 */
async function backupAndRecord(reason, day) {
  try {
    const r = await runBackup({ reason });
    await saveStatus({ lastOk: { at: new Date(), file: r.file, bytes: r.bytes, docs: r.docs, ms: r.ms, reason }, lastError: null });
    console.warn(`[backup] ok ${r.file} ${(r.bytes / 1048576).toFixed(1)} MB, ${r.docs} docs in ${Object.keys(r.counts).length} collections, ${(r.ms / 1000).toFixed(1)}s → ${backupDir()}`);
    return r;
  } catch (err) {
    console.error('[backup] failed:', err.message);
    await saveStatus({ lastError: { at: new Date(), message: String(err.message).slice(0, 300), reason } }).catch(() => {});
    if (day) {
      const s = await stateCol().findOne({ _id: 'daily' }).catch(() => null);
      const fails = s && s.failDay === day ? (s.failCount || 0) + 1 : 1;
      await stateCol().updateOne({ _id: 'daily' }, { $set: { day: null, failDay: day, failCount: fails } }).catch(() => {});
    }
    throw err;
  }
}

/**
 * دورة واحدة من الجدول (كل ربع ساعة). أول نسخة على الإطلاق بتتعمل على طول بعد التشغيل
 * (من غير ما تستنى الساعة 4 — القاعدة مالهاش أي نسخة لحد دلوقتي)، وبعدها نسخة كل يوم
 * من الساعة 4 الفجر بتوقيت القاهرة. سيرفر واحد بس بيعملها (claimDay).
 * @param {Date} [now] للاختبار
 * @returns {Promise<string>} اللي حصل (للاختبار واللوج)
 */
async function scheduledTick(now = new Date()) {
  try {
    const { day, hour } = cairoStamp(now);
    const s = await stateCol().findOne({ _id: 'daily' });
    const firstEver = !(s && s.lastOk);
    if (hour < START_HOUR && !firstEver) return 'wait-4am';
    if (s && s.day === day) return 'done-today';
    if (s && s.failDay === day && (s.failCount || 0) >= MAX_FAILS_PER_DAY) return 'gave-up-today';
    if (!(await claimDay(day))) return 'other-server';
    await backupAndRecord(firstEver ? 'first' : 'daily', day);
    return firstEver ? 'first' : 'daily';
  } catch {
    return 'failed'; // اتسجّل في backupAndRecord
  }
}

let started = false;
/** الجدول اليومي — بيتشغّل مرة واحدة لكل سيرفر بعد الاتصال بالقاعدة */
function startBackupScheduler() {
  if (started || process.env.NODE_ENV === 'test' || process.env.BACKUP === 'off') return;
  started = true;
  const tick = () => scheduledTick().catch(() => {});
  setTimeout(tick, 90 * 1000).unref();
  setInterval(tick, 15 * 60 * 1000).unref();
}

module.exports = {
  runBackup, backupAndRecord, listBackups, backupPath, getStatus, claimDay,
  startBackupScheduler, scheduledTick, backupDir, EXCLUDE, NAME_RE, KEEP,
};
