'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveLink, readSharedCart, extractCartRows, extractCartRowsFromHtml } = require('../lib/shein');

function router(routes, calls) {
  return async (url, opts = {}) => {
    calls.push({ url, opts });
    for (const [match, reply] of routes) {
      if (url.startsWith(match)) {
        const r = typeof reply === 'function' ? reply(url, opts) : reply;
        return new Response(r.body ?? null, { status: r.status ?? 200, headers: r.headers ?? { 'content-type': 'text/html' } });
      }
    }
    throw new Error(`unexpected fetch ${url}`);
  };
}

function memoryCache() {
  const m = new Map();
  return { get: (k) => m.get(k), set: (k, v) => m.set(k, v), m };
}

const CART_ONELINK = 'https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI';
const PRODUCT_ONELINK = 'https://onelink.shein.com/59/6718cdkz1x06?shc=2_RsmvRAkFlGV';

test('resolveLink reads a cart from the onelink HTML and keeps the share code', async () => {
  const calls = [];
  const cache = memoryCache();
  const fetchImpl = router([[CART_ONELINK, { body: '<html><script>var shareInfo={"group_id":"876543210","local_country":"SA"}</script></html>' }]], calls);
  const link = await resolveLink(CART_ONELINK, { fetchImpl, cache });
  assert.deepEqual(link, { kind: 'cart', groupId: '876543210', shc: '2_RsmcDqBA4AI', country: 'SA' });
  await resolveLink(CART_ONELINK, { fetchImpl, cache });
  assert.equal(calls.length, 1, 'second resolve comes from the cache');
});

test('resolveLink prefers a clear product signal over loose cart words in page scripts', async () => {
  const html = `<html><head><meta property="og:url" content="https://ar.shein.com/Sweater-p-12345678.html"></head>
    <script>var routes = ["/cart/share/landing", "/user/orders"]; var ab = {"groupId":"7654321"};</script></html>`;
  const fetchImpl = router([[PRODUCT_ONELINK, { body: html }]], []);
  assert.deepEqual(await resolveLink(PRODUCT_ONELINK, { fetchImpl }), { kind: 'product', goodsId: '12345678', country: undefined });
});

test('resolveLink follows a SHEIN redirect to the product page', async () => {
  const calls = [];
  const fetchImpl = router([
    [PRODUCT_ONELINK, { status: 302, headers: { location: 'https://m.shein.com/ar/Men-Sweater-p-12345678.html?ref=share' } }],
    ['https://m.shein.com/ar/Men-Sweater-p-12345678.html', { body: '<html></html>' }],
  ], calls);
  const link = await resolveLink(PRODUCT_ONELINK, { fetchImpl });
  assert.deepEqual(link, { kind: 'product', goodsId: '12345678', country: undefined });
});

