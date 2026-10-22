// routes/adminFinance.js
// صفحة الأرباح في لوحة التحكم: الإيرادات − المصاريف = صافي الربح
// (الحسابات في utils/finance.js) + إدارة المصاريف اليدوية وأسعار الصرف.
const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');
const { requireAdminSession } = require('../middleware/adminAuth');
const { logAdminAction } = require('../utils/adminAudit');
const { sanitizeText } = require('../utils/sanitize');
const { cairoWallToDate } = require('../utils/cairoTime');
const { buildFinance, setRates, round2 } = require('../utils/finance');

const router = express.Router();

/** 'YYYY-MM-DD' (يوم بتوقيت مصر) → لحظة نص اليوم */
function parseDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return null;
  const d = cairoWallToDate(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** بيانات مصروف من الفورم — partial = تعديل (الحقول المبعوتة بس) */
function cleanExpense(body, partial) {
  const out = {};
  const err = (msg) => { const e = new Error(msg); e.status = 400; throw e; };
  if (!partial || body.title !== undefined) {
    const t = sanitizeText(body.title, 80);
    if (!t) err('اكتب اسم المصروف.');
    out.title = t;
  }
  if (!partial || body.amount !== undefined) {
    const a = Number(body.amount);
    if (!Number.isFinite(a) || a <= 0 || a > 100000000) err('المبلغ لازم يبقى رقم أكبر من صفر.');
    out.amount = round2(a);
  }
  if (!partial || body.currency !== undefined) {
    const c = String(body.currency || 'EGP');
    if (!['EGP', 'USD', 'SAR', 'EUR'].includes(c)) err('العملة مش معروفة.');
    out.currency = c;
  }
  if (!partial || body.category !== undefined) {
    const c = String(body.category || 'other');
    out.category = CATEGORIES.includes(c) ? c : 'other';
  }
  if (!partial || body.date !== undefined) {
    const d = parseDay(body.date);
    if (!d) err('التاريخ مش صحيح.');
    if (d.getTime() > Date.now() + 2 * 864e5) err('مينفعش تسجّل مصروف بتاريخ لسه ماجاش.');
    out.date = d;
  }
  if (!partial || body.recurring !== undefined) out.recurring = !!body.recurring;
  if (!partial || body.note !== undefined) out.note = sanitizeText(body.note, 300);
  return out;
}

// GET /admin/api/finance?month=YYYY-MM | all
router.get('/admin/api/finance', requireAdminSession, async (req, res) => {
  try {
    return res.json(await buildFinance(String(req.query.month || '')));
  } catch (err) {
    console.error('Error building finance:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// PUT /admin/api/finance/rates  { USD, SAR, EUR } (كام جنيه في الوحدة)
router.put('/admin/api/finance/rates', requireAdminSession, async (req, res) => {
  try {
    const rates = await setRates(req.body || {});
    logAdminAction(req, 'finance.rates', { type: 'settings', label: 'أسعار الصرف' }, { USD: rates.USD, SAR: rates.SAR, EUR: rates.EUR });
    return res.json({ ok: true, rates });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('Error saving rates:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// POST /admin/api/expenses
router.post('/admin/api/expenses', requireAdminSession, async (req, res) => {
  try {
    const data = cleanExpense(req.body || {}, false);
    const exp = await Expense.create(data);
    logAdminAction(req, 'expense.create', { type: 'expense', id: exp._id, label: exp.title }, { amount: exp.amount, currency: exp.currency, recurring: exp.recurring });
    return res.status(201).json({ ok: true, id: String(exp._id) });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('Error creating expense:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// PATCH /admin/api/expenses/:id — تعديل، أو { stop: true } يوقّف المصروف الشهري
// من الشهر ده (بيتحسب لحد الشهر الحالي ويقف)، أو { stop: false } يرجّعه
router.patch('/admin/api/expenses/:id', requireAdminSession, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'المصروف ده مش موجود.' });
    const exp = await Expense.findById(req.params.id);
    if (!exp) return res.status(404).json({ error: 'المصروف ده مش موجود.' });
    const body = req.body || {};
    const data = cleanExpense(body, true);
    if (body.stop === true) data.endedAt = new Date();
    if (body.stop === false) data.endedAt = null;
    Object.assign(exp, data, { updatedAt: new Date() });
    await exp.save();
    logAdminAction(req, body.stop === true ? 'expense.stop' : 'expense.update', { type: 'expense', id: exp._id, label: exp.title }, data);
    return res.json({ ok: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('Error updating expense:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

// DELETE /admin/api/expenses/:id
router.delete('/admin/api/expenses/:id', requireAdminSession, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'المصروف ده مش موجود.' });
    const exp = await Expense.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ error: 'المصروف ده مش موجود.' });
    logAdminAction(req, 'expense.delete', { type: 'expense', id: exp._id, label: exp.title }, { amount: exp.amount, currency: exp.currency });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting expense:', err);
    return res.status(500).json({ error: 'حصل خطأ في السيرفر' });
  }
});

module.exports = router;
