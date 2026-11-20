// دعوة فيروز وزياد (الجمعة 18/12/2026 الساعة 7 مساءً — إنتركونتيننتال سميراميس، القاهرة) — بطلب المالك (2026-11-19):
// دعوة جديدة بالكامل من الـ4 صور اللي العميل بعتها، مكان دعوة Golden Calla كانت فاضية (نفس اللينك واللوحة والإحصائيات).
// الصفحة نفسها في 25gFXIO.html:
// - الغلاف: باب الدانتيل بالختم اللؤلؤ (صورته — من غير أي تغيير في تفاصيلها). الضغطة: الختم يكبر سنة ويختفي،
//   والضلفتين يتفتحوا لبره من النص (نفس حركة mHdbDd1 اللي المالك وافق عليها) والموسيقى تشتغل.
// - جوه: ورق الكتان بالورد البارز (صورته الأولى) ثابت ورا الصفحة، وكارت قوس نبيتي مخملي بالبسملة الدهب (مقصوصة
//   من صورته التالتة) والأسامي والميعاد، ووردة الليلي اللؤلؤ (صورته التانية) في ركنين القوس.
// - (2026-11-20) كل حاجة في شاشة لوحدها والدعوة بتنزل لوحدها: الأول البسملة والحرفين والأسامي، بعدها Save the Date (كالندر
//   ديسمبر بقلب على 18 + العدّاد من غير قباب)، الأوتيل لوحده وتحته اللوكيشن، تأكيد الحضور. نقطة الـ ز = نقطة الـ ف بالظبط.
// - عدّاد + حفظ في التقويم، المكان بالخريطة، وتأكيد حضور (بيوصل للوحة العميل، و"Guests: N" بيتعدّ في الإحصائيات).
// الصور في client/public/custom/25gFXIO/. البيانات في utils/oneOffFixes.js (25gFXIO-fayrouz-ziad).
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');
const { escapeHtml } = require('../utils/sanitize');
const { glideScript } = require('./_glide');

const SHORT = '25gFXIO';
const DIR = `/custom/${SHORT}/`;
// بيانو هادي (نفس أغنية Golden Calla) لو العميل مااختارش أغنية من المحرر
const DEFAULT_SONG = '/templates/golden-calla/song.mp3';
// مقاس صورة الباب ومكان الختم عليها (scratch fz/door.py)
const GEO = JSON.parse(fs.readFileSync(path.join(__dirname, `${SHORT}-door.json`), 'utf8'));

let PAGE = null;
function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp3))/g, (m, f) => asset(DIR + f))
    .split('__DOOR_W__').join(String(GEO.w)).split('__DOOR_H__').join(String(GEO.h))
    .split('__DOOR_AR__').join((GEO.w / GEO.h).toFixed(5))
    .split('__SEAL_L__').join(GEO.seal.l.toFixed(3)).split('__SEAL_T__').join(GEO.seal.t.toFixed(3))
    .split('__SEAL_W__').join(GEO.seal.w.toFixed(3)).split('__SEAL_H__').join(GEO.seal.h.toFixed(3));
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

  // كارت لينك المشاركة: الباب بالختم والأسامي (1200×630)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Fayrouz & Ziad — Wedding Invitation 🤍',
    description: 'Friday, 18 December 2026 · 7:00 PM · InterContinental Semiramis, Cairo',
  },

  // زرار "Save the date": /i/25gFXIO/calendar.ics (الساعة من بيانات الدعوة)
  calendar: { title: 'Fayrouz & Ziad — The Wedding', hours: 5 },

  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const song = configValue(templateHtml, 'audioUrl');
    out = out.split('__SONG__').join(escapeHtml(okUrl(song) ? song : DEFAULT_SONG))
      .split('__A_START__').join(String(numValue(templateHtml, 'audioStart')))
      .split('__A_END__').join(String(numValue(templateHtml, 'audioEnd')));
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_ID = '${SHORT}';${editMode ? 'window.MQ_EDIT = true;' : ''}</script>`);
    // (2026-11-20 بطلب المالك) بعد ما الباب يتفتح الدعوة بتنزل لوحدها بالراحة (أي لمسة بتوقّفها وترجع تكمّل بعد شوية)
    if (!editMode) out = out.replace(/<\/body>/i, () => `${glideScript({ playSel: 'main', playClass: 'on', after: 4500, speed: 75 })}
</body>`);
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div class="edit-bar">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
