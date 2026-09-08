"use client";

import { useEffect, useMemo, useState } from "react";
import SortableList from "@/components/admin/SortableList";
import IconPicker from "@/components/admin/IconPicker";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import {
  ALERT_VARIANTS,
  CARD_VARIANTS,
  createCategory,
  createSection,
} from "@/lib/reglement/constants";
import {
  CONTENT_TYPE_OPTIONS,
  createContentItem,
  getContentTypeLabel,
  normalizeSectionContent,
} from "@/lib/reglement/content";
import { fetchReglement } from "@/lib/reglement/service";
import styles from "./reglement-admin.module.css";

function reorderItems(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex === null || toIndex === null) {
    return items;
  }

  const copy = [...items];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

function confirmDelete(label) {
  return window.confirm(`Etes-vous sur de vouloir supprimer "${label}" ?`);
}

function getContentItemDeleteLabel(item) {
  if (item?.type === "rule") {
    return item.title?.trim() || "cette regle";
  }

  if (item?.type === "alert") {
    return item.title?.trim() || "cette alerte";
  }

  if (item?.type === "heading" || item?.type === "text" || item?.type === "quote") {
    return item.text?.trim().slice(0, 60) || "ce bloc de texte";
  }

  return getContentTypeLabel(item?.type) || "ce bloc";
}

