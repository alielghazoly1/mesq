// utils/googleAuth.js
// "الدخول بجوجل" — التحقق من الـ ID token اللي زرار جوجل الرسمي (Google
// Identity Services) بيرجّعه للمتصفح، من غير أي مكتبة خارجية:
//   1) التوقيع RS256 بمفاتيح جوجل العامة (JWKS) — بنجيبها ونخزّنها على قد
//      ما جوجل بتقول (Cache-Control max-age)، ولو مفتاح جديد ظهر بنجيبها تاني.
//   2) iss = accounts.google.com، و aud = الـ Client ID بتاعنا بالظبط (من غير
//      ده أي موقع تاني عامل زرار جوجل يقدر يدخل بتوكن بتاعه عندنا).
//   3) لسه مخلصش (exp)، والإيميل متأكد منه عند جوجل (email_verified).
//
// العميل الجديد بياخد "تذكرة" مؤقتة موقّعة (20 دقيقة) فيها بياناته من جوجل،
// عشان يكمّل خطوة الدولة/الواتساب من غير ما نخزّن أي حاجة قبلها.
const crypto = require('crypto');
const SiteConfig = require('../models/SiteConfig');

const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
// الـ Client ID بتاع جوجل شكله ثابت: أرقام-حروف.apps.googleusercontent.com
const CLIENT_ID_RE = /^[0-9]{6,}-[a-z0-9]{10,}\.apps\.googleusercontent\.com$/;

let jwks = { keys: new Map(), until: 0 };
let fetchJwks = async () => {
  const res = await fetch(JWKS_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`google jwks ${res.status}`);
  const body = await res.json();
  const m = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '');
  return { keys: body.keys || [], maxAge: m ? Number(m[1]) : 3600 };
};

async function keyFor(kid) {
  const now = Date.now();
  if (now >= jwks.until || !jwks.keys.has(kid)) {
    const { keys, maxAge } = await fetchJwks();
    const map = new Map();
    keys.forEach((k) => { if (k.kid && k.kty === 'RSA') map.set(k.kid, crypto.createPublicKey({ key: k, format: 'jwk' })); });
    jwks = { keys: map, until: now + Math.min(Math.max(maxAge, 60), 24 * 3600) * 1000 };
  }
  return jwks.keys.get(kid) || null;
}

const b64json = (s) => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));

/**
 * بيتأكد من الـ ID token وبيرجّع بيانات العميل، أو بيرمي خطأ.
 * @param {string} idToken
 * @param {string} clientId
 */
async function verifyGoogleIdToken(idToken, clientId) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3 || parts.some((p) => !p || p.length > 8000)) throw new Error('malformed token');
  const header = b64json(parts[0]);
  const payload = b64json(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('bad alg');
  const key = await keyFor(header.kid);
  if (!key) throw new Error('unknown key');
  const ok = crypto.verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'));
  if (!ok) throw new Error('bad signature');
  const now = Math.floor(Date.now() / 1000);
  if (!ISSUERS.has(payload.iss)) throw new Error('bad issuer');
  if (payload.aud !== clientId) throw new Error('bad audience');
  if (!payload.exp || payload.exp < now - 60) throw new Error('expired');
  if (payload.iat && payload.iat > now + 300) throw new Error('issued in the future');
  if (!payload.sub || !payload.email) throw new Error('missing identity');
  if (payload.email_verified !== true && payload.email_verified !== 'true') throw new Error('email not verified');
  return {
    sub: String(payload.sub),
    email: String(payload.email).trim().toLowerCase(),
    name: String(payload.name || payload.given_name || '').trim(),
  };
}

// ===== تذكرة التسجيل المؤقتة =====
// المفتاح مشتق من سر السيرفر (مش السر نفسه)، ولو مش موجود بيتولّد واحد عشوائي
// لحد ما السيرفر يعيد تشغيل (التذكرة عمرها 20 دقيقة بس).
const PENDING_KEY = crypto.createHmac('sha256', process.env.ADMIN_SECRET || crypto.randomBytes(32))
  .update('mithaq-google-pending-v1').digest();
const PENDING_TTL_MS = 20 * 60 * 1000;

function signPending(profile) {
  const body = Buffer.from(JSON.stringify({ ...profile, exp: Date.now() + PENDING_TTL_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', PENDING_KEY).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function readPending(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const want = crypto.createHmac('sha256', PENDING_KEY).update(body).digest();
  let got;
  try { got = Buffer.from(sig, 'base64url'); } catch { return null; }
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return p && p.exp > Date.now() && p.sub && p.email ? p : null;
  } catch { return null; }
}

// ===== الإعداد (من لوحة التحكم، وإلا من GOOGLE_CLIENT_ID) =====
async function getGoogleConfig() {
  let doc = null;
  try { doc = await SiteConfig.findOne({ key: 'default' }).select('googleClientId googleLoginEnabled').lean(); } catch { /* */ }
  const clientId = String((doc && doc.googleClientId) || process.env.GOOGLE_CLIENT_ID || '').trim();
  const enabled = !!clientId && CLIENT_ID_RE.test(clientId) && !(doc && doc.googleLoginEnabled === false);
  return { enabled, clientId: enabled ? clientId : '' };
}

module.exports = {
  verifyGoogleIdToken, signPending, readPending, getGoogleConfig, CLIENT_ID_RE,
  // للتيستات بس: مفاتيح وهمية بدل جوجل
  _setJwksFetcher(fn) { fetchJwks = fn; jwks = { keys: new Map(), until: 0 }; },
};
