// utils/totp.js
// أكواد التحقق بخطوتين (Google Authenticator / Microsoft Authenticator /
// 1Password …) — المعيار الرسمي RFC 6238: كود من 6 أرقام بيتغيّر كل 30
// ثانية، محسوب من سر مشترك بين السيرفر وتطبيق الموبايل.
// مكتوب بـ crypto بتاع Node بس — من غير أي مكتبة خارجية.
const crypto = require('crypto');

const STEP_SECONDS = 30;
const DIGITS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str) {
  const clean = String(str || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    value = (value << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** سر جديد (160 بت — الطول اللي المعيار بيوصي بيه) */
function generateSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function codeAt(secret, step) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const h = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const off = h[h.length - 1] & 15;
  const num = ((h[off] & 127) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(num % 10 ** DIGITS).padStart(DIGITS, '0');
}

function currentStep(now = Date.now()) {
  return Math.floor(now / 1000 / STEP_SECONDS);
}

/**
 * بيتأكد من الكود. بيقبل الخطوة اللي قبل واللي بعد (±30 ثانية) عشان ساعة
 * الموبايل ممكن تبقى مختلفة شوية.
 * @returns {number|null} رقم الخطوة اللي الكود طابقها (عشان نمنع استخدامه تاني)
 */
function verify(secret, code, { now = Date.now(), window = 1, after = -1 } = {}) {
  const c = String(code || '').replace(/\D/g, '');
  if (c.length !== DIGITS || !secret) return null;
  const s = currentStep(now);
  for (let d = -window; d <= window; d++) {
    const step = s + d;
    if (step <= after) continue; // الكود ده استخدم قبل كده
    const expected = codeAt(secret, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(c))) return step;
  }
  return null;
}

/** الرابط اللي بيتحوّل لـ QR — تطبيق الموبايل بيقراه */
function otpauthUri(secret, { issuer = 'Mithaq', account = 'Admin' } = {}) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

module.exports = { generateSecret, verify, otpauthUri, codeAt, currentStep, base32Encode, base32Decode };
