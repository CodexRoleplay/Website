const PRODUCTION_SITE_URL = "https://www.codexroleplay.com";

function normalizeSiteUrl(value) {
  const candidate = value?.trim();

  if (!candidate) {
    return null;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate.replace(/\/+$/, "");
  }

  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(candidate);
  return `${isLocal ? "http" : "https"}://${candidate}`.replace(/\/+$/, "");
}

const configuredUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const isDev = process.env.NODE_ENV === "development";

export const siteUrl = isDev
  ? configuredUrl ?? "http://localhost:3000"
  : PRODUCTION_SITE_URL;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
