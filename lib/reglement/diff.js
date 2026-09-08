import { createTextChange } from "@/lib/admin/text-diff";
import { normalizeSectionContent } from "@/lib/reglement/content";
import { normalizeCategories } from "@/lib/reglement/fallback";
import { resolveIconName } from "@/lib/reglement/icons";

export function prepareReglementPayload(categories) {
  return normalizeCategories(categories).map((category) => ({
    ...category,
    sections: (category.sections ?? []).map((section) => ({
      ...section,
      content: normalizeSectionContent(section),
      rules: [],
      blocks: [],
    })),
  }));
}

function trim(value) {
  return String(value ?? "").trim();
}

function canonicalContentItem(item) {
  if (!item?.type) {
    return null;
  }

  const base = {
    id: item.id,
    type: item.type,
  };

  switch (item.type) {
    case "rule":
      return {
        ...base,
        title: trim(item.title),
        icon: resolveIconName(item.icon),
        description: trim(item.description),
      };
    case "heading":
    case "text":
    case "quote":
      return {
        ...base,
        text: trim(item.text),
      };
    case "alert":
      return {
        ...base,
        variant: trim(item.variant) || "warning",
        title: trim(item.title),
        text: trim(item.text),
      };
    case "list":
      return {
        ...base,
        items: (item.items ?? []).map((entry) => ({
          label: trim(entry.label),
          text: trim(entry.text),
        })),
      };
    case "cards":
      return {
        ...base,
        cards: (item.cards ?? []).map((card) => ({
          variant: trim(card.variant) || "info",
          title: trim(card.title),
          items: (card.items ?? []).map((entry) => trim(entry)),
        })),
      };
    default:
      return base;
  }
}

function canonicalSection(section) {
  return {
    id: section.id,
    title: trim(section.title),
    icon: resolveIconName(section.icon),
    content: normalizeSectionContent(section).map((item) => canonicalContentItem(item)),
  };
}

function canonicalCategory(category) {
  return {
    id: category.id,
    title: trim(category.title),
    icon: resolveIconName(category.icon),
    summary: trim(category.summary),
    sections: (category.sections ?? []).map((section) => canonicalSection(section)),
  };
}

function canonicalReglement(categories) {
  return prepareReglementPayload(categories).map((category) => canonicalCategory(category));
}

function stableSerialize(value) {
  return JSON.stringify(value);
}

function sectionsEqual(beforeSection, afterSection) {
  return stableSerialize(canonicalSection(beforeSection)) === stableSerialize(canonicalSection(afterSection));
}

function categoriesEqual(beforeCategory, afterCategory) {
  return stableSerialize(canonicalCategory(beforeCategory)) === stableSerialize(canonicalCategory(afterCategory));
}

function contentItemsEqual(beforeItem, afterItem) {
  return stableSerialize(canonicalContentItem(beforeItem)) === stableSerialize(canonicalContentItem(afterItem));
}

function getContentItemLabel(item) {
  if (!item) {
    return "Élément";
  }

  if (item.type === "rule") {
    return item.title?.trim() || "Règle sans titre";
  }

  if (item.type === "heading" || item.type === "text" || item.type === "quote") {
    const preview = item.text?.trim().slice(0, 48);
    return preview ? `${item.type} « ${preview}${item.text.length > 48 ? "…" : ""} »` : item.type;
  }

  if (item.type === "alert") {
    return item.title?.trim() || "Alerte";
  }

  if (item.type === "list") {
    return `Liste (${item.items?.length ?? 0} entrée(s))`;
  }

  if (item.type === "cards") {
    return `Cartes (${item.cards?.length ?? 0})`;
  }

  return item.type;
}

function sameIdOrder(items) {
  return items.map((item) => item.id).join("|");
}

function emptyBucket() {
  return { changes: [], details: [] };
}

function mergeBuckets(target, extra) {
  target.changes.push(...extra.changes);
  target.details.push(...extra.details);
  return target;
}

function pushChange(bucket, message, detail) {
  if (message) {
    bucket.changes.push(message);
  }

  if (detail) {
    bucket.details.push(detail);
  }
}

function contentItemToPlainText(item) {
  const canonical = canonicalContentItem(item);

  if (!canonical) {
    return "";
  }

  switch (canonical.type) {
    case "rule":
      return [canonical.title, canonical.description].filter(Boolean).join("\n");
    case "heading":
    case "text":
    case "quote":
      return canonical.text ?? "";
    case "alert":
      return [canonical.title, canonical.text].filter(Boolean).join("\n");
    case "list":
      return (canonical.items ?? [])
        .map((entry) => [entry.label, entry.text].filter(Boolean).join(" : "))
        .filter(Boolean)
        .join("\n");
    case "cards":
      return (canonical.cards ?? [])
        .map((card) => [card.title, ...(card.items ?? []).map((entry) => `- ${entry}`)].filter(Boolean).join("\n"))
        .filter(Boolean)
        .join("\n\n");
    default:
      return "";
  }
}

