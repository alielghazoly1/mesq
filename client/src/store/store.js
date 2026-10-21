import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import { adminApi } from './adminApi';
import uiReducer from './uiSlice';
import adminReducer from './adminSlice';
import supportReducer from './supportSlice';
import dashboardReducer from './dashboardSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    ui: uiReducer,
    admin: adminReducer,
    support: supportReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, adminApi.middleware),
});
