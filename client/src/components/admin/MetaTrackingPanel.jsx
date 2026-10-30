// لوحة "تتبع ميتا" في صفحة الإعلانات: البيكسل شغال ولا لأ، الـ Token بتاع
// Conversions API (السيرفر بيبلّغ ميتا بنفسه)، كود التجربة، وسجل كل حدث اتبعت
// ونتيجته من ميتا — عشان تشوف بعينك إن ميتا استلمت.
// الـ Token بيتحفظ على السيرفر بس ومابيرجعش هنا (آخر 4 حروف بس).
import { useState } from 'react';
import { Check, Save, Send, ExternalLink, Radar, X, KeyRound, FlaskConical } from 'lucide-react';
import {
  useGetMetaTrackingQuery, useSaveMetaTrackingMutation, useSendMetaTestMutation,
} from '../../store/adminApi.js';
import { Panel, Btn, Field, fmtNum, fmtMoney, fmtDate } from './ui.jsx';

const BIZ = '593528983846305';
const LABEL = {
  CompleteRegistration: 'عمل حساب',
  InitiateCheckout: 'فتح صفحة الدفع',
  AddPaymentInfo: 'بعت الدفع',
  Purchase: 'اشترى (اتفعّل)',
  PageView: 'تجربة',
};
const KEY_LABEL = { em: 'إيميل', ph: 'تليفون', fn: 'اسم', country: 'دولة', external_id: 'رقم الحساب', fbp: 'متصفح', fbc: 'جاي من إعلان', client_ip_address: 'IP' };

