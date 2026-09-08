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
  auditReglementChanges,
  buildReglementChangeSummary,
  countReglementStats,
  prepareReglementPayload,
} from "@/lib/reglement/diff";
import { normalizeCategories } from "@/lib/reglement/fallback";
import { normalizeChangeDetails, serializeChangeDetails } from "@/lib/admin/text-diff";

const REGLEMENT_DOC_PATH = "site/reglement";
const REGLEMENT_LOGS_COLLECTION = "reglement_logs";
const MAX_LOGGED_CHANGES = 40;

export { prepareReglementPayload };

export async function getReglementDocument(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, REGLEMENT_DOC_PATH, token);

  if (!document) {
    return {
      categories: [],
      updatedAt: null,
      updatedBy: null,
      updatedByEmail: null,
    };
  }

  const data = firestoreDocumentToJs(document);

  return {
    categories: normalizeCategories(data.categories),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    updatedByEmail: data.updatedByEmail ?? null,
  };
}

export async function saveReglementWithAudit({ categories, actor }) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const before = await getReglementDocument(token);
  const normalized = prepareReglementPayload(categories);
  const audit = auditReglementChanges(before.categories, normalized);
  const changes = audit.changes.slice(0, MAX_LOGGED_CHANGES);
  const details = serializeChangeDetails(audit.details);
  const stats = countReglementStats(normalized);
  const updatedAt = new Date().toISOString();
  const summary = buildReglementChangeSummary(changes);

  const reglementData = {
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

  const reglementWrite = before.updatedAt
    ? firestorePatchDocument(projectId, REGLEMENT_DOC_PATH, token, reglementData)
    : firestoreCreateDocument(projectId, REGLEMENT_DOC_PATH, token, reglementData);

  await Promise.all([
    reglementWrite,
    firestoreAddDocument(projectId, REGLEMENT_LOGS_COLLECTION, token, logEntry),
  ]);

  return {
    updatedAt,
    summary,
    changes,
    details,
    stats,
  };
}

export async function listReglementLogs(limit = 30) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const documents = await firestoreListDocuments(projectId, REGLEMENT_LOGS_COLLECTION, token, limit);

  return documents
    .map((document) => {
      const data = firestoreDocumentToJs(document);
      const id = document.name?.split("/").pop() ?? "";

      return {
        id,
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
