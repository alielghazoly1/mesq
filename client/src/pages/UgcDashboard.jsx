// لوحة المسوّق بالعمولة (UGC) — بتظهر بدل لوحة العميل العادية لما الحساب
// يكون مفعّل كمسوّق. فيها لينك إحالته، إحصائياته (زيارات/تسجيلات/دافعين)،
// أرباحه بعملتين، رقم فودافون كاش، وطلبات السحب.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, Copy, MousePointerClick, UserPlus, Crown, Wallet, Banknote,
  Check, Clock, X as XIcon, Percent, ArrowRight, Save,
} from 'lucide-react';
import {
  useGetUgcDashboardQuery, useSetPayoutPhoneMutation, useRequestWithdrawalMutation,
} from '../store/api.js';
import Footer from '../components/Footer.jsx';

function Stat({ icon: Icon, value, label, gold }) {
  return (
    <div className={`rounded-2xl border p-4 ${gold ? 'border-brass/40 bg-brass/[0.06]' : 'border-line bg-card'}`}>
      <Icon size={17} className={gold ? 'text-brass' : 'text-emerald'} />
      <div className="mt-2.5 font-serif text-[26px] font-bold leading-none text-ink">{value}</div>
      <div className="mt-1.5 text-[12.5px] text-ink-dim">{label}</div>
    </div>
  );
}

const money = (n, c) => `${Number(n || 0).toLocaleString('en-US')} ${c === 'USD' ? '$' : 'ج'}`;

function WithdrawRow({ currency, available, phone, onDone }) {
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [request, { isLoading }] = useRequestWithdrawalMutation();
  async function submit() {
    setErr(''); setOkMsg('');
    const amt = Number(amount);
    if (!amt || amt <= 0) { setErr('اكتب مبلغ صحيح'); return; }
    if (amt > available) { setErr('المبلغ أكبر من المتاح'); return; }
    try {
      await request({ amount: amt, currency }).unwrap();
      setAmount(''); setOkMsg('اتبعت الطلب ✓'); setTimeout(() => setOkMsg(''), 3000);
      onDone && onDone();
    } catch (e) { setErr(e?.data?.error || 'حصل خطأ'); }
  }
  if (available <= 0) return null;
  return (
    <div className="rounded-xl border border-line bg-ivory/60 p-3.5">
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="font-bold text-ink">متاح للسحب ({currency === 'USD' ? 'دولار' : 'جنيه'})</span>
        <span className="font-bold text-emerald">{money(available, currency)}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="number" min="1" max={available} value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`المبلغ (لحد ${available})`}
          disabled={!phone}
          className="flex-1 rounded-full border border-line bg-card px-3.5 py-2 text-[13px] focus:border-brass focus:outline-none disabled:opacity-50"
        />
        <button
          type="button" onClick={submit} disabled={isLoading || !phone}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2 text-[12.5px] font-bold text-[#3a2708] hover:brightness-105 disabled:opacity-50"
        >
          <Banknote size={14} /> اسحب
        </button>
      </div>
      {!phone && <p className="mt-1.5 text-[11.5px] text-ink-dim">ضيف رقم فودافون كاش الأول عشان تقدر تسحب.</p>}
      {err && <p className="mt-1.5 text-[12px] text-error">{err}</p>}
      {okMsg && <p className="mt-1.5 text-[12px] text-ok">{okMsg}</p>}
    </div>
  );
}

