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

export const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  "http://localhost:3000";

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