export default function MetaTrackingPanel() {
  const { data } = useGetMetaTrackingQuery(undefined, { pollingInterval: 60000 });
  const [save, saveState] = useSaveMetaTrackingMutation();
  const [sendTest, testState] = useSendMetaTestMutation();
  const [token, setToken] = useState('');
  const [testCode, setTestCode] = useState(null);

  if (!data) return null;
  const full = data.hasToken && data.enabled;
  const tc = testCode === null ? data.testCode : testCode;
  const ds = `https://business.facebook.com/events_manager2/list/dataset/${data.pixelId}`;

  return (
    <Panel
      title={<span className="inline-flex items-center gap-2"><Radar size={17} className="text-brass-soft" /> تتبع ميتا (فيسبوك وإنستجرام)</span>}
      subtitle={`البيكسل ${data.pixelId} — بيبلّغ ميتا بكل خطوة عشان الإعلان يوصل لناس شبه اللي بيشتروا`}
      action={full
        ? <span className="rounded-full bg-ok/15 px-2.5 py-1 text-[11px] font-bold text-ok">تتبع كامل</span>
        : <span className="rounded-full bg-brass/15 px-2.5 py-1 text-[11px] font-bold text-brass-soft">المتصفح بس</span>}
    >
      <div data-meta-admin className="space-y-4">
        {/* آخر 7 أيام — اللي ميتا أكّدت استلامه من السيرفر */}
        <div>
          <div className="mb-2 text-[12px] text-ivory/55">آخر 7 أيام — أحداث ميتا أكّدت إنها استلمتها من السيرفر:</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {data.week.map((w) => (
              <div key={w.name} className="rounded-xl bg-ivory/[0.04] px-3 py-2.5">
                <div className="text-[11.5px] text-ivory/55">{LABEL[w.name]}</div>
                <div className="mt-0.5 text-[19px] font-bold text-ivory">{fmtNum(w.ok)}</div>
                {w.failed > 0 && <div className="text-[11px] text-error">{fmtNum(w.failed)} ماوصلش</div>}
              </div>
            ))}
          </div>
          {!data.hasToken && (
            <p className="mt-2 text-[11.5px] leading-relaxed text-ivory/45">
              البيكسل اللي في المتصفح شغال دلوقتي (زيارات، فتح التصاميم، الدفع). الأرقام دي بتبدأ تتعدّ لما تحط الـ Token تحت —
              وساعتها حدث <b>"اشترى"</b> بيتبعت لما تفعّل الأوردر حتى لو العميل قافل الموقع.
            </p>
          )}
        </div>

        {/* الـ Token */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (token.trim()) save({ token: token.trim() }).unwrap().then(() => setToken('')).catch(() => {}); }}
          onChange={() => { if (saveState.error || saveState.isSuccess) saveState.reset(); }}
          className="space-y-2.5 rounded-xl border border-line-lite p-3.5"
        >
          <div className="flex items-center gap-2 text-[13px] font-bold text-ivory"><KeyRound size={15} className="text-brass-soft" /> Conversions API Token
            {data.hasToken && <span className="font-mono text-[11.5px] font-normal text-ok" dir="ltr">✓ محفوظ {data.tokenHint}</span>}
          </div>
          <Field
            type="password"
            dir="ltr"
            autoComplete="off"
            className="font-mono"
            placeholder={data.hasToken ? 'الصق Token جديد لو عايز تغيّره' : 'الصق الـ Token هنا'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          {saveState.error?.data?.error && <div className="rounded-xl bg-error/15 px-4 py-2.5 text-[12.5px] text-error">{saveState.error.data.error}</div>}
          <div className="flex flex-wrap items-center gap-3">
            <Btn type="submit" tone="gold" size="sm" loading={saveState.isLoading} icon={saveState.isSuccess ? Check : Save} disabled={!token.trim()}>
              {saveState.isSuccess ? 'اتحفظ — ميتا قبلته' : 'احفظ (بنتأكد منه مع ميتا الأول)'}
            </Btn>
            {data.hasToken && (
              <button type="button" className="text-[12px] text-ivory/45 underline hover:text-error"
                onClick={() => { if (window.confirm('تشيل الـ Token؟ السيرفر هيبطّل يبلّغ ميتا (البيكسل اللي في المتصفح هيفضل شغال).')) save({ clearToken: true }); }}>
                شيل الـ Token
              </button>
            )}
          </div>
          <details className="text-[12px] leading-relaxed text-ivory/60" open={!data.hasToken}>
            <summary className="cursor-pointer font-bold text-ivory/80">تجيب الـ Token منين (دقيقتين)</summary>
            <ol className="mt-2 list-decimal space-y-1 ps-5">
              <li>افتح <a className="text-brass-soft underline" href={`${ds}/settings?business_id=${BIZ}`} target="_blank" rel="noopener noreferrer">إعدادات البيكسل في ميتا</a>.</li>
              <li>انزل لـ <b dir="ltr">Conversions API</b> ← تحت <b dir="ltr">Set up direct integration</b> اضغط <b dir="ltr">Generate access token</b>.</li>
              <li>انسخ الكود الطويل والصقه في الخانة فوق ← احفظ. (ماتبعتهوش لحد في الشات.)</li>
            </ol>
          </details>
        </form>

        {/* التجربة */}
        <div className="space-y-2.5 rounded-xl border border-line-lite p-3.5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-ivory"><FlaskConical size={15} className="text-brass-soft" /> جرّب إن ميتا بتستلم</div>
          <p className="text-[12px] leading-relaxed text-ivory/55">
            افتح <a className="text-brass-soft underline" href={`${ds}/test_events?business_id=${BIZ}`} target="_blank" rel="noopener noreferrer">Test events في ميتا</a>،
            انسخ الكود اللي زي <span dir="ltr" className="font-mono">TEST12345</span> وحطه هنا ← احفظ ← اضغط "ابعت حدث تجربة"، وهتشوفه ظاهر عندهم.
            وكمان: افتح الموقع من موبايلك وهتشوف زياراتك بتظهر في نفس الصفحة. <b>امسح الكود لما تخلّص</b> (طول ما هو موجود الأحداث بتروح للتجربة مش للإعلانات).
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-44"><Field dir="ltr" className="font-mono" placeholder="TEST12345" value={tc} onChange={(e) => setTestCode(e.target.value)} /></div>
            <Btn size="sm" icon={Save} loading={saveState.isLoading} onClick={() => save({ testCode: tc.trim() })}>{tc ? 'احفظ الكود' : 'امسح الكود'}</Btn>
            <Btn size="sm" tone="gold" icon={Send} loading={testState.isLoading} disabled={!data.hasToken || !data.testCode} onClick={() => { testState.reset(); sendTest(); }}>ابعت حدث تجربة</Btn>
          </div>
          {data.testCode && <div className="text-[11.5px] font-bold text-brass-soft">⚠ كود التجربة شغال — الأحداث دلوقتي رايحة للتجربة. امسحه لما تخلّص.</div>}
          {testState.isSuccess && <div className="text-[12.5px] text-ok">✓ ميتا استلمت حدث التجربة — هتلاقيه في Test events.</div>}
          {testState.error?.data?.error && <div className="text-[12.5px] text-error">{testState.error.data.error}</div>}
        </div>

        {/* السجل */}
        {data.recent.length > 0 && (
          <div>
            <div className="mb-1.5 text-[12px] text-ivory/55">آخر الأحداث اللي السيرفر بعتها:</div>
            <div className="divide-y divide-line-lite rounded-xl border border-line-lite">
              {data.recent.map((e, i) => (
                <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[12px]">
                  {e.ok ? <Check size={14} className="text-ok" /> : <X size={14} className="text-error" />}
                  <span className="font-bold text-ivory">{LABEL[e.name] || e.name}</span>
                  {e.test && <span className="rounded bg-brass/15 px-1.5 text-[10.5px] text-brass-soft">تجربة</span>}
                  {e.value > 0 && <span className="text-ivory/70">{fmtMoney(e.value, e.currency)}</span>}
                  <span className="text-ivory/40">{fmtDate(e.at, true)}</span>
                  {e.ok
                    ? <span className="text-ivory/40">اتعرف بـ: {e.matchKeys.map((k) => KEY_LABEL[k]).filter(Boolean).join('، ')}</span>
                    : <span className="text-error">{e.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <a className="inline-flex items-center gap-1.5 text-[12px] text-brass-soft underline" href={`${ds}/overview?business_id=${BIZ}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={13} /> افتح البيكسل في Events Manager
        </a>
      </div>
    </Panel>
  );
}
