'use strict';

const { hostIsShein, parseSheinUrl, parseSheinHtml } = require('./links');
const { parsePrice } = require('./prices');

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const LINK_CACHE_MS = 30 * 24 * 3600 * 1000; // a share link always points to the same thing
const MAX_HTML_BYTES = 2_000_000;

function errName(err) {
  if (!err) return 'error';
  if (err.name === 'TimeoutError' || err.name === 'AbortError') return 'timeout';
  return err.cause?.code || err.code || err.name || 'error';
}

async function readCapped(res, maxBytes) {
  if (!res.body || typeof res.body.getReader !== 'function') {
    const text = await res.text();
    return text.slice(0, maxBytes);
  }
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * GETs a SHEIN page following redirects by hand, and only ever to *.shein.com
 * (the customer controls the input URL, so nothing else is fetched).
 */
async function fetchSheinPage(startUrl, { fetchImpl = fetch, maxHops = 5, timeoutMs = 10000, maxBytes = MAX_HTML_BYTES } = {}) {
  let next = startUrl;
  const hops = [];
  for (let i = 0; i <= maxHops; i++) {
    let u;
    try { u = new URL(next); } catch { return { hops, finalUrl: next, offsite: true }; }
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !hostIsShein(u.hostname)) {
      return { hops, finalUrl: u.href, offsite: true };
    }
    u.protocol = 'https:';
    hops.push(u.href);
    const res = await fetchImpl(u.href, {
      redirect: 'manual',
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'ar,en;q=0.8',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      try { await res.body?.cancel(); } catch { /* ignore */ }
      if (!loc) return { hops, finalUrl: u.href, status: res.status, html: '' };
      next = new URL(loc, u.href).href;
      continue;
    }
    const html = await readCapped(res, maxBytes);
    return { hops, finalUrl: u.href, status: res.status, html };
  }
  return { hops, finalUrl: next, tooManyRedirects: true };
}

/**
 * Any SHEIN link → { kind: 'product', goodsId } | { kind: 'cart', groupId, shc, country } | { kind: 'error', code }.
 * Short links (onelink.shein.com) are opened once and the answer is cached.
 */
async function resolveLink(href, { fetchImpl = fetch, cache = null, timeoutMs = 10000 } = {}) {
  const direct = parseSheinUrl(href);
  if (direct.kind === 'product' || direct.kind === 'cart') return direct;
  if (direct.kind === 'not_shein' || direct.kind === 'invalid') return { kind: 'error', code: 'NOT_SHEIN' };
  if (direct.kind === 'unknown') return { kind: 'error', code: 'NOT_PRODUCT_LINK' };

  const cacheKey = `link:${href}`;
  const hit = cache?.get(cacheKey);
  if (hit) return hit;
  const save = (r) => { cache?.set(cacheKey, r, LINK_CACHE_MS); return r; };

  let page;
  try {
    page = await fetchSheinPage(href, { fetchImpl, timeoutMs });
  } catch (err) {
    return { kind: 'error', code: 'LINK_FETCH_FAILED', detail: errName(err) };
  }

  // 1) A redirect that already landed on a product page or a shared cart.
  for (const hop of [...page.hops].reverse()) {
    const p = parseSheinUrl(hop);
    if (p.kind === 'product') return save(p);
    if (p.kind === 'cart') return save({ ...p, shc: p.shc || direct.shc });
  }

  // 2) The 200 page itself (shareInfo / deeplink / goods_id inside the scripts).
  // A clear signal wins over a loose one (a generic page script may mention
  // "cart/share" or some other groupId while the link is really a product).
  const info = parseSheinHtml(page.html || '');
  const asCart = () => save({ kind: 'cart', groupId: info.groupId, shc: direct.shc || info.shc, country: info.country });
  const asProduct = () => save({ kind: 'product', goodsId: info.goodsId, country: info.country });
  if (info.groupId && info.cartStrong) return asCart();
  if (info.goodsId && info.productStrong) return asProduct();
  if (info.groupId) return asCart();
  if (info.goodsId) return asProduct();

  // 3) A redirect hint in the page (meta refresh, og:url, location=...).
  for (const hint of info.redirects) {
    let abs;
    try { abs = new URL(hint, page.finalUrl).href; } catch { continue; }
    const p = parseSheinUrl(abs);
    if (p.kind === 'product') return save(p);
    if (p.kind === 'cart') return save({ ...p, shc: p.shc || direct.shc });
  }

  return { kind: 'error', code: 'LINK_UNREADABLE', detail: `status ${page.status ?? '-'}${page.offsite ? ' offsite' : ''}` };
}

// ---------------------------------------------------------------------------
// Shared cart ("لينك الباج")
// ---------------------------------------------------------------------------

// Lists of the shared-cart answer (SHEIN's /bff-api/order/cart/share/landing).
const CART_LISTS = new Map([['normalProducts', true], ['outStock', false], ['unavailable', false]]);
// Containers some page states use for the same data.
const SHARE_ROOTS = new Set(['cartShareData', 'shareCartData', 'cartShareInfo', 'shareCartInfo']);
const SHARE_LISTS = new Set(['goods_list', 'goodsList', 'cartList', 'cart_list', 'items']);

function cleanText(v, max) {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function toHttps(u) {
  if (typeof u !== 'string') return '';
  const s = u.trim();
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('http://')) return `https://${s.slice(7)}`;
  return s.startsWith('https://') ? s : '';
}

function toCartRow(entry, inStock) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  const p = entry.product && typeof entry.product === 'object' && !Array.isArray(entry.product)
    ? { ...entry.product, ...entry }
    : entry;
  const goodsId = String(p.goods_id ?? p.goodsId ?? '').trim();
  if (!/^\d{4,15}$/.test(goodsId)) return null;
  const qty = Number(p.quantity ?? p.goods_num ?? p.qty);
  return {
    goodsId,
    name: cleanText(p.goods_name ?? p.goodsName, 300),
    image: toHttps(p.goods_img ?? p.goodsImg),
    attrs: cleanText(p.goodsAttr ?? p.goods_attr ?? p.attr_value_name, 160),
    sku: cleanText(String(p.sku_code ?? p.skuCode ?? p.itemSku ?? ''), 80),
    quantity: Number.isInteger(qty) && qty > 0 && qty < 100 ? qty : 1,
    inStock,
    price: parsePrice(p.salePrice ?? p.sale_price ?? p.unitPrice ?? p.unit_price),
    retail: parsePrice(p.retailPrice ?? p.retail_price),
  };
}

