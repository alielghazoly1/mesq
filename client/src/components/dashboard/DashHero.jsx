// رأس اللوحة: تحية باسم العميل + باقته ومدة التعديل + 4 كروت أرقام بخط اتجاه
import { Link } from 'react-router-dom';
import { initials } from './dashUtils.js';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Crown, Eye, Users, UserX, Sparkles, Plus, Wand2, ArrowUpRight, ArrowDownRight, Lock, Settings,
} from 'lucide-react';
import Sparkline from './Sparkline.jsx';
import { fmtNum, greetingKey, pctDelta } from './dashUtils.js';

function Kpi({ icon: Icon, label, value, sub, delta, spark, tone = 'ink', i = 0 }) {
  const { i18n } = useTranslation();
  const tones = {
    ink: 'text-ink', ok: 'text-[#1f7a4d]', rose: 'text-[#a2465e]', gold: 'text-[#8a6a20]',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * i, duration: 0.45 }}
      className="relative overflow-hidden rounded-[20px] border border-line bg-card p-4 shadow-[0_14px_34px_-28px_rgba(15,29,24,.55)] sm:p-5"
      data-kpi
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-bold text-ink-dim">
          <Icon size={14} className={tones[tone]} /> {label}
        </span>
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-extrabold ${
            delta >= 0 ? 'bg-[#1f7a4d]/10 text-[#1f7a4d]' : 'bg-[#a2465e]/10 text-[#a2465e]'
          }`}
          >
            {delta >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={`mt-2 font-serif text-[30px] font-bold leading-none sm:text-[34px] ${tones[tone]}`} data-kpi-value>
        {fmtNum(value, i18n.language)}
      </div>
      {sub && <div className="mt-1 truncate text-[11.5px] text-ink-dim">{sub}</div>}
      {spark && <div className="-mx-1 mt-2"><Sparkline values={spark} /></div>}
    </motion.div>
  );
}

export default function DashHero({ data, lang }) {
  const { t } = useTranslation();
  const sub = data.subscription;
  const isPremium = !!sub.packageId;
  const first = String(data.user?.name || '').trim().split(/\s+/)[0];
  const editEnded = isPremium && sub.editOpen === false;
  const lifetime = isPremium && !sub.editUntil && sub.editOpen !== false;
  const daysLeft = sub.editDaysLeft;
  const totalDays = sub.editDays || sub.editWindowDays || 30;
  const pct = isPremium && sub.editUntil && daysLeft != null ? Math.max(4, Math.min(100, (daysLeft / totalDays) * 100)) : 100;
  const weekDelta = pctDelta(data.weekViews || 0, data.prevWeekViews || 0);
  const responses = (data.totals.rsvpYes || 0) + (data.totals.rsvpNo || 0);

  return (
    <section className="mb-6" data-dash-hero>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[26px] bg-night p-5 text-ivory sm:p-7"
      >
        {/* لمسة ذهبي خفيفة في الخلفية */}
        <span aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-brass/20 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 start-10 h-60 w-60 rounded-full bg-emerald/25 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
          <Link to="/account" aria-label={t('dash2.myAccount')} title={t('dash2.myAccount')} data-account-link
            className="group relative mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-brass/40 bg-brass/15 font-serif text-[18px] font-bold text-brass-soft transition hover:bg-brass/25 sm:h-14 sm:w-14">
            {initials(data.user?.name)}
            <span className="absolute -bottom-0.5 -end-0.5 grid h-5 w-5 place-items-center rounded-full bg-ivory text-night shadow ring-2 ring-night transition group-hover:rotate-45"><Settings size={11} /></span>
          </Link>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-brass-soft/90">{t(greetingKey())}</p>
            <h1 className="mt-1 font-serif text-[26px] font-bold leading-tight sm:text-[32px]" data-hero-name>
              {first ? t('dash2.helloName', { name: first }) : t('dash2.hello')}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/15 px-3 py-1 text-[12px] font-extrabold text-brass-soft">
                  <Crown size={13} /> {sub.packageName?.[lang] || t('dash.premiumBadge')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 px-3 py-1 text-[12px] font-bold text-ivory/75">
                  <Lock size={12} /> {t('dash2.freePlan')}
                </span>
              )}
              {isPremium && (
                <span className="rounded-full bg-ivory/10 px-3 py-1 text-[12px] font-bold text-ivory/80">
                  {t('dash2.invitesLeft', { count: sub.invitationsLeft })}
                </span>
              )}
            </div>
          </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isPremium && sub.invitationsLeft > 0 && (
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2.5 text-[13px] font-extrabold text-[#241608] shadow-[0_12px_28px_-14px_rgba(201,162,74,.9)] transition hover:brightness-105" data-new-invite>
                <Plus size={15} /> {t('dash2.newInvite')}
              </Link>
            )}
            {!isPremium && (
              <Link to="/packages" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2.5 text-[13px] font-extrabold text-[#241608] transition hover:brightness-105">
                <Sparkles size={15} /> {t('dash.upgrade')}
              </Link>
            )}
          </div>
        </div>

        {/* مدة التعديل */}
        {isPremium && (
          <div className="relative mt-5 rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-3.5" data-edit-window>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
              <span className="flex items-center gap-1.5 font-bold text-ivory/85">
                <Wand2 size={14} className="text-brass-soft" />
                {editEnded ? t('dash2.editEnded') : lifetime ? t('dash2.editLifetime') : t('dash2.editDays', { count: daysLeft })}
              </span>
              {!editEnded && !lifetime && sub.editUntil && (
                <span className="text-ivory/50">{t('dash2.editUntil', { date: new Date(sub.editUntil).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'long' }) })}</span>
              )}
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ivory/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${editEnded ? 0 : pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${!editEnded && daysLeft != null && daysLeft <= 5 && !lifetime ? 'bg-[#e5735e]' : 'bg-gradient-to-l from-brass to-brass-soft'}`}
              />
            </div>
          </div>
        )}
      </motion.div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi i={0} icon={Eye} label={t('dash2.kViews')} value={data.totals.views} delta={weekDelta}
          sub={t('dash2.kViewsSub', { count: data.weekViews || 0 })} spark={(data.trend || []).map((p) => p.views)} />
        <Kpi i={1} icon={Users} label={t('dash2.kAttending')} value={data.totals.rsvpYes} tone="ok"
          sub={responses ? t('dash2.kOfResponses', { count: responses }) : t('dash2.kNoResponses')} />
        <Kpi i={2} icon={UserX} label={t('dash2.kDeclined')} value={data.totals.rsvpNo} tone="rose"
          sub={t('dash2.kDeclinedSub')} />
        <Kpi i={3} icon={Sparkles} label={t('dash2.kInvites')} value={data.totals.invitations} tone="gold"
          sub={isPremium ? t('dash2.invitesLeft', { count: sub.invitationsLeft }) : t('dash2.kFreeSub')} />
      </div>
    </section>
  );
}
