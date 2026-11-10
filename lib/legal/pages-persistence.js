import {
  firestoreDocumentToJs,
  firestoreGetDocument,
  firestorePatchDocument,
} from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import { emptyLegalPages, LEGAL_PAGE_KEYS, normalizeStoredLegalPage, prepareLegalPage } from "@/lib/legal/pages";

const LEGAL_PAGES_PATH = "site/legal-pages";

export async function getLegalPages(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, LEGAL_PAGES_PATH, token);

  if (!document) {
    return emptyLegalPages();
  }

  const data = firestoreDocumentToJs(document);
  const pages = emptyLegalPages();

  for (const key of LEGAL_PAGE_KEYS) {
    pages[key] = normalizeStoredLegalPage(key, data?.[key]);
  }

  return pages;
}

export async function saveLegalPage({ page, title, blocks, actor }) {
  if (!LEGAL_PAGE_KEYS.includes(page)) {
    throw new Error("Page légale inconnue.");
  }

  const projectId = getProjectId();
  const token = await getAccessToken();
  const prepared = prepareLegalPage(page, { title, blocks });
  const updatedAt = new Date().toISOString();
  const stored = {
    ...prepared,
    updatedAt,
    updatedBy: actor.uid,
    updatedByEmail: actor.email ?? "",
  };

  await firestorePatchDocument(projectId, LEGAL_PAGES_PATH, token, {
    [page]: stored,
  });

  return stored;
}