/** Finds the shared-cart rows in a JSON answer (or a page state), ignoring recommendation feeds. */
function extractCartRows(payload, max = 60) {
  const rows = [];
  const seen = new Set();
  const stack = [{ node: payload, depth: 0, inShare: false }];
  let visited = 0;
  const push = (row) => {
    const key = [row.goodsId, row.sku, row.attrs].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  };
  while (stack.length && visited < 20000 && rows.length < max) {
    const { node, depth, inShare } = stack.pop();
    if (!node || typeof node !== 'object' || depth > 14) continue;
    visited++;
    if (Array.isArray(node)) {
      for (const x of node) stack.push({ node: x, depth: depth + 1, inShare });
      continue;
    }
    for (const [k, v] of Object.entries(node)) {
      const isList = Array.isArray(v) && (CART_LISTS.has(k) || (inShare && SHARE_LISTS.has(k)));
      if (isList) {
        const inStock = CART_LISTS.has(k) ? CART_LISTS.get(k) : true;
        for (const entry of v) {
          const row = toCartRow(entry, inStock);
          if (row) push(row);
          if (rows.length >= max) break;
        }
      } else if (v && typeof v === 'object') {
        stack.push({ node: v, depth: depth + 1, inShare: inShare || SHARE_ROOTS.has(k) });
      }
    }
  }
  return rows;
}

