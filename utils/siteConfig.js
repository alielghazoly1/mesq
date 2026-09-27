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

module.exports = { getSiteConfig, getHiddenTemplateIds, setHiddenTemplateIds };
