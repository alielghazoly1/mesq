// utils/oneOffFixes.js
// تعديلات بيانات لمرة واحدة على دعوة معيّنة بطلب المالك.
//
// مفيش وصول مباشر لقاعدة البيانات من برا السيرفر، فالتعديل بيتعمل هنا بعد
// الاتصال. كل تعديل:
//   - محصور في دعوة واحدة بالـ shortId
//   - بيتعمل بس لو الدعوة لسه بالحالة اللي اتشافت وقت الطلب (when)، فلو
//     صاحبها عدّل بعدها أو التعديل اتعمل قبل كده، مبيتعملش تاني ومبيدوسش
//     على شغله
//   - بيطبع القيم القديمة في اللوج قبل ما يغيّرها (للرجوع لو احتجنا)
// فشل أي تعديل مايأثرش على تشغيل السيرفر.
const Invitation = require('../models/Invitation');

const FIXES = [
  {
    // FcVHj3j (Royal Maroon) — برنامج اليوم: ٣ نقط بس (الاستقبال، كتب الكتاب،
    // الحفلة)، والحفلة بنفس شكل اللي فوقها. صاحبها كان مسح السطر الأصلي وكتب
    // "party" و"08:30 pm" كنصوص مضافة متحركة بالإيد، وسطرين فاضيين بنقطهم
    // فضلوا في النص. التعديل بيرجّع سطر الحفلة الأصلي (نفس الخط والمقاس
    // والمحاذاة) بوقت 08:30 pm، ويشيل النصين المضافين، ويخفي الصفين الفاضيين.
    name: 'FcVHj3j-program-3-rows',
    shortId: 'FcVHj3j',
    when: (c) => (c.added || []).some((a) => a && (a.id === 'nmuzktg0oopby' || a.id === 'nmuzkwc4t7v2r')),
    apply(c) {
      const drop = ['nmuzktg0oopby', 'nmuzkwc4t7v2r'];
      const set = {};
      set['customizations.added'] = (c.added || []).filter((a) => !(a && drop.includes(a.id)));
      const offsets = { ...(c.offsets || {}) };
      drop.forEach((id) => delete offsets['add_' + id]);
      set['customizations.offsets'] = offsets;
      // سطر الحفلة يرجع (٢٠٨ الاسم، ٢٠٩ الوقت) — والصفين ٣ و٤ يتشالوا بنقطهم
      const hidden = (c.hidden || []).filter((id) => id !== '7000000000208' && id !== '7000000000209');
      ['7000000000402', '7000000000403'].forEach((id) => { if (!hidden.includes(id)) hidden.push(id); });
      set['customizations.hidden'] = hidden;
      set['customizations.texts'] = { ...(c.texts || {}), '7000000000209': '08:30 pm' };
      // نفس مقاس اسم السطرين اللي فوق (8) ومن غير محاذاة يمين
      const sizes = { ...(c.sizes || {}) };
      sizes['7000000000208'] = sizes['7000000000200'] || 8;
      set['customizations.sizes'] = sizes;
      const aligns = { ...(c.aligns || {}) };
      delete aligns['7000000000208'];
      drop.forEach((id) => delete aligns['add_' + id]);
      set['customizations.aligns'] = aligns;
      return set;
    },
  },
  {
    // bTS793h — صاحبتها صممت النصوص المضافة (31 نص) وهي فاتحة معاينة الكمبيوتر،
    // اللي كانت مابتكسرش السطور؛ وعلى الموبايل السطور كانت بتتكسر عند نص
    // الشاشة والجمل تدخل في بعض ("عائلة التكريتي عائلة / شحاده" فوق "والد
    // العروس"). بنثبّت عرض السطر (ww=340) لكل نصوصها — فتتعرض بالظبط زي ما
    // صممتها، سطر واحد لكل جملة، على أي موبايل أو كمبيوتر. بيتعمل بس لو ولا
    // نص من نصوصها اتثبّت عرضه قبل كده.
    name: 'bTS793h-added-fixed-wrap',
    shortId: 'bTS793h',
    when: (c) => {
      const list = c.added || [];
      return list.some((a) => a && a.id === 'nmv76wrr67vbs') && list.every((a) => !a || !a.ww);
    },
    apply(c) {
      return { 'customizations.added': (c.added || []).map((a) => (a ? { ...a, ww: 340 } : a)) };
    },
  },
  {
    // PnyV95W (Lily Garden عربي) — سطر ميعاد الحفل تحت التاريخ على طول في
    // الكارت، بنفس خط سطوره (عنصر lg81 في القالب). العميل كان ضافه كنص حر
    // متحرك بالإيد وشاله؛ ده بقى سطر حقيقي جوه الكارت. بيتعمل بس لو السطر
    // لسه فاضي — فلو العميل عدّله بعد كده مابنلمسوش.
    name: 'PnyV95W-time-line',
    shortId: 'PnyV95W',
    when: (c) => !((c.texts || {}).lg81),
    apply(c) {
      return { 'customizations.texts': { ...(c.texts || {}), lg81: 'سيبدأ الحفل الساعة 18:00' } };
    },
  },
  {
    // FjpDW02 (Champagne Lace عربي) — دعوة سمير الكيال وأيه الصاوي بطلب المالك:
    // الأسامي والميعاد (الجمعة 30/10/2026 الساعة 7 مساءً) والمكان بنفس دالة
    // حفظ التفاصيل اللي المحرر بيستخدمها، وكلام الـ Dress code في سطرين
    // الكارت الأول (cl13/cl14)، وجملة الختام فوق "في انتظاركم" (cl83).
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة الافتراضية ومحدش كتب فيها.
    name: 'FjpDW02-samir-aya',
    shortId: 'FjpDW02',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'champagne-lace' && inv.groomNameAr === 'العريس'
      && inv.brideNameAr === 'العروسة' && !((c.texts || {}).cl13),
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'سمير الكيال', groomNameAr: 'سمير الكيال',
        brideName: 'أيه الصاوي', brideNameAr: 'أيه الصاوي',
        venueName: 'نادي الري بالمظلات', venueCity: 'شبرا مصر', venueAddress: 'قاعة هيلتون',
        venueMapQuery: 'نادي الري بالمظلات، شبرا مصر',
        weddingDate: '2026-10-30', weddingTime: '19:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set['customizations.texts'] = {
        ...(c.texts || {}),
        cl13: 'لا يوجد زيّ محدد لحفل الزفاف ولكن نرجو من حضراتكم التكرّم بعدم ارتداء اللون الأبيض أو أي من مشتقاته بما في ذلك الأوف وايت والبيج',
        cl14: 'احترامًا ليوم العروس المميز ولكم جزيل الشكر والتقدير على تفهّمكم🤍',
        cl83: 'بكل الحب ندعوكم لمشاركتنا فرحتنا في يومنا المميز فبحضوركم ودعواتكم سوف تكتمل سعادتنا وتزداد فرحتنا🤍',
      };
      return set;
    },
  },
  {
    // GrpUVQq (Champagne Lace إنجليزي) — دعوة Yara & Shrief بطلب المالك:
    // الأسامي والميعاد (الاتنين 9/11/2026 الساعة 5 مساءً) والمكان (Casa Maria —
    // فيلات عرابي، العبور) بلينك الخريطة اللي بعته، والـ Dress code في سطرين
    // الكارت الأول (cl13/cl14). الباب اللي بيتفتح في custom-invitations/GrpUVQq.js.
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة ومحدش كتب فيها.
    name: 'GrpUVQq-yara-shrief',
    shortId: 'GrpUVQq',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'champagne-lace' && inv.brideName === 'Bride'
      && inv.groomName === 'Groom' && !((c.texts || {}).cl13),
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Shrief', groomNameAr: 'Shrief',
        brideName: 'Yara', brideNameAr: 'Yara',
        venueName: 'Casa Maria Venue', venueCity: 'Orabi Villas, Obour City',
        venueMapQuery: 'https://maps.app.goo.gl/HLdcbw6VA3KBBizw7',
        weddingDate: '2026-11-09', weddingTime: '17:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set['customizations.texts'] = {
        ...(c.texts || {}),
        cl13: 'Dress code · Men: formal suits only',
        cl14: 'Ladies: soirée dresses only · No casual',
      };
      return set;
    },
  },
  {
    // GrpUVQq — المالك صحّح اسم العريس: Sherif (بالظبط كده). بيتعمل بس لو الاسم
    // لسه واحد من اللي احنا حطيناهم قبل كده، فلو العميل غيّره من المحرر مابنلمسوش.
    name: 'GrpUVQq-name-sherif',
    shortId: 'GrpUVQq',
    select: 'customizations groomName groomNameAr',
    when: (c, inv) => inv.groomName === 'Shrief' || inv.groomName === 'Shirif',
    apply: (c, inv) => ({ groomName: 'Sherif', ...(['Shrief', 'Shirif'].includes(inv.groomNameAr) ? { groomNameAr: 'Sherif' } : {}) }),
  },
  {
    // e20H7Oq (Champagne Lace إنجليزي — Ahmed & Eman) — بطلب المالك: الضيوف
    // يقدروا يسجّلوا تهنئة صوتية ويرفعوا صور الفرح، تحت فورم تأكيد الحضور
    // (utils/guestExtras.js). بيتعمل مرة واحدة بس لو الإضافات لسه مش مفعّلة.
    name: 'e20H7Oq-guest-extras',
    shortId: 'e20H7Oq',
    select: 'customizations guestExtras templateId',
    when: (c, inv) => !(inv.guestExtras && (inv.guestExtras.voice || inv.guestExtras.photos)),
    apply() {
      return { 'guestExtras.voice': true, 'guestExtras.photos': true };
    },
  },
  {
    // vYsx7Gn (الغزالى ومها — قصر ليالي نمار) — بطلب المالك: "الموقع يظهر عند
    // ناس صح وعند ناس غلط". الخريطة المضمّنة كانت على مكان "الكاميرا" في لينك
    // جوجل (46.5907552) مش الدبوس نفسه (46.591414). بنحطها على الدبوس، واللينك
    // اللي المالك بيشاركه زي ما هو. بس لو لسه نفس اللينك ونفس الخريطة القديمة.
    name: 'vYsx7Gn-map-pin',
    shortId: 'vYsx7Gn',
    select: 'customizations venueMapEmbedSrc venueMapDirectLink',
    when: (c, inv) => /TZMx3AJSQJfe3YK7A/.test(inv.venueMapDirectLink || '')
      && inv.venueMapEmbedSrc === 'https://www.google.com/maps?q=24.5669705,46.5907552&output=embed',
    apply: () => ({ venueMapEmbedSrc: 'https://www.google.com/maps?q=24.5669705,46.591414&z=17&output=embed' }),
  },
  {
    // 1yJIK9C (Ivory Swans) — دعوة م. عمرو أبوبكر التيجاني الصديق وم. نور محمد
    // حسن أحمد أبو علامة، بطلب المالك:
    //  • الدعوة بالعربي، والزفاف السبت 28/11/2026 الساعة 8 مساءً — قاعة أوسيل
    //    (Ociel Hall) بمنتجع عين الحياة، الفسطاط — بلينك الخريطة اللي بعته.
    //  • "اشيل الصور": صور قسم الحكاية (iv2–iv4 وكلامها iv14–iv16) اتشالت،
    //    وكلام القسم نفسه بقى لعقد القران (الجمعة 27/11 الساعة 2 ظهرًا —
    //    مسجد الحامدية الشاذلية).
    //  • الأسامي على الغلاف، والآباء في قسم العائلات.
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة ومحدش كتب في قسم العائلات.
    name: '1yJIK9C-amr-nour',
    shortId: '1yJIK9C',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'ivory-swans' && inv.groomName === 'Groom'
      && inv.brideName === 'Bride' && !((c.texts || {}).iv24),
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'عمرو', groomNameAr: 'عمرو',
        brideName: 'نور', brideNameAr: 'نور',
        venueName: 'قاعة أوسيل', venueCity: 'منتجع عين الحياة — الفسطاط',
        venueMapQuery: 'https://maps.app.goo.gl/mG5zojKnT9UvrsXq7',
        weddingDate: '2026-11-28', weddingTime: '20:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'ar';
      set['customizations.texts'] = {
        ...(c.texts || {}),
        // الغلاف
        '1779566247730000001__1': 'عمرو',
        '1779566247730000001__2': 'نور',
        '1779566247730000003': '28.11.2026',
        // احفظ الموعد — التاريخ ومعاه الساعة
        iv40: 'السبت ٢٨ / ١١ / ٢٠٢٦ — الساعة ٨ مساءً',
        // قسم الحكاية من غير صور → عقد القران
        iv17: 'عقد القران',
        iv18: 'الجمعة ٢٧ / ١١ / ٢٠٢٦',
        iv19: 'يتشرف الأهل بدعوتكم لحضور عقد القران الساعة ٢ ظهرًا',
        iv20: 'بمسجد الحامدية الشاذلية',
        // العائلات
        iv21: 'بمباركة أهلهما الكرام',
        iv22: 'عائلة التيجاني الصديق وعائلة أبو علامة',
        iv23: 'العريس',
        iv24: 'المهندس عمرو أبوبكر التيجاني الصديق',
        iv25: 'العروسة',
        iv26: 'المهندسة نور محمد حسن أحمد أبو علامة',
        iv27: 'بقلوب مفعمة بالفرح، يتشرف الأهل بدعوتكم لحضور حفل الزفاف يوم السبت ٢٨ / ١١ الساعة ٨ مساءً',
        // المكان
        iv30: 'منتجع عين الحياة — الفسطاط',
      };
      const hidden = new Set(c.hidden || []);
      ['iv2', 'iv3', 'iv4', 'iv14', 'iv15', 'iv16', 'iv5'].forEach((id) => hidden.add(id));
      set['customizations.hidden'] = [...hidden];
      return set;
    },
  },
  {
    // ooW5EFI (Velvet Voice — دعوة كاستم: custom-invitations/ooW5EFI.js) — بطلب
    // المالك: العريس ابراهيم والعروسة فرح، والفرح يوم 22/11/2026 (نفس الساعة).
    // الصفحة نفسها مكتوب فيها الأسامي؛ ده عشان عنوان الدعوة وكارت المشاركة
    // واللوحة. بيتعمل بس لو الدعوة لسه بأسامي المسودة "العريس" و"العروسة".
    name: 'ooW5EFI-ibrahim-farah',
    shortId: 'ooW5EFI',
    select: 'customizations templateId groomName brideName groomNameAr brideNameAr weddingDateTime',
    // الدعوة العربي بتعرض groomNameAr/brideNameAr — أي واحد فيهم لسه أسامي المسودة
    when: (c, inv) => inv.templateId === 'velvet-voice'
      && [inv.groomNameAr, inv.groomName].includes('العريس') && [inv.brideNameAr, inv.brideName].includes('العروسة'),
    apply(c, inv) {
      const old = new Date(inv.weddingDateTime);
      return {
        groomName: 'ابراهيم', groomNameAr: 'ابراهيم',
        brideName: 'فرح', brideNameAr: 'فرح',
        // نفس طريقة utils/invitationData.js (ساعة مصر مكتوبة كساعة السيرفر)
        weddingDateTime: new Date(2026, 10, 22, old.getHours(), old.getMinutes(), 0),
      };
    },
  },
  {
    // ooW5EFI (ابراهيم وفرح) — بطلب المالك: الفرح في قصر الأمير محمد علي (المنيل)
    // بلينك الخريطة اللي بعته، ويبدأ الساعة 3:30 العصر يوم 22/11/2026.
    // بيتعمل بس لو الدعوة لسه بمكان المسودة ("Venue").
    name: 'ooW5EFI-manial-palace',
    shortId: 'ooW5EFI',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'velvet-voice' && inv.venueName === 'Venue',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: inv.groomName, groomNameAr: inv.groomNameAr,
        brideName: inv.brideName, brideNameAr: inv.brideNameAr,
        venueName: 'قصر الأمير محمد علي', venueCity: 'المنيل — القاهرة',
        venueMapQuery: 'https://goo.gl/maps/KCMpenYcVXjCKwgHA',
        weddingDate: '2026-11-22', weddingTime: '15:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      return set;
    },
  },
  {
    // ooW5EFI — بطلب المالك (28/10): لينك مكان جديد (Prince Mohamed Ali Palace).
    // بيتعمل بس لو الدعوة لسه على اللينك القديم اللي اتحط في 27/10.
    name: 'ooW5EFI-palace-link-v2',
    shortId: 'ooW5EFI',
    select: 'templateId venueMapDirectLink venueMapEmbedSrc venueMapQuery venueName',
    when: (c, inv) => inv.templateId === 'velvet-voice' && /KCMpenYcVXjCKwgHA/.test(inv.venueMapDirectLink || ''),
    apply: () => ({
      venueName: 'Prince Mohamed Ali Palace',
      venueMapQuery: 'https://goo.gl/maps/cZnwZp9SU5csH7yz8',
      venueMapDirectLink: 'https://goo.gl/maps/cZnwZp9SU5csH7yz8',
      venueMapEmbedSrc: 'https://www.google.com/maps?q=' + encodeURIComponent('26CG+GPX Prince Mohamed Ali Palace, 11 Al Saraya, Al Manyal Ash Sharqi, Old Cairo, Cairo') + '&z=16&output=embed',
    }),
  },
  {
    // jUckAdv (Champagne Lace — عمر ولچين) — بطلب المالك: الفرح الجمعة 1/1/2027
    // الساعة 7:30 مساءً في فندق توليب أوليمبيك (طريق العين السخنة) بلينك الخريطة
    // اللي بعته، والخريطة المضمّنة على الدبوس نفسه. الوقت (cl9/cl10) بيرجع يظهر
    // تحت التاريخ في أول كارت لأنه مش مكتوب في أي حتة تانية.
    // بيتعمل بس لو الدعوة لسه بمكان المسودة ("Venue").
    name: 'jUckAdv-tolip-2027',
    shortId: 'jUckAdv',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'champagne-lace' && inv.venueName === 'Venue',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: inv.groomName, groomNameAr: inv.groomNameAr,
        brideName: inv.brideName, brideNameAr: inv.brideNameAr,
        venueName: 'Tolip Hotel Olympic', venueCity: 'International City, Ain El Sokhna Road',
        venueMapQuery: 'https://maps.app.goo.gl/5WUVz85yhBDZYFua8?g_st=iw',
        weddingDate: '2027-01-01', weddingTime: '19:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.venueMapEmbedSrc = 'https://www.google.com/maps?q=29.9005582,31.6820039&z=16&output=embed';
      set['customizations.hidden'] = (c.hidden || []).filter((id) => id !== 'cl9' && id !== 'cl10');
      return set;
    },
  },
];

