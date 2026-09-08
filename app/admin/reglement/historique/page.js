import ReglementHistoriqueClient from "./ReglementHistoriqueClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/reglement/historique",
  },
};

export default function AdminReglementHistoriquePage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Historique du règlement</h1>
        <p>Consultez qui a modifié quoi dans le règlement.</p>
      </header>
      <ReglementHistoriqueClient />
    </>
  );
}
