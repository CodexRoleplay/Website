import { getCodePenalDocument } from "@/lib/code-penal/admin-persistence";
import { getFallbackCodePenal } from "@/lib/code-penal/fallback";

export async function getPublishedCodePenal() {
  try {
    const stored = await getCodePenalDocument();

    if (stored.jurisdictions.length || stored.sections.length || stored.updatedAt) {
      return { ...stored, source: "firestore" };
    }
  } catch (error) {
    console.error("[code-penal] Impossible de charger le code pénal publié.", error);
  }

  return getFallbackCodePenal();
}
