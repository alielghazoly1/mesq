// دعوة زهير وغزل (السويد — حفل سيدات) — بطلب المالك: دعوة معمولة بإيدينا كاملة
// من 8 صور تصميم بعتها، مكان دعوة Sage Garden فاضية في حساب العميل
// (نفس اللينك واللوحة والإحصائيات وردود الحضور).
//
// الصفحة نفسها في uw64dfD.html: ظرف بزرارين (العربية / Svenska) — الظرف بينزل
// لتحت والدعوة بتفتح باللغة اللي اختارها، وورد صغير بينزل من فوق. الصور (مقصوصة
// ومكبّرة من التصميم) في client/public/custom/uw64dfD/.
//
// هنا بس بنبدّل صفحة القالب بالصفحة دي، وبناخد من القالب كارت المشاركة
// (og:/twitter:/العنوان) عشان يفضل نفس سيستم الكارت. تأكيد الحضور بيروح
// لـ /i/uw64dfD/rsvp زي أي دعوة فبيظهر في لوحة العميل.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');

const SHORT = 'uw64dfD';
const DIR = `/custom/${SHORT}/`;

function page() {
  let html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  // صور الدعوة ببصمة المحتوى (أي تعديل في صورة → لينك جديد)
  html = html.replace(/assets\/([a-z0-9-]+\.webp)/g, (m, f) => asset(DIR + f));
  return html;
}
// الصفحة بتتقري مرة واحدة (الملف مابيتغيّرش غير مع نشر جديد)
let PAGE = null;

/** كارت المشاركة والعنوان من صفحة القالب (بيانات الدعوة نفسها) */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

/**
 * الأغنية اللي بتشتغل مع فتح الظرف: ملف song.mp3 جنب صور الدعوة لو موجود،
 * وإلا الأغنية اللي صاحب الدعوة رافعها على الدعوة (audioUrl في بياناتها)
 */
function songUrl(templateHtml) {
  for (const root of ['public', 'dist']) {
    if (fs.existsSync(path.join(__dirname, '..', 'client', root, 'custom', SHORT, 'song.mp3'))) return asset(`${DIR}song.mp3`);
  }
  const m = templateHtml.match(/"audioUrl":"(https:\/\/[^"]+)"/);
  return m ? m[1].replace(/\\u002F/g, '/') : '';
}

module.exports = {
  shortId: SHORT,

  // عنوان ووصف وصورة كارت المشاركة (واتساب/فيسبوك/إنستجرام)
  share: {
    image: `${DIR}share.jpg`,
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف زهير وغزل',
    description: 'السبت ٢٨ نوفمبر ٢٠٢٦ · Forsälla bygdegård — Uddevalla',
  },

  // render لازم يبقى موجود عشان transform يشتغل (utils/customInvitations.js)
  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '').replace(/<meta name="description"[^>]*>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    const song = songUrl(templateHtml);
    out = out.replace(/<script>(\r?\n\/\/ ===== النصوص)/, (m, rest) => `<script>window.ZK_RSVP_URL = '/i/${SHORT}/rsvp';${song ? `window.ZK_SONG = ${JSON.stringify(song)};` : ''}</script>\n<script>${rest}`);
    // المحرر مالوش شغل على الدعوة دي — بنوضّح لصاحبها إن التعديل بيبقى من عندنا
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:99;padding:10px 14px;background:#2f4a35;color:#fff;font:600 14px/1.5 Amiri,serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
