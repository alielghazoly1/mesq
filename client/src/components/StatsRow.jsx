import { useTranslation } from 'react-i18next';
import { useGetPublicStatsQuery } from '../store/api.js';

// الأرقام دي حقيقية — بتيجي من قاعدة البيانات زي ما هي، من غير أي
// حد أدنى ولا تقريب. (routes/invitations.js: /api/public-stats)
const numberFormatter = new Intl.NumberFormat('en-US');

function StatItem({ value, label, loading, compact }) {
  return (
    <div className="border-e border-ivory/10 px-2.5 text-center last:border-e-0 sm:px-4 sm:text-start">
      <span
        dir="ltr"
        className={`block font-serif font-bold leading-none text-brass-soft ${compact ? 'text-[clamp(17px,4.4vw,26px)]' : 'text-[clamp(22px,5.2vw,34px)]'}`}
      >
        {loading ? '—' : numberFormatter.format(value || 0)}
      </span>
      <span className={`block leading-[1.5] text-[#a9bab1] ${compact ? 'mt-1 text-[10px] sm:text-[11.5px]' : 'mt-2 text-[11.5px] sm:text-[12.5px]'}`}>{label}</span>
    </div>
  );
}

/** compact: أصغر ومن غير مسافة كبيرة فوقها (تحت كارت الآراء على الموبايل) */
export default function StatsRow({ compact = false }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPublicStatsQuery();

  return (
    <div className={`grid grid-cols-3 gap-0 border-t border-ivory/10 ${compact ? 'mt-0 pt-3' : 'mt-9 pt-6 lg:mt-12 lg:pt-7'}`}>
      <StatItem compact={compact} value={data?.totalInvitations} label={t('hero.statInvitations')} loading={isLoading} />
      <StatItem compact={compact} value={data?.totalViews} label={t('hero.statViews')} loading={isLoading} />
      <StatItem compact={compact} value={data?.totalUsers} label={t('hero.statUsers')} loading={isLoading} />
    </div>
  );
}
