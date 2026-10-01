import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Wand2, Loader2, Eye, Crown } from 'lucide-react';
import { useGetMeQuery, useCreateDraftMutation } from '../store/api.js';
import { isEditOpen } from '../lib/editWindow.js';
import DesignLanguagePicker from './DesignLanguagePicker.jsx';

// كارت تصميم في المعرض.
//
// على الموبايل الكروت بتبقى اتنين جنب بعض (TemplateGallery) — فالكارت
// كله متظبط للعرض الصغير ده: تليفون أصغر، عنوان أصغر، وصف سطرين، والزرارين
// تحت بعض. من التابلت وطالع بيرجع لمقاساته المريحة.
export default function TemplateCard({ template, index }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data } = useGetMeQuery();
  const [createDraft, { isLoading: startingEditor }] = useCreateDraftMutation();
  const [imgError, setImgError] = useState(false);
  const [startError, setStartError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  // العميل المشترك عنده رصيد ← بيروح المحرر على طول، مش لفورم الإنشاء
  // المجاني. ده أوضح فرق بيحسه بعد ما يدفع.
  const sub = data?.user?.subscription;
  // مدة التعديل الخالصة زي الرصيد الخالص: مفيش إنشاء لحد ما يجدّد
  // (السيرفر هو اللي بيحكم، والواجهة بس بتوفّر عليه طريق مسدود)
  const subscribed = !!sub && !!sub.packageId && sub.status !== 'suspended'
    && (sub.invitationsLeft || 0) > 0 && isEditOpen(data?.user);

  // دفع وعنده باقة شغالة (حتى لو رصيده خلص) — شريط "للمشتركين" مبيظهرلوش
  const paid = !!sub && !!sub.packageId && sub.status !== 'suspended';

  // التصميم المدفوع مقفول على أي حد مش مشترك — مش على غير المسجّلين بس.
  // المعاينة بتفضل مفتوحة للكل (السيرفر كمان: /preview-sample مفتوح).
  const locked = !!template.isPremium && !subscribed;
  // التصميم ليه نسختين لغة؟ العميل بيختار قبل ما المسودة تتعمل
  const hasLanguages = Array.isArray(template.designLanguages) && template.designLanguages.length > 1;

  async function startDraft(language) {
    setStartError('');
    try {
      const res = await createDraft({ templateId: template.id, ...(language ? { language } : {}) }).unwrap();
      navigate(`/editor/${res.shortId}`);
    } catch (err) {
      // لو حصل أي مانع (رصيد خلص، مسودات كتير مفتوحة) بنقوله السبب
      // ونسيبه يكمّل بالطريق العادي بدل ما نوقفه.
      setStartError(err?.data?.error || t('create.genericError'));
    }
  }

  function useTemplate() {
    if (!subscribed) {
      navigate(`/create/${template.id}`);
      return;
    }
    if (hasLanguages) { setStartError(''); setPickerOpen(true); return; }
    startDraft(null);
  }

  return (
    <motion.div
      className={`relative flex flex-col overflow-hidden rounded-[18px] border bg-card transition-shadow hover:shadow-2xl hover:shadow-ink/10 sm:rounded-[22px] ${
        template.isNew ? 'border-rose/40 shadow-[0_18px_40px_-26px_rgba(185,80,106,.7)]' : 'border-line'
      }`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.06 }}
      whileHover={{ y: -6 }}
    >
      {/* شريط أحمر مايل على ركن الكارت — اللي لسه مدفعش يعرف من نظرة إن
          التصميم ده للمشتركين. العميل اللي دفع خلاص مبيشوفوش: هو مشترك
          أصلًا، والتصميم متاح له */}
      {template.isPremium && !paid && (
        <div className="pointer-events-none absolute -end-10 top-4 z-10 w-36 rotate-45 bg-gradient-to-l from-[#a01020] to-[#e0142c] py-1 text-center text-[9px] font-extrabold tracking-wide text-white shadow-[0_6px_16px_-6px_rgba(160,16,32,.8)] sm:-end-12 sm:top-6 sm:w-44 sm:py-1.5 sm:text-[11px]">
          {t('gallery.premiumRibbon')}
        </div>
      )}

      {/* شارة "جديد" — المالك بيحطها ويشيلها من لوحة التحكم */}
      {template.isNew && (
        <span className="new-badge absolute start-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold tracking-[0.08em] text-white shadow-[0_8px_18px_-8px_rgba(185,80,106,.9)] sm:start-4 sm:top-4 sm:px-3 sm:text-[11.5px]">
          <Sparkles size={11} className="shrink-0" /> {t('gallery.newBadge')}
        </span>
      )}

      <div className="flex justify-center bg-gradient-to-b from-emerald/[0.06] to-transparent px-3 pt-5 sm:px-7 sm:pt-7">
        <div className="relative aspect-[9/17] w-[74%] overflow-hidden rounded-[18px] border-[4px] border-[#050b08] bg-[#050b08] shadow-[0_16px_30px_-18px_rgba(8,19,15,.8)] sm:w-[62%] sm:rounded-[26px] sm:border-[6px]">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night to-[#16281f] p-3 text-center font-serif text-[13px] italic text-brass-soft">
              {template.name}
            </div>
          ) : (
            <img
              src={`/img/template-thumbs/${template.id}.jpg`}
              alt={`معاينة تصميم ${template.name}`}
              loading="lazy"
              className="h-full w-full object-cover object-top"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3.5 pt-3.5 text-center sm:gap-3.5 sm:px-6 sm:py-6">
        <h3 className="flex items-center justify-center gap-2 font-serif text-[16px] font-bold italic leading-tight text-ink sm:text-[23px]">
          {template.name}
          {template.isPremium && !paid && (
            <span className="hidden items-center gap-1 rounded-full bg-brass/15 px-2.5 py-0.5 text-[11px] font-bold not-italic text-brass sm:inline-flex">
              <Sparkles size={11} /> {t('gallery.premiumBadge')}
            </span>
          )}
        </h3>
        <p className="line-clamp-2 flex-1 text-[11.5px] leading-relaxed text-ink-dim sm:line-clamp-none sm:text-[13.5px]">
          {template.description}
        </p>

        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
          {/* المعاينة مفتوحة زي أي تصميم — العميل لازم يشوف اللي هيدفع فيه.
              المقفول هو الاستخدام بس. */}
          <a
            href={`/preview-sample/${template.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line px-2.5 py-2 text-[11.5px] font-bold leading-tight text-ink-dim transition hover:border-brass/50 hover:text-ink sm:px-3.5 sm:py-2.5 sm:text-[12.5px]"
          >
            <Eye size={13} className="shrink-0" /> {t(locked ? 'gallery.lockedPreview' : 'gallery.preview')}
          </a>
          {locked ? (
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-brass to-brass-soft px-2.5 py-2 text-[11.5px] font-bold leading-tight text-[#3a2708] shadow-[0_4px_14px_-7px_rgba(184,137,43,.9)] transition hover:brightness-[1.04] sm:px-3.5 sm:py-2.5 sm:text-[12.5px]"
            >
              <Crown size={13} className="shrink-0" /> {t('gallery.lockedUse')}
            </button>
          ) : (
            <button
              type="button"
              onClick={useTemplate}
              disabled={startingEditor}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-[11.5px] font-bold leading-tight transition disabled:opacity-60 sm:px-3.5 sm:py-2.5 sm:text-[12.5px] ${
                subscribed
                  ? 'bg-gradient-to-l from-brass to-brass-soft text-[#3a2708] shadow-[0_4px_14px_-7px_rgba(184,137,43,.9)] hover:brightness-[1.04]'
                  : 'bg-night text-ivory hover:bg-emerald'
              }`}
            >
              {startingEditor && !pickerOpen ? (
                <Loader2 size={13} className="shrink-0 animate-spin" />
              ) : subscribed ? (
                <Wand2 size={13} className="shrink-0" />
              ) : null}
              {subscribed ? t('gallery.useWithEditor') : t('gallery.use')}
            </button>
          )}
        </div>

        {locked && <p className="hidden text-[11.5px] text-ink-dim sm:block">{t('gallery.lockedNote')}</p>}
        {startError && !pickerOpen && <p className="text-[12px] text-error">{startError}</p>}
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <DesignLanguagePicker
            template={template}
            busy={startingEditor}
            error={startError}
            onPick={(lang) => startDraft(lang)}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
