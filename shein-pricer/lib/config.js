'use strict';

const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function reader(env) {
  const str = (name, def = '') => {
    const v = env[name];
    return v === undefined || String(v).trim() === '' ? def : String(v).trim();
  };
  const num = (name, def) => {
    const raw = str(name, '');
    if (raw === '') return def;
    const n = Number(raw);
    return Number.isFinite(n) ? n : def;
  };
  const bool = (name, def) => {
    const raw = str(name, '').toLowerCase();
    if (!raw) return def;
    return ['1', 'true', 'yes', 'on'].includes(raw);
  };
  return { str, num, bool };
}

function hostOf(url) {
  try { return new URL(url).host; } catch { return ''; }
}

/**
 * Reads every setting from environment variables (see .env.example).
 * Pure: pass a custom env object in tests.
 */
function loadConfig(env = process.env) {
  const { str, num, bool } = reader(env);
  const productUrl = str('RAPIDAPI_PRODUCT_URL', 'https://shein-scraper-api.p.rapidapi.com/product/details');

  return {
    root: ROOT,
    dataDir: path.resolve(ROOT, str('DATA_DIR', 'data')),
    port: num('PORT', 3100),
    host: str('HOST', '0.0.0.0'),
    trustProxy: bool('TRUST_PROXY', false),

    storeName: str('STORE_NAME', 'حاسبة الأسعار'),
    whatsappNumber: str('WHATSAPP_NUMBER', '').replace(/\D/g, ''),
    showSar: bool('SHOW_SAR', false),
    adminPassword: str('ADMIN_PASSWORD', ''),

    pricing: {
      rate: num('SAR_TO_EGP', 0),
      roundTo: num('ROUND_TO', 1),
    },

    rapidapi: {
      key: str('RAPIDAPI_KEY', ''),
      productUrl,
      host: str('RAPIDAPI_HOST', hostOf(productUrl)),
      country: str('SHEIN_COUNTRY', 'sa').toLowerCase(),
      currency: str('SHEIN_CURRENCY', 'sar').toLowerCase(),
      language: str('SHEIN_LANGUAGE', 'ar').toLowerCase(),
      timeoutMs: num('RAPIDAPI_TIMEOUT_MS', 20000),
    },

    limits: {
      apiCallsPerDay: num('MAX_API_CALLS_PER_DAY', 20),
      apiCallsPerMonth: num('MAX_API_CALLS_PER_MONTH', 45),
      linksPerRequest: num('MAX_LINKS_PER_REQUEST', 10),
      cartItems: num('MAX_CART_ITEMS', 25),
      quotesPerIpPer10Min: num('RATE_LIMIT_PER_10MIN', 20),
    },

    cache: {
      productHours: num('CACHE_HOURS', 6),
    },

    timeZone: str('TIME_ZONE', 'Africa/Cairo'),
  };
}

module.exports = { loadConfig };
