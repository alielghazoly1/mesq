// دعوة محمد وإسراء (زفاف — الجمعة 13/11/2026 الساعة 7 مساءً، قاعة ريلز بطلخا) — بطلب
// المالك (2026-11-04): نفس الدعوة اللي في الفيديو اللي بعته بالظبط، مكان دعوة Royal
// Maroon فاضية (Groom & Bride) — نفس اللينك واللوحة والإحصائيات.
//
// الصفحة نفسها في KycrQqs.html: ظرف نبيتي والصورة طالعة منه بتتهز والورد بيتمايل،
// الأسامي، كارت الدعوة، معرض صور (كوفرفلو)، الموعد والعداد ونتيجة نوفمبر، المكان
// والخريطة، سجل التهاني (التهاني بتظهر لكل الضيوف — publicWishes)، وزرار الموسيقى.
// الصور في client/public/custom/KycrQqs/ (صور العرسان والورد وورقة التهاني من المالك؛
// خلفية القصر اتنضّفت من الفيديو).
//
// الخريطة واللينك من بيانات الدعوة (oneOffFix KycrQqs-mohamed-esraa)، والأغنية هي
// اللي متختارة في المحرر (تبويب الموسيقى) — لو مفيش، أغنية افتراضية هادية.
// تأكيد الحضور بيروح لـ /i/KycrQqs/rsvp فبيظهر في لوحة العميل.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'KycrQqs';
const DIR = `/custom/${SHORT}/`;
const DEFAULT_SONG = '/templates/pearl-peony/song.mp3';
const FALLBACK_MAP = 'https://maps.app.goo.gl/DzExN2zKyepmvVoH6';

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|mp3))/g, (m, f) => asset(DIR + f));
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
  // سجل التهاني بيعرض التهاني لكل الضيوف (routes/invitations.js: /i/:shortId/wishes)
  publicWishes: true,

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'حفل زفاف محمد وإسراء',
    description: 'الجمعة 13 نوفمبر 2026 · الساعة 7:00 مساءً · قاعة ريلز بطلخا',
  },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const link = configValue(templateHtml, 'venueMapDirectLink');
    const embed = configValue(templateHtml, 'venueMapEmbedSrc');
    const song = configValue(templateHtml, 'audioUrl');
    const mapLink = okUrl(link) && !/query=Venue/.test(link) ? link : FALLBACK_MAP;
    const mapEmbed = okUrl(embed) && !/q=Venue/.test(embed) ? embed : 'https://www.google.com/maps?q=%D9%82%D8%A7%D8%B9%D8%A9%20%D8%B1%D9%8A%D9%84%D8%B2%20%D8%B7%D9%84%D8%AE%D8%A7&output=embed';
    out = out.split('__MAP_LINK__').join(escapeHtml(mapLink))
      .split('__MAP_EMBED__').join(escapeHtml(mapEmbed))
      .split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '').replace(/<meta name="description"[^>]*>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';</script>`);
    if (editMode) {
      // المحرر: من غير شاشة الغلاف
      out = out.replace(/<\/head>/i, () => '<style>.kc{display:none!important}html.kc-lock,html.kc-lock body{overflow:visible!important;height:auto!important}</style></head>');
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:100;padding:10px 14px;background:#4a0b17;color:#fff;font:600 14px/1.5 Tajawal,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
