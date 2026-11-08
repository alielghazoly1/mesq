// دعوة xVSjgue (Blossom & Oud) — وطية إيمان (حنّة Iman — بالفرنساوي Iman مش Imène من 2026-11-08 — نفس عيلة lcqdxr6)، الجمعة 9 أفريل 2027
// الساعة 18:00، Hacienda Events في أريانة (تونس). بطلب المالك (2026-11-07): فرنساوي وعربي بزرار
// "عربي" / "Français" فوق على اليمين بيظهر بعد فتح الظرف (زي lcqdxr6). الغلاف بختم البسملة زي ما هو.
//
// تصميم القالب (Tilda) هو هو: الستاير والقصر، كارت القوس، العدّاد، البرنامج (4 مواعيد بالظبط)،
// المكان، الخريطة، والختام — كلامهم بيتبدّل باللغة (FR / AR تحت). الأقسام الجديدة بنفس ألوان
// وخطوط القالب: كلام العيلة كامل بعد كارت القوس، "ممنوع التصوير" مكان الدريس كود، تأكيد حضور
// فيه عدد البالغين والأطفال (مكان فورم القالب — بيوصل للوحة العميل)، والآيات تحت كارت البسملة.
// البيانات (الأسامي والتاريخ والمكان والخريطة): oneOffFix xVSjgue-outya-imene.
const SHORT = 'xVSjgue';
const GOLD = '#866739';
const INK = '#3a3226';

// خانات القالب: [السيلكتور، فرنساوي، عربي]
const R = (rec, f) => `#${rec} [field="${f}"]`;
const FIELDS = [
  [R('rec2339662043', 'tn_text_1777183175514000001'), 'Touchez pour ouvrir', 'اضغط للفتح'],
  // أول صفحة (الستاير): "Outya Iman" بس — من غير d’ ولا التاريخ والساعة (بطلب المالك 2026-11-08؛
  // التاريخ والساعة في كارت القوس وكلام العيلة)
  [R('rec2339662063', 'tn_text_1779566247730000001'), 'Outya<br><br><br>Iman', 'وطيّة<br><br><br>إيمان'],
  [R('rec2339662063', 'tn_text_1779566247730000004'), '', ''],
  [R('rec2339662063', 'tn_text_1779566247730000003'), '', ''],
  [R('rec2339662063', 'tn_text_1779626065755000001'), '', ''],
  [R('rec2339662083', 'tn_text_1779624381838000001'),
    'Outya Iman<br><br>Avec amour et joie, nous vous invitons au henné de notre chère fille<br><br>le vendredi 9 avril 2027<br>à partir de 18h00<br><br>à',
    'وطيّة إيمان<br><br>بكل حب وفرحة، يشرّفنا دعوتكم لحنّة بنتنا الغالية<br><br>يوم الجمعة 9 أفريل 2027<br>ابتداءً من الساعة 18:00<br><br>في'],
  [R('rec2339662083', 'tn_text_1779472210551000005'), 'Hacienda Events', 'Hacienda Events'],
  [R('rec2339662093', 'tn_text_1771277026942000001'), 'La soirée approche', 'اقتربت السهرة'],
  [R('rec2355511493', 'tn_text_1771277026942000001'), 'Déroulement de la soirée', 'برنامج السهرة'],
  [R('rec2355511493', 'tn_text_1780760554667000002'), '18h00', '18:00'],
  [R('rec2355511493', 'tn_text_1780760554667000001'), 'Accueil des invités', 'استقبال الضيوف'],
  [R('rec2355511493', 'tn_text_1780760554668000004'), '18h30', '18:30'],
  [R('rec2355511493', 'tn_text_1780760554667000003'), 'Dîner', 'العشاء'],
  [R('rec2355511493', 'tn_text_1780760554668000006'), '20h00', '20:00'],
  [R('rec2355511493', 'tn_text_1780760554668000005'), 'Soirée festive', 'سهرة احتفالية'],
  [R('rec2355511493', 'tn_text_1780760554668000008'), '00h00', '00:00'],
  [R('rec2355511493', 'tn_text_1780760554668000007'), 'Fin de la soirée', 'نهاية الحفل'],
  [R('rec2339662113', 'tn_text_1771277026942000001'), 'Lieu de la célébration', 'مكان الحفل'],
  [R('rec2339662113', 'tn_text_1779544773135'), 'Hacienda Events', 'Hacienda Events'],
  [R('rec2339662113', 'tn_text_1779545032699000001'), 'Ariana, Tunisie', 'أريانة، تونس'],
  [R('rec2339662133', 'tn_text_1771277026942000001'), 'Plan d’accès', 'خريطة الوصول'],
  [R('rec2339662163', 'tn_text_1763405219328'), 'Avec tout notre amour', 'بكل المحبة والتقدير'],
  ['#venueOpenMapLink', 'Ouvrir dans Google Maps', 'اضغط هنا للوصول إلى قاعة الحفل'],
];
const CD = { fr: ['Jours', 'Heures', 'Minutes', 'Secondes'], ar: ['أيام', 'ساعات', 'دقائق', 'ثوانٍ'] };

