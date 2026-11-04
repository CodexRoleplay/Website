import BoutiqueCardsClient from "./BoutiqueCardsClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/boutique",
  },
};

export default function AdminBoutiqueCardsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Cartes de la boutique</h1>
        <p>Choisis une meilleure vente par catégorie et, si tu le souhaites, le bonus affiché sur chaque carte.</p>
      </header>
      <BoutiqueCardsClient />
    </>
  );
}
