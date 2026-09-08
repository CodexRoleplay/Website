export const REGLEMENT_DOC_PATH = ["site", "reglement"];

export const BLOCK_TYPES = [
  { id: "heading", label: "Titre de section", icon: "H" },
  { id: "text", label: "Paragraphe", icon: "¶" },
  { id: "alert", label: "Alerte / Warning", icon: "!" },
  { id: "list", label: "Liste accentuée", icon: "•" },
  { id: "cards", label: "Cartes comparatives", icon: "▣" },
  { id: "quote", label: "Citation", icon: "❝" },
  { id: "rule", label: "Règle avec icône", icon: "◆" },
];

export const ALERT_VARIANTS = [
  { id: "info", label: "Info (bleu)" },
  { id: "warning", label: "Warning (orange)" },
  { id: "danger", label: "Danger (rouge)" },
  { id: "success", label: "Succès (vert)" },
];

export const CARD_VARIANTS = [
  { id: "success", label: "Positif (vert)" },
  { id: "danger", label: "Négatif (rouge)" },
  { id: "info", label: "Neutre (bleu)" },
];

export function createBlock(type) {
  const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;

  switch (type) {
    case "heading":
      return { id, type, text: "01 / NOUVELLE SECTION" };
    case "text":
      return { id, type, text: "Votre texte ici…" };
    case "alert":
      return { id, type, variant: "warning", title: "Attention", text: "Message important." };
    case "list":
      return {
        id,
        type,
        items: [{ label: "Point clé", text: "Description du point." }],
      };
    case "cards":
      return {
        id,
        type,
        cards: [
          { variant: "success", title: "Autorisé", items: ["Exemple"] },
          { variant: "danger", title: "Interdit", items: ["Exemple"] },
        ],
      };
    case "quote":
      return { id, type, text: "Citation ou note importante." };
    case "rule":
      return {
        id,
        type,
        title: "Nouvelle règle",
        icon: "document",
        description: "Description de la règle.",
      };
    default:
      return { id, type: "text", text: "" };
  }
}

export function createSection(title = "Nouvelle section") {
  return {
    id: `section-${crypto.randomUUID().slice(0, 8)}`,
    icon: "document",
    title,
    blocks: [],
    rules: [],
  };
}

export function createCategory(title = "Nouvelle rubrique") {
  return {
    id: `category-${crypto.randomUUID().slice(0, 8)}`,
    title,
    icon: "book",
    summary: "Description courte de la rubrique.",
    sections: [],
  };
}
