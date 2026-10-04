// utils/whatsapp/outbox.js
// رسالة "محتاج مساعدة في الدفع؟" — إمتى تتحط في الصندوق وإمتى تتبعت.
//
// قواعد الحماية (عشان رقمك مايتحظرش ومانزعجش العميل):
//   - مرة واحدة بس لكل عميل طول العمر (فهرس فريد في WhatsAppOutbox).
//   - بتستنى delayMinutes بعد ما يفتح صفحة الدفع. لو دفع أو رفع الإيصال
//     في الوقت ده، مابتتبعتش خالص.
//   - بتتبعت في ساعات النهار بس (بتوقيت مصر)، وبحد أقصى في اليوم، وبين
//     كل رسالة والتانية فاصل عشوائي (زي ما إنسان بيبعت).
//   - العميل لازم يكون كاتب رقم صح وعليه واتساب فعلًا.
const WhatsAppState = require('../../models/WhatsAppState');
const WhatsAppOutbox = require('../../models/WhatsAppOutbox');
const User = require('../../models/User');
const Order = require('../../models/Order');
const { getPackage } = require('../../packages/registry');
const { cairoParts, cairoWallToDate } = require('../cairoTime');
const { toWhatsAppNumber } = require('./phone');

const MAX_ATTEMPTS = 3;
const EXPIRE_MS = 24 * 60 * 60 * 1000;
const MIN_GAP_MS = 25 * 1000;
const JITTER_MS = 35 * 1000;

const firstName = (full) => String(full || '').trim().split(/\s+/)[0] || '';

/** الرسالة النهائية من القالب: {name} و {package} */
function buildMessage(template, { name, packageName }) {
  return String(template || WhatsAppState.DEFAULT_MESSAGE)
    .replace(/\{name\}/g, name || '')
    .replace(/\{package\}/g, packageName || 'باقتك')
    // "أهلًا  👋" لو الاسم فاضي
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([👋،,.!؟?])/g, ' $1')
    .trim();
}

async function getState() {
  return WhatsAppState.findOneAndUpdate(
    { key: 'default' },
    { $setOnInsert: { key: 'default' } },
    { upsert: true, new: true }
  ).lean();
}

/**
 * العميل فتح صفحة الدفع → بنحط رسالته في الصندوق (لو الشروط تمام).
 * مابترميش أخطاء أبدًا — صفحة الدفع مالهاش دعوة بالواتساب.
 */
async function enqueueCheckoutHelp(userId, packageId) {
  try {
    const state = await getState();
    if (!state.enabled || !state.wantLinked) return null;
    const user = await User.findById(userId).select('name phone country isBlocked').lean();
    if (!user || user.isBlocked) return null;
    const phone = toWhatsAppNumber(user.phone, user.country);
    if (!phone) return null;
    const now = new Date();
    const r = await WhatsAppOutbox.updateOne(
      { userId: user._id, reason: 'checkout' },
      {
        $setOnInsert: {
          userId: user._id,
          reason: 'checkout',
          name: user.name || '',
          phoneRaw: user.phone,
          phone,
          packageId: String(packageId || ''),
          status: 'pending',
          sendAfter: new Date(now.getTime() + (state.delayMinutes || 10) * 60000),
          createdAt: now,
        },
      },
      { upsert: true }
    );
    return r.upsertedCount === 1;
  } catch (err) {
    if (err && err.code === 11000) return false;   // اتحط قبل كده
    console.error('whatsapp enqueue failed:', err && err.message);
    return null;
  }
}

/** رسالة تجربة من اللوحة لرقم المالك */
async function enqueueTest(phoneRaw, text) {
  const phone = toWhatsAppNumber(phoneRaw, 'EG');
  if (!phone) return null;
  return WhatsAppOutbox.create({
    reason: 'test', phoneRaw, phone, text, status: 'pending', sendAfter: new Date(),
  });
}

function inSendingHours(state, now) {
  const h = cairoParts(now).hour;
  const from = Number.isFinite(state.sendFromHour) ? state.sendFromHour : 9;
  const to = Number.isFinite(state.sendToHour) ? state.sendToHour : 23;
  return from < to ? h >= from && h < to : h >= from || h < to;
}

