// اللوحة بتفضل مفتوحة على جهاز المالك (بطلبه) — بس لو الجلسة اتقفلت من
// السيرفر (قفلها من جهاز تاني، أو اتستخدمت من جهاز غريب، أو عدّى عمرها)
// أي طلب بيرجع 401، وساعتها الشاشة بتتقفل على طول وبيانات العملاء
// بتتمسح من الذاكرة (AdminApp.jsx).
export const LOCK_EVENT = 'mithaq:admin-locked';

export function signalLocked(reason = 'server') {
  window.dispatchEvent(new CustomEvent(LOCK_EVENT, { detail: { reason } }));
}
