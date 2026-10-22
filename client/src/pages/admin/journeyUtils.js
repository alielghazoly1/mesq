// أدوات عرض رحلة الزائر (صفحة "مباشر" + ملف العميل): أسماء الصفحات بالعربي،
// وصف كل خطوة، ومدة كل صفحة.
const PKG = { solo: 'الدعوة الواحدة', basic: 'الأساسية', plus: 'المتقدمة', pro: 'الاحترافية' };

export const SRC_LABEL = {
  ads: 'إعلان ممول', instagram: 'إنستجرام', facebook: 'فيسبوك', google: 'جوجل', search: 'بحث', whatsapp: 'واتساب',
  tiktok: 'تيك توك', twitter: 'X', snapchat: 'سناب شات', invitation: 'من دعوة', other: 'موقع تاني', direct: 'مباشر',
};
export const KIND_LABEL = { mobile: 'موبايل', desktop: 'كمبيوتر', tablet: 'تابلت' };

/** اسم الصفحة بالعربي من المسار */
export function pageLabel(path) {
  const p = String(path || '/');
  const seg = p.split('/').filter(Boolean);
  if (!seg.length) return 'الرئيسية';
  switch (seg[0]) {
    case 'gallery': case 'templates': return 'التصاميم';
    case 'packages': return 'الباقات';
    case 'checkout': return `الدفع — ${PKG[seg[1]] || seg[1] || ''}`.trim();
    case 'create': return `بيعمل دعوة (${seg[1] || ''})`;
    case 'editor': return `المحرر — دعوة ${seg[1] || ''}`;
    case 'dashboard': return 'لوحته';
    case 'account': return 'حسابه';
    case 'privacy': return 'الخصوصية';
    case 'terms': return 'الشروط';
    default: return p;
  }
}

export function fmtDur(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  if (s < 60) return `${s} ث`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}:${String(s % 60).padStart(2, '0')} د`;
  return `${Math.floor(m / 60)} س ${m % 60} د`;
}
export const fmtClock = (t) => new Date(t).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
export function ago(t, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(t).getTime()) / 1000));
  if (s < 5) return 'دلوقتي';
  if (s < 60) return `من ${s} ثانية`;
  const m = Math.floor(s / 60);
  if (m < 60) return `من ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `من ${h} ساعة`;
  return `من ${Math.floor(h / 24)} يوم`;
}

/**
 * الخطوات للعرض: كل صفحة معاها قعد فيها قد إيه ونزل لحد فين (من الخطوة اللي
 * بعدها)، والصفحة الأخيرة لو لسه فاتحها = من ساعتها لحد دلوقتي.
 */
export function enrich(events, { live, now = Date.now() } = {}) {
  const raw = (events || []).map((e) => ({ ...e }));
  // تحديث الصفحة / الانتقال بلينك مباشر: المتصفح بيبعت "ساب التاب" + "قفل" وبعدها
  // الزيارة بتكمّل — فـ"القفل" ده مش خروج، و"ساب التاب" اللي معاه مالوش لازمة
  raw.forEach((e, i) => {
    if (e.k === 'x' && raw.slice(i + 1).some((x) => x.k === 'v' || x.k === 'c')) e.reload = true;
  });
  const list = raw.filter((e) => !(e.k === 'h' && raw.some((x) => x.k === 'x' && Math.abs(new Date(x.t) - new Date(e.t)) < 3000)));
  list.forEach((e, i) => {
    if (e.k !== 'v') return;
    const next = list.slice(i + 1).find((x) => x.k === 'v' || x.k === 'x');
    if (next) { e.stay = next.d; e.scroll = next.s; } else if (live) { e.stay = Math.round((now - new Date(e.t).getTime()) / 1000); e.open = true; }
  });
  return list;
}

/** وصف الخطوة بالعربي */
export function eventText(e, i) {
  if (e.k === 'v') return i === 0 ? `دخل على ${pageLabel(e.p)}` : `فتح ${pageLabel(e.p)}`;
  if (e.k === 'c') return `ضغط على «${e.l}»`;
  if (e.k === 'h') return 'ساب التاب (فتح حاجة تانية)';
  if (e.k === 's') return 'رجع للموقع';
  if (e.k === 'x') return e.reload ? `حمّل الصفحة من جديد (${pageLabel(e.p)})` : `قفل الموقع من ${pageLabel(e.p)}`;
  return e.k;
}
