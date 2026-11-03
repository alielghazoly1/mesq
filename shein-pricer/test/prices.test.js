'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAmount, detectCurrency, parsePrice, toEgp } = require('../lib/prices');

test('parseAmount reads prices with symbols, separators and Arabic digits', () => {
  assert.equal(parseAmount('SR45.00'), 45);
  assert.equal(parseAmount('45.00ر.س'), 45);
  assert.equal(parseAmount('٤٥٫٥٠ ر.س'), 45.5);
  assert.equal(parseAmount('1,234.50'), 1234.5);
  assert.equal(parseAmount(39.9), 39.9);
  assert.equal(parseAmount('abc'), 0);
  assert.equal(parseAmount(-5), 0);
  assert.equal(parseAmount(null), 0);
  assert.equal(parseAmount({ amount: 5 }), 0);
});

test('detectCurrency tells riyal from dollars and other currencies', () => {
  assert.equal(detectCurrency('45.00ر.س'), 'SAR');
  assert.equal(detectCurrency('SR45.00'), 'SAR');
  assert.equal(detectCurrency('SAR 45'), 'SAR');
  assert.equal(detectCurrency('45 ريال'), 'SAR');
  assert.equal(detectCurrency('45 ريال قطري'), 'QAR');
  assert.equal(detectCurrency('$12.00'), 'USD');
  assert.equal(detectCurrency('E£ 600'), 'EGP');
  assert.equal(detectCurrency('AED 40'), 'AED');
  assert.equal(detectCurrency('45.00'), null);
});

test('parsePrice uses amount (never usdAmount) and keeps the currency', () => {
  assert.deepEqual(parsePrice({ amount: '45.00', amountWithSymbol: '45.00ر.س', usdAmount: '12.00' }), { amount: 45, currency: 'SAR' });
  assert.deepEqual(parsePrice({ amount: '12.00', amountWithSymbol: '$12.00' }), { amount: 12, currency: 'USD' });
  assert.deepEqual(parsePrice({ amountWithSymbol: 'SR39.90' }), { amount: 39.9, currency: 'SAR' });
  assert.deepEqual(parsePrice({ amount: 45, currency: 'sar' }), { amount: 45, currency: 'SAR' });
  assert.equal(parsePrice({ usdAmount: '12.00' }), null);
  assert.deepEqual(parsePrice('SR 20'), { amount: 20, currency: 'SAR' });
  assert.deepEqual(parsePrice(20), { amount: 20, currency: null });
  assert.equal(parsePrice([1, 2]), null);
});

test('toEgp multiplies by the rate and rounds up', () => {
  assert.equal(toEgp(45, { rate: 15 }), 675);
  assert.equal(toEgp(19.99, { rate: 15 }), 300);
  assert.equal(toEgp(45, { rate: 15, roundTo: 5 }), 675);
  assert.equal(toEgp(45.1, { rate: 15, roundTo: 5 }), 680);
  assert.equal(toEgp(45.1, { rate: 15, roundTo: 10 }), 680);
  assert.equal(toEgp(0.1 + 0.2, { rate: 10 }), 3);
  assert.equal(toEgp(45, { rate: 0 }), null);
  assert.equal(toEgp(0, { rate: 15 }), null);
});
