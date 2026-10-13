// محتوى لوحة "محتاج مساعدة؟" في المحرر + خطوات "وريني" لكل سؤال.
//
// كل سؤال فيه:
//   q        — السؤال زي ما العميل بيسأله بالظبط
//   steps    — الإجابة في 2-4 خطوات قصيرة (1، 2، 3)
//   example  — مثال من الحياة (اختياري)
//   feature  — لو الميزة جزء من باقة (music/images/...) بنقول للعميل إنها مقفولة
//   tour(ctx)— خطوات الجولة المرشدة. كل خطوة بتنوّر مكان حقيقي في المحرر
//              (data-help="...") وتقول تعمل إيه هناك.
//
// خطوات الجولة **مبتعدّلش أي حاجة في الدعوة أبدًا**: أقصى حاجة بتعملها إنها
// تفتح تبويب (tab). والأزرار الخطيرة (نشر/مسح/رجّع لأصلها/شغّل) بتتنوّر بس
// والضغط عليها مقفول طول ما الجولة شغالة (الأصل في أي خطوة: الضغط مقفول،
// إلا لو الخطوة قالت allowClick — ودي للتبويبات بس).
//
// أهداف خاصة جوه الدعوة نفسها (الـ iframe):
//   frame:text — أول جملة ظاهرة في الدعوة
//   frame:date — التاريخ (جملة فيها سنة)
//   frame:map  — الخريطة
//   frame:image— أول صورة ظاهرة
// لو الهدف مش موجود، الجولة بتجرّب اللي بعده في القايمة، ولو مفيش خالص
// بتعرض الكارت في نص الشاشة من غير ما تقع.
import {
  Compass, PenLine, CalendarDays, ImageIcon, Music, TypeOutline, Move, Palette,
  Trash2, MapPin, Share2, Rocket, Undo2, PlayCircle, ClipboardCheck,
} from 'lucide-react';

/** خطوة "افتح التبويب ده" — العميل يقدر يدوس على التبويب نفسه وهو منوّر */
const tabStep = (id, ar, en) => ({
  target: `tab-${id}`,
  tab: null,
  allowClick: true,
  advanceOnClick: true,
  title: { ar: ar.title, en: en.title },
  body: { ar: ar.body, en: en.body },
});

/** خطوة الباقة المقفولة — بتوري اللوحة المقفولة وزرار الترقية */
const lockedStep = (tab) => ({
  target: ['locked', 'panel'],
  tab,
  title: { ar: 'الميزة دي مش في باقتك', en: 'Not in your package' },
  body: {
    ar: 'تقدر ترقّي الباقة من الزرار ده وبعدها تستخدمها على طول.',
    en: 'Upgrade your package from this button to use it right away.',
  },
});

export const QUICK_TOUR_ID = 'quick';

