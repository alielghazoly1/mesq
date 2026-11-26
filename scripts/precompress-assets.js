// scripts/precompress-assets.js
// بيعمل نسخة مضغوطة جاهزة (.br بأعلى ضغط brotli 11 + .gz بأعلى ضغط gzip 9) جنب كل ملف
// js/css/svg/json في client/dist/assets — بيشتغل في آخر "npm run build".
//
// ليه: الـ CDN بيضغط الملفات دي وهو بيبعتها بضغط سريع خفيف (الجافاسكريبت الأساسي 194 كيلو
// بدل 135 بأعلى ضغط). السيرفر (utils/precompressedAssets.js) بيبعت النسخة الجاهزة للمتصفح
// اللي بيقبلها — من غير أي ضغط وقت الطلب.
//
// أمان النشر: السكريبت عمره ما بيوقّع الـ build (أي مشكلة بتتكتب وبيكمّل ويخرج بـ 0).
// أي نسخة بتتأكد إنها بترجع الملف الأصلي حرف بحرف قبل ما تتحط، وبتتكتب في ملف مؤقت وبعدين
// تتنقل لمكانها (مافيش نسخة نصها مكتوب ممكن تتبعت). ولو النسخة مش أصغر من الأصل مابتتعملش.
// node scripts/precompress-assets.js [assetsDir]
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'client', 'dist', 'assets');
const COMPRESSIBLE = /\.(?:js|css|svg|json)$/i;

function brotli(buf) {
  return zlib.brotliCompressSync(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
    },
  });
}

function removeQuiet(file) {
  try { fs.unlinkSync(file); } catch (_) { /* مش موجود */ }
}

/** بيكتب النسخة المضغوطة بس لو أصغر من الأصل وبترجع له بالظبط */
function writeVariant(target, packed, original, unpack) {
  if (packed.length >= original.length) { removeQuiet(target); return 0; }
  if (!unpack(packed).equals(original)) throw new Error(`round-trip mismatch for ${path.basename(target)}`);
  const tmp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, packed);
  fs.renameSync(tmp, target);
  return packed.length;
}

function main() {
  let names;
  try {
    names = fs.readdirSync(DIR, { withFileTypes: true })
      .filter((e) => e.isFile() && COMPRESSIBLE.test(e.name))
      .map((e) => e.name);
  } catch (err) {
    console.log(`[precompress] skipped (${err.code || err.message}): ${DIR}`);
    return;
  }
  const t0 = Date.now();
  let files = 0; let raw = 0; let br = 0; let gz = 0; let failed = 0;
  for (const name of names) {
    const file = path.join(DIR, name);
    try {
      const buf = fs.readFileSync(file);
      const b = writeVariant(`${file}.br`, brotli(buf), buf, (x) => zlib.brotliDecompressSync(x));
      const g = writeVariant(`${file}.gz`, zlib.gzipSync(buf, { level: 9 }), buf, (x) => zlib.gunzipSync(x));
      files += 1; raw += buf.length; br += b || buf.length; gz += g || buf.length;
    } catch (err) {
      failed += 1;
      // نسخة غلط أو ناقصة أسوأ من مافيش نسخة: بنشيل الاتنين والسيرفر بيبعت الأصل
      removeQuiet(`${file}.br`); removeQuiet(`${file}.gz`);
      console.log(`[precompress] ${name}: ${err.message}`);
    }
  }
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`[precompress] ${files} files ${kb(raw)} → br ${kb(br)}, gz ${kb(gz)}${failed ? `, ${failed} failed` : ''} (${Date.now() - t0} ms)`);
}

try {
  main();
} catch (err) {
  console.log(`[precompress] skipped: ${err.message}`);
}
