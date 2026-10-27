// دعوة NERy7o2 (Royal Maroon — خالد وسميه) — بطلب المالك:
// كارت دخول بباركود (QR) بنفس شكل الدعوة (برجندي ودهبي)، تحت مكان الحفل،
// وتحته ملاحظات الدخول. الباركود بيفتح لينك الدعوة نفسها لو اتعمله سكان
// (custom-invitations/NERy7o2-qr.svg — اتعمل بمكتبة qrcode).
// وكمان: عنوان صغير فوق كل اسم في "معلومات الحفل" (والد/والدة العريس والعروس).
// الأسامي والعائلات والمواعيد نفسها في utils/oneOffFixes.js (NERy7o2-families).
const fs = require('fs');
const path = require('path');

const QR = fs.readFileSync(path.join(__dirname, 'NERy7o2-qr.svg'), 'utf8').trim();

const CSS = `
/* معلومات الحفل: الدور فوق كل اسم */
[data-elem-id="7000000000019"]::before,[data-elem-id="7000000000020"]::before,
[data-elem-id="7000000000021"]::before,[data-elem-id="7000000000022"]::before{
  display:block;margin-top:8px;font-size:11px;font-weight:400;color:var(--text-muted-rose);line-height:1.6}
[data-elem-id="7000000000019"]::before{content:"والد العريس"}
[data-elem-id="7000000000020"]::before{content:"والدة العريس"}
[data-elem-id="7000000000021"]::before{content:"والد العروس"}
[data-elem-id="7000000000022"]::before{content:"والدة العروس"}

/* كارت الدخول */
.ne-pass{position:relative;max-width:440px;margin:6px auto 46px;padding:0 18px}
.ne-card{position:relative;padding:30px 24px 28px;border-radius:26px;text-align:center;color:var(--text-cream);
  background:linear-gradient(160deg,var(--maroon) 0%,var(--maroon-dark) 100%);box-shadow:var(--shadow-card);overflow:hidden}
.ne-card::before{content:"";position:absolute;inset:9px;border-radius:19px;border:1px solid var(--line-on-maroon);pointer-events:none}
.ne-eye{font:500 13px/1 var(--serif-en);letter-spacing:.32em;text-transform:uppercase;color:var(--gold-light);direction:ltr}
.ne-title{margin:8px 0 0;font:700 22px/1.4 var(--serif-ar);color:var(--text-cream)}
.ne-orn{display:flex;align-items:center;justify-content:center;gap:9px;margin:12px auto 18px;width:150px}
.ne-orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold))}
.ne-orn i:last-child{transform:scaleX(-1)}
.ne-orn b{width:7px;height:7px;border:1px solid var(--gold);transform:rotate(45deg)}
.ne-qr{position:relative;width:190px;height:190px;margin:0 auto;padding:16px;box-sizing:border-box;border-radius:18px;background:var(--cream);
  box-shadow:0 0 0 1.5px var(--gold),0 0 0 6px rgba(201,152,87,.16),0 18px 30px -16px rgba(0,0,0,.6)}
.ne-qr svg{display:block;width:100%;height:100%}
.ne-qr .ne-c{position:absolute;width:22px;height:22px;border:2px solid var(--gold)}
.ne-c.a{top:-7px;left:-7px;border-right:0;border-bottom:0;border-radius:8px 0 0 0}
.ne-c.b{top:-7px;right:-7px;border-left:0;border-bottom:0;border-radius:0 8px 0 0}
.ne-c.c{bottom:-7px;left:-7px;border-right:0;border-top:0;border-radius:0 0 0 8px}
.ne-c.d{bottom:-7px;right:-7px;border-left:0;border-top:0;border-radius:0 0 8px 0}
/* خط "سكان" دهبي بيعدّي على الباركود */
.ne-scan{position:absolute;left:10px;right:10px;top:12px;height:2px;border-radius:2px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);box-shadow:0 0 12px 2px rgba(201,152,87,.55);opacity:0}
.ne-pass.in .ne-scan{animation:neScan 2.6s ease-in-out .6s infinite}
@keyframes neScan{0%{top:12px;opacity:0}12%{opacity:1}50%{top:calc(100% - 14px);opacity:1}62%{opacity:0}100%{top:12px;opacity:0}}
.ne-who{margin:22px 0 0;font:700 19px/1.4 var(--serif-ar);color:var(--gold-light)}
.ne-when{margin:4px 0 0;font:500 14px/1.5 var(--serif-en);letter-spacing:.18em;color:var(--text-muted-rose);direction:ltr}
.ne-notes{margin:22px auto 0;padding:16px 14px 4px;border-top:1px solid var(--line-on-maroon);max-width:330px}
.ne-notes p{margin:0 0 10px;font:400 14.5px/1.75 var(--sans-ar);color:var(--text-cream)}
.ne-notes p.ne-ty{color:var(--gold-light);font-weight:700}
/* ظهور لما الضيف يوصله */
.ne-pass .ne-card{opacity:0;transform:translateY(22px) scale(.98);transition:opacity .8s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
.ne-pass.in .ne-card{opacity:1;transform:none}
.ne-pass .ne-qr{transform:scale(.85);opacity:0;transition:transform .9s cubic-bezier(.3,1.4,.5,1) .35s,opacity .6s ease .35s}
.ne-pass.in .ne-qr{transform:none;opacity:1}
@media (prefers-reduced-motion:reduce){.ne-pass .ne-card,.ne-pass .ne-qr{transition:none}.ne-pass.in .ne-scan{animation:none}}
`;

