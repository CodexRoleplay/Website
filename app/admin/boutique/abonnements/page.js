import BoutiqueSubscriptionsClient from "./BoutiqueSubscriptionsClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/boutique/abonnements",
  },
};

export default function AdminBoutiqueSubscriptionsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Abonnements</h1>
        <p>
          Le libellé est le nom de l’avantage (« Argent toutes les 10 min », « Poser des props »).
          Chaque grade a ensuite une coche, une croix, ou un texte (« 50 », « Illimité »).
        </p>
      </header>
      <BoutiqueSubscriptionsClient />
    </>
  );
}
