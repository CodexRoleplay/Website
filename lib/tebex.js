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

export const TEBEX_INVALID_OPTIONS_MESSAGE = "Tebex a refusé ce produit. Réessaie.";

const GIFT_DISCORD_REQUIRED_MESSAGE =
  "Connecte d'abord Discord avec le bouton Discord en bas de la boutique. On ne demande pas le Discord du destinataire.";

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

function isGiftUnavailableError(error) {
  return tebexErrorList(error).some((text) => {
    const value = String(text ?? "");

    return /gift/i.test(value) && /not enabled|disabled|cannot be gifted|not giftable/i.test(value);
  });
}

function isSelectedPlayerError(error) {
  return tebexErrorList(error).some((text) => /selected id is invalid/i.test(String(text ?? "")));
}

const GIFT_PLAYER_MESSAGE =
  "Tebex ne trouve pas ce joueur. Indique le pseudo FiveM (comme REX-STUDIO), pas le nom Discord. Le pack est livré sur ce compte FiveM.";

function isGiftTargetError(error) {
  return tebexErrorList(error).some((text) =>
    /could not find|user not found|unknown user|no matching user|invalid username|please enter a valid username|selected (username|target)/i.test(
      String(text ?? ""),
    ),
  );
}

function giftPublicMessage(error) {
  const texts = tebexErrorList(error).map((text) => String(text ?? ""));

  if (texts.some((text) => /subscription/i.test(text) && /gift/i.test(text))) {
    return "Tebex refuse d'offrir cet abonnement.";
  }

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

export async function createTebexBasket({ completeUrl, cancelUrl, ipAddress = "" }) {
  const token = getPublicToken();
  const path = `/accounts/${encodeURIComponent(token)}/baskets`;
  const body = {
    complete_url: completeUrl,
    cancel_url: cancelUrl,
    complete_auto_redirect: true,
  };

  if (ipAddress) {
    try {
      const payload = await tebexRequest(path, {
        method: "POST",
        body: JSON.stringify({ ...body, ip_address: ipAddress }),
      });

      return payload?.data ?? payload;
    } catch (error) {
      if (!(error instanceof TebexApiError) || error.status >= 500) {
        throw error;
      }
    }
  }

  const payload = await tebexRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
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
  if (typeof packageId === "string" && /^(?:pkg|dyn|ext)_[\w.-]+$/i.test(packageId)) {
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

function throwMappedAddError(error, { recipient = false, discordResolved = false } = {}) {
  if (recipient && isGiftUnavailableError(error)) {
    throw new TebexApiError(
      "Les cadeaux sont désactivés dans Tebex. Activez-les dans Réglages, puis Paiement.",
      error.status || 422,
      error.details,
    );
  }

  if (recipient && (isGiftTargetError(error) || isSelectedPlayerError(error))) {
    throw new TebexApiError(GIFT_PLAYER_MESSAGE, 422, error.details);
  }

  if (isDiscordVariableError(error)) {
    throw new TebexApiError(
      discordResolved
        ? "Tebex n'a pas accepté le Discord connecté. Déconnecte-le, reconnecte-toi, puis réessaie."
        : "Connectez votre compte Discord pour ajouter ce produit.",
      error.status || 422,
      discordResolved ? error.details : { code: "discord_required" },
    );
  }

  if (isInvalidTebexOptionsError(error)) {
    throw new TebexApiError(TEBEX_INVALID_OPTIONS_MESSAGE, error.status || 422, error.details);
  }

  throw error;
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
  const recipient = String(targetUsername ?? "").trim();

  if (recipient) {
    if (!resolvedDiscordId) {
      throw new TebexApiError(GIFT_DISCORD_REQUIRED_MESSAGE, 422, { code: "discord_required" });
    }

    try {
      return await postTebexPackage(
        ident,
        packageId,
        quantity,
        { discord_id: resolvedDiscordId },
        recipient,
      );
    } catch (error) {
      throwMappedAddError(error, { recipient: true, discordResolved: true });
    }
  }

  try {
    return await postTebexPackage(
      ident,
      packageId,
      quantity,
      resolvedDiscordId ? { discord_id: resolvedDiscordId } : null,
    );
  } catch (error) {
    if (resolvedDiscordId && isInvalidTebexOptionsError(error)) {
      try {
        return await postTebexPackage(ident, packageId, quantity, null);
      } catch (retryError) {
        if (isDiscordVariableError(retryError) || isInvalidTebexOptionsError(retryError)) {
          throw new TebexApiError(TEBEX_INVALID_OPTIONS_MESSAGE, retryError.status || 422, retryError.details);
        }

        throwMappedAddError(retryError, { discordResolved: true });
      }
    }

    throwMappedAddError(error, { discordResolved: Boolean(resolvedDiscordId) });
  }
}

export async function applyTebexCoupon(ident, couponCode) {
  const token = getPublicToken();
  const code = String(couponCode ?? "").trim();

  if (!code) {
    return null;
  }

  return tebexRequest(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/coupons`,
    {
      method: "POST",
      body: JSON.stringify({ coupon_code: code }),
    },
  );
}

export function isBenignCouponError(error) {
  return tebexErrorList(error).some((text) =>
    /already (been )?applied|already exists|duplicate coupon|coupon.*already/i.test(String(text ?? "")),
  );
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
