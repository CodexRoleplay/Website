const SHORT_LIMIT = 180;
const MEDIUM_LIMIT = 2000;
const LONG_LIMIT = 4000;

const IDENTITY_FIELDS = [
  {
    key: "editorName",
    label: "Nom ou raison sociale",
    section: "editor",
    page: "identity",
    required: true,
    hint: "Personne, association ou société qui édite le site.",
  },
  {
    key: "editorForm",
    label: "Forme juridique",
    section: "editor",
    page: "identity",
    hint: "Obligatoire si l'éditeur est une société : SAS, SARL, association loi 1901…",
  },
  {
    key: "shareCapital",
    label: "Capital social",
    section: "editor",
    page: "identity",
    hint: "Obligatoire pour une société. Exemple : 1 000 €.",
  },
  {
    key: "address",
    label: "Adresse",
    section: "editor",
    page: "identity",
    required: true,
    multiline: true,
    hint: "Siège ou domicile de l'éditeur.",
  },
  {
    key: "email",
    label: "E-mail de contact",
    section: "editor",
    page: "identity",
    required: true,
  },
  {
    key: "phone",
    label: "Téléphone",
    section: "editor",
    page: "identity",
    required: true,
  },
  {
    key: "siret",
    label: "SIRET",
    section: "editor",
    page: "identity",
    hint: "Obligatoire pour une société ou un entrepreneur immatriculé.",
  },
  {
    key: "rcs",
    label: "RCS",
    section: "editor",
    page: "identity",
    hint: "Exemple : RCS Paris 123 456 789.",
  },
  {
    key: "vatNumber",
    label: "Numéro de TVA",
    section: "editor",
    page: "identity",
    hint: "Si l'éditeur est assujetti.",
  },
  {
    key: "publicationDirector",
    label: "Directeur de la publication",
    section: "publication",
    page: "identity",
    required: true,
    hint: "Nom et prénom de la personne responsable du contenu.",
  },
  {
    key: "hostName",
    label: "Hébergeur",
    section: "host",
    page: "identity",
    required: true,
  },
  {
    key: "hostAddress",
    label: "Adresse de l'hébergeur",
    section: "host",
    page: "identity",
    required: true,
    multiline: true,
  },
  {
    key: "hostPhone",
    label: "Téléphone de l'hébergeur",
    section: "host",
    page: "identity",
  },
  {
    key: "hostWebsite",
    label: "Site de l'hébergeur",
    section: "host",
    page: "identity",
  },
  {
    key: "privacyEmail",
    label: "E-mail confidentialité",
    section: "privacy",
    page: "identity",
    hint: "Laisser vide pour réutiliser l'e-mail de contact.",
  },
  {
    key: "dpoName",
    label: "Délégué à la protection des données",
    section: "privacy",
    page: "identity",
    hint: "Laisser vide s'il n'y en a pas.",
  },
  {
    key: "dpoEmail",
    label: "E-mail du délégué",
    section: "privacy",
    page: "identity",
  },
];