async function sentTodayCount(now) {
  const p = cairoParts(now);
  const start = cairoWallToDate(p.year, p.month - 1, p.day, 0, 0);
  return WhatsAppOutbox.countDocuments({ reason: 'checkout', status: 'sent', sentAt: { $gte: start } });
}

let nextAllowedAt = 0;

/**
 * بيبعت رسالة واحدة لو فيه واحدة جاهزة ومسموح دلوقتي.
 * @param {{send: (phone: string, text: string) => Promise<{ok: boolean, reason?: string}>, now?: Date}} deps
 * @returns {Promise<string|null>} اللي حصل (للاختبارات واللوج)
 */
async function processNext({ send, now = new Date(), ignoreGap = false }) {
  if (!ignoreGap && Date.now() < nextAllowedAt) return null;
  const state = await getState();

  // رسايل التجربة الأول — مش بتتقيّد بالساعات ولا الحد اليومي
  let item = await WhatsAppOutbox.findOneAndUpdate(
    { reason: 'test', status: 'pending', sendAfter: { $lte: now } },
    { $set: { status: 'sending' }, $inc: { attempts: 1 } },
    { sort: { sendAfter: 1 }, new: true }
  );

  if (!item) {
    if (!state.enabled) return null;
    if (!inSendingHours(state, now)) return null;
    if ((await sentTodayCount(now)) >= (state.dailyLimit || 40)) return null;
    item = await WhatsAppOutbox.findOneAndUpdate(
      { reason: 'checkout', status: 'pending', sendAfter: { $lte: now } },
      { $set: { status: 'sending' }, $inc: { attempts: 1 } },
      { sort: { sendAfter: 1 }, new: true }
    );
  }
  if (!item) return null;

  const finish = (status, note = '', extra = {}) =>
    WhatsAppOutbox.updateOne({ _id: item._id }, { $set: { status, note, ...extra } }).then(() => `${status}${note ? ':' + note : ''}`);

  let text = item.text;
  if (item.reason === 'checkout') {
    if (now.getTime() - item.sendAfter.getTime() > EXPIRE_MS) return finish('skipped', 'expired');
    const user = await User.findById(item.userId).select('name isBlocked').lean();
    if (!user || user.isBlocked) return finish('skipped', 'blocked');
    // دفع أو رفع إيصال من ساعة ما فتح صفحة الدفع؟ يبقى مش محتاج مساعدة
    const paid = await Order.exists({
      userId: item.userId,
      $or: [
        { status: 'activated', activatedAt: { $gte: item.createdAt } },
        { paymentProofUrl: { $nin: [null, ''] }, status: { $ne: 'cancelled' } },
      ],
    });
    if (paid) return finish('skipped', 'paid');
    const pkg = getPackage(item.packageId);
    text = buildMessage(state.message, { name: firstName(user.name || item.name), packageName: pkg ? pkg.name.ar : '' });
  }

  try {
    const r = await send(item.phone, text);
    nextAllowedAt = Date.now() + MIN_GAP_MS + Math.floor(Math.random() * JITTER_MS);
    if (!r || !r.ok) return finish('skipped', (r && r.reason) || 'no_whatsapp');
    await WhatsAppState.updateOne({ key: 'default' }, { $set: { lastSentAt: new Date() } });
    return finish('sent', '', { sentAt: new Date(), text });
  } catch (err) {
    const msg = String((err && err.message) || err).slice(0, 160);
    if (item.attempts < MAX_ATTEMPTS) {
      await WhatsAppOutbox.updateOne(
        { _id: item._id },
        { $set: { status: 'pending', note: msg, sendAfter: new Date(Date.now() + 5 * 60000) } }
      );
      return 'retry';
    }
    return finish('failed', msg);
  }
}

/** لو السيرفر وقع وهو بيبعت — نرجّعها للطابور */
async function recoverStuck() {
  await WhatsAppOutbox.updateMany(
    { status: 'sending', sendAfter: { $lt: new Date(Date.now() - 5 * 60000) } },
    { $set: { status: 'pending' } }
  );
}

module.exports = { enqueueCheckoutHelp, enqueueTest, processNext, recoverStuck, buildMessage, inSendingHours, getState };
