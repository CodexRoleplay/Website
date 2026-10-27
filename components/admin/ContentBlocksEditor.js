"use client";

import { useState } from "react";
import IconPicker from "@/components/admin/IconPicker";
import { ALERT_VARIANTS, CARD_VARIANTS } from "@/lib/reglement/constants";
import { CONTENT_TYPE_OPTIONS, createContentItem, getContentTypeLabel } from "@/lib/reglement/content";
import styles from "@/app/admin/reglement/reglement-admin.module.css";

function reorderItems(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex === null || toIndex === null) {
    return items;
  }

  const copy = [...items];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

export function confirmDelete(label) {
  return window.confirm(`Etes-vous sur de vouloir supprimer "${label}" ?`);
}

function getContentItemDeleteLabel(item) {
  if (item?.type === "rule") {
    return item.title?.trim() || "cette regle";
  }

  if (item?.type === "alert") {
    return item.title?.trim() || "cette alerte";
  }

  if (item?.type === "heading" || item?.type === "text" || item?.type === "quote") {
    return item.text?.trim().slice(0, 60) || "ce bloc de texte";
  }

  return getContentTypeLabel(item?.type) || "ce bloc";
}

function ContentItemEditor({ item, dragProps, onChange, onDelete }) {
  function update(partial) {
    onChange({ ...item, ...partial });
  }

  return (
    <article className={styles.contentCard}>
      <div className={styles.contentCardHeader}>
        <div className={styles.contentCardHeaderLeft}>
          {dragProps ? (
            <button
              aria-label="Déplacer l'élément"
              className={styles.blockHandle}
              draggable
              onDragEnd={dragProps.onDragEnd}
              onDragStart={(event) => dragProps.onDragStart(event, dragProps.index)}
              type="button"
            >
              ⋮⋮
            </button>
          ) : null}
          <span className={styles.blockType}>{getContentTypeLabel(item.type)}</span>
        </div>
        <button className={styles.dangerButton} onClick={onDelete} type="button">
          Supprimer
        </button>
      </div>

      {item.type === "rule" ? (
        <>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>Titre</span>
              <input onChange={(event) => update({ title: event.target.value })} value={item.title ?? ""} />
            </label>
            <IconPicker label="Icône" onChange={(icon) => update({ icon })} value={item.icon ?? "FileText"} />
          </div>
          <label className={styles.field}>
            <span>Texte / description</span>
            <textarea
              onChange={(event) => update({ description: event.target.value })}
              placeholder="Explique la règle ici…"
              value={item.description ?? ""}
            />
          </label>
        </>
      ) : null}

      {item.type === "heading" || item.type === "text" || item.type === "quote" ? (
        <label className={styles.field}>
          <span>Texte</span>
          <textarea onChange={(event) => update({ text: event.target.value })} value={item.text ?? ""} />
        </label>
      ) : null}

      {item.type === "alert" ? (
        <>
          <label className={styles.field}>
            <span>Style</span>
            <select onChange={(event) => update({ variant: event.target.value })} value={item.variant ?? "warning"}>
              {ALERT_VARIANTS.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Titre</span>
            <input onChange={(event) => update({ title: event.target.value })} value={item.title ?? ""} />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea onChange={(event) => update({ text: event.target.value })} value={item.text ?? ""} />
          </label>
        </>
      ) : null}

      {item.type === "list" ? (
        <div className={styles.nestedList}>
          {(item.items ?? []).map((entry, index) => (
            <div className={styles.nestedItem} key={`${entry.label}-${index}`}>
              <label className={styles.field}>
                <span>Label</span>
                <input
                  onChange={(event) => {
                    const items = [...(item.items ?? [])];
                    items[index] = { ...items[index], label: event.target.value };
                    update({ items });
                  }}
                  value={entry.label ?? ""}
                />
              </label>
              <label className={styles.field}>
                <span>Texte</span>
                <textarea
                  onChange={(event) => {
                    const items = [...(item.items ?? [])];
                    items[index] = { ...items[index], text: event.target.value };
                    update({ items });
                  }}
                  value={entry.text ?? ""}
                />
              </label>
              <button
                className={styles.dangerButton}
                onClick={() => {
                  const label = entry.label?.trim() || entry.text?.trim() || `point ${index + 1}`;

                  if (confirmDelete(label)) {
                    update({ items: (item.items ?? []).filter((_, itemIndex) => itemIndex !== index) });
                  }
                }}
                type="button"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            className={styles.secondaryButton}
            onClick={() => update({ items: [...(item.items ?? []), { label: "Point", text: "Description" }] })}
            type="button"
          >
            Ajouter un point
          </button>
        </div>
      ) : null}

      {item.type === "cards" ? (
        <div className={styles.nestedList}>
          {(item.cards ?? []).map((card, index) => (
            <div className={styles.nestedItem} key={`${card.title}-${index}`}>
              <label className={styles.field}>
                <span>Style</span>
                <select
                  onChange={(event) => {
                    const cards = [...(item.cards ?? [])];
                    cards[index] = { ...cards[index], variant: event.target.value };
                    update({ cards });
                  }}
                  value={card.variant ?? "info"}
                >
                  {CARD_VARIANTS.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Titre</span>
                <input
                  onChange={(event) => {
                    const cards = [...(item.cards ?? [])];
                    cards[index] = { ...cards[index], title: event.target.value };
                    update({ cards });
                  }}
                  value={card.title ?? ""}
                />
              </label>
              <label className={styles.field}>
                <span>Points (un par ligne)</span>
                <textarea
                  onChange={(event) => {
                    const cards = [...(item.cards ?? [])];
                    cards[index] = {
                      ...cards[index],
                      items: event.target.value.split("\n").filter(Boolean),
                    };
                    update({ cards });
                  }}
                  value={(card.items ?? []).join("\n")}
                />
              </label>
              <button
                className={styles.dangerButton}
                onClick={() => {
                  const label = card.title?.trim() || `carte ${index + 1}`;

                  if (confirmDelete(label)) {
                    update({ cards: (item.cards ?? []).filter((_, cardIndex) => cardIndex !== index) });
                  }
                }}
                type="button"
              >
                Retirer la carte
              </button>
            </div>
          ))}
          <button
            className={styles.secondaryButton}
            onClick={() =>
              update({
                cards: [...(item.cards ?? []), { variant: "info", title: "Nouvelle carte", items: ["Point"] }],
              })
            }
            type="button"
          >
            Ajouter une carte
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function ContentBlocksEditor({
  content,
  onChange,
  title = "Contenu de la sous-rubrique",
  description = "Mélange librement règles, paragraphes, warnings… Glisse ⋮⋮ pour réordonner.",
  emptyLabel = "Aucun contenu — ajoute une règle ou un bloc ci-dessus.",
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const items = Array.isArray(content) ? content : [];

  function updateItem(index, nextItem) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
  }

  return (
    <div className={styles.contentSection}>
      <div className={styles.sectionIntro}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className={styles.blockToolbar}>
        {CONTENT_TYPE_OPTIONS.map((option) => (
          <button key={option.id} onClick={() => onChange([...items, createContentItem(option.id)])} type="button">
            + {option.label}
          </button>
        ))}
      </div>

      <div className={styles.contentList}>
        {items.length === 0 ? <p className={styles.status}>{emptyLabel}</p> : null}

        {items.map((item, index) => (
          <div
            key={item.id}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              onChange(reorderItems(items, dragIndex, index));
              setDragIndex(null);
            }}
          >
            <ContentItemEditor
              dragProps={{
                index,
                onDragEnd: () => setDragIndex(null),
                onDragStart: (_event, itemIndex) => setDragIndex(itemIndex),
              }}
              item={item}
              onChange={(nextItem) => updateItem(index, nextItem)}
              onDelete={() => {
                if (confirmDelete(getContentItemDeleteLabel(item))) {
                  onChange(items.filter((_, itemIndex) => itemIndex !== index));
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
