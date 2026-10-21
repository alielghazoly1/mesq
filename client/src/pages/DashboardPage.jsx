// لوحة العميل — كل حاجة عن دعواته في مكان واحد:
//   الرأس: تحية + باقته + مدة التعديل + أرقام بخط اتجاه (components/dashboard/DashHero)
//   شريط الدعوات: كارت لكل دعوة بصورة تصميمها وفاضل كام يوم على الفرح
//   لوحة الدعوة: نظرة عامة (رسم + مصادر + أجهزة + ساعات) / الضيوف / التهاني /
//                الصور / المشاركة (لينكات + واتساب + QR)
//   حسابك: الاسم والموبايل والباسورد والأجهزة
// الحالة (الدعوة المختارة، التبويب، الفترة، فلاتر الضيوف) في Redux: store/dashboardSlice.js
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  ArrowRight, MessageCircle, Crown, Lock, Sparkles, LayoutGrid,
} from 'lucide-react';
import { setSupportOpen } from '../store/uiSlice.js';
import { setView as setSupportView } from '../store/supportSlice.js';
import { selectInvitation } from '../store/dashboardSlice.js';
import { useGetDashboardQuery } from '../store/api.js';
import EditorDemo from '../components/EditorDemo.jsx';
import Footer from '../components/Footer.jsx';
import UgcDashboard from './UgcDashboard.jsx';
import DashHero from '../components/dashboard/DashHero.jsx';
import InvitationRail from '../components/dashboard/InvitationRail.jsx';
import InvitationPanel from '../components/dashboard/InvitationPanel.jsx';
import AccountPanel from '../components/dashboard/AccountPanel.jsx';
import { whatsappLink } from '../lib/contact.js';

function Skeleton() {
  return (
    <div className="min-h-screen bg-ivory" data-dash-skeleton>
      <div className="mx-auto max-w-6xl space-y-4 px-4 pb-16 pt-8 sm:px-6">
        <div className="h-44 animate-pulse rounded-[26px] bg-night/80" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-[20px] bg-ink/[0.06]" />)}
        </div>
        <div className="h-72 animate-pulse rounded-[26px] bg-ink/[0.05]" />
      </div>
    </div>
  );
}

