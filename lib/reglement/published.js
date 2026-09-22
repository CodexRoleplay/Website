import { getReglementDocument } from "@/lib/reglement/admin-persistence";

function emptyReglement() {
  return {
    categories: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "empty",
  };
}

export async function getPublishedReglement() {
  try {
    const stored = await getReglementDocument();
    return { ...stored, source: "firestore" };
  } catch (error) {
    console.error("[reglement] Impossible de charger le règlement publié.", error);
    return emptyReglement();
  }
}
