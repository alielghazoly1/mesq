'use strict';

/**
 * Structural reader for SHEIN share pages (onelink.shein.com and the pages it
 * jumps to). Instead of matching the raw HTML against fixed patterns, it:
 *  1. collects every value the page carries (hidden <input>s, <meta>, links,
 *     string literals in scripts),
 *  2. decodes each one fully (HTML entities, JS escapes, %-encoding — a link
 *     inside a link, JSON inside a link's query…),
 *  3. walks the decoded URLs and JSON looking for the keys that matter
 *     (goods_id → product, group_id → shared cart, localcountry, shc),
 *  4. lists the SHEIN web links a browser would follow next (appjump/sharejump,
 *     forceRed), so the caller can follow them when nothing is found.
 *
 * Real example (product share, Nov 2026): the page has
 *   <input id="deeplink" value="sheinlink://applink/goods?data=%7B%22goods_id%22%3A%22551922648%22…%7D">
 *   <input id="url" value="https://api-shein.shein.com/h5/sharejump/appjump?onelink=59/…&localcountry=SA…">
 */

const { hostIsShein, validShc } = require('./links');

const MAX_VALUES = 400;
const MAX_DEPTH = 6;

function normKey(k) {
  return String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function htmlDecode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (m, e) => {
    const k = e.toLowerCase();
    if (k === 'amp') return '&';
    if (k === 'quot') return '"';
    if (k === 'apos') return "'";
    if (k === 'lt') return '<';
    if (k === 'gt') return '>';
    const code = k.startsWith('#x') ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
    return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
  });
}

function jsUnescape(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\([/"'])/g, '$1');
}

function pctDecode(s) {
  if (!/%[0-9A-Fa-f]{2}/.test(s)) return s;
  try {
    return decodeURIComponent(s);
  } catch {
    return s.replace(/%([0-9A-Fa-f]{2})/g, (m, h) => {
      const c = parseInt(h, 16);
      return c >= 0x20 && c < 0x7f ? String.fromCharCode(c) : m;
    });
  }
}

/** The value as written, then each further decoding step until nothing changes. */
function variants(value) {
  const out = [];
  let cur = jsUnescape(htmlDecode(value));
  out.push(cur);
  for (let i = 0; i < 4; i++) {
    const next = pctDecode(cur);
    if (next === cur) break;
    out.push(next);
    cur = next;
  }
  return out;
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null;
}

function collectValues(html) {
  const vals = [];
  for (const m of html.matchAll(/<input\b[^>]*>/gi)) {
    const v = attr(m[0], 'value');
    if (v) vals.push({ v, where: `input#${attr(m[0], 'id') || attr(m[0], 'name') || '?'}` });
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const v = attr(m[0], 'content');
    if (v) vals.push({ v, where: `meta:${attr(m[0], 'property') || attr(m[0], 'name') || attr(m[0], 'http-equiv') || '?'}` });
  }
  for (const m of html.matchAll(/<(?:a|link|iframe)\b[^>]*>/gi)) {
    const v = attr(m[0], 'href') || attr(m[0], 'src');
    if (v) vals.push({ v, where: 'href' });
  }
  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = m[1];
    const trimmed = body.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) vals.push({ v: trimmed, where: 'script-json' });
    for (const s of body.matchAll(/"((?:[^"\\\n]|\\.){6,6000})"|'((?:[^'\\\n]|\\.){6,6000})'/g)) {
      vals.push({ v: s[1] ?? s[2], where: 'script' });
      if (vals.length > MAX_VALUES) break;
    }
    if (vals.length > MAX_VALUES) break;
  }
  return vals.slice(0, MAX_VALUES);
}

function add(map, id, where, score) {
  const prev = map.get(id);
  if (!prev || score > prev.score) map.set(id, { score, where });
}

function handleKeyValue(nk, raw, ctx, found) {
  const v = String(raw).trim();
  if (nk === 'goodsid' && /^\d{5,15}$/.test(v)) add(found.goods, v, ctx.where, ctx.appGoods ? 6 : 4);
  else if (nk === 'id' && /^\d{5,15}$/.test(v) && (ctx.appGoods || /goods/.test(ctx.shareType || ''))) add(found.goods, v, ctx.where, 4);
  else if (nk === 'groupid' && /^\d{6,20}$/.test(v)) add(found.groups, v, ctx.where, ctx.appCart ? 6 : 4);
  else if (/^(?:shareid|cartshareid|sharecartid|cartid)$/.test(nk) && /^\d{6,20}$/.test(v) && ctx.appCart) add(found.groups, v, ctx.where, 2);
  else if (nk === 'localcountry' && /^[A-Za-z]{2}$/.test(v)) found.countries.push(v.toUpperCase());
  else if (nk === 'shc' && validShc(v) && !found.shc) found.shc = v;
}

