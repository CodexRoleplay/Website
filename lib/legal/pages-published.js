import { emptyLegalPages } from "@/lib/legal/pages";
import { getLegalPages } from "@/lib/legal/pages-persistence";

export async function getPublishedLegalPages() {
  try {
    const pages = await getLegalPages();
    return { ...pages, source: "firestore" };
  } catch (error) {
    console.error("[legal] Impossible de charger les pages en blocs.", error);
    return { ...emptyLegalPages(), source: "default" };
  }
}
