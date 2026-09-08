import FaqHistoriqueClient from "./FaqHistoriqueClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/faq/historique",
  },
};

export default function AdminFaqHistoriquePage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Historique de la FAQ</h1>
        <p>Consultez les modifications enregistrées sur les catégories, questions et réponses.</p>
      </header>
      <FaqHistoriqueClient />
    </>
  );
}
