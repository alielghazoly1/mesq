'use strict';

const { extractUrls, isSheinUrl, summarizeHtml } = require('./links');
const { resolveLink, readSharedCart } = require('./shein');
const { fetchProductDetails, normalizeProduct } = require('./rapidapi');
const { toEgp } = require('./prices');

const CART_CACHE_MS = 30 * 60 * 1000;
const RETRY_LATER_MS = 30 * 60 * 1000;
const NOT_FOUND_MS = 6 * 3600 * 1000;
// Usual paths for a "Product Details" endpoint, tried (same host) only when the
// configured one answers "endpoint does not exist". The one that works is saved.
const ENDPOINT_PATHS = ['/product/details', '/products/details', '/product/detail', '/product-details', '/productDetails'];

async function mapLimit(list, limit, fn) {
  const out = new Array(list.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (i < list.length) {
      const idx = i++;
      out[idx] = await fn(list[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Text pasted by the customer → priced items.
 * Every RapidAPI call goes through getProduct(): cache first, then the usage cap,
 * so the same product is never paid for twice within CACHE_HOURS.
 */
function createQuoter({ config, cache, usage, settings, fetchImpl = fetch, now = () => Date.now() }) {
  const inflight = new Map();
  const events = [];
  const badEndpoints = new Set();
  let lastApi = null;
  let lastLinkFailure = null;
  let lastLinkHtml = '';

  // Keeps what SHEIN answered for a link we couldn't read, for /admin.
  function recordLinkFailure(url, link) {
    const d = link.debug || {};
    const pages = d.pages || (d.html !== undefined ? [d] : []);
    const head = (p) => `${p.label || 'page'}: status ${p.status ?? '-'}${p.error ? ` (${p.error})` : ''} | final ${p.finalUrl || '-'}${p.offsite ? ' (outside shein.com)' : ''}`;
    const digest = (p) => (p.bodyPreview !== undefined ? `body: ${p.bodyPreview}` : summarizeHtml(p.html || '', 6000));
    lastLinkHtml = pages.map((p) => `===== ${head(p)}\n${p.html || ''}`).join('\n\n');
    lastLinkFailure = {
      at: new Date(now()).toISOString(),
      url,
      code: link.code,
      status: d.status ?? null,
      finalUrl: d.finalUrl || null,
      hops: d.hops || [],
      offsite: Boolean(d.offsite),
      error: d.error || null,
      summary: pages.map((p) => `--- ${head(p)}\n${digest(p)}`).join('\n\n'),
    };
    logEvent({ code: link.code, detail: `${d.status ?? d.error ?? '-'} ${url}` });
  }

  function endpointCandidates() {
    const configured = config.rapidapi.productUrl;
    let origin = '';
    try { origin = new URL(configured).origin; } catch { origin = config.rapidapi.host ? `https://${config.rapidapi.host}` : ''; }
    const list = [settings.getEndpoint(), configured, ...(origin ? ENDPOINT_PATHS.map((p) => origin + p) : [])];
    return [...new Set(list.filter(Boolean).map((u) => u.split('?')[0]))].filter((u) => !badEndpoints.has(u));
  }

  function logEvent(e) {
    events.unshift({ at: new Date(now()).toISOString(), ...e });
    if (events.length > 30) events.length = 30;
  }

  function once(key, work) {
    if (inflight.has(key)) return inflight.get(key);
    const p = work().finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  }

  function getProduct(goodsId) {
    const rc = config.rapidapi;
    const key = `p:${goodsId}:${rc.country}:${rc.currency}:${rc.language}`;
    const hit = cache.get(key);
    if (hit) return Promise.resolve({ ...hit, cached: true });
    return once(key, async () => {
      if (!rc.key) return { ok: false, code: 'NO_KEY' };
      for (const endpoint of endpointCandidates()) {
        const allowed = usage.canCall();
        if (!allowed.ok) {
          logEvent({ goodsId, code: 'QUOTA_GUARD', detail: allowed.reason });
          return { ok: false, code: 'QUOTA_GUARD', reason: allowed.reason };
        }
        usage.record();
        try {
          const { json, sample, status } = await fetchProductDetails(goodsId, { rapidapi: { ...rc, productUrl: endpoint }, fetchImpl });
          settings.setEndpoint(endpoint);
          const result = normalizeProduct(json, goodsId, { expectCurrency: rc.currency.toUpperCase() });
          lastApi = { at: new Date(now()).toISOString(), goodsId, endpoint, status, code: result.ok ? 'OK' : result.code, sample };
          logEvent({ goodsId, code: result.ok ? 'OK' : result.code, status });
          cache.set(key, result, result.ok ? config.cache.productHours * 3600 * 1000 : RETRY_LATER_MS);
          return result;
        } catch (err) {
          const code = err.code || 'UPSTREAM';
          lastApi = { at: new Date(now()).toISOString(), goodsId, endpoint, status: err.status ?? null, code, message: err.message, sample: err.sample || '' };
          logEvent({ goodsId, code, status: err.status ?? null, detail: code === 'BAD_ENDPOINT' ? endpoint : undefined });
          if (code === 'BAD_ENDPOINT') { badEndpoints.add(endpoint); continue; }
          const result = { ok: false, code };
          if (code === 'NOT_FOUND') cache.set(key, result, NOT_FOUND_MS);
          return result;
        }
      }
      return { ok: false, code: 'BAD_ENDPOINT' };
    });
  }

  function getCart(link) {
    const key = `c:${link.groupId}:${(link.country || 'SA').toUpperCase()}`;
    const hit = cache.get(key);
    if (hit) return Promise.resolve(hit);
    return once(key, async () => {
      const result = await readSharedCart(link, { fetchImpl });
      logEvent({ groupId: link.groupId, code: result.ok ? `CART_OK_${result.source}` : 'CART_UNREADABLE', detail: result.ok ? `${result.rows.length} items` : result.attempts.join(' ') });
      if (result.ok) cache.set(key, result, CART_CACHE_MS);
      return result;
    });
  }

  function pricedItem(base, pricing) {
    return {
      ok: true,
      goodsId: base.goodsId,
      name: base.name || '',
      image: base.image || '',
      attrs: base.attrs || '',
      quantity: base.quantity || 1,
      inStock: base.inStock !== false,
      priceSar: base.priceSar,
      originalSar: base.originalSar || null,
      egp: toEgp(base.priceSar, pricing),
      originalEgp: base.originalSar ? toEgp(base.originalSar, pricing) : null,
    };
  }

  async function quoteUrl(url, pricing) {
    if (!isSheinUrl(url)) return { url, ok: false, code: 'NOT_SHEIN' };
    const link = await resolveLink(url, { fetchImpl, cache });

    if (link.kind === 'product') {
      const r = await getProduct(link.goodsId);
      if (!r.ok) return { url, kind: 'product', ok: false, code: r.code, goodsId: link.goodsId, name: link.name || '' };
      const item = pricedItem({
        ...r.product,
        name: r.product.name || link.name,   // the share page's title/image when the API has none
        image: r.product.image || link.image,
        inStock: !r.product.soldOut,
      }, pricing);
      return { url, kind: 'product', ok: true, items: [item] };
    }

    if (link.kind === 'cart') {
      const cart = await getCart(link);
      if (!cart.ok) {
        recordLinkFailure(url, { code: 'CART_UNREADABLE', debug: cart.debug });
        return { url, kind: 'cart', ok: false, code: 'CART_UNREADABLE' };
      }
      const rows = cart.rows.slice(0, config.limits.cartItems);
      const items = await mapLimit(rows, 3, async (row) => {
        const base = { goodsId: row.goodsId, name: row.name, image: row.image, attrs: row.attrs, quantity: row.quantity, inStock: row.inStock };
        // The cart answer already carries the price in riyal → no API request needed.
        if (row.price && row.price.currency === 'SAR') {
          const originalSar = row.retail && row.retail.currency === 'SAR' && row.retail.amount > row.price.amount ? row.retail.amount : null;
          return pricedItem({ ...base, priceSar: row.price.amount, originalSar }, pricing);
        }
        const r = await getProduct(row.goodsId);
        if (r.ok) {
          return pricedItem({ ...base, name: base.name || r.product.name, image: base.image || r.product.image, priceSar: r.product.priceSar, originalSar: r.product.originalSar }, pricing);
        }
        return { ...base, ok: false, code: r.code };
      });
      return { url, kind: 'cart', ok: true, items, truncated: cart.rows.length > rows.length };
    }

    if (link.debug) recordLinkFailure(url, link);
    return { url, ok: false, code: link.code || 'LINK_UNREADABLE' };
  }

  async function quote(text) {
    const urls = extractUrls(text, config.limits.linksPerRequest);
    if (!urls.length) return { ok: false, code: 'NO_LINKS' };
    const { rate, roundTo } = settings.get();
    if (!(rate > 0)) return { ok: false, code: 'RATE_NOT_SET' };
    const groups = [];
    for (const url of urls) {
      try {
        groups.push(await quoteUrl(url, { rate, roundTo }));
      } catch (err) {
        console.error(`[quote] ${url}: ${err.stack || err.message}`);
        groups.push({ url, ok: false, code: 'INTERNAL' });
      }
    }
    return { ok: true, groups };
  }

  return {
    quote,
    getProduct,
    status: () => ({ events: [...events], lastApi, lastLinkFailure }),
    lastLinkHtml: () => lastLinkHtml,
  };
}

module.exports = { createQuoter, mapLimit };
