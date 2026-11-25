// دعوة wImbSsn — زفاف محمود وإيمان (الخميس 31/12/2026 ليلة رأس السنة، الساعة 8:30 مساءً — ستار كلوب، عند مرور شبرا أمام
// كورنيش النيل). بطلب المالك (2026-11-25): نفس دعوة الفيديو اللي اشتراه (صفحته "يثرا") بالظبط، بس صفحة الضيف بينزل فيها
// بإيده والبيانات الجديدة، واللوكيشن بيتضغط. "اللي مش في الفيديو ماتحطوش" (من غير تهاني صوتية ولا تأكيد حضور).
// الصفحة (wImbSsn.html):
//  • الغلاف = أول لقطة من الفيديو + "اضغط لفتح الدعوة" → الضغطة: فيديو الفتح (الفيونكة بتتفك والظرف يتفتح — intro.mp4،
//    أول 10 ثواني من الفيديو، من غير العلامة المائية ومن غير حروف "ح ت") + أغنية الفيديو نفسها (music.m4a).
//  • بعده: خلفية الفيديو (الساتان بيتحرك — bg.mp4 لوب) والكارت فاضي، و7 مشاهد بنفس ترتيب الفيديو، كل مشهد صفحة (scroll-snap):
//    الكلام اللي زي ما هو مقصوص من الفيديو نفسه سطر سطر (نفس الخط والمكان)، والجديد (لديسمبر، التاريخ، الأسامي، الحرفين،
//    التفاصيل) صور مولّدة بأقرب خطوط (Mirza / Courier New Bold / Segoe UI Bold زي الفيديو / Aref Ruqaa ذهبي للأسامي) —
//    scratch wim/gen. الأماكن في wImbSsn-elements.json (إحداثيات كادر الفيديو 720×1280).
//  • أيقونة المكان واسم القاعة → لوكيشن جوجل ماب. (المالك 2026-11-25) تحت العلامة: نادي Star Club / قاعة Sunrise،
//    وتحتهم العنوان (أمام مكتب تراخيص مرور شبرا الخيمة)؛ سطر الباركينج اتشال.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');

const SHORT = 'wImbSsn';
const DIR = `/custom/${SHORT}/`;
const EL = JSON.parse(fs.readFileSync(path.join(__dirname, `${SHORT}-elements.json`), 'utf8'));

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  const assets = {};
  EL.forEach((e) => { if (!assets[e.src]) assets[e.src] = asset(`${DIR}${e.src}.webp`); });
  return html.replace(/assets\/([a-z0-9_-]+\.(?:jpg|webp|png|mp4|m4a))/g, (m, f) => asset(DIR + f))
    .replace('__ELEMENTS__', () => `var EL = ${JSON.stringify(EL)};`)
    .replace('__ASSETS__', () => JSON.stringify(assets));
}

/** كارت المشاركة والعنوان من صفحة القالب (اتبنوا من بيانات الدعوة + share تحت) */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

module.exports = {
  shortId: SHORT,

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف محمود وإيمان 🤍',
    // (المالك 2026-11-25) كارت شيك: كارت الحرفين وكارت الأسامي جنب بعض على الساتان + كلام حلو تحت العنوان
    description: 'بكل الحب ندعوكم لمشاركتنا فرحة العمر 🤍 الخميس ٣١ ديسمبر ٢٠٢٦ · ليلة رأس السنة · ٨:٣٠ مساءً · نادي Star Club · قاعة Sunrise · أمام مكتب تراخيص مرور شبرا الخيمة',
  },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const tags = shareTags(templateHtml);
    if (tags) out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    return out;
  },
};
