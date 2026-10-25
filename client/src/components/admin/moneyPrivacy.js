// إخفاء الفلوس في لوحة التحكم (بطلب المالك): زرار عين واحد يخفي كل مبلغ
// (أرباح، مصاريف، أسعار، عمولات، رسوم الفلوس) لو حد قاعد جنبك — وبضغطة
// تانية يرجع. الاختيار بيتحفظ على الجهاز ده، فلو عملت ريفريش وهو مخفي يفضل
// مخفي.
//
// إزاي بيشتغل: كل عرض لمبلغ بيعدّي على fmtMoney / moneyText (ui.jsx) اللي
// بيرجّع "••••" وهو مخفي، واللوحة كلها بتعيد الرسم لما يتقلب. والحاجات اللي
// مش نص (خانات الأسعار) عليها class "money" بتتغبّش بـ CSS
// (html[data-hide-money] في index.css).
import { useSyncExternalStore } from 'react';

const KEY = 'mithaq:admin-hide-money';
export const MASK = '••••';

function read() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

let hidden = read();
const subs = new Set();

function apply() {
  if (typeof document !== 'undefined') document.documentElement.toggleAttribute('data-hide-money', hidden);
}
apply();

export function isMoneyHidden() { return hidden; }

export function setMoneyHidden(v) {
  hidden = !!v;
  try { localStorage.setItem(KEY, hidden ? '1' : '0'); } catch { /* مش مهم */ }
  apply();
  subs.forEach((f) => f());
}

export function toggleMoneyHidden() { setMoneyHidden(!hidden); }

function subscribe(cb) {
  subs.add(cb);
  // تاب تاني للوحة قلب الزرار → التاب ده يمشي معاه
  const onStorage = (e) => { if (e.key === KEY) { hidden = e.newValue === '1'; apply(); cb(); } };
  window.addEventListener('storage', onStorage);
  return () => { subs.delete(cb); window.removeEventListener('storage', onStorage); };
}

/** true وهي مخفية — وأي كومبوننت بيستعمله بيعيد الرسم لما تتقلب */
export function useMoneyHidden() {
  return useSyncExternalStore(subscribe, isMoneyHidden, () => false);
}

/** أي نص فيه مبلغ: وهو مخفي بيرجع •••• (ولو فيه العملة بتفضل) */
export function moneyText(text, unit = '') {
  if (!hidden) return text;
  return unit ? `${MASK} ${unit}` : MASK;
}
