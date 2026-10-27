export const FALLBACK_SHOP_CATEGORY_LINKS = [
  { label: "Packs Codyx", href: "/boutique?categorie=packs-codyx#catalogue" },
  { label: "Abonnements", href: "/boutique?categorie=abonnements#catalogue" },
  { label: "Cartes cadeaux", href: "/boutique?categorie=cartes-cadeaux#catalogue" },
];

export function normalizeShopSlug(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function shopCategoryHref(name) {
  const slug = normalizeShopSlug(name);

  return slug ? `/boutique?categorie=${slug}#catalogue` : "/boutique#catalogue";
}

export function shopLinksFromCategories(categories) {
  if (!Array.isArray(categories)) {
    return FALLBACK_SHOP_CATEGORY_LINKS;
  }

  const links = [];
  const seen = new Set();

  for (const category of categories) {
    if (!category || !Array.isArray(category.packages)) {
      continue;
    }

    const label = String(category.name ?? "");
    const slug = normalizeShopSlug(label);

    if (!slug || seen.has(slug)) {
      continue;
    }

    seen.add(slug);
    links.push({
      label,
      href: shopCategoryHref(label),
    });
  }

  return links.length > 0 ? links : FALLBACK_SHOP_CATEGORY_LINKS;
}
