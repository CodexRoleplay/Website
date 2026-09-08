import {
  firestoreAddDocument,
  firestoreCreateDocument,
  firestoreDocumentToJs,
  firestoreGetDocument,
  firestoreListDocuments,
  firestorePatchDocument,
} from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import {
  auditFaqChanges,
  buildFaqChangeSummary,
  countFaqStats,
  prepareFaqPayload,
} from "@/lib/faq/diff";
import { normalizeFaqCategories } from "@/lib/faq/normalize";
import { normalizeChangeDetails, serializeChangeDetails } from "@/lib/admin/text-diff";

const FAQ_DOC_PATH = "site/faq";
const FAQ_LOGS_COLLECTION = "faq_logs";
const MAX_LOGGED_CHANGES = 60;

export { prepareFaqPayload };

export async function getFaqDocument(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, FAQ_DOC_PATH, token);

  if (!document) {
    return { categories: [], updatedAt: null, updatedBy: null, updatedByEmail: null };
  }

  const data = firestoreDocumentToJs(document);
  return {
    categories: normalizeFaqCategories(data.categories),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    updatedByEmail: data.updatedByEmail ?? null,
  };
}

export async function saveFaqWithAudit({ categories, actor }) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const before = await getFaqDocument(token);
  const normalized = prepareFaqPayload(categories);
  const audit = auditFaqChanges(before.categories, normalized);
  const changes = audit.changes.slice(0, MAX_LOGGED_CHANGES);
  const details = serializeChangeDetails(audit.details);
  const stats = countFaqStats(normalized);
  const updatedAt = new Date().toISOString();
  const summary = buildFaqChangeSummary(changes);
  const faqData = {
    categories: normalized,
    updatedAt,
    updatedBy: actor.uid,
    updatedByEmail: actor.email ?? "",
  };
  const logEntry = {
    action: "update",
    actorUid: actor.uid,
    actorEmail: actor.email ?? "",
    createdAt: updatedAt,
    previousUpdatedAt: before.updatedAt,
    summary,
    changes,
    details,
    stats,
  };
  const faqWrite = before.updatedAt
    ? firestorePatchDocument(projectId, FAQ_DOC_PATH, token, faqData)
    : firestoreCreateDocument(projectId, FAQ_DOC_PATH, token, faqData);

  await Promise.all([
    faqWrite,
    firestoreAddDocument(projectId, FAQ_LOGS_COLLECTION, token, logEntry),
  ]);

  return { updatedAt, summary, changes, details, stats };
}

export async function listFaqLogs(limit = 40) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const documents = await firestoreListDocuments(projectId, FAQ_LOGS_COLLECTION, token, limit);

  return documents
    .map((document) => {
      const data = firestoreDocumentToJs(document);
      return {
        id: document.name?.split("/").pop() ?? "",
        action: data.action ?? "update",
        actorUid: data.actorUid ?? "",
        actorEmail: data.actorEmail ?? "",
        createdAt: data.createdAt ?? "",
        previousUpdatedAt: data.previousUpdatedAt ?? null,
        summary: data.summary ?? "",
        changes: Array.isArray(data.changes) ? data.changes : [],
        details: normalizeChangeDetails(data.details),
        stats: data.stats ?? null,
      };
    })
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, limit);
}
