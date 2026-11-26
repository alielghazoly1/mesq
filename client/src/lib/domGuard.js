// حماية React من اللي بيغيّر الصفحة من وراه (أعطال الواجهة — 104 من 134 عطل في نوفمبر 2026):
// ترجمة جوجل في كروم/سفاري ("ترجمة الصفحة") وبعض إضافات المتصفح بيلفّوا الكلام في <font> أو بيبدّلوا
// عُقد النص. لما React بعدها يشيل/يحط عنصر (زي زرار بيتقلب لـ"جاري التحميل" في نافذة الدخول أو الدفع)
// بيلاقي العنصر مش في مكانه → "Failed to execute 'removeChild'/'insertBefore' on 'Node'" (سفاري: "The object
// can not be found here.") والصفحة كلها بتقع على "حصلت مشكلة غير متوقعة".
//
// الحل المعروف (facebook/react#11538): لو العنصر مش ابن للمكان اللي React فاكره، بنتجاهل العملية دي بس بدل
// ما نوقّع الصفحة. أي عملية صح (العنصر في مكانه) بتعدي زي ما هي بالظبط — مفيش أي تغيير في السلوك العادي.
export function installDomGuard() {
  if (typeof Node !== 'function' || !Node.prototype || Node.prototype.__mithaqGuard) return;
  const proto = Node.prototype;
  const removeChild = proto.removeChild;
  const insertBefore = proto.insertBefore;
  proto.removeChild = function guardedRemoveChild(child) {
    if (child && child.parentNode !== this) {
      // العنصر اتنقل/اتلف بإيد حد تاني (الترجمة) — لو لسه في الصفحة في مكان تاني نشيله من هناك
      if (child.parentNode) {
        try { return removeChild.call(child.parentNode, child); } catch { /* */ }
      }
      return child;
    }
    return removeChild.apply(this, arguments);
  };
  proto.insertBefore = function guardedInsertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      // المرجع مش هنا (اتلف في <font>) — نحط العنصر في آخر المكان بدل ما الصفحة تقع
      return proto.appendChild.call(this, newNode);
    }
    return insertBefore.apply(this, arguments);
  };
  Object.defineProperty(proto, '__mithaqGuard', { value: true });
}
