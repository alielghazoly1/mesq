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
import { recentlyActive, signalLocked } from '../lib/adminActivity.js';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/admin/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('X-Admin-Request', '1');
    // الأدمن لمس الشاشة في آخر دقيقة → الطلب ده "استخدام" بيمدّ الجلسة
    // (التحديث التلقائي من غير لمس مابيمدّهاش — قفل الـ 5 دقايق)
    if (recentlyActive()) headers.set('X-Admin-Active', '1');
    return headers;
  },
});

// الجلسة خلصت (خمول 5 دقايق أو خروج من جهاز تاني) → اللوحة تقفل على طول
const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error && result.error.status === 401) signalLocked('server');
  return result;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['Overview', 'Users', 'User', 'Orders', 'Invitations', 'Support', 'SupportUnread', 'Settings', 'Pricing', 'Thread', 'Audit', 'Tracks', 'Withdrawals', 'Ugc', 'SiteTemplates', 'Security', 'Cleanup', 'WhatsApp', 'Campaigns', 'GoogleLogin', 'Finance'],
  endpoints: (builder) => ({
    // ===== الأمان (التحقق بخطوتين) =====
    getSecurity: builder.query({ query: () => '/security', providesTags: ['Security'] }),
    start2fa: builder.mutation({ query: () => ({ url: '/security/2fa/setup', method: 'POST' }) }),
    enable2fa: builder.mutation({
      query: (code) => ({ url: '/security/2fa/enable', method: 'POST', body: { code } }),
      invalidatesTags: ['Security', 'Audit'],
    }),
    disable2fa: builder.mutation({
      query: (code) => ({ url: '/security/2fa/disable', method: 'POST', body: { code } }),
      invalidatesTags: ['Security', 'Audit'],
    }),
    newBackupCodes: builder.mutation({
      query: (code) => ({ url: '/security/2fa/backup-codes', method: 'POST', body: { code } }),
      invalidatesTags: ['Security', 'Audit'],
    }),

    // ===== واتساب (ربط بـ QR + رسالة مساعدة الدفع) =====
    getWhatsApp: builder.query({ query: () => '/whatsapp', providesTags: ['WhatsApp'] }),
    linkWhatsApp: builder.mutation({ query: () => ({ url: '/whatsapp/link', method: 'POST' }), invalidatesTags: ['WhatsApp', 'Audit'] }),
    unlinkWhatsApp: builder.mutation({ query: () => ({ url: '/whatsapp/unlink', method: 'POST' }), invalidatesTags: ['WhatsApp', 'Audit'] }),
    saveWhatsAppSettings: builder.mutation({
      query: (body) => ({ url: '/whatsapp/settings', method: 'PUT', body }),
      invalidatesTags: ['WhatsApp', 'Audit'],
    }),
    testWhatsApp: builder.mutation({
      query: (body) => ({ url: '/whatsapp/test', method: 'POST', body }),
      invalidatesTags: ['WhatsApp'],
    }),

    // ===== تنضيف الدعوات المجانية المنتهية =====
    getCleanupPreview: builder.query({ query: () => '/cleanup/preview', providesTags: ['Cleanup'], keepUnusedDataFor: 0 }),
    runCleanup: builder.mutation({
      query: () => ({ url: '/cleanup/run', method: 'POST', body: { confirm: 'DELETE', limit: 1000 } }),
    }),

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
      query: ({ page = 1, month = 'all' } = {}) => `/revenue?page=${page}&month=${encodeURIComponent(month)}`,
      providesTags: ['Overview'],
    }),
    // ===== صفحة الأرباح: الإيرادات − المصاريف = صافي الربح =====
    // بتتحدّث مع أي تفعيل طلب (Overview) أو تعديل ميزانية حملة (Campaigns)
    // أو سحب مسوّق (Withdrawals) — كلهم بيأثروا على الأرقام
    // ===== تحليلات الموقع (أجهزة / ساعات / مدة / مصادر) =====
    // طلبات يوم معيّن (اتفعّلت / اتطلبت) بالتفاصيل
    getOrdersDay: builder.query({
      query: ({ day = '', kind = 'activated' } = {}) => `/orders-day?day=${encodeURIComponent(day)}&kind=${kind}`,
      providesTags: ['Orders'],
    }),
    // ===== مباشر: رحلة الزوار خطوة بخطوة =====
    getLiveJourneys: builder.query({ query: () => '/journeys/live' }),
    getJourney: builder.query({ query: (id) => `/journeys/${id}` }),
    getUserJourneys: builder.query({ query: ({ id, page = 1 }) => `/users/${id}/journeys?page=${page}` }),
    getAnalytics: builder.query({
      query: (range = 'today') => `/analytics?range=${encodeURIComponent(range)}`,
    }),
    getFinance: builder.query({
      query: (month = '') => `/finance?month=${encodeURIComponent(month)}`,
      providesTags: ['Finance', 'Overview', 'Campaigns', 'Withdrawals'],
    }),
    saveFxRates: builder.mutation({
      query: (body) => ({ url: '/finance/rates', method: 'PUT', body }),
      invalidatesTags: (r, e) => (e ? [] : ['Finance', 'Audit']),
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: (r, e) => (e ? [] : ['Finance', 'Audit']),
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/expenses/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e) => (e ? [] : ['Finance', 'Audit']),
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e) => (e ? [] : ['Finance', 'Audit']),
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
      query: ({ q = '', page = 1, filter = 'all' } = {}) => `/invitations?q=${encodeURIComponent(q)}&page=${page}&filter=${filter}`,
      providesTags: ['Invitations'],
    }),

    // ===== الدعم =====
    // القايمة: { filter: all|unread|waiting, q }
    getSupportThreads: builder.query({
      query: ({ filter = 'all', q = '' } = {}) => `/support?filter=${encodeURIComponent(filter)}&q=${encodeURIComponent(q)}`,
      providesTags: ['Support'],
    }),
    // العدد جنب "الدعم" في القايمة الجانبية
    getSupportUnread: builder.query({
      query: () => '/support/unread',
      providesTags: ['SupportUnread'],
    }),
    getSupportThread: builder.query({
      query: (userId) => `/support/${userId}`,
      providesTags: (r, e, userId) => [{ type: 'Thread', id: userId }],
    }),
    replySupport: builder.mutation({
      query: ({ userId, body }) => ({ url: `/support/${userId}`, method: 'POST', body: { body } }),
      invalidatesTags: (r, e, { userId }) => [{ type: 'Thread', id: userId }, 'Support'],
    }),
    // رد بفويس: FormData (file + duration)
    replySupportVoice: builder.mutation({
      query: ({ userId, form }) => ({ url: `/support/${userId}/voice`, method: 'POST', body: form }),
      invalidatesTags: (r, e, { userId }) => [{ type: 'Thread', id: userId }, 'Support'],
    }),

    // ===== الإعدادات =====
    getPaymentSettings: builder.query({
      query: () => '/payment-settings',
      providesTags: ['Settings'],
    }),
    // لو الحفظ اترفض (عنوان غلط مثلًا) مبنعيدش تحميل البيانات — غير كده
    // الفورم بيرجع للقديم ويمسح اللي الأدمن كان كاتبه
    savePaymentSettings: builder.mutation({
      query: (body) => ({ url: '/payment-settings', method: 'PUT', body }),
      invalidatesTags: (r, e) => (e ? [] : ['Settings', 'Audit']),
    }),
    getAdminPackages: builder.query({ query: () => '/packages', providesTags: ['Pricing'] }),
    // الدخول بجوجل (Client ID + تشغيل/قفل)
    getGoogleLogin: builder.query({ query: () => '/google-login', providesTags: ['GoogleLogin'] }),
    saveGoogleLogin: builder.mutation({
      query: (body) => ({ url: '/google-login', method: 'PUT', body }),
      invalidatesTags: (r, e) => (e ? [] : ['GoogleLogin', 'Audit']),
    }),

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
    // ===== لينكات الإعلانات =====
    getCampaigns: builder.query({ query: () => '/campaigns', providesTags: ['Campaigns'] }),
    getCampaign: builder.query({ query: (id) => `/campaigns/${id}`, providesTags: ['Campaigns'] }),
    createCampaign: builder.mutation({
      query: (body) => ({ url: '/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaigns'],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/campaigns/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Campaigns'],
    }),
    getAudit: builder.query({
      query: (page = 1) => `/audit?page=${page}`,
      providesTags: ['Audit'],
    }),
  }),
});

export const {
  useGetGoogleLoginQuery, useSaveGoogleLoginMutation,
  useGetSecurityQuery, useStart2faMutation, useEnable2faMutation, useDisable2faMutation, useNewBackupCodesMutation,
  useGetCleanupPreviewQuery, useRunCleanupMutation,
  useGetWhatsAppQuery, useLinkWhatsAppMutation, useUnlinkWhatsAppMutation, useSaveWhatsAppSettingsMutation, useTestWhatsAppMutation,
  useGetOverviewQuery,
  useGetCampaignsQuery, useGetCampaignQuery, useCreateCampaignMutation, useUpdateCampaignMutation,
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
  useGetFinanceQuery,
  useGetAnalyticsQuery,
  useGetOrdersDayQuery,
  useGetLiveJourneysQuery,
  useGetJourneyQuery,
  useGetUserJourneysQuery,
  useSaveFxRatesMutation,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useActivateOrderMutation,
  useCancelOrderMutation,
  useGetInvitationsQuery,
  useGetSupportThreadsQuery,
  useGetSupportThreadQuery,
  useReplySupportMutation,
  useReplySupportVoiceMutation,
  useGetSupportUnreadQuery,
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