let done = false;

// تعديلات لمرة واحدة على لينكات الإعلانات (Campaign) بطلب المالك.
// بتتعمل بس لو اللينك لسه على الحالة اللي اتشافت وقت الطلب ومااتعدّلش بعدها
// (updatedAt قبل وقت الطلب) — فلو المالك غيّره بنفسه بعد كده مابنلمسوش.
const CAMPAIGN_FIXES = [
  {
    // ig-4ff2 — المالك عايز لينك الإعلان يفتح الصفحة الرئيسية (التصاميم) مش الباقات
    name: 'ig-4ff2-landing-home',
    code: 'ig-4ff2',
    when: (c) => c.landing === '/packages' && new Date(c.updatedAt || 0) < new Date('2026-10-15T20:30:00Z'),
    set: { landing: '/' },
  },
];

async function runCampaignFixes() {
  const Campaign = require('../models/Campaign');
  for (const fix of CAMPAIGN_FIXES) {
    try {
      const c = await Campaign.findOne({ code: fix.code }).lean();
      if (!c || !fix.when(c)) continue;
      console.log(`[oneOffFix] ${fix.name} before: ${JSON.stringify({ landing: c.landing })}`);
      await Campaign.updateOne({ _id: c._id }, { $set: { ...fix.set, updatedAt: new Date() } });
      console.log(`[oneOffFix] ${fix.name} applied`);
    } catch (err) {
      console.error(`[oneOffFix] ${fix.name} failed:`, err.message);
    }
  }
}

