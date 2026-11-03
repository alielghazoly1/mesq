'use strict';

// Characters that end a URL inside pasted text: whitespace, quotes, brackets,
// Arabic comma/semicolon and the invisible RTL/LTR marks phones add when copying.
const STOP = '\\s<>"\'`\\u060C\\u061B\\u200E\\u200F';
const FULL_URL_RE = new RegExp(`https?:\\/\\/[^${STOP}]+`, 'gi');
const BARE_SHEIN_RE = new RegExp(`(?<![\\w./-])(?:[a-z0-9-]+\\.)*shein\\.com\\/[^${STOP}]*`, 'gi');
const TRAILING_RE = /[)\]}>.,!?\u061F\u060C\u061B:;'"`*]+$/u;

const SHC_RE = /^\d_[A-Za-z0-9_-]{4,120}$/;
const GOODS_ID_RE = /^\d{5,15}$/;
const GROUP_ID_RE = /^\d{6,20}$/;

function hostIsShein(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/\.$/, '');
  return h === 'shein.com' || h.endsWith('.shein.com');
}

function isSheinUrl(href) {
  try {
    const u = new URL(href);
    return (u.protocol === 'https:' || u.protocol === 'http:') && hostIsShein(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Pulls every link out of whatever the customer pasted — the whole share message
 * from the SHEIN app ("لقد وجدت بعض المنتجات الرائعة في شي إن! ... https://onelink.shein.com/...")
 * or several links at once. Links without https:// are accepted for shein.com.
 */
function extractUrls(text, max = 10) {
  const src = String(text || '');
  const out = [];
  const seen = new Set();
  const add = (raw) => {
    const cleaned = raw.replace(TRAILING_RE, '');
    let u;
    try { u = new URL(cleaned); } catch { return; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return;
    u.hash = '';
    if (seen.has(u.href)) return;
    seen.add(u.href);
    out.push(u.href);
  };
  const rest = src.replace(FULL_URL_RE, (m) => { add(m); return ' '; });
  for (const m of rest.matchAll(BARE_SHEIN_RE)) add(`https://${m[0]}`);
  return out.slice(0, max);
}

function validShc(v) {
  return typeof v === 'string' && SHC_RE.test(v) ? v : undefined;
}

function countryParam(sp) {
  const c = sp.get('local_country') || sp.get('localcountry') || sp.get('localCountry') || '';
  return /^[A-Za-z]{2}$/.test(c) ? c.toUpperCase() : undefined;
}

function safeDecode(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

/**
 * Classifies a SHEIN URL without any network call:
 *  - product page  …-p-12345678.html (or goods_id=…)       → { kind: 'product', goodsId }
 *  - shared cart   …/cart/share/landing?group_id=…         → { kind: 'cart', groupId, shc, country }
 *  - short link    onelink.shein.com/59/xxxx / sharejump   → { kind: 'short' } (needs resolving)
 */
function parseSheinUrl(href) {
  let u;
  try { u = new URL(href); } catch { return { kind: 'invalid' }; }
  if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !hostIsShein(u.hostname)) return { kind: 'not_shein' };

  const path = safeDecode(u.pathname);
  const sp = u.searchParams;
  const country = countryParam(sp);

  if (/\/cart\/share\/landing/i.test(path)) {
    const groupId = sp.get('group_id') || sp.get('groupId') || '';
    if (GROUP_ID_RE.test(groupId)) return { kind: 'cart', groupId, shc: validShc(sp.get('shc')), country };
  }

  const p = path.match(/-p-(\d{5,15})(?:-cat-\d+)?(?:\.html)?(?=$|[/?#-])/i);
  if (p) return { kind: 'product', goodsId: p[1], country };

  const q = sp.get('goods_id') || sp.get('goodsId') || '';
  if (GOODS_ID_RE.test(q)) return { kind: 'product', goodsId: q, country };

  if (/sharejump/i.test(path) && /goods/i.test(sp.get('share_type') || '')) {
    const id = sp.get('id') || '';
    if (GOODS_ID_RE.test(id)) return { kind: 'product', goodsId: id, country };
  }

  if (u.hostname.toLowerCase() === 'onelink.shein.com' || /sharejump/i.test(path)) {
    return { kind: 'short', shc: validShc(sp.get('shc')) };
  }
  return { kind: 'unknown' };
}

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/gi, '&')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#47;/g, '/')
    .replace(/&quot;/gi, '"')
    .replace(/\\u002[fF]/g, '/')
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/');
}

/**
 * Reads the HTML a onelink short link returns. SHEIN often answers these with a
 * 200 page (no redirect) whose scripts carry the target: for a shared cart a
 * `shareInfo`/deeplink with group_id, for a product its goods_id.
 */
function parseSheinHtml(html) {
  const s = String(html || '').slice(0, 2_000_000);
  const out = { redirects: [] };
  if (!s) return out;

  // Cart: the shareInfo object or the /cart/share/landing deeplink, each carrying group_id.
  const cartMarker = /shareInfo|cart(?:[\\/]+|%2[fF])share|cart_share|cartShare|shareCart/i.test(s);
  const strongGroup = s.match(/shareInfo\\{0,3}["']?\s*[:=]\s*\{[^}]{0,400}?(?:group_id|groupId)\\{0,3}["']?\s*:\s*\\{0,3}["']?(\d{6,20})(?!\d)/i)
    || s.match(/cart(?:[\\/]+|%2[fF])share(?:[\\/]+|%2[fF])landing[^"'<>\s]{0,400}?(?:group_id|groupId)(?:=|%3[dD])(\d{6,20})(?!\d)/i);
  const group = strongGroup
    || s.match(/(?:group_id|groupId)\\{0,3}["']?\s*[:=]\s*\\{0,3}["']?(\d{6,20})(?!\d)/i)
    || s.match(/(?:group_id|groupId)(?:=|%3[dD])(\d{6,20})(?!\d)/i);
  if (cartMarker && group) {
    out.groupId = group[1];
    out.cartStrong = Boolean(strongGroup);
  }

  // Product: the product page URL or a goods share deeplink are strong; a bare goods_id is weaker.
  const strongGoods = s.match(/-p-(\d{5,15})(?:-cat-\d+)?\.html/i)
    || s.match(/share_type(?:=|%3[dD])goods[^"'<>\s]{0,400}?(?:&amp;|[?&]|%26|\\u0026)id(?:=|%3[dD])(\d{5,15})(?!\d)/i);
  const goods = strongGoods
    || s.match(/(?:goods_id|goodsId|goodsid)\\{0,3}["']?\s*[:=]\s*\\{0,3}["']?(\d{5,15})(?!\d)/i)
    || s.match(/(?:goods_id|goodsId)(?:=|%3[dD])(\d{5,15})(?!\d)/i);
  if (goods) {
    out.goodsId = goods[1];
    out.productStrong = Boolean(strongGoods);
  }

  const country = s.match(/(?:local_country|localcountry|localCountry)\\{0,3}["']?\s*(?:[:=]|%3[dD])\s*\\{0,3}["']?([A-Za-z]{2})(?![A-Za-z])/);
  if (country) out.country = country[1].toUpperCase();

  const shc = s.match(/[?&;"'\s]shc(?:=|%3[dD]|\\{0,3}["']?\s*:\s*\\{0,3}["'])(\d_[A-Za-z0-9_-]{4,120})/);
  if (shc) out.shc = shc[1];

  const hints = [
    s.match(/<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*content\s*=\s*["'][^"']*?url\s*=\s*([^"'>\s]+)/i),
    s.match(/<meta[^>]+property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']+)["']/i),
    s.match(/<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:url["']/i),
    s.match(/location\.replace\(\s*["']([^"']+)["']\s*\)/i),
    s.match(/(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/i),
  ];
  for (const h of hints) if (h && h[1]) out.redirects.push(decodeEntities(h[1]));
  return out;
}

module.exports = { hostIsShein, isSheinUrl, extractUrls, parseSheinUrl, parseSheinHtml, validShc };
