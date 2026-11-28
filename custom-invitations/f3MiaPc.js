// دعوة f3MiaPc (قالب Blossom & Oud، لغة الدعوة إنجليزي والكلام عربي) — زفاف أيوب وفاتن، فاس.
// بطلب المالك (2026-11-28):
//  • العدّاد التنازلي بالعربي: أيام / ساعات / دقائق / ثواني، ومن اليمين للشمال (الأيام على اليمين).
//  • تأكيد الحضور بالعربي: الاسم الكريم، هل ستشرفوننا بالحضور؟، الاختيارين، الملاحظة، زرار الإرسال،
//    ورسايل الإرسال/النجاح/الخطأ، والكتابة جوه الخانات من اليمين.
//  • الآية: العميل كان حاذف نسخة من الآية في قسم المكان، والحذف ده كان باين في المحرر بس.
//    السبب: العنصر متكرر في التصميم (معرّفه بلاحقة __dN)، وقاعدة الإخفاء بتاعة صفحة الضيوف
//    بتدوّر على data-elem-id، والنسخ المتكررة بتتعرّف بـ data-wda-uid. فالآية كانت بتظهر للضيوف
//    مقصوصة من الناحيتين وداخلة في اللي حواليها. هنا بنخفي أي عنصر متكرر محذوف بـ data-wda-uid
//    (للضيوف بس، المحرر بيخفيه بنفسه وبيعرف يرجّعه). والآية اللي فاضلة (تحت صورة العروسين)
//    بخط Amiri ومسافة سطور مريحة.
//  • عنوان "يبدأ الاحتفال" كان طرفه العلوي مستخبي ورا كارت الدعوة → العنوان نازل 18px جوه قسمه.
const SHORT = 'f3MiaPc';
const VERSE_UID = '1779544773135__d2';

const HEAD = `<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style id="f3-css">
#rec2339662093 .tn-elem[data-elem-id="1771277026942000001"]{transform:translateY(18px)}
#countdownContainer{direction:rtl}
#countdownContainer .label{font-family:'Amiri',serif!important;font-size:20px!important}
#wdaRsvpForm,#wdaRsvpForm label,#wdaRsvpForm button,#wdaRsvpFeedback{font-family:'Amiri',serif!important}
#wdaRsvpForm input,#wdaRsvpForm textarea{direction:rtl;text-align:right}
#wdaRsvpForm .wda-rsvp-choices{direction:rtl}
[data-wda-uid="${VERSE_UID}"] .tn-atom{font-family:'Amiri',serif!important;line-height:2!important}
</style>`;

const AR = {
  countdownLabels: { days: 'أيام', hours: 'ساعات', minutes: 'دقائق', seconds: 'ثواني' },
  yourNameLabel: 'الاسم الكريم',
  willYouComeLabel: 'هل ستشرفوننا بالحضور؟',
  yesOption: 'نعم، سأحضر بإذن الله',
  noOption: 'أعتذر عن الحضور',
  foodIntoleranceLabel: 'هل لديكم حساسية من أي طعام؟',
  submitButtonText: 'إرسال',
  rsvpSubmittingText: 'جارٍ الإرسال...',
  rsvpSuccessText: 'تم استلام ردكم، شكرًا لكم!',
  rsvpErrorText: 'حدث خطأ، يرجى المحاولة مرة أخرى.',
};

const MARK = 'window.WEDDING_CONFIG = ';
const esc = (s) => s.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function arabicConfig(html) {
  const i = html.indexOf(MARK);
  if (i === -1) return html;
  const start = i + MARK.length;
  const end = html.indexOf(';\n', start);
  if (end === -1) return html;
  let cfg;
  try { cfg = JSON.parse(html.slice(start, end)); } catch (_) { return html; }
  Object.assign(cfg, AR);
  return html.slice(0, start) + esc(JSON.stringify(cfg)) + html.slice(end);
}

// قواعد الإخفاء اللي على عناصر متكررة (X__dN) → نفس القاعدة على data-wda-uid
function hideDuplicates(html) {
  const ids = new Set();
  const re = /\[data-elem-id="([A-Za-z0-9_-]+__d\d+)"\] \{ display: none !important; \}/g;
  let m;
  while ((m = re.exec(html))) ids.add(m[1]);
  if (!ids.size) return html;
  const css = `<style id="f3-hidden-dup">${[...ids].map((id) => `[data-wda-uid="${id}"]`).join(',')}{display:none!important}</style>`;
  return html.replace(/<\/head>/i, () => `${css}</head>`);
}

module.exports = {
  shortId: SHORT,

  render() {
    return { head: HEAD };
  },

  transform(html, { editMode } = {}) {
    let out = arabicConfig(html);
    if (!editMode) out = hideDuplicates(out);
    return out;
  },
};
