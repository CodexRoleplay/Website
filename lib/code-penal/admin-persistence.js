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
  CODE_PENAL_DOC_PATH_REST,
  CODE_PENAL_LOGS_COLLECTION,
  createLosAngelesJurisdiction,
} from "@/lib/code-penal/constants";
import {
  auditCodePenalChanges,
  buildCodePenalChangeSummary,
  countCodePenalStats,
  prepareCodePenalPayload,
} from "@/lib/code-penal/diff";
import { getLosAngelesSections, normalizePenalJurisdictions } from "@/lib/code-penal/normalize";
import { normalizeChangeDetails, serializeChangeDetails } from "@/lib/admin/text-diff";

const MAX_LOGGED_CHANGES = 60;

export { prepareCodePenalPayload };

function mapCodePenalDocument(data = {}) {
  const jurisdictions = normalizePenalJurisdictions(data.jurisdictions, data.sections);

  return {
    jurisdictions,
    sections: getLosAngelesSections(jurisdictions),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    updatedByEmail: data.updatedByEmail ?? null,
  };
}

export async function getCodePenalDocument(accessToken) {
  const projectId = getProjectId();
  const token = accessToken ?? (await getAccessToken());
  const document = await firestoreGetDocument(projectId, CODE_PENAL_DOC_PATH_REST, token);

  if (!document) {
    return {
      jurisdictions: [],
      sections: [],
      updatedAt: null,
      updatedBy: null,
      updatedByEmail: null,
    };
  }

  return mapCodePenalDocument(firestoreDocumentToJs(document));
}

export async function saveCodePenalWithAudit({ jurisdictions, sections, actor }) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const before = await getCodePenalDocument(token);
  const previous = before.jurisdictions.length
    ? before.jurisdictions
    : normalizePenalJurisdictions(null, before.sections);
  const nextJurisdictions = Array.isArray(jurisdictions)
    ? prepareCodePenalPayload(jurisdictions, previous)
    : prepareCodePenalPayload(
        [
          {
            ...(previous[0] ?? createLosAngelesJurisdiction()),
            sections: Array.isArray(sections) ? sections : previous[0]?.sections ?? [],
          },
          ...previous.slice(1),
        ],
        previous,
      );

  const audit = auditCodePenalChanges(before.jurisdictions, nextJurisdictions);
  const changes = audit.changes.slice(0, MAX_LOGGED_CHANGES);
  const details = serializeChangeDetails(audit.details);
  const stats = countCodePenalStats(nextJurisdictions);
  const updatedAt = new Date().toISOString();
  const summary = buildCodePenalChangeSummary(changes);

  const codePenalData = {
    jurisdictions: nextJurisdictions,
    sections: getLosAngelesSections(nextJurisdictions),
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

  const codePenalWrite = before.updatedAt
    ? firestorePatchDocument(projectId, CODE_PENAL_DOC_PATH_REST, token, codePenalData)
    : firestoreCreateDocument(projectId, CODE_PENAL_DOC_PATH_REST, token, codePenalData);

  await Promise.all([
    codePenalWrite,
    firestoreAddDocument(projectId, CODE_PENAL_LOGS_COLLECTION, token, logEntry),
  ]);

  return {
    updatedAt,
    summary,
    changes,
    details,
    stats,
  };
}

export async function listCodePenalLogs(limit = 40) {
  const projectId = getProjectId();
  const token = await getAccessToken();
  const documents = await firestoreListDocuments(projectId, CODE_PENAL_LOGS_COLLECTION, token, limit);

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
