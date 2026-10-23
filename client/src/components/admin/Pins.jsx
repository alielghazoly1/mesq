// المثبّتين — زرار التثبيت + كروت العملاء/الدعوات المثبّتة.
// التثبيت متخزّن على السيرفر (AdminPin)، فاللي تثبّته من اللابتوب يبان على
// الموبايل كمان. قايمة المثبّتين طلب واحد صغير (getPins) متشارك بين كل
// الصفحات، فالزرار يعرف حالته من غير ما يسأل السيرفر لكل صف.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import {
  Pin, Crown, ExternalLink, BarChart3, MessageCircle, Eye, Users, ArrowLeft, StickyNote, Ban, PauseCircle, Trash2, FileText,
} from 'lucide-react';
import { useGetPinsQuery, usePinMutation, useUnpinMutation } from '../../store/adminApi.js';
import { openUser } from '../../store/adminSlice.js';
import { LiveDot, fmtDate, fmtLastSeen, fmtNum } from './ui.jsx';
import { countryName, waLink } from '../../pages/admin/format.js';

/** هل الحاجة دي متثبّتة؟ (من الكاش المشترك) */
export function usePinned(kind, ref) {
  const { data } = useGetPinsQuery();
  const list = kind === 'user' ? data?.users : data?.invitations;
  return !!list?.some((p) => p.ref === ref);
}

/** زرار الدبوس: يثبّت/يشيل. variant 'icon' للجداول و'pill' للهيدر */
export function PinButton({ kind, refId, variant = 'icon', className = '' }) {
  const pinned = usePinned(kind, refId);
  const [pin, { isLoading: pinning }] = usePinMutation();
  const [unpin, { isLoading: unpinning }] = useUnpinMutation();
  const busy = pinning || unpinning;

  function toggle(e) {
    e.stopPropagation();
    e.preventDefault();
    if (busy || !refId) return;
    if (pinned) unpin({ kind, ref: refId });
    else pin({ kind, ref: refId });
  }

  const title = pinned ? 'شيله من المثبّتين' : (kind === 'user' ? 'ثبّت العميل ده فوق' : 'ثبّت الدعوة دي فوق');
  if (variant === 'pill') {
    return (
      <button type="button" onClick={toggle} disabled={busy} title={title} data-pin-toggle={kind}
        aria-pressed={pinned}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition disabled:opacity-60 ${
          pinned
            ? 'border-brass/60 bg-brass/20 text-brass-soft hover:bg-brass/10'
            : 'border-line-lite text-ivory/60 hover:border-brass/50 hover:text-brass-soft'} ${className}`}>
        {pinned ? <Pin size={13} className="fill-current" /> : <Pin size={13} />}
        {pinned ? 'متثبّت' : 'ثبّت'}
      </button>
    );
  }
  return (
    <button type="button" onClick={toggle} disabled={busy} title={title} aria-label={title} data-pin-toggle={kind}
      aria-pressed={pinned}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition disabled:opacity-60 ${
        pinned ? 'bg-brass/20 text-brass-soft hover:bg-brass/10' : 'text-ivory/25 hover:bg-ivory/[0.06] hover:text-brass-soft'} ${className}`}>
      <Pin size={14} className={pinned ? 'fill-current' : ''} />
    </button>
  );
}