const COPY_FIELDS = [
  { key: "legalEyebrow", label: "Surtitre des deux pages", page: "mentions" },
  { key: "mentionsTitle", label: "Titre de la page", page: "mentions" },
  { key: "mentionsIntro", label: "Introduction", page: "mentions", multiline: true },
  { key: "mentionsEditorTitle", label: "Titre — éditeur", page: "mentions" },
  { key: "mentionsEditorEmpty", label: "Texte si l'identité n'est pas encore remplie", page: "mentions", multiline: true },
  { key: "mentionsDirectorTitle", label: "Titre — directeur de la publication", page: "mentions" },
  { key: "mentionsDirectorEmpty", label: "Texte si le directeur n'est pas encore nommé", page: "mentions", multiline: true },
  { key: "mentionsHostTitle", label: "Titre — hébergement", page: "mentions" },
  { key: "mentionsShopTitle", label: "Titre — boutique", page: "mentions" },
  { key: "mentionsShopBody", label: "Texte boutique et paiement", page: "mentions", multiline: true },
  { key: "mentionsIpTitle", label: "Titre — propriété intellectuelle", page: "mentions" },
  { key: "mentionsIpBody", label: "Texte propriété intellectuelle", page: "mentions", multiline: true },
  { key: "mentionsContactTitle", label: "Titre — contact", page: "mentions" },
  { key: "mentionsContactEmpty", label: "Texte si l'e-mail n'est pas encore renseigné", page: "mentions", multiline: true },
  { key: "mentionsNote", label: "Complément en bas de page", page: "mentions", multiline: true },
  { key: "mentionsSwitch", label: "Lien vers la confidentialité", page: "mentions" },
  { key: "privacyTitle", label: "Titre de la page", page: "privacy" },
  { key: "privacyIntro", label: "Introduction", page: "privacy", multiline: true },
  { key: "privacyControllerTitle", label: "Titre — responsable", page: "privacy" },
  { key: "privacyControllerEmpty", label: "Texte si le contact n'est pas encore renseigné", page: "privacy", multiline: true },
  { key: "privacyNoDpo", label: "Texte s'il n'y a pas de délégué", page: "privacy", multiline: true },
  { key: "privacyDataTitle", label: "Titre — données utilisées", page: "privacy" },
  { key: "privacyDataBody", label: "Données utilisées", page: "privacy", multiline: true },
  { key: "privacyWhyTitle", label: "Titre — finalités", page: "privacy" },
  { key: "privacyWhyBody", label: "Pourquoi ces données", page: "privacy", multiline: true },
  { key: "privacyRecipientsTitle", label: "Titre — destinataires", page: "privacy" },
  { key: "privacyRecipientsBody", label: "Qui les reçoit", page: "privacy", multiline: true },
  { key: "privacyRetentionTitle", label: "Titre — durées", page: "privacy" },
  { key: "retentionShopLabel", label: "Libellé durée des achats", page: "privacy" },
  { key: "retentionShop", label: "Durée des données d'achat", page: "privacy", multiline: true },
  { key: "retentionBrowserLabel", label: "Libellé durée du navigateur", page: "privacy" },
  { key: "retentionBrowser", label: "Durée des données du navigateur", page: "privacy", multiline: true },
  { key: "retentionAdminLabel", label: "Libellé durée des comptes admin", page: "privacy" },
  { key: "retentionAdmin", label: "Durée des comptes admin", page: "privacy", multiline: true },
  { key: "privacyStorageTitle", label: "Titre — stockage", page: "privacy" },
  { key: "privacyStorageBody", label: "Stockage dans le navigateur", page: "privacy", multiline: true },
  { key: "privacyRightsTitle", label: "Titre — droits", page: "privacy" },
  { key: "privacyRightsBody", label: "Texte des droits", page: "privacy", multiline: true },
  { key: "privacyRightsContact", label: "Phrase de contact", page: "privacy", multiline: true },
  { key: "privacyRightsCnil", label: "Phrase CNIL", page: "privacy", multiline: true },
  { key: "privacyNote", label: "Complément en bas de page", page: "privacy", multiline: true },
  { key: "privacySwitch", label: "Lien vers les mentions légales", page: "privacy" },
];

export const LEGAL_FIELDS = [...IDENTITY_FIELDS, ...COPY_FIELDS];

