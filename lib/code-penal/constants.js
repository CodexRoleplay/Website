export const CODE_PENAL_DOC_PATH = ["site", "codePenal"];
export const CODE_PENAL_DOC_PATH_REST = CODE_PENAL_DOC_PATH.join("/");
export const CODE_PENAL_LOGS_COLLECTION = "code_penal_logs";
export const CODE_PENAL_MAX_LOGS = 40;
export const CODE_PENAL_MAX_JURISDICTIONS = 12;
export const LOS_ANGELES_JURISDICTION_ID = "los-angeles";

export const DEFAULT_EXTRA_JURISDICTIONS = [
  {
    id: "territoire-2",
    title: "Juridiction 2",
    summary: "Second corpus pénal, à nommer. Numérotation indépendante de Los Angeles.",
    locked: false,
    sections: [],
  },
  {
    id: "territoire-3",
    title: "Juridiction 3",
    summary: "Troisième corpus pénal, à nommer. Numérotation indépendante de Los Angeles.",
    locked: false,
    sections: [],
  },
];

export const PENAL_LEVEL_OPTIONS = [
  { id: "contravention", label: "Contravention" },
  { id: "delit", label: "Délit" },
  { id: "crime", label: "Crime" },
  { id: "aggravante", label: "Aggravante" },
  { id: "info", label: "Information" },
];

function createId(prefix) {
  const random =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(16).slice(2, 10);
  return `${prefix}-${random}`;
}

export function createPenalArticle() {
  return {
    id: createId("article"),
    article: "000-0",
    name: "Nouvelle infraction",
    description: "Description de l'infraction.",
    fine: "-",
    penalty: "-",
    level: "delit",
  };
}

export function createPenalSection() {
  return {
    id: createId("section"),
    title: "NOUVELLE SECTION",
    articles: [createPenalArticle()],
    notes: [],
  };
}

export function createPenalJurisdiction({
  title = "Nouvelle juridiction",
  summary = "",
  locked = false,
  sections = [],
} = {}) {
  return {
    id: locked ? LOS_ANGELES_JURISDICTION_ID : createId("juridiction"),
    title,
    summary,
    locked,
    sections,
  };
}

export function createLosAngelesJurisdiction(sections = []) {
  return createPenalJurisdiction({
    title: "Los Angeles",
    summary: "Code pénal de la juridiction de Los Angeles.",
    locked: true,
    sections,
  });
}
