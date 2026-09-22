import { getCodePenalDocument } from "@/lib/code-penal/admin-persistence";

function emptyCodePenal() {
  return {
    jurisdictions: [],
    sections: [],
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "empty",
  };
}

export async function getPublishedCodePenal() {
  try {
    const stored = await getCodePenalDocument();
    return { ...stored, source: "firestore" };
  } catch (error) {
    console.error("[code-penal] Impossible de charger le code pénal publié.", error);
    return emptyCodePenal();
  }
}
