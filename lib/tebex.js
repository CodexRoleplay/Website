const TEBEX_API_BASE = "https://headless.tebex.io/api";

export class TebexApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "TebexApiError";
    this.status = status;
    this.details = details;
    this.code = typeof details?.code === "string" ? details.code : "";
  }
}

export const TEBEX_INVALID_OPTIONS_MESSAGE =
  "Impossible d'ajouter ce produit : Tebex refuse une option du pack. La connexion FiveM ne fournit pas d'identifiant Discord. Dans le panneau Tebex, ouvre le produit puis Deliverables, et retire l'action Discord si le rôle n'est pas indispensable. S'il n'y a qu'un serveur, décoche « Allow customers to select the game server they want to receive this package on ». Une carte cadeau exige en plus l'e-mail du destinataire, que cette page ne demande pas encore.";

function tebexErrorTexts(payload) {
  const texts = [];
  const push = (value) => {
    if (typeof value === "string" && value.trim()) {
      texts.push(value.trim());
    }
  };

  push(payload?.title);
  push(payload?.detail);
  push(payload?.message);
  push(payload?.error);

  if (payload?.errors && typeof payload.errors === "object") {
    for (const value of Object.values(payload.errors)) {
      if (Array.isArray(value)) {
        value.forEach(push);
      } else {
        push(value);
      }
    }
  }

  return texts;
}

function tebexErrorList(error) {
  return [error?.message, ...(error?.details?.texts ?? [])];
}

export function isInvalidTebexOptionsError(error) {
  return tebexErrorList(error).some((text) => /one of the options provided is invalid/i.test(String(text ?? "")));
}

export function isDiscordVariableError(error) {
  return tebexErrorList(error).some((text) =>
    /please enter the .*discord.*variable/i.test(String(text ?? "")),
  );
}

function giftPublicMessage(error) {
  const texts = tebexErrorList(error).map((text) => String(text ?? ""));

  if (texts.some((text) => /gift/i.test(text) && /not enabled|disabled|cannot be gifted|not giftable/i.test(text))) {
    return "Ce produit ne peut pas être offert pour le moment.";
  }

  if (texts.some((text) => /could not find|user not found|username.*(invalid|not found)|no matching user/i.test(text))) {
    return "Ce pseudo FiveM est introuvable. Vérifiez le nom du compte.";
  }

  return "";
}

export function publicTebexMessage(error) {
  if (isInvalidTebexOptionsError(error)) {
    return TEBEX_INVALID_OPTIONS_MESSAGE;
  }

  return giftPublicMessage(error) || (error instanceof Error ? error.message : "Erreur Tebex inattendue.");
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
    const texts = tebexErrorTexts(payload);
    const message = texts[0] || "La requête Tebex a échoué.";
    throw new TebexApiError(message, response.status, { texts });
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

function packageRef(packageId) {
  if (typeof packageId === "string" && /^(pkg|dyn|ext)_[\w-]+$/i.test(packageId)) {
    return packageId;
  }

  const numericId = Number(packageId);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  throw new TebexApiError("Identifiant de produit invalide.", 400);
}

export async function getTebexPackage(packageId) {
  const token = getPublicToken();
  const payload = await tebexRequest(
    `/accounts/${encodeURIComponent(token)}/packages/${encodeURIComponent(packageId)}`,
  );

  return payload?.data ?? payload;
}

function normalizeDiscordId(value) {
  const id = String(value ?? "").trim();

  return /^\d{17,20}$/.test(id) ? id : "";
}

function discordIdFromBasket(basket) {
  const candidates = [
    basket?.discord_id,
    basket?.discordId,
    basket?.discord?.id,
    basket?.discord?.discord_id,
    basket?.custom?.discord_id,
  ];

  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();

    if (/^\d{17,20}$/.test(value)) {
      return value;
    }
  }

  return "";
}

function usernameIdFromBasket(basket) {
  const value = basket?.username_id ?? basket?.usernameId;

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return String(value);
  }

  if (typeof value === "string" && value.trim() && value.trim() !== "0") {
    return value.trim();
  }

  return "";
}

function variableIdentifier(variable) {
  return String(variable?.identifier ?? variable?.id ?? "").trim();
}

function isDiscordPackageVariable(variable) {
  const type = String(variable?.type ?? "").toLowerCase();
  const description = String(variable?.description ?? "").toLowerCase();
  const identifier = variableIdentifier(variable).toLowerCase();

  return type.includes("discord") || description.includes("discord") || identifier.includes("discord");
}

async function discordVariableKeys(packageId) {
  const fallback = ["discord_id", "discord", "discordid"];

  try {
    const pack = await getTebexPackage(packageId);
    const variables = Array.isArray(pack?.variables) ? pack.variables : [];
    const keys = [
      ...new Set(variables.filter(isDiscordPackageVariable).map(variableIdentifier).filter(Boolean)),
    ];

    return keys.length ? keys : fallback;
  } catch {
    return fallback;
  }
}

async function postTebexPackage(ident, packageId, quantity, variableData, targetUsername = "") {
  const body = {
    package_id: packageRef(packageId),
    quantity: Number(quantity),
  };
  const recipient = String(targetUsername ?? "").trim();

  if (recipient) {
    body.target_username = recipient;
  }

  if (variableData && Object.keys(variableData).length > 0) {
    body.variable_data = variableData;
  }

  return tebexRequest(`/baskets/${encodeURIComponent(ident)}/packages`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function addTebexPackage(
  ident,
  packageId,
  quantity = 1,
  basket = null,
  discordId = "",
  targetUsername = "",
) {
  const resolvedDiscordId = normalizeDiscordId(discordId) || discordIdFromBasket(basket);
  const usernameId = usernameIdFromBasket(basket);
  const recipient = String(targetUsername ?? "").trim();
  const attempts = [];

  if (resolvedDiscordId) {
    attempts.push({ discord_id: resolvedDiscordId });
  }

  attempts.push(null);

  if (!recipient && usernameId) {
    attempts.push({ username_id: usernameId });
  }

  if (!recipient && resolvedDiscordId && usernameId) {
    attempts.push({ discord_id: resolvedDiscordId, username_id: usernameId });
  }

  let lastError = null;

  for (const variableData of attempts) {
    try {
      return await postTebexPackage(ident, packageId, quantity, variableData, recipient);
    } catch (error) {
      lastError = error;

      if (isDiscordVariableError(error) && !resolvedDiscordId) {
        throw new TebexApiError("Connectez votre compte Discord pour ajouter ce produit.", 422, {
          code: "discord_required",
        });
      }

      if (!isDiscordVariableError(error) && !isInvalidTebexOptionsError(error)) {
        throw error;
      }
    }
  }

  if (isDiscordVariableError(lastError)) {
    throw new TebexApiError(
      resolvedDiscordId
        ? "Tebex n'a pas accepté la connexion Discord pour ce produit. Déconnectez Discord, reconnectez-vous, puis réessayez."
        : "Connectez votre compte Discord pour ajouter ce produit.",
      lastError.status || 422,
      resolvedDiscordId ? lastError.details : { code: "discord_required" },
    );
  }

  throw new TebexApiError(TEBEX_INVALID_OPTIONS_MESSAGE, lastError.status || 422, lastError.details);
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
