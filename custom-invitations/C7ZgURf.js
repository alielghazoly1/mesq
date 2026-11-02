// دعوة مي وعبد الرحمن (زفاف — الخميس 26/11/2026 الساعة 7:30 مساءً، قاعة سي ستار —
// المكس، إسكندرية) — بطلب المالك: نفس الدعوة المرجعية اللي بعتها بالظبط، مكان دعوة
// Sage Garden فاضية (Groom & Bride) — نفس اللينك واللوحة والإحصائيات وردود الحضور.
//
// الصفحة نفسها في C7ZgURf.html: ظرف كحلي بورقة دهب ← الضغط عليه يشغّل فيديو الفتح
// ← الدعوة بتفتح وفيديو القصر بيشتغل (من النهار لليل) والأغنية ← قصتنا، احفظ التاريخ،
// العدّاد، البرنامج، المكان، تأكيد الحضور، شكرًا. الفيديوهات والصور والأغنية في
// client/public/custom/C7ZgURf/.
//
// هنا بس بنبدّل صفحة القالب بالصفحة دي، وبناخد من القالب كارت المشاركة
// (og:/twitter:/العنوان) عشان يفضل نفس سيستم الكارت. تأكيد الحضور بيروح
// لـ /i/C7ZgURf/rsvp زي أي دعوة فبيظهر في لوحة العميل.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');

const SHORT = 'C7ZgURf';
const DIR = `/custom/${SHORT}/`;

function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  // ملفات الدعوة ببصمة المحتوى (أي تعديل في ملف → لينك جديد، والقديم مايفضلش في الكاش)
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|mp4|mp3))/g, (m, f) => asset(DIR + f));
}
// الصفحة بتتقري مرة واحدة (الملف مابيتغيّرش غير مع نشر جديد)
let PAGE = null;

/** كارت المشاركة والعنوان من صفحة القالب (بيانات الدعوة نفسها) */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

module.exports = {
  shortId: SHORT,

  // عنوان ووصف وصورة كارت المشاركة (واتساب/فيسبوك/إنستجرام)
  share: {
    // ببصمة المحتوى: الكارت اتغيّر للعربي — من غيرها واتساب/فيسبوك والكاش بيفضلوا على القديم
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    // عربي بطلب المالك (2026-11-02) — الدعوة كلها بقت عربي
    title: 'دعوة زفاف مي و عبد الرحمن',
    description: 'الخميس ٢٦ نوفمبر ٢٠٢٦ · السابعة والنصف مساءً · سي ستار — المكس، الإسكندرية',
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
    // تأكيد الحضور بيروح للدعوة دي (في المعاينة من غير سيرفر بيظهر الشكر بس)
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_RSVP_URL = '/i/${SHORT}/rsvp';</script>`);
    // المحرر مالوش شغل على الدعوة دي — بنوضّح لصاحبها إن التعديل بيبقى من عندنا
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:100;padding:10px 14px;background:#172957;color:#fff;font:600 14px/1.5 Tajawal,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
