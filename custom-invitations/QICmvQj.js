// custom-invitations/QICmvQj.js
// دعوة مخصوصة لعميل (أحمد و Sa Princesse) — قالب Ivory Swans كله بالفرنساوي.
// الآية بس فاضلة بالعربي، وترجمتها تحتها بالفرنساوي.
//
// المحتوى ده بيتطبّق وقت العرض فوق الدعوة المحفوظة (utils/customInvitations.js)
// ومش بيلمس أي دعوة تانية ولا ملف القالب نفسه. تاريخ الفرح بييجي من الدعوة
// المحفوظة (اللي بيتعدّل من المحرر) — والتاريخ المكتوب فوق وفي "Réservez la date"
// بيتحسب منه بالفرنساوي، فلو التاريخ اتغيّر كل حاجة بتتغيّر معاه.

const BASE = '/custom/QICmvQj';
const MAPS_QUERY = 'Salle Mazeline, Rue du Chemin de Maure, 61250 Damigny';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const pad = (n) => String(n).padStart(2, '0');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

module.exports = {
  shortId: 'QICmvQj',

  // حقول الدعوة نفسها
  fields: {
    language: 'fr',
    groomName: 'Ahmed',
    brideName: 'Sa Princesse',
    venueName: 'Salle Mazeline',
    venueCity: 'Damigny',
    venueAddress: 'Rue du Chemin de Maure, 61250 Damigny',
    venueMapQuery: MAPS_QUERY,
    venueMapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`,
    venueMapDirectLink: 'https://maps.app.goo.gl/WV42QR8RzqLmnTcU9',
  },

  /** نصوص بتعتمد على التاريخ (ساعة الحائط اللي متخزّنة في الدعوة) */
  dateTexts(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return {};
    return {
      // التاريخ تحت الأسماء في الشاشة الأولى
      '1779566247730000003': `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
      // تحت "Réservez la date"
      iv40: `${cap(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`,
    };
  },

  // نصوص كل عنصر (data-elem-id) — نفس آلية المحرر
  texts: {
    // الغلاف
    '1777183175514000001': 'Appuyez pour ouvrir',
    // الأسماء في الشاشة الأولى
    '1779566247730000001__1': 'Ahmed',
    '1779566247730000001__2': 'Sa Princesse',
    '1779566247730000004': '♥',

    // الآية: العربي زي ما هو (iv8 iv9 iv31 iv32) + الترجمة بالفرنساوي
    iv10: 'Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux\n\n« Et parmi Ses signes, Il a créé pour vous, de vous-mêmes, des épouses afin que vous trouviez auprès d’elles la tranquillité. Et Il a établi entre vous de l’affection et de la miséricorde. Il y a en cela des signes pour des gens qui réfléchissent. »',
    iv11: 'SOURATE AR-RÛM — VERSET 21',

    // العد التنازلي
    '1771277026942000001': 'La célébration commence.',
    iv12: 'RÉSERVEZ LA DATE',

    // تحت الصور
    iv14: 'Ici',
    iv15: 'commence',
    iv16: 'l’éternité',

    // "Our wedding"
    iv17: 'NOTRE MARIAGE',
    iv18: 'Célébration du mariage',
    iv19: 'Avec la grâce et la bénédiction d’Allah, nous serions honorés de votre présence et de partager avec vous notre bonheur à l’occasion de cette heureuse célébration.',
    iv20: 'Votre présence nous tient à cœur et nous fera grand plaisir. 🤍',

    // الأهل
    iv21: 'Avec la bénédiction de leurs familles',
    iv23: 'Père du marié',
    iv24: 'M. le regretté Azme Abu Amra',
    iv25: 'Père de la mariée',
    iv26: 'M. Osama Al Ghobari',
    iv27: 'ont l’honneur de vous inviter à célébrer le mariage de leurs enfants :\nAhmed ♥ Sa Princesse',

    // المكان
    iv28: 'LE LIEU',
    iv30: 'Rue du Chemin de Maure, 61250 Damigny',
  },

  // عناصر بتتشال: صورة القاعة فوق الخريطة، وسطر أسماء العائلات (مش في بيانات العميل)
  hidden: ['iv5', 'iv22'],

  // صور الألبوم (فلسطين) — بتتحط بسكريبت الدعوة دي (صور الموقع نفسه، مش Cloudinary)
  images: {
    iv3: `${BASE}/couple-keffiyeh.webp`,
    iv2: `${BASE}/couple-aqsa.webp`,
    iv4: `${BASE}/couple-veil.webp`,
  },

  // كارت المشاركة على واتساب
  share: {
    title: 'Ahmed ♥ Sa Princesse — Invitation de mariage',
    description: 'Vous êtes chaleureusement invités à célébrer notre mariage · Salle Mazeline, Damigny',
    image: `${BASE}/share.jpg`,
  },

  // فورم تأكيد الحضور
  rsvp: {
    title: 'Confirmez votre présence',
    intro: 'Afin de préparer au mieux cette belle journée, merci de nous confirmer votre présence.',
  },
  rsvpEyebrow: 'Confirmation',

  // أقسام جديدة بنفس شكل القالب: البرنامج (قبل المكان) + ملاحظة مهمة وختام (بعد المكان)
  programHtml: `
    <div class="qic-eyebrow"><span class="line"></span><span class="word">LE PROGRAMME</span><span class="line"></span></div>
    <div class="qic-flourish">❦</div>
    <div class="qic-cards">
      <div class="qic-card">
        <div class="qic-label">LES HOMMES</div>
        <div class="qic-time">De 12h00 à 17h00</div>
      </div>
      <div class="qic-card">
        <div class="qic-label">LES FEMMES</div>
        <div class="qic-time">À partir de 17h30</div>
      </div>
    </div>`,
  noticeHtml: `
    <div class="qic-important">
      <div class="qic-label">IMPORTANT</div>
      <p>📵 Les photos et les vidéos avec les téléphones portables sont interdites dans la salle des femmes.</p>
    </div>
    <div class="qic-closing">
      <div class="qic-rule"></div>
      <p class="qic-script">Au plaisir de vous accueillir<br>et de partager avec vous notre bonheur. ♥️</p>
    </div>`,
};
