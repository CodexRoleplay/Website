"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./shop.module.css";

const CODYX_ITEMS = [
  { src: "/img/codyx_1.webp", width: 290, height: 262, start: 0.88, speed: 0.34, rotation: 0.1 },
  { src: "/img/codyx_2.webp", width: 98, height: 102, start: 0.42, speed: 0.56, rotation: -0.16 },
  { src: "/img/codyx_3.webp", width: 149, height: 123, start: 1.12, speed: 0.42, rotation: 0.13 },
  { src: "/img/codyx_4.webp", width: 81, height: 83, start: 0.78, speed: 0.7, rotation: -0.19 },
  { src: "/img/codyx_5.webp", width: 149, height: 123, start: 0.28, speed: 0.48, rotation: 0.12 },
];

export default function ShopCodyxRain() {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;

    if (!layer) {
      return undefined;
    }

    const coins = [...layer.querySelectorAll("[data-codyx]")];
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = null;

    const updateCoins = () => {
      animationFrame = null;

      const viewportHeight = window.innerHeight;
      const scroll = reducedMotionQuery.matches ? 0 : window.scrollY;

      coins.forEach((coin, index) => {
        const item = CODYX_ITEMS[index];
        const coinHeight = coin.offsetHeight;
        const trackHeight = viewportHeight + coinHeight + 260;
        const startPosition = item.start * viewportHeight - coinHeight - 70;
        const y = ((startPosition + scroll * item.speed) % trackHeight + trackHeight) % trackHeight - coinHeight;
        const drift = reducedMotionQuery.matches ? 0 : Math.sin(scroll * 0.003 + index * 1.7) * 12;
        const rotation = reducedMotionQuery.matches ? index * 18 - 24 : index * 18 - 24 + scroll * item.rotation;

        coin.style.transform = `translate3d(${drift}px, ${y}px, 0) rotate(${rotation}deg)`;
      });

      layer.dataset.ready = "true";
    };

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateCoins);
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
      delete layer.dataset.ready;
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.codyxRain} aria-hidden="true">
      {CODYX_ITEMS.map((item, index) => (
        <div className={`${styles.codyxCoin} ${styles[`codyxCoin${index + 1}`]}`} data-codyx key={item.src}>
          <Image
            alt=""
            height={item.height}
            loading="eager"
            sizes="(max-width: 620px) 90px, 190px"
            src={item.src}
            width={item.width}
          />
        </div>
      ))}
    </div>
  );
}