function scanJson(node, where, found, depth, ctx) {
  if (depth > 14 || !node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const x of node.slice(0, 200)) scanJson(x, where, found, depth + 1, ctx);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    const nk = normKey(k);
    if (typeof v === 'string' || typeof v === 'number') handleKeyValue(nk, v, { ...ctx, where: `${where}.${k}` }, found);
    if (typeof v === 'string' && v.length > 5) scan(v, `${where}.${k}`, found, depth + 1, ctx);
    else if (v && typeof v === 'object') scanJson(v, `${where}.${k}`, found, depth + 1, ctx);
  }
}

function scanUrl(href, where, found, depth) {
  let u;
  try { u = new URL(href); } catch { return; }
  const scheme = u.protocol.replace(':', '').toLowerCase();
  const isApp = scheme !== 'http' && scheme !== 'https';
  const route = `${u.host}${u.pathname}`.toLowerCase(); // "applink/goods" for sheinlink://applink/goods
  const shareType = (u.searchParams.get('share_type') || '').toLowerCase();
  const ctx = {
    where: `${where} ${isApp ? scheme : u.host}${u.pathname}`,
    appGoods: isApp && /(^|\/)goods(?:_?detail)?(?:\/|$)/.test(route),
    appCart: isApp && /cart/.test(route),
    shareType,
  };

  if (!isApp && hostIsShein(u.hostname)) {
    found.sheinUrls.push(u.href);
    const p = u.pathname.match(/-p-(\d{5,15})(?:-cat-\d+)?(?:\.html)?(?=$|[/-])/i);
    if (p) add(found.goods, p[1], `${ctx.where} (product page)`, 5);
    if (/\/cart\/share\/landing/i.test(u.pathname)) {
      const g = u.searchParams.get('group_id') || u.searchParams.get('groupId') || '';
      if (/^\d{6,20}$/.test(g)) add(found.groups, g, `${ctx.where} (cart page)`, 5);
    }
  }
  if (ctx.appGoods) {
    const m = route.match(/goods(?:_?detail)?\/(\d{5,15})(?:\/|$)/);
    if (m) add(found.goods, m[1], `${ctx.where} (app path)`, 6);
  }
  for (const [k, val] of u.searchParams) {
    handleKeyValue(normKey(k), val, ctx, found);
    if (val.length > 5) scan(val, `${where}>${k}`, found, depth + 1, ctx);
  }
}

function scan(value, where, found, depth = 0, ctx = {}) {
  if (depth > MAX_DEPTH || typeof value !== 'string' || value.length < 2) return;
  for (const v of variants(value)) {
    const t = v.trim();
    if (/^[a-z][a-z0-9+.-]*:\/\/\S+$/i.test(t)) scanUrl(t, where, found, depth);
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      try { scanJson(JSON.parse(t), where, found, depth + 1, ctx); } catch { /* not JSON */ }
    }
    for (const m of t.matchAll(/-p-(\d{5,15})(?:-cat-\d+)?\.html/gi)) add(found.goods, m[1], `${where} (-p- in text)`, 3);
  }
}

function best(map) {
  let top = null;
  for (const [id, info] of map) if (!top || info.score > top.score) top = { id, ...info };
  return top;
}

/**
 * → {
 *     product: { id, score, where, strong } | null,
 *     cart:    { id, score, where, strong } | null,
 *     country, shc, title, image,
 *     follow: [SHEIN urls a browser would go to next],
 *   }
 */
function readShareDocument(html) {
  const s = String(html || '').slice(0, 2_000_000);
  const found = { goods: new Map(), groups: new Map(), countries: [], shc: undefined, sheinUrls: [] };
  let title = '';
  let image = '';
  for (const { v, where } of collectValues(s)) {
    if (where === 'meta:og:title' && !title) title = htmlDecode(v).replace(/\s+/g, ' ').trim().slice(0, 300);
    if (where === 'meta:og:image' && !image && /^https:\/\//i.test(v)) image = htmlDecode(v);
    scan(v, where, found);
  }
  if (!title) {
    const t = s.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
    if (t) title = htmlDecode(t[1]).replace(/\s+/g, ' ').trim();
  }

  const product = best(found.goods);
  const cart = best(found.groups);
  const result = {
    product: product ? { ...product, strong: product.score >= 4 } : null,
    cart: cart ? { ...cart, strong: cart.score >= 4 } : null,
    country: found.countries[0],
    shc: found.shc,
    title,
    image,
    follow: [],
  };
  // A cart answer beats a product answer of equal or lower weight (a cart page can mention its items).
  if (result.cart && result.product && result.product.score > result.cart.score) result.cart.strong = false;
  if (result.cart && result.product && result.cart.score >= result.product.score) result.product.strong = false;

  // Where a browser would go next: the web fallback (appjump/sharejump), then forceRed.
  const urls = [...new Set(found.sheinUrls)];
  result.follow = [
    ...urls.filter((u) => /\/h5\/sharejump\/|appjump/i.test(u)),
    ...urls.filter((u) => /onelink\.shein\.com/i.test(u) && /forceRed=1/i.test(u)),
  ].slice(0, 3);
  return result;
}

module.exports = { readShareDocument, collectValues, variants };
