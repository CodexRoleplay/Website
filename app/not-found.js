import CxButton from "@/components/CxButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import styles from "./not-found.module.css";

export const metadata = {
  title: "Page introuvable — Codex RP",
  description: "Cette page n'existe pas sur Codex RP.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.background} aria-hidden="true">
          <div className={styles.bgImage} />
          <div className={styles.character} />
        </div>

        <section className={styles.hero} aria-labelledby="not-found-title">
          <div className={styles.kicker}>Erreur 404</div>
          <h1 id="not-found-title" className={styles.title}>
            <span>Signal</span>
            <strong>perdu</strong>
          </h1>
          <p className={styles.copy}>
            La fréquence demandée n&apos;existe plus. Retourne en ville ou rejoins la communauté
            pour reprendre la route.
          </p>
          <div className={styles.actions}>
            <CxButton href="/" accent="cyan">
              Retour accueil
            </CxButton>
            <CxButton
              href="https://discord.gg/HwUqfteUHz"
              accent="pink"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rejoindre
            </CxButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
