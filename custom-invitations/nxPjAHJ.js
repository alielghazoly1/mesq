// دعوة يحيى ونغم (Ivory Swans) — بطلب المالك:
//  1) "Save the date": يوم الفرح (5 ديسمبر) عليه قلب ذهبي بدل المربع.
//  2) صور الحكاية: الصورتين اللي على الجنب (فاضيين) اتشالوا، واللي في النص
//     لوحدها وأكبر — بتاخد مكان التلاتة.
// CSS بس، خاص بالدعوة دي — القالب نفسه وباقي الدعوات زي ما هم.

// قلب بخط ذهبي وتعبئة خفيفة (نفس لون المربع القديم #c99a4a)
const HEART = 'data:image/svg+xml,'
  + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22"><path d="M12 20.4S2.6 14.6 1.5 8.6C.8 4.8 3.3 1.6 6.9 1.6c2.2 0 3.9 1.2 5.1 3 1.2-1.8 2.9-3 5.1-3 3.6 0 6.1 3.2 5.4 7-1.1 6-10.5 11.8-10.5 11.8z" fill="rgba(201,154,74,0.14)" stroke="#c99a4a" stroke-width="1.5" stroke-linejoin="round"/></svg>');

const CSS = `
#std-section .stdcal-day.is-wed{z-index:1}
#std-section .stdcal-day.is-wed::before{
  inset:-16% -14% -10% -14%;border:0;border-radius:0;box-shadow:none;z-index:-1;
  background:url("${HEART}") center/contain no-repeat;
  filter:drop-shadow(0 3px 6px rgba(201,154,74,.35));
  animation:nx-beat 2.6s ease-in-out infinite;
}
@keyframes nx-beat{0%,100%{transform:scale(1)}12%{transform:scale(1.09)}24%{transform:scale(1)}36%{transform:scale(1.06)}48%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){#std-section .stdcal-day.is-wed::before{animation:none}}

#hf-section .hf-col.a,#hf-section .hf-col.c{display:none!important}
#hf-section .hf-frames{gap:0}
#hf-section .hf-col.b{flex:0 0 auto;max-width:none}
#hf-section .hf-col.b .hf-frame{width:min(360px,78vw);height:auto;aspect-ratio:3/4;border-radius:26px}
#hf-section .hf-col.b .hf-frame::after{border-radius:20px}
#hf-section .hf-col.b .hf-caption{font-size:44px}
`;

module.exports = {
  shortId: 'nxPjAHJ',

  /** نفس الشكل للضيوف وفي المحرر */
  render() {
    return { head: `<style id="nx-style">${CSS}</style>` };
  },
};
