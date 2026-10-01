// صفحة القوالب — المالك بيتحكم في المعرض اللي العملاء بيشوفوه:
//   • الترتيب: أنهي قالب يظهر الأول والتاني… (أسهم فوق/تحت، أو "خليه الأول")
//   • شارة "جديد": تظهر على كارت القالب في المعرض أو تتشال
//   • الإخفاء: يشيل القالب من القايمة (الدعوات الموجودة بتفضل شغالة عادي)
// كل تغيير بيتحفظ على طول — والمعرض بيتغيّر عند الزوار مع أول تحميل.
import { useState } from 'react';
import {
  Eye, EyeOff, ArrowUp, ArrowDown, ChevronsUp, Sparkles, ExternalLink,
} from 'lucide-react';
import { useGetSiteTemplatesQuery, useSaveSiteTemplatesMutation } from '../../store/adminApi.js';
import { Spinner } from '../../components/admin/ui.jsx';

export default function TemplatesPage() {
  const { data, isLoading } = useGetSiteTemplatesQuery();
  const [save, { isLoading: saving }] = useSaveSiteTemplatesMutation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null); // `${id}:${action}`
  const templates = data?.templates || [];
  const visibleCount = templates.filter((t) => !t.hidden).length;

  async function run(key, body) {
    setError('');
    setBusy(key);
    try {
      await save(body).unwrap();
    } catch (e) {
      setError(e?.data?.error || 'حصل خطأ، جرّب تاني.');
    } finally {
      setBusy(null);
    }
  }

  const ids = templates.map((t) => t.id);

  function move(index, to) {
    if (to < 0 || to >= ids.length || to === index) return;
    const next = [...ids];
    const [it] = next.splice(index, 1);
    next.splice(to, 0, it);
    run(`${it}:move`, { templateOrder: next });
  }

  function toggleNew(t) {
    const current = templates.filter((x) => x.isNew).map((x) => x.id);
    const next = t.isNew ? current.filter((x) => x !== t.id) : [...current, t.id];
    run(`${t.id}:new`, { newTemplates: next });
  }

  function toggleHidden(t) {
    const hiddenNow = templates.filter((x) => x.hidden).map((x) => x.id);
    const next = t.hidden ? hiddenNow.filter((x) => x !== t.id) : [...hiddenNow, t.id];
    run(`${t.id}:hide`, { hiddenTemplates: next });
  }

  if (isLoading) return <Spinner />;

  const iconBtn = 'flex h-8 w-8 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition hover:border-brass/50 hover:text-brass disabled:opacity-30 disabled:hover:border-ivory/15 disabled:hover:text-ivory/70';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">القوالب</h1>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ivory/45">
          رتّب القوالب زي ما هتظهر للعملاء في المعرض (الأول فوق)، وحط أو شيل شارة "جديد"،
          واخفي أي قالب. الدعوات الموجودة بتفضل شغالة عادي. ({visibleCount} ظاهر من {templates.length})
        </p>
      </div>

      {error && <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {templates.map((t, i) => (
          <div
            key={t.id}
            className={`flex flex-col overflow-hidden rounded-2xl border transition ${
              t.hidden ? 'border-ivory/10 opacity-70' : t.isNew ? 'border-rose/50' : 'border-brass/30'
            }`}
          >
            <div className="relative aspect-[3/4] shrink-0 overflow-hidden bg-night">
              <img
                src={t.thumb}
                alt={t.name}
                loading="lazy"
                className="h-full w-full object-cover object-top"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              />
              {/* الترتيب في المعرض */}
              <span className="absolute start-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-night/85 px-2 text-[12px] font-extrabold text-brass-soft">
                {i + 1}
              </span>
              {t.isNew && (
                <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-[#b9506a] to-[#d4778d] px-2.5 py-1 text-[10.5px] font-extrabold tracking-wide text-white shadow">
                  <Sparkles size={11} /> جديد
                </span>
              )}
              {t.hidden && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-full bg-ivory/15 px-3 py-1 text-[11px] font-bold text-ivory/80">مخفي</span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-ivory">{t.name}</div>
                  {t.description && <div className="mt-0.5 line-clamp-2 text-[10.5px] text-ivory/40">{t.description}</div>}
                </div>
                <a href={`/preview-sample/${t.id}`} target="_blank" rel="noopener noreferrer"
                  title="معاينة" className="shrink-0 text-ivory/40 hover:text-brass">
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* الترتيب */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex gap-1.5">
                  <button type="button" title="لفوق" aria-label="لفوق" className={iconBtn}
                    disabled={i === 0 || saving} onClick={() => move(i, i - 1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" title="لتحت" aria-label="لتحت" className={iconBtn}
                    disabled={i === templates.length - 1 || saving} onClick={() => move(i, i + 1)}>
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button type="button" disabled={i === 0 || saving} onClick={() => move(i, 0)}
                  className="inline-flex items-center gap-1 rounded-full border border-ivory/15 px-2.5 py-1.5 text-[11px] font-bold text-ivory/70 transition hover:border-brass/50 hover:text-brass disabled:opacity-30">
                  <ChevronsUp size={13} /> خليه الأول
                </button>
              </div>

              {/* شارة "جديد" */}
              <button
                type="button"
                onClick={() => toggleNew(t)}
                disabled={saving && busy === `${t.id}:new`}
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition disabled:opacity-50 ${
                  t.isNew
                    ? 'border border-rose/40 bg-rose/15 text-rose-bright hover:bg-rose/25'
                    : 'border border-ivory/15 text-ivory/70 hover:border-rose/50 hover:text-rose-bright'
                }`}
              >
                <Sparkles size={13} /> {t.isNew ? 'شيل "جديد"' : 'حط عليه "جديد"'}
              </button>

              <button
                type="button"
                onClick={() => toggleHidden(t)}
                disabled={saving && busy === `${t.id}:hide`}
                className={`mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition disabled:opacity-50 ${
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
