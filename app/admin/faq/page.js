import FaqAdminClient from "./FaqAdminClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/faq",
  },
};

export default function AdminFaqPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Éditeur de la FAQ</h1>
        <p>Gérez les catégories, les questions et les réponses visibles sur la page publique.</p>
      </header>
      <FaqAdminClient />
    </>
  );
}
