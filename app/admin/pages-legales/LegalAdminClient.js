"use client";

import { useEffect, useState } from "react";
import ContentBlocksEditor from "@/components/admin/ContentBlocksEditor";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { emptyLegalPages, LEGAL_PAGE_META } from "@/lib/legal/pages";
import shellStyles from "@/components/admin/admin.module.css";
import styles from "../reglement/reglement-admin.module.css";

const TABS = [
  { id: "mentions", label: "Mentions légales" },
  { id: "sales", label: "Conditions de vente" },
  { id: "privacy", label: "Confidentialité" },
];

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function LegalAdminClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [pages, setPages] = useState(emptyLegalPages);
  const [tab, setTab] = useState("mentions");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

        const response = await fetch("/api/admin/legal", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await readApiJson(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Chargement des pages légales impossible.");
        }

        if (!cancelled) {
          setPages({ ...emptyLegalPages(), ...(payload.pages ?? {}) });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
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

  function updatePage(key, partial) {
    setPages((current) => ({
      ...current,
      [key]: { ...current[key], ...partial },
    }));
    setMessage("");
  }

  async function savePage(key) {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const current = pages[key];
      const response = await fetch("/api/admin/legal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: key,
          title: current.title,
          blocks: current.blocks,
        }),
      });
      const payload = await readApiJson(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "Enregistrement impossible.");
      }

      setPages((currentPages) => ({
        ...currentPages,
        [key]: {
          title: payload.title,
          blocks: payload.blocks,
          updatedAt: payload.updatedAt,
          updatedBy: payload.updatedBy,
          updatedByEmail: payload.updatedByEmail,
        },
      }));
      setMessage("Page enregistrée. Le site public l’affiche au prochain chargement.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.status}>Chargement des pages légales…</p>;
  }

  const active = pages[tab] ?? emptyLegalPages()[tab];
  const updatedLabel = formatDate(active.updatedAt);

  return (
    <div className={styles.editor}>
      <header className={shellStyles.pageHeader}>
        <h1>Pages légales</h1>
        <p>Trois textes libres, comme le Lore. Tant qu’aucun bloc n’est enregistré, la page publique garde le texte déjà en ligne.</p>
      </header>

      <div className={styles.toolbar}>
        <div>
          <div className={styles.toolbarActions}>
            {TABS.map((item) => (
              <button
                className={tab === item.id ? styles.saveButton : ""}
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            Page publique : {LEGAL_PAGE_META[tab].path}. {active.blocks?.length ?? 0} bloc(s).
            {updatedLabel ? ` Dernière modification : ${updatedLabel}.` : " Pas encore enregistrée : le texte actuel reste affiché."}
          </p>
          {message ? <p className={styles.success}>{message}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.saveButton} disabled={saving} onClick={() => savePage(tab)} type="button">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <section className={`${styles.panel} ${styles.panelEditor}`}>
        <label className={styles.field}>
          <span>Titre de la page</span>
          <input onChange={(event) => updatePage(tab, { title: event.target.value })} value={active.title ?? ""} />
        </label>
        <ContentBlocksEditor
          content={active.blocks ?? []}
          description="Paragraphes, titres, listes et alertes. Le texte public reprend ces blocs dès qu’il y en a au moins un."
          emptyLabel="Aucun bloc — la page publique affiche encore le texte déjà en ligne."
          onChange={(blocks) => updatePage(tab, { blocks })}
          title={TABS.find((item) => item.id === tab)?.label}
        />
      </section>
    </div>
  );
}
