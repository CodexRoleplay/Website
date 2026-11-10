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
        <p>Écris le bandeau, le badge et le texte sous le prix de chaque produit. Un champ vide n’affiche rien.</p>
      </header>
      <BoutiqueCardsClient />
    </>
  );
}
