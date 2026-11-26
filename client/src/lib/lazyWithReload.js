// استيراد كسول بيعرف يصحّى نفسه (كان جوه App.jsx — اتنقل هنا عشان أجزاء تانية تستخدمه:
// رسم المشاهدات في لوحة العميل ومكتبة الـ QR).
//
// الملف الكسول اسمه فيه بصمة المحتوى، فبيتغيّر مع كل رفع. تاب مفتوح من
// قبل الرفع بيفضل يطلب الاسم القديم اللي اتشال — الاستيراد بيفشل
// والصفحة بتطلع بيضا. هنا بنجرّب تاني مرة، ولو فشلت بنعيد تحميل الصفحة
// من السيرفر مرة واحدة بس عشان تيجي بأسماء الملفات الجديدة.
import { lazy } from 'react';

/** نفس اللي فوق من غير React: بيرجّع وعد الملف (بيترفض لو فشل تاني بعد إعادة التحميل) */
export function importWithReload(factory, key) {
  return factory().catch(() => factory().catch((err) => {
    const flag = 'mithaq:chunk-reload:' + key;
    let tried = false;
    try { tried = sessionStorage.getItem(flag) === '1'; } catch { /* تصفح خاص */ }
    if (tried) throw err;
    try { sessionStorage.setItem(flag, '1'); } catch { /* */ }
    window.location.reload();
    // بنرجّع وعد مش بيخلص عشان React مايرسمش حاجة والصفحة بتتحمّل
    return new Promise(() => {});
  }));
}

export function lazyWithReload(factory, key) {
  return lazy(() => importWithReload(factory, key));
}
