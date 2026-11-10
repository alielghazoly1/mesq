// دعوة qWn9kOE — بطلب المالك (2026-11-10): نسخة من دعوة "صدف" (DBywdm2، Mother of Pearl) بكل تفاصيلها، مكان دعوة
// فاضية (Groom & Bride): Abdallah & Hoda، الأربعاء 25/11/2026 من 7 المسا لـ 12 بالليل، The Palace (6 أكتوبر — بطلب المالك).
// الختم: لوجو المالك ع + ه (أبيض على أسود) بارز في الشمع في فيديو الظرف (v1.mp4 — نفس طريقة أ + ف في DBywdm2:
// تتبّع الختم فريم فريم وإعادة بناء وشه، scratch qw/)، وصورة الغلاف (poster.webp)، وختم اللؤلؤ (seal.webp).
// تحت كارت الخدش: التاريخ (مفيش صورة للعرسان). الأغنية والدريس كود وكلام المكان والختام بالعربي زي DBywdm2.
// الصفحة في qWn9kOE.html. البيانات: oneOffFix qWn9kOE-abdallah-hoda.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'qWn9kOE';
const DIR = `/custom/${SHORT}/`;
const DEFAULT_SONG = asset(`${DIR}song.mp3`);

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|mp4|mp3|woff2))/g, (m, f) => asset(DIR + f));
}

/** كارت المشاركة والعنوان من صفحة القالب (بيانات الدعوة نفسها) */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

/** قيمة نصية من JSON الإعدادات اللي جوه صفحة القالب ("key":"...") */
function configValue(html, key) {
  const m = html.match(new RegExp(`"${key}":("(?:[^"\\\\]|\\\\.)*")`));
  if (!m) return '';
  try { return JSON.parse(m[1]) || ''; } catch (e) { return ''; }
}

const okUrl = (u) => /^https:\/\//.test(u) || /^\/[a-z]/.test(u);

module.exports = {
  shortId: SHORT,

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Abdallah & Hoda — Wedding Invitation 🤍',
    description: 'Wednesday, 25.11.2026 · 7 PM – 12 AM · The Palace, 6th of October',
  },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const song = configValue(templateHtml, 'audioUrl');
    out = out.split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '').replace(/<meta name="description"[^>]*>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      // المحرر: من غير شاشة الفتح + تنبيه إن التعديل عن طريقنا
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:100;padding:10px 14px;background:#4c5f76;color:#fff;font:600 14px/1.5 Tajawal,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
