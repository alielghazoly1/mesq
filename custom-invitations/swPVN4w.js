// دعوة swPVN4w — محمود ويارا. بطلب المالك (2026-11-28): قالب Finca العام زي ما هو (بكل مميزاته: الختم بالقلب،
// علامات ×، الأيقونات، المواعيد المربوطة)، بالعربي، والأسامي بخط المالك نفسه (صور) بدل الخط العادي:
//  • الهيرو (فوق فيديو الفينكا الغامق): الأسامي بالأبيض، محمود فوق و"و" دهبي ويارا تحت.
//  • الختام (أخضر غامق): محمود و يارا في سطر واحد بالأبيض.
//  • رسالتين الشكر (بعد "هحضر" و"مش هقدر"): الأسامي بلون القالب الغامق.
// الصور في client/public/custom/swPVN4w/ (الحبر اتفصل من ورق الصورة اللي المالك بعتها واتكبّر ×2 بحواف ناعمة).
// البيانات (عربي + الأسامي): oneOffFix swPVN4w-mahmoud-yara-ar. لو صاحب الدعوة رجّعها إنجليزي الصور مابتتحطش.
const { asset } = require('./_asset');

const SHORT = 'swPVN4w';
const A = (f) => asset(`/custom/${SHORT}/${f}`);

const HEAD = `<style id="sw-names">
.sw-nm{display:inline-block;width:auto;max-width:none;vertical-align:middle;pointer-events:none;user-select:none;-webkit-user-select:none}
#fcHero .sw-nm{filter:drop-shadow(0 3px 14px rgba(0,0,0,.35))}
#fcHero [data-elem-id="fc3"] .sw-nm{height:100px}
#fcHero [data-elem-id="fc5"] .sw-nm{height:118px}
#fcHero [data-elem-id="fc4"]{font-family:'Aref Ruqaa','Amiri',serif;font-style:normal;font-weight:700;font-size:3.6rem;line-height:1;margin:.1rem 0 .3rem;text-shadow:0 2px 12px rgba(0,0,0,.35)}
@media (min-width:768px){#fcHero [data-elem-id="fc4"]{font-size:4.4rem}}
@media (min-width:768px){#fcHero [data-elem-id="fc3"] .sw-nm{height:138px}#fcHero [data-elem-id="fc5"] .sw-nm{height:162px}}
.sw-row{display:inline-flex;align-items:center;justify-content:center;gap:14px;direction:rtl;vertical-align:middle}
.sw-and{font-family:'Aref Ruqaa','Amiri',serif;color:hsl(var(--gold));font-size:1.7rem;line-height:1}
footer .sw-row .sw-nm.m{height:56px}
footer .sw-row .sw-nm.y{height:66px}
[data-f="sig"] .sw-row .sw-nm.m{height:50px}
[data-f="sig"] .sw-row .sw-nm.y{height:60px}
[data-f="sig"] .sw-row{opacity:.85}
</style>`;

function bodyEnd() {
  const N = { mw: A('name-mahmoud-w.png'), yw: A('name-yara-w.png'), md: A('name-mahmoud-d.png'), yd: A('name-yara-d.png') };
  const cfg = JSON.stringify(N).replace(/</g, '\\u003c');
  return `<script>(function(){
var C=window.WEDDING_CONFIG||{};if(C.language!=='ar')return;
var N=${cfg};
var by=function(id){return document.querySelector('[data-elem-id="'+id+'"]')};
var img=function(src,alt,cls){return '<img src="'+src+'" alt="'+alt+'" class="sw-nm '+cls+'" draggable="false" decoding="async">'};
var put=function(id,html){var el=by(id);if(el)el.innerHTML=html};
put('fc3',img(N.mw,'محمود','m'));
put('fc5',img(N.yw,'يارا','y'));
var row=function(w){return '<span class="sw-row">'+img(w?N.mw:N.md,'محمود','m')+'<span class="sw-and">و</span>'+img(w?N.yw:N.yd,'يارا','y')+'</span>'};
put('fc102',row(true));put('fc96',row(false));put('fc101',row(false));
})();</script>`;
}

module.exports = {
  shortId: SHORT,
  render() {
    return { head: HEAD, bodyEnd: bodyEnd() };
  },
};
