// بيكسل ميتا في الصفحات اللي السيرفر بيرسمها لوحده (برا React).
// دلوقتي: صفحة معاينة التصميم /preview-sample/:id بس — PageView + ViewContent
// (الزائر فتح ديمو تصميم معيّن). صفحات دعوات العملاء (/i/…) مفيهاش بيكسل
// خالص: دول ضيوف الفرح مش زباين الموقع. باقي الأحداث في client/src/lib/metaPixel.js.
const PIXEL_ID = '1073401149053954';

function pixelHeadTag({ viewContent } = {}) {
  const vc = viewContent
    ? `fbq('track','ViewContent',${JSON.stringify({
      content_ids: [viewContent.id],
      content_name: viewContent.name || viewContent.id,
      content_type: 'product',
    }).replace(/</g, '\\u003c')});`
    : '';
  return `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');${vc}</script>`;
}

/** بيحط البيكسل قبل </head> */
function injectPixel(html, opts) {
  const tag = pixelHeadTag(opts);
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, () => `${tag}</head>`) : html + tag;
}

module.exports = { PIXEL_ID, injectPixel };