function matchBrace(s, start) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  const end = Math.min(s.length, start + 3_000_000);
  for (let i = start; i < end; i++) {
    const c = s[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

/** JSON objects embedded in <script> tags that mention the marker. */
function findJsonBlobs(html, marker, maxBlobs = 20) {
  const blobs = [];
  for (const m of String(html).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = m[1];
    if (!marker.test(body)) continue;
    const trimmed = body.trim();
    if (trimmed.startsWith('{')) {
      try { blobs.push(JSON.parse(trimmed)); continue; } catch { /* not plain JSON */ }
    }
    const re = /[=(:,]\s*\{/g;
    let found;
    let tries = 0;
    while ((found = re.exec(body)) && tries++ < 300 && blobs.length < maxBlobs) {
      const start = found.index + found[0].length - 1;
      const end = matchBrace(body, start);
      if (end < 0) continue;
      const chunk = body.slice(start, end + 1);
      if (!marker.test(chunk)) { re.lastIndex = end + 1; continue; }
      try { blobs.push(JSON.parse(chunk)); re.lastIndex = end + 1; } catch { /* keep scanning inside */ }
    }
    if (blobs.length >= maxBlobs) break;
  }
  return blobs;
}

function extractCartRowsFromHtml(html) {
  const marker = /normalProducts|cartShare|shareCart/;
  if (!html || !marker.test(html)) return [];
  for (const blob of findJsonBlobs(html, marker)) {
    const rows = extractCartRows(blob);
    if (rows.length) return rows;
  }
  return [];
}

/**
 * Best effort: reads the items of a shared cart from SHEIN itself.
 *  A) the share landing page (when SHEIN puts the cart in the HTML)
 *  B) the JSON endpoint the landing page calls
 * SHEIN may refuse server requests here (bot protection); then { ok: false } and
 * the page offers the customer WhatsApp / product links instead.
 */
async function readSharedCart({ groupId, shc, country }, { fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  const cc = (country || 'SA').toUpperCase();
  const landing = new URL('https://m.shein.com/ar/cart/share/landing');
  landing.searchParams.set('group_id', groupId);
  if (shc) landing.searchParams.set('shc', shc);
  landing.searchParams.set('local_country', cc);
  landing.searchParams.set('cart_share', '1');
  const attempts = [];

  try {
    const page = await fetchSheinPage(landing.href, { fetchImpl, timeoutMs });
    const rows = extractCartRowsFromHtml(page.html || '');
    if (rows.length) return { ok: true, rows, source: 'html', country: cc };
    attempts.push(`html:${page.status ?? '-'}`);
  } catch (err) {
    attempts.push(`html:${errName(err)}`);
  }

  try {
    const res = await fetchImpl('https://m.shein.com/bff-api/order/cart/share/landing', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'user-agent': UA,
        'content-type': 'application/json',
        accept: 'application/json, text/plain, */*',
        'accept-language': 'ar,en;q=0.8',
        origin: 'https://m.shein.com',
        referer: landing.href,
      },
      body: JSON.stringify({ groupId, localCountry: cc, ...(shc ? { shc } : {}) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await readCapped(res, 3_000_000);
    let json = null;
    try { json = JSON.parse(text); } catch { /* not JSON (blocked / challenge page) */ }
    const rows = json ? extractCartRows(json) : [];
    if (rows.length) return { ok: true, rows, source: 'bff', country: cc };
    attempts.push(`bff:${res.status}${json && json.code !== undefined ? `:${json.code}` : ''}`);
  } catch (err) {
    attempts.push(`bff:${errName(err)}`);
  }

  return { ok: false, attempts };
}

module.exports = {
  fetchSheinPage,
  resolveLink,
  readSharedCart,
  extractCartRows,
  extractCartRowsFromHtml,
  toHttps,
};