test('resolveLink never fetches a non-SHEIN host from a redirect', async () => {
  const calls = [];
  const fetchImpl = router([[PRODUCT_ONELINK, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data' } }]], calls);
  const link = await resolveLink(PRODUCT_ONELINK, { fetchImpl });
  assert.equal(link.kind, 'error');
  assert.equal(link.code, 'LINK_UNREADABLE');
  assert.ok(calls.length >= 1 && calls.every((c) => new URL(c.url).hostname === 'onelink.shein.com'));
});

test('resolveLink reads the SHEIN target out of an off-site redirect without fetching it', async () => {
  const calls = [];
  const target = encodeURIComponent('https://ar.shein.com/Men-Sweater-p-12345678.html?ref=share');
  const fetchImpl = router([[PRODUCT_ONELINK, { status: 302, headers: { location: `https://app.example-deeplinks.com/x?af_web_dp=${target}` } }]], calls);
  assert.deepEqual(await resolveLink(PRODUCT_ONELINK, { fetchImpl }), { kind: 'product', goodsId: '12345678', country: undefined });
  assert.equal(calls.length, 1);
});

test('resolveLink retries as a link-preview bot when the phone page is only an app script', async () => {
  const calls = [];
  const fetchImpl = router([[PRODUCT_ONELINK, (url, opts) => (opts.headers['user-agent'].includes('LinkPreviewBot')
    ? { body: '<html><head><meta property="og:url" content="https://m.shein.com/ar/Sweater-p-12345678.html"></head></html>' }
    : { body: '<html><script src="https://sheinsz.ltwebstatic.com/onelink/app.js"></script></html>' })]], calls);
  assert.deepEqual(await resolveLink(PRODUCT_ONELINK, { fetchImpl }), { kind: 'product', goodsId: '12345678', country: undefined });
  assert.equal(calls.length, 2);
});

test('resolveLink understands app deeplinks, sharejump links and base64 payloads', async () => {
  const pages = [
    '<script>var dl = "sheinlink://applink/goods/12345678?url_from=share";</script>',
    '<script>var u = "https:\\/\\/api-shein.shein.com\\/h5\\/sharejump\\/appsharejump?lan=ar\\u0026localcountry=SA\\u0026id=12345678";</script>',
    `<script>var data = "${Buffer.from(JSON.stringify({ goods_id: '12345678', site: 'sa' })).toString('base64')}";</script>`,
  ];
  for (const body of pages) {
    const fetchImpl = router([[PRODUCT_ONELINK, { body }]], []);
    const link = await resolveLink(PRODUCT_ONELINK, { fetchImpl });
    assert.equal(link.kind, 'product', body);
    assert.equal(link.goodsId, '12345678', body);
  }
});

test('an unreadable link keeps what SHEIN answered for diagnosis', async () => {
  const html = '<html><title>SHEIN</title><script src="https://sheinsz.ltwebstatic.com/onelink/app.js"></script></html>';
  const fetchImpl = router([[PRODUCT_ONELINK, { body: html }]], []);
  const link = await resolveLink(PRODUCT_ONELINK, { fetchImpl });
  assert.equal(link.code, 'LINK_UNREADABLE');
  assert.equal(link.debug.status, 200);
  assert.deepEqual(link.debug.pages.map((p) => p.label), ['phone', 'preview']);
  assert.equal(link.debug.pages[0].html, html);
});

test('resolveLink answers without network for direct links and rejects other sites', async () => {
  const fetchImpl = async () => { throw new Error('no network expected'); };
  assert.deepEqual(await resolveLink('https://ar.shein.com/a-p-12345678.html', { fetchImpl }), { kind: 'product', goodsId: '12345678', country: undefined });
  assert.equal((await resolveLink('https://example.com/a-p-12345678.html', { fetchImpl })).code, 'NOT_SHEIN');
  assert.equal((await resolveLink('https://ar.shein.com/women-dresses.html', { fetchImpl })).code, 'NOT_PRODUCT_LINK');
});

const BFF_ANSWER = {
  code: '0',
  info: {
    normalProducts: [
      { goods_id: '11111111', goods_name: 'فستان', goods_img: '//img.ltwebstatic.com/d.jpg', goodsAttr: 'أسود / M', sku_code: 'I1', salePrice: { amount: '55.00', amountWithSymbol: '55.00ر.س', usdAmount: '14.66' }, retailPrice: { amount: '70.00', amountWithSymbol: '70.00ر.س' } },
      { goods_id: '22222222', goods_name: 'شنطة', goodsAttr: 'بيج', sku_code: 'I2', salePrice: { amount: '14.66', amountWithSymbol: '$14.66' } },
      { goods_id: '11111111', goods_name: 'فستان', goodsAttr: 'أسود / M', sku_code: 'I1', salePrice: { amount: '55.00', amountWithSymbol: '55.00ر.س' } },
    ],
    outStock: [{ goods_id: '33333333', goods_name: 'جزمة', salePrice: { amount: '80.00', amountWithSymbol: '80.00ر.س' } }],
    recommendList: [{ goods_id: '44444444', goods_name: 'مقترح', salePrice: { amount: '1.00', amountWithSymbol: '1.00ر.س' } }],
  },
};

test('extractCartRows reads cart lists, marks out-of-stock and skips recommendations', () => {
  const rows = extractCartRows(BFF_ANSWER);
  assert.deepEqual(rows.map((r) => r.goodsId).sort(), ['11111111', '22222222', '33333333']);
  const dress = rows.find((r) => r.goodsId === '11111111');
  assert.deepEqual(dress.price, { amount: 55, currency: 'SAR' });
  assert.equal(dress.image, 'https://img.ltwebstatic.com/d.jpg');
  assert.equal(dress.attrs, 'أسود / M');
  assert.equal(rows.find((r) => r.goodsId === '22222222').price.currency, 'USD');
  assert.equal(rows.find((r) => r.goodsId === '33333333').inStock, false);
});

test('extractCartRowsFromHtml finds cart data embedded in the landing page', () => {
  const html = `<html><script>window.gbCartShare = ${JSON.stringify({ page: { cartShareData: { goodsList: [{ goods_id: '55555555', goods_name: 'بلوزة', salePrice: { amount: '20.00', amountWithSymbol: 'SR20.00' } }] } } })};</script></html>`;
  const rows = extractCartRowsFromHtml(html);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].goodsId, '55555555');
  assert.deepEqual(rows[0].price, { amount: 20, currency: 'SAR' });
  assert.deepEqual(extractCartRowsFromHtml('<html>no cart</html>'), []);
});

test('readSharedCart falls back to the JSON endpoint with the right body', async () => {
  const calls = [];
  const fetchImpl = router([
    ['https://m.shein.com/ar/cart/share/landing', { body: '<html><div id="app"></div></html>' }],
    ['https://m.shein.com/bff-api/order/cart/share/landing', { body: JSON.stringify(BFF_ANSWER), headers: { 'content-type': 'application/json' } }],
  ], calls);
  const cart = await readSharedCart({ groupId: '876543210', shc: '2_RsmcDqBA4AI' }, { fetchImpl });
  assert.equal(cart.ok, true);
  assert.equal(cart.source, 'bff');
  assert.equal(cart.rows.length, 3);
  const landing = new URL(calls[0].url);
  assert.equal(landing.searchParams.get('group_id'), '876543210');
  assert.equal(landing.searchParams.get('local_country'), 'SA');
  assert.deepEqual(JSON.parse(calls[1].opts.body), { groupId: '876543210', localCountry: 'SA', shc: '2_RsmcDqBA4AI' });
});

test('readSharedCart reports failure (with what SHEIN answered) when every way is blocked', async () => {
  const fetchImpl = router([
    ['https://m.shein.com/ar/cart/share/landing', { status: 403, body: '<html>verify</html>' }],
    ['https://m.shein.com/bff-api/', { status: 403, body: '<html>verify</html>' }],
    ['https://www.shein.com/bff-api/', { status: 200, body: '{"code":"10111","msg":"risk"}' }],
  ], []);
  const cart = await readSharedCart({ groupId: '876543210' }, { fetchImpl });
  assert.equal(cart.ok, false);
  assert.deepEqual(cart.attempts, ['html:403', 'bff@m.shein.com:403', 'bff@www.shein.com:200:10111']);
  assert.deepEqual(cart.debug.pages.map((p) => p.label), ['cart-page', 'cart-api@m.shein.com', 'cart-api@www.shein.com']);
  assert.equal(cart.debug.pages[2].bodyPreview, '{"code":"10111","msg":"risk"}');
});
