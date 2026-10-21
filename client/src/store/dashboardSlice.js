// store/dashboardSlice.js
// اختيارات العميل في لوحته — في Redux عشان الأجزاء البعيدة عن بعض (شريط
// الدعوات، لوحة الدعوة، التبويبات، قايمة الضيوف) تقرا وتغيّر نفس الحالة،
// وبتتحفظ في المتصفح فلما يرجع يلاقي نفس الدعوة ونفس التبويب.
//
//   selected   الدعوة المفتوحة (shortId)
//   tab        share (الأول) | overview | guests | voices | photos
//   range      أيام الإحصائيات: 7 | 30 | 90 | 0 (من الأول)
//   guestFilter / guestQuery   فلترة وبحث قايمة الضيوف
//   accountOpen  لوحة الحساب (الاسم، الباسورد…) مفتوحة
import { createSlice } from '@reduxjs/toolkit';

const KEY = 'mithaq_dash';
const TABS = ['share', 'overview', 'guests', 'voices', 'photos'];

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      selected: typeof v.selected === 'string' ? v.selected : null,
      tab: TABS.includes(v.tab) ? v.tab : 'share',
      range: [7, 30, 90, 0].includes(v.range) ? v.range : 30,
    };
  } catch {
    return { selected: null, tab: 'share', range: 30 };
  }
}

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify({ selected: s.selected, tab: s.tab, range: s.range })); } catch { /* */ }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: () => ({ ...load(), guestFilter: 'all', guestQuery: '', accountOpen: false }),
  reducers: {
    selectInvitation(state, action) {
      if (state.selected !== action.payload) {
        state.selected = action.payload;
        state.guestQuery = '';
        state.guestFilter = 'all';
      }
      save(state);
    },
    setTab(state, action) {
      if (TABS.includes(action.payload)) state.tab = action.payload;
      save(state);
    },
    setRange(state, action) {
      if ([7, 30, 90, 0].includes(action.payload)) state.range = action.payload;
      save(state);
    },
    setGuestFilter(state, action) { state.guestFilter = action.payload; },
    setGuestQuery(state, action) { state.guestQuery = String(action.payload || '').slice(0, 60); },
    setAccountOpen(state, action) { state.accountOpen = !!action.payload; },
  },
});

export const {
  selectInvitation, setTab, setRange, setGuestFilter, setGuestQuery, setAccountOpen,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
