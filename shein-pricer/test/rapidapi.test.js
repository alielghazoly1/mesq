'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { fetchProductDetails, normalizeProduct } = require('../lib/rapidapi');

// Synthetic responses shaped like SHEIN product data, to exercise the reader.
const sheinLike = {
  code: '0',
  info: {
    goods_id: '12345678',
    goods_name: 'كنزة رجالية مخططة',
    goods_img: '//img.ltwebstatic.com/images3_pi/2024/sweater.jpg',
    salePrice: { amount: '45.00', amountWithSymbol: '45.00ر.س', usdAmount: '12.00' },
    retailPrice: { amount: '60.00', amountWithSymbol: '60.00ر.س', usdAmount: '16.00' },
    related: [
      { goods_id: '999', goods_name: 'منتج تاني', salePrice: { amount: '9.00', amountWithSymbol: '9.00ر.س' } },
    ],
  },
};

test('normalizeProduct reads the requested product, not related ones', () => {
  const r = normalizeProduct(sheinLike, '12345678');
  assert.equal(r.ok, true);
  assert.deepEqual(r.product, {
    goodsId: '12345678',
    name: 'كنزة رجالية مخططة',
    image: 'https://img.ltwebstatic.com/images3_pi/2024/sweater.jpg',
    priceSar: 45,
    originalSar: 60,
    currencyVerified: true,
    soldOut: false,
  });
});

test('normalizeProduct finds the product inside wrappers and arrays', () => {
  const wrapped = {
    success: true,
    data: {
      products: [
        { goods_id: 111, goods_name: 'غلط', sale_price: 5 },
        { goods_id: 12345678, product_name: 'صح', sale_price: { amount: 30, currency: 'SAR' }, images: ['https://img.ltwebstatic.com/a.jpg'] },
      ],
    },
  };
  const r = normalizeProduct(wrapped, '12345678');
  assert.equal(r.ok, true);
  assert.equal(r.product.name, 'صح');
  assert.equal(r.product.priceSar, 30);
  assert.equal(r.product.image, 'https://img.ltwebstatic.com/a.jpg');
});

test('normalizeProduct refuses a price in another currency', () => {
  const usd = { info: { goods_id: '1234567', goods_name: 'x', salePrice: { amount: '12.00', amountWithSymbol: '$12.00' } } };
  assert.deepEqual(normalizeProduct(usd, '1234567'), { ok: false, code: 'CURRENCY_MISMATCH', currency: 'USD' });
  const coded = { goods_id: '1234567', price: 12, currency: 'USD' };
  assert.equal(normalizeProduct(coded, '1234567').code, 'CURRENCY_MISMATCH');
});

test('normalizeProduct reports NO_PRICE and accepts plain numbers', () => {
  assert.deepEqual(normalizeProduct({ message: 'nothing here' }, '1234567'), { ok: false, code: 'NO_PRICE' });
  const plain = normalizeProduct({ data: { goods_id: '1234567', goods_name: 'x', salePrice: { amount: '20.00' } } }, '1234567');
  assert.equal(plain.ok, true);
  assert.equal(plain.product.priceSar, 20);
  assert.equal(plain.product.currencyVerified, false);
});

test('normalizeProduct notices sold out products', () => {
  const r = normalizeProduct({ goods_id: '1234567', salePrice: { amount: '20', amountWithSymbol: 'SR20' }, is_on_sale: 0 }, '1234567');
  assert.equal(r.product.soldOut, true);
});

function fakeFetch(status, body, calls) {
  return async (url, opts) => {
    calls.push({ url, opts });
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  };
}

const rapidapi = {
  key: 'test-key',
  productUrl: 'https://shein-scraper-api.p.rapidapi.com/product/details?goods_id=1',
  host: 'shein-scraper-api.p.rapidapi.com',
  country: 'sa',
  currency: 'sar',
  language: 'ar',
  timeoutMs: 5000,
};

test('fetchProductDetails sends goods_id, country, currency, language and the RapidAPI headers', async () => {
  const calls = [];
  const { json } = await fetchProductDetails('12345678', { rapidapi, fetchImpl: fakeFetch(200, sheinLike, calls) });
  assert.equal(json.info.goods_id, '12345678');
  const u = new URL(calls[0].url);
  assert.equal(u.origin + u.pathname, 'https://shein-scraper-api.p.rapidapi.com/product/details');
  assert.equal(u.searchParams.get('goods_id'), '12345678');
  assert.equal(u.searchParams.get('country'), 'sa');
  assert.equal(u.searchParams.get('currency'), 'sar');
  assert.equal(u.searchParams.get('language'), 'ar');
  assert.equal(calls[0].opts.headers['x-rapidapi-key'], 'test-key');
  assert.equal(calls[0].opts.headers['x-rapidapi-host'], 'shein-scraper-api.p.rapidapi.com');
});

test('fetchProductDetails maps RapidAPI errors to clear codes', async () => {
  const cases = [
    [429, { message: 'You have exceeded the MONTHLY quota' }, 'QUOTA'],
    [403, { message: 'You are not subscribed to this API.' }, 'AUTH'],
    [404, { message: "Endpoint '/product/details' does not exist" }, 'BAD_ENDPOINT'],
    [404, { message: "API doesn't exists" }, 'BAD_ENDPOINT'],
    [404, { message: 'Product not found' }, 'NOT_FOUND'],
    [500, { message: 'boom' }, 'UPSTREAM'],
    [200, 'not json', 'BAD_RESPONSE'],
  ];
  for (const [status, body, code] of cases) {
    await assert.rejects(fetchProductDetails('12345678', { rapidapi, fetchImpl: fakeFetch(status, body, []) }), (err) => err.code === code);
  }
  await assert.rejects(fetchProductDetails('1', { rapidapi: { ...rapidapi, key: '' }, fetchImpl: fakeFetch(200, {}, []) }), (err) => err.code === 'NO_KEY');
});
