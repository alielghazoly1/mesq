// دعوة ooW5EFI (Velvet Voice، عربي) — بطلب المالك:
//
// 1) الظرف: أول ما الضيف يضغط، الظرف ماينفتحش — الختم بيطير والظرف كله بينزل
//    لتحت ويختفي (نفس حركة Sage Garden بالظبط)، والدعوة تتفتح على طول.
// 2) أول صفحة: صفحة الآية على الشاشة كلها — خلفية الستارة والنجفة والورد
//    (client/public/custom/ooW5EFI/verse-bg.webp: صورة المالك بعد ما اتشال منها
//    شريط الموبايل اللي فوق وخانة "Reply to yourself" اللي تحت والكلام نفسه)،
//    والكلام فوقها **نص حقيقي بيتعدّل من المحرر** (oo1–oo6) بخطوط قريبة من الصورة:
//      بسم الله الرحمن الرحيم / وخلقناكم أزواجا  → Aref Ruqaa
//      And we created you in pairs / Quran 78:8   → EB Garamond
//      Join us for the union / of two souls       → Pinyon Script
// 3) صفحة الأسامي (العريس والعروسة) وصفحة الأهل (والد العريس/العروسة) اتشالوا.
//    بعد الآية: العد التنازلي ← الموقع ← تأكيد الحضور (+ آية الروم لو مش مقفولة).
//
// التنفيذ: transform() بيعدّل حتت صغيرة في كود القالب للدعوة دي بس. لو القالب
// اتغيّر ومالقاش حتة منهم، بيسيب الصفحة زي ما هي — مفيش كسر.
// صفحة الآية صفحة عادية من صفحات القالب (.sec) — المحرر بيشوفها ويعدّل كلامها،
// والتنقل/القلب لوحده/زرار "مرّر للأسفل" شغالين عليها زي أي صفحة.

const BG = '/custom/ooW5EFI/verse-bg.webp';
const FONTS = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=EB+Garamond:wght@500&family=Pinyon+Script&display=swap';

// المقاسات بوحدات لوحة القالب (705.75 × 1254) — الخلفية بتتحط cover عليها
// بالظبط زي الصورة الأصلية، فالكلام بيقع في نفس أماكنه في الصورة.
const CSS = `
#oo-verse{z-index:15;overflow:hidden;background:#efe0cb url(${BG}) center/cover no-repeat;direction:rtl}
#oo-verse > p{position:absolute;left:60px;right:60px;margin:0;text-align:center;letter-spacing:0}
#oo-verse .oo-bsm{top:458px;font:400 44px/1.6 'Aref Ruqaa','Amiri',serif;color:#a2717a}
#oo-verse .oo-ayah{top:606px;font:700 48px/1.7 'Aref Ruqaa','Amiri',serif;color:#54462a}
#oo-verse .oo-en{top:714px;direction:ltr;font:500 23px/1.35 'EB Garamond','Cormorant Garamond',Georgia,serif;color:#54462a}
#oo-verse .oo-ref{top:746px;direction:ltr;font:500 23px/1.35 'EB Garamond','Cormorant Garamond',Georgia,serif;color:#54462a}
#oo-verse .oo-join{direction:ltr;font:400 48px/1.3 'Pinyon Script',cursive;color:#54462a}
#oo-verse .oo-j1{top:838px}
#oo-verse .oo-j2{top:901px}

/* الظرف: الختم بيطير والظرف كله بينزل لتحت (زي Sage Garden) — بدل ما يتفتح */
.intro.oo-drop{cursor:default}
.intro.oo-drop .seal{animation:ooSeal .6s cubic-bezier(.3,1.6,.5,1) forwards}
.intro.oo-drop .seal::before{animation:none;opacity:0}
@keyframes ooSeal{30%{transform:scale(1.22) rotate(-8deg)}100%{transform:scale(.2) rotate(40deg);opacity:0}}
.intro.oo-drop .grp{animation:ooDrop 1.25s .35s cubic-bezier(.6,0,.3,1) forwards}
@keyframes ooDrop{40%{transform:translateY(-365px) scale(.885)}100%{transform:translateY(1250px) scale(.8) rotate(4deg);opacity:0}}
.intro.oo-drop .tap{opacity:0;transform:translateY(16px)}
.intro.oo-drop .dust{opacity:0;transition:opacity .6s ease}
.intro.oo-gone{opacity:0;transition:opacity .55s ease;pointer-events:none}
`;

const VERSE_PAGE = `<section class="sec" id="oo-verse" data-wda-page="oo-verse" data-read="7" data-wda-added-host>
      <p class="oo-bsm rv" style="--d:1" data-elem-id="oo1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p class="oo-ayah rv" style="--d:3" data-elem-id="oo2">وَخَلَقْنَاكُمْ أَزْوَاجًا</p>
      <p class="oo-en rv" style="--d:5" data-elem-id="oo3">And we created you in pairs</p>
      <p class="oo-ref rv" style="--d:5.6" data-elem-id="oo4">Quran 78:8</p>
      <p class="oo-join oo-j1 rv" style="--d:7" data-elem-id="oo5">Join us for the union</p>
      <p class="oo-join oo-j2 rv" style="--d:8" data-elem-id="oo6">of two souls</p>
    </section>
`;

// بيتحط جوه سكريبت القالب (قبل "start") — فبيوصل لـ show / stage / intro ...
const LOGIC = `
  /* ---------- ooW5EFI: الظرف بينزل لتحت بدل ما يتفتح، والدعوة تبدأ بصفحة الآية ---------- */
  function dropOpen() {
    if (opened) return;
    opened = true;
    setAudio(true);
    intro.classList.add('oo-drop');
    setTimeout(() => petals.start(6500), 450);
    setTimeout(() => {
      stage.classList.add('opened');
      show(0, 1);
      intro.classList.add('oo-gone');
    }, 1250);
    setTimeout(() => intro.remove(), 1900);
  }
`;

// كل حتة: [اللي بندوّر عليه, اللي بيتحط مكانه]
const PATCHES = [
  // صفحة الآية = أول صفحة (جوه اللوحة، برّه الكارت — فبتملا الشاشة كلها)
  ['  <div class="cv" id="cv">\n', `  <div class="cv" id="cv">\n    ${VERSE_PAGE}`],
  // صفحة الأسامي وصفحة الأهل: مش موجودين في الدعوة دي
  ['<section class="sec" id="vv-names"', '<section class="sec off" id="vv-names"'],
  ['<section class="sec" id="vv-story"', '<section class="sec off" id="vv-story"'],
  // الضغط على الظرف → ينزل لتحت بدل ما يتفتح
  ['  function openEnvelope() {\n    if (opened || EDIT) return;',
    '  function openEnvelope() {\n    if (!EDIT) { dropOpen(); return; }\n    if (opened || EDIT) return;'],
  ['  /* ---------- start ---------- */', `${LOGIC}\n  /* ---------- start ---------- */`],
];

module.exports = {
  shortId: 'ooW5EFI',

  render() {
    return {
      head: `<link rel="preload" as="image" href="${BG}"><link rel="stylesheet" href="${FONTS}"><style id="oo-style">${CSS}</style>`,
    };
  },

  transform(html) {
    const nl = html.includes('\r\n') ? '\r\n' : '\n';
    let out = html;
    for (const [find, repl] of PATCHES) {
      const f = find.replace(/\n/g, nl);
      if (out.split(f).length !== 2) {
        console.error('[custom ooW5EFI] template changed — showing the normal envelope');
        return html;
      }
      out = out.replace(f, () => repl.replace(/\n/g, nl));
    }
    return out;
  },
};
