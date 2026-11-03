'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readShareDocument } = require('../lib/sharepage');
const { resolveLink } = require('../lib/shein');

// The product onelink page as SHEIN served it to the owner's PC (Nov 2026),
// rebuilt from the /admin digest: title + og tags, hidden url/deeplink/onelink
// inputs, and the small script that opens the app or the web link.
const TITLE = 'كنزة رجالية سوداء وبيضاء مخططة بتباين، سحاب 1/4، ياقة واقفة، ستايل جامعي ريترو، قصة فضفاضة، بلوفر';
const IMAGE = 'https://img.ltwebstatic.com/v4/j/spmp/2026/10/28/25/1793172002a77dbb61cecee0fd241b7249a55600a8.jpg';
const PRODUCT_ONELINK = 'https://onelink.shein.com/59/6718cdkz1x06?shc=2_RsmvRAkFlGV';
const CART_ONELINK = 'https://onelink.shein.com/59/6718bc3djj3g?shc=2_RsmcDqBA4AI';

function onelinkPage({ code, url, deeplink, title = TITLE, image = IMAGE }) {
  return `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"/>
<title>${title}</title>
<meta property="al:ios:app_store_id" content="id878577184"/>
<meta property="al:ios:url" content="https://onelink.shein.com/59/${code}?forceRed=1"/>
<meta property="al:android:url" content="https://onelink.shein.com/59/${code}?forceRed=1"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="لقد اكتشفت منتجات رائعة على موقع شي إن، تعالوا وتحققوا منها!"/>
<meta property="og:image" content="${image}"/>
</head><body>
<input type="hidden" id="url" value="${url}"/>
<input type="hidden" id="deeplink" value="${deeplink}"/>
<input type="hidden" id="onelink" value="https://onelink.shein.com/59/${code}?forceRed=1"/>
<script>var url=document.getElementById("url").value,deeplink=document.getElementById("deeplink").value,onelink=document.getElementById("onelink").value;var userAgentStr=navigator.userAgent.toLowerCase();var ver=userAgentStr.match(/cpu iphone os (.*?) like mac os/);setTimeout(function(){setTimeout(function(){window.location.href=url},100);try{if(ver){var versionNum=ver[1].replace(/_/g,".");if(versionNum<17){window.location.href=url;return}}window.location.href=deeplink}catch(e){}},100);;</script>
</body></html>`;
}

const REAL_PRODUCT_PAGE = onelinkPage({
  code: '6718cdkz1x06',
  url: 'https://api-shein.shein.com/h5/sharejump/appjump?onelink=59/6718cdkz1x06&amp;requestId=olw-671cw93fj2u8&amp;shc=2_RsmvRAkFlGV&amp;link=RsmvRAkFlGV_8&amp;localcountry=SA&amp;url_from=GM74721330085',
  deeplink: 'sheinlink://applink/goods?data=%7B%22goods_id%22%3A%22551922648%22%2C%22url_from%22%3A%22GM74721330085%22%2C%22shc%22%3A%222_RsmvRAkFlGV%22%7D',
});