// نص بلغتين: الفرنساوي والعربي في نفس المكان، والـ CSS بيظهر واحد بس
const T = (fr, ar, tag = 'span', cls = '') => `<${tag} class="xv-fr ${cls}">${fr}</${tag}><${tag} class="xv-ar ${cls}" dir="rtl" lang="ar">${ar}</${tag}>`;
const ORN = '<div class="xv-orn" aria-hidden="true"><i></i><b></b><i></i></div>';

// ===== كلام العيلة كامل (بعد كارت القوس) =====
const LETTER = `<section class="xv-sec xv-letter" id="xvLetter">
  <div class="xv-card">
    ${T('Outya Iman', 'وطيّة إيمان', 'h2', 'xv-h')}
    ${ORN}
    ${T('C’est avec beaucoup d’amour et de joie que nous avons le plaisir de vous inviter à partager avec nous le henné de notre chère fille. ❤️', 'بكل حب وفرحة، يشرّفنا ويفرحنا دعوتكم باش تشاركونا فرحة حنّة بنتنا الغالية ❤️', 'p', 'xv-p')}
    ${T('Une soirée exceptionnelle, placée sous le signe de l’amour et du bonheur, où nous célébrerons nos plus belles traditions entourés de notre famille et de nos proches.', 'سهرة استثنائية، تجمعنا على المحبّة والفرحة، ونحتفلوا فيها بأجمل عاداتنا وتقاليدنا، وسط العائلة والأحباب.', 'p', 'xv-p')}
    ${T('Votre présence à nos côtés donnera encore plus de valeur et de joie à ce moment, et en fera un merveilleux souvenir inoubliable.', 'وجودكم معانا يزيد اللحظة قيمة وفرحة، ويخلّيها ذكرى جميلة ما تتنساش.', 'p', 'xv-p')}
    <p class="xv-ar xv-p" dir="rtl" lang="ar">يسعدنا برشا نعيشوا معاكم السهرة الحلوة هاذي، ونتقاسموا أجمل اللحظات ونصنعوا ذكريات تبقى في القلب ديما. 🤍</p>
    ${ORN}
    ${T('Vendredi 9 avril 2027', 'الجمعة 9 أفريل 2027', 'p', 'xv-date')}
  </div>
</section>`;