export default function UgcDashboard() {
  const { data, isLoading, refetch } = useGetUgcDashboardQuery();
  const [setPhone, { isLoading: savingPhone }] = useSetPayoutPhoneMutation();
  const [phoneDraft, setPhoneDraft] = useState(null);
  const [copied, setCopied] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  if (isLoading) return <div className="p-16 text-center text-ink-dim">...</div>;
  if (!data) return <div className="p-16 text-center text-ink-dim">حصل خطأ في التحميل.</div>;

  const s = data.stats;
  const link = `${window.location.origin}/r/${data.referralCode}`;
  const phone = phoneDraft === null ? (data.payoutPhone || '') : phoneDraft;

  async function copyLink() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  }
  async function savePhone() {
    try { await setPhone(phone).unwrap(); setPhoneSaved(true); setTimeout(() => setPhoneSaved(false), 2500); setPhoneDraft(null); } catch { /* */ }
  }
  const badge = (st) => {
    if (st === 'paid') return <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-0.5 text-[11px] font-bold text-ok"><Check size={11} /> اتحوّلت</span>;
    if (st === 'rejected') return <span className="inline-flex items-center gap-1 rounded-full bg-error/15 px-2.5 py-0.5 text-[11px] font-bold text-error"><XIcon size={11} /> مرفوض</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-brass/15 px-2.5 py-0.5 text-[11px] font-bold text-brass"><Clock size={11} /> مستني</span>;
  };

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-10 sm:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-rose">
          <ArrowRight size={15} /> الصفحة الرئيسية
        </Link>

        {/* هيدر */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-brass/50 bg-gradient-to-l from-night to-[#16281f] p-6 text-ivory">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Megaphone size={18} className="text-brass-soft" />
              <span className="font-serif text-xl font-bold text-ivory">لوحة المسوّق</span>
            </div>
            <p className="text-[13px] text-ivory/60">اكسب عمولة على كل عميل بيسجّل ويدفع من لينكك.</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-brass/20 px-4 py-2 text-[13px] font-bold text-brass-soft">
            <Percent size={14} /> نسبتك {data.commissionRate}%
          </div>
        </div>

        {/* لينك الإحالة */}
        <div className="mb-6 rounded-[22px] border border-line bg-card p-5">
          <h2 className="mb-2 font-serif text-[16px] font-bold text-ink">لينك الإحالة بتاعك</h2>
          <p className="mb-3 text-[12.5px] text-ink-dim">ابعت اللينك ده لأي حد — كل واحد يسجّل ويدفع من خلاله بتاخد عليه نسبتك.</p>
          <div className="flex gap-2">
            <input readOnly value={link} dir="ltr" className="flex-1 rounded-full border border-line bg-ivory/60 px-4 py-2.5 text-[12.5px] text-ink" />
            <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2.5 text-[12.5px] font-bold text-ivory hover:bg-emerald">
              <Copy size={14} /> {copied ? 'اتنسخ ✓' : 'انسخ'}
            </button>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={MousePointerClick} value={s.clicks} label="فتحوا اللينك" />
          <Stat icon={UserPlus} value={s.registrations} label="سجّلوا من خلالك" />
          <Stat icon={Crown} value={s.paidCustomers} label="دفعوا" gold />
          <Stat icon={Percent} value={`${data.commissionRate}%`} label="نسبة عمولتك" gold />
        </div>

        {/* الأرباح */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-brass/40 bg-brass/[0.06] p-5">
            <div className="mb-3 flex items-center gap-2 text-brass"><Wallet size={17} /> <span className="text-[13px] font-bold">إجمالي عمولتك</span></div>
            <div className="font-serif text-[24px] font-bold text-ink">{money(s.earned.EGP, 'EGP')}</div>
            <div className="font-serif text-[20px] font-bold text-ink-dim">{money(s.earned.USD, 'USD')}</div>
          </div>
          <div className="rounded-[22px] border border-emerald/40 bg-emerald/[0.06] p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald"><Banknote size={17} /> <span className="text-[13px] font-bold">المتاح للسحب</span></div>
            <div className="font-serif text-[24px] font-bold text-ink">{money(s.available.EGP, 'EGP')}</div>
            <div className="font-serif text-[20px] font-bold text-ink-dim">{money(s.available.USD, 'USD')}</div>
            {(s.pending.EGP > 0 || s.pending.USD > 0) && (
              <p className="mt-2 text-[11.5px] text-ink-dim">تحت التحويل: {money(s.pending.EGP, 'EGP')} · {money(s.pending.USD, 'USD')}</p>
            )}
          </div>
        </div>

        {/* السحب */}
        <div className="mb-6 rounded-[22px] border border-line bg-card p-5">
          <h2 className="mb-3 font-serif text-[16px] font-bold text-ink">اسحب أرباحك (فودافون كاش)</h2>
          <div className="mb-4">
            <label className="mb-1.5 block text-[12.5px] text-ink-dim">رقم فودافون كاش بتاعك</label>
            <div className="flex gap-2">
              <input
                value={phone} onChange={(e) => setPhoneDraft(e.target.value)} dir="ltr"
                placeholder="01xxxxxxxxx"
                className="flex-1 rounded-full border border-line px-4 py-2.5 text-[13px] focus:border-brass focus:outline-none"
              />
              <button type="button" onClick={savePhone} disabled={savingPhone} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/5 disabled:opacity-50">
                <Save size={14} /> {phoneSaved ? 'اتحفظ ✓' : 'حفظ'}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <WithdrawRow currency="EGP" available={s.available.EGP} phone={data.payoutPhone} onDone={refetch} />
            <WithdrawRow currency="USD" available={s.available.USD} phone={data.payoutPhone} onDone={refetch} />
          </div>
          {s.available.EGP <= 0 && s.available.USD <= 0 && (
            <p className="mt-1 text-[12.5px] text-ink-dim">لسه مفيش رصيد متاح للسحب — أول ما عملاؤك يدفعوا هتلاقي فلوسك هنا.</p>
          )}
        </div>

        {/* سجل السحوبات */}
        {data.withdrawals.length > 0 && (
          <div className="rounded-[22px] border border-line bg-card p-5">
            <h2 className="mb-3 font-serif text-[16px] font-bold text-ink">طلبات السحب</h2>
            <div className="space-y-2">
              {data.withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl bg-ivory/60 px-4 py-2.5 text-[13px]">
                  <span className="font-bold text-ink">{money(w.amount, w.currency)}</span>
                  <div className="flex items-center gap-3">
                    {badge(w.status)}
                    <span className="text-[11.5px] text-ink-dim">{new Date(w.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
