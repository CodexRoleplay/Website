import { prepareLoreBlocks } from "@/lib/lore/content";

export const LEGAL_PAGE_KEYS = ["mentions", "sales", "privacy"];

export const LEGAL_PAGE_META = {
  mentions: { title: "Mentions légales", path: "/mentions-legales" },
  sales: { title: "Conditions de vente", path: "/conditions-de-vente" },
  privacy: { title: "Politique de confidentialité", path: "/confidentialite" },
};

export function emptyLegalPage(key) {
  return {
    title: LEGAL_PAGE_META[key]?.title ?? "Page légale",
    blocks: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
  };
}

export function emptyLegalPages() {
  return {
    mentions: emptyLegalPage("mentions"),
    sales: emptyLegalPage("sales"),
    privacy: emptyLegalPage("privacy"),
  };
}

function cleanTitle(value, fallback) {
  const title = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return title || fallback;
}

export function prepareLegalPage(key, input) {
  const fallback = LEGAL_PAGE_META[key]?.title ?? "Page légale";

  return {
    title: cleanTitle(input?.title, fallback),
    blocks: prepareLoreBlocks(input?.blocks),
  };
}

export function normalizeStoredLegalPage(key, raw) {
  const prepared = prepareLegalPage(key, raw && typeof raw === "object" ? raw : {});

  return {
    ...prepared,
    updatedAt: raw?.updatedAt ?? null,
    updatedBy: raw?.updatedBy ?? null,
    updatedByEmail: raw?.updatedByEmail ?? null,
  };
}
