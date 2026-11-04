export const BONUS_PERCENT_MIN = 1;
export const BONUS_PERCENT_MAX = 500;
export const FEATURED_BADGE_LABEL = "Meilleure vente";

const PACKAGE_ID_PATTERN = /^(?:[1-9]\d{0,18}|(?:pkg|dyn|ext)_[\w-]{1,80})$/i;
const PACKAGE_IDENT_PATTERN = /^[\w:.-]{1,160}$/;
const MAX_PRODUCTS = 300;

export function emptyCardDisplay() {
  return {
    featuredProducts: [],
    bonuses: [],
    knownProducts: [],
  };
}

export function cardCategoryKey(value) {
  return cleanLabel(value, 80).toLocaleLowerCase("fr-FR");
}

function cleanLabel(value, maxLength) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function asPackageId(value) {
  const id = String(value ?? "").trim();
  return PACKAGE_ID_PATTERN.test(id) ? id : "";
}

export function asPackageIdent(value) {
  const ident = String(value ?? "").trim();

  if (!ident) {
    return "";
  }

  return PACKAGE_IDENT_PATTERN.test(ident) ? ident : "";
}

function asPercent(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return null;
}

function dedupeProducts(items) {
  const rows = [];
  const seen = new Set();

  for (const item of items ?? []) {
    const packageId = asPackageId(item?.packageId ?? item?.id);

    if (!packageId || seen.has(packageId)) {
      continue;
    }

    seen.add(packageId);
    const currency = String(item?.currency ?? "").toUpperCase();
    rows.push({
      packageId,
      packageIdent: asPackageIdent(item?.packageIdent ?? item?.ident),
      name: cleanLabel(item?.name, 120) || "Produit",
      categoryName: cleanLabel(item?.categoryName, 80),
      price: typeof item?.price === "number" && Number.isFinite(item.price) ? item.price : null,
      currency: /^[A-Z]{3}$/.test(currency) ? currency : "EUR",
    });
  }

  return rows;
}

function resolveTargetId(packageId, packageIdent, products) {
  if (packageId && products.some((product) => product.packageId === packageId)) {
    return packageId;
  }

  if (packageIdent) {
    const match = products.find((product) => product.packageIdent && product.packageIdent === packageIdent);

    if (match) {
      return match.packageId;
    }
  }

  return "";
}

function knownProductFor(packageId, packageIdent, knownProducts) {
  return knownProducts.find((product) => {
    if (packageId && product.packageId === packageId) {
      return true;
    }

    return Boolean(packageIdent && product.packageIdent && product.packageIdent === packageIdent);
  });
}

function readFeaturedEntries(source, knownProducts) {
  if (Array.isArray(source.featuredProducts)) {
    return source.featuredProducts.map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      return {
        packageId: asPackageId(item.packageId ?? item.id),
        packageIdent: asPackageIdent(item.packageIdent ?? item.ident),
        categoryName: cleanLabel(item.categoryName, 80),
      };
    });
  }

  const packageId = asPackageId(source.featuredPackageId ?? "");
  const packageIdent = asPackageIdent(source.featuredPackageIdent ?? "");

  if (!packageId && !packageIdent) {
    return [];
  }

  const known = knownProductFor(packageId, packageIdent, knownProducts);

  return [
    {
      packageId: packageId || known?.packageId || "",
      packageIdent: packageIdent || known?.packageIdent || "",
      categoryName: known?.categoryName ?? "",
    },
  ];
}

function normalizeFeaturedProducts(entries, knownProducts) {
  const featuredProducts = [];
  const seenCategories = new Set();
  const seenIds = new Set();

  for (const entry of entries) {
    if (!entry?.packageId && !entry?.packageIdent) {
      continue;
    }

    const known = knownProductFor(entry.packageId, entry.packageIdent, knownProducts);
    const packageId = entry.packageId || known?.packageId || "";
    const packageIdent = entry.packageIdent || known?.packageIdent || "";
    const categoryName = known?.categoryName || entry.categoryName || "";
    const idKey = packageId || `ident:${packageIdent}`;

    if (seenIds.has(idKey)) {
      continue;
    }

    const key = cardCategoryKey(categoryName);

    if (seenCategories.has(key)) {
      continue;
    }

    seenIds.add(idKey);
    seenCategories.add(key);
    featuredProducts.push({ packageId, packageIdent, categoryName });
  }

  return featuredProducts;
}

