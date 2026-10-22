// فورم تسجيل/تعديل مصروف — مشترك بين صفحة المصاريف وصفحة الأرباح.
import { useState, useEffect } from 'react';
import { Plus, Pencil, Repeat, X } from 'lucide-react';
import { useCreateExpenseMutation, useUpdateExpenseMutation } from '../../store/adminApi.js';
import { Btn } from '../../components/admin/ui.jsx';

export const CUR_LABEL = { EGP: 'جنيه', USD: 'دولار', SAR: 'ريال', EUR: 'يورو' };
export const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ExpenseForm({ categories, editing, onDone, defaultRecurring = false }) {
  const blank = { title: '', amount: '', currency: 'EGP', category: 'hosting', date: todayInput(), recurring: defaultRecurring, note: '' };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const [create, { isLoading: creating }] = useCreateExpenseMutation();
  const [update, { isLoading: updating }] = useUpdateExpenseMutation();
  useEffect(() => {
    if (editing) {
      const d = new Date(editing.date);
      setF({
        title: editing.title, amount: String(editing.amount), currency: editing.currency, category: editing.category,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        recurring: !!editing.recurring, note: editing.note || '',
      });
    } else setF(blank);
    setErr('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!f.title.trim()) { setErr('اكتب اسم المصروف.'); return; }
    if (!(Number(f.amount) > 0)) { setErr('اكتب المبلغ.'); return; }
    try {
      const body = { ...f, amount: Number(f.amount) };
      if (editing) await update({ id: editing.id, ...body }).unwrap();
      else await create(body).unwrap();
      setF(blank);
      onDone && onDone();
    } catch (ex) { setErr(ex?.data?.error || 'معرفناش نحفظ — جرّب تاني.'); }
  }
  const input = 'w-full rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[13.5px] text-ivory placeholder:text-ivory/30 focus:border-brass/60 focus:outline-none';
  return (
    <form onSubmit={submit} className="rounded-2xl border border-brass/30 bg-brass/[0.05] p-4" data-expense-form>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-[15px] font-bold text-brass-soft">{editing ? 'عدّل المصروف' : 'سجّل مصروف'}</h3>
        {editing && <button type="button" onClick={onDone} className="text-ivory/50 hover:text-ivory"><X size={16} /></button>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[12px] text-ivory/55">الاسم</span>
          <input name="title" className={input} value={f.title} onChange={set('title')} maxLength={80} placeholder="مثلًا: استضافة Hostinger" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ivory/55">المبلغ</span>
          <input name="amount" className={input} value={f.amount} onChange={set('amount')} inputMode="decimal" placeholder="0" dir="ltr" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ivory/55">العملة</span>
          <select name="currency" className={input} value={f.currency} onChange={set('currency')}>
            {Object.keys(CUR_LABEL).map((c) => <option key={c} value={c}>{CUR_LABEL[c]} ({c})</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ivory/55">النوع</span>
          <select name="category" className={input} value={f.category} onChange={set('category')}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ivory/55">{f.recurring ? 'من شهر' : 'اليوم'}</span>
          <input name="date" type="date" className={input} value={f.date} onChange={set('date')} max={todayInput()} />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[12px] text-ivory/55">ملاحظة (اختياري)</span>
          <input name="note" className={input} value={f.note} onChange={set('note')} maxLength={300} />
        </label>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13px] text-ivory/80">
        <input type="checkbox" name="recurring" checked={f.recurring} onChange={set('recurring')} className="h-4 w-4 accent-[#c9a24a]" />
        <Repeat size={14} className="text-brass-soft" />
        مصروف شهري ثابت — بيتخصم لوحده كل شهر لحد ما توقّفه
      </label>
      {err && <p className="mt-2 text-[12.5px] text-error">{err}</p>}
      <div className="mt-3 flex gap-2">
        <Btn tone="gold" type="submit" loading={creating || updating} icon={editing ? Pencil : Plus}>{editing ? 'احفظ التعديل' : 'ضيف المصروف'}</Btn>
        {editing && <Btn onClick={onDone}>إلغاء</Btn>}
      </div>
    </form>
  );
}

