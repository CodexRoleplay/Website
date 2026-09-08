function cleanText(value) {
  return String(value ?? "").trim();
}

function fallbackId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

export function normalizeFaqItem(item, index = 0) {
  return {
    id: cleanText(item?.id) || fallbackId("question", index),
    question: cleanText(item?.question) || "Question sans titre",
    answer: cleanText(item?.answer),
  };
}

export function normalizeFaqCategories(categories) {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category, categoryIndex) => ({
    id: cleanText(category?.id) || fallbackId("categorie", categoryIndex),
    title: cleanText(category?.title) || "Catégorie sans titre",
    items: Array.isArray(category?.items)
      ? category.items.map((item, itemIndex) => normalizeFaqItem(item, itemIndex))
      : [],
  }));
}
