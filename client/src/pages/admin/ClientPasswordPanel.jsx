// تغيير باسورد العميل من لوحة التحكم — للحالة اللي بتتكرر كتير: العميل
// نسي باسورده وبيكلّمك عشان تغيّره له.
//
// الفكرة الأساسية في الشاشة دي: الباسورد ده **مش محفوظ في أي مكان**.
// السيرفر بيشفّره أول ما يوصله ومبيرجّعهوش تاني، والسجل بيقول إنه اتغيّر
// بس. يعني اللحظة الوحيدة اللي هتشوفه فيها هي اللحظة دي — عشان كده
// الشاشة بتفضل فاتحة بعد النجاح وفيها زرار نسخ، لحد ما تبعته للعميل
// بنفسك وتقفلها.
import { useState } from 'react';
import {
  KeyRound, Eye, EyeOff, Copy, Check, RefreshCw, ShieldAlert, MessageSquare, Monitor,
} from 'lucide-react';
import { useSetUserPasswordMutation } from '../../store/adminApi.js';
import { Panel, Btn, Field } from '../../components/admin/ui.jsx';

// من غير الحروف اللي بتتلخبط وإنت بتملي الباسورد على التليفون أو
// بتكتبه في رسالة: 0 و O، و l و I و 1. العميل هيكتبه بإيده، فكل حرف
// ملتبس ده مكالمة تانية "مش راضي يدخل".
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const GENERATED_LENGTH = 14;

/** باسورد عشوائي من مولّد المتصفح المعتمد للتشفير — مش Math.random */
function generatePassword() {
  const values = new Uint32Array(GENERATED_LENGTH);
  crypto.getRandomValues(values);
  let out = '';
  for (let i = 0; i < GENERATED_LENGTH; i++) out += ALPHABET[values[i] % ALPHABET.length];
  return out;
}

/** خانة اختيار بشرح تحتها — الخيارين هنا ليهم أثر لازم يبان قبل التنفيذ */
function Choice({ checked, onChange, icon: Icon, title, desc }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-brass"
      />
      <span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-ivory/85">
          {Icon && <Icon size={12} />} {title}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ivory/40">{desc}</span>
      </span>
    </label>
  );
}

