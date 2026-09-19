/* editor-runtime.js
 * بيشتغل جوه صفحة الدعوة نفسها (جوه الـ iframe) وقت التحرير بس.
 * السيرفر بيحقنه لصاحب الدعوة لوحده (utils/renderInvitation.js) — الضيف
 * عمره ما يحمّله.
 *
 * مسؤولياته:
 *   - يخلي النصوص قابلة للسحب (interact.js)
 *   - يخلي الصور قابلة للضغط عشان تتغير
 *   - يبلّغ الصفحة الأم (React) بأي تغيير عن طريق postMessage
 *   - يطبّق التغييرات فورًا قبل ما تتحفظ (معاينة لحظية)
 */
(function () {
  'use strict';

  var state = {
    offsets: {}, selected: null,
    // العنصر اللي بيتسحب دلوقتي. مش دايمًا هو اللي المتصفح سلّمه
    // لـ interact — بيتحدد من نقطة السحب بنفس منطق اختيار الضغطة،
    // عشان العنصر اللي تحت عنصر تاني يقدر يتحرك.
    dragEl: null,
    // { elemId: degrees } — زاوية ميل كل عنصر. في خاصية rotate
    // المستقلة مش جوه transform، عشان الميل والسحب يعيشوا مع بعض.
    rotations: {},
    // { elemId: factor } — معامل تكبير/تصغير كل عنصر (الصور بالذات).
    // في خاصية scale المستقلة، عشان تتعايش مع السحب والميل.
    scales: {},
    // { elemId: 'left'|'center'|'right' } — محاذاة النص جوه العنصر
    aligns: {},
    // التحرير (اختيار وكتابة) منفصل عن السحب: الباقة الأساسية عندها
    // التحرير من غير السحب
    editingOn: false, dragEnabled: false, imagesEnabled: false, colorsEnabled: false,
    // السحب اتسجّل في interact ولا لسه (مرة واحدة بس طول الجلسة)
    dragSetup: false,
    // { host, target, before } وقت ما العميل بيكتب جوه عنصر
    writing: null,
    // وقت آخر سحبة — عشان الضغطة اللي بعدها ماتفتحش الكتابة
    lastDragEnd: 0,
    // { elemId: { text, size } } زي ما التصميم طالع بالظبط — أساس
    // "رجوع للخلف": لما نلغي تعديل نص أو مقاس، بنرجّع من هنا
    originals: {},
    // شاشة الغلاف ظاهرة في وضع التحرير ولا مخفية
    coverVisible: false,
  };

  // ===== التواصل مع الصفحة الأم =====
  function send(type, payload) {
    parent.postMessage({ source: 'mithaq-editor', type: type, payload: payload || {} }, window.location.origin);
  }

  // ===== ستايل أدوات التحرير (بيتشال عند الحفظ النهائي) =====
  var style = document.createElement('style');
  style.textContent = [
    // الحدود بتبان عند المرور بالماوس بس. لو سيبناها ظاهرة على كل عنصر
    // طول الوقت، الدعوة بتبقى مليانة خطوط متقطعة والعميل مبيشوفش تصميمه.
    '.wda-editable{ outline:2px dashed transparent; outline-offset:3px; cursor:grab; transition:outline-color .12s, background .12s; }',
    '.wda-editable:hover{ outline-color:rgba(201,162,74,.9) !important; background:rgba(201,162,74,.07); }',
    '.wda-selected{ outline:2.5px solid #c9a24a !important; outline-offset:3px; background:rgba(201,162,74,.05); }',
    '.wda-dragging{ cursor:grabbing !important; opacity:.85; }',
    '.wda-img-editable{ outline:2px dashed transparent; outline-offset:3px; cursor:pointer; transition:outline-color .12s; }',
    '.wda-img-editable:hover{ outline-color:rgba(201,120,138,.9) !important; }',
    '.wda-badge{',
    '  position:fixed; inset-inline-start:50%; transform:translateX(-50%); top:12px; z-index:2147483646;',
    '  background:#08130f; color:#e6c684; font-family:system-ui,sans-serif; font-size:12.5px;',
    '  padding:8px 18px; border-radius:999px; border:1px solid rgba(230,198,132,.4);',
    '  pointer-events:none; white-space:nowrap;',
    '}',
    // ===== شريط الأيقونات اللي بيطلع فوق أي جزء يتضغط عليه =====
    '.wda-tools{',
    '  position:absolute; z-index:2147483647; display:flex; gap:4px; padding:4px;',
    '  background:#08130f; border:1px solid rgba(230,198,132,.45); border-radius:999px;',
    '  box-shadow:0 8px 24px -8px rgba(0,0,0,.6); transform:translate(-50%,-100%);',
    '  opacity:0; pointer-events:none; transition:opacity .12s ease;',
    '}',
    '.wda-tools.on{ opacity:1; pointer-events:auto; }',
    '.wda-tools button{',
    '  width:30px; height:30px; display:flex; align-items:center; justify-content:center;',
    '  border:0; border-radius:50%; background:transparent; color:#e6c684; cursor:pointer; padding:0;',
    '}',
    '.wda-tools button:hover{ background:rgba(230,198,132,.18); }',
    '.wda-tools button.danger{ color:#e88b7a; }',
    '.wda-tools button.danger:hover{ background:rgba(232,139,122,.18); }',
    '.wda-tools svg{ width:15px; height:15px; }',
    // العنصر وهو بيتكتب فيه
    '.wda-writing{',
    '  outline:2.5px solid #e6c684 !important; outline-offset:3px;',
    '  background:rgba(230,198,132,.10); cursor:text !important;',
    '  min-width:24px; white-space:pre-wrap;',
    '}',
    '.wda-hidden-el{ display:none !important; }',
    // شاشة الغلاف: عناصرها بتفضل مركونة فوق الدعوة (top:0, z-index:990)
    // حتى وهي مقفولة، فأي ضغطة في أول الصفحة كانت بتروحلها هي مش للكلام
    // اللي تحتها. بنشيلها خالص في وضع التحرير، ولها زرار مستقل تفتحه بيه
    // لما تحب تعدّل عليها هي نفسها.
    '.wda-cover-off{ display:none !important; }',
    // الخريطة المدمجة iframe جوه صفحة تانية — بتبلع أي ضغطة قبل ما
    // توصل للمحرر، فكان مستحيل تختارها. في وضع التحرير بنقفل التفاعل
    // معاها (مش محتاجه وإنت بتعدّل أصلاً) فالضغطة توصل لنا.
    '.wda-editable iframe, .wda-editable video{ pointer-events:none !important; }',
    // ===== مقابض تكبير/تصغير الصورة =====
    // أربع مربّعات في أركان الصورة المختارة. العميل بيسحب أي ركن
    // عشان يكبّر أو يصغّر الصورة براحته.
    '.wda-handle{',
    '  position:absolute; z-index:2147483646; width:18px; height:18px;',
    '  margin:-9px 0 0 -9px; border-radius:50%;',
    '  background:#08130f; border:2px solid #e6c684;',
    '  box-shadow:0 2px 8px -1px rgba(0,0,0,.5); opacity:0; pointer-events:none;',
    '  transition:opacity .12s ease; touch-action:none;',
    '}',
    '.wda-handle.on{ opacity:1; pointer-events:auto; }',
    '.wda-handle.nw{ cursor:nwse-resize; }',
    '.wda-handle.ne{ cursor:nesw-resize; }',
    '.wda-handle.sw{ cursor:nesw-resize; }',
    '.wda-handle.se{ cursor:nwse-resize; }',
  ].join('\n');
  document.head.appendChild(style);

  // أيقونات Lucide (نفس مكتبة أيقونات الموقع) — محطوطة كـ SVG جوّه
  // الملف لأن الصفحة دي تصميم Tilda عادي، مفيش React جواها تستورد منها،
  // و الـ CSP بتاعنا مبيسمحش بتحميل سكريبت من أي CDN.
  var ICON_PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
  var ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var ICON_IMAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
  var ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';
  var ICON_PALETTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';
  var ICON_RESIZE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>';
  var ICON_FORM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>';
  // أيقونات المحاذاة — بتتغيّر حسب المحاذاة الحالية
  var ICON_ALIGN = {
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="15" x2="3" y1="6" y2="6"/><line x1="17" x2="3" y1="12" y2="12"/><line x1="13" x2="3" y1="18" y2="18"/></svg>',
    center: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="17" x2="7" y1="18" y2="18"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="9" y1="6" y2="6"/><line x1="21" x2="7" y1="12" y2="12"/><line x1="21" x2="11" y1="18" y2="18"/></svg>',
  };

  var badge = document.createElement('div');
  badge.className = 'wda-badge';
  badge.textContent = 'وضع التحرير';
  document.body.appendChild(badge);

  function setBadge(text) {
    badge.textContent = text;
  }

  // ===== تصنيف العناصر =====
  /**
   * عنصر "حي" = التصميم بيعيد كتابة نصه لوحده (العداد التنازلي).
   * الكتابة جواه مستحيلة عمليًا: السكريبت بيمسح اللي تكتبه كل ثانية.
   * فبنسمح بتحريكه وتكبيره، بس مش بالكتابة فيه.
   */
  function isLiveElement(el) {
    if (['days', 'hours', 'minutes', 'seconds', 'countdown'].indexOf(el.id) !== -1) return true;
    // القالب الملكي بيعرض العد التنازلي في عنصر واحد اسمه countdown،
    // مش أربع خانات زي قوالب Tilda — من غير السطر ده كان بيتعامل معاه
    // كنص عادي، والعميل يكتب فيه والسكريبت يمسح كلامه بعد ثانية.
    if (el.classList && el.classList.contains('countdown')) return true;
    return !!el.querySelector('#days, #hours, #minutes, #seconds, #countdown');
  }

  /** عنصر الخريطة — ليه تحكّم خاص (لينك مكان) مش كتابة */
  function isMapElement(el) {
    if (el.querySelector('iframe[src*="google.com/maps"], iframe[src*="maps.google"]')) return true;
    if (el.querySelector('a[href*="google.com/maps"], a[href*="maps.app.goo.gl"]')) return true;
    // العنصر نفسه رابط خرائط (زي "افتح في خرائط جوجل" في dolce-vita)
    if (el.tagName === 'A') {
      var h = el.getAttribute('href') || '';
      return /google\.com\/maps|maps\.google|maps\.app\.goo\.gl/.test(h);
    }
    return false;
  }

  /** زرار تأكيد الحضور — بيفتح نموذج (بوب-أب). ليه أيقونة تعديل الفورم */
  function isRsvpEl(el) {
    if (!el) return false;
    if (el.querySelector && el.querySelector('a[href^="#popup"], a[href^="#form"]')) return true;
    var href = el.tagName === 'A' ? (el.getAttribute('href') || '') : '';
    return /^#(popup|form)/.test(href);
  }

  /**
   * عنصر "مركّب" = جوّه تركيب HTML مش نص عادي (canvas، أقسام، روابط…).
   *
   * ليه ده مهم جدًا: الكتابة عندنا بتحط textContent، وده بيمسح كل
   * العناصر اللي جوه. حتة "اخدش لتظهر التاريخ" مثلاً عنصر واحد جواه
   * <style> و<div> و<canvas> — أول ما تكتب فيه، الخدش بيختفي خالص
   * والكلام بيرجع لخط النظام الوحش. ونفس الحكاية مع قسم RSVP والخريطة.
   *
   * القاعدة: <br> بس مسموح (سطور في فقرة عادية)، أي عنصر تاني معناه
   * إن ده تركيب — بيتحرك ويتكبّر، بس مبيتكتبش فيه.
   */
  function isRichElement(el) {
    var target = textTarget(el);
    var kids = target.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].tagName !== 'BR') return true;
    }
    return false;
  }

  /**
   * عنصر لون خالص: مربّع/دايرة ملوّنة من غير نص ولا صورة — زي مربعات
   * الزي المقترح (Dress Code).
   *
   * ليه محتاج حالة خاصة: كل باقي الكود بيدوّر على نص أو صورة، والعناصر
   * دي مالهاش لا ده ولا ده — فكانت بتتستبعد خالص والعميل مش قادر
   * يضغط عليها ولا يغيّر لونها، مع إنها أكتر حاجة بيحب يظبطها على
   * ألوان فرحه.
   */
  function isColorSwatch(el) {
    // فيه كلام؟ يبقى نص مش مربع لون
    if ((el.textContent || '').trim()) return false;
    // فيه صورة أو رسمة أو فيديو أو خريطة؟ مش مربع لون
    if (el.querySelector('img, svg, video, iframe')) return false;
    if (el.querySelector('[data-elem-id]')) return false;

    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (w < 8 || h < 8) return false;
    // الحد الأعلى بيمنع إن الخلفيات الكبيرة والأغطية الملوّنة تتحسب
    // مربعات ألوان
    if (w > 260 || h > 260) return false;

    // ===== اللون على العنصر الجوّاني مش على الأب =====
    // ده كان بيخلي مربعات "Color palette" في تصاميم Tilda مش قابلة
    // للضغط خالص: المربع عندهم عنصر أب جوّاه .tn-atom، واللون متحط
    // على الجوّاني. الدالة دي كانت بتشوف الأب بس — ولقت خلفيته شفافة
    // فقالت "مش مربع لون"، وكمان كانت بترفض أي عنصر ليه ابن أصلاً.
    // فالعميل يضغط على اللون ومفيش أي رد فعل.
    var atom = el.querySelector('.tn-atom') || el;
    var cs = getComputedStyle(atom);
    // خلفية صورة = صورة تتبدّل، مش لون يتغيّر
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return false;
    var bg = cs.backgroundColor;
    // خلفية شفافة = مش مربع لون
    return !!bg && bg !== 'transparent' && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(bg);
  }

  /**
   * فيه رسمة (svg) بمقاس محترم جواه؟
   * الرسمات مش عناصر HTML عادية فمالهاش offsetHeight — بنقيسها
   * بالمستطيل بتاعها. ده اللي بيخلي زرار زي صندوق الهدية (رسمة جوه
   * زرار، من غير نص ولا صورة) عنصر يتحدد ويتحرك ويتشال.
   */
  function hasIcon(el) {
    var svg = el.tagName === 'svg' ? el : el.querySelector('svg');
    if (!svg) return false;
    var r = svg.getBoundingClientRect();
    return r.height > 12 && r.width > 12;
  }

  /**
   * الصورة اللي جوه العنصر — سواء كانت وسم <img> أو خلفية CSS.
   *
   * ليه الجزء التاني ده مهم: نص صور بعض التصاميم مش وسوم <img> أصلاً،
   * دي خلفيات CSS (background-image). في قالب Dolce Vita لوحده فيه ٦
   * صور كده — منهم صورة كبيرة بارتفاع ٥١٧ بكسل وصور "قواعد اللباس".
   * المحرر كان بيدوّر على <img> وبس، فالصور دي مكانش ينفع تتغيّر
   * خالص والعميل بيضغط عليها ومفيش أي رد فعل.
   *
   * طبقة التطبيق (utils/customizations.js) كانت أصلاً بتعرف تحط صورة
   * في خلفية CSS — الناقص كان إن المحرر ياخد باله إنها موجودة.
   *
   * @returns {{el: Element, height: number}|null}
   */
  function imageInside(el) {
    var img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (img) return { el: img, height: img.offsetHeight };

    // خلفية CSS: بنقيس العنصر نفسه لأن الخلفية مالهاش مقاس خاص بيها
    var host = el.querySelector('.tn-atom') || el;
    var bg = '';
    try { bg = getComputedStyle(host).backgroundImage || ''; } catch (e) { return null; }
    // بنقبل الصور بس — التدرّجات اللونية (gradient) مش صور تتبدّل
    if (bg.indexOf('url(') !== 0) return null;
    return { el: host, height: host.offsetHeight };
  }

  /** رابط الصورة — من وسم <img> أو من خلفية CSS */
  function imageSrcOf(node) {
    if (!node) return '';
    if (node.tagName === 'IMG') {
      // data-original الأول: Tilda بتحمّل صورها كسول، فبتحط في src
      // صورة **فاضية** فعلاً (رابط فيه /-/empty/) لحد ما الصورة الحقيقية
      // تيجي، وبتسيب الرابط الحقيقي في data-original. لو قرينا src
      // هنطلع للعميل مصغّرات بيضا فاضية في شبكة الصور — وده اللي كان
      // بيحصل. وبعد ما العميل يغيّر صورة، بنكتب الاتنين بنفس الرابط،
      // فالترتيب ده بيفضل صح.
      return node.getAttribute('data-original') || node.currentSrc || node.src || '';
    }
    var bg = '';
    try { bg = getComputedStyle(node).backgroundImage || ''; } catch (e) { return ''; }
    var m = bg.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : '';
  }

  function elementKind(el) {
    if (isMapElement(el)) return 'map';
    if (isLiveElement(el)) return 'live';
    // الفيديو (خلفية أول سيكشن) — ينفع يتبدّل بصورة
    if (el.querySelector('video')) return 'video';
    // مربع اللون الأول: عنصر ملوّن من غير صورة ولا نص (مربعات الزي
    // المقترح). لازم يتفحص قبل الصورة عشان مايتلغبطش مع خلفية CSS.
    if (isColorSwatch(el)) return 'color';
    var pic = imageInside(el);
    // الحد 12 مش 40: الزخارف الصغيرة (16px) كانت مستبعدة خالص
    if (pic && pic.height > 12) return 'image';
    if (isRichElement(el)) return 'rich';
    return 'text';
  }

  /** rgb(...) → #rrggbb — منتقي اللون في المتصفح بيقبل hex بس */
  function rgbToHex(value) {
    var m = String(value || '').match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '';
    return '#' + [m[1], m[2], m[3]].map(function (n) {
      return ('0' + parseInt(n, 10).toString(16)).slice(-2);
    }).join('');
  }

  /** مساحة العنصر — بنستخدمها نختار الأصغر (الأكثر تحديدًا) عند الضغط */
  function areaOf(el) {
    var r = el.getBoundingClientRect();
    return r.width * r.height;
  }

  /**
   * كل العناصر اللي ينفع تتحرك وتتكبّر: نصوص وصور وخرايط وعدادات.
   * قبل كده كانت النصوص بس، فنص عناصر التصميم (الصور خصوصًا) مكانتش
   * بتتحرك من مكانها خالص.
   */
  function movableElements() {
    var out = [];
    var nodes = document.querySelectorAll('[data-elem-id]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest('.wda-badge') || el.closest('.wda-tools')) continue;
      if (el.classList.contains('wda-hidden-el')) continue;
      if (!el.offsetHeight) continue;
      // بناخد أصغر عنصر عشان مانسحبش أقسام كاملة بالغلط
      if (el.querySelector('[data-elem-id]')) continue;
      var text = (el.innerText || '').trim();
      var pic = imageInside(el);
      var video = el.querySelector('video');
      // لازم يكون فيه نص أو صورة أو فيديو أو رسمة — العناصر الفاضية
      // مالهاش لازمة. الفيديو كان مستبعد خالص قبل كده (مالوش نص ولا
      // img)، عشان كده خلفية أول سيكشن مكانش ينفع يتعمل فيها أي حاجة.
      // والرسمات (svg) كانت مستبعدة كمان — وعشان كده زرار صندوق
      // الهدية مكانش بيتحدد بالمرة، هو رسمة جوه زرار من غير ولا كلمة.
      // الخريطة كمان: جواها iframe بس — مفيش نص ولا صورة ولا رسمة،
      // فكانت بتتستبعد والعميل مش قادر يضغط عليها يغيّر المكان
      if (!text && !video && !(pic && pic.height > 12)
        && !isColorSwatch(el) && !hasIcon(el) && !isMapElement(el)) continue;
      if (text.length > 600) continue;
      out.push(el);
    }
    return out;
  }

  /** اللي ينفع تكتب فيه بس — من غير العدادات والخرايط والصور */
  function editableTextElements() {
    return movableElements().filter(function (el) {
      return elementKind(el) === 'text';
    });
  }

  function editableImages() {
    var out = [];
    var nodes = document.querySelectorAll('[data-elem-id]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (isColorSwatch(el)) continue;   // مربع لون مش صورة
      var pic = imageInside(el);
      // الحد نزل من 40 لـ 24: صور زي شعار "Group_23" (90×32) كانت
      // بتتستبعد بسبب الرقم ده وبس، والعميل مش قادر يغيّرها
      if (pic && pic.height > 24) out.push(el);
    }
    return out;
  }

  // هوية العنصر للتخصيص: data-wda-uid لو موجود (للعناصر اللي معرّفها
  // كان متكرر واتميّز)، وإلا data-elem-id. **مهم**: مبنعيدش تسمية
  // data-elem-id نفسه أبدًا، لأن Tilda بتحدّد مكان العناصر بـ CSS
  // (‎[data-elem-id="X"]) — تغييره كان بيخلي العنصر يفقد مكانه ويروح
  // على الشمال.
  function elemId(el) {
    return el.getAttribute('data-wda-uid') || el.getAttribute('data-elem-id');
  }

  // بندوّر بالهوية دي: الأول بـ data-wda-uid، وإلا data-elem-id بشرط
  // إنه **مش** متميّز (عشان المعرّف المتكرر ما يرجعش يطابق أول نسخة).
  function byUid(id) {
    if (id == null || id === '') return null;
    return document.querySelector('[data-wda-uid="' + id + '"]')
      || document.querySelector('[data-elem-id="' + id + '"]:not([data-wda-uid])');
  }

  function currentOffset(el) {
    var id = elemId(el);
    return state.offsets[id] || { dx: 0, dy: 0 };
  }

  // الإزاحة بتتطبّق بنفس دالة الدعوة المنشورة بالظبط.
  // ملحوظة: قفل الـ transition بقى وقت السحب بس (dragStart/dragEnd)، مش
  // دايمًا. قبل كده كان بيفضل مقفول، فالعنصر اللي اتسحب كان بيفقد حركة
  // ظهوره في المحرر بس وبيرجّعها في الدعوة المنشورة — فرق تاني بين
  // اللي العميل بيشوفه واللي بينشره.
  function applyOffset(el, dx, dy) {
    var s = shared();
    if (s) { s.setOffset(el, dx, dy); return; }
    // خاصية translate المستقلة مش transform — عشان متتخانقش مع حركة
    // ظهور Tilda (اللي بتستخدم transform) فالمكان يثبت بعد المعاينة
    el.style.translate = dx + 'px ' + dy + 'px';
  }

  function clearOffset(el) {
    var s = shared();
    if (s) { s.clearOffset(el); return; }
    el.style.removeProperty('translate');
  }

  /** زاوية الميل الحالية بالدرجات — من التخصيص أو من التصميم نفسه */
  function currentRotation(el) {
    var id = elemId(el);
    if (id && typeof state.rotations[id] === 'number') return state.rotations[id];
    var css = getComputedStyle(el).rotate;   // "none" أو "12deg"
    var m = String(css || '').match(/(-?[\d.]+)deg/);
    return m ? Math.round(parseFloat(m[1]) * 10) / 10 : 0;
  }

  function applyRotation(el, deg) {
    var s = shared();
    if (s) { s.setRotation(el, deg); return; }
    el.style.setProperty('rotate', deg + 'deg', 'important');
  }

  function clearRotation(el) {
    var s = shared();
    if (s) { s.clearRotation(el); return; }
    el.style.removeProperty('rotate');
  }

  /** معامل التكبير الحالي — من التخصيص أو من التصميم نفسه (الافتراضي 1) */
  function currentScale(el) {
    var id = elemId(el);
    if (id && typeof state.scales[id] === 'number') return state.scales[id];
    var css = getComputedStyle(el).scale;   // "none" أو "1.4" أو "1.4 1.4"
    var m = String(css || '').match(/-?[\d.]+/);
    return m ? Math.round(parseFloat(m[0]) * 1000) / 1000 : 1;
  }

  function applyScale(el, factor) {
    var s = shared();
    if (s && s.setScale) { s.setScale(el, factor); return; }
    el.style.setProperty('scale', String(factor), 'important');
  }

  function clearScale(el) {
    var s = shared();
    if (s && s.clearScale) { s.clearScale(el); return; }
    el.style.removeProperty('scale');
  }

  /** المحاذاة الحالية للنص — من التخصيص أو من التصميم */
  function currentAlign(el) {
    var id = elemId(el);
    if (id && state.aligns[id]) return state.aligns[id];
    var ta = '';
    try { ta = getComputedStyle(textTarget(el)).textAlign || ''; } catch (e) { ta = ''; }
    if (ta === 'start') return 'right';   // RTL الافتراضي
    if (ta === 'end') return 'left';
    return (ta === 'left' || ta === 'right' || ta === 'center') ? ta : 'center';
  }

  function applyAlign(el, align) {
    var s = shared();
    if (s && s.setAlign) { s.setAlign(el, align); return; }
    textTarget(el).style.setProperty('text-align', align, 'important');
    el.style.setProperty('text-align', align, 'important');
  }

  // ===== السحب =====
  /**
   * بيعلّم النصوص الظاهرة دلوقتي. بينادى أكتر من مرة عن قصد: الدعوة بتفتح
   * على شاشة "اضغط للفتح" وكل المحتوى تحتها مخفي (ارتفاعه صفر)، فأول مسح
   * بيلاقي صفر عناصر. بنعيد المسح لما المستخدم يفتح الدعوة أو التصميم
   * يحقن عناصر جديدة.
   */
  function markText() {
    // ملحوظة مهمة: التعليم ده مربوط بـ editingOn مش بالسحب.
    // قبل كده كان مربوط بميزة "drag"، يعني عميل الباقة الأساسية (اللي
    // مافيهاش سحب) مكانش يقدر يعدّل ولا كلمة واحدة — التحرير كله كان
    // مقفول عليه بالغلط.
    if (!state.editingOn) return;
    // عنصر بقى مخفي (الغلاف اتقفل مثلًا) لازم يخرج من دايرة التحرير،
    // غير كده يفضل قابل للسحب وهو مش ظاهر أصلًا
    document.querySelectorAll('.wda-editable').forEach(function (el) {
      if (!el.offsetHeight) el.classList.remove('wda-editable');
    });
    // كل حاجة بتتحرك — مش النصوص بس. الصور كانت مستثناة خالص قبل كده،
    // وهي نص عناصر التصميم تقريبًا.
    movableElements().forEach(function (el) {
      el.setAttribute('data-wda-kind', elementKind(el));
      // بنحفظ النص والمقاس الأصليين أول مرة نشوف العنصر فيها — من
      // غيرهم "رجوع للخلف" مش هيعرف يرجّع العنصر لأصله لما نلغي تعديل.
      var oid = elemId(el);
      if (oid && !(oid in state.originals)) {
        var tg = textTarget(el);
        state.originals[oid] = {
          text: (tg.innerText || '').trim(),
          size: Math.round(parseFloat(getComputedStyle(tg).fontSize) || 0),
        };
      }
      if (el.classList.contains('wda-editable')) return;
      el.classList.add('wda-editable');
      // (الكلاس بيتشال ويترجع مع وضع المعاينة، فبنعلّم بسمة مستقلة عشان
      // مانركبش أكتر من مستمع على نفس العنصر)
    });
  }

  // ===== توجيه الضغطة =====
  // مستمع واحد على الصفحة كلها بدل مستمع على كل عنصر. السبب: في
  // التصاميم فيه صور خلفية كبيرة قاعدة فوق النصوص، فالضغطة كانت بتروح
  // للخلفية والنص اللي تحتها ميتحددش أبدًا (ده كان بيحصل في قسم الحدث
  // في قالب Viktor & Paula).
  // elementsFromPoint بترجّع كل العناصر تحت المؤشر مش الأعلى بس، فبنختار
  // منهم الأصغر مساحةً — وده دايمًا الأكثر تحديدًا (النص مش الخلفية).
  /**
   * العنصر اللي المستخدم قاصده فعلاً عند نقطة معيّنة.
   *
   * elementsFromPoint بترجّع كل العناصر تحت المؤشر مش الأعلى بس، فبنختار
   * منهم الأصغر مساحةً — وده دايمًا الأكثر تحديدًا (النص مش الخلفية).
   *
   * الترتيب: الصور آخر حاجة، وبعدين الأصغر مساحةً.
   *   - "الصور آخر حاجة" عشان النص اللي تحت صورة خلفية يتحدد هو مش
   *     الخلفية (قسم الحدث في Viktor & Paula).
   *   - "الأصغر" عشان لو اتنين نص فوق بعض، الأكثر تحديدًا يكسب.
   * من غير الشرط الأول، الرسمة اللي جنب الخريطة كانت بتكسبها لأنها
   * أصغر منها بشوية.
   */
  function editableAtPoint(x, y) {
    var stack = document.elementsFromPoint(x, y) || [];
    var found = [];
    for (var i = 0; i < stack.length; i++) {
      var cand = stack[i].closest ? stack[i].closest('.wda-editable') : null;
      if (cand && found.indexOf(cand) === -1) found.push(cand);
    }
    if (!found.length) return null;
    found.sort(function (a, b) {
      var ai = a.getAttribute('data-wda-kind') === 'image' ? 1 : 0;
      var bi = b.getAttribute('data-wda-kind') === 'image' ? 1 : 0;
      if (ai !== bi) return ai - bi;
      return areaOf(a) - areaOf(b);
    });
    return found[0];
  }

  // مستمع واحد على الصفحة كلها بدل مستمع على كل عنصر. السبب: في
  // التصاميم فيه صور خلفية كبيرة قاعدة فوق النصوص، فالضغطة كانت بتروح
  // للخلفية والنص اللي تحتها ميتحددش أبدًا.
  document.addEventListener('click', function (e) {
    if (!state.editingOn || !e.isTrusted) return;
    if (e.target.closest && e.target.closest('.wda-tools')) return;
    if (Date.now() - state.lastDragEnd < 250) return;

    // في وضع التحرير: أي رابط بيفتح نموذج/بوب-أب (زرار RSVP مثلاً هو
    // <a href="#popup:...">) متمنعش الضغطة إنها تفتح النموذج — عشان
    // العميل يقدر يختار الزرار ويعدّل كلامه بدل ما النموذج يفتح فوقه.
    var popupLink = e.target.closest && e.target.closest('a[href^="#popup"], a[href^="#form"]');
    if (popupLink) { e.preventDefault(); }

    var best = editableAtPoint(e.clientX, e.clientY);
    if (!best) { if (!state.writing) select(null); return; }

    if (state.writing && state.writing.host === best) return;
    e.preventDefault();
    e.stopPropagation();
    select(best);
    // الكتابة للنصوص العادية بس. العداد التصميم بيعيد كتابته كل ثانية،
    // والعناصر المركّبة (الخدش/RSVP/الخريطة) الكتابة بتدهس تركيبها،
    // والصور مالهاش نص — دول بيتحركوا ويتكبّروا من الشريط الجانبي.
    // زرار RSVP كمان: مبنفتحش كتابة عليه على طول عشان أيقونة تعديل
    // الفورم تبان في الشريط العائم بدل ما ندخل كتابة لحظيًا ونخبّيها.
    if (elementKind(best) === 'text' && !isRsvpEl(best)) startWriting(best);
  }, true);

  /** بيفتح التحرير (تعليم العناصر + الضغط عليها) — من غير سحب */
  function enableEditing() {
    if (state.editingOn) return;
    state.editingOn = true;
    markText();
    // النصوص اللي العميل ضافها بنفسه بتتحرّك في **أي** باقة — حتى
    // اللي مفيهاش ميزة السحب. السبب إن دول مش جزء من التصميم أصلاً
    // عشان نقول إن مكانهم "مظبوط"؛ العميل هو اللي عملهم، ومن غير ما
    // يقدر يحطهم في المكان اللي عايزه مالهمش أي لازمة — بيفضلوا
    // مكوّمين في نص الشاشة فوق بعض. السحب لعناصر التصميم نفسها هو
    // اللي فاضل ميزة باقة.
    setupDragging();
  }

  /** السحب لعناصر التصميم — ميزة باقة لوحدها، بتتفتح فوق التحرير */
  function enableDragging() {
    if (state.dragEnabled) return;
    enableEditing();
    state.dragEnabled = true;
    setupDragging();
  }

  /**
   * بيسجّل السحب مرة واحدة بس. الصلاحية بتتفحص وقت بداية كل سحبة
   * (جوه start) مش وقت التسجيل — عشان النص المضاف يتحرك دايمًا
   * وعناصر التصميم تتحرك حسب الباقة، من غير ما نسجّل مرتين على نفس
   * العنصر (وده كان هيخلي العنصر يتحرك ضعف المسافة).
   */
  function setupDragging() {
    if (state.dragSetup || typeof window.interact !== 'function') return;
    state.dragSetup = true;

    // interact بيشتغل بمُحدِّد CSS، فأي عنصر ياخد الكلاس بعدين بيبقى
    // قابل للسحب تلقائيًا من غير تسجيل جديد.
    //
    // ===== مهم: العنصر اللي بيتسحب مش دايمًا اللي المتصفح بيسلّمه =====
    // في تصاميم Tilda العناصر مركونة فوق بعض. مثلاً في Viktor & Paula
    // عنصر أسماء العروسين عرضه 560 بكسل، وعنصر "&" قاعد في نص المساحة
    // دي بالظبط. فلما العميل بيمسك الأسماء من نصها — وده المكان
    // الطبيعي اللي أي حد هيمسك منه — الضغطة بتروح لـ"&" والأسماء
    // مبتتحركش. من برّه الشكل إن "الكلام مش بيتحرك".
    //
    // اختيار الضغطة كان محلول عنده الموضوع ده (elementsFromPoint +
    // الأصغر مساحةً يكسب)، فالعميل كان يقدر يضغط ويكتب في الأسماء عادي
    // لكن مايقدرش يحرّكها. دلوقتي السحب بيستخدم نفس الاختيار بالظبط.
    window.interact('.wda-editable').draggable({
      inertia: false,
      autoScroll: true,
      listeners: {
        start: function (event) {
          // نقطة بداية السحبة هي اللي بتحدد العنصر المقصود
          var p = event.interaction && event.interaction.pointerCoords
            ? event.interaction.pointerCoords
            : null;
          var x = event.clientX0;
          var y = event.clientY0;
          if (!isFinite(x) || !isFinite(y)) {
            x = p ? p.client.x : event.clientX;
            y = p ? p.client.y : event.clientY;
          }
          var intended = (isFinite(x) && isFinite(y)) ? editableAtPoint(x, y) : null;
          var el = intended || event.target;

          // الصلاحية بتتفحص هنا: النص اللي العميل ضافه بنفسه بيتحرك
          // في أي باقة، وعناصر التصميم لازم يكون عنده ميزة السحب.
          if (!state.dragEnabled && !el.getAttribute('data-wda-added')) {
            if (event.interaction && event.interaction.stop) event.interaction.stop();
            return;
          }
          state.dragEl = el;

          state.dragEl.classList.add('wda-dragging');
          // قفل الحركة وقت السحب بس — عشان العنصر يمشي مع الإيد بالظبط
          state.dragEl.style.transition = 'none';
          // بنصوّر الأماكن قبل السحبة عشان "رجوع للخلف" يرجّع مكان
          // العنصر قبل ما تمسكه، مش بعد أول تحريكة
          state.offsetsBeforeDrag = JSON.parse(JSON.stringify(state.offsets));
          select(state.dragEl);
        },
        move: function (event) {
          // السحبة اتلغت في start (مفيش صلاحية) — مفيش حاجة تتحرك
          if (!state.dragEl) return;
          var el = state.dragEl;
          var o = currentOffset(el);
          var dx = o.dx + event.dx;
          var dy = o.dy + event.dy;
          state.offsets[elemId(el)] = { dx: dx, dy: dy };
          applyOffset(el, dx, dy);
          setBadge('تحريك: ' + Math.round(dx) + ' × ' + Math.round(dy));
        },
        end: function (event) {
          if (!state.dragEl) return;
          var el = state.dragEl;
          el.classList.remove('wda-dragging');
          // بنرجّع حركة التصميم زي ما هي — عشان العنصر في المحرر يفضل
          // مطابق لشكله في الدعوة المنشورة بعد ما السحبة تخلص
          el.style.removeProperty('transition');
          state.dragEl = null;
          // الضغطة اللي بتيجي بعد السحب على طول مالهاش لازمة — من غير
          // العلم ده كل سحبة كانت هتفتح الكتابة في آخرها
          state.lastDragEnd = Date.now();
          setBadge('وضع التحرير');
          send('offsets', { offsets: state.offsets, before: state.offsetsBeforeDrag });
          state.offsetsBeforeDrag = null;
        },
      },
    });
  }

  function disableDragging() {
    if (!state.dragEnabled) return;
    // بنقفل صلاحية سحب عناصر التصميم بس — التسجيل نفسه بيفضل شغّال
    // عشان النص اللي العميل ضافه يفضل يتحرك في أي باقة
    state.dragEnabled = false;
  }

  // ===== شريط الأيقونات =====
  var tools = document.createElement('div');
  tools.className = 'wda-tools';
  tools.innerHTML =
    '<button type="button" data-act="edit" title="عدّل النص">' + ICON_PENCIL + '</button>' +
    '<button type="button" data-act="delete" class="danger" title="احذف">' + ICON_TRASH + '</button>';
  document.body.appendChild(tools);

  // mousedown مش click: الضغط على الزرار وهو النص متفتوح للكتابة كان
  // بيشيل التركيز من العنصر الأول فيتقفل قبل ما الضغطة تتسجّل.
  tools.addEventListener('mousedown', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var act = btn.getAttribute('data-act');
    if (act === 'edit') startWriting(state.selected);
    else if (act === 'done') stopWriting(true);
    else if (act === 'delete') removeElement(state.selected);
    else if (act === 'image') send('pick-image', { id: elemId(state.selected) });
    else if (act === 'map') send('pick-map', { id: elemId(state.selected) });
    else if (act === 'color') openColorPicker(state.selected);
    else if (act === 'resize') send('pick-scale', { id: elemId(state.selected) });
    else if (act === 'rsvp') send('pick-rsvp', {});
    else if (act === 'align') cycleAlign(state.selected);
  });

  // بيدوّر محاذاة النص: يمين ← توسيط ← شمال ← يمين ...
  function cycleAlign(el) {
    if (!el) return;
    var order = ['right', 'center', 'left'];
    var cur = currentAlign(el);
    var next = order[(order.indexOf(cur) + 1) % order.length];
    state.aligns[elemId(el)] = next;
    applyAlign(el, next);
    showTools(el, state.writing ? 'writing' : 'idle');   // الأيقونة تتحدّث
    send('align-change', { id: elemId(el), align: next });
  }

  // ===== منتقي لون الخط (من زرار اللون على الشريط العائم) =====
  // منتقي المتصفح لازم يكون عنصر <input type="color"> حقيقي عشان يفتح
  // بضغطة المستخدم. بنخبّيه ونفتحه برمجيًا من زرار الشريط. اللون بيتطبّق
  // لحظيًا جوه الدعوة (نفس دالة الدعوة المنشورة) وبيتبعت للأم عشان يتحفظ.
  var colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.setAttribute('aria-hidden', 'true');
  colorInput.style.cssText = 'position:absolute; z-index:2147483646; width:1px; height:1px; '
    + 'opacity:0; border:0; padding:0; margin:0; pointer-events:none;';
  document.body.appendChild(colorInput);

  function openColorPicker(el) {
    if (!el) return;
    // بنركن المنتقي عند العنصر عشان نافذة المتصفح تفتح جنبه
    var r = el.getBoundingClientRect();
    colorInput.style.left = (r.left + window.scrollX + r.width / 2) + 'px';
    colorInput.style.top = (r.top + window.scrollY + r.height) + 'px';
    colorInput.value = currentColorOf(el) || '#333333';
    // showPicker أنضف (بيفتح النافذة جنب الحقل)، وبنرجع لـ click لو
    // المتصفح مش داعمه أو رفض الاستدعاء
    try {
      if (colorInput.showPicker) colorInput.showPicker();
      else colorInput.click();
    } catch (err) {
      colorInput.click();
    }
  }

  colorInput.addEventListener('input', function () {
    var el = state.selected;
    if (!el) return;
    var color = colorInput.value;
    setColorOn(el, color);               // معاينة لحظية بنفس دالة النشر
    // النص المضاف: نزامن لونه جوّه الـ item فورًا عشان إعادة البناء
    // ماترجّعوش للون القديم
    if (el.getAttribute('data-wda-added') && window.__wdaSetAdded) {
      window.__wdaSetAdded(elemId(el), { color: color });
    }
    send('color-change', {
      id: elemId(el), color: color, added: !!el.getAttribute('data-wda-added'),
    });
  });

  /** بيحط الشريط فوق العنصر ويبدّل أيقوناته حسب نوعه */
  function showTools(el, mode) {
    if (!el) { tools.classList.remove('on'); return; }
    var kind = el.getAttribute('data-wda-kind') || 'text';

    var first;
    if (mode === 'writing') {
      first = '<button type="button" data-act="done" title="خلصت">' + ICON_CHECK + '</button>';
    } else if (kind === 'image' || kind === 'video') {
      first = '<button type="button" data-act="image" title="'
        + (kind === 'video' ? 'حط صورة مكان الفيديو' : 'غيّر الصورة') + '">' + ICON_IMAGE + '</button>';
    } else if (kind === 'map') {
      first = '<button type="button" data-act="map" title="غيّر المكان">' + ICON_PIN + '</button>';
    } else if (kind === 'live' || kind === 'rich') {
      // العداد والعناصر المركّبة (الخدش، RSVP) بيتحركوا ويتكبّروا بس —
      // الكتابة جواهم بتدهس تركيبهم
      first = '';
    } else {
      first = '<button type="button" data-act="edit" title="عدّل النص">' + ICON_PENCIL + '</button>';
    }

    // عنصر ديكوري متعلّم عليه بقفل نصي (data-wda-no-text) — نشيل زرار
    // "عدّل النص" عشان محدش يقدر يكتب فيه بالغلط. محكوم بالسمة اللي
    // بتتحط على عناصر معيّنة بس (نقاط ألوان الزي، صندوق الهدية في Royal)،
    // فصفر تأثير على باقي القوالب.
    if (first.indexOf('data-act="edit"') !== -1
      && el.closest && el.closest('[data-wda-no-text]')) {
      first = '';
    }

    // زرار لون الخط: بيبان على النصوص (بما فيها النص اللي العميل ضافه).
    // النص المضاف بتاع العميل بيقدر يلوّنه دايمًا — هو كتبه بنفسه؛
    // ونصوص التصميم بتتلوّن لو باقته فيها ميزة الألوان. مش بيبان وإنت
    // بتكتب (mode=writing) ولا على الصور/الخرايط/العدادات.
    var isAdded = !!el.getAttribute('data-wda-added');
    var canColor = kind === 'text' && mode !== 'writing' && (isAdded || state.colorsEnabled);
    var colorBtn = canColor
      ? '<button type="button" data-act="color" title="غيّر لون الخط">' + ICON_PALETTE + '</button>'
      : '';

    // زرار محاذاة النص (شمال/توسيط/يمين) — بيبان على أي نص، متاح لكل
    // الباقات. بيدوّر بين التلات محاذاة، والأيقونة بتوري المحاذاة الحالية.
    var alignBtn = (kind === 'text' && mode !== 'writing')
      ? '<button type="button" data-act="align" title="محاذاة النص">'
        + (ICON_ALIGN[currentAlign(el)] || ICON_ALIGN.center) + '</button>'
      : '';

    // زرار تغيير حجم الصورة — بيبان على الصور والفيديو، متاح في أي باقة.
    // بيفتح تحكّم الحجم في الشريط الجانبي (وعلى الصورة نفسها مقابض الأركان).
    var resizeBtn = (kind === 'image' || kind === 'video')
      ? '<button type="button" data-act="resize" title="غيّر حجم الصورة">' + ICON_RESIZE + '</button>'
      : '';

    // زرار تعديل فورم تأكيد الحضور — بيبان على زرار RSVP (اللي بيفتح النموذج)
    var rsvpBtn = (mode !== 'writing' && isRsvpEl(el))
      ? '<button type="button" data-act="rsvp" title="عدّل فورم تأكيد الحضور">' + ICON_FORM + '</button>'
      : '';

    tools.innerHTML = first + resizeBtn + rsvpBtn + alignBtn + colorBtn
      + '<button type="button" data-act="delete" class="danger" title="احذف">' + ICON_TRASH + '</button>';

    var r = el.getBoundingClientRect();
    tools.style.left = (r.left + window.scrollX + r.width / 2) + 'px';
    tools.style.top = (r.top + window.scrollY - 8) + 'px';
    tools.classList.add('on');
  }

  function hideTools() { tools.classList.remove('on'); }

  // ===== مقابض تكبير/تصغير الصورة =====
  // أربع مقابض في أركان الصورة المختارة. العميل بيسحب أي ركن فالصورة
  // بتكبر أو تصغر من مركزها (خاصية scale المستقلة). متاحة في أي باقة.
  var HANDLE_CORNERS = ['nw', 'ne', 'sw', 'se'];
  var handles = HANDLE_CORNERS.map(function (corner) {
    var h = document.createElement('div');
    h.className = 'wda-handle ' + corner;
    h.setAttribute('data-corner', corner);
    document.body.appendChild(h);
    return h;
  });
  // الحالة وقت السحب: العنصر، المسافة من مركزه لنقطة الإمساك، والمعامل
  // اللي كان عليه قبل ما نبدأ
  var resizing = null;

  /** بيبان المقابض على الصورة المختارة ويركنها في أركانها */
  function showHandles(el) {
    if (!el) { hideHandles(); return; }
    var r = el.getBoundingClientRect();
    var x = r.left + window.scrollX;
    var y = r.top + window.scrollY;
    var pos = {
      nw: [x, y], ne: [x + r.width, y],
      sw: [x, y + r.height], se: [x + r.width, y + r.height],
    };
    handles.forEach(function (h) {
      var p = pos[h.getAttribute('data-corner')];
      h.style.left = p[0] + 'px';
      h.style.top = p[1] + 'px';
      h.classList.add('on');
    });
  }

  function hideHandles() {
    handles.forEach(function (h) { h.classList.remove('on'); });
  }

  /** العنصر ده مقاسه قابل للتكبير؟ (الصور والفيديو) */
  function isResizable(el) {
    if (!el) return false;
    var kind = el.getAttribute('data-wda-kind');
    return kind === 'image' || kind === 'video';
  }

  handles.forEach(function (h) {
    h.addEventListener('pointerdown', function (e) {
      var el = state.selected;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      if (state.writing) stopWriting(true);
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var startDist = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
      resizing = {
        el: el,
        startDist: startDist,
        startScale: currentScale(el),
        scaleBefore: JSON.parse(JSON.stringify(state.scales)),
      };
      try { h.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      setBadge('تكبير/تصغير الصورة');
    });

    h.addEventListener('pointermove', function (e) {
      if (!resizing) return;
      e.preventDefault();
      var r = resizing.el.getBoundingClientRect();
      // المركز بيتحرك مع scale، فبنحسبه من المكان الحالي — بس المسافة
      // النسبية هي اللي بتحدد المعامل الجديد نسبةً لبداية السحبة
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dist = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
      var factor = resizing.startScale * (dist / resizing.startDist);
      factor = Math.max(0.2, Math.min(5, Math.round(factor * 100) / 100));
      state.scales[elemId(resizing.el)] = factor;
      applyScale(resizing.el, factor);
      showHandles(resizing.el);
      if (tools.classList.contains('on')) showTools(resizing.el, 'idle');
      setBadge('تكبير: ' + Math.round(factor * 100) + '%');
    });

    function endResize(e) {
      if (!resizing) return;
      try { h.releasePointerCapture(e.pointerId); } catch (err) { /* */ }
      var el = resizing.el;
      var before = resizing.scaleBefore;
      resizing = null;
      setBadge('وضع التحرير');
      send('scale', { scales: state.scales, before: before });
    }
    h.addEventListener('pointerup', endResize);
    h.addEventListener('pointercancel', endResize);
  });

  // الشريط والمقابض بيفضلوا ملزوقين بالعنصر مع أي تمرير أو تغيير حجم
  window.addEventListener('scroll', function () {
    if (state.selected && tools.classList.contains('on')) {
      showTools(state.selected, state.writing ? 'writing' : 'idle');
    }
    if (state.selected && isResizable(state.selected)) showHandles(state.selected);
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (state.selected) showTools(state.selected, state.writing ? 'writing' : 'idle');
    if (state.selected && isResizable(state.selected)) showHandles(state.selected);
  });

  // ===== الكتابة جوه العنصر نفسه =====
  /**
   * أعمق عنصر شايل النص فعلاً.
   *
   * في تصاميم Tilda النص جوه .tn-atom، بس أحيانًا جواه غلاف تاني
   * (<div> أو <span> واحد شايل نفس النص). لو كتبنا على الغلاف الخارجي
   * بنمسح الداخلي بستايله — وده اللي كان بيخلي الخط يرجع وحش. فبننزل
   * لحد آخر عنصر نصه هو نفس النص كله.
   */
  // العقدة اللي شايلة النص فعليًا جوه العنصر.
  //
  // مهم: الدالة دي (وكل دوال التطبيق التانية) بقت جاية من طبقة
  // التخصيصات نفسها (utils/customizations.js عبر window.__wda) مش
  // متكتوبة هنا تاني. السبب مباشر: لما كان فيه نسختين، المحرر كان
  // بيكتب على عقدة والدعوة المنشورة بتكتب على عقدة تانية — فالعميل
  // يظبط دعوته في المسودة وينشرها ويلاقي الكلام اتلخبط. دلوقتي نسخة
  // واحدة بتخدم الاتنين، فمفيش مجال أصلاً إنهم يفرقوا.
  // النسخة المحلية تحت للأمان بس، لو السكريبت اتأخر لأي سبب.
  function shared() { return window.__wda || null; }

  function textTarget(el) {
    var s = shared();
    if (s) return s.textTarget(el);
    var node = el.querySelector('.tn-atom') || el;
    var guard = 0;
    while (guard++ < 6) {
      var kids = [];
      for (var i = 0; i < node.children.length; i++) {
        if (node.children[i].tagName !== 'BR') kids.push(node.children[i]);
      }
      if (kids.length !== 1) break;
      var only = kids[0];
      if ((only.textContent || '').trim() !== (node.textContent || '').trim()) break;
      node = only;
    }
    return node;
  }

  /**
   * بيحط نص في عنصر بأمان: textContent مش innerHTML أبدًا.
   * ولو النص فيه سطور، بنخلي العنصر يحترمها بـ pre-wrap بدل ما
   * نحقن <br> — كده مفيش أي طريق لـ HTML يدخل التصميم.
   * @param {Element} host العنصر اللي عليه data-elem-id (مش العقدة الجوانية)
   */
  function setTextOn(host, text) {
    var s = shared();
    if (s) { s.setText(host, text); return; }
    var target = textTarget(host);
    target.textContent = text;
    if (String(text).indexOf('\n') !== -1) target.style.whiteSpace = 'pre-wrap';
  }

  /** مقاس الخط — نفس دالة الدعوة المنشورة بالظبط */
  function setSizeOn(host, px) {
    var s = shared();
    if (s) { s.setSize(host, px); return; }
    textTarget(host).style.setProperty('font-size', px + 'px', 'important');
    host.style.setProperty('font-size', px + 'px', 'important');
  }

  function clearSizeOn(host) {
    var s = shared();
    if (s) { s.clearSize(host); return; }
    textTarget(host).style.removeProperty('font-size');
    host.style.removeProperty('font-size');
  }

  // العنصر اللي فيه كلام بياخد لون خط؛ المربع الفاضي بياخد لون خلفية.
  // نفس قرار الدعوة المنشورة بالظبط (utils/customizations.js).
  function isSwatchEl(host) {
    return !(host.textContent || '').trim();
  }

  function setColorOn(host, color) {
    var s = shared();
    if (s) { s.setColor(host, color); return; }
    var target = isSwatchEl(host) ? (host.querySelector('.tn-atom') || host) : textTarget(host);
    var prop = isSwatchEl(host) ? 'background-color' : 'color';
    target.style.setProperty(prop, color, 'important');
    host.style.setProperty(prop, color, 'important');
  }

  function clearColorOn(host) {
    var s = shared();
    if (s) { s.clearColor(host); return; }
    [host.querySelector('.tn-atom') || host, textTarget(host), host].forEach(function (n) {
      if (!n) return;
      n.style.removeProperty('background-color');
      n.style.removeProperty('color');
    });
  }

  /** اللون الحالي للعنصر — لون الخط للكلام، ولون الخلفية للمربع */
  function currentColorOf(el) {
    var cs = getComputedStyle(isSwatchEl(el) ? (el.querySelector('.tn-atom') || el) : textTarget(el));
    return rgbToHex(isSwatchEl(el) ? cs.backgroundColor : cs.color);
  }

  function startWriting(el) {
    if (!el || state.writing) return;
    // عناصر متعلّم عليها إنها ديكورية (نقاط ألوان الزي، صندوق الهدية في
    // Royal Maroon) — التعديل النصي مقفول عليها. القفل محكوم بالسمة
    // data-wda-no-text اللي طبقة الإصلاحات بتحطها على عناصر معيّنة بس،
    // فمفيش أي تأثير على باقي القوالب أو باقي العناصر.
    if (el.closest && el.closest('[data-wda-no-text]')) return;
    var target = textTarget(el);
    state.writing = { host: el, target: target, before: (target.innerText || '').trim() };

    // العنصر لازم يخرج من دايرة السحب وهو بيتكتب، غير كده interact.js
    // هيخطف الماوس ومش هتقدر تحدد ولا تحط المؤشر في نص الكلام.
    el.classList.remove('wda-editable');
    el.classList.add('wda-writing');

    // plaintext-only بيمنع لصق HTML منسّق جوه التصميم؛ ولو المتصفح
    // مش داعمه بنرجع لـ true ونعقّم اللصق بإيدنا تحت.
    try { target.contentEditable = 'plaintext-only'; } catch (err) { target.contentEditable = 'true'; }
    if (target.contentEditable !== 'plaintext-only') target.contentEditable = 'true';

    target.focus();
    var range = document.createRange();
    range.selectNodeContents(target);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    target.addEventListener('keydown', onWriteKey);
    target.addEventListener('paste', onWritePaste);
    target.addEventListener('blur', onWriteBlur);

    setBadge('اكتب... واضغط Enter لما تخلص');
    showTools(el, 'writing');
  }

  function onWriteKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); stopWriting(true); }
    if (e.key === 'Escape') { e.preventDefault(); stopWriting(false); }
  }

  // Ctrl+Z / Ctrl+Shift+Z وإنت واقف جوه الدعوة.
  // لازم يتمسك هنا ويتبعت للصفحة الأم: التركيز بيكون جوه الـ iframe،
  // فالاختصار عمره ما هيوصل لمستمع الصفحة الأم لوحده.
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || String(e.key).toLowerCase() !== 'z') return;
    e.preventDefault();
    if (state.writing) stopWriting(true);
    send('history', { redo: !!e.shiftKey });
  }, true);

  /** اللصق بيتحوّل لنص خام دايمًا — مفيش أي وسوم بتدخل التصميم */
  function onWritePaste(e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, String(text || '').replace(/\s+/g, ' '));
  }

  function onWriteBlur() { stopWriting(true); }

  function stopWriting(save) {
    var w = state.writing;
    if (!w) return;
    state.writing = null;

    w.target.removeEventListener('keydown', onWriteKey);
    w.target.removeEventListener('paste', onWritePaste);
    w.target.removeEventListener('blur', onWriteBlur);
    w.target.contentEditable = 'false';
    w.host.classList.remove('wda-writing');

    // بنلمّ المسافات الزيادة بس ونسيب السطور زي ما هي — الفقرات
    // اللي فيها <br> كانت بتتلم في سطر واحد ويضيع تنسيقها.
    var after = (w.target.innerText || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    // بنكتب على العنصر الأب (w.host) مش على w.target مباشرة: الدالة
    // المشتركة هي اللي بتقرر العقدة الجوانية الصح — نفس القرار اللي
    // بتاخده الدعوة المنشورة بالظبط، فالنتيجة واحدة في الحالتين.
    if (!save || !after) {
      setTextOn(w.host, w.before); // إلغاء أو نص فاضي = رجوع للأصل
    } else if (after !== w.before) {
      setTextOn(w.host, after);
      send('text-change', { id: elemId(w.host), oldText: w.before, newText: after });
    }

    // النص اللي العميل ضافه بنفسه: نزامن نصه جوّه طبقة التخصيص فورًا.
    // من غير ده، أول إعادة تطبيق بعد ما يخلّص (والمراقب بيتنده مع أي
    // تغيير في الصفحة) كانت بتدهس كلامه وترجّع النص القديم — وده اللي
    // كان مخلّي الكتابة في النص المضاف "مش بتحصل".
    if (w.host.getAttribute('data-wda-added') && window.__wdaSetAdded) {
      window.__wdaSetAdded(elemId(w.host), { text: (!save || !after) ? w.before : after });
    }

    if (state.editingOn) w.host.classList.add('wda-editable');
    setBadge('وضع التحرير');
    showTools(w.host, 'idle');
  }

  // ===== الحذف =====
  function removeElement(el) {
    if (!el) return;
    if (state.writing) stopWriting(false);
    el.classList.add('wda-hidden-el');
    hideTools();
    state.selected = null;
    send('hide', { id: elemId(el) });
    setBadge('اتحذف — تقدر ترجّعه من الشريط الجانبي');
    setTimeout(function () { setBadge('وضع التحرير'); }, 2600);
  }

  // ===== الاختيار =====
  function select(el) {
    if (state.writing && state.writing.host !== el) stopWriting(true);
    if (state.selected) state.selected.classList.remove('wda-selected');
    state.selected = el;
    if (el) {
      el.classList.add('wda-selected');
      showTools(el, 'idle');
      // مقابض التكبير بتبان على الصور والفيديو بس
      if (isResizable(el)) showHandles(el); else hideHandles();
      var target = textTarget(el);
      send('selected', {
        id: elemId(el),
        kind: el.getAttribute('data-wda-kind') || 'text',
        text: (el.innerText || '').trim().slice(0, 120),
        // المقاس الحالي فعليًا زي ما المتصفح بيرسمه — عشان السلايدر
        // يبدأ من مكان صح مش من رقم مفترض
        fontSize: Math.round(parseFloat(getComputedStyle(target).fontSize) || 0),
        isImage: !!el.getAttribute('data-wda-img'),
        // اللون الحالي بصيغة hex — عشان منتقي اللون يبدأ من اللون
        // اللي قدام العميل فعلاً (لون الخط للكلام، الخلفية للمربع)
        bgColor: currentColorOf(el),
        // زاوية الميل الحالية — عشان السلايدر يبدأ من مكانه الصح
        rotation: currentRotation(el),
        // معامل التكبير الحالي — عشان زرار "رجّع المقاس" يعرف إذا اتغيّر
        scale: currentScale(el),
        // يوم في نتيجة الشهر؟ الشريط بيقول لصاحب الدعوة إنه اتعلّم
        calDay: Number(el.getAttribute('data-cal-day')) || 0,
      });
    } else {
      hideTools();
      hideHandles();
      send('selected', { id: null });
    }
  }

  // (إلغاء الاختيار عند الضغط على فاضي بقى جوه موجّه الضغطة فوق)

  /**
   * بتحط صورة في عنصر — سواء كان صورة عادية أو خلفية أو **فيديو**.
   * الفيديو بيتخفي وبيتحط مكانه <img> بنفس المقاس (بنبنيه بـ
   * createElement مش innerHTML).
   */
  function applyImageTo(host, url) {
    var s = shared();
    if (s) { s.setImage(host, url); return; }
    var video = host.querySelector('video');
    if (video) {
      if (video.pause) video.pause();
      video.style.display = 'none';
      var shot = host.querySelector('[data-wda-video-img]');
      if (!shot) {
        shot = document.createElement('img');
        shot.setAttribute('data-wda-video-img', '1');
        shot.style.width = '100%';
        shot.style.height = '100%';
        shot.style.objectFit = 'cover';
        shot.style.display = 'block';
        video.parentNode.insertBefore(shot, video);
      }
      shot.src = url;
      return;
    }

    var img = host.tagName === 'IMG' ? host : host.querySelector('img');
    if (img) {
      img.setAttribute('data-original', url);
      img.src = url;
    }
    var bg = host.querySelector('.tn-atom') || host;
    if (bg && getComputedStyle(bg).backgroundImage !== 'none') {
      bg.style.backgroundImage = 'url("' + url + '")';
    }
  }

  // ===== الصور =====
  function markImages() {
    if (!state.imagesEnabled) return;
    document.querySelectorAll('.wda-img-editable').forEach(function (el) {
      if (!el.offsetHeight) el.classList.remove('wda-img-editable');
    });
    editableImages().forEach(function (el) {
      if (el.getAttribute('data-wda-img')) {
        el.classList.add('wda-img-editable');
        return;
      }
      // الاختيار نفسه بقى في markText (بيغطي كل الأنواع)، فهنا بنعلّم
      // الصورة بس عشان الشريط يعرف يعرض زرار تغيير الصورة
      el.setAttribute('data-wda-img', '1');
      el.classList.add('wda-img-editable');
    });
  }

  function enableImageEditing() {
    state.imagesEnabled = true;
    markImages();
  }

  function disableImageEditing() {
    state.imagesEnabled = false;
    document.querySelectorAll('[data-wda-img]').forEach(function (el) {
      el.classList.remove('wda-img-editable');
    });
  }

  // ===== شاشة الغلاف =====
  /**
   * سجل الغلاف = العنصر اللي جواه زرار الدخول (.popup-enter). التلات
   * تصاميم كلها بتستخدم نفس الكلاس ده، فمفيش داعي نعرف رقم كل سجل.
   */
  function coverRecord() {
    // قوالب Tilda: شاشة الغلاف جوه سجل .t-rec فيه .popup-enter
    var enter = document.querySelector('.popup-enter');
    if (enter) return enter.closest('.t-rec');
    // القوالب المكتوبة بإيدينا: شاشة الغلاف عنصر واحد بمعرّف معروف
    return document.getElementById('coverScreen');
  }

  function setCoverVisible(on) {
    var rec = coverRecord();
    if (!rec) return;
    state.coverVisible = !!on;
    rec.classList.toggle('wda-cover-off', !on);
    // بعض القوالب بتخفي غلافها بنفسها بـstyle مباشر وقت التحرير —
    // والـinline style بيغلب أي كلاس، فلازم نشيله عشان الزرار يرجّعه
    if (on) {
      rec.style.removeProperty('display');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // عناصر الغلاف بتدخل وتخرج من دايرة التحرير مع الزرار ده
    select(null);
    rescan();
    send('cover', { visible: state.coverVisible, exists: true });
  }

  // إعادة المسح: التصميم بيكشف عناصر بعد فتح الغلاف وبعد التمرير، فبنفضل
  // نراجع كل شوية بدل ما نفترض إن كل حاجة ظهرت من أول لحظة.
  var lastCounts = '';
  function rescan() {
    markText();
    markImages();
    // العدّاد بيتحدّث مع ظهور العناصر (صور Tilda بتتحمّل كسول)، فبنبلّغ
    // الشريط الجانبي بس لما الرقم يتغيّر فعلاً.
    var texts = document.querySelectorAll('.wda-editable').length;
    var imgs = document.querySelectorAll('.wda-img-editable').length;
    var photos = photoList();
    // البصمة فيها الصور كمان مش العدد بس: لو العميل غيّر صورة، العدد
    // مابيتغيّرش لكن الشبكة لازم تعرض الصورة الجديدة
    var key = texts + '/' + imgs + '/' + photos.map(function (p) {
      return p.id + (p.hidden ? 'h' : '') + String(p.src).slice(-16);
    }).join(',');
    if (key !== lastCounts) {
      lastCounts = key;
      send('ready', { textCount: texts, imageCount: imgs, photos: photos });
    }
  }

  // طبقة التخصيصات بتنادي دي أول ما تدّي معرّف لصورة مكانش ليها معرّف
  // (صور المعارض اللي بتتحمّل متأخر) — عشان تدخل دايرة التحرير على طول
  // بدل ما تفضل ظاهرة والعميل يضغط عليها ومفيش رد فعل.
  window.__wdaRescan = rescan;

  /**
   * كل صور الدعوة بترتيبها في الصفحة — الشريط الجانبي بيبني منها شبكة
   * مصغّرات مرقّمة.
   *
   * ليه: صور الألبوم في القالب الملكي بتبان واحدة واحدة في شريط متحرّك،
   * فالعميل كان لازم يستنى الصورة تيجي قدامه عشان يضغط عليها — وأصلاً
   * مش شايف إن فيه 8 صور. بالشبكة بيشوفهم كلهم مرة واحدة ومرقّمين،
   * ويغيّر أو يشيل أي واحدة من غير ما يلاحق الشريط.
   */
  function photoList() {
    var out = [];
    var nodes = document.querySelectorAll('[data-elem-id]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = elemId(el);
      if (!id || el.closest('.wda-tools')) continue;
      if (isColorSwatch(el)) continue;
      var pic = imageInside(el);
      if (!pic) continue;
      var isHidden = el.classList.contains('wda-hidden-el');
      // الصورة المشيلة ارتفاعها صفر، فبنعفيها من شرط المقاس — لازم
      // تفضل في الشبكة عشان العميل يقدر يرجّعها
      if (!isHidden && pic.height <= 24) continue;
      var r = el.getBoundingClientRect();
      out.push({
        id: id,
        src: imageSrcOf(pic.el),
        hidden: isHidden,
        // مكان الصورة في الصفحة — الترتيب بيمشي مع عين العميل
        top: Math.round(r.top + window.scrollY),
        // صور شريط الألبوم بنعلّمها عشان تتجمّع مع بعض في الأول
        group: el.classList.contains('slide') ? 'album' : '',
      });
    }
    out.sort(function (a, b) {
      if (a.group !== b.group) return a.group ? -1 : 1;
      return a.top - b.top;
    });
    return out.slice(0, 60);
  }

  document.addEventListener('click', function () { setTimeout(rescan, 400); }, true);
  window.addEventListener('scroll', function () { rescan(); }, { passive: true });
  setInterval(rescan, 1200);

  // ===== صوت واحد بس في نفس الوقت =====
  // الدعوة فيها موسيقاها، والشريط الجانبي فيه معاينة المكتبة ومشغّل
  // القص. الكل كان بيشتغل مع بعض ويطلع صوتين فوق بعض. بنبلّغ الصفحة
  // الأم أول ما أي صوت هنا يبدأ، وهي بتسكّت اللي عندها.
  document.addEventListener('play', function (e) {
    var el = e && e.target;
    if (!el || (el.tagName !== 'AUDIO' && el.tagName !== 'VIDEO')) return;
    // الفيديوهات الصامتة (خلفيات التصميم) مالهاش دعوة
    if (el.muted || el.volume === 0) return;
    send('audio-playing', {});
    // ولو فيه صوت تاني هنا نفسه شغال، بنوقفه
    var all = document.querySelectorAll('audio, video');
    for (var i = 0; i < all.length; i++) {
      if (all[i] !== el && !all[i].paused && !all[i].muted) {
        try { all[i].pause(); } catch (err) { /* */ }
      }
    }
  }, true);

  // ===== أوامر جاية من الصفحة الأم =====
  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;
    var msg = event.data || {};
    if (msg.source !== 'mithaq-shell') return;

    var p = msg.payload || {};

    // قايمة المحذوفات كاملة من الشريط الجانبي (بعد حذف أو استرجاع)
    if (msg.type === 'apply-hidden') {
      var hidden = p.hidden || [];
      document.querySelectorAll('.wda-hidden-el').forEach(function (el) {
        if (hidden.indexOf(el.getAttribute('data-elem-id')) === -1) {
          el.classList.remove('wda-hidden-el');
        }
      });
      hidden.forEach(function (hid) {
        var el = byUid(hid);
        if (el) el.classList.add('wda-hidden-el');
      });
      rescan();
    }

    // نص اتعدّل من بره (أو اترجّع) — بنطبّقه على العنصر
    if (msg.type === 'set-text' && p.id) {
      var host = byUid(p.id);
      if (host) setTextOn(host, p.text);
    }

    // حقل أساسي اتعدّل (اسم عروسة، قاعة...) وظاهر في أكتر من مكان —
    // بنحدّث باقي الأماكن اللي فيها نفس النص القديم **في مكانها** بدل
    // إعادة تحميل الصفحة كلها (العميل مكانش عايز ريلو مع كل تعديل).
    if (msg.type === 'propagate-text' && p.oldText) {
      var oldT = String(p.oldText).trim();
      var newT = String(p.newText == null ? '' : p.newText);
      if (oldT && oldT !== newT) {
        movableElements().forEach(function (el) {
          if (elementKind(el) !== 'text') return;
          if ((textTarget(el).innerText || '').trim() === oldT) setTextOn(el, newT);
        });
      }
    }

    if (msg.type === 'init') {
      state.offsets = p.offsets || {};
      // المقاسات المحفوظة بتتطبّق inline في وضع التحرير (زي الإزاحات)،
      // لأن قاعدة الـ CSS المحقونة بـ !important هتغلب على المعاينة
      // اللحظية وإنت بتحرّك السلايدر
      Object.keys(p.sizes || {}).forEach(function (sid) {
        var host = byUid(sid);
        if (!host) return;
        setSizeOn(host, p.sizes[sid]);
      });
      Object.keys(p.colors || {}).forEach(function (cid) {
        var host = byUid(cid);
        if (!host) return;
        setColorOn(host, p.colors[cid]);
      });
      (p.hidden || []).forEach(function (hid) {
        var el = byUid(hid);
        if (el) el.classList.add('wda-hidden-el');
      });
      // نطبّق الإزاحات المحفوظة على طول
      Object.keys(state.offsets).forEach(function (id) {
        var el = byUid(id);
        if (el) applyOffset(el, state.offsets[id].dx, state.offsets[id].dy);
      });
      // وزوايا الميل كمان (زي المقاسات: inline عشان السلايدر يقدر
      // يغيّرها لحظيًا من غير ما تغلبه قاعدة !important المحقونة)
      state.rotations = p.rotations || {};
      Object.keys(state.rotations).forEach(function (rid) {
        var el = byUid(rid);
        if (el) applyRotation(el, state.rotations[rid]);
      });
      // ومعاملات التكبير (زي الميل: inline عشان السحب يقدر يغيّرها
      // لحظيًا من غير ما تغلبه قاعدة !important المحقونة)
      state.scales = p.scales || {};
      Object.keys(state.scales).forEach(function (sid) {
        var el = byUid(sid);
        if (el) applyScale(el, state.scales[sid]);
      });
      state.aligns = p.aligns || {};
      Object.keys(state.aligns).forEach(function (aid) {
        var el = byUid(aid);
        if (el) applyAlign(el, state.aligns[aid]);
      });
      // النصوص المضافة بتتبني من سكريبت التخصيصات وقت التحميل —
      // هنا بنفتح التفاعل معاها عشان تتمسك وتتعدّل
      document.querySelectorAll('[data-wda-added]').forEach(function (el) {
        el.style.pointerEvents = 'auto';
      });

      // الغلاف بيتشال من الطريق أول ما المحرر يفتح
      var rec = coverRecord();
      if (rec) rec.classList.add('wda-cover-off');
      send('cover', { visible: false, exists: !!rec });

      // التحرير مفتوح لأي صاحب دعوة مميزة — حتى الباقة الأساسية.
      // السحب هو اللي ميزة باقة لوحدها.
      enableEditing();
      state.colorsEnabled = !!(p.features && p.features.indexOf('colors') !== -1);
      if (p.features && p.features.indexOf('drag') !== -1) enableDragging();
      if (p.features && p.features.indexOf('images') !== -1) enableImageEditing();
      send('caps', { canDrag: state.dragEnabled, canImages: state.imagesEnabled });
      rescan(); // بيبعت العدّاد بنفسه
    }

    if (msg.type === 'set-font') {
      var id = 'wda-live-font';
      var old = document.getElementById(id);
      if (old) old.remove();
      if (p.font) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + p.font.replace(/ /g, '+') + ':wght@400;700&display=swap';
        document.head.appendChild(link);
        var st = document.createElement('style');
        st.id = id;
        // السطر الأول لقوالب Tilda (كلاساتها)، والتاني للقوالب
        // المكتوبة بإيدينا اللي بتقرا خطوطها من متغيّرات CSS —
        // من غيره تغيير الخط مكانش بيعمل أي حاجة فيها
        st.textContent = ".t-text,.t-title,.t-descr,.t-name,.tn-atom,[data-wda-added],[data-wda-added] *{font-family:'" + p.font + "',sans-serif !important;}"
          + ":root{--serif-ar:'" + p.font + "',serif !important;--sans-ar:'" + p.font + "',sans-serif !important;}";
        document.head.appendChild(st);
      }
    }

    if (msg.type === 'set-image' && p.id && p.url) {
      var host = byUid(p.id);
      if (host) applyImageTo(host, p.url);
    }

    // معاينة لحظية للون (مربعات الزي المقترح، أو لون خط من الشريط الجانبي)
    if (msg.type === 'set-color' && p.id) {
      var cHost = byUid(p.id);
      if (cHost) {
        if (p.color) setColorOn(cHost, p.color);
        else clearColorOn(cHost);
        // النص المضاف: نزامن لونه جوّه الـ item عشان إعادة البناء
        // ماترجّعوش (اللون لو من الشريط الجانبي بيعدي من هنا)
        if (p.color && cHost.getAttribute('data-wda-added') && window.__wdaSetAdded) {
          window.__wdaSetAdded(p.id, { color: p.color });
        }
      }
    }

    if (msg.type === 'set-audio' && p.url) {
      var audio = document.getElementById('invitation-audio');
      if (audio) {
        var src = audio.querySelector('source');
        if (src) src.src = p.url;
        audio.src = p.url;
        audio.load();
      }
    }

    // الشريط الجانبي بيشغّل أغنية (معاينة أو قص) — بنسكّت اللي جوه
    // الدعوة عشان مايبقاش فيه صوتين مع بعض
    if (msg.type === 'pause-audio') {
      var all = document.querySelectorAll('audio, video');
      for (var ai = 0; ai < all.length; ai++) {
        try { if (!all[ai].paused) all[ai].pause(); } catch (e) { /* */ }
      }
    }

    if (msg.type === 'toggle-tools') {
      if (p.on) {
        enableEditing();
        enableImageEditing();
        badge.style.display = '';
      } else {
        // وضع المعاينة: كل أثر للتحرير بيختفي عشان يشوف شكل الضيف بالظبط
        if (state.writing) stopWriting(true);
        select(null);
        state.editingOn = false;
        disableDragging();
        disableImageEditing();
        document.querySelectorAll('.wda-editable').forEach(function (el) {
          el.classList.remove('wda-editable');
        });
        badge.style.display = 'none';
      }
    }

    // الشريط الجانبي بيحرّك بالأسهم بكسل بكسل — بيبعت الخريطة كاملة
    // وإحنا بنعيد تطبيقها (أرخص وأأمن من تتبع كل عنصر لوحده).
    if (msg.type === 'apply-offsets') {
      var incoming = p.offsets || {};
      Object.keys(state.offsets).forEach(function (oldId) {
        if (!incoming[oldId]) {
          var stale = byUid(oldId);
          if (stale) clearOffset(stale);
        }
      });
      state.offsets = incoming;
      Object.keys(incoming).forEach(function (oid) {
        var el = byUid(oid);
        if (el) applyOffset(el, incoming[oid].dx, incoming[oid].dy);
      });
    }

    if (msg.type === 'toggle-cover') setCoverVisible(!!p.on);

    // ===== النصوص المضافة =====
    // البناء نفسه بيتم بنفس الدالة اللي الضيف بيشوف بيها الدعوة
    // (utils/customizations.js بيعرّضها على window) — مصدر واحد، فاللي
    // بتشوفه وإنت بتعدّل هو اللي هيتشاف بالظبط.
    if (msg.type === 'apply-added') {
      if (typeof window.__wdaApplyAdded === 'function') {
        window.__wdaApplyAdded(p.added || []);
        // في وضع التحرير لازم تتمسك وتتضغط
        document.querySelectorAll('[data-wda-added]').forEach(function (el) {
          el.style.pointerEvents = 'auto';
        });
        rescan();
      }
    }

    // إضافة نص جديد: بيتحط في نص الشاشة الحالية عشان يبان قدام العميل
    // على طول من غير ما يدوّر عليه
    if (msg.type === 'add-text') {
      var docW = document.documentElement.scrollWidth || window.innerWidth;

      // كل نص جديد بينزل تحت اللي قبله بشوية.
      //
      // ليه: قبل كده كل نص مضاف كان بينزل في نص الشاشة بالظبط — نفس
      // المكان بالمليمتر. فالعميل يضيف كلمة، يضيف التانية، يلاقيهم
      // مركبين فوق بعض وقارياهم مع بعض كأنهم كلمة واحدة متلخبطة. ومن
      // غير ميزة السحب مكانش قادر يفصلهم أصلاً.
      // ===== بنربط النص الجديد بالقسم اللي قدام العميل =====
      // النص المضاف كان بيتعلّق على بكسل مطلق في الصفحة، فأول ما تختلف
      // الأقسام بين المحرر والمعاينة (الغلاف، الحركات، الصور الكسولة)
      // كان بيطير لمكان تاني. دلوقتي بنلاقي القسم (.t-rec) اللي في نص
      // الشاشة ونربط النص بيه بإزاحة **جواه** — فيفضل مكانه بالظبط في
      // التعديل والمعاينة والنشر.
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var stack = document.elementsFromPoint(cx, cy) || [];
      var rec = null;
      for (var si = 0; si < stack.length; si++) {
        // .t-rec لقوالب Tilda، <section> للقوالب المكتوبة بإيدينا
        var cand = stack[si].closest
          ? stack[si].closest('.t-rec, [data-record-type], section')
          : null;
        // نتجنب سجل الغلاف — النص لازم يروح لجسم الدعوة مش الغلاف
        if (cand && !cand.querySelector('.popup-enter')
          && cand.id !== 'coverScreen') { rec = cand; break; }
      }

      // مفتاح ثابت للقسم (من طبقة التخصيص) — بيشتغل حتى لو القسم مالوش id
      var anchorKey = (rec && typeof window.__wdaAnchorKey === 'function')
        ? window.__wdaAnchorKey(rec) : '';

      // مسافة بسيطة بين كل نص جديد والتاني عشان مايركبوش فوق بعض
      var taken = document.querySelectorAll('[data-wda-added]');
      var stagger = Math.min(taken.length, 8) * 34;

      var item = {
        id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: p.text || 'اكتب هنا',
        xPct: 50,
        size: 22,
        color: '#333333',
        align: 'center',
      };

      if (rec && anchorKey) {
        var rr = rec.getBoundingClientRect();
        item.anchor = anchorKey;
        // الإزاحة الرأسية جوه القسم = مكان نص الشاشة بالنسبة لأول القسم
        item.ay = Math.round((cy - rr.top) + stagger);
      } else {
        // مفيش قسم (نادر) — نرجع للبكسل المطلق زي الأول
        item.y = Math.round(window.scrollY + cy + stagger);
      }

      send('added-new', { item: item, docWidth: docW });
    }

    // ===== رجوع للخلف / إعادة =====
    // بتاخد نسخة كاملة من التخصيصات وتطبّقها على الدعوة مرة واحدة.
    // أي عنصر مش موجود في النسخة دي بيرجع لأصله من state.originals —
    // وده اللي بيخلي إلغاء تعديل نص أو مقاس يرجّع الشكل الأصلي فعلاً
    // بدل ما يسيبه على آخر قيمة.
    if (msg.type === 'restore') {
      var c = p.customizations || {};
      if (state.writing) stopWriting(false);

      // 1) النصوص
      var texts = c.texts || {};
      Object.keys(state.originals).forEach(function (oid) {
        var host = byUid(oid);
        if (!host) return;
        var want = (oid in texts) ? texts[oid] : state.originals[oid].text;
        if ((textTarget(host).innerText || '').trim() !== want) setTextOn(host, want);
      });

      // 2) المقاسات
      var sizes = c.sizes || {};
      Object.keys(state.originals).forEach(function (oid) {
        var host = byUid(oid);
        if (!host) return;
        if (oid in sizes) setSizeOn(host, sizes[oid]);
        else clearSizeOn(host);
      });

      // 3) الإزاحات
      Object.keys(state.offsets).forEach(function (oid) {
        if (!(c.offsets || {})[oid]) {
          var stale = byUid(oid);
          if (stale) clearOffset(stale);
        }
      });
      state.offsets = c.offsets || {};
      Object.keys(state.offsets).forEach(function (oid) {
        var el = byUid(oid);
        if (el) applyOffset(el, state.offsets[oid].dx, state.offsets[oid].dy);
      });

      // 4) المخفي
      var hidden = c.hidden || [];
      document.querySelectorAll('.wda-hidden-el').forEach(function (el) {
        if (hidden.indexOf(el.getAttribute('data-elem-id')) === -1) {
          el.classList.remove('wda-hidden-el');
        }
      });
      hidden.forEach(function (hid) {
        var el = byUid(hid);
        if (el) el.classList.add('wda-hidden-el');
      });

      // 5) الصور
      Object.keys(c.images || {}).forEach(function (iid) {
        var host = byUid(iid);
        if (host) applyImageTo(host, c.images[iid]);
      });

      // 6) الألوان
      Object.keys(state.originals).forEach(function (oid) {
        var h = byUid(oid);
        if (!h) return;
        var wantColor = (c.colors || {})[oid];
        if (wantColor) setColorOn(h, wantColor);
        else clearColorOn(h);
      });

      // 7) زوايا الميل
      Object.keys(state.rotations).forEach(function (rid) {
        if (!((c.rotations || {})[rid] !== undefined)) {
          var stale = byUid(rid);
          if (stale) clearRotation(stale);
        }
      });
      state.rotations = c.rotations || {};
      Object.keys(state.rotations).forEach(function (rid) {
        var el = byUid(rid);
        if (el) applyRotation(el, state.rotations[rid]);
      });

      // 7b) معاملات التكبير
      Object.keys(state.scales).forEach(function (sid) {
        if ((c.scales || {})[sid] === undefined) {
          var stale = byUid(sid);
          if (stale) clearScale(stale);
        }
      });
      state.scales = c.scales || {};
      Object.keys(state.scales).forEach(function (sid) {
        var el = byUid(sid);
        if (el) applyScale(el, state.scales[sid]);
      });
      // المحاذاة (رجوع للخلف)
      Object.keys(state.aligns).forEach(function (aid) {
        if (!((c.aligns || {})[aid])) {
          var stale = byUid(aid);
          if (stale) { var sh = shared(); if (sh && sh.clearAlign) sh.clearAlign(stale); }
        }
      });
      state.aligns = c.aligns || {};
      Object.keys(state.aligns).forEach(function (aid) {
        var el = byUid(aid);
        if (el) applyAlign(el, state.aligns[aid]);
      });

      // 8) اليوم المعلّم في نتيجة الشهر
      if (c.calDay) {
        var wanted = document.querySelector('.cal-day[data-cal-day="' + c.calDay + '"]');
        if (wanted) {
          document.querySelectorAll('.cal-day.today').forEach(function (x) {
            x.classList.remove('today');
          });
          wanted.classList.add('today');
        }
      }

      // 9) النصوص المضافة (إضافة أو حذف بيترجعوا من هنا)
      if (typeof window.__wdaApplyAdded === 'function') {
        window.__wdaApplyAdded(c.added || []);
        document.querySelectorAll('[data-wda-added]').forEach(function (el) {
          el.style.pointerEvents = 'auto';
        });
      }

      select(null);
      rescan();
    }

    // معاينة لحظية لمقاس الخط وإنت بتحرّك السلايدر
    if (msg.type === 'set-size' && p.id) {
      var sHost = byUid(p.id);
      if (sHost) {
        if (p.size) setSizeOn(sHost, p.size);
        // فاضي = رجّعه لمقاس التصميم الأصلي
        else clearSizeOn(sHost);
        // النص المضاف: نزامن مقاسه جوّه الـ item فورًا عشان إعادة البناء
        // ماترجّعوش لمقاسه القديم
        if (p.size && sHost.getAttribute('data-wda-added') && window.__wdaSetAdded) {
          window.__wdaSetAdded(p.id, { size: p.size });
        }
        if (state.selected === sHost) showTools(sHost, state.writing ? 'writing' : 'idle');
      }
    }

    // معاينة لحظية لزاوية الميل وإنت بتحرّك السلايدر
    if (msg.type === 'set-rotation' && p.id) {
      var rHost = byUid(p.id);
      if (rHost) {
        if (p.deg === null || p.deg === undefined || p.deg === '') {
          delete state.rotations[p.id];
          clearRotation(rHost);   // رجّعه لميل التصميم الأصلي
        } else {
          state.rotations[p.id] = Number(p.deg);
          applyRotation(rHost, Number(p.deg));
        }
        if (state.selected === rHost) showTools(rHost, state.writing ? 'writing' : 'idle');
      }
    }

    // معامل التكبير (بيتبعت من زرار "رجّع المقاس" في الشريط الجانبي)
    if (msg.type === 'set-scale' && p.id) {
      var scHost = byUid(p.id);
      if (scHost) {
        if (p.scale === null || p.scale === undefined || p.scale === '' || Number(p.scale) === 1) {
          delete state.scales[p.id];
          clearScale(scHost);   // رجّعه لمقاس الصورة الأصلي
        } else {
          state.scales[p.id] = Number(p.scale);
          applyScale(scHost, Number(p.scale));
        }
        if (state.selected === scHost) {
          showTools(scHost, state.writing ? 'writing' : 'idle');
          if (isResizable(scHost)) showHandles(scHost);
        }
      }
    }

    if (msg.type === 'reset-offsets') {
      Object.keys(state.offsets).forEach(function (oid) {
        var el = byUid(oid);
        if (el) clearOffset(el);
      });
      state.offsets = {};
      send('offsets', { offsets: {} });
    }
  });

  // ===== نتيجة الشهر: الضغط على الرقم بيعلّمه =====
  // العلامة بتتنقل فورًا في الدعوة، والشريط بيحفظها. الضغطة العادية
  // بتفضل شغالة كمان (العنصر بيتحدد زي أي عنصر تاني) — الاتنين مع بعض.
  document.addEventListener('click', function (e) {
    if (!state.editingOn || !e.isTrusted) return;
    var cell = e.target.closest && e.target.closest('.cal-day[data-cal-day]');
    if (!cell) return;
    var day = Number(cell.getAttribute('data-cal-day'));
    if (!day) return;
    document.querySelectorAll('.cal-day.today').forEach(function (c) {
      c.classList.remove('today');
    });
    cell.classList.add('today');
    send('cal-day', { day: day });
  }, true);

  // ===== التبليغ إن السكريبت جاهز =====
  // مانستناش حدث load: تصاميم Tilda بتفضل بتحمّل موارد خارجية (خطوط،
  // صور من الـ CDN) وممكن واحد منها يعلّق، فالحدث ميحصلش خالص والمحرر
  // يفضل ميت. بنبلّغ فورًا ونعيد التبليغ لحد ما الأم ترد بـ init.
  var announced = false;
  window.addEventListener('message', function (e) {
    var m = e.data || {};
    if (m.source === 'mithaq-shell' && m.type === 'init') announced = true;
  });

  var tries = 0;
  var announceTimer = setInterval(function () {
    if (announced || ++tries > 40) return clearInterval(announceTimer);
    send('loaded', {});
    return undefined;
  }, 500);
  send('loaded', {});
})();
