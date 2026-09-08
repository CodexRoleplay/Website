"use client";

import { buildDiffLines } from "@/lib/admin/text-diff";
import styles from "./history-text-diff.module.css";

const KIND_LABELS = {
  added: "Ajout",
  removed: "Suppression",
  modified: "Modification",
};

function DiffParts({ parts, changedClassName }) {
  if (!parts.length) {
    return "\u00a0";
  }

  return parts.map((part, index) => (
    <span className={part.type === "eq" ? undefined : changedClassName} key={index}>
      {part.text || "\u00a0"}
    </span>
  ));
}

function DiffLine({ line }) {
  if (line.type === "skip") {
    return (
      <div className={styles.skipLine}>
        ··· {line.count} ligne{line.count > 1 ? "s" : ""} inchangée{line.count > 1 ? "s" : ""} ···
      </div>
    );
  }

  if (line.type === "add") {
    return (
      <div className={styles.addLine}>
        <span aria-hidden="true" className={styles.gutter}>+</span>
        <ins className={styles.content}>
          <DiffParts changedClassName={styles.tokenAdded} parts={line.parts} />
        </ins>
      </div>
    );
  }

  if (line.type === "del") {
    return (
      <div className={styles.delLine}>
        <span aria-hidden="true" className={styles.gutter}>-</span>
        <del className={styles.content}>
          <DiffParts changedClassName={styles.tokenRemoved} parts={line.parts} />
        </del>
      </div>
    );
  }

  return (
    <div className={styles.contextLine}>
      <span aria-hidden="true" className={styles.gutter}> </span>
      <span className={styles.content}>
        <DiffParts changedClassName={styles.tokenAdded} parts={line.parts} />
      </span>
    </div>
  );
}

function DiffBlock({ detail }) {
  const lines = buildDiffLines(detail.before, detail.after);

  return (
    <article className={styles.block} data-kind={detail.kind}>
      <header className={styles.blockHeader}>
        <span className={styles.kind}>{KIND_LABELS[detail.kind] ?? KIND_LABELS.modified}</span>
        <h3>{detail.title}</h3>
      </header>
      <div className={styles.diff} tabIndex={0}>
        {lines.length ? (
          lines.map((line, index) => <DiffLine key={`${detail.title}-${index}`} line={line} />)
        ) : (
          <div className={styles.contextLine}>
            <span className={styles.content}>Aucune différence de texte.</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function HistoryTextDiff({ details, emptyHint }) {
  if (!Array.isArray(details) || details.length === 0) {
    return emptyHint ? <p className={styles.emptyHint}>{emptyHint}</p> : null;
  }

  return (
    <section className={styles.section} aria-label="Différences de texte">
      <div className={styles.sectionHeader}>
        <h3>Différences de texte</h3>
        <p>
          <span className={styles.legendDel}>- suppression</span>
          <span className={styles.legendAdd}>+ ajout</span>
        </p>
      </div>
      <div className={styles.stack}>
        {details.map((detail, index) => (
          <DiffBlock detail={detail} key={`${detail.title}-${index}`} />
        ))}
      </div>
    </section>
  );
}
