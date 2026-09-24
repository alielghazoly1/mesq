// المحرر المباشر — /editor/:shortId
//
// الفكرة: الدعوة الحقيقية بتتعرض جوه iframe (نفس الـ HTML اللي الضيف
// هيشوفه بالظبط)، والشريط الجانبي ده مجرد "ريموت كنترول" بيبعت أوامر
// للـ iframe بـ postMessage. كده مفيش نسخة تانية من التصميم ممكن تفرق
// عن الأصل، وملفات views/*.html مبتتلمسش خالص.
//
// الأمان: كل ميزة بتتقفل مرتين — هنا في الواجهة (للشكل) وفي
// routes/editor.js على السيرفر (للجد). الواجهة مش مصدر ثقة.
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight, Type, ImageIcon, Music, Move, Lock, Check, Loader2,
  Smartphone, Monitor, PenLine, RotateCcw, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Upload, AlertCircle, Crown, FileText,
  Rocket, Trash2, ExternalLink, Copy, MousePointerClick, Undo2,
  PlayCircle, RotateCw, Layers, ALargeSmall, Minus, Plus, CalendarDays, Sparkles,
  MapPin, Redo2, Palette, Stamp, TypeOutline, Share2, Eye, EyeOff, Maximize2, Clock, Tag,
} from 'lucide-react';
import {
  useGetEditorQuery,
  useSaveCustomizationsMutation,
  useSaveTextMutation,
  useSaveDetailsMutation,
  useSaveTitleMutation,
  usePublishInvitationMutation,
  useResetInvitationMutation,
  useDeleteDraftMutation,
  useUploadImageMutation,
  useUploadAudioMutation,
} from '../store/api.js';
import MusicPanel from '../components/editor/MusicPanel.jsx';
import SharePanel from '../components/editor/SharePanel.jsx';
import BigScreenNotice, { hintDismissed } from '../components/editor/BigScreenNotice.jsx';
import EditWindowEnded from '../components/editor/EditWindowEnded.jsx';
import useIsCompact from '../hooks/useIsCompact.js';
import { tooBig, sizeError, uploadError } from '../lib/uploadLimits.js';
import { installSoloAudio, setFramePauser } from '../lib/soloAudio.js';

const SHELL = 'mithaq-shell';
const RUNTIME = 'mithaq-editor';

// ===== درج الأدوات على الموبايل =====
// الدرج ليه وضعين بس: مقفول (المقبض + التبويبات ظاهرين) ومفتوح.
//
// المعاينة بتسيب تحتها مساحة **الجزء الظاهر دايمًا** بس (المقبض
// والتبويبات)، مش ارتفاع الدرج وهو مفتوح. يعني لما الدرج يفتح بيعدّي
// فوق الدعوة بدل ما يزقّها ويغيّر مقاسها — ده اللي كل محرر على الموبايل
// بيعمله، وبيمنع الدعوة إنها ترقص كل ما تفتح لوحة.
const SHEET_PEEK_FALLBACK = 118; // لحد ما القياس الحقيقي يحصل
const SHEET_PANEL = '44vh';      // ارتفاع محتوى الدرج وهو مفتوح

// التبويبات اللي مالهاش feature مش مميزات باقة — دي تعديل العميل في
// دعوته هو (النص، البيانات)، وأي صاحب دعوة مميزة لازم يقدر يعملها.
// مفيش تبويب "بيانات" خالص: كل كلام في الدعوة بيتعدّل بالضغط عليه،
// والتاريخ بيتعدّل بنتيجة بتفتح لما تضغط عليه.
const TABS = [
  { id: 'inline', icon: MousePointerClick, feature: null, label: 'editor.tabInline' },
  { id: 'font', icon: Type, feature: 'fonts', label: 'editor.tabFont' },
  { id: 'photos', icon: ImageIcon, feature: 'images', label: 'editor.tabPhotos' },
  { id: 'music', icon: Music, feature: 'music', label: 'editor.tabMusic' },
  { id: 'layout', icon: Move, feature: 'drag', label: 'editor.tabLayout' },
  // أقسام الدعوة: إظهار وإخفاء قسم كامل بضغطة — نفس فكرة "طبقات"
  // في أي برنامج تصميم: القسم المخفي بيفضل في القايمة عشان يرجع
  { id: 'sections', icon: Layers, feature: 'sections', label: 'editor.tabSections' },
  // كارت المشاركة مش ميزة باقة: كل صاحب دعوة مميزة لازم يقدر يظبط
  // شكل لينكه على واتساب — ده جزء من دعوته مش إضافة
  { id: 'share', icon: Share2, feature: null, label: 'editor.tabShare' },
];

/**
 * جسم حفظ التخصيصات من نسخة draft — مصدر واحد بيستخدمه الحفظ التلقائي،
 * "نشر التعديلات"، حفظ فورم الحضور، والـ flush قبل إعادة تحميل الإطار.
 *
 * ليه مصدر واحد: السيرفر بيعمل **استبدال كامل** لكل خريطة (إزاحات،
 * مقاسات، نصوص مضافة...). لو أي مسار حفظ نسي حقل، الحقل ده بيتمسح من
 * الداتابيز. لما الجسم يتبني في مكان واحد، مستحيل مسار ينسى حاجة والتاني
 * يفتكرها. `has` بيقرر مميزات الباقة زي ما السيرفر بيقرر بالظبط.
 */
function customizationBody(draft, has) {
  const body = {};
  if (has('fonts')) body.fontFamily = draft.fontFamily;
  if (has('music')) {
    body.audioUrl = draft.audioUrl;
    body.audioStart = draft.audioStart || 0;
    body.audioEnd = draft.audioEnd || 0;
  }
  // الإزاحات بتتبعت دايمًا: السيرفر بيقبل إزاحة النص المضاف في أي باقة،
  // وإزاحة التصميم بالباقة بس
  body.offsets = draft.offsets;
  if (has('images')) body.images = draft.images;
  if (has('colors')) body.colors = draft.colors;
  // الإخفاء والمقاس والميل والمحاذاة مش مميزات باقة — تنسيق العميل في دعوته
  body.hidden = draft.hidden;
  body.sizes = draft.sizes;
  body.rotations = draft.rotations;
  body.scales = draft.scales;
  body.aligns = draft.aligns || {};
  body.rsvp = draft.rsvp || {};
  body.calDay = draft.calDay || 0;
  body.added = draft.added;
  body.share = draft.share;
  return body;
}

/**
 * إطار موبايل mock حول iframe الدعوة.
 *
 * ليه mock مش iframe عريان: قبل كده الـiframe كان بيبان زي صفحة ويب
 * كاملة بscrollbar رمادي واضح على الجنب — بيلغي إحساس "معاينة موبايل".
 * دلوقتي بينضم في bezel أسود بزوايا مستديرة وnotch فوق: العميل بيشوف
 * دعوته زي ما هي على تليفون، وأي تعديل بيصير على شكل حقيقي مش نظري.
 *
 * الـ mock نفسه responsive:
 *  - compact/موبايل: بيمدّ عرض الشاشة كلها
 *  - device=mobile ديسكتوب: عرض ثابت 340 بكسل (شكل تليفون بجوار تليفون)
 *  - device=desktop ديسكتوب: بيمدّ الطول عشان الدعوة تظهر كاملة
 */
function PhoneMock({ children, label, compact, device }) {
  const isMobileDevice = device !== 'desktop';
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="rounded-full bg-ink/[0.06] px-3 py-0.5 text-[10.5px] font-bold text-ink-dim">
          {label}
        </span>
      )}
      {/* الإطار الأسود (bezel) */}
      <div
        className="relative rounded-[36px] bg-[#0a0d0f] p-[8px] shadow-[0_28px_60px_-24px_rgba(0,0,0,.45)]"
        style={{
          // ارتفاع ثابت على الديسكتوب عشان الاتنين متساويين، ومطاطي على
          // الموبايل. الحدود الدنيا بتضمن إن الدعوة تبان حتى لو الشاشة
          // صغيرة جدًا.
          width: compact ? 'min(340px, 100%)' : (isMobileDevice ? 340 : 'min(560px, 100%)'),
          height: compact ? 'min(620px, 78vh)' : (isMobileDevice ? 680 : 'min(760px, 80vh)'),
          maxWidth: '100%',
        }}
      >
        {/* Notch فوق — الشوية دي بتفرق في إحساس "موبايل حقيقي" */}
        <div className="pointer-events-none absolute start-1/2 top-[10px] z-10 h-[18px] w-[92px] -translate-x-1/2 rounded-full bg-[#0a0d0f]" />
        {/* الشاشة نفسها */}
        <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[#12100e]">
          {children}
        </div>
      </div>
    </div>
  );
}

/** الكلام ده تاريخ؟ (فيه سنة زي 2027) — ساعتها بنفتحله نتيجة بدل كتابة */
const looksLikeDate = (text) => /\b20\d{2}\b/.test(String(text || ''));

// ===== كشف/تعديل الوقت جوه أي نص =====
// أي عنصر فيه ساعة (زي "Starting at 6:00 PM" أو "19:30" أو "٨:٠٠ مساءً")
// بيتفتحله منتقي وقت في الشريط الجانبي في كل الباقات. بنعدّل نص العنصر
// نفسه (متاح في كل الباقات) — بنسيب الكلام اللي حوالين الساعة زي ما هو
// ونغيّر رقم الساعة بس، بنفس صيغة الأصل (نظام ١٢/٢٤ ساعة، أرقام
// عربي/إنجليزي، وكلمة الفترة زي ما هي).
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toWestern = (s) => String(s).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
const toArabicDigits = (s) => String(s).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

/** بيلاقي أول وقت في النص ويرجّع تفاصيله، أو null */
function parseTime(text) {
  const str = String(text || '');
  const re = /([0-9٠-٩]{1,2})\s*:\s*([0-9٠-٩]{2})\s*(AM|PM|am|pm|صباحًا|صباحاً|صباحا|مساءً|مساءً|مساءا|مساء|ص|م)?/;
  const m = re.exec(str);
  if (!m) return null;
  const hour = parseInt(toWestern(m[1]), 10);
  const minute = parseInt(toWestern(m[2]), 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23 || minute > 59) return null;
  const praw = m[3] || '';
  const pl = praw.toLowerCase();
  let period = null; // 'am' | 'pm' | null(24h)
  if (pl === 'am' || pl === 'ص' || pl.indexOf('صباح') === 0) period = 'am';
  else if (pl === 'pm' || pl === 'م' || pl.indexOf('مساء') === 0) period = 'pm';
  // لو مفيش كلمة فترة بس الساعة أكبر من 12 يبقى نظام 24 ساعة
  const is24h = !period;
  return {
    index: m.index, length: m[0].length,
    hour, minute, period, is24h,
    periodRaw: praw,
    arabicDigits: /[٠-٩]/.test(m[1] + m[2]),
    arabicPeriodWord: /صباح|مساء/.test(praw),
  };
}

/** بيبني نص وقت جديد بنفس صيغة الأصل، ويحطه مكان الوقت القديم في النص */
function applyTimeToText(originalText, parsed, hour24, minute) {
  let token;
  const mm = String(minute).padStart(2, '0');
  if (parsed.is24h) {
    token = String(hour24).padStart(2, '0') + ':' + mm;
  } else {
    let h12 = hour24 % 12; if (h12 === 0) h12 = 12;
    const pm = hour24 >= 12;
    let periodWord;
    if (parsed.arabicPeriodWord) periodWord = pm ? 'مساءً' : 'صباحًا';
    else if (parsed.periodRaw === 'ص' || parsed.periodRaw === 'م') periodWord = pm ? 'م' : 'ص';
    else periodWord = pm ? 'PM' : 'AM';
    token = h12 + ':' + mm + ' ' + periodWord;
  }
  if (parsed.arabicDigits) token = toArabicDigits(token);
  return originalText.slice(0, parsed.index) + token + originalText.slice(parsed.index + parsed.length);
}

/**
 * خانة المكان: بتقبل لينك خرائط جوجل كامل، أو لينك مصغّر، أو مجرد
 * اسم مكان — السيرفر بيحوّلهم كلهم لخريطة مدمجة (utils/mapsLink.js).
 * الحفظ بضغطة صريحة مش تلقائي، لأنه بيعيد تحميل الدعوة.
 */
function MapField({ value, busy, onSave }) {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(text); }}
        placeholder={t('editor.mapPlaceholder')}
        maxLength={300}
        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink focus:border-emerald focus:outline-none"
      />
      <button
        type="button"
        disabled={busy || text === value}
        onClick={() => onSave(text)}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-[12.5px] font-bold text-ivory hover:brightness-110 disabled:opacity-45"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
        {t('editor.mapSave')}
      </button>
    </div>
  );
}

