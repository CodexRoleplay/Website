"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import { subscribeFaq } from "@/lib/faq/service";
import styles from "./faq.module.css";

function matches(value, query) {
  return String(value ?? "").toLocaleLowerCase("fr").includes(query);
}

export default function FaqClient({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [query, setQuery] = useState("");
  const [openItems, setOpenItems] = useState(() => ({ [initialCategories[0]?.items[0]?.id]: true }));

  useEffect(() => subscribeFaq((payload) => setCategories(payload.categories)), []);

  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const filteredCategories = useMemo(
    () =>
      categories
        .map((category) => {
          const categoryMatches = matches(category.title, normalizedQuery);
          const items = categoryMatches || !normalizedQuery
            ? category.items
            : category.items.filter(
                (item) => matches(item.question, normalizedQuery) || matches(item.answer, normalizedQuery),
              );
          return { ...category, items };
        })
        .filter((category) => category.items.length),
    [categories, normalizedQuery],
  );
  const questionCount = categories.reduce((total, category) => total + category.items.length, 0);
  const visibleIds = filteredCategories.flatMap((category) => category.items.map((item) => item.id));

  useEffect(() => {
    if (normalizedQuery) {
      setOpenItems(Object.fromEntries(visibleIds.map((id) => [id, true])));
    }
  }, [normalizedQuery, visibleIds.join("|")]);

  function toggleItem(itemId) {
    setOpenItems((current) => ({ ...current, [itemId]: !current[itemId] }));
  }

  function setAll(open) {
    setOpenItems(Object.fromEntries(visibleIds.map((id) => [id, open])));
  }

  return (
    <main className={styles.shell}>
      <div className={styles.background} aria-hidden="true"><div /></div>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span aria-hidden="true" /> Centre d&apos;aide Codex RP</p>
          <h1>FAQ</h1>
          <p className={styles.heroDescription}>
            Retrouve rapidement les réponses essentielles pour rejoindre le serveur, utiliser FiveM et gérer tes achats.
          </p>
        </div>

        <div className={styles.controlDeck}>
          <label className={styles.search}>
            <span>Rechercher une réponse</span>
            <div className={styles.searchField}>
              <Search aria-hidden="true" size={20} strokeWidth={1.8} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="FiveM, connexion, boutique, Codyx..."
                type="search"
                value={query}
              />
            </div>
          </label>

          <div className={styles.summary}>
            <span><strong>{categories.length}</strong> catégories</span>
            <span><strong>{questionCount}</strong> réponses</span>
            <div className={styles.toolbar}>
              <button onClick={() => setAll(true)} type="button">
                <ChevronsUpDown aria-hidden="true" size={16} /> Tout ouvrir
              </button>
              <button onClick={() => setAll(false)} type="button">
                <ChevronsDownUp aria-hidden="true" size={16} /> Tout fermer
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqContent} aria-label="Questions fréquentes">
        {filteredCategories.length ? (
          filteredCategories.map((category, categoryIndex) => (
            <section className={styles.category} key={category.id}>
              <header className={styles.categoryHeader}>
                <span>{String(categoryIndex + 1).padStart(2, "0")}</span>
                <div>
                  <p>Catégorie</p>
                  <h2>{category.title}</h2>
                </div>
                <strong>{category.items.length} question(s)</strong>
              </header>

              <div className={styles.questionList}>
                {category.items.map((item) => {
                  const isOpen = Boolean(openItems[item.id]);
                  const answerId = `faq-answer-${item.id}`;

                  return (
                    <article className={`${styles.question} ${isOpen ? styles.questionOpen : ""}`} key={item.id}>
                      <button
                        aria-controls={answerId}
                        aria-expanded={isOpen}
                        onClick={() => toggleItem(item.id)}
                        type="button"
                      >
                        <span>{item.question}</span>
                        <ChevronDown aria-hidden="true" size={20} />
                      </button>
                      <div className={styles.answer} hidden={!isOpen} id={answerId}>
                        <p>{item.answer}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className={styles.emptyState}>
            <Search aria-hidden="true" size={24} />
            <h2>Aucune réponse trouvée</h2>
            <p>Essaie avec un terme plus court ou une autre formulation.</p>
          </div>
        )}
      </section>
    </main>
  );
}
