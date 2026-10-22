// صفحة المصاريف — كل اللي بتصرفه في مكان واحد:
//   • التزاماتك الشهرية الثابتة (الاستضافة والاشتراكات…) = المفروض تدفع كام كل شهر
//   • مصاريف أي شهر: الإعلانات (تلقائي)، عمولات المسوّقين (تلقائي)، واللي بتسجّله إنت
//   • سجل كل المصاريف اللي سجّلتها — تعديل / توقيف / مسح
// الأرقام من نفس حسابات صفحة الأرباح (GET /admin/api/finance) فمفيش أي اختلاف بينهم.
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Repeat, Receipt, Megaphone, Share2, Plus, Pencil, Trash2, PauseCircle, PlayCircle, CalendarDays,
  TrendingUp, TrendingDown, ArrowLeft, Wallet, CalendarClock,
} from 'lucide-react';
import { useGetFinanceQuery, useUpdateExpenseMutation, useDeleteExpenseMutation } from '../../store/adminApi.js';
import {
  Panel, Badge, Btn, Table, Row, Cell, Spinner, Empty, fmtDate, fmtNum, fmtMoney,
} from '../../components/admin/ui.jsx';
import ExpenseForm from './ExpenseForm.jsx';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const monthLabel = (k) => {
  if (!k || k === 'all') return 'كل الوقت';
  const [y, m] = k.split('-').map(Number);
  return `${MONTHS_AR[m - 1]} ${y}`;
};
const monthOf = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`; };
const egp = (n) => { const v = Math.round(Number(n) || 0); return `${v < 0 ? '−' : ''}${fmtNum(Math.abs(v))} ج.م`; };

function Delta({ value }) {
  if (value == null) return <span className="text-[11px] text-ivory/35">مفيش مقارنة</span>;
  const good = value <= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-bold ${good ? 'text-emerald-bright' : 'text-error'}`}>
      <Icon size={13} /> <span dir="ltr">{value > 0 ? '+' : ''}{value}%</span>
      <span className="font-normal text-ivory/40">عن الشهر اللي فات</span>
    </span>
  );
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [month, setMonth] = useState('');
  const { data, isLoading, isFetching, isError } = useGetFinanceQuery(month);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null); // null | 'once' | 'monthly' | 'edit'
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const formRef = useRef(null);

  const openForm = (kind, item = null) => {
    setEditing(item); setForm(kind);
    setTimeout(() => formRef.current && formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };
  async function remove(item) {
    if (!window.confirm(`تمسح "${item.title}"؟${item.recurring ? ' هيتشال من كل الشهور اللي اتحسب فيها.' : ''}`)) return;
    try { await deleteExpense(item.id).unwrap(); } catch (ex) { window.alert(ex?.data?.error || 'معرفناش نمسح'); }
  }
  async function toggleStop(item) {
    try { await updateExpense({ id: item.id, stop: item.active }).unwrap(); } catch (ex) { window.alert(ex?.data?.error || 'معرفناش نحفظ'); }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <h1 className="font-serif text-[21px] font-bold text-ivory">المصاريف</h1>
        {isError ? <Empty>معرفناش نحمّل المصاريف — جرّب تاني.</Empty> : <Spinner label="بنحسب المصاريف..." />}
      </div>
    );
  }

  const sel = data.month; const ex = data.expenses; const cm = data.commitments;
  const isAll = sel === 'all';
  const recurring = data.expenseItems.filter((x) => x.recurring);
  const oneOff = data.expenseItems.filter((x) => !x.recurring);
  const rows = [
    ...ex.ads.map((a) => ({ ...a, group: 'ads' })),
    ...ex.commissions.map((c) => ({ ...c, group: 'commissions' })),
    ...ex.manual.map((m) => ({ ...m, group: 'manual' })),
  ];
  const itemOf = (id) => data.expenseItems.find((x) => x.id === id);
  const catLabel = (id) => (data.categories.find((c) => c.id === id) || {}).label || '';
  const maxCat = Math.max(1, ...cm.byCategory.map((c) => c.eq));
  const actions = (item) => (
    <span className="flex shrink-0 gap-1">
      <button type="button" title="عدّل" onClick={() => openForm('edit', item)} className="rounded-lg p-1.5 text-ivory/45 hover:bg-ivory/10 hover:text-ivory"><Pencil size={14} /></button>
      <button type="button" title="امسح" onClick={() => remove(item)} className="rounded-lg p-1.5 text-ivory/45 hover:bg-error/15 hover:text-error" data-delete-expense><Trash2 size={14} /></button>
    </span>
  );

  return (
    <div className="space-y-5" data-expenses-page>
      {/* ===== العنوان + الشهر ===== */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">المصاريف</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">كل اللي بتصرفه — الثابت كل شهر، والإعلانات وعمولات المسوّقين (تلقائي)، وأي مصروف تاني.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-line-lite bg-panel px-3 py-1.5 text-[12.5px] text-ivory/70">
            <CalendarDays size={14} className="text-brass-soft" />
            <select name="month" value={sel} onChange={(e) => setMonth(e.target.value)} className="bg-transparent font-bold text-ivory focus:outline-none" data-month-picker>
              {data.months.map((k) => <option key={k} value={k} className="bg-night">{monthLabel(k)}</option>)}
              <option value="all" className="bg-night">كل الوقت</option>
            </select>
          </label>
          <Btn size="sm" icon={Wallet} onClick={() => navigate('/admin/earnings')}>الأرباح</Btn>
          {isFetching && <span className="text-[11.5px] text-ivory/40">بيحدّث...</span>}
        </div>
      </div>

      {/* ===== الالتزامات الشهرية الثابتة ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-brass/35 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(201,162,74,0.16),transparent_55%)] bg-panel p-5" data-commitments>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-brass-soft"><CalendarClock size={15} /> التزاماتك الشهرية الثابتة</div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <span className="font-serif text-[44px] font-bold leading-none text-ivory" data-commit-total>{egp(cm.eq)}</span>
              <span className="mb-1.5 text-[13px] text-ivory/50">كل شهر</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ivory/55">
              {cm.count
                ? <>ده اللي المفروض تدفعه كل شهر من {fmtNum(cm.count)} مصروف ثابت شغال — يعني ≈ <b className="text-ivory/80">{egp(cm.yearly)}</b> في السنة.</>
                : 'لسه مسجّلتش أي مصروف شهري ثابت (استضافة، اشتراكات، فريق…).'}
            </p>
            {cm.ordersToCover != null && cm.eq > 0 && (
              <p className="mt-1.5 text-[12.5px] text-ivory/55">عشان تغطيهم محتاج ≈ <b className="text-brass-soft">{fmtNum(cm.ordersToCover)} طلب</b> في الشهر (بمتوسط الطلب في {monthLabel(sel)}).</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(cm.byCurrency).map(([c, v]) => (
                <span key={c} className="rounded-xl border border-line-lite bg-night/40 px-3 py-1.5 text-[12px] font-bold text-ivory/80">{fmtMoney(v, c)} / شهر</span>
              ))}
            </div>
            <div className="mt-4">
              <Btn tone="gold" icon={Repeat} onClick={() => openForm('monthly')}>ضيف مصروف شهري</Btn>
            </div>
          </div>
          <div>
            {cm.byCategory.length ? (
              <ol className="space-y-3">
                {cm.byCategory.map((c, i) => (
                  <li key={c.id}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
                      <span className="font-bold text-ivory/85">{c.label}</span>
                      <span className="font-serif text-[15px] font-bold text-ivory">{egp(c.eq)} <span className="text-[11px] font-normal text-ivory/40">/ شهر</span></span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-ivory/[0.06]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(3, (c.eq / maxCat) * 100)}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                        className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-l from-brass to-brass-soft' : 'bg-gradient-to-l from-emerald to-emerald-bright'}`} />
                    </div>
                  </li>
                ))}
              </ol>
            ) : <Empty>المصاريف الشهرية بتتقسّم هنا حسب نوعها.</Empty>}
          </div>
        </div>
      </section>

      {/* ===== الفورم ===== */}
      <div ref={formRef}>
        <AnimatePresence>
          {form && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <ExpenseForm
                key={`${form}-${editing ? editing.id : 'new'}`}
                categories={data.categories}
                editing={form === 'edit' ? editing : null}
                defaultRecurring={form === 'monthly'}
                onDone={() => { setEditing(null); setForm(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== أرقام الشهر ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 rounded-2xl border border-error/30 bg-error/[0.06] p-4 lg:col-span-1">
          <Receipt size={16} className="text-[#e8a597]" />
          <div className="mt-2.5 font-serif text-[27px] font-bold leading-none text-[#e8a597]" data-month-total>{egp(ex.eq)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/60">إجمالي مصاريف {monthLabel(sel)}</div>
          {!isAll && <div className="mt-1">{data.prev ? <Delta value={data.prev.expensesChange} /> : null}</div>}
        </div>
        <div className="rounded-2xl border border-line-lite bg-panel p-4">
          <Megaphone size={16} className="text-[#f6bd6a]" />
          <div className="mt-2.5 font-serif text-[23px] font-bold leading-none text-ivory">{egp(ex.totals.ads)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/55">إعلانات <Badge tone="muted">تلقائي</Badge></div>
        </div>
        <div className="rounded-2xl border border-line-lite bg-panel p-4">
          <Share2 size={16} className="text-[#c3aef0]" />
          <div className="mt-2.5 font-serif text-[23px] font-bold leading-none text-ivory">{egp(ex.totals.commissions)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/55">عمولات مسوّقين <Badge tone="muted">تلقائي</Badge></div>
        </div>
        <div className="rounded-2xl border border-line-lite bg-panel p-4">
          <Repeat size={16} className="text-brass-soft" />
          <div className="mt-2.5 font-serif text-[23px] font-bold leading-none text-ivory">{egp(ex.totals.manual)}</div>
          <div className="mt-1.5 text-[12px] text-ivory/55">مصاريفك (ثابت + مرة واحدة)</div>
        </div>
      </div>

      {/* ===== المصاريف الشهرية الثابتة ===== */}
      <Panel
        title="المصاريف الشهرية الثابتة"
        subtitle="بتتخصم لوحدها كل شهر لحد ما توقّفها — والموقوف بيفضل محسوب في الشهور اللي فاتت"
        action={<Btn size="sm" tone="gold" icon={Plus} onClick={() => openForm('monthly')}>ضيف شهري</Btn>}
      >
        {recurring.length === 0 ? <Empty>مفيش مصاريف شهرية لسه.</Empty> : (
          <Table head={['المصروف', 'النوع', 'كل شهر', 'بالجنيه', 'من', 'الحالة', '']}>
            {recurring.map((x) => (
              <Row key={x.id}>
                <Cell><span className="font-bold text-ivory" data-recurring-row={x.active ? 'on' : 'off'}>{x.title}</span>{x.note && <div className="text-[11px] text-ivory/40">{x.note}</div>}</Cell>
                <Cell className="text-ivory/60">{x.categoryLabel}</Cell>
                <Cell className="whitespace-nowrap font-bold text-brass-soft">{fmtMoney(x.amount, x.currency)}</Cell>
                <Cell className="whitespace-nowrap text-ivory/60">{egp(x.eq)}</Cell>
                <Cell className="whitespace-nowrap text-ivory/50">{monthLabel(monthOf(x.date))}{x.endedAt ? <div className="text-[11px]">لحد {monthLabel(monthOf(x.endedAt))}</div> : null}</Cell>
                <Cell>{x.active ? <Badge tone="ok">شغال</Badge> : <Badge tone="muted">واقف</Badge>}</Cell>
                <Cell>
                  <span className="flex items-center gap-1">
                    <Btn size="sm" icon={x.active ? PauseCircle : PlayCircle} onClick={() => toggleStop(x)}>{x.active ? 'وقّفه' : 'شغّله'}</Btn>
                    {actions(x)}
                  </span>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      {/* ===== مصاريف الشهر المختار ===== */}
      <Panel
        title={`مصاريف ${monthLabel(sel)}`}
        subtitle={`${egp(ex.eq)} · ${fmtNum(rows.length)} بند`}
        action={<Btn size="sm" icon={Plus} onClick={() => openForm('once')}>مصروف مرة واحدة</Btn>}
      >
        {rows.length === 0 ? <Empty>مفيش مصاريف في الفترة دي.</Empty> : (
          <ul className="divide-y divide-line-lite" data-expense-list>
            {rows.map((e) => (
              <li key={`${e.group}-${e.id}`} className="flex flex-wrap items-center gap-3 py-3" data-expense-row={e.group}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${e.group === 'ads' ? 'bg-[#f2a33a]/15 text-[#f6bd6a]' : e.group === 'commissions' ? 'bg-[#9c7fc9]/18 text-[#c3aef0]' : 'bg-ivory/[0.07] text-ivory/60'}`}>
                  {e.group === 'ads' ? <Megaphone size={16} /> : e.group === 'commissions' ? <Share2 size={16} /> : e.recurring ? <Repeat size={16} /> : <Receipt size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-bold text-ivory">
                    {e.group === 'commissions' ? `عمولة: ${e.title}` : e.title}
                    {e.group !== 'manual' && <Badge tone="muted">تلقائي</Badge>}
                    {e.group === 'manual' && e.recurring && <Badge tone="gold">شهري{e.months > 1 ? ` × ${e.months}` : ''}</Badge>}
                  </span>
                  <span className="block text-[11.5px] text-ivory/45">
                    {e.group === 'ads' ? `إعلان · بدأ ${fmtDate(e.date)}` : e.group === 'commissions' ? `اتدفعت ${fmtDate(e.date)}`
                      : `${catLabel(e.category)}${e.recurring ? '' : ` · ${fmtDate(e.date)}`}`}
                  </span>
                </span>
                <span className="text-end">
                  <b className="block font-serif text-[16px] text-[#e8a597]">{egp(e.eq)}</b>
                  {e.currency !== 'EGP' && <span className="text-[11px] text-ivory/40">{fmtMoney(e.group === 'manual' ? e.total || e.amount : e.amount, e.currency)}</span>}
                </span>
                {e.group === 'manual' && itemOf(e.id) && actions(itemOf(e.id))}
                {e.group === 'ads' && <button type="button" onClick={() => navigate('/admin/campaigns')} className="text-[11.5px] font-bold text-ivory/45 hover:text-brass-soft">الإعلانات ←</button>}
                {e.group === 'commissions' && <button type="button" onClick={() => navigate('/admin/withdrawals')} className="text-[11.5px] font-bold text-ivory/45 hover:text-brass-soft">السحوبات ←</button>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ===== سجل المصاريف اللي مرة واحدة ===== */}
      <Panel title="كل المصاريف اللي مرة واحدة" subtitle="سجل كامل بكل اللي سجّلته — الأحدث فوق">
        {oneOff.length === 0 ? <Empty>مفيش مصاريف مرة واحدة لسه.</Empty> : (
          <Table head={['اليوم', 'المصروف', 'النوع', 'المبلغ', 'بالجنيه', '']}>
            {oneOff.map((x) => (
              <Row key={x.id}>
                <Cell className="whitespace-nowrap text-ivory/55">{fmtDate(x.date)}</Cell>
                <Cell><span className="font-bold text-ivory">{x.title}</span>{x.note && <div className="text-[11px] text-ivory/40">{x.note}</div>}</Cell>
                <Cell className="text-ivory/60">{x.categoryLabel}</Cell>
                <Cell className="whitespace-nowrap font-bold text-brass-soft">{fmtMoney(x.amount, x.currency)}</Cell>
                <Cell className="whitespace-nowrap text-ivory/60">{egp(x.eq)}</Cell>
                <Cell>{actions(x)}</Cell>
              </Row>
            ))}
          </Table>
        )}
        <div className="mt-3 flex justify-end">
          <Btn size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/earnings')}>شوف صافي الربح في الأرباح</Btn>
        </div>
      </Panel>
    </div>
  );
}
