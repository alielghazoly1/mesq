import { useTranslation } from 'react-i18next';
import { useGetTemplatesQuery } from '../store/api.js';
import TemplateCard from './TemplateCard.jsx';

export default function TemplateGallery() {
  const { t, i18n } = useTranslation();
  // بنبعت اللغة للسيرفر عشان أسماء ووصف التصاميم ترجع باللغة المختارة
  const { data: templates, isLoading, isError } = useGetTemplatesQuery(i18n.language);

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-[56px] sm:px-6 sm:py-[70px]" id="gallery">
      <div className="mx-auto mb-11 max-w-[58ch] text-center">
        <div className="mb-3 text-[12.5px] font-extrabold tracking-[0.3em] text-emerald uppercase">
          {t('gallery.eyebrow')}
        </div>
        <h2 className="mb-3 font-serif text-[clamp(28px,3.8vw,42px)] font-bold italic text-ink">
          {t('gallery.title')}
        </h2>
        <p className="text-[15.5px] text-ink-dim">{t('gallery.subtitle')}</p>
      </div>

      {isLoading && <p className="py-5 text-center text-ink-dim">{t('gallery.loading')}</p>}
      {isError && <p className="py-5 text-center text-ink-dim">{t('gallery.error')}</p>}
      {templates && templates.length === 0 && (
        <p className="py-5 text-center text-ink-dim">{t('gallery.empty')}</p>
      )}

      {templates && templates.length > 0 && (
        // اتنين جنب بعض على الموبايل (الزائر يقارن تصميمين في نفس النظرة)،
        // وتلاتة من التابلت وطالع
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {templates.map((tpl, i) => (
            <TemplateCard key={tpl.id} template={tpl} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
