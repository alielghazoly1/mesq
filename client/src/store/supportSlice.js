// store/supportSlice.js
// حالة الدعم عند العميل — في Redux عشان كذا مكان بعيد عن بعض بيقراها:
// الزرار العايم (العدد الأحمر)، أيقونة "الدعم" في الشريط السفلي، والنافذة نفسها.
//
//   unread        كام رسالة منك (المالك) العميل لسه ماشافهاش → الرقم الأحمر.
//                 بيصفّر أول ما يفتح المحادثة (السيرفر بيعلّمها مقروءة).
//   adminOnline   اللوحة مفتوحة دلوقتي؟ → "متصل الآن" بالنقطة الخضرا.
//   latest        معاينة آخر رسالة مش مقروءة → الفقاعة اللي بتطلع جنب الزرار.
//   dismissedId   آخر فقاعة العميل قفلها (عشان ماترجعش تطلعله تاني).
//   view          home | faq | chat — الشاشة المفتوحة جوه النافذة.
//   faqLog        الأسئلة اللي سألها في الجلسة دي (بتتعرض كمحادثة).
import { createSlice } from '@reduxjs/toolkit';

// الفقاعة اللي العميل قفلها مابترجعش تاني حتى بعد ما يعمل ريفرش (لحد ما توصل رسالة أجدد)
const DISMISS_KEY = 'wda_support_dismissed';
function readDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) || null; } catch { return null; }
}

const supportSlice = createSlice({
  name: 'support',
  initialState: {
    unread: 0,
    adminOnline: false,
    latest: null,
    dismissedId: readDismissed(),
    view: 'home',
    faqLog: [],
  },
  reducers: {
    setStatus(state, action) {
      const s = action.payload || {};
      state.unread = Math.max(0, Number(s.unread) || 0);
      state.adminOnline = !!s.adminOnline;
      state.latest = s.latest || null;
    },
    markAllRead(state) {
      state.unread = 0;
      state.latest = null;
    },
    dismissPreview(state) {
      state.dismissedId = state.latest ? state.latest.id : state.dismissedId;
      try { if (state.dismissedId) localStorage.setItem(DISMISS_KEY, state.dismissedId); } catch { /* */ }
    },
    setView(state, action) {
      state.view = action.payload || 'home';
    },
    askFaq(state, action) {
      // نفس السؤال مرتين ورا بعض مالوش لازمة
      const id = action.payload;
      const last = state.faqLog[state.faqLog.length - 1];
      if (!last || last.id !== id) state.faqLog.push({ id, at: Date.now() });
      if (state.faqLog.length > 12) state.faqLog.splice(0, state.faqLog.length - 12);
      state.view = 'faq';
    },
    clearFaq(state) {
      state.faqLog = [];
    },
    resetSupport() {
      return {
        unread: 0, adminOnline: false, latest: null, dismissedId: null, view: 'home', faqLog: [],
      };
    },
  },
});

export const {
  setStatus, markAllRead, dismissPreview, setView, askFaq, clearFaq, resetSupport,
} = supportSlice.actions;
export default supportSlice.reducer;
