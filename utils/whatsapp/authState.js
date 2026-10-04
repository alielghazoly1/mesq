// utils/whatsapp/authState.js
// تخزين جلسة واتساب في MongoDB (بدل ملفات على السيرفر — ملفات الاستضافة
// بتتمسح مع كل نشر). كل قيمة متشفّرة AES-256-GCM بمفتاح من ADMIN_SECRET.
const crypto = require('crypto');
const WhatsAppAuth = require('../../models/WhatsAppAuth');

function encKey() {
  return crypto.createHash('sha256').update('mithaq-whatsapp:' + String(process.env.ADMIN_SECRET || '')).digest();
}
function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', encKey(), iv);
  const data = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}
function decrypt(blob) {
  try {
    const [iv, tag, data] = String(blob || '').split('.').map((s) => Buffer.from(s, 'base64'));
    const d = crypto.createDecipheriv('aes-256-gcm', encKey(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}

/** فيه جلسة محفوظة تنفع (اتربطت قبل كده ولسه بتتفك)؟ */
async function hasSavedSession() {
  const doc = await WhatsAppAuth.findById('creds').lean();
  if (!doc) return false;
  const raw = decrypt(doc.v);
  if (!raw) return false;
  try { return !!JSON.parse(raw).registered; } catch { return false; }
}

async function clearSession() {
  await WhatsAppAuth.deleteMany({});
}

/**
 * نفس شكل useMultiFileAuthState بتاع Baileys بس على Mongo.
 * @param {object} B — مكتبة baileys (import ديناميكي لأنها ESM)
 */
async function useMongoAuthState(B) {
  const { BufferJSON, initAuthCreds, proto } = B;
  const read = async (id) => {
    const doc = await WhatsAppAuth.findById(id).lean();
    if (!doc) return null;
    const raw = decrypt(doc.v);
    if (!raw) return null;
    try { return JSON.parse(raw, BufferJSON.reviver); } catch { return null; }
  };
  const write = (id, value) => WhatsAppAuth.updateOne(
    { _id: id },
    { $set: { v: encrypt(JSON.stringify(value, BufferJSON.replacer)) } },
    { upsert: true }
  );

  const creds = (await read('creds')) || initAuthCreds();
  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const out = {};
          await Promise.all(ids.map(async (id) => {
            let value = await read(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value) value = proto.Message.AppStateSyncKeyData.fromObject(value);
            out[id] = value;
          }));
          return out;
        },
        set: async (data) => {
          const tasks = [];
          Object.keys(data).forEach((category) => {
            Object.keys(data[category]).forEach((id) => {
              const key = `${category}-${id}`;
              const value = data[category][id];
              tasks.push(value ? write(key, value) : WhatsAppAuth.deleteOne({ _id: key }));
            });
          });
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => write('creds', creds),
  };
}

module.exports = { useMongoAuthState, hasSavedSession, clearSession };