// ===== ممنوع التصوير (مكان الدريس كود) =====
const NOPHOTO = `<section class="xv-sec" id="xvNoPhoto">
  <div class="xv-card xv-dark">
    <div class="xv-emo" role="img" aria-label="📵">📵</div>
    ${T('Photos et vidéos interdites', 'يُمنع التصوير والتسجيل بالفيديو', 'p', 'xv-k')}
    ${T('Afin de préserver l’intimité de la mariée et des invités, nous vous prions de respecter notre souhait de ne prendre aucune photo ni vidéo durant la soirée.', 'حرصًا منا على خصوصية هذه المناسبة وجمال لحظاتها، نرجو منكم احترام رغبتنا في عدم التقاط أي صور أو تسجيل أي مقاطع فيديو طوال السهرة.', 'p', 'xv-p')}
    ${T('Nous souhaitons que ces souvenirs restent gravés dans nos cœurs et non dans les écrans.', 'نرغب في أن تبقى هذه الذكريات محفورة في قلوبنا، لا في شاشات هواتفنا.', 'p', 'xv-p xv-i')}
    ${T('Merci pour votre compréhension, votre discrétion et votre bienveillance.', 'شكرًا جزيلًا لتفهمكم، واحترامكم، ولباقتكم.', 'p', 'xv-p')}
    <p class="xv-ar xv-s" dir="rtl" lang="ar">بكل المحبة والتقدير</p>
  </div>
</section>`;

// ===== تأكيد الحضور (عدد البالغين والأطفال) — مكان فورم القالب =====
const opts = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => `<option value="${from + i}">${from + i}</option>`).join('');
const RSVP = `<section class="xv-sec" id="xvRsvp">
  ${T('Confirmez votre présence', 'تأكيد الحضور', 'h2', 'xv-title')}
  <form class="xv-form" id="xvForm" novalidate>
    ${T('Merci de confirmer votre présence avant le 15 janvier 2027.', 'يُرجى تأكيد حضوركم قبل 15 جانفي 2027.', 'p', 'xv-dl')}
    <label class="xv-lab" for="xvName">${T('Votre nom', 'الاسم')}</label>
    <input id="xvName" maxlength="80" autocomplete="name">
    <span class="xv-lab">${T('Serez-vous présent(e)&nbsp;?', 'هل ستحضرون؟')}</span>
    <div class="xv-choice"><button type="button" data-a="yes">${T('Oui, avec joie', 'نعم، بكل سرور')}</button><button type="button" data-a="no">${T('Non, à regret', 'للأسف، لن أتمكّن')}</button></div>
    <div class="xv-cnt" id="xvCount" hidden>
      <span class="xv-q">${T('Combien d’adultes seront présents&nbsp;?', 'كم عدد البالغين الذين سيحضرون؟')}</span>
      <div class="xv-sel"><select id="xvAdults"><option value="" selected>Sélectionner</option>${opts(1, 10)}</select></div>
      <span class="xv-q">${T('Combien d’enfants seront présents&nbsp;?', 'كم عدد الأطفال الذين سيحضرون؟')}</span>
      <div class="xv-sel"><select id="xvKids"><option value="" selected>Sélectionner</option>${opts(0, 10)}</select></div>
    </div>
    <label class="xv-lab" for="xvNote">${T('Un mot pour la mariée', 'كلمة للعروسة')}</label>
    <textarea id="xvNote" rows="2" maxlength="160"></textarea>
    <button type="submit" class="xv-send" id="xvSend">${T('Envoyer ma réponse', 'إرسال الرد')}</button>
    <p class="xv-msg" id="xvMsg" aria-live="polite"></p>
  </form>
</section>`;

// ===== الآية تحت كارت البسملة — آية سورة الروم بس (بطلب المالك 2026-11-08) =====
const VERSES = `<section class="xv-sec xv-verses" id="xvVerses" dir="rtl" lang="ar">
  ${ORN}
  <p class="xv-v">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنْفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ</p>
  <p class="xv-ref">سورة الروم · 21</p>
  ${ORN}
</section>`;

