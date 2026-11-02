// دعوة Hossam & Sohila (Blossom Oud، إنجليزي — فندق طيبه روز) — بطلب المالك:
// الخريطة (iframe جوجل) مش بتحمّل عند ناس. الخريطة هي هي — نفس الشكل والمكان —
// اللي اتغيّر هو إمتى بتتحمّل:
// - القالب حاطط loading="lazy" على الـ iframe، والقالب نفسه بيحط اللينك بعد ما
//   تأجيل الخرايط (utils/templateFixes.js deferMaps) يكون عدّى. على الآيفون (سفاري
//   وأي برنامج جوه الآيفون زي إنستجرام وفيسبوك) ده كان بيخلي الخريطة تتحمّل مرتين:
//   مرة في الأول، وبعدين تترمي وتتحمّل من الصفر لما الضيف يقرب منها — فعلى نت
//   ضعيف كان بيوصل يلاقي الإطار فاضي.
// - دلوقتي بتتحمّل مرة واحدة في الخلفية بعد ما الصفحة تخلص تحميل (أو قبلها لو
//   الضيف قرّب منها، أو بعد 10 ثواني بالكتير)، فبتبقى جاهزة لما يوصل لها، ومن غير
//   ما تأخّر فتح الدعوة نفسها.
// للضيوف بس — المحرر زي ما هو. لو القالب اتغيّر ومالقيناش السطرين دول، الصفحة
// بتتعرض زي ما هي بالظبط.

const LINE = 'mapFrame.src = C.venueMapEmbedSrc;';
const FRAME = /<iframe id="venueMapFrame"[^>]*>/;

const LOADER = `<script id="km-map">
window.kmMap = function (f, src) {
  if (!f || !src) return;
  var started = false;
  function go() {
    if (started) return;
    started = true;
    if (f.getAttribute('src') !== src) f.setAttribute('src', src);
  }
  if (document.readyState === 'complete') setTimeout(go, 800);
  else window.addEventListener('load', function () { setTimeout(go, 800); });
  setTimeout(go, 10000);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { io.disconnect(); go(); }
    }, { rootMargin: '1500px' });
    io.observe(f);
  }
};
</script>`;

module.exports = {
  shortId: 'kMRoREK',

  // الشغل كله في transform (لازم render موجودة عشان transform تشتغل)
  render() {
    return {};
  },

  transform(html, { editMode } = {}) {
    if (editMode) return html;
    const tag = html.match(FRAME);
    if (!tag || html.split(LINE).length !== 2) return html;
    // من غير اللينك الافتراضي بتاع القالب ومن غير lazy، وعليها علامة إن تحميلها
    // متظبط عشان deferMaps مايلمسهاش
    const frame = tag[0]
      .replace(/\ssrc="[^"]*"/, '')
      .replace(/\sloading="lazy"/, '')
      .replace('<iframe ', '<iframe data-wda-map-deferred="1" ');
    return html
      .replace(FRAME, () => frame)
      .replace(LINE, () => 'if (window.kmMap) window.kmMap(mapFrame, C.venueMapEmbedSrc); else mapFrame.src = C.venueMapEmbedSrc;')
      .replace(/<\/head>/i, () => `${LOADER}</head>`);
  },
};
