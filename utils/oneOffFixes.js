// utils/oneOffFixes.js
// تعديلات بيانات لمرة واحدة على دعوة معيّنة بطلب المالك.
//
// مفيش وصول مباشر لقاعدة البيانات من برا السيرفر، فالتعديل بيتعمل هنا بعد
// الاتصال. كل تعديل:
//   - محصور في دعوة واحدة بالـ shortId
//   - بيتعمل بس لو الدعوة لسه بالحالة اللي اتشافت وقت الطلب (when)، فلو
//     صاحبها عدّل بعدها أو التعديل اتعمل قبل كده، مبيتعملش تاني ومبيدوسش
//     على شغله
//   - بيطبع القيم القديمة في اللوج قبل ما يغيّرها (للرجوع لو احتجنا)
// فشل أي تعديل مايأثرش على تشغيل السيرفر.
const Invitation = require('../models/Invitation');

const FIXES = [
  {
    // FcVHj3j (Royal Maroon) — برنامج اليوم: ٣ نقط بس (الاستقبال، كتب الكتاب،
    // الحفلة)، والحفلة بنفس شكل اللي فوقها. صاحبها كان مسح السطر الأصلي وكتب
    // "party" و"08:30 pm" كنصوص مضافة متحركة بالإيد، وسطرين فاضيين بنقطهم
    // فضلوا في النص. التعديل بيرجّع سطر الحفلة الأصلي (نفس الخط والمقاس
    // والمحاذاة) بوقت 08:30 pm، ويشيل النصين المضافين، ويخفي الصفين الفاضيين.
    name: 'FcVHj3j-program-3-rows',
    shortId: 'FcVHj3j',
    when: (c) => (c.added || []).some((a) => a && (a.id === 'nmuzktg0oopby' || a.id === 'nmuzkwc4t7v2r')),
    apply(c) {
      const drop = ['nmuzktg0oopby', 'nmuzkwc4t7v2r'];
      const set = {};
      set['customizations.added'] = (c.added || []).filter((a) => !(a && drop.includes(a.id)));
      const offsets = { ...(c.offsets || {}) };
      drop.forEach((id) => delete offsets['add_' + id]);
      set['customizations.offsets'] = offsets;
      // سطر الحفلة يرجع (٢٠٨ الاسم، ٢٠٩ الوقت) — والصفين ٣ و٤ يتشالوا بنقطهم
      const hidden = (c.hidden || []).filter((id) => id !== '7000000000208' && id !== '7000000000209');
      ['7000000000402', '7000000000403'].forEach((id) => { if (!hidden.includes(id)) hidden.push(id); });
      set['customizations.hidden'] = hidden;
      set['customizations.texts'] = { ...(c.texts || {}), '7000000000209': '08:30 pm' };
      // نفس مقاس اسم السطرين اللي فوق (8) ومن غير محاذاة يمين
      const sizes = { ...(c.sizes || {}) };
      sizes['7000000000208'] = sizes['7000000000200'] || 8;
      set['customizations.sizes'] = sizes;
      const aligns = { ...(c.aligns || {}) };
      delete aligns['7000000000208'];
      drop.forEach((id) => delete aligns['add_' + id]);
      set['customizations.aligns'] = aligns;
      return set;
    },
  },
  {
    // PnyV95W (Lily Garden عربي) — سطر ميعاد الحفل تحت التاريخ على طول في
    // الكارت، بنفس خط سطوره (عنصر lg81 في القالب). العميل كان ضافه كنص حر
    // متحرك بالإيد وشاله؛ ده بقى سطر حقيقي جوه الكارت. بيتعمل بس لو السطر
    // لسه فاضي — فلو العميل عدّله بعد كده مابنلمسوش.
    name: 'PnyV95W-time-line',
    shortId: 'PnyV95W',
    when: (c) => !((c.texts || {}).lg81),
    apply(c) {
      return { 'customizations.texts': { ...(c.texts || {}), lg81: 'سيبدأ الحفل الساعة 18:00' } };
    },
  },
];

let done = false;

async function runOneOffFixes() {
  if (done) return;
  done = true;
  for (const fix of FIXES) {
    try {
      const inv = await Invitation.findOne({ shortId: fix.shortId }).select('customizations').lean();
      if (!inv) continue;
      const c = inv.customizations || {};
      if (!fix.when(c)) continue;
      const set = fix.apply(c);
      const before = {};
      Object.keys(set).forEach((k) => { before[k] = c[k.replace('customizations.', '')]; });
      console.log(`[oneOffFix] ${fix.name} before: ${JSON.stringify(before)}`);
      await Invitation.updateOne({ _id: inv._id }, { $set: set });
      console.log(`[oneOffFix] ${fix.name} applied`);
    } catch (err) {
      console.error(`[oneOffFix] ${fix.name} failed:`, err.message);
    }
  }
}

module.exports = runOneOffFixes;
module.exports.FIXES = FIXES;
