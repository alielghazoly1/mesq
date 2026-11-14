// دعوة Bnm4rJd (Champagne Lace) — منى ومحمد، 31/12/2026، Tolip hotel Olympic international City (Majestic hall).
// بطلب المالك (2026-11-14): حاجة واحدة بس — الأغنية بقت "Coming up roses" اللي بعتها (صوتها متظبط على مستوى أغاني
// الموقع وبتختفي بالراحة في آخرها عشان اللفّة تبقى ناعمة — 55 ثانية). غير كده الدعوة زي ما صاحبها عاملها في المحرر
// بالظبط. أغنية العميل القديمة اتشالت من التخصيصات (oneOffFix Bnm4rJd-owner-song) لأنها كانت بتغلب؛ لو العميل
// اختار أغنية من المحرر بعد كده هي اللي هتشتغل.
const { asset } = require('./_asset');

const SHORT = 'Bnm4rJd';

module.exports = {
  shortId: SHORT,

  render() {
    return {};
  },

  transform(html) {
    return html.replace('<source src="/templates/champagne-lace/song.mp3"', () => `<source src="${asset(`/custom/${SHORT}/song.mp3`)}"`);
  },
};
