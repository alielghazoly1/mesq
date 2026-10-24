/*
 * شريط صغير فوق معاينة أي تصميم (/preview-sample/:id) — بطلب المالك:
 *   - زرار "رجوع": بيرجّع للمكان اللي فتح منه المعاينة بالظبط (الرئيسية على
 *     نفس الكارت). لو اللينك جاله من برّه (واتساب مثلًا) بيقول "كل التصاميم"
 *     ويوديه على التصميم ده في الرئيسية.
 *   - زرار مشاركة لينك التصميم.
 *
 * المعاينة بس — دعوات العملاء الحقيقية مابيتحطش فيها الملف ده خالص
 * (routes/invitations.js → utils/seo.js: applyPreviewMeta).
 * الشريط جوه Shadow DOM: تنسيقات التصميم (Tilda) مابتأثرش عليه، وهو
 * مابيأثرش على التصميم.
 */
(function () {
  if (window.top !== window) return; // جوه iframe (صور المعاينة/المحرر) — لأ
  var me = document.currentScript;
  var id = me && me.getAttribute('data-tpl');
  var name = (me && me.getAttribute('data-name')) || '';
  if (!id || /[?&]bare=1/.test(location.search)) return;

  var en = false;
  try { en = localStorage.getItem('wda_lang') === 'en'; } catch (e) { /* تصفح خاص */ }
  var T = en
    ? { back: 'Back', all: 'All designs', share: 'Share', wa: 'WhatsApp', copy: 'Copy link', copied: 'Link copied', text: 'Take a look at the ' + name + ' invitation design on Mithaq' }
    : { back: 'رجوع', all: 'كل التصاميم', share: 'مشاركة', wa: 'واتساب', copy: 'نسخ اللينك', copied: 'اتنسخ اللينك', text: 'شوف تصميم دعوة ' + name + ' على ميثاق' };

  // جه من الموقع؟ (الكارت بيكتب ده قبل ما يفتح المعاينة — lib/homeScroll.js)
  var from = null;
  try { from = JSON.parse(sessionStorage.getItem('mithaq:preview-from') || 'null'); } catch (e) { from = null; }
  var fromSite = !!(from && from.id === id && Date.now() - from.at < 30 * 60 * 1000 && history.length > 1);
  var home = '/#tpl-' + id;

  function goBack() {
    if (fromSite) {
      history.back();
      // لو الرجوع ماحصلش لأي سبب، نروح بنفسنا
      setTimeout(function () { location.href = home; }, 900);
    } else {
      location.href = home;
    }
  }

  var lm = location.search.match(/[?&]lang=(ar|en)\b/);
  var url = location.origin + '/preview-sample/' + id + (lm ? '?lang=' + lm[1] : '');
  var coarse = false;
  try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) { /* قديم */ }

  function copy(text, done) {
    var fallback = function () {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy'); ta.remove(); if (ok) done();
      } catch (e) { /* مفيش */ }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  var ICON_BACK = en
    ? '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>'
    : '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  var ICON_SHARE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
  var ICON_COPY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var ICON_OK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

  var CSS = ''
    + ':host{all:initial}'
    + '.bar{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);left:10px;z-index:2147483000;display:flex;gap:7px;align-items:center;'
    + 'font-family:Cairo,"Segoe UI",Tahoma,system-ui,sans-serif;direction:' + (en ? 'ltr' : 'rtl') + ';opacity:0;transform:translateY(-8px);transition:opacity .35s ease,transform .35s ease}'
    + '.bar.on{opacity:1;transform:none}'
    + 'button{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:38px;border-radius:999px;'
    + 'background:rgba(12,24,19,.72);color:#faf5ec;border:1px solid rgba(230,198,132,.38);-webkit-backdrop-filter:blur(10px) saturate(1.3);backdrop-filter:blur(10px) saturate(1.3);'
    + 'box-shadow:0 8px 22px -10px rgba(0,0,0,.55);font-size:13px;font-weight:700;line-height:1;-webkit-tap-highlight-color:transparent;transition:background .2s,transform .15s}'
    + 'button:hover{background:rgba(12,24,19,.86)}button:active{transform:scale(.96)}'
    + 'button:focus-visible{outline:2px solid #e6c684;outline-offset:2px}'
    + '.back{padding:0 14px 0 12px}.sh{width:38px;padding:0}'
    + '.menu{position:absolute;top:46px;left:0;min-width:168px;background:#fffdf8;border:1px solid rgba(15,29,24,.13);border-radius:16px;padding:6px;'
    + 'box-shadow:0 18px 40px -14px rgba(8,19,15,.45);display:none}'
    + '.menu.open{display:block}'
    + '.menu a,.menu .it{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border-radius:11px;color:#0f1d18;font-size:13px;font-weight:700}'
    + '.menu a:hover,.menu .it:hover{background:rgba(15,29,24,.06)}'
    + '.ic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px}'
    + '.wa .ic{background:rgba(37,211,102,.15);color:#1da851}.cp .ic{background:rgba(201,162,74,.16);color:#8a6a20}.cp.ok .ic{background:rgba(31,106,79,.15);color:#1f6a4f}'
    + '@media (max-width:360px){.back{padding:0 11px 0 9px;font-size:12.5px}}';

  function mount() {
    if (document.getElementById('mithaq-preview-bar')) return;
    var host = document.createElement('div');
    host.id = 'mithaq-preview-bar';
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    root.innerHTML = '<style>' + CSS + '</style>'
      + '<div class="bar" role="navigation" aria-label="Mithaq">'
      + '<button type="button" class="back" data-back>' + ICON_BACK + '<span>' + (fromSite ? T.back : T.all) + '</span></button>'
      + '<button type="button" class="sh" data-share aria-label="' + T.share + '" title="' + T.share + '">' + ICON_SHARE + '</button>'
      + '<div class="menu" role="menu">'
      + '<a class="wa" role="menuitem" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + encodeURIComponent(T.text + '\n' + url) + '"><span class="ic">' + ICON_WA + '</span>' + T.wa + '</a>'
      + '<button type="button" class="it cp" role="menuitem" data-copy><span class="ic">' + ICON_COPY + '</span><span>' + T.copy + '</span></button>'
      + '</div></div>';
    document.body.appendChild(host);

    var bar = root.querySelector('.bar');
    var menu = root.querySelector('.menu');
    var cp = root.querySelector('[data-copy]');
    // الأحداث مابتوصلش للتصميم (بعض التصاميم بتفتح الظرف بأي لمسة على الصفحة)
    ['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(function (ev) {
      bar.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    root.querySelector('[data-back]').addEventListener('click', goBack);
    root.querySelector('[data-share]').addEventListener('click', function () {
      if (coarse && navigator.share) {
        navigator.share({ title: name, text: T.text, url: url }).catch(function () { /* قفلها */ });
        return;
      }
      menu.classList.toggle('open');
    });
    menu.querySelector('a').addEventListener('click', function () { menu.classList.remove('open'); });
    cp.addEventListener('click', function () {
      copy(url, function () {
        cp.classList.add('ok');
        cp.querySelector('.ic').innerHTML = ICON_OK;
        cp.lastChild.textContent = T.copied;
        setTimeout(function () {
          menu.classList.remove('open'); cp.classList.remove('ok');
          cp.querySelector('.ic').innerHTML = ICON_COPY; cp.lastChild.textContent = T.copy;
        }, 1400);
      });
    });
    document.addEventListener('pointerdown', function (e) {
      var path = e.composedPath ? e.composedPath() : [];
      if (path.indexOf(host) === -1) menu.classList.remove('open');
    }, true);
    requestAnimationFrame(function () { setTimeout(function () { bar.classList.add('on'); }, 250); });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
