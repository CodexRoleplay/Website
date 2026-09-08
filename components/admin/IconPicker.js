"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatIconLabel,
  getLucideIconCount,
  getReglementIcon,
  resolveIconName,
  searchLucideIcons,
} from "@/lib/reglement/icons";
import styles from "./IconPicker.module.css";

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 360;

function getPanelPosition(triggerRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 12;

  let left = triggerRect.left;
  let top = triggerRect.bottom + 8;

  if (left + PANEL_WIDTH > viewportWidth - margin) {
    left = viewportWidth - PANEL_WIDTH - margin;
  }

  if (left < margin) {
    left = margin;
  }

  if (top + PANEL_HEIGHT > viewportHeight - margin) {
    top = Math.max(margin, triggerRect.top - PANEL_HEIGHT - 8);
  }

  return { left, top };
}

export default function IconPicker({ label = "Icône", onChange, value }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState({ left: 0, top: 0 });
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const resolvedValue = resolveIconName(value);
  const SelectedIcon = getReglementIcon(value);
  const iconCount = getLucideIconCount();

  const filteredIcons = useMemo(() => searchLucideIcons(query), [query]);
  const isSearching = query.trim().length >= 2;

  useEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    function updatePosition() {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelStyle(getPanelPosition(rect));
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event) {
      const target = event.target;

      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
      setQuery("");
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className={styles.panel}
            ref={panelRef}
            style={{ left: panelStyle.left, top: panelStyle.top, width: PANEL_WIDTH }}
          >
            <input
              autoFocus
              className={styles.search}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Rechercher parmi ${iconCount} icônes…`}
              type="search"
              value={query}
            />

            <p className={styles.meta}>
              {isSearching
                ? `${filteredIcons.length} résultat(s) · max 80 affichés`
                : `Icônes populaires · tape 2+ lettres pour chercher dans ${iconCount} icônes`}
            </p>

            <div className={styles.grid}>
              {filteredIcons.map((name) => {
                const Icon = getReglementIcon(name);
                const isActive = name === resolvedValue;

                return (
                  <button
                    className={`${styles.iconButton} ${isActive ? styles.iconButtonActive : ""}`}
                    key={name}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                      setQuery("");
                    }}
                    title={name}
                    type="button"
                  >
                    <Icon size={20} strokeWidth={1.75} />
                    <span>{formatIconLabel(name)}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={styles.root} ref={rootRef}>
        <span className={styles.label}>{label}</span>

        <button
          aria-expanded={open}
          className={styles.trigger}
          onClick={() => setOpen((current) => !current)}
          ref={triggerRef}
          type="button"
        >
          <span className={styles.triggerIcon}>
            <SelectedIcon size={18} strokeWidth={1.75} />
          </span>
          <span className={styles.triggerText}>{formatIconLabel(resolvedValue)}</span>
          <span className={styles.triggerChevron} aria-hidden="true">
            {open ? "▴" : "▾"}
          </span>
        </button>
      </div>

      {panel}
    </>
  );
}
