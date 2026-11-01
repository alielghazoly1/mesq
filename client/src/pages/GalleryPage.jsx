import { useEffect } from 'react';
import { startHomeScroll } from '../lib/homeScroll.js';
import Hero from '../components/Hero.jsx';
import TemplateGallery from '../components/TemplateGallery.jsx';
import { EditorDemoSection } from '../components/EditorDemo.jsx';
import PremiumSection from '../components/PremiumSection.jsx';
import CommissionBanner from '../components/CommissionBanner.jsx';
import HomeFaq from '../components/HomeFaq.jsx';
import { ReviewsStrip } from '../components/ReviewsTeaser.jsx';
import Footer from '../components/Footer.jsx';

export default function GalleryPage() {
  // الرجوع من معاينة / لينك فيه # / النزول الناعم لأول فتحة على الموبايل
  useEffect(() => startHomeScroll(), []);
  return (
    <div>
      <Hero />
      <TemplateGallery />
      {/* الفيديو بيجي بعد ما يشوف التصاميم بالظبط: هو ساعتها عجبه
          تصميم وبيسأل نفسه "طب أقدر أغيّر فيه؟" — الفيديو هو الإجابة،
          وبعده على طول قسم الباقات */}
      <EditorDemoSection />
      <PremiumSection />
      <CommissionBanner />
      {/* آراء العرسان قبل الأسئلة — آخر حاجة بيشوفها قبل ما يقرر */}
      <div className="bg-ivory px-4 pt-12 sm:px-6 sm:pt-16">
        <ReviewsStrip />
      </div>
      <HomeFaq />
      <Footer />
    </div>
  );
}
