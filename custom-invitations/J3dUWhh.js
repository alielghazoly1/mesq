// دعوة J3dUWhh — محمد مصطفى عبدالحفيظ سليم ويارا هشام فاروق وافي، السبت 12/12/2026 من 11:30 الصبح لـ 5:30 المسا،
// بيت يزد (الجيزة). بطلب المالك (2026-11-28) — كانت ديمو قالب Finca، وبقت دعوتهم:
//  • نفس فتحة Finca (فيديو الظرف) — حروف الختم M&J اتمسحت كلها واتكتبت M&Y من جديد فريم فريم (بارزة في الشمع زي الأصل).
//  • الهوية من صور المالك: بيج وتراكوتا ونبيتي، عناصر البامباس/الفازات/الدانتيل/الفراشات/القوس/الشمع/القماش/الركنة
//    (متقصوصة من لوحة العناصر)، ورسومات بيت يزد (الباب في أول صفحة، البيت في المكان والشكر)، وصورة الفازة في الهدية.
//  • الصفحات: الأسامي باسم العائلتين والتاريخ والمكان → العدّاد → المكان واللوكيشن → جدول اليوم (كلام المالك) → تأكيد
//    الحضور → الهدية والمباركة → كلمة شكر ودفتر رسايل (بيظهر للضيوف — publicWishes) → ألبوم صور الضيوف (guestExtras.photos).
//  • عربي (الافتراضي) وإنجليزي على /en.
// الصفحة في J3dUWhh.html، والصور والفيديو في client/public/custom/J3dUWhh/. البيانات: oneOffFix J3dUWhh-mohamed-yara.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'J3dUWhh';
const DIR = `/custom/${SHORT}/`;
const DEFAULT_SONG = '/templates/finca/song.mp3';

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp4|mp3))/g, (m, f) => asset(DIR + f));
}

/** كارت المشاركة والعنوان من صفحة القالب */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

/** سكريبت window.WEDDING_CONFIG زي ما القالب بناه (الأسامي/الميعاد/اللينك بلغة الصفحة) */
function configScript(templateHtml) {
  const m = templateHtml.match(/<script>window\.WEDDING_CONFIG = [\s\S]*?<\/script>/);
  return m ? m[0] : '<script>window.WEDDING_CONFIG = {};</script>';
}

function configValue(html, key) {
  const m = html.match(new RegExp(`"${key}":("(?:[^"\\\\]|\\\\.)*")`));
  if (!m) return '';
  try { return JSON.parse(m[1]) || ''; } catch (e) { return ''; }
}
const okUrl = (u) => /^https:\/\//.test(u) || /^\/[a-z]/.test(u);

module.exports = {
  shortId: SHORT,
  langs: ['ar', 'en'],

  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'دعوة زفاف محمد ويارا 🤍',
    description: 'السبت 12 ديسمبر 2026 · بيت يزد، الجيزة',
  },
  shareByLang: {
    en: {
      image: asset(`${DIR}share.jpg`),
      width: 1200,
      height: 630,
      overrideImage: true,
      title: 'Mohamed & Yara — Wedding Invitation 🤍',
      description: 'Saturday, 12 December 2026 · Bait Yazd, Giza',
    },
  },

  // دفتر الرسايل في كلمة الشكر: بيظهر لكل الضيوف (GET/POST /i/J3dUWhh/wishes)
  publicWishes: true,

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    const song = configValue(templateHtml, 'audioUrl');
    let out = PAGE
      .replace('__CONFIG_SCRIPT__', () => configScript(templateHtml))
      .split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:2000;padding:10px 14px;background:#6e1f2b;color:#fff;font:600 14px/1.5 Tahoma,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
