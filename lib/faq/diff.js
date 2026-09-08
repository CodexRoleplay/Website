import { normalizeFaqCategories } from "@/lib/faq/normalize";
import { createTextChange } from "@/lib/admin/text-diff";

function serialize(value) {
  return JSON.stringify(value);
}

function idOrder(items) {
  return items.map((item) => item.id).join("|");
}

function formatFaqItem(item) {
  return [`Question : ${item.question}`, `Réponse : ${item.answer}`].join("\n");
}

function formatFaqCategory(category) {
  const lines = [`Catégorie : ${category.title}`];

  for (const item of category.items ?? []) {
    lines.push("", formatFaqItem(item));
  }

  return lines.join("\n");
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

export function prepareFaqPayload(categories) {
  return normalizeFaqCategories(categories);
}

export function countFaqStats(categories) {
  const normalized = normalizeFaqCategories(categories);

  return {
    categoryCount: normalized.length,
    questionCount: normalized.reduce((total, category) => total + category.items.length, 0),
  };
}

function diffItems(beforeCategory, afterCategory) {
  const bucket = emptyBucket();
  const beforeItems = beforeCategory.items ?? [];
  const afterItems = afterCategory.items ?? [];
  const beforeMap = new Map(beforeItems.map((item) => [item.id, item]));
  const afterMap = new Map(afterItems.map((item) => [item.id, item]));

  for (const item of beforeItems) {
    if (!afterMap.has(item.id)) {
      pushChange(
        bucket,
        `Question supprimée dans « ${beforeCategory.title} » : « ${item.question} »`,
        createTextChange(`« ${beforeCategory.title} » — « ${item.question} »`, formatFaqItem(item), ""),
      );
    }
  }

  for (const item of afterItems) {
    if (!beforeMap.has(item.id)) {
      pushChange(
        bucket,
        `Question ajoutée dans « ${afterCategory.title} » : « ${item.question} »`,
        createTextChange(`« ${afterCategory.title} » — « ${item.question} »`, "", formatFaqItem(item)),
      );
    }
  }

  if (idOrder(beforeItems) !== idOrder(afterItems) && beforeItems.length === afterItems.length) {
    const sharedIds = beforeItems.every((item) => afterMap.has(item.id));

    if (sharedIds) {
      pushChange(bucket, `Ordre des questions modifié dans « ${afterCategory.title} »`);
    }
  }

  for (const item of afterItems) {
    const previous = beforeMap.get(item.id);

    if (!previous || serialize(previous) === serialize(item)) {
      continue;
    }

    const fields = [];
    if (previous.question !== item.question) {
      fields.push("question");
      pushChange(
        bucket,
        null,
        createTextChange(`« ${item.question} » — intitulé`, previous.question, item.question),
      );
    }
    if (previous.answer !== item.answer) {
      fields.push("réponse");
      pushChange(
        bucket,
        null,
        createTextChange(`« ${item.question} » — réponse`, previous.answer, item.answer),
      );
    }
    pushChange(bucket, `« ${item.question} » modifiée (${fields.join(", ") || "contenu"})`);
  }

  return bucket;
}

function collectFaqDiff(beforeCategories, afterCategories) {
  const before = normalizeFaqCategories(beforeCategories);
  const after = normalizeFaqCategories(afterCategories);
  const bucket = emptyBucket();
  const beforeMap = new Map(before.map((category) => [category.id, category]));
  const afterMap = new Map(after.map((category) => [category.id, category]));

  for (const category of before) {
    if (!afterMap.has(category.id)) {
      pushChange(
        bucket,
        `Catégorie supprimée : « ${category.title} »`,
        createTextChange(`Catégorie supprimée : « ${category.title} »`, formatFaqCategory(category), ""),
      );
    }
  }

  for (const category of after) {
    if (!beforeMap.has(category.id)) {
      pushChange(
        bucket,
        `Catégorie ajoutée : « ${category.title} »`,
        createTextChange(`Catégorie ajoutée : « ${category.title} »`, "", formatFaqCategory(category)),
      );
    }
  }

  if (idOrder(before) !== idOrder(after) && before.length === after.length) {
    const sharedIds = before.every((category) => afterMap.has(category.id));
    if (sharedIds) {
      pushChange(bucket, "Ordre des catégories modifié");
    }
  }

  for (const category of after) {
    const previous = beforeMap.get(category.id);

    if (!previous || serialize(previous) === serialize(category)) {
      continue;
    }

    if (previous.title !== category.title) {
      pushChange(
        bucket,
        `Catégorie renommée : « ${previous.title} » → « ${category.title} »`,
        createTextChange("Catégorie — titre", previous.title, category.title),
      );
    }

    mergeBuckets(bucket, diffItems(previous, category));
  }

  return bucket;
}

export function summarizeFaqChanges(beforeCategories, afterCategories) {
  return collectFaqDiff(beforeCategories, afterCategories).changes;
}

export function collectFaqChangeDetails(beforeCategories, afterCategories) {
  return collectFaqDiff(beforeCategories, afterCategories).details;
}

export function auditFaqChanges(beforeCategories, afterCategories) {
  return collectFaqDiff(beforeCategories, afterCategories);
}

export function buildFaqChangeSummary(changes) {
  if (!changes.length) return "Enregistrement sans modification détectée";
  if (changes.length === 1) return changes[0];
  return `${changes.length} modification(s) : ${changes[0]}`;
}
