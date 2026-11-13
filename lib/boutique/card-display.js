export const BONUS_PERCENT_MIN = 1;
export const BONUS_PERCENT_MAX = 500;
export const FEATURED_BADGE_LABEL = "Meilleure vente";
export const BANNER_TEXT_MAX = 80;
export const BADGE_TEXT_MAX = 80;
export const PRICE_NOTE_MAX = 140;
export const PERK_TEXT_MAX = 160;
export const MAX_PERKS = 40;

const PACKAGE_ID_PATTERN = /^(?:[1-9]\d{0,18}|(?:pkg|dyn|ext)_[\w-]{1,80})$/i;
const PACKAGE_IDENT_PATTERN = /^[\w:.-]{1,160}$/;
const MAX_PRODUCTS = 300;
const GRADE_KEYS = ["pacific", "penthouse", "belair"];
const DEFAULT_GRADE_ORDER = ["belair", "penthouse", "pacific"];
const PERK_KINDS = new Set(["check", "cross", "text"]);

export function emptySubscriptionPerks() {
  return [];
}

export function emptySubscriptionGradeOrder() {
  return [...DEFAULT_GRADE_ORDER];
}

function emptyPerkCell() {
  return { kind: "text", text: "" };
}

export function emptyCardDisplay() {
  return {
    featuredProducts: [],
    bonuses: [],
    priceNotes: [],
    subscriptionPerks: emptySubscriptionPerks(),
    subscriptionGradeOrder: emptySubscriptionGradeOrder(),
    knownProducts: [],
  };
}

export function cardCategoryKey(value) {
  return cleanLabel(value, 80).toLocaleLowerCase("fr-FR");
}

function cleanLabel(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
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

function validPercent(value) {
  const percent = asPercent(value);

  if (percent === null) {
    return null;
  }

  const absolute = Math.abs(percent);
  if (absolute < BONUS_PERCENT_MIN || absolute > BONUS_PERCENT_MAX) {
    return null;
  }

  return absolute;
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

function bannerTextFromEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return "";
  }

  if (Object.prototype.hasOwnProperty.call(entry, "bannerText")) {
    return cleanLabel(entry.bannerText, BANNER_TEXT_MAX);
  }

  return FEATURED_BADGE_LABEL;
}

function readFeaturedEntries(source) {
  if (Array.isArray(source.featuredProducts)) {
    return source.featuredProducts.map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      return {
        packageId: asPackageId(item.packageId ?? item.id),
        packageIdent: asPackageIdent(item.packageIdent ?? item.ident),
        categoryName: cleanLabel(item.categoryName, 80),
        bannerText: bannerTextFromEntry(item),
      };
    });
  }

  const packageId = asPackageId(source.featuredPackageId ?? "");
  const packageIdent = asPackageIdent(source.featuredPackageIdent ?? "");

  if (!packageId && !packageIdent) {
    return [];
  }

  return [
    {
      packageId,
      packageIdent,
      categoryName: "",
      bannerText: FEATURED_BADGE_LABEL,
    },
  ];
}

function normalizeFeaturedProducts(entries, knownProducts) {
  const featuredProducts = [];
  const seenIds = new Set();

  for (const entry of entries) {
    if (!entry?.packageId && !entry?.packageIdent) {
      continue;
    }

    const bannerText = cleanLabel(entry.bannerText, BANNER_TEXT_MAX);
    if (!bannerText) {
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

    seenIds.add(idKey);
    featuredProducts.push({ packageId, packageIdent, categoryName, bannerText });
  }

  return featuredProducts;
}

function normalizeBonuses(source) {
  const bonuses = [];
  const seenBonuses = new Set();

  for (const item of Array.isArray(source.bonuses) ? source.bonuses : []) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const packageId = asPackageId(item.packageId ?? item.id);
    const packageIdent = asPackageIdent(item.packageIdent ?? item.ident);
    const percent = validPercent(item.percent);
    const badgeText = cleanLabel(item.badgeText, BADGE_TEXT_MAX);

    if ((!packageId && !packageIdent) || (!badgeText && percent === null)) {
      continue;
    }

    const key = packageId || `ident:${packageIdent}`;

    if (seenBonuses.has(key)) {
      continue;
    }

    seenBonuses.add(key);
    bonuses.push({ packageId, packageIdent, percent, badgeText });
  }

  return bonuses;
}

