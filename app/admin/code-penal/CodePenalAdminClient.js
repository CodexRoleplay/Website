"use client";

import { useEffect, useMemo, useState } from "react";
import SortableList from "@/components/admin/SortableList";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import {
  CODE_PENAL_MAX_JURISDICTIONS,
  createPenalArticle,
  createPenalJurisdiction,
  createPenalSection,
  PENAL_LEVEL_OPTIONS,
} from "@/lib/code-penal/constants";
import { normalizePenalJurisdictions } from "@/lib/code-penal/normalize";
import styles from "./code-penal-admin.module.css";

function confirmDelete(label) {
  return window.confirm(`Etes-vous sur de vouloir supprimer "${label}" ?`);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CodePenalAdminClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [jurisdictions, setJurisdictions] = useState([]);
  const [activeJurisdictionId, setActiveJurisdictionId] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [lastMeta, setLastMeta] = useState({ updatedAt: null, updatedByEmail: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    getIdToken()
      .then((token) => {
        if (!token) {
          throw new Error("Session expirée. Reconnecte-toi.");
        }

        return fetch("/api/admin/code-penal", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then(async (response) => {
        const payload = await readApiJson(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Chargement du code pénal impossible.");
        }

        return payload;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const nextJurisdictions = normalizePenalJurisdictions(payload.jurisdictions, payload.sections);
        const firstJurisdiction = nextJurisdictions[0];

        setJurisdictions(nextJurisdictions);
        setLastMeta({
          updatedAt: payload.updatedAt ?? null,
          updatedByEmail: payload.updatedByEmail ?? null,
        });
        setActiveJurisdictionId((current) => current ?? firstJurisdiction?.id ?? null);
        setActiveSectionId((current) => current ?? firstJurisdiction?.sections[0]?.id ?? null);
        setActiveArticleId((current) => current ?? firstJurisdiction?.sections[0]?.articles[0]?.id ?? null);
        setLoading(false);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, getIdToken, user]);

  const activeJurisdiction = useMemo(
    () => jurisdictions.find((jurisdiction) => jurisdiction.id === activeJurisdictionId) ?? null,
    [jurisdictions, activeJurisdictionId],
  );
  const sections = activeJurisdiction?.sections ?? [];
  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );
  const activeArticle = useMemo(
    () => activeSection?.articles.find((article) => article.id === activeArticleId) ?? null,
    [activeSection, activeArticleId],
  );
  const sectionCount = jurisdictions.reduce((total, jurisdiction) => total + jurisdiction.sections.length, 0);
  const articleCount = jurisdictions.reduce(
    (total, jurisdiction) =>
      total + jurisdiction.sections.reduce((sectionTotal, section) => sectionTotal + section.articles.length, 0),
    0,
  );
  const canAddJurisdiction = jurisdictions.length < CODE_PENAL_MAX_JURISDICTIONS;

  function selectJurisdiction(jurisdictionId) {
    const nextJurisdiction = jurisdictions.find((jurisdiction) => jurisdiction.id === jurisdictionId);
    setActiveJurisdictionId(jurisdictionId);
    setActiveSectionId(nextJurisdiction?.sections[0]?.id ?? null);
    setActiveArticleId(nextJurisdiction?.sections[0]?.articles[0]?.id ?? null);
  }

  function updateJurisdictions(nextJurisdictions) {
    setJurisdictions(nextJurisdictions);
  }

  function updateActiveJurisdiction(partial) {
    updateJurisdictions(
      jurisdictions.map((jurisdiction) =>
        jurisdiction.id === activeJurisdictionId ? { ...jurisdiction, ...partial } : jurisdiction,
      ),
    );
  }

  function updateSections(nextSections) {
    updateActiveJurisdiction({ sections: nextSections });
  }

  function updateActiveSection(partial) {
    updateSections(
      sections.map((section) => (section.id === activeSectionId ? { ...section, ...partial } : section)),
    );
  }

  function updateActiveArticle(partial) {
    updateSections(
      sections.map((section) => {
        if (section.id !== activeSectionId) {
          return section;
        }

        return {
          ...section,
          articles: section.articles.map((article) =>
            article.id === activeArticleId ? { ...article, ...partial } : article,
          ),
        };
      }),
    );
  }

  function selectSection(sectionId) {
    const nextSection = sections.find((section) => section.id === sectionId);
    setActiveSectionId(sectionId);
    setActiveArticleId(nextSection?.articles[0]?.id ?? null);
  }

  function addJurisdiction() {
    if (!canAddJurisdiction) {
      return;
    }

    const jurisdiction = createPenalJurisdiction();
    updateJurisdictions([...jurisdictions, jurisdiction]);
    setActiveJurisdictionId(jurisdiction.id);
    setActiveSectionId(null);
    setActiveArticleId(null);
  }

  function deleteJurisdiction() {
    if (!activeJurisdiction || activeJurisdiction.locked) {
      return;
    }

    if (!confirmDelete(activeJurisdiction.title)) {
      return;
    }

    const nextJurisdictions = jurisdictions.filter((jurisdiction) => jurisdiction.id !== activeJurisdiction.id);
    updateJurisdictions(nextJurisdictions);
    const nextActive = nextJurisdictions[0];
    setActiveJurisdictionId(nextActive?.id ?? null);
    setActiveSectionId(nextActive?.sections[0]?.id ?? null);
    setActiveArticleId(nextActive?.sections[0]?.articles[0]?.id ?? null);
  }

  function addSection() {
    const section = createPenalSection();
    updateSections([...sections, section]);
    setActiveSectionId(section.id);
    setActiveArticleId(section.articles[0]?.id ?? null);
  }

  function addArticle() {
    if (!activeSection) {
      return;
    }

    const article = createPenalArticle();
    updateActiveSection({ articles: [...activeSection.articles, article] });
    setActiveArticleId(article.id);
  }

  function deleteSection() {
    if (!activeSection || !confirmDelete(activeSection.title)) {
      return;
    }

    const nextSections = sections.filter((section) => section.id !== activeSection.id);
    updateSections(nextSections);
    setActiveSectionId(nextSections[0]?.id ?? null);
    setActiveArticleId(nextSections[0]?.articles[0]?.id ?? null);
  }

  function deleteArticle() {
    if (!activeSection || !activeArticle || !confirmDelete(`${activeArticle.article} - ${activeArticle.name}`)) {
      return;
    }

    const nextArticles = activeSection.articles.filter((article) => article.id !== activeArticle.id);
    updateActiveSection({ articles: nextArticles });
    setActiveArticleId(nextArticles[0]?.id ?? null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const payload = normalizePenalJurisdictions(jurisdictions);
      const response = await fetch("/api/admin/code-penal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jurisdictions: payload }),
      });
      const result = await readApiJson(response);

      if (!response.ok) {
        throw new Error(result.error ?? "Enregistrement impossible.");
      }

      setJurisdictions(payload);
      setLastMeta({
        updatedAt: result.updatedAt ?? new Date().toISOString(),
        updatedByEmail: user?.email ?? null,
      });
      setMessage(result.summary ? `Code pénal enregistré. ${result.summary}` : "Code pénal enregistré.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.status}>Chargement du code pénal...</p>;
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <strong>
            {jurisdictions.length} juridiction(s) · {sectionCount} section(s) · {articleCount} article(s)
          </strong>
          <p className={styles.hint}>
            Los Angeles est le corpus de base et ne peut pas être supprimé. Ajoute les autres territoires avec « +
            Juridiction » : chacun a sa propre numérotation d&apos;articles.
          </p>
          {lastMeta.updatedAt ? (
            <p className={styles.metaLine}>
              Dernière modification : {formatDate(lastMeta.updatedAt)}
              {lastMeta.updatedByEmail ? ` · ${lastMeta.updatedByEmail}` : ""}
            </p>
          ) : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.secondaryButton} disabled={!canAddJurisdiction} onClick={addJurisdiction} type="button">
            + Juridiction
          </button>
          <button className={styles.secondaryButton} onClick={addSection} type="button">
            + Section
          </button>
          <button className={styles.secondaryButton} disabled={!activeSection} onClick={addArticle} type="button">
            + Article
          </button>
          <button className={styles.saveButton} disabled={saving} onClick={handleSave} type="button">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className={styles.jurisdictionBar} role="tablist" aria-label="Juridictions du code pénal">
        {jurisdictions.map((jurisdiction) => {
          const isActive = jurisdiction.id === activeJurisdictionId;

          return (
            <button
              aria-selected={isActive}
              className={`${styles.jurisdictionTab} ${isActive ? styles.jurisdictionTabActive : ""}`}
              key={jurisdiction.id}
              onClick={() => selectJurisdiction(jurisdiction.id)}
              role="tab"
              type="button"
            >
              <span>{jurisdiction.title || "Sans titre"}</span>
              {jurisdiction.locked ? <small>Base</small> : <small>{jurisdiction.sections.length} section(s)</small>}
            </button>
          );
        })}
      </div>

      {activeJurisdiction ? (
        <div className={styles.jurisdictionMeta}>
          <label className={styles.field}>
            <span>Nom de la juridiction</span>
            <input
              onChange={(event) => updateActiveJurisdiction({ title: event.target.value })}
              value={activeJurisdiction.title}
            />
          </label>
          <label className={styles.field}>
            <span>Résumé</span>
            <input
              onChange={(event) => updateActiveJurisdiction({ summary: event.target.value })}
              placeholder="Territoire, compétence, particularités…"
              value={activeJurisdiction.summary}
            />
          </label>
          <button
            className={styles.dangerButton}
            disabled={activeJurisdiction.locked}
            onClick={deleteJurisdiction}
            title={activeJurisdiction.locked ? "Los Angeles ne peut pas être supprimé." : "Supprimer cette juridiction"}
            type="button"
          >
            Supprimer
          </button>
        </div>
      ) : null}

      <div className={styles.layout}>
        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Sections</h2>
            <button className={styles.dangerButton} disabled={!activeSection} onClick={deleteSection} type="button">
              Supprimer
            </button>
          </div>
          <SortableList
            activeId={activeSectionId}
            emptyLabel="Aucune section dans cette juridiction"
            getLabel={(section) => section.title}
            items={sections}
            onReorder={updateSections}
            onSelect={selectSection}
          />
        </aside>

        <section className={styles.panel}>
          {!activeSection ? (
            <p className={styles.status}>Sélectionne ou crée une section dans cette juridiction.</p>
          ) : (
            <>
              <div className={styles.panelHeader}>
                <h2>Section</h2>
              </div>
              <label className={styles.field}>
                <span>Titre</span>
                <input
                  onChange={(event) => updateActiveSection({ title: event.target.value })}
                  value={activeSection.title}
                />
              </label>
              <label className={styles.field}>
                <span>Notes / définitions</span>
                <textarea
                  onChange={(event) =>
                    updateActiveSection({
                      notes: event.target.value
                        .split("\n\n")
                        .map((note) => note.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Une note par paragraphe séparé par une ligne vide."
                  value={(activeSection.notes ?? []).join("\n\n")}
                />
              </label>

              <div className={styles.panelHeader}>
                <h2>Articles</h2>
                <button className={styles.dangerButton} disabled={!activeArticle} onClick={deleteArticle} type="button">
                  Supprimer
                </button>
              </div>
              <SortableList
                activeId={activeArticleId}
                emptyLabel="Aucun article"
                getLabel={(article) => `${article.article} · ${article.name}`}
                items={activeSection.articles}
                onReorder={(articles) => updateActiveSection({ articles })}
                onSelect={setActiveArticleId}
              />
            </>
          )}
        </section>

        <section className={styles.panel}>
          {!activeArticle ? (
            <div className={styles.statusBox}>
              <h2>Article</h2>
              <p>Sélectionne un article pour modifier son contenu.</p>
            </div>
          ) : (
            <>
              <div className={styles.panelHeader}>
                <h2>Article {activeArticle.article || "sans numéro"}</h2>
              </div>

              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>Article</span>
                  <input
                    onChange={(event) => updateActiveArticle({ article: event.target.value })}
                    value={activeArticle.article}
                  />
                </label>
                <label className={styles.field}>
                  <span>Niveau</span>
                  <select
                    onChange={(event) => updateActiveArticle({ level: event.target.value })}
                    value={activeArticle.level}
                  >
                    {PENAL_LEVEL_OPTIONS.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Infraction / droit</span>
                <input
                  onChange={(event) => updateActiveArticle({ name: event.target.value })}
                  value={activeArticle.name}
                />
              </label>

              <label className={styles.field}>
                <span>Description</span>
                <textarea
                  onChange={(event) => updateActiveArticle({ description: event.target.value })}
                  value={activeArticle.description}
                />
              </label>

              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>Amende</span>
                  <input
                    onChange={(event) => updateActiveArticle({ fine: event.target.value })}
                    value={activeArticle.fine}
                  />
                </label>
                <label className={styles.field}>
                  <span>Peine</span>
                  <input
                    onChange={(event) => updateActiveArticle({ penalty: event.target.value })}
                    value={activeArticle.penalty}
                  />
                </label>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
