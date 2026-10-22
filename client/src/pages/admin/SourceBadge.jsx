// العميل جه منين؟ — شارة صغيرة جنب اسمه (المتصلين دلوقتي + قايمة العملاء).
//   ad     = سجّل من لينك إعلان (/go/<code>) — بيبان اسم الحملة
//   ugc    = سجّل من لينك مسوّق (/r/<code>)
//   direct = دخل لوحده (مش من إعلان)
import { Megaphone, Share2 } from 'lucide-react';

export default function SourceBadge({ source, compact = false }) {
  const s = source || { type: 'direct' };
  if (s.type === 'ad') {
    return (
      <span
        className="inline-flex max-w-[160px] items-center gap-1 rounded-full bg-[#f2a33a]/15 px-2 py-0.5 text-[10.5px] font-extrabold text-[#f6bd6a]"
        title={`سجّل من إعلان: ${s.name || s.code}`}
        data-source="ad"
      >
        <Megaphone size={10} className="shrink-0" />
        <span className="truncate">{compact ? 'من إعلان' : `من إعلان · ${s.name || s.code}`}</span>
      </span>
    );
  }
  if (s.type === 'ugc') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#9c7fc9]/18 px-2 py-0.5 text-[10.5px] font-extrabold text-[#c3aef0]" title={`جه من لينك مسوّق: ${s.code}`} data-source="ugc">
        <Share2 size={10} /> من مسوّق
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-ivory/[0.06] px-2 py-0.5 text-[10.5px] font-bold text-ivory/45" title="دخل الموقع لوحده — مش من إعلان" data-source="direct">
      مش من إعلان
    </span>
  );
}
