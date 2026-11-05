// دعوة ساري وسونا (زفاف — السبت 5/12/2026 الساعة 7:30 مساءً، مطعم درج الياسمين، دبي) — بطلب
// المالك (2026-11-05): ثيم جديد من صورة التصميم اللي بعتها (عاج ودامسك ودهب، برواز بيضاوي
// في النص) مكان دعوة Champagne Lace فاضية — نفس اللينك واللوحة والإحصائيات.
//
// الصفحة نفسها في j4jpczb.html:
// - الغلاف: بابين عاج بدامسك وزخارف دهب من التصميم، وختم شمع في النص عليه حروفهم (S&S).
//   الضغطة: الختم يكبر شوية، وبعدين البابين يتفتحوا من النص لبرّه والموسيقى تشتغل.
// - الكارت: التصميم نفسه (اتشال منه الكلام والصورة) وفوقه الكلام الحقيقي، وصورتهم في البرواز.
// - العد التنازلي (بتوقيت دبي) + أضف للتقويم، العائلتين، البرنامج، جاليري بيتقلّب وبيتفتح كبير،
//   المكان والخريطة، تأكيد الحضور (بيوصل للوحة العميل)، ورفع صور الضيوف (guestExtras.photos).
// الصور في client/public/custom/j4jpczb/. البيانات في utils/oneOffFixes.js (j4jpczb-sari-sona).
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'j4jpczb';
const DIR = `/custom/${SHORT}/`;
// موسيقى هادية (بيانو كلاسيك — نفس ملف Pearl Peony) لو العميل مااختارش أغنية من المحرر
const DEFAULT_SONG = '/templates/pearl-peony/song.mp3';
const FALLBACK_LINK = 'https://maps.app.goo.gl/Rnd2ugLWjWuqQxheA';
const FALLBACK_EMBED = 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sDaraj+Al+Yasmine+Restaurant,+Oud+Metha,+Dubai!6i17';

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp3))/g, (m, f) => asset(DIR + f));
}

/** كارت المشاركة والعنوان من صفحة القالب (اتبنوا من بيانات الدعوة + share تحت) */
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

  // كارت لينك المشاركة: البرواز بصورتهم والأسامي (1200×630)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Sari & Sona — Wedding Invitation',
    description: 'Saturday, 5 December 2026 · 7:30 PM · Daraj Al Yasmine, Dubai',
  },

  // لينكات دعوة شخصية من صفحة الإحصائيات (/s/:token): اسم الضيف وعدد الأشخاص بيظهروا في الدعوة
  guestLinks: true,

  // زرار "Add to calendar" (routes/invitations.js → /i/j4jpczb/calendar.ics)
  calendar: { title: 'Sari & Sona — Wedding', hours: 5 },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const link = configValue(templateHtml, 'venueMapDirectLink');
    const embed = configValue(templateHtml, 'venueMapEmbedSrc');
    const song = configValue(templateHtml, 'audioUrl');
    const mapLink = okUrl(link) && !/query=Venue/.test(link) ? link : FALLBACK_LINK;
    const mapEmbed = /^https:\/\/www\.google\.com\/maps/.test(embed) && !/q=Venue/.test(embed) ? embed : FALLBACK_EMBED;
    out = out.split('__MAP_LINK__').join(escapeHtml(mapLink))
      .split('__MAP_EMBED__').join(escapeHtml(mapEmbed))
      .split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:2000;padding:10px 14px;background:#7f602f;color:#fff;font:600 14px/1.5 Tahoma,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