// الدخول بجوجل — الـ Client ID اللي المالك بعته (مشروع Google Cloud: tota-490915).
// بيتحط بس لو الخانة لسه فاضية، فأي تغيير بعدين من لوحة التحكم هو اللي بيمشي.
async function runSiteConfigFixes() {
  const SiteConfig = require('../models/SiteConfig');
  const GOOGLE_CLIENT_ID = '426024477984-5qdbvcc0pu5cq5ptvs2h7amv6iosrjbm.apps.googleusercontent.com';
  try {
    const r = await SiteConfig.updateOne(
      { key: 'default', $or: [{ googleClientId: { $exists: false } }, { googleClientId: '' }] },
      { $set: { googleClientId: GOOGLE_CLIENT_ID, googleLoginEnabled: true, updatedAt: new Date() } },
    );
    if (r.modifiedCount) console.log('[oneOffFix] google-client-id applied');
    else if (!(await SiteConfig.exists({ key: 'default' }))) {
      await SiteConfig.create({ key: 'default', googleClientId: GOOGLE_CLIENT_ID, googleLoginEnabled: true });
      console.log('[oneOffFix] google-client-id applied (new config)');
    }
  } catch (err) {
    console.error('[oneOffFix] google-client-id failed:', err.message);
  }
}

// KAST — لينك الدفع اللي المالك بعته (2026-10-20). اللينك القديم كان بيقول "منتهي".
// مرة واحدة بس (علامة fixes.kastLink20261020 في المستند) — فأي تغيير بعد كده من اللوحة هو اللي بيمشي.
async function runPaymentFixes() {
  const PaymentSettings = require('../models/PaymentSettings');
  const LINK = 'https://app.kast.xyz/kasttag/alielghazoly';
  const MARK = 'fixes.kastLink20261020';
  try {
    const col = PaymentSettings.collection;
    let doc = await col.findOne({ key: 'default' });
    if (!doc) { await PaymentSettings.create({ key: 'default' }); doc = await col.findOne({ key: 'default' }); }
    if (doc.fixes && doc.fixes.kastLink20261020) return;
    console.log(`[oneOffFix] kast-link before: ${JSON.stringify({ kast: doc.kast || null })}`);
    await col.updateOne({ _id: doc._id }, { $set: { 'kast.link': LINK, 'kast.enabled': true, [MARK]: new Date(), updatedAt: new Date() } });
    console.log('[oneOffFix] kast-link applied');
  } catch (err) {
    console.error('[oneOffFix] kast-link failed:', err.message);
  }
}

