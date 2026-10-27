"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import CxButton from "@/components/CxButton";
import CxLine from "@/components/CxLine";

export default function Hero() {
  const heroRef = useRef(null);
  const motionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const motion = motionRef.current;
    const bg = bgRef.current;

    if (!hero || !motion || !bg) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = null;

    const resetMotion = () => {
      motion.style.transform = "none";
      bg.style.transform = "none";
    };

    const updateHero = () => {
      animationFrame = null;

      if (reducedMotionQuery.matches) {
        resetMotion();
        return;
      }

      const rect = hero.getBoundingClientRect();
      const travel = Math.max(1, rect.height * 0.85);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const contentOffset = -progress * Math.min(120, rect.height * 0.14);
      const bgOffset = progress * 16;

      motion.style.transform = `translate3d(0, ${contentOffset}px, 0)`;
      bg.style.transform = `translate3d(0, ${bgOffset}%, 0)`;
    };

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateHero);
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
      resetMotion();
    };
  }, []);

  return (
    <div ref={heroRef} className="hero_hero__W1Cb5">
      <div className="kit_wrapper__8wmK4 hero_wrapper__rfqBi">
        <div ref={motionRef} className="hero_motion">
          <div className="hero_content__3_2NW">
            <div className="hero_stack">
              <div className="hero_heading__sXcEK cxhero">
                <div className="cxhero__tag">Serveur RP GTA 5 FiveM francophone</div>
                <h1 className="cxhero__title cxhero__title--reality">
                  <span className="cxhero__l1">Impose ta</span>
                  <span className="cxhero__l2" data-text="RÉALITÉ">
                    RÉALITÉ
                  </span>
                  <span className="cxhero__l3">
                    Codex
                    <strong className="cxhero__stamp">RP</strong>
                  </span>
                </h1>
                <p className="cxhero__desc">
                  Tout ce qui est possible dans la vraie vie, est possible sur Codex RP.
                </p>
              </div>
            </div>

            <CxLine
              accent="cyan"
              className="cxline--hero-cyan"
              delay={0}
              style={{
                zIndex: 40,
              }}
            />
            <CxLine
              accent="pink"
              className="cxline--hero-pink"
              delay={1.6}
              style={{
                zIndex: -1,
              }}
            />
          </div>
        </div>

        <div className="hero_illu__MRUMz">
          <Image
            src="/img/drequan-priest-1600.webp"
            alt="Codex RP"
            width={1725}
            height={1119}
            sizes="(max-width: 600px) 100vw, (max-width: 860px) 92vw, 1542px"
            priority
            unoptimized
            draggable={false}
            style={{ color: "transparent" }}
          />
        </div>

        <div className="hero_btn__1STvR">
          <CxButton href="#about" accent="cyan">
            Découvrir
          </CxButton>
          <CxButton href="https://discord.gg/HwUqfteUHz" accent="pink" target="_blank" rel="noopener noreferrer">
            Nous rejoindre
          </CxButton>
        </div>
      </div>

      <div className="hero_bg__lh7DW">
        <div ref={bgRef} />
      </div>
    </div>
  );
}
