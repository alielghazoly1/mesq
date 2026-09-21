// utils/welcomeMessage.js
// رسالة ترحيب بتتحط في صندوق رسايل العميل أول ما يسجّل.
//
// ليه في صندوق الرسايل مش بوب-أب بس: الشاشة اللي بتظهر وقت التسجيل
// بتروح بمجرد ما يقفلها. الرسالة دي بتفضل مستنياه في حسابه، وبتفتح
// خط كلام معاه من غير ما يبدأ هو — واللي بيرد على رسالة بيقرب خطوة
// من إنه يشتري. وكمان بتخليه يعرف إن وراها ناس بتتكلم، مش موقع أوتوماتيك.
//
// بتتكتب كأنها من صاحب الموقع (from: 'admin')، وبتظهر في لوحة التحكم
// عندك عادي عشان لو رد تشوف رده في سياقه.
const SupportMessage = require('../models/SupportMessage');
const { EDIT_WINDOW_DAYS } = require('../packages/registry');

/** الاسم الأول بس — "أهلًا يا محمد" أدفى من الاسم الرباعي */
function firstName(full) {
  return String(full || '').trim().split(/\s+/)[0] || '';
}

function welcomeBody(name) {
  const who = firstName(name);
  return [
    `أهلًا بيك${who ? ' يا ' + who : ''} في ميثاق 🤍`,
    '',
    'حسابك جاهز. تقدر تتفرّج على كل التصاميم وتشوفها شغالة قبل ما تختار.',
    'ولما تاخد باقتك بتعمل دعواتك بالمحرر الكامل — الخط والصور والموسيقى،',
    'وتحرّك أي كلام مكانه — وتبعتها لأي عدد ضيوف براحتك، وبتفضل معاك مدى الحياة.',
    '',
    // مدة التعديل من الإعداد نفسه (packages/registry.js) — لو اتقفلت (0)
    // السطر ده بيتغيّر بدل ما نكتب رقم مش حقيقي
    ...(EDIT_WINDOW_DAYS > 0
      ? [
        `التعديل بيفضل مفتوح ${EDIT_WINDOW_DAYS} يوم من يوم تفعيل باقتك، وبعدها الدعوة بتفضل شغالة`,
        'زي ما هي. والدفع مرة واحدة — مفيش اشتراك شهري.',
        '',
      ]
      : ['والدفع مرة واحدة — مفيش اشتراك شهري.', '']),
    'وأي حاجة تحتاجها أو مش فاهمها، ابعتلي هنا في نفس المكان ده وهرد عليك.',
  ].join('\n');
}

/**
 * بتحط رسالة الترحيب. مقصود إنها مترميش خطأ أبدًا: لو فشلت لأي سبب،
 * التسجيل نفسه لازم يكمّل عادي — رسالة ترحيب مايصحّش توقف حساب جديد.
 * @param {{_id: any, name?: string}} user
 */
function sendWelcomeMessage(user) {
  if (!user || !user._id) return Promise.resolve();
  return SupportMessage.create({
    userId: user._id,
    from: 'admin',
    body: welcomeBody(user.name),
    // متقرّية من ناحيتك: دي مش رسالة محتاجة ردك، وماينفعش تظهرلك
    // كأن فيه عميل مستنيك
    readByAdmin: true,
    readByUser: false,
  }).catch((err) => {
    console.error('Welcome message failed:', err.message);
  });
}

module.exports = { sendWelcomeMessage, welcomeBody, firstName };