const HTML = `<section class="ne-pass" id="ne-pass" aria-label="بطاقة الدخول">
  <div class="ne-card">
    <div class="ne-eye" data-elem-id="ne1">Entry Pass</div>
    <h2 class="ne-title" data-elem-id="ne2">بطاقة الدخول</h2>
    <div class="ne-orn" aria-hidden="true"><i></i><b></b><i></i></div>
    <div class="ne-qr" role="img" aria-label="باركود الدخول">${QR}<i class="ne-c a"></i><i class="ne-c b"></i><i class="ne-c c"></i><i class="ne-c d"></i><span class="ne-scan"></span></div>
    <p class="ne-who" data-elem-id="ne3">خالد &amp; سميه</p>
    <p class="ne-when" data-elem-id="ne4">05 · 12 · 2026</p>
    <div class="ne-notes">
      <p data-elem-id="ne5">الدخول عن طريق الباركود المرفق فقط.</p>
      <p data-elem-id="ne6">الأطفال غير مسموح بدخولهم حسب سياسة القاعة.</p>
      <p class="ne-ty" data-elem-id="ne7">شكرًا لتفهّمكم 🤍</p>
    </div>
  </div>
</section>`;

// الكارت بيتحط في الصفحة نفسها (مش بسكريبت) عشان يبقى موجود من أول لحظة
// والمحرر يقدر يعدّل كلامه زي أي عنصر في الدعوة.
const SCRIPT = `(function(){
var el=document.getElementById('ne-pass');if(!el)return;
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){el.classList.add('in');io.disconnect();}});},{threshold:.2});
  io.observe(el);
} else el.classList.add('in');
})();`;

const ANCHOR = '<section class="container guestbook-section">';

module.exports = {
  shortId: 'NERy7o2',

  render({ editMode } = {}) {
    // المحرر: الكارت ظاهر على طول (من غير ما يستنى السكرول) عشان يتعدّل
    const edit = editMode ? '<style>.ne-pass .ne-card,.ne-pass .ne-qr{opacity:1!important;transform:none!important}</style>' : '';
    return {
      head: `<style id="ne-style">${CSS}</style>${edit}`,
      bodyEnd: `<script id="ne-script">${SCRIPT}</script>`,
    };
  },

  // كارت الدخول قبل "سجل التهاني" على طول (يعني تحت مكان الحفل والدريس كود)
  transform(html) {
    if (html.split(ANCHOR).length !== 2) return html;
    return html.replace(ANCHOR, () => HTML + '\n  ' + ANCHOR);
  },
};
