"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function BoutiqueSoonModal({ open, onClose }) {
  const closeRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    window.dispatchEvent(new CustomEvent("codex:lenis-stop"));
    document.body.classList.add("cx-modal-open");
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
    <div className="bxsoon" role="presentation">
      <button type="button" className="bxsoon__backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="bxsoon__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <span className="bxsoon__corner bxsoon__corner--tl" aria-hidden="true" />
        <span className="bxsoon__corner bxsoon__corner--tr" aria-hidden="true" />
        <span className="bxsoon__corner bxsoon__corner--bl" aria-hidden="true" />
        <span className="bxsoon__corner bxsoon__corner--br" aria-hidden="true" />
        <button ref={closeRef} type="button" className="bxsoon__close" aria-label="Fermer" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="bxsoon__eyebrow">Boutique</p>
        <h2 id={titleId}>Bientôt disponible</h2>
        <p className="bxsoon__text">
          La boutique n&apos;est pas encore ouverte. Le catalogue sera prêt très prochainement :
          abonnements, packs Codyx et paiement sécurisé.
        </p>
      </div>
    </div>,
    modalRoot,
  );
}
