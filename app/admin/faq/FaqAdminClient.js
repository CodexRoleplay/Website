"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import SortableList from "@/components/admin/SortableList";
import { useAuth } from "@/contexts/AuthContext";
import { readApiJson } from "@/lib/admin/read-api-json";
import { createFaqCategory, createFaqItem } from "@/lib/faq/constants";
import { normalizeFaqCategories } from "@/lib/faq/normalize";
import styles from "./faq-admin.module.css";

function confirmDelete(label) {
  return window.confirm(`Êtes-vous sûr de vouloir supprimer « ${label} » ?`);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function FaqAdminClient() {
  const { user, getIdToken, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const [lastMeta, setLastMeta] = useState({ updatedAt: null, updatedByEmail: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    getIdToken()
      .then((token) => {
        if (!token) throw new Error("Session expirée. Reconnecte-toi.");
        return fetch("/api/admin/faq", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      })
      .then(async (response) => {
        const payload = await readApiJson(response);
        if (!response.ok) throw new Error(payload.error ?? "Chargement de la FAQ impossible.");
        return payload;
      })
      .then((payload) => {
        if (cancelled) return;
        const next = normalizeFaqCategories(payload.categories);
        setCategories(next);
        setActiveCategoryId(next[0]?.id ?? null);
        setActiveItemId(next[0]?.items[0]?.id ?? null);
        setLastMeta({ updatedAt: payload.updatedAt ?? null, updatedByEmail: payload.updatedByEmail ?? null });
        setLoading(false);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [authLoading, getIdToken, user]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );
  const activeItem = useMemo(
    () => activeCategory?.items.find((item) => item.id === activeItemId) ?? null,
    [activeCategory, activeItemId],
  );
  const questionCount = categories.reduce((total, category) => total + category.items.length, 0);

  function updateActiveCategory(partial) {
    setCategories((current) => current.map((category) => (
      category.id === activeCategoryId ? { ...category, ...partial } : category
    )));
  }

  function updateActiveItem(partial) {
    setCategories((current) => current.map((category) => {
      if (category.id !== activeCategoryId) return category;
      return {
        ...category,
        items: category.items.map((item) => item.id === activeItemId ? { ...item, ...partial } : item),
      };
    }));
  }

  function selectCategory(categoryId) {
    const category = categories.find((entry) => entry.id === categoryId);
    setActiveCategoryId(categoryId);
    setActiveItemId(category?.items[0]?.id ?? null);
  }

  function addCategory() {
    const category = createFaqCategory();
    setCategories((current) => [...current, category]);
    setActiveCategoryId(category.id);
    setActiveItemId(category.items[0].id);
  }

  function addItem() {
    if (!activeCategory) return;
    const item = createFaqItem();
    updateActiveCategory({ items: [...activeCategory.items, item] });
    setActiveItemId(item.id);
  }

  function deleteCategory() {
    if (!activeCategory || !confirmDelete(activeCategory.title)) return;
    const next = categories.filter((category) => category.id !== activeCategory.id);
    setCategories(next);
    setActiveCategoryId(next[0]?.id ?? null);
    setActiveItemId(next[0]?.items[0]?.id ?? null);
  }

  function deleteItem() {
    if (!activeCategory || !activeItem || !confirmDelete(activeItem.question)) return;
    const nextItems = activeCategory.items.filter((item) => item.id !== activeItem.id);
    updateActiveCategory({ items: nextItems });
    setActiveItemId(nextItems[0]?.id ?? null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Session expirée. Reconnecte-toi.");
      const payload = normalizeFaqCategories(categories);
      const response = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ categories: payload }),
      });
      const result = await readApiJson(response);
      if (!response.ok) throw new Error(result.error ?? "Enregistrement impossible.");
      setCategories(payload);
      setLastMeta({ updatedAt: result.updatedAt ?? new Date().toISOString(), updatedByEmail: user?.email ?? null });
      setMessage(result.summary ? `FAQ enregistrée. ${result.summary}` : "FAQ enregistrée.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className={styles.status}>Chargement de la FAQ...</p>;

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <strong>{categories.length} catégorie(s) · {questionCount} question(s)</strong>
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
          <button className={styles.secondaryButton} onClick={addCategory} type="button">
            <Plus aria-hidden="true" size={16} /> Catégorie
          </button>
          <button className={styles.secondaryButton} disabled={!activeCategory} onClick={addItem} type="button">
            <Plus aria-hidden="true" size={16} /> Question
          </button>
          <button className={styles.saveButton} disabled={saving} onClick={handleSave} type="button">
            <Save aria-hidden="true" size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Catégories</h2>
            <button aria-label="Supprimer la catégorie" className={styles.dangerButton} disabled={!activeCategory} onClick={deleteCategory} title="Supprimer la catégorie" type="button">
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </div>
          <SortableList
            activeId={activeCategoryId}
            emptyLabel="Aucune catégorie"
            getLabel={(category) => category.title}
            items={categories}
            onReorder={setCategories}
            onSelect={selectCategory}
          />
        </aside>

        <section className={styles.panel}>
          {!activeCategory ? <p className={styles.status}>Sélectionne ou crée une catégorie.</p> : (
            <>
              <label className={styles.field}>
                <span>Titre de la catégorie</span>
                <input onChange={(event) => updateActiveCategory({ title: event.target.value })} value={activeCategory.title} />
              </label>
              <div className={styles.panelHeader}>
                <h2>Questions</h2>
                <button aria-label="Supprimer la question" className={styles.dangerButton} disabled={!activeItem} onClick={deleteItem} title="Supprimer la question" type="button">
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
              <SortableList
                activeId={activeItemId}
                emptyLabel="Aucune question"
                getLabel={(item) => item.question}
                items={activeCategory.items}
                onReorder={(items) => updateActiveCategory({ items })}
                onSelect={setActiveItemId}
              />
            </>
          )}
        </section>

        <section className={styles.panel}>
          {!activeItem ? (
            <div className={styles.statusBox}><h2>Contenu</h2><p>Sélectionne une question pour modifier sa réponse.</p></div>
          ) : (
            <>
              <div className={styles.panelHeader}><h2>Question et réponse</h2></div>
              <label className={styles.field}>
                <span>Question</span>
                <input onChange={(event) => updateActiveItem({ question: event.target.value })} value={activeItem.question} />
              </label>
              <label className={styles.field}>
                <span>Réponse</span>
                <textarea onChange={(event) => updateActiveItem({ answer: event.target.value })} value={activeItem.answer} />
              </label>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
