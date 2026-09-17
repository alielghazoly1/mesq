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

  fixTimes();
  fixMapLayer();
  document.addEventListener('DOMContentLoaded', function () { fixTimes(); fixMapLayer(); nudgeSoon(); });
  window.addEventListener('load', function () { fixTimes(); fixMapLayer(); nudgeSoon(); });

  // الأوقات بتتحقن من سكريبت التصميم نفسه بعد التحميل، فبنعيد المحاولة
  // شوية ثواني بدل ما نفترض إنها موجودة من أول لحظة.
  var tries = 0;
  var timer = setInterval(function () {
    fixTimes();
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
