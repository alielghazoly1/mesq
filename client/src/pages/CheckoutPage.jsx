// صفحة الدفع — /checkout/:packageId
//
// ليه صفحة مستقلة: قبل كده العميل كان بيضغط "اطلب الباقة" في نص صفحة
// طولها 5 شاشات، والزرار كان بيغيّر كلمة بس، وبيانات التحويل تحت في
// آخر الصفحة. يعني اللحظة الوحيدة اللي بيدفع فيها فلوس كانت أضعف لحظة
// في الموقع. دلوقتي بقت صفحة واحدة بتقوله بالترتيب: بتدفع كام، لمين،
// وإيه اللي بعد كده.
//
// السعر وبيانات التحويل الاتنين بييجوا من السيرفر حسب دولة العميل
// (مصر ← جنيه + فودافون كاش، غيرها ← دولار + تحويل بنكي).
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  ArrowRight, Check, Copy, Upload, Loader2, ChevronDown, ChevronUp,
  Clock, AlertCircle, AlertTriangle, Sparkles, MessageCircle, Infinity as InfinityIcon, Pencil,
  Zap, ShieldCheck, ExternalLink,
} from 'lucide-react';
import { VodafoneCashLogo, VodafoneMark, BankMark } from '../components/PayBrand.jsx';
import {
  useGetPackagesQuery, useGetPaymentInfoQuery, useOrderPackageMutation,
  useUploadPaymentProofMutation, useGetMeQuery,
} from '../store/api.js';
import { openAuthModal } from '../store/uiSlice.js';
import { tooBig, sizeError, uploadError } from '../lib/uploadLimits.js';
import { whatsappLink } from '../lib/contact.js';
import Footer from '../components/Footer.jsx';
import BarqPay from '../components/BarqPay.jsx';
import InstaPay from '../components/InstaPay.jsx';

/**
 * خانة بيانات جنب بعضها — كل واحدة كارت مستقل فيه العنوان فوق والقيمة
 * تحته كاملة، والكارت كله زرار نسخ.
 *
 * ليه كارت مش صف: الأرقام دي (حساب بنكي، IBAN، محفظة) بتتكتب غلط
 * بسهولة، والصف الأفقي كان بيزنق الرقم في نص المساحة ويقصّه. الكارت
 * بيدّي الرقم السطر بتاعه كامل، والمساحة كلها هدف للضغط — وده أهم حاجة
 * على الموبايل.
 */
function CopyTile({ label, value, wide }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(value).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 1800); },
        () => {}
      )}
      className={`group relative flex min-w-0 flex-col gap-1.5 rounded-2xl border p-3 text-start transition ${
        copied ? 'border-ok bg-ok/[0.07]' : 'border-line bg-ivory/60 hover:border-ink/25 active:bg-ink/5'
      } ${wide ? 'col-span-2' : ''}`}
    >
      {/* العنوان بيتحول لـ"اتنسخ" مكانه — من غير سطر زيادة فاضي ولا
          قفزة في التصميم وقت الضغط */}
      <span className={`flex items-center justify-between gap-2 text-[11.5px] font-bold ${
        copied ? 'text-ok' : 'text-ink-dim'
      }`}
      >
        <span className="truncate">{copied ? t('checkout.copied') : label}</span>
        {copied
          ? <Check size={14} className="shrink-0 text-ok" />
          : <Copy size={14} className="shrink-0 text-ink-dim/70 transition group-hover:text-rose" />}
      </span>
      <span className="break-all font-mono text-[14.5px] font-bold leading-snug text-ink" dir="auto">
        {value}
      </span>
    </button>
  );
}

/** 01012345678 ← "010 1234 5678" للعرض بس (النسخ بيبقى الرقم زي ما هو) */
function formatEgPhone(v) {
  const d = String(v || '').replace(/\s+/g, '');
  return /^01\d{9}$/.test(d) ? `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}` : v;
}

/** https://app.kast.xyz/kasttag/name ← "name" (للعرض على الموبايل) */
function kastTag(link) {
  const m = String(link || '').match(/kasttag\/([A-Za-z0-9_.-]+)/);
  return m ? m[1] : '';
}

