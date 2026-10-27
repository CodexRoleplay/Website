"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ContentBlocks from "@/components/reglement/ContentBlocks";
import RuleIcon from "@/components/reglement/RuleIcon";
import { normalizeSectionContent } from "@/lib/reglement/content";
import { filterReglementCategories, findSearchRanges } from "@/lib/reglement/search";
import { subscribeReglement } from "@/lib/reglement/service";
import styles from "./reglement.module.css";
import blockStyles from "@/components/reglement/ContentBlocks.module.css";

function SearchHighlight({ text, query }) {
  const source = String(text ?? "");
  const ranges = findSearchRanges(source, query);

  if (!ranges.length) {
    return source;
  }

  const nodes = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) {
      nodes.push(source.slice(cursor, start));
    }

    nodes.push(
      <mark className={styles.match} key={`${start}-${end}`}>
        {source.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }

  if (cursor < source.length) {
    nodes.push(source.slice(cursor));
  }

  return nodes;
}

export default function ReglementClient({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [query, setQuery] = useState("");
  const [collapsedWhileSearching, setCollapsedWhileSearching] = useState({});
  const heroRef = useRef(null);
  const normalizedQuery = query.trim();
  const isSearching = normalizedQuery.length > 0;

  useEffect(() => {
    return subscribeReglement((payload) => {
      setCategories(payload.categories);
    });
  }, []);

  useEffect(() => {
    setCollapsedWhileSearching({});
  }, [normalizedQuery]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  const searchResults = useMemo(
    () => (isSearching ? filterReglementCategories(categories, normalizedQuery) : null),
    [categories, isSearching, normalizedQuery],
  );

  const displayedCategory = useMemo(() => {
    if (!activeCategory) {
      return null;
    }

    if (!searchResults) {
      return activeCategory;
    }

    return searchResults.find((category) => category.id === activeCategory.id) ?? null;
  }, [activeCategory, searchResults]);

  const sidebarCategories = searchResults ?? categories;

  function selectCategory(categoryId) {
    const nextCategory = categories.find((category) => category.id === categoryId);

    setActiveCategoryId(categoryId);
    setOpenSections((current) => {
      const sections = nextCategory?.sections ?? [];

      if (sections.length === 0) {
        return current;
      }

      const next = { ...current };

      for (const section of sections) {
        next[section.id] = true;
      }

      return next;
    });
    scrollToHero();
  }

  function scrollToHero() {
    requestAnimationFrame(() => {
      const rect = heroRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      window.scrollTo({
        top: window.scrollY + rect.top - 150,
        behavior: "auto",
      });
    });
  }

  function resetToIndex() {
    setActiveCategoryId(null);
    setOpenSections({});
    scrollToHero();
  }

  function toggleSection(sectionId) {
    if (isSearching) {
      setCollapsedWhileSearching((current) => ({
        ...current,
        [sectionId]: !current[sectionId],
      }));
      return;
    }

    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  function renderSection(section, expanded) {
    const isOpen = expanded ? !collapsedWhileSearching[section.id] : Boolean(openSections[section.id]);
    const sectionContent = normalizeSectionContent(section);

    return (
      <article className={`${styles.sectionPanel} ${isOpen ? styles.sectionPanelOpen : ""}`} key={section.id}>
        <button
          aria-expanded={isOpen}
          className={styles.sectionButton}
          onClick={() => toggleSection(section.id)}
          type="button"
        >
          <span className={styles.sectionIcon}>
            <RuleIcon name={section.icon} />
          </span>
          <span>{expanded ? <SearchHighlight text={section.title} query={normalizedQuery} /> : section.title}</span>
          <span className={styles.chevron} aria-hidden="true" />
        </button>

        {isOpen ? (
          <div className={styles.ruleList}>
            {sectionContent.length > 0 ? (
              <ContentBlocks
                blocks={sectionContent}
                prose
                ruleStyles={{
                  ruleItem: blockStyles.ruleItem,
                  ruleIcon: blockStyles.ruleIcon,
                  ruleBody: blockStyles.ruleBody,
                }}
              />
            ) : (
              <p className={styles.emptySection}>Aucun contenu pour cette section.</p>
            )}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <section className={styles.ruleShell}>
      <div className={styles.background} aria-hidden="true">
        <div />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Catégories du règlement">
          {sidebarCategories.map((category) => (
            <button
              className={`${styles.sideLink} ${category.id === activeCategoryId ? styles.sideLinkActive : ""}`}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              type="button"
            >
              {isSearching ? <SearchHighlight text={category.title} query={normalizedQuery} /> : category.title}
            </button>
          ))}
        </aside>

        <main className={styles.content}>
          <header className={styles.hero} ref={heroRef}>
            <p className={styles.breadcrumb}>
              {activeCategory ? (
                <button className={styles.breadcrumbButton} onClick={resetToIndex} type="button">
                  Règlement
                </button>
              ) : (
                <span>Règlement</span>
              )}
              {activeCategory ? <span>{activeCategory.title}</span> : null}
            </p>
            <h1>{activeCategory?.title ?? "Règlement"}</h1>
            {activeCategory ? <p>{activeCategory.summary}</p> : null}
          </header>

          <form className={styles.search} role="search" onSubmit={(event) => event.preventDefault()}>
            <label className={styles.searchField}>
              <span className={styles.srOnly}>Rechercher une règle</span>
              <RuleIcon name="search" size={18} />
              <input
                aria-label="Rechercher une règle"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une règle…"
                type="search"
                value={query}
              />
              {query ? (
                <button className={styles.searchClear} onClick={() => setQuery("")} type="button">
                  Effacer
                </button>
              ) : null}
            </label>
          </form>

          {isSearching && (!searchResults.length || (activeCategory && !displayedCategory)) ? (
            <p className={styles.emptyResults} role="status">
              Aucune règle ne correspond à cette recherche.
            </p>
          ) : isSearching && !activeCategory ? (
            <div className={styles.searchResults}>
              {searchResults.map((category) => (
                <section className={styles.searchGroup} key={category.id}>
                  <h2 className={styles.searchGroupTitle}>
                    <SearchHighlight text={category.title} query={normalizedQuery} />
                  </h2>
                  {category.sections.length ? (
                    <div className={styles.accordionList}>
                      {category.sections.map((section) => renderSection(section, true))}
                    </div>
                  ) : (
                    <p className={styles.emptySection}>Aucun contenu pour cette section.</p>
                  )}
                </section>
              ))}
            </div>
          ) : !activeCategory ? (
            <div className={styles.categoryGrid} aria-label="Toutes les catégories">
              {categories.map((category) => (
                <button
                  className={styles.categoryCard}
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  type="button"
                >
                  <span className={styles.categoryCardIcon}>
                    <RuleIcon name={category.icon} size={32} strokeWidth={1.25} />
                  </span>
                  <span>{category.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.accordionList}>
              {(displayedCategory ?? activeCategory).sections.map((section) => renderSection(section, isSearching))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