function router(routes, calls = []) {
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

test('the real product share page gives goods_id 551922648, Saudi site, title and image', () => {
  const doc = readShareDocument(REAL_PRODUCT_PAGE);
  assert.equal(doc.product.id, '551922648');
  assert.equal(doc.product.strong, true);
  assert.equal(doc.cart, null);
  assert.equal(doc.country, 'SA');
  assert.equal(doc.shc, '2_RsmvRAkFlGV');
  assert.equal(doc.title, TITLE);
  assert.equal(doc.image, IMAGE);
  assert.match(doc.follow[0], /^https:\/\/api-shein\.shein\.com\/h5\/sharejump\/appjump\?onelink=59\/6718cdkz1x06&requestId=/);
});

test('resolveLink reads the real product page in one request', async () => {
  const calls = [];
  const link = await resolveLink(PRODUCT_ONELINK, { fetchImpl: router([[PRODUCT_ONELINK, { body: REAL_PRODUCT_PAGE }]], calls) });
  assert.deepEqual(link, { kind: 'product', goodsId: '551922648', country: 'SA', name: TITLE, image: IMAGE });
  assert.equal(calls.length, 1);
});

test('a cart deeplink carrying group_id is read as a shared cart', async () => {
  const page = onelinkPage({
    code: '6718bc3djj3g',
    title: 'لقد وجدت بعض المنتجات الرائعة في شي إن!',
    url: 'https://api-shein.shein.com/h5/sharejump/appjump?onelink=59/6718bc3djj3g&amp;shc=2_RsmcDqBA4AI&amp;localcountry=SA',
    deeplink: `sheinlink://applink/cartShareLanding?data=${encodeURIComponent(JSON.stringify({ group_id: '876543210', shc: '2_RsmcDqBA4AI' }))}`,
  });
  const link = await resolveLink(CART_ONELINK, { fetchImpl: router([[CART_ONELINK, { body: page }]]) });
  assert.deepEqual(link, { kind: 'cart', groupId: '876543210', shc: '2_RsmcDqBA4AI', country: 'SA' });
});

test('when the page itself has no id, the web link (appjump) is followed like a browser would', async () => {
  const page = onelinkPage({
    code: '6718bc3djj3g',
    title: 'لقد وجدت بعض المنتجات الرائعة في شي إن!',
    url: 'https://api-shein.shein.com/h5/sharejump/appjump?onelink=59/6718bc3djj3g&amp;shc=2_RsmcDqBA4AI&amp;localcountry=SA',
    deeplink: 'sheinlink://applink/unknownpage?data=%7B%7D',
  });
  const calls = [];
  const link = await resolveLink(CART_ONELINK, {
    fetchImpl: router([
      [CART_ONELINK, { body: page }],
      ['https://api-shein.shein.com/h5/sharejump/appjump', { status: 302, headers: { location: 'https://m.shein.com/ar/cart/share/landing?group_id=876543210&local_country=SA&cart_share=1&shc=2_RsmcDqBA4AI' } }],
      ['https://m.shein.com/ar/cart/share/landing', { body: '<html></html>' }],
    ], calls),
  });
  assert.deepEqual(link, { kind: 'cart', groupId: '876543210', shc: '2_RsmcDqBA4AI', country: 'SA' });
  assert.equal(new URL(calls[1].url).searchParams.get('onelink'), '59/6718bc3djj3g', 'the &amp; in the page was decoded before following');
});

test('the forceRed link is followed when the web link leads nowhere', async () => {
  const page = onelinkPage({ code: 'abc123def456', url: 'https://www.shein.com/', deeplink: 'sheinlink://applink/home' });
  const link = await resolveLink('https://onelink.shein.com/59/abc123def456?shc=2_AbCdEfGh', {
    fetchImpl: router([
      ['https://onelink.shein.com/59/abc123def456?forceRed=1', { status: 302, headers: { location: 'https://m.shein.com/ar/Dress-p-98765432.html' } }],
      ['https://onelink.shein.com/59/abc123def456', { body: page }],
      ['https://m.shein.com/ar/Dress-p-98765432.html', { body: '<html></html>' }],
    ]),
  });
  assert.equal(link.kind, 'product');
  assert.equal(link.goodsId, '98765432');
  assert.equal(link.name, TITLE);
});

test('a cart page that also lists its items still reads as the cart', () => {
  const page = onelinkPage({
    code: 'cart00000001',
    url: 'https://api-shein.shein.com/h5/sharejump/appjump?onelink=59/cart00000001',
    deeplink: `sheinlink://applink/cart?data=${encodeURIComponent(JSON.stringify({ group_id: '876543210', items: [{ goods_id: '11111111' }, { goods_id: '22222222' }] }))}`,
  });
  const doc = readShareDocument(page);
  assert.equal(doc.cart.id, '876543210');
  assert.equal(doc.cart.strong, true);
  assert.equal(doc.product.strong, false);
});
