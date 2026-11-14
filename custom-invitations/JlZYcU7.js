// دعوة JlZYcU7 — عمر وسمية، الجمعة 11/12/2026 الساعة 8 مساءً، قاعة ليالي البنفسج للضيافة (المعترض — العين، الإمارات).
// بطلب المالك (2026-11-14): نفس دعوته اللي على موقعه التاني (buharita) بالظبط — ظرف بختم دهبي عليه حروف العروسين، الضغطة
// على الختم بتشغّل فيديو الفتح (بتاعه)، وبعده أول صفحة بفيديو السلم والورد والحمام (بتاعه) و"دعوة زفاف" الدهبي والأسامي،
// والكروت البيضا فوق خلفية ورد باهتة: الدعاء والعائلتين، تنويه الكاميرات، النتيجة وحفظ التاريخ، العد التنازلي، المكان
// والخريطة، تأكيد الحضور بعدد الأشخاص (بيوصل للوحة العميل)، ودفتر التهاني (بيظهر لكل الضيوف — publicWishes). والصفحة
// بتنزل لوحدها بعد الفتح. معرض الصور وبرنامج الحفل اتشالوا بطلب المالك. الكلام من كارت الدعوة اللي بعته.
// الصفحة نفسها في JlZYcU7.html، والصور والفيديوهات في client/public/custom/JlZYcU7/ (scratch jl/).
// البيانات (لوحة العميل والتقويم والخريطة): oneOffFix JlZYcU7-omar-sumaya.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'JlZYcU7';
const DIR = `/custom/${SHORT}/`;
// أغنية الدعوة من المالك (Anlatamam slowed). لو العميل اختار أغنية من المحرر هي اللي بتشتغل.
const DEFAULT_SONG = asset(`${DIR}song.mp3`);
// لينك القاعة من المالك (2026-11-14): قاعة ليالي البنفسج للضيافة — 24.2233503, 55.7373967
const FALLBACK_LINK = 'https://maps.app.goo.gl/XRcLYKcj1piXBL5d9';
const FALLBACK_EMBED = 'https://www.google.com/maps?q=24.2233503,55.7373967&hl=ar&z=16&output=embed';
// الفرح في الإمارات (UTC+4 طول السنة): الساعة اللي في البيانات ساعة حائط هناك
const UAE_OFFSET_H = 4;
const FALLBACK_WALL = '2026-12-11T20:00';

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp4|mp3))/g, (m, f) => asset(DIR + f));
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
/** رقم من بيانات التخصيصات ("audioStart":12) */
function numValue(html, key) {
  const m = html.match(new RegExp(`"${key}":(\\d+(?:\\.\\d+)?)`));
  const n = m ? Number(m[1]) : 0;
  return Number.isFinite(n) && n >= 0 && n < 3600 ? n : 0;
}
const okUrl = (u) => /^https:\/\//.test(u) || /^\/[a-z]/.test(u);
const pad = (n) => String(n).padStart(2, '0');

/** ميعاد الفرح زي ما العميل كتبه (ساعة حائط) من "countdown" في إعدادات القالب، واللحظة دي بتوقيت الإمارات */
function weddingWall(templateHtml) {
  const m = templateHtml.match(/"countdown":\{"year":(\d{4}),"monthIndex":(\d{1,2}),"day":(\d{1,2}),"hour":(\d{1,2}),"minute":(\d{1,2})/);
  let y = 2026; let mo = 11; let d = 11; let h = 20; let mi = 0;
  if (m) {
    const v = m.slice(1).map(Number);
    if (v[0] >= 2025 && v[0] <= 2100 && v[1] <= 11 && v[2] >= 1 && v[2] <= 31 && v[3] <= 23 && v[4] <= 59) [y, mo, d, h, mi] = v;
  }
  const wall = `${y}-${pad(mo + 1)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
  const start = new Date(Date.UTC(y, mo, d, h - UAE_OFFSET_H, mi)).toISOString();
  return { wall: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall) ? wall : FALLBACK_WALL, start };
}

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الظرف بالختم الدهبي وحروف العروسين و"دعوة زفاف"، 1200×630
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'عمر & سمية — دعوة زفاف 🤍',
    description: 'الجمعة 11 ديسمبر 2026 · الساعة 8 مساءً · قاعة ليالي البنفسج للضيافة',
  },

  // زرار "حفظ التاريخ" (routes/invitations.js → /i/JlZYcU7/calendar.ics): من 8 مساءً لـ 1 بعد نص الليل
  calendar: { title: 'زفاف عمر & سمية', hours: 5 },

  // دفتر التهاني: التهاني بتظهر لكل الضيوف (GET/POST /i/JlZYcU7/wishes)، ومعاها عدد تأكيدات الحضور
  publicWishes: true,
  publicRsvpCount: true,

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
    const when = weddingWall(templateHtml);
    out = out.split('__MAP_LINK__').join(escapeHtml(mapLink))
      .split('__MAP_EMBED__').join(escapeHtml(mapEmbed))
      .split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG))
      .split('__START__').join(escapeHtml(when.start))
      .split('__WALL__').join(escapeHtml(when.wall))
      .split('__A_START__').join(String(numValue(templateHtml, 'audioStart')))
      .split('__A_END__').join(String(numValue(templateHtml, 'audioEnd')));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:2000;padding:10px 14px;background:#6b5a45;color:#fff;font:600 14px/1.5 Tahoma,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
