import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import { adminApi } from './adminApi';
import uiReducer from './uiSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    ui: uiReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, adminApi.middleware),
});

// بيفعّل إعادة الجلب تلقائيًا لما العميل يرجّع التركيز للتاب أو النت يرجع.
// مهم: بعد ما الأدمن يفعّل اشتراك العميل، أول ما العميل يرجع لتابه، بياناته
// (اشتراكه) بتتحدّث لوحدها من غير ما يعمل refresh يدوي.
setupListeners(store.dispatch);
