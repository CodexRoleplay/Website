"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import CxLine from "@/components/CxLine";
import CxModal from "@/components/CxModal";
import { presentationVideo } from "@/data/site";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

function VideoModal({ open, onClose, src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!open || !src) {
      return undefined;
    }

    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    video.currentTime = 0;

    const startPlayback = () => {
      video.play().catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
    } else {
      video.addEventListener("loadeddata", startPlayback, { once: true });
    }

    return () => {
      video.pause();
      video.removeEventListener("loadeddata", startPlayback);
    };
  }, [open, src]);

  return (
    <CxModal
      open={open}
      onClose={onClose}
      eyebrow="Présentation serveur"
      title="Codex RP en action"
      backdropLabel="Fermer la vidéo"
    >
      {src ? (
        <video
          ref={videoRef}
          className="cxvmodal__video"
          src={src}
          controls
          autoPlay
          playsInline
          preload="auto"
        />
      ) : (
        <div className="cxvmodal__placeholder">
          <span className="cxvmodal__placeholder-ring" aria-hidden="true" />
          <p>Vidéo de présentation bientôt disponible.</p>
          <span className="cxvmodal__placeholder-hint">
            Ajoute l’URL MP4 dans <code>data/site.js</code>
          </span>
        </div>
      )}
    </CxModal>
  );
}

export default function VideoTeaser() {
  const sectionRef = useRef(null);
  const motionRef = useRef(null);
  const bgRef = useRef(null);
  const visualRef = useRef(null);
  const playRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const motion = motionRef.current;
    const bg = bgRef.current;
    const visual = visualRef.current;
    const play = playRef.current;

    if (!section || !motion || !bg || !visual || !play) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = null;

    const resetMotion = () => {
      motion.style.transform = "none";
      motion.style.opacity = "1";
      bg.style.transform = "translate3d(0, -15%, 0)";
      visual.style.transform = "none";
      play.style.transform = "none";
    };

    const updateSection = () => {
      animationFrame = null;

      if (reducedMotionQuery.matches) {
        resetMotion();
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const travel = viewport + rect.height;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / travel));
      const enter = Math.min(1, Math.max(0, (viewport * 0.72 - rect.top) / (viewport * 0.55)));
      const parallax = (progress - 0.5) * 2;

      motion.style.transform = `translate3d(0, ${parallax * -16}px, 0)`;
      motion.style.opacity = `${0.45 + enter * 0.55}`;
      bg.style.transform = `translate3d(0, calc(-15% + ${parallax * -4}%), 0)`;
      visual.style.transform = `translate3d(0, ${parallax * 12}px, 0)`;
      play.style.transform = `translate3d(0, ${parallax * -8}px, 0) scale(${0.94 + enter * 0.06})`;
    };

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateSection);
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
    <>
      <div ref={sectionRef} className="module_video" aria-labelledby="module-video-title">
        <div className="kit_wrapper__8wmK4 module_video__wrapper">
          <div ref={motionRef} className="module_video__content">
            <div className="services_heading__MRcrx module_video__heading">
              <h2 id="module-video-title" className="services_title___ADmZ">
                <span className="services_l1__HCPdg">L&apos;univers</span>
                <span className="services_l2__ixzS7">
                  Codex
                </span>
                <span className="services_l3__FFAk0">RP en vidéo</span>
              </h2>
            </div>

            <div ref={playRef} className="module_video__play-wrap">
              <button
                type="button"
                className="cxplay"
                aria-label="Lire la vidéo de présentation du serveur"
                onClick={() => setModalOpen(true)}
              >
                <span className="cxplay__ring" aria-hidden="true" />
                <span className="cxplay__core">
                  <span className="cxplay__icon">
                    <PlayIcon />
                  </span>
                  <span className="cxplay__label">Play</span>
                </span>
              </button>
              <p className="module_video__play-caption">Voir la présentation</p>
            </div>
          </div>
        </div>

        <div ref={visualRef} className="module_video__visual-wrap">
          <Image
            className="module_video__visual"
            src="/img/codex_video.webp"
            alt=""
            width={980}
            height={1308}
            sizes="(max-width: 500px) 430px, (max-width: 768px) 520px, (max-width: 900px) 550px, 667px"
            draggable={false}
            unoptimized
            aria-hidden="true"
            style={{ color: "transparent" }}
          />
        </div>

        <div className="module_video__bg">
          <div ref={bgRef} />
        </div>

        <CxLine
          accent="cyan"
          className="cxline--teaser-cyan"
          delay={0}
        />
        <CxLine
          accent="pink"
          className="cxline--teaser-pink"
          delay={1.6}
        />
      </div>

      {mounted ? (
        <VideoModal open={modalOpen} onClose={closeModal} src={presentationVideo.src} />
      ) : null}
    </>
  );
}
