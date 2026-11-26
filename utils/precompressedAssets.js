// utils/precompressedAssets.js
// ملفات /assets/ (جافاسكريبت وستايل الموقع) بتتبعت بالنسخة المضغوطة الجاهزة اللي
// scripts/precompress-assets.js عملها وقت الـ build: brotli (.br) لو المتصفح بيقبله، وإلا gzip (.gz)،
// وإلا الملف الأصلي زي ما كان (express.static). الضغط الأعلى ده بيوفّر حوالي ربع حجم الجافاسكريبت
// على نت الموبايل.
//
// نفس هيدرز express.static للملفات دي: نفس Content-Type (من امتداد الملف الأصلي) ونفس
// Cache-Control (سنة، immutable)، + Content-Encoding و Vary: Accept-Encoding و Content-Length الصح.
// طلبات Range بتتجاهل هنا (الملف كله) — المتصفح مابيطلبش أجزاء من الجافاسكريبت أصلًا.
// عمره ما بيبعت ضغط المتصفح مقالش إنه بيقبله.
//
// مفتاح طوارئ: PRECOMPRESS_ASSETS=off في متغيرات البيئة → كل حاجة ترجع زي الأول بالظبط.
const fs = require('fs');
const path = require('path');
const express = require('express');

// أسماء ملفات البناء بس (index-D8It_XaU.js) — مفيش فولدرات ولا رموز (يعني مفيش ../ ولا أي حيلة)
const NAME_RE = /^\/([A-Za-z0-9][A-Za-z0-9_.-]*\.(?:js|css|svg|json))$/;
const SUFFIX = { br: '.br', gzip: '.gz' };
const IMMUTABLE = 'public, max-age=31536000, immutable';

/**
 * الضغط اللي المتصفح بيقبله مرتّب بالأفضلية (q الأعلى الأول، والتعادل لـ br).
 * br لازم يكون مكتوب صراحة؛ gzip مكتوب أو "*". q=0 أو q مش رقم صحيح = مرفوض.
 * من غير الهيدر خالص = مفيش ضغط.
 */
function acceptedEncodings(header) {
  if (typeof header !== 'string' || !header.trim()) return [];
  const q = new Map();
  for (const part of header.split(',')) {
    const [rawName, ...params] = part.split(';');
    const name = rawName.trim().toLowerCase();
    if (!name) continue;
    let value = 1;
    for (const p of params) {
      const m = /^\s*q\s*=\s*(.*?)\s*$/i.exec(p);
      if (m) value = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(m[1]) ? Number(m[1]) : 0;
    }
    q.set(name, value);
  }
  const br = q.has('br') ? q.get('br') : 0;
  const gzip = q.has('gzip') ? q.get('gzip') : (q.has('*') ? q.get('*') : 0);
  const out = [];
  if (br > 0) out.push(['br', br]);
  if (gzip > 0) out.push(['gzip', gzip]);
  return out.sort((a, b) => b[1] - a[1]).map((x) => x[0]);
}

function statFile(file) {
  return fs.promises.stat(file).then((st) => (st.isFile() ? st : null), () => null);
}

/**
 * @param {string} assetsDir فولدر client/dist/assets (مسار كامل)
 */
function precompressedAssets(assetsDir) {
  const mime = express.static.mime;
  return function precompressed(req, res, next) {
    if (String(process.env.PRECOMPRESS_ASSETS || '').toLowerCase() === 'off') return next();
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const m = NAME_RE.exec(req.path);
    if (!m) return next();
    const name = m[1];
    const file = path.join(assetsDir, name);
    let passed = false;
    const pass = () => { if (!passed) { passed = true; next(); } };

    (async () => {
      const orig = await statFile(file);
      if (!orig) return pass();
      const variants = {};
      for (const enc of Object.keys(SUFFIX)) {
        const st = await statFile(file + SUFFIX[enc]);
        // نسخة أقدم من الأصل (بناء قديم/ناقص) مابتتبعتش أبدًا
        if (st && st.mtimeMs >= orig.mtimeMs) variants[enc] = st;
      }
      if (!variants.br && !variants.gzip) return pass(); // مفيش نسخ: الرد الأصلي بالظبط
      // اللينك ده ليه أكتر من نسخة حسب Accept-Encoding — لازم الكاش (الـ CDN) يعرف كده حتى لو بعتنا الأصل
      res.vary('Accept-Encoding');
      const enc = acceptedEncodings(req.headers['accept-encoding']).find((e) => variants[e]);
      if (!enc) return pass();

      const type = mime.lookup(name);
      const charset = mime.charsets.lookup(type);
      res.setHeader('Content-Type', type + (charset ? `; charset=${charset}` : ''));
      res.setHeader('Content-Encoding', enc);
      res.setHeader('Cache-Control', IMMUTABLE);
      return res.sendFile(file + SUFFIX[enc], { acceptRanges: false, cacheControl: false }, (err) => {
        if (err && !res.headersSent) {
          // النسخة اتشالت في النص؟ نرجع للملف الأصلي من غير أي هيدر من بتوعنا
          ['Content-Encoding', 'Content-Type', 'Cache-Control', 'ETag', 'Last-Modified', 'Content-Length'].forEach((h) => res.removeHeader(h));
          pass();
        }
      });
    })().catch(() => { if (!res.headersSent) pass(); });
  };
}

module.exports = { precompressedAssets, acceptedEncodings };