const CSS = `
.xv-sec{position:relative;z-index:5;background:#f9e6d4;padding:26px 30px 30px;text-align:center;color:#2a2a2a;font-variant-numeric:lining-nums}
.xv-sec *{font-variant-numeric:lining-nums}
html:not(.xv-arabic) .xv-ar{display:none!important}
html.xv-arabic .xv-fr{display:none!important}
/* نفس شكل القالب: من غير كروت ولا خلفيات — عنوان بخط القالب وكلام زي أوصاف القالب */
.xv-card{max-width:380px;margin:0 auto}
.xv-h,.xv-title{margin:0;font:500 41px/64px 'newtemplate','Pinyon Script',cursive;color:${GOLD}}
.xv-p{margin:14px auto 0;max-width:340px;font:500 21px/1.35 'Cormorant Garamond',serif;color:#2a2a2a}
.xv-i{font-style:italic}
.xv-date{margin:0;font:400 23px/1.4 'Cormorant Garamond',serif;color:${GOLD}}
.xv-orn{display:flex;align-items:center;justify-content:center;gap:10px;width:160px;margin:14px auto}
.xv-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,${GOLD})}.xv-orn i:last-child{transform:scaleX(-1)}
.xv-orn b{width:6px;height:6px;border:1px solid ${GOLD};transform:rotate(45deg)}
.xv-emo{margin:0 0 6px;font-size:46px;line-height:1.15;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
.xv-k{margin:0;font:500 38px/1.35 'newtemplate','Pinyon Script',cursive;color:${GOLD}}
.xv-s{margin:16px 0 0;font:700 24px/1.5 'Aref Ruqaa',serif;color:${GOLD}}
.xv-form{max-width:340px;margin:16px auto 0;text-align:start}
.xv-dl{margin:0 0 18px;text-align:center;font:400 19px/24px 'Cormorant Garamond',serif;color:${GOLD}}
.xv-lab,.xv-q{display:block;margin:0 0 8px;font:400 17px/1.35 'Cormorant Garamond',serif;color:#2a2a2a}
.xv-form input,.xv-form textarea{display:block;width:100%;box-sizing:border-box;margin:0 0 16px;padding:10px 12px;border:1px solid rgba(42,42,42,.18);border-radius:4px;background:#fff;font:400 17px/1.3 'Cormorant Garamond',serif;color:#2a2a2a}
.xv-form input:focus,.xv-form textarea:focus,.xv-sel select:focus{outline:none;border-color:${GOLD}}
.xv-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 16px}
.xv-choice button{padding:10px 4px;border:1px solid rgba(42,42,42,.18);border-radius:4px;background:#fff;color:#2a2a2a;font:400 15px/1.2 'Cormorant Garamond',serif;cursor:pointer}
.xv-choice button.on{background:#747b54;border-color:#747b54;color:#fff}
.xv-cnt[hidden]{display:none!important}
.xv-sel{max-width:200px;margin:0 0 16px}
.xv-sel select{-webkit-appearance:none;appearance:none;width:100%;padding:10px 38px 10px 12px;border:1px solid rgba(42,42,42,.18);border-radius:4px;
  background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 7'%3E%3Cpath d='M0 0h12L6 7z' fill='%23866739'/%3E%3C/svg%3E") right 14px center/11px 7px no-repeat;
  font:400 17px/1.2 'Cormorant Garamond',serif;color:#2a2a2a;cursor:pointer}
.xv-sel select.empty{color:#8f8576}
.xv-send{display:block;margin:4px auto 0;padding:11px 34px;border:0;border-radius:4px;background:#747b54;color:#fff;font:400 15px/1 'Cormorant Garamond',serif;cursor:pointer}
.xv-send:disabled{opacity:.6}
.xv-msg{min-height:1.4em;margin:12px 0 0;text-align:center;font:400 17px/1.4 'Cormorant Garamond',serif;color:${GOLD}}
.xv-msg.err{color:#9b3b2e}
.xv-verses{padding:20px 28px 6px}
.xv-v{max-width:350px;margin:8px auto 0;font:400 22px/2 'Amiri',serif;color:${GOLD}}
.xv-ref{margin:0 0 8px;font:400 13px/1.4 'Amiri',serif;color:#8f8576}
/* خانات القالب اللي فيها é / î / À بالفرنساوي */
html:not(.xv-arabic) #rec2355511493 [field^="tn_text_17807605546"],html:not(.xv-arabic) #rec2339662063 [field="tn_text_1779626065755000001"],html:not(.xv-arabic) #rec2339662113 [field="tn_text_1779545032699000001"]{font-family:'Cormorant Garamond',serif!important;font-weight:500!important;font-variant-numeric:lining-nums!important}
/* زرار اللغة */
.xv-lang{position:fixed;top:calc(12px + env(safe-area-inset-top));right:max(12px,calc(50vw - 218px));z-index:2147482000;display:inline-flex;align-items:center;gap:7px;
  padding:9px 15px 9px 12px;border-radius:999px;border:1px solid rgba(134,103,57,.7);background:rgba(253,246,238,.94);color:${GOLD};
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 10px 24px -12px rgba(90,60,20,.6);font:600 16px/1 'El Messiri','Amiri',sans-serif;cursor:pointer;
  opacity:0;transform:translateY(-10px);pointer-events:none;transition:opacity .5s ease,transform .5s ease;-webkit-tap-highlight-color:transparent}
.xv-lang.on{opacity:1;transform:none;pointer-events:auto}
.xv-lang svg{width:17px;height:17px}
.xv-lang[data-to="fr"]{font:600 13px/1 'Cinzel','Cormorant Garamond',serif;letter-spacing:.06em}
/* العربي */
html.xv-arabic .xv-sec [lang="ar"],html.xv-arabic .xv-form{direction:rtl}
html.xv-arabic .xv-h,html.xv-arabic .xv-title{font:700 36px/1.6 'Aref Ruqaa',serif}
html.xv-arabic .xv-p{font:400 19px/1.95 'Amiri',serif}
html.xv-arabic .xv-date,html.xv-arabic .xv-k{font:600 17px/1.6 'El Messiri',sans-serif;letter-spacing:0}
html.xv-arabic .xv-dl,html.xv-arabic .xv-msg{font:400 18px/1.7 'Amiri',serif}
html.xv-arabic .xv-lab,html.xv-arabic .xv-q,html.xv-arabic .xv-choice button,html.xv-arabic .xv-form input,html.xv-arabic .xv-form textarea,html.xv-arabic .xv-sel select{font-family:'Amiri',serif}
html.xv-arabic .xv-sel select{padding:12px 14px 12px 40px;background-position:left 15px center}
html.xv-arabic .xv-send{font:600 16px/1 'El Messiri',sans-serif;letter-spacing:0}
html.xv-arabic .tn-atom{letter-spacing:0!important}
html.xv-arabic #rec2339662063 .tn-atom,html.xv-arabic #rec2339662093 .tn-atom,html.xv-arabic #rec2355511493 [field="tn_text_1771277026942000001"] .tn-atom,
html.xv-arabic #rec2355511493 [field="tn_text_1771277026942000001"],html.xv-arabic #rec2339662113 [field="tn_text_1771277026942000001"],html.xv-arabic #rec2339662133 .tn-atom,html.xv-arabic #rec2339662163 .tn-atom,
html.xv-arabic #rec2339662063 [field],html.xv-arabic #rec2339662093 [field],html.xv-arabic #rec2339662113 [field="tn_text_1771277026942000001"],html.xv-arabic #rec2339662133 [field],html.xv-arabic #rec2339662163 [field]{font-family:'Aref Ruqaa',serif!important;font-weight:700!important}
html.xv-arabic #rec2339662083 [field="tn_text_1779624381838000001"],html.xv-arabic #rec2355511493 [field^="tn_text_17807605546"],html.xv-arabic #rec2339662113 [field="tn_text_1779545032699000001"],html.xv-arabic #rec2339662043 [field]{font-family:'Amiri',serif!important;direction:rtl}
html.xv-arabic #venueOpenMapLink{font-family:'El Messiri','Amiri',sans-serif!important}
`;

