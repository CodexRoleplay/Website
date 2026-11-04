import { firestoreDocumentToJs, firestoreGetDocument, firestorePatchDocument } from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import { emptyCardDisplay, normalizeCardDisplay } from "@/lib/boutique/card-display";
import { BOUTIQUE_DOC_PATH_REST } from "@/lib/boutique/constants";

export async function getBoutiqueSettings(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, BOUTIQUE_DOC_PATH_REST, token);

  if (!document) {
    return { enabled: false, updatedAt: null, cardDisplay: emptyCardDisplay() };
  }

  const data = firestoreDocumentToJs(document);

  return {
    enabled: data?.enabled === true,
    updatedAt: data?.updatedAt ?? null,
    cardDisplay: normalizeCardDisplay(data?.cardDisplay),
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

export async function setBoutiqueCardDisplay(cardDisplay) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const updatedAt = new Date().toISOString();
  const normalized = normalizeCardDisplay(cardDisplay);

  await firestorePatchDocument(projectId, BOUTIQUE_DOC_PATH_REST, token, {
    cardDisplay: normalized,
    updatedAt,
  });

  return getBoutiqueSettings(token);
}
