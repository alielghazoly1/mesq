// صفحة القوالب — المالك بيتحكم في القوالب اللي بتظهر للعملاء وقت إنشاء
// دعوة. يقدر يخفي أي قالب ويرجّعه وقت ما يحب. الإخفاء بيأثر على القايمة
// اللي العميل بيختار منها بس — الدعوات الموجودة بتفضل شغالة عادي.
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useGetSiteTemplatesQuery, useSaveSiteTemplatesMutation } from '../../store/adminApi.js';
import { Spinner } from '../../components/admin/ui.jsx';

export default function TemplatesPage() {
  const { data, isLoading } = useGetSiteTemplatesQuery();
  const [save, { isLoading: saving }] = useSaveSiteTemplatesMutation();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const templates = data?.templates || [];
  const visibleCount = templates.filter((t) => !t.hidden).length;

  async function toggle(id, currentlyHidden) {
    setError('');
    setBusyId(id);
    const hiddenNow = templates.filter((t) => t.hidden).map((t) => t.id);
    const next = currentlyHidden ? hiddenNow.filter((x) => x !== id) : [...hiddenNow, id];
    try {
      await save({ hiddenTemplates: next }).unwrap();
    } catch (e) {
      setError(e?.data?.error || 'حصل خطأ، جرّب تاني.');
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">القوالب</h1>
        <p className="mt-0.5 text-[12.5px] text-ivory/45">
          اتحكم في القوالب اللي بتظهر للعملاء وقت إنشاء دعوة — اخفي أو اظهر أي قالب.
          الدعوات الموجودة اللي بتستخدمه بتفضل شغالة عادي. ({visibleCount} ظاهر من {templates.length})
        </p>
      </div>

      {error && <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className={`overflow-hidden rounded-2xl border transition ${t.hidden ? 'border-ivory/10 opacity-70' : 'border-brass/30'}`}
          >
            <div className="relative aspect-[3/4] bg-night">
              <img
                src={t.thumb}
                alt={t.name}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              />
              {t.hidden && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-full bg-ivory/15 px-3 py-1 text-[11px] font-bold text-ivory/80">مخفي</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="truncate text-[13px] font-bold text-ivory">{t.name}</div>
              {t.description && <div className="mt-0.5 line-clamp-2 text-[10.5px] text-ivory/40">{t.description}</div>}
              <button
                type="button"
                onClick={() => toggle(t.id, t.hidden)}
                disabled={saving && busyId === t.id}
                className={`mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition disabled:opacity-50 ${
                  t.hidden
                    ? 'bg-ok text-[#04170f] hover:brightness-110'
                    : 'border border-ivory/20 text-ivory/70 hover:border-error/50 hover:text-error'
                }`}
              >
                {t.hidden ? <><Eye size={13} /> اظهره للعملاء</> : <><EyeOff size={13} /> اخفيه</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
