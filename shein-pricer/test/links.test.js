'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { extractUrls, parseSheinUrl, parseSheinHtml, isSheinUrl } = require('../lib/links');

// The two share messages exactly as the SHEIN app produced them (cart, then product).
const CART_SHARE_TEXT = `لقد وجدت بعض المنتجات الرائعة في شي إن!
هذه المنتجات في سلة التسوق رائعة. أوصي بها بشدة للجميع!
https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI`;
const PRODUCT_SHARE_TEXT = `كنزة رجالية سوداء وبيضاء مخططة بتباين، سحاب 1/4، ياقة واقفة، ستايل جامعي ريترو، قصة فضفاضة، بلوفر
لقد اكتشفت منتجات رائعة على موقع شي إن، تعالوا وتحققوا منها!
https://onelink.shein.com/59/6718cdkz1x06?shc=2_RsmvRAkFlGV`;

test('extractUrls pulls the link out of the SHEIN share messages', () => {
  assert.deepEqual(extractUrls(CART_SHARE_TEXT), ['https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI']);
  assert.deepEqual(extractUrls(`${CART_SHARE_TEXT}\n${PRODUCT_SHARE_TEXT}`), [
    'https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI',
    'https://onelink.shein.com/59/6718cdkz1x06?shc=2_RsmvRAkFlGV',
  ]);
});

test('extractUrls handles bare links, trailing punctuation, duplicates and RTL marks', () => {
  assert.deepEqual(extractUrls('شوف ده onelink.shein.com/59/abc123 بكام؟'), ['https://onelink.shein.com/59/abc123']);
  assert.deepEqual(extractUrls('(https://ar.shein.com/x-p-12345678.html)، و https://ar.shein.com/x-p-12345678.html.'), ['https://ar.shein.com/x-p-12345678.html']);
  assert.deepEqual(extractUrls('‏https://onelink.shein.com/59/abc‏'), ['https://onelink.shein.com/59/abc']);
  assert.deepEqual(extractUrls('مفيش لينك هنا'), []);
  assert.equal(extractUrls(Array.from({ length: 15 }, (_, i) => `https://onelink.shein.com/59/a${i}`).join(' '), 10).length, 10);
});

test('parseSheinUrl classifies onelink, product pages and shared carts', () => {
  assert.deepEqual(parseSheinUrl('https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI'), { kind: 'short', shc: '2_RsmcDqBA4AI' });
  assert.equal(parseSheinUrl('https://ar.shein.com/Men-Striped-Sweater-p-12345678.html?src=share').goodsId, '12345678');
  assert.equal(parseSheinUrl('https://ar.shein.com/Men-Striped-Sweater-p-12345678-cat-1727.html').goodsId, '12345678');
  assert.equal(parseSheinUrl('https://m.shein.com/ar/goods-p-98765432.html').kind, 'product');
  assert.equal(parseSheinUrl('https://ar.shein.com/x.html?goods_id=12345678').goodsId, '12345678');
  assert.equal(parseSheinUrl('https://api-shein.shein.com/h5/sharejump/appsharejump?share_type=goods&id=12345678&localcountry=SA').goodsId, '12345678');
  assert.deepEqual(
    parseSheinUrl('https://m.shein.com/ar/cart/share/landing?group_id=876543210&local_country=sa&cart_share=1&shc=2_RsmcDqBA4AI'),
    { kind: 'cart', groupId: '876543210', shc: '2_RsmcDqBA4AI', country: 'SA' },
  );
  assert.equal(parseSheinUrl('https://ar.shein.com/').kind, 'unknown');
});

test('parseSheinUrl and isSheinUrl reject look-alike hosts', () => {
  assert.equal(parseSheinUrl('https://shein.com.evil.example/x-p-12345678.html').kind, 'not_shein');
  assert.equal(parseSheinUrl('https://evil.example/?u=https://ar.shein.com/x-p-12345678.html').kind, 'not_shein');
  assert.equal(parseSheinUrl('https://notshein.com/x-p-12345678.html').kind, 'not_shein');
  assert.equal(isSheinUrl('ftp://ar.shein.com/x'), false);
  assert.equal(isSheinUrl('https://ar.shein.com/x'), true);
});

test('parseSheinHtml finds the cart group_id in shareInfo / deeplinks', () => {
  assert.equal(parseSheinHtml('<script>var shareInfo={"group_id":"876543210","shc":"2_RNBOXsQCBJ4"}</script>').groupId, '876543210');
  assert.equal(parseSheinHtml('<script>let deeplink = "/cart/share/landing?shc=2_RNBOXsQCBJ4&group_id=876543210";</script>').groupId, '876543210');
  assert.equal(parseSheinHtml('<script>let d = "/cart/share/landing?group_id%3D876543210%26shc%3D2_RNBOXsQCBJ4";</script>').groupId, '876543210');
  assert.equal(parseSheinHtml('<script>window.x = "{\\"shareInfo\\":{\\"groupId\\":\\"876543210\\"}}"</script>').groupId, '876543210');
  // a number called group_id on a page that has nothing to do with cart sharing is ignored
  assert.equal(parseSheinHtml('<script>{"group_id":"876543210"}</script>').groupId, undefined);
  assert.equal(parseSheinHtml('<script>shareInfo={"group_id":"invalid"}</script>').groupId, undefined);
  assert.equal(parseSheinHtml('<script>shareInfo={"group_id":"876543210999999999999999999"}</script>').groupId, undefined);
});

test('parseSheinHtml finds a product goods_id, the country and redirect hints', () => {
  assert.equal(parseSheinHtml('<meta property="og:url" content="https://ar.shein.com/Sweater-p-12345678.html">').goodsId, '12345678');
  assert.equal(parseSheinHtml('<script>var info = {"goods_id":"12345678","local_country":"SA"}</script>').goodsId, '12345678');
  assert.equal(parseSheinHtml('<script>var info = {"goods_id":"12345678","local_country":"SA"}</script>').country, 'SA');
  assert.equal(parseSheinHtml('<a href="sheinlink://x?share_type=goods&amp;id=12345678">').goodsId, '12345678');
  const hint = parseSheinHtml('<meta http-equiv="refresh" content="0;url=https://ar.shein.com/a-p-1.html?x=1&amp;y=2">');
  assert.deepEqual(hint.redirects, ['https://ar.shein.com/a-p-1.html?x=1&y=2']);
  assert.deepEqual(parseSheinHtml('').redirects, []);
});
