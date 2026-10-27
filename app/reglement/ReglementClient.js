"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

function sectionDomId(categoryId, sectionId) {
  return `reglement-section-${categoryId}-${sectionId}`;
}

function scrollToReglementTarget(targetId) {
  const node = document.getElementById(targetId);

  if (!node) {
    return false;
  }

  window.dispatchEvent(
    new CustomEvent("codex:scroll-to", {
      detail: {
        target: `#${CSS.escape(targetId)}`,
        offset: window.innerWidth <= 820 ? -112 : -150,
      },
    }),
  );

  return true;
}

export default function ReglementClient({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [query, setQuery] = useState("");
  const [collapsedWhileSearching, setCollapsedWhileSearching] = useState({});
  const heroRef = useRef(null);
  const sidebarRef = useRef(null);
  const pendingScrollId = useRef(null);
  const pendingSidebarReveal = useRef(null);
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

  useLayoutEffect(() => {
    const targetId = pendingScrollId.current;

    if (!targetId) {
      return undefined;
    }

    if (scrollToReglementTarget(targetId)) {
      pendingScrollId.current = null;
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      if (pendingScrollId.current === targetId && scrollToReglementTarget(targetId)) {
        pendingScrollId.current = null;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [activeSectionId, activeCategoryId, openSections, collapsedWhileSearching]);

  useLayoutEffect(() => {
    const categoryId = pendingSidebarReveal.current;

    if (!categoryId) {
      return;
    }

    pendingSidebarReveal.current = null;
    const sidebar = sidebarRef.current;
    const node = sidebar?.querySelector(`[data-category-id="${CSS.escape(categoryId)}"]`);

    if (!sidebar || !node) {
      return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    if (nodeRect.top < sidebarRect.top) {
      sidebar.scrollTop += nodeRect.top - sidebarRect.top - 8;
    } else if (nodeRect.bottom > sidebarRect.bottom) {
      sidebar.scrollTop += nodeRect.bottom - sidebarRect.bottom + 8;
    }
  }, [expandedCategoryId]);

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
    if (expandedCategoryId === categoryId) {
      pendingSidebarReveal.current = categoryId;
      setExpandedCategoryId(null);
      return;
    }

    const nextCategory = categories.find((category) => category.id === categoryId);

    setExpandedCategoryId(categoryId);

    if (categoryId === activeCategoryId) {
      return;
    }

    pendingScrollId.current = null;
    setActiveCategoryId(categoryId);
    setActiveSectionId(null);
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
      if (pendingScrollId.current) {
        return;
      }

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
    pendingScrollId.current = null;
    setActiveCategoryId(null);
    setExpandedCategoryId(null);
    setActiveSectionId(null);
    setOpenSections({});
    scrollToHero();
  }

  function selectSection(categoryId, sectionId) {
    pendingScrollId.current = sectionDomId(categoryId, sectionId);
    setActiveSectionId(sectionId);

    if (categoryId !== activeCategoryId) {
      const nextCategory = categories.find((category) => category.id === categoryId);
      setExpandedCategoryId(categoryId);
      setActiveCategoryId(categoryId);
      setOpenSections((current) => {
        const next = { ...current };

        for (const section of nextCategory?.sections ?? []) {
          next[section.id] = true;
        }

        next[sectionId] = true;
        return next;
      });
    } else if (isSearching) {
      setCollapsedWhileSearching((current) => ({
        ...current,
        [sectionId]: false,
      }));
    } else {
      setOpenSections((current) => ({
        ...current,
        [sectionId]: true,
      }));
    }
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

  function renderSection(section, expanded, categoryId) {
    const isOpen = expanded ? !collapsedWhileSearching[section.id] : Boolean(openSections[section.id]);
    const sectionContent = normalizeSectionContent(section);
    const isCurrent = section.id === activeSectionId;

    return (
      <article
        className={`${styles.sectionPanel} ${isOpen ? styles.sectionPanelOpen : ""} ${isCurrent ? styles.sectionPanelCurrent : ""}`}
        id={sectionDomId(categoryId, section.id)}
        key={section.id}
      >
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
        <aside
          className={styles.sidebar}
          aria-label="Catégories du règlement"
          data-lenis-prevent="true"
          ref={sidebarRef}
        >
          <ul className={styles.sideNav}>
            {sidebarCategories.map((category) => {
              const isActive = category.id === activeCategoryId;
              const isExpanded = category.id === expandedCategoryId;
              const sections = category.sections ?? [];
              const showSections = isExpanded && sections.length > 0;

              return (
                <li className={styles.sideGroup} key={category.id}>
                  <button
                    aria-controls={showSections ? `reglement-sub-${category.id}` : undefined}
                    aria-expanded={isExpanded}
                    className={`${styles.sideLink} ${isActive ? styles.sideLinkActive : ""}`}
                    data-category-id={category.id}
                    onClick={() => selectCategory(category.id)}
                    type="button"
                  >
                    <span className={styles.sideLinkLabel}>
                      {isSearching ? (
                        <SearchHighlight text={category.title} query={normalizedQuery} />
                      ) : (
                        category.title
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`${styles.sideChevron} ${isExpanded ? styles.sideChevronOpen : ""}`}
                    />
                  </button>
                  {showSections ? (
                    <ul
                      aria-label={`Chapitres de ${category.title}`}
                      className={styles.sideSubList}
                      id={`reglement-sub-${category.id}`}
                    >
                      {sections.map((section) => {
                        const isSectionActive = section.id === activeSectionId;

                        return (
                          <li key={section.id}>
                            <button
                              aria-current={isSectionActive ? "true" : undefined}
                              className={`${styles.sideSubLink} ${isSectionActive ? styles.sideSubLinkActive : ""}`}
                              onClick={() => selectSection(category.id, section.id)}
                              type="button"
                            >
                              {isSearching ? (
                                <SearchHighlight text={section.title} query={normalizedQuery} />
                              ) : (
                                section.title
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
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
                      {category.sections.map((section) => renderSection(section, true, category.id))}
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
              {(displayedCategory ?? activeCategory).sections.map((section) =>
                renderSection(section, isSearching, (displayedCategory ?? activeCategory).id),
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
