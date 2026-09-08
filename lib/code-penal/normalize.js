import {
  CODE_PENAL_MAX_JURISDICTIONS,
  DEFAULT_EXTRA_JURISDICTIONS,
  LOS_ANGELES_JURISDICTION_ID,
  PENAL_LEVEL_OPTIONS,
  createLosAngelesJurisdiction,
} from "./constants";

const LEVEL_IDS = new Set(PENAL_LEVEL_OPTIONS.map((level) => level.id));

function cleanText(value) {
  return String(value ?? "").trim();
}

function fallbackId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

export function normalizePenalArticle(article, index = 0) {
  const level = cleanText(article?.level || "info").toLowerCase();

  return {
    id: cleanText(article?.id) || fallbackId("article", index),
    article: cleanText(article?.article),
    name: cleanText(article?.name),
    description: cleanText(article?.description),
    fine: cleanText(article?.fine),
    penalty: cleanText(article?.penalty),
    level: LEVEL_IDS.has(level) ? level : "info",
  };
}

export function normalizePenalSection(section, index = 0) {
  return {
    id: cleanText(section?.id) || fallbackId("section", index),
    title: cleanText(section?.title) || "Section sans titre",
    articles: Array.isArray(section?.articles)
      ? section.articles.map((article, articleIndex) => normalizePenalArticle(article, articleIndex))
      : [],
    notes: Array.isArray(section?.notes) ? section.notes.map(cleanText).filter(Boolean) : [],
  };
}

export function normalizePenalSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections.map((section, sectionIndex) => normalizePenalSection(section, sectionIndex));
}

export function looksLikePenalJurisdictions(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.every(
    (item) => item && typeof item === "object" && Array.isArray(item.sections) && !Array.isArray(item.articles),
  );
}

export function normalizePenalJurisdiction(jurisdiction, index = 0, { forceLosAngeles = false } = {}) {
  const source = jurisdiction && typeof jurisdiction === "object" ? jurisdiction : {};
  const locked = forceLosAngeles || source.locked === true;
  const id = forceLosAngeles
    ? LOS_ANGELES_JURISDICTION_ID
    : cleanText(source.id) || fallbackId("juridiction", index);

  return {
    id,
    title: cleanText(source.title) || (locked ? "Los Angeles" : `Juridiction ${index + 1}`),
    summary: cleanText(source.summary),
    locked,
    sections: normalizePenalSections(source.sections),
  };
}

function hasLosAngelesSource(value) {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.some((item) => cleanText(item?.id) === LOS_ANGELES_JURISDICTION_ID);
}

export function normalizePenalJurisdictions(value, fallbackSections = []) {
  if (!looksLikePenalJurisdictions(value)) {
    return [
      createLosAngelesJurisdiction(normalizePenalSections(fallbackSections)),
      ...DEFAULT_EXTRA_JURISDICTIONS.map((item) => normalizePenalJurisdiction(item)),
    ].slice(0, CODE_PENAL_MAX_JURISDICTIONS);
  }

  const seen = new Set();
  const jurisdictions = value.slice(0, CODE_PENAL_MAX_JURISDICTIONS).map((item, index) => {
    const forceLosAngeles = cleanText(item?.id) === LOS_ANGELES_JURISDICTION_ID;
    const jurisdiction = normalizePenalJurisdiction(item, index, { forceLosAngeles });

    if (seen.has(jurisdiction.id)) {
      jurisdiction.id = `${jurisdiction.id}-${index + 1}`;
    }

    seen.add(jurisdiction.id);
    return jurisdiction;
  });

  const losAngelesIndex = jurisdictions.findIndex((item) => item.id === LOS_ANGELES_JURISDICTION_ID);
  const extras = jurisdictions
    .filter((_, index) => index !== losAngelesIndex)
    .map((item, extraIndex) => ({
      ...item,
      locked: false,
      id: item.id === LOS_ANGELES_JURISDICTION_ID ? fallbackId("juridiction", extraIndex) : item.id,
    }));

  if (losAngelesIndex < 0) {
    return [createLosAngelesJurisdiction(normalizePenalSections(fallbackSections)), ...extras].slice(
      0,
      CODE_PENAL_MAX_JURISDICTIONS,
    );
  }

  const losAngeles = {
    ...jurisdictions[losAngelesIndex],
    id: LOS_ANGELES_JURISDICTION_ID,
    locked: true,
  };

  return [losAngeles, ...extras].slice(0, CODE_PENAL_MAX_JURISDICTIONS);
}

export function ensureLosAngelesJurisdiction(jurisdictions, previousJurisdictions = []) {
  const next = normalizePenalJurisdictions(jurisdictions);
  const extras = next.filter((item) => item.id !== LOS_ANGELES_JURISDICTION_ID);

  if (hasLosAngelesSource(jurisdictions)) {
    const losAngeles = next.find((item) => item.id === LOS_ANGELES_JURISDICTION_ID) ?? createLosAngelesJurisdiction();
    return [{ ...losAngeles, id: LOS_ANGELES_JURISDICTION_ID, locked: true }, ...extras].slice(
      0,
      CODE_PENAL_MAX_JURISDICTIONS,
    );
  }

  const previous = normalizePenalJurisdictions(previousJurisdictions);
  const previousLosAngeles =
    previous.find((item) => item.id === LOS_ANGELES_JURISDICTION_ID) ?? createLosAngelesJurisdiction();

  return [{ ...previousLosAngeles, id: LOS_ANGELES_JURISDICTION_ID, locked: true }, ...extras].slice(
    0,
    CODE_PENAL_MAX_JURISDICTIONS,
  );
}

export function getLosAngelesSections(jurisdictions) {
  const list = Array.isArray(jurisdictions) ? jurisdictions : [];
  const losAngeles = list.find((item) => item.id === LOS_ANGELES_JURISDICTION_ID) || list[0];
  return losAngeles?.sections || [];
}

export function flattenPenalSections(jurisdictions) {
  return (Array.isArray(jurisdictions) ? jurisdictions : []).flatMap((item) => item.sections ?? []);
}
