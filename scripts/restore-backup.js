#!/usr/bin/env node
// scripts/restore-backup.js
// استرجاع نسخة احتياطية من اللي بيعملها utils/backup.js (ملف .ndjson.gz) لقاعدة بيانات.
//
// الاستخدام (من فولدر المشروع):
//   MONGODB_URI="mongodb+srv://..." node scripts/restore-backup.js <الملف> [--dry-run] [--only=users,invitations] [--replace]
//
//   --dry-run   بيقرا الملف ويعدّ اللي فيه بس — مابيكتبش أي حاجة
//   --only=…    جداول معيّنة بس (مفصولة بفاصلة)
//   --replace   بيمسح الجدول الأول وبعدين يرجّعه من النسخة (استرجاع كامل بعد مشكلة).
//               من غيره: لو الجدول فيه بيانات بيقف ومايكتبش — عشان نسختين مايتخلطوش بالغلط.
//
// الملف لازم يكون كامل (آخره سطر "end") — نسخة اتقطعت في النص مابتترجّعش.
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const mongoose = require('mongoose');

const { EJSON } = mongoose.mongo.BSON;
const BATCH = 500;

function parseArgs(argv) {
  const opts = { file: null, dryRun: false, replace: false, only: null };
  for (const a of argv) {
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--replace') opts.replace = true;
    else if (a.startsWith('--only=')) opts.only = new Set(a.slice(7).split(',').map((s) => s.trim()).filter(Boolean));
    else if (!a.startsWith('--')) opts.file = a;
  }
  return opts;
}

/** بيقرا الملف سطر سطر (من غير ما يحمّله كله في الذاكرة) */
async function* readLines(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file).pipe(zlib.createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) if (line.trim()) yield JSON.parse(line);
}

/** بيتأكد إن الملف كامل وبيرجّع العدد في كل جدول */
async function inspect(file) {
  let meta = null; let end = null; const counts = {};
  for await (const row of readLines(file)) {
    if (row.t === 'meta') meta = row;
    else if (row.t === 'end') end = row;
    else counts[row.c] = (counts[row.c] || 0) + 1;
  }
  return { meta, end, counts };
}

async function restore(file, { db, replace = false, only = null, log = console.log } = {}) {
  const info = await inspect(file);
  if (!info.end) throw new Error('الملف مش كامل (مفيش سطر end) — مش هيترجّع.');
  const total = Object.values(info.counts).reduce((a, b) => a + b, 0);
  if (total !== info.end.docs) throw new Error(`عدد المستندات في الملف (${total}) مش زي المكتوب في آخره (${info.end.docs}).`);
  const wanted = Object.keys(info.counts).filter((c) => !only || only.has(c));

  // قبل أي كتابة: لو جدول فيه بيانات ومش --replace، نقف من غير ما نلمس أي حاجة
  for (const c of wanted) {
    const n = await db.collection(c).estimatedDocumentCount();
    if (n > 0 && !replace) throw new Error(`الجدول ${c} فيه ${n} مستند — شغّل بـ --replace لو عايز تمسحه وترجّعه من النسخة.`);
  }
  if (replace) for (const c of wanted) await db.collection(c).deleteMany({});

  const buf = {}; const done = {};
  const flush = async (c) => {
    if (!buf[c] || !buf[c].length) return;
    await db.collection(c).insertMany(buf[c], { ordered: false });
    done[c] = (done[c] || 0) + buf[c].length;
    buf[c] = [];
  };
  for await (const row of readLines(file)) {
    if (row.t || !wanted.includes(row.c)) continue;
    (buf[row.c] = buf[row.c] || []).push(EJSON.deserialize(row.d, { relaxed: false }));
    if (buf[row.c].length >= BATCH) await flush(row.c);
  }
  for (const c of Object.keys(buf)) await flush(c);
  for (const c of wanted) log(`  ${c}: ${done[c] || 0}`);
  return { restored: done, meta: info.meta };
}

module.exports = { restore, inspect };

if (require.main === module) {
  (async () => {
    const opts = parseArgs(process.argv.slice(2));
    if (!opts.file) { console.error('اكتب اسم ملف النسخة. مثال: node scripts/restore-backup.js mithaq-backup-2026-11-24-040012.ndjson.gz --dry-run'); process.exit(1); }
    const info = await inspect(opts.file);
    console.log(`النسخة: ${info.meta ? info.meta.at : '?'} — ${info.end ? 'كاملة' : 'مش كاملة!'}`);
    Object.entries(info.counts).sort().forEach(([c, n]) => console.log(`  ${c}: ${n}`));
    if (opts.dryRun) return;
    if (!process.env.MONGODB_URI) { console.error('MONGODB_URI مش موجود.'); process.exit(1); }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('بيرجّع…');
    await restore(opts.file, { db: mongoose.connection.db, replace: opts.replace, only: opts.only });
    console.log('خلص.');
    await mongoose.disconnect();
  })().catch((e) => { console.error('فشل:', e.message); process.exit(1); });
}
