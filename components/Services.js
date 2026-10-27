"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { serviceCards } from "@/data/site";
import CxLine from "@/components/CxLine";

function ServiceCard({ card, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = null;

    const onMove = (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame === null) {
        frame = window.requestAnimationFrame(() => {
          frame = null;
          el.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
          el.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
          el.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
          el.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
        });
      }
    };

    const onLeave = () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      ref={cardRef}
      className="cxsvc__card"
      style={{ "--sv-rgb": card.color }}
    >
      <div className="cxsvc__frame" aria-hidden="true">
        <span className="cxsvc__notch cxsvc__notch--tl" />
        <span className="cxsvc__notch cxsvc__notch--br" />
      </div>

      <header className="cxsvc__head" aria-hidden="true">
        <span className="cxsvc__index">{num}</span>
        <span className="cxsvc__tag">{card.eyebrow}</span>
        <span className="cxsvc__leds">
          <i />
          <i />
          <i />
        </span>
      </header>

      <Image
        className="cxsvc__icon"
        src={card.image}
        alt=""
        width={448}
        height={434}
        sizes="170px"
        draggable={false}
        unoptimized
        aria-hidden="true"
        style={{ color: "transparent" }}
      />

      <h3 className="cxsvc__title">
        <span className="cxsvc__title-lead">{card.titleLead}</span>
        <strong className="cxsvc__title-strong" data-text={card.titleStrong}>
          {card.titleStrong}
        </strong>
      </h3>

      <p className="cxsvc__desc">{card.description}</p>

      <footer className="cxsvc__foot" aria-hidden="true">
        <span className="cxsvc__foot-line" />
        <span className="cxsvc__foot-code" translate="no">
          CDX://SYS.{num}
        </span>
      </footer>
    </article>
  );
}

function CardColumn({ columnRef, side }) {
  const cards = serviceCards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.column === side);

  return (
    <div ref={columnRef} className={`cxsvc__col cxsvc__col--${side}`}>
      {cards.map(({ card, index }) => (
        <ServiceCard card={card} index={index} key={card.titleStrong} />
      ))}
    </div>
  );
}

export default function Services() {
  const listRef = useRef(null);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);

  /* Contre-defilement des deux colonnes, synchronise avec Lenis */
  useEffect(() => {
    const list = listRef.current;
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;

    if (!list || !leftColumn || !rightColumn) {
      return undefined;
    }

    const desktopQuery = window.matchMedia("(min-width: 851px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = null;

    const updateColumns = () => {
      animationFrame = null;

      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        leftColumn.style.transform = "none";
        rightColumn.style.transform = "none";
        return;
      }

      const rect = list.getBoundingClientRect();
      const travel = window.innerHeight + rect.height;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
      const leftOffset = -5 + progress * 10;
      const rightOffset = 5 - progress * 10;

      leftColumn.style.transform = `translate3d(0, ${leftOffset}%, 0)`;
      rightColumn.style.transform = `translate3d(0, ${rightOffset}%, 0)`;
    };

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateColumns);
      }
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktopQuery.addEventListener("change", requestUpdate);
    reducedMotionQuery.addEventListener("change", requestUpdate);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktopQuery.removeEventListener("change", requestUpdate);
      reducedMotionQuery.removeEventListener("change", requestUpdate);
    };
  }, []);

  return (
    <div className="services_services__BJ7si cxsvc">
      <Image
        className="services_characters__S_FE_"
        src="/img/home_services_char.webp"
        alt="Codex RP"
        width={1179}
        height={1213}
        sizes="(max-width: 889px) 400px, 45vw"
        draggable={false}
        unoptimized
        style={{ color: "transparent" }}
      />

      <div className="kit_wrapper__8wmK4 services_wrapper__E3pLr">
        <div className="services_heading__MRcrx">
          <div className="kit_sub__5U0o_ services_sub__PKPaE">Les piliers</div>
          <h2 className="services_title___ADmZ">
            <span className="services_l1__HCPdg">Ce qui fait</span>
            <span className="services_l2__ixzS7">
              Codex
            </span>
            <span className="services_l3__FFAk0">ROLEPLAY</span>
          </h2>
        </div>

        <div ref={listRef} className="cxsvc__list">
          <CardColumn columnRef={leftColumnRef} side="left" />
          <CardColumn columnRef={rightColumnRef} side="right" />
        </div>
      </div>

      <div className="services_bg__ml1XH">
        <div
          style={{
            translate: "none",
            rotate: "none",
            scale: "none",
            transform: "translate(0px, -15%)",
          }}
        />
      </div>

      <CxLine accent="cyan" className="cxline--svc-cyan" delay={1.1} />
      <CxLine accent="pink" className="cxline--svc-pink" delay={2.3} />
    </div>
  );
}
