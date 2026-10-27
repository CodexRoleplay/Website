"use client";

import { useEffect, useState } from "react";
import ContentBlocksEditor from "@/components/admin/ContentBlocksEditor";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { DEFAULT_LORE_TITLE } from "@/lib/lore/constants";
import { formatLoreUpdatedAt } from "@/lib/lore/format";
import styles from "../reglement/reglement-admin.module.css";

export default function LoreAdminClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [title, setTitle] = useState(DEFAULT_LORE_TITLE);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastMeta, setLastMeta] = useState({ updatedAt: null, updatedByEmail: null });

  useEffect(() => {
    if (authLoading || !user) {
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const token = await getIdToken();

        if (!token) {
          throw new Error("Session expirée. Reconnecte-toi.");
        }

        const response = await fetch("/api/admin/lore", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await readApiJson(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Chargement impossible.");
        }

        if (cancelled) {
          return;
        }

        setTitle(payload.title || DEFAULT_LORE_TITLE);
        setBlocks(Array.isArray(payload.blocks) ? payload.blocks : []);
        setLastMeta({
          updatedAt: payload.updatedAt ?? null,
          updatedByEmail: payload.updatedByEmail ?? null,
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message ?? "Chargement impossible.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, getIdToken, user]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const response = await fetch("/api/admin/lore", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, blocks }),
      });
      const result = await readApiJson(response);

      if (!response.ok) {
        throw new Error(result.error ?? "Enregistrement impossible.");
      }

      setTitle(result.title || title);
      setBlocks(Array.isArray(result.blocks) ? result.blocks : blocks);
      setLastMeta({
        updatedAt: result.updatedAt ?? new Date().toISOString(),
        updatedByEmail: result.updatedByEmail ?? user?.email ?? null,
      });
      setMessage(result.summary ? `Lore enregistré. ${result.summary}` : "Lore enregistré. La page publique est mise à jour.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.status}>Chargement du lore…</p>;
  }

  const updatedLabel = formatLoreUpdatedAt(lastMeta.updatedAt);

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <strong>{blocks.length} bloc(s)</strong>
          <p className={styles.hint}>Glisse ⋮⋮ pour réordonner. Un retour à la ligne dans un texte reste un retour à la ligne en public.</p>
          {updatedLabel ? (
            <p className={styles.metaLine}>
              Dernière modification : {updatedLabel}
              {lastMeta.updatedByEmail ? ` · ${lastMeta.updatedByEmail}` : ""}
            </p>
          ) : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.saveButton} disabled={saving} onClick={handleSave} type="button">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <section className={styles.panel}>
        <label className={styles.field}>
          <span>Titre de la page</span>
          <input onChange={(event) => setTitle(event.target.value)} value={title} />
        </label>

        <ContentBlocksEditor
          content={blocks}
          description="Paragraphes, alertes, listes et citations, dans l'ordre du récit. Les sauts de ligne saisis ici sont conservés."
          emptyLabel="Aucun récit pour le moment — ajoute un bloc ci-dessus."
          onChange={setBlocks}
          title="Récit en cours"
        />
      </section>
    </div>
  );
}
