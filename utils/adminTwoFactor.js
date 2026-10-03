// utils/adminTwoFactor.js
// التحقق بخطوتين للوحة التحكم: كلمة السر + كود من تطبيق على موبايل صاحب
// الموقع. حتى لو حد عرف كلمة السر، مش هيدخل من غير الموبايل.
const crypto = require('crypto');
const AdminSecurity = require('../models/AdminSecurity');
const totp = require('./totp');

const BACKUP_COUNT = 10;

function encKey() {
  return crypto.createHash('sha256').update('mithaq-admin-2fa:' + String(process.env.ADMIN_SECRET || '')).digest();
}
function keyCheck() {
  return crypto.createHash('sha256').update(encKey()).digest('hex').slice(0, 16);
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

const hashBackup = (code) => crypto.createHash('sha256').update('mithaq-backup:' + String(code).toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');

/** 10 أكواد احتياطية شكلها XXXX-XXXX (من غير حروف بتتلخبط زي O و 0) */
function newBackupCodes() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: BACKUP_COUNT }, () => {
    const b = crypto.randomBytes(8);
    const s = Array.from(b, (x) => abc[x % abc.length]).join('');
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
}

async function getDoc() {
  return AdminSecurity.findOneAndUpdate(
    { key: 'default' },
    { $setOnInsert: { key: 'default' } },
    { upsert: true, new: true }
  );
}

/** مفعّل فعلًا؟ (ولو ADMIN_SECRET اتغيّر بعد التفعيل يبقى مقفول — طريق الطوارئ) */
function isActive(doc) {
  return !!(doc && doc.totpEnabled && doc.totpSecretEnc && doc.keyCheck === keyCheck());
}

async function status() {
  const doc = await getDoc();
  return {
    enabled: isActive(doc),
    enabledAt: isActive(doc) ? doc.enabledAt : null,
    backupLeft: isActive(doc) ? doc.backupCodes.filter((c) => !c.usedAt).length : 0,
  };
}

/** بداية التفعيل: سر جديد (لسه مش متفعّل لحد ما يكتب كود صح) */
async function startSetup() {
  const secret = totp.generateSecret();
  await AdminSecurity.updateOne(
    { key: 'default' },
    { $set: { pendingSecretEnc: encrypt(secret), pendingAt: new Date() } },
    { upsert: true }
  );
  return { secret, uri: totp.otpauthUri(secret, { issuer: 'Mithaq', account: 'mithaq-invitation.com' }) };
}

/** تأكيد التفعيل بأول كود من التطبيق → بيرجّع الأكواد الاحتياطية (مرة واحدة بس) */
async function confirmSetup(code) {
  const doc = await getDoc();
  if (!doc.pendingSecretEnc || !doc.pendingAt || Date.now() - doc.pendingAt.getTime() > 30 * 60 * 1000) {
    return { ok: false, error: 'الإعداد خلص وقته — ابدأ من الأول.' };
  }
  const secret = decrypt(doc.pendingSecretEnc);
  const step = secret && totp.verify(secret, code);
  if (step === null || !secret) return { ok: false, error: 'الكود مش صح. اتأكد إنك كتبت الكود اللي ظاهر دلوقتي في التطبيق.' };
  const codes = newBackupCodes();
  await AdminSecurity.updateOne({ key: 'default' }, {
    $set: {
      totpEnabled: true,
      totpSecretEnc: encrypt(secret),
      keyCheck: keyCheck(),
      enabledAt: new Date(),
      lastStep: step,
      pendingSecretEnc: '',
      pendingAt: null,
      backupCodes: codes.map((c) => ({ hash: hashBackup(c), usedAt: null })),
    },
  });
  return { ok: true, backupCodes: codes };
}

/**
 * التحقق من كود (من التطبيق أو كود احتياطي). الكود بيتعلّم إنه اتستخدم
 * بعملية ذرّية — فمفيش طلبين متوازيين يعدّوا بنفس الكود.
 * @returns {Promise<'totp'|'backup'|null>}
 */
async function checkCode(code) {
  const doc = await getDoc();
  if (!isActive(doc)) return null;
  const raw = String(code || '').trim();
  if (/^\d{6}$/.test(raw.replace(/\s/g, ''))) {
    const secret = decrypt(doc.totpSecretEnc);
    const step = secret && totp.verify(secret, raw, { after: doc.lastStep });
    if (step === null || step === undefined || step === false) return null;
    const r = await AdminSecurity.updateOne({ key: 'default', lastStep: { $lt: step } }, { $set: { lastStep: step } });
    return r.modifiedCount === 1 ? 'totp' : null;
  }
  const h = hashBackup(raw);
  const r = await AdminSecurity.updateOne(
    { key: 'default', backupCodes: { $elemMatch: { hash: h, usedAt: null } } },
    { $set: { 'backupCodes.$.usedAt': new Date() } }
  );
  return r.modifiedCount === 1 ? 'backup' : null;
}

async function disable() {
  await AdminSecurity.updateOne({ key: 'default' }, {
    $set: { totpEnabled: false, totpSecretEnc: '', keyCheck: '', enabledAt: null, lastStep: -1, backupCodes: [], pendingSecretEnc: '', pendingAt: null },
  });
}

async function regenerateBackupCodes() {
  const codes = newBackupCodes();
  await AdminSecurity.updateOne({ key: 'default' }, { $set: { backupCodes: codes.map((c) => ({ hash: hashBackup(c), usedAt: null })) } });
  return codes;
}

async function isEnabled() {
  return isActive(await getDoc());
}

module.exports = { status, startSetup, confirmSetup, checkCode, disable, regenerateBackupCodes, isEnabled };
