"use client";

import { containsFormattingHtml, normalizeNewlines, sanitizeRichText, splitProseParagraphs } from "./rich-text";
import RuleIcon from "./RuleIcon";
import styles from "./ContentBlocks.module.css";

function FormattedText({ text, prose = false }) {
  const value = normalizeNewlines(text);

  if (!value.trim()) {
    return null;
  }

  if (containsFormattingHtml(value)) {
    const className = prose ? `${styles.richHtml} ${styles.prose}` : styles.richHtml;
    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />;
  }

  if (!prose) {
    return <div className={styles.formatted}>{value}</div>;
  }

  const paragraphs = splitProseParagraphs(value);

  if (paragraphs.length <= 1) {
    return <div className={`${styles.formatted} ${styles.prose}`}>{paragraphs[0] ?? value.trim()}</div>;
  }

  return (
    <div className={styles.prose}>
      {paragraphs.map((paragraph, index) => (
        <p className={`${styles.formatted} ${styles.proseParagraph}`} key={`${index}-${paragraph.slice(0, 24)}`}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function AlertBlock({ block, prose = false }) {
  return (
    <div className={`${styles.alert} ${styles[`alert_${block.variant ?? "warning"}`]}`}>
      {block.title ? <strong className={styles.formatted}>{block.title}</strong> : null}
      <FormattedText prose={prose} text={block.text} />
    </div>
  );
}

function CardsBlock({ block, prose = false }) {
  return (
    <div className={styles.cardsGrid}>
      {(block.cards ?? []).map((card) => (
        <article className={`${styles.card} ${styles[`card_${card.variant ?? "info"}`]}`} key={card.title}>
          <h3>{card.title}</h3>
          <ul>
            {(card.items ?? []).map((item) => (
              <li key={item}>
                <FormattedText prose={prose} text={item} />
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ListBlock({ block, prose = false }) {
  return (
    <div className={styles.listBlock}>
      {(block.items ?? []).map((item) => (
        <div className={styles.listItem} key={`${item.label}-${item.text}`}>
          <strong className={styles.formatted}>{item.label}</strong>
          <FormattedText prose={prose} text={item.text} />
        </div>
      ))}
    </div>
  );
}

function RuleBlock({ block, ruleStyles, prose = false }) {
  return (
    <div className={ruleStyles?.ruleItem ?? styles.ruleItem}>
      <span className={ruleStyles?.ruleIcon ?? styles.ruleIcon}>
        <RuleIcon name={block.icon} />
      </span>
      <div className={ruleStyles?.ruleBody ?? styles.ruleBody}>
        <h2 className={styles.formatted}>{block.title}</h2>
        <FormattedText prose={prose} text={block.description} />
      </div>
    </div>
  );
}

export default function ContentBlocks({ blocks = [], ruleStyles = null, prose = false }) {
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
                <FormattedText prose={prose} text={block.text} />
              </div>
            );
          case "alert":
            return <AlertBlock block={block} key={block.id} prose={prose} />;
          case "list":
            return <ListBlock block={block} key={block.id} prose={prose} />;
          case "cards":
            return <CardsBlock block={block} key={block.id} prose={prose} />;
          case "quote":
            return (
              <blockquote className={styles.quote} key={block.id}>
                <FormattedText text={block.text} />
              </blockquote>
            );
          case "rule":
            return <RuleBlock block={block} key={block.id} prose={prose} ruleStyles={ruleStyles} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
