// الأسئلة الجاهزة في نافذة الدعم — العميل يضغط على السؤال والإجابة
// بتتكتب قدامه على طول (من غير ما يستنى حد يرد).
//
// الإجابات من الموقع نفسه: مدد التعديل من packages/registry.js، طرق الدفع
// من صفحة الدفع. الأسعار مش متكتوبة هنا (المالك بيغيّرها من اللوحة) —
// سؤال الأسعار بيعرضها لايف من /api/packages لو العميل مسجّل.
//
// action: زرار تحت الإجابة — to (صفحة في الموقع) أو wa (واتساب برسالة جاهزة)
// أو chat (يفتح المحادثة مع الدعم).

export const FAQ = [
  {
    id: 'prices',
    icon: 'tag',
    q: { ar: 'الأسعار والباقات إيه؟', en: 'What are the prices and packages?' },
    // الإجابة نفسها بتتبني في الواجهة من الأسعار اللايف (buildPricesAnswer)
    a: {
      ar: 'عندنا أكتر من باقة حسب عدد الدعوات اللي محتاجها. الدفع مرة واحدة بس — مفيش اشتراك شهري، والدعوة بتفضل شغالة مدى الحياة ومن غير حد لعدد الضيوف.',
      en: 'We have several packages depending on how many invitations you need. You pay once — no monthly subscription, and the invitation stays live for life with unlimited guests.',
    },
    action: { to: '/packages', label: { ar: 'شوف الباقات', en: 'See packages' } },
  },
  {
    id: 'how',
    icon: 'sparkles',
    q: { ar: 'أعمل دعوتي إزاي؟', en: 'How do I make my invitation?' },
    a: {
      ar: 'في 4 خطوات بسيطة:\n1. اختار التصميم اللي يعجبك من الصفحة الرئيسية.\n2. اكتب الأسماء والتاريخ والمكان.\n3. عدّل براحتك في المحرر — الخط والصور والموسيقى، وحرّك أي كلام مكانه.\n4. ابعت اللينك لضيوفك على واتساب أو أي مكان.',
      en: 'In 4 simple steps:\n1. Pick a design you like on the home page.\n2. Fill in the names, date and venue.\n3. Customise it in the editor — fonts, photos, music, and move any text.\n4. Send the link to your guests on WhatsApp or anywhere.',
    },
    action: { to: '/', label: { ar: 'شوف التصاميم', en: 'Browse designs' } },
  },
  {
    id: 'pay',
    icon: 'wallet',
    q: { ar: 'أدفع إزاي؟', en: 'How do I pay?' },
    a: {
      ar: 'من مصر: فودافون كاش أو InstaPay.\nمن بره مصر: تحويل بنكي، أو Taptap Send، أو KAST، أو USDT.\n\nبعد ما تحوّل ارفع صورة الإيصال في صفحة الدفع، وبنفعّل باقتك في العادة خلال دقايق.',
      en: 'From Egypt: Vodafone Cash or InstaPay.\nFrom abroad: bank transfer, Taptap Send, KAST or USDT.\n\nAfter you transfer, upload the receipt on the payment page — we usually activate your package within minutes.',
    },
    action: { to: '/packages', label: { ar: 'اختار باقتك', en: 'Choose a package' } },
  },
  {
    id: 'activate',
    icon: 'clock',
    q: { ar: 'باقتي هتتفعّل إمتى؟', en: 'When will my package be activated?' },
    a: {
      ar: 'أول ما ترفع صورة الإيصال بنراجعه ونفعّل باقتك — في العادة خلال دقايق. وبيوصلك إشعار هنا أول ما تتفعّل، ودعواتك المميزة بتظهر في لوحتك على طول.',
      en: 'As soon as you upload the receipt we review it and activate your package — usually within minutes. You get a notice here the moment it’s active, and your premium invitations appear in your dashboard.',
    },
  },
  {
    id: 'edit',
    icon: 'pencil',
    q: { ar: 'أقدر أعدّل الدعوة بعد ما أبعتها؟', en: 'Can I edit the invitation after sending it?' },
    a: {
      ar: 'أيوه. أي تعديل بيظهر عند الضيوف على طول، من غير ما تبعت لينك جديد.\n\nالتعديل مفتوح من يوم تفعيل باقتك:\n• الدعوة الواحدة: 30 يوم\n• الأساسية: 60 يوم\n• المتقدمة: 90 يوم\n• الاحترافية: مدى الحياة\n\nوبعد المدة، الدعوة بتفضل شغالة زي ما هي.',
      en: 'Yes. Any change shows up for your guests instantly — no new link needed.\n\nEditing stays open from the day your package is activated:\n• Single: 30 days\n• Essential: 60 days\n• Plus: 90 days\n• Professional: lifetime\n\nAfter that, the invitation keeps working exactly as it is.',
    },
  },
  {
    id: 'share',
    icon: 'send',
    q: { ar: 'أبعت الدعوة للضيوف إزاي؟', en: 'How do I send it to my guests?' },
    a: {
      ar: 'من لوحتك اضغط "مشاركة" وانسخ اللينك، وابعته على واتساب أو إنستجرام أو أي مكان. مفيش حد لعدد الضيوف، وكل اللي يفتح اللينك بيشوف الدعوة كاملة بالموسيقى.',
      en: 'From your dashboard tap "Share", copy the link and send it on WhatsApp, Instagram or anywhere. There’s no guest limit, and everyone who opens it sees the full invitation with music.',
    },
    action: { to: '/dashboard', label: { ar: 'روح للوحتك', en: 'Go to dashboard' }, auth: true },
  },
  {
    id: 'rsvp',
    icon: 'users',
    q: { ar: 'الضيوف يقدروا يأكدوا حضورهم؟', en: 'Can guests confirm attendance?' },
    a: {
      ar: 'أيوه. في الدعوة قسم لتأكيد الحضور، والضيف بيكتب اسمه ويقول جاي ولا لأ. كل الردود بتوصلك في لوحتك أول بأول.',
      en: 'Yes. The invitation has an RSVP section where guests write their name and say if they’re coming. Every reply lands in your dashboard right away.',
    },
  },
  {
    id: 'music',
    icon: 'music',
    q: { ar: 'أقدر أغيّر الأغنية؟', en: 'Can I change the song?' },
    a: {
      ar: 'أيوه. من المحرر اضغط "الموسيقى": اختار من المكتبة أو ارفع أغنيتك. وتقدر تقصّها وتختار الحتة اللي تبدأ منها.',
      en: 'Yes. In the editor tap "Music": pick from the library or upload your own song. You can trim it and choose where it starts.',
    },
  },
  {
    id: 'custom',
    icon: 'palette',
    q: { ar: 'عايز تصميم مخصص أو موقع', en: 'I want a custom design or website' },
    a: {
      ar: 'بنعمل تصميمات مخصوص ومواقع كاملة بفكرتك. كلّمنا على واتساب وقولّنا عايز إيه، ونبعتلك التفاصيل والسعر.',
      en: 'We make custom designs and full websites around your idea. Message us on WhatsApp with what you have in mind and we’ll send details and pricing.',
    },
    action: { wa: 'custom', label: { ar: 'كلّمنا على واتساب', en: 'WhatsApp us' } },
  },
];

/** الإجابة بلغة العميل */
export function faqText(item, lang) {
  const isAr = lang !== 'en';
  return {
    q: isAr ? item.q.ar : item.q.en,
    a: isAr ? item.a.ar : item.a.en,
    actionLabel: item.action ? (isAr ? item.action.label.ar : item.action.label.en) : '',
  };
}

/**
 * إجابة الأسعار بالأسعار الحقيقية لبلد العميل (من /api/packages).
 * @param {Array} packages
 * @param {string} lang
 */
export function pricesLines(packages, lang) {
  if (!Array.isArray(packages) || !packages.length) return '';
  const isAr = lang !== 'en';
  return packages
    .filter((p) => p && p.price != null)
    .map((p) => {
      const n = p.invitations;
      const inv = isAr
        ? (n === 1 ? 'دعوة واحدة' : n === 2 ? 'دعوتين' : n <= 10 ? `${n} دعوات` : `${n} دعوة`)
        : `${n} invitation${n === 1 ? '' : 's'}`;
      return `• ${p.name} — ${p.price} ${p.currencyLabel || ''} (${inv})`;
    })
    .join('\n');
}