export const HELP_TOPICS = [
  // ===== جولة سريعة =====
  {
    id: QUICK_TOUR_ID,
    icon: Compass,
    q: { ar: 'جولة سريعة في المحرر (دقيقة)', en: 'Quick tour of the editor (1 min)' },
    keywords: { ar: 'ابدأ شرح جولة اول مرة فين ايه', en: 'start tour first time overview' },
    steps: {
      ar: [
        'دعوتك في النص — اضغط على أي حاجة فيها وعدّلها.',
        'الأدوات على اليمين: الخط، الصور، الموسيقى، والمشاركة.',
        'كل حاجة بتتحفظ لوحدها، ولما تخلص انشر الدعوة.',
      ],
      en: [
        'Your invitation is in the middle — click anything in it to edit.',
        'Tools are on the side: font, photos, music and sharing.',
        'Everything saves by itself; publish when you are done.',
      ],
    },
    tour: (ctx) => [
      {
        target: 'preview',
        title: { ar: 'دي دعوتك', en: 'This is your invitation' },
        body: {
          ar: 'دي الدعوة زي ما ضيوفك هيشوفوها بالظبط. اضغط على أي كلام أو صورة فيها عشان تعدّلها على طول.',
          en: 'Exactly what your guests will see. Click any text or photo in it to edit it directly.',
        },
      },
      {
        target: 'tabs',
        title: { ar: 'أدوات التعديل', en: 'Editing tools' },
        body: {
          ar: 'كل تبويب هنا ليه شغلانة: الخط، الصور، الموسيقى، التحريك، الأقسام، وشكل اللينك على واتساب.',
          en: 'Each tab has one job: font, photos, music, moving things, sections, and how the link looks on WhatsApp.',
        },
      },
      {
        target: 'save-status',
        title: { ar: 'مفيش زرار حفظ', en: 'No save button needed' },
        body: {
          ar: 'أي تعديل بيتحفظ لوحده في ثانية. هنا بتشوف «كل حاجة متحفظة» أو «بيتحفظ...».',
          en: 'Every change saves itself within a second. Watch the status here.',
        },
      },
      {
        target: 'undo-redo',
        title: { ar: 'غلطت؟ ارجع', en: 'Made a mistake? Go back' },
        body: {
          ar: 'السهم ده بيرجّعك خطوة لورا (أو Ctrl+Z)، واللي جنبه بيعيدها.',
          en: 'This arrow undoes the last step (or Ctrl+Z); the other one redoes it.',
        },
      },
      {
        target: 'play-btn',
        title: { ar: 'شوفها زي الضيف', en: 'See it like a guest' },
        body: {
          ar: 'بيشغّل الدعوة من أولها بشاشة الغلاف والموسيقى، زي ما الضيف هيفتحها بالظبط.',
          en: 'Plays the invitation from the start with the cover and music, exactly like a guest opens it.',
        },
      },
      ctx.isDraft
        ? {
          target: 'publish-btn',
          title: { ar: 'لما تخلص: انشر', en: 'When done: publish' },
          body: {
            ar: 'دعوتك لسه مسودة محدش شايفها. النشر بيشغّل اللينك وبيخصم دعوة واحدة من رصيدك.',
            en: 'Your invitation is still a private draft. Publishing turns the link on and uses one invitation from your balance.',
          },
        }
        : {
          target: ['copy-link', 'publish-bar'],
          title: { ar: 'لينك دعوتك', en: 'Your invitation link' },
          body: {
            ar: 'دعوتك منشورة. من هنا تنسخ اللينك وتبعته لضيوفك.',
            en: 'Your invitation is live. Copy the link from here and send it to your guests.',
          },
        },
      {
        target: 'help-panel',
        title: { ar: 'وأي وقت تتوه…', en: 'And whenever you get stuck…' },
        body: {
          ar: 'الأسئلة كلها هنا. اختار سؤالك ودوس «وريني» ونوريك المكان بالظبط.',
          en: 'All the answers live here. Pick a question and press “Show me”.',
        },
      },
    ],
  },

  // ===== تعديل الكلام =====
  {
    id: 'edit-text',
    icon: PenLine,
    q: { ar: 'إزاي أعدّل أي كلام في الدعوة؟', en: 'How do I change any text?' },
    keywords: { ar: 'اكتب اسم اسماء العريس العروسة جملة كلمة نص كلام اغير', en: 'write name names bride groom sentence word text change' },
    steps: {
      ar: [
        'اضغط على الجملة نفسها جوه الدعوة.',
        'اكتب الكلام الجديد مكان القديم.',
        'اضغط علامة ✓ أو Enter — وبيتحفظ لوحده.',
      ],
      en: [
        'Click the sentence itself inside the invitation.',
        'Type the new words over the old ones.',
        'Press ✓ or Enter — it saves by itself.',
      ],
    },
    example: {
      ar: 'عايز تكتب اسم العروسة؟ اضغط على «Bride»، امسحها واكتب «سارة»، ودوس Enter. ولو غيّرت اسم، بيتغيّر في الدعوة كلها مرة واحدة.',
      en: 'Want the bride’s name? Click “Bride”, type “Sara” and press Enter. A changed name updates everywhere at once.',
    },
    tour: () => [
      {
        target: ['frame:text', 'preview'],
        tab: 'inline',
        title: { ar: 'اضغط على أي جملة', en: 'Click any sentence' },
        body: {
          ar: 'أي كلام زي ده في الدعوة: اضغط عليه وهيتفتح للكتابة على طول.',
          en: 'Any text like this one: click it and it opens for typing right away.',
        },
      },
      {
        target: 'inline-icons',
        tab: 'inline',
        title: { ar: 'الأيقونات اللي فوق الجملة', en: 'The icons above the sentence' },
        body: {
          ar: 'فوق الجملة هيطلعلك شريط صغير: القلم للكتابة، ✓ لما تخلص، والسلة لو عايز تشيلها.',
          en: 'A small bar appears above it: pencil to type, ✓ when done, bin to remove it.',
        },
      },
      {
        target: 'save-status',
        title: { ar: 'بيتحفظ لوحده', en: 'Saves automatically' },
        body: {
          ar: 'أول ما تخلص هتشوف هنا «اتحفظ» — مش محتاج تدوس أي زرار.',
          en: 'Once you finish you will see “Saved” here — no button needed.',
        },
      },
    ],
  },

  // ===== التاريخ والساعة =====
  {
    id: 'date-time',
    icon: CalendarDays,
    q: { ar: 'إزاي أغيّر التاريخ أو الساعة؟', en: 'How do I change the date or time?' },
    keywords: { ar: 'تاريخ يوم ساعة وقت ميعاد عداد تنازلي شهر سنة', en: 'date day time hour countdown month year' },
    steps: {
      ar: [
        'اضغط على التاريخ جوه الدعوة.',
        'على اليمين هتظهرلك «تاريخ الفرح»: اختار اليوم والساعة.',
        'الدعوة والعداد التنازلي بيتظبطوا لوحدهم.',
      ],
      en: [
        'Click the date inside the invitation.',
        '“Wedding date” appears on the side: pick the day and time.',
        'The invitation and countdown update by themselves.',
      ],
    },
    example: {
      ar: 'لو الساعة مكتوبة بالكلام (زي «الساعة السابعة مساءً»)، اضغط عليها وعدّلها زي أي جملة عادية.',
      en: 'If the time is written in words (like “at seven in the evening”), click it and edit it like any sentence.',
    },
    tour: () => [
      {
        target: ['frame:date', 'frame:text', 'preview'],
        tab: 'inline',
        title: { ar: 'اضغط على التاريخ', en: 'Click the date' },
        body: {
          ar: 'اضغط على التاريخ نفسه في الدعوة.',
          en: 'Click the date itself in the invitation.',
        },
      },
      {
        target: 'selected-panel',
        tab: 'inline',
        title: { ar: 'هنا تختار اليوم والساعة', en: 'Pick the day and time here' },
        body: {
          ar: 'أول ما تضغط على التاريخ، هنا هيظهرلك نتيجة تختار منها اليوم، وخانة للساعة. العداد التنازلي بيمشي وراهم.',
          en: 'Once you click the date, a calendar and a time box show up here. The countdown follows them.',
        },
      },
    ],
  },

  // ===== الصور =====
  {
    id: 'photos',
    icon: ImageIcon,
    feature: 'images',
    q: { ar: 'إزاي أغيّر صورة؟', en: 'How do I change a photo?' },
    keywords: { ar: 'صورة صور الصور ارفع غير بدل البوم', en: 'photo photos image picture upload replace album' },
    steps: {
      ar: [
        'افتح تبويب «الصور».',
        'كل صور الدعوة مرقّمة قدامك — دوس «غيّر» تحت الصورة.',
        'اختار صورة من جهازك وهتتحط مكانها على طول.',
      ],
      en: [
        'Open the “Photos” tab.',
        'All photos are numbered — press “Change” under one.',
        'Pick a photo from your device; it replaces the old one instantly.',
      ],
    },
    example: {
      ar: 'أو أسرع: اضغط على الصورة نفسها في الدعوة، وبعدين أيقونة الصورة اللي فوقها. (JPG أو PNG لحد 4 ميجا)',
      en: 'Or faster: click the photo in the invitation, then the image icon above it. (JPG or PNG up to 4MB)',
    },
    tour: (ctx) => {
      const open = tabStep('photos',
        { title: 'افتح «الصور»', body: 'دوس على تبويب الصور ده.' },
        { title: 'Open “Photos”', body: 'Click this Photos tab.' });
      if (!ctx.has('images')) return [open, lockedStep('photos')];
      return [
        open,
        {
          target: ['photos-grid', 'photo-upload'],
          tab: 'photos',
          title: { ar: 'كل صورك مرقّمة', en: 'All your photos, numbered' },
          body: {
            ar: 'دوس «غيّر» تحت أي صورة واختار البديلة من جهازك. والسلة بتشيلها من الدعوة.',
            en: 'Press “Change” under any photo and pick the new one. The bin removes it.',
          },
        },
        {
          target: ['frame:image', 'preview'],
          title: { ar: 'أو من الدعوة نفسها', en: 'Or from the invitation itself' },
          body: {
            ar: 'اضغط على أي صورة هنا، وبعدين أيقونة الصورة اللي هتطلع فوقها.',
            en: 'Click any photo here, then the image icon that appears above it.',
          },
        },
      ];
    },
  },

  // ===== الموسيقى =====
  {
    id: 'music',
    icon: Music,
    feature: 'music',
    q: { ar: 'إزاي أغيّر الموسيقى؟', en: 'How do I change the music?' },
    keywords: { ar: 'موسيقى اغنية اغاني صوت مزيكا اقص', en: 'music song songs audio sound trim cut' },
    steps: {
      ar: [
        'افتح تبويب «الموسيقى».',
        'سمّع أي أغنية بزرار ▶ ولو عجبتك دوس «اختارها» — أو ارفع أغنيتك.',
        'من «اقص المقطع» حدّد الأغنية تبدأ منين وتخلص فين.',
      ],
      en: [
        'Open the “Music” tab.',
        'Preview with ▶ and press “Use” — or upload your own song.',
        'Use “Trim” to choose where it starts and ends.',
      ],
    },
    example: {
      ar: 'عايز الأغنية تبدأ من الكوبليه؟ حرّك «من» لحد 0:45 — والدعوة هتشغّل من هناك.',
      en: 'Want it to start at the chorus? Drag “From” to 0:45 and the invitation starts there.',
    },
    tour: (ctx) => {
      const open = tabStep('music',
        { title: 'افتح «الموسيقى»', body: 'دوس على تبويب الموسيقى ده.' },
        { title: 'Open “Music”', body: 'Click this Music tab.' });
      if (!ctx.has('music')) return [open, lockedStep('music')];
      const steps = [
        open,
        {
          target: ['music-search', 'music-list'],
          tab: 'music',
          title: { ar: 'دوّر في المكتبة', en: 'Search the library' },
          body: {
            ar: 'اكتب اسم الأغنية أو الفنان أو النوع (زي «رومانسي»).',
            en: 'Type a song, artist or mood (like “romantic”).',
          },
        },
        {
          target: ['music-list', 'music-search'],
          tab: 'music',
          title: { ar: 'سمّع واختار', en: 'Listen and pick' },
          body: {
            ar: 'زرار ▶ يسمّعك الأغنية، و«اختارها» يحطها في دعوتك على طول.',
            en: '▶ plays a preview; “Use” puts it in your invitation.',
          },
        },
        {
          target: 'music-upload',
          tab: 'music',
          title: { ar: 'أو ارفع أغنيتك', en: 'Or upload your own' },
          body: {
            ar: 'عندك أغنية معيّنة؟ ارفعها من هنا (MP3 لحد 4 ميجا).',
            en: 'Have a specific song? Upload it here (MP3 up to 4MB).',
          },
        },
      ];
      if (ctx.hasAudio) {
        steps.push({
          target: 'music-trim',
          tab: 'music',
          title: { ar: 'اقص المقطع', en: 'Trim the song' },
          body: {
            ar: 'حرّك «من» و«لحد» عشان تختار الجزء اللي هيشتغل بالظبط.',
            en: 'Move “From” and “To” to pick exactly which part plays.',
          },
        });
      }
      steps.push({
        target: 'play-btn',
        title: { ar: 'اسمعها في الدعوة', en: 'Hear it in the invitation' },
        body: {
          ar: 'دوس «شغّل الدعوة» عشان تسمع الموسيقى زي ما الضيف هيسمعها.',
          en: 'Press “Play invitation” to hear it exactly like a guest.',
        },
      });
      return steps;
    },
  },

  // ===== كلام جديد =====
  {
    id: 'add-text',
    icon: TypeOutline,
    q: { ar: 'إزاي أضيف كلام جديد مش موجود؟', en: 'How do I add new text?' },
    keywords: { ar: 'اضيف ضيف نص جديد جملة زيادة سطر', en: 'add new text extra line sentence' },
    steps: {
      ar: [
        'من تبويب «التعديل» دوس «أضف نص جديد».',
        'هيظهر في نص الدعوة — اضغط عليه واكتب.',
        'اسحبه بالماوس للمكان اللي تحبه.',
      ],
      en: [
        'In the “Edit” tab press “Add new text”.',
        'It appears in the middle — click it and type.',
        'Drag it with the mouse wherever you like.',
      ],
    },
    example: {
      ar: 'مثلًا تضيف «بحضوركم تكتمل فرحتنا» تحت الأسماء.',
      en: 'For example, add “Your presence completes our joy” under the names.',
    },
    tour: () => [
      {
        target: 'add-text',
        tab: 'inline',
        title: { ar: 'أضف نص جديد', en: 'Add new text' },
        body: {
          ar: 'الزرار ده بيحط سطر جديد في نص الدعوة.',
          en: 'This button drops a new line in the middle of the invitation.',
        },
      },
      {
        target: 'preview',
        title: { ar: 'اكتب واسحب', en: 'Type and drag' },
        body: {
          ar: 'اضغط على السطر الجديد واكتب كلامك، وبعدين امسكه واسحبه لمكانه.',
          en: 'Click the new line, type your words, then drag it into place.',
        },
      },
    ],
  },

  // ===== التحريك =====
  {
    id: 'move',
    icon: Move,
    feature: 'drag',
    q: { ar: 'إزاي أحرّك حاجة من مكانها؟', en: 'How do I move something?' },
    keywords: { ar: 'حرك تحريك مكان اسحب انقل ازق', en: 'move drag position place shift' },
    steps: {
      ar: [
        'امسك الجملة أو الصورة بالماوس جوه الدعوة واسحبها.',
        'للدقة: تبويب «التحريك» والأسهم بتحرّك خطوة خطوة.',
        'عايز ترجّع كله؟ «رجّع كل الأماكن زي الأصل».',
      ],
      en: [
        'Hold any text or photo with the mouse and drag it.',
        'For precision: the “Move” tab arrows nudge step by step.',
        'Want everything back? “Reset all positions”.',
      ],
    },
    tour: (ctx) => {
      const open = tabStep('layout',
        { title: 'تبويب «التحريك»', body: 'دوس هنا عشان تحرّك بالأسهم بدقة.' },
        { title: 'The “Move” tab', body: 'Click here to nudge things precisely.' });
      if (!ctx.has('drag')) return [open, lockedStep('layout')];
      return [
        {
          target: ['frame:text', 'preview'],
          title: { ar: 'امسك واسحب', en: 'Hold and drag' },
          body: {
            ar: 'امسك أي جملة أو صورة بالماوس، وحرّكها من غير ما تسيب.',
            en: 'Hold any text or photo with the mouse and move it without letting go.',
          },
        },
        open,
        {
          target: 'layout-arrows',
          tab: 'layout',
          title: { ar: 'الأسهم', en: 'The arrows' },
          body: {
            ar: 'اختار الجملة في الدعوة، وكل ضغطة سهم بتحرّكها حتة صغيرة.',
            en: 'Select the text in the invitation; each arrow press moves it a little.',
          },
        },
        {
          target: 'layout-reset',
          tab: 'layout',
          title: { ar: 'رجّع كل حاجة', en: 'Put everything back' },
          body: {
            ar: 'لو اتلخبطت، الزرار ده بيرجّع كل الأماكن زي التصميم الأصلي.',
            en: 'If things get messy, this returns every position to the original design.',
          },
        },
      ];
    },
  },

  // ===== الشكل =====
  {
    id: 'style',
    icon: Palette,
    q: { ar: 'إزاي أكبّر الكلام أو أغيّر الخط واللون؟', en: 'How do I resize text, change font or color?' },
    keywords: { ar: 'خط فونت حجم مقاس كبر صغر لون الوان ميل', en: 'font size bigger smaller color colour rotate' },
    steps: {
      ar: [
        'اضغط على الجملة في الدعوة.',
        'على اليمين في «الجزء المختار»: مقاس الخط، خط الجملة، والميل.',
        'اللون من أيقونة الألوان اللي فوق الجملة.',
        'خط الدعوة كلها من تبويب «الخط».',
      ],
      en: [
        'Click the sentence in the invitation.',
        'Under “Selected” on the side: size, font and tilt.',
        'Color: the palette icon above the sentence.',
        'Whole-invitation font: the “Font” tab.',
      ],
    },
    tour: () => [
      {
        target: ['frame:text', 'preview'],
        tab: 'inline',
        title: { ar: 'اختار الجملة', en: 'Select the text' },
        body: {
          ar: 'اضغط على الجملة اللي عايز تغيّر شكلها.',
          en: 'Click the text you want to restyle.',
        },
      },
      {
        target: 'selected-panel',
        tab: 'inline',
        title: { ar: 'تحكّم الجملة هنا', en: 'Its controls appear here' },
        body: {
          ar: 'هنا هيظهر مقاس الخط (+ و −)، خط الجملة دي بس، والميل.',
          en: 'Font size (+ and −), this sentence’s font, and tilt appear here.',
        },
      },
      tabStep('font',
        { title: 'خط الدعوة كلها', body: 'من هنا تغيّر خط الدعوة كلها مرة واحدة.' },
        { title: 'Whole-invitation font', body: 'Change the font of the whole invitation here.' }),
    ],
  },

  // ===== الشيل والترجيع =====
  {
    id: 'remove',
    icon: Trash2,
    q: { ar: 'إزاي أشيل جزء من الدعوة أو أرجّعه؟', en: 'How do I remove or restore a part?' },
    keywords: { ar: 'امسح احذف شيل سلة رجع قسم اقسام اخفي', en: 'delete remove hide bin restore section' },
    steps: {
      ar: [
        'اضغط على الجزء في الدعوة، وبعدين أيقونة السلة.',
        'يرجع من «الأجزاء المحذوفة» → «رجّعه».',
        'قسم كامل (زي الألبوم أو الخريطة)؟ من تبويب «الأقسام».',
      ],
      en: [
        'Click the part in the invitation, then the bin icon.',
        'Bring it back from “Removed parts” → “Restore”.',
        'A whole section (album, map…)? Use the “Sections” tab.',
      ],
    },
    tour: (ctx) => {
      const steps = [
        {
          target: ['frame:text', 'preview'],
          tab: 'inline',
          title: { ar: 'اضغط واختار السلة', en: 'Click, then the bin' },
          body: {
            ar: 'اضغط على أي جزء، وهيطلعلك فوقه أيقونة سلة تشيله بيها.',
            en: 'Click any part and a bin icon appears above it to remove it.',
          },
        },
        {
          target: 'hidden-list',
          tab: 'inline',
          title: { ar: 'مفيش حاجة بتضيع', en: 'Nothing is lost' },
          body: {
            ar: 'أي حاجة شلتها بتفضل هنا، ودوسة «رجّعه» ترجّعها مكانها.',
            en: 'Everything you remove waits here; “Restore” puts it back.',
          },
        },
      ];
      steps.push(tabStep('sections',
        { title: 'أقسام كاملة', body: 'من هنا تشيل أو ترجّع قسم كامل بضغطة.' },
        { title: 'Whole sections', body: 'Hide or bring back a whole section here.' }));
      if (ctx.has('sections')) {
        steps.push({
          target: ['sections-list', 'panel'],
          tab: 'sections',
          title: { ar: 'ظاهر / مشيل', en: 'Shown / hidden' },
          body: {
            ar: 'دوس على أي قسم عشان تشيله أو ترجّعه.',
            en: 'Click any section to hide it or bring it back.',
          },
        });
      } else {
        steps.push(lockedStep('sections'));
      }
      return steps;
    },
  },

  // ===== المكان =====
  {
    id: 'location',
    icon: MapPin,
    q: { ar: 'إزاي أغيّر مكان الفرح على الخريطة؟', en: 'How do I change the location on the map?' },
    keywords: { ar: 'مكان خريطة لوكيشن جوجل ماب عنوان قاعة', en: 'location map google maps address venue hall' },
    steps: {
      ar: [
        'انزل في الدعوة لحد الخريطة واضغط عليها.',
        'دوس أيقونة الدبوس 📍 اللي فوقها.',
        'الصق لينك جوجل ماب (أو اكتب اسم المكان) ودوس «ثبّت المكان الجديد».',
      ],
      en: [
        'Scroll to the map in the invitation and click it.',
        'Press the 📍 pin icon above it.',
        'Paste a Google Maps link (or type the place) and press “Set new location”.',
      ],
    },
    example: {
      ar: 'من جوجل ماب على موبايلك: افتح القاعة ← مشاركة ← نسخ الرابط، والصقه هنا.',
      en: 'In Google Maps on your phone: open the hall → Share → Copy link, then paste it here.',
    },
    tour: () => [
      {
        target: ['frame:map', 'preview'],
        tab: 'inline',
        title: { ar: 'اضغط على الخريطة', en: 'Click the map' },
        body: {
          ar: 'اضغط على الخريطة جوه الدعوة (لو مش ظاهرة، انزل لتحت شوية)، وبعدين أيقونة الدبوس.',
          en: 'Click the map in the invitation (scroll down if you can’t see it), then the pin icon.',
        },
      },
      {
        target: 'selected-panel',
        tab: 'inline',
        title: { ar: 'حط اللينك هنا', en: 'Paste the link here' },
        body: {
          ar: 'هنا هتظهر خانة المكان: الصق لينك جوجل ماب ودوس «ثبّت المكان الجديد».',
          en: 'The location box appears here: paste the Google Maps link and press “Set new location”.',
        },
      },
    ],
  },

  // ===== واتساب =====
  {
    id: 'share-whatsapp',
    icon: Share2,
    q: { ar: 'إزاي أبعت الدعوة لضيوفي على واتساب؟', en: 'How do I send it on WhatsApp?' },
    keywords: { ar: 'واتساب ابعت ارسل لينك رابط شير مشاركة انستجرام كارت', en: 'whatsapp send share link card instagram' },
    steps: {
      ar: [
        'افتح تبويب «المشاركة».',
        'شوف شكل الكارت اللي هيظهر في واتساب، وغيّر صورته وعنوانه لو حابب.',
        'دوس «انسخ لينك المشاركة» والصقه في واتساب.',
      ],
      en: [
        'Open the “Share” tab.',
        'Preview the WhatsApp card; change its photo and title if you like.',
        'Press “Copy share link” and paste it in WhatsApp.',
      ],
    },
    example: {
      ar: 'العنوان مثلًا: «دعوة فرح أحمد وسارة 💍» — ده أول حاجة ضيوفك هيشوفوها في المحادثة.',
      en: 'Title example: “Ahmed & Sara’s wedding 💍” — the first thing guests see in the chat.',
    },
    tour: (ctx) => {
      const steps = [
        tabStep('share',
          { title: 'افتح «المشاركة»', body: 'دوس على تبويب المشاركة ده.' },
          { title: 'Open “Share”', body: 'Click this Share tab.' }),
        {
          target: 'share-preview',
          tab: 'share',
          title: { ar: 'ده اللي ضيوفك هيشوفوه', en: 'What your guests will see' },
          body: {
            ar: 'كده بالظبط اللينك هيظهر في واتساب: صورة، عنوان، ووصف.',
            en: 'Exactly how the link shows up in WhatsApp: photo, title, description.',
          },
        },
        {
          target: ['share-title', 'share-image'],
          tab: 'share',
          title: { ar: 'غيّره براحتك', en: 'Make it yours' },
          body: {
            ar: 'اكتب عنوان ووصف، واختار صورة — أو سيبه وإحنا بنعمله من أسماءكم والتاريخ.',
            en: 'Write a title and description and pick a photo — or leave it and we build it from your names and date.',
          },
        },
        {
          target: 'share-copy',
          tab: 'share',
          title: { ar: 'انسخ وابعت', en: 'Copy and send' },
          body: {
            ar: 'دوس هنا ينسخ اللينك، وبعدين الصقه في واتساب أو أي مكان.',
            en: 'Press here to copy the link, then paste it in WhatsApp or anywhere.',
          },
        },
      ];
      if (ctx.isDraft) {
        steps.push({
          target: 'publish-btn',
          title: { ar: 'متنساش تنشر', en: 'Don’t forget to publish' },
          body: {
            ar: 'دعوتك لسه مسودة — اللينك مش هيفتح لضيوفك غير بعد ما تنشرها من هنا.',
            en: 'It’s still a draft — guests can open the link only after you publish here.',
          },
        });
      }
      return steps;
    },
  },

  // ===== النشر =====
  {
    id: 'publish',
    icon: Rocket,
    q: { ar: 'إزاي أنشر الدعوة؟ والتعديلات بتوصل للضيوف إمتى؟', en: 'How do I publish? When do guests see changes?' },
    keywords: { ar: 'نشر انشر مسودة رصيد يشوفوها الضيوف تعديلات اللينك يفتح', en: 'publish draft balance guests see changes live link' },
    steps: {
      ar: [
        'المسودة محدش شايفها غيرك.',
        'دوس «انشر الدعوة» — اللينك يشتغل وبيتخصم دعوة واحدة من رصيدك.',
        'بعد النشر أي تعديل بيوصل للضيوف على طول.',
      ],
      en: [
        'A draft is visible only to you.',
        'Press “Publish” — the link goes live and one invitation is used.',
        'After publishing, every change reaches guests right away.',
      ],
    },
    tour: (ctx) => (ctx.isDraft
      ? [
        {
          target: 'publish-bar',
          title: { ar: 'دعوتك لسه مسودة', en: 'Still a draft' },
          body: {
            ar: 'طول ما هي مسودة، محدش من ضيوفك يقدر يفتحها. عدّل براحتك.',
            en: 'While it’s a draft no guest can open it. Edit freely.',
          },
        },
        {
          target: 'publish-btn',
          title: { ar: 'انشر لما تخلص', en: 'Publish when ready' },
          body: {
            ar: 'الزرار ده بيشغّل اللينك وبيخصم دعوة واحدة من رصيدك. (في الشرح مش هيتداس عليه.)',
            en: 'This turns the link on and uses one invitation. (It won’t be pressed during this guide.)',
          },
        },
      ]
      : [
        {
          target: ['republish-btn', 'publish-bar'],
          title: { ar: 'دعوتك منشورة', en: 'It’s live' },
          body: {
            ar: 'التعديلات بتتحفظ وتوصل لضيوفك على طول. «نشر التعديلات» بيأكدها ويحدّث المعاينة قدامك.',
            en: 'Changes save and reach guests instantly. “Publish changes” confirms and refreshes the preview.',
          },
        },
        {
          target: 'copy-link',
          title: { ar: 'انسخ اللينك', en: 'Copy the link' },
          body: { ar: 'ابعت اللينك ده لضيوفك.', en: 'Send this link to your guests.' },
        },
        {
          target: 'open-link',
          title: { ar: 'افتحها زي الضيف', en: 'Open it like a guest' },
          body: { ar: 'بيفتح الدعوة الحقيقية في صفحة جديدة.', en: 'Opens the real invitation in a new tab.' },
        },
      ]),
  },

  // ===== الرجوع =====
  {
    id: 'undo',
    icon: Undo2,
    q: { ar: 'غلطت — إزاي أرجع؟', en: 'I made a mistake — how do I undo?' },
    keywords: { ar: 'غلط ارجع رجوع تراجع الغي بوظت اصل', en: 'mistake undo back revert broke original' },
    steps: {
      ar: [
        'دوس سهم الرجوع ↶ (أو Ctrl+Z) — بيرجّعك خطوة.',
        'رجعت زيادة؟ السهم التاني ↷ بيعيدها.',
        'عايز تبدأ من الأول خالص؟ «رجّع الدعوة لأصلها» تحت في تبويب «التعديل».',
      ],
      en: [
        'Press undo ↶ (or Ctrl+Z) to go back one step.',
        'Went too far? Redo ↷ brings it back.',
        'Start over completely? “Reset invitation” at the bottom of the “Edit” tab.',
      ],
    },
    tour: () => [
      {
        target: 'undo-redo',
        title: { ar: 'رجوع وإعادة', en: 'Undo and redo' },
        body: {
          ar: 'السهم الأول بيرجّع آخر حاجة عملتها، والتاني بيعيدها.',
          en: 'The first arrow undoes your last change; the second redoes it.',
        },
      },
      {
        target: 'reset-all',
        tab: 'inline',
        title: { ar: 'من الأول خالص', en: 'Start over' },
        body: {
          ar: 'ده بيمسح كل تعديلاتك ويرجّع الدعوة لأصلها — وبيسألك قبلها. (في الشرح مش هيتداس عليه.)',
          en: 'Clears every change and resets the invitation — it asks first. (It won’t be pressed during this guide.)',
        },
      },
    ],
  },

  // ===== التشغيل =====
  {
    id: 'play',
    icon: PlayCircle,
    q: { ar: 'إزاي أشوف الدعوة زي ما الضيف هيشوفها؟', en: 'How do I see it like a guest?' },
    keywords: { ar: 'شغل تشغيل معاينة اشوف ضيف غلاف موبايل كمبيوتر', en: 'play preview see guest cover mobile desktop' },
    steps: {
      ar: [
        'دوس «شغّل الدعوة» — بتشتغل بالغلاف والموسيقى.',
        'دوس «رجوع للتحرير» لما تخلص.',
        'شاشة الغلاف بتتفتح للتعديل من زرار «شاشة الغلاف».',
      ],
      en: [
        'Press “Play invitation” — it runs with the cover and music.',
        'Press “Back to editing” when done.',
        'Edit the cover screen with the “Cover screen” button.',
      ],
    },
    tour: (ctx) => {
      const steps = [
        {
          target: 'play-btn',
          title: { ar: 'شغّل الدعوة', en: 'Play invitation' },
          body: {
            ar: 'بيشغّل الدعوة من أولها زي الضيف بالظبط، وترجع للتعديل بزرار «رجوع للتحرير».',
            en: 'Runs it from the start like a guest; come back with “Back to editing”.',
          },
        },
      ];
      if (ctx.hasCover) {
        steps.push({
          target: 'cover-btn',
          title: { ar: 'شاشة الغلاف', en: 'Cover screen' },
          body: {
            ar: 'الغلاف بيتشال من طريقك وإنت بتعدّل. افتحه من هنا لو عايز تعدّل عليه هو نفسه.',
            en: 'The cover is moved out of your way while editing. Open it here to edit it.',
          },
        });
      }
      steps.push({
        target: 'device',
        title: { ar: 'موبايل أو كمبيوتر', en: 'Phone or computer' },
        body: {
          ar: 'شوف الدعوة على شاشة موبايل أو كمبيوتر. أغلب ضيوفك هيفتحوها من الموبايل.',
          en: 'Preview on a phone or computer screen. Most guests open it on a phone.',
        },
      });
      return steps;
    },
  },

  // ===== تأكيد الحضور =====
  {
    id: 'rsvp',
    icon: ClipboardCheck,
    q: { ar: 'فورم تأكيد الحضور: أعدّله إزاي؟ وفين الردود؟', en: 'RSVP form: how to edit it, and where are the replies?' },
    keywords: { ar: 'تأكيد الحضور فورم ردود حضور مين جاي الضيوف', en: 'rsvp form replies attending guests coming' },
    steps: {
      ar: [
        'اضغط على زرار تأكيد الحضور في الدعوة.',
        'دوس أيقونة الفورم اللي فوقه، وغيّر أي كلام فيه ← «طبّق وشوف».',
        'ردود ضيوفك بتوصلك في لوحة التحكم.',
      ],
      en: [
        'Click the RSVP button in the invitation.',
        'Press the form icon above it, change any wording → “Apply”.',
        'Guest replies arrive in your dashboard.',
      ],
    },
    tour: () => [
      {
        target: 'preview',
        tab: 'inline',
        title: { ar: 'زرار تأكيد الحضور', en: 'The RSVP button' },
        body: {
          ar: 'انزل في الدعوة لحد تأكيد الحضور، واضغط عليه، وبعدين أيقونة الفورم.',
          en: 'Scroll to the RSVP part, click it, then the form icon.',
        },
      },
      {
        target: 'back-link',
        title: { ar: 'الردود هنا', en: 'Replies are here' },
        body: {
          ar: 'من لوحة التحكم تشوف مين أكّد حضوره ومين اعتذر.',
          en: 'Your dashboard shows who is coming and who isn’t.',
        },
      },
    ],
  },
];

/** نص باللغة الحالية (العربي هو الأصل) */
export const tr = (obj, lang) => (obj ? (obj[lang] || obj.ar) : '');

/** بحث بسيط: في السؤال والكلمات المفتاحية، من غير همزات وتشكيل */
const norm = (s) => String(s || '')
  .toLowerCase()
  .replace(/[ً-ْـ]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه');

export function matchTopic(topic, query, lang) {
  const q = norm(query).trim();
  if (!q) return true;
  const hay = norm([
    tr(topic.q, lang), tr(topic.keywords, lang),
    ...(topic.steps[lang] || topic.steps.ar),
    // العميل ممكن يكتب بالعربي وهو فاتح الموقع إنجليزي (أو العكس)
    topic.q.ar, topic.q.en, topic.keywords.ar, topic.keywords.en,
  ].join(' '));
  return q.split(/\s+/).every((w) => hay.includes(w));
}
