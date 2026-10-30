// بيسجّل رحلة الزائر (lib/journey.js): كل صفحة بيفتحها في الموقع.
// وبيبلّغ بيكسل ميتا بنفس الصفحة وبالعميل المسجّل (lib/metaPixel.js). مابيعرضش حاجة.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startJourney, trackView } from '../lib/journey.js';
import { pixelPageView, pixelUser } from '../lib/metaPixel.js';
import { useGetMeQuery } from '../store/api.js';

export default function JourneyTracker() {
  const { pathname } = useLocation();
  const { data: me } = useGetMeQuery();
  const user = me?.user || null;
  useEffect(() => { startJourney(); }, []);
  // العميل الأول (لو مسجّل) عشان الـ PageView يتنسب له
  useEffect(() => { if (!pathname.startsWith('/admin')) pixelUser(user); }, [user, pathname]);
  useEffect(() => { trackView(pathname); pixelPageView(pathname); }, [pathname]);
  return null;
}
