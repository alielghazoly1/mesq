// دعوة gqwYc45 — Abdelrahman & Rawan (الجمعة 4 ديسمبر 2026 الساعة 5 مساءً — كانت 7 واتغيّرت بطلب المالك 2026-11-11، Dusit Thani Cairo — Palms Ballroom).
// بطلب المالك (2026-11-11): نفس الدعوة اللي في الفيديو اللي بعته (AR.mp4) — ظرف بورد وختم شمع A&R (أول فريم = الغلاف)،
// الضغط بيشغّل فتح الضلفتين من الفيديو نفسه (1.2 ثانية)، وبعدها القوس بالستاير والخضرة والنجف (آخر فريم والكلام اتشال
// منه بـ LaMa — scratch gq/) والكلام بيظهر سطر سطر فوقه بنفس الأماكن والخطوط (Playfair Display + Cormorant Garamond)
// والزخرفة والأيقونات متقصوصة من الفيديو. تحت: العدّاد، المكان وزرار الخريطة، تأكيد الحضور، والختام. موسيقى الفيديو.
// البيانات (للوحة العميل): oneOffFix gqwYc45-abdelrahman-rawan.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'gqwYc45';
const DIR = `/custom/${SHORT}/`;
const DEFAULT_SONG = asset(`${DIR}song.mp3`);
// لينك القاعة من المالك (2026-11-11): Dusit Thani LakeView Cairo — شارع التسعين، التجمع الخامس
const FALLBACK_LINK = 'https://maps.app.goo.gl/PnhJKZBKsvtcNgWJA';

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp4|mp3))/g, (m, f) => asset(DIR + f));
}
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}
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

module.exports = {
  shortId: SHORT,

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Abdelrahman & Rawan — Wedding Invitation 🤍',
    description: 'Friday, 4 December 2026 · 5:00 PM · Dusit Thani LakeView Cairo — Palms Ballroom',
  },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const link = configValue(templateHtml, 'venueMapDirectLink');
    const song = configValue(templateHtml, 'audioUrl');
    const start = configValue(templateHtml, 'weddingDateTimeISO') || '2026-12-04T15:00:00.000Z';
    out = out.split('__MAP_LINK__').join(escapeHtml(okUrl(link) && !/query=Venue/.test(link) ? link : FALLBACK_LINK))
      .split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG))
      .split('__START__').join(escapeHtml(start))
      // قص الأغنية من المحرر (تبويب الموسيقى: تبدأ من / تخلص عند)
      .split('__A_START__').join(String(numValue(templateHtml, 'audioStart')))
      .split('__A_END__').join(String(numValue(templateHtml, 'audioEnd')));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:200;padding:10px 14px;background:#6b3c06;color:#fff;font:600 14px/1.5 Tahoma,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
