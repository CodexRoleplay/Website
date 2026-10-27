"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import CxButton from "@/components/CxButton";

function JoinButton() {
  return (
    <CxButton href="https://discord.gg/HwUqfteUHz" accent="pink" target="_blank" rel="noopener noreferrer">
      Nous rejoindre
    </CxButton>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const motionRef = useRef(null);
  const palmierRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const motion = motionRef.current;
    const palmier = palmierRef.current;

    if (!section || !motion || !palmier) {
      return undefined;
    }

    const desktopQuery = window.matchMedia("(min-width: 851px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = null;

    const updateMotion = () => {
      animationFrame = null;

      const rect = section.getBoundingClientRect();
      const travel = window.innerHeight + rect.height;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));

      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        motion.style.transform = "translate3d(-100%, 0, 0) rotate(-10deg)";
        palmier.style.transform = "translate3d(0, -17%, 0)";
        return;
      }

      const horizontalOffset = -100 + progress * 125;
      const verticalOffset = -17 + progress * 16;

      motion.style.transform = `translate3d(${horizontalOffset}%, 0, 0) rotate(-10deg)`;
      palmier.style.transform = `translate3d(0, ${verticalOffset}%, 0)`;
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
    <div ref={sectionRef} id="about" className="about_about__M5FYO">
      <div className="kit_wrapper__8wmK4 about_wrapper__AX_j_">
        <div className="about_heading__G_PQH">
          <div className="kit_sub__5U0o_ about_sub__82qT8">À propos de nous</div>
          <h2 className="about_title__sTdOT">
            <span className="about_l1__fJII_">Qui</span>
            <span className="about_l2__5lAks">
              sommes
            </span>
            <span className="about_l3__eYgZ5">nous?</span>
          </h2>
        </div>

        <div className="about_content__wej3G">
          <p>
            On a vu les mêmes slogans que toi. Chez Codex RP, la différence, c&apos;est qu&apos;ils ne
            sont pas là pour décorer. Tout ce qui est possible dans la vraie vie est possible ici :
            rien de plus, rien de moins.
          </p>
          <p>
            Notre monde fonctionne comme un monde réel : cohérent, vivant, dans les limites de FiveM
            et du règlement. Recrutements, entretiens, créations d&apos;entreprise, reprises,
            négociations, évolutions de carrière : tout se joue en roleplay. Le HRP reste réservé à
            la modération, à l&apos;assistance technique et aux situations qui ne peuvent pas
            raisonnablement se traiter en jeu.
          </p>
        </div>
        <JoinButton />
      </div>

      <div className="about_car__swZaR about_logo__swZaR">
        <div
          ref={motionRef}
          className="about_logo__motion"
          style={{ transform: "translate3d(-100%, 0, 0) rotate(-10deg)" }}
        >
          <Image
            src="/img/home-about-car.webp"
            alt="Codex RP"
            width={1024}
            height={1024}
            sizes="(max-width: 600px) 270px, 37vw"
            draggable={false}
            unoptimized
            style={{ color: "transparent" }}
          />
        </div>
      </div>

      <div className="about_bg__eD5MP">
        <div />
      </div>

      <div className="palmier_palmier__B3mjd about_palmier__nLWkA">
        <div
          ref={palmierRef}
          style={{
            translate: "none",
            rotate: "none",
            scale: "none",
            transform: "translate(0px, -17%)",
          }}
        >
          <Image
            src="/img/palmier-right.webp"
            alt="Palmier"
            width={1124}
            height={1851}
            sizes="(max-width: 900px) 62vw, 55vw"
            draggable={false}
            unoptimized
            style={{ color: "transparent" }}
          />
        </div>
      </div>
    </div>
  );
}