/** ملاحظة جنب المثبّت ("عميل VIP"، "فرحه الخميس") — تتكتب وتتحفظ مكانها */
function PinNote({ kind, refId, note }) {
  const [pin] = usePinMutation();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(note || '');
  const inputRef = useRef(null);
  useEffect(() => { if (!editing) setVal(note || ''); }, [note, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function save() {
    setEditing(false);
    const v = val.trim().slice(0, 120);
    if (v !== (note || '')) pin({ kind, ref: refId, note: v });
  }

  if (editing) {
    return (
      <input ref={inputRef} value={val} maxLength={120} data-pin-note-input
        onChange={(e) => setVal(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onBlur={save}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(note || ''); setEditing(false); } }}
        placeholder="مثلًا: عميل VIP، فرحه يوم الخميس..."
        className="mt-2 w-full rounded-lg border border-brass/40 bg-night/60 px-2.5 py-1.5 text-[12px] text-ivory outline-none placeholder:text-ivory/30" />
    );
  }
  return (
    <button type="button" data-pin-note
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className={`mt-2 flex w-full items-start gap-1.5 rounded-lg px-2 py-1 text-start text-[11.5px] transition hover:bg-ivory/[0.05] ${note ? 'bg-brass/[0.08] text-brass-soft/90' : 'text-ivory/30'}`}>
      <StickyNote size={12} className="mt-0.5 shrink-0" />
      <span className="min-w-0 break-words">{note || 'اكتب ملاحظة...'}</span>
    </button>
  );
}

function MissingCard({ kind, item }) {
  const [unpin] = useUnpinMutation();
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-line-lite px-4 py-3 text-[12px] text-ivory/40">
      <span>{kind === 'user' ? 'عميل اتمسح من الموقع' : `دعوة اتمسحت (${item.ref})`}</span>
      <button type="button" onClick={() => unpin({ kind, ref: item.ref })} className="inline-flex items-center gap-1 text-ivory/50 hover:text-error">
        <Trash2 size={12} /> شيله
      </button>
    </div>
  );
}

/** كارت عميل متثبّت — بيفتح ملفه */
export function PinnedClientCard({ u, compact = false }) {
  const dispatch = useDispatch();
  if (u.missing) return <MissingCard kind="user" item={u} />;
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      data-pinned-user={u.id}
      role="button" tabIndex={0}
      onClick={() => dispatch(openUser(u.id))}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) dispatch(openUser(u.id)); }}
      className="group relative cursor-pointer rounded-2xl border border-brass/25 bg-[linear-gradient(160deg,rgba(201,162,92,0.10),transparent_60%)] bg-panel p-3.5 text-start transition hover:-translate-y-0.5 hover:border-brass/55 hover:shadow-[0_14px_34px_-22px_rgba(0,0,0,0.9)]">
      <div className="flex items-start gap-2.5">
        <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass/15 font-serif text-[15px] font-bold text-brass-soft">
          {(u.name || '؟').trim().charAt(0)}
          {u.online && <span className="absolute -bottom-0.5 -end-0.5"><LiveDot size={9} /></span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] font-bold text-ivory">{u.name}</span>
            {u.isPremium && <Crown size={12} className="shrink-0 text-brass" />}
            {u.isSuspended && <PauseCircle size={12} className="shrink-0 text-error" />}
            {u.isBlocked && <Ban size={12} className="shrink-0 text-error" />}
          </span>
          <span className="block truncate text-[11px] text-ivory/45">
            {u.online ? <span className="font-bold text-[#8fcbff]">متصل دلوقتي</span> : fmtLastSeen(u.lastSeenAt, false)}
            {' · '}{countryName(u.country)}
          </span>
        </span>
        <PinButton kind="user" refId={u.ref} />
      </div>
      {!compact && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className={`rounded-full px-2 py-0.5 font-bold ${u.isPremium ? 'bg-brass/15 text-brass-soft' : 'bg-ivory/[0.06] text-ivory/45'}`}>
            {u.packageName || 'مجاني'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ivory/[0.06] px-2 py-0.5 text-ivory/55"><FileText size={10} /> {fmtNum(u.invitations)} دعوة</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ivory/[0.06] px-2 py-0.5 text-ivory/55"><Eye size={10} /> {fmtNum(u.visitCount)} زيارة</span>
          {u.phone && (
            <a href={waLink(u.phone, u.country)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-bright/10 px-2 py-0.5 font-bold text-emerald-bright hover:bg-emerald-bright/20">
              <MessageCircle size={10} /> واتساب
            </a>
          )}
        </div>
      )}
      {!compact && <PinNote kind="user" refId={u.ref} note={u.note} />}
      {compact && u.note && <p className="mt-1.5 truncate text-[11px] text-brass-soft/80">{u.note}</p>}
    </motion.div>
  );
}

