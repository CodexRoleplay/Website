const TEBEX_API_BASE = "https://headless.tebex.io/api";

export class TebexApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "TebexApiError";
    this.status = status;
  }
}

function getPublicToken() {
  const token = process.env.TEBEX_PUBLIC_TOKEN;

  if (!token) {
    throw new TebexApiError("Le token public Tebex n'est pas configuré.", 503);
  }

  return token;
}

async function tebexRequest(path, options = {}) {
  const { revalidate, ...requestOptions } = options;
  const response = await fetch(`${TEBEX_API_BASE}${path}`, {
    ...requestOptions,
    ...(Number.isFinite(revalidate) ? { next: { revalidate } } : { cache: "no-store" }),
    headers: {
      Accept: "application/json",
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...requestOptions.headers,
    },
  });
  const rawBody = await response.text();
  let payload = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      payload?.detail || payload?.message || payload?.title || "La requête Tebex a échoué.";
    throw new TebexApiError(message, response.status);
  }

  return payload;
}

export async function getTebexCategories() {
  const token = getPublicToken();
  const payload = await tebexRequest(
    `/accounts/${encodeURIComponent(token)}/categories?includePackages=1`,
  );

  return payload?.data ?? [];
}

export async function getTebexNavigationCategories() {
  const token = getPublicToken();
  const payload = await tebexRequest(
    `/accounts/${encodeURIComponent(token)}/categories?includePackages=1`,
    { revalidate: 60 },
  );

  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createTebexBasket({ completeUrl, cancelUrl }) {
  const token = getPublicToken();
  const payload = await tebexRequest(`/accounts/${encodeURIComponent(token)}/baskets`, {
    method: "POST",
    body: JSON.stringify({
      complete_url: completeUrl,
      cancel_url: cancelUrl,
      complete_auto_redirect: true,
    }),
  });

  return payload?.data ?? payload;
}

export async function getTebexBasket(ident) {
  const token = getPublicToken();
  const payload = await tebexRequest(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}`,
  );

  return payload?.data ?? payload;
}

export async function getTebexAuthLinks(ident, returnUrl) {
  const token = getPublicToken();

  return tebexRequest(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`,
  );
}

export async function addTebexPackage(ident, packageId, quantity = 1) {
  return tebexRequest(`/baskets/${encodeURIComponent(ident)}/packages`, {
    method: "POST",
    body: JSON.stringify({
      package_id: Number(packageId),
      quantity: Number(quantity),
    }),
  });
}

export async function removeTebexPackage(ident, packageId) {
  return tebexRequest(`/baskets/${encodeURIComponent(ident)}/packages/remove`, {
    method: "POST",
    body: JSON.stringify({ package_id: Number(packageId) }),
  });
}

export async function updateTebexPackageQuantity(ident, packageId, quantity) {
  return tebexRequest(
    `/baskets/${encodeURIComponent(ident)}/packages/${encodeURIComponent(packageId)}`,
    {
      method: "PUT",
      body: JSON.stringify({ quantity: Number(quantity) }),
    },
  );
}
