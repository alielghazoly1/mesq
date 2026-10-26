// لينكات صور/ملفات الدعوات الكاستم ببصمة المحتوى (?v=...).
//
// ليه: ملفات client/public/custom/** أساميها ثابتة، والسيرفر بيقول للمتصفح
// يحتفظ بيها أسبوع (server.js) — فلو عدّلنا صورة دعوة بنفس الاسم، اللي فتح
// الدعوة قبل كده كان بيفضل يشوف الصورة القديمة حتى لو عمل ريفريش (والمتصفح
// الجديد بيشوف الجديدة). البصمة بتتغيّر مع أي تعديل في الملف → لينك جديد →
// المتصفح بيجيبه على طول.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOTS = [
  path.join(__dirname, '..', 'client', 'public'),
  path.join(__dirname, '..', 'client', 'dist'),
];

function asset(url) {
  for (const root of ROOTS) {
    try {
      const buf = fs.readFileSync(path.join(root, url.replace(/^\/+/, '')));
      return `${url}?v=${crypto.createHash('md5').update(buf).digest('hex').slice(0, 10)}`;
    } catch (_) { /* جرّب اللي بعده */ }
  }
  return url;
}

module.exports = { asset };
