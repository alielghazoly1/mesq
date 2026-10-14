// ترتيب واضح بالأرقام بدل الدايرة — للتصاميم والباقات في لوحة التحكم.
//
// الدايرة مابتقولش أرقام: لازم تقف على كل حتة عشان تعرف دي كام، والحتت
// الصغيرة مابتبانش أصلًا. هنا كل سطر فيه: الترتيب، الاسم، العدد الحقيقي،
// نسبته من الكل، شريط طوله على قد العدد، وكام منه في الفترة المختارة —
// والحاجة اللي محدش استخدمها بتبان بصفر بدل ما تختفي.
import { motion } from 'motion/react';
import { fmtNum } from './ui.jsx';

const pctOf = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0);

/**
 * @param {{
 *   rows: {id:string,label:string,count:number,periodCount?:number}[],
 *   unit: string,             // "دعوة" / "باقة"
 *   periodLabel: string,      // "آخر شهر"
 *   renderExtra?: (row) => any, // سطر إضافي تحت الشريط (فلوس الباقة مثلًا)
 *   emptyLabel?: string,
 * }} props
 */
export default function RankedBars({ rows, unit, periodLabel, renderExtra, emptyLabel = 'لسه محدش استخدمه' }) {
  const total = rows.reduce((a, r) => a + (r.count || 0), 0);
  const totalPeriod = rows.reduce((a, r) => a + (r.periodCount || 0), 0);
  const max = Math.max(1, ...rows.map((r) => r.count || 0));
  const leader = rows.find((r) => r.count > 0);

  return (
    <div>
      {/* الملخص فوق: الإجمالي، اللي في الفترة، والأول */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-ivory/[0.04] px-3 py-2.5">
          <div className="text-[11px] text-ivory/45">الإجمالي</div>
          <div className="mt-0.5 font-serif text-[20px] font-bold leading-tight text-ivory" data-ranked-total>{fmtNum(total)}</div>
          <div className="text-[10.5px] text-ivory/35">{unit}</div>
        </div>
        <div className="rounded-xl bg-ivory/[0.04] px-3 py-2.5">
          <div className="text-[11px] text-ivory/45">{periodLabel}</div>
          <div className="mt-0.5 font-serif text-[20px] font-bold leading-tight text-emerald-bright" data-ranked-period><span dir="ltr">+{fmtNum(totalPeriod)}</span></div>
          <div className="text-[10.5px] text-ivory/35">{unit}</div>
        </div>
        <div className="min-w-0 rounded-xl bg-brass/[0.10] px-3 py-2.5">
          <div className="text-[11px] text-brass-soft/70">الأول</div>
          <div className="mt-0.5 line-clamp-2 break-words text-[13.5px] font-bold leading-tight text-brass-soft" title={leader ? leader.label : ''}>
            {leader ? leader.label : '—'}
          </div>
          <div className="text-[10.5px] text-brass-soft/60">{leader ? `${pctOf(leader.count, total)}% من الكل` : ''}</div>
        </div>
      </div>

      <ol className="space-y-3.5">
        {rows.map((r, i) => {
          const zero = !r.count;
          const p = pctOf(r.count, total);
          return (
            <li key={r.id} data-ranked-row={r.id} className={zero ? 'opacity-55' : ''}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-baseline gap-2.5">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ${
                      i === 0 && !zero ? 'bg-brass text-[#241608]' : 'bg-ivory/[0.08] text-ivory/60'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate text-[13.5px] font-bold text-ivory/90">{r.label}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <span className="font-serif text-[17px] font-bold text-ivory" data-ranked-count>{fmtNum(r.count)}</span>
                  <span className="text-[11px] text-ivory/40">{unit}</span>
                  <span className="w-12 text-end text-[12px] font-bold text-ivory/60" data-ranked-pct>{p}%</span>
                </span>
              </div>
              <div className="ms-7 h-2.5 overflow-hidden rounded-full bg-ivory/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${zero ? 0 : Math.max(2, (r.count / max) * 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                  className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-l from-brass to-brass-soft' : 'bg-gradient-to-l from-emerald to-emerald-bright'}`}
                />
              </div>
              <div className="ms-7 mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[11.5px]">
                <span className={r.periodCount ? 'font-bold text-emerald-bright' : 'text-ivory/35'}>
                  {zero ? emptyLabel : r.periodCount ? `+${fmtNum(r.periodCount)} في ${periodLabel}` : `مفيش جديد في ${periodLabel}`}
                </span>
                {renderExtra && renderExtra(r)}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
