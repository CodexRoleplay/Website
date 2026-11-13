const GRADE_ORDER = [
  { key: "belair", label: "Bel Air" },
  { key: "penthouse", label: "Penthouse" },
  { key: "pacific", label: "Pacific" },
];

export const SUBSCRIPTION_GRADES = GRADE_ORDER;

export const SUBSCRIPTION_TERMS = [
  { key: "monthly", label: "Mensuel" },
  { key: "quarter", label: "3 mois" },
  { key: "year", label: "12 mois" },
];

export function foldShopText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function subscriptionGradeFromName(name) {
  const folded = foldShopText(name);

  if (/\bbel\s*air\b/.test(folded) || /\bbelair\b/.test(folded)) {
    return "belair";
  }

  if (/\bpenthouse\b/.test(folded)) {
    return "penthouse";
  }

  if (/\bpacific\b/.test(folded)) {
    return "pacific";
  }

  return "";
}

export function subscriptionTermFromName(name) {
  const folded = foldShopText(name);

  if (/\b(annuel|annual|yearly)\b/.test(folded) || (/\b(12|douze)\b/.test(folded) && /\b(mois|month|an|annee|year)\b/.test(folded))) {
    return "year";
  }

  if (/\bsemestre\b/.test(folded) || (/\b(6|six)\b/.test(folded) && /\b(mois|month)\b/.test(folded))) {
    return "half";
  }

  if (/\b(trimestre|trimestriel|quarter)\b/.test(folded) || (/\b(3|trois)\b/.test(folded) && /\b(mois|month)\b/.test(folded))) {
    return "quarter";
  }

  if (/\b(mensuel|mensuelle|monthly)\b/.test(folded) || /\bpar mois\b/.test(folded) || /\b1 mois\b/.test(folded)) {
    return "monthly";
  }

  return "";
}

export function isSubscriptionCategory(category) {
  const folded = foldShopText(category?.name);
  if (/\babonnements?\b/.test(folded) || /\bsubscriptions?\b/.test(folded)) {
    return true;
  }

  const packages = Array.isArray(category?.packages) ? category.packages : [];
  if (!packages.length) {
    return false;
  }

  const matched = packages.filter((product) => subscriptionGradeFromName(product?.name)).length;
  return matched >= 3 && matched >= Math.ceil(packages.length / 2);
}

export function isMonthlySubscriptionPackage(pack) {
  const type = String(pack?.type ?? "").toLowerCase();
  if (type === "single") {
    return false;
  }

  const explicit = subscriptionTermFromName(pack?.name);
  if (explicit) {
    return explicit === "monthly";
  }

  return type === "subscription" || pack?.is_recurring === true;
}

function emptySlots() {
  return {
    monthly: { pacific: null, penthouse: null, belair: null },
    quarter: { pacific: null, penthouse: null, belair: null },
    year: { pacific: null, penthouse: null, belair: null },
    half: { pacific: null, penthouse: null, belair: null },
  };
}

export function buildSubscriptionBoard(packages) {
  const slots = emptySlots();
  const leftovers = [];
  const list = Array.isArray(packages) ? packages : [];

  for (const product of list) {
    const grade = subscriptionGradeFromName(product?.name);
    const explicit = subscriptionTermFromName(product?.name);
    const term = explicit || (grade ? "monthly" : "");

    if (!grade || !slots[term] || slots[term][grade]) {
      leftovers.push(product);
      continue;
    }

    slots[term][grade] = product;
  }

  return {
    slots,
    leftovers,
    matched: list.length - leftovers.length,
  };
}

export function columnOffer(slots, term, grade) {
  if (term === "year" && grade === "belair") {
    const yearly = slots?.year?.belair;
    if (yearly) {
      return { product: yearly, months: 12 };
    }

    const half = slots?.half?.belair;
    if (half) {
      return { product: half, months: 6 };
    }

    return { product: null, months: 12 };
  }

  const product = slots?.[term]?.[grade] ?? null;
  const months = term === "quarter" ? 3 : term === "year" ? 12 : 1;
  return { product, months };
}

export function subscriptionTotalCaption(months) {
  if (months === 12) {
    return "l'année";
  }

  if (months === 6) {
    return "pour 6 mois";
  }

  if (months === 3) {
    return "pour 3 mois";
  }

  return "";
}