export default function ClientPasswordPanel({ userId, userName }) {
  const [setPassword, { isLoading }] = useSetUserPasswordMutation();

  const [value, setValue] = useState('');
  const [shown, setShown] = useState(false);
  const [notify, setNotify] = useState(true);
  const [keepSessions, setKeepSessions] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  // نتيجة آخر تغيير ناجح — بتفضل معروضة عشان تنسخ الباسورد وتبعته
  const [done, setDone] = useState(null);

  const tooShort = value.length > 0 && value.length < 8;
  const canSubmit = value.length >= 8 && value.length <= 200;

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // المتصفح رفض النسخ (صفحة مش HTTPS مثلًا) — الباسورد ظاهر قدامك
      // في خانة تقدر تحدّده وتنسخه بإيدك، فمفيش حاجة اتكسرت
      setError('المتصفح مرفوض ينسخ — حدّد الباسورد وانسخه بإيدك.');
    }
  }

  function reset() {
    setValue('');
    setShown(false);
    setConfirming(false);
    setDone(null);
    setError('');
  }

  async function submit() {
    setError('');
    try {
      const res = await setPassword({
        id: userId, password: value, notify, keepSessions,
      }).unwrap();
      // بنخزّن الخيارين مع النتيجة مش بنقراهم من الحالة بعدين — كده
      // الكلام اللي بيتعرض هو اللي اتنفّذ فعلًا، مهما اتغيّر بعد كده
      setDone({
        password: value, killedSessions: res.killedSessions || 0, notify, keepSessions,
      });
      setValue('');
      setConfirming(false);
      setShown(false);
    } catch (err) {
      setError(err?.data?.error || 'حصل خطأ، جرّب تاني.');
      setConfirming(false);
    }
  }

  // ===== بعد النجاح: الباسورد قدامك عشان تبعته =====
  if (done) {
    return (
      <Panel title="باسورد العميل" subtitle="اتغيّر خلاص — انسخه وابعته للعميل دلوقتي">
        <div className="space-y-3.5">
          <div className="rounded-xl border border-ok/40 bg-ok/10 p-4">
            <p className="mb-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-ivory/85">
              <Check size={15} className="mt-0.5 shrink-0 text-ok" />
              الباسورد اتغيّر.
              {done.killedSessions > 0
                ? ` وقفلنا ${done.killedSessions} جلسة مفتوحة، فهيحتاج يسجّل دخول من تاني.`
                : done.keepSessions
                  ? ' وسيبنا جلساته المفتوحة زي ما هي.'
                  : ' ومكانش عنده أي جلسة مفتوحة.'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <input
                readOnly
                value={done.password}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 font-mono text-[14px] tracking-wide text-ivory"
              />
              <Btn tone={copied ? 'ok' : 'gold'} icon={copied ? Check : Copy} onClick={() => copy(done.password)}>
                {copied ? 'اتنسخ' : 'انسخ'}
              </Btn>
            </div>

            <p className="mt-3 text-[11.5px] leading-relaxed text-ivory/45">
              ابعته للعميل على واتساب أو في مكالمة. أول ما تقفل الشاشة دي مش هتقدر
              تشوفه تاني — السيرفر شايله مشفّر ومفيش طريقة يرجّعه بيها.
              {done.notify && ' وبعتنا له رسالة في صندوق رسايله تقوله إن الباسورد اتغيّر (من غير الباسورد نفسه).'}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error}</div>
          )}

          <Btn onClick={reset}>خلاص، بعته</Btn>
        </div>
      </Panel>
    );
  }

  // ===== تأكيد قبل التنفيذ =====
  if (confirming) {
    return (
      <Panel title="باسورد العميل">
        <div className="rounded-xl border border-error/40 bg-error/10 p-4">
          <p className="mb-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-ivory/85">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-error" />
            هتغيّر باسورد {userName || 'العميل'}. الباسورد القديم هيبطل على طول،
            {keepSessions
              ? ' وجلساته المفتوحة هتفضل شغالة زي ما هي.'
              : ' وكل جلساته المفتوحة هتتقفل وهيحتاج يسجّل دخول من تاني.'}
            {' '}اتأكد إنك قادر توصّله الباسورد الجديد قبل ما تنفّذ.
          </p>
          <div className="flex gap-2">
            <Btn tone="danger" size="sm" loading={isLoading} onClick={submit}>أيوه، غيّره</Btn>
            <Btn size="sm" onClick={() => setConfirming(false)}>لأ</Btn>
          </div>
        </div>
      </Panel>
    );
  }

  // ===== الشاشة العادية =====
  return (
    <Panel title="باسورد العميل" subtitle="للعميل اللي نسي باسورده وطلب منك تغييره">
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl bg-error/15 px-4 py-3 text-[12.5px] text-error">{error}</div>
        )}

        <div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1">
              <Field
                label="الباسورد الجديد"
                type={shown ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8 حروف على الأقل"
                maxLength={200}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`w-full font-mono tracking-wide ${tooShort ? 'border-error/60' : ''}`}
              />
            </div>
            <Btn icon={shown ? EyeOff : Eye} onClick={() => setShown(!shown)}>
              {shown ? 'اخفي' : 'ورّيني'}
            </Btn>
            <Btn
              icon={RefreshCw}
              onClick={() => { setValue(generatePassword()); setShown(true); setError(''); }}
            >
              ولّد واحد قوي
            </Btn>
            {value && (
              <Btn tone={copied ? 'ok' : 'ghost'} icon={copied ? Check : Copy} onClick={() => copy(value)}>
                {copied ? 'اتنسخ' : 'انسخ'}
              </Btn>
            )}
          </div>
          {tooShort && (
            <p className="mt-1.5 text-[11.5px] text-error">الباسورد لازم يكون 8 حروف على الأقل.</p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-line-lite p-4">
          <Choice
            checked={notify} onChange={setNotify} icon={MessageSquare}
            title="ابعتله رسالة إن الباسورد اتغيّر"
            desc="بتوصله في صندوق رسايله على الموقع — من غير الباسورد نفسه، عشان الرسايل بتتخزن كنص عادي وبتفضل عنده."
          />
          <Choice
            checked={keepSessions} onChange={setKeepSessions} icon={Monitor}
            title="سيبه مسجّل دخول على أجهزته"
            desc="الافتراضي إن كل جلساته بتتقفل — سيبها مفتوحة بس لما يكون شغال على دعوته دلوقتي ومش عايز تقطع عليه."
          />
        </div>

        <Btn tone="gold" icon={KeyRound} disabled={!canSubmit} onClick={() => setConfirming(true)}>
          غيّر الباسورد
        </Btn>
      </div>
    </Panel>
  );
}