// كارت الدعم في اللوحة: العدد والمعاينة بس — المحادثة نفسها بتتفتح في
// نافذة الدعم (عشان الرسايل ماتتعلّمش "اتشافت" غير لما يفتحها فعلًا)
function SupportBox() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const unread = useSelector((s) => s.support.unread);
  const latest = useSelector((s) => s.support.latest);
  const adminOnline = useSelector((s) => s.support.adminOnline);
  const open = () => { dispatch(setSupportOpen(true)); dispatch(setSupportView('chat')); };

  return (
    <div className="rounded-[22px] border border-line bg-card p-5 sm:p-6" data-dash-support>
      <div className="flex items-center gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night text-brass-soft">
          <MessageCircle size={19} />
          {adminOnline && <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-card" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-ink">
            {t('dash.supportTitle')}
            {unread > 0 && <span className="rounded-full bg-rose px-2 py-0.5 font-sans text-[11px] font-bold text-white">{unread}</span>}
          </h2>
          <p className="truncate text-[13px] text-ink-dim">
            {unread > 0 && latest ? latest.preview : t('support.needHelp')}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-night px-4 py-2.5 text-[13px] font-bold text-ivory transition hover:bg-emerald"
        >
          {unread > 0 ? t('dash.supportRead') : t('support.chatCta')}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { data, isLoading } = useGetDashboardQuery(undefined, { pollingInterval: 120000, skipPollingIfUnfocused: true });
  const selectedId = useSelector((s) => s.dashboard.selected);
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const invitations = data?.invitations || [];
  const selected = invitations.find((i) => i.shortId === selectedId) || invitations[0] || null;
  useEffect(() => {
    if (selected && selected.shortId !== selectedId) dispatch(selectInvitation(selected.shortId));
  }, [selected, selectedId, dispatch]);

  if (isLoading) return <Skeleton />;
  if (!data) {
    return (
      <div className="p-16 text-center text-ink-dim">
        {t('dash.needLogin')} <Link to="/" className="text-rose underline">{t('packages.back')}</Link>
      </div>
    );
  }

  // الحساب مسوّق (UGC)؟ اللوحة بتتحوّل بالكامل للوحة المسوّق.
  if (data.isUgc) return <UgcDashboard />;

  const isPremium = !!data.subscription.packageId;
  // مدة التعديل: null = من غير حد (كل اللي اشترى قبل القاعدة دي)
  const editEnded = isPremium && data.subscription.editOpen === false;

  return (
    <div className="min-h-screen bg-ivory" data-dashboard>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-rose">
          <ArrowRight size={15} /> {t('packages.back')}
        </Link>

        <DashHero data={data} lang={lang} />

        {editEnded && (
          <div className="mb-6 rounded-[22px] border border-brass/50 bg-brass/[0.09] p-5">
            <div className="mb-1.5 flex items-center gap-2 font-serif text-[16px] font-bold text-ink">
              <Lock size={15} className="text-brass" /> {t('dash.editEndedTitle')}
            </div>
            <p className="mb-4 max-w-[70ch] text-[13.5px] leading-[1.9] text-ink-dim">{t('dash.editEndedBody')}</p>
            <div className="flex flex-wrap gap-2.5">
              <a href={whatsappLink(t('dash.editWaMsg'))} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2.5 text-[13px] font-extrabold text-[#241608] hover:brightness-105">
                <MessageCircle size={15} /> {t('dash.editWa')}
              </a>
              <Link to="/packages" className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[13px] font-bold text-ink hover:bg-ink/5">
                <Crown size={14} /> {t('dash.editPackages')}
              </Link>
            </div>
          </div>
        )}

        {/* العميل المجاني بيدخل لوحته كل شوية يتابع دعوته — الفيديو هنا بيوريه اللي فايته */}
        {!isPremium && (
          <div className="mb-6 overflow-hidden rounded-[22px] border border-brass/35 bg-gradient-to-b from-[#0d1f18] to-night p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif text-[17px] font-bold text-brass-soft">{t('demo.title')}</h2>
                <p className="mt-1 text-[12.5px] text-ivory/60">{t('demo.dashNote')}</p>
              </div>
              <Link to="/packages" className="shrink-0 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2.5 text-[12.5px] font-extrabold text-[#241608] hover:brightness-105">
                {t('demo.cta')}
              </Link>
            </div>
            <EditorDemo variant="compact" />
          </div>
        )}

        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-[21px] font-bold text-ink">
            <LayoutGrid size={18} className="text-brass" /> {t('dash.myInvitations')}
            <span className="rounded-full bg-ink/[0.07] px-2 py-0.5 font-sans text-[12px] font-bold text-ink-dim">{invitations.length}</span>
          </h2>
        </div>

        {invitations.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-8 flex flex-col items-center gap-3 rounded-[26px] border border-dashed border-brass/40 bg-card px-6 py-14 text-center" data-dash-empty>
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brass/15 text-brass"><Sparkles size={24} /></span>
            <p className="font-serif text-[19px] font-bold text-ink">{t('dash2.emptyTitle')}</p>
            <p className="max-w-[46ch] text-[13px] leading-relaxed text-ink-dim">{t('dash2.emptyBody')}</p>
            <Link to="/" className="mt-1 rounded-full bg-gradient-to-l from-brass to-brass-soft px-6 py-3 text-[13.5px] font-extrabold text-[#241608] hover:brightness-105">
              {t('dash2.pickDesign')}
            </Link>
          </motion.div>
        ) : (
          <div className="mb-8">
            <InvitationRail invitations={invitations} lang={lang} selected={selected?.shortId} />
            {selected && <InvitationPanel key={selected.shortId} inv={selected} lang={lang} editEnded={editEnded} />}
          </div>
        )}

        <div className="mb-6"><SupportBox /></div>
        <AccountPanel />
      </div>
      <Footer />
    </div>
  );
}
