import LoreHistoriqueClient from "./LoreHistoriqueClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/lore/historique",
  },
};

export default function AdminLoreHistoriquePage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Historique du lore</h1>
        <p>Consultez qui a modifié le récit en cours.</p>
      </header>
      <LoreHistoriqueClient />
    </>
  );
}