function formatSectionText(section) {
  const lines = [`Sous-rubrique : ${section.title || "Sans titre"}`];

  for (const item of section.content ?? []) {
    const text = contentItemToPlainText(item);
    if (text) {
      lines.push("", text);
    }
  }

  return lines.join("\n");
}

function formatCategoryText(category) {
  const lines = [
    `Rubrique : ${category.title || "Sans titre"}`,
    category.summary ? `Résumé : ${category.summary}` : "",
  ].filter(Boolean);

  for (const section of category.sections ?? []) {
    lines.push("", formatSectionText(section));
  }

  return lines.join("\n");
}

function diffContentItems(beforeItems, afterItems, sectionTitle, categoryTitle) {
  const bucket = emptyBucket();
  const beforeMap = new Map(beforeItems.map((item) => [item.id, item]));
  const afterMap = new Map(afterItems.map((item) => [item.id, item]));
  const context = `« ${sectionTitle} » (${categoryTitle})`;

  for (const item of beforeItems) {
    if (!afterMap.has(item.id)) {
      const label = getContentItemLabel(item);
      pushChange(
        bucket,
        `Supprimé dans ${context} : ${label}`,
        createTextChange(`${context} — ${label}`, contentItemToPlainText(item), ""),
      );
    }
  }

  for (const item of afterItems) {
    if (!beforeMap.has(item.id)) {
      const label = getContentItemLabel(item);
      pushChange(
        bucket,
        `Ajouté dans ${context} : ${label}`,
        createTextChange(`${context} — ${label}`, "", contentItemToPlainText(item)),
      );
    }
  }

  if (sameIdOrder(beforeItems) !== sameIdOrder(afterItems) && beforeItems.length === afterItems.length) {
    const sharedIds = beforeItems.every((item) => afterMap.has(item.id));

    if (sharedIds) {
      pushChange(bucket, `Ordre modifié dans ${context}`);
    }
  }

  for (const afterItem of afterItems) {
    const beforeItem = beforeMap.get(afterItem.id);

    if (!beforeItem || contentItemsEqual(beforeItem, afterItem)) {
      continue;
    }

    const label = getContentItemLabel(afterItem);
    pushChange(
      bucket,
      `Modifié dans ${context} : ${label}`,
      createTextChange(`${context} — ${label}`, contentItemToPlainText(beforeItem), contentItemToPlainText(afterItem)),
    );
  }

  return bucket;
}

function diffSections(beforeCategory, afterCategory) {
  const bucket = emptyBucket();
  const beforeSections = beforeCategory.sections ?? [];
  const afterSections = afterCategory.sections ?? [];
  const beforeMap = new Map(beforeSections.map((section) => [section.id, section]));
  const afterMap = new Map(afterSections.map((section) => [section.id, section]));
  const categoryTitle = afterCategory.title || "Sans titre";

  for (const section of beforeSections) {
    if (!afterMap.has(section.id)) {
      pushChange(
        bucket,
        `Sous-rubrique supprimée dans « ${categoryTitle} » : « ${section.title} »`,
        createTextChange(
          `« ${categoryTitle} » — sous-rubrique « ${section.title} »`,
          formatSectionText(section),
          "",
        ),
      );
    }
  }

  for (const section of afterSections) {
    if (!beforeMap.has(section.id)) {
      pushChange(
        bucket,
        `Sous-rubrique ajoutée dans « ${categoryTitle} » : « ${section.title} »`,
        createTextChange(
          `« ${categoryTitle} » — sous-rubrique « ${section.title} »`,
          "",
          formatSectionText(section),
        ),
      );
    }
  }

  if (sameIdOrder(beforeSections) !== sameIdOrder(afterSections) && beforeSections.length === afterSections.length) {
    const sharedIds = beforeSections.every((section) => afterMap.has(section.id));

    if (sharedIds) {
      pushChange(bucket, `Ordre des sous-rubriques modifié dans « ${categoryTitle} »`);
    }
  }

  for (const afterSection of afterSections) {
    const beforeSection = beforeMap.get(afterSection.id);

    if (!beforeSection) {
      continue;
    }

    if (sectionsEqual(beforeSection, afterSection)) {
      continue;
    }

    if (trim(beforeSection.title) !== trim(afterSection.title)) {
      pushChange(
        bucket,
        `Sous-rubrique renommée dans « ${categoryTitle} » : « ${beforeSection.title} » → « ${afterSection.title} »`,
        createTextChange(
          `« ${categoryTitle} » — titre de sous-rubrique`,
          beforeSection.title,
          afterSection.title,
        ),
      );
    }

    if (resolveIconName(beforeSection.icon) !== resolveIconName(afterSection.icon)) {
      pushChange(bucket, `Sous-rubrique « ${afterSection.title} » (${categoryTitle}) : icône modifiée`);
    }

    const beforeContent = normalizeSectionContent(beforeSection);
    const afterContent = normalizeSectionContent(afterSection);

    mergeBuckets(
      bucket,
      diffContentItems(beforeContent, afterContent, afterSection.title || "Sans titre", categoryTitle),
    );
  }

  return bucket;
}

