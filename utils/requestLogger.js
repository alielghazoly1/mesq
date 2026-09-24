// utils/requestLogger.js
// تسجيل خفيف للطلبات والأخطاء في ملف تقدر تفتحه من Hostinger (File Manager
// أو FTP) على المسار logs/app.log — من غير أي خدمة خارجية.
//
// بيسجّل لكل طلب: الوقت، الـ IP، النوع، المسار، حالة الرد، والزمن اللي أخده.
// وبيعلّم:
//   [SLOW]        طلب أخد أكتر من SLOW_MS (بيمسك بطء السيرفر الحقيقي)
//   [ERROR]       رد بحالة 500+ (خطأ في السيرفر)
//   [SUSPICIOUS]  مسار بيشبه محاولات فحص/اختراق (.env, .git, .php, wp-admin...)
//
// كل الكتابة في ملف بتتلفّ في try/catch — التسجيل عمره ما بيوقّع الموقع.
// والملف بيتلفّ (rotation) عند 5 ميجا عشان ما يملاش الهارد.

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const OLD_FILE = path.join(LOG_DIR, 'app.1.log'); // امتداد .log عشان .gitignore يغطّيه
const MAX_BYTES = 5 * 1024 * 1024; // 5 ميجا لكل ملف (10 ميجا بالنسخة القديمة)
const SLOW_MS = Number(process.env.LOG_SLOW_MS || 1500);

try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) { /* موجود خلاص */ }

function rotateIfNeeded() {
  try {
    const st = fs.statSync(LOG_FILE);
    if (st.size < MAX_BYTES) return;
    try { fs.renameSync(LOG_FILE, OLD_FILE); } catch (e) { /* ماينفعش، نكمّل عادي */ }
  } catch (e) { /* الملف لسه ما اتعملش */ }
}

// بنسلسل الكتابة عشان السطور ما تتداخلش، ومن غير ما نوقف الطلب (async).
let queue = Promise.resolve();
function write(line) {
  const stamped = `[${new Date().toISOString()}] ${line}\n`;
  try { process.stdout.write(stamped); } catch (e) { /* مفيش stdout */ }
  queue = queue
    .then(() => new Promise((resolve) => {
      rotateIfNeeded();
      fs.appendFile(LOG_FILE, stamped, () => resolve());
    }))
    .catch(() => {});
}

// مسارات شائعة في فحص/هجمات البوتات — مالهاش وجود في الموقع أصلًا، فأي طلب
// ليها معناه إن حد بيجرّب. بنعلّمها عشان تبان في اللوج بسرعة.
const SUSPICIOUS = [
  /\/\.env/i, /\/\.git/i, /\/\.aws/i, /\/\.ssh/i,
  /\.php(\?|$)/i, /wp-(admin|login|content|includes)/i, /xmlrpc/i,
  /phpmyadmin/i, /\/vendor\//i, /\/actuator/i, /\/config\.(php|json|ya?ml)/i,
  /\/\.well-known\/(?!acme)/i, /\/cgi-bin\//i,
];

function isSuspicious(url) {
  for (let i = 0; i < SUSPICIOUS.length; i++) {
    if (SUSPICIOUS[i].test(url)) return true;
  }
  return false;
}

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    try {
      const ms = Date.now() - start;
      const fwd = req.headers['x-forwarded-for'];
      const ip = (fwd ? String(fwd).split(',')[0].trim() : '') || req.ip || '-';
      let tag = '';
      if (isSuspicious(req.originalUrl)) tag = ' [SUSPICIOUS]';
      else if (res.statusCode >= 500) tag = ' [ERROR]';
      else if (ms > SLOW_MS) tag = ' [SLOW]';
      // بنسجّل المسار من غير الـ query string عشان ما نسرّبش أي توكن لو حصل
      write(`${ip} ${req.method} ${req.path} ${res.statusCode} ${ms}ms${tag}`);
    } catch (e) { /* التسجيل ما بيوقّعش الطلب أبدًا */ }
  });
  next();
}

// بنمسك الأعطال اللي بتوقّع أو تبوّظ عملية Node — دي أهم حاجة في اللوج لو
// السيرفر بيتقفل أو بيبقى تقيل فجأة.
function installProcessHandlers() {
  process.on('unhandledRejection', (reason) => {
    write(`[unhandledRejection] ${reason && reason.stack ? reason.stack : reason}`);
  });
  process.on('uncaughtException', (err) => {
    write(`[uncaughtException] ${err && err.stack ? err.stack : err}`);
    // نفس سلوك Node الافتراضي (بيطلع بعد خطأ غير ممسوك) — بس بعد ما نسجّله،
    // عشان مدير العمليات (pm2/hPanel) يعيد التشغيل نظيف.
    process.exit(1);
  });
}

module.exports = { write, requestLogger, installProcessHandlers, LOG_FILE };
