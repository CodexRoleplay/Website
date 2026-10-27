"use client";

import { useEffect, useMemo, useState } from "react";
import SortableList from "@/components/admin/SortableList";
import IconPicker from "@/components/admin/IconPicker";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { createCategory, createSection } from "@/lib/reglement/constants";
import { normalizeSectionContent } from "@/lib/reglement/content";
import { fetchReglement } from "@/lib/reglement/service";
import ContentBlocksEditor, { confirmDelete } from "@/components/admin/ContentBlocksEditor";
import styles from "./reglement-admin.module.css";


function formatLogDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ReglementAdminClient() {
  const { user, getIdToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastMeta, setLastMeta] = useState({ updatedAt: null, updatedByEmail: null });
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);
  const [structureCollapsed, setStructureCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchReglement()
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setCategories(payload.categories);
        setLastMeta({
          updatedAt: payload.updatedAt ?? null,
          updatedByEmail: payload.updatedByEmail ?? null,
        });
        setLoading(false);
        setActiveCategoryId((current) => current ?? payload.categories[0]?.id ?? null);
        setActiveSectionId((current) => {
          if (current) {
            return current;
          }

          return payload.categories[0]?.sections[0]?.id ?? null;
        });
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
  }, []);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  const activeSection = useMemo(
    () => activeCategory?.sections.find((section) => section.id === activeSectionId) ?? null,
    [activeCategory, activeSectionId],
  );

  const activeSectionContent = useMemo(
    () => (activeSection ? normalizeSectionContent(activeSection) : []),
    [activeSection],
  );

  function updateCategories(nextCategories) {
    setCategories(nextCategories);
  }

  function updateActiveCategory(partial) {
    updateCategories(
      categories.map((category) => (category.id === activeCategoryId ? { ...category, ...partial } : category)),
    );
  }

  function updateActiveSection(partial) {
    updateCategories(
      categories.map((category) => {
        if (category.id !== activeCategoryId) {
          return category;
        }

        return {
          ...category,
          sections: category.sections.map((section) =>
            section.id === activeSectionId ? { ...section, ...partial } : section,
          ),
        };
      }),
    );
  }

  function updateActiveSectionContent(content) {
    updateActiveSection({ content, rules: [], blocks: [] });
  }

  function selectCategory(categoryId) {
    const category = categories.find((item) => item.id === categoryId);
    setActiveCategoryId(categoryId);
    setActiveSectionId(category?.sections[0]?.id ?? null);
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

      const payload = categories.map((category) => ({
        ...category,
        sections: category.sections.map((section) => ({
          ...section,
          content: normalizeSectionContent(section),
          rules: [],
          blocks: [],
        })),
      }));

      const response = await fetch("/api/admin/reglement", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: payload }),
      });
      const result = await readApiJson(response);

      if (!response.ok) {
        throw new Error(result.error ?? "Enregistrement impossible.");
      }

      setMessage(
        result.summary
          ? `Règlement enregistré. ${result.summary}`
          : "Règlement enregistré. La page publique est mise à jour.",
      );

      setLastMeta({
        updatedAt: result.updatedAt ?? new Date().toISOString(),
        updatedByEmail: user?.email ?? null,
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.status}>Chargement du règlement…</p>;
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <strong>{categories.length} rubrique(s)</strong>
          <p className={styles.hint}>Glisse ⋮⋮ pour réordonner · Mélange règles et blocs dans l&apos;ordre que tu veux</p>
          {lastMeta.updatedAt ? (
            <p className={styles.metaLine}>
              Dernière modification : {formatLogDate(lastMeta.updatedAt)}
              {lastMeta.updatedByEmail ? ` · ${lastMeta.updatedByEmail}` : ""}
            </p>
          ) : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>
        <div className={styles.toolbarActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => {
              const category = createCategory();
              updateCategories([...categories, category]);
              selectCategory(category.id);
            }}
            type="button"
          >
            + Rubrique
          </button>
          <button className={styles.saveButton} disabled={saving} onClick={handleSave} type="button">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div
        className={[
          styles.layout,
          categoriesCollapsed ? styles.layoutCategoriesCollapsed : "",
          structureCollapsed ? styles.layoutStructureCollapsed : "",
        ].join(" ")}
      >
        {categoriesCollapsed ? (
          <aside className={styles.collapseRail}>
            <button
              aria-label="Afficher les rubriques"
              className={styles.railButton}
              onClick={() => setCategoriesCollapsed(false)}
              type="button"
            >
              <span>Rubriques</span>
            </button>
          </aside>
        ) : (
          <aside className={styles.sidebar}>
            <div className={styles.panelTitleRow}>
              <h2>Rubriques</h2>
              <button
                aria-label="Réduire les rubriques"
                className={styles.collapseButton}
                onClick={() => setCategoriesCollapsed(true)}
                type="button"
              >
                ‹
              </button>
            </div>
            <SortableList
              activeId={activeCategoryId}
              emptyLabel="Aucune rubrique"
              getLabel={(item) => item.title}
              items={categories}
              onReorder={updateCategories}
              onSelect={selectCategory}
            />
          </aside>
        )}

        {structureCollapsed ? (
          <aside className={styles.collapseRail}>
            <button
              aria-label="Afficher la rubrique et les sous-rubriques"
              className={styles.railButton}
              onClick={() => setStructureCollapsed(false)}
              type="button"
            >
              <span>Sous-rubriques</span>
            </button>
          </aside>
        ) : (
          <section className={styles.panel}>
            {!activeCategory ? (
              <p className={styles.status}>Sélectionnez ou créez une rubrique.</p>
          ) : (
            <>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleRow}>
                  <h2>Rubrique</h2>
                  <button
                    aria-label="Réduire la rubrique et les sous-rubriques"
                    className={styles.collapseButton}
                    onClick={() => setStructureCollapsed(true)}
                    type="button"
                  >
                    ‹
                  </button>
                </div>
                <button
                  className={styles.dangerButton}
                  onClick={() => {
                    if (!confirmDelete(activeCategory.title || "cette rubrique")) {
                      return;
                    }

                    const nextCategories = categories.filter((category) => category.id !== activeCategory.id);
                    updateCategories(nextCategories);
                    setActiveCategoryId(nextCategories[0]?.id ?? null);
                    setActiveSectionId(nextCategories[0]?.sections[0]?.id ?? null);
                  }}
                  type="button"
                >
                  Supprimer
                </button>
              </div>

              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>Titre</span>
                  <input
                    onChange={(event) => updateActiveCategory({ title: event.target.value })}
                    value={activeCategory.title}
                  />
                </label>
                <IconPicker
                  label="Icône"
                  onChange={(icon) => updateActiveCategory({ icon })}
                  value={activeCategory.icon}
                />
              </div>

              <label className={styles.field}>
                <span>Résumé</span>
                <textarea
                  onChange={(event) => updateActiveCategory({ summary: event.target.value })}
                  placeholder="Courte description affichée en haut de la rubrique…"
                  value={activeCategory.summary ?? ""}
                />
              </label>

              <div className={styles.sectionHeader}>
                <div>
                  <h3>Sous-rubriques</h3>
                  <p className={styles.hint}>Clique une section pour éditer son contenu à droite.</p>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    const section = createSection();
                    updateActiveCategory({ sections: [...activeCategory.sections, section] });
                    setActiveSectionId(section.id);
                  }}
                  type="button"
                >
                  + Section
                </button>
              </div>

              <SortableList
                activeId={activeSectionId}
                emptyLabel="Aucune sous-rubrique — ajoute une section"
                getLabel={(item) => item.title}
                items={activeCategory.sections}
                onReorder={(sections) => updateActiveCategory({ sections })}
                onSelect={setActiveSectionId}
              />
            </>
          )}
          </section>
        )}

        <section className={styles.panel}>
          {!activeSection ? (
            <div className={styles.statusBox}>
              <h2>Contenu</h2>
              <p>Sélectionne une sous-rubrique au centre pour modifier son texte ici.</p>
            </div>
          ) : (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Contenu — {activeSection.title}</h2>
                  <p className={styles.hint}>Ajoute des éléments dans l&apos;ordre souhaité : règle, texte, warning, etc.</p>
                </div>
                <button
                  className={styles.dangerButton}
                  onClick={() => {
                    if (!confirmDelete(activeSection.title || "cette sous-rubrique")) {
                      return;
                    }

                    const nextSections = activeCategory.sections.filter((section) => section.id !== activeSection.id);
                    updateActiveCategory({ sections: nextSections });
                    setActiveSectionId(nextSections[0]?.id ?? null);
                  }}
                  type="button"
                >
                  Supprimer
                </button>
              </div>

              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>Titre de la sous-rubrique</span>
                  <input
                    onChange={(event) => updateActiveSection({ title: event.target.value })}
                    value={activeSection.title}
                  />
                </label>
                <IconPicker
                  label="Icône"
                  onChange={(icon) => updateActiveSection({ icon })}
                  value={activeSection.icon}
                />
              </div>

              <ContentBlocksEditor content={activeSectionContent} onChange={updateActiveSectionContent} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
