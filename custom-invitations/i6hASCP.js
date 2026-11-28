// دعوة i6hASCP (Ivory Swans) — فرح أحمد ونايرة. بطلب المالك (2026-11-28): كارت اللينك لما يتبعت —
// صورة العروسين (client/public/custom/i6hASCP/share.jpg، 1200x630 مقصوصة من صورتهم)، العنوان زي ما هو مكتوب
// "Ahmed & Naira_Wedding Invitation"، وتحته "24 December 2026 · Al-Jalaa club, Joya Hall" بدل "Venue، City".
// كارت المشاركة بس — الدعوة نفسها مااتلمستش.
const { asset } = require('./_asset');

module.exports = {
  shortId: 'i6hASCP',
  share: {
    image: asset('/custom/i6hASCP/share.jpg'),
    width: 1200,
    height: 630,
    overrideImage: true,
    title: 'Ahmed & Naira_Wedding Invitation',
    description: '24 December 2026 · Al-Jalaa club, Joya Hall',
  },
  render() {
    return {};
  },
};
