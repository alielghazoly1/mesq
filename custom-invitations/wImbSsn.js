// دعوة wImbSsn — زفاف حسين وتسنيم (الجمعة 16/10/2026 الساعة 8 مساءً — قاعات النعمان، قاعة رم). بطلب المالك (2026-11-25):
// الدعوة = نسخة بالظبط من الفيديو اللي المالك اشتراه (70 ثانية: فيونكة الدانتيل بتتفك والظرف يتفتح، الحرفين ح ت، أكتوبر،
// البسملة والآية، إلى كل من نال، الأسامي، التفاصيل بالأيقونات، الختام). "اللي مش في الفيديو ماتحطوش": من غير تهاني صوتية
// ولا تأكيد حضور ولا أي قسم من قالب Velvet Voice.
// الصفحة (wImbSsn.html): الغلاف = أول لقطة من الفيديو + "اضغط لفتح الدعوة" → الضغطة بتشغّل الفيديو من أوله بصوته
// (الفيونكة والظرف ثم كل المشاهد) → آخره بيفضل على الحرفين والتاريخ + "شاهد الدعوة مرة أخرى". على الكمبيوتر بمقاس الموبايل.
// الفيديو مترمّز للآيفون (High@4.1 ref=4، +faststart). البيانات (الأسامي/الميعاد/المكان) في oneOffFix wImbSsn-husain-tasneem.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');

const SHORT = 'wImbSsn';
const DIR = `/custom/${SHORT}/`;

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp4))/g, (m, f) => asset(DIR + f));
}

/** كارت المشاركة والعنوان من صفحة القالب (اتبنوا من بيانات الدعوة + share تحت) */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الكارت بالأسامي من الفيديو
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف حسين وتسنيم 🤍',
    description: 'الجمعة ١٦ أكتوبر ٢٠٢٦ · الساعة ٨ مساءً · قاعات النعمان (قاعة رم)',
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
