import {
  firestoreAddDocument,
  firestoreCreateDocument,
  firestoreDocumentToJs,
  firestoreGetDocument,
  firestoreListDocuments,
  firestorePatchDocument,
} from "@/lib/firebase/firestore-rest";
import { getAccessToken, getProjectId } from "@/lib/firebase/admin-server";
import { normalizeChangeDetails, serializeChangeDetails } from "@/lib/admin/text-diff";
import { LORE_DOCUMENT_PATH, LORE_LOGS_COLLECTION } from "./constants";
import { emptyLoreDocument, prepareLoreDocument } from "./content";
import { auditLoreChanges, buildLoreChangeSummary } from "./diff";

const MAX_LOGGED_CHANGES = 40;

export async function getLoreDocument(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, LORE_DOCUMENT_PATH, token);

  if (!document) {
    return emptyLoreDocument();
  }

  const data = firestoreDocumentToJs(document);
  const prepared = prepareLoreDocument({
    title: data.title,
    blocks: data.blocks,
  });

  return {
    ...prepared,
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    updatedByEmail: data.updatedByEmail ?? null,
  };
}

export async function saveLoreWithAudit({ title, blocks, actor }) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const before = await getLoreDocument(token);
  const prepared = prepareLoreDocument({ title, blocks });
  const audit = auditLoreChanges(before, prepared);
  const changes = audit.changes.slice(0, MAX_LOGGED_CHANGES);
  const details = serializeChangeDetails(audit.details);
  const updatedAt = new Date().toISOString();
  const summary = buildLoreChangeSummary(changes);
  const loreData = {
    title: prepared.title,
    blocks: prepared.blocks,
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
    stats: {
      blocks: prepared.blocks.length,
    },
  };
  const loreWrite = before.updatedAt
    ? firestorePatchDocument(projectId, LORE_DOCUMENT_PATH, token, loreData)
    : firestoreCreateDocument(projectId, LORE_DOCUMENT_PATH, token, loreData);

  await Promise.all([
    loreWrite,
    firestoreAddDocument(projectId, LORE_LOGS_COLLECTION, token, logEntry),
  ]);

  return {
    updatedAt,
    updatedBy: actor.uid,
    updatedByEmail: actor.email ?? "",
    summary,
    changes,
    details,
    stats: logEntry.stats,
    title: prepared.title,
    blocks: prepared.blocks,
  };
}

export async function listLoreLogs(limit = 40) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const documents = await firestoreListDocuments(projectId, LORE_LOGS_COLLECTION, token, limit);

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
