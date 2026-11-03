'use strict';

/** "SR1,234.50" / "٤٥٫٠٠ ر.س" / 45 → 1234.5 / 45 / 45 (0 when there is no positive number). */
function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
  if (value === null || value === undefined || typeof value === 'object') return 0;
  const s = String(value)
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');
  const m = s.match(/\d[\d,]*(?:\.\d+)?/);
  if (!m) return 0;
  const n = Number(m[0].replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Order matters: the first match wins (e.g. "E£" must be EGP before "£" is GBP).
const CURRENCY_PATTERNS = [
  ['SAR', /\bSAR\b|\bSR\s?\d|\d\s?SR\b|ر\.?\s?س|ريال(?!\s*(?:قطري|عماني|يمني))/i],
  ['AED', /\bAED\b|د\.?\s?إ|درهم/i],
  ['EGP', /\bEGP\b|ج\.?\s?م|جنيه|E£/i],
  ['KWD', /\bKWD\b|د\.?\s?ك/i],
  ['QAR', /\bQAR\b|ر\.?\s?ق|ريال\s*قطري/i],
  ['OMR', /\bOMR\b|ر\.?\s?ع|ريال\s*عماني/i],
  ['BHD', /\bBHD\b|د\.?\s?ب/i],
  ['USD', /\bUSD\b|US\$|\$/],
  ['EUR', /\bEUR\b|€/],
  ['GBP', /\bGBP\b|£/],
];

function detectCurrency(text) {
  const s = String(text || '');
  if (!s) return null;
  for (const [code, re] of CURRENCY_PATTERNS) if (re.test(s)) return code;
  return null;
}

function currencyCode(value) {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (/^[A-Za-z]{3}$/.test(s)) return s.toUpperCase();
  return detectCurrency(s);
}

function firstString(obj, keys) {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/**
 * A price as SHEIN-style data returns it: a number, a string with a symbol, or an
 * object like { amount: "45.00", amountWithSymbol: "45.00ر.س", usdAmount: "12.00" }.
 * usdAmount is deliberately ignored — it is never the SAR price.
 * → { amount, currency } or null
 */
function parsePrice(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' || typeof value === 'string') {
    const amount = parseAmount(value);
    return amount ? { amount, currency: typeof value === 'string' ? detectCurrency(value) : null } : null;
  }
  if (typeof value !== 'object' || Array.isArray(value)) return null;

  const withSymbol = firstString(value, ['amountWithSymbol', 'amount_with_symbol', 'priceWithSymbol', 'price_with_symbol', 'formatted', 'display']);
  const code = firstString(value, ['currency', 'currencyCode', 'currency_code']);
  let amount = 0;
  for (const k of ['amount', 'value', 'price', 'amount_value']) {
    amount = parseAmount(value[k]);
    if (amount) break;
  }
  if (!amount && withSymbol) amount = parseAmount(withSymbol);
  if (!amount) return null;
  return { amount, currency: currencyCode(code) || detectCurrency(withSymbol) || null };
}

/** SAR → EGP: multiply by our rate, then round up to the nearest step (never under-charge). */
function toEgp(sar, { rate, roundTo = 1 } = {}) {
  if (!(sar > 0) || !(rate > 0)) return null;
  const raw = Math.round(sar * rate * 100) / 100;
  const step = Number.isInteger(roundTo) && roundTo >= 1 ? roundTo : 1;
  return Math.ceil(raw / step - 1e-9) * step;
}

module.exports = { parseAmount, detectCurrency, currencyCode, parsePrice, toEgp };
