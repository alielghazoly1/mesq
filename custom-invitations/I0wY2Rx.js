// دعوة Mai & Ahmed (Champagne Lace، إنجليزي) — بطلب المالك:
// التاريخ ظاهر على طول من غير خربشة: كروت اليوم/الشهر/السنة مكشوفة،
// و"You’re invited!" ظاهرة، وجملة "امسح" اتشالت. CSS بس — باقي القالب زي ما هو.

const CSS = `
#hv-hero .hv-tile__coat{display:none!important}
#hv-hero .hv-reveal__hint{display:none!important}
#hv-hero .hv-tile{cursor:default}
#hv-hero .hv-reveal__msg{opacity:1!important;transform:none!important}
`;

module.exports = {
  shortId: 'I0wY2Rx',

  /** نفس الشكل للضيوف وفي المحرر */
  render() {
    return { head: `<style id="i0-style">${CSS}</style>` };
  },
};
