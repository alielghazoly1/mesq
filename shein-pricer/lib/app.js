'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JsonFile, TtlCache, Settings, UsageMeter, RateLimiter } = require('./store');
const { createQuoter } = require('./quote');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/admin.js': ['admin.js', 'text/javascript; charset=utf-8'],
};
const ADMIN_PAGE = ['admin.html', 'text/html; charset=utf-8'];

const SECURITY_HEADERS = {
  'content-security-policy': "default-src 'self'; img-src 'self' https: data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
};

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

function sendJson(res, status, obj, headers = {}) {
  send(res, status, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
}

function readJsonBody(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('bad json'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

/**
 * Wires the stores, the quoter and the HTTP routes. Everything that touches the
 * network goes through `fetchImpl`, so tests run with a fake one.
 */
function createApp({ config, fetchImpl = fetch, now = () => Date.now() }) {
  const file = (name, fallback) => new JsonFile(path.join(config.dataDir, name), fallback);
  const files = {
    cache: file('cache.json', {}),
    usage: file('usage.json', {}),
    settings: file('settings.json', {}),
  };
  const cache = new TtlCache(files.cache, { now });
  const usage = new UsageMeter(files.usage, {
    perDay: config.limits.apiCallsPerDay,
    perMonth: config.limits.apiCallsPerMonth,
    timeZone: config.timeZone,
    now,
  });
  const settings = new Settings(files.settings, config.pricing, { now });
  const quoter = createQuoter({ config, cache, usage, settings, fetchImpl, now });
  const quoteLimiter = new RateLimiter(config.limits.quotesPerIpPer10Min, 10 * 60 * 1000, { now });
  const adminFailLimiter = new RateLimiter(10, 10 * 60 * 1000, { now });

  function clientIp(req) {
    if (config.trustProxy) {
      const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      if (xff) return xff;
    }
    return req.socket?.remoteAddress || 'unknown';
  }

  function isAdmin(req) {
    if (!config.adminPassword) return false;
    const m = String(req.headers.authorization || '').match(/^Basic\s+([A-Za-z0-9+/=]+)$/i);
    if (!m) return false;
    const decoded = Buffer.from(m[1], 'base64').toString('utf8');
    const pass = decoded.slice(decoded.indexOf(':') + 1);
    return safeEqual(pass, config.adminPassword);
  }

  function requireAdmin(req, res) {
    if (!config.adminPassword) {
      send(res, 404, 'لوحة الإدارة مقفولة: حط ADMIN_PASSWORD في ملف .env', { 'content-type': 'text/plain; charset=utf-8' });
      return false;
    }
    if (isAdmin(req)) return true;
    if (req.headers.authorization && !adminFailLimiter.check(clientIp(req)).ok) {
      send(res, 429, 'محاولات كتير — جرّب بعد شوية', { 'content-type': 'text/plain; charset=utf-8' });
      return false;
    }
    send(res, 401, 'محتاج كلمة السر', { 'www-authenticate': 'Basic realm="admin", charset="UTF-8"', 'content-type': 'text/plain; charset=utf-8' });
    return false;
  }

  function serveFile(res, [name, type]) {
    fs.readFile(path.join(PUBLIC_DIR, name), (err, buf) => {
      if (err) return send(res, 404, 'not found', { 'content-type': 'text/plain; charset=utf-8' });
      const cacheControl = type.startsWith('text/html') ? 'no-cache' : 'public, max-age=300';
      send(res, 200, buf, { 'content-type': type, 'cache-control': cacheControl });
    });
  }

  function publicConfig() {
    const { rate, roundTo } = settings.get();
    return {
      storeName: config.storeName,
      whatsapp: config.whatsappNumber || null,
      showSar: config.showSar,
      rate: rate > 0 ? rate : null,
      roundTo,
      ready: Boolean(config.rapidapi.key) && rate > 0,
    };
  }

  function stripSar(result) {
    if (config.showSar || !result.groups) return result;
    for (const g of result.groups) {
      for (const item of g.items || []) { delete item.priceSar; delete item.originalSar; }
    }
    return result;
  }

  function adminStatus() {
    const rc = config.rapidapi;
    return {
      settings: settings.get(),
      usage: usage.snapshot(),
      cachedProducts: cache.size('p:'),
      api: {
        configured: Boolean(rc.key),
        productUrl: settings.getEndpoint() || rc.productUrl,
        host: rc.host,
        country: rc.country,
        currency: rc.currency,
        language: rc.language,
      },
      whatsapp: config.whatsappNumber || null,
      ...quoter.status(),
    };
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const route = `${req.method} ${url.pathname}`;
    try {
      if (req.method === 'GET' && STATIC[url.pathname]) return serveFile(res, STATIC[url.pathname]);
      if (route === 'GET /healthz') return sendJson(res, 200, { ok: true });
      if (route === 'GET /api/config') return sendJson(res, 200, publicConfig());

      if (route === 'POST /api/quote') {
        const limit = quoteLimiter.check(clientIp(req));
        if (!limit.ok) return sendJson(res, 429, { ok: false, code: 'SLOW_DOWN' }, { 'retry-after': String(limit.retryAfter) });
        const body = await readJsonBody(req);
        const text = typeof body.text === 'string' ? body.text.slice(0, 5000) : '';
        const result = await quoter.quote(text);
        return sendJson(res, 200, stripSar(result));
      }

      if (url.pathname === '/admin' || url.pathname.startsWith('/api/admin/')) {
        if (!requireAdmin(req, res)) return undefined;
        if (route === 'GET /admin') return serveFile(res, ADMIN_PAGE);
        if (route === 'GET /api/admin/status') return sendJson(res, 200, adminStatus());
        if (route === 'POST /api/admin/settings') {
          const body = await readJsonBody(req);
          try {
            return sendJson(res, 200, { ok: true, settings: settings.update({ rate: body.rate, roundTo: body.roundTo }) });
          } catch (err) {
            return sendJson(res, 400, { ok: false, code: err instanceof RangeError ? `BAD_${err.message.toUpperCase()}` : 'BAD_INPUT' });
          }
        }
        if (route === 'GET /api/admin/debug/link-page') {
          return send(res, 200, quoter.lastLinkHtml() || '(empty)', {
            'content-type': 'text/plain; charset=utf-8',
            'content-disposition': 'attachment; filename="shein-link-page.txt"',
            'cache-control': 'no-store',
          });
        }
        if (route === 'POST /api/admin/cache/clear') {
          return sendJson(res, 200, { ok: true, removed: cache.clear('p:') + cache.clear('c:') + cache.clear('link:') });
        }
      }

      return send(res, 404, 'not found', { 'content-type': 'text/plain; charset=utf-8' });
    } catch (err) {
      if (err.status === 400 || err.status === 413) return sendJson(res, err.status, { ok: false, code: 'BAD_REQUEST' });
      console.error(`[app] ${route}: ${err.stack || err.message}`);
      return sendJson(res, 500, { ok: false, code: 'INTERNAL' });
    }
  }

  function flush() {
    for (const f of Object.values(files)) f.flush();
  }

  return { handle, flush, quoter, settings, usage, cache };
}

module.exports = { createApp };
