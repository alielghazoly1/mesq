import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Heart } from 'lucide-react';
import { useGetTemplatesQuery } from '../store/api.js';
import TemplateCard from './TemplateCard.jsx';
import { PREVIEW_FROM_KEY } from '../lib/homeScroll.js';

// المعرض قسمين (بطلب المالك): دعوات الفرح — هي اللي بتفتح لأي حد — وهدايا عيد الميلاد
// في تاب لوحدها. القسم بييجي من السيرفر (template.category).
const CATS = ['wedding', 'birthday'];
const catOf = (tpl) => (CATS.includes(tpl.category) ? tpl.category : 'wedding');

// أول فتحة: لينك فيه ?cat=birthday، أو لينك على كارت هدية (/#tpl-birthday-gift)،
// أو راجع من معاينة هدية — ساعتها نفتح قسم الهدايا عشان الكارت يبقى موجود في الصفحة
function wantedTemplateId() {
  try {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('tpl-')) return hash.slice(4);
    const back = JSON.parse(sessionStorage.getItem(PREVIEW_FROM_KEY) || 'null');
    return back && back.id ? back.id : null;
  } catch { return null; }
}
function catFromUrl() {
  try {
    const c = new URLSearchParams(window.location.search).get('cat');
    return CATS.includes(c) ? c : null;
  } catch { return null; }
}

export default function TemplateGallery() {
  const { t, i18n } = useTranslation();
  // بنبعت اللغة للسيرفر عشان أسماء ووصف التصاميم ترجع باللغة المختارة
  const { data: templates, isLoading, isError } = useGetTemplatesQuery(i18n.language);
  const [picked, setPicked] = useState(catFromUrl);
  const [wantId] = useState(wantedTemplateId);

  const hasBirthday = useMemo(() => !!templates && templates.some((x) => catOf(x) === 'birthday'), [templates]);
  const cat = useMemo(() => {
    if (!hasBirthday) return 'wedding';
    if (picked) return picked;
    const wanted = wantId && templates.find((x) => x.id === wantId);
    return wanted ? catOf(wanted) : 'wedding';
  }, [hasBirthday, picked, wantId, templates]);
  const shown = useMemo(() => (templates || []).filter((x) => catOf(x) === cat), [templates, cat]);

  return (
    <div className="mx-auto max-w-6xl scroll-mt-4 px-3.5 pb-[56px] pt-7 sm:px-6 sm:pb-[70px] sm:pt-10" id="gallery">
      {/* العنوان بس — من غير كلام زيادة (بطلب المالك) */}
      <h2 className="mx-auto mb-5 max-w-[58ch] text-center font-serif text-[clamp(26px,3.8vw,42px)] font-bold italic text-ink sm:mb-8">
        {t(cat === 'birthday' ? 'gallery.titleBirthday' : 'gallery.title')}
      </h2>

      {hasBirthday && (
        <div className="-mt-1 mb-5 flex justify-center sm:mb-8" role="tablist" data-gallery-tabs>
          <div className="inline-flex max-w-full gap-1 rounded-full border border-line bg-card p-1 shadow-[0_8px_22px_-18px_rgba(8,19,15,.7)]">
            {CATS.map((c) => {
              const on = c === cat;
              const Icon = c === 'birthday' ? Gift : Heart;
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-cat={c}
                  onClick={() => setPicked(c)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-bold transition sm:px-5 sm:py-2.5 sm:text-[14px] ${
                    on ? 'bg-night text-ivory' : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  {t(c === 'birthday' ? 'gallery.tabBirthday' : 'gallery.tabWedding')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cat === 'birthday' && (
        <p className="mx-auto -mt-2 mb-5 max-w-[46ch] text-center text-[13px] leading-relaxed text-ink-dim sm:mb-8 sm:text-[14.5px]">
          {t('gallery.subBirthday')}
        </p>
      )}

      {isLoading && <p className="py-5 text-center text-ink-dim">{t('gallery.loading')}</p>}
      {isError && <p className="py-5 text-center text-ink-dim">{t('gallery.error')}</p>}
      {templates && shown.length === 0 && (
        <p className="py-5 text-center text-ink-dim">{t('gallery.empty')}</p>
      )}

      {shown.length > 0 && (
        // اتنين جنب بعض على الموبايل (الزائر يقارن تصميمين في نفس النظرة)،
        // وتلاتة من التابلت وطالع. قسم فيه تصميم واحد (الهدايا): الكارت في النص.
        <div className={shown.length === 1
          ? 'mx-auto grid max-w-[220px] grid-cols-1 sm:max-w-[340px]'
          : 'grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:gap-8'}
        >
          {shown.map((tpl, i) => (
            <TemplateCard key={tpl.id} template={tpl} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
