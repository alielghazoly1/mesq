// "تنشئ 1 دعوة مميزة" / "تنشئ 4 دعوات مميزة" — الفعل قبل الرقم عشان العميل
// يفهم إنه بيعمل دعوة (وبيبعتها لأي عدد ناس)، مش إنها لشخص واحد.
// الجمع بالعربي: من 3 لـ 10 "دعوات"، غير كده "دعوة".
export function createLine(t, count) {
  const n = Number(count) || 0;
  const key = n === 1 ? 'createOne' : n >= 3 && n <= 10 ? 'createFew' : 'createMany';
  return t(`packages.${key}`, { count: n });
}
