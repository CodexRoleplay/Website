import ReglementAdminClient from "./ReglementAdminClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/reglement",
  },
};

export default function AdminReglementPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Éditeur du règlement</h1>
        <p>Organisez rubriques, sous-rubriques et blocs de contenu. Les changements sont publiés en temps réel.</p>
      </header>
      <ReglementAdminClient />
    </>
  );
}
