import { firestoreDocumentToJs, firestoreGetDocument, firestorePatchDocument } from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import { BOUTIQUE_DOC_PATH_REST } from "@/lib/boutique/constants";

export async function getBoutiqueSettings(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, BOUTIQUE_DOC_PATH_REST, token);

  if (!document) {
    return { enabled: false, updatedAt: null };
  }

  const data = firestoreDocumentToJs(document);

  return {
    enabled: data?.enabled === true,
    updatedAt: data?.updatedAt ?? null,
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
