// واتساب — ربط رقمك بـ QR + رسالة "محتاج مساعدة في الدفع؟" التلقائية.
//
// الربط زي واتساب ويب بالظبط: بتمسح الـ QR من موبايلك (الأجهزة المرتبطة)
// والسيرفر بيفضل متصل لوحده. بعدها أي عميل يفتح صفحة الدفع ومايكمّلش
// خلال دقايق، بتوصله رسالة منك على الرقم اللي سجّل بيه — مرة واحدة بس.
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  MessageCircle, Smartphone, Link2, Unlink, CheckCircle2, AlertTriangle, Send, Save,
  Clock, ShieldCheck, Loader2, RefreshCw,
} from 'lucide-react';
import {
  useGetWhatsAppQuery, useLinkWhatsAppMutation, useUnlinkWhatsAppMutation,
  useSaveWhatsAppSettingsMutation, useTestWhatsAppMutation,
} from '../../store/adminApi.js';
import { Panel, Btn, Spinner, StatTile, Badge, fmtDate, fmtNum } from '../../components/admin/ui.jsx';

const errOf = (e) => (e && e.data && e.data.error) || 'حصل خطأ، جرّب تاني.';
const WA_GREEN = '#25D366';

const STATUS_LABEL = {
  sent: { label: 'اتبعتت', tone: 'ok' },
  pending: { label: 'مستنية', tone: 'gold' },
  sending: { label: 'بتتبعت', tone: 'gold' },
  skipped: { label: 'اتلغت', tone: 'muted' },
  failed: { label: 'فشلت', tone: 'danger' },
};
const NOTE_LABEL = {
  paid: 'دفع قبل ما الرسالة تتبعت',
  no_whatsapp: 'الرقم مش عليه واتساب',
  blocked: 'الحساب محظور أو اتمسح',
  expired: 'عدى عليها أكتر من يوم',
};

/** نفس اللي السيرفر بيعمله (utils/whatsapp/outbox.js) — للمعاينة */
function preview(template, name, pkg) {
  return String(template || '')
    .replace(/\{name\}/g, name)
    .replace(/\{package\}/g, pkg)
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path fill={WA_GREEN} d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.1c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3z" />
      <path fill="#fff" d="M23.2 19.4c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.6.1-.3.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.6-.9-.7h-.7c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.7 4.2 6.6 5.8 3.3 1.3 3.9 1 4.6 1 .7-.1 2.3-.9 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5z" />
    </svg>
  );
}