export function normalizeCardDisplay(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const knownProducts = dedupeProducts(Array.isArray(source.knownProducts) ? source.knownProducts : []);
  const bonuses = [];
  const seenBonuses = new Set();

  for (const item of Array.isArray(source.bonuses) ? source.bonuses : []) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const packageId = asPackageId(item.packageId ?? item.id);
    const packageIdent = asPackageIdent(item.packageIdent ?? item.ident);
    const rawPercent = asPercent(item.percent);
    const percent = rawPercent === null ? null : Math.abs(rawPercent);

    if ((!packageId && !packageIdent) || percent === null || percent < BONUS_PERCENT_MIN || percent > BONUS_PERCENT_MAX) {
      continue;
    }

    const key = packageId || `ident:${packageIdent}`;

    if (seenBonuses.has(key)) {
      continue;
    }

    seenBonuses.add(key);
    bonuses.push({ packageId, packageIdent, percent });
  }

  return {
    featuredProducts: normalizeFeaturedProducts(readFeaturedEntries(source, knownProducts), knownProducts),
    bonuses,
    knownProducts,
  };
}

export function validateCardDisplayInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Les réglages des cartes sont invalides." };
  }

  if (!Array.isArray(input.knownProducts) || !Array.isArray(input.bonuses)) {
    return { error: "La liste des produits est invalide." };
  }

  if (input.knownProducts.length > MAX_PRODUCTS || input.bonuses.length > MAX_PRODUCTS) {
    return { error: "Trop de produits dans la requête." };
  }

  const knownProducts = [];
  const seen = new Set();

  for (const item of input.knownProducts) {
    if (!item || typeof item !== "object") {
      return { error: "Un produit de la liste est invalide." };
    }

    const packageId = asPackageId(item.packageId);

    if (!packageId) {
      return { error: "Un produit n’a pas d’identifiant Tebex valide." };
    }

    if (seen.has(packageId)) {
      continue;
    }

    if (item.packageIdent && !asPackageIdent(item.packageIdent)) {
      return { error: "Un identifiant Tebex secondaire est invalide." };
    }

    seen.add(packageId);
    knownProducts.push({
      packageId,
      packageIdent: asPackageIdent(item.packageIdent),
      name: cleanLabel(item.name, 120) || "Produit",
      categoryName: cleanLabel(item.categoryName, 80),
    });
  }

  const featuredResult = validateFeaturedProducts(input, knownProducts);

  if (featuredResult.error) {
    return featuredResult;
  }

  const bonuses = [];
  const seenBonuses = new Set();

  for (const item of input.bonuses) {
    if (!item || typeof item !== "object") {
      return { error: "Un bonus est invalide." };
    }

    const packageId = asPackageId(item.packageId);

    if (!packageId || !seen.has(packageId)) {
      return { error: "Un bonus vise un produit inconnu." };
    }

    if (seenBonuses.has(packageId)) {
      return { error: "Un produit ne peut avoir qu’un seul bonus." };
    }

    const percent = asPercent(item.percent);

    if (percent === null || percent < BONUS_PERCENT_MIN || percent > BONUS_PERCENT_MAX) {
      return { error: `Le bonus doit être un entier entre ${BONUS_PERCENT_MIN} et ${BONUS_PERCENT_MAX}.` };
    }

    seenBonuses.add(packageId);
    const product = knownProducts.find((entry) => entry.packageId === packageId);
    bonuses.push({
      packageId,
      packageIdent: product?.packageIdent ?? "",
      percent,
    });
  }

  return {
    value: {
      featuredProducts: featuredResult.featuredProducts,
      bonuses,
      knownProducts,
    },
  };
}

function validateFeaturedProducts(input, knownProducts) {
  if (Array.isArray(input.featuredProducts)) {
    if (input.featuredProducts.length > MAX_PRODUCTS) {
      return { error: "Trop de produits mis en avant." };
    }

    const featuredProducts = [];
    const seenCategories = new Set();
    const seenIds = new Set();

    for (const item of input.featuredProducts) {
      if (!item || typeof item !== "object") {
        return { error: "Un produit mis en avant est invalide." };
      }

      const packageId = asPackageId(item.packageId);

      if (!packageId || !knownProducts.some((product) => product.packageId === packageId)) {
        return { error: "Le produit mis en avant ne fait pas partie de la liste." };
      }

      if (item.packageIdent && !asPackageIdent(item.packageIdent)) {
        return { error: "Un identifiant Tebex secondaire est invalide." };
      }

      if (seenIds.has(packageId)) {
        return { error: "Un produit ne peut être mis en avant qu’une fois." };
      }

      const product = knownProducts.find((entry) => entry.packageId === packageId);
      const categoryName = product?.categoryName ?? "";
      const key = cardCategoryKey(categoryName);

      if (seenCategories.has(key)) {
        return { error: "Une seule meilleure vente est possible par catégorie." };
      }

      seenIds.add(packageId);
      seenCategories.add(key);
      featuredProducts.push({
        packageId,
        packageIdent: product?.packageIdent ?? "",
        categoryName,
      });
    }

    return { featuredProducts };
  }

  const featuredPackageId = input.featuredPackageId ? asPackageId(input.featuredPackageId) : "";

  if (input.featuredPackageId && !featuredPackageId) {
    return { error: "Le produit mis en avant est invalide." };
  }

  if (featuredPackageId && !knownProducts.some((product) => product.packageId === featuredPackageId)) {
    return { error: "Le produit mis en avant ne fait pas partie de la liste." };
  }

  if (!featuredPackageId) {
    return { featuredProducts: [] };
  }

  const product = knownProducts.find((entry) => entry.packageId === featuredPackageId);

  return {
    featuredProducts: [
      {
        packageId: featuredPackageId,
        packageIdent: product?.packageIdent ?? "",
        categoryName: product?.categoryName ?? "",
      },
    ],
  };
}

