'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { loadConfig } = require('../lib/config');
const { createApp } = require('../lib/app');

const PRODUCT_ONELINK = 'https://onelink.shein.com/59/6718cdkz1x06?shc=2_RsmvRAkFlGV';
const OTHER_ONELINK = 'https://onelink.shein.com/59/other0000001';
const UNREADABLE_ONELINK = 'https://onelink.shein.com/59/unreadable01';
const APP_PAGE = '<html><title>SHEIN</title><script>window.__APP__ = {"jumpUrl":"/pages/landing","code":"abc"};</script></html>';
const PRODUCT_TEXT = `كنزة رجالية سوداء وبيضاء مخططة
لقد اكتشفت منتجات رائعة على موقع شي إن، تعالوا وتحققوا منها!
${PRODUCT_ONELINK}`;

function product(goodsId, amount) {
  return {
    code: '0',
    info: {
      goods_id: goodsId,
      goods_name: `منتج ${goodsId}`,
      goods_img: '//img.ltwebstatic.com/p.jpg',
      salePrice: { amount: String(amount), amountWithSymbol: `${amount}ر.س` },
      retailPrice: { amount: String(amount + 15), amountWithSymbol: `${amount + 15}ر.س` },
    },
  };
}

async function setup(envOverrides = {}, apiHandler = null) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shein-pricer-'));
  const config = loadConfig({
    DATA_DIR: dataDir,
    RAPIDAPI_KEY: 'test-key',
    RAPIDAPI_PRODUCT_URL: 'https://shein-scraper-api.p.rapidapi.com/product/details',
    SAR_TO_EGP: '15',
    ADMIN_PASSWORD: 'secret-pass',
    WHATSAPP_NUMBER: '+20 100 123 4567',
    ...envOverrides,
  });
  const apiCalls = [];
  const extraPages = new Map();
  const fetchImpl = async (url) => {
    for (const [prefix, html] of extraPages) if (url.startsWith(prefix)) return new Response(html, { status: 200 });
    if (url.startsWith(PRODUCT_ONELINK)) return new Response('<script>var x={"goods_id":"12345678"}</script>', { status: 200 });
    if (url.startsWith(OTHER_ONELINK)) return new Response('<script>var x={"goods_id":"87654321"}</script>', { status: 200 });
    if (url.startsWith(UNREADABLE_ONELINK)) return new Response(APP_PAGE, { status: 200 });
    if (url.startsWith('https://shein-scraper-api.p.rapidapi.com/')) {
      apiCalls.push(url);
      if (apiHandler) return apiHandler(new URL(url));
      const id = new URL(url).searchParams.get('goods_id');
      return new Response(JSON.stringify(product(id, 45)), { status: 200 });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  const app = createApp({ config, fetchImpl });
  const server = http.createServer((req, res) => { app.handle(req, res); });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const close = () => new Promise((resolve) => { app.flush(); server.close(() => { fs.rmSync(dataDir, { recursive: true, force: true }); resolve(); }); });
  return { app, base, apiCalls, close, config, extraPages };
}

const auth = { authorization: `Basic ${Buffer.from('admin:secret-pass').toString('base64')}` };
const post = (base, p, body, headers = {}) => fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('a product share message is priced in EGP, then served from the cache', async (t) => {
  const ctx = await setup();
  t.after(ctx.close);

  const r1 = await (await post(ctx.base, '/api/quote', { text: PRODUCT_TEXT })).json();
  assert.equal(r1.ok, true);
  const item = r1.groups[0].items[0];
  assert.equal(item.goodsId, '12345678');
  assert.equal(item.egp, 675);          // 45 SAR × 15
  assert.equal(item.originalEgp, 900);  // 60 SAR × 15
  assert.equal(item.priceSar, undefined, 'SAR hidden unless SHOW_SAR=true');
  assert.equal(ctx.apiCalls.length, 1);

  const r2 = await (await post(ctx.base, '/api/quote', { text: PRODUCT_TEXT })).json();
  assert.equal(r2.groups[0].items[0].egp, 675);
  assert.equal(ctx.apiCalls.length, 1, 'same product again → no new RapidAPI request');
});

test('the daily cap stops RapidAPI requests before they are sent', async (t) => {
  const ctx = await setup({ MAX_API_CALLS_PER_DAY: '1' });
  t.after(ctx.close);

  await post(ctx.base, '/api/quote', { text: PRODUCT_ONELINK });
  const r = await (await post(ctx.base, '/api/quote', { text: OTHER_ONELINK })).json();
  assert.equal(r.groups[0].ok, false);
  assert.equal(r.groups[0].code, 'QUOTA_GUARD');
  assert.equal(ctx.apiCalls.length, 1);
});

test('a wrong endpoint path is found automatically once, then remembered', async (t) => {
  const ctx = await setup({ RAPIDAPI_PRODUCT_URL: 'https://shein-scraper-api.p.rapidapi.com/v9/wrong' }, (u) => {
    if (u.pathname === '/products/details') {
      return new Response(JSON.stringify(product(u.searchParams.get('goods_id'), 45)), { status: 200 });
    }
    return new Response(JSON.stringify({ message: `Endpoint '${u.pathname}' does not exist` }), { status: 404 });
  });
  t.after(ctx.close);

  const r1 = await (await post(ctx.base, '/api/quote', { text: PRODUCT_ONELINK })).json();
  assert.equal(r1.groups[0].items[0].egp, 675);
  assert.deepEqual(ctx.apiCalls.map((u) => new URL(u).pathname), ['/v9/wrong', '/product/details', '/products/details']);

  const r2 = await (await post(ctx.base, '/api/quote', { text: OTHER_ONELINK })).json();
  assert.equal(r2.groups[0].ok, true);
  assert.equal(new URL(ctx.apiCalls.at(-1)).pathname, '/products/details');
  assert.equal(ctx.apiCalls.length, 4, 'the working path is used directly next time');

  const status = await (await fetch(`${ctx.base}/api/admin/status`, { headers: auth })).json();
  assert.equal(status.api.productUrl, 'https://shein-scraper-api.p.rapidapi.com/products/details');
});

test('an unreadable link is shown in /admin with a digest and the full page', async (t) => {
  const ctx = await setup();
  t.after(ctx.close);

  const r = await (await post(ctx.base, '/api/quote', { text: UNREADABLE_ONELINK })).json();
  assert.equal(r.groups[0].code, 'LINK_UNREADABLE');
  assert.equal(r.groups[0].debug, undefined, 'diagnostics never reach the customer');
  assert.equal(ctx.apiCalls.length, 0);

  const status = await (await fetch(`${ctx.base}/api/admin/status`, { headers: auth })).json();
  assert.equal(status.lastLinkFailure.url, UNREADABLE_ONELINK);
  assert.equal(status.lastLinkFailure.status, 200);
  assert.match(status.lastLinkFailure.summary, /phone: status 200/);
  assert.match(status.lastLinkFailure.summary, /preview: status 200/);
  assert.match(status.lastLinkFailure.summary, /jumpUrl = \/pages\/landing/);

  assert.equal((await fetch(`${ctx.base}/api/admin/debug/link-page`)).status, 401);
  const page = await fetch(`${ctx.base}/api/admin/debug/link-page`, { headers: auth });
  assert.match(page.headers.get('content-disposition'), /attachment/);
  assert.match(await page.text(), /window\.__APP__/);
});

test('the real product share page is priced, with the share title/image when the API has none', async (t) => {
  const realLink = 'https://onelink.shein.com/59/6718cdkz1x06?shc=2_RsmvRAkFlGV';
  const page = '<html><head><meta property="og:title" content="كنزة رجالية مخططة"/><meta property="og:image" content="https://img.ltwebstatic.com/v4/j/spmp/x.jpg"/></head><body>'
    + '<input type="hidden" id="url" value="https://api-shein.shein.com/h5/sharejump/appjump?onelink=59/6718cdkz1x06&amp;localcountry=SA"/>'
    + '<input type="hidden" id="deeplink" value="sheinlink://applink/goods?data=%7B%22goods_id%22%3A%22551922648%22%7D"/></body></html>';
  const ctx = await setup({ SAR_TO_EGP: '15' }, (u) => new Response(JSON.stringify({
    data: { goods_id: u.searchParams.get('goods_id'), salePrice: { amount: '59.00', amountWithSymbol: '59.00ر.س' } },
  }), { status: 200 }));
  t.after(ctx.close);
  ctx.extraPages.set(realLink, page);

  const r = await (await post(ctx.base, '/api/quote', { text: `كنزة رجالية\n${realLink}` })).json();
  const item = r.groups[0].items[0];
  assert.equal(item.goodsId, '551922648');
  assert.equal(item.egp, 885); // 59 × 15
  assert.equal(item.name, 'كنزة رجالية مخططة');
  assert.equal(item.image, 'https://img.ltwebstatic.com/v4/j/spmp/x.jpg');
  const u = new URL(ctx.apiCalls[0]);
  assert.deepEqual([u.searchParams.get('goods_id'), u.searchParams.get('country'), u.searchParams.get('currency')], ['551922648', 'sa', 'sar']);
});

test('a cart SHEIN won\'t let us read shows up in /admin with each attempt', async (t) => {
  const ctx = await setup();
  t.after(ctx.close);
  const cartLink = 'https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI';
  ctx.extraPages.set(cartLink, '<script>var shareInfo={"group_id":"876543210","local_country":"SA"}</script>');
  ctx.extraPages.set('https://m.shein.com/ar/cart/share/landing', '<html>verify you are human</html>');

  const r = await (await post(ctx.base, '/api/quote', { text: cartLink })).json();
  assert.equal(r.groups[0].code, 'CART_UNREADABLE');
  const status = await (await fetch(`${ctx.base}/api/admin/status`, { headers: auth })).json();
  assert.equal(status.lastLinkFailure.code, 'CART_UNREADABLE');
  assert.match(status.lastLinkFailure.summary, /cart-page: status 200/);
  assert.match(status.lastLinkFailure.summary, /cart-api@m\.shein\.com/);
  assert.match(status.lastLinkFailure.summary, /cart-api@www\.shein\.com/);
});

test('wrong input gets a clear code', async (t) => {
  const ctx = await setup();
  t.after(ctx.close);
  assert.equal((await (await post(ctx.base, '/api/quote', { text: 'بكام ده؟' })).json()).code, 'NO_LINKS');
  const r = await (await post(ctx.base, '/api/quote', { text: 'https://example.com/a-p-12345678.html' })).json();
  assert.equal(r.groups[0].code, 'NOT_SHEIN');
  assert.equal(ctx.apiCalls.length, 0);
});

test('no rate set → the page says prices are unavailable', async (t) => {
  const ctx = await setup({ SAR_TO_EGP: '' });
  t.after(ctx.close);
  const r = await (await post(ctx.base, '/api/quote', { text: PRODUCT_TEXT })).json();
  assert.equal(r.code, 'RATE_NOT_SET');
  const cfg = await (await fetch(`${ctx.base}/api/config`)).json();
  assert.equal(cfg.ready, false);
});

test('admin: password required, changes the rate, shows usage', async (t) => {
  const ctx = await setup();
  t.after(ctx.close);

  assert.equal((await fetch(`${ctx.base}/api/admin/status`)).status, 401);
  assert.equal((await fetch(`${ctx.base}/admin`, { headers: { authorization: `Basic ${Buffer.from('admin:wrong').toString('base64')}` } })).status, 401);

  await post(ctx.base, '/api/quote', { text: PRODUCT_TEXT });
  const status = await (await fetch(`${ctx.base}/api/admin/status`, { headers: auth })).json();
  assert.equal(status.usage.today, 1);
  assert.equal(status.lastApi.goodsId, '12345678');
  assert.equal(status.lastApi.code, 'OK');

  const bad = await post(ctx.base, '/api/admin/settings', { rate: -1 }, auth);
  assert.equal(bad.status, 400);
  const ok = await (await post(ctx.base, '/api/admin/settings', { rate: 16, roundTo: 5 }, auth)).json();
  assert.equal(ok.settings.rate, 16);

  const r = await (await post(ctx.base, '/api/quote', { text: PRODUCT_TEXT })).json();
  assert.equal(r.groups[0].items[0].egp, 720); // 45 × 16, cached product, new rate
  assert.equal(ctx.apiCalls.length, 1);

  const cfg = await (await fetch(`${ctx.base}/api/config`)).json();
  assert.deepEqual({ rate: cfg.rate, roundTo: cfg.roundTo, whatsapp: cfg.whatsapp, ready: cfg.ready }, { rate: 16, roundTo: 5, whatsapp: '201001234567', ready: true });
});

test('pages are served with a strict content security policy', async (t) => {
  const ctx = await setup();
  t.after(ctx.close);
  const res = await fetch(`${ctx.base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-security-policy'), /script-src 'self'/);
  assert.match(await res.text(), /اعرف السعر/);
  assert.equal((await fetch(`${ctx.base}/../server.js`)).status, 404);
  assert.equal((await fetch(`${ctx.base}/lib/app.js`)).status, 404);
});
