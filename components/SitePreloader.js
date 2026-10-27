"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "codex-preloader-complete";
const MINIMUM_DURATION = 850;
const MAXIMUM_DURATION = 8000;
const EXIT_DURATION = 520;

function delay(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function waitForWindowLoad() {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.addEventListener("load", resolve, { once: true });
  });
}

async function decodeVisibleImages() {
  const images = [...document.images].filter((image) => {
    if (image.loading !== "lazy") {
      return true;
    }

    return image.getBoundingClientRect().top < window.innerHeight * 1.25;
  });

  await Promise.allSettled(
    images.map(async (image) => {
      if (!image.complete) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }

      await image.decode?.();
    }),
  );
}

export default function SitePreloader() {
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const root = document.documentElement;

    if (root.dataset.cxFirstLoad !== "true") {
      return undefined;
    }

    let active = true;
    let exitTimer;
    const startedAt = performance.now();

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        const remaining = 88 - current;
        return Math.min(88, current + Math.max(0.8, remaining * 0.09));
      });
    }, 90);

    const resourcesReady = Promise.allSettled([
      waitForWindowLoad(),
      document.fonts?.ready ?? Promise.resolve(),
      decodeVisibleImages(),
    ]);

    const completeLoading = async () => {
      await Promise.race([resourcesReady, delay(MAXIMUM_DURATION)]);

      const elapsed = performance.now() - startedAt;
      if (elapsed < MINIMUM_DURATION) {
        await delay(MINIMUM_DURATION - elapsed);
      }

      if (!active) {
        return;
      }

      window.clearInterval(progressTimer);
      setProgress(100);

      try {
        window.localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // The preloader still exits when storage is unavailable.
      }

      root.dataset.cxFirstLoad = "leaving";
      exitTimer = window.setTimeout(() => {
        root.dataset.cxFirstLoad = "false";
        window.dispatchEvent(new CustomEvent("codex:lenis-start"));
      }, EXIT_DURATION);
    };

    completeLoading();

    return () => {
      active = false;
      window.clearInterval(progressTimer);
      window.clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div className="site-preloader" role="status" aria-label="Chargement de Codex RP">
      <div className="site-preloader__inner">
        <img
          className="site-preloader__logo"
          src="/img/logo_other.webp"
          alt=""
          width={464}
          height={367}
          aria-hidden="true"
          decoding="async"
        />
        <div className="site-preloader__track" aria-hidden="true">
          <span
            className="site-preloader__progress"
            style={{ "--preloader-progress": `${progress}%` }}
          />
        </div>
        <span className="site-preloader__label">Chargement</span>
      </div>
    </div>
  );
}
