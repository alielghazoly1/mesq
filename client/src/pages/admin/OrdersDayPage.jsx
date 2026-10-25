// "طلبات اليوم" — الطلبات اللي اتفعّلت (أو اتطلبت) في أي يوم تختاره، بتوقيت مصر.
// الضغط على أي طلب بيفتح تفاصيله كاملة: مين (العميل)، إيه (الباقة والفلوس)،
// إزاي (الإيصال ووقت التفعيل وجه منين)، وفين (الدولة والجهاز).
// اليوم والنوع في اللينك (?day=&kind=) — فكروت النظرة العامة بتفتح عليه مباشرة.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronRight, ChevronLeft, CalendarDays, CheckCircle2, Receipt, Wallet, Crown, Sparkles, RotateCcw, Timer,
  X, MessageCircle, Mail, Globe, Smartphone, Monitor, Tablet, ExternalLink, User, Package, Clock, MapPin, FileText, Eye,
} from 'lucide-react';
import { useGetOrdersDayQuery } from '../../store/adminApi.js';
import { openUser, closeUser } from '../../store/adminSlice.js';
import { Badge, Btn, Spinner, Empty, fmtDate, fmtNum, fmtMoney } from '../../components/admin/ui.jsx';
import { countryName, waLink } from './format.js';
import { useMoneyHidden } from '../../components/admin/moneyPrivacy.js';
import SignupBadge from './SignupBadge.jsx';
import SourceBadge from './SourceBadge.jsx';
import ClientDrawer from './ClientDrawer.jsx';

const DAYS = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const KIND_ICON = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
const KIND_LABEL = { mobile: 'موبايل', desktop: 'كمبيوتر', tablet: 'تابلت' };
const SRC = { ads: 'إعلان', instagram: 'إنستجرام', facebook: 'فيسبوك', google: 'جوجل', whatsapp: 'واتساب', tiktok: 'تيك توك', invitation: 'من دعوة', direct: 'مباشر', other: 'موقع تاني', search: 'بحث', twitter: 'X', snapchat: 'سناب' };
const STATUS = { activated: ['اتفعّل', 'ok'], pending: ['مستني', 'warn'], cancelled: ['اتلغى', 'danger'] };

const dayTitle = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
};
const timeOf = (v) => (v ? new Date(v).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' }) : '—');
const mins = (n) => {
  if (n == null) return '—';
  if (n < 1) return 'أقل من دقيقة';
  if (n < 60) return `${n} دقيقة`;
  const h = Math.floor(n / 60);
  if (h < 48) return `${h} ساعة${n % 60 ? ` و${n % 60} د` : ''}`;
  return `${Math.round(h / 24)} يوم`;
};

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={15} className="mt-0.5 shrink-0 text-ivory/40" />
      <span className="w-28 shrink-0 text-[12px] text-ivory/45">{label}</span>
      <span className="min-w-0 flex-1 text-[13px] text-ivory/90">{children}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-line-lite bg-night/30 p-4">
      <h3 className="mb-1 flex items-center gap-2 font-serif text-[15px] font-bold text-ivory"><Icon size={15} className="text-brass-soft" /> {title}</h3>
      <div className="divide-y divide-line-lite">{children}</div>
    </section>
  );
}

