// دعوة Ahmed & Aya (Champagne Lace، إنجليزي) — بطلب المالك:
// اسم العريس (Ahmed) فوق واسم العروسة (Aya) تحته في الكارت، بدل ترتيب القالب
// الإنجليزي (العروسة الأول). باقي القالب زي ما هو.

const FROM = "var n1 = LANG === 'ar' ? groom : bride, n2 = LANG === 'ar' ? bride : groom;";
const TO = 'var n1 = groom, n2 = bride;';

module.exports = {
  shortId: 'tMlhgB9',

  render() {
    return {};
  },

  /** القالب لو اتغيّر ومالقيناش السطر، الدعوة بترجع لترتيبها العادي */
  transform(html) {
    return html.includes(FROM) ? html.replace(FROM, TO) : html;
  },
};
