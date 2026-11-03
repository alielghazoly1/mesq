// qosQhk1 — فرح عبدالشافي الغامدي (Champagne Lace عربي) بطلب المالك (2026-11-04):
// زرار "احفظ الموعد" (cd-cal) على الآيفون بيفتح تقويم أبل على طول بدل تنزيل ملف:
// - سفاري: بيفتح ملف الموعد من السيرفر (/i/qosQhk1/calendar.ics) → "إضافة إلى التقويم".
// - جوه إنستجرام/فيسبوك/كروم (متصفحات مابتفتحش ملفات التقويم): بنسلّم الملف لسفاري
//   (x-safari-https — آيفون iOS 17 وأحدث)، ولو مانفعش بتظهر جملة صغيرة تقول له
//   يفتح الدعوة في Safari.
// أندرويد والكمبيوتر: نفس التنزيل اللي كان، بس الملف من السيرفر — عنوانه "حفل زفاف
// عبدالشافي الغامدي" (ملف القالب كان "Wedding — Groom & Bride" من الأسامي الإنجليزي
// اللي فاضية) والساعة 6 مساءً زي ما هي مكتوبة في الدعوة.
// عنوان كارت المشاركة في utils/oneOffFixes.js (qosQhk1-share-title).
const SHORT = 'qosQhk1';

const SCRIPT = `<script id="qs-cal">(function () {
  var a = document.querySelector('#cd-countdown .cd-cal');
  if (!a) return;
  var url = location.origin + '/i/${SHORT}/calendar.ics';
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // أندرويد والكمبيوتر: نفس التنزيل (wedding.ics) بس من السيرفر
  a.setAttribute('href', url);
  if (!ios) return;
  a.removeAttribute('download');
  // أي متصفح غير سفاري نفسه (المتصفح اللي جوه التطبيقات مالوش "Safari/" في الـ UA)
  var notSafari = !/Safari\\//.test(ua) || /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|Snapchat|Line\\/|LinkedInApp|Twitter|GSA\\/|CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
  a.addEventListener('click', function (e) {
    e.preventDefault();
    if (!notSafari) { location.href = url; return; }
    var left = false;
    var mark = function () { if (document.visibilityState === 'hidden') left = true; };
    document.addEventListener('visibilitychange', mark);
    window.addEventListener('pagehide', function () { left = true; });
    location.href = 'x-safari-' + url;
    setTimeout(function () {
      document.removeEventListener('visibilitychange', mark);
      if (!left) hint();
    }, 1800);
  });
  function hint() {
    var old = document.getElementById('qs-cal-hint');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var d = document.createElement('div');
    d.id = 'qs-cal-hint';
    d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:50%;bottom:24px;z-index:2147483000;transform:translateX(-50%);width:max-content;max-width:calc(100% - 40px);'
      + 'padding:12px 20px;border-radius:14px;background:rgba(43,28,19,.94);color:#fbf7ef;font:400 15px/1.7 Amiri,serif;text-align:center;direction:rtl;'
      + 'box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:opacity .3s ease';
    d.innerHTML = 'عشان تضيف الموعد لتقويم الآيفون<br>افتح الدعوة في Safari من زرار <b dir="ltr">•••</b> فوق';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = '1'; });
    var close = function () {
      d.style.opacity = '0';
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 350);
    };
    d.addEventListener('click', close);
    setTimeout(close, 7000);
  }
})();</script>`;

module.exports = {
  shortId: SHORT,

  // ملف الموعد (routes/invitations.js → /i/qosQhk1/calendar.ics)
  calendar: { title: 'حفل زفاف عبدالشافي الغامدي', hours: 6 },

  // في المحرر مفيش حاجة (الزرار أصلًا مابيتداسش هناك)
  render({ editMode } = {}) {
    return editMode ? {} : { bodyEnd: SCRIPT };
  },
};
