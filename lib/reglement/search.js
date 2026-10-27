import { normalizeSectionContent } from "./content";

const EXTRA_FOLDS = {
  œ: "oe",
  Œ: "oe",
  æ: "ae",
  Æ: "ae",
  ø: "o",
  Ø: "o",
  ł: "l",
  Ł: "l",
  đ: "d",
  ð: "d",
  ß: "ss",
  "’": "'",
  "‘": "'",
  "ʼ": "'",
};

function foldChar(char) {
  const expanded = EXTRA_FOLDS[char] ?? char;
  let folded = "";

  for (const piece of expanded) {
    folded += piece.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("fr");
  }

  return folded;
}

function foldWithIndex(value) {
  const source = String(value ?? "");
  let folded = "";
  const map = [];

  for (let index = 0; index < source.length; index += 1) {
    for (const char of foldChar(source[index])) {
      const normalizedChar = /\s/.test(char) ? " " : char;

      if (normalizedChar === " " && (!folded || folded.endsWith(" "))) {
        continue;
      }

      folded += normalizedChar;
      map.push(index);
    }
  }

  if (folded.endsWith(" ")) {
    folded = folded.slice(0, -1);
    map.pop();
  }

  return { folded, map };
}

export function foldSearchText(value) {
  return foldWithIndex(value).folded;
}

export function plainSearchText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function pushText(parts, value) {
  const text = plainSearchText(value).trim();

  if (text) {
    parts.push(text);
  }
}

export function blockSearchText(block) {
  if (!block || typeof block !== "object") {
    return "";
  }

  const parts = [];

  switch (block.type) {
    case "heading":
    case "text":
    case "quote":
      pushText(parts, block.text);
      break;
    case "alert":
      pushText(parts, block.title);
      pushText(parts, block.text);
      break;
    case "list":
      for (const item of block.items ?? []) {
        pushText(parts, item?.label);
        pushText(parts, item?.text);
      }
      break;
    case "cards":
      for (const card of block.cards ?? []) {
        pushText(parts, card?.title);

        for (const item of card?.items ?? []) {
          pushText(parts, item);
        }
      }
      break;
    case "rule":
      pushText(parts, block.title);
      pushText(parts, block.description);
      break;
    default:
      pushText(parts, block.title);
      pushText(parts, block.text);
      pushText(parts, block.description);
      break;
  }

  return parts.join(" ");
}

export function sectionMatchesQuery(section, foldedQuery) {
  const haystack = foldSearchText(
    [section?.title, ...normalizeSectionContent(section).map(blockSearchText)].join(" "),
  );

  return haystack.includes(foldedQuery);
}

export function filterReglementCategories(categories, rawQuery) {
  const foldedQuery = foldSearchText(rawQuery);

  if (!foldedQuery) {
    return categories ?? [];
  }

  return (categories ?? [])
    .map((category) => {
      const titleMatches = foldSearchText(category?.title).includes(foldedQuery);
      const sections = titleMatches
        ? (category.sections ?? [])
        : (category.sections ?? []).filter((section) => sectionMatchesQuery(section, foldedQuery));

      if (!titleMatches && sections.length === 0) {
        return null;
      }

      return { ...category, sections };
    })
    .filter(Boolean);
}

export function findSearchRanges(text, rawQuery) {
  const source = String(text ?? "");
  const foldedQuery = foldSearchText(rawQuery);

  if (!foldedQuery) {
    return [];
  }

  const { folded, map } = foldWithIndex(source);
  const ranges = [];
  let from = 0;

  while (from <= folded.length - foldedQuery.length) {
    const found = folded.indexOf(foldedQuery, from);

    if (found === -1) {
      break;
    }

    const start = map[found];
    const end = map[found + foldedQuery.length - 1] + 1;
    const previous = ranges[ranges.length - 1];

    if (previous && start < previous[1]) {
      from = found + 1;
      continue;
    }

    ranges.push([start, end]);
    from = found + foldedQuery.length;
  }

  return ranges;
}
