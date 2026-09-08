import { getFaqDocument } from "@/lib/faq/admin-persistence";
import { getFallbackFaq } from "@/lib/faq/fallback";

export async function getPublishedFaq() {
  try {
    const stored = await getFaqDocument();

    if (stored.categories.length || stored.updatedAt) {
      return { ...stored, source: "firestore" };
    }
  } catch (error) {
    console.error("[faq] Impossible de charger la FAQ publiée.", error);
  }

  return getFallbackFaq();
}
