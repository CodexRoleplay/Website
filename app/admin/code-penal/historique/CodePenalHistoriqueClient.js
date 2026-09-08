"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCodePenalLogsClient } from "@/lib/code-penal/logs-service";
import HistoryTextDiff from "@/components/admin/HistoryTextDiff";
import { normalizeChangeDetails } from "@/lib/admin/text-diff";
import styles from "./historique.module.css";

function formatLogDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getVisibleChanges(log) {
  const changes = Array.isArray(log?.changes) ? log.changes : [];
  const summary = String(log?.summary ?? "").trim();

  if (changes.length === 1 && String(changes[0]).trim() === summary) {
    return [];
  }

  return changes;
}

export default function CodePenalHistoriqueClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLogId, setActiveLogId] = useState(null);
  const loadedRef = useRef(false);

  const loadLogs = useCallback(async (force = false) => {
    if (authLoading || !user) {
      return;
    }

    if (loadedRef.current && !force) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getIdToken();
      const entries = await fetchCodePenalLogsClient(token);
      setLogs(entries);
      loadedRef.current = true;
    } catch (loadError) {
      setError(loadError.message ?? "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, getIdToken, user]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const activeLog = useMemo(
    () => logs.find((log) => log.id === activeLogId) ?? logs[0] ?? null,
    [logs, activeLogId],
  );
  const visibleChanges = useMemo(() => getVisibleChanges(activeLog), [activeLog]);
  const visibleDetails = useMemo(() => normalizeChangeDetails(activeLog?.details), [activeLog]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <p className={styles.hint}>40 dernières modifications du code pénal.</p>
        <button className={styles.secondaryButton} disabled={loading} onClick={() => loadLogs(true)} type="button">
          {loading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.layout}>
        <aside className={styles.listPanel}>
          {loading && logs.length === 0 ? <p className={styles.status}>Chargement...</p> : null}

          {!loading && logs.length === 0 ? (
            <p className={styles.status}>Aucune modification enregistrée.</p>
          ) : (
            <ul className={styles.logList}>
              {logs.map((log) => {
                const isActive = activeLog?.id === log.id;

                return (
                  <li className={styles.logItem} key={log.id}>
                    <button
                      className={`${styles.logButton} ${isActive ? styles.logButtonActive : ""}`}
                      onClick={() => setActiveLogId(log.id)}
                      type="button"
                    >
                      <strong>{formatLogDate(log.createdAt)}</strong>
                      <span>{log.actorEmail || "Admin"}</span>
                      <p>{log.summary}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className={styles.detailPanel}>
          {!activeLog ? (
            <div className={styles.emptyState}>
              <h2>Historique</h2>
              <p>Sélectionne une entrée pour voir le détail des modifications.</p>
            </div>
          ) : (
            <>
              <header className={styles.detailHeader}>
                <h2>{formatLogDate(activeLog.createdAt)}</h2>
                <p>{activeLog.actorEmail || "Admin inconnu"}</p>
              </header>

              <p className={styles.summary}>{activeLog.summary}</p>

              {visibleChanges.length ? (
                <ul className={styles.changes}>
                  {visibleChanges.map((change, index) => (
                    <li key={`${activeLog.id}-${index}`}>{change}</li>
                  ))}
                </ul>
              ) : null}
              <HistoryTextDiff
                details={visibleDetails}
                emptyHint={
                  visibleDetails.length || /sans modification/i.test(activeLog.summary ?? "")
                    ? ""
                    : "Les extraits de texte n'ont pas été enregistrés pour cette entrée. Les prochaines sauvegardes afficheront les ajouts en vert et les suppressions en rouge."
                }
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
