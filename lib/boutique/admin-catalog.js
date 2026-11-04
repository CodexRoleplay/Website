import { flattenTebexPackages } from "@/lib/boutique/card-display";
import { TebexApiError, getTebexCategories } from "@/lib/tebex";

const MISSING_TOKEN_MESSAGE =
  "Le catalogue Tebex est indisponible : le token public n’est pas configuré. Tu peux encore modifier les produits déjà enregistrés.";
const CATALOG_ERROR_MESSAGE =
  "Le catalogue Tebex n’a pas pu être chargé. Tu peux encore modifier les produits déjà enregistrés.";

export async function loadAdminBoutiqueCatalog() {
  try {
    const categories = await getTebexCategories();

    return {
      packages: flattenTebexPackages(categories),
      catalogError: "",
    };
  } catch (error) {
    console.error("[admin/boutique] Catalogue Tebex indisponible.", error);

    return {
      packages: [],
      catalogError: error instanceof TebexApiError && error.status === 503 ? MISSING_TOKEN_MESSAGE : CATALOG_ERROR_MESSAGE,
    };
  }
}
