// أعطال الواجهة — أي مرة عميل شاف "حصلت مشكلة غير متوقعة" (أو جزء من
// المحرر وقف) بتتسجّل هنا بسببها الحقيقي: الرسالة، الصفحة، كان بيعمل
// إيه، والجهاز. بتتمسح لوحدها بعد 60 يوم.
import { useState } from 'react';
import { AlertTriangle, ChevronDown, Download, Loader2, Monitor, Smartphone, User } from 'lucide-react';
import { useGetClientErrorsQuery } from '../../store/adminApi.js';
import { Panel, Spinner, Empty, fmtDate } from '../../components/admin/ui.jsx';

const WHERE = { page: 'الصفحة كلها', 'editor-panel': 'الشريط الجانبي في المحرر' };

/** زرار "نزّل ملف الأعطال": كل الأعطال (آخر 60 يوم) في ملف JSON واحد — ملخص متجمّع + التفاصيل — يتبعت للمطوّر */
function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function download() {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/admin/api/client-errors/export', { credentials: 'include', headers: { 'X-Admin-Request': '1' } });
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      const name = (/filename="([^"]+)"/.exec(r.headers.get('Content-Disposition') || '') || [])[1] || 'mithaq-client-errors.json';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      setErr('مقدرناش ننزّل الملف — جرّب تاني.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2 text-[12.5px] font-extrabold text-[#241608] disabled:opacity-60"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        نزّل ملف الأعطال
      </button>
      {err && <span className="text-[11px] text-error">{err}</span>}
    </div>
  );
}

export default function ClientErrorsPage() {
  const { data, isLoading } = useGetClientErrorsQuery(undefined, { pollingInterval: 60000 });
  const [open, setOpen] = useState(null);
  if (isLoading) return <Spinner />;
  const rows = data?.errors || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">أعطال الواجهة</h1>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ivory/45">
          أي خطأ حصل عند عميل في الموقع أو المحرر بيتسجّل هنا بسببه — عشان نصلّحه من أول مرة. بتتمسح لوحدها بعد 60 يوم.
        </p>
      </div>
      <ExportButton />
      </div>
      <Panel title={`آخر الأعطال (${rows.length})`}>
        {!rows.length ? <Empty>مفيش أعطال متسجّلة — كله تمام.</Empty> : (
          <ul className="divide-y divide-line-lite">
            {rows.map((r) => {
              const mobile = /Mobile|Android|iPhone/i.test(r.userAgent || '');
              const isOpen = open === r.id;
              return (
                <li key={r.id} className="py-3">
                  <button type="button" onClick={() => setOpen(isOpen ? null : r.id)} className="flex w-full items-start gap-3 text-start">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-error" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-ivory" dir="ltr">{r.message}</span>
                      <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ivory/45">
                        <span>{fmtDate(r.createdAt, true)}</span>
                        <span>{WHERE[r.where] || r.where || ''}</span>
                        <span dir="ltr">{r.path}</span>
                        <span className="inline-flex items-center gap-1">{mobile ? <Smartphone size={11} /> : <Monitor size={11} />}{mobile ? 'موبايل' : 'كمبيوتر'}</span>
                        {r.user && <span className="inline-flex items-center gap-1"><User size={11} />{r.user.name}</span>}
                      </span>
                    </span>
                    <ChevronDown size={15} className={`mt-1 shrink-0 text-ivory/40 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="mt-3 space-y-2 rounded-xl bg-night/60 p-3 text-[11px] text-ivory/60" dir="ltr">
                      {r.context && <div><b className="text-ivory/80">context:</b> {r.context}</div>}
                      {r.stack && <pre className="max-h-48 overflow-auto whitespace-pre-wrap">{r.stack}</pre>}
                      {r.componentStack && <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-ivory/40">{r.componentStack}</pre>}
                      <div className="text-ivory/35">{r.userAgent}</div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
