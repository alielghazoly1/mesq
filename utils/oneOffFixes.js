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
    // osj3Yje (احمد & شهد — Royal Maroon) — بطلب المالك: تهنئة صوتية جوه سجل
    // التهاني مع "هتحضر ولا لأ" (المكان والألوان في custom-invitations/osj3Yje.js).
    // صوت بس، من غير رفع صور. مرة واحدة بس لو لسه مش متفعّلة.
    name: 'osj3Yje-guest-voice',
    shortId: 'osj3Yje',
    select: 'customizations guestExtras templateId',
    when: (c, inv) => !(inv.guestExtras && inv.guestExtras.voice),
    apply() {
      return { 'guestExtras.voice': true };
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
    // NERy7o2 (Royal Maroon — خالد وسميه) — بطلب المالك: العائلات والأبهات
    // والأمهات كل واحد في خانته (اسم الأب كان متكتب في خانة الأم)، وبداية
    // الحفل الساعة 9 (استقبال الضيوف 8 زي ما هو). كارت الباركود في
    // custom-invitations/NERy7o2.js. بيتعمل بس لو خانة الأم لسه فيها اسم الأب.
    name: 'NERy7o2-families',
    shortId: 'NERy7o2',
    select: 'customizations templateId',
    when: (c, inv) => inv.templateId === 'royal-maroon' && (c.texts || {})['7000000000020'] === 'جمال الدين العربي',
    apply: (c) => ({
      'customizations.texts': {
        ...(c.texts || {}),
        7000000000017: 'عائلة العربي',
        7000000000019: 'جمال الدين العربي',
        7000000000020: 'سكينه حسن الضوي',
        7000000000018: 'عائلة خالد',
        7000000000021: 'سليمان خالد علي',
        7000000000022: 'امال مختار الأمين',
        '7000000000025__5': 'Starting at 9:00 PM',
        '7000000000032__time': 'Starting at 9:00 PM',
        '7000000000033__time': 'Starting at 9:00 PM',
        '7000000000036__time': '20:00',
        '7000000000037__time': '21:00',
      },
    }),
  },
  {
    // sXSBxjs (Sage Garden كاستم — custom-invitations/sXSBxjs.js) — بطلب المالك:
    // Maged & Rana، الفرح 19 نوفمبر 2026 الساعة 5 مساءً (الكنيسة)، والمكان The
    // Guard Hotel. بيتعمل بس لو الدعوة لسه بأسامي المسودة Groom / Bride.
    name: 'sXSBxjs-maged-rana',
    shortId: 'sXSBxjs',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'sage-garden' && inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Maged', groomNameAr: 'Maged', brideName: 'Rana', brideNameAr: 'Rana',
        venueName: 'The Guard Hotel — La Luna', venueCity: 'Cairo',
        venueMapQuery: 'https://maps.app.goo.gl/sNG2VyrC5vFGNMnt8?g_st=ic',
        weddingDate: '2026-11-19', weddingTime: '17:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      return set;
    },
  },
  {
    // lcqdxr6 (Sage Garden كاستم — custom-invitations/lcqdxr6.js) — بطلب المالك (2026-11-05):
    // نسخة طبق الأصل من sXSBxjs عشان نعدّل عليها لوحدها — نفس القالب والأسامي والتاريخ
    // والمكان والخريطة والأغنية وكل تعديلات المحرر (نصوص/صور/أحجام/ألوان/مخفي/تأكيد
    // الحضور/كارت المشاركة). اللي بيفضل بتاع lcqdxr6: صاحبها وباقتها ونشرها وإحصائياتها
    // واسمها في اللوحة وردود ضيوفها. بيتعمل بس لو lcqdxr6 لسه مسودة (Groom / Bride).
    name: 'lcqdxr6-copy-of-sXSBxjs',
    shortId: 'lcqdxr6',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'sage-garden' && inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply() {
      const src = await Invitation.findOne({ shortId: 'sXSBxjs' }).lean();
      if (!src || src.templateId !== 'sage-garden') throw new Error('sXSBxjs not found');
      const set = {};
      ['templateId', 'language', 'occasionType', 'hiddenSections', 'timeline', 'coverStyle', 'guestExtras',
        'customizations', 'groomName', 'groomNameAr', 'brideName', 'brideNameAr', 'venueName', 'venueCity',
        'venueMapQuery', 'venueMapEmbedSrc', 'venueMapDirectLink', 'venueAddress', 'contactName', 'contactPhone',
        'weddingDateTime',
      ].forEach((k) => { if (src[k] !== undefined) set[k] = src[k]; });
      return set;
    },
  },
  {
    // lcqdxr6 — بطلب المالك (2026-11-06): دعوة Imène & Hassan (إيمان وحسن) بالفرنساوي بدل نسخة
    // ماجد ورنا — السبت 10 أبريل 2027 الساعة 16:30 (استقبال الضيوف)، Dar El Bahri — Tonnara في
    // كاب زبيب بتونس بلينك الخريطة اللي بعته، والخريطة المضمّنة على القاعة نفسها (بالفرنساوي).
    // الأسامي بالترتيب اللي العرسان كاتبينه (Imène الأول — زي MeqC70l)، ورفع صور الضيوف مقفول
    // (الحفل ممنوع فيه التصوير)، وصورة كارت المشاركة القديمة (صورة ماجد ورنا) اتشالت.
    // الشكل والكلام الفرنساوي في custom-invitations/lcqdxr6.js. بيتعمل بس لو لسه نسخة ماجد ورنا.
    name: 'lcqdxr6-imene-hassan',
    shortId: 'lcqdxr6',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'sage-garden' && inv.groomName === 'Maged' && inv.brideName === 'Rana',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const MAP = 'https://maps.google.com/maps/place//data=!4m2!3m1!1s0x12e2e70071433fd7:0x5cfa2322653db54d?entry=s&sa=X&ved=2ahUKEwigl73t3NyXAxVcKvsDHR_qDwEQ4kB6BAgcEAA&hl=fr';
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: [...new Set([...(inv.hiddenSections || []), 'guestPhotos'])], timeline: inv.timeline, name: inv.name,
        groomName: 'Imène', groomNameAr: 'إيمان', brideName: 'Hassan', brideNameAr: 'حسن',
        venueName: 'Dar El Bahri — Tonnara', venueCity: 'Cap Zebib, Tunisie',
        venueMapQuery: MAP,
        weddingDate: '2027-04-10', weddingTime: '16:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.venueMapDirectLink = MAP;
      set.venueMapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent('Dar El Bahri - Tonnara, Cap Zebib')}&ll=37.2641994,10.0669822&z=15&hl=fr&output=embed`;
      set['customizations.share'] = { title: '', description: '', image: '' };
      return set;
    },
  },
  {
    // xVSjgue (Blossom & Oud) — بطلب المالك (2026-11-07): وطية إيمان (حنّة Imène — نفس عيلة
    // lcqdxr6)، الجمعة 9 أفريل 2027 الساعة 18:00، Hacienda Events في أريانة بلينك المالك،
    // والخريطة المضمّنة على الـ plus code بتاع القاعة (W4HP+43J). الكلام بالعربي والفرنساوي في
    // custom-invitations/xVSjgue.js. بيتعمل بس لو الدعوة لسه مسودة (Groom / Bride).
    name: 'xVSjgue-outya-imene',
    shortId: 'xVSjgue',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'blossom-oud' && inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const MAP = 'https://maps.app.goo.gl/aioMKkkMzo141y6m7?g_st=ic';
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Outya', groomNameAr: 'وطيّة', brideName: 'Imène', brideNameAr: 'إيمان',
        venueName: 'Hacienda Events', venueCity: 'Ariana, Tunisie',
        venueMapQuery: MAP,
        weddingDate: '2027-04-09', weddingTime: '18:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.venueMapDirectLink = MAP;
      set.venueMapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent('W4HP+43J Ariana, Tunisie')}&z=15&hl=fr&output=embed`;
      return set;
    },
  },
  {
    // xVSjgue — المالك (2026-11-08): الاسم بالفرنساوي Iman مش Imène (الصفحة نفسها في
    // custom-invitations/xVSjgue.js؛ ده الاسم في البيانات — اللوحة والإحصائيات). بيتعمل بس لو
    // الاسم لسه Imène.
    name: 'xVSjgue-iman',
    shortId: 'xVSjgue',
    select: 'customizations brideName',
    when: (c, inv) => inv.brideName === 'Imène',
    apply() {
      return { brideName: 'Iman' };
    },
  },
  {
    // lcqdxr6 — بطلب المالك (2026-11-06): أغنية الدعوة "A Whole New World" من مكتبة الموسيقى
    // (المالك رافعها من لوحة التحكم) — كأن العميل اختارها من تبويب الموسيقى في المحرر.
    // بيتعمل بس لو مفيش أغنية متختارة، فلو العميل غيّرها بعد كده مابنرجّعهاش.
    name: 'lcqdxr6-song-whole-new-world',
    shortId: 'lcqdxr6',
    when: (c) => !c.audioUrl,
    async apply() {
      const Track = require('../models/Track');
      const { isAllowedMediaUrl } = require('./customizations');
      const tracks = await Track.find({ active: true }).sort({ createdAt: -1 }).select('title artist url').lean();
      const pick = tracks.find((t) => /whole\s*new\s*world/i.test(`${t.title} ${t.artist}`));
      if (!pick || !isAllowedMediaUrl(pick.url)) {
        console.log('[oneOffFix] lcqdxr6-song-whole-new-world: track not found in the library');
        return { 'customizations.audioUrl': '' };
      }
      console.log(`[oneOffFix] lcqdxr6-song-whole-new-world: ${pick.title} — ${pick.artist} (${pick.url})`);
      return { 'customizations.audioUrl': pick.url, 'customizations.audioStart': 0, 'customizations.audioEnd': 0 };
    },
  },
  {
    // MeqC70l (Lily Garden عربي) — بطلب المالك: نسخة عربي من eJCypdA بكل تفاصيلها:
    // داليا و عمر، 21/11/2026 الساعة 5، بسم الله فوق، يوم الخطوبة، صورة الغلاف
    // والأغنية، جملة "قَدَّرَ اللهُ لَنَا لِقَاءً"، والمكان Pipe & Vibe Lounge في كراون
    // بلازا ميراج بنفس لينك الخريطة. الختم (ع و د) في custom-invitations/MeqC70l.js.
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة.
    name: 'MeqC70l-arabic-copy',
    shortId: 'MeqC70l',
    select: '-__v',
    // الاسم المعروض في الدعوة العربي من groomNameAr — والإنجليزي ممكن يكون Groom
    when: (c, inv) => inv.templateId === 'lily-garden'
      && [inv.groomNameAr, inv.groomName].includes('العريس') && [inv.brideNameAr, inv.brideName].includes('العروسة'),
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'داليا', groomNameAr: 'داليا', brideName: 'عمر', brideNameAr: 'عمر',
        venueName: 'Pipe & Vibe Lounge', venueCity: 'كراون بلازا ميراج — الإسكندرية',
        venueMapQuery: 'https://maps.app.goo.gl/Z3BoDiG85DhTNHzA6',
        weddingDate: '2026-11-21', weddingTime: '17:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.venueMapDirectLink = 'https://maps.app.goo.gl/Z3BoDiG85DhTNHzA6';
      set.venueMapEmbedSrc = 'https://www.google.com/maps?q=31.2150728,29.9467928&output=embed';
      set['customizations.texts'] = {
        ...(c.texts || {}),
        lg1: 'بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ',
        lg4: 'يوم الخطوبة',
        lg42: 'حفل خطوبتنا',
      };
      set['customizations.images'] = {
        ...(c.images || {}),
        lg5: 'https://res.cloudinary.com/dxtkmyscw/image/upload/v1793223278/mithaq/users/6ac259d576f8e4b7f5938280/images/e8xttnlo1ckn8w43hnuo.jpg',
      };
      set['customizations.audioUrl'] = 'https://res.cloudinary.com/dxtkmyscw/video/upload/v1793223832/mithaq/users/6ac259d576f8e4b7f5938280/audio/gqbafhbnadbwzluw3x4t.mp3';
      set['customizations.added'] = [
        ...((c.added || []).filter((a) => a.id !== 'nmvsmyt3obu5r')),
        { id: 'nmvsmyt3obu5r', text: 'قَدَّرَ اللهُ لَنَا لِقَاءً، فَكَانَ أَجْمَلَ قَدَر', xPct: 50, y: 0, size: 21, color: '#726434', align: 'center', anchor: 'sid_wg-invite-2', ay: 37, ww: 340 },
      ];
      return set;
    },
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
  },  {
    // MeqC70l (Lily Garden عربي — عمر وداليا) — بطلب المالك (31 أكتوبر):
    // - "يوم الخطوبة" اتشال، والسطر نفسه (lg4) بقى "حفل خطوبة" وطالع تحت البسملة
    //   فوق الأسامي (المكان في custom-invitations/MeqC70l.js)
    // - الأسامي "عمر و داليا": حقل العريس كان فيه داليا وحقل العروسة فيه عمر
    //   (عشان كده داليا كانت الأول) — اتصلّحوا في مكانهم الصح فعمر بقى الأول
    // - "أحبابنا الأهل والأصدقاء — بكل حب ندعوكم لتشاركونا أجمل بداية في حياتنا: حفل خطوبتنا"
    // بيتعمل بس لو الدعوة لسه على الحالة اللي اتشافت وقت الطلب.
    name: 'MeqC70l-omar-dalia-engagement',
    shortId: 'MeqC70l',
    select: 'customizations groomName groomNameAr brideName brideNameAr',
    when: (c, inv) => inv.groomNameAr === 'داليا' && inv.brideNameAr === 'عمر'
      && (c.texts || {}).lg4 === 'يوم الخطوبة',
    apply(c) {
      return {
        groomName: 'عمر', groomNameAr: 'عمر', brideName: 'داليا', brideNameAr: 'داليا',
        'customizations.texts': {
          ...(c.texts || {}),
          lg4: 'حفل خطوبة',
          lg40: 'بكل حب ندعوكم لتشاركونا',
          lg41: 'أجمل بداية في حياتنا',
          lg42: 'حفل خطوبتنا',
        },
      };
    },
  },  {
    // MeqC70l — تكملة للي فوق: صاحب الدعوة كان ساحب بإيده "يوم الخطوبة" 16px لفوق
    // و"عمر"/"داليا" شوية عشان يظبطهم في الترتيب القديم. في الترتيب الجديد (حفل خطوبة
    // تحت البسملة) السحبات دي بتخلّي "حفل خطوبة" يركب على البسملة — بتتشال هي بس،
    // ولو لسه بنفس القيم بالظبط (لو اتحرّكت تاني من المحرر مابنلمسهاش).
    name: 'MeqC70l-drop-old-cover-drags',
    shortId: 'MeqC70l',
    when: (c) => {
      const o = c.offsets || {};
      return o.lg4 && o.lg4.dy === -16.25 && o.lg79 && o.lg79.dy === 11.25 && o.lg3 && o.lg3.dy === -6.25
        && (c.texts || {}).lg4 === 'حفل خطوبة';
    },
    apply(c) {
      const offsets = { ...(c.offsets || {}) };
      ['lg4', 'lg79', 'lg3'].forEach((k) => delete offsets[k]);
      return { 'customizations.offsets': offsets };
    },
  },
  {
    // 1yJIK9C (عمرو ونور) — بطلب المالك: "بجوار نادي الزمالك…" وأسامي العائلات
    // كانوا كلام مضاف متثبّت بمكانه على الشاشة، فعلى موبايلات تانية بيركبوا على
    // "بمسجد الحامدية" والقلب. بقوا جوه عناصر القالب نفسها فبينزلوا تحتها على
    // طول على أي شاشة: السطر التاني من iv20، والعائلات في iv22 (كان مخفي).
    // والحروف الفارسي (ی ک) اتصلّحت لعربي.
    name: '1yJIK9C-flow-venue-families',
    shortId: '1yJIK9C',
    when: (c) => (c.texts || {}).iv20 === 'بمسجد الحامدية الشاذلية'
      && (c.added || []).some((a) => a.id === 'nmvwu5uk1kyoq'),
    apply(c) {
      const gone = ['nmvwttt9vqgdx', 'nmvwtupglsjo7', 'nmvwtvgtrycr3', 'nmvwtwizyahaf', 'nmvwu17wrds3y', 'nmvwu1oaaliio', 'nmvwu5uk1kyoq'];
      const offsets = { ...(c.offsets || {}) };
      delete offsets.iv21;
      gone.forEach((id) => delete offsets['add_' + id]);
      const sizes = { ...(c.sizes || {}) };
      delete sizes.iv20;
      delete sizes.iv22;
      return {
        'customizations.texts': {
          ...(c.texts || {}),
          iv20: 'بمسجد الحامدية الشاذلية\nبجوار نادي الزمالك ومحطة وادي النيل للمترو',
          iv22: 'آل التيجاني الصديق وآل بكري محمد مدني\nوآل أبو علامة وآل عبدالله علي نصر',
        },
        'customizations.added': (c.added || []).filter((a) => !gone.includes(a.id)),
        'customizations.offsets': offsets,
        'customizations.sizes': sizes,
        'customizations.hidden': (c.hidden || []).filter((id) => id !== 'iv22'),
      };
    },
  },
  {
    // 1yJIK9C — المالك عايز العائلات زي ما كان مرتّبهم: عمودين (العريس يمين،
    // العروسة شمال) و"&" بينهم. السطر الفاضي بيفصل العمودين
    // (custom-invitations/1yJIK9C.js بيرسمهم).
    name: '1yJIK9C-families-two-columns',
    shortId: '1yJIK9C',
    when: (c) => (c.texts || {}).iv22 === 'آل التيجاني الصديق وآل بكري محمد مدني\nوآل أبو علامة وآل عبدالله علي نصر',
    apply: (c) => ({
      'customizations.texts': {
        ...(c.texts || {}),
        iv22: 'آل التيجاني الصديق\n&\nآل بكري محمد مدني\n\nآل أبو علامة\n&\nآل عبدالله علي نصر',
      },
    }),
  },
  {
    // uw64dfD — دعوة زهير وغزل (custom-invitations/uw64dfD.js بيعرض الصفحة
    // المعمولة بإيدينا). هنا بيانات الدعوة نفسها عشان لوحة العميل وعنوان الدعوة
    // يبقوا صح: الأسامي، الفرح السبت 28/11/2026 الساعة 5 مساءً، والمكان.
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة.
    name: 'uw64dfD-zohir-kazel',
    shortId: 'uw64dfD',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Zohir', groomNameAr: 'زهير',
        brideName: 'Kazel', brideNameAr: 'غزل',
        venueName: 'Forsälla bygdegård', venueCity: 'Uddevalla',
        venueMapQuery: 'https://maps.app.goo.gl/JuoR8tX9ThAntn4K9',
        weddingDate: '2026-11-28', weddingTime: '17:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'ar';
      return set;
    },
  },
  {
    // C7ZgURf — دعوة مي وعبد الرحمن (custom-invitations/C7ZgURf.js بيعرض الصفحة
    // المعمولة بإيدينا). هنا بيانات الدعوة نفسها عشان لوحة العميل وعنوان الدعوة
    // يبقوا صح: الأسامي، الفرح الخميس 26/11/2026 الساعة 7:30 مساءً، وقاعة سي ستار.
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة.
    name: 'C7ZgURf-mai-abdelrahman',
    shortId: 'C7ZgURf',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'en', occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Abdelrahman', groomNameAr: 'عبد الرحمن',
        brideName: 'Mai', brideNameAr: 'مي',
        venueName: 'Sea Star', venueCity: 'Alexandria',
        venueMapQuery: 'https://maps.app.goo.gl/PqRU6BXrYPoHW2b18',
        weddingDate: '2026-11-26', weddingTime: '19:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'en';
      return set;
    },
  },
  {
    // 5eO9JH5 (Lily Garden بغلاف الظرف والختم — custom-invitations/5eO9JH5.js) — دعوة
    // أرجوان ود. محمد بطلب المالك: كله عربي ما عدا الأسامي والتاريخ (إنجليزي)،
    // والترتيب زي كلامهم: دعوة خاصة / بقلوب تملؤها المودة والحب / تتشرف عائلة
    // الدكتور زيدان عبدالدائم / بدعوتكم لحضور حفل زفاف ابنتهم أرجوان / وذلك بمشيئة
    // الله تعالى يوم الخميس الموافق / 12.11.2026 / عند الساعة 7:00 مساءً / في قاعة قلوريا.
    // المكان: صالة قلوريا للمناسبات الاجتماعية — طرابلس (لوكيشن المالك، ليبيا نفس توقيت مصر).
    // بيتعمل بس لو الدعوة لسه مسودة (Groom & Bride).
    name: '5eO9JH5-orjwan-mohammed',
    shortId: '5eO9JH5',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const hidden = (inv.hiddenSections || []).filter((k) => k !== 'map');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: 'wedding',
        hiddenSections: hidden, timeline: inv.timeline, name: inv.name,
        groomName: 'Dr. Mohammed', groomNameAr: 'Dr. Mohammed',
        brideName: 'Orjwan', brideNameAr: 'Orjwan',
        venueName: 'قاعة قلوريا', venueCity: 'طرابلس',
        venueAddress: 'صالة قلوريا للمناسبات الاجتماعية — طرابلس',
        venueMapQuery: 'https://maps.app.goo.gl/idd5HWmx4VUuAaBv7',
        weddingDate: '2026-11-12', weddingTime: '19:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'ar';
      set.hiddenSections = hidden;
      set['customizations.texts'] = {
        ...(c.texts || {}),
        // البداية: التاريخ والأسامي بالإنجليزي (أرجوان الأول)
        lg79: 'Orjwan', lg80: '&', lg3: 'Dr. Mohammed', lg4: 'Wedding Day',
        lg26: 'Orjwan & Dr. Mohammed',
        // الكارت
        lg9: 'دعوة خاصة',
        lg10: 'بقلوب تملؤها المودة والحب',
        lg40: 'تتشرف عائلة الدكتور زيدان عبدالدائم',
        lg41: 'بدعوتكم لحضور حفل زفاف ابنتهم أرجوان',
        lg42: 'وذلك بمشيئة الله تعالىٰ يوم الخميس الموافق',
        lg81: 'عند الساعة 7:00 مساءً',
        lg45: 'في قاعة قلوريا',
        lg46: 'حضوركم يزيدنا فرحًا وسرورًا',
        // الموعد والمكان: اليوم والتاريخ مكان العنوان
        lg17: 'الخميس 12.11.2026',
      };
      return set;
    },
  },
  {
    // 5eO9JH5 — عنوان قسم الخريطة "مكان الحفل" (زي "Wedding Venue" في الصورة اللي المالك
    // بعتها) بدل "الموقع". بيتعمل بس لو العنوان لسه ماتعدّلش.
    name: '5eO9JH5-venue-title',
    shortId: '5eO9JH5',
    when: (c) => !((c.texts || {}).lg20),
    apply: (c) => ({ 'customizations.texts': { ...(c.texts || {}), lg20: 'مكان الحفل' } }),
  },
  {
    // KycrQqs — دعوة محمد وإسراء (custom-invitations/KycrQqs.js بيعرض الصفحة كلها بطلب
    // المالك). هنا بيانات الدعوة عشان لوحة العميل والعداد والخريطة: الجمعة 13/11/2026
    // الساعة 7 مساءً، قاعة ريلز بطلخا (الموقف الجديد، أمام معهد الدلتا). بيتعمل بس لو لسه مسودة.
    name: 'KycrQqs-mohamed-esraa',
    shortId: 'KycrQqs',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: 'wedding',
        hiddenSections: (inv.hiddenSections || []).filter((k) => k !== 'map'), timeline: inv.timeline, name: inv.name,
        groomName: 'Mohamed', groomNameAr: 'محمد',
        brideName: 'Esraa', brideNameAr: 'إسراء',
        venueName: 'قاعة ريلز بطلخا', venueCity: 'طلخا',
        venueAddress: 'الموقف الجديد — أمام معهد الدلتا',
        venueMapQuery: 'https://maps.app.goo.gl/DzExN2zKyepmvVoH6',
        weddingDate: '2026-11-13', weddingTime: '19:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'ar';
      return set;
    },
  },
  {
    // G1L8BxQ (Lily Garden بشكله — custom-invitations/G1L8BxQ.js) — أرجوان ود. محمد بطلب
    // المالك: الأسامي والتاريخ فوق إنجليزي وباقي الدعوة عربي. الكارت: دعوة خاصة / بقلوب
    // تملؤها المودة والحب / تتشرف عائلة الدكتور زيدان عبدالدائم بدعوتكم لحضور حفل زفاف
    // ابنتهم أرجوان. الموعد والمكان: وذلك بمشيئة الله تعالى يوم الخميس الموافق 12/11/2026
    // عند الساعة 7:30 في قاعة قلوريا. المكان: قاعة قلوريا للمناسبات الاجتماعية — طرابلس.
    // من غير تأكيد حضور وصور ضيوف. بيتعمل بس لو الدعوة لسه مسودة (Groom & Bride).
    name: 'G1L8BxQ-orjwan-mohammed',
    shortId: 'G1L8BxQ',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const hidden = [...new Set([...(inv.hiddenSections || []).filter((k) => k !== 'map' && k !== 'countdown'), 'rsvp', 'guestPhotos'])];
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: 'wedding',
        hiddenSections: hidden, timeline: inv.timeline, name: inv.name,
        groomName: 'Dr. Mohammed', groomNameAr: 'Dr. Mohammed',
        brideName: 'Orjwan', brideNameAr: 'Orjwan',
        venueName: 'قاعة قلوريا للمناسبات الاجتماعية', venueCity: 'طرابلس',
        venueAddress: 'طرابلس',
        venueMapQuery: 'https://maps.app.goo.gl/mx3Gfuy2yGDNfJz46',
        weddingDate: '2026-11-12', weddingTime: '19:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'ar';
      set.hiddenSections = hidden;
      set['customizations.texts'] = {
        ...(c.texts || {}),
        lg79: 'Orjwan', lg80: '&', lg3: 'Dr. Mohammed', lg4: 'Wedding Day',
        lg26: 'Orjwan & Dr. Mohammed',
        lg9: 'دعوة خاصة',
        lg10: 'بقلوب تملؤها المودة والحب',
        lg40: 'تتشرف عائلة الدكتور زيدان عبدالدائم',
        lg41: 'بدعوتكم لحضور حفل زفاف ابنتهم أرجوان',
        lg15: 'وذلك بمشيئة الله تعالىٰ',
        lg16: 'يوم الخميس الموافق 12/11/2026',
        lg17: 'عند الساعة 7:30 مساءً',
        lg18: 'في قاعة قلوريا',
        lg20: 'مكان الحفل',
      };
      return set;
    },
  },
  {
    // Dcx7Jny — أفراح عائلات السنور وأبو المجد وآل عبد اللطيف (فرحين في ليلة واحدة؛
    // custom-invitations/Dcx7Jny.js بيعرض الصفحة). هنا بيانات الدعوة عشان لوحة العميل
    // والعنوان: الخميس 19/11/2026 بعد العشاء (7 مساءً)، كفر الشيخ. بيتعمل بس لو لسه مسودة.
    name: 'Dcx7Jny-double-wedding',
    shortId: 'Dcx7Jny',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Mahmoud & Tarek', groomNameAr: 'محمود وطارق',
        brideName: 'Zeinab & Azza', brideNameAr: 'زينب وعزة',
        venueName: 'مكان الحفل', venueCity: 'كفر الشيخ',
        venueMapQuery: 'https://maps.app.goo.gl/2BAnL5vjDAa4hhcW9',
        weddingDate: '2026-11-19', weddingTime: '19:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'ar';
      return set;
    },
  },
  {
    // vma4JMh (Ivory Swans بشكله الإنجليزي — custom-invitations/vma4JMh.js) — إسلام وبسنت
    // بطلب المالك (2026-11-03): الأسامي على الغلاف Islam & Basant، والفرح الأحد 20/12/2026
    // (الاستقبال 4:30 العصر — العدّاد لحد الساعة دي)، في Bait Yazd — شبرامنت، أبو النمرس
    // بلينك الخريطة اللي بعته. الخريطة نفسها على إحداثيات الـ plus code بتاع اللينك
    // (W5HX+26F → 29.9275625,31.1980469): اسم المكان لوحده كان بيطلّع خريطة القاهرة كلها.
    // والد العريس هشام عبيد ووالد العروسة محمد حسين؛ سطر "عائلات العدوي وعائلات حسانين"
    // (كلام القالب) مستخبي لحد ما المالك يبعت أسامي العائلتين. فورم تأكيد الحضور بالعربي،
    // وخانة "حساسية الأكل" بقت "اترك لنا رسالة". بيتعمل بس لو الدعوة لسه مسودة (Groom & Bride).
    name: 'vma4JMh-islam-basant',
    shortId: 'vma4JMh',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'ivory-swans' && inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const link = 'https://maps.app.goo.gl/qEbLamzXHEeLJQ3GA';
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: inv.language, occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Islam', groomNameAr: 'إسلام',
        brideName: 'Basant', brideNameAr: 'بسنت',
        venueName: 'Bait Yazd', venueCity: 'Shubra Ment, Abu El Numrus',
        venueMapQuery: link,
        weddingDate: '2026-12-20', weddingTime: '16:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.venueMapEmbedSrc = 'https://www.google.com/maps?q=29.9275625,31.1980469&z=16&output=embed';
      set.venueMapDirectLink = link;
      set['customizations.texts'] = {
        ...(c.texts || {}),
        // الغلاف
        '1779566247730000001__1': 'Islam',
        '1779566247730000001__2': 'Basant',
        '1779566247730000003': '20.12.2026',
        // تحت نتيجة "احفظ الموعد"
        iv40: 'الأحد ٢٠ / ١٢ / ٢٠٢٦',
        // الآباء
        iv24: 'هشام عبيد',
        iv26: 'محمد حسين',
        // تحت اسم المكان في كارت الخريطة (كان "دار الحرس الجهوري" بتاع القالب)
        iv30: 'Shubra Ment, Abu El Numrus, Egypt',
      };
      set['customizations.hidden'] = [...new Set([...(c.hidden || []), 'iv22'])];
      set['customizations.rsvp'] = {
        ...(c.rsvp || {}),
        title: 'شرّفنا بتأكيد حضورك',
        intro: 'وجودك معنا يكمّل فرحتنا',
        nameLabel: 'اسمك',
        yesLabel: 'سأحضر بإذن الله',
        noLabel: 'أعتذر عن الحضور',
        foodLabel: 'اترك لنا رسالة',
        submit: 'تأكيد الحضور',
      };
      return set;
    },
  },
  {
    // vma4JMh — المالك بعت تهجية الأسامي بالإنجليزي (2026-11-04): Eslam & Bassant مش
    // Islam & Basant، "من بره الكارت ومن جوه ومن كل حتة": أسامي الدعوة (عنوان كارت
    // المشاركة وتاب المتصفح)، والغلاف، وأي نص في الدعوة فيه التهجية القديمة. الأسامي
    // بالعربي (إسلام وبسنت) زي ما هي. بيغيّر بس اللي لسه بالتهجية القديمة بالظبط.
    name: 'vma4JMh-eslam-bassant',
    shortId: 'vma4JMh',
    select: 'customizations groomName brideName name',
    when: (c, inv) => inv.groomName === 'Islam' || inv.brideName === 'Basant'
      || /\b(?:Islam|Basant)\b/.test(JSON.stringify([inv.name, c.texts, c.added, c.share])),
    apply(c, inv) {
      const OLD = /\b(?:Islam|Basant)\b/;
      const fix = (s) => String(s).replace(/\bIslam\b/g, 'Eslam').replace(/\bBasant\b/g, 'Bassant');
      const set = {};
      if (inv.groomName === 'Islam') set.groomName = 'Eslam';
      if (inv.brideName === 'Basant') set.brideName = 'Bassant';
      if (OLD.test(inv.name || '')) set.name = fix(inv.name);
      const texts = c.texts || {};
      if (Object.values(texts).some((t) => typeof t === 'string' && OLD.test(t))) {
        set['customizations.texts'] = Object.fromEntries(Object.entries(texts)
          .map(([k, v]) => [k, typeof v === 'string' ? fix(v) : v]));
      }
      const added = Array.isArray(c.added) ? c.added : [];
      if (added.some((a) => a && typeof a.text === 'string' && OLD.test(a.text))) {
        set['customizations.added'] = added.map((a) => (a && typeof a.text === 'string' ? { ...a, text: fix(a.text) } : a));
      }
      const share = c.share || {};
      if (OLD.test(share.title || '') || OLD.test(share.description || '')) {
        set['customizations.share'] = { ...share, title: fix(share.title || ''), description: fix(share.description || '') };
      }
      return set;
    },
  },
  {
    // qosQhk1 (Champagne Lace عربي) — المالك (2026-11-04): عنوان كارت لينك المشاركة
    // "دعوة حفل زفاف عبدالشافي الغامدي" بدل "دعوة فرح عبدالشافي الغامدي و فتون الشامخي"
    // (الاسم لازق زي ما العميل كاتبه في الدعوة). الوصف (التاريخ والمكان) زي ما هو، والعنوان
    // بيتعدّل من "كارت المشاركة" في المحرر. بيتعمل بس لو مفيش عنوان مكتوب والدعوة
    // ماتعدّلتش بعد الطلب — فلو العميل غيّره أو مسحه بعد كده مابنرجّعوش.
    name: 'qosQhk1-share-title',
    shortId: 'qosQhk1',
    select: 'customizations updatedAt',
    when: (c, inv) => !((c.share || {}).title) && new Date(inv.updatedAt || 0) < new Date('2026-11-04T03:00:00Z'),
    apply: (c) => ({ 'customizations.share': { ...(c.share || {}), title: 'دعوة حفل زفاف عبدالشافي الغامدي' } }),
  },
  {
    // G1L8BxQ — المالك (2026-11-04): "أرجوان" في سطر لوحده وبخط أكبر تحت "بدعوتكم لحضور حفل
    // زفاف ابنتهم" — السطر نفسه (g1b) بيتحط في custom-invitations/G1L8BxQ.js، وهنا بنشيل الاسم
    // من آخر السطر اللي فوقه. بيتعمل بس لو السطر لسه زي ما احنا كاتبينه بالظبط.
    name: 'G1L8BxQ-bride-own-line',
    shortId: 'G1L8BxQ',
    when: (c) => (c.texts || {}).lg41 === 'بدعوتكم لحضور حفل زفاف ابنتهم أرجوان',
    apply: (c) => ({ 'customizations.texts': { ...(c.texts || {}), lg41: 'بدعوتكم لحضور حفل زفاف ابنتهم' } }),
  },
  {
    // DBywdm2 (custom-invitations/DBywdm2.js بيعرض الصفحة كلها) — دعوة "صدف" بطلب المالك
    // (2026-11-05). هنا بيانات الدعوة عشان لوحة العميل وملف التقويم يبقوا زي الصفحة: نفس كلام
    // التصميم (Cornelia & James) لحد ما المالك يبعت التعديلات. بيتعمل بس لو الدعوة لسه فاضية.
    name: 'DBywdm2-mother-of-pearl',
    shortId: 'DBywdm2',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'en', occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'James', groomNameAr: 'James',
        brideName: 'Cornelia', brideNameAr: 'Cornelia',
        venueName: 'Villa Aurelia', venueCity: 'Rome, Italy',
        venueMapQuery: 'https://www.google.com/maps/search/?api=1&query=Villa+Aurelia+Rome+Italy',
        weddingDate: '2027-05-20', weddingTime: '16:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'en';
      return set;
    },
  },
  {
    // DBywdm2 — المالك بعت كلام الكارت الأساسي (2026-11-06): Ahmed & Faten، الخميس 3/12/2026،
    // Royal Garden · 6th October city. هنا نفس الأسامي والتاريخ والمكان عشان لوحة العميل وصفحة
    // الإحصائيات وملف التقويم يبقوا زي الصفحة. الساعة لسه 4:30 مساءً (أول برنامج اليوم اللي في
    // الصفحة) لحد ما المالك يبعت ميعاد الفرح. بيغيّر الحقول دي بس، ومش بيتعمل غير لو البيانات لسه
    // بتاعة التصميم (James & Cornelia).
    name: 'DBywdm2-ahmed-faten',
    shortId: 'DBywdm2',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'James' && inv.brideName === 'Cornelia',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'en', occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Ahmed', groomNameAr: 'أحمد',
        brideName: 'Faten', brideNameAr: 'فاتن',
        venueName: 'Royal Garden', venueCity: '6th October city',
        weddingDate: '2026-12-03', weddingTime: '16:30',
      }, { ownsTemplate: true });
      const set = {};
      ['groomName', 'groomNameAr', 'brideName', 'brideNameAr', 'venueName', 'venueCity',
        'venueMapQuery', 'venueMapEmbedSrc', 'venueMapDirectLink', 'weddingDateTime']
        .forEach((k) => { set[k] = data[k]; });
      return set;
    },
  },
  {
    // DBywdm2 — المالك بعت لوكيشن القاعة على جوجل ماب (2026-11-06): Royal Garden، أكتوبر. نفس
    // اللينك اللي على زرار Get Directions في الصفحة، وهنا عشان ملف التقويم ولوحة العميل. بيتعمل بس
    // لو الخريطة لسه على البحث بالاسم اللي حطّه التعديل اللي فوق، فلو العميل غيّرها مابنلمسهاش.
    name: 'DBywdm2-map-link',
    shortId: 'DBywdm2',
    select: 'venueName venueCity venueMapQuery venueMapEmbedSrc venueMapDirectLink',
    when: (c, inv) => inv.venueMapQuery === 'Royal Garden, 6th October city',
    async apply(c, inv) {
      const { resolveMapInput } = require('./mapsLink');
      const LINK = 'https://maps.app.goo.gl/9i2n8wZs99jj6ZMU8';
      const { embedSrc, directLink } = await resolveMapInput({ raw: LINK, venueName: inv.venueName, venueCity: inv.venueCity });
      return { venueMapQuery: LINK, venueMapEmbedSrc: embedSrc, venueMapDirectLink: directLink };
    },
  },
  {
    // DBywdm2 — المالك (2026-11-06) بعت الأغنية بنفسه (ملف) بدل "ميكس رهيب" اللي كانت من مكتبة
    // الموسيقى (التعديل اللي كان حاططها اتشال). الأغنية دلوقتي ملف الدعوة نفسها
    // (client/public/custom/DBywdm2/song.mp3، custom-invitations/DBywdm2.js)، فهنا بنشيل اختيار المكتبة
    // بس لو لسه هو نفس الأغنية اللي احنا حاطينها — لو العميل اختار أغنية تانية بعد كده مابنلمسهاش.
    name: 'DBywdm2-song-owner-file',
    shortId: 'DBywdm2',
    when: (c) => c.audioUrl === 'https://res.cloudinary.com/dxtkmyscw/video/upload/v1790882611/mithaq/library/music/yioeqw9kekdxie32eu2a.mp3',
    apply: () => ({ 'customizations.audioUrl': '' }),
  },
  {
    // DBywdm2 — المالك كتب ميعاد الفرح في الختام (2026-11-07): الساعة 6:00 مساءً. البيانات كانت على 4:30
    // (أول برنامج اليوم اللي كان في التصميم)؛ هنا عشان لوحة العميل والإحصائيات يبقوا زي الدعوة. التاريخ
    // بيتبني بتوقيت السيرفر زي buildInvitationDataFromRequest بالظبط. بيتعمل بس لو لسه 4:30.
    name: 'DBywdm2-time-6pm',
    shortId: 'DBywdm2',
    select: 'groomName weddingDateTime',
    when: (c, inv) => {
      if (inv.groomName !== 'Ahmed' || !inv.weddingDateTime) return false;
      const d = new Date(inv.weddingDateTime);
      return d.getFullYear() === 2026 && d.getMonth() === 11 && d.getDate() === 3 && d.getHours() === 16 && d.getMinutes() === 30;
    },
    apply: () => ({ weddingDateTime: new Date(2026, 11, 3, 18, 0, 0) }),
  },
  {
    // G1L8BxQ — المالك بعت لوكيشن صالة قلوريا للمناسبات الاجتماعية (2026-11-04). الدبوس القديم كان
    // على نفس الإحداثيات بس من غير اسم الصالة، والاسم الوحيد اللي باين جنبه "قاعة فيدا". دلوقتي
    // الخريطة هي تضمين المالك نفسه (المكان باسمه، الخريطة العادية مش القمر الصناعي، وبالعربي)،
    // و"اعرف الطريق" بيفتح لينكه. بيتعمل بس لو الخريطة لسه على اللينك القديم.
    name: 'G1L8BxQ-exact-map',
    shortId: 'G1L8BxQ',
    select: 'venueMapQuery venueMapEmbedSrc venueMapDirectLink',
    when: (c, inv) => inv.venueMapDirectLink === 'https://maps.app.goo.gl/mx3Gfuy2yGDNfJz46',
    apply: () => ({
      venueMapQuery: 'https://maps.app.goo.gl/f5UXnL5iVY1Rf7xj9',
      venueMapDirectLink: 'https://maps.app.goo.gl/f5UXnL5iVY1Rf7xj9',
      venueMapEmbedSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2062.5418673648164!2d13.2370507!3d32.8333614!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13a893001038270b%3A0x153337343bc6a4ee!2z2LXYp9mE2Kkg2YLZhNmI2LHZitinINmE2YTZhdmG2KfYs9io2KfYqiDYp9mE2KfYrNiq2YXYp9i52YrYqQ!5e0!3m2!1sar!2sly!4v1793754680147!5m2!1sar!2sly',
    }),
  },
  {
    // j4jpczb (custom-invitations/j4jpczb.js بيعرض الصفحة كلها) — دعوة ساري وسونا بطلب المالك
    // (2026-11-05). هنا بيانات الدعوة عشان لوحة العميل والإحصائيات وتأكيد الحضور وملف التقويم:
    // السبت 5/12/2026 الساعة 7:30 مساءً (وصول المعازيم)، مطعم درج الياسمين — عود ميثا، دبي،
    // ورفع صور الضيوف شغال. بيتعمل بس لو الدعوة لسه فاضية (Groom & Bride).
    name: 'j4jpczb-sari-sona',
    shortId: 'j4jpczb',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const link = 'https://maps.app.goo.gl/Rnd2ugLWjWuqQxheA';
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'en', occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Sari', groomNameAr: 'ساري',
        brideName: 'Sona', brideNameAr: 'سونا',
        venueName: 'Daraj Al Yasmine Restaurant', venueCity: 'Dubai',
        venueAddress: 'Metha Plaza, Oud Metha, Dubai',
        venueMapQuery: link,
        weddingDate: '2026-12-05', weddingTime: '19:30',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'en';
      // لينك الآيفون (g_st=iw) مالوش إحداثيات — الخريطة على اسم المطعم نفسه (بتطلع كارته واسمه)
      set.venueMapEmbedSrc = 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sDaraj+Al+Yasmine+Restaurant,+Oud+Metha,+Dubai!6i17';
      set.venueMapDirectLink = link;
      set['guestExtras.photos'] = true;
      return set;
    },
  },
  {
    // j4jpczb — المالك (2026-11-05): الأغنية "ألف الصلاة وألف السلام" لحسين الجسمي من مكتبة
    // الموسيقى (المالك رافعها من لوحة التحكم) — كأن العميل اختارها من تبويب الموسيقى في المحرر.
    // بيتعمل بس لو مفيش أغنية متختارة، فلو العميل غيّرها بعد كده مابنرجّعهاش.
    name: 'j4jpczb-song-aljasmi',
    shortId: 'j4jpczb',
    when: (c) => !c.audioUrl,
    async apply() {
      const Track = require('../models/Track');
      const norm = (t) => String(t || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
      const isSong = (t) => /الف\s*(ال)?صلا|صلاه\s*و\s*(ال)?سلام|alf\W*(a|e)?l?\W*sala/.test(norm(t.title));
      const isJasmi = (t) => /جسمي|jas+mi/.test(norm(`${t.artist} ${t.title}`));
      const tracks = await Track.find({ active: true }).sort({ createdAt: -1 }).select('title artist url').lean();
      const pick = tracks.filter(isSong).sort((a, b) => Number(isJasmi(b)) - Number(isJasmi(a)))[0];
      if (!pick || !/^https:\/\/res\.cloudinary\.com\//.test(pick.url)) {
        console.log('[oneOffFix] j4jpczb-song-aljasmi: track not found in the library');
        return { 'customizations.audioUrl': '' };
      }
      console.log(`[oneOffFix] j4jpczb-song-aljasmi: ${pick.title} — ${pick.artist} (${pick.url})`);
      return { 'customizations.audioUrl': pick.url, 'customizations.audioStart': 0, 'customizations.audioEnd': 0 };
    },
  },
  {
    // j4jpczb — العريس بيتكتب Sary مش Sari (بطلب المالك 2026-11-07). الصفحة نفسها في
    // custom-invitations/j4jpczb.html؛ ده الاسم في اللوحة والإحصائيات وعنوان اللينك.
    name: 'j4jpczb-sary',
    shortId: 'j4jpczb',
    select: 'customizations groomName',
    when: (c, inv) => inv.groomName === 'Sari',
    async apply() {
      return { groomName: 'Sary' };
    },
  },
  {
    // mHdbDd1 (Champagne Lace، غلاف الباب في custom-invitations/mHdbDd1.js) — بطلب المالك
    // (2026-11-08) كلام كارت العيلة: عربي، سامح وسارة، الجمعة 25/12/2026 الساعة 8 مساءً،
    // قاعة التوليب — دار الدفاع الجوي، مصر الجديدة (الخريطة على دار الدفاع الجوي، شارع
    // النزهة). "السعدوني" مش "السعدوفي" زي ما المالك قال. الأسامي بالألقاب في الكارت بس
    // (cl3/cl5) — اسم الدعوة وعنوان اللينك "سامح و سارة".
    // بيتعمل بس لو الدعوة لسه بأسامي المسودة ومحدش كتب في الكارت.
    name: 'mHdbDd1-sameh-sara',
    shortId: 'mHdbDd1',
    select: '-__v',
    when: (c, inv) => inv.templateId === 'champagne-lace' && inv.groomName === 'Groom'
      && inv.brideName === 'Bride' && !((c.texts || {}).cl1),
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'ar', occasionType: inv.occasionType,
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'سامح', groomNameAr: 'سامح',
        brideName: 'سارة', brideNameAr: 'سارة',
        venueName: 'قاعة التوليب', venueCity: 'دار الدفاع الجوي - مصر الجديدة',
        venueMapQuery: '30.0759354,31.3379696',
        weddingDate: '2026-12-25', weddingTime: '20:00',
      }, { ownsTemplate: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set['customizations.texts'] = {
        ...(c.texts || {}),
        cl1: 'يتشرف عقيد مهندس عبد الله عزازي وعقيد ياسر السعدوني',
        cl2: 'بدعوتكم لمشاركتهم فرحة زفاف نجليهما',
        cl3: 'دكتور مهندس سامح',
        cl5: 'دكتورة سارة',
        cl9: 'يوم الجمعة',
        cl10: 'في تمام الساعة الثامنة مساءً',
        cl13: 'بمشاركتكم لنا فرحتنا، تكتمل سعادتنا',
        cl14: 'وتزداد حياتنا بهجةً وسرورًا',
      };
      return set;
    },
  },
  {
    // mHdbDd1 — المالك (2026-11-08) رجّع آية سورة الروم في كارت الآية بدل دعاء "بارك الله
    // لكما..." اللي كان التعديل اللي فوق حاطه (cl91–cl93). بيتشالوا بس لو لسه هما نفس الدعاء.
    name: 'mHdbDd1-verse-back',
    shortId: 'mHdbDd1',
    select: 'customizations',
    when: (c) => (c.texts || {}).cl91 === 'بَارَكَ اللَّهُ لَكُمَا'
      && (c.texts || {}).cl92 === 'وَبَارَكَ عَلَيْكُمَا' && (c.texts || {}).cl93 === 'وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    apply(c) {
      const texts = { ...(c.texts || {}) };
      delete texts.cl91; delete texts.cl92; delete texts.cl93;
      return { 'customizations.texts': texts };
    },
  },
  {
    // mHdbDd1 — المالك (2026-11-08) شال قسم ألبوم الصور ("ذكرياتنا" — صور القالب الافتراضية،
    // تلات صور ظاهرين). نفس مفتاح "إخفاء قسم" بتاع المحرر (hiddenSections: 'album')، فصاحبها
    // يقدر يرجّعه. بيتعمل بس لو الألبوم لسه ظاهر وبصور القالب (محدش رفع صور cl62–cl65) —
    // لو رجّعه بصوره هو مابنلمسوش.
    name: 'mHdbDd1-no-album',
    shortId: 'mHdbDd1',
    select: 'customizations hiddenSections templateId',
    when: (c, inv) => inv.templateId === 'champagne-lace' && !(inv.hiddenSections || []).includes('album')
      && !['cl62', 'cl63', 'cl64', 'cl65'].some((id) => (c.images || {})[id]),
    apply(c, inv) {
      return { hiddenSections: [...(inv.hiddenSections || []), 'album'] };
    },
  },
  {
    // mHdbDd1 — المالك (2026-11-08): الأسامي في أول كارت بالإنجليزي زي الدعوة الإنجليزي
    // (Dr. Eng. Sameh & Dr. Sara — الشكل في custom-invitations/mHdbDd1.js)، والعدّاد بقى
    // كارت التاريخ بخط كبير (cl30 فوق "يوم زفافنا"، cl41 الساعة تحت التاريخ)، وقسم
    // "أكّد حضورك" اتشال بمفتاح إخفاء القسم بتاع المحرر (hiddenSections: 'rsvp').
    // بيتعمل بس لو الأسامي لسه بالعربي اللي حطّه التعديل الأول ومحدش غيّرها.
    name: 'mHdbDd1-english-names-datecard',
    shortId: 'mHdbDd1',
    select: 'customizations hiddenSections',
    when: (c) => (c.texts || {}).cl3 === 'دكتور مهندس سامح' && (c.texts || {}).cl5 === 'دكتورة سارة',
    apply(c, inv) {
      const hidden = inv.hiddenSections || [];
      return {
        'customizations.texts': {
          ...(c.texts || {}),
          cl3: 'Dr. Eng. Sameh',
          cl4: '&',
          cl5: 'Dr. Sara',
          cl30: 'نتشرف بحضوركم',
          cl41: 'في تمام الساعة الثامنة مساءً',
        },
        hiddenSections: hidden.includes('rsvp') ? hidden : [...hidden, 'rsvp'],
      };
    },
  },
  {
    // mHdbDd1 — المالك (2026-11-08) بعت الأغنية بنفسه (ملف) مكان الأغنية اللي كانت مرفوعة من المحرر.
    // الأغنية دلوقتي ملف الدعوة نفسها (client/public/custom/mHdbDd1/song.mp3، custom-invitations/mHdbDd1.js)،
    // فهنا بنشيل الأغنية المرفوعة بس لو لسه هي نفسها — لو العميل اختار أغنية تانية بعد كده مابنلمسهاش.
    name: 'mHdbDd1-song-owner-file',
    shortId: 'mHdbDd1',
    when: (c) => c.audioUrl === 'https://res.cloudinary.com/dxtkmyscw/video/upload/v1794101504/mithaq/users/6ac259d576f8e4b7f5938280/audio/ylm93quecw8riucddzau.mp3',
    apply: () => ({ 'customizations.audioUrl': '', 'customizations.audioStart': 0, 'customizations.audioEnd': 0 }),
  },
  {
    // lqxsipV (custom-invitations/lqxsipV.js بيعرض الصفحة كلها) — دعوة هاجر ونور بطلب المالك
    // (2026-11-08). هنا بيانات الدعوة عشان لوحة العميل والإحصائيات وتأكيد الحضور وعنوان اللينك:
    // الفرح السبت 12/12/2026 الساعة 5 مساءً في هيلتون بيراميدز جولف (كتب الكتاب 4/12 في الصفحة نفسها).
    // بيتعمل بس لو الدعوة لسه فاضية (Groom & Bride).
    name: 'lqxsipV-hagar-nour',
    shortId: 'lqxsipV',
    select: '-__v',
    when: (c, inv) => inv.groomName === 'Groom' && inv.brideName === 'Bride',
    async apply(c, inv) {
      const { buildInvitationDataFromRequest } = require('./invitationData');
      const link = 'https://maps.app.goo.gl/x86DDYn19JRmv48b9';
      const data = await buildInvitationDataFromRequest({
        templateId: inv.templateId, language: 'en', occasionType: 'wedding',
        hiddenSections: inv.hiddenSections, timeline: inv.timeline, name: inv.name,
        groomName: 'Nour', groomNameAr: 'نور',
        brideName: 'Hagar', brideNameAr: 'هاجر',
        venueName: 'Hilton Pyramids Golf', venueCity: '6th of October',
        venueAddress: 'El Wahat Road, 6th of October City, Giza',
        venueMapQuery: link,
        weddingDate: '2026-12-12', weddingTime: '17:00',
      }, { ownsTemplate: true, skipMapNetwork: true });
      const set = {};
      Object.keys(data).forEach((k) => { set[k] = data[k]; });
      set.language = 'en';
      set.venueMapEmbedSrc = 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sHilton+Pyramids+Golf,+6th+of+October!6i16';
      set.venueMapDirectLink = link;
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
