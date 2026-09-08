"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis = null;

    const configureScroll = () => {
      lenis?.destroy();
      lenis = null;

      if (reducedMotionQuery.matches) {
        return;
      }

      lenis = new Lenis({
        anchors: false,
        autoRaf: true,
        lerp: 0.08,
        overscroll: false,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      });
    };

    configureScroll();
    reducedMotionQuery.addEventListener("change", configureScroll);

    const scrollToTop = () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.15 });
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToSelector = (target) => {
      const element = typeof target === "string" ? document.querySelector(target) : null;

      if (!element) {
        return false;
      }

      if (lenis) {
        lenis.scrollTo(element, { duration: 1.15 });
        return true;
      }

      element.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    const scrollToTarget = (event) => {
      scrollToSelector(event.detail?.target);
    };

    const handleAnchorClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      const target = link?.getAttribute("href");

      if (!target || target === "#") {
        return;
      }

      if (scrollToSelector(target)) {
        event.preventDefault();
      }
    };

    const stopLenis = () => lenis?.stop();
    const startLenis = () => lenis?.start();

    window.addEventListener("codex:scroll-top", scrollToTop);
    window.addEventListener("codex:scroll-to", scrollToTarget);
    window.addEventListener("codex:lenis-stop", stopLenis);
    window.addEventListener("codex:lenis-start", startLenis);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      reducedMotionQuery.removeEventListener("change", configureScroll);
      window.removeEventListener("codex:scroll-top", scrollToTop);
      window.removeEventListener("codex:scroll-to", scrollToTarget);
      window.removeEventListener("codex:lenis-stop", stopLenis);
      window.removeEventListener("codex:lenis-start", startLenis);
      document.removeEventListener("click", handleAnchorClick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
