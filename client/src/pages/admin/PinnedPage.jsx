// المثبّتين — العملاء والدعوات اللي المالك ثبّتهم عشان يوصلهم في أي وقت.
// بتثبّت من الدبوس جنب أي عميل/دعوة (أو من ملف العميل)، وتكتب ملاحظة
// قصيرة على كل واحد. الأحدث تثبيتًا فوق.
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Pin, Search, Users, FileText } from 'lucide-react';
import { useGetPinsQuery } from '../../store/adminApi.js';
import { closeUser } from '../../store/adminSlice.js';
import { Spinner, Field, Tabs, fmtNum } from '../../components/admin/ui.jsx';
import { PinnedClientCard, PinnedInvitationCard } from '../../components/admin/Pins.jsx';
import ClientDrawer from './ClientDrawer.jsx';

const match = (q, ...vals) => !q || vals.some((v) => String(v || '').toLowerCase().includes(q));

export default function PinnedPage() {
  const dispatch = useDispatch();
  const openUserId = useSelector((s) => s.admin.openUserId);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'invitations' ? 'invitations' : 'users';
  const [q, setQ] = useState('');
  const { data, isLoading, isFetching } = useGetPinsQuery(undefined, {
    // النقطة الزرقا (متصل دلوقتي) على العملاء المثبّتين
    pollingInterval: 30000, skipPollingIfUnfocused: true,
  });

  const users = data?.users || [];
  const invitations = data?.invitations || [];
  const needle = q.trim().toLowerCase();
  const shownUsers = useMemo(() => users.filter((u) => match(needle, u.name, u.email, u.phone, u.note)), [users, needle]);
  const shownInv = useMemo(() => invitations.filter((i) => match(needle, i.namesAr, i.namesEn, i.shortId, i.venueName, i.note, i.owner?.name)), [invitations, needle]);
  const onlineCount = users.filter((u) => u.online).length;

  if (isLoading) return <Spinner label="بنجيب المثبّتين..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-[21px] font-bold text-ivory">
            <Pin size={19} className="fill-current text-brass-soft" /> المثبّتين
          </h1>
          <p className="mt-0.5 text-[12.5px] text-ivory/45">
            العملاء والدعوات اللي ثبّتهم — بيفضلوا فوق في صفحاتهم وتلاقيهم هنا في أي وقت ومن أي جهاز.
            {isFetching && ' · بيحدّث...'}
          </p>
        </div>
        <Tabs
          value={tab}
          onChange={(v) => setParams(v === 'users' ? {} : { tab: v }, { replace: true })}
          options={[
            { value: 'users', label: 'العملاء', count: users.length },
            { value: 'invitations', label: 'الدعوات', count: invitations.length },
          ]}
        />
      </div>

      {(users.length + invitations.length) > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-2">
            <Search size={15} className="text-ivory/35" />
            <Field placeholder="دوّر في المثبّتين (اسم، رقم، ملاحظة...)" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1" />
          </div>
          {tab === 'users' && onlineCount > 0 && (
            <span className="rounded-full bg-[#38a8ff]/12 px-3 py-1.5 text-[12px] font-bold text-[#8fcbff]">
              {fmtNum(onlineCount)} منهم متصل دلوقتي
            </span>
          )}
        </div>
      )}

      {tab === 'users' ? (
        users.length === 0 ? (
          <EmptyPins icon={Users} to="/admin/clients" what="عميل" where="العملاء" />
        ) : shownUsers.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-ivory/35">مفيش عميل مثبّت بالبحث ده.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" data-pinned-users>
            <AnimatePresence initial={false}>
              {shownUsers.map((u) => <PinnedClientCard key={u.ref} u={u} />)}
            </AnimatePresence>
          </div>
        )
      ) : invitations.length === 0 ? (
        <EmptyPins icon={FileText} to="/admin/invitations" what="دعوة" where="الدعوات" />
      ) : shownInv.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-ivory/35">مفيش دعوة مثبّتة بالبحث ده.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" data-pinned-invitations>
          <AnimatePresence initial={false}>
            {shownInv.map((i) => <PinnedInvitationCard key={i.ref} inv={i} />)}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {openUserId && <ClientDrawer userId={openUserId} onClose={() => dispatch(closeUser())} />}
      </AnimatePresence>
      {openUserId && (
        <button type="button" aria-label="اقفل" onClick={() => dispatch(closeUser())} className="fixed inset-0 z-40 bg-black/55" />
      )}
    </div>
  );
}

function EmptyPins({ icon: Icon, to, what, where }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-brass/30 px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brass/10 text-brass-soft"><Icon size={20} /></span>
      <p className="text-[14px] font-bold text-ivory/80">لسه مثبّتش أي {what}</p>
      <p className="mt-1 max-w-[380px] text-[12.5px] leading-relaxed text-ivory/45">
        افتح صفحة {where} ودوس على الدبوس <Pin size={12} className="inline" /> جنب أي {what} — هيفضل فوق على طول وتلاقيه هنا.
      </p>
      <Link to={to} className="mt-4 rounded-full bg-brass px-4 py-2 text-[12.5px] font-bold text-[#241608] hover:bg-brass-soft">روح لـ{where}</Link>
    </div>
  );
}
