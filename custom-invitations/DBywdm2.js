// دعوة "صدف" (Mother of Pearl) — بطلب المالك (2026-11-05): نفس الدعوة اللي في الصورة الطويلة
// بالظبط (motherofpearl.thedigitalyes.com)، مكان دعوة فاضية (Groom & Bride) — نفس اللينك واللوحة
// والإحصائيات. الكلام لسه بتاع التصميم الأصلي (Cornelia & James) والمالك هيبعت التعديلات بعدين.
// 2026-11-06: المالك بعت كلام الكارت الأساسي — Ahmed & Faten، الخميس 03.12.2026، Royal Garden ·
// 6th October city — والأسامي والتاريخ اتغيروا في كل حتة بتتكرر فيها. باقي الأقسام لسه كلام التصميم.
// الختم بقى A&F بدل C&J: في فيديو الظرف (v1.mp4، كل فريم الختم ظاهر فيه — متتبّع ومنوّر زي الأصل)،
// وصورة الغلاف (poster.webp = أول فريم)، وختم اللؤلؤ في الدريس كود والختام (seal.webp).
//
// الصفحة نفسها في DBywdm2.html (كل النصوص هناك، والميعاد في EVENT أول السكريبت):
//   1. الفتح: فيديو الظرف ثم فيديو الفيونكة (v1/v2) ثم الكارت
//   2. الكارت الأساسي + زرار الصوت   3. العدّاد + كارت الخدش على الصدف   4. المكان
//   5. برنامج اليوم بين الستاير       6. الدريس كود     7. المواصلات     8. الفندقين
//   9. الهدية   10. الـ RSVP (بيروح لـ /i/DBywdm2/rsvp فبيظهر في لوحة العميل)   11. الختام
// الملفات في client/public/custom/DBywdm2/. الأغنية هي اللي متختارة في المحرر (تبويب الموسيقى)
// — لو مفيش، موسيقى هادية مؤقتة لحد ما المالك يبعت أغنية.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'DBywdm2';
const DIR = `/custom/${SHORT}/`;
const DEFAULT_SONG = '/templates/pearl-peony/song.mp3';

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

  // زرار "Add to Calendar" على الآيفون بيفتح /i/DBywdm2/calendar.ics (routes/invitations.js)
  calendar: { title: 'Wedding Ahmed & Faten', hours: 7 },

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Ahmed & Faten — Wedding Invitation',
    description: 'Thursday, 03.12.2026 · Royal Garden · 6th October city',
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