function normalizePriceNotes(source) {
  const priceNotes = [];
  const seen = new Set();

  for (const item of Array.isArray(source.priceNotes) ? source.priceNotes : []) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const packageId = asPackageId(item.packageId ?? item.id);
    const packageIdent = asPackageIdent(item.packageIdent ?? item.ident);
    const text = cleanLabel(item.text, PRICE_NOTE_MAX);

    if ((!packageId && !packageIdent) || !text) {
      continue;
    }

    const key = packageId || `ident:${packageIdent}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    priceNotes.push({ packageId, packageIdent, text });
  }

  return priceNotes;
}

function perkId(value, index) {
  const id = String(value ?? "").trim();
  if (/^[a-zA-Z0-9_-]{1,40}$/.test(id)) {
    return id;
  }

  return `ligne-${index + 1}`;
}

function normalizePerkCell(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyPerkCell();
  }

  return {
    kind: PERK_KINDS.has(raw.kind) ? raw.kind : "text",
    text: cleanLabel(raw.text, PERK_TEXT_MAX),
  };
}

function isLegacyPerkMap(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return false;
  }

  return GRADE_KEYS.some((key) => Array.isArray(raw[key]));
}

function legacyPerkRows(source) {
  const lists = GRADE_KEYS.map((key) => (Array.isArray(source[key]) ? source[key] : []));
  const length = Math.min(MAX_PERKS, Math.max(0, ...lists.map((rows) => rows.length)));
  const rows = [];

  for (let index = 0; index < length; index += 1) {
    let label = "";
    let id = "";
    const cells = {};

    for (let gradeIndex = 0; gradeIndex < GRADE_KEYS.length; gradeIndex += 1) {
      const key = GRADE_KEYS[gradeIndex];
      const item = lists[gradeIndex][index];
      const cell = normalizePerkCell(item);
      cells[key] = cell;

      if (!label && cell.text) {
        label = cell.text;
      }

      if (!id && item && typeof item === "object" && !Array.isArray(item)) {
        id = item.id;
      }
    }

    if (!label && !GRADE_KEYS.some((key) => cells[key].text)) {
      continue;
    }

    rows.push({ id, label, ...cells });
  }

  return rows;
}

function perkRowsFrom(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (isLegacyPerkMap(raw)) {
    return legacyPerkRows(raw);
  }

  if (raw && typeof raw === "object" && Array.isArray(raw.rows)) {
    return raw.rows;
  }

  return [];
}

export function normalizeSubscriptionPerks(raw) {
  const rows = [];
  const seen = new Set();

  for (const row of perkRowsFrom(raw)) {
    if (!row || typeof row !== "object" || Array.isArray(row) || rows.length >= MAX_PERKS) {
      continue;
    }

    let id = perkId(row.id, rows.length);
    if (seen.has(id)) {
      id = `${id}-${rows.length + 1}`;
    }

    seen.add(id);
    const next = {
      id,
      label: cleanLabel(row.label, PERK_TEXT_MAX),
      pacific: normalizePerkCell(row.pacific),
      penthouse: normalizePerkCell(row.penthouse),
      belair: normalizePerkCell(row.belair),
    };
    rows.push(next);
  }

  return rows;
}

export function normalizeSubscriptionGradeOrder(raw) {
  const incoming = Array.isArray(raw) ? raw : [];
  const unique = [];

  for (const key of incoming) {
    const gradeKey = String(key ?? "").trim();

    if (GRADE_KEYS.includes(gradeKey) && !unique.includes(gradeKey)) {
      unique.push(gradeKey);
    }
  }

  for (const gradeKey of DEFAULT_GRADE_ORDER) {
    if (!unique.includes(gradeKey)) {
      unique.push(gradeKey);
    }
  }

  return unique;
}

export function validateSubscriptionGradeOrder(raw) {
  if (raw == null) {
    return { subscriptionGradeOrder: emptySubscriptionGradeOrder() };
  }

  if (!Array.isArray(raw) || raw.length !== GRADE_KEYS.length) {
    return { error: "L’ordre des abonnements doit contenir les trois grades." };
  }

  const keys = raw.map((key) => String(key ?? "").trim());

  if (new Set(keys).size !== keys.length || keys.some((key) => !GRADE_KEYS.includes(key))) {
    return { error: "L’ordre des abonnements est invalide." };
  }

  return { subscriptionGradeOrder: keys };
}

export function normalizeCardDisplay(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const knownProducts = dedupeProducts(Array.isArray(source.knownProducts) ? source.knownProducts : []);

  return {
    featuredProducts: normalizeFeaturedProducts(readFeaturedEntries(source), knownProducts),
    bonuses: normalizeBonuses(source),
    priceNotes: normalizePriceNotes(source),
    subscriptionPerks: normalizeSubscriptionPerks(source.subscriptionPerks),
    subscriptionGradeOrder: normalizeSubscriptionGradeOrder(source.subscriptionGradeOrder),
    knownProducts,
  };
}

function knownProductsFromInput(input) {
  if (!Array.isArray(input.knownProducts)) {
    return { error: "La liste des produits est invalide." };
  }

  if (input.knownProducts.length > MAX_PRODUCTS) {
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

  return { knownProducts };
}

function validateFeaturedProducts(input, knownProducts) {
  const entries = Array.isArray(input.featuredProducts)
    ? input.featuredProducts
    : input.featuredPackageId
      ? [{ packageId: input.featuredPackageId, packageIdent: input.featuredPackageIdent, bannerText: FEATURED_BADGE_LABEL }]
      : [];

  if (entries.length > MAX_PRODUCTS) {
    return { error: "Trop de bandeaux." };
  }

  const featuredProducts = [];
  const seenIds = new Set();

  for (const item of entries) {
    if (!item || typeof item !== "object") {
      return { error: "Un bandeau est invalide." };
    }

    const packageId = asPackageId(item.packageId);

    if (!packageId || !knownProducts.some((product) => product.packageId === packageId)) {
      return { error: "Un bandeau vise un produit inconnu." };
    }

    if (item.packageIdent && !asPackageIdent(item.packageIdent)) {
      return { error: "Un identifiant Tebex secondaire est invalide." };
    }

    if (seenIds.has(packageId)) {
      return { error: "Un produit ne peut avoir qu’un seul bandeau." };
    }

    const bannerText = bannerTextFromEntry(item);
    if (!bannerText) {
      continue;
    }

    seenIds.add(packageId);
    const product = knownProducts.find((entry) => entry.packageId === packageId);
    featuredProducts.push({
      packageId,
      packageIdent: product?.packageIdent ?? "",
      categoryName: product?.categoryName ?? "",
      bannerText,
    });
  }

  return { featuredProducts };
}

function validateBonuses(input, knownProducts) {
  if (!Array.isArray(input.bonuses)) {
    return { error: "La liste des badges est invalide." };
  }

  if (input.bonuses.length > MAX_PRODUCTS) {
    return { error: "Trop de badges dans la requête." };
  }

  const knownIds = new Set(knownProducts.map((product) => product.packageId));
  const bonuses = [];
  const seenBonuses = new Set();

  for (const item of input.bonuses) {
    if (!item || typeof item !== "object") {
      return { error: "Un badge est invalide." };
    }

    const packageId = asPackageId(item.packageId);

    if (!packageId || !knownIds.has(packageId)) {
      return { error: "Un badge vise un produit inconnu." };
    }

    if (seenBonuses.has(packageId)) {
      return { error: "Un produit ne peut avoir qu’un seul badge." };
    }

    const badgeText = cleanLabel(item.badgeText, BADGE_TEXT_MAX);
    const percent = item.percent === "" || item.percent == null ? null : validPercent(item.percent);

    if ((item.percent !== "" && item.percent != null && percent === null) && !badgeText) {
      return { error: `L’ancien bonus doit être un entier entre ${BONUS_PERCENT_MIN} et ${BONUS_PERCENT_MAX}.` };
    }

    if (!badgeText && percent === null) {
      continue;
    }

    seenBonuses.add(packageId);
    const product = knownProducts.find((entry) => entry.packageId === packageId);
    bonuses.push({
      packageId,
      packageIdent: product?.packageIdent ?? "",
      percent: badgeText ? null : percent,
      badgeText,
    });
  }

  return { bonuses };
}

function validatePriceNotes(input, knownProducts) {
  const source = Array.isArray(input.priceNotes) ? input.priceNotes : [];

  if (source.length > MAX_PRODUCTS) {
    return { error: "Trop de textes sous le prix." };
  }

  const knownIds = new Set(knownProducts.map((product) => product.packageId));
  const priceNotes = [];
  const seen = new Set();

  for (const item of source) {
    if (!item || typeof item !== "object") {
      return { error: "Un texte sous le prix est invalide." };
    }

    const packageId = asPackageId(item.packageId);
    const text = cleanLabel(item.text, PRICE_NOTE_MAX);

    if (!text) {
      continue;
    }

    if (!packageId || !knownIds.has(packageId)) {
      return { error: "Un texte sous le prix vise un produit inconnu." };
    }

    if (seen.has(packageId)) {
      return { error: "Un produit ne peut avoir qu’un seul texte sous le prix." };
    }

    seen.add(packageId);
    const product = knownProducts.find((entry) => entry.packageId === packageId);
    priceNotes.push({
      packageId,
      packageIdent: product?.packageIdent ?? "",
      text,
    });
  }

  return { priceNotes };
}

function perkTextTooLong(value) {
  return String(value ?? "").trim().length > PERK_TEXT_MAX;
}

function validatePerkCell(cell) {
  if (cell == null) {
    return "";
  }

  if (typeof cell !== "object" || Array.isArray(cell)) {
    return "Une valeur d’avantage est invalide.";
  }

  if (cell.kind != null && cell.kind !== "" && !PERK_KINDS.has(cell.kind)) {
    return "Une valeur d’avantage doit être une coche, une croix ou un texte.";
  }

  if (perkTextTooLong(cell.text)) {
    return "Une valeur d’avantage est trop longue.";
  }

  return "";
}

function validatePerks(input) {
  if (input.subscriptionPerks == null) {
    return { subscriptionPerks: emptySubscriptionPerks() };
  }

  const raw = input.subscriptionPerks;
  const legacy = isLegacyPerkMap(raw);
  const wrapped = Boolean(raw && typeof raw === "object" && !Array.isArray(raw) && Array.isArray(raw.rows));

  if (!Array.isArray(raw) && !legacy && !wrapped) {
    return { error: "Les avantages des abonnements sont invalides." };
  }

  const sourceRows = Array.isArray(raw) ? raw : wrapped ? raw.rows : null;

  if (sourceRows) {
    if (sourceRows.length > MAX_PERKS) {
      return { error: "Trop de lignes d’avantages." };
    }

    for (const row of sourceRows) {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        return { error: "Une ligne d’avantage est invalide." };
      }

      if (perkTextTooLong(row.label)) {
        return { error: "Un libellé d’avantage est trop long." };
      }

      for (const key of GRADE_KEYS) {
        const cellError = validatePerkCell(row[key]);
        if (cellError) {
          return { error: cellError };
        }
      }
    }
  } else {
    for (const key of GRADE_KEYS) {
      const rows = raw[key];
      if (rows == null) {
        continue;
      }

      if (!Array.isArray(rows)) {
        return { error: "Les lignes d’un grade sont invalides." };
      }

      if (rows.length > MAX_PERKS) {
        return { error: "Trop de lignes d’avantages pour un grade." };
      }

      for (const row of rows) {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
          return { error: "Une ligne d’avantage est invalide." };
        }

        const cellError = validatePerkCell(row);
        if (cellError) {
          return { error: cellError };
        }
      }
    }
  }

  return { subscriptionPerks: normalizeSubscriptionPerks(raw) };
}

export function validateSubscriptionPerksInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Les avantages des abonnements sont invalides." };
  }

  const perkResult = validatePerks(input);

  if (perkResult.error) {
    return perkResult;
  }

  const orderResult = validateSubscriptionGradeOrder(input.subscriptionGradeOrder);

  if (orderResult.error) {
    return orderResult;
  }

  return {
    subscriptionPerks: perkResult.subscriptionPerks,
    subscriptionGradeOrder: orderResult.subscriptionGradeOrder,
  };
}

export function validateCardDisplayInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Les réglages des cartes sont invalides." };
  }

  const knownResult = knownProductsFromInput(input);
  if (knownResult.error) {
    return knownResult;
  }

  const featuredResult = validateFeaturedProducts(input, knownResult.knownProducts);
  if (featuredResult.error) {
    return featuredResult;
  }

  const bonusResult = validateBonuses(input, knownResult.knownProducts);
  if (bonusResult.error) {
    return bonusResult;
  }

  const noteResult = validatePriceNotes(input, knownResult.knownProducts);
  if (noteResult.error) {
    return noteResult;
  }

  const perkResult = validatePerks(input);
  if (perkResult.error) {
    return perkResult;
  }

  const orderResult = validateSubscriptionGradeOrder(
    Object.prototype.hasOwnProperty.call(input, "subscriptionGradeOrder") ? input.subscriptionGradeOrder : null,
  );
  if (orderResult.error) {
    return orderResult;
  }

  return {
    value: {
      featuredProducts: featuredResult.featuredProducts,
      bonuses: bonusResult.bonuses,
      priceNotes: noteResult.priceNotes,
      subscriptionPerks: perkResult.subscriptionPerks,
      subscriptionGradeOrder: orderResult.subscriptionGradeOrder,
      knownProducts: knownResult.knownProducts,
    },
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

export function badgeLabelForBonus(bonus) {
  const badgeText = cleanLabel(bonus?.badgeText, BADGE_TEXT_MAX);
  if (badgeText) {
    return badgeText;
  }

  if (bonus?.percent) {
    return formatBonusLabel(bonus.percent);
  }

  return "";
}

export function resolveHighlightTargets(primaryProducts, cardDisplay, fallbackProducts = []) {
  const display = normalizeCardDisplay(cardDisplay);
  const primary = dedupeProducts(primaryProducts);
  const primaryIds = new Set(primary.map((product) => product.packageId));
  const fallback = dedupeProducts(fallbackProducts).filter((product) => !primaryIds.has(product.packageId));
  const catalog = [...primary, ...fallback];
  const bonusById = new Map();
  const badgeById = new Map();
  const bannerById = new Map();
  const priceNoteById = new Map();

  for (const bonus of display.bonuses) {
    const target =
      resolveTargetId(bonus.packageId, bonus.packageIdent, primary) ||
      resolveTargetId(bonus.packageId, bonus.packageIdent, fallback);
    const label = badgeLabelForBonus(bonus);

    if (!target || badgeById.has(target) || !label) {
      continue;
    }

    badgeById.set(target, label);
    if (!bonus.badgeText && bonus.percent) {
      bonusById.set(target, bonus.percent);
    }
  }

  for (const entry of display.featuredProducts) {
    const target =
      resolveTargetId(entry.packageId, entry.packageIdent, primary) ||
      resolveTargetId(entry.packageId, entry.packageIdent, fallback);

    if (!target || bannerById.has(target) || !entry.bannerText) {
      continue;
    }

    bannerById.set(target, entry.bannerText);
  }

  for (const note of display.priceNotes) {
    const target =
      resolveTargetId(note.packageId, note.packageIdent, primary) ||
      resolveTargetId(note.packageId, note.packageIdent, fallback);

    if (!target || priceNoteById.has(target) || !note.text) {
      continue;
    }

    priceNoteById.set(target, note.text);
  }

  return {
    featuredIds: new Set(bannerById.keys()),
    bannerById,
    badgeById,
    bonusById,
    priceNoteById,
    subscriptionPerks: display.subscriptionPerks,
    subscriptionGradeOrder: display.subscriptionGradeOrder,
    catalog,
  };
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
  const badgeTextById = new Map();
  const legacyBonusById = new Map();

  for (const bonus of display.bonuses) {
    const target =
      live.find((product) => product.packageId === bonus.packageId || (bonus.packageIdent && product.packageIdent === bonus.packageIdent))?.packageId ||
      missing.find((product) => product.packageId === bonus.packageId || (bonus.packageIdent && product.packageIdent === bonus.packageIdent))?.packageId;

    if (!target || badgeTextById.has(target)) {
      continue;
    }

    badgeTextById.set(target, bonus.badgeText || "");
    if (!bonus.badgeText && bonus.percent) {
      legacyBonusById.set(target, bonus.percent);
    }
  }

  return [...live, ...missing].map((product) => ({
    ...product,
    missing: !liveIds.has(product.packageId),
    bannerText: highlights.bannerById.get(product.packageId) ?? "",
    badgeText: badgeTextById.get(product.packageId) ?? "",
    legacyBonusPercent: legacyBonusById.get(product.packageId) ?? "",
    priceNote: highlights.priceNoteById.get(product.packageId) ?? "",
  }));
}

export function formatBonusLabel(percent) {
  const numeric = Number(percent);
  const value = Number.isFinite(numeric) ? Math.abs(numeric) : 0;

  return `+${value} % de bonus`;
}

export function sanitizeFirstMonthPercent(value) {
  if (value == null || value === "") {
    return { value: 25 };
  }

  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 100) {
    return { error: "Le pourcentage du premier mois doit être un entier entre 0 et 100." };
  }

  return { value: numeric };
}

export function sanitizeCouponCode(value) {
  const code = String(value ?? "").trim();

  if (!code) {
    return { value: "" };
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(code)) {
    return { error: "Le code promo ne peut contenir que des lettres, des chiffres, « - » et « _ »." };
  }

  return { value: code };
}
