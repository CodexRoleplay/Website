"use client";

import { useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useBoutique } from "@/components/BoutiqueProvider";
import styles from "./shop.module.css";

export default function BoutiqueClosed() {
  const { openSoon } = useBoutique();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) {
      return;
    }

    opened.current = true;
    openSoon();
  }, [openSoon]);

  return (
    <>
      <Header />
      <div className={styles.page}>
        <main className={styles.main}>
          <section className={styles.hero}>
            <span className={styles.eyebrow}>Catalogue officiel</span>
            <h1>
              Boutique <strong>Codex RP</strong>
            </h1>
            <p>La boutique sera bientôt prête. Reviens un peu plus tard pour le catalogue.</p>
            <button className={styles.checkoutButton} onClick={openSoon} type="button">
              En savoir plus
            </button>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
