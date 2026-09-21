// صفحة الباقات — /packages
//
// فلسفة الصفحة: الباقات التلاتة سُلّم، مش تلات حاجات منفصلة. كل باقة
// فيها كل اللي في اللي قبلها زيادة حاجات. فبدل ما نكرر نفس السبع
// مميزات في التلات كروت (وده كان بيخلي الصفحة 4.5 شاشة على الموبايل
// والعميل مش قادر يقارن)، كل كارت بيقول "كل اللي في اللي قبلها +
// الجديد". النتيجة: الفرق بين الباقات بيبان من نظرة واحدة، والترقية
// بتبقى قرار واضح مش مقارنة مرهقة.
//
// والضغط على أي باقة بيودّي لصفحة الدفع على طول (/checkout/:id).
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'motion/react';
import {
  Check, ArrowRight, Sparkles, Lock, Crown, Plus, ShieldCheck,
  Clock, Infinity as InfinityIcon, ArrowLeft, BadgePercent,
  Users, Pencil, CreditCard, MessageCircle, Briefcase, Building2, ChevronDown,
} from 'lucide-react';
import { useGetPackagesQuery, useGetMeQuery } from '../store/api.js';
import { openAuthModal } from '../store/uiSlice.js';
import { whatsappLink } from '../lib/contact.js';
import { formatDay } from '../lib/editWindow.js';
import EditorDemo from '../components/EditorDemo.jsx';
import Footer from '../components/Footer.jsx';

/** بيرجّع مميزات الباقة دي اللي مش في اللي قبلها */
function deltaFeatures(pkg, prev) {
  if (!prev) return pkg.features;
  const had = new Set(prev.features.map((f) => f.key));
  return pkg.features.filter((f) => !had.has(f.key));
}

/** اللي بيجي مع أي باقة — بيتعرض جوه كل كارت عشان كل باقة تشرح نفسها */
function everyItems(days, t) {
  const items = [
    { icon: Users, text: t('packages.every1') },
    { icon: InfinityIcon, text: t('packages.every2') },
  ];
  // القاعدة متقفلة (0 يوم) = مفيش مدة نكتبها للعميل
  if (days > 0) items.push({ icon: Pencil, text: t('packages.every3', { days }) });
  return items;
}

