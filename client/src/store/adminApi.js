// store/adminApi.js
// كل تواصل لوحة التحكم مع السيرفر. منفصل عن api.js عن قصد:
//   - أساسه /admin/api مش /api
//   - بيبعت هيدر X-Admin-Request مع كل طلب، والسيرفر بيرفض أي طلب من
//     غيره (middleware/adminAuth.js) — ده اللي بيقفل CSRF: صفحة تانية
//     تقدر تخلي المتصفح يبعت الكوكي، لكن متقدرش تحط هيدر مخصص من غير
//     preflight، والـ CORS بتاعنا بيرفض الـ preflight ده.
//   - تاجاته منفصلة، فأي تحديث في اللوحة مبيلمسش كاش الموقع العادي
//
// التوكن نفسه عمره ما بيعدي من هنا: كوكي httpOnly، الجافاسكريبت مش
// شايفاه أصلًا. credentials:'include' بيخلي المتصفح يبعته لوحده.
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/admin/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('X-Admin-Request', '1');
    return headers;
  },
});

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['Overview', 'Users', 'User', 'Orders', 'Invitations', 'Support', 'Settings', 'Pricing', 'Thread', 'Audit', 'Tracks', 'Withdrawals', 'Ugc', 'SiteTemplates'],
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: (period = 30) => `/overview?period=${period}`,
      providesTags: ['Overview'],
    }),

    // ===== العملاء =====
    getUsers: builder.query({
      query: ({ q = '', status = 'all', page = 1 } = {}) =>
        `/users?q=${encodeURIComponent(q)}&status=${status}&page=${page}`,
      providesTags: ['Users'],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (r, e, id) => [{ type: 'User', id }],
    }),
    // زيارات العميل للموقع (جلسات التصفح) — صفحات، أحدث الأول
    getUserVisits: builder.query({
      query: ({ id, page = 1 }) => `/users/${id}/visits?page=${page}`,
      providesTags: (r, e, { id }) => [{ type: 'User', id }],
    }),
    updateSubscription: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}/subscription`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'User', id }, 'Users', 'Overview', 'Audit'],
    }),
    blockUser: builder.mutation({
      query: ({ id, blocked }) => ({ url: `/users/${id}/block`, method: 'PATCH', body: { blocked } }),
      invalidatesTags: (r, e, { id }) => [{ type: 'User', id }, 'Users', 'Overview', 'Audit'],
    }),
    // ===== UGC (التسويق بالعمولة) =====
    // enable/disable/setRate — بيفعّل الحساب كمسوّق أو يغيّر نسبته
    setUserUgc: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}/ugc`, method: 'POST', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'User', id }, 'Users', 'Audit', 'Ugc'],
    }),
    getWithdrawals: builder.query({
      query: ({ status = 'pending', page = 1 } = {}) => `/withdrawals?status=${status}&page=${page}`,
      providesTags: ['Withdrawals'],
    }),
    // كل حسابات المسوّقين (UGC) مع إحصائياتهم وإجمالي المستحقات
    getUgc: builder.query({
      query: () => '/ugc',
      providesTags: ['Ugc', 'Users'],
    }),
    // التحكم في ظهور القوالب للعملاء
    getSiteTemplates: builder.query({
      query: () => '/site-templates',
      providesTags: ['SiteTemplates'],
    }),
    saveSiteTemplates: builder.mutation({
      query: (body) => ({ url: '/site-templates', method: 'PUT', body }),
      invalidatesTags: ['SiteTemplates', 'Audit'],
    }),
    resolveWithdrawal: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/withdrawals/${id}`, method: 'POST', body }),
      invalidatesTags: ['Withdrawals', 'Audit', 'Ugc'],
    }),
    // تغيير باسورد العميل. الباسورد نفسه بيروح للسيرفر ومبيرجعش تاني
    // في أي رد — اللي بيتعرض في الشاشة هو اللي الأدمن كتبه/ولّده عنده.
    // مبنلمسش 'Overview' و'Users': مفيش رقم فيهم بيتغيّر — اللي بيتغيّر
    // عدد الجلسات المفتوحة في ملف العميل نفسه.
    setUserPassword: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}/password`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'User', id }, 'Audit'],
    }),

    // ===== الطلبات =====
    getOrders: builder.query({
      query: ({ status = 'pending', page = 1 } = {}) => `/orders?status=${status}&page=${page}`,
      providesTags: ['Orders'],
    }),
    // عدد الإيصالات اللي مستنية تفعيل — العداد اللي جنب "الطلبات" في القايمة
    getOrdersAttention: builder.query({
      query: () => '/orders/attention',
      providesTags: ['Orders'],
    }),
    // الأرباح — الفلوس جت من مين (كل عميل دافع). بتتحدّث مع أي تفعيل/إلغاء طلب
    // (نفس تاج Overview اللي بيتلغّى في الحالتين).
    getRevenue: builder.query({
      query: ({ page = 1 } = {}) => `/revenue?page=${page}`,
      providesTags: ['Overview'],
    }),
    activateOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/activate`, method: 'POST' }),
      invalidatesTags: ['Orders', 'Users', 'Overview', 'Audit'],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Orders', 'Overview', 'Audit'],
    }),

    // ===== الدعوات =====
    getInvitations: builder.query({
      query: ({ q = '', page = 1 } = {}) => `/invitations?q=${encodeURIComponent(q)}&page=${page}`,
      providesTags: ['Invitations'],
    }),

    // ===== الدعم =====
    getSupportThreads: builder.query({
      query: () => '/support',
      providesTags: ['Support'],
    }),
    getSupportThread: builder.query({
      query: (userId) => `/support/${userId}`,
      providesTags: (r, e, userId) => [{ type: 'Thread', id: userId }],
    }),
    replySupport: builder.mutation({
      query: ({ userId, body }) => ({ url: `/support/${userId}`, method: 'POST', body: { body } }),
      invalidatesTags: (r, e, { userId }) => [{ type: 'Thread', id: userId }, 'Support'],
    }),

    // ===== الإعدادات =====
    getPaymentSettings: builder.query({
      query: () => '/payment-settings',
      providesTags: ['Settings'],
    }),
    savePaymentSettings: builder.mutation({
      query: (body) => ({ url: '/payment-settings', method: 'PUT', body }),
      invalidatesTags: ['Settings', 'Audit'],
    }),
    getAdminPackages: builder.query({ query: () => '/packages', providesTags: ['Pricing'] }),

    // ===== أعطال الواجهة عند العملاء =====
    getClientErrors: builder.query({ query: () => '/client-errors' }),

    // ===== اللحظة دي + الأرباح شهر بشهر =====
    // مين على الموقع دلوقتي — الصفحة بتسأل كل 15 ثانية (pollingInterval)
    getLive: builder.query({ query: () => '/live' }),
    getRevenueMonthly: builder.query({
      query: (months = 12) => `/revenue-monthly?months=${months}`,
      providesTags: ['Overview'],
    }),

    // ===== أسعار الباقات وتشغيلها =====
    getPackagePrices: builder.query({
      query: () => '/package-prices',
      providesTags: ['Pricing'],
    }),
    savePackagePrices: builder.mutation({
      query: (body) => ({ url: '/package-prices', method: 'PUT', body }),
      invalidatesTags: ['Pricing', 'Audit'],
    }),

    // ===== الخصومات =====
    getPricingSettings: builder.query({
      query: () => '/pricing-settings',
      providesTags: ['Pricing'],
    }),
    savePricingSettings: builder.mutation({
      query: (body) => ({ url: '/pricing-settings', method: 'PUT', body }),
      invalidatesTags: ['Pricing', 'Audit'],
    }),

    // ===== مكتبة الموسيقى =====
    getTracks: builder.query({
      query: (q = '') => `/tracks?q=${encodeURIComponent(q)}`,
      providesTags: ['Tracks'],
    }),
    addTrack: builder.mutation({
      query: (body) => ({ url: '/tracks', method: 'POST', body }),
      invalidatesTags: ['Tracks', 'Audit'],
    }),
    updateTrack: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/tracks/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Tracks', 'Audit'],
    }),
    deleteTrack: builder.mutation({
      query: (id) => ({ url: `/tracks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tracks', 'Audit'],
    }),
    uploadTrackFile: builder.mutation({
      query: (formData) => ({ url: '/tracks/upload', method: 'POST', body: formData }),
    }),

    // ===== السجل =====
    getAudit: builder.query({
      query: (page = 1) => `/audit?page=${page}`,
      providesTags: ['Audit'],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useGetUserVisitsQuery,
  useUpdateSubscriptionMutation,
  useSetUserUgcMutation,
  useGetWithdrawalsQuery,
  useGetUgcQuery,
  useGetSiteTemplatesQuery,
  useSaveSiteTemplatesMutation,
  useResolveWithdrawalMutation,
  useBlockUserMutation,
  useSetUserPasswordMutation,
  useGetOrdersQuery,
  useGetOrdersAttentionQuery,
  useGetRevenueQuery,
  useActivateOrderMutation,
  useCancelOrderMutation,
  useGetInvitationsQuery,
  useGetSupportThreadsQuery,
  useGetSupportThreadQuery,
  useReplySupportMutation,
  useGetPaymentSettingsQuery,
  useSavePaymentSettingsMutation,
  useGetAdminPackagesQuery,
  useGetPricingSettingsQuery,
  useGetLiveQuery,
  useGetClientErrorsQuery,
  useGetRevenueMonthlyQuery,
  useGetPackagePricesQuery,
  useSavePackagePricesMutation,
  useSavePricingSettingsMutation,
  useGetAuditQuery,
  useGetTracksQuery,
  useAddTrackMutation,
  useUpdateTrackMutation,
  useDeleteTrackMutation,
  useUploadTrackFileMutation,
} = adminApi;
