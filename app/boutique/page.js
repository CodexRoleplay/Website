import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getBoutiqueSettings } from "@/lib/boutique/admin-persistence";
import { pageMetadata } from "@/lib/seo";
import { getTebexCategories } from "@/lib/tebex";
import BoutiqueClosed from "./BoutiqueClosed";
import ShopClient from "./ShopClient";
import ShopCodyxRain from "./ShopCodyxRain";
import styles from "./shop.module.css";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/boutique",
  title: "Boutique — Codex RP",
  description:
    "Boutique Codex RP : packs Codyx et cosmétiques. Aucun avantage en jeu, paiement sécurisé.",
});

export default async function ShopPage() {
  let boutiqueEnabled = false;

  try {
    boutiqueEnabled = (await getBoutiqueSettings()).enabled;
  } catch (error) {
    console.error("[boutique] Impossible de lire le statut.", error);
  }

  if (!boutiqueEnabled) {
    return <BoutiqueClosed />;
  }

  let categories = [];
  let catalogError = "";

  try {
    categories = await getTebexCategories();
  } catch (error) {
    catalogError = error instanceof Error ? error.message : "Le catalogue est indisponible.";
  }

  return (
    <>
      <Header />
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.background} aria-hidden="true">
            <div />
          </div>
          <ShopCodyxRain />

          <section className={styles.hero}>
            <span className={styles.eyebrow}>Catalogue officiel</span>
            <h1>
              Boutique <strong>Codex RP</strong>
            </h1>
            <div className={styles.shopCharacter} aria-hidden="true">
              <Image
                alt=""
                className={styles.shopCharacterImage}
                height={1406}
                priority
                sizes="(max-width: 620px) 580px, (max-width: 960px) 900px, 1250px"
                src="/img/raul-bautista.webp"
                width={1920}
              />
            </div>
            <p>
              Connecte ton compte FiveM, choisis tes produits puis finalise ton achat sur le
              paiement sécurisé Tebex.
            </p>
          </section>
          <ShopClient catalogError={catalogError} initialCategories={categories} />
        </main>
        <Footer />
      </div>
    </>
  );
}
