import { normalizeLegalDocument } from "@/lib/legal/content";
import { getLegalDocument } from "@/lib/legal/admin-persistence";

export async function getPublishedLegal() {
  try {
    const stored = await getLegalDocument();
    return { ...stored, source: "firestore" };
  } catch (error) {
    console.error("[legal] Impossible de charger les pages légales.", error);
    return {
      ...normalizeLegalDocument(),
      updatedAt: null,
      updatedBy: null,
      updatedByEmail: null,
      source: "default",
    };
  }
}
