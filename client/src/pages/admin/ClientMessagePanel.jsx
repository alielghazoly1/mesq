// "ابعت له رسالة" من ملف العميل — الرسالة بتوصله في الدعم بتاعه على الموقع
// (نفس محادثة الدعم: بيشوف عليها نقطة "رسالة جديدة" في القايمة ويرد عليك من هناك).
// المحادثة بتتحمّل بس لما تفتح الصندوق — عشان فتح ملف العميل لوحده مايعلّمش
// رسايله إنها اتقرت في صندوق الدعم.
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, Send, ArrowLeft, Mic, Check, CheckCheck } from 'lucide-react';
import { useGetSupportThreadQuery, useReplySupportMutation } from '../../store/adminApi.js';
import { openThread, closeUser } from '../../store/adminSlice.js';
import { Panel, Btn, Spinner, fmtDate } from '../../components/admin/ui.jsx';

const TEMPLATES = [
  (n) => `أهلًا ${n} 👋 لو محتاج أي مساعدة في دعوتك أنا موجود.`,
  () => 'باقتك اتفعّلت ✅ تقدر تبدأ تعمل دعوتك دلوقتي من لوحتك.',
  () => 'وصلنا إيصال الدفع 🙏 هنفعّل باقتك خلال دقايق.',
  () => 'لو عندك أي سؤال ابعتلي هنا وهرد عليك على طول.',
];

export default function ClientMessagePanel({ userId, userName }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sentAt, setSentAt] = useState(0);
  const [err, setErr] = useState('');
  const { data, isLoading } = useGetSupportThreadQuery(userId, { skip: !open });
  const [reply, { isLoading: sending }] = useReplySupportMutation();
  const listRef = useRef(null);
  const first = String(userName || '').trim().split(/\s+/)[0] || '';
  const msgs = (data && data.messages) || [];

  useEffect(() => { setOpen(false); setText(''); setErr(''); setSentAt(0); }, [userId]);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs.length, open]);

  async function send() {
    const body = text.trim();
    if (!body) { setErr('اكتب الرسالة الأول.'); return; }
    setErr('');
    try {
      await reply({ userId, body }).unwrap();
      setText(''); setSentAt(Date.now());
    } catch (ex) { setErr(ex?.data?.error || 'الرسالة ماوصلتش — جرّب تاني.'); }
  }
  function goFull() {
    dispatch(openThread(userId));
    dispatch(closeUser());
    navigate('/admin/support');
  }

  return (
    <Panel
      title="ابعت له رسالة"
      subtitle="بتوصله في الدعم بتاعه على الموقع — بيشوفها أول ما يفتح ويقدر يرد عليك"
      action={open ? <Btn size="sm" icon={ArrowLeft} onClick={goFull}>افتح المحادثة كاملة</Btn> : null}
    >
      {!open ? (
        <Btn tone="gold" icon={MessageSquareText} onClick={() => setOpen(true)} data-open-message>اكتب رسالة لـ {first || 'العميل'}</Btn>
      ) : (
        <div data-message-box>
          {/* آخر الرسايل بينكم */}
          <div ref={listRef} className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-xl bg-night/40 p-3">
            {isLoading ? <Spinner /> : msgs.length === 0 ? (
              <p className="py-3 text-center text-[12px] text-ivory/40">مفيش رسايل بينكم لسه — دي هتبقى أول رسالة.</p>
            ) : msgs.slice(-6).map((m) => (
              <div key={m.id} className={`flex ${m.from === 'admin' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ${m.from === 'admin' ? 'bg-brass/20 text-ivory' : 'bg-ivory/[0.08] text-ivory/85'}`}>
                  {m.kind === 'voice' ? <span className="inline-flex items-center gap-1 text-ivory/70"><Mic size={12} /> رسالة صوتية</span> : <span className="whitespace-pre-wrap break-words">{m.body}</span>}
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-ivory/40">
                    {fmtDate(m.createdAt, true)}
                    {m.from === 'admin' && (m.seen ? <CheckCheck size={11} className="text-[#8fcbff]" /> : <Check size={11} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* رسايل جاهزة */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {TEMPLATES.map((t, i) => (
              <button key={i} type="button" onClick={() => setText(t(first))}
                className="rounded-full border border-line-lite px-2.5 py-1 text-[11px] text-ivory/60 transition hover:border-brass/40 hover:text-brass-soft">
                {t(first).slice(0, 28)}…
              </button>
            ))}
          </div>
          <textarea
            name="message" rows={3} maxLength={2000} value={text}
            onChange={(e) => { setText(e.target.value); setErr(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }}
            placeholder={`اكتب رسالتك لـ ${first || 'العميل'}...`}
            className="w-full resize-none rounded-xl border border-line-lite bg-night/60 px-3.5 py-2.5 text-[13.5px] text-ivory placeholder:text-ivory/30 focus:border-brass/60 focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Btn tone="gold" icon={Send} loading={sending} onClick={send} data-send-message>ابعت</Btn>
            {err && <span className="text-[12.5px] text-error">{err}</span>}
            {!err && sentAt > 0 && <span className="text-[12.5px] text-emerald-bright">وصلت ✓ — هتظهر له في الدعم على الموقع</span>}
          </div>
        </div>
      )}
    </Panel>
  );
}
