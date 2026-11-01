// utils/supportAutoReply.js
// الرد التلقائي على رسايل الدعم (بطلب المالك 2026-11-01): أي حد يبعت رسالة
// أو فويس بيوصله على طول رسالتين من "ميثاق":
//   1) وصلتنا رسالتك وهيترد عليك في أقرب وقت
//   2) رقم الواتساب + زرار بيفتح الواتساب على طول (أسرع رد)
//
// مش مع كل رسالة بالظبط: لو العميل بعت ٥ رسايل ورا بعض، الرد التلقائي
// بيتبعت مرة واحدة بس — وبعدين تاني لما ترد إنت (محادثة جديدة) أو يعدّي
// وقت طويل من غير رد. غير كده المحادثة هتتملي بنفس الكلام وتبان سبام.
//
// الرسايل دي متعلّمة auto، ولوحة الدعم بتتجاهلها في "مستني ردك" — عشان
// الرد التلقائي مايخبّيش إن العميل لسه مستنيك إنت.
const SupportMessage = require('../models/SupportMessage');

// لو مفيش رد حقيقي منك من المدة دي، الرسالة الجاية بتاخد رد تلقائي تاني
const REPEAT_AFTER_MS = 6 * 3600 * 1000;

// نفس الرقم اللي في client/src/lib/contact.js
const WHATSAPP_PHONE = '01035225735';

/** رسالة العميل بالإنجليزي (حروف لاتيني بس من غير عربي)؟ نرد بلغته */
function looksEnglish(text) {
  const s = String(text || '');
  return /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s);
}

function autoBodies(lang) {
  if (lang === 'en') {
    return [
      'We got your message 🤍 We will reply to you as soon as possible.',
      `For a faster reply, this is our WhatsApp number — we reply quickly there 👇\n${WHATSAPP_PHONE}`,
    ];
  }
  return [
    'وصلتنا رسالتك 🤍 سيتم الرد عليك في أقرب وقت.',
    `ولو حابب رد أسرع، ده رقم الواتساب بتاعنا وهنرد عليك هناك بسرعة 👇\n${WHATSAPP_PHONE}`,
  ];
}

/**
 * بيتنادى بعد ما رسالة العميل تتحفظ. مابيرميش خطأ أبدًا — فشل الرد
 * التلقائي مايصحّش يبوّظ رسالة العميل نفسها.
 * @param {any} userId
 * @param {{ body?: string }} [msg] رسالة العميل (عشان نعرف لغته)
 */
async function sendSupportAutoReply(userId, msg) {
  try {
    const lastAdmin = await SupportMessage.findOne({ userId, from: 'admin' })
      .sort({ createdAt: -1 }).select('auto createdAt').lean();
    // آخر حاجة منّا كانت الرد التلقائي ولسه قريب → كفاية مرة
    if (lastAdmin && lastAdmin.auto && Date.now() - new Date(lastAdmin.createdAt).getTime() < REPEAT_AFTER_MS) {
      return null;
    }
    const [ack, wa] = autoBodies(looksEnglish(msg && msg.body) ? 'en' : 'ar');
    const now = Date.now();
    // +1/+2ms: الترتيب مضمون بعد رسالة العميل حتى لو اتحفظوا في نفس الملي ثانية
    return await SupportMessage.insertMany([
      { userId, from: 'admin', kind: 'text', auto: 'ack', body: ack, readByAdmin: true, createdAt: new Date(now + 1) },
      { userId, from: 'admin', kind: 'text', auto: 'whatsapp', body: wa, readByAdmin: true, createdAt: new Date(now + 2) },
    ]);
  } catch (err) {
    console.error('Support auto-reply failed:', err.message);
    return null;
  }
}

// للوحة الدعم: الرسايل الحقيقية بس (من غير الرد التلقائي)
const NOT_AUTO = { $or: [{ auto: { $exists: false } }, { auto: '' }, { auto: null }] };

module.exports = { sendSupportAutoReply, looksEnglish, autoBodies, NOT_AUTO, WHATSAPP_PHONE };
