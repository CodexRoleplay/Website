"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";
import { subscribeCodePenal } from "@/lib/code-penal/service";
import { normalizePenalJurisdictions } from "@/lib/code-penal/normalize";
import styles from "./code-penal.module.css";

const LEVEL_LABELS = {
  contravention: "Contravention",
  delit: "Délit",
  crime: "Crime",
  aggravante: "Aggravante",
  info: "Info",
};

function matchesArticle(article, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    article.article,
    article.name,
    article.description,
    article.fine,
    article.penalty,
    LEVEL_LABELS[article.level],
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesNotes(notes, query) {
  return !query || notes.join(" ").toLowerCase().includes(query);
}

function resolveJurisdictions(payload = {}, fallbackSections = []) {
  if (Array.isArray(payload.jurisdictions) && payload.jurisdictions.length) {
    return normalizePenalJurisdictions(payload.jurisdictions, payload.sections ?? fallbackSections);
  }

  return normalizePenalJurisdictions(null, payload.sections ?? fallbackSections);
}

function sectionOpenKey(jurisdictionId, sectionId) {
  return `${jurisdictionId}:${sectionId}`;
}

export default function CodePenalClient({ initialJurisdictions = [], initialSections = [] }) {
  const [jurisdictions, setJurisdictions] = useState(() =>
    resolveJurisdictions({ jurisdictions: initialJurisdictions, sections: initialSections }, initialSections),
  );
  const [activeJurisdictionId, setActiveJurisdictionId] = useState(
    () => initialJurisdictions[0]?.id ?? "los-angeles",
  );
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState(() => {
    const jurisdictionId = initialJurisdictions[0]?.id ?? "los-angeles";
    const sectionId = initialJurisdictions[0]?.sections[0]?.id ?? initialSections[0]?.id;
    return sectionId ? { [sectionOpenKey(jurisdictionId, sectionId)]: true } : {};
  });

  useEffect(() => {
    return subscribeCodePenal((payload) => {
      const nextJurisdictions = resolveJurisdictions(payload, initialSections);
      setJurisdictions(nextJurisdictions);
      setActiveJurisdictionId((current) =>
        nextJurisdictions.some((item) => item.id === current) ? current : nextJurisdictions[0]?.id ?? current,
      );
      setOpenSections((current) => {
        const first = nextJurisdictions[0]?.sections[0];
        if (Object.keys(current).length || !first) {
          return current;
        }

        return { [sectionOpenKey(nextJurisdictions[0].id, first.id)]: true };
      });
    });
  }, [initialSections]);

  const activeJurisdiction =
    jurisdictions.find((jurisdiction) => jurisdiction.id === activeJurisdictionId) ?? jurisdictions[0] ?? null;
  const sections = activeJurisdiction?.sections ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredSections = useMemo(
    () =>
      sections
        .map((section) => {
          const articles = section.articles.filter((article) => matchesArticle(article, normalizedQuery));
          const notes = matchesNotes(section.notes, normalizedQuery) ? section.notes : [];

          return {
            ...section,
            articles,
            notes,
          };
        })
        .filter(
          (section) =>
            section.articles.length || section.notes.length || section.title.toLowerCase().includes(normalizedQuery),
        ),
    [sections, normalizedQuery],
  );
  const articleCount = sections.reduce((total, section) => total + section.articles.length, 0);
  const visibleArticleCount = filteredSections.reduce((total, section) => total + section.articles.length, 0);

  useEffect(() => {
    if (!normalizedQuery) {
      return;
    }

    setOpenSections(
      Object.fromEntries(
        filteredSections.map((section) => [sectionOpenKey(activeJurisdiction?.id, section.id), true]),
      ),
    );
  }, [activeJurisdiction?.id, filteredSections, normalizedQuery]);

  function selectJurisdiction(jurisdictionId) {
    if (jurisdictionId === activeJurisdictionId) {
      return;
    }

    const nextJurisdiction = jurisdictions.find((jurisdiction) => jurisdiction.id === jurisdictionId);
    setActiveJurisdictionId(jurisdictionId);
    setQuery("");
    setOpenSections(
      nextJurisdiction?.sections[0]
        ? { [sectionOpenKey(jurisdictionId, nextJurisdiction.sections[0].id)]: true }
        : {},
    );
  }

  function toggleSection(sectionId) {
    const key = sectionOpenKey(activeJurisdiction?.id, sectionId);
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function setAll(open) {
    setOpenSections(
      Object.fromEntries(
        filteredSections.map((section) => [sectionOpenKey(activeJurisdiction?.id, section.id), open]),
      ),
    );
  }

  const emptyLabel = normalizedQuery
    ? "Aucun article ne correspond à cette recherche dans cette juridiction."
    : `Aucun article n'est encore publié pour ${activeJurisdiction?.title || "cette juridiction"}.`;

  return (
    <main className={styles.shell}>
      <div className={styles.background} aria-hidden="true">
        <div />
      </div>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              Central Intelligence System
            </p>
            <h1 className={styles.heroTitle}>
              <span className={styles.titleCode} data-text="Code">Code</span>
              <span className={styles.titlePenal} data-text="Pénal">Pénal</span>
            </h1>
            <p className={styles.heroDescription}>
              Chaque territoire a sa propre juridiction et sa propre numérotation d&apos;articles. La recherche reste
              limitée au corpus affiché.
            </p>
          </div>

          <div aria-hidden="true" className={styles.heroVisual}>
            <Image
              alt=""
              className={styles.heroCharacter}
              height={1406}
              priority
              src="/img/boobie-ike.webp"
              width={1920}
            />
          </div>
        </div>

        <div className={styles.controlDeck}>
          {jurisdictions.length ? (
            <div className={styles.jurisdictionSwitch} role="tablist" aria-label="Juridictions">
              {jurisdictions.map((jurisdiction) => {
                const isActive = jurisdiction.id === activeJurisdiction?.id;
                const count = jurisdiction.sections.reduce(
                  (total, section) => total + section.articles.length,
                  0,
                );

                return (
                  <button
                    aria-selected={isActive}
                    className={`${styles.jurisdictionTab} ${isActive ? styles.jurisdictionTabActive : ""}`}
                    key={jurisdiction.id}
                    onClick={() => selectJurisdiction(jurisdiction.id)}
                    role="tab"
                    type="button"
                  >
                    <span>{jurisdiction.title}</span>
                    <small>{count} article(s)</small>
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeJurisdiction?.summary ? (
            <p className={styles.jurisdictionSummary}>{activeJurisdiction.summary}</p>
          ) : null}

          <label className={styles.search}>
            <span>Rechercher dans {activeJurisdiction?.title || "le code pénal"}</span>
            <div className={styles.searchField}>
              <Search aria-hidden="true" size={20} strokeWidth={1.8} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Crime, mot-clé, article..."
                type="search"
                value={query}
              />
            </div>
          </label>

          <section className={styles.statsBar} aria-label="Résumé du code pénal">
            <span><strong>{sections.length}</strong> sections</span>
            <span><strong>{articleCount}</strong> articles</span>
            <span>
              <strong>{normalizedQuery ? visibleArticleCount : "Live"}</strong>{" "}
              {normalizedQuery ? "résultats" : "indexé"}
            </span>
            <div className={styles.toolbar}>
              <button onClick={() => setAll(true)} type="button">
                Tout ouvrir
              </button>
              <button onClick={() => setAll(false)} type="button">
                Tout fermer
              </button>
            </div>
          </section>
        </div>
      </section>

      <section className={styles.sectionList} aria-label={activeJurisdiction?.title || "Code pénal"}>
        {filteredSections.length ? (
          filteredSections.map((section, sectionIndex) => {
            const isOpen = Boolean(openSections[sectionOpenKey(activeJurisdiction?.id, section.id)]);

            return (
              <article className={`${styles.sectionCard} ${isOpen ? styles.sectionCardOpen : ""}`} key={section.id}>
                <button
                  aria-expanded={isOpen}
                  className={styles.sectionHeader}
                  onClick={() => toggleSection(section.id)}
                  type="button"
                >
                  <span className={styles.sectionHeading}>
                    <small>Chapitre {String(sectionIndex + 1).padStart(2, "0")}</small>
                    <span>{section.title}</span>
                  </span>
                  <span className={styles.sectionMeta}>
                    <em>{section.articles.length} article(s)</em>
                    <ChevronDown aria-hidden="true" className={styles.sectionChevron} size={20} strokeWidth={1.7} />
                  </span>
                </button>

                {isOpen ? (
                  <div className={styles.tableWrap}>
                    {section.articles.length ? (
                      <table className={styles.lawTable}>
                        <thead>
                          <tr>
                            <th>Article</th>
                            <th>Infraction / droit</th>
                            <th>Description</th>
                            <th>Amende</th>
                            <th>Peine</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.articles.map((article) => (
                            <tr className={styles[`level_${article.level}`] ?? ""} key={article.id}>
                              <td data-label="Article">
                                <strong>{article.article}</strong>
                                <span>{LEVEL_LABELS[article.level] ?? "Info"}</span>
                              </td>
                              <td data-label="Infraction / droit">{article.name}</td>
                              <td data-label="Description">{article.description}</td>
                              <td data-label="Amende">{article.fine}</td>
                              <td data-label="Peine">{article.penalty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : null}

                    {section.notes.length ? (
                      <div className={styles.notes}>
                        {section.notes.map((note, index) => (
                          <p key={`${section.id}-note-${index}`}>{note}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className={styles.emptyState}>{emptyLabel}</p>
        )}
      </section>
    </main>
  );
}
