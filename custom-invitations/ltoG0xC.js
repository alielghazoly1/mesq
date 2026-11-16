// دعوة ltoG0xC — أحمد ويارا، الاثنين 21/12/2026 الساعة 8 مساءً، قاعة الورا (Alura Wedding Hall) — الزقازيق، الشرقية.
// (2026-11-14) غلاف المظروف بقى الفيديو بتاع المالك (مظروف كريمي منقوش بختم شمع ماروني، الغطا بيتفتح لفوق) والختم
// مكتوب عليه A&Y مكان R&Z — الحروف اتغيّرت فريم بفريم (cover.webp/cover.jpg/open.mp4).
// (2026-11-16، بطلب المالك) "اللي بره متظبط — اللي جوه غيّر الدنيا خالص" من صوره التلاتة: المسرح بالستارة والنجفة
// والدخان، كارت القوس البرجندي (A|Y والأسامي مقصوصين من صورته نفسها)، ودوائر القماش للدريس كود (بيج، بينك، جولد، منت
// جرين). الصفحة كلها في ltoG0xC.html (بتحل محل قالب Royal Maroon للدعوة دي بس)، وفيها نفس المظروف وفيديو الفتح بالظبط:
// الضيف بيشوف صورة المظروف → يدوس → الفيديو (من غير صوت؛ الأغنية بتبدأ مع الضغطة) → المسرح بينوّر.
// الصور في client/public/custom/ltoG0xC/ (scratch ay/). البيانات (لوحة العميل والتقويم): oneOffFix ltoG0xC-ahmed-yara.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');
const { cairoWallToDate } = require('../utils/cairoTime');

const SHORT = 'ltoG0xC';
const DIR = `/custom/${SHORT}/`;
// الموسيقى: أغنية العميل لو اختارها من المحرر، وإلا الأغنية اللي بعتها المالك (2026-11-16) — song.mp3
const DEFAULT_SONG = asset(`/custom/${SHORT}/song.mp3`);
// القاعة من المالك (2026-11-16): قاعة الورا — JF29+VV2، شارع المصرف القديم، شيبة النكارية، الزقازيق → 30.602138, 31.469641
const FALLBACK_LINK = 'https://maps.app.goo.gl/wWPVs4n4Foz1Nw8G7';
const FALLBACK_EMBED = 'https://www.google.com/maps?q=30.602138,31.469641&hl=en&z=16&output=embed';
const FALLBACK_WALL = '2026-12-21T20:00';

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

/** ميعاد الفرح زي ما العميل كتبه (ساعة حائط القاهرة) من "countdown" في إعدادات القالب، واللحظة دي بتوقيت القاهرة */
function weddingWall(templateHtml) {
  const m = templateHtml.match(/"countdown":\{"year":(\d{4}),"monthIndex":(\d{1,2}),"day":(\d{1,2}),"hour":(\d{1,2}),"minute":(\d{1,2})/);
  let y = 2026; let mo = 11; let d = 21; let h = 20; let mi = 0;
  if (m) {
    const v = m.slice(1).map(Number);
    if (v[0] >= 2025 && v[0] <= 2100 && v[1] <= 11 && v[2] >= 1 && v[2] <= 31 && v[3] <= 23 && v[4] <= 59) [y, mo, d, h, mi] = v;
  }
  const wall = `${y}-${pad(mo + 1)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
  const start = cairoWallToDate(y, mo, d, h, mi).toISOString();
  return { wall: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall) ? wall : FALLBACK_WALL, start };
}

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: المسرح والنجفة وA|Y والأسامي، 1200×630
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Ahmed & Yara — Wedding Invitation 🤍',
    description: 'Monday, 21 December 2026 · 8 PM · Alura Wedding Hall, Zagazig',
  },

  // زرار "Add to calendar" (routes/invitations.js → /i/ltoG0xC/calendar.ics): من 8 مساءً لـ 1 بعد نص الليل
  calendar: { title: 'Ahmed & Yara — Wedding', hours: 5 },

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
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:2000;padding:10px 14px;background:#4a0d14;color:#fff;font:600 14px/1.5 Tahoma,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
