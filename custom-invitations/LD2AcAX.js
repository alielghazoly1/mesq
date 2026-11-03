// LD2AcAX — Ahmed & Enjy (Champagne Lace، إنجليزي) بطلب المالك (2026-11-03): الفورم
// تحت بقت رسايل بس — الضيف يكتب اسمه ورسالته ويبعت على طول، من غير سؤال "Will you
// attend?" ومن غير "Please let us know if you can come".
// الرد بيتسجل زي أي رد (attending = yes عشان السيرفر واللوحة شغالين زي ما هم)، فالاسم
// والرسالة بيوصلوا لصاحب الدعوة في نفس المكان.
// لو القالب اتغيّر ومالقيناش السطور دي، الصفحة بتتعرض زي ما هي بالظبط.

const VALIDATE = "if (!choice()) { setErr('attendance', L.errAtt); ok = false; } else setErr('attendance');";
const ATT = 'var att = choice();';

const CSS = `<style id="ld-css">
/* سؤال الحضور مستخبي — الفورم: الاسم والرسالة وزرار الإرسال بس */
#rsvp .rs-field[data-f="attendance"]{display:none!important}
</style>`;

module.exports = {
  shortId: 'LD2AcAX',

  render() { return {}; },

  transform(html) {
    if (!html.includes(VALIDATE) || !html.includes(ATT)) return html;
    let out = html.replace(VALIDATE, () => '/* LD2AcAX: من غير سؤال الحضور */')
      .replace(ATT, () => "var att = choice() || 'yes';");
    out = out.replace(/<\/head>/i, () => `${CSS}</head>`);
    return out;
  },
};