function PackageCard({ pkg, prev, index, highlighted, onOrder, currentPackageId, cheapestPerUnit, days }) {
  const { t } = useTranslation();
  const isSubscribed = currentPackageId === pkg.id;
  const hasAnySubscription = !!currentPackageId;

  const extras = deltaFeatures(pkg, prev);
  const perUnit = Math.round(pkg.price / Math.max(1, pkg.invitations));
  // كام بتوفّر في الدعوة الواحدة مقارنة بأرخص باقة — ده الرقم اللي
  // بيخلي الباقة الأكبر تبان قيمة مش سعر
  const savePct = cheapestPerUnit && perUnit < cheapestPerUnit
    ? Math.round((1 - perUnit / cheapestPerUnit) * 100)
    : 0;

  const dark = highlighted && !isSubscribed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`relative flex flex-col overflow-hidden rounded-[24px] border transition ${
        isSubscribed
          ? 'border-ok bg-ok/[0.05]'
          : dark
            ? 'border-brass/60 bg-gradient-to-b from-[#0e2119] to-night shadow-[0_24px_60px_-28px_rgba(8,19,15,.75)] lg:-my-3'
            : 'border-line bg-card'
      }`}
    >
      {/* الشريط العلوي: الباقة المميزة ليها لمعة */}
      {dark && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(230,198,132,.16),transparent)]" />
      )}

      <div className="relative p-6 sm:p-7">
        {/* ===== الشارة ===== */}
        <div className="mb-4 flex min-h-[26px] items-center gap-2">
          {isSubscribed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1 text-[11.5px] font-bold text-ok">
              <Check size={12} /> {t('packages.subscribed')}
            </span>
          ) : (
            <>
              {/* شارة الخصم أول حاجة: هي السبب اللي بيخلي العميل يكمل قراية */}
              {pkg.discountPercent > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/15 px-3 py-1 text-[11.5px] font-extrabold text-rose">
                  <BadgePercent size={12} /> {pkg.discountLabel}
                </span>
              )}
              {highlighted && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/20 px-3 py-1 text-[11.5px] font-bold text-brass-soft">
                  <Sparkles size={12} /> {t('packages.popular')}
                </span>
              )}
              {savePct >= 15 && (
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-bold ${
                  dark ? 'bg-ok/20 text-ok' : 'bg-emerald/10 text-emerald'
                }`}
                >
                  {t('packages.save', { pct: savePct })}
                </span>
              )}
              {hasAnySubscription && !highlighted && !savePct && (
                <span className="inline-flex rounded-full bg-ink/8 px-3 py-1 text-[11.5px] font-bold text-ink-dim">
                  {t('packages.notSubscribed')}
                </span>
              )}
            </>
          )}
        </div>

        {/* ===== الاسم والسعر ===== */}
        <h3 className={`font-serif text-[23px] font-bold ${dark ? 'text-ivory' : 'text-ink'}`}>
          {pkg.name}
        </h3>
        {/* سطر واحد يقول الباقة دي لمين — قبل السعر والمميزات */}
        {pkg.tagline && (
          <p className={`mt-1.5 text-[13px] leading-[1.75] ${dark ? 'text-ivory/65' : 'text-ink-dim'}`}>
            {pkg.tagline}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={`font-serif text-[42px] font-bold leading-none ${dark ? 'text-brass-soft' : 'text-emerald'}`}>
            {pkg.price}
          </span>
          <span className={`text-[14px] ${dark ? 'text-ivory/70' : 'text-ink-dim'}`}>{pkg.currencyLabel}</span>
          {/* السعر القديم مشطوب جنب الجديد — الخصم لازم يبان كرقمين،
              مش كلمة "خصم" لوحدها */}
          {pkg.listPrice > 0 && (
            <span className={`text-[16px] line-through ${dark ? 'text-ivory/40' : 'text-ink-dim/60'}`}>
              {pkg.listPrice}
            </span>
          )}
          <span className={`text-[12.5px] ${dark ? 'text-ivory/45' : 'text-ink-dim/80'}`}>
            · {t('packages.oneTime')}
          </span>
        </div>

        {/* عدد الدعوات + سعر الدعوة الواحدة — الرقم اللي بيحسم القرار */}
        <div className={`mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
          dark ? 'bg-ivory/[0.06]' : 'bg-ivory/70'
        }`}
        >
          <span className={`text-[14px] font-bold ${dark ? 'text-ivory' : 'text-ink'}`}>
            {t('packages.invitations', { count: pkg.invitations })}
          </span>
          <span className={`shrink-0 text-[12px] ${dark ? 'text-brass-soft' : 'text-emerald'}`}>
            {t('packages.perInvitation', { price: perUnit, currency: pkg.currencyLabel })}
          </span>
        </div>

        {/* ===== المميزات ===== */}
        <div className={`mt-5 border-t pt-5 ${dark ? 'border-ivory/12' : 'border-line'}`}>
          <div className={`mb-3.5 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.12em] ${
            dark ? 'text-brass-soft' : 'text-emerald'
          }`}
          >
            {prev ? (
              <>
                <Plus size={13} />
                {t('packages.everythingIn', { name: prev.name })}
              </>
            ) : (
              t('packages.included')
            )}
          </div>

          <ul className="flex flex-col gap-3.5">
            {extras.map((f) => (
              <li key={f.key} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                  dark ? 'bg-brass/20 text-brass-soft' : 'bg-emerald/10 text-emerald'
                }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <div className="min-w-0">
                  <div className={`text-[14px] font-bold leading-snug ${dark ? 'text-ivory' : 'text-ink'}`}>
                    {f.label}
                  </div>
                  {f.desc && (
                    <p className={`mt-1 text-[12.5px] leading-[1.75] ${dark ? 'text-ivory/60' : 'text-ink-dim'}`}>
                      {f.desc}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== اللي في كل باقة: ضيوف بلا حد، مدى الحياة، مدة التعديل ===== */}
        <div className={`mt-5 rounded-2xl px-4 py-3.5 ${dark ? 'bg-ivory/[0.06]' : 'bg-ivory/70'}`}>
          <div className={`mb-2 text-[11px] font-bold uppercase tracking-[0.12em] ${dark ? 'text-brass-soft' : 'text-emerald'}`}>
            {t('packages.everyTitle')}
          </div>
          <ul className="flex flex-col gap-2">
            {everyItems(days, t).map(({ icon: Icon, text }) => (
              <li key={text} className={`flex items-center gap-2.5 text-[12.5px] font-bold ${dark ? 'text-ivory/85' : 'text-ink'}`}>
                <Icon size={14} className={`shrink-0 ${dark ? 'text-brass-soft' : 'text-emerald'}`} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1" />

      {/* ===== الزرار ===== */}
      <div className="relative px-6 pb-6 sm:px-7 sm:pb-7">
        <button
          type="button"
          onClick={() => onOrder(pkg)}
          disabled={isSubscribed}
          className={`group flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14.5px] font-extrabold transition disabled:opacity-70 ${
            isSubscribed
              ? 'bg-ok text-white'
              : dark
                ? 'bg-gradient-to-l from-brass to-brass-soft text-[#241608] hover:brightness-105'
                : 'bg-night text-ivory hover:bg-emerald'
          }`}
        >
          {isSubscribed ? (
            <>
              <Check size={16} /> {t('packages.currentPlan')}
            </>
          ) : (
            <>
              {highlighted && <Crown size={15} />}
              {t('packages.order')}
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
            </>
          )}
        </button>
        {!isSubscribed && (
          <p className={`mt-2.5 text-center text-[11.5px] ${dark ? 'text-ivory/45' : 'text-ink-dim'}`}>
            {t('packages.ctaNote')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * "الباقات بتشتغل إزاي؟" — اللي العميل لازم يفهمه قبل ما يدفع:
 * الضيوف مالهمش حد، والدعوة معاه مدى الحياة، والتعديل شهر من التفعيل،
 * والدفع مرة واحدة. أربع بطاقات قصيرة بدل فقرة طويلة محدش هيقراها.
 */
function HowItWorks({ days }) {
  const { t } = useTranslation();
  const items = [
    { icon: Users, title: t('packages.how1Title'), body: t('packages.how1Body') },
    { icon: InfinityIcon, title: t('packages.how2Title'), body: t('packages.how2Body') },
    ...(days > 0
      ? [{ icon: Pencil, title: t('packages.how3Title', { days }), body: t('packages.how3Body', { days }) }]
      : []),
    { icon: CreditCard, title: t('packages.how4Title'), body: t('packages.how4Body') },
  ];

  return (
    <section className="mx-auto mb-8 max-w-6xl sm:mb-11" aria-labelledby="packages-how-title">
      <div className="mb-5 text-center sm:mb-6">
        <div className="mb-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-emerald sm:text-[12.5px]">
          {t('packages.howEyebrow')}
        </div>
        <h2 id="packages-how-title" className="font-serif text-[21px] font-bold text-ink sm:text-[26px]">
          {t('packages.howTitle')}
        </h2>
      </div>

      <div className={`grid gap-3 sm:grid-cols-2 sm:gap-4 ${items.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-[20px] border border-line bg-card p-5">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <Icon size={18} />
            </span>
            <h3 className="mb-1.5 font-serif text-[16.5px] font-bold text-ink">{title}</h3>
            <p className="text-[13px] leading-[1.85] text-ink-dim">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * باقة سعرها مش ثابت (أصحاب البيزنس، القاعات واللوكيشنات): مفيش رقم ولا زرار
 * "اطلب" — السعر بيتحدد مع صاحب الموقع على واتساب. الطلب مش بيمر على
 * السيرفر أصلًا (الباقتين مش في packages/registry.js)، فمفيش طريق يشتريها
 * بالغلط من صفحة الدفع.
 */
function ContactPackageCard({ icon: Icon, name, forText, points, message, index }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex flex-col rounded-[24px] border border-brass/40 bg-gradient-to-b from-brass/[0.09] to-transparent p-6 sm:p-7"
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brass/20 text-brass">
        <Icon size={22} />
      </span>
      <h3 className="font-serif text-[22px] font-bold text-ink">{name}</h3>
      <p className="mt-1.5 text-[13.5px] leading-[1.85] text-ink-dim">{forText}</p>

      <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-night px-3.5 py-1.5 text-[12px] font-bold text-brass-soft">
        <MessageCircle size={13} /> {t('packages.priceViaWa')}
      </div>

      <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink">
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <Check size={11} strokeWidth={3} />
            </span>
            {p}
          </li>
        ))}
      </ul>

      <div className="flex-1" />

      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft py-3.5 text-[14.5px] font-extrabold text-[#241608] transition hover:brightness-105"
      >
        <MessageCircle size={16} /> {t('packages.waCta')}
      </a>
      <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('packages.waNote')}</p>
    </motion.div>
  );
}