const AR_FONTS = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=El+Messiri:wght@400..700&display=swap';

const SCRIPT = `<script id="xv-script">(function () {
  var FIELDS = ${JSON.stringify(FIELDS).replace(/</g, '\\u003c')};
  var CD = ${JSON.stringify(CD)};
  var KEY = 'xv_lang_${SHORT}';
  var lang = 'fr';
  function $(s) { return document.querySelector(s); }
  function place() {
    // الأقسام الجديدة في أماكنها بين أقسام القالب
    var after = function (id, html) { var r = document.getElementById(id); if (r && !document.getElementById(html.id)) r.insertAdjacentHTML('afterend', html.markup); };
    var before = function (id, html) { var r = document.getElementById(id); if (r && !document.getElementById(html.id)) r.insertAdjacentHTML('beforebegin', html.markup); };
    after('rec2339662083', { id: 'xvLetter', markup: ${JSON.stringify(LETTER)} });
    after('rec2339662083', { id: 'xvVerses', markup: ${JSON.stringify(VERSES)} });
    ['rec2355542373', 'rec2355574603', 'rec2339662123'].forEach(function (id) { var r = document.getElementById(id); if (r) r.style.display = 'none'; });
    before('rec2355542373', { id: 'xvNoPhoto', markup: ${JSON.stringify(NOPHOTO)} });
    before('rec2339662123', { id: 'xvRsvp', markup: ${JSON.stringify(RSVP)} });
  }
  function texts() {
    var ar = lang === 'ar';
    FIELDS.forEach(function (f) { var el = $(f[0]); if (el) el.innerHTML = ar ? f[2] : f[1]; });
    ['days', 'hours', 'minutes', 'seconds'].forEach(function (k, i) { var n = document.getElementById(k); if (n && n.nextElementSibling) n.nextElementSibling.textContent = CD[lang][i]; });
    [].forEach.call(document.querySelectorAll('#xvCount option[value=""]'), function (o) { o.textContent = ar ? 'اختر' : 'Sélectionner'; });
    document.title = ar ? 'وطيّة إيمان | دعوة حنّة' : 'Outya Iman | Invitation au henné';
    document.documentElement.classList.toggle('xv-arabic', ar);
  }
  var fontsOn = false;
  function fonts() { if (fontsOn) return; fontsOn = true; var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ${JSON.stringify(AR_FONTS)}; document.head.appendChild(l); }
  function setLang(l) {
    lang = l; if (l === 'ar') fonts(); texts();
    var b = document.getElementById('xvLang');
    if (b) { b.dataset.to = l === 'ar' ? 'fr' : 'ar'; b.querySelector('span').textContent = l === 'ar' ? 'Français' : 'عربي'; }
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }
  function rsvp() {
    var form = document.getElementById('xvForm'); if (!form) return;
    var att = null, msg = document.getElementById('xvMsg'), box = document.getElementById('xvCount');
    var ad = document.getElementById('xvAdults'), kd = document.getElementById('xvKids');
    var say = function (fr, ar, bad) { msg.textContent = lang === 'ar' ? ar : fr; msg.className = 'xv-msg' + (bad ? ' err' : ''); };
    var mark = function () { [ad, kd].forEach(function (s) { s.classList.toggle('empty', s.value === ''); }); };
    [ad, kd].forEach(function (s) { s.addEventListener('change', function () { mark(); msg.textContent = ''; }); }); mark();
    [].forEach.call(form.querySelectorAll('.xv-choice button'), function (b) {
      b.addEventListener('click', function () {
        att = b.getAttribute('data-a') === 'yes';
        [].forEach.call(form.querySelectorAll('.xv-choice button'), function (x) { x.classList.toggle('on', x === b); });
        box.hidden = !att; msg.textContent = '';
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('xvName').value.trim().replace(/\\s+/g, ' ');
      var note = document.getElementById('xvNote').value.trim();
      if (name.length < 2) { say('Merci d’indiquer votre nom', 'من فضلك اكتب اسمك', 1); return; }
      if (att === null) { say('Merci de choisir : oui ou non', 'من فضلك اختر: نعم أو لا', 1); return; }
      if (att && ad.value === '') { say('Merci d’indiquer le nombre d’adultes', 'من فضلك اختر عدد البالغين', 1); return; }
      if (att && kd.value === '') { say('Merci d’indiquer le nombre d’enfants', 'من فضلك اختر عدد الأطفال', 1); return; }
      var send = document.getElementById('xvSend'); send.disabled = true;
      fetch('/i/${SHORT}/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ guestName: name, attending: att ? 'yes' : 'no', note: ((att ? 'Adultes : ' + ad.value + ' · Enfants : ' + kd.value + (note ? ' — ' + note : '') : note)).slice(0, 200) }) })
        .then(function (r) { if (!r.ok) throw 0; say(att ? 'Merci ' + name.split(' ')[0] + ' — nous avons hâte de vous voir 🤍' : 'Merci ' + name.split(' ')[0] + ' — vous serez dans nos cœurs 🤍', att ? 'شكرًا ' + name.split(' ')[0] + ' — بانتظاركم 🤍' : 'شكرًا ' + name.split(' ')[0] + ' — ستكونون في قلوبنا 🤍'); })
        .catch(function () { say('Envoi impossible — merci de réessayer', 'تعذّر الإرسال — حاول مرة أخرى', 1); })
        .then(function () { send.disabled = false; });
    });
  }
  function button() {
    if (/[?&]edit=1/.test(location.search)) return;
    var b = document.createElement('div');
    b.id = 'xvLang'; b.className = 'xv-lang'; b.setAttribute('role', 'button'); b.tabIndex = 0;
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.9 2.7 15.1 0 18M12 3c-2.7 2.9-2.7 15.1 0 18"/></svg><span>عربي</span>';
    b.dataset.to = 'ar';
    document.body.appendChild(b);
    var go = function () { setLang(b.dataset.to); };
    b.addEventListener('click', go);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    var show = function () { setTimeout(function () { b.classList.add('on'); }, 2000); };
    var enter = document.querySelector('.popup-enter');
    if (enter && !(window.WEDDING_CONFIG || {}).autoOpen) enter.addEventListener('click', function () { fonts(); show(); }); else show();
  }
  function init() {
    place(); rsvp(); button();
    var start = 'fr';
    try { start = new URLSearchParams(location.search).get('lang') || localStorage.getItem(KEY) || 'fr'; } catch (e) {}
    setLang(start === 'ar' ? 'ar' : 'fr');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();</script>`;

/** لحظة الحنة بتوقيت تونس (UTC+1) بدل مصر — العدّاد عليها */
function tunisTime(html) {
  const m = html.match(/"countdown":\{"year":(\d+),"monthIndex":(\d+),"day":(\d+),"hour":(\d+),"minute":(\d+)\}/);
  if (!m) return html;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const iso = new Date(Date.UTC(y, mo, d, h - 1, mi)).toISOString();
  return html.replace(/"weddingDateTimeISO":"[^"]*"/, () => `"weddingDateTimeISO":"${iso}"`);
}

module.exports = {
  shortId: SHORT,

  share: {
    title: 'Outya Iman — وطيّة إيمان',
    description: 'Vendredi 9 avril 2027 · 18h00 · Hacienda Events, Ariana',
  },

  render() {
    return {
      head: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap"><style id="xv-style">${CSS}</style>`,
      bodyEnd: SCRIPT,
    };
  },

  transform(html) {
    return tunisTime(html);
  },
};
