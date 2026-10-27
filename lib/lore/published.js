import { getLoreDocument } from "@/lib/lore/admin-persistence";
import { emptyLoreDocument } from "@/lib/lore/content";

export async function getPublishedLore() {
  try {
    const stored = await getLoreDocument();
    return { ...stored, source: stored.updatedAt ? "firestore" : "empty" };
  } catch (error) {
    console.error("[lore] Impossible de charger le lore publié.", error);
    return { ...emptyLoreDocument(), source: "empty" };
  }
}