/** قسم باقات البيزنس والقاعات — بيبان لأي زائر (مش محتاج تسجيل: مفيش سعر بالعملة) */
function BusinessSection() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto mt-12 max-w-4xl sm:mt-16" aria-labelledby="packages-biz-title">
      <div className="mx-auto mb-6 max-w-[60ch] text-center sm:mb-8">
        <div className="mb-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-emerald sm:text-[12.5px]">
          {t('packages.bizEyebrow')}
        </div>
        <h2 id="packages-biz-title" className="mb-2 font-serif text-[22px] font-bold text-ink sm:text-[28px]">
          {t('packages.bizTitle')}
        </h2>
        <p className="text-[14px] leading-[1.85] text-ink-dim sm:text-[15px]">{t('packages.bizSubtitle')}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
        <ContactPackageCard
          index={0}
          icon={Briefcase}
          name={t('packages.bizName')}
          forText={t('packages.bizFor')}
          points={[t('packages.bizP1'), t('packages.bizP2'), t('packages.bizP3')]}
          message={t('packages.bizMsg')}
        />
        <ContactPackageCard
          index={1}
          icon={Building2}
          name={t('packages.venueName')}
          forText={t('packages.venueFor')}
          points={[t('packages.venueP1'), t('packages.venueP2'), t('packages.venueP3')]}
          message={t('packages.venueMsg')}
        />
      </div>
    </section>
  );
}

