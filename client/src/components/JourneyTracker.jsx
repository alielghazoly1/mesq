// بيسجّل رحلة الزائر (lib/journey.js): كل صفحة بيفتحها في الموقع.
// وبيبلّغ بيكسل ميتا بنفس الصفحة (lib/metaPixel.js). مابيعرضش حاجة.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startJourney, trackView } from '../lib/journey.js';
import { pixelPageView } from '../lib/metaPixel.js';

export default function JourneyTracker() {
  const { pathname } = useLocation();
  useEffect(() => { startJourney(); }, []);
  useEffect(() => { trackView(pathname); pixelPageView(pathname); }, [pathname]);
  return null;
}
