import { firestoreDocumentToJs, firestoreGetDocument, firestorePatchDocument } from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import { emptyCardDisplay, normalizeCardDisplay, sanitizeCouponCode } from "@/lib/boutique/card-display";
import { BOUTIQUE_DOC_PATH_REST } from "@/lib/boutique/constants";

export async function getBoutiqueSettings(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, BOUTIQUE_DOC_PATH_REST, token);

  if (!document) {
    return { enabled: false, updatedAt: null, cardDisplay: emptyCardDisplay(), firstMonthCoupon: "" };
  }

  const data = firestoreDocumentToJs(document);
  const nestedCoupon = data?.cardDisplay?.firstMonthCoupon;
  const coupon = sanitizeCouponCode(data?.firstMonthCoupon || nestedCoupon);

  return {
    enabled: data?.enabled === true,
    updatedAt: data?.updatedAt ?? null,
    cardDisplay: normalizeCardDisplay(data?.cardDisplay),
    firstMonthCoupon: coupon.error ? "" : coupon.value,
  };
}

export async function setBoutiqueEnabled(enabled) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const updatedAt = new Date().toISOString();

  await firestorePatchDocument(projectId, BOUTIQUE_DOC_PATH_REST, token, {
    enabled: Boolean(enabled),
    updatedAt,
  });

  return { enabled: Boolean(enabled), updatedAt };
}

export async function setBoutiqueCardDisplay(cardDisplay, firstMonthCoupon = "") {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const updatedAt = new Date().toISOString();
  const normalized = normalizeCardDisplay(cardDisplay);
  const coupon = sanitizeCouponCode(firstMonthCoupon);

  if (coupon.error) {
    throw new Error(coupon.error);
  }

  await firestorePatchDocument(projectId, BOUTIQUE_DOC_PATH_REST, token, {
    cardDisplay: normalized,
    firstMonthCoupon: coupon.value,
    updatedAt,
  });

  return getBoutiqueSettings(token);
}
