import { ruleCategories as fallbackCategories } from "@/data/reglement";
import { normalizeCategories } from "./content";

export function getFallbackReglement() {
  return {
    categories: normalizeCategories(fallbackCategories),
    updatedAt: null,
    source: "static",
  };
}

export { normalizeCategories };
