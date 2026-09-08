"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > Math.min(700, window.innerHeight * 0.75));

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function scrollToTop() {
    window.dispatchEvent(new Event("codex:scroll-top"));
  }

  return (
    <button
      aria-label="Revenir en haut de la page"
      className={`scroll-to-top${isVisible ? " scroll-to-top--visible" : ""}`}
      onClick={scrollToTop}
      type="button"
    >
      <span aria-hidden="true" />
    </button>
  );
}
