import { FALLBACK_SHOP_CATEGORY_LINKS, shopLinksFromCategories } from "@/lib/boutique/shop-links";
import { getTebexNavigationCategories } from "@/lib/tebex";

const NAVIGATION_TIMEOUT_MS = 4000;

export async function getShopNavigationLinks() {
  let timer;

  try {
    const pending = getTebexNavigationCategories().catch(() => null);
    const categories = await Promise.race([
      pending,
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), NAVIGATION_TIMEOUT_MS);
      }),
    ]);

    if (!categories) {
      throw new Error("Catégories Tebex indisponibles.");
    }

    return shopLinksFromCategories(categories);
  } catch {
    console.error("[boutique] Navigation : catégories Tebex indisponibles.");
    return FALLBACK_SHOP_CATEGORY_LINKS;
  } finally {
    clearTimeout(timer);
  }
}
