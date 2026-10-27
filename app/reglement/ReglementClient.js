"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ContentBlocks from "@/components/reglement/ContentBlocks";
import RuleIcon from "@/components/reglement/RuleIcon";
import { normalizeSectionContent } from "@/lib/reglement/content";
import { subscribeReglement } from "@/lib/reglement/service";
import styles from "./reglement.module.css";
import blockStyles from "@/components/reglement/ContentBlocks.module.css";

export default function ReglementClient({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const heroRef = useRef(null);

  useEffect(() => {
    return subscribeReglement((payload) => {
      setCategories(payload.categories);
    });
  }, []);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

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
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  return (
    <section className={styles.ruleShell}>
      <div className={styles.background} aria-hidden="true">
        <div />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Catégories du règlement">
          {categories.map((category) => (
            <button
              className={`${styles.sideLink} ${category.id === activeCategoryId ? styles.sideLinkActive : ""}`}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              type="button"
            >
              {category.title}
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

          {!activeCategory ? (
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
              {activeCategory.sections.map((section) => {
                const isOpen = Boolean(openSections[section.id]);
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
                      <span>{section.title}</span>
                      <span className={styles.chevron} aria-hidden="true" />
                    </button>

                    {isOpen ? (
                      <div className={styles.ruleList}>
                        {sectionContent.length > 0 ? (
                          <ContentBlocks
                            blocks={sectionContent}
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
              })}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
