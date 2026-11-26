// رسم المشاهدات يوم بيوم (تبويب "نظرة عامة") — ملف لوحده عشان مكتبة الرسوم (recharts، تقيلة)
// تتحمّل بس لما الرسم يظهر فعلًا، مش مع لوحة العميل كلها (OverviewTab.jsx بيحمّله كسول).
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { fmtNum } from './dashUtils.js';

export default function ViewsChart({ series, lang }) {
  const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a24a" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#c9a24a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f1d18" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#0f1d18" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,29,24,.07)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: '#8a7a68' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10.5, fill: '#8a7a68' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 14, border: '1px solid rgba(15,29,24,.1)', fontSize: 12, direction: lang === 'en' ? 'ltr' : 'rtl' }}
          formatter={(v, n) => [fmtNum(v, lang), n === 'views' ? t('dash2.mViews') : t('dash2.mUniques')]}
        />
        <Area type="monotone" dataKey="views" stroke="#b08d57" strokeWidth={2.2} fill="url(#gv)" />
        <Area type="monotone" dataKey="uniques" stroke="#0f1d18" strokeWidth={1.6} fill="url(#gu)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