/** كارت الربط: QR → متصل */
function LinkCard({ link }) {
  const [linkWa, { isLoading: linking }] = useLinkWhatsAppMutation();
  const [unlinkWa, { isLoading: unlinking }] = useUnlinkWhatsAppMutation();
  const [qrImg, setQrImg] = useState('');
  const [error, setError] = useState('');
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!link.qr) { setQrImg(''); return undefined; }
    QRCode.toDataURL(link.qr, { width: 264, margin: 1, errorCorrectionLevel: 'L', color: { dark: '#111b21', light: '#ffffff' } })
      .then((u) => { if (alive) setQrImg(u); })
      .catch(() => {});
    return () => { alive = false; };
  }, [link.qr]);

  async function doLink() {
    setError('');
    try { await linkWa().unwrap(); } catch (e) { setError(errOf(e)); }
  }
  async function doUnlink() {
    setError('');
    try { await unlinkWa().unwrap(); setConfirmUnlink(false); } catch (e) { setError(errOf(e)); }
  }

  if (link.status === 'connected') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ok/35 bg-ok/[0.07] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <WhatsAppIcon size={30} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[14px] font-bold text-ok">
              <CheckCircle2 size={16} /> متصل
            </div>
            <div className="mt-0.5 font-mono text-[15px] text-ivory" dir="ltr">+{link.phone}</div>
            <div className="text-[11.5px] text-ivory/45">
              {link.name ? `${link.name} · ` : ''}من {fmtDate(link.connectedAt, true)}
            </div>
          </div>
          {!confirmUnlink ? (
            <Btn tone="danger" icon={Unlink} onClick={() => setConfirmUnlink(true)}>افصل</Btn>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ivory/70">متأكد؟ الرسايل هتقف.</span>
              <Btn tone="danger" size="sm" loading={unlinking} onClick={doUnlink}>أيوه افصل</Btn>
              <Btn size="sm" onClick={() => setConfirmUnlink(false)}>لأ</Btn>
            </div>
          )}
        </div>
        <p className="text-[11.5px] leading-relaxed text-ivory/45">
          الموقع ظاهر في موبايلك في "الأجهزة المرتبطة" باسم Mithaq. موبايلك بيفضل يجيله الإشعارات عادي،
          ولو شلته من هناك الربط بيتلغي لوحده.
        </p>
        {error && <p className="text-[12.5px] text-error">{error}</p>}
      </div>
    );
  }

  if (link.wantLinked && (link.status === 'qr' || link.status === 'connecting')) {
    return (
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="mx-auto flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-white p-2">
          {qrImg
            ? <img src={qrImg} alt="QR" width={264} height={264} data-wa-qr />
            : <span className="flex flex-col items-center gap-2 text-[12px] text-[#54656f]"><Loader2 size={22} className="animate-spin" /> بيجهّز الكود…</span>}
        </div>
        <div className="space-y-4">
          <ol className="space-y-2.5 text-[13px] leading-[1.8] text-ivory/75">
            <li><b className="text-brass">١.</b> افتح <b className="text-ivory">واتساب</b> على موبايلك (الرقم اللي عايز تبعت منه)</li>
            <li><b className="text-brass">٢.</b> دوس <b className="text-ivory">⋮</b> (أندرويد) أو <b className="text-ivory">الإعدادات</b> (آيفون) ← <b className="text-ivory">الأجهزة المرتبطة</b></li>
            <li><b className="text-brass">٣.</b> دوس <b className="text-ivory">ربط جهاز</b> ووجّه الكاميرا على الكود</li>
          </ol>
          <p className="flex items-center gap-2 text-[12px] text-ivory/45">
            <RefreshCw size={12} /> الكود بيتجدّد لوحده كل كام ثانية — امسحه وهو ظاهر.
          </p>
          <Btn size="sm" loading={unlinking} onClick={doUnlink}>إلغاء</Btn>
          {error && <p className="text-[12.5px] text-error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-[1.9] text-ivory/70">
        اربط رقم الواتساب اللي عايز تبعت منه للعملاء. الربط بيتم مرة واحدة بالـ QR من موبايلك — زي واتساب ويب بالظبط —
        ومش محتاج تفتح أي حاجة تانية بعد كده.
      </p>
      {link.lastError && (
        <p className="flex items-center gap-2 rounded-xl bg-brass/[0.09] px-3.5 py-2.5 text-[12.5px] text-brass">
          <AlertTriangle size={14} /> {link.lastError}
        </p>
      )}
      {error && <p className="text-[12.5px] text-error">{error}</p>}
      <Btn tone="gold" icon={Link2} loading={linking} onClick={doLink}>اربط واتساب بـ QR</Btn>
    </div>
  );
}

function SettingsCard({ settings, connected }) {
  const [save, { isLoading: saving }] = useSaveWhatsAppSettingsMutation();
  const [test, { isLoading: testing }] = useTestWhatsAppMutation();
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [testPhone, setTestPhone] = useState('');
  const box = useRef(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  // لو الإعدادات اتغيرت من السيرفر ومفيش تعديل مفتوح، نحدّث الفورم
  useEffect(() => { if (!dirty) setForm(settings); }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const sample = useMemo(() => preview(form.message, 'أحمد', 'الباقة الأساسية'), [form.message]);

  function insert(tag) {
    const el = box.current;
    if (!el) return;
    const s = el.selectionStart ?? form.message.length;
    const e2 = el.selectionEnd ?? s;
    const next = form.message.slice(0, s) + tag + form.message.slice(e2);
    setForm((f) => ({ ...f, message: next }));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + tag.length, s + tag.length); });
  }

  async function submit(override = {}) {
    setMsg({ type: '', text: '' });
    const body = { ...form, ...override };
    try {
      await save(body).unwrap();
      setForm(body);
      setMsg({ type: 'ok', text: 'اتحفظ.' });
    } catch (e) { setMsg({ type: 'err', text: errOf(e) }); }
  }

  async function sendTest() {
    setMsg({ type: '', text: '' });
    try {
      const r = await test({ phone: testPhone, message: form.message }).unwrap();
      setMsg({ type: 'ok', text: `رسالة التجربة في الطريق لـ +${r.phone} — هتوصل خلال ثواني.` });
    } catch (e) { setMsg({ type: 'err', text: errOf(e) }); }
  }

  const input = 'rounded-xl border border-line-lite bg-night/60 px-3 py-2 text-[13px] text-ivory focus:border-brass/60 focus:outline-none';

  return (
    <div className={`space-y-5 ${connected ? '' : 'pointer-events-none opacity-45'}`}>
      {/* التشغيل */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ivory/10 bg-ivory/[0.03] p-3.5">
        <span className="flex items-center gap-2.5">
          <MessageCircle size={16} className="text-ok" />
          <span>
            <span className="block text-[13.5px] font-bold text-ivory">ابعت الرسالة تلقائيًا</span>
            <span className="block text-[11.5px] text-ivory/45">لأي عميل يفتح صفحة الدفع ومايكمّلش — مرة واحدة بس لكل عميل</span>
          </span>
        </span>
        <input
          type="checkbox"
          checked={!!form.enabled}
          onChange={(e) => submit({ enabled: e.target.checked })}
          className="h-5 w-5 accent-[#25D366]"
          data-wa-enabled
        />
      </label>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12.5px] text-ivory/60">نص الرسالة</span>
            <span className="flex gap-1.5">
              <button type="button" onClick={() => insert('{name}')} className="rounded-full bg-ivory/10 px-2.5 py-1 text-[11px] text-ivory/75 hover:bg-ivory/20">+ اسم العميل</button>
              <button type="button" onClick={() => insert('{package}')} className="rounded-full bg-ivory/10 px-2.5 py-1 text-[11px] text-ivory/75 hover:bg-ivory/20">+ اسم الباقة</button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, message: settings.defaultMessage }))} className="rounded-full px-2.5 py-1 text-[11px] text-ivory/45 hover:text-ivory">الافتراضي</button>
            </span>
          </div>
          <textarea
            ref={box}
            value={form.message}
            onChange={set('message')}
            rows={6}
            maxLength={1000}
            className="w-full resize-y rounded-xl border border-line-lite bg-night/60 px-3.5 py-3 text-[13.5px] leading-relaxed text-ivory focus:border-brass/60 focus:outline-none"
          />
        </div>

        {/* معاينة بشكل واتساب */}
        <div>
          <span className="mb-2 block text-[12.5px] text-ivory/60">هتوصل للعميل كده</span>
          <div className="rounded-2xl bg-[#0b141a] p-3" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
            <div className="ms-auto max-w-[92%] whitespace-pre-wrap rounded-xl rounded-se-sm bg-[#005c4b] px-3 py-2 text-[13px] leading-relaxed text-[#e9edef] shadow" dir="auto">
              {sample}
              <span className="mt-1 block text-end text-[10px] text-[#e9edef]/55">✓✓</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-[12px] text-ivory/55">
          تتبعت بعد (دقيقة)
          <input type="number" min={1} max={1440} value={form.delayMinutes} onChange={set('delayMinutes')} className={input} dir="ltr" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ivory/55">
          أقصى عدد في اليوم
          <input type="number" min={1} max={300} value={form.dailyLimit} onChange={set('dailyLimit')} className={input} dir="ltr" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ivory/55">
          من الساعة
          <input type="number" min={0} max={23} value={form.sendFromHour} onChange={set('sendFromHour')} className={input} dir="ltr" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ivory/55">
          لحد الساعة
          <input type="number" min={1} max={24} value={form.sendToHour} onChange={set('sendToHour')} className={input} dir="ltr" />
        </label>
      </div>
      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ivory/45">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        حماية لرقمك: الرسايل بتتبعت واحدة واحدة بفاصل نص دقيقة تقريبًا، في الساعات دي بس (بتوقيت مصر)، ومش أكتر من الحد اليومي.
        ولو العميل دفع أو رفع الإيصال قبل ميعاد الرسالة، مابتتبعتش.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Btn tone="gold" icon={Save} loading={saving} disabled={!dirty} onClick={() => submit()}>احفظ</Btn>
        <span className="mx-1 h-6 w-px bg-line-lite" />
        <input
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="رقمك للتجربة 01xxxxxxxxx"
          dir="ltr"
          className={`${input} w-[200px]`}
        />
        <Btn icon={Send} loading={testing} disabled={!testPhone} onClick={sendTest}>ابعت تجربة</Btn>
      </div>
      {msg.text && <p className={`text-[12.5px] ${msg.type === 'ok' ? 'text-ok' : 'text-error'}`}>{msg.text}</p>}
    </div>
  );
}

