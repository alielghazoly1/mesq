import { useTranslation } from 'react-i18next';
import { useGetTemplatesQuery } from '../store/api.js';
import TemplateCard from './TemplateCard.jsx';

export default function TemplateGallery() {
  const { t, i18n } = useTranslation();
  // بنبعت اللغة للسيرفر عشان أسماء ووصف التصاميم ترجع باللغة المختارة
  const { data: templates, isLoading, isError } = useGetTemplatesQuery(i18n.language);

  return (
    <div className="mx-auto max-w-6xl scroll-mt-4 px-3.5 pb-[56px] pt-7 sm:px-6 sm:pb-[70px] sm:pt-10" id="gallery">
      {/* العنوان بس — من غير كلام زيادة (بطلب المالك) */}
      <h2 className="mx-auto mb-5 max-w-[58ch] text-center font-serif text-[clamp(26px,3.8vw,42px)] font-bold italic text-ink sm:mb-8">
        {t('gallery.title')}
      </h2>

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
