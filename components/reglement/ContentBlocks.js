"use client";

import RuleIcon from "./RuleIcon";
import styles from "./ContentBlocks.module.css";

function AlertBlock({ block }) {
  return (
    <div className={`${styles.alert} ${styles[`alert_${block.variant ?? "warning"}`]}`}>
      {block.title ? <strong>{block.title}</strong> : null}
      <p>{block.text}</p>
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
              <li key={item}>{item}</li>
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
          <strong>{item.label}</strong>
          <span>{item.text}</span>
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
        <h2>{block.title}</h2>
        <p>{block.description}</p>
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
                <h2>{block.text}</h2>
              </div>
            );
          case "text":
            return (
              <div className={styles.textBox} key={block.id}>
                <p>{block.text}</p>
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
                {block.text}
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