export function countReglementStats(categories) {
  let sectionCount = 0;
  let contentItemCount = 0;

  for (const category of prepareReglementPayload(categories ?? [])) {
    sectionCount += category.sections?.length ?? 0;

    for (const section of category.sections ?? []) {
      contentItemCount += section.content?.length ?? 0;
    }
  }

  return {
    categoryCount: categories?.length ?? 0,
    sectionCount,
    contentItemCount,
  };
}

function collectReglementDiff(beforeCategories, afterCategories) {
  const before = canonicalReglement(beforeCategories);
  const after = canonicalReglement(afterCategories);
  const bucket = emptyBucket();
  const beforeMap = new Map(before.map((category) => [category.id, category]));
  const afterMap = new Map(after.map((category) => [category.id, category]));

  for (const category of before) {
    if (!afterMap.has(category.id)) {
      pushChange(
        bucket,
        `Rubrique supprimée : « ${category.title} »`,
        createTextChange(`Rubrique supprimée : « ${category.title} »`, formatCategoryText(category), ""),
      );
    }
  }

  for (const category of after) {
    if (!beforeMap.has(category.id)) {
      pushChange(
        bucket,
        `Rubrique ajoutée : « ${category.title} »`,
        createTextChange(`Rubrique ajoutée : « ${category.title} »`, "", formatCategoryText(category)),
      );
    }
  }

  if (sameIdOrder(before) !== sameIdOrder(after) && before.length === after.length) {
    const sharedIds = before.every((category) => afterMap.has(category.id));

    if (sharedIds) {
      pushChange(bucket, "Ordre des rubriques modifié");
    }
  }

  for (const afterCategory of after) {
    const beforeCategory = beforeMap.get(afterCategory.id);

    if (!beforeCategory) {
      continue;
    }

    if (categoriesEqual(beforeCategory, afterCategory)) {
      continue;
    }

    const categoryTitle = afterCategory.title || "Sans titre";

    if (trim(beforeCategory.title) !== trim(afterCategory.title)) {
      pushChange(
        bucket,
        `Rubrique renommée : « ${beforeCategory.title} » → « ${afterCategory.title} »`,
        createTextChange("Rubrique — titre", beforeCategory.title, afterCategory.title),
      );
    }

    if (resolveIconName(beforeCategory.icon) !== resolveIconName(afterCategory.icon)) {
      pushChange(bucket, `Rubrique « ${categoryTitle} » : icône modifiée`);
    }

    if (trim(beforeCategory.summary) !== trim(afterCategory.summary)) {
      pushChange(
        bucket,
        `Rubrique « ${categoryTitle} » : résumé modifié`,
        createTextChange(`Rubrique « ${categoryTitle} » — résumé`, beforeCategory.summary, afterCategory.summary),
      );
    }

    mergeBuckets(bucket, diffSections(beforeCategory, afterCategory));
  }

  return bucket;
}

export function summarizeReglementChanges(beforeCategories, afterCategories) {
  return collectReglementDiff(beforeCategories, afterCategories).changes;
}

export function collectReglementChangeDetails(beforeCategories, afterCategories) {
  return collectReglementDiff(beforeCategories, afterCategories).details;
}

export function auditReglementChanges(beforeCategories, afterCategories) {
  return collectReglementDiff(beforeCategories, afterCategories);
}

export function buildReglementChangeSummary(changes) {
  if (!changes.length) {
    return "Enregistrement sans modification détectée";
  }

  if (changes.length === 1) {
    return changes[0];
  }

  return `${changes.length} modification(s) : ${changes[0]}`;
}
