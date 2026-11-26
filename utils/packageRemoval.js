// utils/packageRemoval.js
// إلغاء / إزالة باقة عميل من لوحة التحكم (بطلب المالك 2026-11-27).
//
//  • إلغاء الباقة  → مفيش باقة + subscription.cancelledAt (utils/editWindow.js بيقفل التعديل والدعوات الجديدة
//                    خالص، زي العميل المجاني) + مسوداته بتتشال.
//  • إزالة الباقة  → نفس الإلغاء + كل دعواته (المنشورة كمان) + كل طلباته (فبتختفي من "طلبات اليوم"
//                    ومن الفلوس اللي دخلت).
//
// مفيش حاجة بتتمسح للأبد: الدعوات بتتنقل لـ removedinvitations والطلبات لـ removedorders بنفس شكلها
// بالظبط + _removedAt/_reason/_by — لو الضغطة كانت غلط، المستند بيرجع مكانه زي ما هو.
const mongoose = require('mongoose');
const Invitation = require('../models/Invitation');
const Order = require('../models/Order');

const INV_ARCHIVE = 'removedinvitations';
const ORDER_ARCHIVE = 'removedorders';

/** بينقل مستندات (بفلتر) من كولكشن لأرشيفها — إدخال الأول وبعدين مسح نفس الـ _id بس */
async function moveTo(model, archiveName, filter, meta) {
  const docs = await model.collection.find(filter).toArray();
  if (!docs.length) return 0;
  const archive = mongoose.connection.collection(archiveName);
  // نسخة في الأرشيف (نفس _id) — لو اتنقلت قبل كده (ضغطة متكررة) بنستبدلها
  await archive.bulkWrite(docs.map((d) => ({
    replaceOne: { filter: { _id: d._id }, replacement: { ...d, _removedAt: meta.at, _reason: meta.reason, _by: meta.by }, upsert: true },
  })), { ordered: false });
  // بنمسح بس اللي اتأكدنا إنه في الأرشيف
  const ids = docs.map((d) => d._id);
  const saved = await archive.countDocuments({ _id: { $in: ids } });
  if (saved !== ids.length) throw new Error(`archive mismatch ${saved}/${ids.length}`);
  const r = await model.collection.deleteMany({ _id: { $in: ids } });
  return r.deletedCount || 0;
}

/** اللي هيتشال لو ضغطت (عشان شاشة التأكيد تقول الأرقام بالظبط قبل أي حاجة) */
async function removalPreview(userId) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const [drafts, published, orders] = await Promise.all([
    Invitation.countDocuments({ ownerId: uid, status: 'draft' }),
    Invitation.find({ ownerId: uid, status: { $ne: 'draft' } }).select('shortId groomName brideName templateId').limit(50).lean(),
    Order.find({ userId: uid }).select('packageId currency price status createdAt activatedAt').sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  return {
    drafts,
    published: published.map((i) => ({ shortId: i.shortId, names: [i.groomName, i.brideName].filter(Boolean).join(' و '), templateId: i.templateId })),
    orders: orders.map((o) => ({ id: String(o._id), packageId: o.packageId, currency: o.currency, price: o.price, status: o.status, at: o.activatedAt || o.createdAt })),
  };
}

/**
 * @param {string} userId
 * @param {'cancel'|'remove'} mode
 * @param {string} by مين عمل كده (للسجل)
 */
async function archiveForUser(userId, mode, by) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const meta = { at: new Date(), reason: mode === 'remove' ? 'package-removed' : 'package-cancelled', by: String(by || 'admin') };
  const drafts = await moveTo(Invitation, INV_ARCHIVE, { ownerId: uid, status: 'draft' }, meta);
  let published = 0;
  let orders = 0;
  if (mode === 'remove') {
    published = await moveTo(Invitation, INV_ARCHIVE, { ownerId: uid }, meta);
    orders = await moveTo(Order, ORDER_ARCHIVE, { userId: uid }, meta);
  }
  return { drafts, published, orders };
}

module.exports = { removalPreview, archiveForUser, INV_ARCHIVE, ORDER_ARCHIVE };
