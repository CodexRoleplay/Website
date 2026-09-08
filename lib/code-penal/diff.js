import { createTextChange } from "@/lib/admin/text-diff";
import {
  ensureLosAngelesJurisdiction,
  flattenPenalSections,
  looksLikePenalJurisdictions,
  normalizePenalJurisdictions,
  normalizePenalSections,
} from "@/lib/code-penal/normalize";

const MAX_PREVIEW_LENGTH = 48;

function serialize(value) {
  return JSON.stringify(value);
}

function sameIdOrder(items) {
  return items.map((item) => item.id).join("|");
}

function articleLabel(article) {
  const code = article?.article ? `Article ${article.article}` : "Article";
  const name = article?.name ? ` - ${article.name}` : "";
  return `${code}${name}`;
}

function textPreview(value) {
  const text = String(value ?? "").trim();
  return text.length > MAX_PREVIEW_LENGTH ? `${text.slice(0, MAX_PREVIEW_LENGTH)}...` : text;
}

function asJurisdictions(value) {
  if (looksLikePenalJurisdictions(value)) {
    return normalizePenalJurisdictions(value);
  }

  return normalizePenalJurisdictions(null, Array.isArray(value) ? value : []);
}

export function prepareCodePenalPayload(jurisdictions, previousJurisdictions = []) {
  return ensureLosAngelesJurisdiction(jurisdictions, previousJurisdictions);
}

export function countCodePenalStats(jurisdictions) {
  const normalized = asJurisdictions(jurisdictions);
  const sections = flattenPenalSections(normalized);

  return {
    jurisdictionCount: normalized.length,
    sectionCount: sections.length,
    articleCount: sections.reduce((total, section) => total + section.articles.length, 0),
  };
}

function emptyBucket() {
  return { changes: [], details: [] };
}

function mergeBuckets(target, extra) {
  target.changes.push(...extra.changes);
  target.details.push(...extra.details);
  return target;
}

function prefixMessage(scope, message) {
  if (!scope || !message) {
    return message;
  }

  return `[${scope}] ${message}`;
}

function prefixTitle(scope, title) {
  if (!scope || !title) {
    return title;
  }

  return `${scope} — ${title}`;
}

function pushChange(bucket, message, detail, scope = "") {
  if (message) {
    bucket.changes.push(prefixMessage(scope, message));
  }

  if (detail) {
    bucket.details.push({
      ...detail,
      title: prefixTitle(scope, detail.title),
    });
  }
}

