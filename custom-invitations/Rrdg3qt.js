// دعوة Rrdg3qt (قالب Ivory Swans — عمر وسمية) — بطلب المالك (2026-11-12):
//  1) قسم الأهل ("بمباركة أهلهما الكرام" ووالد العريس ووالد العروسة) بقى تحت الآية القرآنية على طول
//     (قبل العدّاد و Save the Date). القسم نفسه زي ما هو بكل كلامه وتعديلات المحرر.
//  2) "الاستقبال الساعة ٨ مساءً" مرتين: تحت جملة الأهل (فوق، بعد الآية) وتحت التاريخ في Save the Date —
//     وكمان في وصف اللينك لما يتبعت.
//  3) تاريخ Save the Date كان بيطلع "December 2026 11" (اتجاه عربي على كلام إنجليزي) — بقى "11 December 2026".
// الدعوة فاضلة قالب عادي: كل كلام وصور العميل من المحرر زي ما هي (مفيش تعديل في البيانات).
const SHORT = 'Rrdg3qt';
const RECEPTION = 'الاستقبال الساعة ٨ مساءً';

const STYLE = `<style id="rr-style">
.rcp-line{display:flex;align-items:center;justify-content:center;gap:12px;direction:rtl;font-family:'Amiri',serif;font-weight:700;font-size:21px;line-height:1.5;color:#4a3624;letter-spacing:0}
.rcp-line::before,.rcp-line::after{content:"";flex:0 0 38px;height:1px;background:linear-gradient(90deg,rgba(201,173,122,0),#c9ad7a)}
.rcp-line::after{background:linear-gradient(90deg,#c9ad7a,rgba(201,173,122,0))}
.rcp-fb{margin:22px auto 0}
.rcp-std{margin:12px auto 0}
#std-section [data-elem-id="iv40"]{direction:ltr;unicode-bidi:isolate}
@media (max-width:360px){.rcp-line{font-size:19px;gap:9px}.rcp-line::before,.rcp-line::after{flex-basis:26px}}
</style>`;

const FB_START = '<!-- ===== Family Blessing Section (custom, animated) ===== -->';
const FB_END = '<!-- ===== /Family Blessing Section ===== -->';
// أول بلوك بعد الآية = العدّاد (وجواه Save the Date)
const AFTER_VERSE = '<div id="rec2443433753"';

module.exports = {
  shortId: SHORT,

  // الصورة زي ما صاحب الدعوة اختارها — العنوان والوصف بس (الوصف فيه ميعاد الاستقبال)
  share: {
    title: 'Omer & Somia — Wedding Invitation',
    description: `11 December 2026 · ${RECEPTION} · قاعة ليالي البنفسج للضيافة`,
  },

  render() {
    return { head: STYLE };
  },

  transform(html) {
    let out = html;
    // 1) قسم الأهل تحت الآية
    const a = out.indexOf(FB_START);
    const b = a === -1 ? -1 : out.indexOf(FB_END, a);
    const at = out.indexOf(AFTER_VERSE);
    if (a !== -1 && b !== -1 && at !== -1 && at < a) {
      let block = out.slice(a, b + FB_END.length);
      out = out.slice(0, a) + out.slice(b + FB_END.length);
      // 2a) الاستقبال تحت جملة الأهل
      block = block.replace(/(<div class="fb-note" data-elem-id="iv27"[^>]*>[\s\S]*?<\/div>)/, `$1\n                <div class="rcp-line rcp-fb">${RECEPTION}</div>`);
      const at2 = out.indexOf(AFTER_VERSE);
      out = out.slice(0, at2) + block + '\n' + out.slice(at2);
    }
    // 2b) الاستقبال تحت التاريخ في Save the Date
    out = out.replace(/(<div class="std-sub" data-elem-id="iv40"[^>]*>[\s\S]*?<\/div>)/, `$1\n                <div class="rcp-line rcp-std">${RECEPTION}</div>`);
    return out;
  },
};
