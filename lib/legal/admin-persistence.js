import {
  firestoreCreateDocument,
  firestoreDocumentToJs,
  firestoreGetDocument,
  firestorePatchDocument,
} from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import { normalizeLegalDocument } from "@/lib/legal/content";

const LEGAL_DOC_PATH = "site/legal";

export async function getLegalDocument(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, LEGAL_DOC_PATH, token);

  if (!document) {
    return {
      ...normalizeLegalDocument(),
      updatedAt: null,
      updatedBy: null,
      updatedByEmail: null,
    };
  }

  const data = firestoreDocumentToJs(document);
  return {
    ...normalizeLegalDocument(data),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    updatedByEmail: data.updatedByEmail ?? null,
  };
}

export async function saveLegalDocument({ document, actor }) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const before = await getLegalDocument(token);
  const normalized = normalizeLegalDocument(document);
  const updatedAt = new Date().toISOString();
  const legalData = {
    ...normalized,
    updatedAt,
    updatedBy: actor.uid,
    updatedByEmail: actor.email ?? "",
  };
  const write = before.updatedAt
    ? firestorePatchDocument(projectId, LEGAL_DOC_PATH, token, legalData)
    : firestoreCreateDocument(projectId, LEGAL_DOC_PATH, token, legalData);

  await write;
  return { ...legalData };
}
