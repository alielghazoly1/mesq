// استيراد كسول بيعرف يصحّى نفسه (كان جوه App.jsx — اتنقل هنا عشان أجزاء تانية تستخدمه:
// رسم المشاهدات في لوحة العميل ومكتبة الـ QR).
//
// الملف الكسول اسمه فيه بصمة المحتوى، فبيتغيّر مع كل رفع. تاب مفتوح من
// قبل الرفع بيفضل يطلب الاسم القديم اللي اتشال — الاستيراد بيفشل
// والصفحة بتطلع بيضا. هنا بنجرّب تاني مرة، ولو فشلت بنعيد تحميل الصفحة
// من السيرفر مرة واحدة بس عشان تيجي بأسماء الملفات الجديدة.
import { lazy } from 'react';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** لو الجهاز فاصل نستنى النت يرجع (بحد أقصى `max`) بدل ما نجرّب على الفاضي */
function whenOnline(max) {
  if (typeof navigator === 'undefined' || navigator.onLine !== false) return Promise.resolve();
  return new Promise((r) => {
    const done = () => { window.removeEventListener('online', done); r(); };
    window.addEventListener('online', done);
    setTimeout(done, max);
  });
}
// إعادة تحميل الصفحة لنفس الملف: مرة كل دقيقة بالكتير (مش مرة في الزيارة كلها زي الأول — كان أي قطع نت
// تاني في نفس الزيارة بيوقّع الصفحة على "حصلت مشكلة"). أقل من كده = لفّة إعادة تحميل، فبنسيب الخطأ يطلع.
const RELOAD_GAP_MS = 60 * 1000;

/**
 * نفس اللي فوق من غير React: بيرجّع وعد الملف.
 * (أعطال الواجهة نوفمبر 2026: "Importing a module script failed" على آيفون — نت الموبايل بيقطع في النص.)
 * المحاولات: على طول، بعد ~0.7 ث، بعد ~2 ث (ولو الجهاز فاصل بنستنى النت يرجع) — وبعدين إعادة تحميل الصفحة.
 */
export function importWithReload(factory, key) {
  const attempt = (n) => factory().catch(async (err) => {
    if (n < 2) {
      await sleep(n === 0 ? 700 : 2000);
      await whenOnline(15000);
      return attempt(n + 1);
    }
    const flag = 'mithaq:chunk-reload:' + key;
    let last = 0;
    try { last = Number(sessionStorage.getItem(flag)) || 0; } catch { /* تصفح خاص */ }
    if (Date.now() - last < RELOAD_GAP_MS) throw err;
    try { sessionStorage.setItem(flag, String(Date.now())); } catch { /* */ }
    window.location.reload();
    // بنرجّع وعد مش بيخلص عشان React مايرسمش حاجة والصفحة بتتحمّل
    return new Promise(() => {});
  });
  return attempt(0);
}

export function lazyWithReload(factory, key) {
  return lazy(() => importWithReload(factory, key));
}
