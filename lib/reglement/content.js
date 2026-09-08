import { createBlock } from "./constants";

export function createRuleItem(title = "Nouvelle règle") {
  return {
    id: `rule-${crypto.randomUUID().slice(0, 8)}`,
    type: "rule",
    title,
    icon: "document",
    description: "Description de la règle.",
  };
}

export function normalizeSectionContent(section) {
  if (Array.isArray(section?.content) && section.content.length > 0) {
    return section.content.map((item) => ({
      ...item,
      id: item.id ?? `${item.type}-${crypto.randomUUID().slice(0, 8)}`,
    }));
  }

  const items = [];

  for (const rule of section?.rules ?? []) {
    items.push({
      id: rule.id ?? `rule-${crypto.randomUUID().slice(0, 8)}`,
      type: "rule",
      title: rule.title ?? "",
      icon: rule.icon ?? "document",
      description: rule.description ?? "",
    });
  }

  for (const block of section?.blocks ?? []) {
    items.push({
      ...block,
      id: block.id ?? `${block.type}-${crypto.randomUUID().slice(0, 8)}`,
    });
  }

  return items;
}

export function normalizeCategories(categories) {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category) => ({
    ...category,
    sections: (category.sections ?? []).map((section) => ({
      ...section,
      content: normalizeSectionContent(section),
    })),
  }));
}

export function createContentItem(type) {
  if (type === "rule") {
    return createRuleItem();
  }

  return createBlock(type);
}

export const CONTENT_TYPE_OPTIONS = [
  { id: "rule", label: "Règle avec icône" },
  { id: "heading", label: "Titre de section" },
  { id: "text", label: "Paragraphe" },
  { id: "alert", label: "Alerte / Warning" },
  { id: "list", label: "Liste accentuée" },
  { id: "cards", label: "Cartes comparatives" },
  { id: "quote", label: "Citation" },
];

export function getContentTypeLabel(type) {
  return CONTENT_TYPE_OPTIONS.find((item) => item.id === type)?.label ?? type;
}
