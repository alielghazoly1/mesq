// صفحة الدفع — /checkout/:packageId
//
// طريقتين للدفع:
//   • بالفيزا (XPay): العميل بيدوس زرار، بيتحوّل لصفحة دفع XPay آمنة،
//     ويرجع متفعّل أوتوماتيك. ده الأساسي للأجانب والأسهل للكل.
//   • تحويل يدوي (فودافون كاش للمصريين / بنكي للأجانب): بيحوّل ويرفع
//     الإيصال، والأدمن بيفعّل. بيفضل متاح لو الفيزا متعطّلة أو العميل
//     اختاره.
//
// السعر وبيانات الدفع بييجوا من السيرفر حسب دولة العميل. الفيزا بتبان
// بس لو مظبوطة (payInfo.xpay).
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  ArrowRight, Check, Copy, Upload, Loader2, ChevronDown, ChevronUp,
  Clock, AlertCircle, Sparkles, MessageCircle, Infinity as InfinityIcon, Pencil,
  CreditCard, ShieldCheck,
} from 'lucide-react';
import { VodafoneCashLogo, BankMark } from '../components/PayBrand.jsx';
import {
  useGetPackagesQuery, useGetPaymentInfoQuery, useOrderPackageMutation,
  useUploadPaymentProofMutation, useGetMeQuery, useCreateXpayCheckoutMutation,
} from '../store/api.js';
import { openAuthModal } from '../store/uiSlice.js';
import { tooBig, sizeError, uploadError } from '../lib/uploadLimits.js';
import { whatsappLink } from '../lib/contact.js';
import Footer from '../components/Footer.jsx';

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
  const [params] = useSearchParams();
  const canceled = params.get('canceled') === '1';

  const { data: meData, isLoading: meLoading } = useGetMeQuery();
  const { data: pkgData, isLoading: pkgLoading } = useGetPackagesQuery(i18n.language);
  const { data: payInfo, isLoading: payLoading } = useGetPaymentInfoQuery(undefined, {
    skip: !meData?.user,
  });
  const [orderPackage] = useOrderPackageMutation();
  const [uploadProof, { isLoading: uploading }] = useUploadPaymentProofMutation();
  const [createXpayCheckout] = useCreateXpayCheckoutMutation();

  const fileRef = useRef(null);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const [orderReady, setOrderReady] = useState(false);
  const [copied, setCopied] = useState('');
  const [moreBank, setMoreBank] = useState(false);
  // طريقة الدفع المختارة: 'card' (فيزا) أو 'manual' (تحويل). بتتظبط لوحدها
  // أول ما بيانات الدفع توصل، والعميل يقدر يبدّل.
  const [method, setMethod] = useState(null);
  const [termsOk, setTermsOk] = useState(false);
  const [paying, setPaying] = useState(false);

  function copy(value, key) {
    if (!value) return;
    navigator.clipboard.writeText(String(value)).then(
      () => { setCopied(key); setTimeout(() => setCopied(''), 2000); },
      () => {}
    );
  }

  const user = meData?.user ?? null;
  const pkg = pkgData?.packages?.find((p) => p.id === packageId) || null;
  const xpayOn = !!payInfo?.xpay;

  // أول ما نعرف الطريقة المتاحة، بنختار الافتراضي: الفيزا لو متاحة
  useEffect(() => {
    if (!payInfo || method) return;
    setMethod(xpayOn ? 'card' : 'manual');
  }, [payInfo, xpayOn, method]);

  // الطلب اليدوي بيتسجّل أول ما يوصل الصفحة (رفع الإيصال محتاج طلب معلّق).
  // بس لما الطريقة تكون تحويل يدوي — الفيزا بتعمل طلبها لوحدها.
  useEffect(() => {
    let alive = true;
    if (!user || !pkg || orderReady || method !== 'manual') return undefined;
    orderPackage({ packageId: pkg.id }).unwrap()
      .then(() => { if (alive) setOrderReady(true); })
      .catch((err) => {
        if (alive) setError(err?.data?.error || t('checkout.orderFailed'));
      });
    return () => { alive = false; };
  }, [user, pkg, orderReady, orderPackage, t, method]);

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
      setError(uploadError(err, t));
    }
  }

  // بدء الدفع بالفيزا: بنعمل جلسة في السيرفر ونحوّل العميل لصفحة XPay
  async function payByCard() {
    if (!termsOk) { setError(t('checkout.termsError')); return; }
    setError('');
    setPaying(true);
    try {
      const res = await createXpayCheckout({ packageId: pkg.id, termsAccepted: true }).unwrap();
      if (res.url) {
        window.location.href = res.url;
      } else {
        setError(t('checkout.cardFailed'));
        setPaying(false);
      }
    } catch (err) {
      setError(err?.data?.error || t('checkout.cardFailed'));
      setPaying(false);
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
        <p className="max-w-[44ch] text-[13.5px] leading-[1.9] text-ink-dim">{t('packages.authBody')}</p>
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
  const hasPayData = isVodafone ? !!v.number : !!(b.accountNumber || b.iban);
  const days = pkgData?.editWindowDays ?? 30;
  const cardMode = method === 'card' && xpayOn;
  // لسه بنختار الطريقة؟ متبانش أي بانل قبل ما نعرف
  const methodResolved = !!method || !payLoading;

  const termsBox = (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-ivory/50 px-3.5 py-3">
      <input
        type="checkbox"
        checked={termsOk}
        onChange={(e) => setTermsOk(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-emerald"
      />
      <span className="text-[12.5px] leading-relaxed text-ink-dim">
        {t('checkout.termsPre')}{' '}
        <Link to="/terms" target="_blank" className="font-bold text-rose underline">
          {t('checkout.termsLink')}
        </Link>
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-2xl px-4 pb-40 pt-6 sm:px-6 sm:pb-16 lg:max-w-5xl lg:pb-20">
        <Link
          to="/packages"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose"
        >
          <ArrowRight size={15} /> {t('checkout.backToPackages')}
        </Link>

        <h1 className="mb-1 font-serif text-[20px] font-bold text-ink sm:text-[clamp(22px,5vw,30px)]">
          {t('checkout.title')}
        </h1>
        <p className="mb-4 hidden text-[13.5px] leading-relaxed text-ink-dim sm:mb-6 sm:block">
          {t('checkout.subtitle')}
        </p>

        {canceled && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-brass/[0.12] px-4 py-3 text-[12.5px] text-[#7a5a1a]">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {t('checkout.canceled')}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-error/10 px-4 py-3 text-[12.5px] text-error">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-7">
        {/* ===== ملخص الطلب ===== */}
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
          {/* ===== اختيار طريقة الدفع — بيبان بس لما الاتنين متاحين ===== */}
          {xpayOn && hasPayData && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setMethod('card'); setError(''); }}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3.5 text-[13px] font-bold transition ${
                  cardMode ? 'border-emerald bg-emerald/[0.06] text-ink' : 'border-line bg-card text-ink-dim hover:border-ink/25'
                }`}
              >
                <CreditCard size={16} className={cardMode ? 'text-emerald' : ''} />
                {t('checkout.methodCard')}
              </button>
              <button
                type="button"
                onClick={() => { setMethod('manual'); setError(''); }}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3.5 text-[13px] font-bold transition ${
                  !cardMode ? 'border-emerald bg-emerald/[0.06] text-ink' : 'border-line bg-card text-ink-dim hover:border-ink/25'
                }`}
              >
                {isVodafone ? <VodafoneCashLogo height={17} /> : <BankMark size={20} />}
                {isVodafone ? t('checkout.methodVodafone') : t('checkout.methodBank')}
              </button>
            </div>
          )}

          {/* ===== مسار الفيزا ===== */}
          {cardMode && methodResolved && (
            <Step n="1" title={t('checkout.payByCard')}>
              <div className="rounded-2xl border border-emerald/25 bg-emerald/[0.04] p-5 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-night text-brass-soft">
                  <CreditCard size={22} />
                </div>
                <p className="text-[13.5px] leading-relaxed text-ink-dim">{t('checkout.payCardNote')}</p>
                {pkg.currency === 'USD' && (
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-dim/80">{t('checkout.cardEgpNote')}</p>
                )}
                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-ink-dim">
                  <ShieldCheck size={14} className="text-emerald" /> {t('checkout.securedByXpay')}
                </div>
              </div>

              <div className="mt-4">{termsBox}</div>

              <button
                type="button"
                onClick={payByCard}
                disabled={paying || !termsOk}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft py-3.5 text-[14px] font-extrabold text-[#241608] transition hover:brightness-105 disabled:opacity-50"
              >
                {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {paying ? t('checkout.redirecting') : t('checkout.payCardBtn', { amount: `${pkg.price} ${pkg.currencyLabel}` })}
              </button>
            </Step>
          )}

          {/* ===== مسار التحويل اليدوي ===== */}
          {!cardMode && methodResolved && (
          <>
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
                <div className="overflow-hidden rounded-2xl border-2 border-[#E60000]/25 bg-[#E60000]/[0.04]">
                  <div className="flex flex-col items-center gap-1.5 border-b border-[#E60000]/15 bg-white px-4 py-4">
                    <VodafoneCashLogo height={38} />
                    <div className="text-[11.5px] text-ink-dim">{t('checkout.vodafoneNote')}</div>
                  </div>

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
            ) : (
              <>
                <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-line px-3 py-2 text-[12.5px] font-bold text-ink">
                  <BankMark size={26} />
                  {t('payment.bankTitle')}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <CopyTile label={t('payment.iban')} value={b.iban} wide />
                  <CopyTile label={t('payment.bank')} value={b.bankName} />
                  <CopyTile label={t('payment.accountHolder')} value={b.accountNameEn} />
                </div>
                <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('checkout.tapToCopy')}</p>

                {(b.accountNumber || b.swift || b.address || b.accountNameAr) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMoreBank((x) => !x)}
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
              <div className="rounded-2xl border border-ok/40 bg-ok/[0.07] p-5 text-center">
                <Check size={22} className="mx-auto text-ok" />
                <p className="mt-2 text-[13.5px] font-bold text-ok">{t('payment.proofUploaded')}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 text-[12px] font-bold text-ink-dim underline"
                >
                  {t('checkout.reupload')}
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-[13px] leading-relaxed text-ink-dim">{t('checkout.step2Hint')}</p>
                <div className="mb-4">{termsBox}</div>
                <button
                  type="button"
                  onClick={() => (termsOk ? fileRef.current?.click() : setError(t('checkout.termsError')))}
                  disabled={uploading || !termsOk}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-night py-3.5 text-[13.5px] font-bold text-ivory transition hover:bg-emerald disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? t('payment.uploading') : t('payment.uploadProof')}
                </button>
                <p className="mt-2.5 text-center text-[11.5px] text-ink-dim">{t('payment.proofHint')}</p>
              </>
            )}
          </Step>
          </>
          )}

          {/* ===== التفعيل — بيبان في الطريقتين ===== */}
          <Step n={cardMode ? '2' : '3'} title={t('checkout.step3')}>
            <p className="text-[13px] leading-[1.9] text-ink-dim">
              {cardMode ? t('checkout.step3HintCard') : t('checkout.step3Hint')}
            </p>
            <div className="mt-4 grid gap-2.5">
              <div className="flex items-start gap-2.5 rounded-xl bg-ivory/70 px-3.5 py-3">
                <Clock size={14} className="mt-0.5 shrink-0 text-emerald" />
                <span className="text-[12.5px] text-ink-dim">{cardMode ? t('checkout.perk1Card') : t('checkout.perk1')}</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-ivory/70 px-3.5 py-3">
                <InfinityIcon size={14} className="mt-0.5 shrink-0 text-emerald" />
                <span className="text-[12.5px] text-ink-dim">{t('checkout.perkLife')}</span>
              </div>
              {days > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl bg-ivory/70 px-3.5 py-3">
                  <Pencil size={14} className="mt-0.5 shrink-0 text-emerald" />
                  <span className="text-[12.5px] text-ink-dim">{t('checkout.perkEdit', { days })}</span>
                </div>
              )}
            </div>
          </Step>
        </div>
        </div>
      </div>

      {/* شريط ثابت تحت على الموبايل: المبلغ + زرار الفعل حسب الطريقة */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[11.5px] text-ink-dim">{pkg.name}</div>
            <div className="font-serif text-[19px] font-bold leading-tight text-emerald">
              {pkg.price} <span className="text-[12px] font-sans text-ink-dim">{pkg.currencyLabel}</span>
            </div>
          </div>
          {cardMode ? (
            <button
              type="button"
              onClick={payByCard}
              disabled={paying || !termsOk}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-3 text-[13px] font-extrabold text-[#241608] disabled:opacity-50"
            >
              {paying ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              {t('checkout.payShort')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (uploaded ? navigate('/dashboard') : (termsOk ? fileRef.current?.click() : setError(t('checkout.termsError'))))}
              disabled={uploading}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-3 text-[13px] font-extrabold text-[#241608] disabled:opacity-60"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" />
                : uploaded ? <Check size={14} /> : <Upload size={14} />}
              {uploaded ? t('checkout.goDashboard') : t('payment.uploadProof')}
            </button>
          )}
        </div>
      </div>

      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
}
