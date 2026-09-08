export const FAQ_DOC_PATH = ["site", "faq"];

function createId(prefix) {
  const random = globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(16).slice(2, 10);
  return `${prefix}-${random}`;
}

export function createFaqItem() {
  return {
    id: createId("question"),
    question: "Nouvelle question",
    answer: "Réponse à compléter.",
  };
}

export function createFaqCategory() {
  return {
    id: createId("categorie"),
    title: "Nouveau titre",
    items: [createFaqItem()],
  };
}
