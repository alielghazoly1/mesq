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

// البصمة بتتحسب مرة واحدة لكل ملف وتتخزّن هنا (المسار الكامل ← مقاسه ووقت تعديله والبصمة).
// قبل كده الملف كله كان بيتقري ويتحسب له md5 مع كل فتحة دعوة (فيديوهات الكاستم ميجات).
// أي تعديل في الملف بيغيّر وقت التعديل أو المقاس → البصمة بتتحسب من جديد. نفس البصمة بالظبط.
const memo = new Map();

function asset(url) {
  for (const root of ROOTS) {
    const file = path.join(root, url.replace(/^\/+/, ''));
    try {
      // stat قبل القراية: لو الملف اتغيّر في النص، المرة الجاية وقت التعديل مش هيطابق فبيتحسب تاني
      const st = fs.statSync(file);
      const hit = memo.get(file);
      if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return `${url}?v=${hit.v}`;
      const buf = fs.readFileSync(file);
      const v = crypto.createHash('md5').update(buf).digest('hex').slice(0, 10);
      memo.set(file, { mtimeMs: st.mtimeMs, size: st.size, v });
      return `${url}?v=${v}`;
    } catch (_) { /* جرّب اللي بعده */ }
  }
  return url;
}

module.exports = { asset };
