// scripts/generate-countries.js
// بيولّد src/data/countries.js من مكتبة world-countries (npm run generate:countries).
// بنولّده مرة بدل ما نستورد المكتبة كاملة وقت التشغيل، لأنها بتجيب معاها
// بيانات كتير مش محتاجينها (عملات، حدود، إحداثيات، لغات...) وبتضاعف حجم
// الـ bundle النهائي بدون أي داعي — إحنا محتاجين بس كود الدولة، اسمها
// بالعربي، وعلمها.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import countries from 'world-countries';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// بنولّد الاسم بالعربي والإنجليزي مع بعض عشان القايمة تشتغل في اللغتين،
// وبنضيف كود الاتصال الدولي (idd) لكل دولة عشان الفورم يقدر يبني رقم
// بالكود المناسب لدولة العميل، والأدمن يفتح واتساب على الرقم مباشرة.
const options = countries
  .map((c) => {
    // idd فيه الجذر (+20) وأحيانًا لواحق (زي +1201 لولايات معينة). بناخد
    // أول تشكيل ممكن — كافي لأي دولة عندها كود واحد. الدول اللي مش عندها
    // كود اتصال أصلاً (زي أنتاركتيكا) بترجع فاضية.
    const root = c.idd?.root || '';
    const suffix = (c.idd?.suffixes && c.idd.suffixes[0]) || '';
    const dial = root ? `${root}${suffix}` : '';
    // أسماء نضيفة بدون العلم — العلم بيتعرض كخانة منفصلة
    const arName = c.translations.ara?.common || c.name.common;
    return {
      value: c.cca2,
      flag: c.flag,
      dial,
      ar: `${c.flag} ${arName}`,
      en: `${c.flag} ${c.name.common}`,
      // للأسماء بدون علم (نظهرها في اللوحة والداتا اللي بتتخزن)
      nameAr: arName,
      nameEn: c.name.common,
    };
  })
  .sort((a, b) => a.en.localeCompare(b.en, 'en'));

const outPath = path.join(__dirname, '..', 'src', 'data', 'countries.js');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `// ⚠️ اتولد تلقائيًا من مكتبة world-countries — متعدلش الملف ده يدوي.\n` +
    `// لتحديثه: npm run generate:countries (scripts/generate-countries.js)\n` +
    `export const COUNTRY_OPTIONS = ${JSON.stringify(options, null, 2)};\n`
);

console.log(`✅ wrote ${options.length} countries to ${outPath}`);