/**
 * أسئلة العميل قبل ما يدفع. <details> مش JS: بتشتغل من غير سكريبت وبتتقرا
 * بقارئ الشاشة، وكل الإجابات فى الـDOM فمحرّكات البحث بتشوفها.
 */
function Faq({ days }) {
  const { t } = useTranslation();
  // أسئلة مدة التعديل (3 و4) مالهاش معنى لو القاعدة متقفلة
  const numbers = [1, 2, 3, 4, 5].filter((n) => days > 0 || (n !== 3 && n !== 4));
  return (
    <section className="mx-auto mt-12 max-w-3xl sm:mt-16" aria-labelledby="packages-faq-title">
      <h2 id="packages-faq-title" className="mb-5 text-center font-serif text-[22px] font-bold text-ink sm:text-[28px]">
        {t('packages.faqTitle')}
      </h2>
      <div className="flex flex-col gap-2.5">
        {numbers.map((n) => (
          <details key={n} className="group rounded-2xl border border-line bg-card px-5 py-4 open:border-emerald/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-bold leading-snug text-ink [&::-webkit-details-marker]:hidden">
              {t(`packages.faq${n}Q`, { days })}
              <ChevronDown size={16} className="shrink-0 text-ink-dim transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[13.5px] leading-[1.9] text-ink-dim">{t(`packages.faq${n}A`, { days })}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function PackagesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetPackagesQuery(i18n.language);
  const { data: meData } = useGetMeQuery();
  const user = meData?.user ?? null;

  /**
   * الضغط على الباقة بيوديه صفحة الدفع — مش بيغيّر كلمة الزرار ويسيبه
   * يدوّر على بيانات التحويل في آخر الصفحة.
   */
  function handleOrder(pkg) {
    if (!user) {
      dispatch(openAuthModal('register'));
      return;
    }
    navigate(`/checkout/${pkg.id}`);
  }

  const sub = data?.subscription;
  const packages = data?.packages || [];
  // مدة التعديل (بالأيام) جاية من السيرفر — 30 افتراضيًا لحد ما الرد يوصل
  // (نفس الرقم الافتراضي في packages/registry.js)، و0 = القاعدة متقفلة
  const days = data?.editWindowDays ?? 30;
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const edit = data?.edit;
  // مشترك مدة تعديله خلصت — الباقة موجودة لكن المحرر مقفول
  const editEnded = !!sub?.packageId && edit?.editOpen === false;
  // مشترك جديد مدة تعديله شغالة — نوريله يفضل له كام
  const editRunning = !!sub?.packageId && edit?.editOpen === true && !!edit?.editUntil;
  // أغلى سعر للدعوة الواحدة = الأساس اللي بنحسب عليه التوفير
  const cheapestPerUnit = packages.length
    ? Math.max(...packages.map((p) => p.price / Math.max(1, p.invitations)))
    : 0;

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-5 sm:px-6 sm:pt-10">
        <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose sm:mb-8 sm:text-sm">
          <ArrowRight size={15} /> {t('packages.back')}
        </Link>

        {/* ===== المقدمة ===== */}
        <div className="mx-auto mb-7 max-w-[58ch] text-center sm:mb-12">
          <div className="mb-2 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-emerald sm:mb-3 sm:text-[12.5px]">
            {t('packages.eyebrow')}
          </div>
          <h1 className="mb-2.5 font-serif text-[26px] font-bold leading-[1.3] text-ink sm:mb-3 sm:text-[clamp(30px,4vw,42px)]">
            {t('packages.title')}
          </h1>
          <p className="text-[14px] leading-[1.85] text-ink-dim sm:text-[15.5px]">
            {days > 0 ? t('packages.subtitle', { days }) : t('packages.subtitleNoLimit')}
          </p>
        </div>

        {sub?.packageId && sub.invitationsLeft > 0 && (
          <div className="mx-auto mb-4 max-w-lg rounded-2xl border border-emerald/30 bg-emerald/[0.07] px-5 py-3.5 text-center text-[13.5px] text-emerald sm:px-6 sm:py-4 sm:text-[14.5px]">
            <span dangerouslySetInnerHTML={{ __html: t('packages.activeNotice', { count: sub.invitationsLeft }) }} />
            {editRunning && (
              <div
                className="mt-1.5 text-[12.5px] text-emerald/85"
                dangerouslySetInnerHTML={{
                  __html: t('packages.editOpenNotice', {
                    date: formatDay(edit.editUntil, lang), days: edit.editDaysLeft,
                  }),
                }}
              />
            )}
          </div>
        )}

        {/* مدة التعديل خلصت: الدعوات شغالة، والحل قدامه على طول */}
        {editEnded && (
          <div className="mx-auto mb-4 flex max-w-lg items-start gap-2.5 rounded-2xl border border-brass/45 bg-brass/[0.09] px-5 py-3.5 text-[13px] leading-[1.85] text-ink sm:px-6 sm:py-4">
            <Lock size={15} className="mt-1 shrink-0 text-brass" />
            <span>{t('packages.editEndedNotice', { days })}</span>
          </div>
        )}
        <div className="mb-3 sm:mb-6" />

        <HowItWorks days={days} />

        {/* الفيديو قبل الأسعار: العميل لازم يشوف اللي هيدفع عشانه قبل
            ما يشوف الرقم — مش بعده */}
        <div className="mx-auto mb-8 max-w-3xl sm:mb-11">
          <EditorDemo />
          <p className="mt-3 text-center text-[12.5px] text-ink-dim">{t('demo.underPrices')}</p>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-ink-dim">{t('packages.loading')}</p>
        ) : data?.requiresAuth ? (
          // الأسعار نفسها بتختلف حسب دولة العميل، ودولته بتتعرف من حسابه.
          // فبدل ما نوريه سعر يتغيّر قدامه بعد ما يسجّل، بنستناه يسجّل.
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg rounded-[24px] border border-brass/40 bg-gradient-to-b from-brass/[0.08] to-transparent p-7 text-center sm:p-8"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brass/15">
              <Lock size={20} className="text-brass" />
            </div>
            <h2 className="mb-2 font-serif text-xl font-bold text-ink">{t('packages.authTitle')}</h2>
            <p className="mb-6 text-[13.5px] leading-relaxed text-ink-dim">{t('packages.authBody')}</p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => dispatch(openAuthModal('register'))}
                className="rounded-full bg-gradient-to-l from-brass to-brass-soft px-7 py-3.5 font-extrabold text-[#241608] hover:brightness-105"
              >
                {t('packages.authRegister')}
              </button>
              <button
                type="button"
                onClick={() => dispatch(openAuthModal('login'))}
                className="rounded-full border border-ink px-7 py-3.5 font-bold text-ink hover:bg-ink/5"
              >
                {t('packages.authLogin')}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* الباقات تحت بعض على الموبايل، وجنب بعض على الشاشة الكبيرة.
                العدد بيختلف حسب بلد العميل (المصري بيشوف باقة الدعوة
                الواحدة كمان)، فالأعمدة بتتحسب مش مكتوبة برقم ثابت */}
            <div
              className={`grid items-stretch gap-5 lg:gap-6 ${
                packages.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'lg:grid-cols-3'
              }`}
            >
              {packages.map((pkg, i) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  prev={i > 0 ? packages[i - 1] : null}
                  index={i}
                  highlighted={pkg.id === 'plus'}
                  onOrder={handleOrder}
                  currentPackageId={sub?.packageId || null}
                  cheapestPerUnit={cheapestPerUnit}
                  days={days}
                />
              ))}
            </div>

            {/* ===== صف الطمأنة ===== */}
            {/* آخر حاجة بيقراها قبل ما يضغط — بيرد على المخاوف التلاتة
                اللي بتوقف أي حد قبل الدفع */}
            <div className="mx-auto mt-8 grid max-w-3xl gap-2.5 sm:mt-12 sm:grid-cols-3">
              {[
                { icon: Clock, key: 'packages.trust1' },
                { icon: InfinityIcon, key: 'packages.trust2' },
                { icon: ShieldCheck, key: 'packages.trust3' },
              ].map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-4 py-3.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                    <Icon size={15} />
                  </span>
                  <span className="text-[12.5px] font-bold leading-snug text-ink">{t(key)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* بيبان لأي زائر — مفيش سعر بالعملة هنا، فمش محتاج تسجيل */}
        <BusinessSection />

        <Faq days={days} />

        {!user && !isLoading && (
          <div className="mx-auto mt-9 max-w-2xl rounded-[22px] border border-line bg-card p-6 text-center sm:mt-12 sm:p-7">
            <h2 className="mb-2 font-serif text-xl font-bold text-ink">{t('packages.signupTitle')}</h2>
            <p className="mb-5 text-[13.5px] leading-relaxed text-ink-dim sm:text-[14.5px]">
              {t('packages.signupText')}
            </p>
            <button
              type="button"
              onClick={() => dispatch(openAuthModal('register'))}
              className="inline-flex rounded-full bg-gradient-to-l from-brass to-brass-soft px-7 py-3 font-extrabold text-[#241608] hover:brightness-105"
            >
              {t('packages.signupCta')}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
