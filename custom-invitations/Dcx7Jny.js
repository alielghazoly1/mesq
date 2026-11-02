// أفراح عائلات عبد الحميد السنور وأبو المجد وآل عبد اللطيف — فرحين في ليلة واحدة
// (الخميس 19/11/2026 بعد صلاة العشاء، نفس المكان — كفر الشيخ) بطلب المالك، مكان
// دعوة فاضية (Groom & Bride) — نفس اللينك واللوحة والإحصائيات وردود الحضور.
//   الفرح الأول: محمود شحته السنور (نجل الحاج الشحات) و زينب حسني أبو المجد
//   الفرح الثاني: طارق عاطف السنور (نجل الحاج عاطف) و عزة عمر عبد اللطيف
//
// الصفحة في Dcx7Jny.html: التصميم من كارت العيلة نفسه (الإطار الدهبي والقوس والورد
// بعد ما اتشال منه الكلام واتكبّر 4x)، والكلام كله حي فوقه. الصور في
// client/public/custom/Dcx7Jny/. تأكيد الحضور بيروح لـ /i/Dcx7Jny/rsvp.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');

const SHORT = 'Dcx7Jny';
const DIR = `/custom/${SHORT}/`;

function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  // ملفات الدعوة ببصمة المحتوى (أي تعديل في ملف → لينك جديد، والقديم مايفضلش في الكاش)
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp4|mp3))/g, (m, f) => asset(DIR + f));
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
 * الأغنية ("ادخلي عمري بخطوة" — مستنيين الملف من المالك): song.mp3 جنب صور الدعوة
 * لو موجود، وإلا الأغنية اللي صاحب الدعوة رافعها من لوحته (audioUrl). مفيش = مفيش زرار.
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
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'أفراح عائلات السنور وأبو المجد وآل عبد اللطيف',
    description: 'زفاف محمود وزينب · طارق وعزة — الخميس ١٩ نوفمبر ٢٠٢٦ بعد صلاة العشاء',
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
    // والأغنية (لو موجودة) بتشتغل مع فتح البابين
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_RSVP_URL = '/i/${SHORT}/rsvp'; window.DW_SONG = ${JSON.stringify(songUrl(templateHtml))};</script>`);
    // المحرر مالوش شغل على الدعوة دي — بنوضّح لصاحبها إن التعديل بيبقى من عندنا
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:100;padding:10px 14px;background:#8a6a2a;color:#fff;font:600 14px/1.5 Tajawal,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