const LIMITS = {
  address: MEDIUM_LIMIT,
  hostAddress: MEDIUM_LIMIT,
  mentionsIntro: LONG_LIMIT,
  mentionsEditorEmpty: LONG_LIMIT,
  mentionsDirectorEmpty: LONG_LIMIT,
  mentionsShopBody: LONG_LIMIT,
  mentionsIpBody: LONG_LIMIT,
  mentionsContactEmpty: LONG_LIMIT,
  mentionsNote: LONG_LIMIT,
  privacyIntro: LONG_LIMIT,
  privacyControllerEmpty: LONG_LIMIT,
  privacyNoDpo: LONG_LIMIT,
  privacyDataBody: LONG_LIMIT,
  privacyWhyBody: LONG_LIMIT,
  privacyRecipientsBody: LONG_LIMIT,
  retentionShop: MEDIUM_LIMIT,
  retentionBrowser: MEDIUM_LIMIT,
  retentionAdmin: MEDIUM_LIMIT,
  privacyStorageBody: LONG_LIMIT,
  privacyRightsBody: LONG_LIMIT,
  privacyRightsContact: LONG_LIMIT,
  privacyRightsCnil: LONG_LIMIT,
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
    legalEyebrow: "Informations légales",
    mentionsTitle: "Mentions légales",
    mentionsIntro: "Informations exigées pour l'édition du site Codex RP et pour la boutique.",
    mentionsEditorTitle: "Éditeur du site",
    mentionsEditorEmpty: "L'identité de l'éditeur sera publiée dès qu'elle aura été renseignée.",
    mentionsDirectorTitle: "Directeur de la publication",
    mentionsDirectorEmpty: "Le directeur de la publication sera nommé dès que cette information aura été renseignée.",
    mentionsHostTitle: "Hébergement",
    mentionsShopTitle: "Boutique et paiement",
    mentionsShopBody: [
      "Le paiement de la boutique est opéré par Tebex Limited. Tebex assure l'encaissement, la facturation, la délivrance des achats et les demandes de remboursement. Les conditions de Tebex s'appliquent à cette étape.",
      "",
      "[Conditions Tebex](https://checkout.tebex.io/terms) · [Confidentialité Tebex](https://checkout.tebex.io/privacy) · [Impressum Tebex](https://checkout.tebex.io/impressum)",
    ].join("\n"),
    mentionsIpTitle: "Propriété intellectuelle",
    mentionsIpBody: [
      "Les textes, visuels et éléments propres à Codex RP sont protégés. Toute réutilisation demande une autorisation préalable de l'éditeur, en dehors des courtes citations accompagnées de leur source.",
      "",
      "Codex RP est un serveur roleplay indépendant. Il n'est ni approuvé, ni sponsorisé, ni affilié à Rockstar Games ou Take-Two Interactive.",
    ].join("\n"),
    mentionsContactTitle: "Contact",
    mentionsContactEmpty: "L'adresse de contact sera publiée avec l'identité de l'éditeur.",
    mentionsNote: "",
    mentionsSwitch: "Lire la politique de confidentialité",
    privacyTitle: "Politique de confidentialité",
    privacyIntro: "Informations sur les données utilisées par le site Codex RP, la boutique et le panel admin.",
    privacyControllerTitle: "Responsable du traitement",
    privacyControllerEmpty: "L'adresse pour exercer tes droits sera publiée avec l'identité de l'éditeur.",
    privacyNoDpo: "Aucun délégué à la protection des données n'est désigné.",
    privacyDataTitle: "Données utilisées",
    privacyDataBody: [
      "- Le pseudo FiveM et l'identifiant Discord, lorsque tu relies ces comptes pour acheter.",
      "- L'identifiant du panier Tebex, conservé dans le navigateur pour retrouver ta commande.",
      "- L'e-mail et l'identifiant des comptes autorisés à ouvrir le panel admin.",
      "- Les messages techniques nécessaires à la sécurité du site et du paiement.",
      "",
      "Le site ne demande pas de créer un compte joueur et n'utilise pas de mesure d'audience.",
    ].join("\n"),
    privacyWhyTitle: "Pourquoi ces données",
    privacyWhyBody: [
      "- Relier un achat au bon compte FiveM et Discord, pour exécuter la commande.",
      "- Afficher le panier et rouvrir la fenêtre de paiement Tebex.",
      "- Limiter le panel d'administration aux personnes autorisées.",
      "- Répondre à une demande envoyée à l'adresse de contact.",
    ].join("\n"),
    privacyRecipientsTitle: "Qui les reçoit",
    privacyRecipientsBody: [
      "- Tebex Limited, pour le paiement, la facturation et la délivrance des achats.",
      "- Discord, lorsque tu choisis de relier ton compte à la boutique.",
      "- Google Firebase, pour les comptes autorisés à administrer le site.",
      "- {host}, pour l'affichage des pages.",
      "",
      "Tebex, l'hébergeur et Firebase peuvent traiter certaines données hors de l'Union européenne. Le paiement reste soumis à la politique de confidentialité de Tebex.",
    ].join("\n"),
    privacyRetentionTitle: "Durées de conservation",
    retentionShopLabel: "Achats",
    retentionShop:
      "Les données liées à un achat sont conservées par Tebex pendant la durée nécessaire au paiement, à la délivrance et à ses obligations comptables.",
    retentionBrowserLabel: "Navigateur",
    retentionBrowser:
      "L'identifiant de panier, le compte Discord relié et la position de défilement restent dans le navigateur jusqu'à la déconnexion ou la suppression des données du site.",
    retentionAdminLabel: "Administration",
    retentionAdmin:
      "Les comptes administrateurs sont conservés tant que l'accès au panel est actif, puis supprimés lorsqu'ils ne sont plus nécessaires.",
    privacyStorageTitle: "Stockage dans le navigateur",
    privacyStorageBody: [
      "Le site enregistre dans ton navigateur l'identifiant de panier, le compte Discord relié et la position de lecture de certaines pages. Ces données servent uniquement à faire fonctionner la boutique et la navigation. Aucun cookie publicitaire n'est déposé par Codex RP.",
      "",
      "La fenêtre de paiement Tebex peut déposer ses propres cookies. Ils sont décrits par Tebex.",
    ].join("\n"),
    privacyRightsTitle: "Tes droits",
    privacyRightsBody:
      "Tu peux demander l'accès à tes données, leur rectification, leur effacement, la limitation de leur utilisation, ou t'opposer à un traitement fondé sur l'intérêt légitime. Tu peux aussi récupérer les données que tu as fournies, lorsque ce droit s'applique.",
    privacyRightsContact: "Écris à {email} en précisant ta demande. Une réponse est apportée dans un délai d'un mois.",
    privacyRightsCnil: "Tu peux aussi saisir la CNIL : [www.cnil.fr](https://www.cnil.fr).",
    privacyNote: "",
    privacySwitch: "Lire les mentions légales",
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

export function applyLegalTokens(value, document) {
  const legal = normalizeLegalDocument(document);
  const host = legal.hostName || "l'hébergeur du site";
  const email = privacyContactEmail(legal);

  return String(value ?? "")
    .replaceAll("{host}", host)
    .replaceAll("{editor}", legal.editorName)
    .replaceAll("{email}", email ? `[${email}](mailto:${email})` : "");
}

export function parseLegalCopy(value) {
  const blocks = [];
  let list = [];

  function flushList() {
    if (!list.length) {
      return;
    }

    blocks.push({ type: "list", items: list });
    list = [];
  }

  for (const rawLine of String(value ?? "").split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      list.push(line.slice(2).trim());
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}
