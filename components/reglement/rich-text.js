const FORMATTING_TAG_PATTERN =
  /<\s*\/?\s*(p|div|br|strong|b|em|i|u|ul|ol|li|blockquote|h[1-6])\b/i;

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "h4",
]);

export function normalizeNewlines(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function containsFormattingHtml(value) {
  return FORMATTING_TAG_PATTERN.test(normalizeNewlines(value));
}

export function sanitizeRichText(value) {
  const source = normalizeNewlines(value);

  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|svg|math)\b[^>]*\/?\s*>/gi, "")
    .replace(/<\/?\s*([a-zA-Z0-9]+)([^>]*)>/g, (match, rawTag) => {
      const tag = rawTag.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }

      if (/^<\s*\//.test(match)) {
        return tag === "br" ? "" : `</${tag}>`;
      }

      if (tag === "br") {
        return "<br>";
      }

      return `<${tag}>`;
    })
    .replace(/>\s+</g, "><");
}
