import { getFaqDocument } from "@/lib/faq/admin-persistence";

function emptyFaq() {
  return {
    categories: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "empty",
  };
}

export async function getPublishedFaq() {
  try {
    const stored = await getFaqDocument();
    return { ...stored, source: "firestore" };
  } catch (error) {
    console.error("[faq] Impossible de charger la FAQ publiée.", error);
    return emptyFaq();
  }
}
