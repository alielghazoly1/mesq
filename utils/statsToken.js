// utils/statsToken.js
// توليد توكن سري فريد لصفحة إحصائيات الدعوة (/s/:statsToken).
// مشترك بين routes/invitations.js (اللينك القديم بيولّد عند التحويل)
// وroutes/dashboard.js (زرار مشاركة التقرير) عشان منطق التوليد يفضل واحد.
const { generateShortId } = require('./idGenerator');

/**
 * @param {import('mongoose').Model} Invitation موديل الدعوة (بنمرره بدل
 *   ما نستورده هنا عشان نتجنب أي اعتماد دائري)
 * @returns {Promise<string>} توكن 24 حرف مضمون إنه مش مكرر
 */
async function generateStatsToken(Invitation) {
  // 24 حرف — احتمال التكرار عمليًا صفر، بس بنعمل محاولات احتياطية عشان
  // القاعدة تفضل نضيفة تحت أي ظرف.
  for (let i = 0; i < 5; i++) {
    const token = generateShortId(24);
    // eslint-disable-next-line no-await-in-loop
    const exists = await Invitation.exists({ statsToken: token });
    if (!exists) return token;
  }
  throw new Error('failed to generate unique stats token');
}

module.exports = { generateStatsToken };