/** خانة نسخ Taptap — كبيرة وواضحة، و"اتنسخ ✓" مكان زرار النسخ */
function TaptapCopy({ label, value, display, big, field }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      data-taptap-copy={field}
      onClick={() => navigator.clipboard.writeText(String(value).replace(/\s+/g, field === 'phone' ? '' : ' ')).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 1800); },
        () => {}
      )}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-start transition ${
        copied ? 'border-ok bg-ok/[0.06]' : field === 'kast' ? 'border-line bg-ivory/60 hover:border-ink/30 active:scale-[.99]' : 'border-[#2c6e49]/20 bg-[#f6fbf7] hover:border-[#02681f]/50 active:scale-[.99]'
      }`}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11.5px] font-bold text-ink-dim">{label}</span>
        <span
          className={`font-extrabold text-ink ${big ? 'whitespace-nowrap font-mono text-[clamp(17px,5.6vw,21px)] min-[360px]:tracking-wide' : 'break-words text-[16.5px] leading-snug'}`}
          dir={big ? 'ltr' : 'auto'}
          style={big ? { textAlign: 'start' } : undefined}
        >
          {display || value}
        </span>
      </span>
      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 min-[360px]:px-3 text-[11.5px] font-extrabold ${
        copied ? 'bg-ok text-white' : field === 'kast' ? 'bg-[#0a0a0a] text-white' : 'bg-[#02681f] text-white'
      }`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        <span className="max-[359px]:hidden">{copied ? t('checkout.taptapCopied') : t('checkout.taptapCopy')}</span>
      </span>
    </button>
  );
}

