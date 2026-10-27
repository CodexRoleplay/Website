import { resolveIconName } from "@/lib/reglement/icons";
import { DEFAULT_LORE_TITLE } from "./constants";

const KNOWN_TYPES = new Set(["heading", "text", "alert", "list", "cards", "quote", "rule"]);

function trimEnds(value) {
  return String(value ?? "").trim();
}

function blockId(block, type) {
  if (block?.id) {
    return String(block.id);
  }

  return `${type}-${crypto.randomUUID().slice(0, 8)}`;
}

export function prepareLoreBlock(block) {
  if (!block || typeof block !== "object") {
    return null;
  }

  const type = String(block.type ?? "text");
  const id = blockId(block, type);

  if (!KNOWN_TYPES.has(type)) {
    return { ...block, id, type };
  }

  switch (type) {
    case "rule":
      return {
        id,
        type,
        title: trimEnds(block.title),
        icon: resolveIconName(block.icon),
        description: trimEnds(block.description),
      };
    case "heading":
    case "text":
    case "quote":
      return {
        id,
        type,
        text: trimEnds(block.text),
      };
    case "alert":
      return {
        id,
        type,
        variant: trimEnds(block.variant) || "warning",
        title: trimEnds(block.title),
        text: trimEnds(block.text),
      };
    case "list":
      return {
        id,
        type,
        items: (Array.isArray(block.items) ? block.items : []).map((entry) => ({
          label: trimEnds(entry?.label),
          text: trimEnds(entry?.text),
        })),
      };
    case "cards":
      return {
        id,
        type,
        cards: (Array.isArray(block.cards) ? block.cards : []).map((card) => ({
          variant: trimEnds(card?.variant) || "info",
          title: trimEnds(card?.title),
          items: (Array.isArray(card?.items) ? card.items : []).map((entry) => trimEnds(entry)),
        })),
      };
    default:
      return { id, type };
  }
}

export function prepareLoreBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.map((block) => prepareLoreBlock(block)).filter(Boolean);
}

export function prepareLoreTitle(title) {
  const value = trimEnds(title).slice(0, 180);
  return value || DEFAULT_LORE_TITLE;
}

export function prepareLoreDocument({ title, blocks }) {
  return {
    title: prepareLoreTitle(title),
    blocks: prepareLoreBlocks(blocks),
  };
}

export function emptyLoreDocument() {
  return {
    title: DEFAULT_LORE_TITLE,
    blocks: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
  };
}
