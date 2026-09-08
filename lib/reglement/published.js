import { getReglementDocument } from "@/lib/reglement/admin-persistence";
import { getFallbackReglement } from "@/lib/reglement/fallback";

export async function getPublishedReglement() {
  try {
    const stored = await getReglementDocument();

    if (stored.categories.length || stored.updatedAt) {
      return { ...stored, source: "firestore" };
    }
  } catch (error) {
    console.error("[reglement] Impossible de charger le règlement publié.", error);
  }

  return getFallbackReglement();
}