function formatArticle(article) {
  return [
    article.article ? `Article ${article.article}` : "Article",
    article.name || "",
    article.description || "",
    article.fine ? `Amende : ${article.fine}` : "",
    article.penalty ? `Peine : ${article.penalty}` : "",
    article.level ? `Niveau : ${article.level}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatSection(section) {
  const lines = [`Section : ${section.title || "Sans titre"}`];

  for (const article of section.articles ?? []) {
    lines.push("", formatArticle(article));
  }

  if ((section.notes ?? []).length) {
    lines.push("", "Notes :", ...(section.notes ?? []));
  }

  return lines.join("\n");
}

function formatJurisdiction(jurisdiction) {
  const lines = [
    `Juridiction : ${jurisdiction.title || "Sans titre"}`,
    jurisdiction.summary ? `Résumé : ${jurisdiction.summary}` : "",
  ].filter(Boolean);

  for (const section of jurisdiction.sections ?? []) {
    lines.push("", formatSection(section));
  }

  return lines.join("\n");
}

function diffArticles(beforeSection, afterSection, scope) {
  const bucket = emptyBucket();
  const beforeArticles = beforeSection.articles ?? [];
  const afterArticles = afterSection.articles ?? [];
  const beforeMap = new Map(beforeArticles.map((article) => [article.id, article]));
  const afterMap = new Map(afterArticles.map((article) => [article.id, article]));
  const sectionTitle = afterSection.title || beforeSection.title || "Section";

  for (const article of beforeArticles) {
    if (!afterMap.has(article.id)) {
      pushChange(
        bucket,
        `Article supprimé dans "${sectionTitle}" : ${articleLabel(article)}`,
        createTextChange(`${sectionTitle} — ${articleLabel(article)}`, formatArticle(article), ""),
        scope,
      );
    }
  }

  for (const article of afterArticles) {
    if (!beforeMap.has(article.id)) {
      pushChange(
        bucket,
        `Article ajouté dans "${sectionTitle}" : ${articleLabel(article)}`,
        createTextChange(`${sectionTitle} — ${articleLabel(article)}`, "", formatArticle(article)),
        scope,
      );
    }
  }

  if (sameIdOrder(beforeArticles) !== sameIdOrder(afterArticles) && beforeArticles.length === afterArticles.length) {
    const sharedIds = beforeArticles.every((article) => afterMap.has(article.id));

    if (sharedIds) {
      pushChange(bucket, `Ordre des articles modifié dans "${sectionTitle}"`, null, scope);
    }
  }

  for (const afterArticle of afterArticles) {
    const beforeArticle = beforeMap.get(afterArticle.id);

    if (!beforeArticle || serialize(beforeArticle) === serialize(afterArticle)) {
      continue;
    }

    const fields = [
      ["article", "numéro"],
      ["name", "nom"],
      ["description", "description"],
      ["fine", "amende"],
      ["penalty", "peine"],
      ["level", "niveau"],
    ];
    const changedFields = fields
      .filter(([field]) => String(beforeArticle[field] ?? "") !== String(afterArticle[field] ?? ""))
      .map(([, label]) => label);

    pushChange(
      bucket,
      `${articleLabel(afterArticle)} modifié (${changedFields.join(", ") || "contenu"})`,
      null,
      scope,
    );

    for (const [field, label] of fields) {
      pushChange(
        bucket,
        null,
        createTextChange(
          `${articleLabel(afterArticle)} — ${label}`,
          beforeArticle[field],
          afterArticle[field],
        ),
        scope,
      );
    }
  }

  if (serialize(beforeSection.notes ?? []) !== serialize(afterSection.notes ?? [])) {
    const beforeNotes = (beforeSection.notes ?? []).join("\n");
    const afterNotes = (afterSection.notes ?? []).join("\n");
    pushChange(
      bucket,
      `Notes modifiées dans "${sectionTitle}" : ${textPreview(afterNotes)}`,
      createTextChange(`Notes — ${sectionTitle}`, beforeNotes, afterNotes),
      scope,
    );
  }

  return bucket;
}

function diffSections(beforeSections, afterSections, scope = "") {
  const before = normalizePenalSections(beforeSections);
  const after = normalizePenalSections(afterSections);
  const bucket = emptyBucket();
  const beforeMap = new Map(before.map((section) => [section.id, section]));
  const afterMap = new Map(after.map((section) => [section.id, section]));

  for (const section of before) {
    if (!afterMap.has(section.id)) {
      pushChange(
        bucket,
        `Section supprimée : "${section.title}"`,
        createTextChange(`Section supprimée : "${section.title}"`, formatSection(section), ""),
        scope,
      );
    }
  }

  for (const section of after) {
    if (!beforeMap.has(section.id)) {
      pushChange(
        bucket,
        `Section ajoutée : "${section.title}"`,
        createTextChange(`Section ajoutée : "${section.title}"`, "", formatSection(section)),
        scope,
      );
    }
  }

  if (sameIdOrder(before) !== sameIdOrder(after) && before.length === after.length) {
    const sharedIds = before.every((section) => afterMap.has(section.id));

    if (sharedIds) {
      pushChange(bucket, "Ordre des sections modifié", null, scope);
    }
  }

  for (const afterSection of after) {
    const beforeSection = beforeMap.get(afterSection.id);

    if (!beforeSection || serialize(beforeSection) === serialize(afterSection)) {
      continue;
    }

    if (beforeSection.title !== afterSection.title) {
      pushChange(
        bucket,
        `Section renommée : "${beforeSection.title}" -> "${afterSection.title}"`,
        createTextChange("Section — titre", beforeSection.title, afterSection.title),
        scope,
      );
    }

    mergeBuckets(bucket, diffArticles(beforeSection, afterSection, scope));
  }

  return bucket;
}

function collectCodePenalDiff(beforeValue, afterValue) {
  const before = asJurisdictions(beforeValue);
  const after = asJurisdictions(afterValue);
  const bucket = emptyBucket();
  const beforeMap = new Map(before.map((jurisdiction) => [jurisdiction.id, jurisdiction]));
  const afterMap = new Map(after.map((jurisdiction) => [jurisdiction.id, jurisdiction]));

  for (const jurisdiction of before) {
    if (!afterMap.has(jurisdiction.id)) {
      pushChange(
        bucket,
        `Juridiction supprimée : "${jurisdiction.title}"`,
        createTextChange(`Juridiction supprimée : "${jurisdiction.title}"`, formatJurisdiction(jurisdiction), ""),
      );
    }
  }

  for (const jurisdiction of after) {
    if (!beforeMap.has(jurisdiction.id)) {
      pushChange(
        bucket,
        `Juridiction ajoutée : "${jurisdiction.title}"`,
        createTextChange(`Juridiction ajoutée : "${jurisdiction.title}"`, "", formatJurisdiction(jurisdiction)),
      );
    }
  }

  if (sameIdOrder(before) !== sameIdOrder(after) && before.length === after.length) {
    const sharedIds = before.every((jurisdiction) => afterMap.has(jurisdiction.id));

    if (sharedIds) {
      pushChange(bucket, "Ordre des juridictions modifié");
    }
  }

  for (const afterJurisdiction of after) {
    const beforeJurisdiction = beforeMap.get(afterJurisdiction.id);

    if (!beforeJurisdiction || serialize(beforeJurisdiction) === serialize(afterJurisdiction)) {
      continue;
    }

    const scope = afterJurisdiction.title || beforeJurisdiction.title || "Juridiction";

    if (beforeJurisdiction.title !== afterJurisdiction.title) {
      pushChange(
        bucket,
        `Juridiction renommée : "${beforeJurisdiction.title}" -> "${afterJurisdiction.title}"`,
        createTextChange("Juridiction — titre", beforeJurisdiction.title, afterJurisdiction.title),
      );
    }

    if (beforeJurisdiction.summary !== afterJurisdiction.summary) {
      pushChange(
        bucket,
        `Résumé modifié pour "${scope}" : ${textPreview(afterJurisdiction.summary)}`,
        createTextChange("Juridiction — résumé", beforeJurisdiction.summary, afterJurisdiction.summary),
        scope,
      );
    }

    mergeBuckets(bucket, diffSections(beforeJurisdiction.sections, afterJurisdiction.sections, scope));
  }

  return bucket;
}

export function summarizeCodePenalChanges(beforeValue, afterValue) {
  return collectCodePenalDiff(beforeValue, afterValue).changes;
}

export function collectCodePenalChangeDetails(beforeValue, afterValue) {
  return collectCodePenalDiff(beforeValue, afterValue).details;
}

export function auditCodePenalChanges(beforeValue, afterValue) {
  return collectCodePenalDiff(beforeValue, afterValue);
}

export function buildCodePenalChangeSummary(changes) {
  if (!changes.length) {
    return "Enregistrement sans modification détectée";
  }

  if (changes.length === 1) {
    return changes[0];
  }

  return `${changes.length} modification(s) : ${changes[0]}`;
}
