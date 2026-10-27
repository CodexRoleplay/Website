"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import CxLine from "@/components/CxLine";
import CxModal from "@/components/CxModal";
import { galleryAlt, galleryPhotos } from "@/data/site";

function GalleryPhotoModal({ open, photo, onClose }) {
  if (!photo) {
    return null;
  }

  const num = String(photo.index + 1).padStart(2, "0");

  return (
    <CxModal
      open={open}
      onClose={onClose}
      eyebrow={`Galerie · ${num}`}
      title={photo.tag}
      backdropLabel="Fermer la photo"
      screenClassName="cxvmodal__screen--photo"
    >
      <Image
        className="cxvmodal__image"
        src={photo.src}
        alt={galleryAlt(photo.tag)}
        width={1920}
        height={1080}
        sizes="(max-width: 960px) 100vw, 960px"
        draggable={false}
        unoptimized
        priority
        style={{ color: "transparent" }}
      />
    </CxModal>
  );
}

function PortfolioCard({ photo, index, onSelect }) {
  const cardRef = useRef(null);
  const num = String(index + 1).padStart(2, "0");

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = null;

    const onEnter = () => {
      card.classList.add("is-hover");
    };

    const onLeave = () => {
      card.classList.remove("is-hover");
      card.style.setProperty("--hx", "0%");
      card.style.setProperty("--hy", "0%");
      card.style.setProperty("--zoom", "1");
    };

    const onMove = (event) => {
      if (!finePointer.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame === null) {
        frame = window.requestAnimationFrame(() => {
          frame = null;
          card.style.setProperty("--hx", `${(x * 10).toFixed(2)}%`);
          card.style.setProperty("--hy", `${(y * 8).toFixed(2)}%`);
          card.style.setProperty("--zoom", "1.06");
        });
      }
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    card.addEventListener("pointermove", onMove);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("pointermove", onMove);
    };
  }, []);

  const openPhoto = () => {
    onSelect({ src: photo.src, tag: photo.tag, index });
  };

  return (
    <button
      type="button"
      ref={cardRef}
      className="cxgal__card"
      data-cxgal-card
      style={{ "--card-i": index }}
      aria-label={`Agrandir la photo ${galleryAlt(photo.tag)}`}
      onClick={openPhoto}
    >
      <div className="cxgal__frame" aria-hidden="true">
        <span className="cxgal__corner cxgal__corner--tl" />
        <span className="cxgal__corner cxgal__corner--br" />
      </div>
      <div className="cxgal__meta" aria-hidden="true">
        <span className="cxgal__num">{num}</span>
        <span className="cxgal__tag">{photo.tag}</span>
      </div>
      <div className="cxgal__img-wrap">
        <Image
          className="cxgal__img"
          src={photo.src}
          alt={galleryAlt(photo.tag)}
          width={800}
          height={450}
          sizes="(max-width: 500px) 90vw, (max-width: 1084px) 45vw, 320px"
          draggable={false}
          unoptimized
          style={{ color: "transparent" }}
        />
      </div>
      <div className="cxgal__shine" aria-hidden="true" />
    </button>
  );
}