// رسالة الترحيب الطويلة القديمة → السطرين الجداد (بطلب المالك 2026-10-20:
// "رسائل الدعم مجعلصة"). أول سطر (أهلًا بيك يا فلان في ميثاق 🤍) بيفضل زي ما هو.
// بتلمس بس الرسالة اللي فيها نص الترحيب القديم بالظبط — فبتتنفّذ مرة واحدة.
async function runSupportFixes() {
  const SupportMessage = require('../models/SupportMessage');
  try {
    const r = await SupportMessage.updateMany(
      { from: 'admin', body: { $regex: 'حسابك جاهز\\. تقدر تتفرّج على كل التصاميم' } },
      [{
        $set: {
          body: {
            $concat: [
              { $arrayElemAt: [{ $split: ['$body', '\n'] }, 0] },
              '\nمحتاج أي مساعدة؟ اكتبلي هنا أو ابعت فويس، وأنا معاك.',
            ],
          },
        },
      }],
    );
    if (r.modifiedCount) console.log(`[oneOffFix] short-welcome applied to ${r.modifiedCount} messages`);
  } catch (err) {
    console.error('[oneOffFix] short-welcome failed:', err.message);
  }
}

async function runOneOffFixes() {
  if (done) return;
  done = true;
  await runCampaignFixes();
  await runSiteConfigFixes();
  await runPaymentFixes();
  await runSupportFixes();
  for (const fix of FIXES) {
    try {
      // select: التعديلات اللي محتاجة حقول الدعوة نفسها (مش التخصيصات بس)
      const inv = await Invitation.findOne({ shortId: fix.shortId }).select(fix.select || 'customizations').lean();
      if (!inv) continue;
      const c = inv.customizations || {};
      if (!fix.when(c, inv)) continue;
      const set = await fix.apply(c, inv);
      const before = {};
      Object.keys(set).forEach((k) => {
        before[k] = k.startsWith('customizations.') ? c[k.replace('customizations.', '')] : inv[k];
      });
      console.log(`[oneOffFix] ${fix.name} before: ${JSON.stringify(before)}`);
      await Invitation.updateOne({ _id: inv._id }, { $set: set });
      console.log(`[oneOffFix] ${fix.name} applied`);
    } catch (err) {
      console.error(`[oneOffFix] ${fix.name} failed:`, err.message);
    }
  }
}

module.exports = runOneOffFixes;
module.exports.FIXES = FIXES;