/** تفاصيل الطلب كاملة — مين / إيه / إزاي / فين */
function OrderDetail({ o, onClose, onOpenClient }) {
  const u = o.user;
  const KIcon = (u.device && KIND_ICON[u.device.kind]) || Smartphone;
  const [st, tone] = STATUS[o.status] || [o.status, 'muted'];
  const hideMoney = useMoneyHidden();
  return (
    <motion.aside
      initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="fixed inset-y-0 left-0 z-50 flex w-full max-w-[520px] flex-col border-e border-line-lite bg-night shadow-2xl"
      data-order-detail
    >
      <header className="flex items-start justify-between gap-3 border-b border-line-lite px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif text-[18px] font-bold text-ivory">{u.name}</span>
            <Badge tone={tone}>{st}</Badge>
            {o.status === 'activated' && (o.isFirst ? <Badge tone="ok" icon={Sparkles}>أول مرة يدفع</Badge> : <Badge tone="gold" icon={RotateCcw}>جدّد</Badge>)}
          </div>
          <div className="mt-1 font-serif text-[22px] font-bold text-brass-soft">{!hideMoney && <>{fmtMoney(o.price, o.currency)} </>}<span className={hideMoney ? 'text-[15px] text-ivory/70' : 'text-[13px] font-normal text-ivory/50'}>{o.packageName}</span></div>
        </div>
        <button type="button" onClick={onClose} aria-label="اقفل" className="rounded-full p-1.5 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"><X size={18} /></button>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <Section title="مين" icon={User}>
          <Row icon={User} label="الاسم"><span className="font-bold">{u.name}</span> <SignupBadge signup={u.signup} /></Row>
          <Row icon={Mail} label="الإيميل"><span dir="ltr">{u.email}</span></Row>
          <Row icon={MessageCircle} label="الموبايل">
            {u.phone ? <a href={waLink(u.phone, u.country)} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-bold text-emerald-bright hover:underline">{u.phone} — واتساب</a> : <span className="text-ivory/40">مكتبش رقم</span>}
          </Row>
          <Row icon={CalendarDays} label="سجّل">{fmtDate(u.createdAt, true)}</Row>
          <Row icon={Wallet} label="دفع لحد دلوقتي">{fmtNum(u.paidOrders)} طلب{u.paidEgp && !hideMoney ? ` · ${fmtMoney(u.paidEgp, 'EGP')}` : ''}</Row>
          <Row icon={FileText} label="دعواته">{fmtNum(u.published)} منشورة · {fmtNum(u.drafts)} مسودة · رصيده {fmtNum(u.invitationsLeft)}</Row>
        </Section>
        <Section title="إيه" icon={Package}>
          <Row icon={Crown} label="الباقة"><b>{o.packageName}</b> — {fmtNum(o.invitations)} دعوة{o.editDays ? ` · تعديل ${o.editDays} يوم` : ' · تعديل مدى الحياة'}</Row>
          {!hideMoney && <Row icon={Wallet} label="المبلغ"><b className="text-brass-soft">{fmtMoney(o.price, o.currency)}</b>{o.currency !== 'EGP' ? ` ≈ ${fmtMoney(Math.round(o.eq), 'EGP')}` : ''}</Row>}
          <Row icon={Receipt} label="رقم الطلب"><span dir="ltr" className="text-ivory/60">{o.id}</span></Row>
        </Section>
        <Section title="إزاي" icon={Clock}>
          <Row icon={CalendarDays} label="اتطلب">{fmtDate(o.createdAt, true)}</Row>
          <Row icon={Receipt} label="رفع الإيصال">{o.paymentProofAt ? fmtDate(o.paymentProofAt, true) : <span className="text-ivory/40">من غير إيصال</span>}</Row>
          <Row icon={CheckCircle2} label="اتفعّل">{o.activatedAt ? fmtDate(o.activatedAt, true) : <span className="text-ivory/40">لسه</span>}</Row>
          <Row icon={Timer} label="وقت التفعيل">{o.activationMinutes != null ? `${mins(o.activationMinutes)} من ${o.paymentProofAt ? 'رفع الإيصال' : 'الطلب'}` : '—'}</Row>
          <Row icon={Sparkles} label="جه منين"><SourceBadge source={u.source} />{u.device && u.device.src ? <span className="ms-2 text-[12px] text-ivory/50">دخل الموقع من: {SRC[u.device.src] || u.device.src}</span> : null}</Row>
          {o.paymentProofUrl && (
            <div className="py-3">
              <a href={o.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border border-line-lite" data-receipt>
                <img src={o.paymentProofUrl} alt="الإيصال" className="max-h-[360px] w-full bg-ivory/5 object-contain transition group-hover:opacity-90" loading="lazy" />
              </a>
              <a href={o.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-brass-soft hover:underline"><Eye size={12} /> افتح الإيصال بحجمه</a>
            </div>
          )}
        </Section>
        <Section title="فين" icon={MapPin}>
          <Row icon={Globe} label="الدولة">{countryName(u.country) || '—'}</Row>
          <Row icon={KIcon} label="الجهاز">{u.device ? `${KIND_LABEL[u.device.kind] || u.device.kind}${u.device.os ? ` · ${u.device.os}` : ''}${u.device.browser ? ` · ${u.device.browser}` : ''}` : <span className="text-ivory/40">مفيش بيانات جهاز (قبل بداية التحليلات)</span>}</Row>
          <Row icon={Eye} label="فتح الموقع">{fmtNum(u.visitCount)} مرة{u.lastSeenAt ? ` · آخر مرة ${fmtDate(u.lastSeenAt, true)}` : ''}</Row>
        </Section>
      </div>
      <footer className="flex flex-wrap gap-2 border-t border-line-lite p-4">
        <Btn tone="gold" icon={User} onClick={() => onOpenClient(u.id)}>افتح ملف العميل</Btn>
        {u.phone && <a href={waLink(u.phone, u.country)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-bright/40 px-4 py-2 text-[12.5px] font-bold text-emerald-bright hover:bg-emerald-bright/10"><MessageCircle size={13} /> واتساب</a>}
        {o.paymentProofUrl && <a href={o.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line-lite px-4 py-2 text-[12.5px] font-bold text-ivory/75 hover:text-ivory"><ExternalLink size={13} /> الإيصال</a>}
      </footer>
    </motion.aside>
  );
}

export default function OrdersDayPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const [params, setParams] = useSearchParams();
  const day = params.get('day') || '';
  const kind = params.get('kind') === 'created' ? 'created' : 'activated';
  const { data, isLoading, isFetching, isError } = useGetOrdersDayQuery({ day, kind }, { pollingInterval: !day ? 30000 : 0, skipPollingIfUnfocused: true });
  const [openId, setOpenId] = useState(null);
  const go = (next) => { setOpenId(null); setParams((p) => { const n = new URLSearchParams(p); Object.entries(next).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); return n; }); };
  const open = data && data.orders.find((o) => o.id === openId);
  const S = data && data.summary;
  const hideMoney = useMoneyHidden(); // "إخفاء الفلوس" (الأمان) → مربع الفلوس وأسعار الطلبات بتتشال

  return (
    <div className="space-y-5" data-orders-day>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[21px] font-bold text-ivory">طلبات اليوم</h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">اختار أي يوم وشوف طلباته — ودوس على أي طلب تشوف مين وإيه وإزاي وفين.</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-line-lite bg-panel p-1" data-kind>
          {[['activated', 'اتفعّلت'], ['created', 'اتطلبت']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => go({ kind: k === 'activated' ? '' : k })} data-kind-btn={k}
              className={`rounded-full px-4 py-1.5 text-[12.5px] font-bold transition ${kind === k ? 'bg-brass text-[#241608]' : 'text-ivory/65 hover:text-ivory'}`}>{l} في اليوم ده</button>
          ))}
        </div>
      </div>

      {/* ===== اختيار اليوم ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-lite bg-panel p-3" data-day-picker>
        <button type="button" disabled={!data} onClick={() => go({ day: data.prevDay })} data-prev-day
          className="inline-flex items-center gap-1 rounded-full border border-line-lite px-3.5 py-2 text-[12.5px] font-bold text-ivory/75 hover:text-ivory disabled:opacity-40">
          <ChevronRight size={15} /> اليوم اللي قبله
        </button>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-serif text-[17px] font-bold text-ivory" data-day-title>{data ? dayTitle(data.day) : '...'}</span>
          {data && data.isToday && <Badge tone="ok">النهارده</Badge>}
          <label className="flex items-center gap-1.5 rounded-full border border-line-lite bg-night/50 px-3 py-1.5 text-[12px] text-ivory/70">
            <CalendarDays size={13} className="text-brass-soft" />
            <input type="date" name="day" value={data ? data.day : ''} max={new Date().toLocaleDateString('en-CA')}
              onChange={(e) => go({ day: e.target.value })} className="bg-transparent text-ivory [color-scheme:dark] focus:outline-none" />
          </label>
          {data && !data.isToday && <Btn size="sm" onClick={() => go({ day: '' })}>النهارده</Btn>}
        </div>
        <button type="button" disabled={!data || !data.nextDay} onClick={() => go({ day: data.nextDay })} data-next-day
          className="inline-flex items-center gap-1 rounded-full border border-line-lite px-3.5 py-2 text-[12.5px] font-bold text-ivory/75 hover:text-ivory disabled:opacity-40">
          اليوم اللي بعده <ChevronLeft size={15} />
        </button>
      </div>

      {isLoading || !data ? (isError ? <Empty>معرفناش نحمّل الطلبات — جرّب تاني.</Empty> : <Spinner />) : (
        <>
          {/* ===== ملخص اليوم ===== */}
          <div className={`grid grid-cols-2 gap-3 ${hideMoney ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`} data-day-summary>
            <div className="rounded-2xl border border-brass/35 bg-brass/[0.07] p-4">
              <CheckCircle2 size={16} className="text-brass-soft" />
              <div className="mt-2.5 font-serif text-[30px] font-bold leading-none text-ivory" data-count>{fmtNum(S.orders)}</div>
              <div className="mt-1.5 text-[12px] text-ivory/60">{kind === 'activated' ? 'طلب اتفعّل' : 'طلب اتعمل'}{isFetching ? ' · بيحدّث' : ''}</div>
            </div>
            {!hideMoney && <div className="rounded-2xl border border-emerald-bright/30 bg-emerald-bright/[0.06] p-4">
              <Wallet size={16} className="text-emerald-bright" />
              <div className="mt-2.5 font-serif text-[24px] font-bold leading-none text-ivory" data-money>{Object.keys(S.byCurrency).length ? Object.entries(S.byCurrency).map(([c, v]) => fmtMoney(v.total, c)).join(' + ') : '0'}</div>
              <div className="mt-1.5 text-[12px] text-ivory/60">{Object.keys(S.byCurrency).length > 1 || (Object.keys(S.byCurrency)[0] && Object.keys(S.byCurrency)[0] !== 'EGP') ? `≈ ${fmtMoney(Math.round(S.eq), 'EGP')} بالجنيه` : kind === 'activated' ? 'فلوس دخلت' : 'قيمة الطلبات'}</div>
            </div>}
            <div className="rounded-2xl border border-line-lite bg-panel p-4">
              <Sparkles size={16} className="text-ivory/50" />
              <div className="mt-2.5 font-serif text-[24px] font-bold leading-none text-ivory">{fmtNum(S.newPayers)} <span className="text-[14px] text-ivory/50">جديد</span> · {fmtNum(S.renewals)} <span className="text-[14px] text-ivory/50">جدّد</span></div>
              <div className="mt-1.5 text-[12px] text-ivory/60">{kind === 'created' && S.statuses ? `${S.statuses.activated} اتفعّل · ${S.statuses.pending} مستني · ${S.statuses.cancelled} اتلغى` : 'أول مرة يدفعوا / بيجدّدوا'}</div>
            </div>
            <div className="rounded-2xl border border-line-lite bg-panel p-4">
              <Timer size={16} className="text-ivory/50" />
              <div className="mt-2.5 font-serif text-[24px] font-bold leading-none text-ivory">{mins(S.avgActivationMinutes)}</div>
              <div className="mt-1.5 text-[12px] text-ivory/60">متوسط وقت التفعيل من رفع الإيصال</div>
            </div>
          </div>
          {S.byPackage.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {S.byPackage.map((p) => <span key={p.name} className="rounded-full bg-ivory/[0.07] px-3 py-1 text-[12px] text-ivory/70"><Crown size={11} className="me-1 inline text-brass-soft" />{p.name}: <b className="text-ivory">{p.n}</b></span>)}
            </div>
          )}

          {/* ===== الطلبات ===== */}
          {data.orders.length === 0 ? (
            <div className="rounded-2xl border border-line-lite bg-panel"><Empty>{kind === 'activated' ? 'مفيش طلبات اتفعّلت في اليوم ده.' : 'مفيش طلبات اتعملت في اليوم ده.'}</Empty></div>
          ) : (
            <ul className="space-y-2.5" data-orders-list>
              {data.orders.map((o, i) => {
                const [st, tone] = STATUS[o.status] || [o.status, 'muted'];
                return (
                  <motion.li key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.025 }}>
                    <button type="button" onClick={() => setOpenId(o.id)} data-order-row={o.id}
                      className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-line-lite bg-panel px-4 py-3 text-start transition hover:border-brass/45">
                      <span className="w-[70px] shrink-0 text-center">
                        <span className="block font-serif text-[16px] font-bold text-ivory">{timeOf(kind === 'activated' ? o.activatedAt : o.createdAt)}</span>
                        <span className="text-[10.5px] text-ivory/40">{kind === 'activated' ? 'اتفعّل' : 'اتطلب'}</span>
                      </span>
                      {o.paymentProofUrl
                        ? <img src={o.paymentProofUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-line-lite object-cover" loading="lazy" />
                        : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-line-lite text-ivory/30"><Receipt size={16} /></span>}
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ivory">
                          {o.user.name}
                          <SignupBadge signup={o.user.signup} />
                          <SourceBadge source={o.user.source} compact />
                          {o.status === 'activated' && (o.isFirst ? <Badge tone="ok">أول مرة</Badge> : <Badge tone="gold">جدّد</Badge>)}
                          {kind === 'created' && <Badge tone={tone}>{st}</Badge>}
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-ivory/45">
                          {countryName(o.user.country)}{o.user.phone ? ` · ${o.user.phone}` : ''}{o.activationMinutes != null ? ` · اتفعّل بعد ${mins(o.activationMinutes)}` : ''}
                        </span>
                      </span>
                      <span className="shrink-0 text-end">
                        {!hideMoney && <span className="block font-serif text-[17px] font-bold text-brass-soft">{fmtMoney(o.price, o.currency)}</span>}
                        <span className="text-[11.5px] text-ivory/55">{o.packageName}</span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.button type="button" aria-label="اقفل" onClick={() => setOpenId(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/55" />
            <OrderDetail o={open} onClose={() => setOpenId(null)} onOpenClient={(id) => { setOpenId(null); dispatch(openUser(id)); }} />
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
      {openUserId && <button type="button" aria-label="اقفل" onClick={() => dispatch(closeUser())} className="fixed inset-0 z-40 bg-black/55" />}
    </div>
  );
}
