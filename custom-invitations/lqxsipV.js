// دعوة هاجر ونور (كتب الكتاب الجمعة 4/12/2026 الساعة 3 العصر في مسجد الشرطة — التجمع الخامس،
// والفرح السبت 12/12/2026 الساعة 5 في هيلتون بيراميدز جولف — 6 أكتوبر) — بطلب المالك (2026-11-08):
// دعوة جديدة بالكامل بثيم الصور اللي بعتها، مكان دعوة Sage Garden كانت فاضية — نفس اللينك واللوحة والإحصائيات.
//
// الصفحة نفسها في lqxsipV.html:
// - الغلاف: الظرف الوردي (من صورته) على الخطوط الأزرق×الكريمي، والقلب الأحمر فوقه ختم.
//   الضغطة: القلب يطير وقلوب صغيرة تتنطط، الجواب يطلع من الظرف، وبعدين ندخل جوه الجواب والموسيقى تشتغل.
// - الكارت: القلب بالفيونكة والدانتيل (صورته — اتشال منه الكلام) وفوقه الأسامي والكلام الحقيقي.
// - تقويم ديسمبر بقلب على يوم 4 ويوم 12 + عد تنازلي لكتب الكتاب وبعده للفرح.
// - كارت لكل مناسبة جوه القلب الشريطة (صورته التانية): المعاد، المكان، الخريطة، اللوكيشن، وحفظ في التقويم.
// - تأكيد الحضور (كتب الكتاب / الفرح / الاتنين) بيوصل للوحة العميل، ولينكات شخصية للضيوف.
// الصور في client/public/custom/lqxsipV/. البيانات في utils/oneOffFixes.js (lqxsipV-hagar-nour).
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');

const SHORT = 'lqxsipV';
const DIR = `/custom/${SHORT}/`;
// بيانو هادي (Chopin — نفس ملف Pearl Peony) لو العميل مااختارش أغنية من المحرر
const DEFAULT_SONG = '/templates/pearl-peony/song.mp3';

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

  // كارت لينك المشاركة: الظرف على الخطوط والأسامي (1200×630)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Hagar & Nour — Wedding Invitation',
    description: 'Katb El Ketab · Friday 4 December 2026 · The Wedding · Saturday 12 December 2026',
  },

  // لينكات دعوة شخصية من صفحة الإحصائيات (/s/:token): اسم الضيف وعدد الأشخاص بيظهروا في الدعوة
  guestLinks: true,

  // زرار "Save the date" لكل مناسبة: /i/lqxsipV/calendar.ics?e=katb أو ?e=wedding
  calendar: {
    title: 'Hagar & Nour — The Wedding',
    hours: 5,
    events: {
      katb: {
        title: 'Hagar & Nour — Katb El Ketab',
        start: '2026-12-04T15:00',
        hours: 2,
        location: 'Police Mosque, El Orouba Axis, New Cairo',
        map: 'https://maps.app.goo.gl/LfFn98PUECzj4g5r7',
      },
      wedding: {
        title: 'Hagar & Nour — The Wedding',
        start: '2026-12-12T17:00',
        hours: 5,
        location: 'Hilton Pyramids Golf, El Wahat Road, 6th of October City',
        map: 'https://maps.app.goo.gl/x86DDYn19JRmv48b9',
      },
    },
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
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div class="edit-bar">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
