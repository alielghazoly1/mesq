// utils/templateFixes.js
// إصلاحات عرض بتتحقن فوق تصاميم Tilda من غير ما نلمس ملفات views/*.html
// (الملفات دي مصدّرة من Tilda، وأي تعديل مباشر فيها بيضيع لو اتصدّرت تاني).
//
// المشكلة اللي بتتصلح هنا:
// خانة الوقت في "برنامج حفل الزفاف" عرضها ثابت 75px وخطها 30px، والوقت
// بالعربي ("5:00 مساءً") أعرض من كده — فكان بينزل سطرين ويطبع فوق اسم
// الفقرة اللي تحته (أو فوق الوقت اللي بعده). ظاهرة في التلات تصاميم.
// الحل: نمنع الالتفاف، فالوقت يفضل سطر واحد ويتمدد على الجانبين (النص
// متوسّط أصلًا) بدل ما ينزل لتحت ويتداخل.

const TEMPLATE_FIX_SCRIPT = `
<script>
(function () {
  // أي عنصر نصه بيبدأ بوقت (5:00 ...) هو خانة وقت في جدول البرنامج
  var TIME_RE = /^\\s*\\d{1,2}:\\d{2}\\b/;

  function fixTimes() {
    var atoms = document.querySelectorAll('.tn-atom');
    for (var i = 0; i < atoms.length; i++) {
      var el = atoms[i];
      if (el.getAttribute('data-wda-time-fixed')) continue;
      var text = (el.textContent || '').trim();
      if (!TIME_RE.test(text)) continue;
      el.setAttribute('data-wda-time-fixed', '1');
      el.style.whiteSpace = 'nowrap';
      el.style.overflow = 'visible';
    }
  }

  // ===== الخريطة اللي بتتدفن تحت الرسمة =====
  // في قسم المكان، كل عناصر Tilda متظبط ليها z-index رقم (3 مثلاً) ما
  // عدا العنصر اللي بنحقن فيه الخريطة — طالع من التصدير بـ z-index:auto.
  // وكلهم position:absolute فوق بعض، فأي عنصر برقم بيتغطّى فوق الخريطة:
  // في قالب Viktor & Paula رسمة المبنى كانت مغطّية الخريطة بالكامل ومش
  // باين منها غير ركن صغير.
  // الحل: نرفع عنصر الخريطة فوق أعلى أخ ليه في نفس القسم.
  function fixMapLayer() {
    var maps = document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"]');
    for (var i = 0; i < maps.length; i++) {
      var host = maps[i].closest('[data-elem-id]');
      if (!host || host.getAttribute('data-wda-map-fixed')) continue;
      // الخريطة اللي اتنقلت تحت الصورة خلاص (Viktor & Paula) مبقاش لها
      // دعوة برفع الـ z-index — هي في مسارها الطبيعي مش فوق حاجة
      if (host.getAttribute('data-wda-map-relocated')) continue;
      var rec = host.closest('.t-rec');
      if (!rec) continue;

      var top = 0;
      var siblings = rec.querySelectorAll('[data-elem-id]');
      for (var j = 0; j < siblings.length; j++) {
        var z = parseInt(getComputedStyle(siblings[j]).zIndex, 10);
        if (!isNaN(z) && z > top) top = z;
      }

      host.setAttribute('data-wda-map-fixed', '1');
      host.style.setProperty('z-index', String(top + 1), 'important');
      // ولو موقعه static لأي سبب، الـ z-index مش هيشتغل أصلاً
      if (getComputedStyle(host).position === 'static') {
        host.style.setProperty('position', 'relative', 'important');
      }
    }
  }

  // ===== خريطة Viktor & Paula كانت طايحة فوق صورة اللوكشن =====
  // في قسم "Location" التصميم حاطط الخريطة (iframe) والصورة فوق بعض في
  // نفس المكان بالظبط داخل لوحة Tilda المطلقة (t396)، فالخريطة كانت
  // مدفونة تحت الصورة ومش باينة. رفع الـ z-index بيخليها فوق الصورة —
  // بس ساعتها بتغطّيها. اللي العميل عايزه: الخريطة **تحت** الصورة في
  // مساحة مرتّبة لوحدها.
  //
  // الحل: بنطلّع عنصر الخريطة برّه اللوحة المطلقة ونحطه في شريط عادي
  // (flow) وسط الصفحة تحت اللوحة مباشرة، ونكبّر الـ iframe شوية. كده
  // الصورة بتبان كاملة والخريطة تحتها منسّقة. بيتنادى في المحرر والدعوة
  // المنشورة الاتنين، فالشكل واحد.
  function fixViktorMap() {
    var host = document.querySelector('[data-elem-id="1772899000001"]');
    if (!host || host.getAttribute('data-wda-map-relocated')) return;
    var t396 = host.closest('.t396');
    if (!t396 || !t396.parentNode) return;

    host.setAttribute('data-wda-map-relocated', '1');

    // بنشيل التموضع المطلق بتاع Tilda عن عنصر الخريطة عشان يمشي عادي
    host.style.setProperty('position', 'static', 'important');
    host.style.setProperty('top', 'auto', 'important');
    host.style.setProperty('left', 'auto', 'important');
    host.style.setProperty('right', 'auto', 'important');
    host.style.setProperty('bottom', 'auto', 'important');
    host.style.setProperty('width', '100%', 'important');
    host.style.setProperty('max-width', '480px', 'important');
    host.style.setProperty('height', 'auto', 'important');
    host.style.setProperty('margin', '0', 'important');
    host.style.setProperty('transform', 'none', 'important');

    // شريط عادي وسط الصفحة تحت لوحة القسم مباشرة
    var strip = document.createElement('div');
    strip.className = 'wda-map-strip';
    strip.style.cssText = 'width:100%; box-sizing:border-box; display:flex;'
      + ' justify-content:center; padding:10px 16px 40px;';
    strip.appendChild(host);
    t396.parentNode.insertBefore(strip, t396.nextSibling);

    // نكبّر الـ iframe شوية ونظبّط شكله
    var frame = host.querySelector('iframe');
    if (frame) {
      frame.setAttribute('width', '100%');
      frame.setAttribute('height', '320');
      frame.style.width = '100%';
      frame.style.maxWidth = '480px';
      frame.style.height = '320px';
      frame.style.border = '0';
      frame.style.borderRadius = '14px';
      frame.style.boxShadow = '0 10px 30px -12px rgba(0,0,0,.35)';
    }
    // العمود اللي جوّه (الخريطة + رابط "Open in Google Maps") يتمدد
    // على عرض الشريط عشان يفضل متوسّط
    var col = host.querySelector('.tn-atom__html > div, .tn-atom > div');
    if (col) { col.style.width = '100%'; col.style.maxWidth = '480px'; }
  }

  // ===== قالب فيه زرار موسيقى شكلي من غير صوت =====
  // Royal Maroon اتعمل بزرار موسيقى "ديكوري" — مفيش عنصر <audio> ولا
  // تشغيل فعلي، فالأغنية اللي العميل بيختارها عمرها ما بتشتغل. بنحقن
  // عنصر صوت بمعرّف invitation-audio (اللي طبقة التخصيص بتحط فيه رابط
  // الأغنية) ونوصّل الزرار بيه — من غير ما نلمس ملف التصميم.
  function fixMissingAudio() {
    var btn = document.getElementById('musicBtn');
    if (!btn || btn.getAttribute('data-wda-audio-wired')) return;
    if (document.getElementById('invitation-audio')) return;   // فيه صوت خلاص
    btn.setAttribute('data-wda-audio-wired', '1');

    var audio = document.createElement('audio');
    audio.id = 'invitation-audio';
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';
    audio.appendChild(document.createElement('source'));
    document.body.appendChild(audio);

    function hasSrc() {
      return audio.currentSrc || audio.src
        || (audio.querySelector('source') && audio.querySelector('source').src);
    }
    function markBtn(on) {
      btn.classList.toggle('playing', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    function startMusic() {
      if (!hasSrc() || !audio.paused) return;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { /* المتصفح رفض التشغيل */ });
      markBtn(true);
    }

    // بنمسك ضغطة الزرار في مرحلة الالتقاط ونوقف انتشارها عشان زرار
    // التصميم الشكلي (اللي بيقلب كلاس بس) ما يتعارضش مع التشغيل الفعلي.
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!hasSrc()) return;   // العميل لسه ماختارش أغنية
      if (audio.paused) {
        startMusic();
      } else {
        audio.pause();
        markBtn(false);
      }
    }, true);

    // ===== الموسيقى تشتغل أول ما الضيف يفتح الدعوة =====
    // قوالب Tilda بتربط الأغنية بزرار الفتح (.popup-enter) فبتشتغل مع
    // الفتح على طول. Royal Maroon زرار فتحه منفصل (#openBtn) وكان مربوط
    // بزرار الموسيقى لوحده بس — فالضيف كان لازم يدوس زرار تاني عشان
    // يسمع، والعميل عايزها تشتغل أول ما يفتح زي باقي القوالب. ضغطة الفتح
    // نفسها تفاعُل مستخدم، فالمتصفح بيسمح بالتشغيل جواها. لو الضيف قفل
    // الموسيقى بعد كده بزرار الموسيقى، اختياره بيفضل (مش بنعيد تشغيلها).
    var openBtn = document.getElementById('openBtn');
    if (openBtn && !openBtn.getAttribute('data-wda-audio-open')) {
      openBtn.setAttribute('data-wda-audio-open', '1');
      openBtn.addEventListener('click', function () {
        // شوية تأخير عشان نضمن إن طبقة التخصيص خلّصت تحطّ رابط الأغنية
        setTimeout(startMusic, 0);
      });
    }
  }

  // ===== حركة الظهور اللي كانت واقفة في نصها =====
  // محرك الحركة بتاع Tilda بيشتغل على خطوتين: أول ما الصفحة تحمّل بيحط
  // كل عنصر في "حالة البداية" (النص نازل 30 بكسل تحت مكانه، والزخارف
  // بحجم 30% من حجمها)، وبعدين بيستنى حدث تمرير (scroll) عشان يكشف
  // اللي ظاهر في الشاشة ويشغّل حركته.
  //
  // المشكلة: الدعوة بتفتح على شاشة "اضغط للفتح"، والشاشة الأولى ورا
  // الغلاف — يعني محدش بيعمل scroll عليها أبدًا. فالمحرك بيفضل مستني
  // حدث عمره ما هييجي، وأول شاشة في الدعوة بتفضل متجمّدة في حالة
  // البداية: الكلام واقف 30 بكسل تحت مكانه الصح ومش بيتحرك، والورود
  // والزخارف بتبان صغيرة (30%) من غير ما تكبر.
  //
  // ده اللي كان العميل شايفه ومستغرب ليه الكلام "مش بيتحرك" في الوش.
  // الحل: نبعت للمحرك حدث التمرير اللي مستنيه بنفسنا. حدث تمرير مالوش
  // أي أثر جانبي على الصفحة: هي مش بتتحرك من مكانها، إحنا بس بنصحّي
  // المحرك.
  //
  // بس بشرطين مهمين:
  //
  // (١) مانبعتش الحدث إلا لما يكون فيه فعلاً عنصر متجمّد وظاهر. حالة
  //     البداية ليها شكل معروف: translate3d(0px, Npx, 0px) للنصوص،
  //     و scale(0.N) للزخارف. لو مفيش ولا عنصر كده، يبقى المحرك خلّص
  //     شغله ومفيش داعي نبعتله حاجة تاني.
  //
  // (٢) مانبعتوش أبدًا والعميل ماسك عنصر بيسحبه. مكتبة السحب بتسمع
  //     لأحداث التمرير، وأي حدث في نص السحبة بيلغيها — فالعميل يمسك
  //     الكلام ويسحبه وميحصلش حاجة. ده كان هيحوّل مشكلة لمشكلة تانية.
  var START_TRANSFORM = /translate3d\(0px,\s*[1-9][0-9]*(\.[0-9]+)?px,\s*0px\)|scale\(0?\.[0-9]+\)/;

  /**
   * فيه عنصر لسه واقف في حالة بداية الحركة؟
   *
   * ملحوظة مهمة: مبنسألش "وظاهر في الشاشة" بالقصد. وإحنا على شاشة
   * "اضغط للفتح"، الشاشة الأولى بتكون تحت الغلاف — يعني تحت حدود
   * الشاشة فنيًا. فلو اشترطنا إنها تكون ظاهرة، مكناش هننبّه المحرك
   * أبدًا في الوقت اللي هو محتاج التنبيه فيه بالظبط.
   */
  function hasFrozenElement() {
    var nodes = document.querySelectorAll('[data-elem-id]');
    for (var i = 0; i < nodes.length; i++) {
      if (START_TRANSFORM.test(nodes[i].style.transform || '')) return true;
    }
    return false;
  }

  function nudgeAnimations() {
    // العميل ماسك عنصر بيحرّكه — أي حدث تمرير دلوقتي هيلغي السحبة
    if (document.querySelector('.wda-dragging')) return;
    if (!hasFrozenElement()) return;
    // الاتنين مع بعض بالقصد: محرك Tilda بيراجع اللي ظاهر في الشاشة على
    // resize، والتمرير لوحده مش كفاية يصحّيه.
    try {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    } catch (e) {
      // متصفحات قديمة مش بتعرف constructor بتاع Event
      ['scroll', 'resize'].forEach(function (name) {
        var ev = document.createEvent('Event');
        ev.initEvent(name, true, true);
        window.dispatchEvent(ev);
      });
    }
  }

  // بنصحّي المحرك على مراحل: الحركة بتتسجّل بعد ما سكريبتات Tilda
  // تحمّل من الشبكة، فنبضة واحدة بدري ممكن تيجي قبلها.
  function nudgeSoon() {
    nudgeAnimations();
    setTimeout(nudgeAnimations, 120);
    setTimeout(nudgeAnimations, 600);
    setTimeout(nudgeAnimations, 1500);
  }

  // ضغطة فتح الغلاف بالتحديد — الشاشة اللي ورا الغلاف هي بالظبط اللي
  // كانت متجمّدة. بنسمع للضغطة على زرار الفتح نفسه، مش على أي ضغطة في
  // الصفحة، عشان مانتدخلش في تعامل العميل مع الدعوة بعد كده.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.popup-enter, #openBtn, #coverScreen, #coverCard')) nudgeSoon();
  }, true);

  // ===== Royal Maroon: مسافة بين الكروت الماروني المتلاصقة =====
  // كروت Royal (.dark-card) بتركب فوق بعض من غير فاصل رأسي؛ ولما العميل
  // يخفي قسم الألبوم اللي بين كارت الأسماء/التاريخ (#weddingInfoCard)
  // وكارت العدّ التنازلي (#receptionCard) الكارتين بيلزقوا في بعض. بنحط
  // مسافة فوق كارت الاستقبال. #receptionCard موجود في Royal Maroon بس،
  // فالقاعدة آمنة ومخصوصة له من غير ما نلمس ملف التصميم.
  function fixRoyalCardGap() {
    if (document.getElementById('wda-royal-gap')) return;
    if (!document.getElementById('receptionCard')) return;
    var st = document.createElement('style');
    st.id = 'wda-royal-gap';
    st.textContent = '#receptionCard{margin-top:28px;}';
    (document.head || document.documentElement).appendChild(st);
  }

  // ===== غلاف المظروف بالفيديو (Royal Maroon — الدعوات الجديدة بس) =====
  // الضيف بيشوف صورة مظروف مقفول، يدوس عليها فالفيديو يفتح المظروف،
  // وأول ما يخلص الدعوة تفتح عادي. كله بالحقن من غير لمس ملف التصميم.
  //
  // متحكم فيه بعلمين عشان **ما نعككش** الدعوات القديمة:
  //   (١) coverStyle === 'envelope' — بيتحط للدعوات الجديدة من Royal بس؛
  //       الدعوات القديمة المشاركة مالهاش القيمة دي فبتفضل بغلافها الأصلي.
  //   (٢) مش autoOpen — يعني بنتخطاه في المحرر (صاحب الدعوة بيعدّل المحتوى)؛
  //       بيبان في المعاينة/عند الضيف بس.
  function initEnvelopeCover() {
    var cfg = window.__INVITATION_CONFIG__ || {};
    if (cfg.coverStyle !== 'envelope') return;
    if (cfg.autoOpen) return;
    if (document.getElementById('wda-envelope')) return;
    var coverScreen = document.getElementById('coverScreen');
    var openBtn = document.getElementById('openBtn');
    if (!coverScreen || !openBtn) return;   // Royal Maroon بس

    var st = document.createElement('style');
    st.textContent =
      '#wda-envelope{position:fixed;inset:0;z-index:2000000;background:#3a0011;overflow:hidden;cursor:pointer;}'
      + '#wda-envelope .wda-env-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;}'
      + '#wda-envelope .wda-env-video{display:none;background:#3a0011;}'
      + '#wda-envelope .wda-env-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;'
      + 'color:rgba(255,238,222,.92);font-size:14px;letter-spacing:.5px;z-index:2;pointer-events:none;'
      + 'text-shadow:0 1px 8px rgba(0,0,0,.5);animation:wda-env-pulse 1.9s ease-in-out infinite;}'
      + '@keyframes wda-env-pulse{0%,100%{opacity:.5;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}'
      + '#wda-envelope.wda-env-fade{opacity:0;transition:opacity .6s ease;}';
    (document.head || document.documentElement).appendChild(st);

    var ov = document.createElement('div');
    ov.id = 'wda-envelope';

    var img = document.createElement('img');
    img.className = 'wda-env-media wda-env-img';
    img.alt = '';
    img.src = '/royal/envelope-cover.png';

    var video = document.createElement('video');
    video.className = 'wda-env-media wda-env-video';
    video.src = '/royal/envelope-open.mp4';
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    var hint = document.createElement('div');
    hint.className = 'wda-env-hint';
    hint.textContent = (cfg.language === 'en') ? 'Tap to open the invitation' : 'اضغط لفتح الدعوة';

    ov.appendChild(img);
    ov.appendChild(video);
    ov.appendChild(hint);
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';

    var started = false, finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      ov.classList.add('wda-env-fade');
      setTimeout(function () {
        try { video.pause(); } catch (e) { /* لا شيء */ }
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        // بنشغّل الفتح الأصلي (بيكشف محتوى الدعوة + بيشغّل الموسيقى عبر
        // ربط زرار الفتح في fixMissingAudio)
        openBtn.click();
      }, 600);
    }

    function start() {
      if (started) return;
      started = true;
      hint.style.display = 'none';
      video.style.display = 'block';
      // أمان: لو الفيديو ما رضيش يشتغل أو مفيش مدة، نفتح الدعوة على طول
      var fb = setTimeout(function () { if (!finished && video.paused) finish(); }, 1400);
      video.addEventListener('playing', function () { clearTimeout(fb); }, { once: true });
      var p = video.play();
      if (p && p.catch) p.catch(function () { clearTimeout(fb); finish(); });
    }

    ov.addEventListener('click', function () { if (!started) start(); });
    video.addEventListener('ended', finish);
    // دوسة على الفيديو وهو شغال = تخطي للدعوة على طول
    video.addEventListener('click', function (e) { e.stopPropagation(); if (started) finish(); });
  }

  // ===== قفل التعديل النصي على عناصر ديكورية في Royal Maroon =====
  // نقاط ألوان "قواعد اللباس" وزرار صندوق الهدية مالهمش نص يتكتب. بنعلّم
  // عليهم بـ data-wda-no-text، وسكريبت المحرر بيمنع فتح الكتابة على أي
  // عنصر عليه العلامة دي (في startWriting وفي شريط الأدوات). العلامة
  // بتتحط على العناصر دي بس، فمفيش أي تأثير على باقي القوالب أو العناصر.
  function lockDecorText() {
    var sel = '.dress-dot, .gift-box-btn';
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute('data-wda-no-text', '1');
    }
  }

  fixTimes();
  fixViktorMap(); fixMissingAudio();
  fixMapLayer(); fixRoyalCardGap(); initEnvelopeCover(); lockDecorText();
  document.addEventListener('DOMContentLoaded', function () { fixTimes(); fixViktorMap(); fixMissingAudio(); fixMapLayer(); fixRoyalCardGap(); initEnvelopeCover(); lockDecorText(); nudgeSoon(); });
  window.addEventListener('load', function () { fixTimes(); fixViktorMap(); fixMissingAudio(); fixMapLayer(); fixRoyalCardGap(); initEnvelopeCover(); lockDecorText(); nudgeSoon(); });

  // الأوقات بتتحقن من سكريبت التصميم نفسه بعد التحميل، فبنعيد المحاولة
  // شوية ثواني بدل ما نفترض إنها موجودة من أول لحظة.
  var tries = 0;
  var timer = setInterval(function () {
    fixTimes();
    fixViktorMap(); fixMissingAudio();
    fixMapLayer();
    if (++tries > 20) clearInterval(timer);
  }, 250);

  // عدّاد مستقل لتنبيه محرك الحركة. مستقل عن اللي فوق لأن توقيته مختلف:
  // محرك Tilda بيحمّل من شبكة برّه وبيحط حالة البداية بعد ثانية ونص
  // تقريبًا على نت كويس — وأكتر بكتير على نت بطيء. فبنفضل نحاول لعشر
  // ثواني، وبنقف أول ما مايبقاش فيه عنصر متجمّد (أو نخلص الوقت).
  var animTries = 0;
  var animTimer = setInterval(function () {
    nudgeAnimations();
    // خلصت الحركة؟ مفيش داعي نفضل شغالين
    if (animTries > 6 && !hasFrozenElement()) clearInterval(animTimer);
    if (++animTries > 40) clearInterval(animTimer);
  }, 250);
})();
</script>
`;

/**
 * بتحقن أي HTML إضافي قبل قفل الـ body.
 * @param {string} html
 * @param {string} extra
 * @returns {string}
 */
function injectBeforeBodyEnd(html, extra) {
  if (!extra) return html;
  const closingBody = html.lastIndexOf('</body>');
  if (closingBody === -1) return html + extra;
  return html.slice(0, closingBody) + extra + html.slice(closingBody);
}

/**
 * بتحقن إصلاحات العرض قبل قفل الـ body.
 * @param {string} html
 * @returns {string}
 */
function injectTemplateFixes(html) {
  return injectBeforeBodyEnd(html, TEMPLATE_FIX_SCRIPT);
}

module.exports = { injectTemplateFixes, injectBeforeBodyEnd };
