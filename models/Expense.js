// models/Expense.js
// مصاريف المالك اللي بيسجّلها بنفسه في صفحة الأرباح (استضافة، أدوات، تصميم،
// إعلانات برّه صفحة الإعلانات…). مصاريف الإعلانات المسجّلة في "الإعلانات"
// وعمولات المسوّقين المدفوعة بتتحسب لوحدها تلقائي (utils/finance.js) —
// مش بتتسجّل هنا عشان ماتتحسبش مرتين.
//
// recurring = مصروف شهري ثابت (اشتراك/استضافة): بيتحسب في كل شهر من شهر
// "date" لحد شهر "endedAt" (أو لحد دلوقتي لو لسه شغال).
const mongoose = require('mongoose');

const CATEGORIES = ['ads', 'hosting', 'tools', 'design', 'team', 'fees', 'other'];

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  amount: { type: Number, required: true, min: 0, max: 100000000 },
  currency: { type: String, enum: ['EGP', 'USD', 'SAR', 'EUR'], default: 'EGP' },
  category: { type: String, enum: CATEGORIES, default: 'other' },
  // يوم الصرف (أو أول شهر للمصروف الشهري)
  date: { type: Date, required: true, index: true },
  recurring: { type: Boolean, default: false },
  // آخر شهر بيتحسب فيه المصروف الشهري (null = لسه شغال)
  endedAt: { type: Date, default: null },
  note: { type: String, default: '', trim: true, maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