function PortfolioColumn({ columnRef, photos, startIndex, side, onSelect }) {
  const direction = side === "left" ? "up" : "down";
  const loopItems = [0, 1].flatMap((cycle) =>
    photos.map((photo, index) => ({
      photo,
      index: startIndex + index,
      key: `${side}-${cycle}-${photo.tag}-${index}`,
    })),
  );

  return (
    <div ref={columnRef} className={`cxgal__col cxgal__col--${side}`}>
      <div className={`cxgal__marquee cxgal__marquee--${direction}`}>
        <div className="cxgal__track">
          {loopItems.map(({ photo, index, key }) => (
            <PortfolioCard photo={photo} index={index} key={key} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const girlRef = useRef(null);
  const portfolioRef = useRef(null);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [mounted, setMounted] = useState(false);

  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const midpoint = Math.ceil(galleryPhotos.length / 2);
  const leftPhotos = galleryPhotos.slice(0, midpoint);
  const rightPhotos = galleryPhotos.slice(midpoint);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const girl = girlRef.current;
    const portfolio = portfolioRef.current;
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;

    if (!section || !heading || !girl || !portfolio || !leftColumn || !rightColumn) {
      return undefined;
    }

    const desktopQuery = window.matchMedia("(min-width: 1085px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = portfolio.querySelectorAll("[data-cxgal-card]");
    let animationFrame = null;

    const updateMotion = () => {
      animationFrame = null;

      const rect = section.getBoundingClientRect();
      const travel = window.innerHeight + rect.height;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
      const headingOffset = progress * 60;
      const girlOffset = -4 + progress * 14;

      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        heading.style.transform = "none";
        girl.style.transform = "translate3d(-4%, 0, 0)";
        leftColumn.style.transform = "none";
        rightColumn.style.transform = "none";
        cards.forEach((card) => {
          if (!card.classList.contains("is-hover")) {
            card.style.setProperty("--focus", "1");
          }
        });
        return;
      }

      const leftOffset = -18 + progress * 36;
      const rightOffset = 18 - progress * 36;

      heading.style.transform = `translate3d(0, ${headingOffset}px, 0)`;
      girl.style.transform = `translate3d(-2%, ${girlOffset}%, 0)`;
      leftColumn.style.transform = `translate3d(0, ${leftOffset}%, 0)`;
      rightColumn.style.transform = `translate3d(0, ${rightOffset}%, 0)`;

      cards.forEach((card) => {
        if (card.classList.contains("is-hover")) return;

        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        const viewportCenter = window.innerHeight * 0.5;
        const distance = Math.abs(cardCenter - viewportCenter);
        const focus = Math.max(0, Math.min(1, 1 - distance / (window.innerHeight * 0.42)));
        card.style.setProperty("--focus", focus.toFixed(3));
      });
    };

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateMotion);
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
    <div ref={sectionRef} className="gallery_gallery__x_FaV cxgal">
      <div className="cxgal__blur" aria-hidden="true" />

      <div className="kit_wrapper__8wmK4 gallery_wrapper__vChCf cxgal__layout">
        <div ref={headingRef} className="gallery_heading__vxuyL">
          <div className="kit_sub__5U0o_ gallery_sub__QPj7S">Découvrir</div>
          <h2 className="gallery_title__ICQGB">
            <span className="gallery_l1__poEaS">Galerie</span>
            <span className="gallery_l2__c1xpM">
              Photos
            </span>
          </h2>
        </div>

        <div ref={portfolioRef} className="cxgal__portfolio">
          <PortfolioColumn
            columnRef={leftColumnRef}
            photos={leftPhotos}
            startIndex={0}
            side="left"
            onSelect={setSelectedPhoto}
          />
          <PortfolioColumn
            columnRef={rightColumnRef}
            photos={rightPhotos}
            startIndex={midpoint}
            side="right"
            onSelect={setSelectedPhoto}
          />
        </div>

        <div className="cxgal__stage">
          <div className="gallery_girl__MnUf_ cxgal__hero">
            <Image
              ref={girlRef}
              className="gallery-girl-image cxgal__girl"
              src="/img/home_portfolio.webp"
              alt="Codex RP"
              width={1024}
              height={1536}
              sizes="(max-width: 1084px) 58vw, 50vw"
              draggable={false}
              unoptimized
              style={{
                color: "transparent",
                translate: "none",
                rotate: "none",
                scale: "none",
              }}
            />
            <div className="cxgal__glow cxgal__glow--cyan" aria-hidden="true" />
            <div className="cxgal__glow cxgal__glow--pink" aria-hidden="true" />
          </div>
        </div>
      </div>

      <CxLine accent="cyan" className="cxline--gal-cyan" delay={0.6} />
      <CxLine accent="pink" className="cxline--gal-pink" delay={1.8} />

      {mounted ? (
        <GalleryPhotoModal
          open={selectedPhoto !== null}
          photo={selectedPhoto}
          onClose={closePhoto}
        />
      ) : null}
    </div>
  );
}
