import CodePenalAdminClient from "./CodePenalAdminClient";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  alternates: {
    canonical: "/admin/code-penal",
  },
};

export default function AdminCodePenalPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>Éditeur du code pénal</h1>
        <p>Gérez les juridictions, sections, articles, amendes et peines du code pénal public.</p>
      </header>
      <CodePenalAdminClient />
    </>
  );
}
