// الأمان — التحقق بخطوتين للوحة التحكم.
//
// بعد التفعيل الدخول بقى: كلمة السر + كود من 6 أرقام من تطبيق على
// موبايلك (Google Authenticator أو Microsoft Authenticator). حتى لو حد
// عرف كلمة السر مش هيدخل من غير موبايلك.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck, ShieldAlert, Smartphone, Copy, Check, Download, KeyRound, RefreshCw, Lock,
} from 'lucide-react';
import {
  useGetSecurityQuery, useStart2faMutation, useEnable2faMutation,
  useDisable2faMutation, useNewBackupCodesMutation,
} from '../../store/adminApi.js';
import { Panel, Btn, Spinner, fmtDate } from '../../components/admin/ui.jsx';
import CodeInput from '../../components/admin/CodeInput.jsx';

const errOf = (e) => (e && e.data && e.data.error) || 'حصل خطأ، جرّب تاني.';

function CopyBtn({ text, label = 'انسخ' }) {
  const [done, setDone] = useState(false);
  return (
    <Btn
      size="sm"
      icon={done ? Check : Copy}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* */ }
      }}
    >
      {done ? 'اتنسخ' : label}
    </Btn>
  );
}

/** الأكواد الاحتياطية — بتظهر مرة واحدة بس */
function BackupCodes({ codes, onDone }) {
  const text = `أكواد الطوارئ — لوحة تحكم ميثاق\nكل كود بيتستخدم مرة واحدة بس، لو موبايلك مش معاك.\n\n${codes.join('\n')}\n`;
  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    a.download = 'mithaq-admin-backup-codes.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-brass/35 bg-brass/[0.07] p-4">
        <KeyRound size={18} className="mt-0.5 shrink-0 text-brass" />
        <div className="text-[12.5px] leading-[1.9] text-ivory/80">
          <b className="text-ivory">احفظ الأكواد دي في مكان آمن دلوقتي</b> (صوّرها أو نزّلها). لو موبايلك
          ضاع أو اتغيّر، تدخل بواحد منهم بدل كود التطبيق — وكل كود بيشتغل مرة واحدة بس.
          <span className="block text-ivory/50">مش هتظهر تاني بعد ما تقفل الصفحة دي.</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" dir="ltr">
        {codes.map((c) => (
          <code key={c} className="rounded-lg bg-night/70 px-2 py-2 text-center font-mono text-[13.5px] tracking-wider text-ivory">{c}</code>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn icon={Download} onClick={download}>نزّلهم ملف</Btn>
        <CopyBtn text={codes.join('\n')} label="انسخهم" />
        <Btn tone="gold" icon={Check} onClick={onDone}>حفظتهم — تمام</Btn>
      </div>
    </div>
  );
}

function Setup({ onEnabled }) {
  const [start, { isLoading: starting }] = useStart2faMutation();
  const [enable, { isLoading: enabling }] = useEnable2faMutation();
  const [data, setData] = useState(null);
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function begin() {
    setError('');
    try {
      const r = await start().unwrap();
      setData(r);
      setQr(await QRCode.toDataURL(r.uri, { width: 232, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0f1d18', light: '#fffdf7' } }));
    } catch (e) { setError(errOf(e)); }
  }

  async function confirm(c = code) {
    if (c.length !== 6 || enabling) return;
    setError('');
    try {
      const r = await enable(c).unwrap();
      onEnabled(r.backupCodes, r.killedSessions);
    } catch (e) { setError(errOf(e)); setCode(''); }
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] leading-[1.9] text-ivory/70">
          دلوقتي الدخول للوحة بكلمة السر بس. لما تفعّل التحقق بخطوتين، الدخول هيطلب كمان كود من 6 أرقام
          بيتغيّر كل 30 ثانية على موبايلك — فحتى لو حد عرف كلمة السر مش هيقدر يدخل.
        </p>
        <p className="flex items-center gap-2 text-[12.5px] text-ivory/50">
          <Smartphone size={14} /> هتحتاج تطبيق Google Authenticator (أو Microsoft Authenticator) على موبايلك.
        </p>
        {error && <p className="text-[12.5px] text-error">{error}</p>}
        <Btn tone="gold" icon={ShieldCheck} loading={starting} onClick={begin}>ابدأ التفعيل</Btn>
      </div>
    );
  }

  const grouped = data.secret.match(/.{1,4}/g).join(' ');
  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <div className="mx-auto">
        {qr ? <img src={qr} alt="QR" width={232} height={232} className="rounded-xl" /> : <div className="h-[232px] w-[232px]" />}
      </div>
      <div className="space-y-4">
        <ol className="space-y-2.5 text-[13px] leading-[1.8] text-ivory/75">
          <li><b className="text-brass">١.</b> افتح Google Authenticator على موبايلك ودوس <b className="text-ivory">+</b></li>
          <li><b className="text-brass">٢.</b> اختار <b className="text-ivory">مسح رمز QR</b> ووجّه الكاميرا على المربع ده</li>
          <li><b className="text-brass">٣.</b> اكتب الكود اللي هيظهر (6 أرقام) هنا تحت</li>
        </ol>
        <details className="rounded-xl border border-line-lite px-3.5 py-2.5 text-[12px] text-ivory/55">
          <summary className="cursor-pointer select-none">مش عارف تمسح؟ دخّل المفتاح يدوي</summary>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <code dir="ltr" className="rounded-lg bg-night/70 px-2.5 py-1.5 font-mono text-[13px] tracking-wider text-ivory">{grouped}</code>
            <CopyBtn text={data.secret} />
          </div>
          <p className="mt-2">في التطبيق: «إدخال مفتاح الإعداد» ← الاسم Mithaq ← نوع المفتاح «حسب الوقت».</p>
        </details>
        <div className="max-w-[300px]">
          <CodeInput value={code} onChange={setCode} onComplete={confirm} disabled={enabling} />
        </div>
        {error && <p className="flex items-center gap-1.5 text-[12.5px] text-error"><ShieldAlert size={13} /> {error}</p>}
        <Btn tone="gold" icon={Lock} loading={enabling} disabled={code.length !== 6} onClick={() => confirm()}>فعّل</Btn>
      </div>
    </div>
  );
}

/** إجراء محمي بكود حالي (قفل الميزة / أكواد جديدة) */
function CodeAction({ title, body, cta, tone, onRun, onCancel }) {
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function run(c = code) {
    if (busy || (!backup && c.length !== 6)) return;
    setBusy(true); setError('');
    try { await onRun(c); } catch (e) { setError(errOf(e)); setCode(''); }
    setBusy(false);
  }
  return (
    <div className="space-y-3 rounded-xl border border-line-lite p-4">
      <div className="text-[13px] font-bold text-ivory">{title}</div>
      <p className="text-[12.5px] leading-[1.8] text-ivory/55">{body}</p>
      <div className="max-w-[300px]">
        <CodeInput value={code} onChange={setCode} onComplete={run} backup={backup} disabled={busy} />
      </div>
      <button type="button" onClick={() => { setBackup((b) => !b); setCode(''); }} className="text-[11.5px] text-brass hover:underline">
        {backup ? 'استخدم كود التطبيق' : 'استخدم كود احتياطي بدل كده'}
      </button>
      {error && <p className="text-[12.5px] text-error">{error}</p>}
      <div className="flex gap-2">
        <Btn tone={tone} loading={busy} disabled={!code} onClick={() => run()}>{cta}</Btn>
        <Btn onClick={onCancel}>رجوع</Btn>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { data, isLoading } = useGetSecurityQuery();
  const [disable] = useDisable2faMutation();
  const [regen] = useNewBackupCodesMutation();
  const [codes, setCodes] = useState(null);
  const [notice, setNotice] = useState('');
  const [action, setAction] = useState('');

  // الأكواد الاحتياطية مايتسابوش على الشاشة لو خرج من الصفحة
  useEffect(() => () => setCodes(null), []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-[21px] font-bold text-ivory">الأمان</h1>
        <p className="mt-0.5 text-[12.5px] text-ivory/45">حماية دخول لوحة التحكم.</p>
      </div>

      <Panel
        title="التحقق بخطوتين"
        subtitle="كلمة السر + كود من موبايلك"
        action={data && (data.enabled
          ? <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1 text-[11.5px] font-bold text-ok"><ShieldCheck size={13} /> مفعّل</span>
          : <span className="inline-flex items-center gap-1.5 rounded-full bg-error/15 px-3 py-1 text-[11.5px] font-bold text-error"><ShieldAlert size={13} /> مش مفعّل</span>)}
      >
        {isLoading || !data ? <Spinner /> : codes ? (
          <BackupCodes codes={codes} onDone={() => setCodes(null)} />
        ) : !data.enabled ? (
          <Setup onEnabled={(c, killed) => {
            setCodes(c);
            setNotice(killed ? `اتقفلت ${killed} جلسة مفتوحة على أجهزة تانية — أي حد هيدخل تاني محتاج كود موبايلك.` : '');
          }}
          />
        ) : (
          <div className="space-y-4">
            {notice && <p className="rounded-xl bg-ok/10 px-3.5 py-2.5 text-[12.5px] text-ok">{notice}</p>}
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[12.5px] text-ivory/60">
              <span>اتفعّل: <b className="text-ivory/85">{fmtDate(data.enabledAt, true)}</b></span>
              <span>أكواد احتياطية متبقية: <b className={data.backupLeft <= 3 ? 'text-error' : 'text-ivory/85'}>{data.backupLeft} من 10</b></span>
            </div>
            {!action && (
              <div className="flex flex-wrap gap-2">
                <Btn icon={RefreshCw} onClick={() => setAction('regen')}>أكواد احتياطية جديدة</Btn>
                <Btn tone="danger" icon={ShieldAlert} onClick={() => setAction('disable')}>إيقاف التحقق بخطوتين</Btn>
              </div>
            )}
            {action === 'regen' && (
              <CodeAction
                title="أكواد احتياطية جديدة"
                body="الأكواد القديمة كلها هتبطل. اكتب الكود الحالي من التطبيق للتأكيد."
                cta="اعمل أكواد جديدة"
                tone="gold"
                onCancel={() => setAction('')}
                onRun={async (c) => { const r = await regen(c).unwrap(); setAction(''); setNotice(''); setCodes(r.backupCodes); }}
              />
            )}
            {action === 'disable' && (
              <CodeAction
                title="إيقاف التحقق بخطوتين"
                body="الدخول هيرجع بكلمة السر بس — وده أضعف بكتير. اكتب الكود الحالي من التطبيق للتأكيد."
                cta="أوقفه"
                tone="danger"
                onCancel={() => setAction('')}
                onRun={async (c) => { await disable(c).unwrap(); setAction(''); setNotice(''); }}
              />
            )}
            <p className="border-t border-line-lite pt-3 text-[11.5px] leading-[1.8] text-ivory/40">
              لو موبايلك ضاع والأكواد الاحتياطية كمان: غيّر <code className="text-ivory/60">ADMIN_SECRET</code> من لوحة
              Hostinger — ده بيقفل التحقق بخطوتين تلقائيًا، وتدخل بكلمة السر الجديدة وتفعّله من الأول.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
