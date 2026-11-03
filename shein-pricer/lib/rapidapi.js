'use strict';

const { parsePrice, currencyCode } = require('./prices');
const { toHttps } = require('./shein');

class ApiError extends Error {
  constructor(code, message, extra = {}) {
    super(message || code);
    this.code = code;
    Object.assign(this, extra);
  }
}

/**
 * One call to the RapidAPI "Product Details" endpoint:
 *   GET <RAPIDAPI_PRODUCT_URL>?goods_id=…&currency=sar&country=sa&language=ar
 * Returns the parsed JSON plus a short raw sample (shown in /admin for debugging).
 */
async function fetchProductDetails(goodsId, { rapidapi, fetchImpl = fetch }) {
  if (!rapidapi.key) throw new ApiError('NO_KEY');
  let url;
  try { url = new URL(rapidapi.productUrl); } catch { throw new ApiError('BAD_ENDPOINT', 'RAPIDAPI_PRODUCT_URL is not a URL'); }
  url.search = '';
  url.searchParams.set('goods_id', goodsId);
  if (rapidapi.currency) url.searchParams.set('currency', rapidapi.currency);
  if (rapidapi.country) url.searchParams.set('country', rapidapi.country);
  if (rapidapi.language) url.searchParams.set('language', rapidapi.language);

  let res;
  try {
    res = await fetchImpl(url.href, {
      headers: {
        'x-rapidapi-key': rapidapi.key,
        'x-rapidapi-host': rapidapi.host || url.host,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(rapidapi.timeoutMs || 20000),
    });
  } catch (err) {
    throw new ApiError('UPSTREAM_NETWORK', err?.name === 'TimeoutError' ? 'timeout' : err?.message);
  }

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* handled below */ }
  const sample = text.slice(0, 20000);
  const message = typeof json?.message === 'string' ? json.message : '';
  const extra = { status: res.status, sample };

  if (res.status === 429) throw new ApiError('QUOTA', message || 'Too many requests / quota exceeded', extra);
  if (res.status === 401 || res.status === 403) throw new ApiError('AUTH', message || `HTTP ${res.status}`, extra);
  if (res.status === 404) {
    // RapidAPI's gateway: "Endpoint '/x' does not exist" (wrong path) / "API doesn't exists" (wrong host)
    if (/(?:does\s*not|doesn'?t)\s+exists?|endpoint/i.test(message || text)) throw new ApiError('BAD_ENDPOINT', message, extra);
    throw new ApiError('NOT_FOUND', message, extra);
  }
  if (!res.ok) throw new ApiError('UPSTREAM', message || `HTTP ${res.status}`, extra);
  if (!json || typeof json !== 'object') throw new ApiError('BAD_RESPONSE', 'Response is not JSON', extra);
  return { json, sample, status: res.status };
}

// ---------------------------------------------------------------------------
// Response → { name, image, priceSar, originalSar }
// The provider's exact JSON shape isn't documented here, so the reader is
// tolerant: it anchors on the object whose id equals the goods_id we asked for
// (so "related products" prices are never picked), then looks for the usual
// SHEIN field names, nearest first.
// ---------------------------------------------------------------------------

const ID_KEYS = ['goods_id', 'goodsId', 'productId', 'product_id', 'id'];
const NAME_KEYS = ['goods_name', 'goodsName', 'goods_title', 'product_name', 'productName', 'title', 'name'];
const IMAGE_KEYS = ['goods_img', 'goodsImg', 'original_img', 'main_image', 'mainImage', 'image_url', 'imageUrl', 'image', 'img', 'goods_thumb', 'thumbnail'];
const IMAGE_LIST_KEYS = ['images', 'goods_imgs', 'detail_image', 'imageList', 'image_list', 'gallery'];
const SALE_KEYS = ['salePrice', 'sale_price', 'discountPrice', 'discount_price', 'finalPrice', 'final_price', 'currentPrice', 'current_price', 'price'];
const RETAIL_KEYS = ['retailPrice', 'retail_price', 'originalPrice', 'original_price', 'regularPrice', 'regular_price', 'marketPrice', 'list_price'];
const CURRENCY_KEYS = ['currency', 'currencyCode', 'currency_code'];
const STOCK_KEYS = ['is_on_sale', 'isOnSale', 'in_stock', 'inStock', 'stock', 'is_sold_out', 'soldOutStatus'];

function isObj(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function findMainProduct(root, goodsId) {
  const want = String(goodsId);
  const queue = [{ node: root, depth: 0 }];
  let visited = 0;
  while (queue.length && visited < 5000) {
    const { node, depth } = queue.shift();
    if (!node || typeof node !== 'object' || depth > 8) continue;
    visited++;
    if (Array.isArray(node)) {
      for (const v of node.slice(0, 200)) queue.push({ node: v, depth: depth + 1 });
      continue;
    }
    if (ID_KEYS.some((k) => node[k] !== undefined && node[k] !== null && String(node[k]) === want)) return node;
    for (const v of Object.values(node)) if (v && typeof v === 'object') queue.push({ node: v, depth: depth + 1 });
  }
  return null;
}

/** Breadth-first over objects only (arrays usually hold other products / SKUs). */
function bfsObjects(root, maxDepth, visit) {
  const queue = [{ node: root, depth: 0 }];
  let visited = 0;
  while (queue.length && visited < 3000) {
    const { node, depth } = queue.shift();
    if (!isObj(node) || depth > maxDepth) continue;
    visited++;
    const result = visit(node);
    if (result !== undefined) return result;
    for (const v of Object.values(node)) if (isObj(v)) queue.push({ node: v, depth: depth + 1 });
  }
  return undefined;
}

function pickString(root, keys, maxDepth) {
  return bfsObjects(root, maxDepth, (o) => {
    for (const k of keys) if (typeof o[k] === 'string' && o[k].trim()) return o[k].trim();
    return undefined;
  }) || '';
}

function pickPrice(root, keys, maxDepth) {
  return bfsObjects(root, maxDepth, (o) => {
    for (const k of keys) {
      if (o[k] === undefined || o[k] === null) continue;
      const p = parsePrice(o[k]);
      if (p) return p;
    }
    return undefined;
  }) || null;
}

function pickImage(root, maxDepth) {
  return bfsObjects(root, maxDepth, (o) => {
    for (const k of IMAGE_KEYS) {
      const u = toHttps(o[k]);
      if (u) return u;
    }
    for (const k of IMAGE_LIST_KEYS) {
      const list = o[k];
      if (!Array.isArray(list) || !list.length) continue;
      const first = list[0];
      const u = toHttps(typeof first === 'string' ? first : first?.origin_image || first?.url || first?.image_url || first?.src);
      if (u) return u;
    }
    return undefined;
  }) || '';
}

/**
 * → { ok: true, product } | { ok: false, code: 'NO_PRICE' | 'CURRENCY_MISMATCH', currency? }
 * A price that is clearly in another currency (e.g. "$") is refused: multiplying
 * a dollar price by the riyal rate would sell under cost.
 */
function normalizeProduct(json, goodsId, { expectCurrency = 'SAR' } = {}) {
  const main = findMainProduct(json, goodsId);
  const scopes = main ? [main, json] : [json];
  let name = '';
  let image = '';
  let sale = null;
  let retail = null;
  let currencyHint = null;
  for (const scope of scopes) {
    name = name || pickString(scope, NAME_KEYS, 3);
    image = image || pickImage(scope, 3);
    sale = sale || pickPrice(scope, SALE_KEYS, 3);
    retail = retail || pickPrice(scope, RETAIL_KEYS, 3);
    currencyHint = currencyHint || currencyCode(pickString(scope, CURRENCY_KEYS, 2));
  }

  const price = sale || retail;
  if (!price) return { ok: false, code: 'NO_PRICE' };
  const want = String(expectCurrency || '').toUpperCase();
  const currency = price.currency || currencyHint || null;
  if (want && currency && currency !== want) return { ok: false, code: 'CURRENCY_MISMATCH', currency };

  const original = retail && retail.amount > price.amount && (!retail.currency || !want || retail.currency === want) ? retail.amount : null;
  let soldOut = false;
  if (main) {
    for (const k of STOCK_KEYS) {
      if (main[k] === undefined) continue;
      const v = main[k];
      if (k === 'is_sold_out' || k === 'soldOutStatus') soldOut = v === true || v === 1 || v === '1';
      else soldOut = v === false || v === 0 || v === '0';
      break;
    }
  }

  return {
    ok: true,
    product: {
      goodsId: String(goodsId),
      name: name.slice(0, 300),
      image,
      priceSar: price.amount,
      originalSar: original,
      currencyVerified: Boolean(currency),
      soldOut,
    },
  };
}

module.exports = { ApiError, fetchProductDetails, normalizeProduct, findMainProduct };
