import CodePenalHistoriqueClient from "./CodePenalHistoriqueClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/code-penal/historique",
  },
};

export default function AdminCodePenalHistoriquePage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Historique du code pénal</h1>
        <p>Consultez les modifications enregistrées sur les articles, amendes et peines.</p>
      </header>
      <CodePenalHistoriqueClient />
    </>
  );
}
