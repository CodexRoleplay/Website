"use client";

import { useEffect, useRef } from "react";

/**
 * Séparateur typo scroll-réactif (VideoTeaser → Services).
 * Deux lignes géantes en contour qui glissent horizontalement
 * en sens opposés, pilotées uniquement par le scroll (fluide avec Lenis).
 */
export default function CxGlide() {
  const sectionRef = useRef(null);
  const lineTopRef = useRef(null);
  const lineBottomRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const lineTop = lineTopRef.current;
    const lineBottom = lineBottomRef.current;

    if (!section || !lineTop || !lineBottom) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = null;

    const resetMotion = () => {
      lineTop.style.transform = "translate3d(-12%, 0, 0)";
      lineBottom.style.transform = "translate3d(-28%, 0, 0)";
    };

    const update = () => {
      animationFrame = null;

      if (reducedMotionQuery.matches) {
        resetMotion();
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const travel = viewport + rect.height;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / travel));

      // ligne du haut : glisse vers la gauche ; ligne du bas : vers la droite
      const topOffset = -4 - progress * 24;
      const bottomOffset = -36 + progress * 24;

      lineTop.style.transform = `translate3d(${topOffset}%, 0, 0)`;
      lineBottom.style.transform = `translate3d(${bottomOffset}%, 0, 0)`;
    };

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(update);
      }
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotionQuery.addEventListener("change", requestUpdate);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotionQuery.removeEventListener("change", requestUpdate);
    };
  }, []);

  const topWords = ["La", "réalité", "comme", "seule", "limite,", "Codex", "RP", "\u2014"];
  const bottomWords = ["Ton", "histoire", "commence", "ici", "\u2014"];

  return (
    <div ref={sectionRef} className="cxglide" aria-hidden="true">
      <div ref={lineTopRef} className="cxglide__line cxglide__line--top">
        {[0, 1, 2].map((i) => (
          <span className="cxglide__group" key={i}>
            {topWords.map((word, j) => (
              <span
                className={word === "RP" ? "cxglide__word cxglide__word--pink" : "cxglide__word"}
                key={j}
              >
                {word}
              </span>
            ))}
          </span>
        ))}
      </div>
      <div ref={lineBottomRef} className="cxglide__line cxglide__line--bottom">
        {[0, 1, 2].map((i) => (
          <span className="cxglide__group" key={i}>
            {bottomWords.map((word, j) => (
              <span
                className={word === "ici" ? "cxglide__word cxglide__word--cyan" : "cxglide__word"}
                key={j}
              >
                {word}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
