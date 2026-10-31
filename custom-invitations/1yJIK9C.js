// دعوة عمرو ونور (Ivory Swans، عربي) — بطلب المالك "اشيل الجزئية اللي فيها
// الصور". الصور التلاتة اللي متعلّقة في قسم الحكاية اتشالت (iv2–iv4 مخفيين
// من oneOffFixes)، بس إطاراتها وخيوطها كانت سايبة مساحة فاضية كبيرة — فهنا
// بنشيل الحتة دي كلها، وكلام القسم (اللي بقى لعقد القران) يطلع على طول.
// وصورة القاعة العامة اللي في قسم المكان (مش قاعة أوسيل الحقيقية) اتشالت كمان.
// البيانات نفسها (الأسامي، التاريخ، المكان، العائلات) في utils/oneOffFixes.js.

const CSS = `
#hf-section .hf-frames{display:none!important}
#hf-section .hf-wedding-block{margin-top:0!important}
#hf-section{padding-top:56px!important;padding-bottom:80px!important}
/* صورة القاعة في القالب صورة عامة مش قاعة أوسيل — مالهاش لازمة */
#loc-section .loc-photo-wrap{display:none!important}
/* مكان عقد القران: اسم المسجد كبير، وتحته "بجوار…" أصغر — في نفس العنصر
   (iv20، سطرين) فبينزلوا مع بعض على أي شاشة */
#hf-section [data-elem-id="iv20"]{font-size:19px;line-height:1.9;color:#8c795d;white-space:pre-wrap}
#hf-section [data-elem-id="iv20"]::first-line{font-size:31px;line-height:1.7;color:#6b5738}
/* العائلات تحت "بمباركة أهلهما الكرام" — عمودين زي ما المالك كان مرتّبهم:
   عائلات العريس يمين وعائلات العروسة شمال، و"&" بين كل اتنين، وخط فاصل في النص */
#fb-section [data-elem-id="iv22"]{font-family:'Amiri',serif;font-style:normal;font-size:21px;line-height:1.5;color:#333;white-space:normal!important;
  display:grid;grid-template-columns:1fr 1fr;align-items:center;max-width:420px;margin:6px auto 34px}
#fb-section [data-elem-id="iv22"] .ab-col{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 10px;text-wrap:balance}
#fb-section [data-elem-id="iv22"] .ab-col+.ab-col{border-inline-start:1px solid rgba(175,155,106,.55)}
#fb-section [data-elem-id="iv22"] .ab-amp{font-size:16px;line-height:1.2}
@media (max-width:380px){
  #hf-section [data-elem-id="iv20"]{font-size:17px}
  #hf-section [data-elem-id="iv20"]::first-line{font-size:28px}
  #fb-section [data-elem-id="iv22"]{font-size:19px}
  #fb-section [data-elem-id="iv22"] .ab-col{padding:4px 6px}
}
`;

// iv22 مكتوب كده: سطور العمود الأول، سطر فاضي، سطور العمود التاني. هنا بنرسمه
// عمودين. النص المرسوم بنفس الحروف والسطور بالظبط، فسكربت الصفحة اللي بيرجّع
// النص المحفوظ مابيلاقيش فرق ومابيمسحش الترتيب.
const FAMS_SCRIPT = `(function(){
  function esc(t){return t.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function build(el){
    if(el.querySelector('.ab-col')||el.isContentEditable)return;
    var txt=el.textContent; if(txt.indexOf('\\n\\n')<0)return;
    var html=txt.split('\\n\\n').map(function(col){
      return '<span class="ab-col">'+col.split('\\n').map(function(l){
        return '<span'+(l.trim()==='&'?' class="ab-amp"':'')+'>'+esc(l)+'</span>';
      }).join('\\n')+'</span>';
    }).join('\\n\\n');
    el.innerHTML=html;
  }
  function run(){var el=document.querySelector('#fb-section [data-elem-id="iv22"]'); if(!el)return;
    build(el); new MutationObserver(function(){build(el);}).observe(el,{childList:true,characterData:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();`;

module.exports = {
  shortId: '1yJIK9C',

  /** نفس الشكل للضيوف وفي المحرر */
  render() {
    return { head: `<style id="ab-style">${CSS}</style>`, bodyEnd: `<script id="ab-fams">${FAMS_SCRIPT}</script>` };
  },
};
