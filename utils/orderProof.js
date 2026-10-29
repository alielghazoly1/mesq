// "العميل بعت إثبات الدفع" = صورة إيصال **أو** رقم الموبايل اللي حوّل منه
// (فودافون كاش / إنستاباي — بيكتبه بدل الإيصال، routes/uploads.js).
// كل الأماكن اللي بتعدّ "إيصالات مستنية" أو بتقول "رفع إيصال" بتستعمل ده.
const HAS_PROOF = { $or: [{ paymentProofUrl: { $ne: null } }, { paymentSenderPhone: { $ne: null } }] };
const NO_PROOF = { paymentProofUrl: null, paymentSenderPhone: null };
const hasProof = (o) => !!(o && (o.paymentProofUrl || o.paymentSenderPhone));

module.exports = { HAS_PROOF, NO_PROOF, hasProof };
