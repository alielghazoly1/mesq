// models/Rsvp.js
// رد حضور واحد من ضيف على دعوة معينة. كل دعوة ممكن يبقى ليها أي عدد من
// الردود (كل ضيف بيبعت رده لوحده)، مربوطين كلهم بـ shortId بتاع الدعوة.
const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  // shortId مش invitationId (ObjectId) عشان ده نفس المعرّف اللي العميل
  // (متصفح الضيف) شايفه في اللينك، فمفيش داعي لأي lookup إضافي وقت الإرسال.
  shortId: { type: String, required: true, index: true },

  guestName: { type: String, required: true, maxlength: 80 },
  attending: { type: Boolean, required: true },
  // "يمكن" (قالب Peacock & Sun بيسأل أيوه/يمكن/لأ): بيتخزن attending=false
  // + maybe=true، عشان كل العدّادات القديمة اللي بتعدّ attending تفضل صح
  // (اللي قال "يمكن" مش بيتحسب حاضر)، والردود القديمة مالهاش الحقل ده.
  maybe: { type: Boolean, default: false },
  note: { type: String, maxlength: 200, default: '' },

  // بصمة الجهاز (نفس الكوكي المستخدم في تحديد المعدل) — بتتسجل بس عشان
  // نقدر نمنع إسبام من نفس الجهاز على نفس الدعوة، مش لأي غرض تاني.
  deviceId: { type: String, default: null },
  ipHash: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

// أسرع استعلام محتاجينه: "هات كل الردود بتاعة الدعوة دي" (لصفحة الإحصائيات)،
// مرتبة بالأحدث الأول.
rsvpSchema.index({ shortId: 1, createdAt: -1 });

module.exports = mongoose.model('Rsvp', rsvpSchema);
