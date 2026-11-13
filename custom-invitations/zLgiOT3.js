// دعوة zLgiOT3 — عمرو وشيماء (Amr & Shimaa)، الخميس 10/12/2026، إنتركونتيننتال سميراميس — القاهرة.
// بطلب المالك (2026-11-13) من الفيديو اللي اشتراه (ظرف بينك بختم دهبي ولوحة بحيرة وبجعتين): فيديو فتح الظرف نفسه، وبعده
// اللوحة بالبجعتين شغالة ورا الدعوة كلها. اتشال من الفيديوهات كلام العرض واسم المصمم (scratch am/).
// بعد فتح الظرف الدعوة صفحة بتنزل سكرول والكلام ثابت، بالإنجليزي والعربي (زرار تبديل،
// الإنجليزي الأول، ?lang=ar)، البرنامج (الدخول 7:30، كتب الكتاب 8، الرقص 9، فقرة غنائية 11، العشا 12، الانتهاء 3)،
// المكان والخريطة، وتأكيد الحضور بعدد الحضور والتهنئة (بيوصل للوحة العميل في رسالة الرد).
// الصفحة نفسها في zLgiOT3.html. الصور والفيديوهات في client/public/custom/zLgiOT3/.
// البيانات (للوحة العميل والعدّاد والتقويم): oneOffFix zLgiOT3-amr-shimaa.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'zLgiOT3';
const DIR = `/custom/${SHORT}/`;
// الموسيقى: موسيقى الفيديو نفسه (اللي المالك اشتراه)، من أوله لحد ما بتخلص (50 ثانية) وبتلف. لو العميل اختار
// أغنية من المحرر هي اللي بتشتغل.
const DEFAULT_SONG = asset(`${DIR}song.mp3`);
const FALLBACK_LINK = 'https://www.google.com/maps/search/?api=1&query=InterContinental+Cairo+Semiramis';
const FALLBACK_EMBED = 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sInterContinental+Cairo+Semiramis!6i16';

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

module.exports = {
  shortId: SHORT,

  // كارت لينك المشاركة: الظرف البينك بالختم الدهبي (أول فريم من الفيديو بعد التنضيف)، 1200×630
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Amr & Shimaa — Wedding Invitation 🤍',
    description: 'Thursday, 10 December 2026 · 7:30 PM · InterContinental Cairo Semiramis',
  },

  // زرار "Add to calendar" (routes/invitations.js → /i/zLgiOT3/calendar.ics): من 7:30 مساءً لـ 3 الفجر
  calendar: { title: 'Amr & Shimaa — Wedding', hours: 7.5 },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const link = configValue(templateHtml, 'venueMapDirectLink');
    const embed = configValue(templateHtml, 'venueMapEmbedSrc');
    const song = configValue(templateHtml, 'audioUrl');
    const start = configValue(templateHtml, 'weddingDateTimeISO');
    const mapLink = okUrl(link) && !/query=Venue/.test(link) ? link : FALLBACK_LINK;
    const mapEmbed = /^https:\/\/www\.google\.com\/maps/.test(embed) && !/q=Venue/.test(embed) ? embed : FALLBACK_EMBED;
    out = out.split('__MAP_LINK__').join(escapeHtml(mapLink))
      .split('__MAP_EMBED__').join(escapeHtml(mapEmbed))
      .split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG))
      // الخميس 10/12/2026 الساعة 7:30 مساءً بتوقيت القاهرة (= 17:30 UTC) لو البيانات لسه ما اتحدّثتش
      .split('__START__').join(escapeHtml(/^2026-12-10T/.test(start) ? start : '2026-12-10T17:30:00.000Z'))
      .split('__A_START__').join(String(numValue(templateHtml, 'audioStart')))
      .split('__A_END__').join(String(numValue(templateHtml, 'audioEnd')));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:2000;padding:10px 14px;background:#8d655e;color:#fff;font:600 14px/1.5 Tahoma,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
