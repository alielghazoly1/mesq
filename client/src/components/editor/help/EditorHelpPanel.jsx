// لوحة "محتاج مساعدة؟" — في المساحة الفاضية جنب المعاينة على الشاشات
// الكبيرة بس (لابتوب/كمبيوتر). أسئلة العملاء الحقيقية، كل سؤال بيفتح خطوات
// مختصرة (1، 2، 3) ومثال، وزرار "وريني" بيشغّل جولة بتنوّر المكان بالظبط.
//
// اللوحة دي مبتعدّلش أي حاجة في الدعوة — كل اللي بتعمله إنها تبدأ الجولة.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  LifeBuoy, Search, ChevronDown, Sparkles, Lightbulb, Lock, Crown, X,
  PanelLeftClose, PanelRightClose, PlayCircle, MessageCircle,
} from 'lucide-react';
import { HELP_TOPICS, QUICK_TOUR_ID, tr, matchTopic } from './helpTopics.js';
import { whatsappLink, WHATSAPP_MESSAGES } from '../../../lib/contact.js';

const UI = {
  title: { ar: 'محتاج مساعدة؟', en: 'Need help?' },
  subtitle: { ar: 'اختار سؤالك ونوريك بالظبط تعمل إيه.', en: 'Pick a question and we’ll show you exactly what to do.' },
  quick: { ar: 'أول مرة هنا؟', en: 'First time here?' },
  quickBtn: { ar: 'ابدأ الجولة السريعة', en: 'Start the quick tour' },
  search: { ar: 'دوّر على سؤالك… (موسيقى، صورة، واتساب)', en: 'Search… (music, photo, WhatsApp)' },
  none: { ar: 'مالقيناش سؤال بالكلام ده — جرّب كلمة تانية أو كلّمنا.', en: 'No match — try another word or contact us.' },
  showMe: { ar: 'وريني إزاي', en: 'Show me how' },
  example: { ar: 'مثال', en: 'Example' },
  locked: { ar: 'الميزة دي مش في باقتك.', en: 'This isn’t in your package.' },
  upgrade: { ar: 'رقّي الباقة', en: 'Upgrade' },
  collapse: { ar: 'صغّر المساعدة', en: 'Hide help' },
  expand: { ar: 'مساعدة', en: 'Help' },
  stuck: { ar: 'لسه محتار؟', en: 'Still stuck?' },
  wa: { ar: 'كلّمنا على واتساب', en: 'Chat with us on WhatsApp' },
  clear: { ar: 'امسح البحث', en: 'Clear search' },
};

