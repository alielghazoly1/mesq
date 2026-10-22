// بيسجّل رحلة الزائر (lib/journey.js): كل صفحة بيفتحها في الموقع.
// مابيعرضش حاجة.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startJourney, trackView } from '../lib/journey.js';

export default function JourneyTracker() {
  const { pathname } = useLocation();
  useEffect(() => { startJourney(); }, []);
  useEffect(() => { trackView(pathname); }, [pathname]);
  return null;
}
