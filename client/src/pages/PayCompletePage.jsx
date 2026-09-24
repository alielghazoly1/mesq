// صفحة رجوع العميل من الدفع بالفيزا — /pay/complete?order=<id>
//
// XPay بترجّع العميل هنا بعد الدفع. الصفحة بتنادي السيرفر عشان يتأكّد من
// الدفع فعليًا (مبنعتمدش على إن العميل وصل هنا كدليل على الدفع) ويفعّل.
// لو الـ webhook سبقنا وفعّل، السيرفر بيرجّع "activated" على طول.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, Clock, AlertCircle } from 'lucide-react';
import { useVerifyXpayPaymentMutation } from '../store/api.js';
import { whatsappLink } from '../lib/contact.js';

export default function PayCompletePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [verifyPayment] = useVerifyXpayPaymentMutation();

  // 'checking' | 'activated' | 'pending' | 'error'
  const [state, setState] = useState('checking');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    if (!orderId) { setState('error'); return; }

    let tries = 0;
    let timer = null;
    async function check() {
      tries += 1;
      try {
        const res = await verifyPayment({ orderId }).unwrap();
        if (res.status === 'activated') { setState('activated'); return; }
        // ممكن الـ webhook يكون لسه في الطريق — نجرّب تاني كام مرة
        if (tries < 4) { timer = setTimeout(check, 2500); setState('pending'); return; }
        setState('pending');
      } catch {
        if (tries < 4) { timer = setTimeout(check, 2500); return; }
        setState('error');
      }
    }
    check();
    return () => { if (timer) clearTimeout(timer); };
  }, [orderId, verifyPayment]);

  // بعد النجاح بنوديه لوحته لوحده بعد ثانيتين
  useEffect(() => {
    if (state !== 'activated') return undefined;
    const to = setTimeout(() => navigate('/dashboard'), 2200);
    return () => clearTimeout(to);
  }, [state, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
      <div className="w-full max-w-md rounded-[24px] border border-line bg-card p-8 text-center">
        {state === 'checking' && (
          <>
            <Loader2 size={40} className="mx-auto animate-spin text-brass" />
            <h1 className="mt-5 font-serif text-[22px] font-bold text-ink">{t('pay.checkingTitle')}</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{t('pay.checkingBody')}</p>
          </>
        )}

        {state === 'activated' && (
          <>
            <CheckCircle2 size={44} className="mx-auto text-ok" />
            <h1 className="mt-5 font-serif text-[24px] font-bold text-ink">{t('pay.successTitle')}</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{t('pay.successBody')}</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-l from-brass to-brass-soft py-3 text-[14px] font-extrabold text-[#241608]"
            >
              {t('pay.goDashboard')}
            </button>
          </>
        )}

        {state === 'pending' && (
          <>
            <Clock size={40} className="mx-auto text-brass" />
            <h1 className="mt-5 font-serif text-[22px] font-bold text-ink">{t('pay.pendingTitle')}</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{t('pay.pendingBody')}</p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-night py-3 text-[14px] font-bold text-ivory hover:bg-emerald"
            >
              {t('pay.goDashboard')}
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle size={40} className="mx-auto text-error" />
            <h1 className="mt-5 font-serif text-[22px] font-bold text-ink">{t('pay.errorTitle')}</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{t('pay.errorBody')}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to="/packages"
                className="inline-flex w-full items-center justify-center rounded-full bg-night py-3 text-[14px] font-bold text-ivory hover:bg-emerald"
              >
                {t('pay.backToPackages')}
              </Link>
              <a
                href={whatsappLink(t('pay.helpMsg'))}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-bold text-ink-dim underline"
              >
                {t('pay.contactSupport')}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
