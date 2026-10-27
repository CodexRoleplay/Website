"use client";

import { containsFormattingHtml, normalizeNewlines, sanitizeRichText } from "./rich-text";
import RuleIcon from "./RuleIcon";
import styles from "./ContentBlocks.module.css";

function FormattedText({ text }) {
  const value = normalizeNewlines(text);

  if (!value) {
    return null;
  }

  if (containsFormattingHtml(value)) {
    return <div className={styles.richHtml} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
  }

  return <div className={styles.formatted}>{value}</div>;
}

function AlertBlock({ block }) {
  return (
    <div className={`${styles.alert} ${styles[`alert_${block.variant ?? "warning"}`]}`}>
      {block.title ? <strong className={styles.formatted}>{block.title}</strong> : null}
      <FormattedText text={block.text} />
    </div>
  );
}

function CardsBlock({ block }) {
  return (
    <div className={styles.cardsGrid}>
      {(block.cards ?? []).map((card) => (
        <article className={`${styles.card} ${styles[`card_${card.variant ?? "info"}`]}`} key={card.title}>
          <h3>{card.title}</h3>
          <ul>
            {(card.items ?? []).map((item) => (
              <li key={item}>
                <FormattedText text={item} />
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ListBlock({ block }) {
  return (
    <div className={styles.listBlock}>
      {(block.items ?? []).map((item) => (
        <div className={styles.listItem} key={`${item.label}-${item.text}`}>
          <strong className={styles.formatted}>{item.label}</strong>
          <FormattedText text={item.text} />
        </div>
      ))}
    </div>
  );
}

function RuleBlock({ block, ruleStyles }) {
  return (
    <div className={ruleStyles?.ruleItem ?? styles.ruleItem}>
      <span className={ruleStyles?.ruleIcon ?? styles.ruleIcon}>
        <RuleIcon name={block.icon} />
      </span>
      <div className={ruleStyles?.ruleBody ?? styles.ruleBody}>
        <h2 className={styles.formatted}>{block.title}</h2>
        <FormattedText text={block.description} />
      </div>
    </div>
  );
}

export default function ContentBlocks({ blocks = [], ruleStyles = null }) {
  if (!blocks.length) {
    return null;
  }

  return (
    <div className={styles.blocks}>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <div className={styles.heading} key={block.id}>
                <h2 className={styles.formatted}>{block.text}</h2>
              </div>
            );
          case "text":
            return (
              <div className={styles.textBox} key={block.id}>
                <FormattedText text={block.text} />
              </div>
            );
          case "alert":
            return <AlertBlock block={block} key={block.id} />;
          case "list":
            return <ListBlock block={block} key={block.id} />;
          case "cards":
            return <CardsBlock block={block} key={block.id} />;
          case "quote":
            return (
              <blockquote className={styles.quote} key={block.id}>
                <FormattedText text={block.text} />
              </blockquote>
            );
          case "rule":
            return <RuleBlock block={block} key={block.id} ruleStyles={ruleStyles} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