export default function WhatsAppPage() {
  const [fast, setFast] = useState(false);
  const { data, isLoading, error } = useGetWhatsAppQuery(undefined, { pollingInterval: fast ? 2000 : 15000 });
  const status = data?.link?.status;
  useEffect(() => { setFast(!!data?.link?.wantLinked && status !== 'connected'); }, [data?.link?.wantLinked, status]);

  if (isLoading) return <Spinner label="بيحمّل…" />;
  if (error) return <Panel><p className="text-[13px] text-error">{errOf(error)}</p></Panel>;

  const { link, settings, stats, recent } = data;
  const connected = link.status === 'connected';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <WhatsAppIcon size={30} />
        <div>
          <h1 className="font-serif text-[22px] font-bold text-ivory">واتساب</h1>
          <p className="text-[12.5px] text-ivory/50">رسالة "محتاج مساعدة في الدفع؟" تلقائية من رقمك لأي عميل يفتح صفحة الدفع.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Send} tone="ok" label="اتبعت النهارده" value={fmtNum(stats.sentToday)} hint={`من ${settings.dailyLimit}`} />
        <StatTile icon={Clock} tone="gold" label="مستنية ميعادها" value={fmtNum(stats.pending)} delay={0.05} />
        <StatTile icon={MessageCircle} label="اتبعت لحد دلوقتي" value={fmtNum(stats.sentTotal)} delay={0.1} />
      </div>

      <Panel title="الربط" subtitle="الرقم اللي الرسايل بتطلع منه">
        <LinkCard link={link} />
      </Panel>

      <Panel title="الرسالة التلقائية" subtitle={connected ? '' : 'اربط واتساب الأول'}>
        <SettingsCard settings={settings} connected={connected} />
      </Panel>

      <Panel title="آخر الرسايل">
        {recent.length === 0 ? (
          <p className="text-[12.5px] text-ivory/45">لسه مفيش رسايل.</p>
        ) : (
          <div className="divide-y divide-line-lite">
            {recent.map((r) => {
              const st = STATUS_LABEL[r.status] || STATUS_LABEL.pending;
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-[12.5px]">
                  <span className="min-w-[120px] font-bold text-ivory">{r.reason === 'test' ? 'تجربة' : (r.name || 'عميل')}</span>
                  <span className="font-mono text-ivory/60" dir="ltr">+{r.phone}</span>
                  <Badge tone={st.tone}>{st.label}</Badge>
                  {r.note && <span className="text-[11.5px] text-ivory/45">{NOTE_LABEL[r.note] || (r.status === 'pending' ? 'هتتجرّب تاني بعد شوية' : 'حصلت مشكلة في البعت')}</span>}
                  <span className="ms-auto text-[11.5px] text-ivory/40">
                    {r.status === 'sent' ? fmtDate(r.sentAt, true) : r.status === 'pending' ? `ميعادها ${fmtDate(r.sendAfter, true)}` : fmtDate(r.createdAt, true)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ivory/40">
        <Smartphone size={13} className="mt-0.5 shrink-0" />
        الربط ده من خلال "الأجهزة المرتبطة" في واتساب — مش الـ API الرسمي. عشان كده الحماية اللي فوق مهمة:
        رسايل كتير لناس ماكلموكش ممكن تخلي واتساب يقيّد الرقم.
      </p>
    </div>
  );
}