export function flattenTebexPackages(categories) {
  const rows = [];

  if (!Array.isArray(categories)) {
    return rows;
  }

  for (const category of categories) {
    const categoryName = cleanLabel(category?.name, 80);
    const packages = Array.isArray(category?.packages) ? category.packages : [];

    for (const pack of packages) {
      const priceValue = pack?.base_price ?? pack?.total_price;
      rows.push({
        packageId: pack?.id,
        packageIdent: pack?.ident,
        name: pack?.name,
        categoryName,
        price: typeof priceValue === "number" && Number.isFinite(priceValue) ? priceValue : null,
        currency: pack?.currency,
      });
    }
  }

  return dedupeProducts(rows);
}

export function resolveHighlightTargets(primaryProducts, cardDisplay, fallbackProducts = []) {
  const display = normalizeCardDisplay(cardDisplay);
  const primary = dedupeProducts(primaryProducts);
  const primaryIds = new Set(primary.map((product) => product.packageId));
  const fallback = dedupeProducts(fallbackProducts).filter((product) => !primaryIds.has(product.packageId));
  const bonusById = new Map();

  for (const bonus of display.bonuses) {
    const target =
      resolveTargetId(bonus.packageId, bonus.packageIdent, primary) ||
      resolveTargetId(bonus.packageId, bonus.packageIdent, fallback);

    if (target && !bonusById.has(target)) {
      bonusById.set(target, bonus.percent);
    }
  }

  const featuredIds = new Set();
  const usedCategories = new Set();
  const catalog = [...primary, ...fallback];

  for (const entry of display.featuredProducts) {
    const target =
      resolveTargetId(entry.packageId, entry.packageIdent, primary) ||
      resolveTargetId(entry.packageId, entry.packageIdent, fallback);

    if (!target || featuredIds.has(target)) {
      continue;
    }

    const product = catalog.find((item) => item.packageId === target);
    const categoryName = product?.categoryName || entry.categoryName;
    const key = cardCategoryKey(categoryName);

    if (usedCategories.has(key)) {
      continue;
    }

    usedCategories.add(key);
    featuredIds.add(target);
  }

  return { featuredIds, bonusById };
}

export function resolveCardHighlights(products, cardDisplay) {
  return resolveHighlightTargets(
    (products ?? []).map((product) => ({
      packageId: product?.id ?? product?.packageId,
      packageIdent: product?.ident ?? product?.packageIdent,
      categoryName: product?.categoryName,
      name: product?.name,
    })),
    cardDisplay,
  );
}

export function buildAdminProductRows(livePackages, cardDisplay) {
  const display = normalizeCardDisplay(cardDisplay);
  const live = dedupeProducts(livePackages);
  const liveIds = new Set(live.map((product) => product.packageId));
  const liveIdents = new Set(live.map((product) => product.packageIdent).filter(Boolean));
  const missing = dedupeProducts(display.knownProducts)
    .filter((product) => !liveIds.has(product.packageId))
    .filter((product) => !product.packageIdent || !liveIdents.has(product.packageIdent));
  const highlights = resolveHighlightTargets(live, display, missing);

  return [...live, ...missing].map((product) => ({
    ...product,
    missing: !liveIds.has(product.packageId),
    featured: highlights.featuredIds.has(product.packageId),
    bonusEnabled: highlights.bonusById.has(product.packageId),
    bonusPercent: highlights.bonusById.get(product.packageId) ?? "",
  }));
}

export function formatBonusLabel(percent) {
  const numeric = Number(percent);
  const value = Number.isFinite(numeric) ? Math.abs(numeric) : 0;

  return `+${value} % de bonus`;
}
