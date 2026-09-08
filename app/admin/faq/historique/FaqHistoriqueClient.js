"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFaqLogsClient } from "@/lib/faq/logs-service";
import HistoryTextDiff from "@/components/admin/HistoryTextDiff";
import { normalizeChangeDetails } from "@/lib/admin/text-diff";
import styles from "./historique.module.css";

function formatLogDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getVisibleChanges(log) {
  const changes = Array.isArray(log?.changes) ? log.changes : [];
  const summary = String(log?.summary ?? "").trim();
  return changes.length === 1 && String(changes[0]).trim() === summary ? [] : changes;
}

export default function FaqHistoriqueClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLogId, setActiveLogId] = useState(null);
  const loadedRef = useRef(false);

  const loadLogs = useCallback(async (force = false) => {
    if (authLoading || !user || (loadedRef.current && !force)) return;
    setLoading(true);
    setError("");

    try {
      const entries = await fetchFaqLogsClient(await getIdToken());
      setLogs(entries);
      loadedRef.current = true;
    } catch (loadError) {
      setError(loadError.message ?? "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, getIdToken, user]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const activeLog = useMemo(
    () => logs.find((log) => log.id === activeLogId) ?? logs[0] ?? null,
    [logs, activeLogId],
  );
  const visibleChanges = useMemo(() => getVisibleChanges(activeLog), [activeLog]);
  const visibleDetails = useMemo(() => normalizeChangeDetails(activeLog?.details), [activeLog]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <p className={styles.hint}>40 dernières modifications de la FAQ.</p>
        <button disabled={loading} onClick={() => loadLogs(true)} type="button">
          <RefreshCw aria-hidden="true" className={loading ? styles.spinning : ""} size={16} />
          {loading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.layout}>
        <aside className={styles.listPanel}>
          {loading && logs.length === 0 ? <p className={styles.status}>Chargement...</p> : null}
          {!loading && logs.length === 0 ? <p className={styles.status}>Aucune modification enregistrée.</p> : (
            <ul className={styles.logList}>
              {logs.map((log) => (
                <li className={styles.logItem} key={log.id}>
                  <button className={activeLog?.id === log.id ? styles.logButtonActive : ""} onClick={() => setActiveLogId(log.id)} type="button">
                    <strong>{formatLogDate(log.createdAt)}</strong>
                    <span>{log.actorEmail || "Admin"}</span>
                    <p>{log.summary}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={styles.detailPanel}>
          {!activeLog ? (
            <div className={styles.emptyState}><h2>Historique</h2><p>Sélectionne une entrée pour voir le détail.</p></div>
          ) : (
            <>
              <header className={styles.detailHeader}>
                <h2>{formatLogDate(activeLog.createdAt)}</h2>
                <p>{activeLog.actorEmail || "Admin inconnu"}</p>
              </header>
              <p className={styles.summary}>{activeLog.summary}</p>
              {visibleChanges.length ? (
                <ul className={styles.changes}>
                  {visibleChanges.map((change, index) => <li key={`${activeLog.id}-${index}`}>{change}</li>)}
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