/** كارت دعوة متثبّتة */
export function PinnedInvitationCard({ inv, compact = false }) {
  const dispatch = useDispatch();
  if (inv.missing) return <MissingCard kind="invitation" item={inv} />;
  const days = inv.weddingDate ? Math.ceil((new Date(inv.weddingDate) - Date.now()) / 864e5) : null;
  const when = days == null ? '' : days > 1 ? `باقي ${fmtNum(days)} يوم` : days === 1 ? 'بكره' : days === 0 ? 'النهارده' : 'الفرح عدّى';
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      data-pinned-invitation={inv.shortId}
      className="relative rounded-2xl border border-brass/25 bg-[linear-gradient(160deg,rgba(201,162,92,0.10),transparent_60%)] bg-panel p-3.5 transition hover:border-brass/55">
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-serif text-[14px] font-bold text-ivory">{inv.namesAr.replace(/^&|&$/g, '').trim() || inv.namesEn}</span>
          <span className="block truncate text-[11px] text-ivory/40" dir="auto">{inv.shortId} · {inv.templateName}</span>
        </span>
        <PinButton kind="invitation" refId={inv.ref} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        {inv.weddingDate && (
          <span className={`rounded-full px-2 py-0.5 font-bold ${days != null && days >= 0 && days <= 7 ? 'bg-ok/15 text-ok' : 'bg-ivory/[0.06] text-ivory/55'}`}>
            {fmtDate(inv.weddingDate)}{when ? ` · ${when}` : ''}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-ivory/[0.06] px-2 py-0.5 text-ivory/55"><Eye size={10} /> {fmtNum(inv.views)}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-ivory/[0.06] px-2 py-0.5 text-ivory/55"><Users size={10} /> {fmtNum(inv.rsvps)} رد</span>
        {inv.isDraft && <span className="rounded-full bg-ivory/[0.06] px-2 py-0.5 text-ivory/45">مسودة</span>}
      </div>
      <>
          <div className="mt-2.5 flex items-center gap-1.5">
            <a href={`/i/${inv.shortId}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-brass/15 px-2 py-1.5 text-[11.5px] font-bold text-brass-soft hover:bg-brass/25">
              <ExternalLink size={12} /> افتحها
            </a>
            <a href={`/i/${inv.shortId}/stats`} target="_blank" rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-ivory/[0.06] px-2 py-1.5 text-[11.5px] font-bold text-ivory/65 hover:bg-ivory/[0.1]">
              <BarChart3 size={12} /> إحصائياتها
            </a>
            {inv.owner && (
              <button type="button" onClick={() => dispatch(openUser(inv.owner.id))} title={`صاحبها: ${inv.owner.name}`}
                className="inline-flex max-w-[40%] items-center justify-center gap-1 rounded-lg bg-ivory/[0.06] px-2 py-1.5 text-[11.5px] font-bold text-ivory/65 hover:bg-ivory/[0.1]">
                <span className="truncate">{inv.owner.name || 'صاحبها'}</span>
              </button>
            )}
          </div>
          {!compact && <PinNote kind="invitation" refId={inv.ref} note={inv.note} />}
      </>
      {compact && inv.note && <p className="mt-1.5 truncate text-[11px] text-brass-soft/80">{inv.note}</p>}
    </motion.div>
  );
}

/** شريط المثبّتين فوق صفحة العملاء/الدعوات — بيختفي لو مفيش حاجة متثبّتة */
export function PinnedStrip({ kind }) {
  const { data } = useGetPinsQuery();
  const list = (kind === 'user' ? data?.users : data?.invitations) || [];
  if (!list.length) return null;
  const shown = list.slice(0, 8);
  return (
    <section data-pinned-strip={kind} className="rounded-2xl border border-brass/30 bg-brass/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-[15px] font-bold text-brass-soft">
          <Pin size={15} className="fill-current" />
          {kind === 'user' ? 'العملاء المثبّتين' : 'الدعوات المثبّتة'}
          <span className="rounded-full bg-brass/20 px-2 py-0.5 font-sans text-[11px]">{fmtNum(list.length)}</span>
        </h2>
        <Link to={`/admin/pinned?tab=${kind === 'user' ? 'users' : 'invitations'}`}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-brass-soft hover:text-brass">
          {list.length > shown.length ? `الكل (${fmtNum(list.length)})` : 'صفحة المثبّتين'} <ArrowLeft size={13} />
        </Link>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatePresence initial={false}>
          {shown.map((x) => (kind === 'user'
            ? <PinnedClientCard key={x.ref} u={x} compact />
            : <PinnedInvitationCard key={x.ref} inv={x} compact />))}
        </AnimatePresence>
      </div>
    </section>
  );
}