/** خطوة مرقّمة */
function Step({ n, title, done, children }) {
  return (
    <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-extrabold ${
            done ? 'bg-ok text-white' : 'bg-night text-brass-soft'
          }`}
        >
          {done ? <Check size={14} /> : n}
        </span>
        <h2 className="font-serif text-[16.5px] font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const { data: meData, isLoading: meLoading } = useGetMeQuery();
  const { data: pkgData, isLoading: pkgLoading } = useGetPackagesQuery(i18n.language);
  const { data: payInfo, isLoading: payLoading } = useGetPaymentInfoQuery(undefined, {
    skip: !meData?.user,
  });
  const [orderPackage] = useOrderPackageMutation();
  const [uploadProof, { isLoading: uploading }] = useUploadPaymentProofMutation();

  const fileRef = useRef(null);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const [orderReady, setOrderReady] = useState(false);
  // أنهي حاجة اتنسخت آخر مرة — عشان التأكيد يبان في مكانها بالظبط
  const [copied, setCopied] = useState('');
  // تفاصيل الحساب الإضافية (IBAN وSWIFT والعنوان) — مطويّة افتراضيًا
  const [moreBank, setMoreBank] = useState(false);
  // لأي عميل دولي: تبويب بيبدّل بين البنك و KAST و USDT (اللي المالك مفعّله منهم)
  // — عشان مايبقاش الاتنين تحت بعض والشاشة تطول.
  // null = لسه مختارش — بيتفتح أول تبويب متاح (Taptap لو بلده فيها، وإلا البنك)
  const [payTab, setPayTab] = useState(null);
  // العميل المصري: فودافون كاش (الافتراضي — بطلب المالك) أو إنستاباي
  const [egTab, setEgTab] = useState('vodafone');

  function copy(value, key) {
    if (!value) return;
    navigator.clipboard.writeText(String(value)).then(
      () => { setCopied(key); setTimeout(() => setCopied(''), 2000); },
      () => {}
    );
  }

  const user = meData?.user ?? null;
  const pkg = pkgData?.packages?.find((p) => p.id === packageId) || null;

  // الطلب بيتسجّل أول ما يوصل الصفحة. السيرفر مبيعملش طلب جديد لو عنده
  // واحد معلّق لنفس الباقة، فإعادة تحميل الصفحة مش بتكرّر حاجة — وده
  // مهم عشان رفع الإيصال محتاج طلب معلّق موجود فعلاً.
  useEffect(() => {
    let alive = true;
    if (!user || !pkg || orderReady) return undefined;
    orderPackage({ packageId: pkg.id }).unwrap()
      .then((r) => {
        if (!alive) return;
        setOrderReady(true);
        // رفع إيصال للطلب ده قبل كده؟ (رجع للصفحة أو عمل refresh) — يبقى
        // "جاري المراجعة" مش "ارفع إيصال" تاني
        if (r && r.hasReceipt) setUploaded(true);
      })
      .catch((err) => {
        if (alive) setError(err?.data?.error || t('checkout.orderFailed'));
      });
    return () => { alive = false; };
  }, [user, pkg, orderReady, orderPackage, t]);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (tooBig(file)) { setError(sizeError(file)); return; }
    try {
      const fd = new FormData();
      fd.append('file', file);
      await uploadProof(fd).unwrap();
      setUploaded(true);
    } catch (err) {
      // السيرفر عنده إيصال للطلب ده خلاص — نوريه حالة المراجعة
      if (err?.data?.code === 'RECEIPT_UNDER_REVIEW') { setUploaded(true); return; }
      setError(uploadError(err, t));
    }
  }

  // ===== حالات ما قبل الصفحة =====
  if (meLoading || pkgLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-ink-dim">
        <Loader2 size={17} className="animate-spin" /> {t('packages.loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-serif text-[19px] font-bold text-ink">{t('packages.authTitle')}</p>
        <button
          type="button"
          onClick={() => dispatch(openAuthModal('register'))}
          className="rounded-full bg-gradient-to-l from-brass to-brass-soft px-7 py-3 font-extrabold text-[#241608]"
        >
          {t('packages.authRegister')}
        </button>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle size={24} className="text-ink-dim" />
        <p className="text-ink-dim">{t('checkout.notFound')}</p>
        <Link to="/packages" className="text-rose underline">{t('checkout.backToPackages')}</Link>
      </div>
    );
  }

  const isVodafone = payInfo?.method === 'vodafone';
  const v = payInfo?.vodafone || {};
  const b = payInfo?.bank || {};
  const kast = payInfo?.kast || null;
  const usdt = payInfo?.usdt || null;
  // Taptap Send — السيرفر بيبعتها بس لو بلد العميل من البلاد اللي التطبيق شغال فيها
  const taptap = payInfo?.taptap || null;
  // برق — للعميل اللي في السعودية بس (السيرفر بيبعته ليه بس)، وبييجي الأول
  const barq = payInfo?.barq || null;
  // إنستاباي — للعميل المصري بس، جنب فودافون كاش
  const instapay = isVodafone ? (payInfo?.instapay || null) : null;
  const egActive = !v.number ? 'instapay' : (instapay && egTab === 'instapay' ? 'instapay' : 'vodafone');
  // تبويبات العميل الدولي: Taptap (لو متاحة لبلده — الأسهل، فبتيجي الأول)
  // + البنك دايمًا + KAST و USDT لو المالك مفعّلهم
  const intlTabs = [...(barq ? ['barq'] : []), ...(taptap ? ['taptap'] : []), 'bank', ...(kast ? ['kast'] : []), ...(usdt ? ['usdt'] : [])];
  // التبويب المفتوح: اللي العميل اختاره، وإلا أول واحد متاح
  const activeTab = intlTabs.includes(payTab) ? payTab : intlTabs[0];
  const hasPayData = isVodafone ? !!(v.number || instapay)
    : !!(b.accountNumber || b.iban || barq);
  // مدة التعديل بعد التفعيل — من السيرفر، و0 = القاعدة متقفلة
  const days = pkgData?.editWindowDays ?? 30;

  // طرق دفع تانية بالواتساب — للدفع بالدولار بس. المصري بيدفع فودافون
  // كاش وده كفاية، فمفيش سبب نزحم صفحته. الفحص على عملة الباقة (USD) مش
  // على وصول بيانات الدفع، عشان الزرار يبان حتى لو بيانات التحويل لسه
  // ماتحملتش أو مش متظبطة.
  const showOtherMethods = pkg.currency === 'USD' || pkg.currency === 'SAR';

  return (
    <div className="min-h-screen bg-ivory">
      {/* pb للشريط الثابت تحت على الموبايل.
          على الشاشة الكبيرة الصفحة بتبقى عمودين: الخطوات في ناحية
          والملخص ثابت جنبها — بدل عمود ضيق في النص وفضا على الجنبين. */}
      <div className="mx-auto max-w-2xl px-4 pb-40 pt-6 sm:px-6 sm:pb-16 lg:max-w-5xl lg:pb-20">
        <Link
          to="/packages"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose"
        >
          <ArrowRight size={15} /> {t('checkout.backToPackages')}
        </Link>

        {/* المقدمة مضغوطة على الموبايل: كل سطر هنا بيزقّ بيانات التحويل
            تحت الشاشة، وده بالظبط اللي كان بيخلي الناس تقفل قبل ما
            توصلها */}
        <h1 className="mb-1 font-serif text-[20px] font-bold text-ink sm:text-[clamp(22px,5vw,30px)]">
          {t('checkout.title')}
        </h1>
        <p className="mb-4 hidden text-[13.5px] leading-relaxed text-ink-dim sm:mb-6 sm:block">
          {t('checkout.subtitle')}
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-error/10 px-4 py-3 text-[12.5px] text-error">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-7">
        {/* ===== ملخص الطلب ===== */}
        {/* سطر واحد على الموبايل، وكارت كامل على الشاشة الكبيرة.
            السبب: ده مش اللي العميل محتاجه دلوقتي — هو محتاج يعرف
            يحوّل فين. الملخص كان بياخد نص الشاشة وبيزقّ بيانات
            التحويل تحت، فالناس كانت بتقفل قبل ما توصلها. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4 overflow-hidden rounded-[18px] border border-brass/40 bg-gradient-to-l from-[#0d1f18] to-night text-ivory
            lg:order-2 lg:mb-0 lg:rounded-[22px] lg:sticky lg:top-6"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:p-6">
            <div className="min-w-0">
              <div className="hidden lg:mb-3 lg:inline-flex lg:items-center lg:gap-1.5 lg:rounded-full lg:bg-brass/15 lg:px-3 lg:py-1 lg:text-[11px] lg:font-bold lg:text-brass-soft">
                <Sparkles size={11} /> {t('checkout.summary')}
              </div>
              <div className="truncate font-serif text-[15px] font-bold text-ivory lg:text-[22px]">
                {pkg.name}
              </div>
              <div className="text-[11.5px] text-ivory/55 lg:mt-1 lg:text-[13px]">
                {t('packages.invitations', { count: pkg.invitations })}
              </div>
            </div>
            <div className="flex shrink-0 items-baseline gap-1.5 lg:mt-5 lg:justify-between lg:border-t lg:border-ivory/12 lg:pt-4">
              <span className="hidden text-[13px] text-ivory/65 lg:inline">{t('checkout.total')}</span>
              <span className="flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-1">
                {/* الخصم بيبان هنا بس — باقي أماكن المبلغ في الصفحة
                    بتفضل رقم واحد صريح، عشان مايحوّلش الرقم الغلط */}
                {pkg.listPrice > 0 && (
                  <span className="text-[13px] text-ivory/40 line-through lg:text-[15px]">
                    {pkg.listPrice}
                  </span>
                )}
                <span className="font-serif text-[22px] font-bold leading-none text-brass-soft lg:text-[34px]">
                  {pkg.price}
                </span>
                <span className="text-[12px] text-ivory/70 lg:text-[13px]">{pkg.currencyLabel}</span>
              </span>
            </div>
            {pkg.discountPercent > 0 && (
              <div className="mt-2 flex shrink-0 justify-end lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/15 px-2.5 py-1 text-[11px] font-extrabold text-ok">
                  <Sparkles size={11} /> {pkg.discountLabel}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-4 lg:order-1">
          {/* ===== 1) التحويل — أول وأهم حاجة على الشاشة ===== */}
          <Step n="1" title={t('checkout.step1')}>
            {payLoading ? (
              <p className="flex items-center gap-2 text-[13px] text-ink-dim">
                <Loader2 size={13} className="animate-spin" /> {t('packages.loading')}
              </p>
            ) : !hasPayData ? (
              <p className="rounded-xl bg-brass/10 px-4 py-3 text-[12.5px] text-[#7a5a1a]">
                {t('checkout.noPayData')}
              </p>
            ) : isVodafone ? (
              <>
                {/* فودافون كاش (أول واحد = على اليمين، والافتراضي) أو إنستاباي */}
                {instapay && v.number && (
                  <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl bg-ink/[0.05] p-1">
                    <button
                      type="button"
                      onClick={() => setEgTab('vodafone')}
                      aria-pressed={egActive === 'vodafone'}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold transition ${egActive === 'vodafone' ? 'bg-[#E60000] text-white shadow-sm' : 'text-ink-dim'}`}
                    >
                      <VodafoneMark size={18} /> <span className="whitespace-nowrap" dir="ltr">Vodafone Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEgTab('instapay')}
                      aria-pressed={egActive === 'instapay'}
                      data-tab-instapay
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold transition ${egActive === 'instapay' ? 'bg-[#5a2a82] text-white shadow-sm' : 'text-ink-dim'}`}
                    >
                      <img src="/img/instapay-logo.webp" alt="" className="h-[18px] w-[18px] rounded-[4px] bg-white" /> <span className="whitespace-nowrap" dir="ltr">InstaPay</span>
                    </button>
                  </div>
                )}
                {egActive === 'instapay' && instapay && (
                  <InstaPay info={instapay} CopyTile={CopyTile} amount={`${pkg.price} ${pkg.currencyLabel}`} />
                )}
                {egActive === 'vodafone' && (
                <>
                {/* ===== كارت فودافون كاش ===== */}
                <div className="overflow-hidden rounded-2xl border-2 border-[#E60000]/25 bg-[#E60000]/[0.04]">
                  {/* اللوجو لوحده كفاية — العميل بيعرفه على طول، ومش
                      محتاج عنوان مكتوب جنبه يقوله نفس الحاجة */}
                  <div className="flex flex-col items-center gap-1.5 border-b border-[#E60000]/15 bg-white px-4 py-4">
                    <VodafoneCashLogo height={38} />
                    <div className="text-[11.5px] text-ink-dim">{t('checkout.vodafoneNote')}</div>
                  </div>

                  {/* الرقم — أكبر حاجة في الصفحة، والكارت كله زرار نسخ */}
                  <button
                    type="button"
                    onClick={() => copy(v.number, 'number')}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start transition active:bg-[#E60000]/[0.06]"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11.5px] text-ink-dim">
                        {copied === 'number' ? t('checkout.copied') : t('payment.vodafoneNumber')}
                      </span>
                      <span className="block font-mono text-[26px] font-bold leading-tight text-ink" dir="ltr">
                        {v.number}
                      </span>
                    </span>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      copied === 'number' ? 'bg-ok text-white' : 'bg-night text-ivory'
                    }`}
                    >
                      {copied === 'number' ? <Check size={18} /> : <Copy size={17} />}
                    </span>
                  </button>

                  {v.holderName && (
                    <div className="flex items-center justify-between gap-3 border-t border-[#E60000]/12 px-4 py-2.5">
                      <span className="text-[11.5px] text-ink-dim">{t('payment.vodafoneHolder')}</span>
                      <span className="truncate text-[13px] font-bold text-ink">{v.holderName}</span>
                    </div>
                  )}

                  {/* المبلغ — لازم يبان جنب الرقم بالظبط */}
                  <button
                    type="button"
                    onClick={() => copy(String(pkg.price), 'amount')}
                    className="flex w-full items-center justify-between gap-3 border-t border-[#E60000]/12 bg-emerald/[0.06] px-4 py-3.5 text-start"
                  >
                    <span className="text-[12.5px] font-bold text-emerald">
                      {copied === 'amount' ? t('checkout.copied') : t('checkout.amountToSend')}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-serif text-[22px] font-bold leading-none text-emerald">
                        {pkg.price} <span className="text-[13px]">{pkg.currencyLabel}</span>
                      </span>
                      {copied === 'amount'
                        ? <Check size={15} className="text-ok" />
                        : <Copy size={14} className="text-emerald/60" />}
                    </span>
                  </button>
                </div>

                {v.note && (
                  <p className="mt-3 rounded-xl bg-brass/[0.09] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#7a5a1a]">
                    {v.note}
                  </p>
                )}
                </>
                )}
              </>
            ) : (
              <>
                {intlTabs.length > 1 ? (
                  /* زرار لكل وسيلة: البنك (الافتراضي) و KAST و USDT — كل
                     واحدة بتعرض تفاصيلها لوحدها، عشان الشاشة ماتطولش */
                  <div className={`mb-4 grid gap-1.5 rounded-2xl bg-ink/[0.05] p-1 ${intlTabs.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : intlTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {barq && (
                      <button
                        type="button"
                        onClick={() => setPayTab('barq')}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold transition ${activeTab === 'barq' ? 'bg-black text-white shadow-sm' : 'text-ink-dim'}`}
                      >
                        <img src="/img/barq-logo.svg" alt="" className="h-[18px] w-[18px] rounded-[5px]" /> {t('saPay.barq')}
                      </button>
                    )}
                    {taptap && (
                      <button
                        type="button"
                        onClick={() => setPayTab('taptap')}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold transition ${activeTab === 'taptap' ? 'bg-[#02681f] text-white shadow-sm' : 'text-ink-dim'}`}
                      >
                        <img src="/img/taptap-icon.webp" alt="" className="h-5 w-5" />
                        <span className="whitespace-nowrap" dir="ltr">{intlTabs.length === 3 ? 'Taptap' : 'Taptap Send'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPayTab('bank')}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold transition ${activeTab === 'bank' ? 'bg-white text-ink shadow-sm' : 'text-ink-dim'}`}
                    >
                      {/* اسم قصير في الزرار (الطويل كان بيلف على 3 سطور جنب KAST و USDT) */}
                      <BankMark size={17} /> <span className="whitespace-nowrap">{t('payment.bankShort')}</span>
                    </button>
                    {kast && (
                    <button
                      type="button"
                      onClick={() => setPayTab('kast')}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold tracking-wide transition ${activeTab === 'kast' ? 'bg-[#0a0a0a] text-white shadow-sm' : 'text-ink-dim'}`}
                    >
                      KAST
                    </button>
                    )}
                    {usdt && (
                      <button
                        type="button"
                        onClick={() => setPayTab('usdt')}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-extrabold transition ${activeTab === 'usdt' ? 'bg-[#26A17B] text-white shadow-sm' : 'text-ink-dim'}`}
                      >
                        <img src="/img/usdt-logo.svg" alt="" className="h-[17px] w-[17px] rounded-full ring-2 ring-white/90" /> USDT
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-line px-3 py-2 text-[12.5px] font-bold text-ink">
                    <BankMark size={26} />
                    {t('payment.bankTitle')}
                  </div>
                )}

                {(intlTabs.length === 1 || activeTab === 'bank') && (
                <>
                {/* التلاتة اللي بيتم التحويل بيهم فعلاً بس — والأول
                    فيهم الـIBAN، ده الرقم اللي العميل بيحوّل عليه.
                    الباقي (رقم الحساب الداخلي، SWIFT، العنوان، الاسم
                    بالعربي) بيلزم في حالات معيّنة بس، وعرضه كله مع
                    بعض كان بيعمل حيطة أرقام العميل بيتوه فيها. */}
                <div className="grid grid-cols-2 gap-2.5">
                  <CopyTile label={t('payment.iban')} value={b.iban} wide />
                  <CopyTile label={t('payment.bank')} value={b.bankName} />
                  <CopyTile label={t('payment.accountHolder')} value={b.accountNameEn} />
                </div>
                <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('checkout.tapToCopy')}</p>

                {/* الباقي تحت زرار — موجود لما يحتاجه، ومش واقف في وشه */}
                {(b.accountNumber || b.swift || b.address || b.accountNameAr) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMoreBank((v) => !v)}
                      aria-expanded={moreBank}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[12px] font-bold text-ink-dim transition hover:border-ink/30 hover:text-ink"
                    >
                      {moreBank ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {moreBank ? t('checkout.lessDetails') : t('checkout.moreDetails')}
                    </button>
                    {moreBank && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                          <CopyTile label={t('payment.accountNumber')} value={b.accountNumber} wide />
                          <CopyTile label={t('payment.accountNameAr')} value={b.accountNameAr} wide />
                          <CopyTile label={t('payment.swift')} value={b.swift} />
                          <CopyTile label={t('payment.address')} value={b.address} />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* المبلغ مكرر هنا بالقصد: ده آخر حاجة بيشوفها قبل ما
                    يفتح تطبيق التحويل */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald/[0.07] px-4 py-3">
                  <span className="text-[12.5px] font-bold text-emerald">{t('checkout.amountToSend')}</span>
                  <span className="font-serif text-[18px] font-bold text-emerald">
                    {pkg.price} {pkg.currencyLabel}
                  </span>
                </div>

                {b.note && (
                  <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{b.note}</p>
                )}
                </>
                )}

                {/* ===== KAST — تبويبه (بيظهر لو المالك مفعّلها) ===== */}
                {kast && activeTab === 'kast' && (
                  <div className="mt-4 rounded-2xl border border-line bg-ink/[0.02] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-[#0a0a0a] px-3 py-2">
                        <img src="/img/kast-logo.svg" alt="KAST" className="h-4 w-auto" />
                      </span>
                      <span className="text-[11.5px] font-bold text-ink-dim">{t('checkout.kastTagline')}</span>
                    </div>
                    {/* الـ QR على اللابتوب بس (العميل بيمسحه بموبايله). على الموبايل
                        مالوش لازمة — بيظهر التاج ينتسخ + زرار يفتح KAST على طول */}
                    {kast.qr && (
                      <div className="hidden flex-col items-center md:flex" data-kast-qr>
                        <img
                          src={kast.qr}
                          alt="KAST QR"
                          width={168}
                          height={168}
                          className="rounded-xl border border-line bg-white p-2"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="mt-2 text-center text-[11.5px] text-ink-dim">{t('checkout.kastScan')}</p>
                      </div>
                    )}
                    {kastTag(kast.link) && (
                      <div className="md:hidden" data-kast-tag>
                        <p className="mb-2.5 text-[12.5px] font-bold leading-relaxed text-ink-dim">{t('checkout.kastMobile')}</p>
                        <TaptapCopy label={t('checkout.kastTag')} value={'@' + kastTag(kast.link)} field="kast" />
                      </div>
                    )}
                    {kast.holderName && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-ink/[0.03] px-3 py-2">
                        <span className="text-[11.5px] text-ink-dim">{t('checkout.kastHolder')}</span>
                        <span className="text-[13px] font-bold text-ink">{kast.holderName}</span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald/[0.07] px-4 py-3">
                      <span className="text-[12.5px] font-bold text-emerald">{t('checkout.amountToSend')}</span>
                      <span className="font-serif text-[18px] font-bold text-emerald">
                        {pkg.price} {pkg.currencyLabel}
                      </span>
                    </div>
                    <a
                      href={kast.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0a0a] py-3.5 text-[14px] font-bold text-white transition hover:brightness-150 md:py-3 md:text-[13px]"
                      data-kast-pay
                    >
                      <img src="/img/kast-logo.svg" alt="" className="h-3.5 w-auto" /> {t('checkout.kastPay')}
                    </a>
                    {kast.note && (
                      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{kast.note}</p>
                    )}
                  </div>
                )}

                {/* ===== برق — للعميل اللي في السعودية ===== */}
                {barq && activeTab === 'barq' && (
                  <BarqPay barq={barq} CopyTile={CopyTile} amount={`${pkg.price} ${pkg.currencyLabel}`} />
                )}

                {/* ===== Taptap Send — للبلاد اللي التطبيق شغال فيها بس =====
                    باللوجو الرسمي بتاعهم وألوانهم، والعميل بيشوف رقم فودافون كاش
                    واسم المستلم بس (المكان اتشال بطلب المالك) */}
                {taptap && activeTab === 'taptap' && (
                  <div className="mt-4 overflow-hidden rounded-[22px] border border-[#2c6e49]/15 bg-white shadow-[0_18px_40px_-30px_rgba(2,104,31,.55)]" data-taptap>
                    <div className="relative flex items-center justify-between gap-2 overflow-hidden bg-[#dbf1e2] px-3.5 py-3 min-[360px]:px-4">
                      <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 -end-8 h-28 w-28 rounded-full bg-[#b6e4c5]" />
                      <img src="/img/taptap-send-logo.webp" alt="Taptap Send" width="116" height="55" className="relative h-[44px] w-auto min-[360px]:h-[52px]" data-taptap-logo />
                      <span className="relative flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pe-2.5 ps-1 shadow-sm" dir="ltr">
                          <VodafoneMark size={18} />
                          <span className="whitespace-nowrap text-[11px] font-extrabold tracking-tight text-[#E60000]">Vodafone Cash</span>
                        </span>
                        <span className="whitespace-nowrap text-[10px] font-bold text-[#02681f] min-[360px]:text-[10.5px]">{t('checkout.taptapTagline')}</span>
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="mb-3.5 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#02681f]/[0.07] px-2.5 py-1 text-[11px] font-bold text-[#02681f]"><Zap size={12} /> {t('checkout.taptapFast')}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#02681f]/[0.07] px-2.5 py-1 text-[11px] font-bold text-[#02681f]"><ShieldCheck size={12} /> {t('checkout.taptapNoFee')}</span>
                      </div>

                      <ol className="mb-4 space-y-2" data-taptap-steps>
                        {['taptapStep1', 'taptapStep2', 'taptapStep3'].map((k, i) => (
                          <li key={k} className="flex items-start gap-2.5 text-[12.5px] font-bold leading-relaxed text-ink">
                            <span className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-[#02681f] text-[11px] font-extrabold text-white">{i + 1}</span>
                            <span>{t(`checkout.${k}`)}</span>
                          </li>
                        ))}
                      </ol>

                      <div className="space-y-2.5">
                        <TaptapCopy label={t('checkout.taptapPhone')} value={taptap.phone} display={formatEgPhone(taptap.phone)} big field="phone" />
                        <TaptapCopy label={t('checkout.taptapName')} value={taptap.recipientName} field="name" />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#02681f] px-4 py-3 text-white">
                        <span className="flex flex-col">
                          <span className="text-[12px] font-bold text-white/80">{t('checkout.amountToSend')}</span>
                          <span className="text-[10.5px] leading-snug text-white/65">{t('checkout.taptapAmountHint')}</span>
                        </span>
                        <span className="shrink-0 font-serif text-[22px] font-bold leading-none">
                          {pkg.price} <span className="text-[13px]">{pkg.currencyLabel}</span>
                        </span>
                      </div>

                      <a
                        href="https://www.taptapsend.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#02681f] bg-white py-2.5 text-[13px] font-extrabold text-[#02681f] transition hover:bg-[#dbf1e2]"
                      >
                        <img src="/img/taptap-icon.webp" alt="" className="h-6 w-6" /> {t('checkout.taptapOpen')}
                        <ExternalLink size={13} className="opacity-60" />
                      </a>
                      {taptap.note && (
                        <p className="mt-3 rounded-xl bg-ink/[0.03] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-dim">{taptap.note}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== USDT على Solana — تبويبه (بيظهر لو المالك مفعّله) ===== */}
                {usdt && activeTab === 'usdt' && (
                  <div className="mt-4 rounded-2xl border border-line bg-ink/[0.02] p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <img src="/img/usdt-logo.svg" alt="USDT" className="h-9 w-9 drop-shadow-sm" />
                        <span className="flex flex-col leading-tight">
                          <span className="text-[15px] font-extrabold text-ink" dir="ltr">USDT</span>
                          <span className="text-[11px] font-bold text-ink-dim">Tether</span>
                        </span>
                      </span>
                      {/* الشبكة — أهم معلومة، فواضحة جدًا */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0b14] px-3 py-1.5 text-[11.5px] font-bold text-white" dir="ltr">
                        <img src="/img/solana-logo.svg" alt="" className="h-3 w-auto" /> Solana
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <img
                        src={usdt.qr}
                        alt="USDT Solana QR"
                        width={168}
                        height={168}
                        className="rounded-xl border border-line bg-white p-2"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <p className="mt-2 text-center text-[11.5px] text-ink-dim">{t('checkout.usdtScan')}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      <CopyTile label={t('checkout.usdtAddress')} value={usdt.address} wide />
                    </div>

                    {/* تحذير الشبكة: أي شبكة غير Solana الفلوس بتضيع */}
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#f5a524]/[0.12] px-3.5 py-3 text-[12px] font-bold leading-relaxed text-[#8a5a00]">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {t('checkout.usdtWarn')}
                    </p>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald/[0.07] px-4 py-3">
                      <span className="text-[12.5px] font-bold text-emerald">{t('checkout.amountToSend')}</span>
                      <span className="font-serif text-[18px] font-bold text-emerald" dir="ltr">
                        {pkg.currency === 'USD' ? `${pkg.price} USDT` : `${pkg.price} ${pkg.currencyLabel}`}
                      </span>
                    </div>
                    {usdt.note && (
                      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">{usdt.note}</p>
                    )}
                  </div>
                )}
              </>
            )}

          </Step>

          {/* ===== 2) الإيصال ===== */}
          <Step n="2" title={t('checkout.step2')} done={uploaded}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onPickFile}
            />
            {uploaded ? (
              /* الإيصال وصل وبنراجعه — مفيش رفع تاني. لو اترفض، العميل بتوصله
                 رسالة ويقدر يرفع إيصال جديد؛ ولو اتفعّل بتوصله رسالة الترحيب */
              <div className="rounded-2xl border border-brass/40 bg-brass/[0.07] p-5 text-center" role="status">
                <span className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brass/15 text-[#8a6418]">
                  <Clock size={20} />
                  <span className="absolute inset-0 animate-ping rounded-full bg-brass/15" />
                </span>
                <p className="mt-3 text-[14px] font-extrabold text-ink">{t('checkout.reviewingTitle')}</p>
                <p className="mx-auto mt-1.5 max-w-[42ch] text-[12.5px] leading-[1.9] text-ink-dim">{t('checkout.reviewingBody')}</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-[13px] leading-relaxed text-ink-dim">{t('checkout.step2Hint')}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-night py-3.5 text-[13.5px] font-bold text-ivory transition hover:bg-emerald disabled:opacity-60"
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? t('payment.uploading') : t('payment.uploadProof')}
                </button>
                <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('payment.proofHint')}</p>
              </>
            )}
          </Step>

          {/* ===== 3) التفعيل ===== */}
          <Step n="3" title={t('checkout.step3')}>
            <p className="text-[13px] leading-[1.9] text-ink-dim">{t('checkout.step3Hint')}</p>
            {/* اللي هيستلمه بعد التفعيل — بيتقري هنا آخر حاجة قبل ما يدفع */}
            <div className="mt-4 grid gap-2.5">
              <div className="flex items-start gap-2.5 rounded-xl bg-ivory/70 px-3.5 py-3">
                <Clock size={14} className="mt-0.5 shrink-0 text-emerald" />
                <span className="text-[12.5px] text-ink-dim">{t('checkout.perk1')}</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-ivory/70 px-3.5 py-3">
                <InfinityIcon size={14} className="mt-0.5 shrink-0 text-emerald" />
                <span className="text-[12.5px] text-ink-dim">{t('checkout.perkLife')}</span>
              </div>
              {/* مدة تعديل الباقة دي بالذات (30/60/90/مدى الحياة) */}
              {days > 0 && pkg.editDays !== 0 && (
                <div className="flex items-start gap-2.5 rounded-xl bg-ivory/70 px-3.5 py-3">
                  <Pencil size={14} className="mt-0.5 shrink-0 text-emerald" />
                  <span className="text-[12.5px] text-ink-dim">
                    {pkg.editDays === null ? t('packages.every3Life') : t('checkout.perkEdit', { days: pkg.editDays || days })}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-[13px] font-bold text-ink transition hover:border-ink/35"
            >
              {t('checkout.goDashboard')}
            </button>
          </Step>

          {/* ===== طرق دفع تانية — تحت خالص بعد كل الخطوات (الدولار بس) ===== */}
          {!payLoading && showOtherMethods && (
            <div className="mt-2 rounded-2xl border border-brass/40 bg-brass/[0.07] p-4">
              <div className="mb-1 flex items-center gap-2 font-serif text-[15px] font-bold text-ink">
                <MessageCircle size={16} className="text-brass" /> {t('checkout.otherTitle')}
              </div>
              <p className="mb-3 text-[12.5px] leading-relaxed text-ink-dim">{t('checkout.otherBody')}</p>
              <a
                href={whatsappLink(t('checkout.otherMsg', { name: pkg.name, amount: '$' + pkg.price }))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-night py-3 text-[13px] font-bold text-ivory transition hover:bg-emerald"
              >
                <MessageCircle size={15} /> {t('checkout.otherCta')}
              </a>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* شريط ثابت تحت على الموبايل: المبلغ قدامه دايمًا وهو بيقرا */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[11.5px] text-ink-dim">{pkg.name}</div>
            <div className="font-serif text-[19px] font-bold leading-tight text-emerald">
              {pkg.price} <span className="text-[12px] font-sans text-ink-dim">{pkg.currencyLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (uploaded ? navigate('/dashboard') : fileRef.current?.click())}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-3 text-[13px] font-extrabold text-[#241608] disabled:opacity-60"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" />
              : uploaded ? <Check size={14} /> : <Upload size={14} />}
            {uploaded ? t('checkout.goDashboard') : t('payment.uploadProof')}
          </button>
        </div>
      </div>

      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
