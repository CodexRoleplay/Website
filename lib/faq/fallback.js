import { faqCategories } from "@/data/faq";
import { normalizeFaqCategories } from "@/lib/faq/normalize";

export function getFallbackFaq() {
  return {
    categories: normalizeFaqCategories(faqCategories),
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "static",
  };
}

export { normalizeFaqCategories };
