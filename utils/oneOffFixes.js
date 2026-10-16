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
    // bTS793h — صاحبتها صممت النصوص المضافة (31 نص) وهي فاتحة معاينة الكمبيوتر،
    // اللي كانت مابتكسرش السطور؛ وعلى الموبايل السطور كانت بتتكسر عند نص
    // الشاشة والجمل تدخل في بعض ("عائلة التكريتي عائلة / شحاده" فوق "والد
    // العروس"). بنثبّت عرض السطر (ww=340) لكل نصوصها — فتتعرض بالظبط زي ما
    // صممتها، سطر واحد لكل جملة، على أي موبايل أو كمبيوتر. بيتعمل بس لو ولا
    // نص من نصوصها اتثبّت عرضه قبل كده.
    name: 'bTS793h-added-fixed-wrap',
    shortId: 'bTS793h',
    when: (c) => {
      const list = c.added || [];
      return list.some((a) => a && a.id === 'nmv76wrr67vbs') && list.every((a) => !a || !a.ww);
    },
    apply(c) {
      return { 'customizations.added': (c.added || []).map((a) => (a ? { ...a, ww: 340 } : a)) };
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
  {
    // FjpDW02 (Champagne Lace عربي) — دعوة سمير الكيال وأيه الصاوي بطلب المالك:
    // الأسامي والميعاد (الجمعة 30/10/2026 الساعة 7 مساءً) والمكان بنفس دالة
    // حفظ التفاصيل اللي المحرر بيستخدمها، وكلام الـ Dress code في سطرين
    // الكارت الأول (cl13/cl14)، وجملة الختام فوق "في انتظاركم" (cl83).
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة الافتراضية ومحدش كتب فيها.
    name: 'FjpDW02-samir-aya',
    shortId: 'FjpDW02',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'champagne-lace' && inv.groomNameAr === 'العريس'
      && inv.brideNameAr === 'العروسة' && !((c.texts || {}).cl13),
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'سمير الكيال', groomNameAr: 'سمير الكيال',
        brideName: 'أيه الصاوي', brideNameAr: 'أيه الصاوي',
        venueName: 'نادي الري بالمظلات', venueCity: 'شبرا مصر', venueAddress: 'قاعة هيلتون',
        venueMapQuery: 'نادي الري بالمظلات، شبرا مصر',
        weddingDate: '2026-10-30', weddingTime: '19:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set['customizations.texts'] = {
        ...(c.texts || {}),
        cl13: 'لا يوجد زيّ محدد لحفل الزفاف ولكن نرجو من حضراتكم التكرّم بعدم ارتداء اللون الأبيض أو أي من مشتقاته بما في ذلك الأوف وايت والبيج',
        cl14: 'احترامًا ليوم العروس المميز ولكم جزيل الشكر والتقدير على تفهّمكم🤍',
        cl83: 'بكل الحب ندعوكم لمشاركتنا فرحتنا في يومنا المميز فبحضوركم ودعواتكم سوف تكتمل سعادتنا وتزداد فرحتنا🤍',
      };
      return set;
    },
  },
  {
    // e20H7Oq (Champagne Lace إنجليزي — Ahmed & Eman) — بطلب المالك: الضيوف
    // يقدروا يسجّلوا تهنئة صوتية ويرفعوا صور الفرح، تحت فورم تأكيد الحضور
    // (utils/guestExtras.js). بيتعمل مرة واحدة بس لو الإضافات لسه مش مفعّلة.
    name: 'e20H7Oq-guest-extras',
    shortId: 'e20H7Oq',
    select: 'customizations guestExtras templateId',
    when: (c, inv) => !(inv.guestExtras && (inv.guestExtras.voice || inv.guestExtras.photos)),
    apply() {
      return { 'guestExtras.voice': true, 'guestExtras.photos': true };
    },
  },
];

let done = false;

// تعديلات لمرة واحدة على لينكات الإعلانات (Campaign) بطلب المالك.
// بتتعمل بس لو اللينك لسه على الحالة اللي اتشافت وقت الطلب ومااتعدّلش بعدها
// (updatedAt قبل وقت الطلب) — فلو المالك غيّره بنفسه بعد كده مابنلمسوش.
const CAMPAIGN_FIXES = [
  {
    // ig-4ff2 — المالك عايز لينك الإعلان يفتح الصفحة الرئيسية (التصاميم) مش الباقات
    name: 'ig-4ff2-landing-home',
    code: 'ig-4ff2',
    when: (c) => c.landing === '/packages' && new Date(c.updatedAt || 0) < new Date('2026-10-15T20:30:00Z'),
    set: { landing: '/' },
  },
];

async function runCampaignFixes() {
  const Campaign = require('../models/Campaign');
  for (const fix of CAMPAIGN_FIXES) {
    try {
      const c = await Campaign.findOne({ code: fix.code }).lean();
      if (!c || !fix.when(c)) continue;
      console.log(`[oneOffFix] ${fix.name} before: ${JSON.stringify({ landing: c.landing })}`);
      await Campaign.updateOne({ _id: c._id }, { $set: { ...fix.set, updatedAt: new Date() } });
      console.log(`[oneOffFix] ${fix.name} applied`);
    } catch (err) {
      console.error(`[oneOffFix] ${fix.name} failed:`, err.message);
    }
  }
}

async function runOneOffFixes() {
  if (done) return;
  done = true;
  await runCampaignFixes();
  for (const fix of FIXES) {
    try {
      // select: التعديلات اللي محتاجة حقول الدعوة نفسها (مش التخصيصات بس)
      const inv = await Invitation.findOne({ shortId: fix.shortId }).select(fix.select || 'customizations').lean();
      if (!inv) continue;
      const c = inv.customizations || {};
      if (!fix.when(c, inv)) continue;
      const set = await fix.apply(c, inv);
      const before = {};
      Object.keys(set).forEach((k) => {
        before[k] = k.startsWith('customizations.') ? c[k.replace('customizations.', '')] : inv[k];
      });
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
