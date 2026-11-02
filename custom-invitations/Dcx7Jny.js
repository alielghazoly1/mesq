// أفراح عائلات عبد الحميد السنور وأبو المجد وآل عبد اللطيف — فرحين في ليلة واحدة
// (الخميس 19/11/2026 بعد صلاة العشاء، نفس المكان — كفر الشيخ) بطلب المالك، مكان
// دعوة فاضية (Groom & Bride) — نفس اللينك واللوحة والإحصائيات وردود الحضور.
//   الفرح الأول: محمود شحته السنور (نجل الحاج الشحات) و زينب حسني أبو المجد
//   الفرح الثاني: طارق عاطف السنور (نجل الحاج عاطف) و عزة عمر عبد اللطيف
//
// الصفحة في Dcx7Jny.html: التصميم من كارت العيلة نفسه (الإطار الدهبي والقوس والورد
// بعد ما اتشال منه الكلام واتكبّر 4x)، والكلام كله حي فوقه. الصور في
// client/public/custom/Dcx7Jny/. تأكيد الحضور بيروح لـ /i/Dcx7Jny/rsvp.
const fs = require('fs');
const path = require('path');
const { asset } = require('./_asset');

const SHORT = 'Dcx7Jny';
const DIR = `/custom/${SHORT}/`;

function page() {
  const html = fs.readFileSync(path.join(__dirname, `${SHORT}.html`), 'utf8');
  // ملفات الدعوة ببصمة المحتوى (أي تعديل في ملف → لينك جديد، والقديم مايفضلش في الكاش)
  return html.replace(/assets\/([a-z0-9-]+\.(?:jpg|webp|png|mp4|mp3))/g, (m, f) => asset(DIR + f));
}
// الصفحة بتتقري مرة واحدة (الملف مابيتغيّرش غير مع نشر جديد)
let PAGE = null;

/** كارت المشاركة والعنوان من صفحة القالب (بيانات الدعوة نفسها) */
function shareTags(templateHtml) {
  const head = templateHtml.slice(0, Math.max(0, templateHtml.search(/<\/head>/i)));
  const tags = head.match(/<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+"|name="description")[^>]*>|<link\s+rel="canonical"[^>]*>|<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>|<title>[^<]*<\/title>/gi);
  return tags ? tags.join('\n') : '';
}

/**
 * الأغنية "ادخلي عمري بخطوة" — من مكتبة الموسيقى بتاعة الموقع نفسه (بطلب المالك:
 * "موجودة عندي على الويب سايت"). بندوّر عليها بالاسم في المكتبة ونحفظ اللينك في
 * الذاكرة (transform مش async). لو اتحط song.mp3 جنب صور الدعوة يبقى هو الأولى.
 * مش بناخد audioUrl بتاع الدعوة: ده موسيقى القالب الافتراضية مش أغنيتهم.
 */
const SONG_TITLE = /[اأإ]دخل[يى]\s*عمر[يى]|عمر[يى]\s*بخطو/;
let trackUrl = '';
let trackTried = 0;
function lookupTrack() {
  if (trackUrl || Date.now() - trackTried < 60 * 1000) return;
  trackTried = Date.now();
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) { trackTried = 0; return; }
    require('../models/Track')
      .findOne({ active: true, $or: [{ title: SONG_TITLE }, { artist: SONG_TITLE }] })
      .sort({ createdAt: -1 }).select('url title').lean()
      .then((t) => { if (t && /^https:\/\//.test(t.url)) trackUrl = t.url; })
      .catch(() => {});
  } catch (e) { /* مفيش أغنية = مفيش زرار */ }
}
try {
  require('mongoose').connection.once('connected', () => setTimeout(lookupTrack, 1500));
} catch (e) { /* */ }

function songUrl() {
  for (const root of ['public', 'dist']) {
    if (fs.existsSync(path.join(__dirname, '..', 'client', root, 'custom', SHORT, 'song.mp3'))) return asset(`${DIR}song.mp3`);
  }
  lookupTrack();
  return trackUrl;
}

module.exports = {
  shortId: SHORT,

  // عنوان ووصف وصورة كارت المشاركة (واتساب/فيسبوك/إنستجرام)
  share: {
    image: asset(`${DIR}share.jpg`),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'أفراح عائلات السنور وأبو المجد وآل عبد اللطيف',
    description: 'زفاف محمود وزينب · طارق وعزة — الخميس ١٩ نوفمبر ٢٠٢٦ بعد صلاة العشاء',
  },

  // render لازم يبقى موجود عشان transform يشتغل (utils/customInvitations.js)
  render() {
    return {};
  },

  transform(templateHtml, { editMode } = {}) {
    if (!PAGE) PAGE = page();
    let out = PAGE;
    const tags = shareTags(templateHtml);
    if (tags) {
      out = out.replace(/<title>[^<]*<\/title>\s*/i, '').replace(/<meta name="description"[^>]*>\s*/i, '');
      out = out.replace(/<head>/i, (m) => `${m}\n${tags}`);
    }
    // تأكيد الحضور بيروح للدعوة دي (في المعاينة من غير سيرفر بيظهر الشكر بس)
    // والأغنية (لو موجودة) بتشتغل مع فتح البابين
    out = out.replace(/<head>/i, (m) => `${m}\n<script>window.MQ_RSVP_URL = '/i/${SHORT}/rsvp'; window.DW_SONG = ${JSON.stringify(songUrl())};</script>`);
    // المحرر مالوش شغل على الدعوة دي — بنوضّح لصاحبها إن التعديل بيبقى من عندنا
    if (editMode) {
      out = out.replace(/<body[^>]*>/i, (m) => `${m}<div style="position:fixed;top:0;left:0;right:0;z-index:100;padding:10px 14px;background:#8a6a2a;color:#fff;font:600 14px/1.5 Tajawal,Arial,sans-serif;text-align:center;direction:rtl">الدعوة دي معمولة مخصوص — لأي تعديل كلّمنا وهنعدّله لك</div>`);
    }
    return out;
  },
};
