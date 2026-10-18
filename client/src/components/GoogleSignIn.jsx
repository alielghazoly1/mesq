// زرار "المتابعة بجوجل" الرسمي (Google Identity Services) — بيظهر بس لو
// المالك حاطط الـ Client ID من لوحة التحكم (/api/auth/google/config).
//
// جوجل بتمنع الدخول جوه متصفحات التطبيقات (إنستجرام/فيسبوك/تيك توك…) — والإعلانات
// بتفتح الموقع جوه إنستجرام. هناك بدل الزرار بنعرض "افتح في المتصفح": على
// أندرويد زرار بيفتح الصفحة في Chrome على طول، وعلى الآيفون الخطوات.
// الدخول بالإيميل تحت شغال في كل الحالات.
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Loader2 } from 'lucide-react';
import { api, useGetGoogleConfigQuery, useGoogleLoginMutation } from '../store/api.js';
import { closeAuthModal } from '../store/uiSlice.js';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise = null;
function loadGsi() {
  if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve(window.google);
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GSI_SRC; s.async = true; s.defer = true;
      s.onload = () => (window.google && window.google.accounts ? resolve(window.google) : reject(new Error('gsi')));
      s.onerror = () => { gsiPromise = null; reject(new Error('gsi')); };
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
}

// آخر دالة استقبال — initialize بيتنادى مرة واحدة لكل Client ID، والزرار ممكن
// يترسم أكتر من مرة (تاب الدخول/التسجيل)
let onCredential = null;
let initializedFor = '';

export function inAppBrowser() {
  const ua = navigator.userAgent || '';
  if (/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|TikTok|Snapchat|Line\/|LinkedInApp|Twitter/i.test(ua)) {
    return /Android/i.test(ua) ? 'android' : 'ios';
  }
  return '';
}

function InAppNotice({ kind }) {
  const { t } = useTranslation();
  function openChrome() {
    const u = new URL(window.location.href);
    const fallback = encodeURIComponent(u.href);
    window.location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
  }
  return (
    <div className="rounded-2xl border border-line bg-ink/[0.03] px-4 py-3 text-center" data-google-inapp>
      <p className="text-[12.5px] font-bold leading-relaxed text-ink">{t('auth.google.inAppTitle')}</p>
      {kind === 'android' ? (
        <button
          type="button"
          onClick={openChrome}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2 text-[12.5px] font-extrabold text-ivory"
        >
          <ExternalLink size={14} /> {t('auth.google.openChrome')}
        </button>
      ) : (
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-dim">{t('auth.google.inAppIos')}</p>
      )}
    </div>
  );
}

/**
 * @param {{ onNeedsProfile: (p: {pending: string, profile: {name: string, email: string}}) => void }} props
 */
export default function GoogleSignIn({ onNeedsProfile }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { data: cfg } = useGetGoogleConfigQuery();
  const [googleLogin, { isLoading, error, reset }] = useGoogleLoginMutation();
  const boxRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const inApp = inAppBrowser();
  const clientId = cfg && cfg.enabled ? cfg.clientId : '';

  // الدالة اللي بتستقبل التوكن من جوجل — بتتحدّث كل رندر عشان تشوف أحدث props
  onCredential = async (resp) => {
    if (!resp || !resp.credential) return;
    reset();
    try {
      const res = await googleLogin({ credential: resp.credential }).unwrap();
      if (res.user) {
        // نفس الدخول العادي: نمسح كاش الحساب اللي فات ونقفل النافذة
        dispatch(api.util.resetApiState());
        dispatch(closeAuthModal());
      } else if (res.needsProfile) {
        onNeedsProfile({ pending: res.pending, profile: res.profile || {} });
      }
    } catch { /* الخطأ بيتعرض تحت */ }
  };

  useEffect(() => {
    if (!clientId || inApp || !boxRef.current) return undefined;
    let alive = true;
    loadGsi().then((google) => {
      if (!alive || !boxRef.current) return;
      if (initializedFor !== clientId) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (r) => onCredential && onCredential(r),
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });
        initializedFor = clientId;
      }
      const w = Math.max(200, Math.min(400, Math.round(boxRef.current.getBoundingClientRect().width)));
      boxRef.current.innerHTML = '';
      google.accounts.id.renderButton(boxRef.current, {
        type: 'standard', theme: 'outline', size: 'large', shape: 'pill',
        text: 'continue_with', logo_alignment: 'center', width: w,
        locale: i18n.language === 'ar' ? 'ar' : 'en',
      });
    }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [clientId, inApp, i18n.language]);

  if (!clientId) return null;

  return (
    <div className="mb-1" data-google-signin>
      {inApp ? (
        <InAppNotice kind={inApp} />
      ) : failed ? null : (
        <div className="relative">
          {/* الزرار نفسه بيترسم هنا من جوجل (iframe) */}
          <div ref={boxRef} className="flex min-h-[44px] justify-center" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-card/85">
              <Loader2 size={18} className="animate-spin text-ink-dim" />
            </div>
          )}
        </div>
      )}
      {error?.data?.error && <p className="mt-2 text-center text-[12.5px] text-error">{error.data.error}</p>}
      <div className="my-4 flex items-center gap-3 text-[12px] text-ink-dim">
        <span className="h-px flex-1 bg-line" />
        {t('auth.google.or')}
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
