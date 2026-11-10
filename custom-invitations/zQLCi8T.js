// دعوة zQLCi8T (Champagne Lace — أبوبكر وإنتصار) — بطلب المالك (2026-11-10): فورم الرد من غير
// "هتحضر ولا لأ" — الضيف بيكتب اسمه ورسالته وبيبعت على طول. اختيار الحضور مستخبي ومتعلّم "أيوه"
// من نفسه (الرد لازم يتسجّل بحضور عشان يوصل لوحة العميل)، فالرد بيظهر في اللوحة بالاسم والرسالة.
// باقي الدعوة زي ما هي (القالب + تعديلات العميل).
const SHORT = 'zQLCi8T';

module.exports = {
  shortId: SHORT,

  render() {
    return {
      head: '<style id="zq-style">#rsvp .rs-field[data-f="attendance"]{display:none!important}</style>',
      bodyEnd: `<script id="zq-script">(function () {
  function pick() {
    var yes = document.querySelector('#rsvp input[name="attendance"][value="yes"]');
    if (yes && !yes.checked) yes.checked = true;
  }
  pick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pick);
  // قبل الإرسال على طول (لو أي حاجة شالت الاختيار)
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#rsvp .rs-send')) pick(); }, true);
  document.addEventListener('submit', pick, true);
})();</script>`,
    };
  },
};
