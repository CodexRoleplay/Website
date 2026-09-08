"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function CxModal({
  open,
  onClose,
  eyebrow,
  title,
  backdropLabel = "Fermer",
  closeLabel = "Fermer",
  screenClassName = "",
  children,
}) {
  const closeRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    window.dispatchEvent(new CustomEvent("codex:lenis-stop"));
    document.body.classList.add("cx-modal-open");

    const previousFocus = document.activeElement;
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.dispatchEvent(new CustomEvent("codex:lenis-start"));
      document.body.classList.remove("cx-modal-open");

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <div className="cxvmodal" role="presentation">
      <button
        type="button"
        className="cxvmodal__backdrop"
        aria-label={backdropLabel}
        onClick={onClose}
      />
      <div
        className="cxvmodal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="cxvmodal__frame">
          <span className="cxvmodal__corner cxvmodal__corner--tl" aria-hidden="true" />
          <span className="cxvmodal__corner cxvmodal__corner--tr" aria-hidden="true" />
          <span className="cxvmodal__corner cxvmodal__corner--bl" aria-hidden="true" />
          <span className="cxvmodal__corner cxvmodal__corner--br" aria-hidden="true" />

          <header className="cxvmodal__head">
            <div>
              {eyebrow ? <p className="cxvmodal__eyebrow">{eyebrow}</p> : null}
              <h2 id={titleId} className="cxvmodal__title">
                {title}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="cxvmodal__close"
              aria-label={closeLabel}
              onClick={onClose}
            >
              <svg className="cxvmodal__close-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className={`cxvmodal__screen ${screenClassName}`.trim()}>{children}</div>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}
