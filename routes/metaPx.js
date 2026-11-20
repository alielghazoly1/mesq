// POST /api/px/pv — PageView لميتا من السيرفر (Conversions API) بنفس event_id اللي البيكسل في المتصفح
// بعته لنفس الصفحة (client/src/lib/metaPixel.js) — ميتا بتعدّهم مرة واحدة.
//
// ليه (المالك 2026-11-20): "جودة المطابقة" لـ PageView في Events Manager بقت 0 من 10. التقييم ده
// بيتحسب من أحداث السيرفر بس، والـ PageView مكانش بيتبعت من سيرفرنا خالص (النسخة اللي على السيرفر
// كانت من ميتا نفسها). دلوقتي بيتبعت ومعاه IP والمتصفح و fbp/fbc (utils/metaParams.js)، وبيانات
// العميل المسجّل متشفّرة — زي باقي الأحداث اللي تقييمها 9 من 10.
// مفيش أي حاجة بتترجع للمتصفح، والبرامج الآلية ولوحة التحكم وصفحات الدعوات مابتتبعتش.
const express = require('express');
const metaCapi = require('../utils/metaCapi');
const { isBotReq } = require('../utils/metaParams');

const router = express.Router();
const SITE = 'https://mithaq-invitation.com';
const ID_RE = /^pv_[a-f0-9]{16}$/;
// من اللينك بنبعت بس اللي ميتا محتاجاه (ضغطة الإعلان ومصدر الزيارة) — مش أي حاجة تانية
// (زي كود تغيير الباسورد في لينك الإيميل)
const KEEP = new Set(['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'lang']);

/** المسار + الباراميترات المسموحة بس، ومن غير لوحة التحكم وصفحات الدعوات والإحصائيات */
function cleanUrl(raw) {
  const s = String(raw || '').slice(0, 1500);
  if (!s.startsWith('/') || s.startsWith('//')) return null;
  let u;
  try { u = new URL(s, SITE); } catch { return null; }
  if (/^\/(admin|i\/|s\/|v\/|api\/)/.test(u.pathname) || u.pathname.length > 300) return null;
  const q = new URLSearchParams();
  u.searchParams.forEach((v, k) => { if (KEEP.has(k) && v.length <= 1000) q.append(k, v); });
  const qs = q.toString();
  return SITE + u.pathname + (qs ? '?' + qs : '');
}

router.post('/api/px/pv', (req, res) => {
  try {
    const on = process.env.NODE_ENV === 'production' || process.env.META_PIXEL_ON === '1';
    // من صفحات الموقع نفسه بس (المتصفحات الجديدة بتقول الطلب جاي منين)
    const site = String(req.get('sec-fetch-site') || 'same-origin');
    const b = req.body || {};
    const id = String(b.id || '');
    const url = cleanUrl(b.p);
    if (on && site === 'same-origin' && ID_RE.test(id) && url && !isBotReq(req)) {
      // fbp/fbc/IP/المتصفح — وبيكتب كوكي _fbp/_fbc لو ناقصين (قبل ما الرد يتبعت)
      const ctx = metaCapi.contextFromReq(req);
      metaCapi.queue('PageView', { eventId: id, user: req.user || undefined, ctx: { ...ctx, url } });
    }
  } catch { /* الحدث مش أهم من الصفحة */ }
  return res.status(204).end();
});

module.exports = router;
module.exports.cleanUrl = cleanUrl;