export default function EditorHelpPanel({
  lang, ctx, collapsed, onToggleCollapse, onStartTour,
}) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const L = (o) => tr(o, lang);

  const quick = HELP_TOPICS.find((x) => x.id === QUICK_TOUR_ID);
  const topics = useMemo(
    () => HELP_TOPICS.filter((x) => x.id !== QUICK_TOUR_ID && matchTopic(x, query, lang)),
    [query, lang]
  );

  // ===== مقفولة: عمود رفيع بزرار "مساعدة" =====
  if (collapsed) {
    return (
      <aside
        data-help="help-panel"
        data-help-collapsed=""
        className="flex w-[60px] shrink-0 flex-col items-center border-s border-line bg-card pt-4"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title={L(UI.title)}
          aria-label={L(UI.title)}
          data-help-expand=""
          className="group flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-ink-dim transition hover:bg-brass/10 hover:text-ink"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-brass to-brass-soft text-[#241608] shadow-[0_6px_16px_-8px_rgba(201,162,74,.9)]">
            <LifeBuoy size={18} />
          </span>
          <span className="text-[11px] font-bold">{L(UI.expand)}</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      data-help="help-panel"
      className="flex w-[320px] shrink-0 flex-col border-s border-line bg-card 2xl:w-[360px]"
    >
      {/* ===== الراس ===== */}
      <div className="shrink-0 border-b border-line px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brass to-brass-soft text-[#241608] shadow-[0_6px_16px_-8px_rgba(201,162,74,.9)]">
            <LifeBuoy size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-[17px] font-bold leading-tight text-ink">{L(UI.title)}</h2>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-dim">{L(UI.subtitle)}</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            title={L(UI.collapse)}
            aria-label={L(UI.collapse)}
            data-help-collapse=""
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-dim hover:bg-ink/5 hover:text-ink"
          >
            {rtl ? <PanelLeftClose size={16} /> : <PanelRightClose size={16} />}
          </button>
        </div>

        {/* الجولة السريعة */}
        {quick && (
          <div className="mt-4 rounded-2xl bg-gradient-to-l from-night to-[#16281f] p-3.5 text-ivory">
            <div className="text-[12px] text-ivory/70">{L(UI.quick)}</div>
            <button
              type="button"
              onClick={() => onStartTour(QUICK_TOUR_ID)}
              data-help-topic-start={QUICK_TOUR_ID}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-brass to-brass-soft py-2.5 text-[13px] font-extrabold text-[#241608] hover:brightness-105"
            >
              <PlayCircle size={15} /> {L(UI.quickBtn)}
            </button>
          </div>
        )}

        {/* البحث */}
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-ivory/60 px-3 focus-within:border-brass">
          <Search size={14} className="shrink-0 text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L(UI.search)}
            data-help-search=""
            className="w-full bg-transparent py-2.5 text-[12.5px] text-ink placeholder:text-ink-dim/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={L(UI.clear)}
              className="shrink-0 text-ink-dim hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ===== الأسئلة ===== */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {topics.length === 0 && (
          <p className="px-3 py-6 text-center text-[12px] leading-relaxed text-ink-dim">{L(UI.none)}</p>
        )}
        <ul className="space-y-1.5">
          {topics.map((topic) => {
            const Icon = topic.icon;
            const open = openId === topic.id;
            const locked = topic.feature && !ctx.has(topic.feature);
            return (
              <li
                key={topic.id}
                data-help-topic={topic.id}
                className={`overflow-hidden rounded-2xl border transition ${
                  open ? 'border-brass/50 bg-brass/[0.06]' : 'border-transparent hover:border-line hover:bg-ivory/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : topic.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-start"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${open ? 'bg-night text-brass-soft' : 'bg-ink/[0.06] text-ink'}`}>
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-ink">{L(topic.q)}</span>
                  {locked && <Lock size={11} className="shrink-0 text-ink-dim" />}
                  <ChevronDown size={15} className={`shrink-0 text-ink-dim transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-3 pb-3.5">
                        <ol className="space-y-2">
                          {(topic.steps[lang] || topic.steps.ar).map((s, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-night text-[10.5px] font-bold text-ivory">
                                {i + 1}
                              </span>
                              <span className="text-[12.5px] leading-relaxed text-ink">{s}</span>
                            </li>
                          ))}
                        </ol>

                        {topic.example && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-card px-3 py-2.5 ring-1 ring-line">
                            <Lightbulb size={13} className="mt-0.5 shrink-0 text-brass" />
                            <p className="text-[11.5px] leading-relaxed text-ink-dim">
                              <b className="text-ink">{L(UI.example)}: </b>{L(topic.example)}
                            </p>
                          </div>
                        )}

                        {locked && (
                          <div className="mt-3 flex items-center gap-2 rounded-xl bg-ink/[0.05] px-3 py-2 text-[11.5px] text-ink-dim">
                            <Lock size={11} className="shrink-0" />
                            <span className="flex-1">{L(UI.locked)}</span>
                            <Link to="/packages" className="inline-flex shrink-0 items-center gap-1 font-bold text-[#7a5a1a] hover:underline">
                              <Crown size={11} /> {L(UI.upgrade)}
                            </Link>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => onStartTour(topic.id)}
                          data-help-topic-start={topic.id}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-night py-2.5 text-[12.5px] font-bold text-ivory transition hover:bg-emerald"
                        >
                          <Sparkles size={13} className="text-brass-soft" /> {L(UI.showMe)}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ===== لسه محتار ===== */}
      <div className="shrink-0 border-t border-line px-5 py-3.5">
        <a
          href={whatsappLink(WHATSAPP_MESSAGES.editor)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-[12px] text-ink-dim hover:text-ink"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25d366]/12 text-[#128c7e]">
            <MessageCircle size={15} />
          </span>
          <span>
            {L(UI.stuck)} <b className="text-ink">{L(UI.wa)}</b>
          </span>
        </a>
      </div>
    </aside>
  );
}
