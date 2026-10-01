// utils/siteConfig.js
// قراءة/كتابة إعدادات الموقع العامة (حاليًا: القوالب المخفية).
const SiteConfig = require('../models/SiteConfig');
const { TEMPLATES } = require('../templates/registry');

const KEY = 'default';

async function getSiteConfig() {
  let doc = await SiteConfig.findOne({ key: KEY });
  if (!doc) doc = await SiteConfig.create({ key: KEY });
  return doc;
}

/** معرّفات القوالب المخفية (مصفوفة نضيفة، بس اللي لسه موجود في السجل) */
async function getHiddenTemplateIds() {
  const doc = await getSiteConfig();
  const valid = new Set(TEMPLATES.map((t) => t.id));
  return (doc.hiddenTemplates || []).filter((id) => valid.has(id));
}

/**
 * بيحدّد القوالب المخفية — بنقبل بس معرّفات قوالب حقيقية موجودة في السجل،
 * عشان مايتخزّنش أي كلام. القالب الافتراضي مينفعش يتخفي (لازم يفضل واحد
 * على الأقل ظاهر).
 * @param {string[]} ids
 */
async function setHiddenTemplateIds(ids) {
  const all = TEMPLATES.map((t) => t.id);
  const validSet = new Set(all);
  const wanted = Array.isArray(ids) ? [...new Set(ids.filter((id) => validSet.has(id)))] : [];
  // نمنع إخفاء كل القوالب — لازم يفضل واحد على الأقل ظاهر
  const visibleCount = all.length - wanted.length;
  if (visibleCount < 1) {
    throw Object.assign(new Error('لازم يفضل قالب واحد على الأقل ظاهر للعملاء.'), { status: 400 });
  }
  const doc = await SiteConfig.findOneAndUpdate(
    { key: KEY },
    { hiddenTemplates: wanted, updatedAt: new Date() },
    { new: true, upsert: true }
  );
  return doc.hiddenTemplates || [];
}

/**
 * ترتيب القوالب وشارة "جديد" — زي ما المالك ظبطهم، أو الافتراضي من السجل
 * لو لسه مظبطش (القوالب اللي عليها isNew بتيجي الأول وعليها "جديد").
 * @returns {Promise<{ order: string[], newIds: string[] }>}
 */
/** الترتيب الافتراضي من السجل (من غير قاعدة بيانات): الجديد الأول وعليه "جديد" */
function defaultTemplateLayout() {
  const all = TEMPLATES.map((t) => t.id);
  const fresh = TEMPLATES.filter((t) => t.isNew).map((t) => t.id);
  return { order: [...fresh, ...all.filter((id) => !fresh.includes(id))], newIds: fresh };
}

async function getTemplateLayout() {
  const doc = await getSiteConfig();
  const all = TEMPLATES.map((t) => t.id);
  const valid = new Set(all);
  if (!doc.templatesConfigured) return defaultTemplateLayout();
  const saved = (doc.templateOrder || []).filter((id) => valid.has(id));
  const order = [...new Set(saved), ...all.filter((id) => !saved.includes(id))];
  const newIds = (doc.newTemplates || []).filter((id) => valid.has(id));
  return { order, newIds };
}

/**
 * بيحفظ ترتيب القوالب وشارة "جديد" (معرّفات حقيقية بس — أي حاجة تانية بتتشال).
 * @param {{ order?: string[], newIds?: string[] }} input
 */
async function setTemplateLayout({ order, newIds }) {
  const valid = new Set(TEMPLATES.map((t) => t.id));
  const clean = (arr) => (Array.isArray(arr) ? [...new Set(arr.filter((id) => valid.has(id)))] : []);
  const doc = await SiteConfig.findOneAndUpdate(
    { key: KEY },
    {
      templateOrder: clean(order),
      newTemplates: clean(newIds),
      templatesConfigured: true,
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );
  return { order: doc.templateOrder, newIds: doc.newTemplates };
}

/** بيرتّب أي مصفوفة قوالب حسب الترتيب المحفوظ */
function sortByOrder(list, order) {
  const pos = new Map(order.map((id, i) => [id, i]));
  return [...list].sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : 1e6) - (pos.has(b.id) ? pos.get(b.id) : 1e6));
}

module.exports = {
  getSiteConfig, getHiddenTemplateIds, setHiddenTemplateIds,
  getTemplateLayout, setTemplateLayout, sortByOrder, defaultTemplateLayout,
};