/** قسم مقفول — بيبان مكان الأداة بدل ما تختفي، عشان العميل يعرف إن في أكتر */
function LockedPanel() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-dashed border-line bg-ivory/60 p-6 text-center">
      <Lock size={20} className="mx-auto text-ink-dim" />
      <p className="mt-3 text-[13.5px] text-ink-dim">{t('editor.locked')}</p>
      <Link
        to="/packages"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2.5 text-[13px] font-extrabold text-[#241608] hover:brightness-105"
      >
        <Crown size={13} /> {t('editor.lockedCta')}
      </Link>
    </div>
  );
}

export default function EditorPage() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // loadError مش error: اسم error متاخد تحت لرسالة الحفظ
  const { data, isLoading, isError, error: loadError, refetch } = useGetEditorQuery(shortId);
  const [saveCustomizations, { isLoading: isSaving }] = useSaveCustomizationsMutation();
  const [saveText] = useSaveTextMutation();
  const [saveDetails] = useSaveDetailsMutation();
  const [saveTitle] = useSaveTitleMutation();
  const [publishInvitation, { isLoading: publishing }] = usePublishInvitationMutation();
  const [resetInvitation, { isLoading: resetting }] = useResetInvitationMutation();
  const [deleteDraft, { isLoading: deleting }] = useDeleteDraftMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadImageMutation();
  const [uploadAudio, { isLoading: uploadingAudio }] = useUploadAudioMutation();

  // ===== تليفونين جنب بعض =====
  // في وضع التحرير: يسار = الغلاف (ثابت، للتعديل عليه)، يمين = الدعوة
  // من جوه (بعد الغلاف). كل واحد iframe مستقل بـstage خاص.
  // في وضع التشغيل: تليفون واحد بيعرض الدعوة كاملة زي ما الضيف بيشوفها.
  // نخزّن الـiframes كلها في مصفوفة والـpost بيبعت لكلها.
  const insideFrameRef = useRef(null);
  const coverFrameRef = useRef(null);
  const playFrameRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // بيتغيّر بعد حفظ البيانات الأساسية عشان الـ iframe يعيد التحميل
  // ويعرض الأسماء والتاريخ الجداد فورًا.
  const [frameKey, setFrameKey] = useState(0);
  const [copied, setCopied] = useState(false);
  // وضع التشغيل: بنحمّل الدعوة زي ما الضيف بيشوفها بالظبط (من غير
  // ?edit=1) — يعني شاشة الغلاف والموسيقى والأنميشن كلها بتشتغل من الأول.
  const [playing, setPlaying] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [hasCover, setHasCover] = useState(false);
  const [tab, setTab] = useState('inline');
  const [device, setDevice] = useState('mobile');
  // ===== وضع الموبايل =====
  const compact = useIsCompact();
  // الدرج بيفتح مقفول: أول حاجة العميل يشوفها هي دعوته كاملة، مش لوحة
  // أدوات نصها مقصوص. المقبض قدامه وواضح إنه بيتسحب.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [showBigScreenHint, setShowBigScreenHint] = useState(false);
  // ارتفاع الجزء الظاهر من الدرج — بيتقاس فعليًا مش بالتخمين، لأنه
  // بيفرق حسب اللغة وحسب وجود زرار الغلاف من عدمه
  const peekRef = useRef(null);
  const [peekH, setPeekH] = useState(SHEET_PEEK_FALLBACK);
  const [selected, setSelected] = useState(null);
  const [pickedImage, setPickedImage] = useState(null);
  const [counts, setCounts] = useState(null);
  // كل صور الدعوة بترتيبها — الدعوة نفسها هي اللي بتقولنا بيها
  const [photos, setPhotos] = useState([]);
  const [runtimeReady, setRuntimeReady] = useState(false);
  // كل ما iframe يبعت 'loaded' بنزوّد الـtick — الـinit-effect بيلاقيه
  // كـdependency فيعيد إرسال الحالة الكاملة للتليفونات كلها. ده بيغطّي
  // حالة التليفون التاني اللي بيخلص التحميل بعد الأول.
  const [lastLoadTick, setLastLoadTick] = useState(0);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [sectionsBusy, setSectionsBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [textSaving, setTextSaving] = useState(false);

  // النسخة الشغالة من التخصيصات — بنعدّل عليها فورًا ونحفظ بعدين
  const [draft, setDraft] = useState(null);

  // ===== اسم الدعوة (للعميل في لوحته بس) =====
  // بيتحمّل مرة واحدة من السيرفر، وبيتحفظ لوحده بعد ما العميل يبطّل كتابة.
  const [title, setTitle] = useState('');
  const [titleLoaded, setTitleLoaded] = useState(false);
  // آخر اسم اتحفظ فعلًا — عشان منحفظش من غير تغيير حقيقي
  const savedTitleRef = useRef('');
  useEffect(() => {
    if (data && !titleLoaded) {
      setTitle(data.title || '');
      savedTitleRef.current = data.title || '';
      setTitleLoaded(true);
    }
  }, [data, titleLoaded]);
  useEffect(() => {
    if (!titleLoaded) return undefined;
    const trimmed = title.trim();
    if (trimmed === savedTitleRef.current) return undefined;
    const timer = setTimeout(async () => {
      try {
        await saveTitle({ shortId, title: trimmed }).unwrap();
        savedTitleRef.current = trimmed;
      } catch { /* هيتحفظ مع أول تعديل جديد */ }
    }, 800);
    return () => clearTimeout(timer);
  }, [title, titleLoaded, saveTitle, shortId]);

  // ===== الرجوع للخلف =====
  // المبدأ: قبل أي تعديل بنصوّر الحالة كاملة (لقطة)، والرجوع بيرجّع
  // اللقطة دي بالكامل. لقطات مش أوامر — لأن الأوامر لازم كل واحد منها
  // يعرف يلغي نفسه صح، ومع 6 أنواع تعديل مختلفة ده مصدر أخطاء. اللقطة
  // صح دايمًا مهما كان التعديل.
  const draftRef = useRef(null);
  const detailsRef = useRef(null);
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  // بيخلي الأزرار تعيد الرسم لما الأكوام تتغير (الأكوام نفسها في ref
  // عشان نقراها فورًا جوه المعالجات من غير ما نستنى إعادة رسم)
  const [histTick, setHistTick] = useState(0);

  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { detailsRef.current = data?.details || null; }, [data]);
  // نسخة فورية من حالة "فيه تعديل لسه ماتحفظش" — عشان نقراها جوه دوال
  // async من غير ما نستنى إعادة رسم (الحفظ التلقائي بـ debounce، فممكن
  // يبقى فيه تعديل معلّق وقت ما نعمل إعادة تحميل للإطار)
  const dirtyRef = useRef(false);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  const features = useMemo(() => data?.features || [], [data]);
  const has = useCallback((f) => features.includes(f), [features]);
  // أقسام القالب اللي ينفع تتشال، وأنهي واحد مشيل دلوقتي
  const optionalSections = useMemo(() => data?.optionalSections || [], [data]);
  const hiddenSections = useMemo(() => data?.details?.hiddenSections || [], [data]);

  /** لقطة من كل حاجة ممكن تتغيّر */
  const snapshot = useCallback(() => ({
    customizations: draftRef.current ? JSON.parse(JSON.stringify(draftRef.current)) : null,
    details: detailsRef.current ? { ...detailsRef.current } : null,
  }), []);

  /** بتتنادى **قبل** أي تعديل */
  const remember = useCallback(() => {
    if (!draftRef.current) return;
    pastRef.current.push(snapshot());
    // أي تعديل جديد بيلغي مسار الإعادة — زي أي محرر محترم
    futureRef.current = [];
    // 60 خطوة كفاية جدًا، وبتمنع الذاكرة تكبر بلا حدود
    if (pastRef.current.length > 60) pastRef.current.shift();
    setHistTick((n) => n + 1);
  }, [snapshot]);

  // ===== إرسال أمر للـiframes =====
  // بيبعت لكل iframe موجود على الشاشة دلوقتي. في وضع التحرير ده تليفونين
  // (غلاف + جوه) والاتنين محتاجين نفس التخصيص. في التشغيل تليفون واحد.
  // الرسالة ما بتتبعت لـiframe لسه ماحمّلش (لسه ما فيهش contentWindow) —
  // useEffect بتاع init بيبعت لهم من جديد لما الـruntimeReady يحصل.
  const post = useCallback((type, payload) => {
    const targets = [
      playFrameRef.current,
      insideFrameRef.current,
      coverFrameRef.current,
    ];
    const msg = { source: SHELL, type, payload: payload || {} };
    for (const el of targets) {
      const win = el && el.contentWindow;
      if (win) win.postMessage(msg, window.location.origin);
    }
  }, []);

  // أول ما البيانات توصل، نجهّز النسخة الشغالة
  useEffect(() => {
    if (data && !draft) {
      const c = data.customizations || {};
      setDraft({
        fontFamily: c.fontFamily || '',
        audioUrl: c.audioUrl || '',
        audioStart: c.audioStart || 0,
        audioEnd: c.audioEnd || 0,
        offsets: c.offsets || {},
        images: c.images || {},
        texts: c.texts || {},
        sizes: c.sizes || {},
        colors: c.colors || {},
        rotations: c.rotations || {},
        scales: c.scales || {},
        aligns: c.aligns || {},
        rsvp: c.rsvp || {},
        calDay: c.calDay || 0,
        added: c.added || [],
        hidden: c.hidden || [],
        share: {
          title: (c.share && c.share.title) || '',
          description: (c.share && c.share.description) || '',
          image: (c.share && c.share.image) || '',
        },
      });
    }
  }, [data, draft]);

  // النصيحة بتظهر مرة واحدة أول ما المحرر يفتح فعلاً على شاشة صغيرة —
  // بعد ما البيانات توصل، عشان ماتظهرش فوق شاشة تحميل.
  useEffect(() => {
    if (compact && data && !hintDismissed()) setShowBigScreenHint(true);
  }, [compact, data]);

  // على الموبايل: أول ما العميل يضغط على جزء في الدعوة، الأدوات بتاعته
  // لازم تطلعله من غير ما يدوّر — زي أي محرر على الموبايل.
  useEffect(() => {
    if (compact && selected) setSheetOpen(true);
  }, [compact, selected]);

  // وضع التشغيل بياخد الشاشة كلها — الدرج مالوش لازمة وهو شغال
  useEffect(() => {
    if (playing) setSheetOpen(false);
  }, [playing]);

  // ===== صوت واحد بس في نفس الوقت =====
  // في المحرر تلات مصادر صوت: موسيقى الدعوة جوه الـ iframe، معاينة
  // أغاني المكتبة، ومشغّل القص. من غير الحارس ده كانوا بيشتغلوا فوق
  // بعض والعميل مش عارف يسكّت أنهي واحدة.
  useEffect(() => {
    setFramePauser(() => postRef.current('pause-audio', {}));
    const remove = installSoloAudio();
    return () => { setFramePauser(null); remove(); };
  }, []);

  // قياس الجزء الظاهر من الدرج (المقبض + التبويبات)
  useEffect(() => {
    const el = peekRef.current;
    if (!compact || !el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setPeekH(el.offsetHeight));
    ro.observe(el);
    setPeekH(el.offsetHeight);
    return () => ro.disconnect();
  }, [compact, playing]);

  // خطوط قايمة الاختيار بتتحمّل هنا بس (مش في index.html) عشان باقي
  // صفحات الموقع متتحمّلش 13 خط من غير داعي.
  useEffect(() => {
    if (!data?.fonts?.length) return undefined;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${data.fonts
      .map((f) => `family=${f.replace(/ /g, '+')}:wght@400;700`)
      .join('&')}&display=swap`;
    document.head.appendChild(link);
    return () => link.remove();
  }, [data]);

  // ===== استقبال رسائل الـ iframe =====
  useEffect(() => {
    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      const msg = event.data || {};
      if (msg.source !== RUNTIME) return;
      const p = msg.payload || {};

      // الدعوة خلّصت تحميل — التجهيز نفسه في useEffect تحت، لأن ممكن
      // الـ iframe يخلص قبل ما بيانات المحرر توصل من السيرفر (أو العكس).
      // في وضع التليفونين، أول iframe يخلّص كافي عشان نبدأ التجهيز.
      // اللي بعده لو حمّل، postToFrame من initFrame تحت بتلقّطه بنفسها
      // (كل ما يوصلنا loaded تاني بنعيد البعث للاثنين — رخيص وآمن).
      if (msg.type === 'loaded') {
        setRuntimeReady(true);
        setLastLoadTick((n) => n + 1);
      }
      if (msg.type === 'ready') {
        // في وضع الشاشتين: العدّاد والشبكة كاملين بيرجعوا من التليفون
        // بتاع "جوه الدعوة" بس. لو غيره بعت، بنتجاهله عشان مايدهسش
        // القايمة اللي منها للشريط الجانبي.
        if (p.stage && p.stage !== 'inside' && p.stage !== 'full') return;
        setCounts({ texts: p.textCount, images: p.imageCount });
        if (Array.isArray(p.photos)) setPhotos(p.photos);
      }
      if (msg.type === 'cover') {
        // زرار "الغلاف" في الشريط الجانبي مالوش معنى في وضع الشاشتين
        // (كل تليفون بيعرض حاجة ثابتة)، فبنعتمد بس على تليفون التشغيل
        // الواحد (stage=full). في التحرير: بنسجّل وجود الغلاف من التليفون
        // الشمال (stage=cover) عشان الشريط الجانبي يعرف يخفي/يظهر الزرار.
        if (p.stage === 'cover' || p.stage === 'full' || !p.stage) {
          setCoverOpen(!!p.visible);
          setHasCover(!!p.exists);
        }
      }

      // الدعوة بدأت تشغّل موسيقاها — نسكّت أي معاينة شغالة في الشريط
      if (msg.type === 'audio-playing') {
        document.querySelectorAll('audio, video').forEach((el) => {
          if (!el.paused && !el.muted) { try { el.pause(); } catch { /* */ } }
        });
      }
      if (msg.type === 'selected') {
        setSelected(p.id
          ? {
            id: p.id, kind: p.kind || 'text', text: p.text,
            fontSize: p.fontSize, bgColor: p.bgColor, scale: p.scale || 1,
          }
          : null);
      }

      // نص جديد اتعمل جوه الدعوة — بنسجّله ونبنيه
      if (msg.type === 'added-new' && p.item) {
        rememberRef.current();
        setDraft((d) => {
          if (!d) return d;
          const next = [...(d.added || []), p.item];
          postRef.current('apply-added', { added: next });
          return { ...d, added: next };
        });
        setDirty(true);
      }

      // Ctrl+Z اتضغط وهو واقف جوه الدعوة
      if (msg.type === 'history') {
        if (p.redo) redoRef.current(); else undoRef.current();
      }

      // ضغط على أيقونة المكان في الخريطة
      if (msg.type === 'pick-map') {
        setSelected((s) => (s ? { ...s, kind: 'map' } : s));
        setTab('inline');
        setError('');
      }
      if (msg.type === 'offsets') {
        // السحبة بدأت من مكان معروف — بنسجّله قبل ما نحفظ الجديد
        if (p.before) {
          const b = p.before;
          setDraft((d) => {
            if (d) {
              pastRef.current.push({
                customizations: { ...JSON.parse(JSON.stringify(d)), offsets: b },
                details: detailsRef.current ? { ...detailsRef.current } : null,
              });
              futureRef.current = [];
              if (pastRef.current.length > 60) pastRef.current.shift();
            }
            return d;
          });
          setHistTick((n) => n + 1);
        }
        setDraft((d) => (d ? { ...d, offsets: p.offsets || {} } : d));
        setDirty(true);
      }

      // العميل كبّر/صغّر صورة بسحب أحد الأركان جوه الدعوة
      if (msg.type === 'scale') {
        if (p.before) {
          const b = p.before;
          setDraft((d) => {
            if (d) {
              pastRef.current.push({
                customizations: { ...JSON.parse(JSON.stringify(d)), scales: b },
                details: detailsRef.current ? { ...detailsRef.current } : null,
              });
              futureRef.current = [];
              if (pastRef.current.length > 60) pastRef.current.shift();
            }
            return d;
          });
          setHistTick((n) => n + 1);
        }
        setDraft((d) => (d ? { ...d, scales: p.scales || {} } : d));
        setSelected((s) => (s ? { ...s, scale: (p.scales || {})[s.id] || 1 } : s));
        setDirty(true);
      }
      if (msg.type === 'pick-image') {
        setPickedImage(p.id);
        setTab('photos');
        setError('');
      }

      // ضغط على أيقونة تغيير الحجم على الصورة — نفتح تحكّم الحجم في الشريط
      if (msg.type === 'pick-scale') {
        setTab('inline');
        if (compact) setSheetOpen(true);
        setError('');
      }

      // ضغط على أيقونة تعديل فورم تأكيد الحضور
      if (msg.type === 'pick-rsvp') {
        setTab('inline');
        setRsvpOpen(true);
        if (compact) setSheetOpen(true);
        setError('');
      }

      // العميل عدّل نص بالضغط عليه جوه الدعوة
      if (msg.type === 'text-change') {
        rememberRef.current();
        // النص اللي العميل ضافه بنفسه: نعدّله جوه draft.added والحفظ
        // التلقائي بيحفظه — مسار واحد. قبل كده كان بيعدي على /text
        // ويحصل تسابق مع الحفظ التلقائي فيرجع للنص القديم بعد النشر
        // ("غيّرت الكلام وكأني ماغيرتش").
        if (p.id && p.id.indexOf('add_') === 0) {
          setDraft((d) => {
            if (!d) return d;
            const list = (d.added || []).map((it) => (
              `add_${it.id}` === p.id ? { ...it, text: p.newText } : it
            ));
            return { ...d, added: list };
          });
          setDirty(true);
        } else {
          saveTextRef.current(p);
        }
      }

      // العميل غيّر لون خط من زرار اللون على الشريط العائم جوه الدعوة.
      // النص اللي ضافه بنفسه: اللون بيتخزّن في العنصر نفسه (بيتحفظ دايمًا).
      // نص التصميم: بيتخزّن في colors (ميزة باقة). اللون اتطبّق لحظيًا
      // جوه الدعوة خلاص، فإحنا هنا بنحفظ بس.
      if (msg.type === 'color-change' && p.id) {
        persistColorRef.current(p);
      }

      // محاذاة النص اتغيّرت من زرار المحاذاة على الشريط العائم
      if (msg.type === 'align-change' && p.id) {
        rememberRef.current();
        setDraft((d) => {
          if (!d) return d;
          const aligns = { ...(d.aligns || {}) };
          if (p.align) aligns[p.id] = p.align; else delete aligns[p.id];
          return { ...d, aligns };
        });
        setDirty(true);
      }

      // ضغط على رقم في نتيجة الشهر — العلامة اتنقلت عليه جوه الدعوة
      // وإحنا بنحفظ اليوم ده
      if (msg.type === 'cal-day' && p.day) {
        rememberRef.current();
        setDraft((d) => (d ? { ...d, calDay: p.day } : d));
        setDirty(true);
      }

      // العميل ضغط على أيقونة الحذف
      if (msg.type === 'hide' && p.id) {
        rememberRef.current();
        setDraft((d) => {
          if (!d || d.hidden.includes(p.id)) return d;
          return { ...d, hidden: [...d.hidden, p.id] };
        });
        setDirty(true);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [post]);

  // حفظ النص المعدّل. في ref عشان مستمع الرسايل يفضل مستقر (بيتسجّل
  // مرة واحدة) ومع ذلك يشوف أحدث نسخة من الدالة.
  // رسايل الـ iframe بتوصل من مستمع مستقر، فبنوصّلها بأحدث نسخة من
  // الدوال عن طريق ref بدل ما نعيد تسجيل المستمع كل مرة
  const rememberRef = useRef(() => {});
  rememberRef.current = remember;
  // آخر عنصر اتغيّر مقاسه — عشان سحبة السلايدر تتسجّل كخطوة واحدة
  const sizeAnchorRef = useRef(null);
  const colorAnchorRef = useRef(null);
  const rotateAnchorRef = useRef(null);
  const scaleAnchorRef = useRef(null);
  const trimAnchorRef = useRef(null);
  const undoRef = useRef(() => {});
  const redoRef = useRef(() => {});
  const postRef = useRef(() => {});
  postRef.current = post;

  const saveTextRef = useRef(() => {});
  saveTextRef.current = async ({ id, oldText, newText }) => {
    setError('');
    setTextSaving(true);
    try {
      const res = await saveText({ shortId, id, oldText, newText }).unwrap();
      // لازم نزامن النسخة المحلية بالرد. لو سبناها قديمة، الحفظ
      // التلقائي اللي بعده بيبعت القايمة القديمة ويدهس التعديل اللي
      // لسه اتحفظ — وده كان بيحصل فعلاً مع النصوص المضافة.
      setDraft((d) => (d ? {
        ...d,
        texts: res.texts || {},
        added: res.added !== undefined ? res.added : d.added,
      } : d));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2200);
      // لو اللي اتعدّل حقل أساسي (اسم عروسة، قاعة...) فهو ظاهر في أكتر
      // من مكان في الدعوة. قبل كده كنا بنعيد تحميل الصفحة كلها عشان
      // تتحدّث — والعميل اشتكى إن الصفحة بتعمل ريلو مع كل تعديل. دلوقتي
      // بنحدّث باقي الأماكن **في مكانها** من غير أي إعادة تحميل.
      if (res.propagatedField) {
        post('propagate-text', { oldText, newText });
      }
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
      // رجّع النص الأصلي في الدعوة عشان مايفضلش شايف تعديل ماتحفظش
      post('set-text', { id, text: oldText });
    } finally {
      setTextSaving(false);
    }
  };

  // حفظ لون الخط اللي اتغيّر من الشريط العائم جوه الدعوة. في ref عشان
  // مستمع الرسايل يفضل مستقر ويشوف أحدث نسخة من الدوال.
  const persistColorRef = useRef(() => {});
  persistColorRef.current = ({ id, color, added }) => {
    // بداية سحبة لون جديدة على عنصر جديد = خطوة رجوع واحدة (زي السلايدر)
    if (colorAnchorRef.current !== id) {
      colorAnchorRef.current = id;
      remember();
    }
    setDraft((d) => {
      if (!d) return d;
      if (added) {
        // النص المضاف: اللون جزء من العنصر نفسه — بيتحفظ في أي باقة
        const list = (d.added || []).map((it) => (`add_${it.id}` === id ? { ...it, color } : it));
        return { ...d, added: list };
      }
      const colors = { ...(d.colors || {}) };
      if (color) colors[id] = color; else delete colors[id];
      return { ...d, colors };
    });
    setSelected((s) => (s && s.id === id ? { ...s, bgColor: color || s.bgColor } : s));
    setDirty(true);
  };

  // التجهيز بيحصل لما الطرفين يبقوا جاهزين — أيًا كان مين وصل الأول.
  // بنعتمد على lastLoadTick كـdependency كمان: في وضع التليفونين، لما
  // يخلص التليفون الثاني التحميل بعد الأول، بنعيد إرسال الحالة الكاملة
  // له. الرسائل بتتبعت للاثنين — الأول اللي اتجهّز بيتجاهل التكرار
  // ويطبّق التغيير من غير أي أثر جانبي.
  useEffect(() => {
    if (!runtimeReady || !draft) return;
    post('init', {
      offsets: draft.offsets, hidden: draft.hidden, sizes: draft.sizes,
      colors: draft.colors, rotations: draft.rotations, scales: draft.scales, aligns: draft.aligns, features,
    });
    if (draft.fontFamily) post('set-font', { font: draft.fontFamily });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeReady, !!draft, features, lastLoadTick]);

  // ===== الحفظ التلقائي =====
  useEffect(() => {
    if (!dirty || !draft) return undefined;
    const timer = setTimeout(async () => {
      try {
        // بنبعت اللي الباقة سامحة بيه بس — السيرفر بيرفض الباقي أصلاً
        await saveCustomizations({ shortId, ...customizationBody(draft, has) }).unwrap();
        setDirty(false);
        setError('');
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2200);
      } catch {
        setError(t('editor.errorSave'));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [dirty, draft, has, saveCustomizations, shortId, t]);

  // تحذير لو المستخدم قفل الصفحة وفي حاجة لسه بتتحفظ
  useEffect(() => {
    if (!dirty) return undefined;
    function warn(e) { e.preventDefault(); e.returnValue = ''; }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // ===== الأفعال =====
  function chooseFont(font) {
    remember();
    setDraft((d) => ({ ...d, fontFamily: font }));
    post('set-font', { font });
    setDirty(true);
  }

  async function onImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !pickedImage) return;
    setError('');
    if (tooBig(file)) { setError(sizeError(file)); return; }
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadImage(fd).unwrap();
      remember(); // بعد نجاح الرفع — عشان رفعة فاشلة ماتسجّلش خطوة
      setDraft((d) => ({ ...d, images: { ...d.images, [pickedImage]: res.url } }));
      post('set-image', { id: pickedImage, url: res.url });
      setDirty(true);
    } catch (err) {
      setError(uploadError(err, t));
    }
  }

  async function onAudioFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    // الفحص هنا قبل ما نبعت: العميل ياخد الرسالة الصح فورًا بدل ما
    // يستنى الملف يترفع كله وبعدين يترفض
    if (tooBig(file)) { setError(sizeError(file)); return; }
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadAudio(fd).unwrap();
      remember();
      setDraft((d) => ({ ...d, audioUrl: res.url }));
      post('set-audio', { url: res.url });
      setDirty(true);
    } catch (err) {
      setError(uploadError(err, t));
    }
  }

  /** صورة كارت المشاركة — بتترفع زي أي صورة بس مبتتحطش في التصميم */
  async function onShareImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (tooBig(file)) { setError(sizeError(file)); return; }
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadImage(fd).unwrap();
      remember();
      setDraft((d) => ({ ...d, share: { ...(d.share || {}), image: res.url } }));
      setDirty(true);
    } catch (err) {
      setError(uploadError(err, t));
    }
  }

  /** تحريك العنصر المختار بالبكسل من الأسهم */
  function nudge(dx, dy) {
    if (!selected) return;
    remember();
    setDraft((d) => {
      const cur = d.offsets[selected.id] || { dx: 0, dy: 0 };
      const next = { ...d.offsets, [selected.id]: { dx: cur.dx + dx, dy: cur.dy + dy } };
      post('apply-offsets', { offsets: next });
      return { ...d, offsets: next };
    });
    setDirty(true);
  }

  /**
   * بترجّع لقطة كاملة: التخصيصات + البيانات الأساسية.
   * البيانات الأساسية (أسماء/تاريخ/قاعة) بتتغيّر بإعادة بناء الدعوة،
   * فلو اتغيّرت في اللقطة بنعيد تحميل الإطار؛ غير كده بنطبّق على
   * الدعوة من غير إعادة تحميل عشان الرجوع يبقى فوري.
   */
  const applySnapshot = useCallback(async (snap) => {
    if (!snap || !snap.customizations) return;
    setError('');
    setTextSaving(true);
    try {
      const detailsChanged = snap.details && detailsRef.current
        && JSON.stringify(snap.details) !== JSON.stringify(detailsRef.current);

      setDraft(snap.customizations);
      draftRef.current = snap.customizations;

      const body = {
        shortId,
        hidden: snap.customizations.hidden,
        sizes: snap.customizations.sizes,
        rotations: snap.customizations.rotations || {},
        scales: snap.customizations.scales || {},
        aligns: snap.customizations.aligns || {},
        calDay: snap.customizations.calDay || 0,
        added: snap.customizations.added,
      };
      if (has('fonts')) body.fontFamily = snap.customizations.fontFamily;
      if (has('music')) {
        body.audioUrl = snap.customizations.audioUrl;
        body.audioStart = snap.customizations.audioStart || 0;
        body.audioEnd = snap.customizations.audioEnd || 0;
      }
      body.offsets = snap.customizations.offsets;
      if (has('images')) body.images = snap.customizations.images;
      await saveCustomizations(body).unwrap();

      if (detailsChanged) {
        await saveDetails({ shortId, ...snap.details }).unwrap();
        await refetch();
        reloadFrame();
      } else {
        post('restore', { customizations: snap.customizations });
        post('set-font', { font: snap.customizations.fontFamily || '' });
        setSelected(null);
      }
      setDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    } finally {
      setTextSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortId, has, saveCustomizations, saveDetails, refetch, post, t]);

  const undo = useCallback(async () => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(snapshot());
    setHistTick((n) => n + 1);
    await applySnapshot(prev);
  }, [applySnapshot, snapshot]);

  const redo = useCallback(async () => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(snapshot());
    setHistTick((n) => n + 1);
    await applySnapshot(next);
  }, [applySnapshot, snapshot]);

  // الاختصار بيتمسك جوه الدعوة كمان وبيتبعت من هناك (التركيز بيكون
  // في الـ iframe وقتها)، فبنوصّل أحدث نسخة من الدوال بـ ref
  undoRef.current = undo;
  redoRef.current = redo;

  // اختصارات الكيبورد — Ctrl+Z و Ctrl+Shift+Z (و Cmd على الماك)
  useEffect(() => {
    function onKey(e) {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      // لو بيكتب جوه الدعوة، سيب المتصفح يعمل undo بتاع النص نفسه
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  /** مقاس الخط للعنصر المختار — null يعني رجّعه لمقاس التصميم */
  // تغيير الوقت في العنصر المختار (من منتقي الوقت في الشريط الجانبي).
  // بنغيّر نص العنصر نفسه — متاح في كل الباقات زي أي تعديل نص.
  function applyTime(hour24, minute) {
    if (!selected) return;
    const parsed = parseTime(selected.text);
    if (!parsed) return;
    const newText = applyTimeToText(selected.text, parsed, hour24, minute);
    if (newText === selected.text) return;
    remember();
    post('set-text', { id: selected.id, text: newText });   // تحديث لحظي في الدعوة
    saveTextRef.current({ id: selected.id, oldText: selected.text, newText });
    setSelected((s) => (s ? { ...s, text: newText } : s));
  }

  function setSize(px) {
    if (!selected) return;
    // السلايدر بيبعت عشرات القيم وهو بيتحرك — لو سجّلنا كل واحدة،
    // الرجوع للخلف هيحتاج 40 ضغطة عشان يلغي حركة واحدة. فبنسجّل
    // اللقطة مرة واحدة عند أول تغيير في العنصر ده.
    if (sizeAnchorRef.current !== selected.id) {
      sizeAnchorRef.current = selected.id;
      remember();
    }
    post('set-size', { id: selected.id, size: px });
    const isAdded = selected.id.indexOf('add_') === 0;
    setDraft((d) => {
      if (!d) return d;
      // النص اللي العميل ضافه: مقاسه جزء من العنصر نفسه (مصدر واحد)،
      // مش في خريطة مقاسات التصميم — عشان إعادة البناء متدهسوش وييتحفظ
      // في أي باقة (زي اللون).
      if (isAdded) {
        const size = px || 22;
        const list = (d.added || []).map((it) => (`add_${it.id}` === selected.id ? { ...it, size } : it));
        return { ...d, added: list };
      }
      const sizes = { ...d.sizes };
      if (px) sizes[selected.id] = px;
      else delete sizes[selected.id];
      return { ...d, sizes };
    });
    // السلايدر بيحرّك العنصر فعليًا، فالمقاس الظاهر لازم يتابعه
    setSelected((s) => (s ? { ...s, fontSize: px || s.fontSize } : s));
    setDirty(true);
  }

  /**
   * أي حقل من بيانات الدعوة الأساسية (تاريخ، لينك مكان).
   * دي الحاجات اللي مش بتتكتب كنص عادي لأن ورا كل واحدة منطق:
   * التاريخ بيحرّك العداد التنازلي، واللينك بيبني الخريطة المدمجة.
   */
  /**
   * بيحفظ أي تعديلات تخصيص لسه معلّقة (الحفظ التلقائي بـ debounce ثانية)
   * **قبل** أي إعادة تحميل للإطار. من غيره: تضيف كلام أو تكبّر صورة وبعدها
   * على طول تخفي قسم — الإطار بيعمل reload على حالة السيرفر القديمة،
   * فاللي لسه ماتحفظش بيتشال من قدامك لحد الحفظة الجاية. بنقرا من
   * draftRef عشان ناخد أحدث نسخة جوه دالة async.
   */
  const flushCustomizations = useCallback(async () => {
    if (!dirtyRef.current || !draftRef.current) return;
    await saveCustomizations({ shortId, ...customizationBody(draftRef.current, has) }).unwrap();
    setDirty(false);
  }, [shortId, saveCustomizations, has]);

  async function changeDetail(patch) {
    if (!data?.details) return;
    remember();
    setError('');
    setTextSaving(true);
    try {
      // نحفظ تخصيصات المحرر المعلّقة الأول عشان الـ reload اللي بعد حفظ
      // البيانات مايضيّعش حاجة لسه بتتحفظ
      await flushCustomizations();
      await saveDetails({ shortId, ...data.details, ...patch }).unwrap();
      await refetch();
      reloadFrame();
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    } finally {
      setTextSaving(false);
    }
  }

  /**
   * زاوية ميل العنصر المختار بالدرجات — null يعني رجّعه لميل التصميم.
   * زي المقاس: سحبة السلايدر كلها بتتسجّل كخطوة رجوع واحدة.
   */
  function setRotation(deg) {
    if (!selected) return;
    if (rotateAnchorRef.current !== selected.id) {
      rotateAnchorRef.current = selected.id;
      remember();
    }
    post('set-rotation', { id: selected.id, deg });
    setDraft((d) => {
      const rotations = { ...(d.rotations || {}) };
      if (deg === null) delete rotations[selected.id];
      else rotations[selected.id] = deg;
      return { ...d, rotations };
    });
    setSelected((s) => (s ? { ...s, rotation: deg === null ? 0 : deg } : s));
    setDirty(true);
  }

  /** تكبير/تصغير الصورة من السلايدر (متاح في أي باقة) */
  function setScale(factor) {
    if (!selected) return;
    const f = Math.max(0.2, Math.min(3, Number(factor) || 1));
    if (scaleAnchorRef.current !== selected.id) {
      scaleAnchorRef.current = selected.id;
      remember();
    }
    post('set-scale', { id: selected.id, scale: f });
    setDraft((d) => {
      if (!d) return d;
      const scales = { ...(d.scales || {}) };
      if (f === 1) delete scales[selected.id];
      else scales[selected.id] = f;
      return { ...d, scales };
    });
    setSelected((s) => (s ? { ...s, scale: f } : s));
    setDirty(true);
  }

  /** رجّع الصورة لمقاسها الأصلي (بعد ما العميل كبّرها/صغّرها بالأركان) */
  function resetScale() {
    if (!selected) return;
    remember();
    post('set-scale', { id: selected.id, scale: null });
    setDraft((d) => {
      const scales = { ...(d.scales || {}) };
      delete scales[selected.id];
      return { ...d, scales };
    });
    setSelected((s) => (s ? { ...s, scale: 1 } : s));
    setDirty(true);
  }

  /** لون خلفية العنصر المختار (مربعات الزي المقترح مثلاً) */
  function setColor(hex) {
    if (!selected) return;
    if (colorAnchorRef.current !== selected.id) {
      colorAnchorRef.current = selected.id;
      remember();
    }
    post('set-color', { id: selected.id, color: hex });
    const isAdded = selected.id.indexOf('add_') === 0;
    setDraft((d) => {
      if (!d) return d;
      // النص المضاف: لونه جزء من العنصر نفسه (مصدر واحد، بيتحفظ في أي
      // باقة) — نفس منطق المقاس
      if (isAdded && hex) {
        const list = (d.added || []).map((it) => (`add_${it.id}` === selected.id ? { ...it, color: hex } : it));
        return { ...d, added: list };
      }
      const colors = { ...(d.colors || {}) };
      if (hex) colors[selected.id] = hex;
      else delete colors[selected.id];
      return { ...d, colors };
    });
    setSelected((s) => (s ? { ...s, bgColor: hex || s.bgColor } : s));
    setDirty(true);
  }

  /** اختار أغنية من المكتبة — القص بيتصفّر لأنها أغنية تانية */
  function pickTrack(url) {
    remember();
    setDraft((d) => ({ ...d, audioUrl: url, audioStart: 0, audioEnd: 0 }));
    post('set-audio', { url });
    setDirty(true);
  }

  /** حدود قص الأغنية — سحبة السلايدر بتتسجّل كخطوة واحدة */
  function setTrim({ start, end }) {
    if (trimAnchorRef.current !== (draft && draft.audioUrl)) {
      trimAnchorRef.current = draft && draft.audioUrl;
      remember();
    }
    setDraft((d) => ({ ...d, audioStart: start, audioEnd: end }));
    setDirty(true);
  }

  /** بدّل ختم الغلاف بختم تصميم تاني */
  function chooseSeal(url) {
    if (!data?.sealElemId) return;
    remember();
    post('set-image', { id: data.sealElemId, url });
    setDraft((d) => ({ ...d, images: { ...d.images, [data.sealElemId]: url } }));
    setDirty(true);
  }

  /**
   * إظهار/إخفاء قسم كامل من الدعوة.
   *
   * ده مش نفس "احذف العنصر" اللي في السلة: ده بيشيل القسم كله من
   * التصميم (العنوان والمحتوى والمسافات)، والدعوة بتتبني من جديد من
   * غيره — زي بالظبط لو العميل مااختارهوش وهو بيعمل الدعوة. ولأن
   * التصميم بيتبني على السيرفر، لازم نعيد تحميل الإطار بعد الحفظ.
   *
   * القسم المخفي بيفضل في القايمة عشان يرجع بضغطة تانية (نفس أسلوب
   * الطبقات في برامج التصميم — الحاجة المخفية مبتختفيش من اللستة).
   */
  async function toggleSection(key) {
    if (!data?.details) return;
    const current = data.details.hiddenSections || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    remember();
    setError('');
    setSectionsBusy(true);
    try {
      // نفس سبب changeDetail: احفظ التخصيصات المعلّقة قبل الـ reload
      await flushCustomizations();
      await saveDetails({ shortId, ...data.details, hiddenSections: next }).unwrap();
      await refetch();
      reloadFrame();
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    } finally {
      setSectionsBusy(false);
    }
  }

  /** اختار صورة من الشبكة المرقّمة وافتح ملف الرفع على طول */
  function pickPhoto(id) {
    setError('');
    setPickedImage(id);
    // مفيش داعي لخطوة زيادة: اللي ضغط "غيّر" عايز يختار صورة دلوقتي
    setTimeout(() => imageInputRef.current?.click(), 0);
  }

  /** شيل صورة من الدعوة (بتفضل في الشبكة باهتة عشان ترجّعها) */
  function hidePhoto(id) {
    remember();
    setDraft((d) => {
      if (!d || d.hidden.includes(id)) return d;
      const next = [...d.hidden, id];
      post('apply-hidden', { hidden: next });
      return { ...d, hidden: next };
    });
    setDirty(true);
  }

  /** رجّع جزء اتحذف */
  function restoreHidden(id) {
    remember();
    setDraft((d) => {
      const next = d.hidden.filter((x) => x !== id);
      post('apply-hidden', { hidden: next });
      return { ...d, hidden: next };
    });
    setDirty(true);
  }

  function resetOffsets() {
    remember();
    post('reset-offsets', {});
    setDraft((d) => ({ ...d, offsets: {} }));
    setDirty(true);
  }

  /** شغّل الدعوة من الأول زي ما الضيف هيشوفها بالظبط */
  function play() {
    setPlaying(true);
    setRuntimeReady(false);
    setSelected(null);
    setCounts(null);
    setFrameKey((k) => k + 1);
  }

  function stopPlaying() {
    setPlaying(false);
    setRuntimeReady(false);
    setSelected(null);
    setCounts(null);
    setFrameKey((k) => k + 1);
  }

  /** إعادة التشغيل من أول وجديد وهو في وضع التشغيل */
  function replay() {
    setFrameKey((k) => k + 1);
  }

  function toggleCover() {
    const next = !coverOpen;
    setCoverOpen(next);
    post('toggle-cover', { on: next });
  }


  /** بعد حفظ البيانات الأساسية: الـ iframe لازم يتبني من الأول */
  function reloadFrame() {
    setRuntimeReady(false);
    setSelected(null);
    setCounts(null);
    setFrameKey((k) => k + 1);
  }

  async function publish() {
    setError('');
    try {
      await publishInvitation(shortId).unwrap();
      await refetch();
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    }
  }

  // زرار "نشر التعديلات" للدعوة المنشورة: بيحفظ كل التعديلات ويحدّث
  // المعاينة فورًا. التعديلات أصلًا بتتحفظ لحظيًا وبتظهر للضيوف على طول،
  // بس الزرار ده بيدّي العميل تأكيد واضح ويحدّث الشكل قدامه (خصوصًا
  // حاجات زي الأغنية اللي المعاينة مبتحدّثهاش إلا مع إعادة التحميل).
  // بينشر بس مش بيخصم رصيد — الدعوة منشورة خلاص.
  async function updatePublished() {
    setError('');
    try {
      await saveCustomizations({ shortId, ...customizationBody(draft, has) }).unwrap();
      setDirty(false);
      reloadFrame();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    }
  }

  // تعديل نص من نصوص فورم تأكيد الحضور
  function setRsvpField(key, value) {
    setDraft((d) => (d ? { ...d, rsvp: { ...(d.rsvp || {}), [key]: value } } : d));
    setDirty(true);
  }

  // يحفظ تعديلات الفورم ويعيد تحميل الدعوة عشان تظهر (النصوص بتتحقن من
  // السيرفر وقت العرض)
  async function applyRsvp() {
    setError('');
    try {
      await saveCustomizations({ shortId, ...customizationBody(draft, has) }).unwrap();
      setDirty(false);
      reloadFrame();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    }
  }

  // رجّع الدعوة لأصلها — يمسح كل التخصيصات ويبدأ من جديد
  async function resetAll() {
    if (!window.confirm(t('editor.resetConfirm'))) return;
    setError('');
    try {
      await resetInvitation(shortId).unwrap();
      // بننضّف النسخة المحلية والتاريخ ونعيد تحميل الدعوة نضيفة
      pastRef.current = [];
      futureRef.current = [];
      setHistTick((n) => n + 1);
      await refetch();
      reloadFrame();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    }
  }

  async function discardDraft() {
    if (!window.confirm(t('editor.discardConfirm'))) return;
    try {
      await deleteDraft(shortId).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(err?.data?.error || t('editor.errorSave'));
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/i/${shortId}`).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
      () => setError(t('editor.errorSave'))
    );
  }

  // ===== حالات التحميل =====
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-ink-dim">
        <Loader2 size={17} className="animate-spin" /> {t('editor.loading')}
      </div>
    );
  }
  // مدة التعديل خلصت: شاشة تشرح إن الدعوة لسه شغالة وإيه الحل، مش "مش متاحة"
  if (isError && loadError?.data?.code === 'EDIT_WINDOW_ENDED') {
    return (
      <EditWindowEnded
        shortId={shortId}
        editUntil={loadError.data.editUntil}
        days={loadError.data.editWindowDays}
      />
    );
  }
  if (isError || !data || !draft) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle size={26} className="text-ink-dim" />
        <p className="text-ink-dim">{t('editor.noAccess')}</p>
        <Link to="/dashboard" className="text-rose underline">{t('editor.back')}</Link>
      </div>
    );
  }

  const activeTab = TABS.find((x) => x.id === tab);
  // التبويب اللي مالوش feature (بيانات الدعوة) مفتوح دايمًا
  const tabUnlocked = !activeTab.feature || has(activeTab.feature);
  const isDraft = data.status === 'draft';

  // ===== حالة الحفظ في صورة مختصرة (للموبايل) =====
  const saveState = (isSaving || textSaving)
    ? { icon: <Loader2 size={13} className="animate-spin" />, tone: 'text-ink-dim', label: t('editor.saving') }
    : dirty
      ? { icon: <span className="h-1.5 w-1.5 rounded-full bg-brass" />, tone: 'text-brass', label: t('editor.unsaved') }
      : { icon: <Check size={13} />, tone: 'text-ok', label: justSaved ? t('editor.saved') : t('editor.allSaved') };

  return (
    // dvh مش vh: على الموبايل شريط عنوان المتصفح بيدخل ويطلع، و vh
    // بيحسبه غلط فيطلع جزء من الصفحة تحت الشاشة
    <div className="flex h-dvh flex-col overflow-hidden bg-ivory">
      {/* النصيحة بتظهر فوق كل حاجة على الموبايل */}
      <AnimatePresence>
        {showBigScreenHint && <BigScreenNotice onClose={() => setShowBigScreenHint(false)} />}
      </AnimatePresence>

      {/* ===== الشريط العلوي — نسخة الموبايل: سطر واحد، عمره ما يلف ===== */}
      {compact ? (
        <header className="flex shrink-0 items-center gap-2 border-b border-line bg-card px-3 py-2">
          <Link
            to="/dashboard"
            aria-label={t('editor.back')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-dim active:bg-ink/5"
          >
            <ArrowRight size={17} />
          </Link>

          <span className={`inline-flex min-w-0 items-center gap-1.5 text-[12px] ${saveState.tone}`}>
            {saveState.icon}
            <span className="truncate">{saveState.label}</span>
          </span>

          <span className="flex-1" />

          {playing ? (
            <>
              <button
                type="button"
                onClick={replay}
                aria-label={t('editor.replay')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-dim active:bg-ink/5"
              >
                <RotateCw size={15} />
              </button>
              <button
                type="button"
                onClick={stopPlaying}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-night px-3.5 py-2 text-[12.5px] font-bold text-ivory"
              >
                <PenLine size={13} /> {t('editor.editShort')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={play}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-4 py-2 text-[12.5px] font-extrabold text-[#241608]"
            >
              <PlayCircle size={14} /> {t('editor.playShort')}
            </button>
          )}
        </header>
      ) : (
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-5 py-3">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-rose">
            <ArrowRight size={15} /> {t('editor.back')}
          </Link>
          <span className="hidden font-serif text-[15px] font-bold text-ink sm:inline">{t('editor.title')}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* حالة الحفظ */}
          <span className="min-w-[110px] text-end text-[12.5px]">
            {isSaving || textSaving ? (
              <span className="inline-flex items-center gap-1.5 text-ink-dim">
                <Loader2 size={12} className="animate-spin" /> {t('editor.saving')}
              </span>
            ) : dirty ? (
              <span className="text-brass">{t('editor.unsaved')}</span>
            ) : justSaved ? (
              <span className="inline-flex items-center gap-1.5 text-ok">
                <Check size={12} /> {t('editor.saved')}
              </span>
            ) : (
              <span className="text-ink-dim">{t('editor.allSaved')}</span>
            )}
          </span>

          {/* الجهاز */}
          <div className="flex rounded-full border border-line p-0.5">
            {[
              { id: 'mobile', icon: Smartphone },
              { id: 'desktop', icon: Monitor },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                title={t(`editor.${id}`)}
                className={`rounded-full px-3 py-1.5 ${device === id ? 'bg-night text-ivory' : 'text-ink-dim hover:text-ink'}`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* رجوع للخلف / إعادة */}
          {!playing && (
            <div className="flex rounded-full border border-line p-0.5">
              <button
                type="button"
                onClick={undo}
                disabled={pastRef.current.length === 0 || textSaving}
                title={`${t('editor.undo')} (Ctrl+Z)`}
                className="rounded-full px-3 py-1.5 text-ink-dim transition hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Undo2 size={14} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={futureRef.current.length === 0 || textSaving}
                title={`${t('editor.redo')} (Ctrl+Shift+Z)`}
                className="rounded-full px-3 py-1.5 text-ink-dim transition hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Redo2 size={14} />
              </button>
            </div>
          )}

          {/* شاشة الغلاف — بتتشال من الطريق افتراضيًا، وده زرار فتحها */}
          {hasCover && !playing && (
            <button
              type="button"
              onClick={toggleCover}
              title={t('editor.coverHint')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition ${
                coverOpen
                  ? 'border-brass bg-brass/15 text-[#7a5a1a]'
                  : 'border-line text-ink-dim hover:border-ink/30 hover:text-ink'
              }`}
            >
              <Layers size={13} /> {t('editor.cover')}
            </button>
          )}

          {/* تشغيل الدعوة من الأول */}
          {playing ? (
            <>
              <button
                type="button"
                onClick={replay}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px] font-bold text-ink-dim hover:border-ink/30 hover:text-ink"
              >
                <RotateCw size={13} /> {t('editor.replay')}
              </button>
              <button
                type="button"
                onClick={stopPlaying}
                className="inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2 text-[12.5px] font-bold text-ivory hover:bg-emerald"
              >
                <PenLine size={13} /> {t('editor.backToEdit')}
              </button>
            </>
          ) : (
            <motion.button
              type="button"
              onClick={play}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2.5 text-[12.5px] font-extrabold text-[#241608] shadow-[0_6px_18px_-8px_rgba(201,162,74,.9)]"
            >
              {/* لمعة بتعدي على الزرار عند المرور */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-600 group-hover:translate-x-full" />
              <PlayCircle size={15} /> {t('editor.play')}
            </motion.button>
          )}
        </div>
      </header>
      )}

      {/* ===== شريط النشر ===== */}
      {/* المسودة مبتخصمش من رصيد الباقة ومحدش شايفها غير صاحبها — الخصم
          والنشر بيحصلوا مع بعض بضغطة واحدة هنا. */}
      {compact ? (
        isDraft ? (
          <div className="flex shrink-0 items-center gap-2 border-b border-brass/40 bg-gradient-to-l from-night to-[#16281f] px-3 py-2 text-ivory">
            <FileText size={14} className="shrink-0 text-brass-soft" />
            <span className="min-w-0 flex-1 truncate text-[12px]">
              <b className="font-bold">{t('editor.draftShort')}</b>
              <span className="text-ivory/60"> · {t('editor.draftSubtitle', { count: data.invitationsLeft })}</span>
            </span>
            <button
              type="button"
              onClick={discardDraft}
              disabled={deleting}
              aria-label={t('editor.discard')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ivory/25 text-ivory/70 disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={publishing}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-3.5 py-2 text-[12px] font-extrabold text-[#241608] disabled:opacity-60"
            >
              {publishing ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
              {t('editor.publishShort')}
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 border-b border-line bg-ok/[0.07] px-3 py-1.5">
            <button
              type="button"
              onClick={updatePublished}
              disabled={isSaving}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-l from-brass to-brass-soft px-3 py-1.5 text-[12px] font-extrabold text-[#241608] disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
              {t('editor.republish')}
            </button>
            <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-ok">
              {t('editor.publishedShort')}
            </span>
            <button
              type="button"
              onClick={copyLink}
              aria-label={t('result.copy')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink active:bg-ink/5"
            >
              {copied ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
            </button>
            <a
              href={`/i/${shortId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('dash.open')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-night text-ivory"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        )
      ) : isDraft ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-brass/40 bg-gradient-to-l from-night to-[#16281f] px-5 py-3 text-ivory">
          <div className="flex items-center gap-2.5">
            <FileText size={16} className="text-brass-soft" />
            <div>
              <div className="text-[13.5px] font-bold">{t('editor.draftTitle')}</div>
              <div className="text-[12px] text-ivory/65">
                {t('editor.draftSubtitle', { count: data.invitationsLeft })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={discardDraft}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full border border-ivory/25 px-4 py-2 text-[12.5px] font-bold text-ivory/80 hover:border-error hover:text-error disabled:opacity-50"
            >
              <Trash2 size={13} /> {t('editor.discard')}
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2.5 text-[12.5px] font-extrabold text-[#241608] hover:brightness-105 disabled:opacity-60"
            >
              {publishing ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
              {t('editor.publish')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-ok/[0.07] px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            {/* زرار "نشر التعديلات" — العميل بيدوس عليه بعد ما يعدّل عشان
                يتأكد إن تعديلاته اتطبّقت واتحدّثت المعاينة قدامه */}
            <button
              type="button"
              onClick={updatePublished}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-5 py-2 text-[12.5px] font-extrabold text-[#241608] hover:brightness-105 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
              {t('editor.republish')}
            </button>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ok">
              <Check size={13} /> {t('editor.publishedTitle')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-[12.5px] font-bold text-ink hover:bg-ink/5"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? t('result.copied') : t('result.copy')}
            </button>
            <a
              href={`/i/${shortId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-1.5 text-[12.5px] font-bold text-ivory hover:bg-emerald"
            >
              <ExternalLink size={12} /> {t('dash.open')}
            </a>
          </div>
        </div>
      )}

      {/* ===== اسم الدعوة ===== */}
      {/* بيظهرلك إنت في لوحتك بس عشان تفرّق بين دعواتك — الضيوف عمرهم ما
          بيشوفوه. بيتحفظ لوحده وإنت بتكتب. */}
      {!playing && (
        <div className="flex shrink-0 items-center gap-2 border-b border-line bg-card px-4 py-2">
          <Tag size={14} className="shrink-0 text-ink-dim" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder={t('editor.namePlaceholder')}
            aria-label={t('editor.nameLabel')}
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[13px] font-bold text-ink hover:border-line focus:border-rose focus:bg-ivory focus:outline-none"
          />
          <span className="hidden shrink-0 text-[11px] text-ink-dim sm:inline">{t('editor.nameHint')}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* ===== الشريط الجانبي ===== */}
        {/* على الشاشات الصغيرة الشريط بيتحول لدرج سفلي بدل ما يختفي —
            العميل لازم يقدر يعدّل من الموبايل برضو */}
        <aside
          hidden={playing}
          className={`flex flex-col border-line bg-card ${
            compact
              ? 'fixed inset-x-0 bottom-0 z-30 rounded-t-[22px] border-t shadow-[0_-12px_40px_-16px_rgba(0,0,0,.38)]'
              : 'shrink-0 lg:w-[400px] xl:w-[440px] lg:border-e'
          }`}
        >
          {/* ===== مقبض الدرج + الأدوات السريعة — موبايل بس ===== */}
          {/* الأدوات اللي كانت مزنوقة في الشريط العلوي (رجوع/إعادة/الغلاف)
              مكانها هنا: قريبة من الإيد، وسطر واحد مايزحمش الشاشة. */}
          <div ref={peekRef} className="shrink-0">
          {compact && (
            <div className="px-3 pt-2">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/15" />
              <div className="flex items-center gap-1.5 pb-2">
                <button
                  type="button"
                  onClick={() => setSheetOpen((v) => !v)}
                  aria-expanded={sheetOpen}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1.5 text-[12px] font-bold text-ink"
                >
                  {sheetOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  {t('editor.tools')}
                </button>

                <span className="flex-1" />

                <button
                  type="button"
                  onClick={undo}
                  disabled={pastRef.current.length === 0 || textSaving}
                  aria-label={t('editor.undo')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-dim disabled:opacity-30"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={futureRef.current.length === 0 || textSaving}
                  aria-label={t('editor.redo')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-dim disabled:opacity-30"
                >
                  <Redo2 size={14} />
                </button>
                {hasCover && (
                  <button
                    type="button"
                    onClick={toggleCover}
                    aria-label={t('editor.cover')}
                    aria-pressed={coverOpen}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      coverOpen ? 'border-brass bg-brass/15 text-[#7a5a1a]' : 'border-line text-ink-dim'
                    }`}
                  >
                    <Layers size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          <nav className={`flex shrink-0 border-line ${compact ? 'border-y' : 'border-b'}`}>
            {TABS.map(({ id, icon: Icon, feature, label }) => (
              <button
                key={id}
                type="button"
                // على الموبايل الضغط على تبويب بيفتح الدرج كمان، والضغط
                // على التبويب المفتوح بيقفله — أسرع طريق للدعوة ورجوع
                onClick={() => {
                  if (compact && tab === id) setSheetOpen((v) => !v);
                  else if (compact) setSheetOpen(true);
                  setTab(id);
                }}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 font-bold transition ${
                  compact ? 'px-1 py-2.5 text-[10.5px]' : 'gap-1.5 py-3.5 text-[11.5px]'
                } ${tab === id ? 'text-rose' : 'text-ink-dim hover:text-ink'}`}
              >
                <Icon size={compact ? 15 : 16} />
                <span className="w-full truncate text-center">{t(label)}</span>
                {feature && !has(feature) && (
                  <Lock size={9} className={`absolute text-ink-dim ${compact ? 'end-1 top-1.5' : 'end-2 top-2.5'}`} />
                )}
                {tab === id && (
                  <motion.span layoutId="editor-tab" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-rose" />
                )}
              </button>
            ))}
          </nav>
          </div>

          {/* محتوى الدرج — بيتطوي لصفر على الموبايل لما يتقفل */}
          <div
            className={compact
              ? 'overflow-hidden transition-[height] duration-300 ease-out'
              : 'flex min-h-0 flex-1 flex-col'}
            style={compact ? { height: sheetOpen ? SHEET_PANEL : 0 } : undefined}
          >
          <div className={compact ? 'h-full overflow-y-auto p-4' : 'min-h-0 flex-1 overflow-y-auto p-5'}>
            {error && (
              <div className="mb-4 rounded-xl bg-error/10 px-4 py-3 text-[12.5px] text-error">{error}</div>
            )}

            {!tabUnlocked ? (
              <LockedPanel />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* ---- تعديل مباشر ---- */}
                  {/* flex عشان نقدر نقدّم لوحة العنصر المختار على الشرح
                      في وضع الموبايل (order) من غير ما نكرر الكود */}
                  {tab === 'inline' && (
                    <div className="flex flex-col">
                      {/* ===== لوحة تعديل فورم تأكيد الحضور ===== */}
                      {rsvpOpen && (
                        <div className="mb-5 rounded-2xl border border-emerald/40 bg-emerald/[0.05] p-4">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink">
                              <Check size={14} className="text-emerald" /> تعديل فورم تأكيد الحضور
                            </span>
                            <button type="button" onClick={() => setRsvpOpen(false)} className="text-[12px] font-bold text-ink-dim hover:text-ink">✕</button>
                          </div>
                          <p className="mb-3 text-[11.5px] text-ink-dim">
                            غيّر أي كلام في الفورم زي ما تحب — المدخلات نفسها بتفضل شغّالة وموصّلة بلوحتك، والردود بتوصلك عادي.
                          </p>
                          <div className="space-y-2.5">
                            {[
                              ['title', 'عنوان الفورم'],
                              ['nameLabel', 'عنوان خانة الاسم'],
                              ['comeLabel', 'سؤال "هتحضر؟"'],
                              ['yesLabel', 'كلمة "نعم"'],
                              ['noLabel', 'كلمة "لا"'],
                              ['foodLabel', 'عنوان خانة ملاحظات الأكل'],
                              ['submit', 'كلمة زرار الإرسال'],
                              ['intro', 'الكلام التمهيدي (بعض القوالب)'],
                              ['deadline', 'ملاحظة آخر ميعاد (بعض القوالب)'],
                              ['button', 'كلمة زرار فتح الفورم (بعض القوالب)'],
                            ].map(([key, label]) => (
                              <label key={key} className="block">
                                <span className="mb-1 block text-[11.5px] font-bold text-ink-dim">{label}</span>
                                <input
                                  type="text"
                                  value={draft.rsvp?.[key] || ''}
                                  onChange={(e) => setRsvpField(key, e.target.value)}
                                  placeholder="النص الافتراضي"
                                  className="w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink focus:border-emerald focus:outline-none"
                                />
                              </label>
                            ))}
                          </div>

                          {/* شيل مدخلات — خانة ملاحظات الأكل اختيارية، ينفع تتشال
                              من غير ما تكسر الفورم. خانة الاسم و"هتحضر؟" أساسيتين
                              للرد فبيفضلوا. */}
                          <label className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2">
                            <input
                              type="checkbox"
                              checked={!!draft.rsvp?.hideFood}
                              onChange={(e) => setRsvpField('hideFood', e.target.checked)}
                              className="h-4 w-4 accent-emerald"
                            />
                            <span className="text-[12.5px] font-bold text-ink">شيل خانة ملاحظات الأكل</span>
                          </label>

                          {/* صورة النموذج — إخفاء (لو موجودة في القالب) */}
                          <label className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2">
                            <input
                              type="checkbox"
                              checked={!!draft.rsvp?.hideImage}
                              onChange={(e) => setRsvpField('hideImage', e.target.checked)}
                              className="h-4 w-4 accent-emerald"
                            />
                            <span className="text-[12.5px] font-bold text-ink">اخفِ الصورة اللي فوق النموذج</span>
                          </label>

                          <button
                            type="button"
                            onClick={applyRsvp}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald px-4 py-2.5 text-[12.5px] font-bold text-ivory hover:brightness-110"
                          >
                            <Check size={13} /> طبّق وشوف
                          </button>
                        </div>
                      )}

                      <h2 className="mb-1.5 font-serif text-[16px] font-bold text-ink">{t('editor.inlineTitle')}</h2>
                      <p className="mb-4 text-[12.5px] text-ink-dim">{t('editor.inlineHint')}</p>

                      {/* شرح الأيقونتين بنفس شكلهم جوه الدعوة */}
                      <div className="space-y-2.5 rounded-2xl border border-line bg-ivory/60 p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-night text-brass-soft">
                            <Check size={14} />
                          </span>
                          <span className="text-[12.5px] text-ink">{t('editor.inlineEditIcon')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-night text-[#e88b7a]">
                            <Trash2 size={14} />
                          </span>
                          <span className="text-[12.5px] text-ink">{t('editor.inlineDeleteIcon')}</span>
                        </div>
                      </div>

                      {/* التلميح ده بيتكلم عن Enter و Esc — مالوش لازمة
                          على الموبايل، ومكانه في درج قصير غالي */}
                      {!compact && (
                        <p className="mt-3 rounded-xl bg-emerald/[0.07] px-4 py-3 text-[12px] text-ink-dim">
                          {t('editor.inlineTip')}
                        </p>
                      )}

                      {/* أضف نص جديد فوق التصميم */}
                      <button
                        type="button"
                        onClick={() => post('add-text', {})}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-rose/50 bg-rose/[0.04] py-3 text-[13px] font-bold text-rose transition hover:border-rose hover:bg-rose/[0.09]"
                      >
                        <TypeOutline size={15} /> {t('editor.addText')}
                      </button>
                      <p className="mt-2 text-center text-[11.5px] text-ink-dim">{t('editor.addTextHint')}</p>

                      {draft.added?.length > 0 && (
                        <p className="mt-1.5 text-center text-[11.5px] font-bold text-rose">
                          {t('editor.addedCount', { count: draft.added.length })}
                        </p>
                      )}

                      {/* ===== لوحة العنصر المختار ===== */}
                      {/* دي اللي شالت فورم البيانات: بتتغيّر حسب اللي
                          ضغطت عليه — مقاس لأي كلام، ونتيجة لو اللي
                          ضغطت عليه تاريخ (عشان العداد التنازلي يتبعه). */}
                      <AnimatePresence mode="wait">
                        {selected ? (
                          <motion.div
                            key={selected.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            // على الموبايل الدرج قصير — أدوات الجزء اللي
                            // العميل لسه ضاغط عليه لازم تبقى أول حاجة
                            // يشوفها، مش تحت أربع فقرات شرح
                            className={`rounded-2xl border border-rose/40 bg-rose/[0.04] p-4 ${
                              compact ? 'order-first mb-4' : 'mt-5'
                            }`}
                          >
                            <div className="mb-3 flex items-center gap-2">
                              <Sparkles size={13} className="text-rose" />
                              <span className="text-[12.5px] font-bold text-ink">{t('editor.selectedTitle')}</span>
                            </div>

                            <p className="mb-3 line-clamp-2 rounded-lg bg-card px-3 py-2 text-[12.5px] text-ink-dim">
                              {selected.text || '—'}
                            </p>

                            {/* العناصر المركّبة: الكتابة جواها بتدهس تركيبها */}
                            {selected.kind === 'rich' && (
                              <p className="mb-4 rounded-xl bg-brass/[0.10] px-3.5 py-2.5 text-[11.5px] text-[#7a5a1a]">
                                {t('editor.richHint')}
                              </p>
                            )}

                            {/* الباقة الأساسية: تعديل النص أيوه، تحريك لأ */}
                            {!has('drag') && (
                              <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-ink/[0.05] px-3.5 py-2.5 text-[11.5px] text-ink-dim">
                                <Lock size={11} className="mt-0.5 shrink-0" /> {t('editor.dragLocked')}
                              </p>
                            )}

                            {/* المكان: لينك خرائط جوجل */}
                            {selected.kind === 'map' && (
                              <div className="mb-4 rounded-xl border border-emerald/40 bg-emerald/[0.07] p-3">
                                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-emerald">
                                  <MapPin size={12} /> {t('editor.mapTitle')}
                                </div>
                                <MapField
                                  value={data.details?.venueMapQuery || ''}
                                  busy={textSaving}
                                  onSave={(v) => changeDetail({ venueMapQuery: v })}
                                />
                                <p className="mt-2 text-[11px] text-ink-dim">{t('editor.mapHint')}</p>
                              </div>
                            )}

                            {/* التاريخ: نتيجة مش خانة كتابة */}
                            {(selected.kind === 'live' || looksLikeDate(selected.text)) && data.details?.weddingDate && (
                              <div className="mb-4 rounded-xl border border-brass/40 bg-brass/[0.07] p-3">
                                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-[#7a5a1a]">
                                  <CalendarDays size={12} /> {t('editor.dateTitle')}
                                </div>
                                <input
                                  type="date"
                                  defaultValue={data.details.weddingDate}
                                  onChange={(e) => changeDetail({ weddingDate: e.target.value })}
                                  className="w-full rounded-lg border border-line bg-card px-3 py-2 text-[13px] text-ink focus:border-brass focus:outline-none"
                                />
                                <p className="mt-2 text-[11px] text-ink-dim">
                                  {selected.kind === 'live' ? t('editor.liveHint') : t('editor.dateHint')}
                                </p>
                              </div>
                            )}

                            {/* الوقت — أي عنصر فيه ساعة (زي "بدء الحفل 8:00 PM")
                                بيتفتحله منتقي وقت هنا في كل الباقات. بيعدّل نص
                                العنصر نفسه (تعديل نص عادي، مش ميزة باقة). */}
                            {(() => {
                              const tp = parseTime(selected.text);
                              if (!tp) return null;
                              const h12 = tp.hour % 12 || 12;
                              const pm = tp.period === 'pm';
                              const isAr = tp.arabicPeriodWord || tp.periodRaw === 'ص' || tp.periodRaw === 'م';
                              const hours = tp.is24h
                                ? Array.from({ length: 24 }, (_, i) => i)
                                : Array.from({ length: 12 }, (_, i) => i + 1);
                              const mins = Array.from({ length: 60 }, (_, i) => i);
                              const h24from = (hv) => (tp.is24h ? hv : ((hv % 12) + (pm ? 12 : 0)));
                              return (
                                <div className="mb-4 rounded-xl border border-brass/40 bg-brass/[0.07] p-3">
                                  <div className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-[#7a5a1a]">
                                    <Clock size={12} /> {t('editor.timeTitle')}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={tp.is24h ? tp.hour : h12}
                                      onChange={(e) => applyTime(h24from(Number(e.target.value)), tp.minute)}
                                      className="rounded-lg border border-line bg-card px-2.5 py-2 text-[14px] font-bold text-ink focus:border-brass focus:outline-none"
                                    >
                                      {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <span className="text-[15px] font-bold text-ink-dim">:</span>
                                    <select
                                      value={tp.minute}
                                      onChange={(e) => applyTime(tp.is24h ? tp.hour : ((h12 % 12) + (pm ? 12 : 0)), Number(e.target.value))}
                                      className="rounded-lg border border-line bg-card px-2.5 py-2 text-[14px] font-bold text-ink focus:border-brass focus:outline-none"
                                    >
                                      {mins.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                                    </select>
                                    {!tp.is24h && (
                                      <div className="flex overflow-hidden rounded-lg border border-line">
                                        <button
                                          type="button"
                                          onClick={() => applyTime(h12 % 12, tp.minute)}
                                          className={`px-2.5 py-2 text-[12.5px] font-bold ${!pm ? 'bg-brass text-[#241608]' : 'bg-card text-ink-dim'}`}
                                        >
                                          {isAr ? 'ص' : 'AM'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => applyTime((h12 % 12) + 12, tp.minute)}
                                          className={`px-2.5 py-2 text-[12.5px] font-bold ${pm ? 'bg-brass text-[#241608]' : 'bg-card text-ink-dim'}`}
                                        >
                                          {isAr ? 'م' : 'PM'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="mt-2 text-[11px] text-ink-dim">{t('editor.timeHint')}</p>
                                </div>
                              );
                            })()}

                            {/* اللون — لون الخط للكلام، ولون الخلفية
                                للمربعات الفاضية (زي مربعات الزي المقترح) */}
                            {selected.bgColor && (
                              <div className="mb-4 rounded-xl border border-line bg-card p-3">
                                <div className="mb-2.5 flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink">
                                    <Palette size={13} /> {t('editor.colorTitle')}
                                  </span>
                                  {!has('colors') && <Lock size={11} className="text-ink-dim" />}
                                </div>
                                {has('colors') ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={draft.colors?.[selected.id] || selected.bgColor}
                                      onChange={(e) => setColor(e.target.value)}
                                      className="h-9 w-14 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
                                    />
                                    <span className="font-mono text-[12px] text-ink-dim">
                                      {(draft.colors?.[selected.id] || selected.bgColor).toUpperCase()}
                                    </span>
                                    {draft.colors?.[selected.id] && (
                                      <button
                                        type="button"
                                        onClick={() => setColor(null)}
                                        className="ms-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-ink-dim hover:text-rose"
                                      >
                                        <RotateCcw size={11} /> {t('editor.colorReset')}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-[11.5px] text-ink-dim">{t('editor.colorLocked')}</p>
                                )}
                              </div>
                            )}

                            {/* الميل — أي عنصر ينفع يتمايل شوية، والصور
                                بالذات (صورة البولارويد في القالب
                                الملكي مثلاً بتبقى شكلها أحلى مايلة) */}
                            <div className="mb-4 rounded-xl border border-line bg-card p-3">
                              <div className="mb-2.5 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink">
                                  <RotateCw size={13} /> {t('editor.rotateTitle')}
                                </span>
                                <span className="font-mono text-[12px] text-ink-dim">
                                  {Math.round(selected.rotation || 0)}°
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-45"
                                max="45"
                                step="1"
                                value={Math.round(selected.rotation || 0)}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-rose"
                              />
                              {draft.rotations?.[selected.id] !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => setRotation(null)}
                                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-dim hover:text-rose"
                                >
                                  <RotateCcw size={11} /> {t('editor.rotateReset')}
                                </button>
                              )}
                            </div>

                            {/* يوم في نتيجة الشهر — الضغط عليه علّمه */}
                            {selected.calDay > 0 && (
                              <p className="mb-4 rounded-xl bg-emerald/[0.08] px-3.5 py-2.5 text-[11.5px] text-emerald">
                                {t('editor.calDayHint', { day: selected.calDay })}
                              </p>
                            )}

                            {/* تكبير/تصغير الصورة — سلايدر + سحب الأركان،
                                متاح في أي باقة */}
                            {(selected.kind === 'image' || selected.kind === 'video') && (
                              <div className="mb-4 rounded-xl border border-line bg-card p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink">
                                    <Maximize2 size={13} /> {t('editor.resizeTitle')}
                                  </span>
                                  <span className="font-mono text-[12px] text-ink-dim">
                                    {Math.round((selected.scale || 1) * 100)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setScale(Math.max(0.2, Math.round(((selected.scale || 1) - 0.1) * 100) / 100))}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:border-rose hover:text-rose"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <input
                                    type="range"
                                    min="20"
                                    max="300"
                                    step="5"
                                    value={Math.round((selected.scale || 1) * 100)}
                                    onChange={(e) => setScale(Number(e.target.value) / 100)}
                                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-rose"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setScale(Math.min(3, Math.round(((selected.scale || 1) + 0.1) * 100) / 100))}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:border-rose hover:text-rose"
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>
                                <p className="mt-2 text-[11px] text-ink-dim">{t('editor.resizeHint')}</p>
                                {draft.scales?.[selected.id] && draft.scales[selected.id] !== 1 && (
                                  <button
                                    type="button"
                                    onClick={resetScale}
                                    className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-dim hover:text-rose"
                                  >
                                    <RotateCcw size={11} /> {t('editor.resizeReset')}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* مقاس الخط */}
                            {selected.kind !== 'image' && selected.kind !== 'video' && (
                              <>
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink">
                                    <ALargeSmall size={13} /> {t('editor.sizeTitle')}
                                  </span>
                                  <span className="font-mono text-[12px] text-ink-dim">{selected.fontSize}px</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSize(Math.max(8, (selected.fontSize || 16) - 1))}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:border-rose hover:text-rose"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <input
                                    type="range"
                                    min="8"
                                    max="120"
                                    value={selected.fontSize || 16}
                                    onChange={(e) => setSize(Number(e.target.value))}
                                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-rose"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSize(Math.min(200, (selected.fontSize || 16) + 1))}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink hover:border-rose hover:text-rose"
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>

                                {draft.sizes[selected.id] && (
                                  <button
                                    type="button"
                                    onClick={() => setSize(null)}
                                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-dim hover:text-rose"
                                  >
                                    <RotateCcw size={11} /> {t('editor.sizeReset')}
                                  </button>
                                )}
                              </>
                            )}
                          </motion.div>
                        ) : (
                          <p className="mt-5 rounded-2xl border border-dashed border-line px-4 py-5 text-center text-[12px] text-ink-dim">
                            {t('editor.selectedNone')}
                          </p>
                        )}
                      </AnimatePresence>

                      {/* المحذوفات — لازم يكون فيه طريق رجوع واضح */}
                      <div className="mt-5">
                        <h3 className="mb-2 text-[12.5px] font-bold text-ink">
                          {t('editor.hiddenTitle')} ({draft.hidden.length})
                        </h3>
                        {draft.hidden.length === 0 ? (
                          <p className="text-[12px] text-ink-dim">{t('editor.hiddenEmpty')}</p>
                        ) : (
                          <div className="space-y-1.5">
                            {draft.hidden.map((id) => (
                              <div
                                key={id}
                                className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2"
                              >
                                <span className="truncate font-mono text-[11px] text-ink-dim">{id}</span>
                                <button
                                  type="button"
                                  onClick={() => restoreHidden(id)}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[11.5px] font-bold text-ink hover:border-emerald hover:text-emerald"
                                >
                                  <Undo2 size={11} /> {t('editor.restore')}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* رجّع الدعوة لأصلها — يمسح كل التخصيصات ويبدأ من جديد */}
                      <div className="mt-6 border-t border-line pt-4">
                        <button
                          type="button"
                          onClick={resetAll}
                          disabled={resetting}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-error/40 py-2.5 text-[12.5px] font-bold text-error transition hover:bg-error/[0.06] disabled:opacity-50"
                        >
                          <RotateCcw size={13} /> {t('editor.resetAll')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---- الخط ---- */}
                  {tab === 'font' && (
                    <>
                      <h2 className="mb-1.5 font-serif text-[16px] font-bold text-ink">{t('editor.fontTitle')}</h2>
                      <p className="mb-4 text-[12.5px] text-ink-dim">{t('editor.fontHint')}</p>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => chooseFont('')}
                          className={`w-full rounded-xl border px-4 py-3 text-start text-[13px] ${
                            !draft.fontFamily ? 'border-rose bg-rose/5 font-bold text-ink' : 'border-line text-ink-dim hover:border-ink/25'
                          }`}
                        >
                          {t('editor.fontNone')}
                        </button>
                        {(data.fonts || []).map((font) => (
                          <button
                            key={font}
                            type="button"
                            onClick={() => chooseFont(font)}
                            style={{ fontFamily: `'${font}', serif` }}
                            className={`w-full rounded-xl border px-4 py-3 text-start text-[15px] ${
                              draft.fontFamily === font
                                ? 'border-rose bg-rose/5 text-ink'
                                : 'border-line text-ink hover:border-ink/25'
                            }`}
                          >
                            {font} — أحمد و سارة
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ---- الصور ---- */}
                  {tab === 'photos' && (
                    <>
                      <h2 className="mb-1.5 font-serif text-[16px] font-bold text-ink">{t('editor.photosTitle')}</h2>
                      <p className="mb-4 text-[12.5px] text-ink-dim">{t('editor.photosHint')}</p>

                      <div
                        className={`rounded-xl border px-4 py-3 text-[12.5px] ${
                          pickedImage ? 'border-rose/50 bg-rose/5 font-bold text-ink' : 'border-dashed border-line text-ink-dim'
                        }`}
                      >
                        {pickedImage ? t('editor.photosSelected') : t('editor.photosPick')}
                      </div>

                      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageFile} hidden />
                      <button
                        type="button"
                        disabled={!pickedImage || uploadingImage}
                        onClick={() => imageInputRef.current?.click()}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-night px-5 py-3 text-[13px] font-bold text-ivory hover:bg-emerald disabled:opacity-40"
                      >
                        {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploadingImage ? t('editor.photoUploading') : t('editor.photoUpload')}
                      </button>

                      {/* ختم الغلاف — بدّله بختم أي تصميم تاني */}
                      {data.seals?.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-line bg-ivory/60 p-4">
                          <h3 className="mb-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                            <Stamp size={13} /> {t('editor.sealTitle')}
                          </h3>
                          <p className="mb-3 text-[11.5px] text-ink-dim">{t('editor.sealHint')}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {data.seals.map((seal) => {
                              const active = draft.images?.[data.sealElemId] === seal.url;
                              return (
                                <button
                                  key={seal.id}
                                  type="button"
                                  onClick={() => chooseSeal(seal.url)}
                                  title={seal.label.ar}
                                  className={`rounded-xl border p-2 transition ${
                                    active ? 'border-rose bg-rose/[0.07]' : 'border-line hover:border-ink/25'
                                  }`}
                                >
                                  <img src={seal.url} alt={seal.label.ar} className="aspect-square w-full object-contain" />
                                  <span className="mt-1 block truncate text-[10px] text-ink-dim">{seal.label.ar}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ===== كل صور الدعوة مرقّمة ===== */}
                      {/* ده اللي بيحل مشكلة الألبوم: صوره بتبان واحدة
                          واحدة في شريط متحرّك، فالعميل مش شايف إن فيه
                          8 صور ولا قادر يمسك واحدة. هنا كلهم قدامه
                          مرقّمين — يضغط على رقم يغيّره، أو يشيله. */}
                      {photos.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                            <ImageIcon size={13} /> {t('editor.allPhotos', { count: photos.length })}
                          </h3>
                          <p className="mb-3 text-[11.5px] text-ink-dim">{t('editor.allPhotosHint')}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {photos.map((ph, i) => (
                              <div
                                key={ph.id}
                                className={`group relative overflow-hidden rounded-xl border transition ${
                                  pickedImage === ph.id ? 'border-rose ring-2 ring-rose/30' : 'border-line'
                                } ${ph.hidden ? 'opacity-40' : ''}`}
                              >
                                <img
                                  src={draft.images?.[ph.id] || ph.src}
                                  alt=""
                                  className="aspect-square w-full object-cover"
                                />
                                <span className="absolute start-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-night/85 px-1 text-[10px] font-bold text-ivory">
                                  {i + 1}
                                </span>

                                <div className="absolute inset-x-0 bottom-0 flex">
                                  <button
                                    type="button"
                                    onClick={() => pickPhoto(ph.id)}
                                    title={t('editor.photoChange')}
                                    className="flex flex-1 items-center justify-center gap-1 bg-night/85 py-1.5 text-[10.5px] font-bold text-ivory hover:bg-night"
                                  >
                                    <Upload size={11} /> {t('editor.photoChange')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => (ph.hidden ? restoreHidden(ph.id) : hidePhoto(ph.id))}
                                    title={ph.hidden ? t('editor.restore') : t('editor.photoRemove')}
                                    className="flex items-center justify-center bg-night/85 px-2 py-1.5 text-ivory hover:bg-error/80"
                                  >
                                    {ph.hidden ? <Undo2 size={11} /> : <Trash2 size={11} />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ---- الموسيقى ---- */}
                  {tab === 'music' && (
                    <MusicPanel
                      audioUrl={draft.audioUrl}
                      audioStart={draft.audioStart || 0}
                      audioEnd={draft.audioEnd || 0}
                      uploading={uploadingAudio}
                      onPick={pickTrack}
                      onTrim={setTrim}
                      onUpload={onAudioFile}
                    />
                  )}

                  {/* ---- كارت المشاركة ---- */}
                  {tab === 'share' && (
                    <SharePanel
                      share={draft.share || {}}
                      defaults={data.shareDefaults || {}}
                      canImages={has('images')}
                      uploading={uploadingImage}
                      onUploadImage={onShareImage}
                      onChange={(next) => {
                        remember();
                        setDraft((d) => ({ ...d, share: next }));
                        setDirty(true);
                      }}
                    />
                  )}

                  {/* ---- تحريك النص ---- */}
                  {tab === 'layout' && (
                    <>
                      <h2 className="mb-1.5 font-serif text-[16px] font-bold text-ink">{t('editor.layoutTitle')}</h2>
                      <p className="mb-4 text-[12.5px] text-ink-dim">{t('editor.layoutHint')}</p>

                      <div className="rounded-xl border border-line bg-ivory/60 p-4">
                        <p className="mb-3 text-[12.5px] text-ink-dim">
                          {selected ? t('editor.layoutSelected', { text: selected.text }) : t('editor.layoutNone')}
                        </p>

                        {/* لوحة الأسهم */}
                        <div className="mx-auto grid w-[132px] grid-cols-3 gap-1.5">
                          <span />
                          <button type="button" disabled={!selected} onClick={() => nudge(0, -2)} className="rounded-lg border border-line bg-card py-2 hover:border-rose disabled:opacity-40">
                            <ChevronUp size={14} className="mx-auto" />
                          </button>
                          <span />
                          <button type="button" disabled={!selected} onClick={() => nudge(-2, 0)} className="rounded-lg border border-line bg-card py-2 hover:border-rose disabled:opacity-40">
                            <ChevronLeft size={14} className="mx-auto" />
                          </button>
                          <button type="button" disabled={!selected} onClick={() => nudge(0, 0)} className="rounded-lg border border-line bg-card py-2 text-[10px] text-ink-dim disabled:opacity-40">
                            {selected ? `${Math.round(draft.offsets[selected.id]?.dx || 0)},${Math.round(draft.offsets[selected.id]?.dy || 0)}` : '0,0'}
                          </button>
                          <button type="button" disabled={!selected} onClick={() => nudge(2, 0)} className="rounded-lg border border-line bg-card py-2 hover:border-rose disabled:opacity-40">
                            <ChevronRight size={14} className="mx-auto" />
                          </button>
                          <span />
                          <button type="button" disabled={!selected} onClick={() => nudge(0, 2)} className="rounded-lg border border-line bg-card py-2 hover:border-rose disabled:opacity-40">
                            <ChevronDown size={14} className="mx-auto" />
                          </button>
                          <span />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={resetOffsets}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-[12.5px] font-bold text-ink-dim hover:border-error hover:text-error"
                      >
                        <RotateCcw size={13} /> {t('editor.layoutReset')}
                      </button>
                    </>
                  )}

                  {/* ---- أقسام الدعوة ---- */}
                  {tab === 'sections' && (
                    <>
                      <h2 className="mb-1.5 font-serif text-[16px] font-bold text-ink">
                        {t('editor.sectionsTitle')}
                      </h2>
                      <p className="mb-4 text-[12.5px] text-ink-dim">{t('editor.sectionsHint')}</p>

                      {!has('sections') ? (
                        <LockedPanel />
                      ) : optionalSections.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-[12px] text-ink-dim">
                          {t('editor.sectionsEmpty')}
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {optionalSections.map(({ key, label }) => {
                            const off = hiddenSections.includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={sectionsBusy}
                                onClick={() => toggleSection(key)}
                                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition disabled:opacity-50 ${
                                  off
                                    ? 'border-line bg-ivory/50'
                                    : 'border-emerald/35 bg-emerald/[0.06]'
                                }`}
                              >
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    off ? 'bg-ink/[0.06] text-ink-dim' : 'bg-emerald/15 text-emerald'
                                  }`}
                                >
                                  {off ? <EyeOff size={14} /> : <Eye size={14} />}
                                </span>
                                <span className={`flex-1 text-[13px] ${off ? 'text-ink-dim line-through' : 'font-bold text-ink'}`}>
                                  {label}
                                </span>
                                <span className={`text-[11px] font-bold ${off ? 'text-ink-dim' : 'text-emerald'}`}>
                                  {off ? t('editor.sectionOff') : t('editor.sectionOn')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {has('sections') && optionalSections.length > 0 && (
                        <p className="mt-3 rounded-xl bg-brass/[0.10] px-3.5 py-2.5 text-[11.5px] text-[#7a5a1a]">
                          {t('editor.sectionsNote')}
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          </div>

          {/* عدّاد العناصر على الديسكتوب بس — على الموبايل كل بكسل محسوب */}
          {counts && !compact && (
            <div className="shrink-0 border-t border-line px-5 py-3 text-[11.5px] text-ink-dim">
              {t('editor.elementsFound', { texts: counts.texts, images: counts.images })}
            </div>
          )}
        </aside>

        {/* ===== المعاينة ===== */}
        <main
          className={`flex min-w-0 flex-1 flex-col items-center overflow-auto bg-[repeating-linear-gradient(45deg,#0000_0_10px,#00000005_10px_20px)] ${
            compact ? 'p-2.5' : 'p-5'
          }`}
          // بنسيب مساحة الجزء الظاهر من الدرج بس — الدرج وهو مفتوح بيعدّي
          // فوق الدعوة، فالمقاس مابيتغيّرش وإحنا بنفتح ونقفل
          style={compact && !playing ? { paddingBottom: peekH } : undefined}
        >
          {playing && (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-1.5 text-[12px] font-bold text-brass-soft">
              <PlayCircle size={12} /> {t('editor.playingHint')}
            </p>
          )}

          {playing ? (
            // ===== وضع التشغيل: تليفون واحد كبير =====
            // زي ما الضيف بيشوفها بالظبط — الغلاف ثم الدعوة.
            <PhoneMock compact={compact} device={device}>
              <iframe
                key={`play-${frameKey}`}
                ref={playFrameRef}
                title={t('editor.title')}
                src={`/i/${shortId}`}
                className="h-full w-full border-0"
              />
            </PhoneMock>
          ) : (
            // ===== وضع التحرير: تليفونين جنب بعض =====
            // يسار = الغلاف (ثابت) — لتعديل شاشة الظرف.
            // يمين = الدعوة من جوه — لتعديل باقي الشاشات.
            // العميل بيعدّل على أي واحد فيهم والاتنين بيتعدّلوا مع بعض
            // (نفس draft، بنبعت الرسائل للاثنين).
            <div
              className={`flex w-full flex-1 items-start justify-center ${
                compact ? 'flex-col gap-3' : 'flex-row gap-6'
              }`}
            >
              <PhoneMock label={t('editor.stageCover')} compact={compact} device={device}>
                <iframe
                  key={`edit-cover-${frameKey}`}
                  ref={coverFrameRef}
                  title={t('editor.stageCover')}
                  src={`/i/${shortId}?edit=1&stage=cover`}
                  className="h-full w-full border-0"
                />
              </PhoneMock>
              <PhoneMock label={t('editor.stageInside')} compact={compact} device={device}>
                <iframe
                  key={`edit-inside-${frameKey}`}
                  ref={insideFrameRef}
                  title={t('editor.stageInside')}
                  src={`/i/${shortId}?edit=1&stage=inside`}
                  className="h-full w-full border-0"
                />
              </PhoneMock>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
