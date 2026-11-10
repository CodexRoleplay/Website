const SHORT_LIMIT = 180;
const MEDIUM_LIMIT = 400;
const LONG_LIMIT = 2000;

export const LEGAL_FIELDS = [
  {
    key: "editorName",
    label: "Nom ou raison sociale",
    section: "editor",
    required: true,
    hint: "Personne, association ou société qui édite le site.",
  },
  {
    key: "editorForm",
    label: "Forme juridique",
    section: "editor",
    hint: "Obligatoire si l'éditeur est une société : SAS, SARL, association loi 1901…",
  },
  {
    key: "shareCapital",
    label: "Capital social",
    section: "editor",
    hint: "Obligatoire pour une société. Exemple : 1 000 €.",
  },
  {
    key: "address",
    label: "Adresse",
    section: "editor",
    required: true,
    multiline: true,
    hint: "Siège ou domicile de l'éditeur.",
  },
  {
    key: "email",
    label: "E-mail de contact",
    section: "editor",
    required: true,
  },
  {
    key: "phone",
    label: "Téléphone",
    section: "editor",
    required: true,
  },
  {
    key: "siret",
    label: "SIRET",
    section: "editor",
    hint: "Obligatoire pour une société ou un entrepreneur immatriculé.",
  },
  {
    key: "rcs",
    label: "RCS",
    section: "editor",
    hint: "Exemple : RCS Paris 123 456 789.",
  },
  {
    key: "vatNumber",
    label: "Numéro de TVA",
    section: "editor",
    hint: "Si l'éditeur est assujetti.",
  },
  {
    key: "publicationDirector",
    label: "Directeur de la publication",
    section: "publication",
    required: true,
    hint: "Nom et prénom de la personne responsable du contenu.",
  },
  {
    key: "hostName",
    label: "Hébergeur",
    section: "host",
    required: true,
  },
  {
    key: "hostAddress",
    label: "Adresse de l'hébergeur",
    section: "host",
    required: true,
    multiline: true,
  },
  {
    key: "hostPhone",
    label: "Téléphone de l'hébergeur",
    section: "host",
  },
  {
    key: "hostWebsite",
    label: "Site de l'hébergeur",
    section: "host",
  },
  {
    key: "privacyEmail",
    label: "E-mail confidentialité",
    section: "privacy",
    hint: "Laisser vide pour réutiliser l'e-mail de contact.",
  },
  {
    key: "dpoName",
    label: "Délégué à la protection des données",
    section: "privacy",
    hint: "Laisser vide s'il n'y en a pas.",
  },
  {
    key: "dpoEmail",
    label: "E-mail du délégué",
    section: "privacy",
  },
  {
    key: "retentionShop",
    label: "Durée des données d'achat",
    section: "privacy",
    multiline: true,
  },
  {
    key: "retentionBrowser",
    label: "Durée des données du navigateur",
    section: "privacy",
    multiline: true,
  },
  {
    key: "retentionAdmin",
    label: "Durée des comptes admin",
    section: "privacy",
    multiline: true,
  },
  {
    key: "mentionsNote",
    label: "Complément des mentions légales",
    section: "notes",
    multiline: true,
    hint: "Paragraphe facultatif ajouté en bas des mentions légales.",
  },
  {
    key: "privacyNote",
    label: "Complément de la confidentialité",
    section: "notes",
    multiline: true,
    hint: "Paragraphe facultatif ajouté en bas de la politique de confidentialité.",
  },
];

const LIMITS = {
  address: MEDIUM_LIMIT,
  hostAddress: MEDIUM_LIMIT,
  retentionShop: MEDIUM_LIMIT,
  retentionBrowser: MEDIUM_LIMIT,
  retentionAdmin: MEDIUM_LIMIT,
  mentionsNote: LONG_LIMIT,
  privacyNote: LONG_LIMIT,
};

export function defaultLegalDocument() {
  return {
    editorName: "",
    editorForm: "",
    shareCapital: "",
    address: "",
    email: "",
    phone: "",
    siret: "",
    rcs: "",
    vatNumber: "",
    publicationDirector: "",
    hostName: "Vercel Inc.",
    hostAddress: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
    hostPhone: "",
    hostWebsite: "https://vercel.com",
    privacyEmail: "",
    dpoName: "",
    dpoEmail: "",
    retentionShop:
      "Les données liées à un achat sont conservées par Tebex pendant la durée nécessaire au paiement, à la délivrance et à ses obligations comptables.",
    retentionBrowser:
      "L'identifiant de panier, le compte Discord relié et la position de défilement restent dans le navigateur jusqu'à la déconnexion ou la suppression des données du site.",
    retentionAdmin:
      "Les comptes administrateurs sont conservés tant que l'accès au panel est actif, puis supprimés lorsqu'ils ne sont plus nécessaires.",
    mentionsNote: "",
    privacyNote: "",
  };
}

function cleanText(value, limit, multiline) {
  const text = String(value ?? "").replace(/\r\n/g, "\n");
  const normalized = multiline ? text.replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n") : text.replace(/\s+/g, " ");
  return normalized.trim().slice(0, limit);
}

export function normalizeLegalDocument(input) {
  const defaults = defaultLegalDocument();
  const source = input && typeof input === "object" ? input : {};
  const next = {};

  for (const field of LEGAL_FIELDS) {
    const limit = LIMITS[field.key] ?? SHORT_LIMIT;
    const fallback = defaults[field.key] ?? "";
    const raw = source[field.key] === undefined || source[field.key] === null ? fallback : source[field.key];
    next[field.key] = cleanText(raw, limit, Boolean(field.multiline));
  }

  return next;
}

export function missingLegalFields(document) {
  const legal = normalizeLegalDocument(document);
  return LEGAL_FIELDS.filter((field) => field.required && !legal[field.key]).map((field) => field.label);
}

export function privacyContactEmail(document) {
  const legal = normalizeLegalDocument(document);
  return legal.privacyEmail || legal.email;
}
