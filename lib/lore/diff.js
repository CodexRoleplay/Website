import { createTextChange } from "@/lib/admin/text-diff";
import { getContentTypeLabel } from "@/lib/reglement/content";

function stable(value) {
  return JSON.stringify(value);
}

function blockLabel(block) {
  if (!block) {
    return "Bloc";
  }

  if (block.type === "rule" || block.type === "alert") {
    return block.title?.trim() || getContentTypeLabel(block.type);
  }

  if (block.type === "heading" || block.type === "text" || block.type === "quote") {
    const preview = String(block.text ?? "").trim().replace(/\s+/g, " ").slice(0, 48);
    return preview ? `${getContentTypeLabel(block.type)} « ${preview}${String(block.text).trim().length > 48 ? "…" : ""} »` : getContentTypeLabel(block.type);
  }

  if (block.type === "list") {
    return `Liste (${block.items?.length ?? 0} entrée(s))`;
  }

  if (block.type === "cards") {
    return `Cartes (${block.cards?.length ?? 0})`;
  }

  return getContentTypeLabel(block.type);
}

function blockPlain(block) {
  if (!block) {
    return "";
  }

  switch (block.type) {
    case "rule":
      return [block.title, block.description].filter(Boolean).join("\n");
    case "heading":
    case "text":
    case "quote":
      return String(block.text ?? "");
    case "alert":
      return [block.title, block.text].filter(Boolean).join("\n");
    case "list":
      return (block.items ?? []).map((entry) => [entry.label, entry.text].filter(Boolean).join(" — ")).join("\n");
    case "cards":
      return (block.cards ?? [])
        .map((card) => [card.title, ...(card.items ?? [])].filter(Boolean).join("\n"))
        .join("\n\n");
    default:
      return stable(block);
  }
}

export function auditLoreChanges(before, after) {
  const changes = [];
  const details = [];
  const beforeBlocks = Array.isArray(before?.blocks) ? before.blocks : [];
  const afterBlocks = Array.isArray(after?.blocks) ? after.blocks : [];
  const beforeById = new Map(beforeBlocks.map((block) => [block.id, block]));
  const afterById = new Map(afterBlocks.map((block) => [block.id, block]));

  if ((before?.title ?? "") !== (after?.title ?? "")) {
    changes.push("Titre modifié");
    const detail = createTextChange("Titre", before?.title ?? "", after?.title ?? "");

    if (detail) {
      details.push(detail);
    }
  }

  for (const block of afterBlocks) {
    if (beforeById.has(block.id)) {
      continue;
    }

    const label = blockLabel(block);
    changes.push(`Bloc ajouté : ${label}`);
    const detail = createTextChange(label, "", blockPlain(block));

    if (detail) {
      details.push(detail);
    }
  }

  for (const block of beforeBlocks) {
    if (afterById.has(block.id)) {
      continue;
    }

    const label = blockLabel(block);
    changes.push(`Bloc supprimé : ${label}`);
    const detail = createTextChange(label, blockPlain(block), "");

    if (detail) {
      details.push(detail);
    }
  }

  for (const block of afterBlocks) {
    const previous = beforeById.get(block.id);

    if (!previous || stable(previous) === stable(block)) {
      continue;
    }

    const label = blockLabel(block);
    changes.push(`Bloc modifié : ${label}`);
    const detail = createTextChange(label, blockPlain(previous), blockPlain(block));

    if (detail) {
      details.push(detail);
    }
  }

  const beforeOrder = beforeBlocks.map((block) => block.id).join("|");
  const afterOrder = afterBlocks.map((block) => block.id).join("|");
  const sameMembers =
    [...beforeById.keys()].sort().join("|") === [...afterById.keys()].sort().join("|");

  if (beforeBlocks.length > 0 && beforeOrder !== afterOrder && sameMembers) {
    changes.push("Ordre des blocs modifié");
  }

  return { changes, details };
}

export function buildLoreChangeSummary(changes) {
  if (!changes.length) {
    return "Enregistrement sans modification détectée";
  }

  if (changes.length === 1) {
    return changes[0];
  }

  return `${changes.length} modification(s) : ${changes[0]}`;
}
