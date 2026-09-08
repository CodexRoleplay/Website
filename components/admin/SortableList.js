"use client";

import { useState } from "react";
import styles from "./SortableList.module.css";

function reorderItems(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex === null || toIndex === null) {
    return items;
  }

  const copy = [...items];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

export default function SortableList({
  items,
  activeId,
  emptyLabel = "Aucun élément",
  getLabel,
  onReorder,
  onSelect,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  if (!items.length) {
    return <p className={styles.empty}>{emptyLabel}</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;

        return (
          <li
            className={`${styles.item} ${isActive ? styles.itemActive : ""} ${isDragging ? styles.itemDragging : ""} ${isOver ? styles.itemOver : ""}`}
            key={item.id}
            onDragEnter={() => setOverIndex(index)}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setOverIndex(null);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOverIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              onReorder(reorderItems(items, dragIndex, index));
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <button
              aria-label={`Déplacer ${getLabel(item)}`}
              className={styles.handle}
              draggable
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", item.id);
              }}
              type="button"
            >
              ⋮⋮
            </button>
            <button
              className={styles.labelButton}
              onClick={() => onSelect(item.id)}
              title={getLabel(item)}
              type="button"
            >
              {getLabel(item)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
