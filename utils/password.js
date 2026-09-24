// utils/password.js
// تشفير الباسورد في مكان واحد — بيستخدمه التسجيل (routes/auth.js) وتغيير
// الباسورد من لوحة التحكم (routes/adminApi.js).
//
// ليه ملف لوحده مش تكرار السطر في الاتنين: تكلفة الـ bcrypt (cost) لازم
// تكون هي هي في كل مكان بيعمل hash. لو اتكتبت مرتين، أول ما نرفعها في
// مكان واحد بيبقى عندنا نوعين باسورد في نفس الداتابيز — واحد أقوى من
// التاني، ومحدش واخد باله.
const bcrypt = require('bcryptjs');

// 12 — التوازن المعقول دلوقتي بين قوة التشفير وزمن الاستجابة.
const BCRYPT_COST = 12;

/** @param {string} plain @returns {Promise<string>} */
function hashPassword(plain) {
  return bcrypt.hash(String(plain), BCRYPT_COST);
}

/** @param {string} plain @param {string} hash @returns {Promise<boolean>} */
function verifyPassword(plain, hash) {
  return bcrypt.compare(String(plain), String(hash || ''));
}

module.exports = { BCRYPT_COST, hashPassword, verifyPassword };