function ContentItemEditor({ item, dragProps, onChange, onDelete }) {
  function update(partial) {
    onChange({ ...item, ...partial });
  }

  return (
    <article className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <div className={styles.contentCardHeaderLeft}>
          {dragProps ? (
            <button
              aria-label="Déplacer l'élément"
              className={styles.blockHandle}
              draggable
              onDragEnd={dragProps.onDragEnd}
              onDragStart={(event) => dragProps.onDragStart(event, dragProps.index)}
              type="button"
            >
              ⋮⋮
            </button>
          ) : null}
          <span className={styles.blockType}>{getContentTypeLabel(item.type)}</span>
        </div>
        <button className={styles.dangerButton} onClick={onDelete} type="button">
          Supprimer
        </button>
      </div>

      {item.type === "rule" ? (
        <>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>Titre</span>
              <input onChange={(event) => update({ title: event.target.value })} value={item.title ?? ""} />
            </label>
            <IconPicker label="Icône" onChange={(icon) => update({ icon })} value={item.icon ?? "FileText"} />
          </div>
          <label className={styles.field}>
            <span>Texte / description</span>
            <textarea
              onChange={(event) => update({ description: event.target.value })}
              placeholder="Explique la règle ici…"
              value={item.description ?? ""}
            />
          </label>
        </>
      ) : null}

      {item.type === "heading" || item.type === "text" || item.type === "quote" ? (
        <label className={styles.field}>
          <span>Texte</span>
          <textarea onChange={(event) => update({ text: event.target.value })} value={item.text ?? ""} />
        </label>
      ) : null}

      {item.type === "alert" ? (
        <>
          <label className={styles.field}>
            <span>Style</span>
            <select onChange={(event) => update({ variant: event.target.value })} value={item.variant ?? "warning"}>
              {ALERT_VARIANTS.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Titre</span>
            <input onChange={(event) => update({ title: event.target.value })} value={item.title ?? ""} />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea onChange={(event) => update({ text: event.target.value })} value={item.text ?? ""} />
          </label>
        </>
      ) : null}

      {item.type === "list" ? (
        <div className={styles.nestedList}>
          {(item.items ?? []).map((entry, index) => (
            <div className={styles.nestedItem} key={`${entry.label}-${index}`}>
              <label className={styles.field}>
                <span>Label</span>
                <input
                  onChange={(event) => {
                    const items = [...(item.items ?? [])];
                    items[index] = { ...items[index], label: event.target.value };
                    update({ items });
                  }}
                  value={entry.label ?? ""}
                />
              </label>
              <label className={styles.field}>
                <span>Texte</span>
                <textarea
                  onChange={(event) => {
                    const items = [...(item.items ?? [])];
                    items[index] = { ...items[index], text: event.target.value };
                    update({ items });
                  }}
                  value={entry.text ?? ""}
                />
              </label>
              <button
                className={styles.dangerButton}
                onClick={() => {
                  const label = entry.label?.trim() || entry.text?.trim() || `point ${index + 1}`;

                  if (confirmDelete(label)) {
                    update({ items: (item.items ?? []).filter((_, itemIndex) => itemIndex !== index) });
                  }
                }}
                type="button"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            className={styles.secondaryButton}
            onClick={() => update({ items: [...(item.items ?? []), { label: "Point", text: "Description" }] })}
            type="button"
          >
            Ajouter un point
          </button>
        </div>
      ) : null}

      {item.type === "cards" ? (
        <div className={styles.nestedList}>
          {(item.cards ?? []).map((card, index) => (
            <div className={styles.nestedItem} key={`${card.title}-${index}`}>
              <label className={styles.field}>
                <span>Style</span>
                <select
                  onChange={(event) => {
                    const cards = [...(item.cards ?? [])];
                    cards[index] = { ...cards[index], variant: event.target.value };
                    update({ cards });
                  }}
                  value={card.variant ?? "info"}
                >
                  {CARD_VARIANTS.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Titre</span>
                <input
                  onChange={(event) => {
                    const cards = [...(item.cards ?? [])];
                    cards[index] = { ...cards[index], title: event.target.value };
                    update({ cards });
                  }}
                  value={card.title ?? ""}
                />
              </label>
              <label className={styles.field}>
                <span>Points (un par ligne)</span>
                <textarea
                  onChange={(event) => {
                    const cards = [...(item.cards ?? [])];
                    cards[index] = {
                      ...cards[index],
                      items: event.target.value.split("\n").filter(Boolean),
                    };
                    update({ cards });
                  }}
                  value={(card.items ?? []).join("\n")}
                />
              </label>
              <button
                className={styles.dangerButton}
                onClick={() => {
                  const label = card.title?.trim() || `carte ${index + 1}`;

                  if (confirmDelete(label)) {
                    update({ cards: (item.cards ?? []).filter((_, cardIndex) => cardIndex !== index) });
                  }
                }}
                type="button"
              >
                Retirer la carte
              </button>
            </div>
          ))}
          <button
            className={styles.secondaryButton}
            onClick={() =>
              update({
                cards: [...(item.cards ?? []), { variant: "info", title: "Nouvelle carte", items: ["Point"] }],
              })
            }
            type="button"
          >
            Ajouter une carte
          </button>
        </div>
      ) : null}
    </article>
  );
}

function SectionContentEditor({ content, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);

  function updateItem(index, nextItem) {
    onChange(content.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
  }

  return (
    <div className={styles.contentSection}>
      <div className={styles.sectionIntro}>
        <h3>Contenu de la sous-rubrique</h3>
        <p>Mélange librement règles, paragraphes, warnings… Glisse ⋮⋮ pour réordonner.</p>
      </div>

      <div className={styles.blockToolbar}>
        {CONTENT_TYPE_OPTIONS.map((option) => (
          <button key={option.id} onClick={() => onChange([...content, createContentItem(option.id)])} type="button">
            + {option.label}
          </button>
        ))}
      </div>

      <div className={styles.contentList}>
        {content.length === 0 ? (
          <p className={styles.status}>Aucun contenu — ajoute une règle ou un bloc ci-dessus.</p>
        ) : null}

        {content.map((item, index) => (
          <div
            key={item.id}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              onChange(reorderItems(content, dragIndex, index));
              setDragIndex(null);
            }}
          >
            <ContentItemEditor
              dragProps={{
                index,
                onDragEnd: () => setDragIndex(null),
                onDragStart: (_event, itemIndex) => setDragIndex(itemIndex),
              }}
              item={item}
              onChange={(nextItem) => updateItem(index, nextItem)}
              onDelete={() => {
                if (confirmDelete(getContentItemDeleteLabel(item))) {
                  onChange(content.filter((_, itemIndex) => itemIndex !== index));
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

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

              <SectionContentEditor content={activeSectionContent} onChange={updateActiveSectionContent} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
